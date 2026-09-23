# P3 SYSTEM PERFORMANCE MAP · ארכיטקט · 2026-09-17
**STATUS:** READY (inventory) · **MEASURE ONLY** · no implement · no dpl  
**Baseline LOCKED:** `dpl_CrsqeSQX1GAhi1VFExVsGwdsSYHt` · phase `orchestrator-v0-b`  
**Master:** `P3-PRODUCTION-EXCELLENCE-MASTER-2026-09-16.md`  
**Refs:** `api/lookup.js` (~4354 LOC) · `api/lib/orchestrator.js` · `knownIdentities.js` · `stageB.js` · `api/health.js`

---

## 0. STATUS block (required)

| Field | Value |
|-------|--------|
| STATUS | INVENTORY COMPLETE · waiting harness N≥30 percentiles |
| WHAT | End-to-end stage map of lookup pipeline |
| EVIDENCE | this file · `test-results/handoff/P3-SYSTEM-PERFORMANCE-MAP-ארכיטקט-2026-09-17.md` |
| MEASURED | Code-level timeouts/budgets/cache/obs/security · alias smoke paths from P2 |
| NOT MEASURED | p50–p99 per stage (owned by @שרת harness) · load/soak (@בודק) |
| RISKS | Monolith god-file · wiki 429 · Vercel mitigations · Gemini tail · in-memory cache cold |
| NEXT | Correlate Map ↔ harness percentiles → bottleneck candidates (Phase 4) · still no Core opt |

---

## 1. Request entry (Application / Platform)

| Item | Detail |
|------|--------|
| IN | GET query **or** POST JSON (flat + nested `body.ctx` unwrap) · optional SSE |
| OUT | JSON StageResult (+ `requestId`, `timings`, `phase`, `uiState`) or SSE `data:` events |
| Latency | Handler start → `timings.total` |
| Fail | 4xx validation · 405 · body parse |
| Retry | none at edge |
| Timeout | Vercel `maxDuration` **60s** · internal hardDeadline **45s** → `uiState=thin` + `budget_timeout` |
| Cache | CDN `s-maxage=45, swr=180` (GET JSON) · `nocache` / PII skip · SSE `no-cache` |
| Obs | `X-Request-Id` · JSON `requestId` · `timings{wiki,gemini,enrich,stageB,total}` · `/api/health` |
| Security | CORS · CSP (vercel.json) · SSRF URL allowlist · scrub PII · no Sync.me/Truecaller |

---

## 2. Pipeline stages (happy + safety paths)

### S0 — Context + identity prep
| | |
|--|--|
| IN | `q`, `ctx{city,org,role,country,email,phone,focus}` |
| OUT | normalized ctx · `cacheKey` · phone/email flags |
| Latency | µs–ms (CPU) |
| Fail | invalid phone-only |
| Cache | key includes q+ctx; **never** cache phone/email |
| Security | phone/email POST-body only preference · scrub on output |
| Domain | — |

### S1 — COMMON_HE / seed short-circuit
| | |
|--|--|
| IN | bare HE common (כהן/…) without ctx |
| OUT | early `need_context` · 0 faces · softAmb |
| Latency | **MEASURED (smoke):** ~sub-second–few s on alias (כהן) |
| Fail/Retry | n/a |
| Cache | may store need_context |
| Domain SoT | `isCommonHeBareName` · `decideStage` — **must never dossier** |

### S2 — Known-identity seed (`knownIdentities`)
| | |
|--|--|
| IN | wikiName |
| OUT | QID seed → `wikiPathFromQid` / static dossier |
| Latency | WD entity fetch ~3.5s timeout each hop |
| Fail | miss → continue wikiPath |
| Domain | `resolveKnownIdentityQid` · Assaf/Netanyahu class · **no Assaf-if** |

### S3 — `wikiPath` (Wikimedia family)
| | |
|--|--|
| IN | person name |
| OUT | `{found,qid,ambiguous,alts,photo,sources…}` · may set softAmbiguous |
| Latency | **timings.wiki** · per-call jfetch 4.5–8s · summary 7s · shared **wikiGate** backoff on 429 |
| Fail | 429/5xx · empty · disambiguation |
| Retry | jfetch retries=2 · HE 429 does **not** abort whole path (WD fallback) |
| Timeout | AbortSignal per fetch · contributes to 45s budget |
| Parallel | Promise.all HE/EN/WD / commons batches · `mapPool` |
| Cache | in-memory Map · TTL 180s default · wiki-rich **480s** · max ~100 keys |
| Obs | `timings.wiki` only (no per-subcall) |
| Security | UA · safe hosts · rate backoff cap |
| Domain belt | Smith-class / seed-adjacent → softAmb · strip qid on near-miss |

