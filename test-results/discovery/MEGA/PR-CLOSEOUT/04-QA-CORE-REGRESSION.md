# 04 — QA CORE REGRESSION · PR-CLOSEOUT · בודק
**Stamp:** 2026-09-20T08:51:41+03:00 IDT
**Alias:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · https://akvot-simple-demo.vercel.app · **LOCKED**
**Promote:** HOLD

## Invariants
- pw = **0** (must be 0)
- leakage = **0** (must be 0)

| ID | Status | ui | qid | faces | leak | pw |
|----|--------|----|-----|------:|-----:|----|
| CORE-Assaf | **PASS** | dossier | Q47507930 | 2 | 0 | false |
| CORE-כהן | **PASS** | need_context | null | 0 | 0 | false |
| CORE-Smith | **PASS** | need_context | null | 0 | 0 | false |
| CORE-Smith-ctx | **PASS** | candidates | null | 0 | 0 | false |

## Verdict
**PASS** · Assaf/כהן/Smith · pw=0 · leakage=0 requirement: MET

Evidence: `raw/qa-matrix/CORE-*.json`
