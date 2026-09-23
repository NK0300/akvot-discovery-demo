# 01 — CURRENT SYSTEM MAP · CYCLE1 INTEGRATION REVIEW

**Stamp:** 2026-09-20T12:21:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DOCUMENT-ONLY · read-only architecture map · NO code · NO deploy · NO promote  
**SoT code (read-only):** `api/lib/discovery/*` · routes under `api/discovery/`

---

## Locked / frozen capability lanes

| Lane | Role | Providers / flags | Deployment class | State |
|------|------|-------------------|------------------|-------|
| **B0 PRODUCTION Discovery** | Production baseline SoT | Wikidata · Wikipedia OpenSearch · Open Library (`DEFAULT_PROVIDERS`) | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · https://akvot-discovery.vercel.app | **LOCKED** |
| **CORE** | Lookup / Acc P0 · untouched by Discovery experiments | (Core alias; Discovery never commits identity) | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · akvot-simple-demo.vercel.app | **LOCKED** |
| **A2-safe** | Typed soft-ref coalesce + VIAF | B0 trio + VIAF iff `DISCOVERY_ENABLE_VIAF=1` | Preview e.g. `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` (historical) | **FROZEN EXPERIMENTAL** · NO promote |
| **A2-bound** | Title-bridge coalesce | — | — | **REJECTED** |
| **C1-PATCHED** | WEB-ORIGIN origin metadata | + `web_origin` iff `DISCOVERY_ENABLE_WEB_ORIGIN=1` | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` | **APPROVED EXPERIMENTAL** · CLOSED · FROZEN · NOT PROMOTED |
| **C1-PREPATCH** | Historical FAIL (URL-alone SAME-REFERENCE) | same flag, pre-Bound | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | **KEEP FAIL evidence** |

Cite: `PHASE1-BASELINE/FREEZE.md` · `A2-EXPERIMENTAL-BASELINE.md` · `PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK/STATUS.md`

---

## Runtime provider wiring (factual)

```text
getDefaultProviders()  [api/lib/discovery/providers.js]
  always:  wikidataProvider, openLibraryProvider, wikipediaOpenSearchProvider
  + viafProvider           if DISCOVERY_ENABLE_VIAF=1
  + webOriginProvider      if DISCOVERY_ENABLE_WEB_ORIGIN=1
DEFAULT_PROVIDERS = [wikidata, openlibrary, wikipedia]   // B0 production set
```

Modules (barrel `api/lib/discovery/index.js`):

| Module | Role |
|--------|------|
| `providers.js` | Adapters · `softEntityResolve` · typed soft-ref builders · flag-gated provider list |
| `orchestrator.js` | Session create/get/narrow · `runPipeline` · one-hop web_origin from finding URLs (C1) · A2 coalesce call site |
| `store.js` | normalize · fingerprint dedupe · `coalesceBySoftEntity` / `corroborateBySoftLabel` · rank · contradictions · web_origin relationship clamp |
| `webOrigin.js` | Origin metadata fetch · `labelWebOriginRelationship` (URL-alone → UNKNOWN) |
| `urlSafety.js` | `assertSafePublicHttpsUrl` · SSRF / private-host deny |
| `emit.js` | Acc scrub (`sanitizeDiscoveryPayload`) |
| `facets.js` / `narrow.js` / `sse.js` | Facets · narrow · progressive SSE |
| `sessionStore.js` | Upstash KV / fs-regen · durable sessions |
| `obs.js` / `requestGuards.js` | Telemetry · rate limits · body guards |
| `forbiddenIdentities.js` (shared Acc SoT) | Never commit Core identity; scrub forbidden QIDs |

Routes (`api/discovery/`):

| Method | Path | Role |
|--------|------|------|
| POST | `/api/discovery/sessions` | Create · seed ingest · pipeline |
| GET | `/api/discovery/sessions/:id` | HIT rehydrate |
| GET | `/api/discovery/sessions/:id/events` | Progressive SSE |
| POST | `/api/discovery/sessions/:id/narrow` | Facet recompute |
| GET | `/api/discovery/health` | Store WRUD / durability |

---

## Pipeline map (where each capability enters)

```text
seed (POST body.seed|q)
  │
  ├─► softEntityResolve          [providers.js]     → seed:<hash> softRefs (opaque; NOT identity)
  │
  ├─► getDefaultProviders()      [providers.js]
  │     B0:        WD · OL · WP
  │     A2 Preview:+ VIAF
  │     C1 Preview:+ WEB-ORIGIN (also one-hop in orchestrator after primary batches)
  │
  ├─► provider.search({ q: SAME raw seed })   ← provider-verbatim · NO QueryPlan
  │     │
  │     ├─ wikidata        → findings + qid: (+ viaf: from P214 enrich)
  │     ├─ openlibrary     → findings + ol: (+ remote_ids enrich)
  │     ├─ wikipedia       → page findings (wikimedia family)
  │     ├─ viaf            → viaf:  [A2 experimental]
  │     └─ web_origin      → origin title/og metadata · relationship UNKNOWN on URL-alone  [C1]
  │
  ├─► normalizeRawHit → Evidence → Finding     [store.js]
  ├─► dedupeByEvidenceFingerprint              [store.js]  URL|quote|provider scoped
  ├─► A2-safe coalesce (Preview)               [store.js + orchestrator]
  │     typed keys viaf:∪qid:∪ol: · hostFamily≥2 · ceiling SAME-REFERENCE
  │     web_origin NEVER mints typed soft-refs for attach
  ├─► rankFindings · detectContradictions      [store.js]
  ├─► aggregateFacets                          [facets.js]
  ├─► Acc scrub                                [emit.js]
  └─► session store → GET / SSE / NARROW / HIT
```

### Capability entry points (exact)

| Capability | Enters at | Module(s) |
|------------|-----------|-----------|
| B0 registry/page discovery | Provider loop | `providers.js` WD/OL/WP · `orchestrator.js` runPipeline |
| A2 VIAF emit | Flag-gated provider | `viafProvider` in `providers.js` |
| A2 typed coalesce | After fingerprint dedupe | `orchestrator.js` + `store.js` coalesce/corroborate |
| C1 WEB-ORIGIN seed URL/host | Flag-gated provider | `webOriginProvider` · `webOrigin.js` |
| C1 one-hop from finding URLs | Post-provider hop (no recursive crawl) | `orchestrator.js` EXP-C1 block |
| Relationship Bound (URL→UNKNOWN) | Label + clamp + facets + graph default | `webOrigin.js` · `store.js` · `orchestrator.js` |
| Acc scrub | Emit surfaces | `emit.js` · SSE/narrow callers |
| SSRF safety | Before any public HTTPS fetch | `urlSafety.js` |

---

## hostFamily map (runtime)

| Host pattern | Family |
|--------------|--------|
| wikidata / wikipedia / wikimedia | `wikimedia` |
| openlibrary | `openlibrary` |
| viaf | `viaf` |
| web_origin origins | registrable domain / `web_origin` family |
| other | registrable domain pair |

**Rule:** WD + WP = one family. Multi-independent requires ≥2 families on the **same Finding** after coalesce. MULTI is a metric, not the product objective.

---

## What is NOT in the live graph

QueryPlan · alias/query expansion · locale auto-detect · secondary ID fanout as new discovery · news/filings/gov/scholarly emitters · open `web_public` crawler · identity commit / dossier · SAME-ENTITY under C1/A2-safe.

Cite: `CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/02-CURRENT-DISCOVERY-GRAPH.md` · Phase1 ARCH-SNAPSHOT.
