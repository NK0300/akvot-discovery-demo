# Acc P0 FIX · EXPECTED + FIX-3 matrix · דיוק · 2026-09-19

**STATUS:** EXPECTED LOCKED · WAIT local scrub+units · then MINIMAL REPRO  
**Prod alias:** `dpl_7vAA…` **FROZEN** · no Expected rewrite of historical P2 cases beyond Acc invariant below  
**Aligned:** Arch DESIGN BOUND · Chief FIX GATE Acc P0

## Acc invariant (FIX-2) — HARD
For Smith-class + ctx (IBM/New York/US) and any soft Latin ambiguous path covered by denylist:

| Check | Rule |
|-------|------|
| dossier.qid | **NEVER** Q1701775 |
| candidates[].id/qid | **NEVER** Q1701775 (wd-Q1701775 stripped, not demoted) |
| sources[] as ranked identity | **NEVER** promote Q1701775 as candidate row |
| faces | 0 on non-commit path (unchanged) |
| pw | **0** if Q1701775 absent everywhere |
| Assaf | KEEP dossier Q47507930 (no Assaf-if) |
| כהן / T-C6 | need_context\|thin\|candidates · not Assaf bleed |

**ERROR TYPE if Q1701775 appears anywhere:** Acc **P0 FAIL** (ranking contamination) — faces=0 does **not** clear.

## FIX-3 Minimal repro matrix (Acc owns)
Run on **Preview only** after Arch GO + שרת local units. N per cell as noted. STOP if leakage>0.

| ID | Mode | Input | WD / cache | EXPECTED |
|----|------|-------|------------|----------|
| M1 | quiet×3 | Smith POST+IBM/NY/US | natural | ui∈cand\|thin\|need_ctx · **Q1701775∉all** · faces=0 |
| M2 | COLD×3 | same + nocache | force miss | same |
| M3 | WARM×3 | same after COLD | HIT path | same · scrub on HIT too |
| M4 | repeated×5 quiet | same | intermittent WD | all 5 clean · leakage=0 |
| M5 | WD-absent sim | same | if harness can empty WD / 429 | no Q1701775 · fail-safe soft UI OK |
| M6 | Assaf keep×1 | Assaf Rappaport | — | dossier Q47507930 |
| M7 | כהן×1 | כהן | — | need_context\|thin · not dossier |
| M8 | T-C6×1 | John Rappaport | — | not Assaf QID · not dossier preferred |

**PASS gate (Acc):** M1–M4 leakage=0 · pw=0 · M6–M8 PASS · then hand to @בודק FIX-4 load.

## Out of scope
Ranking boost redesign · H1 כהן · cache TTL · Expected soften to allow Q170 in list · alias promote.

## Evidence paths (to fill after Preview)
- `test-results/wp3/ACC-P0-FIX-MINREPRO-דיוק-*.md`
- before/after payloads under `test-results/wp3/ACC-P0-FIX-MINREPRO-raw/`
