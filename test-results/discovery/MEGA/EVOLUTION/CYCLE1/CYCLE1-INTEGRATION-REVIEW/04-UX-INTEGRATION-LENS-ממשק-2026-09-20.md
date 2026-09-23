# 04 — עדשת אינטגרציית UX · ממשק · CYCLE-1

**תאריך:** 2026-09-20 12:22 IDT (Asia/Jerusalem, UTC+3)  
**מצב:** DOCUMENT ONLY · NO code · NO experiments · NO promote  
**עיקרון מנחה:** **INFORMATION ≠ IDENTITY**

מסמך זה מחבר את מפת המערכת ואת משטח ה-Discovery לנקודת המבט של המשתמש. הוא אינו מאשר שינוי במוצר, ב-schema, ב-alias או ב-deployment.

---

## 1. מסע המשתמש כיום: Entity Mode מול Discovery Mode

### Entity Mode (Core B0)

המשתמש נכנס עם ציפייה ל-lookup ממוקד: להזין שם או מזהה ולקבל תוצאת ישות, כאשר ה-Core הוא מסלול ה-SoT לפעולות Entity/Acc. זהו מסלול שמרגיש כמו “מצא את הישות”, ולכן כל כותרת, תמונה, מזהה או פעולה במסך עלולים להיקרא כהכרעה.

גם כאן צריך לשמור על הגבול: תוצאת lookup או התאמה טכנית אינה רישיון להרחיב מידע ממקורות אחרים כאילו הישות הוכרעה. Core נשאר נעול, ו-Discovery אינו מחליף אותו ואינו כותב אליו זהות.

### Discovery Mode (alias)

במסלול Discovery המשתמש מזין seed — שם, ארגון, URL, דומיין או שאילתה מורכבת — ומקבל **אוסף ממצאים סביב ה-seed**. המשטח הנוכחי הוא `findings[]` שטוח ומדורג, עם קישורים, כותרות, snippets כאשר קיימים, providers, facets ופרטי provenance.

המסר שהמסך צריך לשמר הוא:

> “איזה מידע ציבורי ומבוסס-מקור נאסף סביב הקלט, מהמקורות שענו?”

ולא:

> “מי האדם או הארגון שנמצא?”

`Discovery Mode` הוא alias של מסלול תצוגה/גישה, לא בחירת זהות. חזרה, רענון, SSE או narrow אינם הופכים אוסף ממצאים ל-dossier. אותו שם שחוזר בכמה שורות, score גבוה, כמה providers או URL משותף הם מידע על טענות ומקורות — לא הוכחה שמדובר באותה ישות.

### נקודת החיכוך המרכזית

המשתמש נע בין שני מסלולים בעלי ציפייה שונה: Entity Mode מזמין קריאה של “ישות”, ו-Discovery Mode מציג חומר גלם עשיר שנראה לעיתים כמו תשובה. לכן הגבול בין המסלולים חייב להיות גלוי בכל שלב: **Discovery אוסף מידע; הוא אינו מאשר זהות ואינו פותח dossier.**

---

## 2. מה כבר קיים במוצר ומה נשאר ניסויי

### כבר קיים ב-B0 / במשטח המוצר

- **Findings:** ממצאים שטוחים ומדורגים עם title, URL, kind, summary/snippet כאשר זמין, evidence וקישור למקור.
- **Facets:** חתכים לפי provider, kind ו-hints. הם מסייעים לסינון רוחבי; הם אינם clusters של אנשים או ארגונים ואינם מציינים שכל הממצאים שייכים לאותה ישות.
- **Provenance:** provider, מקור, URL, domain ופרטי evidence שמאפשרים להבין מאין הגיע הממצא. provenance הוא traceability, לא endorsement ולא identity confidence.
- **SSE:** טעינה הדרגתית של ממצאים ועדכון session. עצם הזרימה וה-progress אינם ציון ביטחון בזהות.
- **Narrow:** projection מצומצם לפי facet. יש להציגו כ-view של תוצאות, לא כיצירת session חדש או כהכרעה מחודשת.
- **שפה של discovery:** ranking הוא סדר גילוי; `evidenceCoverage` אומר שלממצא יש evidence, לא שהראיות בלתי-תלויות ולא שהזהות נפתרה.

### ניסויי בלבד — לא חלק מחוויית ברירת המחדל

