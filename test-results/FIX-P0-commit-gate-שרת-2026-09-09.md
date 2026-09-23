# FIX P0-1 / P0-2 — Domain commit gate · שרת · 2026-09-09

**Status:** unit green · **NO deploy** (await GO)  
**Prod bug:** dpl_5N3G — Smith+ctx / G11-email → dossier+QID+faces  
**Root cause:** `api/lookup.js` cleared `softAmbiguous` on any wiki QID → `decideStage` wikiExact → dossier.

## What changed

### A) `api/lib/orchestrator.js` — single Domain gate
- Added **`mayCommitDossier({ q, wiki, softAmbiguous, sources, ctx, focus, candidates })`** → `{ ok, reason }`
- Alias **`canCommitIdentity = mayCommitDossier`** (ארכיטקט naming)
- Rules (Domain-first):
  1. `focus` → ok
  2. `wiki.seeded && qid && !ambiguous` → ok
  3. **email/phone ≠ identity** — never wiki-only; ok only if `evidenceScore≥0.75` **AND** org/city match in https blob **AND** `≥2` https sources
  4. `softAmbiguous` → false
  5. Latin without seed → ok only with evidence≥T + org/city/country match when those fields exist + ≥2 https; bare Latin → false
  6. HE: `wiki.found && qid && !ambiguous && !softAmbiguous` → ok (celebs)
  7. Else strong evidence (same ≥T + org/city + ≥2 https) or false
- **`canCommitWithoutFocus`** delegates to `mayCommitDossier` — **removed** blanket `if (wikiCommitted) return true`
- **`decideStage`**: dossier only if `mayCommitDossier.ok`; wiki QID + !commit → candidates (≥2 evidenced) / need_context / thin — **never** dossier+faces
- Identifier scenario never flips to `known` via wikiCommitted (phone/email checked first in `classifyScenario`)
- **`COMMON_HE_SURNAMES` / `isCommonHeBareName`** remain sole SoT here

### B) `api/lookup.js` — stop overriding Domain
- Removed local `COMMON_HE_SURNAMES` + `isCommonHeBareName`; import `{ isCommonHeBareName, mayCommitDossier }` from orchestrator
- Final stage: **do not** clear `softAmbiguous` merely because wiki has QID  
  - `commit = mayCommitDossier(...)`; `wikiCommitted = commit.ok && !!wiki.qid`  
  - clear softAmbiguous only when `wiki.seeded && commit.ok`
- email/phone + wiki + !commit → ambiguous mode, `photo: null`, no QID faces
- `allowBroadImages` requires `!softAmbiguous && enrichCommit.ok`
- Refine / `shouldReturnCandidates` use Domain commit, not bare QID
- Early exits already call `attachOrchestratorFields` after `decideStage` (kept)

### C) Tests `api/lib/orchestrator.test.mjs`
- **46 passed, 0 failed** (`node api/lib/orchestrator.test.mjs`)
- New: Smith+org/wikiQID softAmb → NOT dossier; Smith+email → NOT dossier + identifier; נתניהו/אורלי לוי seeded → dossier; email/phone alone false; seeded true; Latin bare+QID → NOT dossier

## KEEP (do not regress)
- דני כהן bare → need_context + 0 faces (only `wiki.seeded` bypass)
- נתניהו / אורלי לוי seeded → dossier
- Latin bare early need_context
- hardDeadline / JSON / scrub / SSRF / CSP
- A–D uiState contract

## Smoke after GO (no deploy from this task)
1. `q=דני כהן` → `need_context`, photo null, images []
2. `q=בנימין נתניהו` / `q=נתניהו` → `dossier` + QID
3. `q=אורלי לוי` → `dossier` (seeded)
4. `q=John Smith` bare → `need_context` (fast)
5. `q=John Smith` + org/city (no focus) → `candidates|thin|need_context` — **not** dossier+faces
6. `q=John Smith` + email (G11) → **not** dossier+faces; scenario identifier
7. Confirm `allowBroadImages` false on softAmbiguous paths

## Files changed
| File | Change |
|------|--------|
| `api/lib/orchestrator.js` | `mayCommitDossier` / `canCommitIdentity`; rewrite commit + `decideStage` |
| `api/lookup.js` | import Domain gate; delete HE duplicate; final-stage + wiki/email paths |
| `api/lib/orchestrator.test.mjs` | +14 P0 asserts (32 → 46) |
| `test-results/FIX-P0-commit-gate-שרת-2026-09-09.md` | this report |

## Residual risks
1. HE celeb with **softAmbiguous still true** and **no `wiki.seeded`** at final stage will not auto-clear softAmbiguous (by design) — rely on seed / earlier clears; smoke נתניהו after GO.
2. Integration path `/api/lookup` not unit-tested end-to-end here — orch gates green; prod smoke still required.
3. Evidence org/city match is substring-on-https-blob (same as `evidenceScore`) — false positives possible if org token is common; P1 evidence entity-match still open.
4. No deploy — prod dpl_5N3G still has the bug until GO + deploy.
