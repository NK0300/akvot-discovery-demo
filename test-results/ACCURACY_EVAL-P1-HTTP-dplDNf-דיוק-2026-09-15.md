HTTP probe: /api/lookup → HTTP 200 (NOT 403) · live alias dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu

# ACCURACY_EVAL · P1 HTTP · dplDNf · דיוק · 2026-09-15

**Agent:** Accuracy (דיוק)  
**Live alias:** https://akvot-simple-demo.vercel.app  
**Deploy:** `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu`  
**When:** 15/09/2026, 00:52:16 Europe/Bucharest (UTC+3)  
**Phase expected:** orchestrator-v0-b  
**Case set:** `handoff/P1-CASES-דיוק-2026-09-14.json` (N=25) — EXPECTED unchanged  
**Rules:** GET simple q · POST JSON for ctx · Origin=https://akvot-simple-demo.vercel.app · nocache=1 · timeout=65s · concurrency=3  
**Assaf P06:** P2 — need_context|thin → PASS_DOCUMENTED_P2 (do not force dossier)  
**Elapsed:** 58.1s

## Summary metrics

| Metric | Value |
|--------|-------|
| N | 25 |
| PASS | 24 |
| FAIL | 0 |
| PASS_DOCUMENTED_P2 | 1 |
| pretty-wrong | 0 |
| SAFETY lock S01–S07 | **PASS** (7/7) |
| Recommendation | **GO** |

**Recommendation evidence:** all strict+documented pass (PASS=24, PASS_DOCUMENTED_P2=1)

### By category

| Category | N | PASS | FAIL | P2 |
|----------|---|------|------|----|
| ambiguous | 2 | 2 | 0 | 0 |
| duplicate | 2 | 2 | 0 | 0 |
| conflict | 3 | 3 | 0 | 0 |
| non-match | 2 | 1 | 0 | 1 |
| unknown | 1 | 1 | 0 | 0 |
| exact | 4 | 4 | 0 | 0 |
| alias | 4 | 4 | 0 | 0 |
| transliteration | 4 | 4 | 0 | 0 |
| near | 2 | 2 | 0 | 0 |
| partial | 1 | 1 | 0 | 0 |

