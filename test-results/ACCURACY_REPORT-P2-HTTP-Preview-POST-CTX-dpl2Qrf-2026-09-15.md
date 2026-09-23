# ACCURACY_REPORT

**Latest eval:** ACCURACY_EVAL-P2-HTTP-Preview-POST-CTX-דיוק-2026-09-15 · deploy `dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT`  
**When:** 15/09/2026, 17:31:47 Asia/Jerusalem  
**Base:** Preview https://akvot-simple-demo-8t702yisg-k-akvot.vercel.app · deploy `dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT` · health build match · probe HTTP 200 (not 403) · requestId=ok  
**Totals:** N=18 · PASS=18 · FAIL=0 · pretty-wrong=0 · SAFETY=PASS · E01=PASS  
**Recommendation (P2 Release Gate):** **GO** — all 18 cases PASS · pw=0 · SAFETY=PASS · health build match · requestId ok

| Case | Cat | Expected | Actual | Confidence | Status | Error |
|------|-----|----------|--------|------------|--------|-------|
| P2-S01 | ambiguous | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=2757 | none | PASS | — |
| P2-S02 | duplicate | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=8005 | none | PASS | — |
| P2-S03 | conflict | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=8783 | low | PASS | — |
| P2-S04 | conflict | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | ui=candidates; qid=-; faces=false; src=6; ms=9478 | low | PASS | — |
| P2-S05 | non-match | ui∈[need_context|thin] · 0 faces | ui=need_context; qid=-; faces=false; src=0; ms=8256 | none | PASS | — |
| P2-S06 | unknown | ui∈[need_context|thin] · 0 faces | ui=thin; qid=-; faces=false; src=0; ms=47847 | none | PASS | — |
| P2-S07 | conflict | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=43218 | none | PASS | — |
| P2-K01 | exact | ui∈[dossier] · qid=Q43723 | ui=dossier; qid=Q43723; faces=true; src=17; ms=9478 | high | PASS | — |
| P2-K02 | transliteration | ui∈[dossier] · qid=Q2630062 | ui=dossier; qid=Q2630062; faces=true; src=1; ms=11237 | high | PASS | — |
| P2-K03 | transliteration | ui∈[dossier] · qid=Q567 | ui=dossier; qid=Q567; faces=true; src=1; ms=9219 | high | PASS | — |
| P2-K04 | exact | ui∈[dossier] · qid=Q466537 | ui=dossier; qid=Q466537; faces=true; src=1; ms=8947 | high | PASS | — |
| P2-A01 | exact | ui∈[dossier] · qid=Q47507930 · faces | ui=dossier; qid=Q47507930; faces=true; src=1; ms=8926 | high | PASS | — |
| P2-A03 | exact | ui∈[dossier] · qid=Q47507930 | ui=dossier; qid=Q47507930; faces=true; src=1; ms=10217 | high | PASS | — |
| P2-A05 | near-miss | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | ui=need_context; qid=-; faces=false; src=0; ms=8805 | none | PASS | — |
| P2-A06 | conflict | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | ui=need_context; qid=-; faces=false; src=0; ms=8194 | none | PASS | — |
| P2-E02 | partial | ui∈[candidates|need_context] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=5; ms=11768 | low | PASS | — |
| P2-E04 | conflict | ui∈[candidates|thin] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=12557 | low | PASS | — |
| P2-L03 | latency | ui∈[dossier] · qid=Q47507930 · measure_ms | ui=dossier; qid=Q47507930; faces=true; src=1; ms=9178 | high | PASS | — |

### P2-E01 (not in pack)
- E01-url-noise-ib: expect=false actual=false → PASS
- E01-title-IBM: expect=true actual=true → PASS
- E01-url-boston: expect=true actual=true → PASS

## Prior eval
Prior Preview Acc: SMITH-CTX dpl_9nM3 (flat POST bug · S03 pw) and Preview dpl_Dqzuc — **not** this dpl. This report is POST nested Acc on `dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT` only. Local POST-CTX: ACCURACY_REEVAL-P2-LOCAL-POST-CTX-דיוק-2026-09-15.
