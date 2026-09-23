# QA_AUDIT — בודק · Discovery Hour 0–1 · 2026-09-09

**STATUS:** Discovery complete · **STOP** on code · **NO** deploy · **NO** new smoke runs
**SUT:** `akvot-simple-demo` · Prod https://akvot-simple-demo.vercel.app · deploy **`dpl_5N3GR8EvjjRsNcuDbDfC3g8afuNi`** (`dpl_5N3G`) · phase `orchestrator-v0-b`
**Scope:** QA discovery only — issues, coverage map, War Room P0/P1 fixes · no implementation
**Sources:** SMOKE-foreign-path · SMOKE-12gate-dpl5N3G · AUDIT-STAGE0-דיוק · BATTERY-250-criteria-דיוק.md · package.json · Domain 32/32 · MASTER PLAN
**Rule:** measured facts from existing smoke/artifacts only — לא הרצתי סמוק חדש

---

## Executive summary

| Metric | Value |
|-----|-----|
| 12-gate safety | **14/15** · **critical 1** (G11-email) |
| 12-gate product | **9/15** |
| Domain units | **32/32 PASS** - commit logic in lookup.js untested |
| package.json | no test script / no CI 12-gate |
| Soft battery judge | soft runner != BATTERY-250-criteria |
| P0 open | Smith+ctx pretty-wrong + G11 email CRIT |
| KEEP | Cohen bare, Netanyahu Q43723, Smith bare, Emily, G10-phone PASS |

**Verdict:** common-name HE/Latin bare safety KEEP; phone KEEP; over-commit on Smith+params/email = broken trust (worse than thin). No CI lock.

---

## Measured facts (existing — no new run)

| Case | ui · qid · faces | ms | Result |
|------|------------------|-----|--------|
| Netanyahu | dossier · **Q43723** · faces | ~1.4-7.2s | **PASS** KEEP |
| Cohen bare | need_context · **0 faces** | ~0.2s | **PASS** KEEP |
| Smith bare | need_context · 0 | **~5.9s** | **PASS** (<=8s) |
| Emily | need_context · 0 | **~6s** | **PASS** |
| Smith+IBM+NY as single q | need_context · 0 | ~5.9s | flaky vs candidates target |
| **Smith org/city params** | **dossier · Q1701775 · faces=true** | **~9.1s** | **pretty-wrong** P0 |
| **G11-email** | **dossier · Q332377 · faces** | ~13.2s | **SAFETY CRIT** |
| G10-phone | thin · scrub · 0 faces | ~5.9s | **PASS KEEP** |
| 12-gate aggregate | — | — | safety **14/15** · product **9/15** · crit **1** |

---

## Issues QA-01 .. QA-10

### QA-01 — Smith+org/city params pretty-wrong dossier

| | |
|--|--|
| **ID** | QA-01 |
| **SEVERITY** | **P0 / CRITICAL** |
| **REPRODUCTION** | Prod dpl_5N3GR8EvjjRsNcuDbDfC3g8afuNi: GET/POST /api/lookup with q=John Smith + org=IBM + city=New York (separate params). See SMOKE-foreign-path. |
| **EXPECTED** | uiState=candidates with context evidence OR need_context/thin honest — no dossier+faces without strong evidence-gate/focus. |
| **ACTUAL** | uiState=dossier · Q1701775 · faces=true · ~9.1s — over-commit (pretty-wrong). Trust broken worse than thin. |


### QA-02 — G11-email dossier+faces SAFETY CRIT

| | |
|--|--|
| **ID** | QA-02 |
| **SEVERITY** | **P0 / CRITICAL** (safety) |
| **REPRODUCTION** | 12-gate G11-email on prod dpl_5N3G: common name + synthetic email. Raw: SMOKE-12gate-dpl5N3G-בודק-2026-09-09.json. |
| **EXPECTED** | uiState in {thin, need_context, candidates} · 0 faces · scrub · email alone must not prove identity · scenario identifier. |
| **ACTUAL** | uiState=dossier · Q332377 · photo/faces · passSafety=false · critical=true · ~13.2s. Aggregate safety 14/15, product 9/15. |


### QA-03 — Smith+ctx path flaky (q-string vs params)

