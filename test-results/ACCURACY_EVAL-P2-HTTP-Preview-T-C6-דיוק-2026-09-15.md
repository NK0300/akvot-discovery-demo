# ACCURACY_EVAL · P2 HTTP · Preview · T-C6 · dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk · דיוק · 2026-09-15

**HTTP probe:** /api/lookup?q=test → **HTTP 200** (NOT 403) · 8237ms · requestId ok=true
**Health:** /api/health → HTTP 200 · ok=true · **build=`dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk`** (match=true) · phase=orchestrator-v0-b · 2902ms

**Agent:** Accuracy (דיוק)  
**Preview URL:** https://akvot-simple-demo-29yid8jo9-k-akvot.vercel.app  
**Deploy:** `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk`  
**When:** 15/09/2026, 17:51:35 Asia/Jerusalem (UTC+3)  
**Phase expected:** orchestrator-v0-b  
**Case set:** `handoff/P2-CASES-דיוק-2026-09-15.json` (N=18) — EXPECTED unchanged  
**Rules:** vercel curl · GET simple q · **POST nested** {q, ctx:{…}} for ctx · Origin=https://akvot-simple-demo.vercel.app · nocache=1 · timeout=65s · concurrency=2  
**Constraints:** NO product code changes · NO EXPECTED rewrite · NO promote · REJECTED dpl_FEog…  
**Focus:** T-C6 A06 John Rappaport · S03 POST nested · Assaf A01/A03  
**Elapsed:** 106.6s

## Summary metrics

| Metric | Value |
|--------|-------|
| N | 18 |
| PASS | 17 |
| FAIL | 1 |
| pretty-wrong | 0 |
| SAFETY lock P2-S01–S07 | **FAIL** (6/7) |
| Health build | **PASS** `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk` |
| requestId (probe) | **PASS** |
| P2-E01 entity-match | **PASS** (3/3) |
| P2-S03 Smith+IBM+NY+US | **PASS** ui=candidates qid=- faces=false |
| P2-A01 Assaf Rappaport | **PASS** ui=dossier qid=Q47507930 |
| P2-A03 אסף רפפורט | **PASS** ui=dossier qid=Q47507930 |
| P2-A05/A06 no Assaf QID | **PASS/PASS** qids=null/null |
| P2-A06 T-C6 John Rappaport | **PASS** ui=need_context qid=null faces=false pw=false |
| P2-E02 Emily | **PASS** ui=candidates |
| P2-L03 latency | **PASS** wall_ms=4400 timings.total=1606 |
| Recommendation (Acc Gate) | **NO-GO** |
| Promote | **HOLD** (Acc eval only; do not promote) |

**Recommendation evidence:** SAFETY lock failed — sole FAIL **P2-S07** `כהן` ui=`thin` expected `need_context` (OTHER · not dossier · faces=0 · **not pretty-wrong**). Critical A06/S03/Assaf/pw=0 all PASS.

### By category

| Category | N | PASS | FAIL |
|----------|---|------|------|
| ambiguous | 1 | 1 | 0 |
| duplicate | 1 | 1 | 0 |
| conflict | 5 | 4 | 1 |
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
| OTHER | 1 |

## Cases table

