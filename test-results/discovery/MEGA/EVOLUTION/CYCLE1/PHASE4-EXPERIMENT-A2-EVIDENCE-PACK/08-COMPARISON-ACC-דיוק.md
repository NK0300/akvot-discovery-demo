# 08-COMPARISON-ACC · דיוק · 2026-09-20

**Stamp:** 2026-09-20 10:44 IDT  
**Note:** Acc-owned comparison rows. Does **not** overwrite בודק wholesale comparison if present.

| Lane | dpl | mean multi | false-merge risk | Acc leak | pretty-wrong | findings S01/S04/S05 | Acc |
|------|-----|-----------:|------------------|----------:|--------------|---------------------:|-----|
| B0 | Avyhr… | 0.0 | 0 | 0 | 0 | 10/14/6 | LOCKED |
| A VIAF | H9o45… / EXP-A AFTER | 0.0 | 0 | 0 | 0 | 18/30/30 | FAIL (multi) FROZEN |
| A2-bound FRNDab | FRNDab… | 0.5189 | title-bridge CAVEAT | 0 | elevated | 17/30/30 | CONFIRM_PASS caveat · NON-promote |
| Bound1 | Fz2iq… | 0.0 | 0 | 0 | 0 | 18/30/30 | FAIL multi |
| **A2-safe** | **7Mmf…** | **0.2185** | **0** | **0** | **0** | **18/30/30** | **PASS LIVE** |

## Deltas vs B0 (A2-safe)

| Metric | B0 | A2-safe | Δ |
|--------|---:|--------:|--:|
| mean multi | 0.0 | 0.2185 | +0.2185 |
| Acc leak | 0 | 0 | 0 |
| false-merge risk | 0 | 0 | 0 |
| S01 findings | 10 | 18 | +8 |

## Acc claim

A2-safe typed enrich delivers **measurable multi↑** vs B0 **without** Acc leak or false-merge increase, and **without** title-only keys. FRNDab higher multi is **caveat** (title-bridge) — not promote-path.

**HOLD promote · STOP.**
