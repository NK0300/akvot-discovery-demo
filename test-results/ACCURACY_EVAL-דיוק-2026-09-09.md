# ACCURACY_EVAL · דיוק · 2026-09-09

**Agent:** Accuracy (דיוק)  
**Live alias:** https://akvot-simple-demo.vercel.app  
**Deploy:** `dpl_9V8iig4PLALA4t7V7hNNQFo8Q3az`  
**When:** 9.9.2026, 12:35:27 Asia/Jerusalem  
**Phase expected:** orchestrator-v0-b · **phaseOk:** true  
**Rules:** public sources only · no Sync.me/Truecaller · no product code change · UNKNOWN stays UNKNOWN  
**Method:** GET simple q · POST /api/lookup JSON for context · Origin=https://akvot-simple-demo.vercel.app · nocache=1 · timeout~65s

## Summary

| Metric | Value |
|--------|-------|
| N cases (incl. supplemental) | 16 |
| PASS | 12 |
| FAIL | 4 |
| Pretty-wrong hits | 0 |
| Primary battery | 13 · PASS 11 · FAIL 2 |
| Verdict | P0 pretty-wrong CLEAR · overall 4 FAIL (over-gate / recall, not FP faces) |

### Category coverage

| Category | Cases | Notes |
|----------|-------|-------|
| exact | 1, 1b, 1c | Full בנימין נתניהו PASS; bare נתניהו FAIL; ביבי FAIL |
| garbage | 2, 2b | PASS thin/need_context, 0 faces |
| ambiguous | 3 דני כהן | PASS need_context 0 faces |
| unknown | 4, 4b | PASS thin, no fabricated dossier |
| conflict | 5 Smith+IBM/NY, 5b email | PASS thin/candidates, NOT dossier+faces, no email leak |
| partial | 6 Emily Chen | PASS candidates low conf — not over-commit |
| near-match | 7 Latin Zehava FAIL; 7b HE זהבה PASS; 7c Merkel Latin FAIL | transliteration/Latin celeb regression |
| duplicate | 8 John Smith bare | PASS need_context 0 faces |
| regression | 9 אורלי לוי | PASS seeded dossier |

## Cases table

| # | Cat | Input | Expected | Actual | Conf | Evidence | ms | Status |
|---|-----|-------|----------|--------|------|----------|----|--------|
| 1 | exact | {"q":"נתניהו"} | dossier + Q43723 + faces OK | ui=need_context mode=google qid=- faces=false img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 35011 | **FAIL** |
| 2 | exact | {"q":"בנימין נתניהו"} | dossier + Q43723 + faces OK | ui=dossier mode=wiki+google qid=Q43723 faces=true img=7 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q43723@www.wikidata.org | 5416 | **PASS** |
| 3 | garbage | {"q":"Xzqplmnvwtr987654321asdfgh"} | thin\|need_context, NO faces/dossier fake | ui=need_context mode=ambiguous qid=- faces=false img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5734 | **PASS** |
| 4 | garbage | {"q":"בלהבלהזומזום123xyz"} | thin\|need_context, NO faces/fake dossier | ui=need_context mode=google qid=- faces=false img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 5875 | **PASS** |
| 5 | ambiguous | {"q":"דני כהן"} | need_context, 0 faces | ui=need_context mode=ambiguous qid=- faces=false img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 190 | **PASS** |
| 6 | unknown | {"q":"פלמוני אלמוניזקש","ctx":{"city":"דימונה","org":"מפעל בדיקה פיקטיבי"}} | thin\|need_context, UNKNOWN stays UNKNOWN | ui=thin mode=google qid=- faces=false img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 32451 | **PASS** |
| 7 | unknown | {"q":"Zyxwvutsrqponmlkjihgfedcba Quux","ctx":{"city":"Reykjavik","org":"Nonexistent Labs LLC"}} | thin\|need_context\|candidates, no fabricated dossier+faces | ui=thin mode=ambiguous qid=- faces=false img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 15337 | **PASS** |
| 8 | conflict | {"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}} | candidates\|need_context\|thin, NOT dossier+faces | ui=thin mode=ambiguous qid=- faces=false img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 15555 | **PASS** |
| 9 | conflict | {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}} | NOT dossier+faces; no email leak | ui=candidates mode=candidates qid=- faces=false img=0 src=6 scen=identifier phase=orchestrator-v0-b | low | ORCID:John Smith@orcid.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org | 9662 | **PASS** |
| 10 | partial | {"q":"Emily Chen","ctx":{"city":"Palo Alto","role":"student"}} | not over-commit (no low-conf dossier+faces) | ui=candidates mode=candidates qid=- faces=false img=0 src=5 scen=foreign phase=orchestrator-v0-b | low | ORCID:Emily Chen@orcid.org; VIAF:Emily Cheney Neville 1919-1997@viaf.org; VIAF:Emily Cheng, 1953-@vi | 9212 | **PASS** |
| 11 | near-match | {"q":"Zehava Galon"} | dossier OK if wiki exact (transliteration) | ui=need_context mode=ambiguous qid=- faces=false img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5709 | **FAIL** |
| 12 | duplicate | {"q":"John Smith"} | need_context 0 faces | ui=need_context mode=ambiguous qid=- faces=false img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5700 | **PASS** |
| 13 | regression | {"q":"אורלי לוי"} | seeded dossier (אורלי לוי) | ui=dossier mode=wiki+google qid=Q466537 faces=true img=7 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q466537@www.wikidata.org | 4596 | **PASS** |
| 14 | near-match* | {"q":"זהבה גלאון"} | dossier Q2630062 faces | ui=dossier mode=wiki qid=Q2630062 faces=true img=2 src=13 scen=known phase=orchestrator-v0-b | high | 13 sources | 986 | **PASS** |
| 15 | near-match* | {"q":"Angela Merkel"} | dossier (wiki exact Latin celeb) | ui=need_context mode=ambiguous qid=- faces=false img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5691 | **FAIL** |
| 16 | exact* | {"q":"ביבי נתניהו"} | dossier Q43723 if nickname resolves | ui=thin mode=google qid=- faces=false img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 45194 | **FAIL** |

