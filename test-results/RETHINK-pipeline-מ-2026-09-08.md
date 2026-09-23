# RETHINK — צינור חיפוש · מ
Date: 2026-09-08

**היקף:** `api/lookup.js` (phase=`speed-b` בקופסה ובפרוד) · recall/precision ל«זר» / לא־מפורסם  
**לא נגעתי:** קוד אפליקציה · דיפלוי  
**Live:** https://akvot-simple-demo.vercel.app (אומת `phase: speed-b`)

---

## מטרת מוצר (כפי שהבנתי)

AkVot דמו הוא **תיק זהות ציבורית ממקורות פתוחים**: שם / טלפון / אימייל (+ הקשר) → כרטיס עם דיוקן, ביו, עובדות עם cite, ומקורות — או **מסך מועמדים** כשאין התחייבות בטוחה.  
עקרונות קיימים שכדאי לשמור: cite-or-drop, scrub מזהים, חסימת caller-ID, 0 פנים על שם נפוץ בלי בחירה, ויקי עשיר בלי Gemini למפורסמים.

**פער המוצר:** הצינור מצוין ל**סלב / ערך ויקי חד־משמעי**. ל**אדם רגיל / זר** (אין HE wiki, או שם נפוץ בלי ערך, או Latin עם פירושונים) הוא נעצר מוקדם מדי (candidates ריקים ממקורות) או נופל ל־Gemini עם הטיה ישראלית — וזה לא אותו מוצר כמו «מצא את האדם הנכון בעולם».

---

## מפת צינור נוכחי (שלבים)

```
input (q|phone|email + city|org|role|context|focus)
        │
        ▼
pickContext / buildSearchQ / cacheKeyFor
        │
① wikiPath(wikiName = focus||q)
   · HE: searchHe → exactHit / shouldSoftAmbiguousExact → fetchHumanCandidate
   · Latin (isLatinScriptQuery): pageSummary(en) + wikidataSearchHuman + searchEn
     → disambiguation early return | bare EN human | WD | EN near-match
   · softAmbiguous / alts מ־heDisambigAlts | enDisambigAlts | weakHumanAlts
   · entity → socialFromEntity + registryFromEntity (רק claims WD) + P18/labels
        │
② שערים לפני Gemini
   · softAmbiguous && !ctx.any && !forceGoogle     → דילוג Gemini («כמה התאמות»)
   · wikiIsRich | wikiLight && !ctx.any            → דילוג Gemini («ויקי עשיר»)
   · wikiRateLimited && !forceGeminiOnWiki429      → בלי Gemini
   · budgetLeft()<12s && wiki.found                → דילוג
   · else / softAmbiguous+ctx.any / forceGoogle    → googlePath (Gemini + google_search)
   · forceGoogle = phone|email|focus בלבד
        │
③ מיזוג base
   · wiki.found → mode wiki | wiki+google
   · softAmbiguous בלי אות Google חזק → mode ambiguous, sources=[]
   · softAmbiguous+ctx: מתחייבים ל־google רק אם strongConfirm (focus | wiki QID)
   · else → mode google
        │
④ registries + resolve
   · pureCandidates → מדלג OL + resolve grounding
   · אחרת: openLibraryLookup (fuzzy/P648) · MusicBrainz רק P434
        │
⑤ enrich
   · skipHeavyEnrich אם rich|budget|abort
   · enrichFromPages · commonsImagesForPerson · bingImages
   · softAmbiguous → outImages=[] (0 פנים)
        │
⑥ buildCandidates · shouldReturnCandidates · computeThin · phoneSignal
        │
⑦ scrubPayloadIdentifiers · trimPayload · phase speed-b · JSON/SSE
```

**מצבי תגובה:** `wiki` · `wiki+google` · `ambiguous` · `candidates` (אחרי `shouldReturnCandidates`) · `google` (+ thin / phone honest-thin).

---

## למה זה נכשל על «זר» / לא־מפורסם

### כשלי recall

1. **`softAmbiguous && !ctx.any && !forceGoogle`** — שם נפוץ (HE או EN) מקבל מסך מועמדים **בלי שום חיפוש רשת**. `sources=[]`, `pureCandidates=true`, אין OL/Gemini/enrich. רלוונטי ל«דני כהן» / «John Smith». טוב לדיוק פנים; **הורג גילוי** של אדם רגיל שלא בויקי.

