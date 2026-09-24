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

---

## §ADVERSARIAL-26 — משפחות אדברסריות להקשחת גבול הזהות (§26 IDENTITY BOUNDARY HARDENING) · 2026-09-24 ~23:30–00:10 (IL)

**מצב ריצה:** אופליין בלבד. כל תהליך node רץ תחת `unshare -rn` (אין רשת ברמת הקרנל) + stub ל-`globalThis.fetch` שזורק וסופר (846422a: 1668 ניסיונות, c77a909/33d5ad0: 805 — כולם נחסמו). 0 קריאות prod/preview, ללא deploy/promote, קוד המוצר לא שונה, contract-identity-p0 מוחרג. worktrees פרטיים `/workspace/acc-work-*` (הוסרו בסוף).

**Shas:**
- `846422a` = origin/main (קוד מוצר זהה ל-`27db582`) — **בסיס אדום** (אין `seedText.js`/`commitGate.js` ⇒ שורות `flag` נכשלות מהגדרה: "אין גבול").
- `c77a909` = קצה `input-boundary-26` בתחילת הריצה — **wip / לא מחייב**.
- `33d5ad0` = קצה `input-boundary-26` אחרי תזוזה אחת (23:29:45 IL; ההבדל מול c77a909 הוא רק `scripts/lint-raw-compare.allow.json`, קוד המוצר זהה) — **wip / לא מחייב**, SHA הבדיקה הסופית. תוצאות c77a909 ו-33d5ad0 זהות שורה-שורה.

**Harness:** `test-results/2026-09-24/acc-adversarial-26.mjs` (חדש, sibling ל-`acc-norm-property.mjs`). JSON מלא: `ACC-ADVERSARIAL-26-דיוק-2026-09-24.json` (משפחות לכל sha, ≤3 דוגמאות לכל בדיקה שנכשלה, F2idem/F4rows/F5, trace של file:line, סיכום harness ראשי).

**שרשרת ההחלטה שנבדקה:** `canonicalizeInput` → `decideStage` → `mayCommitDossier` → `attachOrchestratorFields` → `revalidateDomainSafePayload` (+ `planForSession.identityCommit`) על התרחישים W1 (wiki exact, כותרת נקייה), W1v (כותרת = הווריאנט), WS (seeded עם ה-QID המוכר, "QID override"), W3 (QID זר Q990099), W4 (hydrate מ-knownIdentities), W2 (candidates). ctx ∈ {none, IBM}. F3 רץ על ה-handler האמיתי `api/lookup.js` עם fetch stub שלוכד URLs.

**סיווג צפוי לכל שורה:** `capped` ⇒ דגל בגבול + אין commit (dossier/QID/identityCommit) + לא עוקף את התאום הנקי · `pure` ⇒ מתכנס: אותה שאילתה קנונית + אותה חתימת החלטה + אותה שאילתה שמועברת לספקים · `distinct` ⇒ I1 (לא עולה מעל התאום) + key_matcher (אין זהות מוכרת דרך key אחר).

### טבלה — FAIL/נבדקו לכל sha

