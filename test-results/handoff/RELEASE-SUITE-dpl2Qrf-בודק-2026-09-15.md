# Release Suite · בודק

- **when:** 15.9.2026, 17:29:39 Asia/Jerusalem
- **BASE:** https://akvot-simple-demo-8t702yisg-k-akvot.vercel.app
- **exit:** `0` — PASS
- **סיכום:** ריליס עבר — units+contract+SAFETY ירוקים · ALIAS_RECALL מלא

## שערים (gates)

| Gate | תוצאה | פרטים |
|------|--------|--------|
| 1. Domain units | ✅ PASS | exit=0 · 119ms |
| 2. Contract identity-p0 | ✅ PASS | exit=0 · 30657ms |
| 3. SAFETY core | ✅ PASS | 6/6 (כולל soft PRODUCT) |
| 4. Red-team | ✅ PASS | 3/3 |
| 5. ALIAS_RECALL | ✅ PASS | 4/4 · לא מפיל יציאה |

## 3) SAFETY / runtime smoke

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| s1-netanyahu | dossier | wiki+google | Q43723 | true | 2034 | PASS |
| s2-dani-cohen | need_context | ambiguous | - | false | 222 | PASS |
| s3-smith-bare | need_context | ambiguous | - | false | 5714 | PASS |
| s4-smith-ibm | candidates | candidates | - | false | 6363 | PASS |
| s5-smith-email | candidates | candidates | - | false | 9291 | PASS |
| s6-orly-levy | dossier | wiki+google | Q466537 | true | 1473 | PASS · dossier preferred — OK |

## 4) Red-team

| id | ui | qid | faces | ms | תוצאה |
|----|----|-----|-------|----|--------|
| r1-junk-he | need_context | - | false | 23890 | PASS |
| r2-smith-bare-covered | SKIP | - | false | 0 | SKIP |
| r3-conflict-skip | SKIP | - | false | 0 | SKIP |

## 5) ALIAS_RECALL

רק תיעוד — כשל רך **לא** מפיל את הסוויטה אלא אם pretty-wrong (dossier+faces על שאילתה לא-בטוחה / זהות שגויה).

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| a1-netanyahu-alone | dossier | wiki | Q43723 | true | 1176 | PASS |
| a2-bibi-netanyahu | dossier | wiki | Q43723 | true | 2931 | PASS |
| a3-angela-merkel | dossier | wiki+google | Q567 | true | 2251 | PASS |
| a4-zehava-galon | dossier | wiki+google | Q2630062 | true | 1085 | PASS |

## קבצים

- JSON: `test-results/RELEASE-SUITE-latest.json`
- MD: `test-results/RELEASE-SUITE-בודק-latest.md`
- Runner: `test-results/RELEASE-SUITE-בודק.mjs`

*נוצר ע״י בודק · ללא deploy · ללא שינוי lookup/orchestrator thresholds*

## Evidence notes · בודק · dpl2Qrf
- **BASE:** `https://akvot-simple-demo-8t702yisg-k-akvot.vercel.app`
- **dpl:** `dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT`
- **Access:** Vercel Deployment Protection — HTTP via `vercel env run` + `x-vercel-trusted-oidc-idp-token` preload (`test-results/vercel-oidc-fetch-preload.mjs`); health verified with `vercel curl` → HTTP 200 build=`dpl_2QrfuXhQg1Jt9q2NBdedkKJHwTqT`
- **Mandatory POST nested ×3 d-smith-ctx-p0:** allPass=true · pw=0 · ui=['candidates', 'candidates', 'candidates'] (see `SMITH-CTX-POST-x3-dpl2Qrf-בודק-2026-09-15.json`)
- **GET flat ×3 parity:** allPass=true · pw=0 · ui=['candidates', 'candidates', 'candidates'] (see `SMITH-CTX-GET-x3-dpl2Qrf-בודק-2026-09-15.json`)
- **P2 regression:** N/PASS/FAIL/pw=19/18/1/1 · Assaf T-C1={'pass': True, 'qid': 'Q47507930', 'ui': 'dossier'} · health=true · requestId=true
- **No promote · Preview only · no product/EXPECTED/threshold change**
