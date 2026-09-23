# P3 · OBSERVABILITY GAP · שרת · 2026-09-17

**STATUS:** DONE · MEASURE ONLY · Baseline `dpl_3cgo…`

**EVIDENCE:** `api/lookup.js` (requestId, timings) · `api/health.js` · harness N30 · PW correlate (cache HIT without Domain revalidate — fixed)

## Have (shipped)

| Signal | Where | Gap? |
|--------|-------|------|
| `requestId` + `X-Request-Id` | lookup | OK — correlate client↔logs |
| `timings.{wiki,gemini,enrich,stageB,total}` | JSON body | **Partial** — not on HIT-safe path consistently |
| `cached: true` | HIT payload | OK |
| `/api/health` build/phase | health.js | OK — alias smoke uses `health.build` |
| Domain revalidate header `HIT-REVALIDATED` | lookup (post-fix) | OK on Preview/prod `dpl_3cgo` |

## Gaps (ranked)

| # | Gap | IMPACT | Why it hurts P3 |
|---|-----|--------|-----------------|
| G1 | **WARM timings stale** — HIT returns old `timings.total` while wall≪total | HIGH | False “server slow” on cache; breaks p50 analysis |
| G2 | No **structured stage span log** (JSON line per request: stage, ms, cache, uiState, qid?, err) | HIGH | Can't slice כהן wiki vs rate-limit vs network without harness |
| G3 | No **cache key fingerprint** in response/headers (hash only) | MED | Can't prove Smith POST WARM miss vs poison |
| G4 | No **upstream status counters** (wiki 429/timeout/abort) in payload or metrics | HIGH | כהן 24s could be budget burn vs retry storm — unknown |
| G5 | `enrich` rarely non-zero in harness table | LOW–MED | Blind on image/source cost |
| G6 | No **sampling / trace id** to Vercel logs beyond requestId | MED | Hard multi-instance correlate |
| G7 | health.build vs deployment id naming drift risk | LOW | Smoke already pins dpl |

## Minimal measure-next (no optimize)

1. On cache HIT: set `timings` to `{ total: 0, cacheHit: true }` or recompute wall-only — **doc now; implement at Gate**
2. Log one JSON line per request: `{requestId, uiState, cached, demoted, wikiMs, stageBMs, wallMs, upstream: {wikiStatus}}`
3. Expose `cacheKeyHash` (8 hex) on payload for POST+ctx debug
4. Count wiki timeout/429 in timings or `warnings[]`

## NOT
Implement/optimize/dpl this turn — report only

## NEXT
@ארכיטקט fold G1–G4 into BOTTLENECK MAP · @בודק L1 dry-run can assert `health.build` + Smith WARM ui≠dossier
