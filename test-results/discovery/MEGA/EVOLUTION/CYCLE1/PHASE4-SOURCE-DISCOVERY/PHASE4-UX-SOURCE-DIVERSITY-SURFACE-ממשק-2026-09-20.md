# Phase 4 — משטח UX לגיוון מקורות

**בעלים:** ממשק  
**תאריך מדידה:** 2026-09-20 09:55 IDT (Asia/Jerusalem, UTC+3)  
**מצב:** NOTES ONLY · NO code · NO deploy · NO promote  
**Baseline:** B0 · Discovery `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` — LOCKED  
**Promote:** **HOLD**

## תמצית מוצרית

QD-01 אינו רק בעיית backend של “אין מספיק providers”. הוא בעיית קריאה של ממשק: כשהמסך מציג רשימה עשירה, ממוינת ומגובה בציונים, אבל כמעט כל finding נשען על אותה משפחת מקור, המשתמש מקבל תחושת **corroboration** שאינה קיימת. המשטח העתידי צריך להראות את מבנה המקורות ואת גבולות הכיסוי, בלי להפוך אותם להוכחת זהות.

זהו מסמך כיווני UX בלבד. אין כאן שינוי schema, קוד, deploy, alias או promote.

## 1. למה monoculture (QD-01) מרגיש כמו ודאות כוזבת

### מה נמדד

- ב-Phase 3: `single-source=244/244 (100%)` ו-`multi-independent-source=0/244 (0%)`.
- המשפחות שנצפו הן בעיקר `openlibrary` ו-`wikimedia`; ממוצע הדומיינים ב-Phase 2 היה כ-1.34.
- יש לעיתים כמה provider names או כמה דומיינים באותה תוצאת חיפוש, אך זה לא אומר שיש כמה מקורות בלתי-תלויים לאותו finding. למשל, `wikidata` ו-`wikipedia` שייכים לאותה משפחת Wikimedia.
- לכן `providerDiversity` או מספר findings עלולים להיראות כמו אימות צולב, אף שבפועל מדובר בריבוי רשומות, registry/page, או אותה אקולוגיית מקור.

### מנגנון הוודאות הכוזבת במסך

1. **עושר חזותי מתפרש כאיכות:** הרבה כרטיסים, snippets, אייקוני מקור, מספרים וסדר יורד נראים כמו dossier — גם אם כל כרטיס הוא hypothesis נפרדת.
2. **Top-ranked first:** ציון discovery ומיקום ראשון נקראים בקלות כ“התוצאה הנכונה”. הם אינם ציון זהות.
3. **ריבוי שמות מסחריים של providers מסתיר תלות:** שלושה chips שונים יכולים להיראות כמו שלוש עדויות, כאשר בפועל יש family אחת או אותו registry lineage.
4. **היעדר אזהרה נקרא כאישור:** אם אין “single-source” או “coverage partial”, המשתמש משלים לבד: “כנראה שאין מחלוקת”. זה חמור במיוחד כש-provider אחר כשל או לא החזיר נתונים.
5. **כותרת חוזרת מאחדת ישויות:** ב-S02 `John Smith` וב-S03 `Alex Morgan` רשימות ארוכות וכותרות זהות דוחפות הבדלי מקצוע, תקופה, מקום ו-entityRef לשוליים. source monoculture מחזק את האפקט: הרבה שורות, מעט עצמאות.
6. **מספרים מדויקים יוצרים סמכות:** `evidenceCoverage=1.0` אומר שלשורה קיימת ראיית cite-or-drop; הוא לא אומר שהראיות בלתי-תלויות, שהן מתייחסות לאותה ישות, או שהזהות הוכרעה.

כלומר, גם בלי identity chrome מפורש, השילוב של flat list + rank + source labels + snippets יוצר “pretty-wrong”: הממשק נראה זהיר מבחינה מילולית, אך מתנהג מבחינה קוגניטיבית כמו הכרעה.

### קשר ל-QD-02..05

