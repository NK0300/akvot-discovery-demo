# ACC · ZW / Input-Boundary — בדיקת תכונות (דיוק) · 2026-09-24

**מצב ריצה:** מקומי ואופליין בלבד. `fetch` ו־`http(s).request` מוחלפים ב־stub שזורק ומונה, ונמדדו **0 קריאות רשת** מחוץ ל־core probe. גם ב־core probe כל ניסיון נחסם על ידי ה־stub. לא נגעתי ב־prod, ב־preview או בשום deployment של Vercel, ולא בוצעו deploy או promote. לא שיניתי קוד מוצר.
**Harness:** `test-results/2026-09-24/acc-norm-property.mjs`. ההרצה: `ROOT=<tree> node … --out x.json`. הריצה דטרמיניסטית (mulberry32 20260924), ושתי ריצות יצאו זהות byte-for-byte.
**JSON:** `ACC-ZW-INPUT-BOUNDARY-PROPERTY-דיוק-2026-09-24.json`, באותה תיקייה. הוא כולל תוצאות לכל sha, דוגמאות, gate, שורות v1.1 ו־v1.2.1.
**החוזה שנבדק:** §26 v1.1 (`600282e`), v1.1.1 (`61711d0`), v1.2/v1.2.1 (`1c680f9`, `91a569d`, נספח 26A).

## Shas
| sha | תפקיד |
|---|---|
| edf3f96 | בסיס לפני התיקון |
| 48d09a6 | zw-empty-seed שלב 1 |
| **2ade575** | zw-empty-seed: guard key לפי מחלקת Unicode (מועמד לשער) |
| 3145ae4 / e14043c | zw-empty-seed §26 שלב ד (v1.0) / wip ה (תוצאות זהות) |
| 23818a4 | input-boundary-26 שלב ד (rebase קודם) |
| 46f4413 | input-boundary-26 wip v1.1 |
| 7eb7fc7 | input-boundary-26 wip v1.2 (WeakSet brand, JSON cache key, ctxHasAny) |
| **3dde63a** | input-boundary-26 tip (~23:15): wip v1.2.1 (§11 blockers, recordHas, ds1 validate, scrub). הענף מקומי ועדיין לא ב־origin |

## Task 1 — שער המיזוג (8 זרעים × {none, IBM, IBM+US})
הקריטריון: הווריאנט לא עולה בשלב ולא יוצר commit/dossier/QID מעבר לתאום הנקי (W1–W4). בנוסף, הבייטים שמועברים לספקים (plan + provider, OFF/ON) הם raw על shas לפני v1.1, ו־`canonicalizeInput(v).query` על shas של v1.1.

| זרע | edf3f96 | 48d09a6 | **2ade575** | 3145ae4/e14043c/23818a4 | 46f4413 / 7eb7fc7 / 3dde63a |
|---|---|---|---|---|---|
| `John\u200BSmith` | FAIL ×3 | PASS | **PASS ×3** | PASS | none=FAIL¹, IBM/IBM+US=PASS |
| `John\u2060Smith` | FAIL ×3 | PASS | **PASS ×3** | PASS | none=FAIL¹, IBM=PASS |
| `John\u200FSmith` / `\u200E` | FAIL ×3 | FAIL ×3 | **PASS ×3** | PASS | none=FAIL¹, IBM=PASS |
| `דני\u200Bכהן` | none=FAIL | PASS | **PASS ×3** | PASS | none=FAIL¹, IBM=PASS |
| `דני\u200Fכהן` | none=FAIL | none=FAIL | **PASS ×3** | PASS | none=FAIL¹, IBM=PASS |
| `John Smith` / `דני כהן` (בקרה) | PASS | PASS | PASS | PASS | PASS |

**2ade575 עובר את 4 זרעי השער (`John\u200BSmith`, `John\u2060Smith`, `דני\u200Bכהן`, `דני\u200Fכהן`) לבד, עם IBM ועם IBM+US: 24/24 PASS.** הבייטים שמועברים לספקים זהים ל־raw.