\* supplemental retest rows

## Detail per case

### 1-exact-netanyahu [exact] — FAIL

- **INPUT:** `{"q":"נתניהו"}` (GET)
- **EXPECTED:** dossier + Q43723 + faces OK
- **ACTUAL:** uiState=need_context mode=google qid=null photo=false images=0 sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b ms=35011
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** FAIL — uiState=need_context expected dossier; qid=null expected Q43723; faces expected
- **NOTES:** RETEST confirmed: bare נתניהו → need_context messageKey=common_name (stable, not flake). Full בנימין נתניהו PASS.

### 1b-exact-bibi-full [exact] — PASS

- **INPUT:** `{"q":"בנימין נתניהו"}` (GET)
- **EXPECTED:** dossier + Q43723 + faces OK
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q43723 photo=true images=7 sources=1 scenario=known confidence=high phase=orchestrator-v0-b ms=5416
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q43723@www.wikidata.org
- **PASS/FAIL:** PASS

### 2-garbage-nonsense [garbage] — PASS

- **INPUT:** `{"q":"Xzqplmnvwtr987654321asdfgh"}` (GET)
- **EXPECTED:** thin\|need_context, NO faces/dossier fake
- **ACTUAL:** uiState=need_context mode=ambiguous qid=null photo=false images=0 sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b ms=5734
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS

### 2b-garbage-he [garbage] — PASS

- **INPUT:** `{"q":"בלהבלהזומזום123xyz"}` (GET)
- **EXPECTED:** thin\|need_context, NO faces/fake dossier
- **ACTUAL:** uiState=need_context mode=google qid=null photo=false images=0 sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b ms=5875
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS

### 3-ambiguous-danny-cohen [ambiguous] — PASS

- **INPUT:** `{"q":"דני כהן"}` (GET)
- **EXPECTED:** need_context, 0 faces
- **ACTUAL:** uiState=need_context mode=ambiguous qid=null photo=false images=0 sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b ms=190
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS

### 4-unknown-obscure [unknown] — PASS

- **INPUT:** `{"q":"פלמוני אלמוניזקש","ctx":{"city":"דימונה","org":"מפעל בדיקה פיקטיבי"}}` (POST)
- **EXPECTED:** thin\|need_context, UNKNOWN stays UNKNOWN
- **ACTUAL:** uiState=thin mode=google qid=null photo=false images=0 sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b ms=32451
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS

### 4b-unknown-latin-obscure [unknown] — PASS

- **INPUT:** `{"q":"Zyxwvutsrqponmlkjihgfedcba Quux","ctx":{"city":"Reykjavik","org":"Nonexistent Labs LLC"}}` (POST)
- **EXPECTED:** thin\|need_context\|candidates, no fabricated dossier+faces
- **ACTUAL:** uiState=thin mode=ambiguous qid=null photo=false images=0 sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b ms=15337
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS

### 5-conflict-smith-ibm-ny [conflict] — PASS

- **INPUT:** `{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}}` (POST)
- **EXPECTED:** candidates\|need_context\|thin, NOT dossier+faces
- **ACTUAL:** uiState=thin mode=ambiguous qid=null photo=false images=0 sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b ms=15555
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS

### 5b-conflict-smith-email [conflict] — PASS

- **INPUT:** `{"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}` (POST)
- **EXPECTED:** NOT dossier+faces; no email leak
- **ACTUAL:** uiState=candidates mode=candidates qid=null photo=false images=0 sources=6 scenario=identifier confidence=low phase=orchestrator-v0-b ms=9662
- **CONFIDENCE:** low
- **EVIDENCE:** ORCID:John Smith@orcid.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org
- **PASS/FAIL:** PASS

