# 15 — EVIDENCE PACK STRUCTURE · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט  
**Purpose:** Structure template for a **future** experiment evidence pack (e.g. EXP-GAP-1) after Chief GO  
**Mode:** Template only · **NO pack execution now** · NO EXP-B

---

## Recommended directory skeleton

```
CYCLE1/PHASE4-EXPERIMENT-GAP1-HE-LOCALE-EVIDENCE-PACK/   # name illustrative
├── STATUS-ארכיטקט.md
├── STATUS-דיוק.md
├── STATUS-שרת.md
├── STATUS-בודק.md
├── FILE-INDEX.md
├── 00-CHIEF-BRIEF.md
├── 01-DEFINITION-ארכיטקט.md
├── 02-PREVIEW-POINTER.json          # dpl + URL exact
├── 03-IMPL-DIFF-ארכיטקט.md          # expect: locale wiring only / empty if measure-only
├── 04-LOCALE-MATRIX.md              # en vs he host table
├── 05-METRICS-דיוק.md
├── 06-ACC-דיוק.md
├── 07-QA-CORPUS-בודק.md
├── 08-ADVERSARIAL-בודק.md
├── 09-RAW-REPRESENTATIVE/           # @שרת
├── 10-LIMITATIONS-ארכיטקט.md
├── 11-DECISION-RECOMMENDATION-ארכיטקט.md
├── examples/
└── scripts/                         # analysis only — no prod code
```

---

## Required Chief-facing fields

| Field | Rule |
|-------|------|
| Preview dpl + URL | Exact |
| Diff vs A2 experimental baseline | Explicit — coalesce untouched |
| Acc leak | Numeric |
| HE host presence | Numeric / per-seed |
| multi | Report as metric **only** — not gate |
| Promote recommendation | Default **HOLD** |
| EXP-B | **NO** unless Chief separate GO |

---

## Inheritance from A2 packs

- Vocabulary 6 labels frozen  
- Bound#1 frozen  
- S04/S05 limitation language frozen  
- Do not mutate A2 historical packs when creating new pack

---

## STOP

Create this pack **only after** Chief approves EXP-GAP-1 (or alternate). This file is structure, not authorization.
