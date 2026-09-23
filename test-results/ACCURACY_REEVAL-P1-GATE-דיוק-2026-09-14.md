# ACCURACY_REEVAL · P1 GATE · דיוק · 2026-09-14

**Agent:** Accuracy (דיוק)  
**Scope:** LOCAL identity-resolution layer only · **NO deploy** · **NO product-code change** · **NO EXPECTED rewrite** · prod baseline stays `dpl_D2zv`  
**Pack:** `test-results/handoff/P1-CASES-דיוק-2026-09-14.json` (25 cases)  
**FIX SoT:** `test-results/FIX-P1-GATE-שרת-2026-09-14.md`  
**Code:** `api/lib/knownIdentities.js` + `mayCommitDossier` / `decideStage` (`api/lib/orchestrator.js`)  
**When:** 2026-09-14, 23:31 Europe/Bucharest (UTC+3)

## Method

1. Units: `node api/lib/orchestrator.test.mjs` → **78 passed, 0 failed**
2. Live HTTP `/api/lookup`: **not available** on box (no `dev`/`start`; no local listener for API; package is Vercel serverless only)
3. Fallback (layer-only): for each case
   - `resolveKnownIdentityQid(q)`
   - softAmbiguous realism: common Latin (Smith/Brown/Chen) + common HE bare / bare `כהן`/`לוי` → `softAmb=true`; seeded celebs → `wiki.seeded` + `softAmb=false`
   - `mayCommitDossier` + `decideStage` (+ `attachOrchestratorFields` for faces strip)
4. Assaf (P06): **do not force PASS** — SPEC P2; `need_context` scored **PASS_DOCUMENTED_P2**
5. SAFETY S01–S07: must `faces=0` and not `dossier`

**Caveat:** Full HTTP path (wiki fetch, Stage B candidates, faces/photo richness) **not exercised**. This re-eval proves seed→commit gate + softAmb safety, not end-to-end photo/source richness. P04 layer `thin` may become `candidates` under live Stage B — see FAIL note.

## Summary

| Metric | Value |
|--------|-------|
| Units | **78 passed, 0 failed** |
| Cases (N) | **25** |
| PASS (strict) | **23** |
| PASS_DOCUMENTED_P2 (Assaf) | **1** (P06) |
| PASS (incl. documented P2) | **24** |
| FAIL | **1** (P04) |
| Pretty-wrong / FP dossier | **0** |
| SAFETY lock S01–S07 | **PASS** (7/7 · faces=0 · not dossier) |
| Seed recall N/G/M/P (excl. Assaf) | **14/14 dossier + correct QID** |

### Verdict (Accuracy / units+local)

| Signal | Result |
|--------|--------|
| Pretty-wrong STOP? | **NO** (0) |
| SAFETY regressions? | **NO** |
| Seed-alias recall (N01–N08, G01–G03, M01, P01–P02) | **YES** |
| Assaf | **PASS_DOCUMENTED_P2** (`need_context` · non-blocking) |
| P04 | **FAIL** layer `thin` ∉ EXPECTED `candidates\|need_context` — safe (not dossier); HTTP Stage B may yield candidates |
| **Recommendation** | **GO for Gate** from Accuracy perspective — **with local-only caveat**; HTTP smoke after any future dpl required (esp. P04 candidates shape). **NO deploy this step.** |

## Units

```
node api/lib/orchestrator.test.mjs
→ 78 passed, 0 failed
```

Coverage includes resolve N01–N07 / G01–G03 / M01–M02 / P01–P02 / N08; S01-class nulls; Assaf null (P2); mayCommit softAmb / email / seeded.

## Local HTTP

| Check | Result |
|-------|--------|
| `package.json` scripts | `test` / `test:contract` / `test:release` only — **no** `dev`/`start` |
| Listening API on localhost | none for `/api/lookup` |
| Conclusion | Identity layer via node imports; **full HTTP path awaits future dpl smoke** |