2. **אין שלב discovery מחוץ לויקי/WD** — `registryFromEntity` / `socialFromEntity` נשלפים **רק אחרי** QID. אין חיפוש ORCID / VIAF / NLI / OpenCorporates / LinkedIn-public כמסלול גילוי לאדם בלי ערך. לא־מפורסם בלי WD = כמעט רק Gemini או thin.

3. **`wikidataSearchHuman` סדרתי** — עד 6× `getEntity` ברצף. תחת 429 ה־Latin path נמשך עשרות שניות (smoke: John Smith `wiki≈40s`, Zehava `wiki≈45s`) ושורף תקציב לפני ש־Gemini בכלל רץ. Matti Friedman **timeout 55s** ב־smoke.

4. **`blockWd` כש־`weakHumanAlts.length > 0`** — ברגע שנאספו כותרות עם סוגריים, חוסמים WD fallback. שם עברי נפוץ עם רעש חיפוש לא מקבל הזדמנות ל־QID נדיר / תעתיק.

5. **הטיית שפה ב־`googlePath` + `pagePreferScore`** — הפרומפט מעדיף `wikipedia, gov.il, …, .il`; `pagePreferScore` נותן +4.5 ל־gov / +2 ל־`.il`. לזר (US/EU/Asia) דירוג המקורות **מפלה**; תוצאות LinkedIn/company/domain זרות נחלשות.

6. **הקשר חלש לא «פותח» תיק** — `city|org|role` נכנסים ל־`buildSearchQ` ומפעילים Gemini כש־`softAmbiguous && ctx.any`, אבל **`strongConfirm` דורש `focus` או wiki QID**. כלומר: משלמים על Gemini ועדיין נשארים ב־candidates / 0 פנים. Recall של «דני כהן + תל אביב + הייטק» לא מתממש לתיק בלי בחירת focus ידנית.

7. **טלפון/אימייל** — `forceGoogle` כן; אבל `phoneSignal` / honest-thin קשיחים (טוב לפרטיות). לזר עם מספר בינלאומי: וריאנטים ב־`phoneVariants` כבר לא כופים +972 (SPEED-A), אך עדיין אין routing למקורות מקומיים לפי מדינה.

8. **`wikiIsRich` / `wikiLight` / `skipHeavyEnrich`** — נכונים לסלב; לא רלוונטיים לזר בלי ויקי. הבעיה ההפוכה: כשאין ויקי, אין «שלב ביניים» זול לפני Gemini הכבד.

### כשלי precision

1. **מועמדים מוויקי שאינם האדם המבוקש** — `buildCandidates` דוחף alts עם `personish` רחב (`titleCoversQueryTokens` / 2–5 טוקנים). Smoke «דני כהן» כלל גם `דני בריאן`, `דנה בלנקשטיין כהן` — רעש שמסיט בחירה.

2. **EN disambig = היסטוריה, לא «האדם שלי»** — John Smith → רשימת פוליטיקאים/רופאים מהמאה ה־19–20. למשתמש שמחפש זר חי / עמית — precision אפס גם אם recall של ויקי «עובד».

3. **התחייבות WD ראשונה על שם Latin** — `wikidataSearchHuman` יכול להחזיר human#1 עם `best >= 1` / `softLatinClose` גם כשאין primary ברור (יש הגנות ל־exacts≥2, אבל ל־best חלש עדיין commit). סיכון פנים שגויות לזר «כמעט מפורסם».

4. **Gemini dossier בלי ויקי** — `mode=google` יכול לבנות label/summary מתמונות grounding חלשות; `computeThin` / cite-or-drop ממתנים אבל לא מונעים לגמרי «תיק דק שנראה כמו זהות».

5. **מיזוג candidates מ־SERP** — clustering לפי host/title ב־`buildCandidates` מייצר תוויות כותרת־חדשות ליד ערכי ויקי, בלי רף ראיות אחיד לכל מועמד.

---

## ממצאי smoke (אם יש)

Live `phase=speed-b` · `nocache=1` · 2026-09-08 ~00:03–00:06 Asia/Jerusalem

