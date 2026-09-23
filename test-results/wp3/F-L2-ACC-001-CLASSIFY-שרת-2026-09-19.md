# F-L2-ACC-001 · CLASSIFY (שרת) · 2026-09-19

**Mode:** quiet probe ×1 + payload · **NO patch · NO Core · NO dpl**  
**Build:** `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` (health match)

## Quiet probe (now)
| Field | Value |
|-------|--------|
| Request | POST Smith + IBM/NY/US · `nocache:1` |
| `requestId` | `1852d579-b926-496a-9386-5ce8919fde3e` |
| ui | `candidates` |
| qid | `null` |
| faces | `false` |
| candidates_n | 6 |
| **Q1701775 anywhere** | **false** |
| #1 | `ol-OL177707A` John Smith · score 0.82 |
| wikiMeta | 429=3 · timeout=1 · retries=4 |

Artifacts: `F-L2-ACC-001-QUIET-smith-שרת-2026-09-19.json` · `F-L2-ACC-001-QUIET-SUMMARY-שרת-2026-09-19.json`

## Class
| Option | Decision |
|--------|----------|
| Core / SoT commit regression | **NO** — quiet + fail sample both `qid=null` · faces=0 |
| **Ranking leak** | **YES (primary)** — fail sample had `wd-Q1701775` #1 under post-soak; quiet clears |
| Wiki-geo flake only | **Secondary factor** — fail correlated with wiki429 pressure after L2-B; quiet still has mild 429 but no poison QID |

## Verdict (שרת)
**ranking-leak · load/wiki-stress correlated · not sticky regression on this dpl.**  
Aligns with ארכיטקט: ranking leak vs SoT · Acc P0 STOP · commit path held · WP4 denylist/scrub **BLOCKED**.

## Next (not mine)
@דיוק Acc×3 quiet · @Chief decide resume L2-C / close pack.
