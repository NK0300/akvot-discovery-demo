# PERF REHARNESS · Smith POST · dpl_DEVknn… · בודק · 2026-09-17

**STATUS:** PASS
**Base:** https://akvot-simple-demo-1k80g2net-k-akvot.vercel.app
**Health build:** dpl_DEVknn76KN1EcFUSGWPfWDjxuMt5
**Case:** C-smith-ctx-post nested POST `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}}`
**Modes:** COLD N=30 nocache=1 → WARM N=30 WITHOUT nocache (same process)
**Constraint:** Preview ONLY · MEASURE ONLY · no prod · no deploy

## Gate

| Check | OK |
|-------|----|
| warm_dossier_0 | ✅ |
| cold_dossier_0 | ✅ |
| no_Q1701775 | ✅ |
| faces_false_when_not_dossier | ✅ |
| photo_false_when_not_dossier | ✅ |
| pretty_wrong_0 | ✅ |
| prefer_all_faces_false | ✅ |
| n_cold_30 | ✅ |
| n_warm_30 | ✅ |
| no_access_abort | ✅ |

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
- p50/p95 ms: 8841/9844

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
- p50/p95 ms: 8832/10041

Artifacts: `test-results/perf/PERF-REHARNESS-SMITH-POST-dplDEVknn-בודק-2026-09-17.json` · handoff `test-results/handoff/P3-REHARNESS-SMITH-POST-בודק-2026-09-17.md`
