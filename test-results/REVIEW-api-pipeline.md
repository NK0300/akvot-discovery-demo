# סקירת קוד מלאה — akvot-simple-demo API pipeline

**תאריך:** 2026-09-07 · Asia/Jerusalem (UTC+3)  
**היקף:** `api/lookup.js` (2755 שורות) · `vercel.json` · `package.json`  
**מצב:** דוח בלבד — **ללא שינויי קוד**  
**מוצר:** דמו תיק ציבורי OSINT בעברית · מקורות פתוחים בלבד · איסור Truecaller/Sync.me · scrub טלפון · candidates לשמות דו־משמעיים · Gemini `google_search`

---

## 0. מפת צינור (pipeline map)

```
GET /api/lookup?q|phone|email[+city|org|role|context|focus|stream|nocache]
        │
        ├─ cacheGet (Map מקומי, TTL 150s) ──HIT──► JSON / SSE result
        │
        ▼ MISS
   ① wikiPath(wikiName=focus||q)
        HE search | Latin→EN/WD/EN-search
        soft-ambiguous early return | fetchHumanCandidate
        WD claims → social + registry + P18/labels
        │
   ② gate: softAmbiguous / wikiIsRich|wikiLight / budgetLeft / forceGoogle
        │         └─ skip או googlePath (Gemini + google_search, 24s)
        │
   ③ merge base (wiki | ambiguous | google)
        │
   ④ Promise.all:
        resolveSourceUrls · googleLinksOnly? · OpenLibrary (+ MBID inline)
        │
   ⑤ Promise.all:
        enrichFromPages (≤8 HTML, conc=5) · Commons · Bing?
        │
   ⑥ dryBio · buildCandidates · shouldReturnCandidates
        phoneSignal / honest-thin
        │
   ⑦ scrubPayloadIdentifiers → trimPayload → cacheSet → JSON/SSE
```

**תקציב זמן:** `vercel.json` `maxDuration: 60` · שער פנימי `budgetLeft = 52000 - elapsed` (רק לפני Gemini).  
**מודל:** `gemini-flash-latest` · כלי: `{ google_search: {} }`.  
**תלויות:** `package.json` ריק מ־deps (Node fetch בלבד) — נכון לדמו.

---

## 1. Critical

### C1 — Wiki 429 בלי soft-ambiguous → Gemini מלא (~24–32s) בתוך תקציב 60s
**שורות:** `2340–2345`, `2352–2354`, `2369–2382`, `1589–1604`  
**מה קורה:** אם `wikiPath` מחזיר `{ found:false, error:'429' }` בלי מספיק `personishAlts` (≥2 עם סוגריים/פירושונים), `softAmbiguous=false`. אז לא נכנסים לדילוג Gemini, ונופלים ל־`else` → `googlePath` מלא.  
**בנוסף:** retry מלא של `wikiPath` אחרי 600ms כבר שרף זמן + Wikimedia quota, ואז Gemini על אותה בקשה.  
**השפעה:** זנב latency ~30s+, עלות Gemini, סיכון timeout; תוצאות candidates חלשות תחת עומס.  
**תיקון מומלץ:** על `wiki.error ~ 429|503` ו־`!forceGoogle` (אין phone/email/focus): אל תקראו ל־Gemini; החזירו thin/candidates מ־alts של חיפוש HE/WD בלבד, או WD-only human search עם שער ambiguous.

### C2 — מפתח Gemini ב־query string
**שורה:** `1591`  
```js
`.../generateContent?key=${encodeURIComponent(key)}`
```
**סיכון:** מפתח ב־URL → לוגים של פרוקסי/CDN/access, Referer, כלי דיבאג.  
**תיקון:** `x-goog-api-key` header (או מפתח בגוף לפי תיעוד Generative Language API) — לעולם לא ב־query.

### C3 — scrub לא נוגע ב־`sources[].url` / `images[].url` / `extra_facts[].url`
**שורות:** `2204–2233` (`scrubSrc` משנה רק `title`/`note`)  
**סיכון פרטיות:** דפי grounding / חיפוש לעיתים כוללים את המספר ב־query (`?q=050…`, `tel:` בעמודים שנסרקו כ־note כבר מנוקה — אבל URL נשאר). הטלפון אמור להיות **טריגר בלבד**, לא לחזור בפלט.  
**תיקון:** להריץ `scrubIdentifiers` גם על `url` (או להסיר query params שמכילים וריאנטים של המספר); לסנן `tel:` links.

