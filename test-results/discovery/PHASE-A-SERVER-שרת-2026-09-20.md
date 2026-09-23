# Phase A · SERVER CONTRIBUTION · שרת · 2026-09-20

**STATUS:** DOCS ONLY · Architecture Freeze · **NO PROD · NO IMPL · NO PROMOTE**  
**Alias:** `dpl_7vAA…` FROZEN · Acc P0 Gate OPEN (separate)  
**Integrates into:** `PHASE-A-ARCHITECTURE-FREEZE-PACK-*.md` (@ארכיטקט lead)

---

## 0. Pivot lock (שרת)

עקבות Discovery Layer = **maximum public-web finding engine**.  
Pipeline emits **Findings + Evidence**, not identity guesses.  
Existing Core (lookup/orchestrator/Stage-B/Acc scrub) stays; Discovery is **additive**.

---

## 1. Discovery Orchestrator

### Role
Coordinate providers → normalize Findings → attach Evidence → dedupe → facet inputs → progressive emit.  
**Does not** call `mayCommitDossier` / Entity Mode binding. That remains Core + Acc Gate.

### Stages (ordered)
| # | Stage | Output | Budget default |
|---|--------|--------|----------------|
| S0 | Session bind | `sessionId`, query, locale | — |
| S1 | Plan | provider plan + facet seeds | 50ms CPU |
| S2 | Fan-out providers | raw hits | per-provider timeout |
| S3 | Normalize | `Finding[]` | — |
| S4 | Evidence attach | `Evidence[]` linked | — |
| S5 | Dedupe | merge by evidence fingerprint | — |
| S6 | Relationship hints | optional edges (evidence-backed only) | soft |
| S7 | Facet aggregate | facet buckets (counts) | — |
| S8 | Rank **findings** | order by evidence strength / diversity — **not** identity confidence | — |
| S9 | Acc surface scrub | forbidden QID strip on **all** discovery surfaces | hard |
| S10 | Progressive emit | SSE/chunk or poll cursor | — |

### Non-goals
- Identity commit / faces / dossier
- Private/auth-walled sources
- Ranking people as “the one”

---

## 2. SearchProvider abstraction

```ts
/** Phase A contract — sketch only */
interface SearchProvider {
  id: string;                 // 'wikidata' | 'viaf' | 'openlibrary' | 'web_public' | …
  capabilities: ('person_name'|'org'|'site'|'doc'|'contact_public')[];
  robotsPolicy: 'respect';    // hard — no bypass
  authMode: 'none'|'user_oauth_future'; // Phase A: none only
  search(req: ProviderSearchRequest, ctx: ProviderContext): Promise<ProviderBatch>;
}

interface ProviderSearchRequest {
  q: string;
  sessionId: string;
  cursor?: string;
  budgetMs: number;
  locale?: string;
  hints?: { org?: string; city?: string; site?: string };
}

interface ProviderContext {
  signal: AbortSignal;
  obs: ObsHandle;
  rateLimiter: RateLimiter;
}

interface ProviderBatch {
  providerId: string;
  findings: RawFinding[];     // pre-normalize
  nextCursor?: string;
  partial: boolean;           // true if truncated by budget/RL
  errors?: ProviderError[];   // soft — never fail whole session
}
```

### Provider rules
- Public/authorized URLs only · honor robots · no credential stuffing
- Errors are **soft** (degrade provider, continue session)
- Must return provenance URL per raw hit or hit is dropped at S3

### Initial provider map (Phase A — declare, not implement)
| Provider | Public surface | Notes |
|----------|----------------|-------|
| wikidata | wbsearchentities / entity pages | Acc scrub on Q-ids |
| viaf | AutoSuggest | registry |
| openlibrary | authors search | registry |
| web_public | **interface only** in Phase A | concrete crawler = Phase B+ after Acc-on-prod |

---

## 3. Pipeline ↔ Core boundary

```
[Discovery Orchestrator] --Findings/Evidence/Facets--> Discovery API
         | never writes dossier
         v
[Acc scrub: forbiddenIdentities]  // reuse SoT v2026-09-19.1+
         |
[Core lookup/orchestrator]        // unchanged Entity Mode path
```

Acc P0 scrub (`forbiddenIdentities.js`) applies to Discovery payloads **before emit** (candidates-equivalent arrays, graph node ids, facet value ids, cache HIT rehydrate).

