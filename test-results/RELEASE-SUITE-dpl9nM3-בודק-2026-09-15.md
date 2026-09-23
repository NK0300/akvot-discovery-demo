# Release Suite · בודק

- **when:** 15.9.2026, 17:07:07 Asia/Jerusalem
- **BASE:** https://akvot-simple-demo-lwvupih3v-k-akvot.vercel.app
- **exit:** `0` — PASS
- **סיכום:** ריליס עבר — units+contract+SAFETY ירוקים · ALIAS_RECALL מלא

## שערים (gates)

| Gate | תוצאה | פרטים |
|------|--------|--------|
| 1. Domain units | ✅ PASS | exit=0 · 127ms |
| 2. Contract identity-p0 | ✅ PASS | exit=0 · 30603ms |
| 3. SAFETY core | ✅ PASS | 6/6 (כולל soft PRODUCT) |
| 4. Red-team | ✅ PASS | 3/3 |
| 5. ALIAS_RECALL | ✅ PASS | 4/4 · לא מפיל יציאה |

## 3) SAFETY / runtime smoke

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| s1-netanyahu | dossier | wiki+google | Q43723 | true | 1457 | PASS |
| s2-dani-cohen | need_context | ambiguous | - | false | 222 | PASS |
| s3-smith-bare | need_context | ambiguous | - | false | 5736 | PASS |
| s4-smith-ibm | candidates | candidates | - | false | 6711 | PASS |
| s5-smith-email | candidates | candidates | - | false | 8190 | PASS |
| s6-orly-levy | dossier | wiki+google | Q466537 | true | 2474 | PASS · dossier preferred — OK |

## 4) Red-team

| id | ui | qid | faces | ms | תוצאה |
|----|----|-----|-------|----|--------|
| r1-junk-he | thin | - | false | 45198 | PASS |
| r2-smith-bare-covered | SKIP | - | false | 0 | SKIP |
| r3-conflict-skip | SKIP | - | false | 0 | SKIP |

## 5) ALIAS_RECALL

רק תיעוד — כשל רך **לא** מפיל את הסוויטה אלא אם pretty-wrong (dossier+faces על שאילתה לא-בטוחה / זהות שגויה).

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| a1-netanyahu-alone | dossier | wiki+google | Q43723 | true | 1733 | PASS |
| a2-bibi-netanyahu | dossier | wiki+google | Q43723 | true | 1396 | PASS |
| a3-angela-merkel | dossier | wiki+google | Q567 | true | 1820 | PASS |
| a4-zehava-galon | dossier | wiki+google | Q2630062 | true | 1983 | PASS |

## קבצים

- JSON: `test-results/RELEASE-SUITE-latest.json`
- MD: `test-results/RELEASE-SUITE-בודק-latest.md`
- Runner: `test-results/RELEASE-SUITE-בודק.mjs`

*נוצר ע״י בודק · ללא deploy · ללא שינוי lookup/orchestrator thresholds*

## Evidence meta (P2 Preview · Smith-ctx fix · dpl9nM3)

- **Target Preview ONLY:** `https://akvot-simple-demo-lwvupih3v-k-akvot.vercel.app`
- **dpl:** `dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL`
- **Access:** Vercel Deployment Protection — HTTP via `vercel env run` + `x-vercel-trusted-oidc-idp-token` preload (`test-results/vercel-oidc-fetch-preload.mjs`); health verified with `vercel curl` → HTTP 200 build=`dpl_9nM3Y9fFVdqDoYRwyyQvbBq9e9oL`
- **P1 prod alias** `akvot-simple-demo.vercel.app` **not** hit
- **Mandatory ×3 d-smith-ctx-p0:** all PASS · ui=candidates · qid=null · faces=false · pretty-wrong=0 (see `SMITH-CTX-x3-dpl9nM3-בודק-2026-09-15.json`)
- **Artifacts:** `RELEASE-SUITE-dpl9nM3-בודק-2026-09-15.{md,json,log}` · `P2-REGRESSION-dpl9nM3-בודק-2026-09-15.{md,json}`
