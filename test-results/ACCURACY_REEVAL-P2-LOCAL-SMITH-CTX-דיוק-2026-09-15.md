# ACCURACY_REEVAL · P2 LOCAL SMITH-CTX · דיוק · 2026-09-15

**Agent:** Accuracy (דיוק)  
**Scope:** LOCAL identity-resolution layer only · **NO deploy** · **NO product-code change** · **NO EXPECTED rewrite** (S03 `country=US` already present)  
**Prod baseline (unchanged):** `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu`  
**Pack:** `test-results/handoff/P2-CASES-דיוק-2026-09-15.json` (N=18)  
**Fix:** `handoff/P2-FIX-SMITH-CTX-שרת-2026-09-15.md`  
**Arch glance:** `handoff/P2-ARCH-GLANCE-SMITH-CTX-ארכיטקט-2026-09-15.md` (**PASS**)  
**Prior local Acc:** `ACCURACY_REEVAL-P2-LOCAL-דיוק-2026-09-15.md` (layer-only; units were 88/88)  
**When:** 2026-09-15 · 16:57 Asia/Jerusalem (UTC+3)

## SPEC check · P2-S03 country=US

| Surface | country |
|---------|---------|
| `P2-CASES-דיוק-2026-09-15.json` P2-S03.ctx | **US** (`org=IBM`, `city=New York`, `country=US`) · `expected_ui` candidates\|thin\|need_context · faces=0 · must_not dossier |
| `P2-CASES-דיוק-2026-09-15.md` P2-S03 | Smith + IBM + NY + **US** · not dossier · not Q1701775 |
| Action | **none** — already present; no EXPECTED rewrite |

## Method

1. Units: `node api/lib/orchestrator.test.mjs` → **93 passed, 0 failed**
2. Live local HTTP `/api/lookup` / `/api/health`: **not available** on box (no API listener; package is Vercel serverless)
3. Fallback (**layer-only**): for each P2 case
   - `resolveKnownIdentityQid(q)`
   - `isCommonLatinAmbiguousName` / `isCommonHeBareName` + realism: common Latin (Smith/Chen/…) + common HE / bare `כהן` → `softAmb=true`; unseeded multi-token Latin near-miss → softAmb; seeded celebs → `wiki.seeded` + softAmb=false; junk/unknown → softAmb=false
   - Smith-class **stays softAmb even with ctx/US** (Application belt + Domain `latin_common_ambiguous`)
   - `mayCommitDossier` + `decideStage` (+ `attachOrchestratorFields`)
   - Entity-match: exported `hasOrgCityEvidenceMatch` probes for **P2-E01** (not in cases pack)
4. Explicit probes ×3: `John Smith` + org=IBM + city=New York + **country=US** through the same commit-path functions (realistic layer; wikiExact Q1701775 + forced softAmb; wikiExact Q1701775 + softAmb cleared)
5. Pretty-wrong = dossier when `must_not` includes dossier **OR** wrong/forbidden QID (esp. Q1701775 on S03)

**Caveat:** Full HTTP path (wiki fetch, Stage B candidates, faces/photo richness, latency ms) **not exercised**. This re-eval proves seed→commit gate + Smith-class belt after the country-ISO2 / wikiExact fix, not end-to-end photo/source richness. Cases that need Stage B candidate emission may show layer `thin` where EXPECTED allows `candidates` — scored FAIL OTHER (not pretty-wrong) when safe.

## Summary

