# CORE-REGRESSION — PR-CLOSEOUT · Acc P0 / identity-p0
**Stamp:** 2026-09-20T08:47:38+03:00 → 2026-09-20T08:49:39+03:00 IDT  
**Target:** Production alias **LOCKED** `https://akvot-simple-demo.vercel.app` · `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Policy:** NO promote · NO Core alias changes · Discovery-only Acc work

## Verdict: **PASS** · **pw=0** · **leakage=0**

## Contract identity-p0 (alias)

| Case | uiState | qid | faces | leak | Result |
|------|---------|-----|-------|------|--------|
| a-netanyahu-keep | dossier | Q43723 | true (allowed) | 0 | PASS |
| b-cohen-keep | need_context | — | false | 0 | PASS |
| c-smith-bare-keep | need_context | — | false | 0 | PASS |
| d-smith-ctx-p0 | candidates | — | false | 0 | PASS · NEVER Q1701775 |
| e-smith-email-g11-p0 | candidates | — | false | 0 | PASS · NEVER Q1701775 |

**Roll-up:** pass=5/5 · improve=0 · **pw=0** · **leakage=0**

## Dual evidence
1. PR-CLOSEOUT runner Core section (`CORE-REGRESSION.json`)
2. `node test-results/contract-identity-p0.mjs` → exit 0 · report `test-results/CONTRACT-identity-p0-בודק-2026-09-09.json`

## Locks held
- Production alias deployment **not** retargeted
- No Core orchestrator Acc behavior change this wave
- Discovery emit scrub fix does **not** import into `/api/lookup`

## Decision
**CORE-REGRESSION = PASS · pw=0 · leakage=0 · HOLD promote**