| משפחה/בדיקה | 846422a (main, בסיס אדום) | c77a909 (wip) | 33d5ad0 (wip, סופי) |
|---|---|---|---|
| F1.greek:flag | FAIL 16/16 | PASS 0/16 | PASS 0/16 |
| F1.greek:no_commit | FAIL 10/16 · commit 10 | PASS 0/16 | PASS 0/16 |
| F1.greek:no_outrank | FAIL 2/16 · stage 2 | FAIL 3/16 · stage 3 | FAIL 3/16 · stage 3 |
| F1.armenian:flag | FAIL 12/12 | FAIL 12/12 | FAIL 12/12 |
| F1.armenian:no_commit | FAIL 8/12 · commit 8 | FAIL 4/12 · commit 4 | FAIL 4/12 · commit 4 |
| F1.armenian:no_outrank | PASS 0/12 | PASS 0/12 | PASS 0/12 |
| F1.other_script:flag | FAIL 4/4 | FAIL 4/4 | FAIL 4/4 |
| F1.other_script:no_commit | PASS 0/4 | PASS 0/4 | PASS 0/4 |
| F1.other_script:no_outrank | PASS 0/4 | PASS 0/4 | PASS 0/4 |
| F1.fullwidth:converge | FAIL 16/16 · commit 7 | PASS 0/16 | PASS 0/16 |
| F1.combining_latin:I1 | PASS 0/16 | FAIL 6/16 · commit 6 | FAIL 6/16 · commit 6 |
| F1.combining_latin:key_matcher | FAIL 4/16 · commit 4 | FAIL 4/16 · commit 4 | FAIL 4/16 · commit 4 |
| F1.niqqud:converge | FAIL 8/8 · commit 1 | PASS 0/8 | PASS 0/8 |
| F1.mixed_token:flag | FAIL 20/20 | PASS 0/20 | PASS 0/20 |
| F1.mixed_token:no_commit | FAIL 20/20 · commit 20 | PASS 0/20 | PASS 0/20 |
| F1.mixed_token:no_outrank | PASS 0/20 | PASS 0/20 | PASS 0/20 |
| F2.encoded_double:flag | FAIL 20/20 | PASS 0/20 | PASS 0/20 |
| F2.encoded_double:no_commit | FAIL 20/20 · commit 20 | PASS 0/20 | PASS 0/20 |
| F2.encoded_double:no_outrank | FAIL 13/20 · stage 13 | FAIL 7/20 · stage 7 | FAIL 7/20 · stage 7 |
| F2.decode_once | FAIL 17/17 | PASS 0/17 | PASS 0/17 |
| F2.idempotent_object | FAIL 17/17 | PASS 0/17 | PASS 0/17 |
| F2.idempotent_query_nodecode | FAIL 17/17 | PASS 0/17 | PASS 0/17 |
| F2.encoded_single:converge | FAIL 14/14 · commit 11 | PASS 0/14 | PASS 0/14 |
| F3.empty_field:text | FAIL 114/120 | PASS 0/120 | PASS 0/120 |
| F3.empty_field:identifier | FAIL 38/40 | FAIL 38/40 | FAIL 38/40 |
| F3.empty_field_slow:text | FAIL 6/6 | PASS 0/6 | PASS 0/6 |
| F3.empty_field_slow:identifier | FAIL 2/2 | FAIL 2/2 | FAIL 2/2 |
| F3.intra_word | FAIL 14/14 | PASS 0/14 | PASS 0/14 |
| F4.joined_title:matcher | FAIL 6/6 | FAIL 6/6 | FAIL 6/6 |
| F4.joined_title:commit | FAIL 6/6 · commit 6 | PASS 0/6 | PASS 0/6 |
| F4.edit_distance_1:matcher | FAIL 4/4 | FAIL 4/4 | FAIL 4/4 |
| F4.edit_distance_1:commit | FAIL 3/4 · commit 3 | PASS 0/4 | PASS 0/4 |
| F4.surname_only:matcher | PASS 0/3 | PASS 0/3 | PASS 0/3 |
| F4.surname_only:commit | FAIL 3/3 · commit 3 | PASS 0/3 | PASS 0/3 |
| F4.fold_foreign:matcher | FAIL 2/2 | PASS 0/2 | PASS 0/2 |
| F4.fold_foreign:commit | FAIL 2/2 · commit 2 | PASS 0/2 | PASS 0/2 |
| F4.url_only | FAIL 1/2 | PASS 0/2 | PASS 0/2 |
| F4.url_only_no_cand | PASS 0/2 | PASS 0/2 | PASS 0/2 |
| F4.title_only | PASS 0/2 | PASS 0/2 | PASS 0/2 |
| F4.label_equals_q_no_sources | PASS 0/2 | PASS 0/2 | PASS 0/2 |
| F4.disc_url_only_same_url | PASS 0/1 | PASS 0/1 | PASS 0/1 |
| F4.disc_title_only_same_title | PASS 0/1 | PASS 0/1 | PASS 0/1 |
| F4.disc_joined_title | PASS 0/1 | PASS 0/1 | PASS 0/1 |
| F5.B1_capped_no_outrank_W2 | FAIL 5/7 · stage 5 | FAIL 7/7 · stage 7 | FAIL 7/7 · stage 7 |
| F5.B2_single_token_smith | FAIL 2/2 · commit 2 | PASS 0/2 | PASS 0/2 |
| F5.B4_stageB_pure_same_candidates | FAIL 1/4 | PASS 0/4 | PASS 0/4 |
| F5.B4_stageB_zw_org_direct_call | PASS 0/1 | PASS 0/1 | PASS 0/1 |
| F2.idempotent_string_redecode | — | FAIL 8/17 | FAIL 8/17 |

