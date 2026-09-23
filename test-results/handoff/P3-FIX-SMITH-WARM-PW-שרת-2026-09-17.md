# P3 FIX · Smith+ctx WARM pretty-wrong · שרת · 2026-09-17

**STATUS:** FIXED local · units green · **NO dpl** (alias stays `dpl_Crsqe…` until Gate)

## STATUS

| Field | Value |
|-------|--------|
| STATUS | LOCAL FIX DONE · awaiting Gate / harness |
| WHAT | Class-level Domain revalidate on cache HIT + never cacheSet illegal dossier + live SoT harden for Smith-class |
| EVIDENCE | this file · `api/lib/orchestrator.js` · `api/lookup.js` · `api/lib/orchestrator.test.mjs` (108 pass) |
| MEASURED | Unit: 108 passed, 0 failed (`node api/lib/orchestrator.test.mjs`) |
| NOT | dpl / Vercel deploy · latency optimize · EXPECTED rewrite · Assaf-only if · prod re-harness |
| RISKS | Prod alias still `dpl_Crsqe…` can PW under WARM until Gate deploys; in-flight instances may hold old poisoned memory until recycle |
| NEXT | Gate → dpl → re-harness `C-smith-ctx-post` COLD+WARM N≥30 · pw=0 hard |

## WHAT

### Root (hypotheses)

| H | Claim | Verdict |
|---|--------|---------|
| H1 | Live path can still emit `uiState=dossier` for Smith-class+ctx after Gemini/enrich despite `mayCommitDossier` false | **Partially confirmed** — belt at `lookup.js` set `softAmbiguous` but **did not strip** primary `qid`/faces; `attachOrchestratorFields` left `qid`/`photo` on `candidates`; `decideStage` could see `softAmbiguous=false` + rich wiki. Class soft belt + revalidate + attach clear close the gap. |
| H2 | `cacheGet` returns stored payload **without** re-running Domain / Smith-class checks — one bad live result poisons WARM | **Confirmed** — HIT returned verbatim `{...hit, cached:true}`. |
| H3 | `cacheSet` stores dossier payloads for Smith-class that should never be cached as dossier | **Confirmed** — stored whatever live assembled, including illegal dossier. |

### Fix (class-level)

1. **`revalidateDomainSafePayload`** (`api/lib/orchestrator.js`) — shared helper:
   - Re-runs `mayCommitDossier` + Smith-class / seed-adjacent / HE-bare caution from `q`+`ctx`+payload.
   - Illegal dossier → demote to `candidates` | `need_context` | `thin`; clear `qid` / `photo` / `images`.
2. **Cache HIT** (`api/lookup.js`): always revalidate before return; if demoted, **repair** cache entry (`HIT-REVALIDATED`).
3. **cacheSet**: only after Domain-safe payload; **skip** cache entirely if still illegal dossier (Smith / seed-adj / `!mayCommit`).
4. **Live SoT**:
   - Smith-class belt now **strips** primary qid/faces (was empty `if` body).
   - Post-`attachOrchestratorFields` revalidate belt.
   - `decideStage`: `classSoft` forces Smith / seed-adjacent into soft commit path; `commitOk` requires `!classSoft`.
   - `attachOrchestratorFields`: `candidates` clears `qid`/`photo`/`images`.

No Assaf-only branches. No Q1701775 hardcode (tests may name it as the known PW fixture).

## EVIDENCE

- Correlate: `test-results/handoff/P3-CORRELATE-SMITH-WARM-PW-ארכיטקט-2026-09-17.md`
- Harness: `test-results/perf/PERF-HARNESS-n30-resume-0012-5804c63f.md` (WARM 9/30 dossier Q1701775)
- Units: `node api/lib/orchestrator.test.mjs` → **108 passed, 0 failed**
  - Existing Smith softAmb / Smith+ctx `mayCommit` false kept
  - NEW: poisoned John Smith+IBM dossier → non-dossier via helper
  - NEW: decideStage/attach cannot yield dossier for Smith-class without seed
  - Seeded celeb dossier still passes revalidate

## MEASURED / NOT

| | |
|--|--|
| MEASURED | Local units 108/108 |
| NOT MEASURED | Prod/alias harness after fix (no dpl this turn) |

## RISKS

- Until Gate deploys, public alias remains baseline `dpl_Crsqe…` (WARM PW still possible).
- Serverless memory cache of old build evaporates on recycle; CDN `s-maxage` is separate (correlate said server `cached:true`, not CDN-primary).

## NEXT

1. Chief/Gate approve → dpl (not this task)
2. Re-run Smith POST COLD+WARM N≥30 · expect `candidates` only · pw=0
3. Keep EXPECTED frozen (Q1701775 = PW)

## Files touched

- `api/lib/orchestrator.js` — `revalidateDomainSafePayload`; decideStage classSoft; attach candidates clear faces/qid
- `api/lookup.js` — HIT revalidate + repair; live belt strip; cacheSet deny illegal dossier
- `api/lib/orchestrator.test.mjs` — P3 unit block
- `test-results/handoff/P3-FIX-SMITH-WARM-PW-שרת-2026-09-17.md` — this STATUS
