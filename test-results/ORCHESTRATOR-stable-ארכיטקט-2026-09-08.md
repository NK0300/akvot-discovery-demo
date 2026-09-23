# Orchestrator stabilized — ארכיטקט · 2026-09-08 (8h mission)

**phase:** `orchestrator-v0` (ייצוב, לא שבירת חוזה)  
**Tests:** `node api/lib/orchestrator.test.mjs` — all PASS  
**Security:** לא נגעתי ב־CORS / SSRF / scrub / ban-hosts / token / AbortSignal

## What was stabilized
1. Fixed broken SSE `\n\n` on early `need_context` write.
2. Regression suite covering A/B/C/D gates from דיוק+בודק:
   - bare common name → `need_context` (not celebrity list)
   - wiki-committed celeb → `dossier` / `known`
   - foreign + org/city evidence → `candidates`
   - foreign bare softAmb → `need_context`
   - weak phone → `thin`
   - ctx without evidence → `thin`
   - `evidenceScore` / `canCommitWithoutFocus` thresholds
3. Confirmed wikiExact path still wins over softAmbiguous (celebs not demoted).
4. Coordinated with @שרת: use `evidenceScore` + `canCommitWithoutFocus` for stage B; do not override early need_context.

## Contract (unchanged for ממשק)
`uiState` · `scenario` · `confidence` · `needContextFields` · `messageKey` · evidence-gated `candidates`

## Next
@שרת — B registries  
@ממשק — render `uiState`  
@בודק — 12-gate live smoke before deploy
