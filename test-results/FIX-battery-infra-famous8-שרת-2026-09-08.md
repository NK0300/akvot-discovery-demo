# FIX — INFRA_JSON + famous×8 · שרת · 2026-09-08

**Deploy:** `dpl_CHsC8R2jLVxvkYCkGpFiZgTifjgU` → https://akvot-simple-demo.vercel.app  
(בעקבות battery 196/250 · דוח `BATTERY-250-prod-GO-בודק-2026-09-08.md`)

## 1) INFRA_JSON ×46
- תקציב פנימי 42s + **hard JSON deadline 45s** (`budget_timeout` / `uiState=thin`) לפני Vercel HTML 504
- Gemini timeout cap 12s
- catch תמיד מחזיר JSON (לא HTML)

Smoke: `Emily Watson Melbourne nurse` → http=200 JSON `thin` + `degraded` + `error=budget_timeout` (~45s) ✓

## 2) Famous need_context ×8
Seed QIDs + פטור משער `commonHeBare` / `decideStage` כשיש QID (אורלי לוי / עמיר פרץ):

| q | qid | smoke |
|---|-----|-------|
| יואב גלנט | Q723506 | dossier ~1s |
| הרצל בוקר | Q20022746 | dossier ~6.5s |
| עופר שלח | Q3663054 | dossier ~5s |
| אורלי לוי | Q466537 | dossier ~1.3s |
| מירי רגב | Q128949 | dossier ~1.5s |
| עמיר פרץ | Q472117 | dossier ~1.1s |
| רם עמנואל | Q298443 | dossier ~1s |
| ניצן הורוביץ | Q2916662 | dossier ~1s |
| דני כהן (KEEP) | — | need_context 0 faces ~0.4s |

## Next
@בודק — re-run **רק כושלים** (INFRA + famous×8), לא סוללה מלאה.
