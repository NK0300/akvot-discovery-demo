# ACCURACY_REEVAL · P1 seed-alias · דיוק · 2026-09-09

**Agent:** Accuracy (דיוק)  
**Scope:** LOCAL identity-resolution layer only · **NO deploy** · prod still `dpl_9V8i`  
**P1 SoT:** `api/lib/knownIdentities.js` + FIX `test-results/FIX-P1-seed-alias-שרת-2026-09-09.md`  
**When:** 9.9.2026, 13:07 Asia/Jerusalem (UTC+3)  
**Method:**  
1. Units: `node api/lib/orchestrator.test.mjs` → **67/67**  
2. Live HTTP: **not available** — no `dev`/`start` script; `vercel dev` not running on box; package is Vercel serverless only  
3. Fallback: `node` import `resolveKnownIdentityQid` + `mayCommitDossier` / `decideStage` with pipeline snapshot mirroring lookup seed wiring (`wiki.seeded` + softAmb=false on hit)  
**Caveat:** Full `/api/lookup` HTTP (wiki fetch, faces, google) **awaits dpl** — this re-eval proves seed→commit gate, not end-to-end photo/source richness.

## Summary

| Metric | Value |
|--------|-------|
| Units | **67 passed, 0 failed** |
| Layer cases | 17 |
| PASS | 16 |
| WARN (seed gap, safe) | 1 (`אובמה` bare) |
| FAIL | **0** |
| Pretty-wrong / FP dossier | **0** → no STOP |
| Regression (prior 4 FAILs) | **4/4 PASS** |
| KEEP safety | **4/4 PASS** |
| Unseen (≥6) | 9 covered · 8 PASS · 1 WARN |

### Verdict (Accuracy / units+local)

| Signal | Result |
|--------|--------|
| Pretty-wrong STOP? | **NO** (0) |
| KEEP regressions? | **NO** |
| Prior recall FAILs fixed at layer? | **YES** |
| **Recommendation** | **GO for dpl** from Accuracy perspective — with **units+local-only caveat**; smoke HTTP after deploy required |

## Units

```
node api/lib/orchestrator.test.mjs
→ 67 passed, 0 failed
```

Includes P1 resolver + Latin wikiExact + Smith/Cohen safety (per FIX report).

## Local HTTP

| Check | Result |
|-------|--------|
| `package.json` scripts | `test` / `test:contract` / `test:release` only — **no** `dev`/`start` |
| Listening API on localhost | none for `/api/lookup` |
| `vercel.dev` | not used this run (no deploy; box has CLI but no live local listener) |
| Conclusion | Identity layer via node imports; **full HTTP path awaits dpl** |

## Cases table

| # | Cat | Input | Expected | Actual | Conf | Evidence | Status | Error type |
|---|-----|-------|----------|--------|------|----------|--------|------------|
| 1 | regression | `נתניהו` | dossier Q43723 | seed=Q43723 ui=dossier scen=known commit=wiki_seeded | high | seed alias UNIQUE_SURNAME | **PASS** | — |
| 2 | regression | `ביבי נתניהו` | dossier Q43723 | seed=Q43723 ui=dossier scen=known commit=wiki_seeded | high | nickname seed | **PASS** | — |
| 3 | regression | `Zehava Galon` | dossier Q2630062 | seed=Q2630062 ui=dossier commit=wiki_seeded | high | latinFold seed | **PASS** | — |
| 4 | regression | `Angela Merkel` | dossier Q567 | seed=Q567 ui=dossier commit=wiki_seeded | high | Latin seed / wikiExact class | **PASS** | — |
| 5 | keep | `דני כהן` | need_context 0 faces | seed=null ui=need_context scen=stranger softAmb | none | commonHeBare · no seed | **PASS** | — |
| 6 | keep | `John Smith` bare | need_context | seed=null ui=need_context softAmb | none | Latin bare softAmb | **PASS** | — |
| 7 | keep | John Smith + email | NOT dossier+faces | seed=null ui=thin scen=identifier commit=identifier_blocks_wiki | none | email gate | **PASS** | — |
| 8 | keep | John Smith + IBM + NY | NOT dossier w/o evidence | seed=null ui=thin softAmb commit=soft_ambiguous | none | softAmb blocks wiki QID | **PASS** | — |
| 9 | unseen | `לפיד` | dossier Q1396120 if seeded | seed=Q1396120 ui=dossier | high | UNIQUE_SURNAME | **PASS** | — |
| 10 | unseen | `יאיר לפיד` | dossier Q1396120 | seed=Q1396120 ui=dossier | high | full HE seed | **PASS** | — |
| 11 | unseen | `Barack Obama` | dossier Q76 | seed=Q76 ui=dossier | high | Latin seed | **PASS** | — |
| 12 | unseen | `אובמה` | dossier if seeded else safe | seed=null ui=need_context (safe) | none | **not** in HE labels/UNIQUE | **WARN** | SEED_GAP_SAFE |
| 13 | unseen | `Giorgia Meloni` | dossier Q451791 | seed=Q451791 ui=dossier | high | Latin seed | **PASS** | — |
| 14 | unseen | nonsense garbage | thin\|need_context no fake dossier | seed=null ui=need_context | none | no invent | **PASS** | — |
| 15 | unseen | obscure `פלמוני אלמוניזקש`+ctx | UNKNOWN stays UNKNOWN | seed=null ui=thin | none | no invent | **PASS** | — |
| 16 | unseen | `Michael Brown` bare | need_context / not dossier | seed=null ui=need_context softAmb | none | duplicate Latin | **PASS** | — |
| 17 | unseen | `Zahava Gal-On` | dossier Q2630062 | seed=Q2630062 ui=dossier | high | latinFold alt spelling | **PASS** | — |