| שאילתה | mode | phase | qid | photo | sources | candidates | timings (ms) | הערה |
|--------|------|-------|-----|-------|---------|------------|--------------|------|
| בנימין נתניהו | wiki | speed-b | Q43723 | כן | 19 | 0 | wiki 1439 · gemini 0 · total 1442 | בקרת סלב — תקין |
| דני כהן | candidates | speed-b | — | לא | **0** | 6 | wiki 3135 · gemini **0** · total 3135 | softAmbiguous חוסם רשת; מועמדים ויקי בלבד (כולל רעש) |
| John Smith | candidates | speed-b | — | לא | **0** | 7 | wiki **40181** · gemini 0 · total 40182 | EN disambig; latency קיצוני ב־wikiPath |
| Zehava Galon | wiki | speed-b | Q2630062 | כן | 14 | 0 | wiki **44605** · gemini 0 | תעתיק עובד, אבל יקר מאוד |
| Matti Friedman | — | — | — | — | — | — | **timeout 55s** (0 bytes) | כשל אמינות Latin mid-tier |
| Xyzzypq Blorfnak | google | speed-b | — | לא | 0 | 0 | wiki 5496 · gemini 5186 · total 16183 | thin — סביר לזבל |

**מסקנה מ־smoke:** הסלב path מהיר ובטוח; שם ישראלי נפוץ = pick בלי ראיות רשת; שם זר נפוץ = אותו דבר + wikiPath איטי; mid-tier Latin עלול ל־timeout לפני מוצר.

---

## גישה מוצעת מקצה לקצה

לא «עוד timeout» — **צינור מדורג לפי סוג זהות**, עם Gemini כמסנתז ראיות ולא כמנוע יחיד לזרים.

### 1) שלבי retrieval (staged)

| שלב | מתי | מה | יעד latency |
|-----|-----|-----|-------------|
| **A · Identity index** | תמיד | wikiPath קל + WD **batch** `wbgetentities` (לא סדרתי) · early ambiguous רק עם alts **מעושרים ברמז תפקיד** | ≤3–5s |
| **B · Structured discovery** | אין commit מ־A, או softAmbiguous + הקשר | חיפוש רשמי במאגרי זהות פתוחים לפי שם+הקשר: ORCID, VIAF, NLI, OpenLibrary authors, OpenCorporates/person pages — **בלי** caller-ID | ≤4s מקבילי |
| **C · Web / Gemini** | B דל **או** יש phone/email/focus **או** שם ייחודי מספיק (לא common-name) | `googlePath` עם **locale routing** (שפת שאילתה + מדינה מההקשר) ופרומפט בלי הטיה קשיחה ל־`.il` | ≤12–18s |
| **D · Enrich** | רק אחרי **commit** לזהות אחת (wiki QID / focus / evidence≥threshold) | scrape/Commons/Bing כרגיל; softAmbiguous נשאר 0 פנים | לפי תקציב |

`pureCandidates` היום = שלב A בלבד. צריך **candidates-with-evidence**: כל מועמד נושא 1–3 קישורי preview משלב B/C, לא רק כותרת ויקי.

### 2) מתי Gemini

- **לא** על softAmbiguous בלי הקשר — נכון; אבל אז חובה שלב B או UI שמבקש org/city מיד.
- **כן** כשיש הקשר משמעותי (`org|city|role|context|phone|email`) — והפעם **מאפשרים commit לתיק** אם עבר רף ראיות (לא רק `focus`).
- **כן** לשם Latin/HE שאינו common-name (אין פירושונים / ≤1 human WD exact) ו־A החזיר miss.
- **לא** כפול / לא כ־fallback ל־429 ויקי בלי מזהה — כבר קיים; לשמור.
- תפקיד המודל: **דירוג אשכולות ראיות + סיכום cite-or-drop**, לא «נחש מי זה John Smith».

### 3) דיסאמביגואציה לזרים

- **Language routing:** `isLatinScriptQuery` → EN/WD (קיים) + חיפוש web באנגלית; שאילתה קירילית/ערבית/סינית → API ויקי מתאים (חסר היום). תעתיק HE↔Latin נשאר (`softLatinClose`) אבל לא כ־commit יחיד.
- **אל תציגו רק siblings היסטוריים מ־EN disambig** כתשובה ל«זר בעבודה». הוסיפו מסלול: «אין התאמת זהות ציבורית חזקה — הזינו ארגון / עיר / LinkedIn ציבורי / אימייל».
- **רף ראיות לתיק (הצעה):**
  - **Commit dossier:** (QID אנושי חד־משמעי) **או** (≥2 מקורות https בלתי־תלויים עם שם+הקשר) **או** (רשומת ORCID/VIAF/NLI עם התאמת שם גבוהה + מקור אחד תומך).
  - **Candidates:** ≥2 מועמדים עם לפחות מקור preview אחד לכל אחד; אחרת thin כנה.
  - **פנים:** רק אחרי commit (כמו היום) — KEEP.
