# סקירת קוד מקור — עקבות דמו
Agent: מ (mem)
Date: 2026-09-07
Scope: api/lookup.js, index.html, vercel.json

## תקציר מנהלים
דמו OSINT/lookup בעברית (RTL) עם צינור בשל: ויקיפדיה/Wikidata → Gemini+Google Search → סריקת דפים/Commons/Bing, כולל מסלול טלפון זהיר (חסימת caller-ID, scrub מזהים, מסך מועמדים). חיפוש חי על בנימין נתניהו החזיר `mode: wiki`, QID תקין, ~19 מקורות ב־~5.5ש׳. הסיכונים המרכזיים אינם באגים לוגיים בלבד אלא חשיפה תפעולית: אין אימות/הגבלת קצב על `/api/lookup`, CORS פתוח (`*`), מפתח Gemini ב־query string, ו־SSRF פוטנציאלי ב־`scanPage` על URL-ים ממודל/חיפוש. פרטיות טובה יחסית בתשובה ללקוח (phone/email=null + scrub), אך מזהים עוברים ב־GET ועלולים להישאר בלוגי CDN/Vercel. אין שינוי קוד בסקירה זו.

## KEEP
- `esc()` ב־`index.html` (~388) בשימוש עקבי ב־innerHTML (עובדות, מקורות, מועמדים, refine) — מקטין XSS בסיסי מטקסט API.
- Scrub מזהים: `scrubIdentifiers` / `scrubPayloadIdentifiers` (~2171–2234); בתשובה `phone`/`email` תמיד `null`; `contextUsed` מסמן רק `[provided]` (~2705–2706).
- חסימת מאגרי caller-ID: `BANNED_PHONE_HOSTS` + סינון מקורות (~55–56, ~2609–2610); הנחיות מפורשות ב־prompt של Gemini (~1656–1658).
- מדיניות cite-or-drop / soft-ambiguous: אין דיוקן לשמות נפוצים עד בחירת מועמד (`softAmbiguous` → `outImages=[]`, ~2568–2571; `shouldReturnCandidates`, ~2245).
- `jfetch` עם `AbortSignal.timeout`, retry על 429/503, ו־`wikiGate`/`wikiBump` (~186–199, ~156–166) — מודעות לתקציב 60ש׳ של Vercel.
- `wikiIsRich` מדלג על Gemini כבד כשיש דיוקן+ביו (~1622–1629) — חיסכון עלות/latency; נמדד חי על נתניהו ~5.5ש׳.
- `.gitignore` כולל `.env*` ו־`.vercel`; משתנה יחיד ב־`.env.local`: `GOOGLE_GENERATIVE_AI_API_KEY` (שם בלבד — ערך לא נבדק/לא מצוטט). המפתח לא מופיע ב־`index.html`.
- UI RTL ברור + באנר אזהרה + `rel="noopener"` על קישורים חיצוניים; AbortController ~70ש׳ בצד לקוח (~901–902).
- `sanitizeExtraFacts` מסנן שדות רגישים (מצב משפחתי / ילדים / בן־זוג) (~1542).
- `vercel.json`: `maxDuration: 60` ל־`api/lookup.js` — מתאים לצינור הכבד.

## IMPROVE (מדורג לפי חומרה)

### P0 — קריטי
- **אין אימות ואין הגבלת קצב על ה־API הציבורי**  
  **איפה:** `handler` ב־`api/lookup.js` ~2269–2295; אין בדיקת API key/session, אין rate-limit גלובלי.  
  **מה לא בסדר:** כל גורם יכול לקרוא ל־`GET/OPTIONS /api/lookup` עם CORS `*` ולשרוף מכסת Gemini + זמן פונקציה (עד 60ש׳ לקריאה).  
  **השפעה:** ניצול עלות, DoS תפעולי, שימוש לרעה כ־proxy לחיפושי אנשים.  
  **תיקון מוצע:** מפתח דמו / allowlist origin + rate-limit (Vercel KV/Upstash או edge middleware), ומכסת קריאות ליום; לדמו ציבורי — CAPTCHA קל או טוקן חד־פעמי.

- **SSRF / open-fetch ב־`scanPage` / `enrichFromPages`**  
  **איפה:** `scanPage` ~1788–1800; `enrichFromPages` ~1843–1854 — עד 8 URL-ים מ־`sources` (כולל מ־Gemini grounding) עם `fetch` + `redirect: 'follow'`, בלי חסימת IP פרטי/metadata/localhost.  
  **מה לא בסדר:** תוקף/מודל שגוי יכול להזריק `http://169.254.169.254/...` או רשת פנימית; גם redirect ל־internal אחרי URL חיצוני.  
  **השפעה:** דליפת סביבת ענן / סריקת רשת פנימית דרך הפונקציה.  
  **תיקון מוצע:** allowlist סכמות `https` בלבד, חסימת טווחי RFC1918/link-local/metadata, `redirect: 'manual'` או בדיקת host אחרי כל redirect, ומגבלה לדומיינים "ציבוריים" (לא IP גולמי).

