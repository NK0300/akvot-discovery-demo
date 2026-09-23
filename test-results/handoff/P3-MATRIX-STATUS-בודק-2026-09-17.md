# STATUS · בודק · P3 LOAD/FAILURE MATRIX · 2026-09-17

**STATUS:** L2 STEADY **FAIL** · MEASURE ONLY · L1 PASS prior

**WHAT:** L2 steady load (N=13, concurrency=4, SmithWARM=1) on PRODUCTION alias against locked baseline dpl_3cgo…

**EVIDENCE:**
- Spec: `handoff/P3-LOAD-FAILURE-MATRIX-בודק-2026-09-17.md`
- L1 run: `test-results/load/LOAD-L1-DRYRUN-dpl3cgo-בודק-2026-09-17.{md,json}`
- L2 run: `test-results/load/LOAD-L2-STEADY-dpl3cgo-בודק-2026-09-17.{md,json}`
- Prior harness flag (historical): `test-results/perf/PERF-HARNESS-n30-resume-0012-5804c63f.md` · Smith WARM PW noted earlier
- Spot confirm: `handoff/P3-MATRIX-CONFIRM-SMITH-WARM-PW-בודק-2026-09-17.json`

**MEASURED (L2):**
- health.build = `dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy` (match=true)
- pretty-wrong = **1**
- dossierOnUnsafe = 1 · facesOnUnsafe(Smith/כהן/T-C6) = 1
- Assaf KEEP ≥1 = true
- p50/p95 = 5499/8771 ms · err% = 0% · ACCESS/403 = 0
- Smith WARM uiCounts: {"candidates":1}
- verdict = **FAIL**
- when: 2026-09-17T20:44:55+03:00 (Asia/Jerusalem)
- stopReason: PRETTY-WRONG on Smith-POST-COLD×1

**NOT:** L3+ burst/soak/stress · Core optimize · dpl · code change

**RISKS:** WARM cache flake historically flagged; this L2 window SAW PW → STOP→Chief; Vercel 403 mitigations under concurrency

**NEXT:** STOP→Chief on FAIL/PW; no further load packs · בלי optimize/dpl ממני

Baseline `dpl_3cgoTVkUJpHfcdos8EVY327ZUTYy` confirmed via /api/health
