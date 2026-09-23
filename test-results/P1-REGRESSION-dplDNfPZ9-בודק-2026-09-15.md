# P1 REGRESSION · בודק · `dpl_DNfPZ9…` · 2026-09-15

- **when:** 15.9.2026 ~00:56 Asia/Jerusalem
- **BASE:** https://akvot-simple-demo.vercel.app
- **alias:** `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu`
- **HTTP:** 200
- **Source list:** `handoff/P1-REGRESSION-CASES-בודק-2026-09-14.md`
- **Verdict:** **PASS** · N=20 · PASS=20 · FAIL=0 · pretty-wrong=0

## Combined Gate Evidence (בודק)

| Gate | Result |
|------|--------|
| Full Release Suite | **PASS** · contract 5/5 · SAFETY 6/6 · ALIAS 4/4 · exit 0 |
| P1 Regression HTTP | **PASS** · 20/20 · pw=0 |
| Units (in suite) | **PASS** |

## A. SAFETY LOCK

| ID | INPUT | ACTUAL | Result |
|----|-------|--------|--------|
| S-A1 | דני כהן | need_context · 0 faces | PASS |
| S-A1b | משה כהן | need_context · 0 faces | PASS |
| S-A2 | John Smith | need_context · 0 faces | PASS |
| S-A3 | Smith+IBM+NY | thin · 0 faces | PASS |
| S-A4 | Smith+email | candidates · 0 faces | PASS |
| S-A5 | junk | need_context · 0 faces | PASS |
| S-A7 | obscure+fictional org | thin · 0 faces | PASS |

## B. P0 KEEP

| ID | INPUT | ACTUAL | Result |
|----|-------|--------|--------|
| K-B1 | בנימין נתניהו | dossier · Q43723 | PASS |
| K-B2 | אורלי לוי | dossier · Q466537 | PASS |
| K-B3 | units+contract+SAFETY | suite exit 0 | PASS |

## C. P1 TARGET RECALL

| ID | INPUT | ACTUAL | Result |
|----|-------|--------|--------|
| R-C1 | נתניהו | dossier · Q43723 | PASS |
| R-C2 | ביבי נתניהו | dossier · Q43723 | PASS |
| R-C2b | ביבי | dossier · Q43723 | PASS |
| R-C3 | Angela Merkel | dossier · Q567 | PASS |
| R-C4 | Zehava Galon | dossier · Q2630062 | PASS |
| R-C4b | זהבה גלאון | dossier · Q2630062 | PASS |
| R-C4c | Zahava Gal-On | dossier · Q2630062 | PASS |
| R-C5 | Benjamin Netanyahu | dossier · Q43723 | PASS |
| R-C6 | Bibi Netanyahu | dossier · Q43723 | PASS |
| R-C7 | Netanyahu | dossier · Q43723 | PASS |

## D. PRECISION

| ID | INPUT | ACTUAL | Result |
|----|-------|--------|--------|
| P-D2 | כהן bare | need_context · 0 faces | PASS |

## Files

- Suite: `RELEASE-SUITE-dplDNfPZ9-בודק-2026-09-15.md`
- Regression JSON: `P1-REGRESSION-dplDNfPZ9-בודק-2026-09-15.json`
- Cases: `handoff/P1-REGRESSION-CASES-בודק-2026-09-14.md`

*בודק · Evidence only · no code/EXPECTED changes · Assaf=P2 out of scope*