| | |
|--|--|
| **ID** | QA-03 |
| **SEVERITY** | **P0 / HIGH** (hides QA-01 in regression) |
| **REPRODUCTION** | Same person+context two shapes: (1) q="John Smith IBM New York" one string -> need_context ~5.9s; (2) q + org/city params -> dossier Q1701775+faces ~9.1s. |
| **EXPECTED** | Uniform HTTP contract for Smith+ctx: candidates|need_context without faces — independent of how context is sent. |
| **ACTUAL** | flaky: q-string -> need_context (safe / product miss vs candidates); params -> pretty-wrong dossier. Regression can pass one path and miss the bug. |


### QA-04 — Domain units 32/32 but lookup.js commit untested

| | |
|--|--|
| **ID** | QA-04 |
| **SEVERITY** | **P1 / HIGH** |
| **REPRODUCTION** | Domain api/lib/orchestrator.test.mjs -> 32/32 PASS (decideStage / evidenceScore / common-HE / attach). Contrast: wikiCommitted / rich / focus / email-phone-as-ctx paths in api/lookup.js (~4270 LOC) have no unit on commit gates. |
| **EXPECTED** | Every path that ends dossier+faces goes through one commit gate with unit+contract tests (including lookup branches). |
| **ACTUAL** | Domain green; lookup can still finish wikiCommitted/rich before unified evidence-gate -> QA-01/QA-02 live in prod despite 32/32. |


### QA-05 — No package test script / no CI 12-gate

| | |
|--|--|
| **ID** | QA-05 |
| **SEVERITY** | **P1 / HIGH** |
| **REPRODUCTION** | Read package.json: no scripts.test, empty deps. No workflow locks 12-gate before merge/deploy. |
| **EXPECTED** | package test script runs Domain units + smoke-12gate in CI; deploy blocked on safety fail/critical. |
| **ACTUAL** | Manual scripts under test-results/ only. 12-gate not CI-locked -> G11 can return without automatic gate. |


### QA-06 — Soft battery judge != BATTERY-250-criteria

| | |
|--|--|
| **ID** | QA-06 |
| **SEVERITY** | **P1 / MEDIUM-HIGH** |
| **REPRODUCTION** | Compare run-battery-250.mjs soft judge (famous~dossier|candidates|wiki; obscure~almost any uiState; nonexist~no faces) vs BATTERY-250-criteria-דיוק.md + expectPrecise (strict: pretty-wrong=FAIL). |
| **EXPECTED** | Battery PASS == accuracy PASS; pretty-wrong / historical-disambig-as-success fail automatically. |
| **ACTUAL** | Soft judge can mark PASS when accuracy would FAIL. Metrics like 196/250 do not represent true accuracy. |


### QA-07 — 12-gate product 9/15 (weak product after safety)

| | |
|--|--|
| **ID** | QA-07 |
| **SEVERITY** | **P1 / MEDIUM** |
| **REPRODUCTION** | SMOKE-12gate-dpl5N3G json: safetyPass=14, productPass=9, n=15. Product fails (non-crit): G3a Obama EN need_context; G3b Obama HE thin ~45s; G5 dani-ctx thin; G7 smith-ibm thin; G9 Assaf need_context. |
| **EXPECTED** | Product >=12/15 on entry gate: known EN/HE dossier; ctx->candidates with evidence or honest need_context; mid-tier Assaf dossier/KEEP. |
| **ACTUAL** | Safety relatively good (except G11) but product 9/15 — context often yields no evidence; celebs/mid-tier unstable on product axis. |


### QA-08 — Coverage gaps not CI-locked

| | |
|--|--|
| **ID** | QA-08 |
| **SEVERITY** | **P1 / MEDIUM** |
| **REPRODUCTION** | Existing suites: 12-gate + Domain units + battery. Missing locked edge cases: empty/missing q; light typo on celeb; 429/rate-limit behavior; query abuse payloads; browser e2e form->uiState. |
| **EXPECTED** | Negative+abuse matrix in CI: 400 on missing id; typo != pretty-wrong; 429 != faces flip on common name; e2e smoke on 4 uiStates. |
| **ACTUAL** | Gaps: empty/typo/rate-limit/injection/e2e not CI-locked. Only ad-hoc smokes/batteries. |


### QA-09 — After context: thin instead of evidenced candidates

| | |
|--|--|
| **ID** | QA-09 |
| **SEVERITY** | **P1 / MEDIUM** |
| **REPRODUCTION** | G5 Dani+ctx -> thin; G7 Smith+IBM+NY (12-gate path) -> thin no_public_sources ~12.7s; vs rethink target: candidates with sourcesPreview. |
| **EXPECTED** | After context (or after Gemini/Stage B spend): candidates with >=1 https evidence OR honest need_context/thin without wasted budget. |
| **ACTUAL** | Context often opens neither dossier nor evidenced candidates -> product FAIL (safety passes via 0 faces). |


