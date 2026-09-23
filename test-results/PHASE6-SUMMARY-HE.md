# Phase 6 — סיכום לנחמן

**פרוד:** https://akvot-simple-demo.vercel.app  
**דיפלוי אחרון:** `dpl_CuDkuYakAmS133Z2EArRhgV4RXhg` · phase=6

## טבלת PASS/FAIL (סופי מרווח + סמוק)

| מקרה | תוצאה | הערות |
|------|--------|--------|
| בנימין נתניהו | PASS | wiki Q43723 · 8 תמונות |
| Barack Obama | PASS | wiki Q76 (Latin→WD/EN) |
| Albert Einstein | PASS | wiki Q937 |
| Miri Regev | PASS | wiki Q128949 |
| יצחק הרצוג | IMPROVE | wiki 429 → google+תמונות (בלי QID) |
| דני כהן | PASS | candidates · 0 פנים |
| משה לוי | PASS | candidates (לא מתחייב לרמטכ״ל) · 0 פנים |
| יוסי כהן | PASS | candidates · 0 פנים |
| ישראל ישראלי | PASS | candidates |
| Assaf Rappaport | PASS | wiki/biz |
| קובי אלכסנדר | PASS | wiki או candidates (בלי timeout קריטי) |
| זבל HE/EN | PASS | 0 פנים |
| strong-id טלפון/אימייל/ארגון | PASS | candidates · scrub · בלי דליפת טלפון |
| העמקת מועמד דני כהן (מדען מחשב) | PASS | wiki Q5220231 |

## תיקונים עיקריים
1. שמות באנגלית → Wikidata/EN לפני HE  
2. שם נפוץ עם אחים בסוגריים → מסך מועמדים (בלי דיוקן)  
3. קיצור timeout/backoff ויקי + דילוג Gemini כשיש דיוקן  
4. Scrub טלפון/אימייל + UX abort ב־UI

## IMPROVE שנשאר
- הרצוג תחת 429 ויקי עדיין בלי QID  
- שונות latency תחת rate-limit  
