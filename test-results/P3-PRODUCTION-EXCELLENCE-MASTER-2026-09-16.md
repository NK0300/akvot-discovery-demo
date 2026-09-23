# AKVOT — PRODUCTION EXCELLENCE PROGRAM · MASTER WORKBOARD
**Updated:** Chief of Staff · 2026-09-17 Asia/Jerusalem  
**Baseline LOCKED:** `dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy` · GREEN · MAINTENANCE · UX FREEZE  
**P1/P2 + PW-fix Gate:** CLOSED (Smith WARM Q1701775 fixed · Acc/re-harness/alias smoke PASS)

## Mission
Maximum useful performance **without** sacrificing PRECISION · RECALL · SAFETY · EVIDENCE · IDENTITY · **pretty-wrong = 0**.

## Principle
MEASURE → ROOT CAUSE → HYPOTHESIS → RISK → TEST → IMPLEMENT → MEASURE  
**No Core optimize until bottleneck Evidence + Gate.**

## Phase board
| Phase | Owner | Status | Deliverable |
|-------|-------|--------|-------------|
| 0 BASELINE LOCK | Chief | **DONE** | `dpl_3cgo…` |
| 1 SYSTEM MAP | ארכיטקט | **DONE** | Performance Map |
| 2 PERF HARNESS | שרת | **DONE** | N=30 p50–p99 (note: כהן tail · wiki 5500 floor) |
| 2b PW-FIX | team | **DONE** | SoT+cache+faces · promoted |
| 3 LATENCY DECOMPOSITION | שרת+ארכיטקט | **ACTIVE** | per-stage timings from harness + code |
| 4 BOTTLENECK MAP | ארכיטקט | **ACTIVE** | top-10 ranked IMPACT×CONF×RISK |
| 5 OBSERVABILITY | שרת | **ACTIVE** | gap→metrics plan (beyond health/requestId) |
| 6 LOAD/SOAK/FAILURE | בודק | **ACTIVE** | L1 dry-run on new baseline (pw-safe) |
| 7 CONTROLLED OPT | — | BLOCKED | after #3–4 Evidence + Gate |
| 8 ACC+SAFETY REG | דיוק+בודק | WAIT | after any change |
| 9 SLO/ALERTS/DASH | — | WAIT | after measure |
| 10 CAPACITY/COST | ארכיטקט | WAIT | after load |

## Full-force NOW (measure only)
1. @ארכיטקט — BOTTLENECK MAP from harness N30 + Performance Map (כהן wiki tail, Smith POST~6.4s, cache WARM asymmetry)
2. @שרת — LATENCY DECOMPOSITION report (wiki/stageB/gemini/enrich/wall) + OBSERVABILITY GAP report
3. @בודק — L1 dry-run matrix on alias `dpl_3cgo…` (include Smith POST WARM)
4. @דיוק — Acc-protect stays locked; spot-check after any opt Gate only
5. @ממשק — UX FREEZE

## Stop → Chief
pw>0 · safety/precision regression · unexpected baseline change · optimize without Gate
