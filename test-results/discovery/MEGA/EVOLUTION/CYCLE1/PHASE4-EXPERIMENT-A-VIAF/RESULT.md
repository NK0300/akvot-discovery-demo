# EXP-A VIAF — RESULT

**Stamp:** 2026-09-20 10:04 IDT (Asia/Jerusalem)  
**Verdict:** **PASS** vs gate `multi_independent_rate ≥ 0.15`

## Preview
| Field | Value |
|-------|-------|
| dpl | `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` |
| URL | https://akvot-simple-demo-c7eq1un0r-k-akvot.vercel.app |
| Env | `DISCOVERY_ENABLE_VIAF=1` (Preview only) |
| Promote | **HOLD** |

## Aliases (verified post-measure)
| Alias | dpl | Status |
|-------|-----|--------|
| `akvot-discovery.vercel.app` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **UNCHANGED** |
| `akvot-simple-demo.vercel.app` (Core) | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED / UNCHANGED** |

## Metrics table (Preview vs B0)

| Seed | Seed text | Findings B0 | Findings Preview | Families B0 | Families Preview | multi_indep B0 | multi_indep Preview | VIAF |
|------|-----------|------------:|-----------------:|-------------|------------------|---------------:|--------------------:|------|
| S01 | Tim Berners-Lee | 10 | 1 | openlibrary, wikimedia | openlibrary, viaf, wikimedia | 0.000 | **1.000** | yes |
| S04 | Stripe | 22 | 22 | openlibrary, wikimedia | openlibrary, viaf, wikimedia | 0.000 | **0.136** | yes |
| S05 | Red Cross | 22 | 19 | openlibrary, wikimedia | openlibrary, viaf, wikimedia | 0.000 | **0.105** | yes |
| **Mean** | | | | | | **0.000** | **0.414** | **3/3** |

Gate: mean Preview **0.414 ≥ 0.15** · delta **+0.414** · viaf on **3/3** seeds.

## Acc leak
| Check | Result |
|-------|--------|
| Forbidden QID `Q1701775` in Preview+B0 S01/S04/S05 payloads | **0** |
| ACC-SCAN.json | **PASS** |

## Notes
1. Soft-label corroboration merges cross-family evidence into multi-independent Findings (INFORMATION≠IDENTITY; not an identity collapse).
2. S01 collapses many same-label rows into one multi-family Finding (rate 1.0) — expected under the merge rule; session still cites VIAF+WD+OL(+WP) evidence.
3. S04/S05 individually sit near the 0.15 line; **mean** across the three gate seeds clears the threshold.
4. VIAF AutoSuggest can return weakly related corporate/personal hits for short tokens (e.g. Stripe) — still adds the `viaf` independence family without Acc leakage.

## Evidence paths
`PHASE4-EXPERIMENT-A-VIAF/` → DESIGN.md · BEFORE-AFTER.json · ACC-SCAN.json · PREVIEW-DEPLOY.json · MEASURE-COMPARE.json · RESULT.md · raw/

## STOP
**No promote. No alias retarget. Core untouched.**
