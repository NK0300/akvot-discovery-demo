# ACCURACY_AUDIT — דיוק · 2026-09-09

| Field | Value |
|-------|-------|
| AGENT | דיוק (Accuracy) |
| DATE | 2026-09-09 · Asia/Jerusalem |
| MODE | Discovery Hour 0–1 · **READ-ONLY** (no product code changes) |
| SUT | `akvot-simple-demo` · prod `dpl_5N3G` · phase `orchestrator-v0-b` |
| SCOPE | Entity resolution · evidence · confidence · FP / pretty-wrong |
| SOURCES | Public only · **no** Sync.me / Truecaller / caller-ID |

**Aligned with:** `AUDIT-STAGE0-דיוק` · `BATTERY-250-criteria-דיוק` · `SMOKE-foreign-path-בודק` · `ARCHITECTURE_AUDIT` · `BACKEND_AUDIT` · `QA_AUDIT` · `api/lib/orchestrator.js` · `api/lookup.js` (skim)

**Verdict (startup):** Safety on bare common names is largely KEEP. **Identity over-commit** on Smith+ctx and G11-email remains the P0 trust break (worse than thin). Soft battery PASS ≠ accuracy PASS.

---

## A. Pipeline map (INPUT → NORMALIZATION → MATCHING → SCORING → DECISION → UI)

```
INPUT
  q | phone | email
  + ctx: city, org, role, country, context, focus
  + flags: stream, nocache
       │
       ▼
NORMALIZATION
  normalizePersonQuery(q/focus)
  pickContext / buildSearchQ (name ≠ phone/email as wiki title)
  phone normalize + variants; scrub later
  isLatinScript / isCommonHeBareName
       │
       ▼
MATCHING (harvest)
  early: Cohen bare → need_context (skip wiki/Gemini)
  early: lookupKnownHeQid → wiki.seeded hydrate
  wikiPath (HE/EN Wikipedia + Wikidata + Commons)
  softAmbiguous from disambig / sibling alts
  Stage B registries (ORCID / VIAF / OL / WD) — optional
  Gemini googlePath (forceGoogle = phone|email|focus) — optional
  enrich page scan / images (gated)
       │
       ▼
SCORING
  candidate.score + sourcesPreview / why
  candidateHasEvidence / filterEvidencedCandidates
  evidenceScore({ sources, ctx, candidate })
  pagePreferScore / hostKind (IL bias risk)
       │
       ▼
DECISION (Domain)
  mayCommitDossier / canCommitWithoutFocus / canCommitIdentity
  classifyScenario → known | stranger | identifier | foreign
  decideStage → uiState + confidence + messageKey
  attachOrchestratorFields (strip faces on need_context|thin)
       │
       ▼
UI (index.html)
  need_context | candidates | dossier | thin
  photo/images only when dossier (or legacy modes) allowed
```

**Application note:** `lookup.js` (~4270 LOC) still owns branching order (early exits, refine, enrich). Workspace wires `mayCommitDossier` at several points; **prod smoke on `dpl_5N3G` still showed pretty-wrong** — treat measured FPs as live until contract smoke is green on the deploy under test.

**Measurable stages (timings):** `wiki` → `stageB` → `gemini` → `enrich` → `total` (hard JSON deadline ~45s).

---

## B. Entity identification

| Signal | How identified | Strength as *identity* |
|--------|----------------|------------------------|
| **wiki.seeded** + QID | Manual `lookupKnownHeQid` / `seedDossierFromKnown` | **Strong** — only intentional celeb bypass of stranger/Latin caution |
| **HE wiki exact** | `wiki.found && qid && !ambiguous` (`he_wiki_exact` in `mayCommitDossier`) | Medium–strong for unambiguous celebs; **weak** if harvest wrongly clears ambiguous |
| **Wikidata QID (unseeded)** | WD search / sitelinks / Stage B `wd-*` | **Not identity alone** — must pass Domain gate |
| **Latin bare name** | EN wiki / WD fan-out | Almost never identity → `need_context` early |
| **org / city / country / role** | Context bias + substring match in source blob | Bias / evidence features — **not** strongId |
| **email / phone** | `ctx.email` / `ctx.phone` → scenario `identifier` | **Search trigger only** — must **never** prove person |
| **focus** | User picked a candidate / deepen | Explicit user confirmation → commit allowed |
| **Gemini grounding links** | Public SERP chunks | Evidence candidates; advisory until re-`decideStage` |
| **Stage B registries** | ORCID / VIAF / OpenLibrary / WD | Candidate cards + https previews |

