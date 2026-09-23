# ACCURACY_REEVAL · P2 LOCAL POST-CTX · דיוק · 2026-09-15

**Agent:** Accuracy (דיוק)  
**Scope:** LOCAL identity-resolution layer + Application `pickContext` unwrap · **NO deploy** · **NO product-code change** · **NO EXPECTED rewrite** (SPEC frozen; S03 `country=US` already present)  
**Prod baseline (unchanged):** `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu`  
**Pack:** `test-results/handoff/P2-CASES-דיוק-2026-09-15.json` (N=18)  
**Fix:** `handoff/P2-FIX-POST-CTX-שרת-2026-09-15.md`  
**Arch glance:** `handoff/P2-ARCH-GLANCE-POST-CTX-ארכיטקט-2026-09-15.md` (**PASS**)  
**Prior Acc:** `ACCURACY_REEVAL-P2-LOCAL-SMITH-CTX-דיוק-2026-09-15.md` (layer; units were 93/93)  
**When:** 2026-09-15 · 17:20 Asia/Jerusalem (UTC+3)

## Root under test

1. Acc POST body `{ q, ctx:{ org, city, country } }` — nested `body.ctx` must be unwrapped in `pickContext` (was ignored → empty ctx vs GET).
2. Smith-class must **never** dossier without seed/focus — even via **strongEvidence** (pretty-wrong **Q1701775**).

## Method

1. Units: `node api/lib/orchestrator.test.mjs` → **94 passed, 0 failed**
2. Live local HTTP `/api/lookup` / `/api/health`: **not available** on box (no API listener; Vercel serverless) → **layer-only**
3. Code-read + mirrored `pickContext` (lookup.js Application; not exported) — nested POST unwrap vs flat POST vs GET query
4. P2-S03 nested POST body `{q:'John Smith', ctx:{org:'IBM',city:'New York',country:'US'}}` → unwrap → `softAmb` / `mayCommitDossier` / `decideStage` (same Domain path server uses after unwrap)
5. Flat POST + GET-equivalent params for parity
6. Adversarial: wikiExact Q1701775 + softAmb; softAmb cleared + **strongEvidence** (es≥0.75, orgCity, https≥2)
7. Full P2 pack layer reeval (same realism as prior LOCAL SMITH-CTX)
8. Pretty-wrong = dossier when `must_not` includes dossier **OR** wrong/forbidden QID (esp. Q1701775 on S03)

**Caveat:** Full HTTP path (wiki fetch, Stage B candidates, faces/photo richness, latency ms) **not exercised**. Layer proves unwrap + seed→commit gate + Smith-class hard-deny. Cases needing Stage B may show `thin` where EXPECTED allows `candidates` — FAIL OTHER (not pretty-wrong) when safe.

## Summary

| Metric | Value |
|--------|-------|
| Units | **94/94** PASS (+1 vs prior SMITH-CTX 93: strongEvidence→false) |
| Local HTTP | **none** → layer-only |
| `pickContext` nested unwrap | **PASS** · org/city/country from `body.ctx` · parity with flat POST + GET |
| Cases (N) | **18** |
| PASS | **17** |
| FAIL | **1** (P2-E02 OTHER) |
| Pretty-wrong | **0** |
| SAFETY S01–S07 | **PASS** (7/7 · faces=0 · not dossier) |
| **P2-S03 nested POST** | **PASS** · ui=`thin` · mayCommit=`false` `soft_ambiguous` · **not dossier** · **not Q1701775** |
| S03 flat / GET parity | **PASS** · same ui/`soft_ambiguous` |
| S03 strongEvidence adversarial | **PASS** · es=0.85 · strongEvidence=**true** · mayCommit=`false` `latin_common_ambiguous` · ui=`thin` |
| P2-A01 Assaf Rappaport | **PASS** · dossier · **Q47507930** |
| P2-A03 אסף רפפורט | **PASS** · dossier · **Q47507930** |
| P2-A05 / A06 | **PASS** · no Assaf QID bleed |
| P2-E02 | **FAIL** OTHER (layer thin) · not PW |
| P2-L03 | **PASS** dossier Q47507930 · latency **N/A** |