---

## 4. Progressive Discovery API (sketch)

### Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/discovery/sessions` | create session `{ q, locale?, hints? }` → `{ sessionId, pollAfterMs }` |
| `GET` | `/api/discovery/sessions/:id` | snapshot `{ status, findings[], facets[], cursor, progress }` |
| `GET` | `/api/discovery/sessions/:id/events` | SSE progressive chunks |
| `POST` | `/api/discovery/sessions/:id/narrow` | apply facet filters (server recompute) |

### Session model
```ts
interface DiscoverySession {
  sessionId: string;
  q: string;
  createdAt: string;
  status: 'running'|'partial'|'complete'|'failed_soft';
  providers: Record<string, 'pending'|'ok'|'partial'|'error'|'skipped'>;
  findings: Finding[];          // append-only ids; body by ref
  facets: FacetState;
  progress: { done: number; totalHint?: number };
  budgets: BudgetLedger;
  forbiddenIdentitiesVersion: string;
}
```

### Progressive rules
- First paint ≤ budget_fast (e.g. 800ms) with whatever providers finished
- Later chunks additive · never silently remove prior Finding without tombstone+reason
- `partial: true` until all providers terminal or session budget exhausted

---

## 5. Cache (source-aware)

| Layer | Key | TTL | Rules |
|-------|-----|-----|-------|
| Provider raw | `prov:{id}:{hash(q,hints)}` | short | never cache PII keys; respect `nocache` |
| Finding | `find:{fingerprint}` | medium | fingerprint = hash(canonicalUrl+quote+provider) |
| Session | memory / ephemeral store | session TTL | not shared across users |
| Core lookup cache | **unchanged** | existing | Discovery must not poison Core cache with identity commits |

**HIT path:** re-run Acc scrub on rehydrate (same as Acc P0 revalidate).

---

## 6. Budgets / rate-limit / retry

| Budget | Default sketch | On exhaust |
|--------|----------------|------------|
| session wall | 15–30s | status=partial · stop fan-out |
| per-provider | 2–4s | mark provider partial/error |
| concurrency | N providers parallel | queue |
| retry | 1× on 429/5xx with jitter | then soft-error |
| rate-limit | token bucket per provider | delay or skip |

429 from upstream → record in `timings.providerMeta` (mirror wikiMeta pattern) · **do not** invent Findings.

---

## 7. Observability

Emit (additive fields):
- `sessionId`, `providerId`, `stage`, `ms`, `partial`, `retryCount`
- `forbiddenStripped`, `forbiddenIdentitiesVersion`
- `findingCount`, `dupMergedCount`, `facetBucketCounts`
- Never log raw PII phones/emails in clear beyond existing Core policy

---

## 8. Deduplication (Findings)

Merge when **same evidence fingerprint** (canonical URL + normalized quote/span).  
Different URLs about same name → **keep both** (INFORMATION≠IDENTITY).  
Never drop a public Finding only because Entity Resolution is uncertain (@דיוק owns ER merge rules).

---

## 9. Ranking of FINDINGS (not identity)

Signals (sketch): evidence freshness, source diversity, facet relevance after narrow, provider reliability score.  
**Forbidden:** boosting a Finding because it “looks like the person.”

---

## 10. Schemas (server stubs — Arch owns canonical)

See `test-results/discovery/schemas/`:
- `finding.schema.json`
- `evidence.schema.json`
- `discovery-session.schema.json`

Entity / Relationship / Facet full schemas = @ארכיטקט pack.

---

## 11. Vertical Slice (server AC — for @בודק)

For query `דוד כהן` (or agreed English twin) on Discovery API mock:
1. Session creates · progressive status moves running→partial/complete
2. ≥1 Finding with Evidence.provenanceUrl public
3. Facet buckets non-empty OR explicit empty-with-reason
4. Forbidden QID leakage = 0 on session snapshot + events
5. No dossier/faces fields on Discovery responses
6. Core `/api/lookup` behavior unchanged in this Phase (no code)

---

## 12. Explicit STOP

Phase A = **documents + schemas only**.  
No SearchProvider impl · no prod deploy · no alias promote · no Core deletion.

**שרת:** ready to merge sections into Arch FREEZE PACK · stand by for Arch integration + Chief review.