¹ ב־v1.1 הזרעים האלה מסומנים `invisible_intra` ⇒ capped. ב־W1 הם יוצאים need_context בלי commit. אבל ב־W2 (אין wiki, 2 מועמדים עם ראיות) הם יוצאים `candidates`, בעוד התאום הנקי יוצא `need_context` (guard של Smith או של שם עברי נפוץ). זו עלייה בשלב שמפרה את I1, בלי commit. ראו «פערים» בהמשך.

## הגדרות התכונות
- **I1** — הווריאנט לא יכול לעלות מעל התאום: stage/commit(V) ≤ stage/commit(C). הדירוג: need_context/thin=0 < candidates=1 < dossier=2. identityCommit = (dossier && qid) או plan.identityConclusions. תרחישי ה־wiki: W1 = found+qid במקרה הגרוע (title=V). W2 = candidates. W3 = QID שאינו אסור. W4 = hydrate של knownIdentities.
- **I2a** (v1.1) — אם ה־`query` זהה וה־ceiling הוא clear אצל שניהם, ההחלטה (W1–W4, guards, known, seedClass) זהה והשאילתה שמועברת לספקים זהה. הסיווג נעשה לפי מודל ייחוס עצמאי `refCanon`.
- **I2b** — בכל מקרה אחר חלים רק I1 ו־I3. בנוסף, capped ⇒ UNKNOWN.
- **I3** — ceiling=capped (confusable, mixed_script, mixed_script_seed, encoded_double, invisible_intra) ⇒ אין dossier, QID או commit, כולל wiki exact/fuzzy, knownIdentities ו־cache.
- **I3x** — ההרחבה של Chief: invisible_intra ו־mixed_tokens.
- **CTX** — ctx מוסווה (`I\u200BBM`, `IBM\u200B`, `\u200EIBM`, `IB\u2060M`) מקבל את אותו cache key כמו `IBM` ולא מסלים.
- **P7** — capped עם כותרת wiki מדויקת ⇒ need_context או candidates. לא dossier, thin או not_found.
- **I4** — guard שתופס את C חייב לתפוס גם את V. בנוסף, matchers לא יוצרים זהות למשפחות capped.
- **I5** — clamp ל־soft-label / labelRelationship / evidenceGraph.
- **I6** — אין שקילות שגויה (compact, תחילית בעברית, fold) ב־knownIdentities, §26 key, cache key ו־wikiExact.
- **I7** — אין התנגשות cache key לווריאנט capped. אם יש hit, revalidate מוריד אותו.
- **P5** — זרעים ריקים או סמויים ⇒ empty_seed בשני המסלולים.
- **P6** — הבייטים שמועברים לספקים נכונים לפי החוזה, ובנוסף idempotence של key.
- **V12** — שורות §26 v1.2.1, ראו בהמשך.

## תוצאות (הפרות/נבדקו)
| | edf3f96 | 48d09a6 | **2ade575** | 3145ae4·e14043c·23818a4 | 46f4413 | 7eb7fc7 · **3dde63a** |
|---|---|---|---|---|---|---|
| I1 | 205/1429 | 192 | **124** | 13 | 100 | **100** (אפס commit) |
| I2a | 375/375 | 375 | 375 | 375 | 0 | **0** |
| I2b | 871/1041 | 860 | 802 | 505 | 91 | **91** |
| I3 (v1.1) | 863/957 | 852 | 794 | 504 | 0 | **0** |
| I3x | 117/144 | 120 | 126 | 126 | 0 | **0** |
| CTX | 20/40 | 20 | 20 | 20 | 0 | **0** |
| P7 | 923/957 | 918 | 892 | 796 | 0 | **0** |
| I4 | 281/910 | 266 | 179 | 60 | 45 | **45** |
| I5 | 0 | 0 | 0 | 0 | 0 | 0 |
| I6 | 275/348 | 275 | 275 | 237 | 47 | **47** (wikiExact_fold בלבד) |
| I7 collisions | 0 | 0 | 0 | 0 | 24, כולן יורדות ב־hit | 24, כולן יורדות ב־hit |
| P5 | 30/30 | 30/30 | 0 | 0 | 0 | 0 |
| P6 | 0/636 | 0 | 0 | 28 | 28 | 28 |
| V12 | 14/23 | 14 | 14 | 14 | 5 | 3 · **1** |