| Metric | Value |
|--------|-------|
| Units | **93/93** PASS (was 88/88 pre-fix; +Smith-class wikiExact Q1701775 + ISO2) |
| Local HTTP | **none** → layer-only |
| Cases (N) | **18** |
| PASS | **17** |
| FAIL | **1** (P2-E02 OTHER) |
| Pretty-wrong | **0** |
| SAFETY S01–S07 | **PASS** (7/7 · faces=0 · not dossier) |
| P2-S03 Smith+IBM+NY+**US** | **PASS** · ui=`thin` · seed=null · **softAmb=true** · smithClass=true · commit=`soft_ambiguous` · faces=0 · **not Q1701775** |
| P2-A01 Assaf Rappaport | **PASS** · dossier · **Q47507930** |
| P2-A03 אסף רפפורט | **PASS** · dossier · **Q47507930** |
| P2-A05 Assaf Smith | **PASS** · seed=null · smithClass · no Assaf QID |
| P2-A06 John Rappaport | **PASS** · seed=null · no Assaf QID |
| P2-E01 entity-match | **PASS** at layer (3/3 probes) |
| P2-E02 / E04 | E02 **FAIL** OTHER (layer thin); E04 **PASS** |
| P2-L03 | **PASS** dossier Q47507930 · latency ms **N/A** (no HTTP) |
| Smith probes ×3 | **3/3 PASS** · none dossier · none Q1701775 commit |

### Verdict → Preview (not promote)

| Signal | Result |
|--------|--------|
| Pretty-wrong STOP? | **NO** (0) |
| S03 with country=US dossiers / Q1701775? | **NO** |
| SAFETY regressions? | **NO** |
| Assaf class recall (A01/A03) + L03 QID | **YES** · Q47507930 |
| Assaf precision (A05/A06) | **YES** (no Q47507930 bleed) |
| Smith-class belt (Domain + Application) | **YES** · wikiExact Q1701775 blocked even if softAmb cleared |
| country ISO2 `us` vs `https` | **YES** · ISO2 does not unlock commit |
| Entity-match (E01 helper) | **YES** at layer |
| E02 Stage B shape | layer `thin` ∉ EXPECTED — safe; needs HTTP |
| Arch glance | PASS |
| **Recommendation** | **GO** for **Preview RC** (not promote / not alias) from Accuracy local — **with layer-only caveat**. After Preview: @בודק re-suite incl. `d-smith-ctx-p0` country=US ×3 + @דיוק HTTP Acc. **NO deploy in this step. HOLD promote.** |

## Units

```
node api/lib/orchestrator.test.mjs
→ 93 passed, 0 failed
```

Includes prior P2-A01…A06 resolve precision, P2-E01 `hasOrgCityEvidenceMatch`, mayCommit softAmb/email/seeded/threshold, **plus** Smith-class detector, Assaf ∉ Smith-class, wikiExact Q1701775 + ctx/US → false, country=us does not unlock latin via https noise.

## Local HTTP

| Check | Result |
|-------|--------|
| `/api/health` on localhost | no listener (layer-only) |
| `/api/lookup` | unavailable |
| Conclusion | Identity layer via node imports only; **HTTP Acc after Preview** |

