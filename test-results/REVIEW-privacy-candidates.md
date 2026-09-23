# REVIEW — פרטיות · Scrub · Banned hosts · Candidates UX · גבולות מוצר/משפט

**קוד:** `api/lookup.js` (~2755) + `index.html` (~970)  
**תאריך:** 2026-09-07 · Asia/Jerusalem  
**היקף:** סקירת מקור בלבד — **ללא שינויי קוד**  
**כללים שנבדקו:** מקורות ציבוריים בלבד · אין Sync.me/Truecaller/GetContact/Eyecon · ספרות טלפון מנוקות מהתשובה · שם נפוץ/דו־משמעי → candidates עם 0 faces · אין עובדות מומצאות

---

## סיכום מנהלים

יש הגנות אמיתיות (ban-list על URL, scrub על טקסט, מסך מועמדים עם איפוס תמונות, thin לטלפון-בלבד).  
החורים החמורים ביותר הם: (1) **ביטול `softAmbiguous` אחרי “אות מגוגל”** שמאפשר דיוקן/תיק על שם נפוץ+הקשר חלש; (2) **scrub שלא נוגע ב־`url`** — ספרות טלפון יכולות לדלוף בקישורי מקורות; (3) **עובדות/גיל/לידה מ־Gemini** בלי cite-or-drop קשיח על שדות הבסיס; (4) **ban-list חלקי ב־TLD**.

---

## 1. מקורות ציבוריים בלבד / banned hosts

### מה עובד
| מקום | הערה |
|------|------|
| `BANNED_PHONE_HOSTS` L56 | Truecaller.com, sync.me/syncme, getcontact.com, eyecon., callapp, whocalls, showcaller, numverify |
| `isBannedPhoneHost` L145–147 | בשימוש ב־`googlePath` (L1712/1714), `orderAndDedupeSources` (L1919), `buildCandidates` (L2090), סינון סופי L2610 |
| Prompt ב־`googlePath` L1657 | הוראה מפורשת לא להשתמש באפליקציות caller-ID |
| UI באנר L347 | מצהיר “לא Sync.me/Truecaller” |

### חורים

#### H1 — TLD / דומיינים חלופיים של אותם מותגים (חומרה: גבוהה)
`BANNED_PHONE_HOSTS` תואם בעיקר `.com` / דפוסים צרים.

נבדק בפועל:
- `truecaller.in`, `truecaller.app` → **לא נחסמים**
- `getcontact.app` → **לא נחסם**
- `eyecon.me` → נחסם (בזכות `eyecon\.`)

