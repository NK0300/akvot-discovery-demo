# ACCURACY_REEVAL · P2 LOCAL T-C6 John Rappaport · דיוק · 2026-09-15

**Agent:** Accuracy (דיוק)  
**Scope:** LOCAL identity-resolution layer · **NO deploy** · **NO product-code change** · SPEC A06 already updated  
**Prod baseline (unchanged):** `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu`  
**Broken Preview (context):** `dpl_2Qrf…` — T-C6 John Rappaport → dossier+faces **Q105094696** (pretty-wrong)  
**Pack:** `test-results/handoff/P2-CASES-דיוק-2026-09-15.json` (N=18)  
**Fix:** `handoff/P2-FIX-T-C6-RAPPAPORT-שרת-2026-09-15.md` (`isSeedAdjacentLatinNearMiss` class-level)  
**Arch glance:** `handoff/P2-ARCH-GLANCE-T-C6-ארכיטקט-2026-09-15.md` (**PASS**)  
**Prior Acc:** `ACCURACY_REEVAL-P2-LOCAL-POST-CTX-דיוק-2026-09-15.md` (units were 94/94)  
**When:** 2026-09-15 · 17:43 Asia/Jerusalem (UTC+3)

## SPEC check · P2-A06 / T-C6

| Surface | Value |
|---------|-------|
| `expected_ui` | need_context \| candidates \| thin |
| `must_not` | **dossier** · **qid:Q47507930** · **qid:Q105094696** |
| JSON notes | T-C6 · bare John Rappaport must NOT dossier (surname bleed / wikiExact near-miss) |
| MD changelog | Affirm EXPECTED = not dossier · not Q105094696 · not Assaf QID |
| Action | **none** — already present; no EXPECTED rewrite |

## Method

1. Units: `node api/lib/orchestrator.test.mjs` → **98 passed, 0 failed**
2. Live local HTTP `/api/lookup` / `/api/health`: **not available** on box → **layer-only**
3. Layer pack reeval (N=18): `resolveKnownIdentityQid` · `isSeedAdjacentLatinNearMiss` · Application softAmb belt · `mayCommitDossier` · `decideStage`
4. Explicit John Rappaport probes ×3: realistic softAmb · wikiExact **Q105094696** + softAmb · wikiExact **Q105094696** + softAmb **cleared** (Domain `seed_adjacent_near_miss`)
5. Assaf A01 seeded commit still true; Assaf Smith A05 no Assaf QID
6. Pretty-wrong = dossier when `must_not` includes dossier **OR** forbidden QID (esp. Q105094696 / Q47507930 on A06)

**Caveat:** Full HTTP path (wiki fetch, Stage B candidates, faces/photo richness, latency ms) **not exercised**. Layer proves seed-adjacent near-miss gate + Assaf recall/precision. Cases needing Stage B may show `thin` where EXPECTED allows `candidates` — FAIL OTHER (not pretty-wrong) when safe.

## Summary

| Metric | Value |
|--------|-------|
| Units | **98/98** PASS (+4 vs POST-CTX 94: T-C6 near-miss detector + mayCommit belts) |
| Local HTTP | **none** → layer-only |
| Cases (N) | **18** |
| PASS | **17** |
| FAIL | **1** (P2-E02 OTHER) |
| Pretty-wrong | **0** |
| SAFETY S01–S07 | **PASS** (7/7 · faces=0 · not dossier) |
| **P2-A06 / T-C6 John Rappaport** | **PASS** · ui=`need_context` · seedAdj=**true** · softAmb · mayCommit=`false` `soft_ambiguous` · faces=0 · **not dossier** · **not Q105094696** · **not Q47507930** |
| A06 adversarial wikiExact Q105094696 + softAmb | **PASS** · mayCommit=false `soft_ambiguous` · not dossier |
| A06 adversarial softAmb cleared + Q105094696 | **PASS** · mayCommit=false `seed_adjacent_near_miss` · not dossier |
| P2-A01 Assaf Rappaport | **PASS** · dossier · **Q47507930** |
| P2-A03 אסף רפפורט | **PASS** · dossier · **Q47507930** |
| P2-A05 Assaf Smith | **PASS** · need_context · seed=null · smithClass · **no Assaf QID** |
| P2-E02 | **FAIL** OTHER (layer thin) · not PW |
| P2-L03 | **PASS** dossier Q47507930 · latency **N/A** |