## Detail per case

### 1 · reg-netanyahu-bare [regression] — PASS

- **INPUT:** `{"q":"נתניהו"}`
- **EXPECTED:** dossier + Q43723
- **ACTUAL:** seedQid=Q43723 · uiState=dossier · scenario=known · commitOk=true reason=wiki_seeded · softAmbiguous=false
- **CONFIDENCE:** high
- **EVIDENCE:** `KNOWN_IDENTITY_SEEDS` + `UNIQUE_SURNAME_ALIASES` → Q43723
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 2 · reg-bibi-netanyahu [regression] — PASS

- **INPUT:** `{"q":"ביבי נתניהו"}`
- **EXPECTED:** dossier + Q43723
- **ACTUAL:** seedQid=Q43723 · uiState=dossier · commit=wiki_seeded
- **CONFIDENCE:** high
- **EVIDENCE:** nickname label in seed row
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 3 · reg-zehava-galon [regression] — PASS

- **INPUT:** `{"q":"Zehava Galon"}`
- **EXPECTED:** dossier + Q2630062
- **ACTUAL:** seedQid=Q2630062 · uiState=dossier · commit=wiki_seeded
- **CONFIDENCE:** high
- **EVIDENCE:** Latin label + `latinFold`
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 4 · reg-angela-merkel [regression] — PASS

- **INPUT:** `{"q":"Angela Merkel"}`
- **EXPECTED:** dossier + Q567
- **ACTUAL:** seedQid=Q567 · uiState=dossier · commit=wiki_seeded
- **CONFIDENCE:** high
- **EVIDENCE:** world-figure seed row (also covered by mayCommit Latin wikiExact units)
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 5 · keep-danny-cohen [keep] — PASS

- **INPUT:** `{"q":"דני כהן"}`
- **EXPECTED:** need_context · 0 faces · no dossier
- **ACTUAL:** seed=null · uiState=need_context · scenario=stranger · messageKey=common_name · commit=soft_ambiguous
- **CONFIDENCE:** none
- **EVIDENCE:** `isCommonHeBareName` · NEVER in UNIQUE_SURNAME
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 6 · keep-john-smith-bare [keep] — PASS

- **INPUT:** `{"q":"John Smith"}`
- **EXPECTED:** need_context
- **ACTUAL:** seed=null · uiState=need_context · softAmbiguous=true · commit=soft_ambiguous
- **CONFIDENCE:** none
- **EVIDENCE:** no seed · Latin bare softAmb path
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 7 · keep-john-smith-email [keep] — PASS

- **INPUT:** `{"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}`
- **EXPECTED:** NOT dossier+faces
- **ACTUAL:** seed=null · uiState=thin · scenario=identifier · commitOk=false reason=identifier_blocks_wiki (even with synthetic wiki QID)
- **CONFIDENCE:** none
- **EVIDENCE:** email/phone identity block in `mayCommitDossier`
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —  
- **NOTE:** Live prod previously returned `candidates` (ORCID/VIAF); layer KEEP criterion is **not dossier+faces** — satisfied. Full candidate list shape awaits HTTP.

### 8 · keep-john-smith-ibm-ny [keep] — PASS

- **INPUT:** `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}}`
- **EXPECTED:** softAmb path · NOT dossier without evidence
- **ACTUAL:** seed=null · uiState=thin · softAmbiguous=true · commit=soft_ambiguous (wiki QID alone insufficient)
- **CONFIDENCE:** none
- **EVIDENCE:** softAmbiguous guard retained; evidence threshold unchanged (0.75)
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 9 · unseen-lapid-bare [unseen] — PASS

- **INPUT:** `{"q":"לפיד"}`
- **EXPECTED:** dossier Q1396120 if seeded
- **ACTUAL:** seed=Q1396120 · uiState=dossier · commit=wiki_seeded
- **CONFIDENCE:** high
- **EVIDENCE:** UNIQUE_SURNAME + seed labels
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 10 · unseen-yair-lapid [unseen] — PASS

- **INPUT:** `{"q":"יאיר לפיד"}`
- **EXPECTED:** dossier Q1396120
- **ACTUAL:** seed=Q1396120 · uiState=dossier
- **CONFIDENCE:** high
- **EVIDENCE:** full HE label
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 11 · unseen-obama-en [unseen] — PASS

