# ACCURACY_REPORT

**Latest eval:** ACCURACY_EVAL-P2-HTTP-Preview-T-C6-דיוק-2026-09-15 · deploy `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk`  
**When:** 15/09/2026, 17:51:35 Asia/Jerusalem  
**Base:** Preview https://akvot-simple-demo-29yid8jo9-k-akvot.vercel.app · deploy `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk` · health build match · probe HTTP 200 (not 403) · requestId=ok  
**Totals:** N=18 · PASS=17 · FAIL=1 · pretty-wrong=0 · SAFETY=FAIL · E01=PASS  
**Recommendation (P2 Release Gate):** **NO-GO** — SAFETY lock failed

| Case | Cat | Expected | Actual | Confidence | Status | Error |
|------|-----|----------|--------|------------|--------|-------|
| P2-S01 | ambiguous | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=3046 | none | PASS | — |
| P2-S02 | duplicate | ui∈[need_context] · 0 faces · must_not=dossier | ui=need_context; qid=-; faces=false; src=0; ms=8090 | none | PASS | — |
| P2-S03 | conflict | ui∈[candidates|thin|need_context] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=8515 | low | PASS | — |
| P2-S04 | conflict | ui∈[candidates|thin] · 0 faces · must_not=dossier,email_leak | ui=candidates; qid=-; faces=false; src=6; ms=10693 | low | PASS | — |
| P2-S05 | non-match | ui∈[need_context|thin] · 0 faces | ui=need_context; qid=-; faces=false; src=0; ms=8862 | none | PASS | — |
| P2-S06 | unknown | ui∈[need_context|thin] · 0 faces | ui=thin; qid=-; faces=false; src=0; ms=50991 | none | PASS | — |
| P2-S07 | conflict | ui∈[need_context] · 0 faces · must_not=dossier | ui=thin; qid=-; faces=false; src=0; ms=48164 | none | FAIL | OTHER |
| P2-K01 | exact | ui∈[dossier] · qid=Q43723 | ui=dossier; qid=Q43723; faces=true; src=1; ms=5803 | high | PASS | — |
| P2-K02 | transliteration | ui∈[dossier] · qid=Q2630062 | ui=dossier; qid=Q2630062; faces=true; src=1; ms=5104 | high | PASS | — |
| P2-K03 | transliteration | ui∈[dossier] · qid=Q567 | ui=dossier; qid=Q567; faces=true; src=3; ms=5733 | high | PASS | — |
| P2-K04 | exact | ui∈[dossier] · qid=Q466537 | ui=dossier; qid=Q466537; faces=true; src=1; ms=4608 | high | PASS | — |
| P2-A01 | exact | ui∈[dossier] · qid=Q47507930 · faces | ui=dossier; qid=Q47507930; faces=true; src=1; ms=4516 | high | PASS | — |
| P2-A03 | exact | ui∈[dossier] · qid=Q47507930 | ui=dossier; qid=Q47507930; faces=true; src=1; ms=3898 | high | PASS | — |
| P2-A05 | near-miss | ui∈[need_context|candidates|thin] · must_not=qid:Q47507930 | ui=need_context; qid=-; faces=false; src=0; ms=8335 | none | PASS | — |
| P2-A06 | conflict | ui∈[need_context|candidates|thin] · must_not=dossier,qid:Q47507930,qid:Q105094696 | ui=need_context; qid=-; faces=false; src=0; ms=8416 | none | PASS | — |
| P2-E02 | partial | ui∈[candidates|need_context] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=9874 | low | PASS | — |
| P2-E04 | conflict | ui∈[candidates|thin] · 0 faces · must_not=dossier | ui=candidates; qid=-; faces=false; src=6; ms=10057 | low | PASS | — |
| P2-L03 | latency | ui∈[dossier] · qid=Q47507930 · measure_ms | ui=dossier; qid=Q47507930; faces=true; src=1; ms=4400 | high | PASS | — |

### P2-E01 (not in pack)
- E01-url-noise-ib: expect=false actual=false → PASS
- E01-title-IBM: expect=true actual=true → PASS
- E01-url-boston: expect=true actual=true → PASS

## Prior eval
Prior: POST-CTX dpl_2Qrf · LOCAL T-C6 layer PASS · REJECTED dpl_FEog… — **not** this dpl. This report is HTTP Acc T-C6 Preview on `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk` only. HOLD promote.
