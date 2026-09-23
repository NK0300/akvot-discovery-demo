# RETHINK — דיוק · דיוק · 2026-09-08

**תפקיד:** Accuracy (דיוק) · **היקף:** תרחישי **B Stranger** + **D Foreign** בלבד  
**Live:** https://akvot-simple-demo.vercel.app · `phase=speed-b` · נוקאש  
**מקורות:** ציבוריים בלבד · **לא** Sync.me / Truecaller / caller-ID  
**לא נגעתי:** קוד · פריסה  
**ראיות:** סוללת live 10 שאילתות (`RETHINK-accuracy-live-lines.jsonl`) + QA בודק + smoke היסטורי (false-positive)

---

## סיכום מנהלים

1. **בטיחות פנים ב־speed-b על B/D — טובה:** שמות נפוצים לא מקבלים דיוקן בלי בחירה. זה KEEP מול רגרסיות ישנות.
2. **דיוק מוצר (למצוא את האדם הנכון עם ראיות) — חלש:** B בלי הקשר = רשימת ויקי־סלבים עם אותו שם; נראה כמו בחירה, אבל זה לא האדם הזר.
3. **הקשר ב־B נשרף בלי תועלת:** `דני כהן` + ת״א + Check Point → Gemini ~24s → **אותם** מועמדי ויקי, `sources=[]` ב־payload, `enrich=0`. `strongConfirm` חוסם תיק בלי focus.
4. **D עם הקשר חזק — הצלחה חלקית:** `John Smith`+IBM+NY ו־`Emily Chen`+Stanford מעלים מועמדים עם מקורות אמיתיים (IBM Research / Stanford) — אבל עדיין `needPick`, בלי commit.
5. **D בלי הקשר — פירושונים היסטוריים:** John Smith / Michael Brown = פוליטיקאים מהמאה ה־19–20. Precision למשתמש שמחפש עמית חי ≈ 0.
6. **תעתיק / mid-tier Latin שעובד:** Zehava Galon, Angela Merkel, Assaf Rappaport → dossier ויקי תקין. זה לא מכסה «זר לא־מפורסם».
7. **False-positive הקלאסי (pretty wrong):** בגרסאות קודמות המערכת *התחייבה* לשופט/מהנדס על «משה/דני כהן» עם פנים. היום נמנעים מזה — אבל ה־UI עדיין מזמין לבחור את אותו סלב בטעות.
8. **יעד דיוק:** `need_context` מוקדם **או** `candidates` עם ראיות שמתאימות להקשר — לא ויקי־siblings כתשובה לזר.

---

## דוגמאות הצלחה B (Stranger)

| # | שאילתה | מצב שנצפה | למה זה הצלחה לדיוק |
|---|--------|-----------|-------------------|
| B✓1 | `שרה כהן` | `google` / **thin** · 0 פנים · 0 src · ~10s | **לא המציאה תיק.** שם נפוץ בלי ערך חד־משמעי → ריק כנה. עדיף על dossier מזויף. |
| B✓2 | `דני כהן` (בלי הקשר) | `candidates` · 7 · **0 פנים** · ~1s | **לא התחייבה לפנים.** softAmbiguous מדלג Gemini — נכון לבטיחות. (ראה כישלון מוצר למטה על *איכות* המועמדים.) |
| B✓3 | `משה כהן` | `candidates` · 6 · 0 פנים · ~0.8s | כמו B✓2 — אין commit שגוי. אל מול רגרסיית round2 שהתחייבה ל־Q6639789 שופט. |
| B✓4 | `ישראל ישראלי` (מ־QA) | `candidates` · 0 פנים | שם־בדיחה / נפוץ — לא ננעל על QID מזויף; 0 פנים. |

> הצלחות B היום הן בעיקר **«לא שיקרנו»**, לא **«מצאנו את האדם»**. זה הסף הנמוך.

---

## דוגמאות כישלון B

