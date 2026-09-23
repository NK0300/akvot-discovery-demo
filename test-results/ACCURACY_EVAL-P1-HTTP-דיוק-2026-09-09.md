# ACCURACY_EVAL · P1 HTTP · דיוק · 2026-09-09

**Agent:** Accuracy (דיוק)  
**Live alias:** https://akvot-simple-demo.vercel.app  
**Deploy:** `dpl_D2zvC3QvUVgz6kaSaWqnSUCoD9hU`  
**When:** 9.9.2026, 13:20:49 Asia/Jerusalem  
**Phase expected:** orchestrator-v0-b · **phaseOk:** True  
**Case set:** `ACCURACY_EVAL-v2-set-דיוק-2026-09-09.json` (N=34) + forced smoke IBM+NY → **N=35** run  
**Skipped:** none — ALL cases run  
**Rules:** public sources only · no Sync.me/Truecaller · no product code change · UNKNOWN stays UNKNOWN · no threshold lowering  
**Method:** GET simple q · POST JSON for ctx · Origin=https://akvot-simple-demo.vercel.app · nocache=1 · timeout=65s · concurrency=3  
**Elapsed:** 110.6s

## Summary metrics

| Metric | Value |
|--------|-------|
| N | 35 |
| PASS | 34 |
| FAIL | 1 |
| TP | 19 |
| FP | 0 |
| TN | 15 |
| FN | 1 |
| OVER-GATE | 1 |
| PRETTY-WRONG | 0 |
| Regression 4 | 4/4 |
| KEEP safety | 5/5 |
| Recommendation | **GO** |

**Recommendation evidence:** 1 non-critical FAIL(s) — GO with caveats

### By category

| Category | N | PASS | FAIL |
|----------|---|------|------|
| alias | 5 | 5 | 0 |
| ambiguous | 2 | 2 | 0 |
| conflict | 3 | 3 | 0 |
| duplicate | 2 | 2 | 0 |
| exact | 7 | 7 | 0 |
| near | 2 | 2 | 0 |
| non-match | 2 | 2 | 0 |
| partial | 2 | 2 | 0 |
| transliteration | 8 | 7 | 1 |
| unknown | 2 | 2 | 0 |

### Error type counts (FAIL only)

| Error type | Count |
|------------|-------|
| OVER-GATE | 1 |

## Forced smoke checks

| Case | Expected | Actual | Conf | Status | Error |
|------|----------|--------|------|--------|-------|
| reg-netanyahu-bare | ui∈[dossier] · qid=Q43723 · faces | ui=dossier; qid=Q43723; faces=True | high | PASS | — |
| reg-bibi-netanyahu | ui∈[dossier] · qid=Q43723 · faces | ui=dossier; qid=Q43723; faces=True | high | PASS | — |
| reg-zehava-galon | ui∈[dossier] · qid=Q2630062 · faces | ui=dossier; qid=Q2630062; faces=True | high | PASS | — |
| reg-angela-merkel | ui∈[dossier] · qid=Q567 · faces | ui=dossier; qid=Q567; faces=True | high | PASS | — |
| ambiguous-danny-cohen | ui∈[need_context] · 0 faces · must_not=dossier+faces,faces,fake_dossier | ui=need_context; qid=-; faces=False | none | PASS | — |
| duplicate-john-smith-bare | ui∈[need_context] · 0 faces · must_not=dossier+faces,faces,fake_dossier | ui=need_context; qid=-; faces=False | none | PASS | — |
| conflict-smith-email | ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier,email_leak | ui=candidates; qid=-; faces=False | low | PASS | — |
| smoke-smith-ibm-ny | ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier | ui=thin; qid=-; faces=False | none | PASS | — |

## Cases table