### QA-10 — Latency/budget tails on empty-value paths

| | |
|--|--|
| **ID** | QA-10 |
| **SEVERITY** | **P2 / MEDIUM** |
| **REPRODUCTION** | 12-gate dpl_5N3G: G3b Obama-HE ~45205ms thin; G12a junk-HE ~45206ms thin (hard JSON deadline ~45s). Contrast KEEP: Smith bare ~5.9s, Emily ~6s, Cohen ~0.2s. |
| **EXPECTED** | Junk/fail-closed paths -> early thin/need_context << 45s; known HE must not burn full budget. |
| **ACTUAL** | Some failures are safe but expensive — noisy smoke/battery; user sees long skeleton with no value. |


---

## KEEP (do not break)

| KEEP | Evidence |
|------|----------|
| Cohen bare -> need_context · 0 faces | SMOKE + G4 · ~0.2s |
| Netanyahu dossier Q43723 | SMOKE + G1 PASS |
| Smith bare ~5.9s need_context PASS | <=8s OK |
| Emily ~6s need_context PASS | not 45s OK |
| G10-phone PASS KEEP | thin · scrub · no caller-ID / Truecaller |
| Domain unit contract (decideStage / strip photo on need_context) | 32/32 — keep and extend to lookup |

---

## Coverage map

| Layer | What exists | Status | CI-locked? |
|------|---------|--------|-------------|
| L1 Unit Domain | orchestrator.test.mjs | **32/32 PASS** | NO — no package test script |
| L1 Unit lookup commit | — | **Missing** (QA-04) | NO |
| L2 SMOKE 12-gate | smoke-12gate + dpl_5N3G | safety **14/15** · product **9/15** · crit **1** | NO |
| L2 Foreign-path smoke | SMOKE-foreign-path | Smith+params pretty-wrong documented | NO |
| L3 Battery-250 | run-battery-250.mjs | soft PASS != accuracy (QA-06) | NO |
| L4 Famous / Cohen gates | pilot / cohen-gate | point KEEP | NO |
| L5 Security light | CSP · SSRF · scrub · ban caller-ID | coded; G10 PASS | partial · abuse not locked |
| L6 UX / e2e browser | UI reports only | no Playwright/Cypress | NO (QA-08) |
| L7 Accuracy judge | BATTERY-250-criteria-דיוק.md | strict doc; soft runner | NO |
| Negative: empty/typo/429 | — | **Gap** | NO (QA-08) |

---

## Top fixes — War Room P0 / P1

### P0 (before any polish)

1. **Single commit gate** — dossier/faces only wiki.seeded OR evidenceScore>=T with >=2 independent sources matching org/city; email/phone alone **forbidden** (closes QA-01 + QA-02).
2. **Locked HTTP contract:** Smith+ctx (params AND q-string) -> candidates|need_context **without faces**; Smith+email -> thin|need_context|candidates without dossier+faces (closes QA-03).
3. **Contract tests** on both cases in CI — fail = block deploy.

### P1 (after P0)

4. **Package test script + CI 12-gate** — Domain 32/32 + smoke safety=15/15 required; product target >=12/15 (QA-05, QA-07).
5. **Units on lookup.js commit branches** — wikiCommitted / rich / forceGoogle / identifier (QA-04).
6. **Align battery judge to expectPrecise / criteria-דיוק** — soft != accuracy (QA-06).
7. **Gaps matrix:** empty · typo · rate-limit/429 · injection · e2e 4-uiState (QA-08).
8. **Ctx->evidence:** after context avoid empty thin without candidates+sources attempt (QA-09); early-exit junk/fail <<45s (QA-10).

### Not now

- No code fix / deploy from this document
- No soft-battery 250 as substitute for P0
- **G10-phone KEEP** — do not "improve" identifier into a dossier

---

## Verdict for Chief of Staff

| | |
|--|--|
| **GO to implementation?** | Only after War Room approval of P0 commit-gate |
| **Blocker** | QA-01 pretty-wrong · QA-02 G11 SAFETY CRIT |
| **Confidence in current prod** | Demo OK for known HE seeded + common-name bare; **do not** trust ctx/email for strangers |
| **Next QA owner action after GO** | Add HTTP contract + CI 12-gate; do not run 250 until runner is strict |

**Discovery only · no code · no deploy · no new smoke.**