**Name matching mechanics (skim):**
- Token / exactish / Latin↔HE title cover (`titleExactish`, `titleExactishOrLatin`, `commonNameSiblingAlts`)
- Soft-ambiguous when ≥2 personish parenthetical siblings or EN disambiguation titles
- Partial-token noise possible (e.g. «דני בריאן» near «דני כהן») — accuracy FAIL if shown as credible pick

**Normalization:** `normalizePersonQuery` trims/collapses; wiki title never taken from phone/email (`wikiQ = focus || q`).

---

## C. Candidates / empty / conflict / missing

| Situation | Intended Domain behavior | Observed / risk |
|-----------|--------------------------|-----------------|
| **Multiple candidates** | `uiState=candidates` only if `filterEvidencedCandidates` ≥2 (or ≥1 with ctx); `confidence=low`; **0 faces** | Often wiki-homonym celebs with weak/generic why → pretty **list** (safe faces, wrong population) |
| **No candidate** | With ctx → `thin` + `no_public_sources`; without → `need_context` | Product FAIL when Gemini spent ~24s and list unchanged / empty sources (RETHINK B✗2) |
| **Conflict (softAmbiguous)** | Never auto-dossier; ask context or pick | KEEP when bare; **broken** when Application historically committed wiki #1 anyway |
| **Missing data** | Honest `thin`; scrub identifiers; phone-only weak → thin | KEEP G10-phone |
| **Identifier + name** | scenario `identifier`; commit only `strongEvidence` (es≥T ∧ org/city ∧ ≥2 https) | **G11 FAIL on prod:** email treated as proof → dossier+faces |
| **q-string vs params** | Same person+ctx should same gate | Smith `"IBM New York"` in `q` → need_context; org/city **params** → dossier Q1701775 (SMOKE) — **contract split** |

**Candidate build:** wiki alts + Stage B + google; then evidence filter. `shouldReturnCandidates` still demotes pick-screen when `wikiCommitted && !softAmbiguous` — safe **only if** `wikiCommitted` equals Domain `mayCommitDossier.ok`.

---

## D. Scoring & confidence vs evidence

### D.1 `evidenceScore` (orchestrator)

```
hosts(https) * 0.15  (cap 0.45)
+ org substring in source blob   +0.25
+ city substring                 +0.15
+ country substring              +0.10
+ candidate.score * 0.2          (cap 0.20)
→ clamp [0,1], round 0.01
```

**Suggested auto-dossier T ≈ 0.75** plus `hasOrgCityEvidenceMatch` and `httpsN ≥ 2` inside `mayCommitDossier`.

### D.2 Does confidence reflect evidence?

| `confidence` from `decideStage` | When | Reality |
|---------------------------------|------|---------|
| `high` | dossier + wiki QID (seeded / HE exact) | **Stage label**, not calibrated P(correct person) |
| `medium` | dossier via evidence / non-seed | Still not probability; substring match can inflate |
| `low` | candidates | Honest “pick” — but UI cards can look high-trust |
| `none` | need_context / thin | Correct for “we did not commit” |

**Gap:** Confidence is **UI-state ordinal**, not evidence-calibrated identity probability. Pretty-wrong dossiers still report `high`/`medium`.

### D.3 Evidence weaknesses (accuracy)

1. **Substring org/city** — “IBM” / “New York” anywhere in titles/URLs counts; no requirement that **name + org co-occur in one independent source**.
2. **Host counting** — wikipedia.org + wikidata.org alone add ~0.30 without proving *this* John Smith.
3. **No independent-source diversity rule** beyond raw https count (same publisher family OK).
4. **`candidate.score`** can pad toward T without contextual proof.
5. **IL bias** — `pagePreferScore` / prompts boost `gov.il` / `.il` (RETHINK D✗5) → foreign queries can look “evidenced” with wrong locale.

