# §25 — Seed Classification Rules (slice B contract) — ארכיטקט · 2026-09-24

סטטוס: v1.2 · **CONTRACT ONLY** · אין שינוי קוד בקומיט הזה · מימוש = slice B של שרת, אחרי switch + slice A.
נעילות: NO PROMOTE · Preview/Acc HOLD · C1 · INFORMATION≠IDENTITY.

## 0. עיקרון
`seedClass` הוא **ניתוב חיפוש בלבד**. הוא לא טענת זהות, לא משנה C1, ולא נכנס ל־evidence/relationship.
שגיאה בכיוון בטוח: כשאין אות חזק → `ambiguous`/`unknown`, **לעולם לא** `person` כברירת מחדל לשם מוסדי.

## 1. מצב נוכחי (probe על `bb3a7f6`, `detectSeedClass`)
| seed | היום | צפוי לפי §25 |
|---|---|---|
| `report.pdf` | domain | **document** |
| `Annual Report 2023.pdf` | document | document |
| `doi:10.1000/182` | document | document |
| `10.1000/182` (DOI חשוף) | domain | **document** |
| `ISBN 978-3-16-148410-0` | document | document |
| `Acme Ltd` / `Acme Inc.` | organization | **company** |
| `Tel Aviv University` | organization | organization |
| `אוניברסיטת תל אביב` | person | **organization** |
| `עמותת לתת` | person | **organization** |
| `משרד הבריאות` | person | **organization** |
| `טבע תעשיות בע"מ` | unknown | **company** |
| `IBM` | unknown | unknown (ללא שינוי) |
| `https://x.com/a.pdf` | url | url (ללא שינוי) |
| `example.com` | domain | domain |

שלושה פגמים מבניים:
1. **סדר בדיקות:** `domain` נבדק לפני `document`, ולכן `report.pdf` ו־DOI חשוף נראים כ־hostname.
2. **`company` לא נגיש:** כל סיומות ה־legal-form (`ltd|corp|inc|gmbh|oy`) נתפסות קודם ע״י regex של organization.
3. **עברית:** אין סמני מוסד/חברה בעברית, ולכן שם מוסדי בעברית בן 2–3 מילים נופל ל־`person`. זה הפער החמור ביותר מבחינת Acc (ניתוב org ללוח person).

## 2. סדר עדיפויות (precedence, first match wins)
0. ~~hint (`hints.seedClass|entityType|type`)~~ — **v1.2: מבוטל כמקור סיווג.** מפתח payload שמשנה סיווג הוא חור (בודק: כופה organization גם על URL/`.pdf`). הערכים נשארים context בלבד.
0b. **מקור override יחיד מוצהר: `seedKind`** ∈ {`person`, `organization`} (רשימה סגורה; כל ערך אחר מתעלמים ממנו). נבדק **אחרי** שלבים 2–4 (url/document/domain) ו**לפני** 5–9. לעולם לא גובר על אות מבני. בחירת סוג חיפוש בלבד: לא משנה `identityClaim`, לא C1. (החלטת Chief, v1.2.)
1. ריק/רווחים — `empty_seed` (slice A; לא חלק מ־§25).
2. `^https?://` → `url`. גם כשה־path מסתיים ב־`.pdf`. סוג המסמך הוא תכונה של url target (`classifyUrlTargets`), לא seedClass. **ללא שינוי.**
3. **document** (הוקדם לפני domain):
   - שם קובץ: הטוקן האחרון מסתיים ב־`.(pdf|docx?|odt|rtf|txt)` (case-insensitive). `html?` **לא** document — דף web שייך ל־domain/url.
   - DOI: `doi:` או תבנית `^10\.\d{4,9}/\S+$`.
   - ISBN: `isbn` + 10/13 ספרות (עם מקפים).
4. `domain` — hostname בלי רווחים (כמו היום).
5. **company** — סיומת legal-form כטוקן אחרון (אחרי הסרת נקודה/פסיק):
   `inc, llc, ltd, plc, corp, co, gmbh, ag, sa, s.a., oy, ab, bv, nv, בע"מ, בע״מ, בעמ`.
6. **organization** — שם עצם מוסדי כטוקן כלשהו:
   EN: `university, college, institute, foundation, ministry, association, society, council, municipality, hospital, school`
   HE (כולל צורת סמיכות): `אוניברסיטה/אוניברסיטת, מכללה/מכללת, מכון, עמותה/עמותת, קרן/קרנות, משרד, עירייה/עיריית, מועצה/מועצת, בית חולים, בית ספר, איגוד, ארגון, אגודה/אגודת`.
   אם גם 5 וגם 6 מתקיימים → `company` (legal-form חזק יותר).