גם מותגי people-search סמוכים (Spokeo, BeenVerified וכו') לא ברשימה — אם הכלל הוא “אין caller-ID apps” בלבד זה OK; אם הכלל הוא “אין מאגרי זיהוי טלפון פרטיים” — הרשימה צרה מדי.

**ציטוט:** L56, L145–147, L1712, L1919, L2610.

#### H2 — הסינון הוא על URL בתשובה, לא על *שימוש* בחיפוש (חומרה: גבוהה)
Gemini עם `google_search` (L1597) יכול **לקרוא** תוצאת Truecaller/Sync.me ב־SERP, להעתיק שם/שיוך ל־`summary` / `label` / `extra_facts`, ואז הקישור נזרק ב־filter. התוכן נשאר בלי cite אסור.

`googleLinksOnly` (L1890–1915) **לא** מזכיר ban-list ב־prompt; מסתמך רק על `orderAndDedupeSources` אחרי מיזוג.

**ציטוט:** L1589–1600, L1650–1741, L1890–1915.

#### H3 — Grounding redirect / query-string (חומרה: בינונית)
`resolveGroundingUrl` (L407–434) פותר redirect ל־URL סופי; אם הסופי הוא `truecaller.in` — לא ייחסם (H1).  
URL של Vertex עם `?q=truecaller` ב־query **לא** נחסם (הבדיקה על hostname/מחרוזת הדומיין הספציפית) — פחות קריטי אם אחרי resolve מתקבל דומיין אחר.

#### H4 — `scanPage` / `enrichFromPages` בלי ban מקומי (חומרה: נמוכה–בינונית)
L1788–1841 / L1843–1888 לא בודקים `isBannedPhoneHost`. בפועל הרשימה מגיעה אחרי `orderAndDedupeSources` (L2508) ולכן בדרך כלל כבר מסוננת — אבל כל נתיב עתידי שיוסיף links לפני הסינון ייסרק.

#### H5 — LinkedIn / רשתות כ־“ציבורי” (גבול מוצר)
Prompt L1664 מעודד “LinkedIn ציבורי”. זה לא caller-ID, אבל גבול משפטי/ToS נפרד (גירוד פרופילים, הסכמה). לא הפרה ישירה של הכלל האסור, אך סיכון מוצר.

---

## 2. Scrub טלפון / אימייל מהתשובה

### מה עובד
| מקום | הערה |
|------|------|
| `phoneVariants` L63–101 | 05x ↔ 972, מקפים/רווחים נפוצים |
| `scrubIdentifiers` L2171–2202 | החלפת מחרוזות + regex על ספרות עם `[\s./-]?` |
| `scrubPayloadIdentifiers` L2204–2233 | label/desc/extract/note/searchQ/alts/queries/sources.title|note/candidates/extra_facts.value|cite |
| Payload L2713–2715 | `phone: null`, `email: null` |
| `contextUsed` L2705–2706 | `'[provided]'` במקום ערך |
| `searchQ` L2728–2731 | עובר scrub לפני חשיפה |

### חורים

#### H6 — **`url` לא עובר scrub** (חומרה: קריטית)
`scrubSrc` (L2207–2211) מעתיק `...s` כולל **`url` כמו שהוא**, ומנקה רק `title`/`note`.

דליפה אפשרית ב:
- `sources[].url` (מוצג ב־UI: `index.html` L429 — `esc((s.url||'').replace(...))` — **ספרות נראות למשתמש**)
- `candidates[].sourcesPreview[].url` (UI L710 — `s.title\|\|s.url` — עד 60 תווים; טלפון ב־query/path ידלוף)
- `extra_facts[].url` (לא מנוקה; מוצג כקישור cite ב־L776/L462)
- `images[].url` / `photo` (נדיר, אבל לא מכוסה)

דוגמה קלאסית: דף `contact?tel=050…` או Google/SERP URL עם המספר ב־query אחרי resolve.

**ציטוט:** L2204–2233, L1550–1557 (`trimPayload` משאיר url), UI L429/L710.

#### H7 — וריאנטים שלא ב־`phoneVariants` (חומרה: בינונית)
לא מכוסים היטב:
- סוגריים: `(050) 123-4567`
- מקפים יוניקוד (`–`/`—`) מחוץ ל־`[\s./-]`
- נקודתיים / רווח כפול / `050/1234567` חלקי
- קידומת `972-50-…` עם מקפים בין חלקים שלא נוצרו ב־variants
- מספר בטקסט כמילים / RTL marks

כש־`includes(v)` נכשל וה־regex על ספרות רצופות-עם-מפרידים מוגבלים נכשל — הספרות נשארות ב־extract/note.

**ציטוט:** L63–101, L2171–2194.

#### H8 — אימייל חלש (חומרה: בינונית)
L2196–2199: רק התאמה מדויקת + `toLowerCase()`. לא:
- URL-encoding (`%40`)
- `user [at] domain` / `user(at)domain`
- אימייל בתוך `mailto:` או query ב־URL (שוב: URL לא מנוקה)

#### H9 — `maskPhoneForHint` דולף ספרות אם ייעשה בו שימוש (חומרה: נמוכה כרגע)
L149–153 מחזיר `XXX…YY` (3+2 ספרות). **כרגע לא נמצא שימוש** בקוד — dead code מסוכן.

#### H10 — מטמון / CDN (חומרה: נמוכה–בינונית לפרטיות תפעולית)
`cacheSet` שומר payload אחרי scrub (L2737–2738) — טוב.  
אבל `cacheKeyFor` (L1997–2007) כולל טלפון בזיכרון השרת; CORS `*` (L2270) מאפשר לכל אתר לקרוא ל־API עם טלפון של צד ג׳.

---

## 3. Candidates UX · 0 faces לשם נפוץ

### מה עובד
| מקום | הערה |
|------|------|
| `wikiPath` disambig EN/HE | L1091–1102, L1234–1245, L1389… → `ambiguous: true`, בלי entity |
| Handler softAmbiguous | L2347–2355 |
| איפוס תמונות ב־softAmbiguous | L2568–2571 |
| `returnCandidates` | L2665–2672 מאפס `outImages`/`photo`, `mode='candidates'` |
| UI `renderCandidates` | L705–756 — אין portrait |
| `render` gate | L760–762 מעדיף candidates על dossier |

### חורים

#### H11 — **`softAmbiguous = false` כשיש google signal + הקשר** (חומרה: קריטית לכלל “0 faces”)
L2428–2445:
```
else if (softAmbiguous && ctx.any && googleHasSignal) {
  ...
  softAmbiguous = false;  // ← מבטל את שער הדו־משמעות
}
```
`googleHasSignal` (L2390–2393) = ≥2 links **או** summary≥40 **או** ≥1 image — סף נמוך.

השלכות:
1. `allowBroadImages` (L2518) יכול להפוך ל־true אם יש `google.images`.
2. Bing/Commons/enrich יכולים להביא דיוקן (L2520–2593).
3. `shouldReturnCandidates`: אחרי ביטול softAmbiguous, אם התיק לא `thin` ולא `wikiCommitted` — L2695 מנקה candidates → **dossier עם פנים על ניחוש גוגל**.

תרחיש: «דני כהן» + עיר כלשהי → SERP רועש → תמונה/סיכום → **לא** מסך מועמדים.

**ציטוט:** L2390–2445, L2517–2593, L2654–2697, UI L758–804.

#### H12 — תמונות בנתיב “לא broad” עדיין אפשריות (חומרה: גבוהה)
כש־`!allowBroadImages` אבל לא softAmbiguous (L2572–2590): נשארות `google.images` + JSON-LD מ־enrich, ואף נקבע `base.photo` אם `scoreImage >= 0.8`.  
OG/JSON-LD מעסק לא קשור = פנים שגויות בלי מסך בחירה.

#### H13 — Wiki 429 / כשל בלי alts מספיקים (חומרה: גבוהה)
אם `wikiPath` מחזיר `found:false` + `error:429` בלי `ambiguous` ובלי ≥2 personish alts — `softAmbiguous` נשאר false → Gemini מלא → סיכון לתיק+פנים על שם נפוץ (תואם גם ממצאי AUDIT על יוסי כהן).

**ציטוט:** L2340–2355, L2377–2382.

#### H14 — `wikidataSearchHuman` בוחר אדם יחיד מאגרסיבית (חומרה: בינונית–גבוהה)
L895–903: מחזיר human ראשון עם `best >= 1` / soft Latin — עלול “לנעול” זהות לא נכונה בלי candidates.  
יש הגנת bare-EN לכמה exacts (L877–893) אבל לא לכל השמות הנפוצים בעברית בלי פירושונים בחיפוש.

#### H15 — `shouldReturnCandidates` + `wikiCommitted` (חומרה: בינונית)
L2250–2251: אם יש wiki עשיר לא־ambiguous, org/email לא יפתחו pick-screen. נכון לנתניהו; מסוכן אם ה־wiki שננעל הוא האדם הלא נכון לשם נפוץ עם primary בוויקי (למשל דף יחיד מפורסם שחוסם siblings — תלוי ב־`shouldSoftAmbiguousExact` L811–816 שדורש ≥2 siblings ב־search hits).

#### H16 — UI: ambiguous בלי ≥2 candidates → refine במקום candidates (חומרה: נמוכה)
`needsRefine` L700: `ambiguous && candidates < 2` → טופס חידוד, לא pick-screen. לא מציג פנים (טוב), אבל שובר את ה־UX “candidates עם 0 faces”.

#### H17 — אחרי אישור מועמד (`focus`) (חומרה: נמוכה–בינונית)
L2246 / L2692–2694: focus מדלג על pick-screen ומעמיק. זה מכוון; אם המשתמש אישר תווית מומצאת מ־Gemini (`candidate_labels` נזרעים ל־alts ב־L2605–2606) — מעמיקים על שם לא מבוסס.

---

## 4. אין עובדות מומצאות (cite-or-drop)

### מה עובד
- Prompt קשיח ב־`googlePath` L1673–1681
- `sanitizeExtraFacts` מסנן ריקים / מצב משפחתי L1524–1546
- Phone-only thin כש־`!phoneSignal` L2673–2691
- `dryBio` מעדיף wiki extract L1508–1521

### חורים

#### H18 — **שדות בסיס מ־Gemini בלי אימות מקור** (חומרה: קריטית ל־“no invented facts”)
ב־`base` (L2428–2453 וכו'):
- `birth` / `age` / `place` / `role` / `org` / `desc` / `summary` מגיעים מ־`data.*` של המודל
- `ageFromYear(birth)` L1731 **מחשב גיל** על לידה שעלולה להיות מומצאת
- `extra_facts` עם `cite: 'חיפוש גוגל'` (L2553–2554) עוברים sanitize בלי לבדוק ש־value מופיע ב־sources

אין שלב “drop if not substring of grounded chunk / scanned page”.

**ציטוט:** L1710–1736, L2395–2465, L2551–2565.

#### H19 — `candidate_labels` כהמצאת זהויות (חומרה: בינונית)
L1715–1716 + L2605–2606: תוויות מהמודל נכנסות ל־wiki.alts → `buildCandidates`. יכולות ליצור מועמדים שלא קיימים במקורות.

#### H20 — `parseJsonLoose` (L310+) על טקסט חופשי (חומרה: בינונית)
כשל/JSON חלקי → שדות חלקיים; אין סכמה קשיחה שמוודאת URL∈groundingChunks.

#### H21 — Open Library בלי wiki (L2478–2483)
יש סינון `conf >= 0.85`, אבל name-match על שם נפוץ עדיין עלול לשייך ספר/מחבר לא נכון כ־identity source (פחות פנים, עדיין “עובדה”).

---

## 5. גבולות משפטיים / מוצר (מעבר לכללי הדמו)

| נושא | איפה | סיכון |
|------|------|--------|
| API פתוח + CORS `*` | L2270 | Lookup טלפון מצד ג׳ / שימוש לרעה |
| טלפון כטריגר SERP | `buildSearchQ` L1983–1990, `googlePath` | גם בלי להציג ספרות — עצם החיפוש הוא עיבוד מזהה רגיש |
| גירוד HTML (`scanPage`) | L1788+ | ToS של אתרים; PII ב־OG description (מנוקה חלקית בטקסט בלבד) |
| אין הגבלת קצב/auth גלויה בקוד | handler | דמו קל להרצה המונית |
| `phase: 'phone-a'` | L2733 | מסמן מוצר מבוסס טלפון — רגישות רגולטורית (IL privacy) גבוהה יותר משם בלבד |

הדמו מצהיר “ציבורי בלבד”; זה **לא** שווה ל־“חוקי תמיד” (מאגרי אנשי קשר, הסכמה, GDPR/חוק הגנת הפרטיות).

---

## 6. Frontend (`index.html`) — חורים משלימים

| חור | שורות | פירוט |
|-----|--------|--------|
| הצגת URL מלא כמעט | L429, L432 | מדליף טלפון שנשאר ב־`sources[].url` (H6) |
| sourcesPreview | L710 | fallback ל־`s.url` |
| טלפון נשלח שוב בכל refine/approve | L749, L521, L870 | מכוון; נשמר ב־`lastCtx` בזיכרון הדפדפן |
| ולידציה רכה | L531–576 | טלפון לא תקין+שם ממשיך בלי טלפון — תואם שרת L2287–2292 |
| Dossier מציג birth/age/place | L769–777 | אם השרת המציא — ה־UI מציג כאמת |
| אין הצגת `queries`/`searchQ` ב־UI | — | מפחית דליפה ויזואלית; עדיין ב־JSON לתשובת API |

---

## 7. מטריצת חומרה (ממוינת)

| ID | חומרה | כלל שנשבר | אזור |
|----|--------|------------|------|
| H11 | קריטי | ambiguous → 0 faces | L2428–2445 + L2518–2593 |
| H6 | קריטי | phone digits scrubbed | L2207–2211; UI L429/L710 |
| H18 | קריטי | no invented facts | L1710–1736, L2551–2555 |
| H2 | גבוה | public / no banned apps | Gemini grounding vs URL filter |
| H1 | גבוה | no Truecaller/… | L56 TLD gaps |
| H12 | גבוה | 0 faces | L2572–2590 |
| H13 | גבוה | candidates / 0 faces | wiki 429 path |
| H7/H8 | בינוני | scrub | variants / email |
| H14 | בינוני | no wrong identity | `wikidataSearchHuman` |
| H19 | בינוני | no invented facts | `candidate_labels` |
| H5/§5 | מוצר/משפט | public-sources boundary | LinkedIn, CORS, scrape |

---

## 8. מה *לא* נראה כחור (לתיעוד חיובי)

1. מסך `mode=candidates` / `needCandidatePick` מאפס תמונות בשרת (L2665–2672).  
2. Phone-only בלי `phoneSignal` → thin + `candidates=[]` (L2642–2651, L2673–2691).  
3. Payload לא מחזיר `phone`/`email` גולמיים (L2713–2715).  
4. `googlePath` מסנן ban אחרי resolve (L1712–1714).  
5. UI למועמדים לא מרנדר portrait (L705–756).  
6. משפחתית/ילדים מסוננים מ־extra_facts (L1542).

---

## 9. כיווני תיקון מומלצים (תיאור בלבד — לא יושמו)

1. **לא לבטל `softAmbiguous`** על google signal חלש; במקום זאת: תמיד `shouldReturnCandidates` כשיש ≥2 מועמדי ויקי/paren, גם עם city/org; פנים רק אחרי `focus` או wikiCommitted חד־משמעי.  
2. **Scrub גם ל־`url`** (path/query/fragment) — או הסתרת query ב־UI והחלפת ספרות ב־URL לפני JSON.  
3. **הרחבת ban:** `truecaller.`, `getcontact.`, דומיינים מוכרים נוספים; סינון גם על hostname אחרי `new URL`.  
4. **Cite-or-drop לשדות בסיס:** birth/place/role/org/summary רק אם מגובים ב־chunk/scan; אל תחשב `age` מלידה לא מאומתת.  
5. על wiki 429 לשם שנראה נפוץ — candidates/thin בלי Gemini פנים.  
6. Auth / קצב / הסרת CORS `*` לדמו פרוד אם יש טלפון.

---

*סוף REVIEW — אין שינויי קוד בסיבוב זה.*
