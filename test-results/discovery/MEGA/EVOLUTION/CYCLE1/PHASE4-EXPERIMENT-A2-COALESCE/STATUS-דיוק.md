# STATUS — דיוק · CYCLE1 PHASE4 EXP-A2 COALESCE · Acc AFTER Bound #1

**Stamp:** 2026-09-20T10:27:50+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A2-COALESCE

## State

| Item | Value |
|------|-------|
| PRIMARY Preview | `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` Bound #1 |
| Acc AFTER Bound#1 | **FAIL** · mean multi **0** · leak **0** · S01 **18** |
| FRNDab caveat | CONFIRM_PASS · mean **0.5189** |
| Promote | **HOLD** |
| Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED** · smoke **PASS** |
| Discovery B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **LOCKED / unchanged** · aliasStill=true |

## Gates (Bound #1 Chief)

| Gate | Result |
|------|--------|
| mean multi ≥ 0.15 | **FAIL** (0) |
| Acc leak = 0 | **PASS** |
| S01 no vacuum | **PASS** (18) |
| Adversarial / Core / B0 | **PASS** |

## Deliverables

1. `ACC-AFTER-BOUND1-Fz2iq-דיוק-2026-09-20.md` + `.json` (PRIMARY verdict)
2. `ACC-AFTER-FRNDab-דיוק-2026-09-20.md` + `.json` (caveat confirm)
3. `ACC-COMPARE-A2-דיוק-2026-09-20.md` (+ `.json`)
4. `STATUS-דיוק.md` (this file)
5. raw: `raw/acc-after-דיוק/`

## Note

Bound #1 typed-keys-only — multi=0 after title-only removal is expected; Acc FAIL on multi gate is honest. **HOLD** promote.
