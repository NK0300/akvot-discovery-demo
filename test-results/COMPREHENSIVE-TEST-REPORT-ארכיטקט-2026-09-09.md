# דוח בדיקות מקיף · עקבות (akvot-simple-demo) · ארכיטקט

**תאריך:** 2026-09-09 (Asia/Jerusalem)  
**SUT:** https://akvot-simple-demo.vercel.app · קוד `/workspace/akvot-quick-demo`  
**פריסה מאומתת (RETEST):** `dpl_CHsC8R2jLVxvkYCkGpFiZgTifjgU` · phase `orchestrator-v0-b`  
**מתודולוגיה:** שכבות בדיקה לפי ISTQB / ISO/IEC 29119 (יחידה → אינטגרציה → מערכת → קבלה) + OWASP ASVS קל ל־API ציבורי  
**בעלים לדוח:** ארכיטקט · מקורות נתונים: בודק · דיוק · שרת · ממשק · סמוק חי נוכחי

---

## 1. מטרה והיקף

| | |
|--|--|
| **מטרה** | לאמת שהמערכת עומדת בחוזה מוצר A–D, בטיחות זיהוי (בלי pretty-wrong), אבטחת API בסיסית, וביצועים סבירים ל־demo |
| **בהיקף** | `api/lookup.js`, `api/lib/orchestrator.js`, `api/lib/stageB.js`, `index.html`, פרוד Vercel |
| **מחוץ להיקף** | Sync.me / Truecaller / caller-ID פרטי · בדיקות עומס מלאות (k6/Gatling) · אבטחת חשבון משתמש (אין auth) |
| **סביבות** | יחידה מקומית · סמוק מקומי/פרוד · סוללת 250 על פרוד |

### תרחישי מוצר (חוזה)

| קוד | תרחיש | uiState צפוי |
|-----|--------|--------------|
| **A** Known | סלב / QID | `dossier` |
| **B** Stranger | שם נפוץ / זר HE | `need_context` → `candidates`/`thin` עם הקשר |
| **C** Identifier | טלפון/אימייל | `thin` + scrub · בלי caller-ID |
| **D** Foreign | Latin / מדינה | `need_context` / `candidates` עם evidence |

---

## 2. מפת שכבות בדיקה (תקן עולמי)

| שכבה | מה רץ | סטטוס | מדד |
|------|--------|--------|------|
| **L1 יחידה** | `api/lib/orchestrator.test.mjs` | **32/32 PASS** (2026-09-09) | חוזה decideStage / evidence / common-HE / attach |
| **L2 אינטגרציה** | SMOKE 12-שער orchestrator-v0 | היסטורי: SAFETY 14/15 · PRODUCT 11/15 (לפני תיקוני seed) | חוזה UI חי מול pipeline |
| **L3 מערכת (פרוד)** | סוללת 250 + RETEST 54 | **196/250** ואז **55/55** על כושלים | famous/obscure/nonexist |
| **L4 קבלת מוצר** | famous×5 + דני כהן | **5/5 + Danny PASS** | שער פריסה ≥4/5 |
| **L5 אבטחה** | CSP/headers · SSRF allowlist · scrub · cite-or-drop · ban Truecaller | מיושם ב־`vercel.json` + lookup | ASVS L1 חלקי |
| **L6 UX** | 4 מצבים + מדינה + חגורת פנים | מאושר ממשק | אין באג דחוף |
| **L7 דיוק** | `BATTERY-250-criteria-דיוק.md` | קריטריונים מחמירים מול ראנר רך | pretty-wrong = FAIL |

---

## 3. תוצאות מפורטות

### 3.1 יחידה (L1) — ארכיטקט · 2026-09-09

```
32 passed, 0 failed
```

כיסוי: classifyScenario A–D · evidence-gate · evidenceScore/commit · common-HE bare · strip photo על need_context · google recovery בלי QID ≠ known · rich בלי QID ≠ known.

**רגרסיה שתוקנה היום:** שער `isCommonHeBareName` היה מאפשר dossier על QID שגוי (דני כהן+Q999). חוזה מחודש: **רק `wiki.seeded` עוקף** (אורלי לוי / עמיר פרץ). תיקון ב־`api/lib/orchestrator.js` — **טרם בפריסה** עד GO מ־Chief.

### 3.2 סמוק 12-שער (L2) — בודק · 2026-09-08 (לפני seed+JSON-deadline)

