# 04 — RECOVERY EXPERIMENT

**Stamp:** 2026-09-20 10:52:51+03:00 IDT  
**A2-safe-hardening:** **no change / forensics-only**  
**Recovery attempted (code):** **NO**  
**Deploy:** **NO** · **Promote:** **HOLD** · **EXP-B:** **NO**

## Why no code
Phase1 shows S04 authority gap (no P214; VIAF homonyms; OL no remote_ids) and S05 mostly correct non-collapse. Wikipedia→qid real but same wikimedia hostFamily — cannot raise multi. Title bridges forbidden. No honest code path this cycle.

## Rejected candidates
| ID | Why rejected |
|----|----------------|
| WP_PAGEPROPS_QID | Real evidence but hostFamily(wikipedia)=wikimedia=wikidata → no multi attach; splitting families would game TRUTH>MULTI |
| STRIPE_P214 | Upstream P214=[] — impossible |
| TITLE_BRIDGE | Forbidden / A2-bound REJECTED |
| ICRC_VIAF_FORCE | Distinct VIAF ids (145680594 vs 160178001) — UNKNOWN→SAME without shared key |
| OL_EXPAND | Unproven this run (OL 503); Stripe OL often lacks remote_ids |

Design bounds: see `04-S04-S05-RECOVERY-BOUNDS-ארכיטקט.md`.