- **QD-02:** near-duplicate title flood גורם למספר שורות להיראות כעומק, במקום ככמה ישויות או גרסאות של אותה טענה.
- **QD-03:** contradiction/ambiguity אינם first-class; `contradictions=[]` לא שולל conflict כאשר מקורות חסרים או כשלו.
- **QD-04:** כיסוי נמוך ל-role/context/alias/URL אומר שהיעדר תוצאה אינו בהכרח `no_match`; יש להפריד no-match מ-partial/unsupported intent.
- **QD-05:** publication/noise וראיות thin מדללים את המשמעות של “יש מקור”. מקור קיים אינו שקול למקור חזק, ישיר או רלוונטי.

## 2. איך גיוון מקורות צריך להיחשף בהמשך — design notes בלבד

### עקרון עליון

להראות **מה המקורות תומכים בו ומה הם לא תומכים בו**, לפני שמציגים ציון או סדר. גיוון הוא מאפיין של evidence/provenance; הוא אינו identity confidence.

### א. Provider chips — chips של provenance, לא badges של אמון

לכל finding או hypothesis אפשר להציג שורת provenance קומפקטית:

- שם provider קריא, host/domain, סוג המקור (`registry`, `page`, וכו׳), ואם ידוע — משפחת מקור.
- להפריד ויזואלית בין **provider** לבין **source family/host family**; שני providers מאותה family לא יוצגו כאילו הם שתי עדויות בלתי-תלויות.
- chip צריך להיות ניתן לפתיחה לפרטי “מה נספר”: מספר evidence items, domains, זמן retrieval, ושפת התוכן.
- chip לא יוצג לפי prestige. המשמעות היא traceability, לא endorsement.
- אם provider error/timeout/partial, להציג זאת ליד משטח הכיסוי ולא להעלים את ה-provider מהסיפור.

### ב. Multi-source badge — עם תנאי עצמאות מפורשים

במקום badge כללי כמו “verified” או “corroborated”:

- להשתמש בתוויות תיאוריות: **מקורות מרובים**, **משפחת מקור אחת**, **מקור יחיד**, **עצמאות לא נקבעה**.
- “multi-source” יוצג רק כאשר Source Quality Model קבע מהי עצמאות רלוונטית: למשל host families/independent providers, לא רק מספר chips.
- badge יתייחס ל-finding או ל-hypothesis המסוימת, לא לכל תוצאות החיפוש.
- להציג count יחד עם פירוש: “2 providers · 1 source family” שונה מהותית מ-“2 independent source families”.
- אין להמיר את badge לציון או לאחוז שמרמזים על identity certainty.

### ג. Single-source warning — שקוף, לא דרמטי

כאשר finding נשען על מקור אחד או family אחת:

- להצמיד אזהרה מקומית: **מקור יחיד — אין כאן אימות צולב**.
- כאשר יש כמה findings אך כל אחד single-source, להציג אזהרה ברמת החיפוש: **יש ממצאים ממקורות שונים, אך עדיין לא נמצאה תמיכה בלתי-תלויה לאותה השערה**.
- להבחין בין `single-source` לבין `provider unavailable`: הראשון הוא מאפיין של הראיה; השני הוא חור בכיסוי.
- האזהרה צריכה להופיע לפני CTA עתידי של הרחבה/dossier, ולא להיקבר ב-tooltip.

### ד. Provenance density — צפיפות ראיות, לא מדד שלמות

אפשר להציג summary קטן לכל hypothesis:

- מספר evidence items, מספר hosts, מספר source families, מספר providers, ומספר claims מובחנים.
- להפריד **count** מ-**independence** ומ-**strength**. 10 רשומות מאותה family אינן 10 אישורים.
- להציג “thin evidence” כאשר snippet קצר/כללי, publication noise גבוה, או אין claim ישיר; לא לצבוע אותו כ-green רק משום שקיים URL.
- לציין freshness/retrieval כנתון provenance, לא כאישור שהמקור עדיין נכון.
- אם coverage חלקי, להציג גם את המכנה הידוע: אילו providers נבדקו, אילו נכשלו, ואילו לא הופעלו. אין לחשב “אחוז שלמות” ממכנה מומצא.

### ה. HE/EN coverage indicators — כיסוי שפה ולא “איכות לאומית”

ל-seeds עבריים/רב-לשוניים:

