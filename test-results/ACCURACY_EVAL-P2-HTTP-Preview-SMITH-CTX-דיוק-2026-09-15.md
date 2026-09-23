# ACCURACY_EVAL · P2 HTTP · Preview · SMITH-CTX · dpl_9nM3 · דיוק · 2026-09-15

**HTTP probe:** /api/lookup?q=test → **HTTP 200** (NOT 403) · 8112ms · requestId ok=true
**Health:** /api/health → HTTP 200 · ok=true · **build=`dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL`** (match=true) · phase=orchestrator-v0-b · 2752ms

**Agent:** Accuracy (דיוק)  
**Preview URL:** https://akvot-simple-demo-lwvupih3v-k-akvot.vercel.app  
**Deploy:** `dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL`  
**When:** 15/09/2026, 17:07:39 Asia/Jerusalem (UTC+3)  
**Phase expected:** orchestrator-v0-b  
**Case set:** `handoff/P2-CASES-דיוק-2026-09-15.json` (N=18) — EXPECTED unchanged  
**Rules:** vercel curl · GET simple q · POST JSON for ctx · Origin=https://akvot-simple-demo.vercel.app · nocache=1 · timeout=65s · concurrency=2  
**Constraints:** NO product code changes · NO EXPECTED rewrite · NO promote  
**Elapsed:** 104.1s

## Summary metrics

| Metric | Value |
|--------|-------|
| N | 18 |
| PASS | 16 |
| FAIL | 2 |
| pretty-wrong | 1 |
| SAFETY lock P2-S01–S07 | **FAIL** (5/7) |
| Health build | **PASS** `dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL` |
| requestId (probe) | **PASS** |
| P2-E01 entity-match | **PASS** (3/3) |
| P2-S03 Smith+IBM+NY+US | **FAIL** ui=dossier qid=Q1701775 faces=true |
| P2-A01 Assaf Rappaport | **PASS** ui=dossier qid=Q47507930 |
| P2-A03 אסף רפפורט | **PASS** ui=dossier qid=Q47507930 |
| P2-A05/A06 no Assaf QID | **PASS/PASS** qids=null/null |
| P2-E02 Emily | **PASS** ui=candidates |
| P2-L03 latency | **PASS** wall_ms=5720 timings.total=2692 |
| Recommendation (Acc Gate) | **NO-GO** |
| Promote | **HOLD** (Acc eval only; do not promote) |

**Recommendation evidence:** 1 pretty-wrong — STOP

### By category

| Category | N | PASS | FAIL |
|----------|---|------|------|
| ambiguous | 1 | 1 | 0 |
| duplicate | 1 | 1 | 0 |
| conflict | 5 | 3 | 2 |
| non-match | 1 | 1 | 0 |
| unknown | 1 | 1 | 0 |
| exact | 4 | 4 | 0 |
| transliteration | 2 | 2 | 0 |
| near-miss | 1 | 1 | 0 |
| partial | 1 | 1 | 0 |
| latency | 1 | 1 | 0 |

### Error type counts (FAIL only)

| Error type | Count |
|------------|-------|
| PRETTY-WRONG | 1 |
| OTHER | 1 |

