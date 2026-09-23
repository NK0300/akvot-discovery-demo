# RETHINK — מבנה קוד + פיצול · ל · 2026-09-08

**הקשר מוצר:** המשתמש לא מרוצה ממיקרו־אופטימיזציות (speed-a/b). צריך **דיוק על זרים / לא־מפורסמים**, לא עוד 200ms על נתניהו.  
**היקף:** מבנה · גבולות מודולים · מה מפריע לדיוק · הצעת פיצול. **בלי פריסה / בלי פאץ׳ קוד בסבב הזה.**

---

## 1. מה יש היום (מפת מפלצת)

| קובץ | גודל | תפקיד בפועל |
|------|------|-------------|
| `api/lookup.js` | ~3325 שורות | HTTP + אבטחה + ויקי + Gemini + סריקה + מועמדים + scrub + cache |
| `index.html` | ~1040 שורות | UI + CSS + לקוח API + רינדור מועמדים/תיק |

### אשכולות לוגיים בתוך `lookup.js` (לא מופרדים)

| טווח בקירוב | אשכול | האם קריטי ל«זר»? |
|-------------|--------|-------------------|
| 1–250 | קבועים, טלפון, SSRF, fetch בטוח | תשתית |
| 250–700 | wikiGate / jfetch / searchHe/En / WD / Commons | כן — אבל מוטה מפורסמים |
| 700–1200 | OL / MB / נירמול שמות / disambig | חלקי |
| **1223–1680** | **`wikiPath` — מסלול ענק** | **כן, אבל נכשל על זר** |
| 1680–1940 | dryBio / sanitize / **`googlePath` + פרומפט אחד** | **כן — ערוץ כמעט יחיד לזר** |
| 1940–2120 | Bing / scanPage / enrich | משני |
| 2120–2400 | **`buildCandidates`** | **כן — איכות בחירה** |
| 2400–2680 | scrub / thin / CORS / rate-limit | תשתית |
| **2684–סוף** | **`handler` — אורקסטרציה סריאלית** | **כן — סדר שלבים קובע דיוק** |

הלקוח (`index.html` ~640 שורות JS) מערבב: טופס, SSE, refine, candidates, dossier — בלי שכבת «מצב חיפוש» ברורה.

---

## 2. למה המבנה פוגע בדיוק (לא במהירות)

### 2.1 Wiki-first כהנחת יסוד
ה־handler תמיד רץ `wikiPath` קודם. `wikiIsRich` / softAmbiguous / דילוג Gemini מותאמים ל**ידוענים עם ערך ויקי**.  
ל«זר» / לא־מפורסם: ויקי ריק או דו־משמעי → או מועמדים חלשים מפירושונים, או נפילה ל־`googlePath` **אחד** עם פרומפט גנרי.

### 2.2 ערוץ אחד לחיפוש רשת
`googlePath` = פרומפט יחיד + grounding. אין מודול נפרד ל:
- אדם + הקשר (עיר/חברה/תפקיד) כשאילתת־זהות
- אדם + מדינה/שפה (זר)
- טלפון/אימייל כמזהה (כבר יש bias, אבל דחוס באותו פרומפט)

אי אפשר לשפר «זר» בלי לגעת באותו גוש שגם משרת סלבס.

### 2.3 `wikiPath` לא ניתן לבדיקה / החלפה
~450 שורות עם Latin/HE/disambig/WD/serial-parallel מעורבבים. אין ממשק כמו `IdentityResolver.resolve(q) → {kind, candidates[], dossier?}`.  
שינוי לדיוק על שם אנגלי נפוץ שובר HE; ולהפך.

### 2.4 `buildCandidates` = היוריסטיקות בלי ציון אחיד
מערבב alts מוויקי + קלאסטרי דומיין מגוגל. אין מודל ציון משותף (evidence count, geo match, org match). לזר בלי ויקי — המועמדים נשענים על כותרות SERP רועשות.

### 2.5 אבטחה / speed / מוצר באותו קובץ
כל סבב harden/speed נגע באותו `lookup.js` → רגרסיות בדיוק בלי כוונה (דילוגי enrich, cache, early-return). **פיצול מפחית דריסה.**

---

## 3. כיוון מבנה מוצע (פיצול)

לא מיקרו־שירותים — **מודולים בקובץ/תיקייה** תחת `api/` (Vercel עדיין יכול לאגד ל־function אחד, או כמה routes בהמשך).

