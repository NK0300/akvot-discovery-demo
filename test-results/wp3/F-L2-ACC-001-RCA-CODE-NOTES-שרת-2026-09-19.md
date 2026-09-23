# F-L2-ACC-001 · RCA CODE NOTES (שרת) · 2026-09-19

**Mode:** RCA ONLY · **NO CODE CHANGES · NO PATCH · NO DEPLOY**  
**Scope:** Stage-B / open-registry / Wikidata → `candidates[]` emit for POST John Smith + IBM/NY/US  
**Evidence aligned:** Acc×3 quiet r1 = OL+VIAF only (PASS); r2 = `wd-Q1701775` #1 politician label, `qid=null`, `faces=false`, ui=candidates (FAIL/pw=1)

---

## 1. Candidate emit path (Stage-B → response)

| Step | File:line | Symbol |
|------|-----------|--------|
| Entry POST handler | `api/lookup.js:3100+` | `cacheKey` / `nocache` / main pipeline |
| Stage-B trigger | `api/lookup.js:3521–3532` | `stageBMaxMs`, `wantStageB`, `registryDiscover({… maxMs })` |
| Registry fan-out | `api/lib/stageB.js:318–340` | `registryDiscover` → `orcidSearch` / `openLibrarySearch` / `viafSearch` / `wikidataSearch` in parallel |
| WD entity → candidate | `api/lib/stageB.js:244–288` | `wikidataSearch` → `id: wd-${QID}`, label+desc, `why`, `sourcesPreview`, `score` |
| Merge + rank | `api/lib/stageB.js:290–311` | `mergeCandidates` — sort by `score` desc, dedupe by label/id |
| Evidence filter | `api/lib/stageB.js:356` + `api/lib/orchestrator.js:124–126` | `filterEvidencedCandidates` (URL/why only — **no QID denylist**) |
| Early candidates return | `api/lookup.js:3663–3722` | softAmbiguous+ctx: if `bEvidenced.length >= 2` → `attachOrchestratorFields` with `qid: null`, `candidates: bEvidenced`, `phase: orchestrator-v0-b` |
| Final attach | `api/lib/orchestrator.js:687–705` | `attachOrchestratorFields` — on `uiState==='candidates'` forces `faces:false`, `qid:null` |

**Acc r2 hit path:** early Stage-B candidates exit (`lookup.js:3663–3722`), not dossier commit.

---

## 2. Denylist / poison-QID / Smith-class — **scope = commit only**

| Guard | File:line | Applies to candidates list? |
|-------|-----------|------------------------------|
| `isCommonLatinAmbiguousName` (Smith-class) | `orchestrator.js:97–103` | Classifies name; does **not** strip QIDs from `candidates[]` |
| `mayCommitDossier` Smith deny | `orchestrator.js:238–241` (`latin_common_ambiguous`) | **Dossier commit only** — blocks primary `qid`/faces |
| `isTrustedWikiSeed` | `orchestrator.js:27–31` | Seed SoT for commit bypass; John Smith ∉ known → fake seed rejected |
| `revalidateDomainSafePayload` | `orchestrator.js:562–684` | Demotes illegal **dossier** → candidates/need_context/thin; clears primary `qid`/`faces`; **keeps** `candidates[]` (evidenced) |
| Smith belts in lookup | `lookup.js:4344–4396` | Clears **primary** `payload.qid` / `faces` / photos — **not** `candidates[i].id` |
| Q1701775 hard denylist in `api/` | — | **NONE** (only comments/tests/harness: `lookup.js:2008`, `orchestrator.test.mjs`, Acc scripts) |

**Conclusion:** P0 dossier/seed fix held (`qid=null`, commit blocked). Acc pw=1 is **ranking-leak**: poison QID still emitted as `candidates[0].id` + `sources[].url`.

---

## 3. Faces scrub / faces gate — dossier/demote only

| Gate | File:line | Behavior |
|------|-----------|----------|
| Early Stage-B payload | `lookup.js:3682–3692` | `qid:null`, `photo:null`, `images:[]` |
| Candidates pick screen | `lookup.js:4244–4250` | Clears images/photo; mode=candidates |
| `attachOrchestratorFields` | `orchestrator.js:700–703` | `uiState==='candidates'` → `faces:false`, `qid:null` |
| Enrich broad images | `lookup.js:4041–4051` | `allowBroadImages` requires `mayCommitDossier.ok` — Smith fails → no faces enrich |
| Smith belt | `lookup.js:4377–4392` | Forces `faces:false` if primary qid present |

