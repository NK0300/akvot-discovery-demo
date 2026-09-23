# Release Suite · בודק

- **when:** 15.9.2026, 0:51:14 Asia/Jerusalem
- **BASE:** https://akvot-simple-demo.vercel.app
- **exit:** `0` — PASS
- **סיכום:** ריליס עבר — units+contract+SAFETY ירוקים · ALIAS_RECALL מלא

## שערים (gates)

| Gate | תוצאה | פרטים |
|------|--------|--------|
| 1. Domain units | ✅ PASS | exit=0 · 114ms |
| 2. Contract identity-p0 | ✅ PASS | exit=0 · 30289ms |
| 3. SAFETY core | ✅ PASS | 6/6 (כולל soft PRODUCT) |
| 4. Red-team | ✅ PASS | 3/3 |
| 5. ALIAS_RECALL | ✅ PASS | 4/4 · לא מפיל יציאה |

## 3) SAFETY / runtime smoke

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| s1-netanyahu | dossier | wiki+google | Q43723 | true | 3380 | PASS |
| s2-dani-cohen | need_context | ambiguous | - | false | 230 | PASS |
| s3-smith-bare | need_context | ambiguous | - | false | 5717 | PASS |
| s4-smith-ibm | candidates | candidates | - | false | 6897 | PASS |
| s5-smith-email | candidates | candidates | - | false | 7415 | PASS |
| s6-orly-levy | dossier | wiki+google | Q466537 | true | 2330 | PASS · dossier preferred — OK |

## 4) Red-team

| id | ui | qid | faces | ms | תוצאה |
|----|----|-----|-------|----|--------|
| r1-junk-he | thin | - | false | 45215 | PASS |
| r2-smith-bare-covered | SKIP | - | false | 0 | SKIP |
| r3-conflict-skip | SKIP | - | false | 0 | SKIP |

## 5) ALIAS_RECALL

רק תיעוד — כשל רך **לא** מפיל את הסוויטה אלא אם pretty-wrong (dossier+faces על שאילתה לא-בטוחה / זהות שגויה).

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| a1-netanyahu-alone | dossier | wiki+google | Q43723 | true | 2198 | PASS |
| a2-bibi-netanyahu | dossier | wiki+google | Q43723 | true | 2701 | PASS |
| a3-angela-merkel | dossier | wiki+google | Q567 | true | 2224 | PASS |
| a4-zehava-galon | dossier | wiki+google | Q2630062 | true | 1250 | PASS |

## קבצים

- JSON: `test-results/RELEASE-SUITE-latest.json`
- MD: `test-results/RELEASE-SUITE-בודק-latest.md`
- Runner: `test-results/RELEASE-SUITE-בודק.mjs`

*נוצר ע״י בודק · ללא deploy · ללא שינוי lookup/orchestrator thresholds*


## 6) P1 EXTRA (handoff/P1-REGRESSION-CASES · probe after suite)

Target deploy: `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu` · alias https://akvot-simple-demo.vercel.app · probe 15.9.2026 ~00:53 Asia/Jerusalem

| ID | INPUT | EXPECTED | ACTUAL | vs EXPECTED |
|----|-------|----------|--------|-------------|
| R-C1 | נתניהו | dossier Q43723 | dossier Q43723 faces (suite a1) | PASS |
| R-C2 | ביבי נתניהו | dossier Q43723 | dossier Q43723 faces (suite a2) | PASS |
| R-C2b | ביבי | dossier Q43723 | dossier Q43723 faces=true | PASS |
| R-C3 | Angela Merkel | dossier Q567 | dossier Q567 faces (suite a3) | PASS |
| R-C3b | Merkel | dossier Q567 or need_context | dossier Q567 faces=true | PASS |
| R-C4 | Zehava Galon | dossier Q2630062 | dossier Q2630062 faces (suite a4) | PASS |
| R-C4b | זהבה גלאון | dossier Q2630062 | dossier Q2630062 faces=true | PASS |
| R-C5 | Benjamin Netanyahu | dossier Q43723 | dossier Q43723 faces=true | PASS |
| R-C7 | Netanyahu | dossier Q43723 | dossier Q43723 faces=true | PASS |
| S-A1 | דני כהן | need_context 0 faces | need_context 0 faces (suite s2) | PASS |
| S-A1b | משה כהן | need_context 0 faces | need_context 0 faces | PASS |
| S-A2 | John Smith | need_context 0 faces | need_context 0 faces (suite s3) | PASS |
| S-A4 / G11 | Smith + email | NOT dossier+faces | candidates 0 faces | PASS |
| P-D8 | כהן / לוי bare | need_context 0 faces | need_context 0 faces | PASS |

**pretty-wrong:** 0 · **SAFETY lock:** green · **ALIAS_RECALL hard (P1 targets):** green on this dpl

Artifacts: `P1-EXTRA-dplDNfPZ9-בודק-2026-09-15.json` · suite log/json/md dated 2026-09-15

*עודכן ע״י בודק · Evidence runtime · ללא deploy · ללא שינוי api*
