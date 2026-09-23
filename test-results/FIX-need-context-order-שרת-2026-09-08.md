# FIX — need_context אחרי wiki exact · שרת · 2026-09-08

**Status:** patched locally · no deploy · awaiting @בודק 12-gate re-smoke

## Problem
Early `need_context` / `common_name` ran **instead of** wiki exact → Netanyahu/Galon/Obama-HE stuck asking for context.

## Fix
1. `api/lib/orchestrator.js` `decideStage`: **wikiExact / rich QID → dossier first**; common-name `need_context` only when `!wikiExact`.
2. `api/lookup.js` early exit: only if `softAmbiguous && !wikiExactHit` (`found+qid+!ambiguous` OR `rich` OR `wikiLight`).

## Unit
- celeb (qid+rich, even if softAmbiguous wrongly true) → `dossier` / `known`
- דני כהן softAmbiguous no wiki → `need_context` / `common_name`

`node --check` OK on both files.