| # | Cat | Subset | Input | Expected | Actual | Conf | Evidence | ms | Status | Error |
|---|-----|--------|-------|----------|--------|------|----------|----|--------|-------|
| 1 | exact | regression | {"q": "נתניהו"} | ui∈[dossier] · qid=Q43723 · faces | ui=dossier mode=wiki qid=Q43723 faces=True img=2 src=17 scen=known phase=orchestrator-v0-b | high | NLI:987007265800905171@www.nli.org.il; NLI HE:000098960@www.nli.org.il; ויקיפדיה:בנימין נתניהו@he.wi | 1746 | **PASS** | — |
| 2 | alias | regression | {"q": "ביבי נתניהו"} | ui∈[dossier] · qid=Q43723 · faces | ui=dossier mode=wiki qid=Q43723 faces=True img=2 src=17 scen=known phase=orchestrator-v0-b | high | NLI:987007265800905171@www.nli.org.il; NLI HE:000098960@www.nli.org.il; ויקיפדיה:בנימין נתניהו@he.wi | 1426 | **PASS** | — |
| 3 | transliteration | regression | {"q": "Zehava Galon"} | ui∈[dossier] · qid=Q2630062 · faces | ui=dossier mode=wiki qid=Q2630062 faces=True img=2 src=13 scen=known phase=orchestrator-v0-b | high | NLI:987007585771105171@www.nli.org.il; NLI HE:001759073@www.nli.org.il; ויקיפדיה:זהבה גלאון@he.wikip | 1546 | **PASS** | — |
| 4 | transliteration | regression | {"q": "Angela Merkel"} | ui∈[dossier] · qid=Q567 · faces | ui=dossier mode=wiki qid=Q567 faces=True img=2 src=20 scen=known phase=orchestrator-v0-b | high | NLI:987007314303005171@www.nli.org.il; NLI HE:004227574@www.nli.org.il; ויקיפדיה:אנגלה מרקל@he.wikip | 1845 | **PASS** | — |
| 5 | exact | new | {"q": "בנימין נתניהו"} | ui∈[dossier] · qid=Q43723 · faces | ui=dossier mode=wiki qid=Q43723 faces=True img=2 src=17 scen=known phase=orchestrator-v0-b | high | NLI:987007265800905171@www.nli.org.il; NLI HE:000098960@www.nli.org.il; ויקיפדיה:בנימין נתניהו@he.wi | 1181 | **PASS** | — |
| 6 | exact | new | {"q": "יאיר לפיד"} | ui∈[dossier] · qid=Q1396120 · faces | ui=dossier mode=wiki qid=Q1396120 faces=True img=2 src=18 scen=known phase=orchestrator-v0-b | high | NLI:987007463139205171@www.nli.org.il; NLI HE:000397989@www.nli.org.il; ויקיפדיה:יאיר לפיד@he.wikipe | 1140 | **PASS** | — |
| 7 | exact | new | {"q": "בני גנץ"} | ui∈[dossier] · qid=Q16131258 · faces | ui=dossier mode=wiki+google qid=Q16131258 faces=True img=6 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q16131258@www.wikidata.org | 6543 | **PASS** | — |
| 8 | exact | new | {"q": "ברק אובמה"} | ui∈[dossier] · qid=Q76 · faces | ui=dossier mode=wiki+google qid=Q76 faces=True img=6 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q76@www.wikidata.org | 7190 | **PASS** | — |
| 9 | exact | new | {"q": "אורלי לוי"} | ui∈[dossier] · qid=Q466537 · faces | ui=dossier mode=wiki+google qid=Q466537 faces=True img=7 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q466537@www.wikidata.org | 5044 | **PASS** | — |
| 10 | non-match | new | {"q": "Xzqplmnvwtr987654321asdfgh"} | ui∈[thin\|need_context] · 0 faces · must_not=fake_dossier,dossier+faces,faces,qid_when_unknown | ui=need_context mode=ambiguous qid=- faces=False img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5842 | **PASS** | — |
| 11 | non-match | new | {"q": "קוקומלומבופלומפ123zzz"} | ui∈[thin\|need_context] · 0 faces · must_not=fake_dossier,dossier+faces,faces,qid_when_unknown | ui=thin mode=google qid=- faces=False img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 45329 | **PASS** | — |
| 12 | ambiguous | new | {"q": "דני כהן"} | ui∈[need_context] · 0 faces · must_not=dossier+faces,faces,fake_dossier | ui=need_context mode=ambiguous qid=- faces=False img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 384 | **PASS** | — |
| 13 | ambiguous | new | {"q": "יוסי לוי"} | ui∈[need_context\|candidates] · 0 faces · must_not=dossier+faces,faces,fake_dossier | ui=need_context mode=ambiguous qid=- faces=False img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 333 | **PASS** | — |
| 14 | unknown | new | {"q": "פלמוני אלמוניזקש", "ctx": {"city": "דימונה", "org": "מפעל בדיקה פיקטיבי"}} | ui∈[thin\|need_context] · 0 faces · must_not=fake_dossier,dossier+faces,faces,qid_when_unknown | ui=thin mode=google qid=- faces=False img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 45380 | **PASS** | — |
| 15 | unknown | new | {"q": "Quentin Zzyzxworth Blorple", "ctx": {"city": "Reykjavik", "org": "Nonexistent Labs LLC"}} | ui∈[thin\|need_context\|candidates] · 0 faces · must_not=fake_dossier,dossier+faces,faces,qid_when_unknown | ui=thin mode=ambiguous qid=- faces=False img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 15568 | **PASS** | — |
| 16 | conflict | new | {"q": "John Smith", "ctx": {"org": "Microsoft", "city": "Seattle", "country": "US"}} | ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier | ui=candidates mode=candidates qid=- faces=False img=0 src=6 scen=foreign phase=orchestrator-v0-b | low | Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750- | 9093 | **PASS** | — |
| 17 | conflict | new | {"q": "John Smith", "ctx": {"email": "qa.rethink.test@example.com"}} | ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier,email_leak | ui=candidates mode=candidates qid=- faces=False img=0 src=6 scen=identifier phase=orchestrator-v0-b | low | Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750- | 14471 | **PASS** | — |
| 18 | partial | new | {"q": "Sarah Johnson", "ctx": {"role": "product manager"}} | ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier | ui=candidates mode=candidates qid=- faces=False img=0 src=5 scen=foreign phase=orchestrator-v0-b | low | Open Library:Sarah Johnson@openlibrary.org; VIAF:Sarah Johnson, 1958-@viaf.org; VIAF:Sarah Johnson,  | 8830 | **PASS** | — |
| 19 | partial | new | {"q": "Emily Chen", "ctx": {"city": "Palo Alto", "role": "student"}} | ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier | ui=candidates mode=candidates qid=- faces=False img=0 src=8 scen=foreign phase=orchestrator-v0-b | low | ORCID:Emily Chen@orcid.org; Wikidata:Xiaofan Chen — author of 2012 doctoral thesis at University of  | 9337 | **PASS** | — |
| 20 | near | new | {"q": "Netenyahu"} | ui∈[dossier\|need_context\|candidates\|thin] · must_not=wrong_person_dossier | ui=need_context mode=ambiguous qid=- faces=False img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5837 | **PASS** | — |
| 21 | near | new | {"q": "זהבה גלון"} | ui∈[dossier\|need_context\|candidates\|thin] · must_not=wrong_person_dossier | ui=thin mode=google qid=- faces=False img=0 src=0 scen=stranger phase=orchestrator-v0-b | none | none | 45341 | **PASS** | — |
| 22 | duplicate | new | {"q": "Michael Brown"} | ui∈[need_context\|candidates] · 0 faces · must_not=dossier+faces,fake_dossier | ui=need_context mode=ambiguous qid=- faces=False img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5842 | **PASS** | — |
| 23 | duplicate | new | {"q": "John Smith"} | ui∈[need_context] · 0 faces · must_not=dossier+faces,faces,fake_dossier | ui=need_context mode=ambiguous qid=- faces=False img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5833 | **PASS** | — |
| 24 | alias | new | {"q": "לפיד"} | ui∈[dossier] · qid=Q1396120 · faces | ui=dossier mode=wiki+google qid=Q1396120 faces=True img=7 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q1396120@www.wikidata.org | 4118 | **PASS** | — |
| 25 | alias | new | {"q": "גנץ"} | ui∈[dossier] · qid=Q16131258 · faces | ui=dossier mode=wiki+google qid=Q16131258 faces=True img=6 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q16131258@www.wikidata.org | 6987 | **PASS** | — |
| 26 | alias | new | {"q": "ביבי"} | ui∈[dossier] · qid=Q43723 · faces | ui=dossier mode=wiki+google qid=Q43723 faces=True img=7 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q43723@www.wikidata.org | 2029 | **PASS** | — |
| 27 | alias | new | {"q": "Obama"} | ui∈[dossier] · qid=Q76 · faces | ui=dossier mode=wiki+google qid=Q76 faces=True img=6 src=3 scen=known phase=orchestrator-v0-b | high | Wikidata:Q76@www.wikidata.org; Open Library:Barack Obama@openlibrary.orgol529531a; Open Library:Bara | 2062 | **PASS** | — |
| 28 | transliteration | new | {"q": "Meloni"} | ui∈[dossier] · qid=Q451791 · faces | ui=dossier mode=wiki+google qid=Q451791 faces=True img=6 src=3 scen=known phase=orchestrator-v0-b | high | Wikidata:Q451791@www.wikidata.org; Open Library:Julie C. Meloni@openlibrary.orgol1395088a; Open Libr | 3132 | **PASS** | — |
| 29 | transliteration | new | {"q": "Giorgia Meloni"} | ui∈[dossier] · qid=Q451791 · faces | ui=dossier mode=wiki+google qid=Q451791 faces=True img=7 src=3 scen=known phase=orchestrator-v0-b | high | Wikidata:Q451791@www.wikidata.org; Open Library:Giorgia Meloni@openlibrary.orgol11595640a; Open Libr | 1728 | **PASS** | — |
| 30 | transliteration | new | {"q": "Assaf Rappaport"} | ui∈[dossier] · qid=Q47507930 · faces | ui=need_context mode=ambiguous qid=- faces=False img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 5829 | **FAIL** | OVER-GATE |
| 31 | transliteration | new | {"q": "Barack Obama"} | ui∈[dossier] · qid=Q76 · faces | ui=dossier mode=wiki+google qid=Q76 faces=True img=6 src=3 scen=known phase=orchestrator-v0-b | high | Wikidata:Q76@www.wikidata.org; Open Library:Barack Obama@openlibrary.orgol529531a; Open Library:Bara | 1795 | **PASS** | — |
| 32 | transliteration | new | {"q": "Yair Lapid"} | ui∈[dossier] · qid=Q1396120 · faces | ui=dossier mode=wiki+google qid=Q1396120 faces=True img=7 src=2 scen=known phase=orchestrator-v0-b | high | Wikidata:Q1396120@www.wikidata.org; Open Library:Yair Lapid@openlibrary.orgol4181325a | 1810 | **PASS** | — |
| 33 | transliteration | new | {"q": "Zahava Gal-On"} | ui∈[dossier] · qid=Q2630062 · faces | ui=dossier mode=wiki+google qid=Q2630062 faces=True img=7 src=1 scen=known phase=orchestrator-v0-b | high | Wikidata:Q2630062@www.wikidata.org | 3198 | **PASS** | — |
| 34 | exact | new | {"q": "Rahm Emanuel"} | ui∈[dossier] · qid=Q298443 · faces | ui=dossier mode=wiki+google qid=Q298443 faces=True img=7 src=3 scen=known phase=orchestrator-v0-b | high | Wikidata:Q298443@www.wikidata.org; Open Library:Rahm Emanuel@openlibrary.orgol3107868a; Open Library | 3518 | **PASS** | — |
| 35 | conflict | smoke | {"q": "John Smith", "ctx": {"org": "IBM", "city": "New York", "country": "US"}} | ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier | ui=thin mode=ambiguous qid=- faces=False img=0 src=0 scen=foreign phase=orchestrator-v0-b | none | none | 13878 | **PASS** | — |