| # | שאילתה | מצב | כשל דיוק | סוג סיכון |
|---|--------|-----|----------|-----------|
| B✗1 | `דני כהן` | candidates · alts כוללים **«דני בריאן»**, מדען/מתופף/צלם | מועמדים = **סלבים עם אותו שם**, לא «האדם שלי». SCORE 0.78 + why «תפקיד: מדען מחשב» נראה אמין. | **False choice** — pretty list, wrong population |
| B✗2 | `דני כהן` + עיר ת״א + org **Check Point** + role מהנדס | candidates · **זהה ל־B✗1** · timings: wiki 0.6s · **gemini 24s** · enrich 0 · payload `sources=0` | שילמנו Gemini; ההקשר **לא שינה** את רשימת המועמדים ולא יצר evidence ל־Check Point. `strongConfirm` דורש focus/QID. | **Context wasted** + missing evidence |
| B✗3 | `משה כהן` | candidates · שופט/זמר/הנריקז… | כמו B✗1. היסטורית (live-round2): **commit** ל־`משה כהן (שופט)` Q6639789 + photo — **pretty wrong dossier**. | FP רגרסיה · היום מופחת ל־pick-risk |
| B✗4 | `דני כהן` + חיפה (smoke ישן) | google · extract על מדען 1937–2019 · **פנים** · תמונות Cohn-Bendit ברשימה | תיק «יפה» על אדם אחר + רעש תמונות. `thin:true` אבל עם photo/extract — מסוכן למשתמש. | **Pretty-wrong dossier** |
| B✗5 | שם נפוץ בלי הקשר → UI candidates | אין `need_context` | החוזה של ממשק דורש בקשת הקשר מוקדמת; היום מקבלים רשימה ריקה־מראיות־רשת. | חוזה UI שבור |
| B✗6 | `דני כהן`+הייטק+ת״א (QA) | google/**thin** · contextUsed ✓ · 0 src | הקשר מסומן בשימוש אבל אין תיק ואין מועמדים עם ראיות — משתמש חושב «אין כלום» אחרי ששילם המתנה. | Recall failure אחרי הקשר |

### ניתוח false-positive (B) — חד

- **Pretty list:** כרטיסי מועמד עם why תפקיד מוויקי + `sourcesPreview` לויקי־סלב = נראה כמו בחירה מושכלת. למשתמש שמחפש עובד הייטק לא־מפורסם — **כל בחירה היא אדם לא נכון**.
- **Pretty dossier (legacy):** commit ל־QID הראשון/העשיר על שם כהן = זהות שגויה עם דיוקן. speed-b מפחית; **אסור להחזיר commit אוטומטי על common-name בלי focus או evidence≥T**.
- **רעש alts:** `דני בריאן` על שאילתת `דני כהן` — partial-token; מסיט בחירה.

---

## דוגמאות הצלחה D (Foreign)

| # | שאילתה | מצב | למה הצלחה |
|---|--------|-----|-----------|
| D✓1 | `Zehava Galon` | **wiki** Q2630062 · photo · ~15 src · ~1.6s | תעתיק Latin→HE עובד. KEEP. |
| D✓2 | `Angela Merkel` | **wiki** Q567 · photo · 20 src · ~28s | סלב זר EN → dossier תקין. |
| D✓3 | `Assaf Rappaport` | **wiki** Q47507930 · photo · 6 src · ~3.7s | mid-tier / biz-ish עם QID — dossier. KEEP (latency משתנה בין ריצות). |
| D✓4 | `John Smith` + org **IBM** + city **New York** | candidates · **src=3** · מועמד #1 `John R. Smith - IBM Research` score 0.95 · קישורי research.ibm.com + Scholar | **ראיות אמיתיות מותאמות להקשר** — זה הכיוון הנכון ל־D. עדיין בלי commit (needPick). |
| D✓5 | `Emily Chen` + Stanford + Palo Alto | candidates · src=5 · פרופיל Stanford QFARM / student spotlight | כמו D✓4 — אשכול ראיות לא־IL, לא הטיה `.il` בולטת בתוצאה. |
| D✓6 | `John Smith` / `Michael Brown` (בלי הקשר) | candidates · **0 פנים** | לא ננעלים על פנים של פוליטיקאי אקראי. בטיחות ✓ (איכות מועמדים ✗ — ראו כישלון). |

---

## דוגמאות כישלון D

| # | שאילתה | מצב | כשל דיוק | סוג סיכון |
|---|--------|-----|----------|-----------|
| D✗1 | `John Smith` | candidates · mayor / Mississippi politician / physician היסטוריים | Precision למשתמש מודרני ≈ 0. רשימה «יפה» של אנשים מתים/לא רלוונטיים. | False choice · wiki-history bias |
| D✗2 | `Michael Brown` | candidates · פוליטיקאים AU/CA/US + disambig · לעיתים ~50–58s (QA) | אותו דפוס + latency כואב בלי ערך. | Slow empty value |
| D✗3 | `John Smith`+IBM+NY | candidates עם ראיות טובות אבל **אין dossier** בלי focus | המשתמש רואה את האדם הנכון בראש הרשימה — אבל החוזה לא מאפשר commit מ־evidence. | Evidence gate חסר |
| D✗4 | Latin mid-tier איטי / timeout (Matti Friedman ב־pipeline smoke) | timeout 55s / wikiPath יקר | אמינות: זר «כמעט מפורסם» נופל לפני מוצר. | Reliability |
| D✗5 | `googlePath` + `pagePreferScore` | קוד: `gov.il` +4.5 · `.il` +2 · פרומפט «העדף … gov.il … .il» | לשאילתת US/EU דירוג מקורות **מפלה**. סיכון ש־Gemini ימשוך `.il` לא רלוונטי או יחליש LinkedIn/company זר. | IL bias |
| D✗6 | Diaspora / שם Latin נפוץ בלי מדינה | אין שדה country · אין locale routing | אי אפשר לדייק בין David Cohen IL / UK / US. | Missing locale |

### ניתוח false-positive (D)

- **Wiki siblings ≠ האדם שלי:** בחירת `John A. Smith (Mississippi politician)` על שאילתת עמית ב־IBM היא FP מוחלט גם אם הקישור ויקי «אמיתי».
- **Partial success trap:** D✓4 מפתה — מועמד #1 נכון־לכאורה; בלי `evidenceScore` + commit policy, המשתמש עלול גם לבחור את כרטיס ה־disambiguation ליד.
- **IL bias pretty-wrong:** תיק google לזר עם מקורות `.il` חלשים / לא קשורים = נראה «מבוסס» ושונה מהאמת.

---

## המלצות מוצר / אלגוריתם לדיוק

מיושר ל־A→B→C→D של מבנה + חוזה UI (`need_context|candidates|dossier|thin`).

### Orchestrator
1. **B בלי `ctx.any`:** החזר `uiState=need_context` (שדות: עיר/ארגון/**מדינה**/תפקיד) — **לא** רשימת ויקי־סלבים כתשובה יחידה. אופציה: candidates רק אם מסומנים `kind=wiki_famous_homonym` + CTA «לא האדם — הוסיפו הקשר».
2. **B/D עם הקשר:** אחרי Gemini/B-registries — אם יש ≥1 אשכול עם org|city match ו־≥2 https — אפשר **`candidates` עם evidence** או **commit dossier** כש־`evidenceScore ≥ T` (לא רק `focus`).
3. **הרחבת `strongConfirm`:** `focus | wiki.qid חד־משמעי | evidenceScore≥T` (org+city ב־≥2 מקורות בלתי־תלויים).
4. **D Latin:** locale-aware `googlePath` — בלי הטיה קשיחה ל־`.il`; `pagePreferScore` לפי שפת שאילתה + `country` מההקשר.

