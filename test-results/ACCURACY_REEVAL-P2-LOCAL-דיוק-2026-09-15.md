# ACCURACY_REEVAL · P2 LOCAL · דיוק · 2026-09-15

**Agent:** Accuracy (דיוק)  
**Scope:** LOCAL identity-resolution layer only · **NO deploy** · **NO product-code change** · **NO EXPECTED rewrite**  
**Prod baseline (unchanged):** `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu`  
**Pack:** `test-results/handoff/P2-CASES-דיוק-2026-09-15.json` (N=18)  
**Boundaries:** `handoff/P2-BOUNDARIES-ארכיטקט-2026-09-15.md`  
**Impl:** `handoff/P2-IMPL-LOCAL-שרת-2026-09-15.md`  
**Arch review:** `handoff/P2-ARCH-REVIEW-ארכיטקט-2026-09-15.md` (PASS)  
**When:** 2026-09-15 · Asia/Jerusalem (UTC+3)

## Method

1. Units: `node api/lib/orchestrator.test.mjs` → **88 passed, 0 failed**
2. Live local HTTP `/api/lookup` / `/api/health`: **not available** on box (no API listener; package is Vercel serverless)
3. Fallback (**layer-only**): for each P2 case
   - `resolveKnownIdentityQid(q)`
   - softAmbiguous realism: common Latin surnames (Smith/Chen/…) + common HE bare / bare `כהן` → `softAmb=true`; unseeded multi-token Latin near-miss → softAmb; seeded celebs → `wiki.seeded` + softAmb=false; junk/unknown → softAmb=false
   - `mayCommitDossier` + `decideStage` (+ `attachOrchestratorFields`)
   - Entity-match: exported `hasOrgCityEvidenceMatch` probes for **P2-E01** (not in cases pack; CRITICAL)
4. Pretty-wrong = dossier with wrong/forbidden QID, or dossier when `must_not` includes dossier

**Caveat:** Full HTTP path (wiki fetch, Stage B candidates, faces/photo richness, latency ms) **not exercised**. This re-eval proves seed→commit gate + softAmb/precision + entity-match helper, not end-to-end photo/source richness. Cases that need Stage B candidate emission may show layer `thin` where EXPECTED allows `candidates` — scored FAIL OTHER (not pretty-wrong) when safe.

## Summary

| Metric | Value |
|--------|-------|
| Units | **88/88** PASS |
| Local HTTP | **none** → layer-only |
| Cases (N) | **18** |
| PASS | **17** |
| FAIL | **1** (P2-E02) |
| Pretty-wrong | **0** |
| SAFETY S01–S07 | **PASS** (7/7 · faces=0 · not dossier) |
| P2-A01 Assaf Rappaport | **PASS** · dossier · **Q47507930** |
| P2-A03 אסף רפפורט | **PASS** · dossier · **Q47507930** |
| P2-A05 Assaf Smith | **PASS** · seed=null · no Assaf QID |
| P2-A06 John Rappaport | **PASS** · seed=null · no Assaf QID |
| P2-E01 entity-match | **PASS** at layer (3/3 probes) |
| P2-E02 / E04 | E02 **FAIL** OTHER (layer thin); E04 **PASS** |
| P2-L03 | **PASS** dossier Q47507930 · latency ms **N/A** (no HTTP) |

### Verdict → dpl recommendation

| Signal | Result |
|--------|--------|
| Pretty-wrong STOP? | **NO** (0) |
| SAFETY regressions? | **NO** |
| Assaf class recall (A01/A03) + L03 QID | **YES** |
| Assaf precision (A05/A06) | **YES** (no Q47507930 bleed) |
| Entity-match (E01 helper) | **YES** at layer |
| E02 Stage B shape | layer `thin` ∉ EXPECTED — safe; needs HTTP |
| Arch review | PASS (prior) |
| **Recommendation** | **GO** for CoS P2 Release Gate / **dpl** from Accuracy local perspective — **with layer-only caveat**. After dpl: @דיוק HTTP Acc + @בודק `test:release`. **NO deploy in this step.** |

## Units

```
node api/lib/orchestrator.test.mjs
→ 88 passed, 0 failed
```

Includes P2-A01/A02/A03/A04/A05/A06 resolve precision, P2-E01 `hasOrgCityEvidenceMatch` probes, mayCommit softAmb/email/seeded/threshold.

## Local HTTP

| Check | Result |
|-------|--------|
| `/api/health` on localhost | no listener (curl → connection fail) |
| `/api/lookup` | unavailable |
| Conclusion | Identity layer via node imports only; **HTTP Acc after dpl** |