**Core handler probe** (`api/lookup.js` האמיתי, fetch כ־stub, זרעים עבריים חשופים):
- edf3f96: וריאנטים של ZW/bidi מדלגים על היציאה המוקדמת (12 ניסיונות upstream).
- 2ade575: כל ה־ZW/bidi יוצאים מוקדם עם 0 ניסיונות. ניקוד ו־HE wide forms עדיין יוצאים לרשת (16 ניסיונות).
- 3145ae4 ואילך: כולם יוצאים מוקדם עם 0 ניסיונות.
- `דני כהן` עם `org='\u200B'` או `'\u200F'`: need_context עם 0 ניסיונות ב־46f4413, ב־7eb7fc7 וב־3dde63a.

**שורות v1.1 בשמן** (W1 final):
- `John \u200BSmith` (I2a): FAIL על כל ה־shas הישנים, כי raw מועבר לספקים. PASS על 46f4413, 7eb7fc7 ו־3dde63a.
- `John\u200BSmith`, `John Sm\u200Bith`, `Mer\u200Bkel` (I2b):
  - על ה־shas הישנים: FAIL. `Mer\u200Bkel` יוצא dossier עם Q567. `John Sm\u200Bith` יוצא dossier (wiki_exact) החל מ־48d09a6. זו רגרסיה של 48d09a6: מיפוי ZW לרווח מפצל את "Smith" ועוקף את ה־guard.
  - על 7eb7fc7 ועל 3dde63a כולן need_context בלי commit. אבל `John\u200BSmith` ו־`John Sm\u200Bith` ב־ctx=none נכשלות ב־I1, בגלל W2 שיוצא candidates (הערה ¹).
- **capped עם stub מדויק של wiki (P7):** על 7eb7fc7 ועל 3dde63a 957/957 יוצאים need_context, ואין אף not_found. על 2ade575 ההתפלגות היא dossier 794, thin 98, need_context 65.

**CTX:** `I\u200BBM` ו־`IBM\u200B` מול `IBM`:
- על ה־shas הישנים ה־cache key שונה (FAIL), ואין הסלמה.
- על 46f4413, 7eb7fc7 ו־3dde63a ה־cache key זהה, ואין commit שנגזר מה־ctx.

## V12 — שורות §26 v1.2.1
| שורה | ישנים (edf…23818a4) | 46f4413 | 7eb7fc7 | **3dde63a** |
|---|---|---|---|---|
| P4 `יאיר Netanyahu` (וגם `מישל Obama`), none/IBM: אסור להגיע ל־Q43723, `isTrustedWikiSeed` או `wiki_seeded` | FAIL: dossier, wiki_seeded | PASS | PASS | **PASS** (need_context, input_risk_ceiling) |
| P5 `דני כהן` עם org `\u200B` / `\u200F` / `\u2060\u200B`: זהה ל־ctx ריק (I2a) | FAIL: dossier | PASS | PASS | **PASS** (need_context, אותו cache key) |
| §11.3 `Smith` עם IBM, wiki Q1701775 exact (pw=0) ורשומה עם affiliation IBM | FAIL: dossier (wiki_exact; ה־QID מוסר כי אסור) | FAIL | FAIL | **FAIL²** (dossier בלי QID) |
| §11.3 `Smith` / `John Smith` עם IBM, רשומת מועמד עם affiliation IBM | PASS (candidates) | PASS | PASS | PASS |
| §11.3 `John Smith` עם IBM ו־wiki Q1701775 | אין commit, אבל הצורה היא thin ולא candidates | כנ״ל | כנ״ל | כנ״ל |
| §11.3 `דני כהן` עם org שאינו ברשומה (Acme / Intel), wiki exact | FAIL: dossier Q990001 | FAIL | FAIL | **PASS** (`common_he_no_seed` ⇒ thin, בלי QID) |
| §11.3 `דני כהן` עם org שאינו ברשומה, מסלול candidates | PASS | PASS | PASS | PASS |
| S37: התנגשות `\|` ב־`cacheKeyFor` | FAIL: q↔city (`John\|Acme`+X ≡ `John`+`Acme\|X`), q↔city בעברית, `John Smith\|X` ≡ `John Smith`+city `X\|` | FAIL: org↔city ו־`John Smith\|clear` ≡ org `clear\|` | PASS | **PASS** (8/8 זוגות נפרדים) |