| ID | INPUT | EXPECTED | ACTUAL | PASS/FAIL | ERROR TYPE |
|----|-------|----------|--------|-----------|------------|
| P2-S01 | `דני כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=3046 | **PASS** | — |
| P2-S02 | `John Smith` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8090 | **PASS** | — |
| P2-S03 | `John Smith` + {"org":"IBM","city":"New York","country":"US"} | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=8515 | **PASS** | — |
| P2-S04 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=10693 | **PASS** | — |
| P2-S05 | `Xzqplmnvwtr987654321asdfgh` | ui∈[need_context|thin] · 0 faces | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8862 | **PASS** | — |
| P2-S06 | `פלמוני אלמוניזקש` + {"org":"מפעל בדיקה פיקטיבי"} | ui∈[need_context|thin] · 0 faces | uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=50991 | **PASS** | — |
| P2-S07 | `כהן` | ui∈[need_context] · 0 faces · must_not=dossier | uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=48164 | **FAIL** | OTHER |
| P2-K01 | `נתניהו` | ui∈[dossier] · qid=Q43723 | uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5803 | **PASS** | — |
| P2-K02 | `Zehava Galon` | ui∈[dossier] · qid=Q2630062 | uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5104 | **PASS** | — |
| P2-K03 | `Angela Merkel` | ui∈[dossier] · qid=Q567 | uiState=dossier,qid=Q567,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=5733 | **PASS** | — |
| P2-K04 | `אורלי לוי` | ui∈[dossier] · qid=Q466537 | uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4608 | **PASS** | — |
| P2-A01 | `Assaf Rappaport` | ui∈[dossier] · qid=Q47507930 · faces | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4516 | **PASS** | — |
| P2-A03 | `אסף רפפורט` | ui∈[dossier] · qid=Q47507930 | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3898 | **PASS** | — |
| P2-A05 | `Assaf Smith` | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8335 | **PASS** | — |
| P2-A06 | `John Rappaport` | ui∈[need_context|candidates|thin] · must_not=dossier,qid:Q47507930,qid:Q105094696 | uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8416 | **PASS** | — |
| P2-E02 | `Emily Chen` + {"city":"Palo Alto","role":"student"} | ui∈[candidates|need_context] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9874 | **PASS** | — |
| P2-E04 | `John Smith` + {"email":"qa.rethink.test@example.com"} | ui∈[candidates|thin] · 0 faces · must_not=dossier | uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=10057 | **PASS** | — |
| P2-L03 | `Assaf Rappaport` | ui∈[dossier] · qid=Q47507930 · measure_ms | uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4400 | **PASS** | — |

## P2-E01 entity-match (layer helper; not in cases pack)

| Probe | Expect | Actual | Result |
|-------|--------|--------|--------|
| E01-url-noise-ib | false | false | **PASS** |
| E01-title-IBM | true | true | **PASS** |
| E01-url-boston | true | true | **PASS** |

## Observability

| Check | Result |
|-------|--------|
| health.build | `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk` · match DEPLOY=true |
| health.phase | orchestrator-v0-b |
| probe requestId header | a79f828f-bed4-41e0-b74b-56543b8e3d89 |
| probe requestId body | a79f828f-bed4-41e0-b74b-56543b8e3d89 |
| requestId header===body | true |

## Detail

### P2-S01 · PASS
- **INPUT:** {"q":"דני כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=3046
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=3046, timings.total=0, requestId=af691ea3-154a-4f2f-b563-5def54ff2ebe
- **Evidence:** none

### P2-S02 · PASS
- **INPUT:** {"q":"John Smith"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8090
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8090, timings.total=5501, requestId=6ad0229d-64b0-465d-9172-29d863c388da
- **Evidence:** none

### P2-S03 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"}}
- **EXPECTED:** ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=8515
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=8515, timings.total=5848, requestId=44d1eb2b-e2aa-40ae-96d6-50e5ec280d52
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-S04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=10693
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=10693, timings.total=8052, requestId=bc5aa989-a85a-4325-be7e-de4d005e15e2
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-S05 · PASS
- **INPUT:** {"q":"Xzqplmnvwtr987654321asdfgh"}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8862
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=8862, timings.total=6221, requestId=29c4c142-4553-420f-ab84-f70b52fac7ff
- **Evidence:** none

### P2-S06 · PASS
- **INPUT:** {"q":"פלמוני אלמוניזקש","ctx":{"org":"מפעל בדיקה פיקטיבי"}}
- **EXPECTED:** ui∈[need_context|thin] · 0 faces
- **ACTUAL:** uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=50991
- **ACTUAL raw:** uiState=thin, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=50991, timings.total=45000, requestId=731a0656-0435-4fff-a40a-f541d5d070ba
- **Evidence:** none

### P2-S07 · FAIL
- **INPUT:** {"q":"כהן"}
- **EXPECTED:** ui∈[need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=thin,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=48164
- **ACTUAL raw:** uiState=thin, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=google, ms=48164, timings.total=45000, requestId=f144f50c-981a-4883-a216-aa8a895ca4ec
- **Evidence:** none
- **Fails:** uiState=thin expected need_context

### P2-K01 · PASS
- **INPUT:** {"q":"נתניהו"}
- **EXPECTED:** ui∈[dossier] · qid=Q43723
- **ACTUAL:** uiState=dossier,qid=Q43723,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5803
- **ACTUAL raw:** uiState=dossier, qid=Q43723, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=5803, timings.total=2853, requestId=f0470e4c-63d3-4dda-8569-9cbca266be00
- **Evidence:** Wikidata:Q43723@www.wikidata.org

### P2-K02 · PASS
- **INPUT:** {"q":"Zehava Galon"}
- **EXPECTED:** ui∈[dossier] · qid=Q2630062
- **ACTUAL:** uiState=dossier,qid=Q2630062,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=5104
- **ACTUAL raw:** uiState=dossier, qid=Q2630062, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=5104, timings.total=1703, requestId=84d1fc44-5b39-40b1-818c-3baee4d259e0
- **Evidence:** Wikidata:Q2630062@www.wikidata.org

### P2-K03 · PASS
- **INPUT:** {"q":"Angela Merkel"}
- **EXPECTED:** ui∈[dossier] · qid=Q567
- **ACTUAL:** uiState=dossier,qid=Q567,faces=true,sources=3,confidence=high,phase=orchestrator-v0-b,ms=5733
- **ACTUAL raw:** uiState=dossier, qid=Q567, faces=true, sources=3, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=5733, timings.total=2927, requestId=a0db1277-1251-4d25-89cb-5b433347cd1c
- **Evidence:** Wikidata:Q567@www.wikidata.org; Open Library:Angela Merkel@openlibrary.orgol638151a; Open Library:Angela Merkel@openlibrary.orgol16028602a

### P2-K04 · PASS
- **INPUT:** {"q":"אורלי לוי"}
- **EXPECTED:** ui∈[dossier] · qid=Q466537
- **ACTUAL:** uiState=dossier,qid=Q466537,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4608
- **ACTUAL raw:** uiState=dossier, qid=Q466537, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=4608, timings.total=1814, requestId=319ff8e6-910a-4325-a4c9-817230487984
- **Evidence:** Wikidata:Q466537@www.wikidata.org

### P2-A01 · PASS
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · faces
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4516
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=4516, timings.total=1546, requestId=13788832-a1c1-41aa-bc37-d9fbdc4b3681
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

### P2-A03 · PASS
- **INPUT:** {"q":"אסף רפפורט"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=3898
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=3898, timings.total=1226, requestId=ccb5305a-cc45-4ef5-b6e3-51b72555bb86
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

### P2-A05 · PASS
- **INPUT:** {"q":"Assaf Smith"}
- **EXPECTED:** ui∈[need_context|candidates|thin] · must_not=qid:Q47507930
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8335
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8335, timings.total=5500, requestId=1211bdea-ff99-4f71-9a5f-23b8474035df
- **Evidence:** none

### P2-A06 · PASS
- **INPUT:** {"q":"John Rappaport"}
- **EXPECTED:** ui∈[need_context|candidates|thin] · must_not=dossier,qid:Q47507930,qid:Q105094696
- **ACTUAL:** uiState=need_context,qid=-,faces=false,sources=0,confidence=none,phase=orchestrator-v0-b,ms=8416
- **ACTUAL raw:** uiState=need_context, qid=null, faces=false, sources=0, confidence=none, phase=orchestrator-v0-b, mode=ambiguous, ms=8416, timings.total=5500, requestId=7b3e988d-cd77-45d3-8b91-405e959531db
- **Evidence:** none

### P2-E02 · PASS
- **INPUT:** {"q":"Emily Chen","ctx":{"city":"Palo Alto","role":"student"}}
- **EXPECTED:** ui∈[candidates|need_context] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=9874
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=9874, timings.total=7142, requestId=19a17fdc-180d-4a6f-b231-51b731e3fc6f
- **Evidence:** ORCID:Emily Chen@orcid.org; Open Library:Emily K. Chen@openlibrary.org; VIAF:Emily Cheney Neville 1919-1997@viaf.org; VIAF:Emily Cheng, 1953-@viaf.org; VIAF:Emily Chenoweth@viaf.org
- **Notes:** Emily shape: ui=candidates (EXPECTED candidates|need_context; thin would be OTHER not pw)

### P2-E04 · PASS
- **INPUT:** {"q":"John Smith","ctx":{"email":"qa.rethink.test@example.com"}}
- **EXPECTED:** ui∈[candidates|thin] · 0 faces · must_not=dossier
- **ACTUAL:** uiState=candidates,qid=-,faces=false,sources=6,confidence=low,phase=orchestrator-v0-b,ms=10057
- **ACTUAL raw:** uiState=candidates, qid=null, faces=false, sources=6, confidence=low, phase=orchestrator-v0-b, mode=candidates, ms=10057, timings.total=7235, requestId=6a1828f5-f2fa-416a-8cc2-05420b5c86c3
- **Evidence:** Open Library:John Smith@openlibrary.org; VIAF:John Smith, 1580-1631@viaf.org; VIAF:John Smith, 1750-1836@viaf.org; VIAF:John Smith, 1749-1831@viaf.org; VIAF:John Smith Hurt, 1894-1966@viaf.org

### P2-L03 · PASS
- **INPUT:** {"q":"Assaf Rappaport"}
- **EXPECTED:** ui∈[dossier] · qid=Q47507930 · measure_ms
- **ACTUAL:** uiState=dossier,qid=Q47507930,faces=true,sources=1,confidence=high,phase=orchestrator-v0-b,ms=4400
- **ACTUAL raw:** uiState=dossier, qid=Q47507930, faces=true, sources=1, confidence=high, phase=orchestrator-v0-b, mode=wiki+google, ms=4400, timings.total=1606, requestId=c6456a5f-9b3e-4bdb-83ea-f8d3337c83bf
- **Evidence:** Wikidata:Q47507930@www.wikidata.org

## Pretty-wrong
None — CLEAR.

## SAFETY lock P2-S01–S07
**FAIL** (6/7) — dossier forbidden; faces=0 preferred.

- P2-S01: ui=need_context faces=false → PASS
- P2-S02: ui=need_context faces=false → PASS
- P2-S03: ui=candidates faces=false → PASS
- P2-S04: ui=candidates faces=false → PASS
- P2-S05: ui=need_context faces=false → PASS
- P2-S06: ui=thin faces=false → PASS
- P2-S07: ui=thin faces=false → FAIL

## CRITICAL Assaf class

- **A01** Assaf Rappaport → PASS · ui=dossier · qid=Q47507930 · ms=4516
- **A03** אסף רפפורט → PASS · ui=dossier · qid=Q47507930 · ms=3898
- **A05** Assaf Smith → PASS · ui=need_context · qid=null (must_not Q47507930)
- **A06** John Rappaport (T-C6) → PASS · ui=need_context · qid=null · faces=false (must_not dossier · Q47507930 · Q105094696 · qid null)
- **L03** latency Assaf → PASS · wall_ms=4400 · timings.total=1606

## Optional POST×3 smoke · P2-S03 nested same shape

| Run | PASS/FAIL | ui | qid | faces | ms | fails |
|-----|-----------|----|-----|-------|----|-------|
| 1 | **PASS** | candidates | - | false | 10159 | — |
| 2 | **PASS** | candidates | - | false | 8741 | — |
| 3 | **PASS** | candidates | - | false | 9379 | — |

**Smoke:** allPass=true · prettyWrong=0 · body=`{"q":"John Smith","ctx":{"org":"IBM","city":"New York","country":"US"},"nocache":1}`

## Acc gate note

- **T-C6 A06** John Rappaport: PASS · need_context · qid=null · not dossier · not Q105094696/Q47507930
- **S03** POST nested `{q,ctx:{org,city,country:US}}`: PASS · candidates · not dossier · not Q1701775 · smoke×3 PASS
- **Assaf A01/A03**: PASS · dossier · Q47507930
- **pw**: 0
- **Blocker for Acc GO**: SAFETY 6/7 — P2-S07 thin≠need_context (OTHER)
- **Promote**: **HOLD** always

## Hebrew summary (room)

בדיקת HTTP Acc T-C6 Preview (`dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk`): N=18, PASS=17, FAIL=1, pretty-wrong=0, SAFETY=FAIL, S03=PASS/candidates, smoke×3=true. Health מחזיר build=`dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk` (התאמה=כן) · requestId=PASS. Assaf A01/A03 → dossier/dossier qid=Q47507930/Q47507930 · A05/A06 ללא Q47507930 · E01=PASS · E02 ui=candidates · L03 4400ms. המלצה לשער P2 Release: **NO-GO** — SAFETY lock failed. ללא שינוי קוד מוצר · ללא rewrite ל־EXPECTED · ללא promote.