### Verdict → Preview (not promote)

| Signal | Result |
|--------|--------|
| Pretty-wrong STOP? | **NO** (0) |
| A06 / T-C6 dossiers / Q105094696 / Assaf bleed? | **NO** |
| Domain seed_adjacent belt (softAmb cleared)? | **YES** · `seed_adjacent_near_miss` |
| Assaf A01 still dossier Q47507930? | **YES** |
| Assaf Smith still no Assaf QID? | **YES** |
| SAFETY regressions? | **NO** |
| Arch glance | PASS |
| **Recommendation** | **GO** for **Preview RC only** (not promote / not alias) — **with layer/HTTP caveat**. After Preview: @בודק re-reg **T-C6** John Rappaport ×3 + @דיוק HTTP Acc. **NO deploy in this step. HOLD promote.** |

## Units

```
node api/lib/orchestrator.test.mjs
→ 98 passed, 0 failed
```

Includes prior Smith-class / Assaf / E01 / ISO2 / strongEvidence probes **plus** `isSeedAdjacentLatinNearMiss('John Rappaport')` · Assaf full name not near-miss · `mayCommit` John Rappaport wikiExact → false · Assaf seeded still true.

## P2-A06 / T-C6 detail

| Field | Value |
|-------|-------|
| INPUT | `John Rappaport` (bare) |
| EXPECTED | need_context\|candidates\|thin · not dossier · not Q105094696 · not Q47507930 |
| `resolveKnownIdentityQid` | **null** |
| `isSeedAdjacentLatinNearMiss` | **true** |
| `isCommonLatinAmbiguousName` | false |
| softAmb (Application belt) | **true** |
| `mayCommitDossier` | **false** · `soft_ambiguous` |
| `decideStage` ui | **need_context** ∈ EXPECTED |
| faces | **0** |
| dossier / Q105094696 / Assaf QID | **no** / **no** / **no** |

### Adversarial belts

| # | Setup | softAmb | mayCommit | reason | ui | Result |
|---|-------|---------|-----------|--------|----|--------|
| 1 | realistic (no wiki QID) | true | false | soft_ambiguous | need_context | **PASS** |
| 2 | wikiExact **Q105094696** + softAmb | true | false | soft_ambiguous | need_context | **PASS** |
| 3 | wikiExact **Q105094696** + softAmb **cleared** | false | false | **seed_adjacent_near_miss** | need_context | **PASS** |

Domain `isSeedAdjacentLatinNearMiss` fires **before** wikiExact escape — matches Arch glance + units. Class-level (no Assaf-only if).

## Assaf precision / recall

| Case | ACTUAL | Result |
|------|--------|--------|
| P2-A01 `Assaf Rappaport` | dossier · **Q47507930** · commit=`wiki_seeded` · seedAdj=false | **PASS** |
| P2-A03 `אסף רפפורט` | dossier · Q47507930 | **PASS** |
| P2-A05 `Assaf Smith` | need_context · seed=null · smithClass · no Q47507930 | **PASS** |
| Assaf seeded mayCommit (direct) | ok=true `wiki_seeded` | **PASS** |

## Local HTTP

| Check | Result |
|-------|--------|
| `/api/health` localhost | no listener |
| `/api/lookup` | unavailable |
| Conclusion | Layer only; **HTTP Acc + @בודק T-C6 re-reg after Preview** |