| | |
|--|--|
| SAFETY | 14/15 · **0 פנים שגויות** |
| PRODUCT | 11/15 |
| BLOCK אז | A Known HE (נתניהו/גלאון/אובמה-HE → need_context) |

**הערה:** אחרי תיקוני seed + RETEST — famous×5 ו־8 famous מהסוללה עברו. ה־12-שער **לא הורץ מחדש** על הפריסה הסופית; מומלץ כרגרסיה קבועה.

### 3.3 סוללת 250 (L3) — בודק

#### ריצת GO מלאה (`dpl_GQfRg…`)

| מדד | ערך |
|-----|-----|
| Pass | **196/250 (78.4%)** |
| Fail | 54 = **46 INFRA_JSON** + **8 מוצר** (famous→need_context) |
| p50 / p95 | ~46s / ~60s |
| famous | 49/71 |
| obscure | 102/120 |
| nonexist | 45/59 |

בלי infra באותה ריצה: famous **49/57** · obscure **102/102** · nonexist **45/45**.

#### RETEST כושלים (`dpl_CHsC8…`)

| | |
|--|--|
| **55/55 PASS** | 8/8 famous מוצר · 46/46 INFRA · דני control |
| מסקנה | כל מקרי הסוללה שנכשלו — ירוקים על הפריסה החדשה |

### 3.4 שער קבלה famous×5 (L4)

| מקרה | ui | qid | faces | תוצאה |
|------|-----|-----|-------|--------|
| בנימין נתניהו | dossier | Q43723 | כן | PASS |
| יאיר לפיד | dossier | Q1396120 | כן | PASS |
| גדעון סער | dossier | Q966349 | כן | PASS |
| מנחם בגין | dossier | Q130873 | כן | PASS |
| Giorgia Meloni | dossier | Q451791 | כן | PASS |
| דני כהן (בקרה) | need_context | — | לא | PASS |

**GO ready:** כן (≥4/5).

### 3.5 דיוק / זרים (L7) — דיוק

- קריטריוני PASS/FAIL ב־`BATTERY-250-criteria-דיוק.md` (מחמיר מ־runner soft).
- בטיחות כהן + סלב→dossier עומדים על פרוד אחרי RETEST.
- פער ידוע: runner ≠ `expectPrecise` — מומלץ שדרוג judge.

### 3.6 אבטחה (L5) — סטטוס ארכיטקטורי

| בקרה | מצב |
|------|------|
| CSP + X-Frame-Options DENY + nosniff + Referrer-Policy | ב־`vercel.json` |
| SSRF: `assertSafePublicHttpsUrl` / allowlist registries | כן |
| scrub טלפון/אימייל בטקסט ו־URL | כן |
| cite-or-drop לעובדות Gemini | כן |
| ban Truecaller/Sync.me | כן (בסיס) |
| CORS `*` / rate-limit API ציבורי | **חוב ידוע** (סיכון עלות/abuse) |
| מפתח Gemini ב־query (ממצא סקירה ישן) | נדרש אימות שלא חזר |

### 3.7 UX (L6) — ממשק

4 מצבים (`need_context` / `candidates` / `dossier` / `thin`) + מדינה + חגורת פנים חיים בפרוד. אין באג UX דחוף.

---

## 4. כיסוי מול דרישות מוצר

| דרישה | ראיה | פסק |
|--------|------|------|
| A Known → dossier+QID | famous×5 · RETEST×8 | **PASS** על פרוד נוכחי |
| B Stranger bare → need_context + 0 פנים | דני/משה כהן | **PASS** |
| Evidence-gate על candidates | יחידה + G7 Smith+IBM | **PASS** (יחידה ירוק) |
| C Identifier scrub | G10/G11 · קריטריוני דיוק | **PASS** בסמוקים |
| D Foreign בלי IL-bias אוטומטי | קריטריונים + battery obscure | **חלקי** — תלוי judge |
| אין pretty-wrong על שם נפוץ | שער common-HE + יחידה | **PASS** חוזה; תיקון seeded טרם deploy |
| יציבות תחת wiki 429 | seed QID + JSON deadline ~45s | **PASS** ב־RETEST |

---

## 5. סיכונים וחוב טכני (Residual)