7. `^Q\d+$` → unknown (כמו היום).
8. person (2–3 טוקנים אלפביתיים) — **רק אחרי** שלא נמצא סמן מוסדי.
9. ambiguous / unknown כמו היום.

כללי שמרנות:
- מילה מוסדית אחת לבד (`משרד`, `University`) → `ambiguous`, לא organization. דרוש לפחות טוקן נוסף.
- `קרן` הוא גם שם פרטי (קרן כהן) וגם ארגון (קרן רש"י). לכן `קרן` כטוקן **ראשון** ואחריו טוקן אחד בלבד → `ambiguous` — **לא** organization **ולא** person (v1.1, הכרעת Acc: org בלוח person מסוכן יותר מאובדן כיסוי).
- אין מילוני "שמות חברות מוכרות" (IBM, Google...). אין acronym→company. אחרת זו המצאת ישות.

## 3. hints של הקשר (org / city / country) — החלטה
**רמזי הקשר לא משנים seedClass.** `Smith` + `IBM` הוא עדיין seed של person עם הקשר org, לא org.
זה הלקח של Smith+ctx/Q1701775: הקשר לא משדרג סיווג ולא מקרב לזהות. ההקשר עובר ל־query context בלבד (כבר קיים בנתיב נפרד).
לכן ממצא QA §3א («org/עיר לא משנים את ה־plan») הוא **התנהגות נכונה**, לא באג. slice B מטפל רק בסיווג ה־seed עצמו.

## 4. השפעה צפויה על ה־plan
- `organization` ו־`company` חולקים schedule (`SCHEDULE_ALIAS`), לכן `organization→company` משנה רק את `seedClass`/rationale ולא launches.
- `person→organization` (שמות מוסדיים בעברית) **כן** משנה intents: ORGANIZATION_PRESENCE במקום IDENTITY/PUBLICATIONS. זה diff מכוון.
- `domain→document` משנה intents ל־DOCUMENTS/PUBLICATIONS, בכפוף ל־capability match. אם אין משפחה עם `bibliographic_records` זמינה, השורה נופלת כמו היום (אין fallback חדש).

## 5. שער slice B
1. golden חדש של בודק נקפא **אחרי** slice A. ה־diff של slice B מולו חייב להכיל **רק** את השורות המסומנות בטבלה §1 (ומקרי §2 שמתווספים). כל diff אחר = HOLD.
2. טסטים חובה: כל שורות §1 · `קרן כהן`→ambiguous · `קרן רש"י`→ambiguous · `קרן`→ambiguous · `University`→ambiguous · `IBM`→unknown · `https://x/a.pdf`→url · `page.html`→domain · `Smith`+hint org→**unknown** (hint לא משדרג) · `John Smith`+IBM/עיר/מדינה→person · `seedKind=organization` על URL/`.pdf`/domain→url/document/domain · `seedKind=person` על URL/`.pdf`→url/document · `seedKind` לא משנה `identityClaim` · `hints.type=organization` על `John Smith`→person.
3. אין `if (familyId)`, אין שינוי ב־Registry, ב־Policy או ב־C1. השינוי מוגבל ל־`detectSeedClass` ולטבלאות סמנים הצהרתיות (frozen arrays).
4. Acc (דיוק): בדיקה ש־reclass לא יוצר `identityClaim` ולא משנה relationship. seedClass לא מופיע ב־evidence edges.

## 6. v1.2 — override יחיד (החלטת Chief 22:03)
- `detectSeedClass(seed, { seedKind })` הוא הממשק היחיד. `hints.seedClass|entityType|type` מפסיקים להשפיע על סיווג.
- נקודות מעבר (slice B, אותו commit): `universalSeed.js:47` (`obj.seedClass || hints.seedClass` → `seedKind` בלבד) · `dualRunHarness.js:268/283` (harness פנימי — עובר ל־`seedKind`) · `providers.js:569` קורא `hints.seedClass` אחרי הסיווג: לוודא שהוא מקבל את ה־`seedClass` המחושב של ה־plan ולא את ה־hint הגולמי.
- UI: `discovery-ui.js` שולח היום `{seed, q, locale}` בלבד. חיבור `seedKind` לבקשה הוא slice UX נפרד (ממשק), אחרי שהשרת מקבל אותו.
- golden: שורות שבהן `hints.seedClass` כפה סיווג היום צפויות להשתנות. זה diff מכוון ויש לרשום אותו מראש ברשימה של שרת.