## Detail per case

### reg-netanyahu-bare [exact/regression] — PASS

- **INPUT:** `{"q": "נתניהו"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q43723 · faces
- **ACTUAL:** uiState=dossier mode=wiki qid=Q43723 photo=True images=2 faces=True sources=17 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1746
- **CONFIDENCE:** high
- **EVIDENCE:** NLI:987007265800905171@www.nli.org.il; NLI HE:000098960@www.nli.org.il; ויקיפדיה:בנימין נתניהו@he.wikipedia.org; Wikidata:Q43723@www.wikidata.org; Wikipedia EN:Benjamin Netanyahu@en.wikipedia.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### reg-bibi-netanyahu [alias/regression] — PASS

- **INPUT:** `{"q": "ביבי נתניהו"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q43723 · faces
- **ACTUAL:** uiState=dossier mode=wiki qid=Q43723 photo=True images=2 faces=True sources=17 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1426
- **CONFIDENCE:** high
- **EVIDENCE:** NLI:987007265800905171@www.nli.org.il; NLI HE:000098960@www.nli.org.il; ויקיפדיה:בנימין נתניהו@he.wikipedia.org; Wikidata:Q43723@www.wikidata.org; Wikipedia EN:Benjamin Netanyahu@en.wikipedia.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### reg-zehava-galon [transliteration/regression] — PASS

- **INPUT:** `{"q": "Zehava Galon"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q2630062 · faces
- **ACTUAL:** uiState=dossier mode=wiki qid=Q2630062 photo=True images=2 faces=True sources=13 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1546
- **CONFIDENCE:** high
- **EVIDENCE:** NLI:987007585771105171@www.nli.org.il; NLI HE:001759073@www.nli.org.il; ויקיפדיה:זהבה גלאון@he.wikipedia.org; Wikidata:Q2630062@www.wikidata.org; Wikipedia EN:Zehava Galon@en.wikipedia.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### reg-angela-merkel [transliteration/regression] — PASS

- **INPUT:** `{"q": "Angela Merkel"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q567 · faces
- **ACTUAL:** uiState=dossier mode=wiki qid=Q567 photo=True images=2 faces=True sources=20 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1845
- **CONFIDENCE:** high
- **EVIDENCE:** NLI:987007314303005171@www.nli.org.il; NLI HE:004227574@www.nli.org.il; ויקיפדיה:אנגלה מרקל@he.wikipedia.org; Wikidata:Q567@www.wikidata.org; Wikipedia EN:Angela Merkel@en.wikipedia.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### exact-benjamin-netanyahu [exact/new] — PASS

- **INPUT:** `{"q": "בנימין נתניהו"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q43723 · faces
- **ACTUAL:** uiState=dossier mode=wiki qid=Q43723 photo=True images=2 faces=True sources=17 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1181
- **CONFIDENCE:** high
- **EVIDENCE:** NLI:987007265800905171@www.nli.org.il; NLI HE:000098960@www.nli.org.il; ויקיפדיה:בנימין נתניהו@he.wikipedia.org; Wikidata:Q43723@www.wikidata.org; Wikipedia EN:Benjamin Netanyahu@en.wikipedia.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### exact-yair-lapid [exact/new] — PASS

- **INPUT:** `{"q": "יאיר לפיד"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q1396120 · faces
- **ACTUAL:** uiState=dossier mode=wiki qid=Q1396120 photo=True images=2 faces=True sources=18 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1140
- **CONFIDENCE:** high
- **EVIDENCE:** NLI:987007463139205171@www.nli.org.il; NLI HE:000397989@www.nli.org.il; ויקיפדיה:יאיר לפיד@he.wikipedia.org; Wikidata:Q1396120@www.wikidata.org; Wikipedia EN:Yair Lapid@en.wikipedia.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### exact-benny-gantz [exact/new] — PASS

- **INPUT:** `{"q": "בני גנץ"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q16131258 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q16131258 photo=True images=6 faces=True sources=1 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=6543
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q16131258@www.wikidata.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### exact-obama-he [exact/new] — PASS

- **INPUT:** `{"q": "ברק אובמה"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q76 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q76 photo=True images=6 faces=True sources=1 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=7190
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q76@www.wikidata.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### exact-orly-levy [exact/new] — PASS

- **INPUT:** `{"q": "אורלי לוי"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q466537 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q466537 photo=True images=7 faces=True sources=1 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=5044
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q466537@www.wikidata.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### nonmatch-nonsense-latin [non-match/new] — PASS

- **INPUT:** `{"q": "Xzqplmnvwtr987654321asdfgh"}` (GET)
- **EXPECTED:** ui∈[thin\|need_context] · 0 faces · must_not=fake_dossier,dossier+faces,faces,qid_when_unknown
- **ACTUAL:** uiState=need_context mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b messageKey=common_name ms=5842
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### nonmatch-nonsense-he [non-match/new] — PASS

- **INPUT:** `{"q": "קוקומלומבופלומפ123zzz"}` (GET)
- **EXPECTED:** ui∈[thin\|need_context] · 0 faces · must_not=fake_dossier,dossier+faces,faces,qid_when_unknown
- **ACTUAL:** uiState=thin mode=google qid=None photo=False images=0 faces=False sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b messageKey=no_public_sources ms=45329
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### ambiguous-danny-cohen [ambiguous/new] — PASS

- **INPUT:** `{"q": "דני כהן"}` (GET)
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier+faces,faces,fake_dossier
- **ACTUAL:** uiState=need_context mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b messageKey=common_name ms=384
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### ambiguous-yossi-levy [ambiguous/new] — PASS

- **INPUT:** `{"q": "יוסי לוי"}` (GET)
- **EXPECTED:** ui∈[need_context\|candidates] · 0 faces · must_not=dossier+faces,faces,fake_dossier
- **ACTUAL:** uiState=need_context mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b messageKey=common_name ms=333
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### unknown-fake-obscure-he [unknown/new] — PASS

- **INPUT:** `{"q": "פלמוני אלמוניזקש", "ctx": {"city": "דימונה", "org": "מפעל בדיקה פיקטיבי"}}` (POST)
- **EXPECTED:** ui∈[thin\|need_context] · 0 faces · must_not=fake_dossier,dossier+faces,faces,qid_when_unknown
- **ACTUAL:** uiState=thin mode=google qid=None photo=False images=0 faces=False sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b messageKey=no_public_sources ms=45380
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### unknown-fake-obscure-en [unknown/new] — PASS

- **INPUT:** `{"q": "Quentin Zzyzxworth Blorple", "ctx": {"city": "Reykjavik", "org": "Nonexistent Labs LLC"}}` (POST)
- **EXPECTED:** ui∈[thin\|need_context\|candidates] · 0 faces · must_not=fake_dossier,dossier+faces,faces,qid_when_unknown
- **ACTUAL:** uiState=thin mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b messageKey=no_public_sources ms=15568
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### conflict-smith-microsoft-seattle [conflict/new] — PASS

- **INPUT:** `{"q": "John Smith", "ctx": {"org": "Microsoft", "city": "Seattle", "country": "US"}}` (POST)
- **EXPECTED:** ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier
- **ACTUAL:** uiState=candidates mode=candidates qid=None photo=False images=0 faces=False sources=6 scenario=foreign confidence=low phase=orchestrator-v0-b messageKey=pick_one ms=9093
- **CONFIDENCE:** low
- **EVIDENCE:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### conflict-smith-email [conflict/new] — PASS

- **INPUT:** `{"q": "John Smith", "ctx": {"email": "qa.rethink.test@example.com"}}` (POST)
- **EXPECTED:** ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier,email_leak
- **ACTUAL:** uiState=candidates mode=candidates qid=None photo=False images=0 faces=False sources=6 scenario=identifier confidence=low phase=orchestrator-v0-b messageKey=pick_one ms=14471
- **CONFIDENCE:** low
- **EVIDENCE:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### partial-role-only [partial/new] — PASS

- **INPUT:** `{"q": "Sarah Johnson", "ctx": {"role": "product manager"}}` (POST)
- **EXPECTED:** ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier
- **ACTUAL:** uiState=candidates mode=candidates qid=None photo=False images=0 faces=False sources=5 scenario=foreign confidence=low phase=orchestrator-v0-b messageKey=pick_one ms=8830
- **CONFIDENCE:** low
- **EVIDENCE:** Open Library:Sarah Johnson@openlibrary.org; VIAF:Sarah Johnson, 1958-@viaf.org; VIAF:Sarah Johnson, 1980-@viaf.org; VIAF:Sarah Johnson Prichard@viaf.org; VIAF:Sarah Johnson, 1950-@viaf.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### partial-emily-chen-student [partial/new] — PASS

- **INPUT:** `{"q": "Emily Chen", "ctx": {"city": "Palo Alto", "role": "student"}}` (POST)
- **EXPECTED:** ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier
- **ACTUAL:** uiState=candidates mode=candidates qid=None photo=False images=0 faces=False sources=8 scenario=foreign confidence=low phase=orchestrator-v0-b messageKey=pick_one ms=9337
- **CONFIDENCE:** low
- **EVIDENCE:** ORCID:Emily Chen@orcid.org; Wikidata:Xiaofan Chen — author of 2012 doctoral thesis at University of Auckland tit@www.wikidata.org; Wikidata:Wikidata search: Emily Chen@www.wikidata.org; Wikidata:Emily Chenevert — American politician@www.wikidata.org; VIAF:Emily Cheney Neville 1919-1997@viaf.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### near-netenyahu-typo [near/new] — PASS

- **INPUT:** `{"q": "Netenyahu"}` (GET)
- **EXPECTED:** ui∈[dossier\|need_context\|candidates\|thin] · must_not=wrong_person_dossier
- **ACTUAL:** uiState=need_context mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b messageKey=common_name ms=5837
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### near-zehava-missing-alef [near/new] — PASS

- **INPUT:** `{"q": "זהבה גלון"}` (GET)
- **EXPECTED:** ui∈[dossier\|need_context\|candidates\|thin] · must_not=wrong_person_dossier
- **ACTUAL:** uiState=thin mode=google qid=None photo=False images=0 faces=False sources=0 scenario=stranger confidence=none phase=orchestrator-v0-b messageKey=no_public_sources ms=45341
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### duplicate-michael-brown [duplicate/new] — PASS

- **INPUT:** `{"q": "Michael Brown"}` (GET)
- **EXPECTED:** ui∈[need_context\|candidates] · 0 faces · must_not=dossier+faces,fake_dossier
- **ACTUAL:** uiState=need_context mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b messageKey=common_name ms=5842
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### duplicate-john-smith-bare [duplicate/new] — PASS

- **INPUT:** `{"q": "John Smith"}` (GET)
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier+faces,faces,fake_dossier
- **ACTUAL:** uiState=need_context mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b messageKey=common_name ms=5833
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

### alias-lapid-bare [alias/new] — PASS

- **INPUT:** `{"q": "לפיד"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q1396120 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q1396120 photo=True images=7 faces=True sources=1 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=4118
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q1396120@www.wikidata.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### alias-gantz-bare [alias/new] — PASS

- **INPUT:** `{"q": "גנץ"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q16131258 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q16131258 photo=True images=6 faces=True sources=1 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=6987
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q16131258@www.wikidata.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### alias-bibi-alone [alias/new] — PASS

- **INPUT:** `{"q": "ביבי"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q43723 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q43723 photo=True images=7 faces=True sources=1 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=2029
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q43723@www.wikidata.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### alias-obama-surname [alias/new] — PASS

- **INPUT:** `{"q": "Obama"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q76 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q76 photo=False images=6 faces=True sources=3 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=2062
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q76@www.wikidata.org; Open Library:Barack Obama@openlibrary.orgol529531a; Open Library:Barack Obama@openlibrary.orgol13898264a
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### translit-meloni-bare [transliteration/new] — PASS

- **INPUT:** `{"q": "Meloni"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q451791 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q451791 photo=False images=6 faces=True sources=3 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=3132
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q451791@www.wikidata.org; Open Library:Julie C. Meloni@openlibrary.orgol1395088a; Open Library:Giuseppe Meloni@openlibrary.orgol484098a
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### translit-giorgia-meloni [transliteration/new] — PASS

- **INPUT:** `{"q": "Giorgia Meloni"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q451791 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q451791 photo=True images=7 faces=True sources=3 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1728
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q451791@www.wikidata.org; Open Library:Giorgia Meloni@openlibrary.orgol11595640a; Open Library:Giorgia Meloni@openlibrary.orgol7101509a
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### translit-assaf-rappaport [transliteration/new] — FAIL

- **INPUT:** `{"q": "Assaf Rappaport"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · faces
- **ACTUAL:** uiState=need_context mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b messageKey=common_name ms=5829
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** FAIL — uiState=need_context expected dossier; qid=None expected Q47507930; faces expected
- **ERROR TYPE:** OVER-GATE
- **CONFUSION:** FN

### translit-obama-en [transliteration/new] — PASS

- **INPUT:** `{"q": "Barack Obama"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q76 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q76 photo=False images=6 faces=True sources=3 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1795
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q76@www.wikidata.org; Open Library:Barack Obama@openlibrary.orgol529531a; Open Library:Barack Obama@openlibrary.orgol13898264a
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### translit-yair-lapid-en [transliteration/new] — PASS

- **INPUT:** `{"q": "Yair Lapid"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q1396120 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q1396120 photo=True images=7 faces=True sources=2 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=1810
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q1396120@www.wikidata.org; Open Library:Yair Lapid@openlibrary.orgol4181325a
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### translit-zahava-gal-on [transliteration/new] — PASS

- **INPUT:** `{"q": "Zahava Gal-On"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q2630062 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q2630062 photo=True images=7 faces=True sources=1 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=3198
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q2630062@www.wikidata.org
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### diaspora-rahm-emanuel [exact/new] — PASS

- **INPUT:** `{"q": "Rahm Emanuel"}` (GET)
- **EXPECTED:** ui∈[dossier] · qid=Q298443 · faces
- **ACTUAL:** uiState=dossier mode=wiki+google qid=Q298443 photo=True images=7 faces=True sources=3 scenario=known confidence=high phase=orchestrator-v0-b messageKey=dossier_ready ms=3518
- **CONFIDENCE:** high
- **EVIDENCE:** Wikidata:Q298443@www.wikidata.org; Open Library:Rahm Emanuel@openlibrary.orgol3107868a; Open Library:Rahm Emanuel@openlibrary.orgol6925400a
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TP

### smoke-smith-ibm-ny [conflict/smoke] — PASS

- **INPUT:** `{"q": "John Smith", "ctx": {"org": "IBM", "city": "New York", "country": "US"}}` (POST)
- **EXPECTED:** ui∈[candidates\|need_context\|thin] · 0 faces · must_not=dossier+faces,fake_dossier
- **ACTUAL:** uiState=thin mode=ambiguous qid=None photo=False images=0 faces=False sources=0 scenario=foreign confidence=none phase=orchestrator-v0-b messageKey=no_public_sources ms=13878
- **CONFIDENCE:** none
- **EVIDENCE:** none
- **PASS/FAIL:** PASS
- **ERROR TYPE:** —
- **CONFUSION:** TN

## Pretty-wrong verdict

**CLEAR** — no dossier+faces on conflict/garbage/unknown/ambiguous traps.

## Recommendation

**GO** from Accuracy (דיוק) with evidence: 1 non-critical FAIL(s) — GO with caveats.

## Room summary (HE · 4 sentences)

רצנו הערכת דיוק חיה (HTTP) מול האליאס אחרי P1 (`dpl_D2zvC3QvUVgz6kaSaWqnSUCoD9hU`) — 35 מקרים מתוך סט v2 (34) פלוס סמוק IBM+NY, ללא דילוגים. תוצאה: 34 PASS / 1 FAIL; pretty-wrong=0; OVER-GATE=1; TP/FP/TN/FN=19/0/15/1; phase=orchestrator-v0-b מאומת. רגרסיות P1 (נתניהו/ביבי/Zehava/Merkel) ו-KEEP בטיחות (דני כהן, John Smith, אימייל, IBM+NY): כולן PASS. המלצת Accuracy: **GO** (כשלים: translit-assaf-rappaport); דוחות: ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.md/.json + ACCURACY_REPORT.md.