- **VIAF:** נתיב authority נוסף ב-A2 Preview; עשוי להעשיר crosswalks, אך אינו זמין כטענת זהות כללית.
- **A2-safe / typed coalesce:** חיבור מוגבל באמצעות typed soft references, כאשר התקרה הסמנטית היא `SAME-REFERENCE`. זה אינו `SAME-ENTITY`, אינו בחירת אדם/ארגון ואינו dossier.
- **C1 Preview / WEB-ORIGIN:** metadata של origin או מקור Web, בעיקר עבור URL/domain, תחת גבולות one-hop ו-UNKNOWN. כותרת אתר, hostname או `og:site_name` אינם בעלות, מחבר או זהות.
- **A2/C1 Preview surfaces:** גם כאשר ניסוי הפיק יותר findings או provenance, אין להציגו כ-breadth מוכחת, ככיסוי כללי או כתחליף ל-B0. כל Preview נשאר מסומן ניסויי וסגור לקידום.

---

## 3. סיכוני אינטגרציה אם מקדמים Preview בלי UX

### א. URL spam

`web_origin` יכול להוסיף ערך אמיתי ל-seed של URL, אך תצוגה ללא dedupe ובלי היררכיית provenance עלולה להפוך redirects, hostnames, raw URLs ו-origin cards דומים ל“עוד תוצאות”. ספירת URLs אינה ספירת ראיות ואינה ביטחון. Origin צריך להופיע כ-**Web origin / Source page**, בנפרד מכרטיס ישות, עם הקלט המקורי, תוצאת האחזור והזמן — לא כאדם או כבעלים.

### ב. `SAME-REFERENCE` ייקרא כ-identity

משתמש עלול לקרוא “אותו reference” כ“אותו אדם”, “verified” או “נמצא”. בלי הסבר מקומי, typed key וגבול מפורש, חיבור בין VIAF/Wikidata/Open Library נראה כמו merge. חובה להבהיר ש-`SAME-REFERENCE` אומר שיש חפיפה התייחסותית/typed בין מקורות, אך **אינו `SAME-ENTITY`, אינו בחירת זהות ואינו dossier**.

### ג. Flat-list שנראית יפה אך מטעה (pretty-wrong)

כותרות חוזרות, snippets, score, אייקוני מקורות ורשימה ארוכה יכולים להיראות כמו dossier גם כאשר מדובר בכמה hypotheses, near-duplicates או source monoculture. “ראשון ברשימה” הוא top discovery result בלבד. Facets ו-provider count אינם מספר הישויות ואינם הוכחת corroboration. ממצאים שלא ניתן לקבץ בבטחה צריכים להישאר unresolved/ungrouped, ולא להיקבץ לפי title בלבד.

### ד. O1: חוסר עקביות רך בין narrow ל-GET/SSE

Narrow הוא view נגזר, בעוד GET/SSE עשויים להחזיר את ה-snapshot המלא. אם תווית ambiguity, provenance או relationship מוצגת רק ב-narrow, היא עלולה להיעלם ברענון, ב-HIT או ב-SSE resume. לפני כל promote צריך להגדיר אילו מצבי UX הם durable session facts ואילו הם projection בלבד, ולוודא שאותה משמעות נשמרת בין POST, GET, SSE, narrow וחזרה למסך.

### ה. כיסוי חלקי שייראה כמו “אין מחלוקת”

Provider error, timeout או unsupported intent אינם `no_match`. `contradictions=[]` כאשר מקור רלוונטי לא ענה אינו הוכחה שאין conflict. בלי surface ברור של partial coverage, המשתמש ישלים בעצמו שהרשימה נקייה ומלאה.

---

## 4. דרישות vocabulary למשטח עתידי

| תווית | ניסוח ומשמעות למשתמש | גבול שאסור לטשטש |
|---|---|---|
| **UNKNOWN** | “אין מספיק evidence כדי לסווג את הקשר.” מצב רך, ניטרלי וראשון-במעלה. | אינו false, אינו no-match, ואינו אישור או דחייה של זהות. |
| **SAME-REFERENCE** | “נמצאה חפיפה בין references typed ממקורות רלוונטיים.” להצמיד ל-finding/relationship המסוים ולפתוח את מסלול הראיות. | **אינו SAME-ENTITY, אינו dossier, אינו verified ואינו CTA לבחירת זהות.** |
| **RELATED** | “קיים קשר נושאי/ארגוני מתועד או מוצע בין references נפרדים.” להשאיר כרטיסים/Nodes נפרדים. | אינו merge, אינו attach ואינו אומר “אותו אדם/ארגון”. |
| **POSSIBLE** | “יש signal חלקי שמצדיק בדיקה; חסר typed evidence.” להציג מה חסר. | אינו match, אינו confidence score ואינו attachable. |