---

## 2. High

### H1 — `wikiIsRich` מדלג על Gemini אבל **לא** על enrich/Commons/Bing
**שורות:** `1622–1629`, `2366–2368`, `2515–2527`, `1843–1854`  
גם כש־`emit(1, 'ויקי עשיר')` מדלג על Google, הצינור עדיין מריץ:
- `enrichFromPages` עד 8 דפים, concurrency 5, timeout 5.2s כ״א  
- Commons search  
- (אם לא rich אז גם Bing — אבל גם ב־rich עדיין Commons+scrape)  

**עדות ארכיטקטונית:** celebrity HE עם דיוקן+bio+≥3 sources עדיין משלם על סריקות HTML ללא ערך מוצרי.  
**תיקון:** early-return / slim post-path כש־`rich && !forceGoogle`: דלג על scrape+Bing; Commons רק אם אין photo/P18.

### H2 — `forceGoogle` / `strongId` כוללים `org` בלבד → Gemini גם על ויקי עשיר
**שורות:** `1968`, `2359`, `2366`  
`strongId = !!(phoneRaw || email || org)` ו־`forceGoogle` כולל `strongId`.  
בקשת `q=נתניהו&org=ליכוד` תמיד מפעילה `googlePath` גם כשוויקי מלא.  
**תיקון:** `forceGoogle` רק ל־`phone|email|focus`; `org/city/role` כ־bias קל או Gemini רק אם wiki miss/ambiguous.

### H3 — אין abort כשהלקוח מתנתק (SSE/JSON)
**שורות:** handler `2269–2754` — אין `req.on('close')` / AbortController משותף.  
אחרי disconnect הצינור ממשיך Gemini + 8 scrapes + Bing — בזבוז כסף ו־Wikimedia quota.  
**תיקון:** `const ac = new AbortController(); req.on('close', () => ac.abort())` והעברה ל־`jfetch`/`geminiGenerate`/`scanPage`.

### H4 — Cache stampede + `nocache=1` עדיין כותב ל־Map
**שורות:** `2304–2320`, `2737–2738`, `49–50`, `376–391`  
- שני בקשות מקבילות לאותו מפתח → miss כפול → שני Gemini.  
- `nocache` מדלג על **קריאה** אבל `cacheSet` עדיין רץ.  
- Cache הוא `Map` per-instance — cold start = ריק; CDN `s-maxage=45` לא אמין בין instances.  
**תיקון:** singleflight / KV משותף; אל תכתבו cache כש־`nocache=1`.

### H5 — כפילות Gemini: `googlePath` + `googleLinksOnly`
**שורות:** `1650–1741` (24s), `1890–1915` (18s), `2470–2472`, `2409`/`2465`  
במצב google / `needLinksBoost=true` אפשר שני קריאות grounding. תקציבי timeout מקוננים (24+18) + wiki retry עלולים להתקרב ל־60s.  
**תיקון:** קריאה אחת שמחזירה links+dossier; או `googleLinksOnly` רק אם `links.length<2 && budgetLeft()>15000`.

### H6 — `wikidataSearchHuman` — עד 6× `getEntity` סדרתי
**שורות:** `845–908`  
כל hit מ־wbsearchentities גורר `getEntity` סידרתי → מגביר 429 ומאריך Latin/fallback path.  
**תיקון:** batch `wbgetentities` עם כל ה־ids בבת אחת, ואז סינון Q5.

### H7 — `scanPage` בלי הגבלת גודל גוף
**שורות:** `1788–1840`  
`await r.text()` על HTML שרירותי — סיכון זיכרון ב־serverless אם מקור מחזיר מגה־בייטים.  
**תיקון:** קרא stream עם cap (~512KB–1MB) או בדוק `content-length`.

### H8 — `phoneVariants` מניח IL גם למספרים בינלאומיים
**שורה:** `99`  
```js
out.add('+' + (d0.startsWith('972') ? d0 : ('972' + (local.startsWith('0') ? local.slice(1) : d0))));
```
מספר שאינו IL (למשל `12025551234`) מקבל וריאנט `+97212025551234` שגוי → חיפוש/scrub מעוותים.  
**תיקון:** הוסף `+972…` רק כש־`normalizePhoneInput` סימן `il-*` / התחיל ב־972/0.

---

## 3. Medium

