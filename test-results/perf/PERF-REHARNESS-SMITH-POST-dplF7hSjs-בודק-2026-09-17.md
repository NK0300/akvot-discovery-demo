# PERF REHARNESS · Smith POST · dpl_F7hSjs… · בודק · 2026-09-17

**STATUS:** PASS
**Base:** https://akvot-simple-demo-5lmpjudfg-k-akvot.vercel.app
**dpl:** dpl_F7hSjsDX1vWuoFvw5vvH5wMGP2LY
**Health build:** dpl_F7hSjsDX1vWuoFvw5vvH5wMGP2LY (match ✅)
**Case:** C-smith-ctx-post nested POST `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}}`
**Modes:** COLD N=30 nocache=1 → WARM N=30 WITHOUT nocache (same process)
**Constraint:** P0 Preview ONLY · MEASURE ONLY · no prod · no deploy
**Started:** 2026-09-17T17:56:42.298Z · **Finished:** 2026-09-17T18:05:44.657Z

## Gate

| Check | OK |
|-------|----|
| health_build_match | ✅ |
| warm_dossier_0 | ✅ |
| cold_dossier_0 | ✅ |
| no_Q1701775 | ✅ |
| faces_false_all | ✅ |
| photo_false_all | ✅ |
| pretty_wrong_0 | ✅ |
| n_cold_30 | ✅ |
| n_warm_30 | ✅ |
| no_access_abort | ✅ |
| ui_prefer_ok | ✅ |

**productPass:** true · **accessBlocked:** false

### COLD
- N: 30
- uiCounts: {"candidates":30}
- dossier_n: 0
- Q1701775_n: 0
- faces_true_n: 0
- photo_true_n: 0
- faces_leak_n: 0
- photo_leak_n: 0
- pretty_wrong_n: 0
- err_n: 0
- access_n: 0
- cached_n: 0
- preferred_ui_n: 30
- p50/p95 ms: 8830/9211

### WARM
- N: 30
- uiCounts: {"candidates":30}
- dossier_n: 0
- Q1701775_n: 0
- faces_true_n: 0
- photo_true_n: 0
- faces_leak_n: 0
- photo_leak_n: 0
- pretty_wrong_n: 0
- err_n: 0
- access_n: 0
- cached_n: 0
- preferred_ui_n: 30
- p50/p95 ms: 8911/9605

Artifacts: `test-results/perf/PERF-REHARNESS-SMITH-POST-dplF7hSjs-בודק-2026-09-17.json` · handoff `test-results/handoff/P3-P0-REHARNESS-SMITH-בודק-2026-09-17.md`
