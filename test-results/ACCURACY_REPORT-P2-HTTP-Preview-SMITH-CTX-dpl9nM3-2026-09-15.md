# ACCURACY_REPORT

**Latest eval:** ACCURACY_EVAL-P2-HTTP-Preview-SMITH-CTX-דיוק-2026-09-15  
**When:** 15/09/2026, 17:07:39 Asia/Jerusalem  
**Base:** Preview https://akvot-simple-demo-lwvupih3v-k-akvot.vercel.app · deploy `dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL` · health build match · probe HTTP 200 (not 403) · requestId=ok  
**Totals:** N=18 · PASS=16 · FAIL=2 · pretty-wrong=1 · SAFETY=FAIL · E01=PASS  
**Recommendation (P2 Release Gate):** **NO-GO** — 1 pretty-wrong — STOP

| Case | Cat | Expected | Actual | Confidence | Status | Error |
|------|-----|----------|--------|------------|--------|-------|
| P2-S01 | ambiguous | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=3867 | none | PASS | — |
| P2-S02 | duplicate | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=8602 | none | PASS | — |
| P2-S03 | conflict | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | ui=dossier; qid=Q1701775; faces=true; src=10; ms=12502 | high | FAIL | PRETTY-WRONG |
| P2-S04 | conflict | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | ui=candidates; qid=-; faces=false; src=6; ms=10504 | low | PASS | — |
| P2-S05 | non-match | ui∈[need_context|thin] · 0 faces | ui=need_context; qid=-; faces=false; src=0; ms=8446 | none | PASS | — |
| P2-S06 | unknown | ui∈[need_context|thin] · 0 faces | ui=thin; qid=-; faces=false; src=0; ms=47708 | none | PASS | — |
| P2-S07 | conflict | ui∈[need_context] · 0 faces · must_not=dossier | ui=thin; qid=-; faces=false; src=0; ms=47687 | none | FAIL | OTHER |
| P2-K01 | exact | ui∈[dossier] · qid=Q43723 | ui=dossier; qid=Q43723; faces=true; src=17; ms=4041 | high | PASS | — |
| P2-K02 | transliteration | ui∈[dossier] · qid=Q2630062 | ui=dossier; qid=Q2630062; faces=true; src=1; ms=4786 | high | PASS | — |
| P2-K03 | transliteration | ui∈[dossier] · qid=Q567 | ui=dossier; qid=Q567; faces=true; src=3; ms=3994 | high | PASS | — |
| P2-K04 | exact | ui∈[dossier] · qid=Q466537 | ui=dossier; qid=Q466537; faces=true; src=1; ms=5067 | high | PASS | — |
| P2-A01 | exact | ui∈[dossier] · qid=Q47507930 · faces | ui=dossier; qid=Q47507930; faces=true; src=1; ms=4216 | high | PASS | — |
| P2-A03 | exact | ui∈[dossier] · qid=Q47507930 | ui=dossier; qid=Q47507930; faces=true; src=1; ms=5649 | high | PASS | — |
| P2-A05 | near-miss | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | ui=need_context; qid=-; faces=false; src=0; ms=8249 | none | PASS | — |
| P2-A06 | conflict | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | ui=need_context; qid=-; faces=false; src=0; ms=8193 | none | PASS | — |
| P2-E02 | partial | ui∈[candidates|need_context] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=8594 | low | PASS | — |
| P2-E04 | conflict | ui∈[candidates|thin] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=9553 | low | PASS | — |
| P2-L03 | latency | ui∈[dossier] · qid=Q47507930 · measure_ms | ui=dossier; qid=Q47507930; faces=true; src=1; ms=5720 | high | PASS | — |

### P2-E01 (not in pack)
- E01-url-noise-ib: expect=false actual=false → PASS
- E01-title-IBM: expect=true actual=true → PASS
- E01-url-boston: expect=true actual=true → PASS

## Prior eval
Previous latest: ACCURACY_EVAL-P1-HTTP-dplDNf-דיוק-2026-09-15 (N=25, PASS=24, FAIL=0, PASS_DOCUMENTED_P2=1) on live alias dpl_DNf — superseded as *latest* by this P2 Preview HTTP Acc on `dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL`. Local layer-only: ACCURACY_REEVAL-P2-LOCAL-דיוק-2026-09-15 (N=18, PASS=17, FAIL=1 E02).