### M1 — `budgetLeft()` לא שומר על enrich/Bing/OL
**שורות:** `2360`, `2369` בלבד  
אחרי Gemini ארוך עדיין רצים scrape+Commons+Bing בלי בדיקת תקציב → סיכון Vercel kill ב־60s.  
**תיקון:** deadline גלובלי; אם `budgetLeft()<8s` דלג על enrich/Bing/OL וסמן `degraded:true`.

### M2 — `resolveSourceUrls` כפול על לינקי Google
**שורות:** `1713` (בתוך `googlePath`) + `2501–2502` (handler על `sources` שכוללים `google.links`)  
כל grounding URL עלול להיפתר פעמיים (GET+HEAD עד ~8.5s כ״א, pool 5).  
**תיקון:** סמן `resolved:true` או פתור רק פעם אחת בסוף המיזוג.

### M3 — `jfetch(..., retries=2)` = **2 ניסיונות** לא 2 retries
**שורות:** `186–212`  
שם הפרמטר מטעה; לולאה `i < retries`. תחת 429 זה מעט — בשילוב עם retry מלא של `wikiPath` יוצר דפוס לא עקבי.

### M4 — `wikiBackoffUntil` מודול־גלובלי בלי תיאום בין instances
**שורות:** `157–165`  
טוב בתוך instance אחד; ב־Vercel כל instance נפרד → עדיין יורים במקביל ל־Wikimedia. לא באג לוגיקה, כן מגבלת ארכיטקטורה.

### M5 — CORS `Access-Control-Allow-Origin: *`
**שורה:** `2270`  
API ציבורי עם עלות Gemini מאחוריו — כל אתר יכול להפעיל את הפונקציה מהדפדפן של משתמש.  
**תיקון:** Origin של הדמו בלבד (+ preflight).

### M6 — אין `regions` ב־`vercel.json`
**קובץ:** `vercel.json` (רק `maxDuration: 60`)  
ריצה ב־`iad1` (US) מוסיפה RTT לכל HE wiki / WD / Gemini למשתמשי IL.  
**תיקון:** `"regions": ["fra1"]` (או tlv אם זמין בתוכנית).

### M7 — `bingImages` — HTML scrape שביר + ToS
**שורות:** `1744–1763`  
Regex על `murl&quot;` + UA של Chrome — נשבר בקלות; שכבת תמונות כפולה ל־Commons.  
**תיקון:** opt-in או השבתה כשיש P18/Commons≥N.

### M8 — `parseJsonLoose` עם `\{[\s\S]*\}` חמדן
**שורות:** `310–316`  
עלול לתפוס JSON שגוי אם יש כמה אובייקטים / טקסט אחרי. עדיף לאזן סוגריים או `json_schema` / responseMimeType אם המודל תומך.

### M9 — `computeThin` מקבל `extract` ולא משתמש בו
**שורות:** `2259–2266`  
פרמטר מת; thin לא מתחשב באורך bio — תיק דל טקסט עם 3 לינקים לא ייחשב thin.

### M10 — `phase: 'phone-a'` חותמת ישנה
**שורה:** `2733`  
מטעה בדיבאג/בדיקות רגרסיה.

### M11 — `BANNED_PHONE_HOSTS` — כפילות `sync\.me`
**שורה:** `56`  
לא באג פונקציונלי; רעש תחזוקה. חסרים אולי דומיינים נוספים (הגנה בשכבות prompt+filter — KEEP את הגישה הכפולה).

### M12 — Race cache / SSE headers
כש־`wantStream`, לא מוגדר `Cache-Control` CDN על miss path לפני העבודה; HIT ב־SSE עובד. עקביות headers בין JSON/SSE חלקית.

### M13 — `openLibraryLookup(q, null)` גם בלי wiki (phone-only / miss)
**שורות:** `2476–2484`  
מסונן ל־conf≥0.85, אבל עדיין I/O מיותר ב־phone-only thin path.

---

## 4. Low

### L1 — Dead code
| סימבול | שורות | הערה |
|--------|-------|------|
| `musicBrainzLookup` | `652–685` | לא נקרא; MBID מוטמע inline ב־`2487–2498` |
| `maskPhoneForHint` | `149–153` | לא נקרא |
| `const ac` ב־`phoneVariants` | `91` | מחושב ולא בשימוש |
| `titleToQid` ≈ `titleToQidLang(...,'he')` | `491–502` / `830–842` | כפילות |

