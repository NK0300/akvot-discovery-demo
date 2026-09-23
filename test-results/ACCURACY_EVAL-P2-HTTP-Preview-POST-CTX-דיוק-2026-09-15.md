# ACCURACY_EVAL · P2 HTTP · Preview · POST-CTX nested · dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT · דיוק · 2026-09-15

**HTTP probe:** /api/lookup?q=test → **HTTP 200** (NOT 403) · 8260ms · requestId ok=true
**Health:** /api/health → HTTP 200 · ok=true · **build=`dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT`** (match=true) · phase=orchestrator-v0-b · 2687ms

**Agent:** Accuracy (דיוק)  
**Preview URL:** https://akvot-simple-demo-8t702yisg-k-akvot.vercel.app  
**Deploy:** `dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT`  
**When:** 15/09/2026, 17:31:47 Asia/Jerusalem (UTC+3)  
**Phase expected:** orchestrator-v0-b  
**Case set:** `handoff/P2-CASES-דיוק-2026-09-15.json` (N=18) — EXPECTED unchanged  
**Rules:** vercel curl · GET simple q · **POST nested** {q, ctx:{…}} for ctx · Origin=https://akvot-simple-demo.vercel.app · nocache=1 · timeout=65s · concurrency=2  
**Constraints:** NO product code changes · NO EXPECTED rewrite · NO promote  
**Elapsed:** 120.4s

## Summary metrics

