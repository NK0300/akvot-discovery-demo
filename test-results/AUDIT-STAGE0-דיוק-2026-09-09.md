# AUDIT STAGE 0 — דיוק · entity resolution + evidence + FP · 2026-09-09

STATUS: complete (read-only · STOP)  
SUT: akvot-simple-demo · dpl_5N3G · phase orchestrator-v0-b  
מקורות: ציבוריים בלבד · לא Sync.me / Truecaller

## FINDINGS
1. **KEEP בטיחות שם נפוץ HE:** דני כהן → need_context + 0 פנים; bypass רק `wiki.seeded`.
2. **KEEP Latin bare (#1):** John Smith / Emily bare → need_context מהיר — מונע רשימות ויקי היסטוריות «יפות».
3. **P0 pretty-wrong (פתוח):** Smith+IBM+NY (params) → **dossier · Q1701775 · פנים** במקום candidates עם ראיות (בודק SMOKE). זה over-commit זהות.
4. **P0 G11-email CRIT:** John Smith + email → dossier Q332377 + פנים — מזהה (email) מטופל כאילו הוכיח זהות.
5. **שער commit מפוצל:** `canCommitWithoutFocus` / `evidenceScore` ב־Domain, אבל `lookup.js` עדיין יכול לסיים ב־wikiCommitted/rich לפני evidence-gate אחיד; `wikiCommitted=true` ו־`focus=true` עוקפים threshold.
6. **evidenceScore חלש:** סופר hosts + התאמת מחרוזת org/city — קל לניפוח מוויקי/דף לא קשור; אין דרישת מקור בלתי־תלוי + התאמת ישות.
7. **כפילות מדיניות:** `COMMON_HE_SURNAMES` ב־orchestrator וב־lookup — סחיפת שערי FP.
8. **קריטריונים קיימים:** `BATTERY-250-criteria-דיוק.md` + `expectPrecise` — הראנר עדיין soft; לא חוסם pretty-wrong.

## RISKS
1. **P0** — תיק+דיוקן על אדם לא נכון = אמון שבור (גרוע יותר מ־thin).
2. **P0** — email/phone כ־strongId / ctxAny → commit או דה־גיטימציה של need_context.
3. **P1** — Smith+ctx flaky (need_context vs dossier) מסתיר באג ברגרסיה.
4. **P1** — seed ידני מצמצם FP על סלבים אבל לא מכסה זרים; #2 חייב evidence לא seed-רק.

## RECOMMENDATIONS
1. **P0** — שער commit יחיד: dossier/פנים רק `wiki.seeded` **או** evidenceScore≥T עם ≥2 מקורות בלתי־תלויים שתואמים org/city — **לא** email/phone לבדם.
2. **P0** — חוזה דיוק נעול ל־release: Smith+ctx → candidates|need_context (בלי faces); Smith+email → thin|need_context|candidates בלי dossier+faces.
3. **P1** — לחזק evidence: התאמת ישות (שם+org באותו מקור) לפני commit; אסור wiki-homonym commit.
4. **P1** — לאחד COMMON_HE ל־orchestrator בלבד; `expectPrecise` ב־judge אחרי STOP.
5. **P2** — #2 QID recovery: רק עם אימות תווית/alias — לא QID ראשון תחת 429.

## FILES
`api/lib/orchestrator.js` · `api/lookup.js` · `BATTERY-250-criteria-דיוק.md` · `BATTERY-250-list.json` · `SMOKE-foreign-path-בודק-2026-09-09.md`

## DEPENDENCIES
Wiki/Wikidata · Gemini (bias בלבד) · registries ציבוריים · בלי Sync.me/Truecaller

## TESTS
חסר: contract HTTP על Smith+ctx / G11-email בלי faces · unit על commit gate ב־lookup · שיפוט לפי expectPrecise

## BLOCKERS
STOP עד MASTER EXECUTION PLAN מ־Chief of Staff · pretty-wrong מתועד — **לא מתקנים עכשיו**