## Cases table

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR | NOTES |
|----|-------|----------|--------|-----------|-------|-------|
| P2-S01 | `דני כהן` | need_context | ui=`need_context` · seed=null · softAmb · commit=`soft_ambiguous` · faces=0 | **PASS** | — | SAFETY · not dossier |
| P2-S02 | `John Smith` | need_context | ui=`need_context` · seed=null · smithClass · softAmb · commit=`soft_ambiguous` · faces=0 | **PASS** | — | SAFETY · not dossier |
| P2-S03 | `John Smith` + org=IBM, city=New York, **country=US** | candidates\|thin\|need_context · not dossier · not Q1701775 | ui=`thin` · seed=null · smithClass · **softAmb** · commit=`soft_ambiguous` · faces=0 | **PASS** | — | **CRITICAL** country=US · SAFETY · not dossier |
| P2-S04 | `John Smith` + email | candidates\|thin | ui=`thin` · commit=`identifier_blocks_wiki` · faces=0 | **PASS** | — | email_leak: layer N/A; gate blocks commit |
| P2-S05 | junk Latin | need_context\|thin | ui=`need_context` · commit=`latin_bare` · faces=0 | **PASS** | — | SAFETY |
| P2-S06 | obscure HE + org | need_context\|thin | ui=`thin` · commit=`no_commit` · faces=0 | **PASS** | — | SAFETY |
| P2-S07 | `כהן` | need_context | ui=`need_context` · softAmb · commit=`soft_ambiguous` · faces=0 | **PASS** | — | SAFETY · not dossier |
| P2-K01 | `נתניהו` | dossier Q43723 | ui=`dossier` · seed=Q43723 · commit=`wiki_seeded` · faces=1 | **PASS** | — | QID match |
| P2-K02 | `Zehava Galon` | dossier Q2630062 | ui=`dossier` · seed=Q2630062 · commit=`wiki_seeded` · faces=1 | **PASS** | — | QID match |
| P2-K03 | `Angela Merkel` | dossier Q567 | ui=`dossier` · seed=Q567 · commit=`wiki_seeded` · faces=1 | **PASS** | — | QID match |
| P2-K04 | `אורלי לוי` | dossier Q466537 | ui=`dossier` · seed=Q466537 · commit=`wiki_seeded` · faces=1 | **PASS** | — | QID match |
| P2-A01 | `Assaf Rappaport` | dossier Q47507930 | ui=`dossier` · seed=**Q47507930** · commit=`wiki_seeded` · faces=1 · smithClass=**false** | **PASS** | — | **CRITICAL** class Latin seed |
| P2-A03 | `אסף רפפורט` | dossier Q47507930 | ui=`dossier` · seed=**Q47507930** · commit=`wiki_seeded` · faces=1 | **PASS** | — | **CRITICAL** HE parity |
| P2-A05 | `Assaf Smith` | need_context\|candidates\|thin · must_not qid:Q47507930 | ui=`need_context` · seed=**null** · smithClass · softAmb · faces=0 | **PASS** | — | **CRITICAL** no Assaf bleed |
| P2-A06 | `John Rappaport` | need_context\|candidates\|thin · must_not qid:Q47507930 | ui=`need_context` · seed=**null** · softAmb · faces=0 | **PASS** | — | **CRITICAL** no surname bleed |
| P2-E02 | `Emily Chen` + city/role | candidates\|need_context · must_not dossier | ui=`thin` · seed=null · softAmb · faces=0 | **FAIL** | OTHER | layer no Stage B → thin; **not dossier** · not PW · needs HTTP |
| P2-E04 | `John Smith` + email | candidates\|thin · must_not dossier | ui=`thin` · commit=`identifier_blocks_wiki` · faces=0 | **PASS** | — | identifier path; no dossier |
| P2-L03 | `Assaf Rappaport` | dossier Q47507930 · measure_ms | ui=`dossier` · Q47507930 · faces=1 | **PASS** | — | latency **N/A** (no local HTTP); QID gate OK |

**Totals:** N=18 · PASS=17 · FAIL=1 · pretty-wrong=0

## P2-S03 detail (country=US)

SPEC already had `country=US`. Layer simulation of the pack case:

| Field | Value |
|-------|-------|
| q | John Smith |
| ctx | org=IBM · city=New York · **country=US** |
| `resolveKnownIdentityQid` | **null** (not Q1701775, not any seed) |
| `isCommonLatinAmbiguousName` | **true** (Smith-class) |
| softAmb | **true** (stays with ctx/US) |
| `mayCommitDossier` | **false** · reason=`soft_ambiguous` |
| `decideStage` ui | **thin** ∈ EXPECTED |
| faces | **0** |
| pretty-wrong | **no** |

Old bug (Preview HTTP): Smith+IBM+NY+US → dossier+faces **Q1701775**. Layer now blocks both belts.

## Explicit probes ×3 · John Smith + IBM + New York + US

Same Domain functions (`resolveKnownIdentityQid`, `isCommonLatinAmbiguousName`, `mayCommitDossier`, `decideStage`, `attachOrchestratorFields`). Deterministic layer (conceptual flake-lock ×3).

| # | Setup | seed | smithClass | softAmb | wiki QID | evidenceScore | orgCity | mayCommit | ui | faces | Result |
|---|-------|------|------------|---------|----------|---------------|---------|-----------|----|-------|--------|
| 1 | realistic layer (no wiki QID; Application softAmb) | null | true | **true** | — | 0 | false | **false** `soft_ambiguous` | **thin** | 0 | **PASS** |
| 2 | adversarial wikiExact **Q1701775** + Application-forced softAmb (lookup belt) | null | true | **true** | Q1701775 | 0.30 | false | **false** `soft_ambiguous` | **thin** | 0 | **PASS** |
| 3 | adversarial wikiExact **Q1701775** + softAmb **cleared** (Domain-only belt) | null | true | false | Q1701775 | 0.30 | false | **false** `latin_common_ambiguous` | **thin** | 0 | **PASS** |

