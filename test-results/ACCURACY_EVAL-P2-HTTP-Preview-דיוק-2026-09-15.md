# ACCURACY_EVAL · P2 HTTP · Preview · דיוק · 2026-09-15

**HTTP probe:** /api/lookup?q=test → **HTTP 200** (NOT 403) · 8257ms · requestId ok=true
**Health:** /api/health → HTTP 200 · ok=true · **build=`dpl_DqzucMKykHVssELsCi91waZ5LCmg`** (match=true) · phase=orchestrator-v0-b · 2592ms

**Agent:** Accuracy (דיוק)  
**Preview URL:** https://akvot-simple-demo-48x7gx9a6-k-akvot.vercel.app  
**Deploy:** `dpl_DqzucMKykHVssELsCi91waZ5LCmg`  
**When:** 15/09/2026, 15:00:50 Asia/Jerusalem (UTC+3)  
**Phase expected:** orchestrator-v0-b  
**Case set:** `handoff/P2-CASES-דיוק-2026-09-15.json` (N=18) — EXPECTED unchanged  
**Rules:** vercel curl · GET simple q · POST JSON for ctx · Origin=https://akvot-simple-demo.vercel.app · nocache=1 · timeout=65s · concurrency=2  
**Constraints:** NO product code changes · NO EXPECTED rewrite · NO promote  
**Elapsed:** 92.8s

## Summary metrics

| Metric | Value |
|--------|-------|
| N | 18 |
| PASS | 18 |
| FAIL | 0 |
| pretty-wrong | 0 |
| SAFETY lock P2-S01–S07 | **PASS** (7/7) |
| Health build | **PASS** `dpl_DqzucMKykHVssELsCi91waZ5LCmg` |
| requestId (probe) | **PASS** |
| P2-E01 entity-match | **PASS** (3/3) |
| P2-A01 Assaf Rappaport | **PASS** ui=dossier qid=Q47507930 |
| P2-A03 אסף רפפורט | **PASS** ui=dossier qid=Q47507930 |
| P2-A05/A06 no Assaf QID | **PASS/PASS** qids=null/null |
| P2-E02 Emily | **PASS** ui=candidates |
| P2-L03 latency | **PASS** wall_ms=3720 timings.total=1191 |
| Recommendation | **GO** |

**Recommendation evidence:** all 18 cases PASS · pw=0 · SAFETY=PASS · health build match · requestId ok

### By category

| Category | N | PASS | FAIL |
|----------|---|------|------|
| ambiguous | 1 | 1 | 0 |
| duplicate | 1 | 1 | 0 |
| conflict | 5 | 5 | 0 |
| non-match | 1 | 1 | 0 |
| unknown | 1 | 1 | 0 |
| exact | 4 | 4 | 0 |
| transliteration | 2 | 2 | 0 |
| near-miss | 1 | 1 | 0 |
| partial | 1 | 1 | 0 |
| latency | 1 | 1 | 0 |

