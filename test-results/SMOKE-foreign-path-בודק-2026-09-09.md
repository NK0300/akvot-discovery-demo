# SMOKE #1 foreign-path · בודק · 2026-09-09

deploy: `dpl_5N3GR8EvjjRsNcuDbDfC3g8afuNi`

## סמוק קצר (מוסכם)

| מקרה | ui · qid · faces | ms | תוצאה |
|------|------------------|-----|--------|
| נתניהו | dossier · Q43723 · פנים | 1.4s | **PASS** |
| דני כהן | need_context · 0 פנים | 0.2s | **PASS** |
| John Smith bare | need_context · 0 פנים | 5.9s | **PASS** (≤8ש ✓) |
| Smith+IBM+NY כ־`q` אחד | need_context · 0 | 5.9s | **FAIL** מול יעד candidates |
| Smith org/city params (חזרה) | dossier · Q1701775 · פנים | 9.1s | **IMPROVE/חשד** — לא candidates; דיוק לבדוק pretty-wrong |
| Emily+ctx | need_context · 0 | 5.9s | **PASS** (לא 45ש ✓) |

**פסק דין סמוק קצר:** לא ירוק מלא — נתניהו/דני/Smith bare/Emily טובים; **Smith+ctx לא יציב** (need_context או dossier במקום candidates עם ראיות).

## 12-שער (רץ בכל זאת למידע)

unit 4/4 · **safety 14/15** · product 9/15 · **critical 1**

- **FAIL-CRIT G11-email**: John Smith + email → dossier Q332377 + sources/פנים — SAFETY
- PASS-SAFE/IMPROVE: Obama EN/HE, dani-ctx, smith-ibm→thin, Assaf
- Smith bare / כהן / נתניהו / junk / phone: PASS בטיחות

raw: `SMOKE-12gate-dpl5N3G-בודק-2026-09-09.json`