## Cases table

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR TYPE |
|----|-------|----------|--------|-----------|------------|
| P2-S01 | `דני כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=3867 | **PASS** | — |
| P2-S02 | `John Smith` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8602 | **PASS** | — |
| P2-S03 | `John Smith` + {"org":"IBM","city":"New York","country":"US"} | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | uiState=dossier,qid=Q1701775,faces=true,sources=10,confidence=high,phase=orchestrator-v0-b,ms=12502 | **FAIL** | PRETTY-WRONG |
| P2-S04 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=10504 | **PASS** | — |
| P2-S05 | `Xzqplmnvwtr987654321asdfgh` | ui∈[need_context|thin] · 0 faces | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8446 | **PASS** | — |
| P2-S06 | `פלמוני אלמוניזקש` + {"org":"מפעל בדיקה פיקטיבי"} | ui∈[need_context|thin] · 0 faces | uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=47708 | **PASS** | — |
| P2-S07 | `כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=47687 | **FAIL** | OTHER |
| P2-K01 | `נתניהו` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=17,confidence=high,phase=orchestrator-v0-b,ms=4041 | **PASS** | — |
| P2-K02 | `Zehava Galon` | ui∈[dossier] · qid=Q2630062 | uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4786 | **PASS** | — |
| P2-K03 | `Angela Merkel` | ui∈[dossier] · qid=Q567 | uiState=dossier,qid=Q567,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=3994 | **PASS** | — |
| P2-K04 | `אורלי לוי` | ui∈[dossier] · qid=Q466537 | uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5067 | **PASS** | — |
| P2-A01 | `Assaf Rappaport` | ui∈[dossier] · qid=Q47507930 · faces | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4216 | **PASS** | — |
| P2-A03 | `אסף רפפורט` | ui∈[dossier] · qid=Q47507930 | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5649 | **PASS** | — |
| P2-A05 | `Assaf Smith` | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8249 | **PASS** | — |
| P2-A06 | `John Rappaport` | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8193 | **PASS** | — |
| P2-E02 | `Emily Chen` + {"city":"Palo Alto","role":"student"} | ui∈[candidates|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=8594 | **PASS** | — |
| P2-E04 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9553 | **PASS** | — |
| P2-L03 | `Assaf Rappaport` | ui∈[dossier] · qid=Q47507930 · measure_ms | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5720 | **PASS** | — |

## P2-E01 entity-match (layer helper; not in cases pack)

| Probe | Expect | Actual | Result |
|-------|--------|--------|--------|
| E01-url-noise-ib | false | false | **PASS** |
| E01-title-IBM | true | true | **PASS** |
| E01-url-boston | true | true | **PASS** |

## Observability

| Check | Result |
|-------|--------|
| health.build | `dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL` · match DEPLOY=true |
| health.phase | orchestrator-v0-b |
| probe requestId header | fbc71a3c-0ac6-467f-82eb-66587709714a |
| probe requestId body | fbc71a3c-0ac6-467f-82eb-66587709714a |
| requestId header===body | true |

## Detail

### P2-S01 · PASS
- **INPUT:** {"q":"דני כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=3867
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=3867, timings.total=1, requestId=57a0decf-5ed6-4a70-8c50-c3c3571b6cc4
- **Evidence:** none

### P2-S02 · PASS
- **INPUT:** {"q":"John Smith"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8602
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8602, timings.total=5300, requestId=5a11d89c-71ad-47e5-8e8a-c654bb0c7a7b
- **Evidence:** none

### P2-S03 · FAIL
- **INPUT:** {"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}}
- **EXPECTED:** ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=dossier,qid=Q1701775,faces=true,sources=10,confidence=high,phase=orchestrator-v0-b,ms=12502
- **ACTUAL raw:** uiState=dossier, qid=Q1701775, faces=true, sources=10, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=12502, timings.total=9794, requestId=02263da4-9053-43c9-90fa-8e220c101c69
- **Evidence:** Wikidata:Q1701775@www.wikidata.org; Wikidata:Wikidata search: John Smith@www.wikidata.org; Wikidata:John Smith — fifth Presiding Patriarch of The Church of Jesus Christ of L@www.wikidata.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org
- **Fails:** uiState=dossier expected candidates|thin|need_context; faces must be 0; must_not dossier; SAFETY: dossier on S-case; must_not Q1701775

### P2-S04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=10504
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=10504, timings.total=7527, requestId=4e32cc71-cd5e-4588-afdf-632a7c9475ae
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-S05 · PASS
- **INPUT:** {"q":"Xzqplmnvwtr987654321asdfgh"}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8446
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8446, timings.total=5501, requestId=ae238b5f-4562-42d8-b197-53cbb0bc100a
- **Evidence:** none

### P2-S06 · PASS
- **INPUT:** {"q":"פלמוני אלמוניזקש","ctx":{"org":"מפעל בדיקה פיקטיבי"}}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=47708
- **ACTUAL raw:** uiState=thin, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=47708, timings.total=45001, requestId=7af21c6c-9119-431d-80ba-175d9478df96
- **Evidence:** none

### P2-S07 · FAIL
- **INPUT:** {"q":"כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=47687
- **ACTUAL raw:** uiState=thin, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=47687, timings.total=45000, requestId=3bde5414-d97d-452f-909a-b2d1574fbeff
- **Evidence:** none
- **Fails:** uiState=thin expected need_context

### P2-K01 · PASS
- **INPUT:** {"q":"נתניהו"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=17,confidence=high,phase=orchestrator-v0-b,ms=4041
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=17, confidence=high, phase=orchestrator-v0-b, mode=wiki, ms=4041, timings.total=1358, requestId=3c0c6f47-7f43-457d-8808-325b7298adc6
- **Evidence:** NLI:987007265800905171@www.nli.org.il; NLI HE:000098960@www.nli.org.il; ויקיפדיה:בנימין נתניהו@he.wikipedia.org; Wikidata:Q43723@www.wikidata.org; Wikipedia EN:Benjamin Netanyahu@en.wikipedia.org

### P2-K02 · PASS
- **INPUT:** {"q":"Zehava Galon"}
- **EXPECTED:** ui∈[dossier] · qid=Q2630062
- **ACTUAL:** uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4786
- **ACTUAL raw:** uiState=dossier, qid=Q2630062, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=4786, timings.total=2053, requestId=9092cfd6-3048-4028-b447-c031bdde2e9a
- **Evidence:** Wikidata:Q2630062@www.wikidata.org

### P2-K03 · PASS
- **INPUT:** {"q":"Angela Merkel"}
- **EXPECTED:** ui∈[dossier] · qid=Q567
- **ACTUAL:** uiState=dossier,qid=Q567,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=3994
- **ACTUAL raw:** uiState=dossier, qid=Q567, faces=true, sources=3, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=3994, timings.total=1068, requestId=9eded62a-8642-4530-b886-4051119fe461
- **Evidence:** Wikidata:Q567@www.wikidata.org; Open Library:Angela Merkel@openlibrary.orgol638151a; Open Library:Angela Merkel@openlibrary.orgol16028602a

### P2-K04 · PASS
- **INPUT:** {"q":"אורלי לוי"}
- **EXPECTED:** ui∈[dossier] · qid=Q466537
- **ACTUAL:** uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5067
- **ACTUAL raw:** uiState=dossier, qid=Q466537, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=5067, timings.total=2454, requestId=310899de-b943-453c-ae81-07f722a1d964
- **Evidence:** Wikidata:Q466537@www.wikidata.org

### P2-A01 · PASS
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · faces
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4216
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=4216, timings.total=1707, requestId=c45f9683-794c-4e51-8c9a-b20a4531574a
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

### P2-A03 · PASS
- **INPUT:** {"q":"אסף רפפורט"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5649
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=5649, timings.total=2835, requestId=4abc661d-126c-463e-9af0-09d429c431f2
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

### P2-A05 · PASS
- **INPUT:** {"q":"Assaf Smith"}
- **EXPECTED:** ui∈[need_context|candidates|thin] · must_not=qid:Q47507930
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8249
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8249, timings.total=5501, requestId=ec9748bd-4631-4cb1-9fea-5418f8b57ba2
- **Evidence:** none

### P2-A06 · PASS
- **INPUT:** {"q":"John Rappaport"}
- **EXPECTED:** ui∈[need_context|candidates|thin] · must_not=qid:Q47507930
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8193
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8193, timings.total=5500, requestId=268b523c-124c-4ada-a64e-6a1bfe7dabdf
- **Evidence:** none

### P2-E02 · PASS
- **INPUT:** {"q":"Emily Chen","ctx":{"city":"Palo Alto","role":"student"}}
- **EXPECTED:** ui∈[candidates|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=8594
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=8594, timings.total=6053, requestId=442f6a3e-f3ef-4ad1-8b09-3b605505a311
- **Evidence:** ORCID:Emily Chen@orcid.org; Open Library:Emily K. Chen@openlibrary.org; VIAF:Emily Cheney Neville 1919-1997@viaf.org; VIAF:Emily Cheng, 1953-@viaf.org; VIAF:Emily Chenoweth@viaf.org
- **Notes:** Emily shape: ui=candidates (EXPECTED candidates|need_context; thin would be OTHER not pw)

### P2-E04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9553
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=9553, timings.total=6913, requestId=f27a30a0-a1b2-4ac3-be19-ee2c21e99bfb
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-L03 · PASS
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · measure_ms
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5720
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=5720, timings.total=2692, requestId=0833d566-6482-4fd3-97eb-13bef0d4ffb5
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

## Pretty-wrong
- P2-S03: uiState=dossier expected candidates|thin|need_context; faces must be 0; must_not dossier; SAFETY: dossier on S-case; must_not Q1701775

## SAFETY lock P2-S01–S07
**FAIL** (5/7) — dossier forbidden; faces=0 preferred.

- P2-S01: ui=need_context faces=false → PASS
- P2-S02: ui=need_context faces=false → PASS
- P2-S03: ui=dossier faces=true → FAIL
- P2-S04: ui=candidates faces=false → PASS
- P2-S05: ui=need_context faces=false → PASS
- P2-S06: ui=thin faces=false → PASS
- P2-S07: ui=thin faces=false → FAIL

## CRITICAL Assaf class

- **A01** Assaf Rappaport → PASS · ui=dossier · qid=Q47507930 · ms=4216
- **A03** אסף רפפורט → PASS · ui=dossier · qid=Q47507930 · ms=5649
- **A05** Assaf Smith → PASS · ui=need_context · qid=null (must_not Q47507930)
- **A06** John Rappaport → PASS · ui=need_context · qid=null (must_not Q47507930)
- **L03** latency Assaf → PASS · wall_ms=5720 · timings.total=2692

## Hebrew summary (room)

בדיקת HTTP Acc ל־P2 RC Preview (`dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL`): N=18, PASS=16, FAIL=2, pretty-wrong=1, SAFETY=FAIL. Health מחזיר build=`dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL` (התאמה=כן) · requestId=PASS. Assaf A01/A03 → dossier/dossier qid=Q47507930/Q47507930 · A05/A06 ללא Q47507930 · E01=PASS · E02 ui=candidates · L03 5720ms. המלצה לשער P2 Release: **NO-GO** — 1 pretty-wrong — STOP. ללא שינוי קוד מוצר · ללא rewrite ל־EXPECTED · ללא promote.

# Optional smoke · Smith+IBM+NY+country=US ×3 · dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL

Method: vercel curl GET /api/lookup?q=John+Smith&org=IBM&city=New+York&country=US&nocache=1
When: 2026-09-15 17:09:49 IDT

## Run 1
- HTTP 200 · uiState=candidates · qid=None · faces=False · confidence=low · sources=6 · phase=orchestrator-v0-b · requestId=0a3e3b3d-70e5-40c1-9ad8-9ee485c6fac0
- must_not_check: dossier=ok · Q1701775=ok · faces0=ok

## Run 2
- HTTP 200 · uiState=candidates · qid=None · faces=False · confidence=low · sources=6 · phase=orchestrator-v0-b · requestId=bedf9c92-c535-4e3d-ba4b-0c148883c95c
- must_not_check: dossier=ok · Q1701775=ok · faces0=ok

## Run 3
- HTTP 200 · uiState=candidates · qid=None · faces=False · confidence=low · sources=6 · phase=orchestrator-v0-b · requestId=ca8783dc-6848-49ef-a5c6-4abf3413007f
- must_not_check: dossier=ok · Q1701775=ok · faces0=ok



## Method note (S03)

- **Pack P2-S03** uses **POST** JSON `{q, org, city, country}` → **FAIL** ui=`dossier` qid=`Q1701775` faces=true (**pretty-wrong**).
- **Optional smoke GET×3** same fields as querystring → **PASS** ui=`candidates` qid=null faces=0 (all 3).
- Acc Gate treats pack POST result as authoritative → **NO-GO**; promote remains **HOLD**.
