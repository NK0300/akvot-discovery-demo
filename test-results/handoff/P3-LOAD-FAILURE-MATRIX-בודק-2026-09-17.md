# P3 LOAD / FAILURE / RECOVERY MATRIX · בודק · SPEC
**STATUS:** READY (spec) · **MEASURE ONLY** · no execute-at-scale until harness N≥30 + Chief GO for load runs  
**Baseline LOCKED:** `dpl_CrsqeSQX1GAhi1VFExVsGwdsSYHt` · alias `https://akvot-simple-demo.vercel.app`  
**Master:** `P3-PRODUCTION-EXCELLENCE-MASTER-2026-09-16.md`  
**Refs:** P2 regression `P2-REGRESSION-CASES` · alias smoke `ALIAS-SMOKE-dplCrsqe` · harness `@שרת` · Map `@ארכיטקט`

---

## 0. STATUS block (required)

| Field | Value |
|-------|--------|
| STATUS | **READY** · matrix SPEC locked · runs WAIT harness percentiles |
| WHAT | Load / stress / soak / failure / recovery matrix preserving P1/P2 SAFETY+pw=0 |
| EVIDENCE | this file · `test-results/handoff/P3-LOAD-FAILURE-MATRIX-בודק-2026-09-17.md` |
| MEASURED | Spec only · prior P2 alias smoke (Assaf/T-C6/SmithPOST/כהן) · suite 19/19 |
| NOT | Live load/soak/stress numbers · concurrency curves · recovery SLOs |
| RISKS | Vercel mitigations under load · wiki429 · false pw under race · harness noise ≠ product FAIL |
| NEXT | Align cases with harness N≥30 · dry-run matrix N=5 after GO · then load packs · **no Core/dpl** |

---

## 1. Hard locks (never relax for speed)

- **pretty-wrong = 0** · dossier+faces on unsafe / wrong QID = **STOP→Chief**
- P1/P2 SAFETY: Cohen/Smith bare · Smith+ctx POST nested · G11 email · junk · T-C6 John Rappaport · Assaf Q47507930 KEEP
- Single SoT · threshold **0.75** · no Expected rewrite · no dpl · no Core optimize
- Baseline `dpl_Crsqe…` only (alias) · ACCESS/INFRA failures tagged separately (not product FAIL)

---

## 2. Case packs (identity)

| Pack | Cases | Purpose |
|------|-------|---------|
| A SAFETY | דני כהן · John Smith bare · Smith POST nested+US · Smith+email · junk · כהן bare · John Rappaport | must never dossier+faces / wrong QID |
| B KEEP | Assaf Rappaport · אסף רפפורט · בנימין נתניהו · אורלי לוי · Merkel · Zehava | recall must hold under load |
| C MIX | rotate A+B | contention / cache pollution |
| D ERR | malformed JSON · missing q · huge body · wrong method | fail soft · no crash leak |

---

## 3. Load profiles (spec — execute later)

| ID | Profile | Concurrency | Duration / N | Goal |
|----|---------|-------------|--------------|------|
| L1 | Smoke load | 1–2 | N=10 | sanity vs smoke |
| L2 | Steady | 3–5 | N≥30 / pack | correlate harness |
| L3 | Burst | 8–12 | 60–90s | queue / mitigations |
| L4 | Stress | ramp to fail-soft | until 429/403/timeout OR hard stop | find cliff · **abort on mitigate streak** |
| L5 | Soak | 2–3 | ≥15–30 min | leak / cache / timeout drift |
| L6 | Recovery | after L3/L4 pause | N=10 sequential | return to baseline behavior |

**Metrics per request:** http · uiState · qid · faces · ms · requestId · err class (ok / timeout / 403-mitigated / 429 / 5xx / parse)  
**Aggregates:** p50/p95/p99 · err% · pw count · SAFETY fail count · ACCESS vs PRODUCT

---

## 4. Failure injection (spec)

| ID | Fault | Expected product | Tag |
|----|-------|------------------|-----|
| F1 | Upstream wiki slow / 429 | thin/need_context or budget_timeout · **not** wrong dossier | PRODUCT soft |
| F2 | AbortSignal / hardDeadline | thin + budget · no hang past 60s | PRODUCT |
| F3 | Vercel System Mitigations 403 | ACCESS/INFRA · abort pack · STOP→Chief if sustained | **INFRA** |
| F4 | Cache cold vs warm | latency delta only · same ui/qid class | MEASURE |
| F5 | POST nested vs GET flat (Smith+US) | both non-dossier · parity | PRODUCT |
| F6 | Partial Stage B / Gemini skip | no threshold drop · no Assaf-if | PRODUCT |

---

## 5. Recovery criteria

After fault clears (or after L4 stop):
1. Sequential Assaf → dossier Q47507930  
2. T-C6 → need_context · qid=null · 0 faces  
3. Smith POST → candidates|thin|need_context · 0 faces · not Q1701775  
4. כהן → need_context|thin · 0 faces  
5. `npm run test:contract` optional after any suspected product change (none planned in Phase 0–1)

Any pw>0 or SAFETY miss → **STOP→Chief** · no continue load.

---

## 6. Alignment with teammates

| Teammate | Input to matrix |
|----------|-----------------|
| @שרת harness | COLD/WARM · GET/POST+ctx · p50–p99 · case overlap Assaf/Smith/כהן/Rappaport/נתניהו |
| @ארכיטקט Map | S0–S8 budgets · timeout/cache/obs gaps → which failures to inject |
| @דיוק Acc-protect | EXPECTED frozen · pw=0 · class-level · S07 need_context\|thin |
| @ממשק | FREEZE · CTA only if contract breaks under load (report only) |

---

## 7. Execution gates (do not skip)

1. **SPEC READY** ← this doc (now)  
2. Harness N≥30 percentiles published (@שרת)  
3. Chief GO for live L2 (steady) on alias  
4. L1 dry-run → L2 → only then L3/L5 with mitigate abort  
5. Evidence under `test-results/load/` + handoff STATUS update  
6. **No** Core optimize / dpl from matrix results alone

---

## 8. Evidence paths (planned)

- Spec: `test-results/handoff/P3-LOAD-FAILURE-MATRIX-בודק-2026-09-17.md`  
- Status: `test-results/handoff/P3-MATRIX-STATUS-בודק-2026-09-17.md`  
- Future runs: `test-results/load/LOAD-*-בודק-YYYY-MM-DD.{md,json}`  

*בודק · MEASURE FOR TRUTH · NO OPTIMIZATION UNTIL BASELINE EVIDENCE*
