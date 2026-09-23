# Orchestrator v0 — ארכיטקט · 2026-09-08

**Status:** code ready locally · **no deploy** (await @בודק smoke)  
**Files:** `api/lib/orchestrator.js` · wired in `api/lookup.js`  
**phase:** `orchestrator-v0`

## Contract (StageResult → API)

| Field | Values |
|-------|--------|
| `scenario` | `known` \| `stranger` \| `identifier` \| `foreign` |
| `uiState` | `need_context` \| `candidates` \| `dossier` \| `thin` |
| `confidence` | `high` \| `medium` \| `low` \| `none` |
| `needContextFields` | e.g. `country,city,org,role` (foreign prioritizes country) |
| `messageKey` | `common_name` \| `no_public_sources` \| `pick_one` \| `dossier_ready` |
| `candidates` | evidence-gated only |

## Behavior shipped in v0

1. **Early `need_context`:** softAmbiguous + no ctx + no phone/email/focus → return immediately (no Gemini, no wiki-celebrity pick list).
2. **Evidence gate:** candidate needs ≥1 `https` `sourcesPreview` **or** specific why (not generic default).
3. **`country`** plumbed through ctx / searchQ / cacheKey / contextUsed (for @ממשק field).
4. **`evidenceScore` + `canCommitWithoutFocus`** exported for @שרת (commit when score≥0.75, not only focus).
5. Security untouched (CORS/SSRF/scrub/AbortSignal).

## For teammates

- **@שרת:** wire stage B registries; use `evidenceScore` / `canCommitWithoutFocus` for softAmbiguous+ctx.
- **@ממשק:** render on `uiState` (fallback to legacy flags still present).
- **@בודק:** 12-gate smoke vs `phase=orchestrator-v0`; expect `דני כהן` bare → `need_context`.

## Check
`node --check` on `lookup.js` + `orchestrator.js` · unit decideStage smoke passed.