---

## E. Decision gates (dossier vs need_context vs candidates vs thin)

### E.1 Scenarios (`classifyScenario`)

| Order | Condition | Scenario |
|-------|-----------|----------|
| 1 | phone \|\| email | `identifier` |
| 2 | wikiCommitted \|\| (rich ∧ qid ∧ !ambiguous ∧ !softAmbiguous) | `known` |
| 3 | Latin script \|\| country ctx | `foreign` |
| else | | `stranger` |

Identifier is sticky in `decideStage` (must not flip to `known` via bare `wikiCommitted`).

### E.2 Single Domain commit gate — `mayCommitDossier` (intended SoT)

| Allow dossier+faces when | Reason code |
|--------------------------|-------------|
| `focus` set | `focus` |
| `wiki.seeded` ∧ qid ∧ !ambiguous | `wiki_seeded` |
| identifier ∧ strongEvidence | `identifier_evidence` |
| !softAmbiguous ∧ HE wiki exact | `he_wiki_exact` |
| Latin ∧ all present ctx fields match blob ∧ es≥T ∧ https≥2 | `latin_evidence` |
| strongEvidence (non-wiki path) | `evidence` |

| Block | Reason |
|-------|--------|
| email/phone without strongEvidence | `identifier_blocks_wiki` |
| softAmbiguous | `soft_ambiguous` |
| Latin bare / weak ctx match | `latin_bare` / `latin_weak` |
| else | `no_commit` |

Aliases: `canCommitIdentity` = `mayCommitDossier`; `canCommitWithoutFocus` delegates to it (legacy evidence-only path still requires org/city + ≥2 https).

### E.3 `decideStage` → uiState (summary)

1. Phone-only weak → **thin**
2. Common HE bare ∧ !ctxAny ∧ !seeded → **need_context** (HARD SAFETY)
3. commitOk ∧ wikiHasQid → **dossier**
4. wikiHasQid ∧ !commitOk → candidates (≥2 evidenced) \|\| need_context (!ctx) \|\| thin
5. softAmbiguous ∧ !ctx → **need_context**
6. commitOk ∧ content → **dossier** (medium/high)
7. returnCandidates / softAmbiguous with evidenced ≥2 → **candidates**
8. thin / default → **thin** or **need_context**

`attachOrchestratorFields`: on `need_context`/`thin` → `photo=null`, `images=[]`; need_context also clears sources.

### E.4 Application residual risk

Even with Domain helpers imported, accuracy fails if any branch sets `qid`+`photo`+rich mode **before** gate, or clears `softAmbiguous` under 429 / rich heuristics. War Room P0 = **one** gate immediately before faces attach + locked HTTP contract.

---

## F. Known false positives & failure modes (ACC-01…)

### ACC-01 — Smith+org/city params → pretty-wrong dossier+faces

| | |
|--|--|
| **SEVERITY** | **P0 / CRITICAL** |
| **IMPACT** | User trusts wrong identity (Q1701775) with portrait — worse than empty thin; breaks product trust |
| **ROOT CAUSE** | Context params open wiki/Gemini path; commit historically allowed via rich/wikiCommitted / weak evidenceScore substring; Application could finish dossier before unified gate |
| **RECOMMENDED FIX** | Single Domain commit: Smith+ctx → `candidates`\|`need_context` **without faces** unless `evidenceScore≥T` with ≥2 **independent** sources that co-mention name+org/city; lock HTTP contract (params **and** q-string) |
| **EVIDENCE** | SMOKE-foreign-path: dossier · Q1701775 · faces · ~9.1s · dpl_5N3G |

### ACC-02 — G11 email → dossier+faces (SAFETY CRIT)