**חשיפה ב־S37** (ישנים ו־46f4413):
- שתי בקשות שונות חולקות רשומת cache, כלומר מקבלים את התשובה של בקשה אחרת.
- ב־hit, ה־revalidate מריץ מחדש את ה־guards על q של הקורא. לכן בזוגות שנבדקו לא נמצאה הסלמה ל־commit (למשל תאום Smith מקבל thin ולא dossier).
- יש כיוון הפוך: `John Smith|X` מקבל thin במקום ה־dossier שלו, כלומר אובדן recall.
- זוג phone↔email לא בר־הגעה ב־handler, כי טלפון לא תקין לצד שם נזרק.

**מסקנה ל־§11.3:**
- עד 7eb7fc7, ה־ctx משחרר את ה־guard העברי ומאפשר commit דרך wiki_exact, גם כשה־org לא נמצא ברשומה.
- 3dde63a (`recordHas`) סוגר את זה: `דני כהן` עם org שאינו ברשומה לא מקבל commit.
- ² `Smith` כטוקן יחיד אינו Smith-class, ולכן wiki_exact ⇒ dossier. ה־QID Q1701775 מוסר על ידי forbiddenIdentities.
  - זה **לא** נגזר מה־ctx: אותה תוצאה בלי ctx.
  - ה־QID עומד בדרישה, אבל הצורה «נשאר candidates» לא.

## מחלקות עקיפה שעדיין פתוחות
**על 2ade575** (מגיעים ל־dossier/commit ב־wiki במקרה הגרוע; הזרעים ה"סמויים" של השער סגורים):
- full-width / HE compat (20)
- confusable (`John Sm\u0456th`, 24)
- encoded `%20` / `&#32;` / `&nbsp;` (28)
- encoded_double (28)
- ניקוד (6)
- mixed_script (3)
- FB0B (1)
- invisible_intra (`John Sm\u200Bith`, 12)
- P4 mixed_script_seed
- P5 ctx סמוי
- S37
- fold-deletion ב־knownIdentities (134, למשל `Assafа Rappaport` ⇒ Q47507930, `דני Merkel` ⇒ Q567, `BenjaminNetanyahu`)
- wikiExact fold (Van Dam⇐Vandam וכו')

**על 3dde63a (tip; זהה ל־7eb7fc7 חוץ מ־V12):**
- (א) I1: capped ב־W2 יוצא candidates כשהתאום יוצא need_context. 100 מקרים, אפס commit. לתקן: capped ⇒ min(UNKNOWN, השלב של התאום), כלומר need_context כש־guard של common-name היה תופס.
- (ב) §11.3: נשאר רק `Smith` כטוקן יחיד עם IBM ⇒ dossier בלי QID (על 7eb7fc7 נכשלו 3 שורות).
- (ג) I4: ה־guard מפספס encoded_double (36) ו־mixed_script (9). הכול capped, בלי commit.
- (ד) I6 wikiExact_fold: 47. `titleExactishOrLatin` עדיין מקבל כותרת compact.
- (ה) P6: `key(key(V))≠key(V)` ל־encoded_double (28). זו התנגשות תכנונית עם decode-once.
- (ו) FB0B (תו לא מוקצה) בלי דגל. המלצה: לסמן `\p{Cn}` / `\p{Co}`.

**הערות לחוזה:**
- ZWNJ/ZWJ לגיטימי בין אותיות (פרסית, שמות עבריים עם ZWNJ) מקבל capped ⇒ אובדן recall. מומלץ לפטור אותם בסקריפטים מחברים.
- stageB (`norm`, `nameTokens`, `tokenOverlap`, `splitPersonName`) רץ על q ולא מופיע ב־sweep של §7. זה Chief Q4 (OL "John Smith" נפל ל־`John\u200BSmith` עם ראיות זהות). ב־v1.1 זה מותר (I2b), אבל ל־I2a זה חייב לרוץ על `query`.
- Kelvin U+212A מתנגש עם k (compat, למידע בלבד).

---
מקומי בלבד · ללא prod/preview · ללא deploy/promote · ללא שינוי בקוד מוצר.