| עדיפות | פריט | המלצה |
|--------|------|--------|
| **P0** | תיקון `wiki.seeded` ביחידה — **לא בפריסה עדיין** | @שרת + GO @Chief לפרוס לפני סוללה הבאה |
| **P1** | p50~46s בסוללה | תקציב זמן / פחות Gemini לפני commit |
| **P1** | אין rate-limit על API ציבורי | הגבלה בסיסית / מפתח demo |
| **P2** | 12-שער לא הורץ מחדש אחרי dpl_CHsC8 | רגרסיה קבועה (famous×10+obscure×10+דני) במקום 250 בכל פריסה |
| **P2** | soft runner ≠ expectPrecise | שדרוג judge לדיוק |
| **P3** | monolith `lookup.js` ~4.1k שורות | המשך פיצול stageB/orchestrator בלבד — בלי מיקרו־אופטימיזציות |

---

## 6. פסק דין כולל

| שאלה | תשובה |
|------|--------|
| האם המערכת **כשירה לדמו** על פרוד הנוכחי? | **כן** — famous ירוק, כהן בטוח, RETEST 55/55 |
| האם עומדת ב־«תקן עולמי» מלא (עומס/אבטחה מלאה/E2E אוטומטי CI)? | **חלקי** — יש שכבות L1–L4 חזקות; חסר CI ירוק קבוע, rate-limit, ו־E2E 12-שער בכל פריסה |
| GO לפריסת תיקון seeded היום? | מומלץ **כן** אחרי famous×5 smoke מ־@בודק |
| GO לסוללת 250 מלאה חדשה? | **לא חובה** עד מדגם/פיצ׳ר חדש (כפי שסגר Chief) |

### ציון איכות משוקלל (הערכה ארכיטקטורית)

| מממד | ציון (1–5) | הערה |
|------|------------|------|
| נכונות A Known | 5 | אחרי seed+RETEST |
| בטיחות B/זרים | 5 | common-HE + 0 פנים |
| Evidence / cite | 4 | חוזה חזק; judge רך |
| ביצועים | 3 | p50 גבוה בסוללה |
| אבטחת API | 3.5 | CSP/SSRF/scrub כן; rate-limit לא |
| תחזוקה / מבנה | 3.5 | orchestrator+stageB; monolith עדיין גדול |
| **ממוצע** | **~4.0** | דמו מוכן · מוצר production-grade עדיין לא |

---

## 7. ארטיפקטים

- `EIGHT-HOUR-SUMMARY.md`
- `BATTERY-250-prod-GO-בודק-2026-09-08.md` / `.json`
- `RETEST-fails54-בודק-2026-09-08.md`
- `PILOT-famous5-בודק-2026-09-08.md`
- `BATTERY-250-criteria-דיוק.md`
- `SMOKE-12gate-orchestrator-v0-בודק-2026-09-08.md`
- `api/lib/orchestrator.test.mjs` → 32/32
- דוח זה: `COMPREHENSIVE-TEST-REPORT-ארכיטקט-2026-09-09.md`

---

## 8. המלצות מיידיות לצוות

1. **@שרת + @Chief:** לפרוס תיקון `wiki.seeded` בשער common-HE (כבר ביחידה).  
2. **@בודק:** אחרי פריסה — famous×5 + דני + 12-שער קצר (לא 250).  
3. **@דיוק:** לאשר ש־expectPrecise על מדגם 25 מכסה pretty-wrong.  
4. **@ממשק:** אין חסימה; לוודא need_context בלי פנים אחרי הפריסה.  
5. **כולם:** לא לפתוח סבב SPEED חדש — החוזה A–D נעול.

---

*סוף דוח · ארכיטקט · 2026-09-09*

---

## נספח A · סמוק חי פרוד · 2026-09-09 ~00:04 IDT

**phase:** `orchestrator-v0-b` · raw: `COMPREHENSIVE-smoke-2026-09-09.json`

| מקרה | HTTP | ms | uiState | qid | faces | תוצאה |
|------|------|-----|---------|-----|-------|--------|
| בנימין נתניהו | 200 | 4771 | dossier / known | Q43723 | כן | **PASS** |
| יאיר לפיד | 200 | 1652 | dossier / known | Q1396120 | כן | **PASS** |
| דני כהן | 200 | 200 | need_context / stranger | — | לא | **PASS** |
| John Smith | 200 | 33199 | need_context / foreign | — | לא | **PASS** |
| 0500000000 POST | 200 | 1385 | thin / identifier | — | לא | **PASS** (scrub · callerLeak=false) |

**Headers:** CSP+HSTS+DENY+nosniff ✓ · API CORS origin-locked (evil → 403) · static CORS `*`  
**שערי A/B/C:** **GO** · 5/5 PASS  
**הערה:** John Smith איטי (~33s) אבל התנהגות נכונה.
