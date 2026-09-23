# ACCURACY_REPORT

**Latest eval:** ACCURACY_EVAL-P2-HTTP-Preview-דיוק-2026-09-15  
**When:** 15/09/2026, 15:00:50 Asia/Jerusalem  
**Base:** Preview https://akvot-simple-demo-48x7gx9a6-k-akvot.vercel.app · deploy `dpl_DqzucMKykHVssELsCi91waZ5LCmg` · health build match · probe HTTP 200 (not 403) · requestId=ok  
**Totals:** N=18 · PASS=18 · FAIL=0 · pretty-wrong=0 · SAFETY=PASS · E01=PASS  
**Recommendation (P2 Release Gate):** **GO** — all 18 cases PASS · pw=0 · SAFETY=PASS · health build match · requestId ok

| Case | Cat | Expected | Actual | Confidence | Status | Error |
|------|-----|----------|--------|------------|--------|-------|
| P2-S01 | ambiguous | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=2673 | none | PASS | — |
| P2-S02 | duplicate | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=8306 | none | PASS | — |
| P2-S03 | conflict | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=9355 | low | PASS | — |
| P2-S04 | conflict | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | ui=candidates; qid=-; faces=false; src=6; ms=12337 | low | PASS | — |
| P2-S05 | non-match | ui∈[need_context|thin] · 0 faces | ui=need_context; qid=-; faces=false; src=0; ms=8159 | none | PASS | — |
| P2-S06 | unknown | ui∈[need_context|thin] · 0 faces | ui=thin; qid=-; faces=false; src=0; ms=40953 | none | PASS | — |
| P2-S07 | conflict | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=40296 | none | PASS | — |
| P2-K01 | exact | ui∈[dossier] · qid=Q43723 | ui=dossier; qid=Q43723; faces=true; src=1; ms=4293 | high | PASS | — |
| P2-K02 | transliteration | ui∈[dossier] · qid=Q2630062 | ui=dossier; qid=Q2630062; faces=true; src=1; ms=4070 | high | PASS | — |
| P2-K03 | transliteration | ui∈[dossier] · qid=Q567 | ui=dossier; qid=Q567; faces=true; src=3; ms=4554 | high | PASS | — |
| P2-K04 | exact | ui∈[dossier] · qid=Q466537 | ui=dossier; qid=Q466537; faces=true; src=1; ms=3701 | high | PASS | — |
| P2-A01 | exact | ui∈[dossier] · qid=Q47507930 · faces | ui=dossier; qid=Q47507930; faces=true; src=1; ms=3423 | high | PASS | — |
| P2-A03 | exact | ui∈[dossier] · qid=Q47507930 | ui=dossier; qid=Q47507930; faces=true; src=1; ms=3505 | high | PASS | — |
| P2-A05 | near-miss | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | ui=need_context; qid=-; faces=false; src=0; ms=8076 | none | PASS | — |
| P2-A06 | conflict | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | ui=need_context; qid=-; faces=false; src=0; ms=8281 | none | PASS | — |
| P2-E02 | partial | ui∈[candidates|need_context] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=8662 | low | PASS | — |
| P2-E04 | conflict | ui∈[candidates|thin] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=9558 | low | PASS | — |
| P2-L03 | latency | ui∈[dossier] · qid=Q47507930 · measure_ms | ui=dossier; qid=Q47507930; faces=true; src=1; ms=3720 | high | PASS | — |

### P2-E01 (not in pack)
- E01-url-noise-ib: expect=false actual=false → PASS
- E01-title-IBM: expect=true actual=true → PASS
- E01-url-boston: expect=true actual=true → PASS

## Prior eval
Previous latest: ACCURACY_EVAL-P1-HTTP-dplDNf-דיוק-2026-09-15 (N=25, PASS=24, FAIL=0, PASS_DOCUMENTED_P2=1) on live alias dpl_DNf — superseded as *latest* by this P2 Preview HTTP Acc on `dpl_DqzucMKykHVssELsCi91waZ5LCmg`. Local layer-only: ACCURACY_REEVAL-P2-LOCAL-דיוק-2026-09-15 (N=18, PASS=17, FAIL=1 E02).
