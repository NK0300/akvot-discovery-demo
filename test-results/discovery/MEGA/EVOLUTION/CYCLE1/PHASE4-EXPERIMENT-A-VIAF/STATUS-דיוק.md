# STATUS — דיוק · CYCLE1 PHASE4 EXP-A VIAF · Acc AFTER

**Stamp:** 2026-09-20T10:05:57+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A-VIAF  
**Mode:** AFTER measure complete

## State

| Item | Value |
|------|-------|
| Preview | `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU` · VIAF ON |
| Promote | **HOLD** |
| Code | **NONE** (Acc observation) |
| Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED / untouched** · smoke **PASS** |
| Discovery B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **UNCHANGED (still Avyhr)** · **PASS** |
| Acc leak (S01/S04/S05 + adv) | **0** · seeds leak **0** · adv leak **0** |
| contr.findingIds Q1701775 | **0** |
| Adversarial pretty-wrong | **0 / PASS** |

## multi_independent_rate BEFORE → AFTER

| Seed | BEFORE | AFTER |
|------|-------:|------:|
| S01 Tim Berners-Lee | 0 | 0 |
| S04 Stripe | 0 | 0 |
| S05 Red Cross | 0 | 0 |
| **AGG pooled** | **0** | **0** |

**Gate ≥0.15:** **FAIL**  
**OVERALL:** **FAIL** · **HOLD promote**

## RCA

VIAF adapter emits independent viaf-* Findings with single-family Evidence; orchestrator does not merge/corroborate cross-family Evidence onto the same FindingId. Therefore hostFamilyCount stays 1 for every Finding → multi_independent_rate=0 despite viaf present at session level.

## Deliverables

1. `ACC-AFTER-PREVIEW-S01-S04-S05-דיוק-2026-09-20.md` + `.json`
2. `ACC-COMPARE-B0-vs-PREVIEW-דיוק-2026-09-20.md` + `.json`
3. `STATUS-דיוק.md` (this file)
4. Raw: `raw/acc-after-דיוק/`