- להראות בנפרד `HE content`, `EN content`, ו-`other/unknown`, על סמך שפת evidence או locale מתועדת — לא על סמך שם מתורגם בלבד.
- לציין **HE native-source present/absent**; `en.wikipedia.org` עם label עברי אינו native HE coverage.
- להבדיל בין שפה של הכותרת, שפת ה-snippet ושפת המקור עצמו.
- אינדיקטור חסר/ריק צריך לומר “לא נבדק/לא זמין”, לא “אין מידע בעברית”.
- לא לדרג עברית מול אנגלית בסולם prestige; המטרה היא לחשוף coverage bias ולתת למשתמש להבין את גבולות החיפוש.

### ו. רמת תצוגה מומלצת

סדר ההיררכיה העתידי צריך להיות:

1. **כמה hypotheses יש** ומה אינו משויך בביטחון.
2. **מהו מקורו של כל finding/hypothesis** ומה מידת העצמאות.
3. **מה חסר או נכשל** בכיסוי.
4. רק לאחר מכן ranking ופרטי evidence.

אין לקבץ לפי title בלבד. אם אין בסיס לקשר בין findings, להשאיר `ungrouped/unresolved` ולנסח זאת כך.

## 3. INFORMATION ≠ IDENTITY ו-Entity-Agnostic

### INFORMATION ≠ IDENTITY

מקור, URL, snippet, provider או source-diversity signal הם **מידע על טענה**. הם אינם הכרזה שהטענה שייכת לאדם/ארגון מסוים, ואינם הופכים כמה טענות לזהות אחת.

לכן:

- “2 source families” יכול לתמוך ב-claim מסוים, אך לא לפתור ambiguity של `John Smith`.
- multi-source badge חייב להיות קשור ל-finding/hypothesis ולניסוח claim, לא לישות “שנמצאה”.
- אין להציג `identity confidence`, “verified person”, תמונה, dossier או CTA שמניח בחירה בלי context ובחירה מפורשת.
- אם sources סותרים, הממשק מציג conflict; אם source אחד בלבד, הוא מציג limitation; אם provider כשל, הוא מציג partial coverage. אף אחד מהמצבים אינו identity resolution.

### Entity-Agnostic

כל seed הוא seed: אדם, ארגון, חברה, domain, role, alias, URL או compound query. המשטח לא יניח שדווקא שם מסוים הוא היעד, ולא יכיל שפה או grouping שמקודדים entity ידועה מראש.

- אותם כללי provenance חלים על person, company, organization ו-domain.
- indicators צריכים לתאר source quality ו-intent fit, לא “כמה טוב המערכת מכירה את האדם”.
- דוגמאות S01/S02/S07 הן fixtures ותצפיות בלבד; אין להסיק מהן schema או chrome ייעודיים.
- גם במקרה של source diversity גבוהה, יש להשאיר את התוצאה discovery-shaped: **מידע שנאסף סביב seed**, לא זהות מוכרעת.

## 4. מה לא לעשות

- **לא להשתמש בלוגואים יוקרתיים כתיאטרון אמון:** לוגו של Wikimedia, ספרייה, ממשלה או מותג מוכר אינו מחליף עצמאות, רלוונטיות או claim ישיר.
- **לא להציג “verified”, “trusted”, “high confidence” או ירוק אוטומטי** כאשר יש רק provider diversity או הרבה findings.
- **לא לספור providers כאילו הם מקורות בלתי-תלויים** בלי host-family/independence model מפורש.
- **לא לבנות fake completeness meter:** אין progress bar של “87% complete” כשאין denominator מוסכם, אין רשימת providers סגורה, או כש-errors אינם חלק מהמכנה.
- **לא להסיק “אין contradiction” מ-`contradictions=[]`** אם provider חסר, timed out, או החזיר רק subset.
- **לא להפוך `evidenceCoverage=1.0` למדד של identity/quality:** זה עלול להיות vacuous כאשר כל שורה שנותרה כבר חייבת evidence.
- **לא להסתיר single-source warning בתוך details** ולא להציף בכל שורה באזהרה אדומה שמקהה את ההבחנה.
- **לא לקבץ לפי title בלבד**, לא למזג people/entities כדי לייצר מסך מלא, ולא לתייג candidate כישות שנבחרה.
- **לא לפצות על HE/EN bias בלוגו או בצבע:** צריך להציג שפת מקור וכיסוי אמיתי, לא תחושת localism.
- **לא לפתוח dossier או action של identity על בסיס badge, score או source count.**

