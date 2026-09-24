# §26 — Input Normalization Boundary (חוזה) — ארכיטקט · 2026-09-24

סטטוס: **v1.1** (Chief אישר) · **CONTRACT ONLY** (אין קוד בקומיט הזה) · מימוש: שרת, על branch מעל `48d09a6`.
נעילות: **PROD HOLD** · NO PROMOTE · TREATMENT unchanged · C1 קשיח · Wave 1 NOT DONE.
רקע: אירוע ZERO-WIDTH/UNICODE. תו סמוי עקף את שמירת Smith ואת שמירת שם המשפחה העברי (שחזור שרת על `edf3f96`). ה־sweep למטה מראה שזו **מחלקה**, לא תו בודד.

## 0. עיקרון
גבול אחד לכל קלט משתמש. **ההשוואות רצות רק על key קנוני. מה שממשיך הלאה הוא raw.** לעולם לא ההפך.
השמירות רצות על הצורה הרחבה ביותר (כדי לתפוס). ה־matchers של זהות רצים על הצורה המחמירה, ועליהם תקרת סיכון. נרמול לעולם לא מעלה סטטוס.

## 1. ממצאי probe (branch `48d09a6`, מקומי, בלי רשת)
| קלט | שמירה | תוצאה היום |
|---|---|---|
| `John Sm\u0456th` (i קירילי) | Smith | **false** (עקיפה) |
| `Ｊｏｈｎ Ｓｍｉｔｈ` (full-width) | Smith | **false** |
| `John%20Smith`, `John&#32;Smith`, `John&nbsp;Smith` (מקודד מילולית) | Smith | **false** |
| `John\u200ESmith` / `\u200F` / isolates / `\u2062` / `\u034F` | Smith | **false** (נסגר ב־commit הבא של שרת) |
| `דָּנִי כֹּהֵן` (ניקוד), `דני כֹהן` | שם משפחה עברי | **false** |
| `דני ﬋הן` (צורת הצגה) | שם משפחה עברי | **false** |
| `דני\u200Fכהן` | שם משפחה עברי | **false** (נסגר ב־commit הבא) |
| `J\u043Ehn Smith` (o קירילי בשם הפרטי) | Smith | true (במקרה; רק השם האחרון נבדק) |
לא נבדק live. האם כל עקיפה מגיעה בפועל ל־dossier תלוי בזה שהחיפוש בוויקי מנרמל בצד שלו. זה האימות של בודק (4א).

