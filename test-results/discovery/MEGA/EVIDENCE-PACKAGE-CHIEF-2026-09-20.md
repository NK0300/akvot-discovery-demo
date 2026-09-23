# EVIDENCE-PACKAGE — CHIEF · PROJECT A (akvot / עקבות)
**Date:** 2026-09-20 ~07:24 IDT (Asia/Jerusalem)  
**Executor:** continuous MEGA program  
**Prod Acc P0 / Core alias:** LOCKED (`dpl_8ag…` / production `akvot-simple-demo.vercel.app`)  
**Ready for next promote?** **NO**

---

## U01 · Mission stance
Raise Discovery production ceiling without breaking Acc P0 / Core. Prefer additive Discovery layer. Continuous — do not stop at first GREEN.

## U02 · Promote decision
| Question | Answer |
|----------|--------|
| Promote production alias? | **NO** |
| Touch production deployment? | **NO** |
| Preview deploy this run? | **YES** (see U20) |
| Why NO promote? | KV creds BLOCKED → `promoteEligible=false`; storage-GREEN not met; Chief GO not issued |

## U03 · KV / storage blocker
| Item | Status |
|------|--------|
| `KV_REST_API_*` | **MISSING** |
| `UPSTASH_REDIS_REST_*` | **MISSING** |
| Present env | `GOOGLE_GENERATIVE_AI_API_KEY` only |
| Active backend | `fs-regen` |
| `durable` | **false** (FIXED — was false-confident true) |
| `fallback` / `explicitFallback` | **true** |
| `promoteEligible` | **false** |
| Live Redis tests | **SKIPPED** (env absent; no invented creds) |

## U04 · Step-51 durable false-confidence FIX
`getStoreInfo()` previously: `durable: backend !== 'memory'` → fs-regen claimed durable.  
**Now:** `durable = vercel-kv|upstash only`; expose `fallback`, `promoteEligible`, `storeBackend`, `kvCredsPresent`.  
Evidence: `STORAGE-EVIDENCE.md`, Preview `/api/health` `discoveryStore.durable=false`.

## U05 · Storage health WRITE→READ→UPDATE→DELETE
`healthCheck({ correlationId })` GREEN locally and via Preview `api/discovery/health` (when present).  
Telemetry: `[discovery.store.telemetry]` — no secrets.

## U06 · Architecture map
- `test-results/discovery/MEGA/ARCHITECTURE-MAP.json`
- `test-results/discovery/MEGA/ARCHITECTURE-MAP.md`
- Also Arch packs: `MEGA-B-ARCHITECTURE-MAP-*.md/json`, `MEGA-B-FORENSICS-11-30-*.md`

## U07 · Acc P0 invariants preserved
| Invariant | Evidence |
|-----------|----------|
| pw=0 / Smith not dossier | contract P0 5/5 on **production alias** |
| leakage=0 Q1701775 | forbidden + adversarial + emit scrub |
| INFORMATION≠IDENTITY | `scoreIdentity=null`; contradictions surfaced; no name-collapse |
| Core paths | `api/lib/orchestrator.js` / lookup Acc behavior untouched |

## U08 · Acc scrub on ALL Discovery emit paths
POST / GET / SSE / narrow / inject / regen / HIT.  
**candidates[] gap CLOSED** (Acc+QA): scrub then `delete out.candidates` — Discovery findings-only. **Do not revert.**

## U09 · Provenance fields (D–K)
Evidence objects now carry: `provenanceUrl`, `url`, `domain`, `retrievedAt`, `evidenceType`, `providerId`, `robotsOk`.  
Cite-or-drop + `assertSafePublicHttpsUrl` (https, no localhost/metadata/raw IP/userinfo).

## U10 · Ranking explainability
`rankFindings` + `explainRanking`: factors authority / corroboration / directness / freshness / httpsOnly; `ranking.rationale`; **`scoreIdentity: null`**.

## U11 · Contradiction surfacing
`detectContradictions` → `same_title_multi_domain` attached to session; not hidden.

## U12 · Provider coverage
DEFAULT_PROVIDERS: `wikidata`, `openlibrary`, **`wikipedia` (OpenSearch, public, authMode:none)**. Soft errors; budgets; entity-agnostic seeds.

## U13 · Soft ER
Opaque `seed:<hash>` refs only — no person-name special-cases.

## U14 · Observability (L–N)
- Correlation IDs (`mintCorrelationId`, route headers/body)
- `logStoreOp` / store telemetry
- `obs.js` counters + latency (`incrMetric`, `recordLatency`, `getMetricsSnapshot`)
- Health exposes `discoveryStore` without secrets/`fsDir` in public core health (Preview verified)

## U15 · SSE lifecycle
Order: meta → progress → provider* → finding* → facets → status → done.  
Last-Event-ID / cursor resume; finite hangPolicy; Acc scrub per chunk; resume-past-end still emits done.  
Docs: `SSE_RECONNECT_DOCS`. UX note: `MEGA-M-SSE-LIVE-UX-*.md`.

