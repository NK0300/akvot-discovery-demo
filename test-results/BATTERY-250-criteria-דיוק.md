# BATTERY-250 — קריטריוני PASS/FAIL לדיוק (Accuracy)

**בעלים:** דיוק · **תאריך:** 2026-09-08 · **רשימה:** `BATTERY-250-list.json`  
**מאזן קנוני:** famous **71** / obscure **120** / nonexist **59** (=250)  
**מקורות מותרים:** ציבוריים בלבד · **אסור:** Sync.me / Truecaller / caller-ID / טלפונים פרטיים  
**אורקסטרטור:** מיושר ל־`orchestrator-v0` (`need_context` | `candidates` | `dossier` | `thin` + evidence-gate)

> **פער ראנר:** `run-battery-250.mjs` שופט **ברכות** (famous: dossier|candidates|wiki… ; obscure: כמעט כל uiState; nonexist: בעיקר «בלי פנים»).  
> **דיוק** שופט לפי `expectPrecise` + מסמך זה — **מחמיר יותר**. PASS בראנר ≠ PASS לדיוק.

**שליחת שאילתה היום:** הראנר שולח רק `q` (בלי `city`/`org`/`country` מ־`context`). הקשר לזרים לעיתים **מגולל בתוך `q`**. שדה `context` שמור להרצה עתידית.

---

## 1. לפי באקט

### famous (71) — תרחיש A
| | |
|---|---|
| **PASS** | `uiState` ∈ {`dossier`,`wiki`,`wiki+google`} עם זהות נכונה; או `candidates` עם האדם הנכון **בראש** + QID/לייבל תואם. Evidence נדרש (מקורות ויקי/רשת). |
| **FAIL** | `need_context` מוקדם שחוסם ידוע HE/EN · תיק שגוי / QID לא נכון · `thin` בלבד · pretty-wrong dossier |
| **KEEP** | תעתיק mid-tier (למשל Zehava Galon / זהבה גלאון) אם dossier נכון |

### obscure (120) — תרחישים B / D
| | |
|---|---|
| **PASS** | `need_context` מוקדם **או** `candidates` עם evidence תואם הקשר **או** `thin` כנה. `dossier` רק אם evidence≥T (org/city/country ב־≥2 מקורות / `canCommitWithoutFocus`). |
| **FAIL** | auto-commit לפנים/dossier של סלב־הומונים · empty dossier · רשימת ויקי־סלבים/היסטורית כ«הצלחה» יחידה לזר מודרני בלי הקשר · pretty list שמוזמן לבחור אדם לא נכון |
| **הערה** | הצלחת «לא שיקרנו» (0 פנים) = סף בטיחות מינימלי; דיוק דורש גם איכות מועמדים / בקשת הקשר |

### nonexist (59)
| | |
|---|---|
| **PASS** | `thin` / `need_context` / `candidates` **בלי** פנים מפוברקות |
| **FAIL** | dossier+photo · QID מפוברק · תיק «יפה» על שם סינתטי |

---

## 2. לפי תרחיש (A / B / C / D)

| תרחיש | משמעות ברשימה | PASS לדיוק | FAIL |
|--------|----------------|------------|------|
| **A** | ידוע (famous) | dossier/wiki מדויק; אסור לחסום ב־need_context | wrong QID, pretty-wrong, thin-only |
| **B** | זר/שם נפוץ (obscure, לרוב HE) | need_context בלי ctx **או** candidates+evidence; בלי commit לסלב | wiki-homonym list כהצלחה; FP dossier |
| **C** | מזהה (אין כמעט ב־full הנוכחי; אם יתווסף) | scrub לזדוני; מזהה ציבורי רק אם fixture; סינתטי→thin/scrub | חשיפת PII פרטי; Sync.me/Truecaller |
| **D** | foreign Latin / עם עיר־תפקיד בשאילתה | כמו B + בלי הטיה IL; evidence לא־`.il` כשלא רלוונטי; תעתיק mid-tier KEEP | historical disambig לבד כהצלחה לזר חי; משיכת `.il` לשאילתת US/EU |

---

## 3. False-positive / pretty-wrong

הגדרה: תשובה **נראית אמינה** אבל **לא האדם** שהמשתמש חיפש.

