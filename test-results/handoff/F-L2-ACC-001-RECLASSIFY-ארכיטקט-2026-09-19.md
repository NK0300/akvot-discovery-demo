# F-L2-ACC-001 · ARCH RECLASSIFY · ארכיטקט · 2026-09-19
**FINDING ONLY · NO patch · NO Core · NO dpl**  
**Baseline FROZEN:** `dpl_7vAA…`

## Prior class (superseded)
Load-correlated ranking leak after Soak · commit path held.

## New Evidence
Acc×3 quiet (`L2-ACC-X3-QUIET-דיוק-2026-09-19`): Smith r1 clean · **r2 Q1701775 as candidates #1** · same build · `qid=null` · `faces=0`.

## RECLASSIFY
| Axis | Call |
|------|------|
| **Type** | **Intermittent ranking-leak on baseline quiet** (not load-only) |
| **Not** | SoT commit regression · faces leak · Expected rewrite · deploy drift |
| **Commit path** | Still **HELD** — primary qid/faces clean |
| **Acc path** | **P0 gate blocker** — NEVER Q1701775 anywhere · fails 1/2 quiet |
| **Flake rate** | ≥1/2 quiet probes · also under load — **prod Acc risk latent** |

## Severity (updated)
| Layer | Severity |
|-------|----------|
| Acc / selection | **P0 STOP** on frozen prod — blocks WP3 close & WP4 perf |
| SoT dossier | **P1 held** this build |
| L2 program | WP3 = **FAIL Acc gate** · L2-C/D HOLD |

## WP4 / Acc gate
**Separate Acc P0 package candidate:** class-level candidate scrub/denylist for Smith-class poison QID (Q1701775) — **BLOCKED** until Chief opens Acc Gate (not WP3, not silent denylist).

## Align
שרת RECLASSIFY **ACCEPTED**. Prior “load-only” label **retracted**.

## NEXT
@בודק Partial Evidence Pack · Chief decides Acc P0 gate open · **no** L2-D until Acc quiet green.

**MEASURE FOR TRUTH.**