### Verdict → Preview (not promote)

| Signal | Result |
|--------|--------|
| Pretty-wrong STOP? | **NO** (0) |
| Nested S03 dossiers / Q1701775? | **NO** |
| Flat/GET S03 parity? | **YES** |
| Smith-class strongEvidence escape? | **NO** (Domain hard-deny) |
| SAFETY regressions? | **NO** |
| Assaf A01 still dossier Q47507930? | **YES** |
| Arch glance | PASS |
| **Recommendation** | **GO** for **Preview RC only** (not promote / not alias) — **with layer/HTTP caveat**. After Preview: @בודק POST+GET `d-smith-ctx-p0`+US ×3 + @דיוק HTTP Acc POST. **NO deploy in this step. HOLD promote.** |

## Units

```
node api/lib/orchestrator.test.mjs
→ 94 passed, 0 failed
```

Includes prior Smith-class / Assaf / E01 / ISO2 probes **plus** `mayCommit Smith strongEvidence still false`.

## pickContext unwrap (Application)

Code (`api/lookup.js`): on POST, if `body.ctx` is a plain object, field pick reads top-level then **nested** (`org/city/country/role/context/focus` + phone/email via `pickId`).

| Shape | org | city | country | any |
|-------|-----|------|---------|-----|
| POST nested `{q, ctx:{IBM,NY,US}}` | IBM | New York | US | true |
| POST flat `{q, org, city, country}` | IBM | New York | US | true |
| GET query equiv | IBM | New York | US | true |
| POST `{q}` only (no ctx) | — | — | — | false |

**Parity nested ↔ flat ↔ GET:** PASS. Pre-fix bug: nested ignored → empty ctx → Acc POST≠GET.

## P2-S03 nested POST detail

| Field | Value |
|-------|-------|
| Body | `{ q:'John Smith', ctx:{ org:'IBM', city:'New York', country:'US' } }` |
| After unwrap | org=IBM · city=New York · country=US · any=true |
| `resolveKnownIdentityQid` | **null** |
| `isCommonLatinAmbiguousName` | **true** |
| softAmb (Application belt) | **true** |
| `mayCommitDossier` | **false** · `soft_ambiguous` |
| `decideStage` ui | **thin** ∈ EXPECTED |
| faces | **0** |
| dossier / Q1701775 | **no** / **no** |

### Comparison · nested vs flat vs GET

| Path | ui | mayCommit | reason | Result |
|------|----|-----------|--------|--------|
| POST nested (after unwrap) | thin | false | soft_ambiguous | **PASS** |
| POST flat | thin | false | soft_ambiguous | **PASS** |
| GET-equivalent | thin | false | soft_ambiguous | **PASS** |

### Adversarial belts

| # | Setup | softAmb | strongEvidence | mayCommit | ui | Result |
|---|-------|---------|----------------|-----------|----|--------|
| 1 | realistic nested (no wiki QID) | true | false | false `soft_ambiguous` | thin | **PASS** |
| 2 | wikiExact **Q1701775** + softAmb | true | (irrelevant) | false `soft_ambiguous` | thin | **PASS** |
| 3 | wikiExact **Q1701775** + softAmb **cleared** + unit-test sources (es=**0.85**, orgCity, https=3) | false | **true** | false `latin_common_ambiguous` | thin | **PASS** |

Domain Smith-class hard-deny fires **before** strongEvidence / wikiExact escape — matches Arch glance + units.

## Local HTTP

| Check | Result |
|-------|--------|
| `/api/health` localhost | no listener |
| `/api/lookup` | unavailable |
| Conclusion | Layer + mirrored `pickContext` only; **HTTP Acc POST after Preview** |