- **Pretty dossier:** commit ל־QID עשיר/ראשון על שם נפוץ (כהן/Smith) = **FAIL** תמיד.
- **Pretty list:** כרטיסי ויקי־סלב עם `why` תפקיד בלי evidence להקשר = לא נספר כהצלחת דיוק ל־obscure (גם אם הראנר מסמן pass).
- **Partial-token noise:** מועמד עם שם חלקי לא תואם (למשל «דני בריאן» על «דני כהן») = רעש מזיק.
- **nonexist יפה:** כל photo/QID על בדוי = FAIL קריטי.

---

## 4. זרים (foreign) — כללים מיוחדים

1. **`il_bias_risk`:** שאילתת US/EU/אסיה לא אמורה «להימשך» ל־`.il` / gov.il כמקור מוביל בלי סיבה.
2. **תעתיק KEEP:** Latin↔HE על mid-tier מפורסם (Galon, Rappaport, Herzog…) → dossier נכון = PASS.
3. **שם Latin נפוץ חשוף** (John Smith, Michael Brown):  
   - רשימת פוליטיקאים היסטוריים **לבד** ≠ הצלחה לזר מודרני.  
   - PASS: `need_context` (עם מדינה) **או** candidates עם evidence מודרני תואם `context`.
4. **diaspora / Cohen+IBM+Haifa:** סיכון כפול (IL + common) — evidence חייב להתאים org/city; לא סלב כהן אקראי.
5. **הקשר מגולל ב־`q`:** היום הראנר לא שולח `context` נפרד; דיוק עדיין מצפה שהמערכת תנצל רמזי עיר/org מתוך המחרוזת או תבקש need_context.

דגלים נפוצים ברשימה: `foreign`, `latin`, `diaspora`, `il_bias_risk`, `transliteration`, `common_name`, `needs_context`, `wiki_exact`, `mid_tier`, `adversarial`, `synthetic`.

---

## 5. Evidence-gate ו־need_context (orchestrator-v0)

1. **B/D בלי הקשר + softAmbiguous:** `uiState=need_context` מוקדם — **PASS לדיוק** (עדיף על רשימת סלבים).
2. **Candidates:** רק עם evidence-gate (≥1 `https` ב־`sourcesPreview` או why ספציפי — לא ברירת מחדל גנרית).
3. **Commit dossier:** `focus` **או** `evidenceScore≥T` / `canCommitWithoutFocus` — לא auto על common-name.
4. **אחרי הקשר:** אם שולם Gemini/חיפוש — המועמדים חייבים לשקף את ההקשר; אותו wiki-homonym list = FAIL מוצר (גם אם בטיחותית «בלי פנים»).

---

## 6. מה הראנר בודק היום מול דיוק

| באקט | `run-battery-250.mjs` (רך) | דיוק (מחמיר) |
|------|---------------------------|---------------|
| famous | ui ∈ dossier\|candidates\|wiki\|… | זהות נכונה + עדיף dossier/wiki; candidates רק אם האדם הנכון בראש; QID אם ידוע ב־`expectPrecise` |
| obscure | כמעט כל ui / mode | need_context \| candidates+evidence \| thin; dossier רק עם evidence; לא wiki-history כהצלחה לזר |
| nonexist | בעיקר «אין faces» (או need_context/thin/candidates) | אותו + אין QID מפוברק + אין pretty dossier |

`BATTERY-250-runner.mjs` מחמיר יותר במקצת על famous (דורש dossier+qid) ועל nonexist (אין qid) — עדיין **לא** בודק `expectPrecise.must_not` / IL-bias / historical-disambig.

---

## 7. איך לקרוא תוצאה

1. הרץ ראנר → raw JSON (pass רך).  
2. סנן לפי `expectPrecise` + דגלים (במיוחד `foreign`, `common_name`, `adversarial`).  
3. FP/pretty-wrong = FAIL לדיוק גם אם latency מעולה ו־runner.pass=true.  
4. אל תשנה את מאזן 71/120/59 ואל תחליף באקטים ל־`known_he` וכו׳ — זה שובר את הראנר.

---

## 8. קבצים

- רשימה: `/workspace/akvot-quick-demo/test-results/BATTERY-250-list.json`
- מקור קנוני: `BATTERY-250-list.full.json`
- גיבוי רשימה שבור (סכמה ישנה): `BATTERY-250-list.overwritten-backup.json`
- ראנר: `run-battery-250.mjs` · `BATTERY-250-runner.mjs`
