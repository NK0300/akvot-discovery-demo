# FIX — flaky A-Known בנימין נתניהו · שרת · 2026-09-08

**Status:** patched locally · **deploy = parent** (executor must not deploy)  
**phase:** `orchestrator-v0-b`

## Before (בודק)
- G1 נתניהו flaky: `need_context` / `common_name` **or** `dossier` without Q43723 (`mode=google`, scenario=stranger)
- Label sometimes `בנימין+נתניהו` (query `+` not normalized)
- Under wiki 429/timeout, `searchHe` throw aborted **entire** `wikiPath` → no Wikidata fallback
- Clearing `softAmbiguous` for any 2-token name on 429 forced Gemini faces for **דני כהן** (regression)

## Root causes
1. `wikiPath`: HE search 429 threw → skipped WD celeb recovery  
2. Query `+` → broken title match  
3. Early `need_context` / softAmbiguous flip under 429 too aggressive for celebs **and** unsafe for common HE surnames when cleared blindly  
4. `decideStage` could imply known-ish dossier without QID

## After (this patch + parent common-surname gate)
| Area | Change |
|------|--------|
| `normalizePersonQuery` / `normNameTokens` | `+` → space |
| `wikiPath` | catch `searchHe` 429; continue; WD fallback under rate-limit miss (block only if clear personish harvest ≥2) |
| `wikiPathFromQid` + Stage B | on wiki 429, unique strong `wd-Q*` (and **not** `isCommonHeBareName`) → hydrate QID dossier |
| mode guard | never `mode=wiki`/`wiki+google` without `qid` → `google` |
| `decideStage` | dossier `known` only with QID / wikiCommitted; default dossier needs commitOk or wiki QID |
| **Parent** | `isCommonHeBareName` + force softAmbiguous / early need_context / hard safety for דני כהן; Gemini-on-429 only if `!commonHeBare` |

## Danny Cohen KEEP
- Bare `דני כהן` → `need_context`, 0 faces (common surname set + early exit + hard safety)
- Stage B WD hydrate explicitly skipped when `commonHeBare`

## Checks
- `node --check` api/lookup.js + orchestrator.js OK  
- `node api/lib/orchestrator.test.mjs` → **32 passed**

## Deploy / smoke
**Not run by executor** — parent deploys + smoke 3× Netanyahu nocache + 1× Danny.
