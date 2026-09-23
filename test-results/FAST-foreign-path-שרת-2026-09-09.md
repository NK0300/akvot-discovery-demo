# FAST foreign / Latin path · שרת · 2026-09-09

**Status:** code ready on box · **NOT deployed — waiting CoS GO**  
**Project:** פרויקט א / akvot-simple-demo people search (`/workspace/akvot-quick-demo`)  
**ארכיטקט contract applied:** Stage B maxMs **≤4s** (latin bare **3500**, else **4000**) — not 5–7s.

---

## Diagnosis (prod measured 2026-09-09)

| Case | Observed | Root cause |
|------|----------|------------|
| **John Smith** bare | ~12s, `uiState=need_context`, wiki~2.8s, gemini~147ms, enrich~162ms → **~9s gap** | Soft-ambiguous Latin still ran **Stage B** (ORCID up to **3× serial ~4200ms**) + Gemini branch after wiki disambig |
| **Emily Watson Melbourne nurse** (ctx baked into `q`) | hit **hardDeadline 45s**, wiki=0 gemini=0 | Stuck inside **wikiPath** (retries) before `timings.wiki` assigned |
| **דני כהן** | ~0.4s need_context ✓ | Must stay (common HE bare early exit / gates) |

---

## Changes

### 1) `api/lib/stageB.js`

- **`orcidSearch`:** no `ctx.org` → **1** ORCID query only (prefer `given-and-family-names`). With org → **≤2** (name+org, bare). Serial OK.
- **Bare timeouts (no org):** ORCID/OL/WD **3500**, VIAF **2800**; org path keeps prior higher timeouts where applicable.
- **`registryDiscover({ …, maxMs })`:** optional budget. If set, `Promise.race` vs timeout → `{ candidates:[], sources:[], notes:['stageB_budget'] }` (no hang).

### 2) `api/lookup.js`

**A) Latin bare softAmbiguous → early `need_context`** after wiki, **before** Stage B await / Gemini:

- Condition: `latinForeign && softAmbiguous && !ctx.any && !forceGoogle && !wikiExactHit && !wiki?.seeded && !(wiki.found && wiki.qid)`  
  (also when `wiki.ambiguous` / `clearlySoftAmbiguous` under the same guards)
- Same early payload style as HE common (`attachOrchestratorFields`, scrub, stream-aware). `decideStage` → `common_name` / scenario `foreign`.
- **Does not** early-exit on `ctx.any` / phone / email / focus, nor HE celebs / `wiki.seeded`.

**B) wikiPath budget ~5500ms** for Latin / long / obscure (`Promise.race` → `{ found:false, ambiguous:true, error:'wiki_budget', note:'wiki path budget' }`). HE celeb **seed** path (`wikiPathFromQid` race) untouched. On `wiki_budget`, skip 429 retry; latinQ does not burn retry after budget.

**C) Stage B when still wanted** (ctx / QID recovery / wikiRateLimited / …):

- `maxMs: latinForeign && !ctx.any ? **3500** : **4000**` (ארכיטקט ≤4s — **not** 5–7s).
- `timings.stageB` recorded via `awaitStageB()` around awaits.

**D) Gemini**

- Latin bare softAmb → early exit (A); belt branch `softAmbiguous && !ctx.any && !forceGoogle` skips Gemini.
- **With `ctx.any`:** Stage B **first**; if **≥2 evidenced** → candidates early (**no** Gemini / no empty need_context regression). Gemini **only** if &lt;2 evidenced — **short one-shot** cap (~3–5.5s Latin).

**E) Intact:** `hardDeadlineTimer` / `safeJson` / `wiki.seeded` / Cohen (`isCommonHeBareName`) gates.

---

## KEEP / IMPROVE

| KEEP | IMPROVE |
|------|---------|
| דני כהן → need_context (early HE bare) | John Smith bare → need_context **without** ORCID×3 / Gemini (target **≤5s ideal / ≤8s max**) |
| נתניהו / seeded celebs (`wiki.seeded`, QID seed) | Emily-style long Latin → wiki capped ~5.5s (no 45s hang) |
| A–D orchestrator contract / evidence gate | Smith+IBM+NY: Stage B ≤4s first; ≥2 evidenced → candidates |
| hardDeadline JSON / no HTML 504 path | `timings.stageB` visible for prod diagnosis |

---

## How to smoke (after CoS GO deploy)

1. **`q=John Smith`** (bare) → `uiState=need_context`, **0 faces**, total **≤8s** (ideal ≤5s); no long Stage B/Gemini in timings.
2. **Emily + ctx** if params exist (`city`/`role`/`org`) → finishes under deadline; Stage B ≤4s; if ≥2 evidenced → candidates. If ctx only in `q` → wiki_budget / early need_context, not 45s.
3. **`q=דני כהן`** → need_context ~fast (regression forbidden).
4. **`q=נתניהו` / בנימין נתניהו** → dossier / seeded path (regression forbidden).
5. Optional: **אורלי לוי** / עמיר פרץ → `wiki.seeded` dossier still OK.

Local units (no network deploy):

```bash
node api/lib/orchestrator.test.mjs
# → 32 passed, 0 failed
```

---

## Verify

- `node --check api/lib/stageB.js` OK  
- `node --check api/lookup.js` OK  
- `node api/lib/orchestrator.test.mjs` → **32 passed, 0 failed**  
- **No vercel deploy**

---

## Risks for ארכיטקט review

1. **Latin bare early exit** is aggressive: any Latin softAmbiguous without ctx skips Stage B entirely (speed win). Rare Latin names that wiki marks ambiguous will ask for context instead of showing thin registry lists — intentional per product (need_context).
2. **wiki_budget 5.5s** may return before full disambig harvest → more `ambiguous`/need_context on slow wiki days; better than 45s hang.
3. **Stage B ≤4s** may yield fewer ORCID/VIAF hits under load; ctx path still prefers ≥2 evidenced before Gemini — may fall through to short Gemini more often when registries are slow.
4. Operator-precedence fix applied on ORCID timeout (`(bareTimeouts \|\| !org) ? 3500 : 4200`).
5. End-to-end latency not measured against live prod in this pass (local code + units only).

**Not deployed — waiting CoS GO.**
