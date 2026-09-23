# P3 · WP3 L2 EXECUTION BRIEF · Chief · 2026-09-19

**STATUS:** **GO — OPEN**  
**MODE:** MEASURE / RELIABILITY ONLY · **NO CORE**  
**TIME:** 2026-09-19 ~22:10 IDT  

## Frozen baseline (control)
| Field | Value |
|-------|--------|
| Alias | https://akvot-simple-demo.vercel.app |
| Deploy | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` |
| health.phase | orchestrator-v0-b |
| Mode | GREEN · MAINTENANCE · UX FREEZE · pw=0 · OBS live |
| Rollback | `dpl_6Tmott…` |
| Harness | `scripts/perf-harness.mjs` (+ WP3 extensions as needed) |
| Rule | No compare across runs unless baseline fingerprint identical |

## Hard locks
NO change: Core · Acc pipeline · Smith · Cohen · H1 · cache semantics · SoT · faces · UX · response contract.  
Any "fix" urge → **STOP + report only** → WP4 candidate.

## Workstreams
| ID | Owner | Scope |
|----|-------|--------|
| L2-A LOAD | בודק + שרת | Low→Med→High→Peak/saturation · throughput · p50/p95/p99 · errors · timeouts · status dist · wiki · cache HIT/MISS · CPU/RAM/instances |
| L2-B SOAK | בודק + שרת | Fixed config long run · T0…END · memory growth · latency drift · leaks · wiki deg · WARM/COLD drift |
| L2-C FAILURE | בודק + שרת + ארכיטקט | Predefined injectable: wiki timeout/429/5xx · dep spike · cache down · miss storm · instance restart/loss · net blip · recovery criteria |
| L2-D BREAKPOINT | ארכיטקט | First degradation · saturation · timeout/error inflection · bottleneck · recovery boundary — **document, don't fix** |
| SAFETY LOCK | דיוק | Continuous: pw=0 · no identity/dossier contamination · no stale-cache poison · no face leak · no SoT break |
| UX | ממשק | FREEZE |

## Known hypotheses (measure, don't assume rank)
1. Multi-instance cache miss → WARM≈COLD  
2. Cohen wiki tail ~20–28s  
3. Smith thin under wiki 429 (Acc-safe)

## Stop → Chief
pw>0 · identity/dossier contamination · stale-cache poison · face leak · SoT violation · contract change · uncontrolled prod impact · irreversible state

## Close criteria (all 4 Evidence-backed)
1. How much can it serve?  
2. Where does degradation start?  
3. What is the real bottleneck?  
4. What must change for next target?  

Until then: **WP4 = BLOCKED**

## Deliverable
Single Evidence Pack: Executive · Latency · Reliability · Safety · Resources · Bottleneck Top-10 · WP4 Gate recommendation.