### P1 — גבוה
- **מפתח Gemini ב־query string של Google API**  
  **איפה:** `geminiGenerate` ~1589–1591: `...generateContent?key=${encodeURIComponent(key)}`.  
  **מה לא בסדר:** מפתחות ב־URL נוטים להישמר בלוגי פרוקסי/גישה/כלי ניטור.  
  **השפעה:** דליפת מפתח → ניצול מכסה / חיוב.  
  **תיקון מוצע:** להעביר לכותרת `x-goog-api-key` (או מנגנון auth הרשמי בלי query); לסובב מפתח אם היה חשוף בלוגים. *מסכים עם AUDIT-OPTIMIZE #10.*

- **CORS פתוח לחלוטין**  
  **איפה:** `res.setHeader('Access-Control-Allow-Origin', '*')` ~2270; אומת ב־OPTIONS חי מול Origin זר → `access-control-allow-origin: *`.  
  **מה לא בסדר:** כל אתר יכול להפעיל את ה־API מדפדפן המשתמש (בשילוב עם חוסר rate-limit).  
  **השפעה:** abuse צד־לקוח, קריאות חוצות־אתרים לדמו.  
  **תיקון מוצע:** לנעול ל־`https://akvot-simple-demo.vercel.app` (ואתרי preview מורשים בלבד).

- **מזהים רגישים ב־GET query (טלפון/אימייל)**  
  **איפה:** `pickContext` ~1945–1951; לקוח `ctxQuery` ב־`index.html` ~515–524 שולח `phone=`/`email=` ב־query; גם `stream=1&q=...`.  
  **מה לא בסדר:** URL מלא נרשם לעיתים ב־Vercel/CDN/Referer/היסטוריית דפדפן. ה־scrub מנקה את **גוף התשובה**, לא את בקשת ה־GET.  
  **השפעה:** PII בלוגים לזמן ארוך; סיכון פרטיות גבוה לדמו "טלפון ציבורי".  
  **תיקון מוצע:** `POST` JSON לגוף הבקשה; `Referrer-Policy: no-referrer`; צמצום TTL לוגים; לא לכלול מזהים ב־cache key גלוי אם עוברים ל־Redis משותף.

- **`javascript:` / URL לא בטוח ב־`href` אחרי `esc` בלבד**  
  **איפה:** `renderSourceRow` ~432; גלריית תמונות ~804 — `href="${esc(s.url)}"` / `src="${esc(photo)}"`.  
  **מה לא בסדר:** `esc` בורח מ־HTML entities אך לא מוודא `https:` בלבד; קישור `javascript:...` ממודל/מקור יכול לעבור.  
  **השפעה:** XSS מבוסס־לחיצה אם מקור זדוני נכנס ל־sources/images.  
  **תיקון מוצע:** מאמת URL משותף (`/^https:\/\//i` בלבד) לפני `href`/`src`; לדחות `data:`/`javascript:`.

### P2 — בינוני
- **מטמון תהליכי (`Map`) לא יציב ב־serverless + מפתחות עם PII**  
  **איפה:** `cache` / `CACHE_TTL_MS=150_000` ~49–50; `cacheKeyFor` ~1997–2007 כולל phone/email; `cacheGet`/`cacheSet` ~376–390.  
  **מה לא בסדר:** ב־Vercel כל instance מאבד/לא משתף מטמון → hit-rate נמוך; מפתחות מכילים מזהים בזיכרון.  
  **השפעה:** עלות Gemini כפולה, latency משתנה; סיכון פרטיות אם עוברים ל־KV בלי hashing.  
  **תיקון מוצע:** מטמון חיצוני עם מפתח hashed; TTL קצר ל־google-mode; לעולם לא לשמור ערכי טלפון גולמיים. *מסכים עם AUDIT-OPTIMIZE #2.*

- **אין אכיפת מתודת HTTP (מעבר ל־OPTIONS)**  
  **איפה:** `handler` ~2269–2271 — מטפל ב־OPTIONS ואז ממשיך בלי `if (req.method !== 'GET')`.  
  **מה לא בסדר:** POST/PUT וכו׳ עדיין יכולים להפעיל לוגיקה אם Vercel מעביר query.  
  **השפעה:** משטח התקפה רחב יותר מהנדרש.  
  **תיקון מוצע:** להחזיר 405 לכל מתודה שאינה GET (או POST אחרי מעבר לגוף).

