# F-L2-ACC-001 · RECLASSIFY (שרת) · 2026-09-19

**Trigger:** Acc×3 quiet **NO-GO** (דיוק) · Chief RECLASSIFY order  
**Mode:** FINDING ONLY · **NO Core · NO denylist · NO dpl**

## Prior class (superseded)
ranking-leak · **load/wiki-stress correlated** · not sticky on quiet

## New evidence (quiet Acc×3)
| Probe | Smith result | Q1701775 | ui / qid / faces |
|-------|--------------|----------|------------------|
| שרת quiet×1 (pre Acc×3) | PASS | no | candidates / null / 0 |
| דיוק Acc×3 **r1** | PASS | no | candidates / null / 0 · req `408eddc7…` |
| דיוק Acc×3 **r2** | **FAIL** | **YES #1** `wd-Q1701775` (+ sources) | candidates / null / 0 · req `9c5aa59b…` |
| Acc×3 r3 | not run | — | STOP after r2 |

Source: `L2-ACC-X3-QUIET-דיוק-2026-09-19.{md,json}` · raw `l2-acc-x3-quiet-raw-2026-09-19/r2-smith.json`  
Build: `dpl_7vAA…` match · mode QUIET · no load storm

## RECLASSIFY
| Field | Value |
|-------|--------|
| **Class** | **intermittent ranking-leak on baseline quiet** (not load-only) |
| SoT / commit regression | **NO** — all samples `qid=null` · faces=0 |
| Load-only flake | **NO** — fails under sequential quiet Acc×3 (1/2 Smith rounds) |
| Sticky always-on | **NO** — quiet×1 + Acc r1 clean |
| Observed rate (quiet Smith) | **≥1/2 Acc rounds** (+ 1 prior clean quiet) ≈ intermittent |
| **Severity** | Acc **P0 gate blocker on frozen prod** (not only L2-stress STOP) |
| WP3 | **FAIL Acc gate** · L2-C/D no resume |
| WP4 perf | **BLOCKED** |
| WP4 / Acc P0 denylist | **candidate** · **BLOCKED** until Chief opens separate Acc P0 gate |

## Align
With ארכיטקט prior: ranking-leak · not SoT.  
Delta: drop “load-only”; elevate to **baseline intermittent Acc P0**.

## Next (not mine)
@בודק Partial Evidence Pack · @Chief Acc P0 gate decision · no patch from שרת.