## Cases table (full P2 pack)

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR | NOTES |
|----|-------|----------|--------|-----------|-------|-------|
| P2-S01 | `דני כהן` | need_context | ui=`need_context` · softAmb · faces=0 | **PASS** | — | SAFETY |
| P2-S02 | `John Smith` | need_context | ui=`need_context` · smithClass · faces=0 | **PASS** | — | SAFETY |
| P2-S03 | Smith + IBM + NY + **US** | candidates\|thin\|need_context · not dossier | ui=`thin` · softAmb · **not Q1701775** | **PASS** | — | **CRITICAL** nested POST path |
| P2-S04 | Smith + email | candidates\|thin | ui=`thin` · `identifier_blocks_wiki` | **PASS** | — | |
| P2-S05 | junk Latin | need_context\|thin | ui=`need_context` | **PASS** | — | |
| P2-S06 | obscure HE + org | need_context\|thin | ui=`thin` | **PASS** | — | |
| P2-S07 | `כהן` | need_context | ui=`need_context` · softAmb | **PASS** | — | |
| P2-K01 | `נתניהו` | dossier Q43723 | dossier · Q43723 | **PASS** | — | |
| P2-K02 | `Zehava Galon` | dossier Q2630062 | dossier · Q2630062 | **PASS** | — | |
| P2-K03 | `Angela Merkel` | dossier Q567 | dossier · Q567 | **PASS** | — | |
| P2-K04 | `אורלי לוי` | dossier Q466537 | dossier · Q466537 | **PASS** | — | |
| P2-A01 | `Assaf Rappaport` | dossier Q47507930 | dossier · **Q47507930** · smithClass=false | **PASS** | — | **CRITICAL** |
| P2-A03 | `אסף רפפורט` | dossier Q47507930 | dossier · Q47507930 | **PASS** | — | |
| P2-A05 | `Assaf Smith` | not qid:Q47507930 | need_context · seed=null · smithClass | **PASS** | — | |
| P2-A06 | `John Rappaport` | not qid:Q47507930 | need_context · seed=null | **PASS** | — | |
| P2-E02 | `Emily Chen` + city/role | candidates\|need_context | ui=`thin` · not dossier | **FAIL** | OTHER | layer no Stage B; needs HTTP |
| P2-E04 | Smith + email | candidates\|thin | ui=`thin` | **PASS** | — | |
| P2-L03 | Assaf · measure_ms | dossier Q47507930 | dossier · Q47507930 | **PASS** | — | latency N/A |

**Totals:** N=18 · PASS=17 · FAIL=1 · pretty-wrong=0

## GO / NO-GO (Accuracy → CoS Preview)

| | |
|--|--|
| **Accuracy local** | **GO** for **Preview RC only** |
| Promote / alias | **HOLD** |
| Conditions for GO | pw=**0** · nested S03 **not dossier** · Assaf A01 dossier Q47507930 · units 94/94 · Arch PASS |
| Blockers for Preview GO? | **None** from Acc (layer/HTTP caveat acknowledged) |
| This step | **NO dpl / NO deploy by דיוק** — recommendation only |
| Next | CoS Preview → @בודק POST+GET ×3 → @דיוק HTTP Acc POST |

## Artifacts

- Report: `test-results/ACCURACY_REEVAL-P2-LOCAL-POST-CTX-דיוק-2026-09-15.md`
- JSON: `test-results/ACCURACY_REEVAL-P2-LOCAL-POST-CTX-דיוק-2026-09-15.json`

## Room summary (HE · 3 sentences)

יחידות 94/94; `pickContext` פותח `body.ctx` מקונן — parity עם flat/GET. S03 POST מקונן (IBM/NY/US) → thin, לא dossier, לא Q1701775; גם עם strongEvidence חגורת Domain `latin_common_ambiguous` חוסמת; Assaf A01 עדיין dossier Q47507930; pw=0. **המלצת דיוק: GO ל־Preview RC בלבד** (caveat שכבתי, אין HTTP מקומי) — לא promote; אחרי Preview חובה בודק POST+GET + HTTP Acc.
