# Phase 3 — Finding Quality: flat-list ambiguity

**Observer:** ממשק  
**Measured:** 2026-09-20 09:50 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** OBSERVE ONLY · NO code · NO deploy · NO promote  
**B0:** `https://akvot-discovery.vercel.app` → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core:** LOCKED → `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Promote:** **HOLD**

## תמצית

Discovery Mode ב-B0 מציג תוצאות כ-`findings[]`: רשימה אחת, מדורגת, שבה כל שורה מייצגת finding ממקור מסוים. זה מתאים ל-discovery לא-מכריע, אך עבור seed עמום הרשימה נראית כמו תוצאה אחת עשירה במקום אוסף של השערות זהות שונות. הסיכון הוא **pretty-wrong**: אין מסך dossier או בחירת זהות מפורשת, ובכל זאת הצגה מסודרת, ציונים, כותרות ומקורות עלולה לגרום למשתמש להסיק שהזהות כבר זוהתה.

המסקנה אינה שצריך לשנות את B0 כעת. זו תצפית ואוסף דרישות UX לבחינה בשלבים מאוחרים יותר.

## 1. איך הממצאים מוצגים כיום — flat list

ב-snapshot הנצפה יש:

- `findings[]` שטוח: לכל finding יש `id`, `kind`, `title`, לעיתים `summary`, `evidenceIds`, `providers`, `facetHints`, `entityRefs`, `scoreFinding` ו-`ranking`.
- `ranking` מסביר discovery score לפי authority, corroboration, directness, freshness, provider diversity ועוד. זהו ציון discovery, לא ציון של ודאות זהות; ה-rationale עצמו מציין `discovery≠identity`.
- `facets` הם חתכים רוחביים לפי provider/kind/hint. הם אינם קבוצות של אנשים או ארגונים ואינם אומרים אילו findings שייכים לאותה ישות.
- `graph.nodes` מכיל seed ו-findings, אך בנתוני התצפית `edges` ריק; אין שכבת קשרים שמחברת ממצאים לאותה hypothesis.
- `contradictions` יכול להופיע ברמת ה-snapshot, אבל אינו חלק מובנה וברור מכל שורה ברשימה. למשל, `same_title_multi_domain` הוא אזהרה כללית על כמה ממצאים, לא cluster שמוצג לצד המשתמש.
- `softEr` מספק `status=candidate` ו-`displayHint`, אך אין identity-selection chrome או assertion של resolved identity. כלומר, המודל נשאר discovery-shaped — אך הרשימה עצמה עדיין עלולה להיקרא כ״תשובה״.

בפועל, מיון לפי score מציב את הממצא בעל הציון הגבוה בראש. אותה כותרת יכולה לחזור שוב ושוב, כאשר ההבדל החשוב — תפקיד, תקופה, מדינה, מקור או `entityRef` — נמצא בפרטים הקטנים של השורה או בקישור הראיות.

## 2. למה flat list פוגע ב-seeds עמומים

### שמות נפוצים וריבוי ישויות

- **S02 — `John Smith`:** 21 findings, שלושה domains, ו-`contradictions_n=1`. בנתון שנקרא נצפו כמה ישויות שונות: בוטנאי, מנהיג מפלגת הלייבור, בנקאי/חבר פרלמנט, גנרל ופוליטיקאים שונים; רוב הכותרות עדיין הן בדיוק `John Smith`.
- **S03 — `Alex Morgan`:** 21 findings, שלושה domains, כולל כדורגלן אמריקאי, עיתונאי בריטי, חוקר אנגלי, ספורטאים נוספים ודפי disambiguation. גם כאן ה-title החוזר מאחד חזותית דברים שאינם אדם אחד.
- בשני המקרים כל finding מחזיק `entityRef` נפרד, אך אין ב-UX הנצפה שכבה שמציגה כמה hypotheses יש או מה משתייך לכל אחת. יציבות טכנית של 21/21 בין הרצות אינה יציבות של זיהוי; היא רק יציבות של תוצאת החיפוש השטוחה.

### evidence סותר או חסר

- **S10 — `Francis Bacon`:** שמונה findings, כולם מ-OpenLibrary באותה הרצה, בעוד Wikidata ו-Wikipedia מסומנים `error`; `contradictions=[]`. היעדר contradiction כאן אינו הוכחה שאין קונפליקט — ייתכן שהמקורות הדרושים לא החזירו נתונים. הרשימה יכולה להיראות נקייה דווקא כשהכיסוי חלקי.
- **S05 — `Red Cross`:** 22 findings ו-2 contradictions לפי aggregate, עם שמות כגון American Red Cross, International Red Cross and Red Crescent Movement ו-Red Cross. זה מקרה של brand/organization שמתפצל לישויות ותחומים, לא תשובה אחת.
- `evidenceCoverage=1.0` בכל finding שקיים אומר שלכל שורה יש evidence ID; הוא אינו אומר שהראיות מתייחסות לאותה ישות, שהן בלתי-תלויות, או שהזהות מוכרעת.

### context מורכב

Seed כמו `Michael Jordan baseball` היה 0 ואז 2 findings בין שתי הרצות. Seed כמו `CEO of Microsoft` היה ריק בשתי הרצות. רשימה שטוחה אינה מסבירה אם מדובר ב-no match, חוסר הקשר, provider failure או intent שלא נתמך. כך המשתמש עלול לפרש תוצאה חלקית כבחירה שגויה, או ריק כתשובה סופית.

## 3. מה עלול להיקרא כוודאות זהות — “pretty-wrong”

גם בלי dossier chrome, יש כמה אותות חזותיים וסמנטיים שמייצרים סמכות עודפת:

1. **כותרת חוזרת + summary:** המשתמש רואה שם מוכר בראש כל כרטיס, ואז תיאור קצר שנראה כמו ביוגרפיה. ההבדלים בין אנשים שונים נדחקים לפרטים משניים.
2. **Top-ranked first:** score מספרי, סדר יורד ו-label של מקור יוצרים תחושה שהראשון הוא האדם הנכון, גם אם זה רק `discoveryScore`.
3. **מקורות “רשמיים” ו-facets:** wikidata/wikipedia, ספירת findings וספירת domains נראים כמו corroboration. בפועל, domains_mean הוא 1.34 והמערכת נשענת לעיתים על monoculture; כמה providers אינם בהכרח כמה עדויות עצמאיות.
4. **`candidate` ו-`displayHint`:** `softEr.status=candidate` יכול להיקרא כ״המועמד שנבחר״ אף שהוא רק hint רך. גם הודעת זהירות טכנית שאינה מוצגת בהקשר של כל שורה לא מספיקה.
5. **שקט בזמן כשל:** provider שמסומן `error`, או `contradictions=[]` כשמקור מרכזי לא זמין, עלולים להיראות כמו היעדר מחלוקת. זו certainty-by-omission.
6. **מספרים מלאים:** 21 findings עם evidence לכל שורה מרגישים כמו dossier עשיר. בפועל, אותו title יכול להופיע על 21 ישויות שונות, ו-graph edges ריק אינו מספר זאת למשתמש.

לכן “אין identity chrome” הוא תנאי טוב, אבל לא הגנה מספקת. גם רשימת discovery יכולה להקנות זהות במרומז אם היא אינה מסמנת במפורש את גבולות הידע.

## 4. המלצות observe-only לשלבים מאוחרים יותר

הסעיפים הבאים הם כיווני מוצר ומדדי בדיקה בלבד — **לא בוצעה ולא מומלצת כאן implementציה**.

### א. Grouping לפי entity-hypothesis

- להציג בראש את מספר ה-hypotheses האפשריות, ואז קבוצות זמניות לפי `entityRef`/קשרים/מאפיינים תומכים — לא לפי title בלבד.
- label צריך להיות “אפשרות/השערת ישות” או “ממצאים הקשורים כנראה לאותה ישות”, לא “הישות שנמצאה”.
- להשאיר findings שלא ניתן לשייך כ-`unresolved / ungrouped`; אין לכפות cluster כדי למלא את המסך.
- בתוך cluster להציג את ההבדלים המזהים: מקצוע, תקופה, מקום, ארגון, שפה ומקורות. ציון ranking נשאר ציון discovery בלבד.

### ב. Conflict callouts גלויים ובהקשר

- להציג banner ברמת החיפוש כאשר יש `same_title_multi_domain`, יש יותר מהיפותזה אחת, או יש mismatch בין summaries/eras/roles.
- להצמיד אזהרה גם לשורות/קבוצות הרלוונטיות: “הכותרת משותפת לכמה ישויות; אין להסיק שזה אותו אדם”.
- להבדיל במפורש בין **conflict שנצפה** לבין **coverage חסר/provider error**. “אין contradiction” אינו “אין conflict”.
- להציג source independence: כמה providers/domains באמת תומכים באותה hypothesis, ולא רק כמה שורות קיימות.

### ג. Empty states מסוג `need_context`

במקום “אין תוצאות” אחיד, למדוד ולעצב מצבים שונים:

- `no_match`: לא נמצאה התאמה לאחר שהמקורות הזמינים הושלמו.
- `need_context`: נמצאו כמה אפשרויות, אך חסר city/org/country/date/role כדי להפריד ביניהן.
- `provider_error`/`partial`: יש תוצאה חלקית או מקור שלא זמין; אין להסיק שאין ממצאים.
- `unsupported_intent`: seed הוא role/query/URL או compound שלא קיבל resolution מתאים.

ב-`need_context` אפשר לבקש פרט אחד או שניים ולנסח זאת כהכוונה, לא כקביעה על זהות. כל מצב כזה צריך להישאר discovery-safe ולא לפתוח dossier אוטומטית.

### ד. Progressive uncertainty

- להציג אי-ודאות כבר בזמן progressive loading: “נאספים ממצאים”, “כמה אפשרויות”, “מקורות חלקיים”, “עדיין לא זוהתה ישות”.
- להפריד בין `discovery score`, איכות/כיסוי evidence, reliability של provider, ו-identity certainty. בפרט, לא להציג progress או score כ-confidence של האדם.
- לאפשר מעבר ממצב “candidate” ל-“multiple candidates” או “insufficient context” בלי שינוי סמנטי שייראה כמו הכרעה.
- לפני כל פעולה עתידית שמייצרת dossier, לדרוש בחירה/הקשר מפורשים או להצהיר שאין בחירה.

### ה. מדדי בדיקה עתידיים

לשלב הבא כדאי למדוד, ללא שינוי B0: האם משתמש מבין כמה hypotheses קיימות; האם הוא מסוגל להבדיל בין provider failure לבין no match; האם הוא מצטט נכון את ההבדל בין top discovery result לבין identity; והאם refresh/narrow שומרים על אותה משמעות. אין לסמן gate כ-pass רק כי כל שורה כוללת evidence ID.

## 5. קשר ל-PG-03 ול-Arch blind spots

- **PG-03 — Ambiguity & conflicting-evidence not first-class in session snapshot:** זהו הממצא המרכזי של המסמך. S02/S03 מחזירים רשימות עשירות עם אותה כותרת, ו-S10 מראה כיצד provider errors יכולים להסתיר קונפליקט. ה-session snapshot מכיל חומר גלם, אך לא מודל UX שמאפשר להבחין בין ישויות.
- **BS-OBS-RANK:** ranking/diversity telemetry עדיין אינו Strategy-ready. לכן score וסדר אינם יכולים לשמש proxy לזהות או לביטחון.
- **BS-PROV:** viaf ו-`web_public` אינם זמינים כרוחב מקורות מלא ב-runtime; source monoculture מגבירה את הסיכון ש-corroboration ייראה חזק מכפי שהוא.
- **BS-O1:** narrow הוא view נגזר, בעוד GET/SSE מחזירים את ה-snapshot המלא. בהמשך, כל grouping/conflict state צריך להגדיר האם הוא ephemeral או durable, כדי שלא תוצג למשתמש תצוגת ambiguity שנעלמת ברענון.
- **BS-ACC-SOFT:** כל הרחבת facet/cluster/conflict חייבת להישאר תחת regression של Acc; אין להציג identifiers או inference לא מבוססים כאילו הם identity.
- **BS-DRIFT:** הבדיקות והמסכים העתידיים חייבים לציין B0/deployment מפורש, כדי לא לערבב תצפיות Preview עם תוצאות alias הנוכחי.

## 6. Live note — B0 fixture/API (measure only)

ב-fixture החי שנמדד ב-Phase 2 עבור `example.org` (`sessionId=kv1.9c4d61492aeb8ee222ef4e9142c09d97`) התקבלו 3 findings שטוחים: `example.com`, `.example`, ו-`Example.org`, עם evidence, providers ו-facets; `graph.edges=[]`, `contradictions=[]`, ו-`softEr.status=candidate`. זה אינו seed אנושי עמום, אבל הוא מדגים את אותו חוזה: snapshot עשיר בממצאים, ללא הכרעת identity מפורשת, כאשר ההבחנה נשארת בתוך titles/metadata.

בנוסף, narrow לפי Wikidata יצר תצוגה נגזרת של 2 מתוך 3 findings, אך GET לאחר מכן נשאר 3. זו תצפית על **BS-O1** בלבד: אין להסיק מכך שהקיבוץ או אזהרות ambiguity נשמרים בין projections.

## Evidence index

- `PHASE2-OBSERVATION/OBSERVATION-SUMMARY.md`
- `PHASE2-OBSERVATION/PHASE2-UX-SSE-NARROW-OBSERVE-ממשק-2026-09-20.md`
- `PHASE2-OBSERVATION/ARCH-BLINDSPOTS-ארכיטקט-2026-09-20.md`
- `PHASE2-OBSERVATION/AGGREGATES.json`
- `PHASE2-OBSERVATION/OBSERVATION-MATRIX.csv`
- `PHASE2-OBSERVATION/raw/get-S02-r1.json` (`John Smith`)
- `PHASE2-OBSERVATION/raw/get-S03-r1.json` (`Alex Morgan`)
- `PHASE2-OBSERVATION/raw/get-S10-r1.json` (`Francis Bacon`)
- `PHASE2-OBSERVATION/raw/live-get-example.org.json`
- `PHASE2-OBSERVATION/raw/live-narrow-wikidata.json`
- `PHASE2-OBSERVATION/GOLDEN-CORPUS-v0.json`
- `PHASE2-OBSERVATION/GOLDEN-CORPUS-v0-בודק-2026-09-20.md`

## Result

**Phase 3 finding-quality observation recorded. No code, deploy, alias change, or promote action performed. Core remains LOCKED. Promote remains HOLD.**