## Cases table

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR | NOTES |
|----|-------|----------|--------|-----------|-------|-------|
| P2-S01 | `דני כהן` | need_context | ui=`need_context` · seed=null · softAmb · commit=`soft_ambiguous` · faces=0 | **PASS** | — | SAFETY · not dossier |
| P2-S02 | `John Smith` | need_context | ui=`need_context` · seed=null · softAmb · commit=`soft_ambiguous` · faces=0 | **PASS** | — | SAFETY · not dossier |
| P2-S03 | `John Smith` + org=IBM, city=New York | candidates\|thin\|need_context | ui=`thin` · seed=null · softAmb · commit=`soft_ambiguous` · faces=0 | **PASS** | — | SAFETY · not dossier |
| P2-S04 | `John Smith` + email | candidates\|thin | ui=`thin` · commit=`identifier_blocks_wiki` · faces=0 | **PASS** | — | email_leak: layer N/A; gate blocks commit |
| P2-S05 | junk Latin | need_context\|thin | ui=`need_context` · commit=`latin_bare` · faces=0 | **PASS** | — | SAFETY |
| P2-S06 | obscure HE + org | need_context\|thin | ui=`thin` · commit=`no_commit` · faces=0 | **PASS** | — | SAFETY |
| P2-S07 | `כהן` | need_context | ui=`need_context` · softAmb · commit=`soft_ambiguous` · faces=0 | **PASS** | — | SAFETY · not dossier |
| P2-K01 | `נתניהו` | dossier Q43723 | ui=`dossier` · seed=Q43723 · commit=`wiki_seeded` · faces=1 | **PASS** | — | QID match |
| P2-K02 | `Zehava Galon` | dossier Q2630062 | ui=`dossier` · seed=Q2630062 · commit=`wiki_seeded` · faces=1 | **PASS** | — | QID match |
| P2-K03 | `Angela Merkel` | dossier Q567 | ui=`dossier` · seed=Q567 · commit=`wiki_seeded` · faces=1 | **PASS** | — | QID match |
| P2-K04 | `אורלי לוי` | dossier Q466537 | ui=`dossier` · seed=Q466537 · commit=`wiki_seeded` · faces=1 | **PASS** | — | QID match |
| P2-A01 | `Assaf Rappaport` | dossier Q47507930 | ui=`dossier` · seed=**Q47507930** · commit=`wiki_seeded` · faces=1 | **PASS** | — | **CRITICAL** class Latin seed |
| P2-A03 | `אסף רפפורט` | dossier Q47507930 | ui=`dossier` · seed=**Q47507930** · commit=`wiki_seeded` · faces=1 | **PASS** | — | **CRITICAL** HE parity |
| P2-A05 | `Assaf Smith` | need_context\|candidates\|thin · must_not qid:Q47507930 | ui=`need_context` · seed=**null** · softAmb · faces=0 | **PASS** | — | **CRITICAL** no Assaf bleed |
| P2-A06 | `John Rappaport` | need_context\|candidates\|thin · must_not qid:Q47507930 | ui=`need_context` · seed=**null** · softAmb · faces=0 | **PASS** | — | **CRITICAL** no surname bleed |
| P2-E02 | `Emily Chen` + city/role | candidates\|need_context · must_not dossier | ui=`thin` · seed=null · softAmb · faces=0 | **FAIL** | OTHER | layer no Stage B → thin; **not dossier** · not PW · needs HTTP |
| P2-E04 | `John Smith` + email | candidates\|thin · must_not dossier | ui=`thin` · commit=`identifier_blocks_wiki` · faces=0 | **PASS** | — | entity/identifier path; no dossier |
| P2-L03 | `Assaf Rappaport` | dossier Q47507930 · measure_ms | ui=`dossier` · Q47507930 · faces=1 | **PASS** | — | latency **N/A** (no local HTTP); QID gate OK |

**Totals:** N=18 · PASS=17 · FAIL=1 · pretty-wrong=0

## P2-E01 entity-match (layer helper; not in cases pack)

| Probe | Expect | Actual | Result |
|-------|--------|--------|--------|
| URL-noise org `ib` in path | false (no match) | false | **PASS** |
| title token `IBM` | true | true | **PASS** |
| URL-only `boston` len≥4 | true (boundary) | true | **PASS** |

Full end-to-end “URL-noise → not dossier” under live Stage B still needs **HTTP after dpl** (Arch note: URL token ≥4 can still match path — short-noise stays not-dossier at helper).

## Detail highlights

### CRITICAL Assaf class
- **A01** `Assaf Rappaport` → resolve **Q47507930** → `mayCommit` `wiki_seeded` → `decideStage` **dossier**
- **A03** `אסף רפפורט` → same QID · HE parity
- **A05/A06** resolve **null** · softAmb · need_context · **never** Q47507930 (no Assaf-only if / no bare surname in UNIQUE_SURNAME — aligned with Boundaries + Arch)

### SAFETY S01–S07
All non-dossier · faces=0 · commit blocked via soft_ambiguous / identifier_blocks_wiki / latin_bare / no_commit.

### E02 FAIL (documented layer caveat)
Same class as P1 P04: softAmb + ctx + zero evidenced candidates → Domain `thin`. EXPECTED omits `thin`. **must_not dossier held** · pretty-wrong=0. Re-check on HTTP Stage B after dpl — **no EXPECTED rewrite**.

### L03
Identity outcome PASS (dossier Q47507930). `measure_ms` not available without HTTP; impl report already has prod-baseline latency numbers (measure-first satisfied per Arch).

## GO / NO-GO (Accuracy → CoS dpl)

| | |
|--|--|
| **Accuracy local** | **GO** |
| Conditions | layer-only caveat · E02 HTTP recheck post-dpl · L03 latency on HTTP · @בודק contract/safety/P1 reg |
| Blockers for GO? | **None** from Acc (pw=0 · Assaf green · SAFETY green · units 88/88) |
| This step | **NO dpl by דיוק** — recommendation only |

## Room summary (HE · 3 sentences)

יחידות 88/88; שכבת Domain בלבד (אין HTTP מקומי) — 17/18 PASS, pretty-wrong=0, SAFETY S01–S07 נעולים. Assaf A01/A03 → dossier Q47507930; A05/A06 בלי QID של Assaf; E01 entity-match ירוק בשכבה; E02 FAIL OTHER (thin בלי Stage B — לא PW). **המלצת דיוק: GO ל־CoS Gate/dpl** עם caveat שכבתי — אחרי dpl חובה HTTP Acc + בדיקות בודק; בלי deploy בצעד זה.
