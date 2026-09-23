# AKVOT — PRODUCTION EXCELLENCE PROGRAM · MASTER WORKBOARD
**Updated:** Chief of Staff · 2026-09-18 Asia/Jerusalem  
**Baseline LOCKED:** `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` · GREEN · MAINTENANCE · UX FREEZE · OBS live  
**P0 Smith COLD/WARM pw-fix:** CLOSED (Acc alias GO · SoT/CTA/smoke PASS · pw=0)

## Mission
Maximum useful performance **without** sacrificing PRECISION · RECALL · SAFETY · EVIDENCE · IDENTITY · **pretty-wrong = 0**.

## Principle
MEASURE → ROOT CAUSE → HYPOTHESIS → RISK → TEST → IMPLEMENT → MEASURE  
**No Core optimize until bottleneck Evidence + Gate.**

## Phase board
| Phase | Owner | Status | Deliverable |
|-------|-------|--------|-------------|
| 0 BASELINE LOCK | Chief | **DONE** | `dpl_7vAA…` (OBS) · rollback=`dpl_6Tmott…` |
| 1 SYSTEM MAP | ארכיטקט | **DONE** | Performance Map |
| 2 PERF HARNESS | שרת | **DONE** | N=30 p50–p99 |
| 2b PW-FIX WARM+COLD | team | **DONE** | SoT+cache+faces+trusted seed · promoted |
| 3 LATENCY DECOMPOSITION | שרת | **DONE** | per-stage timings |
| 4 BOTTLENECK MAP | ארכיטקט | **DONE** | top-10 IMPACT×CONF×RISK |
| WP0 OBS TRUST | שרת | **MEASURE DONE** | local 18/18 · G1/G4 not on live alias |
| WP1 כהן WHY | שרת+ארכיטקט | **MEASURE DONE** | 1-token → full wikiPath · H1→Gate only |
| WP2 Smith cache | שרת+דיוק | **MEASURE DONE** | pw=0 · WARM≈COLD · Acc lock |
| 5 OBSERVABILITY | שרת | **GATE PASS** | Preview `dpl_6vYRKn…` · GO promote |
| 6 LOAD/SOAK/FAILURE | בודק | **GO — IN PROGRESS** | WP3 L2 Load/Soak/Failure · measure-only |
| 7 CONTROLLED OPT (WP4) | — | **BLOCKED** | after OBS emit + Gate |
| 8 ACC+SAFETY REG | דיוק+בודק | WAIT | after any change |
| 9 SLO/ALERTS/DASH | — | WAIT | after measure |
| 10 CAPACITY/COST | ארכיטקט | WAIT | after load |

## LOCK (2026-09-18) · GATE OBS EMIT OPEN
WP0–2 MEASURE ✅ · Arch glance PASS · Acc lock · UX FREEZE · WP3/WP4 HOLD.  
**ACTIVE GATE:** OBS EMIT ONLY — WikiMeta → HIT reset → emit → Evidence → validation → Gate decision.  
**BLOCKED:** Core · H1 · cache opt · Smith · UX · WP3 L2 · WP4.  
**Deploy rule:** Preview for Evidence only — **no alias promote** without Chief Gate PASS.  
**Updated:** Chief · 2026-09-18 ~08:50 IL — user EXECUTION ORDER.

## Evidence
- `P3-WP0-OBS-TRUST-שרת-2026-09-18.md`
- `P3-WP1-COHEN-CORRELATE-שרת-2026-09-18.md`
- `P3-WP2-SMITH-CACHE-MEASURE-שרת-2026-09-18.md`
- `P3-ARCH-GLANCE-WP0-WP1-WP2-ארכיטקט-2026-09-18.md`
- `P3-P0-ALIAS-SMOKE-ACC-dpl6Tmott-דיוק-2026-09-17.md`

## Stop → Chief
pw>0 · safety/precision regression · unexpected baseline change · optimize without Gate

## GATE OBS EMIT · 2026-09-18 ~09:05 IDT
**PASS** · Arch+Acc+QA · Preview `dpl_6vYRKn…` · **GO promote** · WP3 HOLD until post-promote smoke · WP4 HOLD  
Decision: `P3-GATE-OBS-EMIT-DECISION-Chief-2026-09-18.md`

## BASELINE UPDATE · 2026-09-18 ~09:05 IDT
**NEW PROD:** `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` · OBS EMIT promoted  
**PRIOR:** `dpl_6Tmott…` (rollback target)  
**STATUS:** post-promote smoke **PASS** (Arch+QA+Acc · pw=0) · MAINTENANCE · UX FREEZE · WP3 L2 WAIT Chief GO · WP4 HOLD  


## POST-PROMOTE SMOKE · 2026-09-18 ~09:15 IDT
**PASS** · Arch SoT · QA OBS+Acc · Acc lock · pw=0 · wikiMeta on live alias  
Artifacts: `P3-OBS-POST-PROMOTE-SOT-ארכיטקט` · `OBS-POST-PROMOTE-SMOKE-בודק` · `P3-OBS-POST-PROMOTE-ACC-SMOKE-דיוק`  
**NEXT:** WP3 L2 only on explicit Chief GO · WP4 HOLD


## WP3 L2 · 2026-09-19 ~22:10 IDT · CHIEF GO
**OPEN** · baseline `dpl_7vAA…` frozen · MEASURE ONLY · WP4 BLOCKED  
Brief: `P3-WP3-L2-EXECUTION-BRIEF-Chief-2026-09-19.md`  
Streams: L2-A Load · L2-B Soak · L2-C Failure · L2-D Breakpoint · Acc safety lock  
Close only when 4 capacity questions are Evidence-backed.


## WP3 L2 STOP · 2026-09-19 ~22:47 IDT
**STOP** · Acc pw=1 · Smith candidates Q1701775#1 · L2-C ABORT  
Finding: `L2-STOP-ACC-PW-Chief-2026-09-19.md` · Evidence Acc sample L2B  
NO Core · WP4 BLOCKED · resume only after Acc ×3 quiet PASS + Chief GO


## WP3 ACC NO-GO · 2026-09-19 ~22:57 IDT
**WP3 = FAIL/HOLD** · Acc Gate FAIL · L2-C/D STOP · WP4 NO GO  
Prod `dpl_7vAA…` FROZEN · NO patch/deploy/Core/denylist  
NOW: Evidence pack + RCA + min repro · fix proposal only  
Order: `WP3-ACC-NOGO-CHIEF-ORDER-2026-09-19.md`


## FIX GATE Acc P0 · 2026-09-19 ~23:17 IDT
**OPEN** · candidate scrub + Acc invariant · Preview only · Prod `dpl_7vAA…` FROZEN  
WP3 FAIL/HOLD · WP4 NO-GO · Promote only after Chief GO  
Order: `FIX-GATE-ACC-P0-CHIEF-ORDER-2026-09-19.md`


## STRATEGIC PIVOT · 2026-09-20 ~00:30 IDT
**Product:** Maximum Public-Web Discovery Engine  
**Acc P0:** Preview GO `dpl_5UFys…` · alias `dpl_7vAA…` HOLD promote  
**NOW:** Phase A Architecture Freeze (docs) · NO PROD · Discovery impl blocked until Acc on Prod  
Directive: `discovery/CHIEF-DIRECTIVE-DISCOVERY-PIVOT-2026-09-20.md`