### L2 — Empty `catch {}` רבים
מקשה על אבחון שטח; לפחות `wikiError` / counters.

### L3 — `ageFromYear` בלי יום־חודש
**שורות:** `176–179` — גיל משוער ±1; מקובל לדמו.

### L4 — `package.json` מינימלי
אין scripts/engines — בסדר לדמו Vercel; אין lockfile של deps חיצוניים.

### L5 — `softLatinClose` Levenshtein ≤2 על Latin מקופל
עלול לחבר שמות קצרים דומים (נדיר); שמרו על `tokens.length` gate.

### L6 — `mapPool` אינדקס משותף
בטוח ב־JS חד־תהליכי; לא באג.

### L7 — ספירת `retries` / הודעות שגיאה כ־`'429'` גם ל־timeout
**שורות:** `1048`, `1052`, `1067` — מטשטש timeout מול rate-limit ב־UI/`wikiError`.

---

## 5. נכונות צינור (pipeline correctness)

| שלב | הערכה | הערות |
|-----|--------|-------|
| **wiki → human-only (Q5)** | ✅ חזק | `isHumanEntity`; reject not-human / disambig |
| **Latin → EN/WD לפני HE** | ✅ | חוסך 429 על HE; Obama/Galon path |
| **soft-ambiguous → 0 faces** | ✅ קריטי למוצר | `allowBroadImages` / `outImages=[]` / candidates |
| **wikiIsRich skip Gemini** | ✅ חלקי | דילוג Gemini כן; post-enrich לא (H1) |
| **gemini google_search + cite-or-drop** | ✅ כיוון נכון | prompt קשיח; `parseJsonLoose` חלש (M8); אין retry 429 על Gemini |
| **enrich pages** | ⚠️ | מועיל ל־google-mode; מזיק ל־rich-wiki |
| **candidates + focus deepen** | ✅ | `shouldReturnCandidates` + `wikiCommitted` מונע demote שגוי |
| **phone ban + scrub** | ⚠️ כמעט | ban hosts + prompt; scrub מפספס URL (C3); variants IL-biased (H8) |
| **429 paths** | ❌ חלש | C1 + H6 + כפילות retry |

**סדר נכון לוגית:** wiki → (gate) gemini → merge → enrich → candidates → scrub — **כן**.  
**כשלים עיקריים:** תקציב לא חוצה את enrich; 429→Gemini; scrub URL; org→forceGoogle.

---

## 6. Race / errors / timeouts / 429

| נושא | מצב | שורות מפתח |
|------|-----|-----------|
| AbortSignal.timeout על I/O עיקרי | ✅ | jfetch 8s, summary 7s, gemini 24s, scan 5.2s, bing 7.5s |
| Client disconnect abort | ❌ | — |
| Wiki shared backoff | ✅ בתוך instance | `157–165` |
| Wiki 429 → full path retry + Gemini | ❌ | `2340–2382` |
| Gemini 429/retry | ❌ | זריקה מיידית `1602–1603` |
| Cache stampede | ❌ | `2307–2320` |
| mapPool races | ✅ (JS) | `393–404` |
| SSE write אחרי close | catch ריק | `1939–1941`, `2747–2751` |
| שגיאות wiki נשמרות כ־`wikiError`, לא ב־cache | ✅ | `2738` |

---

## 7. צווארי בקבוק ביצועים (מהקוד, לא ממדידות חיות)

1. **`enrichFromPages` תמיד אחרי המיזוג** (גם rich) — עד 8×HTML.  
2. **`googlePath` 24s + אופציונלי `googleLinksOnly` 18s**.  
3. **`wikidataSearchHuman` getEntity סדרתי**.  
4. **`resolveSourceUrls` כפול** על grounding hosts.  
5. **`wikiPath` Latin:** EN summary → WD → EN search לעיתים סדרתי במקום `Promise.all` חלקי.  
6. **אין region IL/EU** — RTT על כל fan-out.  
7. **Cache רק in-memory** — cold = מלא כל פעם.  
8. **Bing HTML** + Commons גם כשיש כבר דיוקן ויקי.

---

## 8. KEEP — אל תשנו / אל תחלישו

