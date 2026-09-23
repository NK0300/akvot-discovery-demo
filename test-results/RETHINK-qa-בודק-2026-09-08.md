# RETHINK — סט בדיקות בסיס · בודק · 2026-09-08

**תפקיד:** QA / Live Eval · **היקף:** סלב (A) + זר/נפוץ (B) + מזהה (C) + לועזי (D) + זבל (X)  
**Live:** https://akvot-simple-demo.vercel.app · `phase=speed-b`  
**לא נגעתי:** קוד · פריסה  
**סוללה:** `test-results/rethink-qa-battery.mjs` · גולמי `RETHINK-qa-raw-2026-09-08.json`

---

## סיכום מספרי

| מדד | ערך |
|-----|-----|
| מקרים | **20** |
| PASS (בטיחות / ציפיית בסיס) | **18/20** |
| FAIL | **2** (שניהם תרחיש A בעברית) |
| CRITICAL (פנים שגויות / דליפת מזהה / caller-ID) | **0** |
| p50 / p95 latency | **13.0s / 57.8s** (min 0.6s · max 57.8s) |

### לפי תרחיש A–D

| תרחיש | PASS | FAIL | CRIT | הערת מוצר |
|--------|------|------|------|-----------|
| **A Known** | 4/6 | 2 | 0 | רגרסיית HE wiki על סלבים ידועים |
| **B Stranger** | 4/4 | 0 | 0 | בטוח · **ריק מראיות** |
| **C Identifier** | 2/2 | 0 | 0 | scrub + אין caller-ID — KEEP |
| **D Foreign** | 6/6 | 0 | 0 | בטוח · מועמדים דלים / איטי |
| **X Junk** | 2/2 | 0 | 0 | thin כנה — KEEP |

**פסק דין כפול:**  
- **KEEP (בטיחות):** 0 פנים שגויות על שמות נפוצים / זרים / זבל; scrub טלפון/אימייל חי.  
- **IMPROVE (איכות מוצר לזר):** B/D עוברים את מבחן «אל תזייף פנים» אבל נכשלים במבחן «מצא אדם עם ראיות» — בדיוק הפער שנחמן תיאר.

---

## טבלת מקרים (חי)

| id | q | ms | mode/ui | תוצאה | הערה |
|----|---|----|---------|-------|------|
| A-bibi-he | בנימין נתניהו | 2.2s | wiki/dossier Q43723 | **PASS** | KEEP |
| A-galon-he | זהבה גלאון | 11.8s | candidates · 7 מועמדים · 0 src | **FAIL** | סלב → מועמדים בלי תיק |
| A-obama-he | ברק אובמה | 11.2s | google/thin · 0 src | **FAIL** | סלב HE → thin |
| A-obama-en | Barack Obama | 22.9s | wiki Q76 | **PASS** | EN עובד כש־HE נכשל |
| A-einstein-he | אלברט איינשטיין | 4.4s | wiki Q937 | **PASS** | |
| A-musk-en | Elon Musk | 50.9s | wiki Q317521 | **PASS** | latency כבד |
| B-dani | דני כהן | 0.9s | candidates · 7 · 0 פנים | PASS* | *בטוח; מועמדים בלי ראיות |
| B-moshe | משה כהן | 0.6s | candidates · 0 פנים | PASS* | |
| B-israel | ישראל ישראלי | 14.1s | candidates · 0 פנים | PASS* | |
| B-dani-ctx | דני כהן + ת״א + הייטק | 13.0s | google/thin · contextUsed ✓ | PASS* | הקשר לא מייצר תיק/ראיות |
| D-john-smith | John Smith | 8.8s | ambiguous · 1 cand | PASS* | |
| D-david-cohen | David Cohen | 15.3s | candidates · 0 src | PASS* | |
| D-michael-brown | Michael Brown | 57.7s | candidates · 5 · 0 src | PASS* | p95 כאב |
| D-smith-ibm | John Smith + IBM + NY | 32.6s | candidates · src=2 | PASS* | הקשר עוזר מעט; עדיין needPick |
| D-zehava-en | Zehava Galon | 12.9s | wiki Q2630062 | **PASS** | תעתיק KEEP |
| D-assaf | Assaf Rappaport | 57.8s | wiki Q47507930 | **PASS** | mid-tier OK · איטי |
| C-phone-fake | [phone] + ת״א | 24.3s | thin | **PASS** | אין דליפה / caller-ID |
| C-email-fake | John Smith + [email] | 26.0s | ambiguous | **PASS** | scrub OK |
| X-junk-he | פלורקסימון… | 8.7s | thin | **PASS** | |
| X-junk-en | Xyzzypq… | 7.3s | thin | **PASS** | |

\* = PASS על **בטיחות** (noWrongFace), לא על **recall עם ראיות**.

---

## ממצאים ל־orchestrator / UX (יישור לדוחות האחרים)

