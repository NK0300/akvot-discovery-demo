# SMOKE A-retest · אחרי FIX-need-context-order · בודק · 2026-09-08

**Target:** local `:4011` · `phase=orchestrator-v0` · אחרי פאץ׳ שרת (wikiExact לפני need_context)  
**גולמי:** `SMOKE-A-retest-2026-09-08.json`

## תוצאה: **2/6 PRODUCT PASS** · 0 פנים שגויות · **עדיין לא לפריסה**

| שער | uiState / scenario / qid | תוצאה |
|-----|--------------------------|--------|
| G1 נתניהו | dossier / **stranger** / — · mode=google · 8 imgs | **FAIL** — תיק בלי Q43723 |
| G2a גלאון HE | need_context / stranger · label `זהבה+גלאון` | **FAIL** |
| G2b Zehava EN | dossier / known / Q2630062 | **PASS** |
| G3a Obama EN | need_context / foreign · label `Barack+Obama` | **FAIL** (רגרסיה מול סבב קודם) |
| G3b אובמה HE | need_context / stranger | **FAIL** |
| G4 דני כהן | need_context / stranger | **PASS** (B לא נשבר) |

## מסקנה
סדר `decideStage` לבד לא מספיק — `wikiPath` עדיין לא מחזיר exact/QID יציב לסלבים (וגם `+` ב־label). B (`דני`) נשאר נכון.  
**פריסה: לא.** צריך תיקון wiki exact / 429 / נרמול לפני G1+G2+G3 PASS.