| | |
|--|--|
| **SEVERITY** | **P0 / CRITICAL (safety)** |
| **IMPACT** | Email treated as identity proof; attaches Q332377 + faces; 12-gate safety 14/15 · critical 1 |
| **ROOT CAUSE** | Identifier path historically demoted softAmbiguous / forced google then wiki commit; email ∈ ctxAny / strongId semantics leaked into commit |
| **RECOMMENDED FIX** | Hard rule: **email/phone ≠ identity**; `mayCommitDossier` identifier branch only `strongEvidence`; never dossier+faces on email alone; contract test G11 |
| **EVIDENCE** | SMOKE-12gate G11-email · QA-02 |

### ACC-03 — Smith+ctx path flaky (q-string vs params)

| | |
|--|--|
| **SEVERITY** | **P0 / HIGH** |
| **IMPACT** | Regression can “pass” safe q-string path while params still pretty-wrong; hides ACC-01 |
| **ROOT CAUSE** | Dual context channels (`q` blob vs `org`/`city` fields) hit different early-exit / softAmbiguous / Gemini branches |
| **RECOMMENDED FIX** | Normalize ctx once; same gate for both shapes; contract cases for both in CI |
| **EVIDENCE** | SMOKE: q="John Smith IBM New York" → need_context; params → dossier |

### ACC-04 — evidenceScore substring inflation / no entity co-occurrence

| | |
|--|--|
| **SEVERITY** | **P1 / HIGH** |
| **IMPACT** | Auto-commit or high-looking candidates when org/city appears in unrelated titles; false confidence |
| **ROOT CAUSE** | Blob `includes(org)` / `includes(city)` without requiring name+attribute in same source; host diversity weak |
| **RECOMMENDED FIX** | Require ≥2 independent hosts where each matching source also supports name tokens; refuse wiki-homonym-only commit |
| **EVIDENCE** | orchestrator `evidenceScore` / STAGE0 finding #6 |

### ACC-05 — Confidence ≠ calibrated evidence

| | |
|--|--|
| **SEVERITY** | **P1 / MEDIUM-HIGH** |
| **IMPACT** | UI/API `confidence: high` on wrong dossier teaches users to trust FP |
| **ROOT CAUSE** | `decideStage` maps uiState→confidence ordinal only |
| **RECOMMENDED FIX** | Derive confidence from evidenceScore + source independence + seed flag; cap at `low` unless gate reason ∈ {wiki_seeded, focus, latin_evidence, identifier_evidence} |

### ACC-06 — Wiki-homonym / historical disambig as “success”

| | |
|--|--|
| **SEVERITY** | **P1 / MEDIUM-HIGH** |
| **IMPACT** | Obscure/foreign modern person shown 19th-c politicians; soft battery may PASS; accuracy FAIL |
| **ROOT CAUSE** | Matching prefers Wikipedia sibling density; no modern/context prior; soft runner accepts almost any uiState for obscure |
| **RECOMMENDED FIX** | Bare Latin/common → need_context (KEEP); after ctx, candidates must show context evidence or thin; mark `wiki_homonym` explicitly; align battery to `expectPrecise` |
| **EVIDENCE** | BATTERY-250-criteria §3–4 · RETHINK D✗1/D✗2 |

### ACC-07 — Context wasted (Gemini/Stage B without candidate change)

| | |
|--|--|
| **SEVERITY** | **P1 / MEDIUM** |
| **IMPACT** | User waits ~20–30s; same celeb alts / sources=[]; product miss (QA-09) |
| **ROOT CAUSE** | softAmbiguous path may skip or ignore network evidence when rebuilding candidates; evidence filter empty → thin/need_context after spend |
| **RECOMMENDED FIX** | After ctx spend: merge Stage B/Gemini into evidenced candidates **or** early thin; never return pre-ctx wiki-homonym list as post-ctx answer |

### ACC-08 — IL locale bias on foreign queries

| | |
|--|--|
| **SEVERITY** | **P1 / MEDIUM** |
| **IMPACT** | US/EU person “resolved” via `.il` / gov.il ranking → pretty-wrong locale |
| **ROOT CAUSE** | `pagePreferScore` + Gemini prompts prefer gov.il / `.il` |
| **RECOMMENDED FIX** | Locale-aware prefer by `country` / Latin query; do not boost `.il` for non-IL ctx |

### ACC-09 — SoftAmbiguous cleared under wiki 429