## Cases table (full P2 pack)

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR | NOTES |
|----|-------|----------|--------|-----------|-------|-------|
| P2-S01 | `דני כהן` | need_context | ui=`need_context` · softAmb · faces=0 | **PASS** | — | SAFETY |
| P2-S02 | `John Smith` | need_context | ui=`need_context` · smithClass · faces=0 | **PASS** | — | SAFETY |
| P2-S03 | Smith + IBM + NY + US | candidates\|thin\|need_context · not dossier | ui=`thin` · softAmb · not Q1701775 | **PASS** | — | |
| P2-S04 | Smith + email | candidates\|thin | ui=`thin` · `identifier_blocks_wiki` | **PASS** | — | |
| P2-S05 | junk Latin | need_context\|thin | ui=`need_context` | **PASS** | — | |
| P2-S06 | obscure HE + org | need_context\|thin | ui=`thin` | **PASS** | — | |
| P2-S07 | `כהן` | need_context | ui=`need_context` · softAmb | **PASS** | — | |
| P2-K01 | `נתניהו` | dossier Q43723 | dossier · Q43723 | **PASS** | — | |
| P2-K02 | `Zehava Galon` | dossier Q2630062 | dossier · Q2630062 | **PASS** | — | |
| P2-K03 | `Angela Merkel` | dossier Q567 | dossier · Q567 | **PASS** | — | |
| P2-K04 | `אורלי לוי` | dossier Q466537 | dossier · Q466537 | **PASS** | — | |
| P2-A01 | `Assaf Rappaport` | dossier Q47507930 | dossier · **Q47507930** | **PASS** | — | **CRITICAL** |
| P2-A03 | `אסף רפפורט` | dossier Q47507930 | dossier · Q47507930 | **PASS** | — | |
| P2-A05 | `Assaf Smith` | not qid:Q47507930 | need_context · seed=null · smithClass | **PASS** | — | |
| **P2-A06** | `John Rappaport` | not dossier · not Q105094696 · not Assaf | need_context · seedAdj · softAmb · faces=0 | **PASS** | — | **T-C6 CRITICAL** |
| P2-E02 | `Emily Chen` + city/role | candidates\|need_context | ui=`thin` · not dossier | **FAIL** | OTHER | layer no Stage B; needs HTTP |
| P2-E04 | Smith + email | candidates\|thin | ui=`thin` | **PASS** | — | |
| P2-L03 | Assaf · measure_ms | dossier Q47507930 | dossier · Q47507930 | **PASS** | — | latency N/A |

**Totals:** N=18 · PASS=17 · FAIL=1 · pretty-wrong=0

## GO / NO-GO (Accuracy → CoS Preview)

| | |
|--|--|
| **Accuracy local** | **GO** for **Preview RC only** |
| Promote / alias | **HOLD** |
| Conditions for GO | pw=**0** · A06/T-C6 **not dossier** · not Q105094696 · Assaf A01 dossier Q47507930 · A05 no Assaf QID · units 98/98 · Arch PASS |
| Blockers for Preview GO? | **None** from Acc (layer/HTTP caveat acknowledged) |
| This step | **NO dpl / NO deploy by דיוק** — recommendation only |
| Next | CoS Preview → @בודק re-reg **T-C6** John Rappaport → @דיוק HTTP Acc |

## Artifacts

- Report: `test-results/ACCURACY_REEVAL-P2-LOCAL-T-C6-דיוק-2026-09-15.md`
- JSON: `test-results/ACCURACY_REEVAL-P2-LOCAL-T-C6-דיוק-2026-09-15.json`

## Room summary (HE · 3 sentences)

יחידות 98/98; John Rappaport (A06/T-C6) → softAmb + seedAdj, לא mayCommit dossier, לא Q105094696, לא Assaf Q47507930 — גם עם wikiExact adversarial חגורת Domain `seed_adjacent_near_miss`. Assaf Rappaport עדיין dossier Q47507930; Assaf Smith ללא Assaf QID; pw=0. **המלצת דיוק: GO ל־Preview RC בלבד** (caveat שכבתי, אין HTTP מקומי) — לא promote; אחרי Preview חובה בודק T-C6 + HTTP Acc.