- **`scrubPayloadIdentifiers` לא מנקה `sources[].url`**  
  **איפה:** `scrubSrc` ~2207–2211 משנה title/note בלבד.  
  **מה לא בסדר:** קישור עם `?tel=` / מספר בנתיב עלול לחזור ל־UI.  
  **השפעה:** דליפת מזהה דרך URL מוצג/נלחץ.  
  **תיקון מוצע:** scrub או הסתרת query strings ב־URL-ים לפני תשובה; או סינון קישורים שמכילים את וריאנטי הטלפון.

- **חסרים Security Headers ב־`vercel.json` / HTML**  
  **איפה:** `vercel.json` רק `maxDuration`; אין CSP / `X-Content-Type-Options` / `Referrer-Policy` בקובץ.  
  **מה לא בסדר:** דף סטטי עם `innerHTML` רב נהנה מ־CSP מחמיר.  
  **השפעה:** הקשחת XSS מוגבלת לשכבת `esc` בלבד.  
  **תיקון מוצע:** headers ב־`vercel.json` (CSP עם fonts.googleapis, img https, `default-src 'self'`). *מסכים עם AUDIT-OPTIMIZE #10.*

- **תלות ב־HTML scraping של Bing לתמונות**  
  **איפה:** `bingImages` ~1744–1763.  
  **מה לא בסדר:** שביר לפריסת Bing; UA מתחזה לדפדפן; איכות/רלוונטיות נמוכה (`score: 0.4`).  
  **השפעה:** תוצאות לא יציבות / תמונות שגויות כש־`allowBroadImages`.  
  **תיקון מוצע:** להשבית כש־wiki עשיר (כבר חלקי); או להסיר/להחליף ב־Commons בלבד.

### P3 — נמוך / חוב טכני
- **מונולית `lookup.js` ~2755 שורות** — קשה לסקירה/בדיקות; פונקציות כמו `musicBrainzLookup` (~652) נראות מיותמות מול שימוש ב־P434 ישיר (~2487). פיצול למודולים (wiki/gemini/enrich/scrub/handler).
- **הודעת 500 חושפת שם משתנה סביבה** — `missing GOOGLE_GENERATIVE_AI_API_KEY` (~2295). להחליף ב־`server misconfigured`.
- **`package.json` מינימלי** — אין scripts/lint/test; רגרסיות תלויות בסקריפטי `test-results/` בלבד.
- **מודל `gemini-flash-latest` (~6)** — alias נע; מומלץ לפין גרסה לשיחזור.
- **אין בדיקות יחידה ל־`normalizePhoneInput` / scrub / `shouldReturnCandidates`** — לוגיקת phone-a רגישה וצפופה (~108–143, ~2245).
- **`phase: 'phone-a'` קשיח ב־payload (~2733)** גם בחיפושי שם — מבלבל לדיבוג/טלמטריה.
- **UI: `innerHTML` רחב** למרות `esc` — עדיף DOM APIs או טמפלייט עם הבטחת URL; כפילות ולידציה טלפון לקוח/שרת.

## הזדמנויות
- מטמון דו־שכבתי: wiki/QID נפרד מתיק Google — מקצר latency לשמות ציבוריים חוזרים בלי לשמור PII.
- אחרי `wikiIsRich`: לדלג גם על `enrichFromPages`/Bing (AUDIT #1) — חיסכון נוסף מעבר לדילוג Gemini.
- מעבר ל־POST + טוקן דמו קצר־חיים מאפשר דמו ציבורי בטוח יותר בלי להרוג UX.
- טלמטריה מצטברת (mode/thin/ambiguous/latency/wikiError) בלי query גולמי — לכוון אופטימיזציות.
- פיצול קבצים + בדיקות ל־phone/EN disambig ישפרו מהירות פיתוח אחרי שלבי PHONE/EN.
- נעילת region קרוב לישראל (AUDIT #4) אם latency Wikimedia/Gemini קריטי לדמו.

## סיכום דירוג
Overall: **6.5/10**

הדמו מרשים מבחינת מוצר: צינור מקורות פתוחים, זהירות בשמות נפוצים, scrub טלפון, ו־UI עברי מלוטש — והתוצאה החיה על אישיות ציבורית יציבה. עם זאת, כ־API ציבורי ללא auth/rate-limit, עם CORS `*` ו־fetch פתוח ל־URL-ים ממודל, רמת האבטחה/העמידות אינה תואמת את רגישות תרחיש ה־OSINT. לפני הרחבת קהל: חובה לסגור abuse + SSRF, להוציא מפתח מ־query, ולהעביר מזהים מ־GET.


## P0 patched (2026-09-07)
CORS allowlist + method/rate-limit/optional AKVOT_DEMO_TOKEN; SSRF safeFetchPage (manual redirects) on scanPage/grounding. See P0-FIX-2026-09-07.md.