Country ISO2 extra: `country=US` + two `https://…` titles without org/city tokens → `mayCommit` **false** `latin_common_ambiguous`; `evidenceScore=0.15` (hosts only; **no** `includes('us')` unlock). ISO2 length=2 never scores on URL.

Note on probe 3: `classifyScenario` can still say `known` from `rich && wiki.found && qid && !ambiguous && !softAmb` even when Domain commit is false. **ui stays `thin`** (never dossier). Live lookup **re-forces softAmb** for Smith-class (`lookup.js` HARD SAFETY) so production path is probe 2, not 3. Dual belt holds.

## P2-E01 entity-match (layer helper; not in cases pack)

| Probe | Expect | Actual | Result |
|-------|--------|--------|--------|
| URL-noise org `ib` in path | false (no match) | false | **PASS** |
| title token `IBM` | true | true | **PASS** |
| URL-only `boston` len≥4 | true (boundary) | true | **PASS** |

## Detail highlights

### CRITICAL Smith-class + country=US (this re-eval)
- Seed never invents Q1701775 for `John Smith`
- `isCommonLatinAmbiguousName('John Smith')=true`; `Assaf Rappaport`=false (recall preserved)
- `mayCommitDossier` Smith wikiExact alone → false even with IBM/NY/**US** and Q1701775
- Application belt keeps softAmb; Domain belt `latin_common_ambiguous` if softAmb were cleared
- country ISO2 must not match URL `https` — confirmed

### CRITICAL Assaf class (must not regress)
- **A01** `Assaf Rappaport` → resolve **Q47507930** → `mayCommit` `wiki_seeded` → `decideStage` **dossier**
- **A03** `אסף רפפורט` → same QID · HE parity
- **A05/A06** resolve **null** · softAmb · need_context · **never** Q47507930

### SAFETY S01–S07
All non-dossier · faces=0 · commit blocked via soft_ambiguous / identifier_blocks_wiki / latin_bare / no_commit. S03 now includes country=US and still locked.

### E02 FAIL (documented layer caveat)
Same class as prior LOCAL: softAmb + ctx + zero evidenced candidates → Domain `thin`. EXPECTED omits `thin`. **must_not dossier held** · pretty-wrong=0. Re-check on HTTP Stage B after Preview — **no EXPECTED rewrite**.

### L03
Identity outcome PASS (dossier Q47507930). `measure_ms` not available without HTTP.

## GO / NO-GO (Accuracy → CoS Preview)

| | |
|--|--|
| **Accuracy local** | **GO** for **Preview RC only** |
| Promote / alias | **HOLD** |
| Conditions | layer-only caveat · E02 HTTP recheck post-Preview · L03 latency on HTTP · @בודק `d-smith-ctx-p0` country=US ×3 + contract/safety |
| Blockers for Preview GO? | **None** from Acc (pw=0 · S03 not dossier · Assaf green · SAFETY green · units 93/93) |
| This step | **NO dpl / NO deploy by דיוק** — recommendation only |

## Room summary (HE · 3 sentences)

יחידות 93/93; שכבת Domain בלבד (אין HTTP מקומי) — 17/18 PASS, pretty-wrong=0, SAFETY S01–S07 נעולים כולל S03 עם country=US. Smith+IBM+NY+US לא מתחייב לדוסייה ולא ל־Q1701775 (softAmb נשאר; חגורת Domain חוסמת גם אם softAmb נוקה); Assaf A01 עדיין dossier Q47507930. **המלצת דיוק: GO ל־Preview RC בלבד** עם caveat שכבתי — לא promote; אחרי Preview חובה HTTP Acc + רי-סוויט בודק; בלי deploy בצעד זה.