| Metric | Value |
|--------|-------|
| N | 18 |
| PASS | 18 |
| FAIL | 0 |
| pretty-wrong | 0 |
| SAFETY lock P2-S01–S07 | **PASS** (7/7) |
| Health build | **PASS** `dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT` |
| requestId (probe) | **PASS** |
| P2-E01 entity-match | **PASS** (3/3) |
| P2-S03 Smith+IBM+NY+US | **PASS** ui=candidates qid=- faces=false |
| P2-A01 Assaf Rappaport | **PASS** ui=dossier qid=Q47507930 |
| P2-A03 אסף רפפורט | **PASS** ui=dossier qid=Q47507930 |
| P2-A05/A06 no Assaf QID | **PASS/PASS** qids=null/null |
| P2-E02 Emily | **PASS** ui=candidates |
| P2-L03 latency | **PASS** wall_ms=9178 timings.total=6524 |
| Recommendation (Acc Gate) | **GO** |
| Promote | **HOLD** (Acc eval only; do not promote) |

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
| P2-S01 | `דני כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=2757 | **PASS** | — |
| P2-S02 | `John Smith` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8005 | **PASS** | — |
| P2-S03 | `John Smith` + {"org":"IBM","city":"New York","country":"US"} | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=8783 | **PASS** | — |
| P2-S04 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9478 | **PASS** | — |
| P2-S05 | `Xzqplmnvwtr987654321asdfgh` | ui∈[need_context|thin] · 0 faces | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8256 | **PASS** | — |
| P2-S06 | `פלמוני אלמוניזקש` + {"org":"מפעל בדיקה פיקטיבי"} | ui∈[need_context|thin] · 0 faces | uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=47847 | **PASS** | — |
| P2-S07 | `כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=43218 | **PASS** | — |
| P2-K01 | `נתניהו` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=17,confidence=high,phase=orchestrator-v0-b,ms=9478 | **PASS** | — |
| P2-K02 | `Zehava Galon` | ui∈[dossier] · qid=Q2630062 | uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=11237 | **PASS** | — |
| P2-K03 | `Angela Merkel` | ui∈[dossier] · qid=Q567 | uiState=dossier,qid=Q567,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=9219 | **PASS** | — |
| P2-K04 | `אורלי לוי` | ui∈[dossier] · qid=Q466537 | uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=8947 | **PASS** | — |
| P2-A01 | `Assaf Rappaport` | ui∈[dossier] · qid=Q47507930 · faces | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=8926 | **PASS** | — |
| P2-A03 | `אסף רפפורט` | ui∈[dossier] · qid=Q47507930 | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=10217 | **PASS** | — |
| P2-A05 | `Assaf Smith` | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8805 | **PASS** | — |
| P2-A06 | `John Rappaport` | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8194 | **PASS** | — |
| P2-E02 | `Emily Chen` + {"city":"Palo Alto","role":"student"} | ui∈[candidates|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=5,confidence=low,phase=orchestrator-v0-b,ms=11768 | **PASS** | — |
| P2-E04 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=12557 | **PASS** | — |
| P2-L03 | `Assaf Rappaport` | ui∈[dossier] · qid=Q47507930 · measure_ms | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=9178 | **PASS** | — |

## P2-E01 entity-match (layer helper; not in cases pack)

| Probe | Expect | Actual | Result |
|-------|--------|--------|--------|
| E01-url-noise-ib | false | false | **PASS** |
| E01-title-IBM | true | true | **PASS** |
| E01-url-boston | true | true | **PASS** |

## Observability

| Check | Result |
|-------|--------|
| health.build | `dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT` · match DEPLOY=true |
| health.phase | orchestrator-v0-b |
| probe requestId header | 0a912a68-4d38-416a-8032-7c7bb2c0fcc1 |
| probe requestId body | 0a912a68-4d38-416a-8032-7c7bb2c0fcc1 |
| requestId header===body | true |

## Detail

### P2-S01 · PASS
- **INPUT:** {"q":"דני כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=2757
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=2757, timings.total=0, requestId=049fcbaf-4371-4187-86de-1dec487f8398
- **Evidence:** none

### P2-S02 · PASS
- **INPUT:** {"q":"John Smith"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8005
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8005, timings.total=5500, requestId=7faa929d-036b-48b3-8825-3f197b890833
- **Evidence:** none

### P2-S03 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}}
- **EXPECTED:** ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=8783
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=8783, timings.total=5922, requestId=54672234-2191-4be7-9c72-b8edad4d1b3b
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-S04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9478
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=9478, timings.total=6842, requestId=0295e770-a57a-49a3-a988-6db372b58604
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-S05 · PASS
- **INPUT:** {"q":"Xzqplmnvwtr987654321asdfgh"}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8256
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8256, timings.total=5500, requestId=7d62307f-dc7c-45af-a7d1-cfc977ea7665
- **Evidence:** none

### P2-S06 · PASS
- **INPUT:** {"q":"פלמוני אלמוניזקש","ctx":{"org":"מפעל בדיקה פיקטיבי"}}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=47847
- **ACTUAL raw:** uiState=thin, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=47847, timings.total=45001, requestId=52b1c24b-f3bb-446c-b065-3d1747ed9153
- **Evidence:** none

### P2-S07 · PASS
- **INPUT:** {"q":"כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=43218
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=candidates, ms=43218, timings.total=40380, requestId=f93ed2a4-9c3d-4a05-a145-99127b6040bd
- **Evidence:** none

### P2-K01 · PASS
- **INPUT:** {"q":"נתניהו"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=17,confidence=high,phase=orchestrator-v0-b,ms=9478
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=17, confidence=high, phase=orchestrator-v0-b, mode=wiki, ms=9478, timings.total=2617, requestId=b7d31777-a4b2-4757-9c0e-303b7425eade
- **Evidence:** NLI:987007265800905171@www.nli.org.il; NLI HE:000098960@www.nli.org.il; ויקיפדיה:בנימין נתניהו@he.wikipedia.org; Wikidata:Q43723@www.wikidata.org; Wikipedia EN:Benjamin Netanyahu@en.wikipedia.org

### P2-K02 · PASS
- **INPUT:** {"q":"Zehava Galon"}
- **EXPECTED:** ui∈[dossier] · qid=Q2630062
- **ACTUAL:** uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=11237
- **ACTUAL raw:** uiState=dossier, qid=Q2630062, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=11237, timings.total=6211, requestId=9e330a4f-c787-4760-8596-b990f5afe223
- **Evidence:** Wikidata:Q2630062@www.wikidata.org

### P2-K03 · PASS
- **INPUT:** {"q":"Angela Merkel"}
- **EXPECTED:** ui∈[dossier] · qid=Q567
- **ACTUAL:** uiState=dossier,qid=Q567,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=9219
- **ACTUAL raw:** uiState=dossier, qid=Q567, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=9219, timings.total=6584, requestId=9982fae7-80e1-4353-98d8-00a9cff45c19
- **Evidence:** Wikidata:Q567@www.wikidata.org

### P2-K04 · PASS
- **INPUT:** {"q":"אורלי לוי"}
- **EXPECTED:** ui∈[dossier] · qid=Q466537
- **ACTUAL:** uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=8947
- **ACTUAL raw:** uiState=dossier, qid=Q466537, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=8947, timings.total=6326, requestId=4ccc93b9-669e-4f3d-a078-e2d2b788f2e1
- **Evidence:** Wikidata:Q466537@www.wikidata.org

### P2-A01 · PASS
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · faces
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=8926
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=8926, timings.total=6371, requestId=c6b11b87-edc0-4f93-be1d-1fa68720dc0d
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

### P2-A03 · PASS
- **INPUT:** {"q":"אסף רפפורט"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=10217
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=10217, timings.total=7469, requestId=bbab389e-3f6f-4e80-9346-fdf4c52222e9
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

### P2-A05 · PASS
- **INPUT:** {"q":"Assaf Smith"}
- **EXPECTED:** ui∈[need_context|candidates|thin] · must_not=qid:Q47507930
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8805
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8805, timings.total=5501, requestId=c38d1afa-bf42-4c6f-8fec-32616a48f611
- **Evidence:** none

### P2-A06 · PASS
- **INPUT:** {"q":"John Rappaport"}
- **EXPECTED:** ui∈[need_context|candidates|thin] · must_not=qid:Q47507930
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8194
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8194, timings.total=5501, requestId=edad3267-bd01-4aed-88aa-27b4ceba1181
- **Evidence:** none

### P2-E02 · PASS
- **INPUT:** {"q":"Emily Chen","ctx":{"city":"Palo Alto","role":"student"}}
- **EXPECTED:** ui∈[candidates|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=5,confidence=low,phase=orchestrator-v0-b,ms=11768
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=5, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=11768, timings.total=9003, requestId=8bd7fd1c-ebfc-4584-b226-6788fe83d174
- **Evidence:** ORCID:Emily Chen@orcid.org; VIAF:Emily Cheney Neville 1919-1997@viaf.org; VIAF:Emily Cheng, 1953-@viaf.org; VIAF:Emily Chenoweth@viaf.org; VIAF:Emily Cheney, 1952-@viaf.org
- **Notes:** Emily shape: ui=candidates (EXPECTED candidates|need_context; thin would be OTHER not pw)

### P2-E04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=12557
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=12557, timings.total=9533, requestId=6cb4b8a2-0ef3-47ef-b3b9-ea109e383e64
- **Evidence:** ORCID:John Smith@orcid.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-L03 · PASS
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · measure_ms
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=9178
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=9178, timings.total=6524, requestId=3b75f092-7d1b-4799-bed6-4e6495700cbd
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

- **A01** Assaf Rappaport → PASS · ui=dossier · qid=Q47507930 · ms=8926
- **A03** אסף רפפורט → PASS · ui=dossier · qid=Q47507930 · ms=10217
- **A05** Assaf Smith → PASS · ui=need_context · qid=null (must_not Q47507930)
- **A06** John Rappaport → PASS · ui=need_context · qid=null (must_not Q47507930)
- **L03** latency Assaf → PASS · wall_ms=9178 · timings.total=6524

## Optional POST×3 smoke · P2-S03 nested same shape

| Run | PASS/FAIL | ui | qid | faces | ms | fails |
|-----|-----------|----|-----|-------|----|-------|
| 1 | **PASS** | thin | - | false | 17957 | — |
| 2 | **PASS** | thin | - | false | 17752 | — |
| 3 | **PASS** | thin | - | false | 17855 | — |

**Smoke:** allPass=true · prettyWrong=0 · body=`{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"},"nocache":1}`

## Hebrew summary (room)

בדיקת HTTP Acc POST-CTX מקונן ל־P2 Preview (`dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT`): N=18, PASS=18, FAIL=0, pretty-wrong=0, SAFETY=PASS, S03=PASS/candidates, smoke×3=true. Health מחזיר build=`dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT` (התאמה=כן) · requestId=PASS. Assaf A01/A03 → dossier/dossier qid=Q47507930/Q47507930 · A05/A06 ללא Q47507930 · E01=PASS · E02 ui=candidates · L03 9178ms. המלצה לשער P2 Release: **GO** — all 18 cases PASS · pw=0 · SAFETY=PASS · health build match · requestId ok. ללא שינוי קוד מוצר · ללא rewrite ל־EXPECTED · ללא promote.