| | |
|--|--|
| **SEVERITY** | **P1 / MEDIUM** |
| **IMPACT** | Incomplete harvest → false unique QID / flaky celeb need_context↔dossier |
| **ROOT CAUSE** | Rate-limit branches clear ambiguous for non-common names to recover celebs; can also enable wrong commit if WD #1 wins |
| **RECOMMENDED FIX** | Never treat 429 alts as disambig evidence **or** as uniqueness; seed-first for known HE only; QID recovery only with label/alias verify |

### ACC-10 — Soft battery judge ≠ accuracy criteria

| | |
|--|--|
| **SEVERITY** | **P1 / MEDIUM** |
| **IMPACT** | Metrics (e.g. 196/250) overstate identity quality; pretty-wrong unmarked |
| **ROOT CAUSE** | `run-battery-250.mjs` soft uiState sets vs `BATTERY-250-criteria-דיוק` + `expectPrecise` |
| **RECOMMENDED FIX** | Judge with expectPrecise / must_not faces+dossier; fail historical-disambig-as-success |

### ACC-11 — Partial-token / wrong-population candidate noise

| | |
|--|--|
| **SEVERITY** | **P2 / MEDIUM** |
| **IMPACT** | User picks wrong person from “pretty list” (false choice) |
| **ROOT CAUSE** | Sibling harvest + weak token cover (`דני בריאן` on `דני כהן`) |
| **RECOMMENDED FIX** | Drop partial-token alts; require surname+given cover; optional `kind=wiki_famous_homonym` CTA |

---

## G. KEEP / SAFE behaviors

| KEEP | Why (accuracy + safety) | Evidence |
|------|-------------------------|----------|
| **Cohen bare → need_context · 0 faces** | Common HE must not dossier | SMOKE / G4 · ~0.2s |
| **Celebs dossier via wiki.seeded** | Netanyahu Q43723 etc. intentional | SMOKE PASS |
| **Latin bare → need_context (fast)** | Blocks historical pretty lists as identity | Smith / Emily ~5.9–6s ≤8s |
| **wiki.seeded only bypass** for common-surname celebs | Not random QID | orchestrator + lookup comments |
| **No Sync.me / Truecaller / caller-ID** | `BANNED_PHONE_HOSTS`; phone = public search trigger | G10-phone PASS · BACKEND |
| **Scrub phone/email in payload** | Identifiers not echoed as identity | scrubPayloadIdentifiers |
| **Phone-only weak → thin** | Honest empty | decideStage + lookup |
| **Transliteration mid-tier** (Galon, Merkel, Assaf…) | Correct dossier when QID clear | RETHINK D✓ |
| **Public sources only** | Wiki/WD/registries/Gemini grounding | product policy |
| **COMMON_HE SoT in orchestrator** (workspace) | lookup imports `isCommonHeBareName` — keep single list | lookup.js L971 |

**Do not regress** these while fixing ACC-01/02.

---

## H. Gaps vs production-grade identity resolution

| Capability | Akvot today | Production-grade target |
|------------|-------------|-------------------------|
| Identity proof | Wiki QID / seed / weak SERP | Multi-source entity resolution with blocking keys |
| Evidence | Host count + substring | Name–attribute co-occurrence; independent publishers; temporal consistency |
| Confidence | uiState ordinal | Calibrated score + abstain band |
| Ambiguity | softAmbiguous boolean | Ranked hypotheses + explicit conflict set |
| Identifiers | Email/phone as search | Separate “contact mention” from “person link”; never solo commit |
| Evaluation | Soft battery + ad-hoc smoke | Locked expectPrecise + adversarial FP suite in CI |
| Locale | IL-biased prefer | Query/country-conditioned source prior |
| Human-in-loop | focus deepen | Required for medium confidence; audit trail |
| Negative space | thin/need_context | First-class “unknown person” with explanation |
| Graph / sameAs | Partial WD props | Explicit sameAs / differsFrom between candidates |

Sprint truth: this is a **demo OSINT dossier**, not a full identity graph — accuracy bar is **abstain > pretty-wrong**.

---

