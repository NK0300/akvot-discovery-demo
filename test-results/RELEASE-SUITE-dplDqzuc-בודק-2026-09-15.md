# Release Suite · בודק

- **when:** 15.9.2026, 14:58:43 Asia/Jerusalem
- **BASE:** https://akvot-simple-demo-48x7gx9a6-k-akvot.vercel.app
- **exit:** `1` — FAIL
- **סיכום:** ריליס נכשל — units=OK contract=FAIL SAFETY=OK RED=OK

## שערים (gates)

| Gate | תוצאה | פרטים |
|------|--------|--------|
| 1. Domain units | ✅ PASS | exit=0 · 124ms |
| 2. Contract identity-p0 | ❌ FAIL | exit=1 · 30266ms |
| 3. SAFETY core | ✅ PASS | 6/6 (כולל soft PRODUCT) |
| 4. Red-team | ✅ PASS | 3/3 |
| 5. ALIAS_RECALL | ✅ PASS | 4/4 · לא מפיל יציאה |

## 3) SAFETY / runtime smoke

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| s1-netanyahu | dossier | wiki+google | Q43723 | true | 1931 | PASS |
| s2-dani-cohen | need_context | ambiguous | - | false | 178 | PASS |
| s3-smith-bare | need_context | ambiguous | - | false | 5676 | PASS |
| s4-smith-ibm | candidates | candidates | - | false | 6537 | PASS |
| s5-smith-email | candidates | candidates | - | false | 7275 | PASS |
| s6-orly-levy | dossier | wiki+google | Q466537 | true | 1624 | PASS · dossier preferred — OK |

## 4) Red-team

| id | ui | qid | faces | ms | תוצאה |
|----|----|-----|-------|----|--------|
| r1-junk-he | need_context | - | false | 18718 | PASS |
| r2-smith-bare-covered | SKIP | - | false | 0 | SKIP |
| r3-conflict-skip | SKIP | - | false | 0 | SKIP |

## 5) ALIAS_RECALL

רק תיעוד — כשל רך **לא** מפיל את הסוויטה אלא אם pretty-wrong (dossier+faces על שאילתה לא-בטוחה / זהות שגויה).

| id | ui | mode | qid | faces | ms | תוצאה |
|----|----|------|-----|-------|----|--------|
| a1-netanyahu-alone | dossier | wiki | Q43723 | true | 1001 | PASS |
| a2-bibi-netanyahu | dossier | wiki | Q43723 | true | 3364 | PASS |
| a3-angela-merkel | dossier | wiki+google | Q567 | true | 2384 | PASS |
| a4-zehava-galon | dossier | wiki+google | Q2630062 | true | 1255 | PASS |

## קבצים

- JSON: `test-results/RELEASE-SUITE-latest.json`
- MD: `test-results/RELEASE-SUITE-בודק-latest.md`
- Runner: `test-results/RELEASE-SUITE-בודק.mjs`

*נוצר ע״י בודק · ללא deploy · ללא שינוי lookup/orchestrator thresholds*

## Evidence meta (P2 RC Preview)

- **Target Preview ONLY:** `https://akvot-simple-demo-48x7gx9a6-k-akvot.vercel.app`
- **dpl:** `dpl_DqzucMKykHVssELsCi91waZ5LCmg`
- **Access:** Vercel Deployment Protection — HTTP via `vercel env run` + `x-vercel-trusted-oidc-idp-token` preload (`test-results/vercel-oidc-fetch-preload.mjs`); health also verified with `vercel curl`
- **P1 prod alias** `akvot-simple-demo.vercel.app` / `dpl_DNfPZ9…` **not** hit for this Gate Evidence
- **Contract FAIL detail:** `d-smith-ctx-p0` → ui=dossier qid=Q1701775 faces=true (pretty-wrong) on this Preview run; SAFETY twin `s4-smith-ibm` (same params) later → candidates · 0 faces (flake / non-determinism). P2 regression S-A3 on same Preview → candidates · PASS · pw=0
- **Artifacts:** `RELEASE-SUITE-dplDqzuc-בודק-2026-09-15.{md,json,log}` · `P2-REGRESSION-dplDqzuc-בודק-2026-09-15.{md,json}`