## Cases table

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR TYPE |
|----|-------|----------|--------|-----------|------------|
| S01 | `דני כהן` | ui∈[need_context] · 0 faces · must_not=dossier,pretty_wrong | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=342 | **PASS** | — |
| S02 | `משה כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=779 | **PASS** | — |
| S03 | `John Smith` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=5264 | **PASS** | — |
| S04 | `John Smith` + {"org":"IBM","city":"New York"} | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=6261 | **PASS** | — |
| S05 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=6716 | **PASS** | — |
| S06 | `Xzqplmnvwtr987654321asdfgh` | ui∈[need_context|thin] · 0 faces | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=5914 | **PASS** | — |
| S07 | `פלמוני אלמוניזקש` + {"org":"מפעל בדיקה פיקטיבי"} | ui∈[need_context|thin] · 0 faces | uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=45234 | **PASS** | — |
| N01 | `בנימין נתניהו` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2399 | **PASS** | — |
| N02 | `נתניהו` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2169 | **PASS** | — |
| N03 | `ביבי נתניהו` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2496 | **PASS** | — |
| N04 | `ביבי` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=1526 | **PASS** | — |
| N05 | `Benjamin Netanyahu` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=1523 | **PASS** | — |
| N06 | `Bibi Netanyahu` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2957 | **PASS** | — |
| N07 | `Netanyahu` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=1524 | **PASS** | — |
| N08 | `אורלי לוי` | ui∈[dossier] · qid=Q466537 | uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=1972 | **PASS** | — |
| G01 | `זהבה גלאון` | ui∈[dossier] · qid=Q2630062 | uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2257 | **PASS** | — |
| G02 | `Zehava Galon` | ui∈[dossier] · qid=Q2630062 | uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2529 | **PASS** | — |
| G03 | `Zahava Gal-On` | ui∈[dossier] · qid=Q2630062 | uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2270 | **PASS** | — |
| M01 | `Angela Merkel` | ui∈[dossier] · qid=Q567 | uiState=dossier,qid=Q567,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=1549 | **PASS** | — |
| P01 | `יאיר לפיד` | ui∈[dossier] · qid=Q1396120 | uiState=dossier,qid=Q1396120,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=1555 | **PASS** | — |
| P02 | `לפיד` | ui∈[dossier] · qid=Q1396120 | uiState=dossier,qid=Q1396120,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=1390 | **PASS** | — |
| P03 | `כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=35338 | **PASS** | — |
| P04 | `Emily Chen` + {"city":"Palo Alto","role":"student"} | ui∈[candidates|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=6233 | **PASS** | — |
| P05 | `Michael Brown` | ui∈[need_context] · 0 faces | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=5706 | **PASS** | — |
| P06 | `Assaf Rappaport` | ui∈[need_context|thin|dossier] · P2 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=6080 | **PASS_DOCUMENTED_P2** | — |

## Detail

### S01 · PASS
- **INPUT:** {"q":"דני כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier,pretty_wrong
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=342
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=342
- **Evidence:** none

### S02 · PASS
- **INPUT:** {"q":"משה כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=779
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=779
- **Evidence:** none

### S03 · PASS
- **INPUT:** {"q":"John Smith"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=5264
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=5264
- **Evidence:** none

### S04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"org":"IBM","city":"New York"}}
- **EXPECTED:** ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=6261
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=6261
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### S05 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=6716
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=6716
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### S06 · PASS
- **INPUT:** {"q":"Xzqplmnvwtr987654321asdfgh"}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=5914
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=5914
- **Evidence:** none

### S07 · PASS
- **INPUT:** {"q":"פלמוני אלמוניזקש","ctx":{"org":"מפעל בדיקה פיקטיבי"}}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=45234
- **ACTUAL raw:** uiState=thin, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=45234
- **Evidence:** none

### N01 · PASS
- **INPUT:** {"q":"בנימין נתניהו"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2399
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=2399
- **Evidence:** Wikidata:Q43723@www.wikidata.org

### N02 · PASS
- **INPUT:** {"q":"נתניהו"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2169
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=2169
- **Evidence:** Wikidata:Q43723@www.wikidata.org

### N03 · PASS
- **INPUT:** {"q":"ביבי נתניהו"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2496
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=2496
- **Evidence:** Wikidata:Q43723@www.wikidata.org

### N04 · PASS
- **INPUT:** {"q":"ביבי"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=1526
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=1526
- **Evidence:** Wikidata:Q43723@www.wikidata.org

### N05 · PASS
- **INPUT:** {"q":"Benjamin Netanyahu"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=1523
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=3, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=1523
- **Evidence:** Wikidata:Q43723@www.wikidata.org; Open Library:Benjamin Netanyahu@openlibrary.orgol2674898a; Open Library:Benjamin Netanyahu@openlibrary.orgol5414495a

### N06 · PASS
- **INPUT:** {"q":"Bibi Netanyahu"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2957
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=2957
- **Evidence:** Wikidata:Q43723@www.wikidata.org

### N07 · PASS
- **INPUT:** {"q":"Netanyahu"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=1524
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=3, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=1524
- **Evidence:** Wikidata:Q43723@www.wikidata.org; Open Library:B. Netanyahu@openlibrary.orgol256939a; Open Library:Benjamin Netanyahu@openlibrary.orgol2674898a

### N08 · PASS
- **INPUT:** {"q":"אורלי לוי"}
- **EXPECTED:** ui∈[dossier] · qid=Q466537
- **ACTUAL:** uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=1972
- **ACTUAL raw:** uiState=dossier, qid=Q466537, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=1972
- **Evidence:** Wikidata:Q466537@www.wikidata.org

### G01 · PASS
- **INPUT:** {"q":"זהבה גלאון"}
- **EXPECTED:** ui∈[dossier] · qid=Q2630062
- **ACTUAL:** uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2257
- **ACTUAL raw:** uiState=dossier, qid=Q2630062, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=2257
- **Evidence:** Wikidata:Q2630062@www.wikidata.org

### G02 · PASS
- **INPUT:** {"q":"Zehava Galon"}
- **EXPECTED:** ui∈[dossier] · qid=Q2630062
- **ACTUAL:** uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2529
- **ACTUAL raw:** uiState=dossier, qid=Q2630062, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=2529
- **Evidence:** Wikidata:Q2630062@www.wikidata.org

### G03 · PASS
- **INPUT:** {"q":"Zahava Gal-On"}
- **EXPECTED:** ui∈[dossier] · qid=Q2630062
- **ACTUAL:** uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=2270
- **ACTUAL raw:** uiState=dossier, qid=Q2630062, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=2270
- **Evidence:** Wikidata:Q2630062@www.wikidata.org

### M01 · PASS
- **INPUT:** {"q":"Angela Merkel"}
- **EXPECTED:** ui∈[dossier] · qid=Q567
- **ACTUAL:** uiState=dossier,qid=Q567,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=1549
- **ACTUAL raw:** uiState=dossier, qid=Q567, faces=true, sources=3, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=1549
- **Evidence:** Wikidata:Q567@www.wikidata.org; Open Library:Angela Merkel@openlibrary.orgol638151a; Open Library:Angela Merkel@openlibrary.orgol16028602a

### P01 · PASS
- **INPUT:** {"q":"יאיר לפיד"}
- **EXPECTED:** ui∈[dossier] · qid=Q1396120
- **ACTUAL:** uiState=dossier,qid=Q1396120,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=1555
- **ACTUAL raw:** uiState=dossier, qid=Q1396120, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=1555
- **Evidence:** Wikidata:Q1396120@www.wikidata.org

### P02 · PASS
- **INPUT:** {"q":"לפיד"}
- **EXPECTED:** ui∈[dossier] · qid=Q1396120
- **ACTUAL:** uiState=dossier,qid=Q1396120,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=1390
- **ACTUAL raw:** uiState=dossier, qid=Q1396120, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=1390
- **Evidence:** Wikidata:Q1396120@www.wikidata.org

### P03 · PASS
- **INPUT:** {"q":"כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=35338
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=35338
- **Evidence:** none

### P04 · PASS
- **INPUT:** {"q":"Emily Chen","ctx":{"city":"Palo Alto","role":"student"}}
- **EXPECTED:** ui∈[candidates|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=6233
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=6233
- **Evidence:** ORCID:Emily Chen@orcid.org; Open Library:Emily K. Chen@openlibrary.org; VIAF:Emily Cheney Neville 1919-1997@viaf.org; VIAF:Emily Cheng, 1953-@viaf.org; VIAF:Emily Chenoweth@viaf.org

### P05 · PASS
- **INPUT:** {"q":"Michael Brown"}
- **EXPECTED:** ui∈[need_context] · 0 faces
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=5706
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=5706
- **Evidence:** none

### P06 · PASS_DOCUMENTED_P2
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[need_context|thin|dossier] · P2
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=6080
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=6080
- **Evidence:** none
- **Notes:** Assaf P2: need_context|thin acceptable — PASS_DOCUMENTED_P2

## Pretty-wrong
None — CLEAR.

## SAFETY lock S01–S07
**PASS** (7/7) — dossier forbidden; faces=0 preferred.

- S01: ui=need_context faces=false → PASS
- S02: ui=need_context faces=false → PASS
- S03: ui=need_context faces=false → PASS
- S04: ui=candidates faces=false → PASS
- S05: ui=candidates faces=false → PASS
- S06: ui=need_context faces=false → PASS
- S07: ui=thin faces=false → PASS

## Hebrew summary (room)

בדיקת HTTP חיה ל־25 מקרי P1 על alias dplDNf (probe HTTP 200, לא 403): PASS=24, FAIL=0, PASS_DOCUMENTED_P2=1, pretty-wrong=0, SAFETY=PASS. Assaf (P06) סומן P2 לפי מדיניות — need_context/thin כ־PASS_DOCUMENTED_P2 בלי לכפות dossier. המלצה: **GO** — all strict+documented pass (PASS=24, PASS_DOCUMENTED_P2=1).
