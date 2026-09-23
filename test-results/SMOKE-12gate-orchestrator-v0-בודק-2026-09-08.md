# SMOKE 12-שער · orchestrator-v0 · בודק · 2026-09-08

**Target:** local `http://127.0.0.1:4011` · `phase=orchestrator-v0`  
**לא פרוד · לא פריסה**  
**כלי:** `test-results/smoke-12gate-orchestrator-v0.mjs` · גולמי `SMOKE-12gate-orchestrator-v0-2026-09-08.json`  
**יחידה (decideStage):** 4/4 PASS

---

## פסק דין

| שער | תוצאה |
|-----|--------|
| חוזה יחידה (need_context מוקדם / evidence-gate / known) | **PASS** |
| בטיחות פנים / scrub / caller-ID (חי) | **14/15 SAFETY** · **0 פנים שגויות** · scrub C חי |
| שער מוצר (uiState נכון) | **11/15 PRODUCT** |
| **פריסה?** | **לא** — רגרסיית **A Known** בעברית (סלבים נופלים ל־`need_context`) |

---

## טבלת שערים (חי)

| שער | מקרה | uiState / scenario | SAFETY | PRODUCT | הערה |
|-----|------|--------------------|--------|---------|------|
| G1 | בנימין נתניהו | dossier→flaky / stranger · qid=- | **FAIL*** | FAIL | *אין פנים שגויות; אין Q43723 — לא dossier יציב |
| G2a | זהבה גלאון | `need_context` / stranger | PASS | **FAIL** | סלב → common_name |
| G2b | Zehava Galon | `need_context` / foreign · src=2 | PASS | **FAIL** | EN גם לא commit |
| G3a | Barack Obama | `dossier` / known Q76 | PASS | **PASS** | |
| G3b | ברק אובמה | `need_context` / stranger | PASS | **FAIL** | HE נכשל כש־EN עובר |
| G4 | דני כהן | `need_context` / stranger | PASS | **PASS** | יעד rethink — KEEP |
| G5 | דני+ת״א+הייטק | `dossier` / stranger · src=6 | PASS | PASS† | †commit בלי QID — לבדוק עם דיוק |
| G6 | John Smith | `need_context` / foreign | PASS | **PASS** | |
| G7 | Smith+IBM+NY+US | `candidates` / foreign · cand=7 src=3 | PASS | **PASS** | evidence-gate חי |
| G8 | Michael Brown | `need_context` / foreign · ~55s | PASS | PASS‡ | ‡עדיין איטי לפני early exit |
| G9 | Assaf Rappaport | `dossier` / known Q47507930 | PASS | **PASS** | |
| G10 | phone fake | `thin` / identifier | PASS | PASS | scrub · אין caller-ID |
| G11 | email fake | `thin` / identifier | PASS | PASS | scrub · 0 פנים |
| G12a/b | junk HE/EN | `need_context` | PASS | soft | עדיף `thin`+`no_public_sources` לא `common_name` |

Retest נקודתי אחרי הסוללה: בבי/גלאון חזרו `need_context` · `messageKey=common_name` · label עם `+` (`בנימין+נתניהו`) — סימן לבעיית נרמול/ויקי לפני השער המוקדם.

---

## מה עובד (KEEP)

1. **Early `need_context` על שם נפוץ בלי הקשר** — דני כהן / John Smith כמצופה (לא רשימת סלבים ריקה).  
2. **Evidence-gate** — Smith+IBM → `candidates` עם מקורות; יחידה דוחה why גנרי.  
3. **C Identifier** — scrub + thin כנה.  
4. **Obama EN / Assaf** — dossier known.  
5. `phase=orchestrator-v0` + שדות `uiState`/`scenario`/`needContextFields` מגיעים ללקוח.

## מה חוסם פריסה (IMPROVE / BLOCK)

1. **A Known HE נשבר:** נתניהו / גלאון / אובמה-HE → `need_context` או dossier בלי QID כש־wiki softAmbiguous/נכשל. Early exit מתייחס לסלב כ«שם נפוץ».  
2. **Zehava EN** גם `need_context` בסבב הזה (לא יציב מול baseline קודם Q2630062).  
3. **Junk → `common_name`** במקום thin — קוסמטי אבל מטעה.  
4. **G5 dossier בלי QID** על דני+הקשר — בטיחותית 0 פנים פה, אבל commit בלי זהות חזקה דורש עיני @דיוק.

## המלצה לצוות

- **@ארכיטקט / @שרת:** early `need_context` רק אחרי ש־wikiPath סיים *בלי* exact/rich hit; אל תסווגו softAmbiguous לפני ניסיון HE exact לסלב. תקנו נרמול `+` ב־label.  
- **@ממשק:** מסך need_context מוכן לבדיקה על דני/Smith — לא על נתניהו.  
- **@דיוק:** תעיין ב־G5 (dossier stranger + 6 sources על דני+ctx).  
- **@בודק:** אחרי תיקון A — אריץ מחדש אותו 12-שער; **פריסה רק כש־G1+G2+G3b PRODUCT PASS**.

**בלי פריסה.**