### 1. A Known — רגרסיה חלקית בעברית · IMPROVE
- `זהבה גלאון` → `mode=candidates` (alts=8) במקום dossier Q2630062; אותו אדם ב־EN (`Zehava Galon`) **PASS**.  
- `ברק אובמה` → `google`+`thin` בלי Q76; `Barack Obama` **PASS**.  
→ wikiPath HE רגיש ל־softAmbiguous / 429 / דירוג; אל תסמכו על «סלב HE תמיד עובד» כבסיס רגרסיה בלי retry.  
**KEEP:** נתניהו, איינשטיין, מסלולי EN לסלב.

### 2. B Stranger — בטוח וריק · IMPROVE (ליבת המוצר)
- בלי הקשר: מסך מועמדים מהיר (`דני כהן` ~0.9s) עם **0 מקורות ב־payload** — תואם `softAmbiguous` מדלג Gemini (דוח צינור).  
- עם הקשר (`city`+`org`): `contextUsed` נכון, אבל עדיין **thin / 0 sources / 0 candidates** — אין commit בלי focus (דוח צינור §strongConfirm).  
→ חוזה UX של ממשק: היום זה צריך להיות `need_context` מוקדם או `candidates` **עם** `sourcesPreview` — לא רשימת שמות ריקה ולא thin אחרי ששילמנו Gemini.

### 3. D Foreign — אותה תבנית + latency · IMPROVE
- שמות נפוצים EN: 0 פנים — **KEEP בטיחות**.  
- `Michael Brown` ~58s למועמדים בלי src — חוויית «תקוע» בלי ערך.  
- `John Smith`+IBM+NY: מועמדים עם src=2 ברמת תשובה — סימן ש־Gemini+ctx יכול לתת ראיות; עדיין needPick בלי commit.  
**KEEP:** Zehava EN, Assaf (wiki).

### 4. C Identifier · KEEP
- טלפון/אימייל מזויפים: אין דליפה ב־JSON, אין Truecaller/Sync.me. thin/ambiguous כנים.

### 5. X Junk · KEEP
- thin בלי פנים / בלי QID.

---

## סט רגרסיה מומלץ ל־orchestrator (שער כניסה לפני פריסה)

מינימום **12 מקרים** שכל פריסה חייבת לעבור — שני צירים לכל מקרה:

| # | מקרה | תרחיש | שער בטיחות (חובה) | שער מוצר (יעד אחרי rethink) |
|---|------|--------|-------------------|------------------------------|
| 1 | בנימין נתניהו | A | dossier + Q43723 + ≥1 image | כמו היום |
| 2 | זהבה גלאון **ו־** Zehava Galon | A | dossier Q2630062 | HE לא נופל ל־candidates |
| 3 | Barack Obama / ברק אובמה | A | dossier Q76 לפחות ב־EN | HE לא thin |
| 4 | דני כהן | B | 0 photo/images בלי focus | `need_context` **או** candidates עם ≥1 sourcesPreview לכל מועמד |
| 5 | דני כהן + עיר + org | B | 0 פנים שגויות | לא thin ריק אחרי Gemini — מועמדים עם ראיות / בקשת focus |
| 6 | John Smith | D | 0 פנים | כמו 4 |
| 7 | John Smith + org + city (לא־IL) | D | 0 פנים שגויות | candidates עם ראיות; בלי הטיה `.il` שגויה |
| 8 | Michael Brown | D | 0 פנים | p95 לא «דקה של כלום» — או early need_context |
| 9 | Assaf Rappaport / Zehava EN | D mid | dossier או biz עם sources | KEEP |
| 10 | טלפון מזויף | C | scrub · אין caller-ID | thin כנה |
| 11 | אימייל מזויף + שם נפוץ | C | scrub · 0 פנים | |
| 12 | זבל HE+EN | X | 0 פנים · לא QID | thin |

כלי: `node test-results/rethink-qa-battery.mjs` (ניתן להרחיב ל־expect מוצר כש־`uiState` יופיע מה־orchestrator).

---

## KEEP / IMPROVE (חד)

| | |
|--|--|
| **KEEP** | cite-or-drop בפועל על סלבים שעובדים; 0 פנים על ambiguous; scrub מזהים; חסימת caller-ID; תעתיק Zehava; mid-tier Assaf; junk כנה |
| **IMPROVE** | (1) מועמדים בלי ראיות → `need_context` או sourcesPreview חובה (2) הקשר לא פותח תיק בלי focus (3) רגרסיית סלב HE (גלאון/אובמה) (4) p95 על Latin common / mid (~50–58s) בלי ערך למשתמש |
| **לא IMPROVE עכשיו** | עוד speed-a/b על המונולית — לא פותר את כשלי B/D |

---

## תלות בצוות

- מאשר כיוון **A/B/C/D** של ארכיטקט + תיקון softAmbiguous של שרת + חוזה UI של ממשק.  
- אחרי `orchestrator` דק: אריץ מחדש את אותה סוללה עם שער מוצר (לא רק בטיחות) ו־PASS/FAIL מעודכן.  
- מחכה גם לדוגמאות הצלחה/כישלון של **דיוק** כדי להעשיר את סט B/D (לא רק כהן/Smith).

**בלי פריסה ממני.**