### S4 — Domain commit gate (SoT)
| | |
|--|--|
| IN | wiki + softAmb + candidates + sources + ctx + q |
| OUT | `mayCommitDossier` ok/reason · `decideStage` uiState |
| Latency | CPU ms |
| Fail modes blocked | softAmb · Smith-class · seed-adjacent · email/phone alone · COMMON_HE · weak evidence |
| Threshold | **0.75** locked · httpsN≥2 · org/city token match (no `us∈https`) |
| Obs | reasons in unit tests · not always in HTTP body |
| **LOCKED** | P1/P2 — do not change in P3 measure phase |

### S5 — Stage B registries (`registryDiscover`)
| | |
|--|--|
| IN | q, ctx, signal, **maxMs** budget |
| OUT | candidates[] + sources[] · or `stageB_budget` |
| Latency | **timings.stageB** · ORCID/OL/VIAF/WD · bare timeouts 2.8–4.5s |
| Fail | network · budget win |
| Retry | none aggressive |
| Timeout | `maxMs` race vs discovery |
| Parallel | multi-registry |
| Cache | none persistent |
| Domain | evidence filter before candidates UI |

### S6 — Gemini / googlePath (optional)
| | |
|--|--|
| IN | searchQ + key · skipped if wikiExact / ≥2 evidenced / softAmb without ctx |
| OUT | google candidates/sources or error object |
| Latency | **timings.gemini** · cap ~3–8s from `budgetLeft()` · generate timeout up to 18–24s |
| Fail | no key · API error · abort |
| Retry | none (catch → empty) |
| Security | key env-only · scrub output |

### S7 — Enrich / images / source resolve
| | |
|--|--|
| IN | committed wiki or candidates |
| OUT | photos · ranked images · resolved URLs |
| Latency | **timings.enrich** · commons/OL/MB fetches 3–5.5s |
| Fail | soft degrade |
| Security | `assertSafePublicHttpsUrl` · banned phone hosts |

### S8 — Final assemble + scrub
| | |
|--|--|
| IN | all prior |
| OUT | StageResult · cacheSet (non-PII) · requestId |
| Latency | CPU |
| Obs | full `timings` on response |

---

## 3. Path archetypes (for harness correlation)

| Path | Typical stages | Expected ui (P2 locked) |
|------|----------------|-------------------------|
| A Assaf / seeded celeb | S2→S3/S4 → early dossier | dossier + QID |
| B John Smith + ctx POST | S3 softAmb → S5 → **no** S6 commit | candidates · never Q1701775 |
| C כהן bare | S1 | need_context\|thin · 0 faces |
| D John Rappaport | S3 + seed-adjacent deny | need_context · qid=null |
| E Netanyahu / ביבי | S2/S3 seed | dossier Q43723 |
| F budget exhaust | any → hardDeadline | thin + degraded |

---

## 4. Observability gaps (inventory)

| Have | Missing (P3 later — no implement now) |
|------|----------------------------------------|
| requestId · health ok/phase/build | per-stage spans · wiki subcall counts |
| timings.wiki/gemini/enrich/stageB/total | p50/p95/p99 series · COLD vs WARM labels |
| baselineHint (stale DNfPZ9 string) | correct baseline id · SLO alerts |
| — | 429/mitigation counters · cache hit rate |

---

## 5. Security / reliability inventory

- AbortSignal chain: client close → `runAc` · per-fetch timeouts · hard 45s  
- SSRF: private/blocked hosts · redirect cap · body byte cap  
- PII: scrubPayloadIdentifiers · no cache on phone/email  
- Vercel mitigations / Security Checkpoint: harness risk (pilot note) — measure via @שרת pacing  
- Region: `fra1`

---

## 6. Bottleneck *candidates* (HYPOTHESIS ONLY — not ranked Evidence yet)

1. Sequential wiki multi-hop after 429 backoff  
2. Gemini when Stage B insufficient (ctx strangers)  
3. Cold start + empty in-memory cache (serverless)  
4. Stage B registry fan-out under maxMs  
5. Enrich/commons after commit  
6. External mitigations (403/checkpoint) inflating p99  

**Rule:** no Core change until harness N≥30 + this map correlated.

---

## 7. Boundaries for P3 measure phase

ALLOWED: harness · matrix · Acc-protect · docs · obs *proposals*  
FORBIDDEN: Core optimize · threshold/EXPECTED change · Assaf-if · dpl · UX change · second commit gate  

STOP→Chief: pretty-wrong>0 · safety/precision regression · baseline drift

---

## 8. Next

1. @שרת finish N≥30 → attach percentiles to path archetypes A–F  
2. @בודק Load/Failure matrix spec  
3. @דיוק Acc Protection Suite lock  
4. ארכיטקט Phase 4 bottleneck ranking **after** numbers  

**MEASURE FOR TRUTH. NO OPTIMIZATION UNTIL BASELINE EVIDENCE.**