- **INPUT:** `{"q":"Barack Obama"}`
- **EXPECTED:** dossier Q76
- **ACTUAL:** seed=Q76 · uiState=dossier · commit=wiki_seeded
- **CONFIDENCE:** high
- **EVIDENCE:** seed labels (+ `Obama` surname)
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 12 · unseen-obama-he-surname [unseen] — WARN

- **INPUT:** `{"q":"אובמה"}`
- **EXPECTED:** dossier Q76 **if** seeded; else safe non-commit
- **ACTUAL:** seed=null · uiState=need_context · commitOk=false · **no** false dossier
- **CONFIDENCE:** none
- **EVIDENCE:** HE bare `אובמה` **not** in seed labels / UNIQUE_SURNAME (only `ברק אובמה` / `Barack Obama` / `Obama`)
- **PASS/FAIL:** WARN (SEED_GAP_SAFE) — residual curated-set gap; **not** pretty-wrong; **not** STOP
- **ERROR TYPE:** SEED_GAP_SAFE  
- **Optional follow-up (not blocking GO):** add `אובמה` to Obama seed labels + UNIQUE if product wants HE-surname parity with `Obama` Latin.

### 13 · unseen-meloni [unseen] — PASS

- **INPUT:** `{"q":"Giorgia Meloni"}`
- **EXPECTED:** dossier Q451791
- **ACTUAL:** seed=Q451791 · uiState=dossier
- **CONFIDENCE:** high
- **EVIDENCE:** seed row (+ `Meloni` unique surname)
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 14 · unseen-nonsense [unseen] — PASS

- **INPUT:** `{"q":"Xzqplmnvwtr987654321asdfgh"}`
- **EXPECTED:** thin\|need_context · no fabricated dossier
- **ACTUAL:** seed=null · uiState=need_context · commitOk=false
- **CONFIDENCE:** none
- **EVIDENCE:** no invent
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 15 · unseen-obscure [unseen] — PASS

- **INPUT:** `{"q":"פלמוני אלמוניזקש","ctx":{"city":"דימונה","org":"מפעל בדיקה פיקטיבי"}}`
- **EXPECTED:** UNKNOWN stays UNKNOWN
- **ACTUAL:** seed=null · uiState=thin · commit=no_commit
- **CONFIDENCE:** none
- **EVIDENCE:** no seed invent under ctx
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —  
- **NOTE:** Live google thin timing not exercised (no HTTP).

### 16 · unseen-michael-brown [unseen] — PASS

- **INPUT:** `{"q":"Michael Brown"}`
- **EXPECTED:** need_context / not dossier
- **ACTUAL:** seed=null · uiState=need_context · softAmbiguous=true
- **CONFIDENCE:** none
- **EVIDENCE:** high-homonym Latin bare · not seeded
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

### 17 · unseen-zahava-gal-on [unseen] — PASS

- **INPUT:** `{"q":"Zahava Gal-On"}`
- **EXPECTED:** dossier Q2630062 (alt spelling from FIX report)
- **ACTUAL:** seed=Q2630062 · uiState=dossier · commit=wiki_seeded
- **CONFIDENCE:** high
- **EVIDENCE:** `latinFold` · explicit label `Zahava Gal-On`
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —

## Pretty-wrong / FP STOP gate

| Check | Result |
|-------|--------|
| Wrong-person dossier | **0** |
| KEEP → dossier | **0** |
| Garbage/obscure → dossier | **0** |
| **STOP?** | **NO** |

## Limitations (residual)

1. **Not full HTTP** — faces count, wiki REST extract, google mode, timing untested locally.  
2. Curated seed set — bare `אובמה` WARN (safe); new public figures need seed rows.  
3. John Smith+email layer used synthetic wiki QID to stress `identifier_blocks_wiki`; live may still show candidates (acceptable KEEP).  
4. Prod `dpl_9V8i` **unchanged** — prior live FAILs remain on prod until GO deploy.

## Smoke after dpl (Accuracy handoff)

1. `נתניהו` → dossier Q43723 + faces  
2. `ביבי נתניהו` → dossier Q43723  
3. `Zehava Galon` / `Zahava Gal-On` → dossier Q2630062  
4. `Angela Merkel` → dossier Q567  
5. `לפיד` / `Giorgia Meloni` / `Barack Obama` → dossier correct QID  
6. `דני כהן` / `John Smith` bare → need_context 0 faces  
7. Smith+email / Smith+IBM+NY → not dossier+faces  
8. nonsense / Michael Brown → not dossier  

## Recommendation

**GO for dpl from Accuracy perspective** (units 67/67 + local identity layer: prior 4 recall FAILs fixed, KEEP intact, pretty-wrong=0).  

**Caveat:** units + local layer only — confirm with live `/api/lookup` smoke immediately after deploy. Optional non-blocking seed add: HE `אובמה`.

**NO STOP.** Product code not changed this task. No deploy performed.