### 6-partial-emily-chen [partial] — PASS

- **INPUT:** `{"q":"Emily Chen","ctx":{"city":"Palo Alto","role":"student"}}` (POST)
- **EXPECTED:** not over-commit (no low-conf dossier+faces)
- **ACTUAL:** uiState=candidates mode=candidates qid=null photo=false images=0 sources=5 scenario=foreign confidence=low phase=orchestrator-v0-b ms=9212
- **CONFIDENCE:** low
- **EVIDENCE:** ORCID:Emily Chen@orcid.org; VIAF:Emily Cheney Neville 1919-1997@viaf.org; VIAF:Emily Cheng, 1953-@viaf.org; VIAF:Emily Chenoweth@viaf.org; VIAF:Emily Cheney, 1952-@viaf.org
- **PASS/FAIL:** PASS

### 7-near-zehava-galon [near-match] — FAIL

- **INPUT:** `{"q":"Zehava Galon"}` (GET)
- **EXPECTED:** dossier OK if wiki exact (transliteration)
- **ACTUAL:** uiState=need_context mode=ambiguous qid=null photo=false images=0 sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b ms=5709
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** FAIL — uiState=need_context expected dossier; faces expected
- **NOTES:** RETEST confirmed: Latin Zehava Galon → need_context common_name. HE זהבה גלאון → dossier Q2630062 PASS (see 7b).

### 8-dup-john-smith-bare [duplicate] — PASS

- **INPUT:** `{"q":"John Smith"}` (GET)
- **EXPECTED:** need_context 0 faces
- **ACTUAL:** uiState=need_context mode=ambiguous qid=null photo=false images=0 sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b ms=5700
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS

### 9-keep-orly-levy [regression] — PASS

- **INPUT:** `{"q":"אורלי לוי"}` (GET)
- **EXPECTED:** seeded dossier (אורלי לוי)
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q466537 photo=true images=7 sources=1 scenario=known confidence=high phase=orchestrator-v0-b ms=4596
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q466537@www.wikidata.org
- **PASS/FAIL:** PASS

### 7b-zehava-he [near-match] — PASS

- **INPUT:** `{"q":"זהבה גלאון"}` (GET)
- **EXPECTED:** dossier Q2630062 faces
- **ACTUAL:** uiState=dossier mode=wiki qid=Q2630062 photo=true images=2 sources=13 scenario=known confidence=high phase=orchestrator-v0-b ms=986
- **CONFIDENCE:** high
- **EVIDENCE:** 13 sources
- **PASS/FAIL:** PASS
- **NOTES:** supplemental retest/near-match; HE exact wiki PASS; contrasts Latin Zehava FAIL

### 7c-merkel-latin [near-match] — FAIL

- **INPUT:** `{"q":"Angela Merkel"}` (GET)
- **EXPECTED:** dossier (wiki exact Latin celeb)
- **ACTUAL:** uiState=need_context mode=ambiguous qid=null photo=false images=0 sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b ms=5691
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** FAIL — uiState=need_context expected dossier; faces=false
- **NOTES:** supplemental retest/near-match; Latin celeb over-gated to common_name after P0

### 1c-netanyahu-bibi [exact] — FAIL

- **INPUT:** `{"q":"ביבי נתניהו"}` (GET)
- **EXPECTED:** dossier Q43723 if nickname resolves
- **ACTUAL:** uiState=thin mode=google qid=null photo=false images=0 sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b ms=45194
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** FAIL — uiState=thin expected dossier; faces=false
- **NOTES:** supplemental retest/near-match; nickname ביבי נתניהו → thin (no dossier)

## Pretty-wrong verdict

**CLEAR** — no dossier+faces on conflict / email / garbage / unknown traps in this run (Smith+IBM+NY → thin; Smith+email → candidates; obscure → thin).

P0 deploy identity gate appears effective against over-commit FP. Residual failures are **recall / over-gate**: surname-only celebs and Latin transliterations/celebs returning `need_context`+`common_name` instead of wiki dossier.

## Room summary (HE)

הרצנו סוללת דיוק חיה מול האליאס אחרי P0 (`dpl_9V8iig4PLALA4t7V7hNNQFo8Q3az`, phase=orchestrator-v0-b מאומת). סיכום: 12/16 PASS, 4 FAIL, pretty-wrong=0 — שערי הזהות חוסמים dossier+faces על Smith+הקשר/אימייל ועל זבל/לא-ידוע. כישלונות: נתניהו לבד וסלבים בלטינית (Zehava Galon / Angela Merkel) יורדים ל-need_context/common_name במקום תיק ויקי; זהבה גלאון בעברית ו־בנימין נתניהו המלא עוברים. מסקנה לחדר: P0 בטיחותי עובד, אבל יש רגרסיית recall על תעתיק/שם-משפחה-סלב — לא להוריד ספים, כן לפתוח חריג seeded/wiki-exact ללטינית מפורסמת.
