# סינתזת סקירת קוד מקור — עקבות דמו · 2026-09-07

**משתתפים:** Chief of Staff (3 מסלולים מקבילים) + סוכן **מ**  
**קבצים:** `REVIEW-api-pipeline.md` · `REVIEW-privacy-candidates.md` · `REVIEW-ui-vercel.md` · `REVIEW-agent-mem.md`  
**קוד:** `/workspace/akvot-quick-demo/` · חי: https://akvot-simple-demo.vercel.app  
**מצב:** דוחות בלבד — ללא שינויי קוד

---

## קונצנזוס — מה חייב תיקון קודם

| # | ממצא | מקורות שהסכימו | חומרה |
|---|------|----------------|--------|
| 1 | Wiki 429 → נפילה ל-Gemini מלא (~30ש׳) | API, audit קודם | Critical |
| 2 | Scrub לא נוגע ב-`sources[].url` / image URLs — דליפת ספרות טלפון | API, Privacy, מ | Critical |
| 3 | מפתח Gemini ב-query string | API, מ | Critical |
| 4 | `softAmbiguous=false` כשיש אות גוגל חלש + הקשר → תיק/פנים במקום מועמדים | Privacy | Critical |
| 5 | XSS: `esc()` לא חוסם `javascript:`/`data:` ב-href/src | UI | P1 |
| 6 | CORS `*` + טלפון/אימייל ב-GET | UI, API | P1 |
| 7 | Rich-wiki עדיין סורק דפים/Commons | API, audit | High |
| 8 | שני קריאות Gemini; retry לא-SSE אחרי כשל stream = עלות כפולה | API, UI | High |
| 9 | Ban-list חסר TLD (`truecaller.in/.app`, `getcontact.app`) + תוכן ממודל אחרי סינון URL | Privacy | High |
| 10 | עובדות Gemini (גיל/לידה/תפקיד) בלי cite-or-drop קשיח | Privacy, מ | High |

## KEEP (כולם הסכימו)

- מועמדים עם 0 פנים בשם מעורפל (כשהשער עובד)
- באן Truecaller/Sync.me על URL (בסיס קיים)
- Scrub טקסט לטלפון/אימייל
- cite-or-drop / dryBio מויקי
- Latin → EN/WD לפני HE
- `wikiIsRich` מדלג על Gemini כבד
- מקורות ציבוריים בלבד כמדיניות מוצר

## סדר תיקון מומלץ

1. Scrub על URLs + הרחבת ban-list TLD  
2. אין Gemini על wiki 429 אלא אם phone/email/focus  
3. מפתח ב-header; CORS לא `*`  
4. Allowlist `https:` ל-href/src  
5. שמירת softAmbiguous גם עם google חלש  
6. Early-return בויקי עשיר; Gemini אחת מקסימום  
7. כפתור Cancel + בלי retry מלא אוטומטי  


## תוספות מסוכן מ (לא בכל המסלולים)
- אין rate-limit / אימות על API הציבורי (P0 abuse/cost)
- SSRF פוטנציאלי ב-`scanPage` על URL ממודל (אין חסימת RFC1918/metadata)
- POST עדיף לטלפון/אימייל במקום GET