סה"כ: 846422a — 447/574 כשלים (97 commit, 20 stage) · c77a909 = 33d5ad0 — 105/591 כשלים (**14 commit**, 17 stage, 74 other/latent).

### harness ראשי (I1–I7 / V12 / Q4), `acc-norm-property.mjs` תחת `unshare -rn`

| תכונה | 846422a | 33d5ad0 (wip) |
|---|---|---|
| I1 (escalation מעל התאום) | FAIL 205/1429 (194 QID-commit) | FAIL 126/1429 (**0 QID-commit**, כולם stage: W2 candidates מול need_context) |
| I2a / I2b | FAIL 375/375 · 871/1041 | FAIL 12/375 · 117/1041 |
| I3 / I3x / CTX / P7 | FAIL 863 · 117 · 20 · 923 | PASS |
| I4 | FAIL 281/910 | FAIL 57/1063 (guard: encoded_double 36, mixed_script 18, compat_fb0b 3 — guard latin כבה בגרסה המוכפלת; ceiling תופס, אין commit) |
| I6 | FAIL 275/348 (134 שורות bad) | FAIL 47/348 — 0 שורות bad; 47 = `wikiExactLatent` (matcher מקבל, השער חוסם) |
| I7 / P5 / V12 | PASS · FAIL 30 · FAIL 14/23 | PASS · PASS · PASS 23/23 |
| P6 | PASS 0/636 | FAIL 28/1112 (keyIdempotent) |

**4 החוסמים שפורסמו קודם — סטטוס על 33d5ad0:**
1. **B1 · I1 capped עוקף תאום נקי (W2):** עדיין פתוח — F5.B1 7/7, F1.greek 3, F2.encoded_double 7, I1 126. כולם **stage** (candidates מול need_context), אף אחד לא commit. נקודת האובדן: `api/lib/orchestrator.js:350-358` `cappedStage` מחזיר `candidates` כשיש כרטיס עם ראיה, גם כשהתאום הנקי היה `need_context` (Smith-guard/HE-guard) — ה-ceiling לא יורש את ה-guard של התאום.
2. **B2 · `Smith`+IBM + wiki Q1701775 ⇒ dossier ללא QID:** **תוקן** ב-c77a909/33d5ad0 (`latin_common_ambiguous`, need_context; V12 S11_3 PASS). על 846422a: commit 2/2.
3. **B3 · I6 joined-title folding (`Vandam`↔`Van Dam`):** commit **תוקן** (`name_not_key_equal`, `commitGate.js:409`); ה-matcher עדיין מקבל — `api/lookup.js:986` `titleExactishOrLatin` / `:960` `softLatinClose` (latent, 6/6 + ed1 4/4). על 846422a: commit 6/6.
4. **B4 · stageB `norm`/`nameTokens` על q גולמי:** דרך ה-handler — **תוקן** (ה-handler מעביר `qc.query`; F5.B4 4/4 PASS). קריאה ישירה עם מחרוזת גולמית עדיין מתפצלת (Q4 בה-harness הראשי: OL-only `John\u200BSmith` מאבד את `John Smith`) — `api/lib/stageB.js:59` `norm` / `:68` `nameTokens` לא קנוניים (latent, defense-in-depth).

### דוגמאות מינימליות שנכשלות על 33d5ad0 (≤3 למשפחה) + נקודת אובדן הסיכון הראשונה