### softAmbiguous
5. **KEEP** דילוג Gemini + 0 פנים בלי הקשר.
6. **IMPROVE** אחרי/במקביל: שלב discovery (ORCID/VIAF/OL/NLI) או Gemini **רק עם ctx** — ומועמדים חייבים לשקף את תוצאות הרשת, לא רק alts ויקי ישנים (כשל B✗2).
7. סינון `buildCandidates`: זרוק partial-token (`דני בריאן`); אל תציג EN disambig היסטורי כ־primary ל־stranger חי.

### Evidence gate
8. **candidates** רק אם לכל מועמד ≥1 `sourcesPreview.url` **רלוונטי להקשר** (או תג מפורש `wiki_homonym`).
9. **dossier** רק אחרי commit; **thin** אחרי הקשר בלי ראיות — לא hybrid עם photo+extract.
10. מדד רגרסיה לדיוק (לא רק noWrongFace): B+ctx חייב `candidates_with_context_evidence` או `need_context`/`thin` כנה — **אסור** «אותם alts אחרי 24s Gemini».

---

## KEEP vs IMPROVE

| | |
|--|--|
| **KEEP** | 0 פנים על softAmbiguous בלי focus · cite-or-drop · scrub מזהים · חסימת Sync.me/Truecaller · תעתיק Zehava · mid-tier Assaf/Merkel dossier · thin כנה על `שרה כהן` · forceGoogle=phone\|email\|focus (org לא כופה commit) |
| **IMPROVE** | (1) `need_context` במקום wiki-homonym-as-answer (2) הקשר משנה מועמדים / מאפשר evidence-commit (3) סינון alts רועשים (4) locale score ל־D (5) p95 Latin בלי «דקה של פוליטיקאים מתים» (6) חוזה `uiState` מפורש |
| **לא עכשיו** | עוד SPEED על המונולית · החזרת Gemini על כל softAmbiguous בלי הקשר · מאגרי caller-ID |

