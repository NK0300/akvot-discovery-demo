# BATTERY-250 · דוח ביניים #1 · בודק · 2026-09-08

**משימה מ־Chief:** סוללה חיה 250 · רגרסיות עם הצוות · ביניים+סופי תחת `test-results/BATTERY-250-*`

## מוכנות

| תנאי | מצב |
|------|-----|
| רשימת 250 | **יש** `BATTERY-250-list.json` · 250 · mix {"famous":71,"obscure":120,"nonexist":59} · bySc {"D":60,"A":71,"B":119} |
| מקומי | עולה (`:4011`) · `phase=orchestrator-v0` · **A Known לא יציב** |
| פרוד | `phase=speed-b` — לא יעד לסוללת orchestrator |

## שער 12 (חוסם פריסה / סוללה מלאה)

אחרי FIX-need-context-order: נתניהו/גלאון-HE/אובמה עדיין נכשלים PRODUCT. דני/Smith → need_context ✓. Zehava EN ✓.

## צעדים עכשיו

1. ראנר `BATTERY-250-runner.mjs` מוכן
2. פיילוט ~40 (famous+obscure+nonexist) מול מקומי → `BATTERY-250-pilot-*.json`
3. דוח ביניים #2 אחרי הפיילוט; סוללה מלאה כש־A gates עוברים או לפי הוראת Chief לרוץ על המצב השבור (למיפוי)

**פריסה:** לא.