**F1 · confusables מעבר לקירילית**
- `Barack \u0555bama` (Armenian Օ) · none/IBM ⇒ ceiling=`clear`, inputRisk=[] ⇒ W1v: **dossier/Q76** (**commit**). גם `Netanyah\u057D` ⇒ **dossier/Q43723** (commit). `Jo\u0570n Smith` לא מסומן. נקודת אובדן: `api/lib/seedText.js:114-120` `SCRIPT_RES` (Latin/Hebrew/Cyrillic/Greek/Arabic בלבד — אין Armenian) + `:101-111` `SKELETON` (אין מיפוי Armenian) ⇒ אין mixed_script/confusable.
- `\uA4EEssaf Rappaport` (Lisu ꓮ) / Cherokee ⇒ ceiling=`clear` (flag FAIL 4/4). אין commit (known=null), אבל הגבול לא מסמן. אותה נקודה: `seedText.js:114`.
- Greek: flag + no_commit עוברים (16/16). נשאר רק B1 (stage): `J\u03BFhn Smith` none ⇒ candidates מול need_context של `John Smith`.
- **combining Latin:** `John Smi\u0301th` / `Smi\u0301th` / `John Smi\u0301\u0302\u0303\u0304th` ⇒ inputRisk=[non_nfc], ceiling clear ⇒ W1v **dossier/Q990099**, בעוד `John Smith` נקי ⇒ need_context (I1 **commit** 6/16). נקודת אובדן: `api/lib/commitGate.js:125` / `:129` — ה-guard מוחק תווים שאינם `[a-z]` (`smíth`→`smth`) במקום fold דיאקריטי, ולכן `isCommonLatinAmbiguousName` לא נדלק.
- **key_matcher:** `Assaf Rappapo\u0308rt` ⇒ key `assaf rappapört` ⇒ known **Q47507930**, `Me\u0301rkel` ⇒ **Q567** (4/16, **commit** דרך WS/W4). נקודת אובדן: `api/lib/knownIdentities.js:236-237` (`latinFoldIntact`→`latinFold` `:17-18` NFKD + מחיקת `\u0300-\u036f`) — זהות מוכרת נפתרת על key שונה מה-key המוכר. (שאלת חוזה: אם ה-fold הדיאקריטי מכוון לתעתיק, צריך לפחות לא לתת לו לפתוח seed/hydrate.)
- fullwidth (`Ｊｏｈｎ Ｓｍｉｔｈ`, `Ａｓｓａｆ …`) 16/16 מתכנס כולל Smith-guard; niqqud 8/8 מתכנס; mixed-token (`Сара Netanyahu`, `Assafа Rappaport`, `דני Merkel`, `יאיר Netanyahu`, `מישל Obama`) 20/20 מסומן, ללא commit דרך knownIdentities fold / wiki exact-title / wiki_seeded.

**F2 · encoded_double**
- flag + no_commit עוברים 20/20; decode-once 17/17; idempotent (אובייקט, ומחרוזת עם `decode:false`) 17/17.
- `John%2520Smith`, `John&amp;#32;Smith`, `John&amp;nbsp;Smith` · none ⇒ candidates מול need_context (B1, **stage** 7/20).
- **idempotent_string_redecode 8/17 (latent):** `canon("John%2520Smith").key = "john%20smith"`; הזנה מחדש של המחרוזת עם decode ⇒ `"john smith"` וה-ceiling יורד מ-capped ל-clear (`encoded` בלבד). נקודה: `seedText.js:124` `decodePercentOnce` / פענוח entity `:133` מופעלים שוב על מחרוזת שכבר קנונית; כל נתיב שעושה `asCanon(String(...))` על query/label שמור (למשל `orchestrator.js:415` כש-`opts.q` ריק ⇒ `payload.label`) יאבד את ה-cap. לא נצפה commit בתרחישים שלנו. P6 keyIdempotent 28 ב-harness הראשי — אותה מחלקה.