**Why `faces=0` does not block Acc pw:** Acc treats **any** `Q1701775` in candidates/sources blob as hard pw (see quiet X3 JSON hits on `$.candidates[0].id` + `$.sources[0].url`). Faces gate never filters candidate ranking.

---

## 4. Scoring — how WD wrong-QID outranks OL/VIAF

**`whyFor` city match** — `stageB.js:92–100`:
- For each ctx bit (org, city, …): if `extra` (WD description) contains bit → `match: ${b}`, else `ctx: ${b}`.
- r2: desc contains “New York” → `match: New York`; IBM not in desc → `ctx: IBM`. Matches evidence exactly.

**WD score** — `stageB.js:267–284`:
```
ctxHit = org|city|country substring in `${label} ${desc}`
score = min(0.9, 0.55 + tokenOverlap(q,label)*0.25 + (ctxHit ? 0.12 : 0))
```
John Smith + desc “American politician from New York…” → overlap≈1.0 + ctxHit → **0.9**.

**OL cap** — `stageB.js:205`: `min(0.88, …)` → max **0.88** < WD 0.9.  
**VIAF** — `stageB.js:236`: typically ~0.74–0.77 in Acc samples.

**Merge** — `stageB.js:290–293`: global sort by score → `wd-Q1701775` becomes `candidates[0]` whenever WD search returns that row.

No org/role grounding required for the +0.12 city boost; historic NY politician beats modern OL/VIAF authors for Smith+IBM/NY/US.

---

## 5. Cache / races / intermittency

| Item | File:line | Note |
|------|-----------|------|
| In-memory cache | `lookup.js:75`, `534–550`, `2557–2568` | `Map` + `cacheKeyFor(q\|city\|org\|role\|country\|…)` — **per isolate**, not shared across Vercel instances |
| `nocache:1` | `lookup.js:3106–3111` | `skipCache` → bypasses response cache (`allowCache=false`); Acc quiet uses this |
| Stage-B budget race | `stageB.js:378–390` | `Promise.race(discovery, maxMs)` → `stageB_budget` empty if overrun |
| Parallel registries | `stageB.js:334–340` | WD empty/timeout/null → OL+VIAF only (r1); WD success → poison top (r2) |

**Quiet Acc timings:** r1 `stageB≈1841` OL-top; r2 `stageB≈736` WD-top — not load-only. With nocache, intermittency = **live Wikidata `wbsearchentities` flake** (empty vs politician-first), optionally amplified by multi-instance / wiki429 stress — not sticky response-cache replay.

---

## 6. Hypothesis (why Q1701775 appears intermittently with politician label)

1. Stage-B always calls `wikidataSearch("John Smith")` when `wantStageB` (Smith+ctx → true).
2. When WD returns rows, Q1701775 (WD label: American politician from New York 1752–1816 — Acc’s classic poison QID) gets `ctxHit` from city **New York** → score **0.9** → outranks OL (≤0.88) / VIAF.
3. When WD search fails/empties within timeout, merge is OL+VIAF only → Acc PASS.
4. Commit/faces guards correctly keep `qid=null` / `faces=false` / ui=candidates — so SoT/dossier P0 holds; Acc still fails on candidate/source presence.

---

## 7. Proposed fix bullets ONLY (do not implement)

1. **Candidate-scope poison denylist:** drop `wd-Q1701775` (and Acc-forbidden QIDs) from Stage-B `candidates[]` + `sources[]` before emit — not only dossier commit.
2. **Smith-class Stage-B policy:** for `isCommonLatinAmbiguousName`, either exclude Wikidata from registry fan-out, or require **org** match (not city-alone) for WD `ctxHit` / top rank.
3. **Cap WD vs OL:** do not let WD city-substring boost exceed OL/VIAF ceiling for ambiguous Latin names (e.g. WD max 0.85 without orgHit).
4. **Historical/politician demotion:** when ctx.org present and desc lacks org, demote WD politician/historical hits below registry authorities.
5. **Emit scrub:** before `attachOrchestratorFields` early-B return, strip any candidate/source URL/id containing denylisted QIDs (Acc-aligned).
6. **Optional observability:** Stage-B notes `wikidata_empty` vs `wikidata_n` to quantify flake rate under quiet Acc.

---

## 8. Confirm zero code changes

- Product tree under `api/` **not modified** this turn.
- This file is documentation only under `test-results/wp3/`.