## U16 · Failure injection
`failureInject.js` + `faultInject.js`: provider timeout/429/5xx, redis unavailable, store miss, scrub_path. Gated; not implicit in prod.

## U17 · Security
URL scheme/SSRF-ish gate for Discovery provenance; CSP headers in `vercel.json`; no secrets in client/logs/commits; rate limits remain Core-side.

## U18 · Perf stance
Measure-before-optimize; no speculative Core rewrites. Budgets: sessionWallMs / providerMs retained.

## U19 · Automated tests (local)
| Suite | Pass | Fail |
|-------|------|------|
| `api/lib/orchestrator.test.mjs` (Core) | 128 | 0 |
| `api/lib/forbiddenIdentities.test.mjs` | 39 | 0 |
| `api/lib/discovery/sessionStore.test.mjs` | 58 | 0 |
| `api/lib/discovery/orchestrator.test.mjs` | 110 | 0 |
| `api/lib/discovery/adversarial.acc.test.mjs` | 36 | 0 |
| **Local unit total** | **371** | **0** |
| Acc+QA earlier reported | 321 | 0 |
| `contract-identity-p0` vs **prod alias** | **5/5** | 0 |

Log: `test-results/discovery/MEGA/raw/npm-test-2026-09-20.txt` (earlier full run; re-verify locally green after wiki/obs).

## U20 · Preview deploy (NO alias)
| Field | Value |
|-------|--------|
| Deployment id | `dpl_CcGehfMHgGXFapeqRnK1L7rmncp8` |
| URL | `https://akvot-simple-demo-3w3p6enyh-k-akvot.vercel.app` |
| target | `null` (Preview only) |
| Protection | Vercel Auth — use `vercel curl` |
| Health | `discoveryStore.durable=false`, `promoteEligible=false`, `kvCredsPresent=false` |
| POST discovery | ok; `storeBackend=fs-regen`; FALLBACK-ONLY note |
| GET after miss | `regenerated=true`, `regenReason=fs-miss-seed-decode` |
| Raw | `MEGA/raw/preview-*.txt` |

## U21 · Sacred regression checklist
| Gate | Result |
|------|--------|
| Smoke / health | GREEN (local + preview via vercel curl) |
| Acc / forbidden Q1701775 | GREEN |
| Scrub all emit paths | GREEN (candidates gap closed) |
| SSE | GREEN (unit + docs) |
| Narrow | GREEN |
| Regen | GREEN (preview GET) |
| Leakage | GREEN |
| pw / contract P0 | GREEN 5/5 on prod alias |

## U22 · Files changed (material, this executor stream)
- `api/lib/discovery/sessionStore.js` — durable fix, health, delete, telemetry
- `api/lib/discovery/store.js` — provenance, explainRanking, contradictions, urlSafety wire
- `api/lib/discovery/orchestrator.js` — regen telemetry, contradictions, obs, correlationId
- `api/lib/discovery/providers.js` — wikipedia OpenSearch
- `api/lib/discovery/urlSafety.js`, `failureInject.js`, `obs.js` (new)
- `api/lib/discovery/sessionStore.test.mjs`, orch/adversarial tests extended
- `api/health.js` — additive `discoveryStore`
- `api/lib/discovery/emit.js` — **candidates scrub+drop preserved (Acc+QA)**
- Evidence under `test-results/discovery/MEGA/`

## U23 · Reversibility
Additive Discovery-first; Core Acc P0 untouched; Preview-only deploy; no alias promote; fs-regen remains fallback when KV absent.

## U24 · Open blockers / next
1. **Install KV/UPSTASH on Vercel** → re-run health → storage-GREEN  
2. Preview Acc/QA battery on `dpl_CcGehf…` (vercel curl / bypass)  
3. Only then: Evidence GREEN + Chief GO → consider promote  
4. Continue ceiling: more providers (public only), SSE live UX polish, perf harness baselines

## U25 · Explicit certify
| Cert | Value |
|------|-------|
| Ready for next promote? | **NO** |
| Reasons | KV missing; `promoteEligible=false`; storage not shared-durable; Chief GO absent |
| Acc P0 prod alias safe? | **YES** (untouched; contract 5/5) |
| Discovery Preview usable? | **YES** with vercel auth; regenerate-from-seed semantics explicit |
| False durable confidence? | **FIXED** |

---

**Artifacts root:** `test-results/discovery/MEGA/`  
**Control board:** `00-CONTROL-BOARD.md`  
**Storage evidence:** `STORAGE-EVIDENCE.md`  
**Architecture:** `ARCHITECTURE-MAP.json` + `.md`


## Appendix · Wikipedia provider live smoke (07:25 IDT)
Retry after transient soft-error: **GREEN** — Ada Lovelace + related pages from en.wikipedia.org OpenSearch. Soft-fail path still correct under timeout.