## 5. שאלות פתוחות ל-Arch/Server — Source Quality Model

1. מהי יחידת העצמאות המחייבת: provider, host, host family, ownership, database lineage, או שילוב? מי מתחזק את המיפוי ומה ה-fallback כאשר אינו ידוע?
2. האם `multi-source` מוגדר לפי finding, לפי claim, לפי hypothesis/cluster, או לפי session? כיצד מונעים ממספר findings שונים לנפח את אותו badge?
3. איך Source Quality Model מבדיל בין **מקור נוסף** לבין **recirculation/copy** של אותו מידע? האם נדרש provenance lineage או canonical-source relation?
4. מהו סף הראיה ל-`single-source warning`, `multi-source`, `thin`, `strong` ו-`partial`? האם הספים זהים לכל entity type ו-intent?
5. כיצד מודדים independence כאשר provider אחד מחזיר כמה domains, או כאשר שני providers משתמשים באותו registry backend?
6. איזה מצב נרשם כאשר provider נכשל: `not_checked`, `error`, `timeout`, `empty`, או `unsupported`? כיצד כל מצב יופיע למשתמש בלי להיראות כ-no-match?
7. מהו המכנה של provenance density ו-coverage? אילו providers/שפות הוגדרו כ-expected עבור seed, ומי קובע זאת באופן entity-agnostic?
8. האם `retrievedAt` מייצג זמן שאיבה בלבד או שיש גם source-modified/freshness signal? איך מציגים freshness בלי להפוך אותו לאמון?
9. כיצד HE/EN coverage נקבעת: שפת הדף, snippet, title, locale של ה-provider, או שילוב? איך מסמנים `unknown` בלי להעניש מקור שאינו מצהיר שפה?
10. כיצד quality model מתקשר ל-QD-02/03/04/05: near-dup clusters, field conflicts, intent fit, publication noise ו-thin evidence — בלי לייצר identity score סמוי?
11. אילו שדות הם durable session facts ואילו הם projection/UX בלבד? האם refresh, narrow ו-SSE resume ישמרו על אותה משמעות של source diversity?
12. אילו נתונים נדרשים ל-Acc scrub ולציטוט בטוח כאשר מציגים host family, language ו-quality reason? האם אפשר להציג provenance מלא בלי לחשוף identifiers או inference לא מבוססים?
13. מהו gate עתידי שמאפשר לומר ש-QD-01 השתפר: `multi-independent-source rate`, lift לפי seed class, ירידה ב-providerDiversity overstatement, או מדד אחר? אין להסתפק ביותר chips.
14. כיצד נבדוק שהמשתמש מבין “מקורות מרובים אך לא זהות מוכרעת” ולא מפרש badge כ-verified? נדרש ניסוח testable ו-golden corpus ל-S02/S03/S07/S10.
15. מי בעל הסמכות על vocabulary ו-localization של `source family`, `independence`, `partial`, `thin`, `HE native`, ו-`unknown`, כדי שה-UX לא ימציא semantics מעבר למודל?

## Evidence index

- `PHASE3-FINDING-QUALITY/PHASE3-UX-FLAT-LIST-AMBIGUITY-ממשק-2026-09-20.md`
- `PHASE3-FINDING-QUALITY/FINDING-QUALITY-SCORECARD.md` — QD-01..05 והמדדים
- `PHASE3-FINDING-QUALITY/SINGLE-SOURCE.json` — 244/244 single-source
- `PHASE3-FINDING-QUALITY/MULTI-INDEPENDENT-SOURCE.json` — 0/244 multi-independent
- `PHASE4-SOURCE-DISCOVERY/raw/source-analysis.json` — families/providers/domain statistics
- `PHASE3-FINDING-QUALITY/ARCH-TAXONOMY-SCHEMA-GAPS-ארכיטקט-2026-09-20.md` — sourceIndependence, hostFamily, language, quality gaps
- `PHASE3-FINDING-QUALITY/QUALITY-GATES-NOTES.md` — PG-01..04 and HOLD

## Result

**נרשם משטח UX לתצוגת גיוון מקורות בלבד. No code, no deploy, no promote. Core נשאר LOCKED; Promote נשאר HOLD.**