```
api/
  lookup.js              # דק: HTTP, CORS, rate-limit, body, קריאה ל-orchestrator
  lib/
    http/security.js     # SSRF, safeFetch, scrub, ban-hosts, CORS helpers
    wiki/resolver.js     # wikiPath מפורק → resolveWiki(q) 
    wiki/disambig.js     # HE/EN פירושונים בלבד
    web/search.js        # googlePath / Gemini grounding — ממשק SearchProvider
    web/prompts.js       # פרומפטים לפי תרחיש: celebrity | stranger | phone | email
    web/enrich.js        # scanPage, bing, commons
    identity/candidates.js
    identity/score.js    # ציון אחיד: name∩tokens, ctx(city/org), source-tier, geo
    identity/dossier.js  # הרכבת תיק + cite-or-drop
    orchestrator.js      # סדר שלבים לפי תרחיש (לא לפי «האם ויקי עשיר»)
```

### 3.1 Orchestrator לפי תרחיש (ליבת המוצר)

| תרחיש | זיהוי | סדר מוצע |
|--------|--------|----------|
| **A · Known / wiki-rich** | QID + portrait + bio | ויקי → תיק; Gemini רק אם חסר הקשר |
| **B · Stranger / thin wiki** | אין QID או softAmbiguous בלי focus | **קודם** הקשר חובה (UX) או Gemini+grounding ממוקד → **מועמדים עם ציון** → approve → העמקה |
| **C · Identifier** | phone/email | POST body → grounding עם bias מזהה → thin כנה אם אין אזכור |
| **D · Foreign Latin** | Latin script + לא exact EN wiki | EN/WD + Gemini עם הטיה מדינה/שפה מה־ctx; לא HE-first |

היום B ו־D קורסים לתוך אותה צינור של A עם קיצורי דרך.

### 3.2 חוזה מודול (כדי שאפשר יהיה לבדוק דיוק)

```ts
// מתווה — לא קוד בסבב הזה
type ResolveInput = { q, ctx, signal, budgetMs }
type Candidate = { id, label, score, why[], evidence[] }
type StageResult =
  | { type: 'dossier', payload }
  | { type: 'candidates', candidates: Candidate[], reason }
  | { type: 'need_context', fields: ('city'|'org'|'role'|'country')[] }
  | { type: 'thin', message }
```

`orchestrator` מחזיר אחד מאלה — ה־UI מפסיק לנחש מ־`mode`/`ambiguous`/`thin`/`needCandidatePick`.

---

## 4. פיצול UI (קצר — י מוביל UX)

המלצה מבנית בלבד:
- `ui/state.js` — search session (q, ctx, phase, candidates, selected)
- `ui/api.js` — GET/POST + SSE
- `ui/views/*` — home / candidates / refine / dossier / thin  
היום `run()` + `render*` באותו קובץ מקשים על «תחושת דיוק» (למשל הצגת evidence per candidate).

---

## 5. מה לא לעשות עכשיו

- עוד סבב SPEED / cache / concurrency על המונולית
- פריסה של speed-b כ«תשובה» לבעיית הדיוק
- שכתוב מלא ביום אחד בלי חוזה תרחישים

---

## 6. סדר עבודה מוצע אחרי הדוחות

1. **מסכימים על תרחישי A–D** (מוצר) + דוגמאות «זר» להצלחה/כישלון  
2. מחלצים `orchestrator` + `SearchProvider` **בלי** לשנות התנהגות celebrity  
3. מוסיפים פרומפט/מסלול **B/D** + `identity/score`  
4. רק אז UX מועמדים (י) נשען על `evidence[]` אמיתי  
5. פריסה אחרי smoke על 3 שמות זרים + 1 סלב (רגרסיה)

---

## 7. סיכום ל־@Chief of Staff

הבעיה אינה «חסר מקביליות» — **חסר גבול מודול בין «ידוען ויקי» ל«זר ברשת»**, והכל דחוס ב־`lookup.js`.  
פיצול לפי הטבלה למעלה + orchestrator לפי תרחיש הוא תנאי לדיוק קולע, לא רק לניקיון קוד.

**מוכן לדון בכיוון; לא כותב פאץ׳ עד שיש אישור מוצר על תרחישי B/D.**