## I. Top fixes for War Room (P0 / P1)

Aligned with team: **single Domain commit gate · email/phone ≠ identity · Smith+ctx without evidence → no dossier+faces · unify COMMON_HE**.

### P0

#### I-P0-1 · Enforce single Domain commit gate end-to-end
- **SEVERITY:** P0
- **IMPACT:** Closes ACC-01 / ACC-02 class FPs; stops Application inventing faces
- **ROOT CAUSE:** Split SoT (orch helpers vs lookup branches / legacy wikiCommitted)
- **RECOMMENDED FIX:** Every path that sets photo/images/dossier must call `mayCommitDossier` immediately before attach; if `!ok` → need_context|candidates|thin and strip faces; delete bypasses

#### I-P0-2 · email/phone ≠ identity (hard)
- **SEVERITY:** P0
- **IMPACT:** G11 safety critical → 15/15
- **ROOT CAUSE:** Identifier demotes ambiguity / enables wiki commit
- **RECOMMENDED FIX:** Keep scenario `identifier`; commit only `identifier_evidence`; scrub; contract test synthetic email+common name

#### I-P0-3 · Locked HTTP contract Smith+ctx / Smith+email
- **SEVERITY:** P0
- **IMPACT:** Prevents ACC-03 hide; deploy gate
- **ROOT CAUSE:** No CI-locked expectPrecise for pretty-wrong
- **RECOMMENDED FIX:** `contract-identity-p0.mjs` (or equiv) must PASS: Smith+ctx (params **and** q-string) → candidates|need_context **0 faces**; Smith+email → thin|need_context|candidates **0 faces**; Cohen bare KEEP; celebs KEEP

#### I-P0-4 · COMMON_HE single SoT (confirm deploy)
- **SEVERITY:** P0 (policy drift)
- **IMPACT:** Cohen/bare gate mismatch across layers
- **ROOT CAUSE:** Historical duplicate sets (STAGE0); workspace already points lookup → orchestrator
- **RECOMMENDED FIX:** Keep orchestrator export only; snapshot list + Cohen cases in unit tests; ensure prod deploy includes this

### P1

#### I-P1-1 · Strengthen evidence (entity match)
- **SEVERITY:** P1
- **IMPACT:** ACC-04 / false auto-commit
- **ROOT CAUSE:** Substring evidenceScore
- **RECOMMENDED FIX:** Co-occurrence + ≥2 independent hosts; no wiki-homonym-only commit for Latin/common

#### I-P1-2 · Confidence from evidence, not uiState alone
- **SEVERITY:** P1
- **IMPACT:** ACC-05
- **ROOT CAUSE:** Ordinal mapping
- **RECOMMENDED FIX:** Map gate `reason` + es → confidence; never `high` without seeded|focus|strong evidence

#### I-P1-3 · Post-context candidate quality
- **SEVERITY:** P1
- **IMPACT:** ACC-07 / QA-09 product 9/15
- **ROOT CAUSE:** Context spend without evidenced rebuild
- **RECOMMENDED FIX:** Merge network evidence into candidates or fail closed early

#### I-P1-4 · Locale-aware source prefer (de-IL foreign)
- **SEVERITY:** P1
- **IMPACT:** ACC-08
- **ROOT CAUSE:** pagePreferScore / prompts
- **RECOMMENDED FIX:** Condition `.il` boost on IL country / HE script

#### I-P1-5 · Align battery judge to criteria-דיוק
- **SEVERITY:** P1
- **IMPACT:** ACC-10 false green
- **ROOT CAUSE:** Soft runner
- **RECOMMENDED FIX:** expectPrecise / must_not in judge; pretty-wrong = FAIL

#### I-P1-6 · Units on lookup commit branches + CI 12-gate
- **SEVERITY:** P1
- **IMPACT:** Domain 32/32 green while prod wrong (QA-04/05)
- **ROOT CAUSE:** orch unit ≠ full /api/lookup
- **RECOMMENDED FIX:** package test script; integration cases for wikiCommitted/rich/forceGoogle/identifier

---

## J. Evaluation set outline (for hours 2–3)