## 2. נקודת כניסה אחת
`canonicalizeInput({seed, hints, seedKind}) → { raw, query, key, guard: {spaced, collapsed}, ceiling, inputRisk[], ctx }` (v1.1: **קריאה אחת** בכניסה ל־handler של lookup ושל discovery/sessions. ה־ctx עובר באותה קריאה, והאובייקט המוחזר frozen ומועבר הלאה) ב־`api/lib/seedText.js` (מודול עלה, בלי imports, Core ו־Discovery שניהם מייבאים). חל על `seed`, על ערכי `hints` (org/city/site) ועל `seedKind` (שם רק trim ו־lowercase לפי §25 §7.1).
- `raw` — הקלט כפי שהתקבל, byte-identical. משמש **רק** לתצוגה, ל־journal (אחרי scrub) ולשער SSRF על URL מפוענח (v1.1).
- `query` (v1.1) — מה שנשלח ל־providers: שלבים 0–3 ו־6 של §3 בלי casefold ובלי הסרת ניקוד, **אותיות גדולות וקטנות נשמרות**. תווים סמויים לפי §10.1.
- `key` — צורה קנונית להשוואה ולהתאמת זהות (§3 שלבים 1–7).
- `guard` — `skeleton(key)`: key שבו אותיות קיריליות ויווניות שמתחזות ללטיניות מומרות ללטינית (טבלה סגורה, UTS#39-lite). **משמש רק לשמירות ולזיהוי ריק**, לעולם לא ל־matching של זהות.
- `inputRisk[]` — רשימה סגורה (§4).
- `isBlankSeed(v) ≡ guard === ''`.

## 3. סדר הפעולות ל־key (קבוע, כל שלב פעם אחת)
0. coercion ל־string, ו־cap אורך ל־raw (256 code points; מעבר לזה `overlong` ו־reject כקלט פסול, לא חיתוך שקט).
1. **decode פעם אחת בלבד:** percent-decode רק אם כל ה־`%XX` תקינים והתוצאה UTF-8 תקין, אחר כך HTML entities (numeric וקבוצת named סגורה). אם אחרי פענוח אחד עדיין יש רצף שניתן לפענח, מסמנים `encoded_double` ו**לא** מפענחים שוב. פענוח לעולם לא חל על URL שממשיך ל־fetch (§6).
2. **NFKC** (מכסה NFC, full-width, ליגטורות, צורות הצגה עבריות כמו `﬋`).
3. **Default_Ignorable:** מפרידים הופכים לרווח (`\u200B \u2060`, bidi: `\u200E \u200F \u061C \u202A-\u202E \u2066-\u2069`). שאר `\p{Default_Ignorable_Code_Point}` (ZWJ, ZWNJ, BOM, SHY, `\u2061-\u2064`, `\u034F`, `\u180E`...) מוסרים.
4. **סימנים עבריים:** הסרת ניקוד וטעמים `\u0591-\u05C7` חוץ מאותיות. `״ " ׳ '` מאוחדים כמו היום בקוד.
5. **casefold:** `toLowerCase()` אחרי NFKC. `ß` נשאר `ß` (אין full casefold). זה diff מוצהר ולא באג.
6. **רווחים:** כל `\s`/`\p{Zs}` הופך לרווח יחיד, ואחר כך trim.
7. diacritics לטיניים **נשארים** ב־key. `latinFold` (NFKD ובלי סימנים) נגזר מ־key כהשוואה משנית, כמו היום.

למה הסדר הזה: decode לפני NFKC, כי entity יכולה להסתיר תו. NFKC לפני ignorable, כי NFKC עלול לייצר רווחים או סימנים. casefold אחרי NFKC, כי full-width uppercase.

## 4. `inputRisk` — רשימה סגורה
`invisible` · `bidi` · `encoded` · `encoded_double` · `non_nfc` (raw≠NFC(raw)) · `compat` (NFKC≠NFC) · `niqqud` · `mixed_script` (טוקן אחד עם אותיות מיותר מסקריפט אחד מבין Latin/Hebrew/Cyrillic/Greek/Arabic) · `confusable` (`guard`≠`key` בגלל טבלת skeleton) · `overlong`.
הדגלים הם **מידע**. הם נרשמים ב־session ו־journal בלי ה־raw עצמו (scrub), וה־UI מציג הערה ניטרלית (ממשק, soft).

## 5. Invariants (Acc; דיוק מנסח כ־property test)
- **I1 מונוטוניות:** לכל וריאנט V של שם נקי C, `stage(V) ≤ stage(C)` ו־`identityCommit(V) ⇒ identityCommit(C)`. וריאנט לעולם לא גבוה מהנקי.
- **I2 שקילות לנרמול טהור:** אם `inputRisk ⊆ {invisible, bidi, non_nfc, compat, niqqud, encoded}` אז `key(V)=key(C)`, והתוצאה **זהה** לנקי (לא רק נמוכה).
- **I3 תקרת סיכון:** אם `inputRisk ∩ {confusable, mixed_script, encoded_double} ≠ ∅` אז `identityCommit=false`, ו־stage לכל היותר זה של הגרסה הנקייה והמעורפלת (candidates/need_context). אף פעם לא dossier.
- **I4:** השמירות (Smith, שם משפחה עברי, common-surname) רצות על `guard`, ולכן `John Sm\u0456th` נתפס כמו `John Smith`. ה־matchers (knownIdentities, wikiExact) רצים על `key`, כך ש־skeleton לא יוצר התאמת זהות.
- **I5:** אין SAME-ENTITY מדמיון מחרוזות, בשום צורה (key, guard או fold).

## 6. גבולות שלא זזים
- **URL:** פענוח לעולם לא על URL שממשיך ל־fetch. שער ה־SSRF של `urlTargets` נשאר על ה־raw אחרי `new URL()` (WHATWG, שממיר IDN ל־punycode). השוואת hosts נעשית על `hostname` אחרי parse. hostname עם `mixed_script` מקבל flag, ו־URL≠IDENTITY ממילא.
- **`query` ל־providers (v1.1):** השאילתה לספקים היא `query`, לא raw. אם `key` ריק (רק רווחים או תווים סמויים), התוצאה `empty_seed` ו־0 search בשני המסלולים (flag OFF ו־QueryPlan ON, כולל זרע ששמור ב־store).
- **deny-lists** (displayLabel, מילות זהות): הבדיקה נעשית על `guard` של הערך, כך ש־`vеrified` עם е קירילית או `מאו\u200Bמת` נדחים.

## 7. Sweep — כל נקודת השוואת מחרוזות
| # | מקום | מצב | פעולה |
|---|---|---|---|
| 1 | `orchestrator.js:103` `isCommonLatinAmbiguousName` | **חשוף** (homoglyph, full-width, מקודד) | `guard` |
| 2 | `orchestrator.js:76` `isCommonHeBareName` | **חשוף** (ניקוד, צורות הצגה, מקודד) | `guard` |
| 3 | `orchestrator.js:58` `isLatinScript` | **חשוף**: סופר רק `A-Za-z`/עברית, ולכן full-width או קירילית נותנים false ומדלגים על השמירה | להריץ על `guard` |
| 4 | `knownIdentities.js:181` `normalizeQuery`, `:9` `latinFold` | מוגן חלקית (guardKey ב־branch). פספוס כאן בטוח | `key` |
| 5 | `lookup.js:891` `normNameTokens`, `:931` `titleExactish`, `:947` `softLatinClose`, `:972`, `:982`, `:1893` `tokenOverlapSafe` | **אסימטרי**: q מנורמל רק כשיש תו סמוי, title גולמי | `key` בשני הצדדים, תמיד |
| 6 | `lookup.js:476` `decodeHtml`, `webOrigin.js:217` | מוגן (פענוח טקסט של provider, פעם אחת) | לא להחיל על seed/key פעם שנייה |
| 7 | `lookup.js:2776` `scrubUrlField` | **חשוף** ל־double-encoding (`%2540` אחרי פענוח אחד הוא `%40`, ו־scrub של email מפספס). `decodeURIComponent` על קלט פגום זורק ונופל ל־scrub חלקי | scrub על decode-once ו־flag ל־`encoded_double`. קלט פגום מחליף את השדה ב־`''` (fail-closed) |
| 8 | `store.js:346` `softLabel` (corroboration) | מוגן חלקית: קירילית נמחקת ולא ממופה, והניקוד נשאר (פספוס, בטוח) | `key` ואחריו softLabel. corroboration לעולם לא SAME (I5) |
| 9 | `sourceFamily.js:58` `DISPLAY_LABEL_DENY_RE`, deny ב־`discovery-ui.js` | **חשוף** ל־homoglyph ול־ZW | `guard` (§6) |
| 10 | `forbiddenIdentities.js` | מוגן: השוואה על QID ASCII מה־providers | בלי שינוי. טסט: `Ｑ１７０１７７５` לא נחשב QID |
| 11 | `requestGuards` / `createDiscoverySession` / `queryPlan` empty | מוגן ב־branch לתווים סמויים בלבד | `isBlankSeed` מ־§2 |
| 12 | Discovery: `evidenceGraph`, `relationship`, `urlTargetBridge`, dedup ב־`familyOrchestrator` | מוגן בתכנון: המפתח הוא id/URL ולא שם | URL keys אחרי WHATWG parse |
| 13 | `detectSeedClass` (`queryPlan.js`) | חשוף (ה־regex של person דוחה תווים סמויים, ולכן unknown. פספוס, בטוח) | `key` |
| 14 | מפתחות cache (`lookup.js:3103` `cacheKeyFor`, `:535` `cacheGet`) | **לבדיקה**: אם המפתח raw, וריאנטים לא משתפים cache (בטוח). אם הוא מנורמל אחרת, יש סיכון לתשובה של שם אחר (לקח Q1701775) | cache על `key` ועוד fingerprint של `inputRisk` |

## 8. סדר מימוש (שרת)
א. `canonicalizeInput` טהור, עם טבלת skeleton סגורה ו־inputRisk, וטסט יחידה לכל שלב בנפרד.
ב. שמירות 1–3, 9 ו־11 עוברות ל־`guard`.
ג. matchers 4, 5, 8 ו־13 עוברים ל־`key` בשני הצדדים.
ד. תקרת סיכון I3 בנקודת ההכרעה של stage.
ה. scrub (7) ו־cache (14).
כל שלב הוא commit נפרד על ה־branch. merge רק כשהכול ביחד עבר את השער.

## 9. שער
1. **parity מלא** מול A′ (`QA-QUERYPLAN-GOLDEN-edf3f96.json`) ו־v2′ (`QA-SEEDCLASS-GOLDEN-v2-edf3f96`, 112 שורות) על השורות הנקיות. כל שורה שזזה בגלל NFKC או casefold מוצהרת מראש ברשימה של שרת, ואין אחרות.
2. מטריצת QA (בודק 4ב): כל וריאנט `≤` הנקי. I2 דורש שוויון.
3. property Acc (דיוק): I1–I5 ירוקים.
4. לכל שורה ב־§7 יש טסט עם וריאנט אחד לפחות מכל דגל רלוונטי.
5. `npm test` מלא ירוק.
6. אחר כך חבילת deploy מבוקרת (diff, ראיות, rollback). prod נשאר HOLD עד החלטה מפורשת של נחמן.

## 10. v1.1 — תיקונים מחייבים (אושרו ע״י Chief, 2026-09-24)
**10.1 תווים סמויים (החלטה מפורשת, מחליפה את §3 שלב 3 לגבי ZWSP/WJ/bidi):**
- תו סמוי או bidi **צמוד לרווח**, או בתחילת/סוף הזרע, נמחק בלי השפעה ובלי תקרה. לכן `John \u200BSmith` זהה לנקי לגמרי.
- תו סמוי או bidi **בין שתי אותיות** נמחק, והזרע מקבל `inputRisk: invisible_intra` ו־`ceiling=capped` (I3). כך `John\u200BSmith` הופך ל־`JohnSmith` עם תקרה, ו־`Sm\u200Bith` ל־`Smith` עם תקרה.
- החלק «מפריד הופך לרווח» ב־§3 שלב 3 בטל. המחיקה חלה על `query`, על `key` ועל `guard.spaced` באותה צורה.

**10.2 guard בשתי צורות:** `guard.spaced` הוא skeleton(key), ו־`guard.collapsed` הוא אותו דבר בלי רווחים. כל guard (Smith, שם משפחה עברי, common surname, deny-lists) **יורה אם אחת מהצורות יורה**. שתי הצורות וה־skeleton משמשים **רק** guards, שיכולים רק להוריד סטטוס. הם לעולם לא נכנסים ל־matchers, ל־knownIdentities או למפתח המטמון.

**10.3 `mixed_script_seed`:** אם בזרע יש אותיות מיותר מסקריפט אחד (Latin/Hebrew/Cyrillic/Greek/Arabic), בכל מיקום, התוצאה `ceiling=capped`. דוגמאות: `דני Netanyahu`, `דני Merkel`.

**10.4 אין הפלה שקטה:** `latinFold`, softLabel או כל fold אחר שמפיל טוקן שלם מסמן זאת. זרע עם טוקן שנפל לא מגיע ל־knownIdentities.

**10.5 `ceiling`:** הערכים הם `clear` או `capped`. הוא `capped` אם `inputRisk ∩ {confusable, mixed_script, mixed_script_seed, encoded_double, invisible_intra} ≠ ∅`. כש־capped: `identityCommit=false`, ואין dossier ואין QID, כולל קבלת כותרת fuzzy או exact מוויקי, known-identity ומטמון.

**10.6 מפתח מטמון:** `cacheKey = key ⊕ ceiling ⊕ canonical(ctx)`. וריאנט capped לעולם לא קורא רשומה clear. ctx מוסווה (`IBM\u200B`) לא פותח רשומה נפרדת.

**10.7 I2 מפוצל (מחליף את I2 ב־§5):**
- **I2a:** אם `query(V) = query(C)` וגם `ceiling(V)=clear`, סט המועמדים וה־stage **זהים בדיוק** לנקי.
- **I2b:** אחרת, רק I1 ו־I3 חלים: לא מעל הנקי, בלי commit, בלי dossier ובלי QID.

**10.8 אכיפה מבנית (פירוט מלא יגיע עם הביקורת המלאה):** פונקציות guard, match, cacheKey, routing ו־seedClass מקבלות רק את האובייקט הקנוני (עם Symbol brand), וזורקות שגיאה על מחרוזת גולמית. `npm test` מריץ lint שנכשל על דפוסי השוואה גולמית חדשים שלא נמצאים ב־allowlist מוצדק.

**10.9 תהליך:** `contract-identity-p0` יוצא מ־`npm test` ל־`test:live`, ורץ רק עם `AKVOT_LIVE=1`. `npm test` רץ עם 0 רשת. ה־patch של 16 המקרים חייב לצאת red על main ו־green על `input-boundary-26`.
