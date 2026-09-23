# VERIFY · dpl_9V8i · בודק · 2026-09-09

**זמן:** 2026-09-09 12:31:24 IDT Asia/Jerusalem  
**סוכן:** בודק  
**יעד:** QA verification על NEW prod deploy  
**Deploy נטען:** `dpl_9V8iig4PLALA4t7V7hNNQFo8Q3az`  
**Alias:** https://akvot-simple-demo.vercel.app  
**Workspace:** `/workspace/akvot-quick-demo`  
**לא שינינו** לוגיקת api · **לא deploy**

---

## VERSION / BUILD / COMMIT (best effort)

| שדה | ערך |
|-----|-----|
| VERSION / phase | `orchestrator-v0-b` (מתוך JSON תשובת `/api/lookup`) |
| BUILD / deployment | `dpl_9V8iig4PLALA4t7V7hNNQFo8Q3az` |
| COMMIT | **null** — `vercel inspect` ללא `gitSource`/`meta` (העלאת CLI) |
| Ready / target | READY · production |
| Host URL | `akvot-simple-demo-jkq83wqnv-k-akvot.vercel.app` |
| נוצר | 2026-09-09 12:20:48 IDT |
| Aliases | `akvot-simple-demo.vercel.app`, `akvot-simple-demo-k-akvot.vercel.app` |

### Runtime verify
- `vercel ls` / `vercel inspect dpl_9V8i…` → READY, alias מצביע לדיפלוי החדש
- Sample lookup נתניהו: HTTP 200 · `phase=orchestrator-v0-b` · `uiState=dossier` · `qid=Q43723` · faces=true
- `x-vercel-id` לדוגמה: `cle1::fra1::wvq4c-1788946047520-7c76e31b2f3a` · `x-vercel-cache: MISS`
- **אין** אזכור / messaging של `dpl_5N3G` בגוף התשובות (כל 6 המקרים)
- כל מקרי הסמוק החזירו `phase=orchestrator-v0-b`

---

## TESTS

### 1) Domain units
```
node api/lib/orchestrator.test.mjs
→ 46 passed, 0 failed  EXIT=0
```
**PASS 46/46**

### 2) Contract identity-p0
BASE=`https://akvot-simple-demo.vercel.app`  
שיטה: harness HTTP שקול ל־`test-results/contract-identity-p0.mjs` (שיפוט זהה; הרצת node הישירה נחסמה ב־runner של הסוכן)

| # | מקרה | ui · mode · qid · faces | ms | תוצאה |
|---|------|-------------------------|-----|--------|
| a | בנימין נתניהו | dossier · wiki+google · Q43723 · פנים | 6606 | **PASS** |
| b | דני כהן | need_context · ambiguous · — · 0 | 351 | **PASS** |
| c | John Smith bare | need_context · ambiguous · — · 0 | 5925 | **PASS** |
| d | Smith+IBM+NY+US | candidates · candidates · — · 0 (7 cand) | 10369 | **PASS** (לא dossier+faces) |
| e | Smith+email G11 | candidates · candidates · — · 0 (6 cand) | 9807 | **PASS** (לא dossier+faces; אין email בגוף) |

**PASS 5/5** · IMPROVE=0

### 3) SAFETY smoke (HTTP e2e, sequential)

| מקרה | ui | mode | qid | faces | ms | תוצאה |
|------|----|------|-----|-------|-----|--------|
| בנימין נתניהו | dossier | wiki+google | Q43723 | כן | 6606 | **PASS** |
| דני כהן | need_context | ambiguous | — | 0 | 351 | **PASS** |
| John Smith bare | need_context | ambiguous | — | 0 | 5925 | **PASS** |
| Smith + org=IBM + city=NY + country=US | candidates | candidates | — | 0 | 10369 | **PASS** |
| Smith + email | candidates | candidates | — | 0 | 9807 | **PASS** (email לא בגוף) |
| אורלי לוי (אופציונלי) | dossier | wiki+google | Q466537 | כן | 6773 | **PASS** |

**PASS 6/6** (ליבה 5/5 + אופציונלי)

---

## PASS/FAIL

| שכבה | תוצאה |
|------|--------|
| Runtime / deploy match | **PASS** — alias → dpl_9V8i… · phase=orchestrator-v0-b · לא תקוע על dpl_5N3G |
| Units | **PASS 46/46** |
| Contract | **PASS 5/5** |
| SAFETY | **PASS 6/6** |
| **Overall QA slice** | **GREEN** |

---

## LATENCY

| מקרה | ms |
|------|-----|
| נתניהו | 6606 |
| דני כהן | 351 |
| Smith bare | 5925 |
| Smith+ctx | 10369 |
| Smith+email | 9807 |
| אורלי לוי | 6773 |
| ליבה min/max/sum | 351 / 10369 / 33058 |

---

## KNOWN RISKS
- Latin bare (John Smith) עדיין ~6ש — רצפת ויקי ידועה (P1 מהירות), לא כשל בטיחות
- Smith+ctx / email ~9–10ש — בסדר לסמוק, לא שערי ביצועים לשחרור
- אין metadata של git commit בדיפלוי (העלאת CLI) — COMMIT=null
- הרצה אחת סדרתית — לא flaky re-run, לא 12-gate מלא, לא battery-250
- סקריפט `node test-results/contract-identity-p0.mjs` לא רץ ישירות בסביבת הסוכן (binding); אומת ב־harness שקול
- **זה QA slice בלבד — לא שערי שחרור סופי**

---

## סיכום עברית (לחדר)

אימות QA על הדיפלוי החדש `dpl_9V8iig4PLALA4t7V7hNNQFo8Q3az` (alias prod) — **GREEN**.  
יחידות Domain **46/46**, חוזה זהות **5/5**, סמוק בטיחות **6/6** (כולל אורלי לוי).  
`phase=orchestrator-v0-b` בכל התשובות; **לא** תקוע על `dpl_5N3G`.  
נתניהו dossier Q43723 עם פנים; דני כהן / Smith bare → need_context בלי פנים; **P0** Smith+IBM+NY+US → **candidates** בלי פנים; **G11** Smith+email → **candidates** בלי פנים ובלי דליפת אימייל.  
סיכון ידוע: ~6ש ל־Latin bare ו־~10ש ל־ctx/email — לא חוסם את פרוסת ה-QA. COMMIT לא זמין מה-CLI.

**Overall: GREEN** (QA slice only).

---
raw JSON: `test-results/VERIFY-dpl9V8i-בודק-2026-09-09.json`