1. **Soft-ambiguous / candidates → 0 דיוקנים** עד בחירה (`focus`) — אמון הליבה.  
2. **איסור Truecaller / Sync.me / GetContact / Eyecon…** ב־`BANNED_PHONE_HOSTS` + הוראות prompt.  
3. **טלפון/אימייל = טריגר חיפוש בלבד**; `contextUsed.phone='[provided]'`; לא להחזיר ערכים גולמיים.  
4. **`isHumanEntity` (P31=Q5)** — מונע ארגונים/קבוצות כתיק אדם.  
5. **Latin → EN/WD לפני HE search** — נכונות EN + חיסכון quota.  
6. **`wikiIsRich` / `wikiLight` כרעיון** — להרחיב לדילוג enrich, לא לבטל.  
7. **`dryBio` wiki-first + `sanitizeExtraFacts` cite-or-drop**.  
8. **`shouldReturnCandidates` + `wikiCommitted`** — org/email לא מפרקים תיק ויקי חד־משמעי.  
9. **Phone-only honest thin** כש־`!phoneSignal` — בלי ניחוש זהות.  
10. **SSE progress channel** — להרחיב ל־`partial`, לא להסיר.  
11. **`maxDuration: 60`** עד שיושבו H5/C1.  
12. **מקורות פתוחים בלבד** כמסגרת מוצר.

---

## 9. Top 10 תיקונים (מדורגים)

| # | תיקון | חומרה | מאמץ | למה עכשיו |
|---|--------|--------|------|-----------|
| **1** | על wiki `429/503` ו־`!forceGoogle(phone\|email\|focus)` — **בלי Gemini**; thin/candidates מ־alts/WD | Critical | M | מונע זנב ~30s + עלות |
| **2** | Early-return ל־`wikiIsRich`: דלג enrich/Bing/(Commons אם יש photo) | High | S | −שניות על celebrity path |
| **3** | מפתח Gemini ב־header, לא ב־query | Critical | S | אבטחת מפתח |
| **4** | Scrub גם `url` (sources/images/facts) מוריאנטי טלפון | Critical | S | פרטיות מוצר |
| **5** | איחוד/שער `googleLinksOnly` — מקס׳ Gemini אחד לבקשה + `budgetLeft` | High | S–M | timeout + $ |
| **6** | `forceGoogle` בלי `org` לבד; org כ־bias | High | S | wiki-rich לא נשרף |
| **7** | AbortController על disconnect הלקוח | High | M | עצירת עבודה מבוזבזת |
| **8** | Batch `wbgetentities` ב־`wikidataSearchHuman` | High | S | 429 + latency Latin |
| **9** | `regions: ["fra1"]` + deadline ל־enrich | Medium/High | S | p50 IL + זנבות |
| **10** | תיקון `phoneVariants` ל־IL-only + מחיקת dead code (`musicBrainzLookup`, `maskPhoneForHint`) + `phase` עדכני | High/Low | S | נכונות scrub/חיפוש + ניקיון |

**בונוס מבני (אחרי 1–10):** KV/Redis cache + singleflight; פיצול `lookup.js` למודולים (`wiki` / `gemini` / `enrich` / `candidates` / `scrub` / `handler`); cap על `scanPage` body.

---

## 10. סיכום מנהלים (עברית)

הצינור **נכון לוגית** (ויקי→שער→ג׳מיני→העשרה→מועמדים→scrub) ושומר על עקרונות המוצר החשובים: מקורות פתוחים, איסור מאגרי caller-ID, דיוקן אפס לשם דו־משמעי, טלפון כטריגר.  
הסיכונים הקשים הם **תפעוליים ופרטיות**: תחת Wikimedia 429 המערכת נופלת ל־Gemini יקר/איטי; ויקי עשיר עדיין משלם על סריקות HTML; מפתח API ב־URL; scrub לא מנקה מספרי טלפון מתוך URLs.  
תיקוני ה־S/M בראש הטבלה (#1–#6, #9–#10) יתנו את רוב הרווח בלי לשבור את מה שכבר עובד בבטריות PHONE/EN/candidates.

---

## 11. נספח — קבצי תצורה

### `vercel.json`
```json
{ "functions": { "api/lookup.js": { "maxDuration": 60 } } }
```
חסר: `regions`, security headers, CORS.

### `package.json`
```json
{ "name": "akvot-simple-demo", "private": true, "type": "module" }
```
אין dependencies — ה־API נשען על `fetch` המובנה. מתאים לדמו; אין בדיקות/unit scripts כאן.

---

*סוף דוח · REVIEW-api-pipeline.md · מקור אמת: `/workspace/akvot-quick-demo/api/lookup.js` @ 2755 LOC*
