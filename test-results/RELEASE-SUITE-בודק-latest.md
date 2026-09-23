# Release Suite · בודק

- **when:** 15.9.2026, 17:52:36 Asia/Jerusalem
- **BASE:** https://akvot-simple-demo-29yid8jo9-k-akvot.vercel.app
- **exit:** `0` — PASS
- **סיכום:** ריליס עבר — units+contract+SAFETY ירוקים · ALIAS_RECALL מלא

## שערים (gates)

| Gate | תוצאה | פרטים |
|------|--------|--------|
| 1. Domain units | ✅ PASS | exit=0 · 122ms |
| 2. Contract identity-p0 | ✅ PASS | exit=0 · 30658ms |
| 3. SAFETY core | ✅ PASS | 6/6 (כולל soft PRODUCT) |
| 4. Red-team | ✅ PASS | 3/3 |
| 5. ALIAS_RECALL | ✅ PASS | 4/4 · לא מפיל יציאה |

## 3) SAFETY / runtime smoke

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| s1-netanyahu | dossier | wiki+google | Q43723 | true | 1845 | PASS |
| s2-dani-cohen | need_context | ambiguous | - | false | 188 | PASS |
| s3-smith-bare | need_context | ambiguous | - | false | 5700 | PASS |
| s4-smith-ibm | candidates | candidates | - | false | 8916 | PASS |
| s5-smith-email | candidates | candidates | - | false | 7019 | PASS |
| s6-orly-levy | dossier | wiki+google | Q466537 | true | 1411 | PASS · dossier preferred — OK |

## 4) Red-team

| id | ui | qid | faces | ms | תוצאה |
|----|----|-----|-------|----|--------|
| r1-junk-he | thin | - | false | 45184 | PASS |
| r2-smith-bare-covered | SKIP | - | false | 0 | SKIP |
| r3-conflict-skip | SKIP | - | false | 0 | SKIP |

## 5) ALIAS_RECALL

רק תיעוד — כשל רך **לא** מפיל את הסוויטה אלא אם pretty-wrong (dossier+faces על שאילתה לא-בטוחה / זהות שגויה).

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| a1-netanyahu-alone | dossier | wiki+google | Q43723 | true | 2109 | PASS |
| a2-bibi-netanyahu | dossier | wiki+google | Q43723 | true | 1474 | PASS |
| a3-angela-merkel | dossier | wiki+google | Q567 | true | 1231 | PASS |
| a4-zehava-galon | dossier | wiki+google | Q2630062 | true | 1074 | PASS |

## קבצים

- JSON: `test-results/RELEASE-SUITE-latest.json`
- MD: `test-results/RELEASE-SUITE-בודק-latest.md`
- Runner: `test-results/RELEASE-SUITE-בודק.mjs`

*נוצר ע״י בודק · ללא deploy · ללא שינוי lookup/orchestrator thresholds*