**F3 · default-ignorable בכל שדה ctx** (נאסף מהקוד: `pickContextFrom` `api/lookup.js:2492` ⇒ city, org, role, country, context, phone, email, focus)
- 6 שדות טקסט × 20 סוגי ignorable (ZWSP/ZWNJ/ZWJ/WJ/BOM/SHY/CGJ/U+180E/LRM/RLM/ALM/RLO+PDF/isolates/tag chars/U+2061…): 120/120 PASS + 6/6 slow — לא ב-providedContext, contextUsed, searchQ, cache key, ללא שינוי uiState. intra-word (`I\u200BBM` וכו') 14/14 ⇒ `IBM`, ctxInputRisk מסומן, seed ceiling לא מושפע.
- **phone/email FAIL 38/40 (+2/2 slow):** `דני כהן` + `phone="\u200B"` ⇒ uiState `thin` במקום `need_context`, ו-6 קריאות upstream (orcid/openlibrary/…) שלא קורות בלי ctx; אותו דבר ל-email ול-`Ada Lovelace`. (BOM עובר רק כי `String.trim` מסיר U+FEFF.) לא commit — שחרור guard + fan-out. נקודת אובדן: `api/lookup.js:2498-2499` (`phoneRaw`/`email` רק `trim`) → `api/lib/seedText.js:197` `CTX_FIELDS` לא כולל phone/email → `api/lookup.js:3149` הלולאה מחליפה רק 6 שדות → `:3154` `ctx.any` כולל `phoneRaw || email` גולמיים.

**F4 · SAME-ENTITY / זהות מ-URL-only או דמיון מחרוזת**
- url_only, url_only_no_cand, title_only, label_equals_q, surname_only, fold_foreign, discovery (same URL / same title / joined title): כולם PASS — אין commit ואין SAME-ENTITY.
- joined_title (`Vandam`/`Van Dam`, `rosamendes`, `Annarbor`, `Deluca`, `BenjaminNetanyahu`, `Johnsmith`) ו-ed1 (`John Smyth`, `Ada Lovelac`, `Assaf Rapaport`, `Jon Smith`): commit **PASS**, matcher **FAIL** (latent) — `api/lookup.js:986` `titleExactishOrLatin` / `:960` `softLatinClose` מקבלים; החסימה היחידה היא `commitGate.js:409` `nameKeyEqual` (שכבה אחת).
- QID override: WS (seeded + QID מוכר) עם ceiling capped ⇒ אף פעם לא commit בכל שורות F1/F2 המסומנות (Greek, mixed-token, encoded_double). הדליפה היחידה היא כשה-ceiling בכלל לא מסומן (Armenian, combining — לעיל).

### commit מול stage (33d5ad0)
- **commit (14):** F1.armenian 4 (`Barack Օbama`→Q76, `Netanyahս`→Q43723 ב-W1v), F1.combining_latin:I1 6 (`Smíth`→Q990099 מול need_context נקי), F1.combining_latin:key_matcher 4 (`Rappapört`→Q47507930, `Mérkel`→Q567). כולם נובעים מ-ceiling=`clear` בגבול, לא מעקיפת ceiling פעיל.
- **stage (17):** B1 בלבד (F5.B1 7, F2.encoded_double 7, F1.greek 3) — candidates מול need_context.
- **other / latent (74):** F3 phone/email 40, F2 redecode 8, F4 matchers 10, F1 flag (Armenian 12 + Lisu/Cherokee 4).
- על 846422a (בסיס): 97 commit (כולל P3b `Сара Netanyahu`→Q43723, `John%2520Smith`→Q990099, `Vandam`→dossier, surname-only `Rappaport`→dossier, fullwidth `Ｊｏｈｎ Ｓｍｉｔｈ`→dossier מול need_context נקי).

### הרצה חוזרת (SHA סופי 33d5ad0)
```bash
git -C /workspace/akvot-quick-demo worktree add --detach /workspace/acc-work-33d5ad0 33d5ad0
ln -s /workspace/akvot-quick-demo/node_modules /workspace/acc-work-33d5ad0/node_modules
cd /workspace/akvot-quick-demo
ROOT=/workspace/acc-work-33d5ad0 unshare -rn node test-results/2026-09-24/acc-adversarial-26.mjs --out /tmp/adv-33d5ad0.json
ROOT=/workspace/acc-work-33d5ad0 unshare -rn node test-results/2026-09-24/acc-norm-property.mjs --out /tmp/prop-33d5ad0.json
# ADV_SLOW_HANDLER=0 מדלג על נתיב ה-handler האיטי (Ada Lovelace, ~45s)
git -C /workspace/akvot-quick-demo worktree remove --force /workspace/acc-work-33d5ad0
```
(exit code 1 = יש כשלים; ≈4 דק' לכל harness.)
