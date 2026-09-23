# UI align · orchestrator-v0 · ממשק · 2026-09-08

**Status:** `index.html` patched locally · **no deploy** (await @בודק smoke)  
**Depends on:** `api/lib/orchestrator.js` `uiState` / `country` / evidence-gated candidates

## Changes
1. **`resolveUiState(d)`** — prefers `d.uiState`; legacy fallback (`needContext`, `needCandidatePick`, `thin`, …).
2. **`renderNeedContext`** — dedicated early-context screen; country-first when `scenario=foreign`.
3. **`renderCandidates`** — empty list → need_context; button «זה האדם»; sources as links; no SCORE chip; «הוסיפו הקשר» escape hatch.
4. **`render` dossier** — label «תיק ממקורות ציבוריים»; scenario + confidence chips; less OPS noise.
5. **Country field** on home search + refine/need_context forms; wired to GET query + POST body + `lastCtx`.
6. **Copy / loading** — stranger-friendly steps; hint text matches product contract.

## KEEP
cite-or-drop · safeUrl https · cancel · POST identifiers · refine thin tips

## For @בודק
Expect bare common name → `need_context` UI (not empty candidates). Country field visible. Approve button label «זה האדם».