**Goal:** Lock abstain-vs-commit policy before polish. Public sources only.

| ID | Case | Expect (accuracy) | Guards |
|----|------|-------------------|--------|
| E01 | נתניהו / Netanyahu | dossier · Q43723 · faces OK | KEEP celeb |
| E02 | דני כהן bare | need_context · 0 faces · fast | KEEP Cohen |
| E03 | John Smith bare | need_context · 0 faces · ≤8s | KEEP Latin bare |
| E04 | Emily Chen bare | need_context · 0 faces | KEEP |
| E05 | Smith + org/city **params** | candidates\|need_context · **0 faces** | ACC-01 contract |
| E06 | Smith + "IBM New York" in **q** | same as E05 (uniform) | ACC-03 |
| E07 | Smith + synthetic email | thin\|need_context\|candidates · **0 faces** | ACC-02 / G11 |
| E08 | Phone-only weak | thin · scrub · no caller-ID hosts | G10 KEEP |
| E09 | Zehava Galon / Assaf Rappaport | dossier correct QID | transliteration KEEP |
| E10 | דני כהן + Check Point + ת״א | candidates with ctx evidence **or** honest thin — **not** unchanged wiki-homonym-only after long Gemini | ACC-07 |
| E11 | nonexist / junk HE | thin\|need_context · 0 faces · no QID | battery nonexist |
| E12 | Obama EN/HE | dossier (product) — not early need_context | famous A |
| E13 | Foreign US name + country=US | no leading `.il` bias | ACC-08 |
| E14 | Common HE + email | must not bypass Cohen via ctxAny alone into dossier | identifier sticky |

**Harness:** extend `contract-identity-p0.mjs` + Domain units; do **not** trust soft battery alone. Hours 2–3 = run/lock these; hours later = implement P0 only with War Room GO.

---

## K. Files & dependencies

### K.1 Primary code (read-only this audit)

| Path | Role for accuracy |
|------|-------------------|
| `api/lib/orchestrator.js` | classifyScenario · COMMON_HE · evidenceScore · mayCommitDossier · decideStage · attachOrchestratorFields |
| `api/lookup.js` | normalize · wikiPath · softAmbiguous · seed · Stage B/Gemini · Application commit/enrich · scrub |
| `api/lib/stageB.js` | registry candidates (public hosts only) |
| `api/lib/orchestrator.test.mjs` | Domain units (32) — necessary not sufficient |
| `index.html` | A–D uiState consumer |

### K.2 Accuracy artifacts

| Path | Role |
|------|------|
| `test-results/AUDIT-STAGE0-דיוק-2026-09-09.md` | Stage-0 findings |
| `test-results/BATTERY-250-criteria-דיוק.md` | Strict PASS/FAIL |
| `test-results/BATTERY-250-list.json` | 71/120/59 balance |
| `test-results/SMOKE-foreign-path-בודק-2026-09-09.md` | Measured Smith FP |
| `test-results/SMOKE-12gate-dpl5N3G-*.json` | G11 critical |
| `test-results/RETHINK-accuracy-דיוק-2026-09-08.md` | B/D live analysis |
| `test-results/contract-identity-p0.mjs` | HTTP contract harness (QA) |
| `test-results/QA_AUDIT.md` · `ARCHITECTURE_AUDIT.md` · `BACKEND_AUDIT.md` | Alignment |

### K.3 External dependencies (identity)

- Wikipedia HE/EN · Wikidata · Commons  
- Stage B: ORCID · OpenLibrary · VIAF · Wikidata  
- Gemini Flash + Google Search grounding (bias/enrichment only)  
- **Banned:** Sync.me · Truecaller · Getcontact · Eyecon · other caller-ID  

### K.4 Status vs MASTER plan

MASTER P0: split commit gate · COMMON_HE · Smith+ctx/email contract.  
Workspace shows **partial** Domain wiring (`mayCommitDossier` calls, COMMON_HE import). **Accuracy still red** until measured contract on target deploy is green. No product code changed by this agent.

---

*סוכן דיוק · 2026-09-09 · READ-ONLY · ACCURACY_AUDIT for 5-hour sprint Discovery*
