# STATUS · בודק · Smith POST re-harness · 2026-09-17

**STATUS:** BLOCKED_WAIT_DPL  
**WHAT:** Re-harness `C-smith-ctx-post` COLD+WARM **N≥30** · WARM **בלי nocache** · pw=0 hard  
**EVIDENCE (ready):** harness script `scripts/perf-harness.mjs` · plan = `--n 30` focus Smith POST after Preview with fix  
**MEASURED:** Pre-fix baseline still shows PW risk on alias (harness 9/30 WARM) · local units 108/108 (שרת) · Arch GLANCE PASS  
**NOT:** Live N≥30 after fix — **alias `dpl_Crsqe…` does not include local fix** (no dpl yet)  
**RISKS:** Running N≥30 on current alias would re-measure the bug, not the fix · false FAIL or flake  
**NEXT:** Immediately on Gate Preview/dpl with Smith-WARM-PW fix → `AKVOT_PERF_BASE=<preview> node scripts/perf-harness.mjs --n 30` (or Smith-only pack) · report dossier count WARM=0 · pw=0 · **בלי optimize**

Command ready (post-dpl):
```bash
AKVOT_PERF_BASE="<preview-or-new-alias>" AKVOT_PERF_N=30 node scripts/perf-harness.mjs --tag smith-warm-pw-reharness
# Gate: C-smith-ctx-post WARM ui≠dossier · qid≠Q1701775 · pw=0 · N≥30
```
