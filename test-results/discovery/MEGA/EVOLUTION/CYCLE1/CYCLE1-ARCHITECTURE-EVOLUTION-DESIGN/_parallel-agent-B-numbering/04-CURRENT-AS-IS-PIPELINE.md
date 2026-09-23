# 04 — CURRENT AS-IS PIPELINE · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Code map:** `api/lib/discovery/orchestrator.js` · `providers.js` · `webOrigin.js` · `store.js` · `emit.js` · `facets.js` · `narrow.js` · `sse.js` · `urlSafety.js`  
**Review-note @שרת:** confirm stage labels vs live code if drift.

---

## Entry

```text
POST /api/discovery/sessions
  body.seed | body.q  ──trim──► session.seed / session.q   (MAX_SEED_CHARS)
  body.locale || 'en' ─────────► session.locale
  body.hints (opaque) ─────────► session.hints  (NOT used to rewrite q)
```

Cite: PHASE5 SEARCH-STRATEGY-MAP Step 41 · `createDiscoverySession`

---

## Stage map (S0–S10 as implemented)

| Stage | Code | What happens | QueryPlan? |
|-------|------|--------------|------------|
| **S0** | `createDiscoverySession` | Mint sessionId · store write · status=running · providers map pending | NO |
| **S1** | `softEntityResolve(seed, hints)` | Opaque `seed:<hash>` softRefs · softEr on session | NO rewrite |
| **S2** | `getDefaultProviders()` parallel `p.search({ q: session.seed, locale, hints, budgetMs })` | **PROVIDER-VERBATIM** — same raw seed to every adapter | **NO** |
| **S2+** | C1 post-batch (flag) | One-hop `resolveWebOriginCandidates` from finding provenanceUrls (≤3) if seed not already URL | Ad-hoc · not planned stage |
| **S3** | `normalizeRawHit` | RawFinding → Finding/Evidence pairs | — |
| **S5** | `dedupeByEvidenceFingerprint` + `coalesceBySoftEntity` | Fingerprint dedupe; A2-safe typed coalesce when keys present | — |
| **S6** | graph build | seed node + finding nodes + corroboration edges | Flat · not full relationship graph |
| **S7** | (marker) | Reserved / light | — |
| **S8** | `rankFindings` · `aggregateFacets` · `detectContradictions` | Rank + facets + contradictions | — |
| **S9** | status resolve | complete / partial / failed_soft | — |
| **S10** | `emitSnapshot` Acc scrub | Scrub emit · bump version · durable write | — |

Note: S4 label unused in current `runPipeline` (S3→S5). Design TO-BE may reclaim numbering — see 05.

---

## Provider list (as-is)

| Mode | Providers | Gate |
|------|-----------|------|
| B0 `DEFAULT_PROVIDERS` | `wikidata` · `openlibrary` · `wikipedia` | Production lock |
| + VIAF | `viaf` | `DISCOVERY_ENABLE_VIAF=1` Preview |
| + WEB-ORIGIN | `web_origin` | `DISCOVERY_ENABLE_WEB_ORIGIN=1` Preview |

Each provider receives **identical** `q: session.seed`. Locale may switch WP host / WD language; hints unused for rewrite.

---

## Budgets (as-is defaults)

| Budget | Default |
|--------|---------|
| `sessionWallMs` | 12_000 |
| `providerMs` | 3_500 |
| `firstPaintMs` | 800 (declared) |

Soft-fail per provider; wall skip → `skipped`.

---

## Emit / consume surfaces

| Surface | Path |
|---------|------|
| Snapshot GET | `/api/discovery/sessions/[id]` |
| SSE events | `/api/discovery/sessions/[id]/events` |
| Narrow | `/api/discovery/sessions/[id]/narrow` |
| Acc scrub | `emit.js` `sanitizeDiscoveryPayload` |

**Absent today:** `session.queryPlan` · family registry · intent classification · planned URL-origin stage separate from provider id.

---

## AS-IS diagram

```text
seed
  → S0 session
  → S1 softEr (opaque hash)
  → S2 verbatim fanout [WD|OL|WP|(VIAF)|(WEB-ORIGIN)]
       └─ optional C1 one-hop from finding URLs (flag)
  → S3 normalize
  → S5 dedupe + A2 coalesce
  → S6 graph (corroboration edges)
  → S8 rank / facets / contradictions
  → S10 Acc scrub emit → GET / SSE / narrow
```

---

## Ceiling reminder

AS-IS is Acc-safe for B0 registry discovery. It is **not** an orchestration architecture. Cite 01 + Integration Review 08.

---

## STOP

AS-IS documented for design delta only. No code change in this pack.