## Cases table

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR TYPE |
|----|-------|----------|--------|-----------|------------|
| P2-S01 | `דני כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=2673 | **PASS** | — |
| P2-S02 | `John Smith` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8306 | **PASS** | — |
| P2-S03 | `John Smith` + {"org":"IBM","city":"New York"} | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9355 | **PASS** | — |
| P2-S04 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=12337 | **PASS** | — |
| P2-S05 | `Xzqplmnvwtr987654321asdfgh` | ui∈[need_context|thin] · 0 faces | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8159 | **PASS** | — |
| P2-S06 | `פלמוני אלמוניזקש` + {"org":"מפעל בדיקה פיקטיבי"} | ui∈[need_context|thin] · 0 faces | uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=40953 | **PASS** | — |
| P2-S07 | `כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=40296 | **PASS** | — |
| P2-K01 | `נתניהו` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4293 | **PASS** | — |
| P2-K02 | `Zehava Galon` | ui∈[dossier] · qid=Q2630062 | uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4070 | **PASS** | — |
| P2-K03 | `Angela Merkel` | ui∈[dossier] · qid=Q567 | uiState=dossier,qid=Q567,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=4554 | **PASS** | — |
| P2-K04 | `אורלי לוי` | ui∈[dossier] · qid=Q466537 | uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3701 | **PASS** | — |
| P2-A01 | `Assaf Rappaport` | ui∈[dossier] · qid=Q47507930 · faces | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3423 | **PASS** | — |
| P2-A03 | `אסף רפפורט` | ui∈[dossier] · qid=Q47507930 | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3505 | **PASS** | — |
| P2-A05 | `Assaf Smith` | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8076 | **PASS** | — |
| P2-A06 | `John Rappaport` | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8281 | **PASS** | — |
| P2-E02 | `Emily Chen` + {"city":"Palo Alto","role":"student"} | ui∈[candidates|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=8662 | **PASS** | — |
| P2-E04 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9558 | **PASS** | — |
| P2-L03 | `Assaf Rappaport` | ui∈[dossier] · qid=Q47507930 · measure_ms | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3720 | **PASS** | — |

## P2-E01 entity-match (layer helper; not in cases pack)

| Probe | Expect | Actual | Result |
|-------|--------|--------|--------|
| E01-url-noise-ib | false | false | **PASS** |
| E01-title-IBM | true | true | **PASS** |
| E01-url-boston | true | true | **PASS** |

## Observability

| Check | Result |
|-------|--------|
| health.build | `dpl_DqzucMKykHVssELsCi91waZ5LCmg` · match DEPLOY=true |
| health.phase | orchestrator-v0-b |
| probe requestId header | 6ed9906b-6982-4f05-b7cc-58541e126ddb |
| probe requestId body | 6ed9906b-6982-4f05-b7cc-58541e126ddb |
| requestId header===body | true |

## Detail

### P2-S01 · PASS
- **INPUT:** {"q":"דני כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=2673
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=2673, timings.total=0, requestId=08c46bb5-c5cb-4348-a719-2eff2e15b915
- **Evidence:** none

### P2-S02 · PASS
- **INPUT:** {"q":"John Smith"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8306
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8306, timings.total=5500, requestId=e2a32aa8-a9e0-4674-9c43-0f4d9a3e6c46
- **Evidence:** none

### P2-S03 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"org":"IBM","city":"New York"}}
- **EXPECTED:** ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9355
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=9355, timings.total=6597, requestId=ccb304d6-a086-47a9-a535-8fd97135a79b
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-S04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=12337
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=12337, timings.total=9218, requestId=f7efca01-f80b-47fe-96ee-4d7cc14411b0
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-S05 · PASS
- **INPUT:** {"q":"Xzqplmnvwtr987654321asdfgh"}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8159
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8159, timings.total=5501, requestId=a5ba902b-2e42-4c63-8dbc-6ee7baf428ef
- **Evidence:** none

### P2-S06 · PASS
- **INPUT:** {"q":"פלמוני אלמוניזקש","ctx":{"org":"מפעל בדיקה פיקטיבי"}}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=40953
- **ACTUAL raw:** uiState=thin, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=40953, timings.total=37890, requestId=5bd5d5fd-a5f9-46b9-ab4b-946aa54bc800
- **Evidence:** none

### P2-S07 · PASS
- **INPUT:** {"q":"כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=40296
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=40296, timings.total=37363, requestId=22f151c0-4810-4617-ad91-227a70c0b913
- **Evidence:** none

### P2-K01 · PASS
- **INPUT:** {"q":"נתניהו"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4293
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=4293, timings.total=1331, requestId=d9ad1961-ee8e-43a3-9765-2e758fc3168d
- **Evidence:** Wikidata:Q43723@www.wikidata.org

### P2-K02 · PASS
- **INPUT:** {"q":"Zehava Galon"}
- **EXPECTED:** ui∈[dossier] · qid=Q2630062
- **ACTUAL:** uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4070
- **ACTUAL raw:** uiState=dossier, qid=Q2630062, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=4070, timings.total=1043, requestId=985b1162-45f8-4bf7-8b9a-72df32ed83c7
- **Evidence:** Wikidata:Q2630062@www.wikidata.org

### P2-K03 · PASS
- **INPUT:** {"q":"Angela Merkel"}
- **EXPECTED:** ui∈[dossier] · qid=Q567
- **ACTUAL:** uiState=dossier,qid=Q567,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=4554
- **ACTUAL raw:** uiState=dossier, qid=Q567, faces=true, sources=3, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=4554, timings.total=1795, requestId=f2d9911a-e186-40f0-8cff-74a5d53a189a
- **Evidence:** Wikidata:Q567@www.wikidata.org; Open Library:Angela Merkel@openlibrary.orgol638151a; Open Library:Angela Merkel@openlibrary.orgol16028602a

### P2-K04 · PASS
- **INPUT:** {"q":"אורלי לוי"}
- **EXPECTED:** ui∈[dossier] · qid=Q466537
- **ACTUAL:** uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3701
- **ACTUAL raw:** uiState=dossier, qid=Q466537, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=3701, timings.total=938, requestId=de06cfa4-c781-4f9a-ac2c-db01095f4288
- **Evidence:** Wikidata:Q466537@www.wikidata.org

### P2-A01 · PASS
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · faces
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3423
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=3423, timings.total=844, requestId=4f9c5e6b-655a-4224-ab43-fce9e4f2a70b
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

### P2-A03 · PASS
- **INPUT:** {"q":"אסף רפפורט"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3505
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=3505, timings.total=897, requestId=71fb0518-a267-4c61-a35c-bc0e52258075
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

### P2-A05 · PASS
- **INPUT:** {"q":"Assaf Smith"}
- **EXPECTED:** ui∈[need_context|candidates|thin] · must_not=qid:Q47507930
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8076
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8076, timings.total=5500, requestId=1214603a-bef4-48a0-b0f3-6cf2d64801e3
- **Evidence:** none

### P2-A06 · PASS
- **INPUT:** {"q":"John Rappaport"}
- **EXPECTED:** ui∈[need_context|candidates|thin] · must_not=qid:Q47507930
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8281
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8281, timings.total=5501, requestId=cac023d9-f396-47e6-bb7b-32aba61f70db
- **Evidence:** none

### P2-E02 · PASS
- **INPUT:** {"q":"Emily Chen","ctx":{"city":"Palo Alto","role":"student"}}
- **EXPECTED:** ui∈[candidates|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=8662
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=8662, timings.total=6008, requestId=ef4d5b3c-d644-4683-8363-2c1ccc780109
- **Evidence:** ORCID:Emily Chen@orcid.org; Open Library:Emily K. Chen@openlibrary.org; VIAF:Emily Cheney Neville 1919-1997@viaf.org; VIAF:Emily Cheng, 1953-@viaf.org; VIAF:Emily Chenoweth@viaf.org
- **Notes:** Emily shape: ui=candidates (EXPECTED candidates|need_context; thin would be OTHER not pw)

### P2-E04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9558
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=9558, timings.total=7050, requestId=5c1e2768-d210-418d-a448-8059b786dfce
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-L03 · PASS
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · measure_ms
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3720
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=3720, timings.total=1191, requestId=afc16818-8309-437f-8ced-eadb7327aded
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

## Pretty-wrong
None — CLEAR.

## SAFETY lock P2-S01–S07
**PASS** (7/7) — dossier forbidden; faces=0 preferred.

- P2-S01: ui=need_context faces=false → PASS
- P2-S02: ui=need_context faces=false → PASS
- P2-S03: ui=candidates faces=false → PASS
- P2-S04: ui=candidates faces=false → PASS
- P2-S05: ui=need_context faces=false → PASS
- P2-S06: ui=thin faces=false → PASS
- P2-S07: ui=need_context faces=false → PASS

## CRITICAL Assaf class

- **A01** Assaf Rappaport → PASS · ui=dossier · qid=Q47507930 · ms=3423
- **A03** אסף רפפורט → PASS · ui=dossier · qid=Q47507930 · ms=3505
- **A05** Assaf Smith → PASS · ui=need_context · qid=null (must_not Q47507930)
- **A06** John Rappaport → PASS · ui=need_context · qid=null (must_not Q47507930)
- **L03** latency Assaf → PASS · wall_ms=3720 · timings.total=1191

## Hebrew summary (room)

בדיקת HTTP Acc ל־P2 RC Preview (`dpl_DqzucMKykHVssELsCi91waZ5LCmg`): N=18, PASS=18, FAIL=0, pretty-wrong=0, SAFETY=PASS. Health מחזיר build=`dpl_DqzucMKykHVssELsCi91waZ5LCmg` (התאמה=כן) · requestId=PASS. Assaf A01/A03 → dossier/dossier qid=Q47507930/Q47507930 · A05/A06 ללא Q47507930 · E01=PASS · E02 ui=candidates · L03 3720ms. המלצה לשער P2 Release: **GO** — all 18 cases PASS · pw=0 · SAFETY=PASS · health build match · requestId ok. ללא שינוי קוד מוצר · ללא rewrite ל־EXPECTED · ללא promote.