ה-label שייך לממצא, ל-hypothesis או לקשר מסוים — לא לכל ה-session כסטטוס זהות. יש להעדיף UNKNOWN גלוי ורך על פני ניסוח שדוחף את המשתמש להכרעה. אין להחליף תוויות אלה ב-“confirmed”, “trusted”, “same person” או ניסוחים חזקים יותר.

---

## 5. שערי UX מומלצים לפני כל Discovery promote

כל הסעיפים הבאים הם תנאי קבלה עתידיים, לא אישור promote:

- [ ] **הפרדת מסלולים:** Entity Mode ו-Discovery Mode מסומנים בשם, בתיאור וב-CTA; אין מעבר שקט מ-findings לישות או ל-dossier.
- [ ] **הצהרת משמעות:** ליד תוצאות Discovery מופיע ניסוח ברור שאלה ממצאים סביב seed, ושהמידע אינו זהות.
- [ ] **הגנת ambiguity:** seeds עמומים מציגים כמה hypotheses/ממצאים לא משויכים, אזהרת title חוזר ו-`pretty-wrong` guard; אין grouping לפי title בלבד.
- [ ] **Provenance קריא:** לכל finding/hypothesis נראים provider, source family/host family, URL וסוג evidence; provider count מופרד מ-independent source families.
- [ ] **כיסוי ולא רק תוצאה:** provider error, timeout, partial, unsupported ו-no-match מקבלים מצבים נפרדים; המכנה הידוע מוצג בלי fake completeness.
- [ ] **גבול URL:** Origin מוצג כ-Web origin/Source page, עם dedupe, original URL ותוצאת אחזור; אין URL spam, ownership או person/entity title מהדומיין.
- [ ] **גבול SAME-REFERENCE:** כל הופעה מסבירה מקומית שזו אינה identity, אינה dossier ואינה SAME-ENTITY; אין פעולה שמניחה בחירת זהות.
- [ ] **Vocabulary עקבי:** UNKNOWN, RELATED ו-POSSIBLE מופיעים באותה משמעות ב-card, facet, graph, SSE, GET ו-narrow; אין synonyms חזקים יותר.
- [ ] **O1 contract:** narrow, GET, SSE, HIT ו-refresh שומרים על אותו פירוש ל-ambiguity, provenance ו-relationship; projection מסומן כ-projection ולא כמקור אמת חדש.
- [ ] **Core/Acc safety:** Discovery אינו כותב או חושף זהות של Core; אין identifiers או inference לא מבוססים ב-Acc; Core נשאר LOCKED.
- [ ] **הבנת משתמש:** לפני קידום יש ראיות שהמשתמש מבדיל בין source count לעצמאות, בין SAME-REFERENCE לזהות, ובין partial coverage ל-no-match.
- [ ] **שער תפעולי ברור:** B0 production, Preview ו-alias מזוהים במסמכי ובמסכי ההפעלה; אין ערבוב תוצאות ניסוי עם baseline ואין promote ללא החלטת UX מתועדת.

---

## 6. קישורים להערות קודמות

- **PRODUCT-VISION-DISCOVER-VS-MISSING:** `../CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/PRODUCT-VISION-DISCOVER-VS-MISSING-ממשק-2026-09-20.md`
- **Phase 3 — flat-list ambiguity:** `../PHASE3-FINDING-QUALITY/PHASE3-UX-FLAT-LIST-AMBIGUITY-ממשק-2026-09-20.md`
- **Phase 4 — source diversity surface:** `../PHASE4-SOURCE-DISCOVERY/PHASE4-UX-SOURCE-DIVERSITY-SURFACE-ממשק-2026-09-20.md`
- **C1 — provenance display:** `../PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK/UX-PROVENANCE-DISPLAY-LATER-ממשק-2026-09-20.md`
- **A2 — coalesce surface:** `../PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/13-UX-COALESCE-SURFACE-NOTE-ממשק-2026-09-20.md`

---

**STATUS:** UX integration lens recorded · HOLD · no code · no experiments · no promote · STOP.