## Cases table

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR TYPE | NOTES |
|----|-------|----------|--------|-----------|------------|-------|
| S01 | `דני כהן` | need_context | ui=`need_context` · seed=null · softAmb=true · commit=`soft_ambiguous` · faces=0 | **PASS** | — | faces=0 (non-dossier) |
| S02 | `משה כהן` | need_context | ui=`need_context` · seed=null · softAmb=true · commit=`soft_ambiguous` · faces=0 | **PASS** | — | faces=0 (non-dossier) |
| S03 | `John Smith` | need_context | ui=`need_context` · seed=null · softAmb=true · commit=`soft_ambiguous` · faces=0 | **PASS** | — | faces=0 (non-dossier) |
| S04 | `John Smith` + org=IBM, city=New York | candidates \| thin \| need_context | ui=`thin` · seed=null · softAmb=true · commit=`soft_ambiguous` · faces=0 | **PASS** | — | faces=0 (non-dossier) |
| S05 | `John Smith` + email=qa.rethink.test@example.com | candidates \| thin | ui=`thin` · seed=null · softAmb=true · commit=`identifier_blocks_wiki` · faces=0 | **PASS** | — | email_leak: layer-only N/A (no HTTP body) — gate identifier_blocks_wiki holds; faces=0 (non-dossier) |
| S06 | `Xzqplmnvwtr987654321asdfgh` | need_context \| thin | ui=`need_context` · seed=null · softAmb=false · commit=`latin_bare` · faces=0 | **PASS** | — | faces=0 (non-dossier) |
| S07 | `פלמוני אלמוניזקש` + org=מפעל בדיקה פיקטיבי | need_context \| thin | ui=`thin` · seed=null · softAmb=false · commit=`no_commit` · faces=0 | **PASS** | — | faces=0 (non-dossier) |
| N01 | `בנימין נתניהו` | dossier | ui=`dossier` · seed=Q43723 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q43723 match |
| N02 | `נתניהו` | dossier | ui=`dossier` · seed=Q43723 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q43723 match |
| N03 | `ביבי נתניהו` | dossier | ui=`dossier` · seed=Q43723 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q43723 match |
| N04 | `ביבי` | dossier | ui=`dossier` · seed=Q43723 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q43723 match |
| N05 | `Benjamin Netanyahu` | dossier | ui=`dossier` · seed=Q43723 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q43723 match |
| N06 | `Bibi Netanyahu` | dossier | ui=`dossier` · seed=Q43723 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q43723 match |
| N07 | `Netanyahu` | dossier | ui=`dossier` · seed=Q43723 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q43723 match |
| N08 | `אורלי לוי` | dossier | ui=`dossier` · seed=Q466537 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q466537 match |
| G01 | `זהבה גלאון` | dossier | ui=`dossier` · seed=Q2630062 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q2630062 match |
| G02 | `Zehava Galon` | dossier | ui=`dossier` · seed=Q2630062 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q2630062 match |
| G03 | `Zahava Gal-On` | dossier | ui=`dossier` · seed=Q2630062 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q2630062 match |
| M01 | `Angela Merkel` | dossier | ui=`dossier` · seed=Q567 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q567 match |
| P01 | `יאיר לפיד` | dossier | ui=`dossier` · seed=Q1396120 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q1396120 match |
| P02 | `לפיד` | dossier | ui=`dossier` · seed=Q1396120 · softAmb=false · commit=`wiki_seeded` · faces=1 | **PASS** | — | qid=Q1396120 match |
| P03 | `כהן` | need_context | ui=`need_context` · seed=null · softAmb=true · commit=`soft_ambiguous` · faces=0 | **PASS** | — | faces=0 (non-dossier) |
| P04 | `Emily Chen` + city=Palo Alto, role=student | candidates \| need_context | ui=`thin` · seed=null · softAmb=true · commit=`soft_ambiguous` · faces=0 | **FAIL** | OTHER | uiState=thin not in [candidates\|need_context]; faces=0 (non-dossier) |
| P05 | `Michael Brown` | need_context | ui=`need_context` · seed=null · softAmb=true · commit=`soft_ambiguous` · faces=0 | **PASS** | — | faces=0 (non-dossier) |
| P06 | `Assaf Rappaport` | need_context \| thin \| dossier | ui=`need_context` · seed=null · softAmb=false · commit=`latin_bare` · faces=0 | **PASS_DOCUMENTED_P2** | — | Assaf P2: actual need_context\|thin acceptable — do not force dossier PASS; SPEC P2 non-blocking |

## Detail highlights

### SAFETY (S01–S07) — all PASS
- Common HE (`דני כהן`, `משה כהן`) → `need_context` · softAmb · commit `soft_ambiguous` · faces=0
- `John Smith` bare → `need_context`; +org/city → `thin`; +email → `thin` / `identifier_blocks_wiki` (no dossier, no email leak at gate)
- Junk / obscure HE+org → `need_context` / `thin` · no invent

### P1 recall — all PASS (seeded → dossier)
- Netanyahu family (N01–N07) → Q43723 · `wiki_seeded`
- אורלי לוי (N08) → Q466537
- Galon (G01–G03) incl. latinFold `Zahava Gal-On` → Q2630062
- Angela Merkel (M01) → Q567
- Lapid (P01–P02) → Q1396120

### P03 `כהן` alone — PASS
- resolve=null (not UNIQUE_SURNAME) · softAmb · `need_context` · never dossier

### P04 `Emily Chen`+city/role — FAIL (layer caveat)
- ACTUAL: `thin` (softAmb + ctx + zero evidenced candidates)
- EXPECTED: `candidates | need_context`
- must_not dossier: **held** · faces=0
- Layer cannot emit Stage B/ORCID candidates without HTTP — classify ERROR=OTHER (not pretty-wrong). Re-check on HTTP smoke.

### P06 Assaf Rappaport — PASS_DOCUMENTED_P2
- resolve=null (not seeded · P2 by design)
- ACTUAL: `need_context` · commit `latin_bare`
- Within EXPECTED union `need_context|thin|dossier` — **do not force dossier PASS** · non-blocking per SPEC

## Gate recommendation

**GO (local caveat)** for P1 Gate readiness from Accuracy:

- Units green · pretty-wrong=0 · SAFETY lock intact · seed-alias recall complete
- Residual: P04 EXPECTED mismatch at layer-only thin; Assaf remains documented P2
- **NO deploy** · baseline stays `dpl_D2zv` until Chief GO + new dpl
- Post-dpl: HTTP smoke of P1 pack (esp. S04/S05/P04 candidate richness + faces)

**NO product code changed. NO EXPECTED changed. NO deploy.**