- **`strongConfirm` מורחב:** לא רק `focus`/`wiki.qid`, אלא גם `evidenceScore ≥ T` מאשכול B/C (org+city תואמים ב־≥2 מקורות).

### 4) שינוי מוצרי קצר

המוצר ל«לא־מפורסם» הוא **אשף דיוק** (context → evidence clusters → pick/commit), לא «ויקי או כלום». לסלב — השאירו wiki-fast path.

---

## KEEP / DROP / REPLACE

### KEEP
- `wikiIsRich` / דילוג Gemini למפורסמים עם דיוקן+bio
- 0 פנים על `softAmbiguous` עד בחירה / commit
- cite-or-drop · `scrubPayloadIdentifiers` · `BANNED_PHONE_HOSTS` · SSRF
- `forceGoogle` = phone|email|focus (org לא כופה) — כיוון נכון
- Latin path נפרד (`isLatinScriptQuery`, `titleExactishOrLatin`, EN disambig gate)
- AbortSignal / `skipHeavyEnrich` / phase timings
- MusicBrainz רק מ־P434 (לא fuzzy name)

### DROP
- `pureCandidates` שמחזיר **sources=0 לנצח** בלי שלב B
- `strongConfirm` שמתעלם מראיות Google חזקות כשיש org+city
- סריקת `getEntity` סדרתית ב־`wikidataSearchHuman`
- הטיה קשיחה ל־`.il` בפרומפט Gemini וב־`pagePreferScore` לשאילתות Latin/זר
- דחיפת alts לא־personish / partial-token ל־`buildCandidates` בלי סינון מחמיר

### REPLACE
| קיים | מוצע |
|------|------|
| wiki → (skip\|Gemini) → enrich | **A identity → B registries → C Gemini → D enrich** |
| softAmbiguous = pick ויקי בלבד | softAmbiguous = pick **עם evidence previews** או בקשת הקשר |
| Gemini כמנוע יחיד ל־miss | Gemini כ־ranker אחרי B / לשם ייחודי |
| `pagePreferScore` IL-centric | score לפי **שפת שאילתה + מדינת הקשר** |
| commit רק focus/QID | commit גם ב־**evidence threshold** |
| timeout על Latin mid-tier | budget קשיח ל־A (batch WD) + degrade ל־B/C |

---

## המלצות מדורגות ל־CoS

### P0 — כיוון מוצר (בלי micro-opts)
1. **הגדירו persona «זר / לא־מפורסם»** כיעד מפורש: הצלחה = אשכול ראיות ציבוריות או thin כנה — לא «מצא ערך ויקי».
2. **שנו את חוזה softAmbiguous:** אחרי candidates ויקי, או במקביל, הריצו שלב B (registries) כשיש `ctx.any`; הציגו מקורות על כל מועמד.
3. **הרחיבו `strongConfirm`** לרף ראיות (לא רק focus) כדי ש־org/city באמת ישחררו תיק.

### P1 — הנדסת צינור
4. **Batch `wbgetentities`** ב־`wikidataSearchHuman` — מוריד 40s Latin path לטווח חד־ספרתי; מונע timeout כמו Matti Friedman.
5. **Locale-aware `googlePath` + `pagePreferScore`** לפי `isLatinScriptQuery` / מדינה מההקשר.
6. **Candidates quality gate:** סינון `buildCandidates` — דורשים חפיפת שם חזקה; זורקים partial matches מהסוג «דני בריאן» על שאילתת «דני כהן».

### P2 — discovery ללא־מפורסמים
7. הוסיפו **Structured discovery** (ORCID/VIAF/NLI/OL authors) כש־`!wiki.found` או softAmbiguous+context — לפני או במקום Gemini.
8. UI/API: **prompt מוקדם להקשר** כש־`shouldSoftAmbiguousExact` / EN disambiguation — לפני שריפת 40s בויקי.
9. מדדו סוללת רגרסיה: סלב · שם ישראלי נפוץ · Latin נפוץ · Latin mid-tier · זבל · זר+org — עם יעדי mode/latency/sources-per-candidate.

### לא לעשות עכשיו
- עוד קיצוץ timeout נקודתי בלי שינוי שלבים
- החזרת Gemini על כל softAmbiguous בלי הקשר (יהרוס precision/פנים)
- חיפוש במאגרי caller-ID / סקרייפ LinkedIn מחוץ לדפים ציבוריים

---

*סוכן מ · ניתוח קוד box `speed-b` + smoke live · ללא שינוי קוד / ללא דיפלוי*
