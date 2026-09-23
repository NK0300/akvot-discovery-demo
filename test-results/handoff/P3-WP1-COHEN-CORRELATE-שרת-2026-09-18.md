# P3 · WP1 כהן wiki · שרת correlate · 2026-09-18

**STATUS:** MEASURE CONFIRMED (Arch SoT) · baseline `dpl_6Tmott…` · **NO implement / NO dpl**

## Correlate
Primary Evidence: `P3-WP1-COHEN-WIKI-MEASURE-ארכיטקט-2026-09-17.md`

**Root (HIGH):** harness `q=כהן` (1 token) → `isCommonHeBareName`=**false** (needs 2–3) → **no** early-exit → full wikiPath (~21s when Wikimedia slow). ui=`need_context` correct · latency wasted.

## Hypothesis for Gate (BLOCKED)
**P3-H1:** single-token ∈ COMMON_HE_SURNAMES + !ctx → early need_context before wikiPath (class-level). Acc must stay need_context|thin · 0 faces.

## NOT
Code change this turn.

## NEXT
Hold for Gate · WP0 OBS so we can measure wiki429 vs budget on כהן COLD.
