# P3 BOTTLENECK MAP · top-10 · ארכיטקט · 2026-09-17
**STATUS:** READY · MEASURE ONLY · **NO Core optimize · NO dpl**  
**Baseline:** `dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy` · PW-fix CLOSED · UX FREEZE  
**Sources:** System Map · harness N30 (`PERF-HARNESS-n30-resume-0012`) · Latency Decomp · Obs Gap · Smith re-harness PASS on Preview/alias

Score: **IMPACT** (1–5 latency/user) × **CONF** (1–5 evidence) · **RISK** = danger if optimized wrong (pw/safety/SoT). Higher RISK → Gate + Acc mandatory.

---

## STATUS block

| Field | Value |
|-------|--------|
| STATUS | BOTTLENECK MAP READY |
| WHAT | Top-10 ranked drivers + Gate package hypotheses |
| EVIDENCE | this file · decomp/obs/harness/Map |
| MEASURED | N30 walls + stage shares · WARM asymmetry · obs gaps |
| NOT | implement · dpl · threshold/EXPECTED change |
| RISKS | Optimizing wiki/cache without Acc → PW recurrence |
| NEXT | Chief packages P3-OPT after L1 dry-run · still measure-first |

---

## Top-10 (ranked)

| # | Bottleneck | Archetype | IMPACT | CONF | RISK | Score | Evidence |
|---|------------|-----------|--------|------|------|-------|----------|
| 1 | **HE common wiki tail** (כהן path burns ~21s of ~24s) | D-cohen COLD | **5** | **5** | **4** | **25** | wiki≈91% wall · p50 23.7s · p99 39s · WARM still ~17s (not true HIT) |
| 2 | **Latin wiki race floor ~5.5s** | Smith bare / Rappaport COLD | **4** | **5** | **3** | **20** | wiki=5500 = budget · ~94% wall |
| 3 | **Smith POST+ctx no WARM reuse** (wall≈6.4s COLD≈WARM) | C-smith-ctx | **4** | **5** | **5** | **20** | stageB~0.56s after wiki; cache miss or key not shared · **PW history** on this path |
| 4 | **Obs G1: WARM timings stale on HIT** | Assaf/Smith bare WARM | **3** | **5** | **1** | **15** | wall 256 vs timings.total 1–5s · poisons analysis |
| 5 | **Obs G4: no wiki 429/timeout counters** | כהן / Latin | **4** | **3** | **2** | **12** | can't tell budget burn vs retry storm |
| 6 | **StageB ~0.5–0.7s after wiki floor** | Smith+ctx / כהן | **2** | **5** | **3** | **10** | additive; never dominant alone |
| 7 | **Obs G2: no structured stage span logs** | all | **3** | **4** | **1** | **12** | blocks continuous measure without harness |
| 8 | **Serverless cold + empty in-memory cache** | first hits / multi-instance | **3** | **3** | **2** | **9** | Assaf COLD 1.3s vs WARM 0.26s · POST WARM miss may be instance churn |
| 9 | **Edge overhead (wall−serverTotal)** | Assaf COLD ~370ms | **2** | **3** | **1** | **6** | TLS/invoke · not Core |
| 10 | **Monolith lookup.js (~4.3k LOC) / god-path** | maintainability | **2** | **4** | **4** | **8** | slows safe opts · split = Gate package later |

*(G3 cacheKeyHash folded into #3/#8; enrich blindness = secondary under #6.)*

---

## Path × bottleneck matrix

| Path | Primary BN | Secondary |
|------|------------|-----------|
| Assaf / נתניהו | #8 cold | #4 timings on WARM |
| Smith bare / Rappaport | #2 Latin floor | #4/#8 WARM |
| Smith POST+ctx | #2+#3 | #6 stageB · **RISK 5** |
| כהן | **#1** | #5 429? · #8 no HIT |

---

## Hypotheses for future Gate packages (NOT approved work)

| ID | Hypothesis | Targets BN | Acc/SoT constraint |
|----|------------|------------|---------------------|
| P3-H1 | Early COMMON_HE exit must not still enter long wikiPath | #1 | ui stays need_context\|thin · 0 faces · **measure first why 21s wiki still runs** |
| P3-H2 | Latin softAmb: shorter wiki budget when classSoft already decided | #2 | never unlock dossier · Smith-class locks intact |
| P3-H3 | POST+ctx cacheKey parity + HIT timings reset | #3 #4 | revalidateDomainSafePayload mandatory · pw=0 WARM N≥30 |
| P3-H4 | Emit wikiStatus/429 counts + span log | #5 #7 | obs only · no behavior change |
| P3-H5 | StageB maxMs tighten only after #1/#2 | #6 | evidence≥T unchanged |

**Rule:** Any package touching wiki/commit/cache → Arch glance + Acc + harness before dpl.

---

## Explicit non-goals (this phase)

- Latency micro-opts that weaken Smith-class / seed-adjacent / COMMON_HE  
- Threshold drop · EXPECTED rewrite · Assaf-if  
- Promote without Gate  
- Treating stale WARM timings as server cost

---

## NEXT

1. @בודק L1 dry-run on alias (incl Smith POST WARM)  
2. Chief selects Gate packages from P3-H1…H5 after L1  
3. ארכיטקט: boundaries per selected package before implement  

**MEASURE FOR TRUTH. NO OPTIMIZATION UNTIL PACKAGE GATE.**
