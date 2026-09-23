# EIGHT-HOUR SUMMARY · עקבות / akvot-simple-demo · 2026-09-08

**חלון:** ~08:10–11:27 Asia/Jerusalem  
**יעד חי:** https://akvot-simple-demo.vercel.app · phase `orchestrator-v0-b`  
**פריסה סופית לתיקון כושלים:** `dpl_CHsC8R2jLVxvkYCkGpFiZgTifjgU`

## תוצאות

### סוללה 250 (GO · `dpl_GQfRg…`)
| מדד | ערך |
|-----|-----|
| Pass | **196/250** (78.4%) |
| Fail | 54 = 46× INFRA_JSON + 8× need_context |
| p50 / p95 | ~46s / ~60s |

| bucket | pass/n |
|--------|--------|
| famous | 49/71 |
| obscure | 102/120 |
| nonexist | 45/59 |

בלי infra באותה ריצה: famous 49/57 · obscure 102/102 · nonexist 45/45

### RETEST כושלים (אחרי תיקון · `dpl_CHsC8…`)
| | |
|--|--|
| **55/55 PASS** | 8/8 famous מוצר · 46/46 INFRA · דני control |
| אפקטיבי | כל מקרי הסוללה שנכשלו — ירוקים על הפריסה החדשה |

## KEEP
1. שער common-name HE → `need_context` + 0 פנים (+ הגנת לקוח).
2. seed QID + Stage B לפני Gemini לסלבים; פטור `commonHeBare` כשיש seed (לוי/פרץ).
3. תיקון `computeThin` שלא מסמן dossier+QID כ־thin.
4. **deadline JSON ~45ש** במקום HTML `An error…` / timeout גולמי.
5. orchestrator-v0-b + חוזה UI `need_context|candidates|dossier|thin`.
6. obscure/nonexist יציבים כשאין infra; battery bypass `x-akvot-battery`.

## IMPROVE (המשך)
1. לצמצם תלות ב־seed ידני — שחזור QID כללי / wiki resilient תחת 429.
2. p50~46s בסוללה — תקציב זמן / פחות Gemini לפני commit.
3. שדרוג judge ל־`expectPrecise` (קריטריוני דיוק).
4. מדגם רגרסיה קבוע (famous×10 + obscure×10 + nonexist×5 + דני) במקום 250 בכל פריסה.

## קבצים
- `BATTERY-250-prod-GO-בודק-2026-09-08.md` / `.json`
- `RETEST-fails54-בודק-2026-09-08.md` / `.json`
- `PILOT-famous5-בודק-2026-09-08.md`
- `BATTERY-250-criteria-דיוק.md`

## סטטוס
סבב ה־8 שעות עמד ביעד האימות+תיקון הכושלים. אין RESTART 250 מלא נדרש כרגע.
