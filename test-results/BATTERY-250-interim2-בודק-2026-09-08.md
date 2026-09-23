# BATTERY-250 · דוח ביניים #2 · בודק · 2026-09-08

## סטטוס הרצה
- **יעד:** `http://127.0.0.1:4012` · Origin `localhost:3000` · רשימה `BATTERY-250-list.json` (v2 · 71/120/59)
- **ראנר:** `run-battery-250.mjs` → `BATTERY-250-full-local.json` (CONCURRENCY=2)
- **קריטריונים מחמירים:** `BATTERY-250-criteria-דיוק.md` (דיוק) — PASS ראנר ≠ PASS דיוק

## מה בוטל / לא נחשב
1. פיילוט על `:4011` — הופסק (יעד עבר ל־4012)
2. `BATTERY-250-full-run.json` — רץ בטעות מול **פרוד speed-b** + סכמת באקטים ישנה (`known_he`…) · **46/250** לא תקף ל־orchestrator-v0-b
3. הרצת full-local קודמת נתקעה ב־10/250 — נהרגה

## דגימת A על 4012
בדיקה נקודתית של נתניהו על 4012 עדיין **flaky** אצלי (`need_context` לפעמים) — לא מאשר יציבות מלאה; ממשיך סוללה למיפוי כפי שהורה Chief.

## הבא
- סגירת `BATTERY-250-full-local.json` + סיכום לפי famous/obscure/nonexist
- יישור מול קריטריוני דיוק בדוח סופי
- פרוד: לא עד A Known יציב + smoke