---

## מה לא לעשות

- **לא** Sync.me / Truecaller / Getcontact / כל caller-ID.
- **לא** לנחש זהות / פנים בלי מקורות ציבוריים (cite-or-drop נשאר קדוש).
- **לא** commit אוטומטי ל־QID «הכי עשיר» על שם נפוץ.
- **לא** להציג dossier חלול «כדי לא להיראות ריק».
- **לא** לבלבל הצלחת בטיחות (0 פנים) עם הצלחת דיוק (האדם הנכון + ראיות).

---

## נספח — Live battery 2026-09-08 ~00:24–00:28 Asia/Jerusalem

| id | q (+ctx) | ms | mode | photo | src | cands | הערת דיוק |
|----|----------|----|------|-------|-----|-------|-----------|
| B1 | דני כהן | 1.0s | candidates | 0 | 0 | 7 | בטוח · homonym trap |
| B2 | משה כהן | 0.8s | candidates | 0 | 0 | 6 | בטוח · homonym trap |
| B3 | דני כהן · ת״א · Check Point | 29s | candidates | 0 | 0 | 7 | **Gemini 24s ללא שינוי מועמדים** |
| B4 | שרה כהן | 10s | google/thin | 0 | 0 | 0 | thin כנה ✓ |
| D1 | John Smith | 2.9s | candidates | 0 | 0 | 7 | היסטוריה לא רלוונטית |
| D2 | John Smith · NY · IBM | 20s | candidates | 0 | 3 | 5 | ראיות IBM ✓ · בלי commit |
| D3 | Zehava Galon | 1.6s | wiki | ✓ | 15 | 0 | dossier ✓ |
| D4 | Angela Merkel | 28s | wiki | ✓ | 20 | 0 | dossier ✓ |
| D5 | Emily Chen · Stanford · Palo Alto | 23s | candidates | 0 | 5 | 7 | ראיות Stanford ✓ |
| D6 | Michael Brown | 4.8s | candidates | 0 | 0 | 7 | disambig היסטורי |
| + | Assaf Rappaport | 3.7s | wiki Q47507930 | ✓ | 6 | 0 | mid-tier ✓ |

גולמי: `test-results/RETHINK-accuracy-live-lines.jsonl`

---

*סוכן דיוק · live speed-b + ניתוח קוד softAmbiguous/strongConfirm/pagePreferScore · בלי פאץ׳ / בלי דיפלוי*
