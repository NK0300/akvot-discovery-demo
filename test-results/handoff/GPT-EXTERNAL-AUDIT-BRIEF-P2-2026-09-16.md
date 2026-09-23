# עקבות / akvot-simple-demo — Brief לביקורת חיצונית (GPT)

**תאריך:** 2026-09-16  
**מצב:** P2 RELEASED · MAINTENANCE  
**Prod:** https://akvot-simple-demo.vercel.app  
**Baseline:** `dpl_CrsqeSQX1GAhi1VFExVsGwdsSYHt` (RC `dpl_HVGb86Qrxe9Ztte3ESMCc7F3tnHk`)  
**מוצר:** מנוע OSINT ציבורי — טריגר (שם/אימייל/טלפון) → `need_context | candidates | dossier | thin`

---

## מה לבקש מ־GPT (הדבק גם את זה)

אתה מבקר מוצר+הנדסה חיצוני. אל תשכתב קוד. תן:

1. **5–10 דגשים אסטרטגיים** לסבב הבא (P3) — מה הכי שווה, מה מסוכן.
2. **סיכוני pretty-wrong** שנותרו (זהות משכנעת אבל שגויה) — איפה המערכת עדיין פגיעה.
3. **פערי כיסוי בבדיקות** (GET vs POST, nested ctx, Latin near-miss, common names).
4. **חובות ארכיטקטורה** (מונולית lookup, SoT commit gate, seeds, observability).
5. **המלצת סדר עדיפויות** ל־2 שבועות: Must / Should / Later — בלי פיצ'רים קוסמטיים.

כללים שאי אפשר לשבור: `pretty-wrong=0` · שער commit יחיד · threshold 0.75 · אין Sync.me/Truecaller · מקורות ציבוריים בלבד · UX CTA רך («בחר כמועמד להמשך»).

---

## מה המוצר עושה

- חיפוש אדם מטריגר → אורקסטרציה (wiki / enrich / evidence) → UI state.
- **dossier** = התחייבות זהות (עם QID/faces) — רק דרך `mayCommitDossier` / `canCommitIdentity`.
- שמות נפוצים (כהן, John Smith) חייבים `need_context|thin|candidates` — **לא** dossier.
- סלבים / unique Latin (Assaf Rappaport) → dossier עם QID כשיש seed/wikiExact תקין.

---

## מה נסגר עד עכשיו

### P1 (קודם)
- שער commit יחיד ב־Domain · COMMON_HE מרוכז · CTA רך.
- Baseline ישן הוחלף; recall לכינויים/תעתיק (ביבי, Merkel, גלאון…).

### P2 (סגור 2026-09-15) — GREEN
| נושא | תוצאה |
|------|--------|
| Assaf Rappaport / אסף רפפורט | dossier `Q47507930` |
| Smith+IBM+NY+US (GET+POST nested ctx) | candidates · לא `Q1701775` |
| John Rappaport (T-C6 near-miss) | need_context · qid=null · לא Assaf |
| כהן | need_context\|thin · 0 faces |
| health + requestId | קיים |
| CTA | «בחר כמועמד להמשך» · אין «זה האדם» |
| Evidence | suite+reg Preview PASS · alias smoke PASS · Acc pw=0 |

### באגים שנלמדו בדרך (חשוב לביקורת)
1. **GET≠POST:** ctx ב־POST כ־`{q, ctx:{…}}` nested לא נפרס → pretty-wrong זמני על Smith+US.
2. **wikiExact surname bleed:** `John Rappaport` → QID זר; ננעל ב־`isSeedAdjacentLatinNearMiss`.
3. **Flake:** אותו מקרה לפעמים candidates ולפעמים dossier לפני הנעילות.
4. **כיסוי בדיקות:** חייבים POST nested + country=US + near-miss Latin — לא רק GET smoke.

---

## SoT / אילוצים קשיחים

- `mayCommitDossier` יחיד · threshold **0.75** · אין הורדה.
- אימייל/טלפון ≠ הוכחת זהות.
- Smith-class: לעולם לא dossier בלי seed/focus.
- אין `if (q === 'Assaf…')` — רק class-level.
- UX FREEZE אלא אם contract נשבר.

---

## מה עדיין פתוח / חלש (לבקש דגשים עליהם)

1. **Latency** — נמדד חלקית (Smith ~3s / +ctx ~6s / Assaf ~6s על baseline ישן); אין יעד p50/p95 סגור ולא אופטימיזציה שיטתית אחרי הנעילות.
2. **evidenceScore** — עבר ל־token/boundary, אבל עדיין צריך ביקורת: האם org/city מספיק חזק מול URL noise.
3. **מונולית `lookup.js`** + זיווג UI↔Domain.
4. **Observability** — health/requestId בסיסי; חסרים metrics/SLO/alerting.
5. **כיסוי Latin mid-tier** מעבר ל־Assaf/Matti — class expansion בזהירות.
6. **health.build hint** לפעמים מציג id ישן — לא חוסם אבל מבלבל.
7. **Vercel Deployment Protection / promote cards** — חיכוך תהליך, לא באג מוצר.
8. **P2-E02** (Emily Chen-class) — soft FAIL layer/OTHER בהיסטוריה; לא PW אבל recall דק.

---

## קבצים מומלצים לצרף ל־GPT (אם יש מקום)

עדיפות גבוהה:
- `handoff/P2-BOUNDARIES-ארכיטקט-2026-09-15.md`
- `handoff/P2-CASES-דיוק-2026-09-15.md`
- `handoff/P2-REGRESSION-CASES-בודק-2026-09-15.md`
- `handoff/EVIDENCE-dplHVGb-בודק-2026-09-15.md`
- `ALIAS-SMOKE-dplCrsqe-בודק-2026-09-15.md`
- `ALIAS-SMOKE-ACC-dplCrsqe-דיוק-2026-09-15.md`
- `handoff/P2-FIX-POST-CTX-שרת-2026-09-15.md`
- `handoff/P2-FIX-T-C6-RAPPAPORT-שרת-2026-09-15.md`

אם רק טקסט אחד — **הקובץ הזה מספיק** + הפרומפט בסעיף הראשון.

---

## פרומפט מוכן להדבקה

```
אני בונה את עקבות — מנוע OSINT ציבורי (עברית+Latin). המערכת ב־MAINTENANCE אחרי P2 GREEN על prod.

כללים שאי אפשר לשבור: pretty-wrong=0, שער commit יחיד threshold 0.75, אימייל/טלפון≠זהות, מקורות ציבוריים בלבד, CTA רך.

מה נסגר ב־P2: Assaf→dossier Q47507930; Smith+ctx GET+POST→לא dossier; John Rappaport near-miss→need_context; כהן בטוח; health+requestId; suite/reg/alias smoke ירוקים.

באגים שלמדנו: POST nested ctx לא נפרס; surname bleed ב־wikiExact; flake GET/POST; חורי כיסוי בבדיקות.

תן לי: (1) 5–10 דגשים אסטרטגיים ל־P3 (2) סיכוני pretty-wrong שנותרו (3) פערי בדיקות (4) חוב ארכיטקטורה (5) Must/Should/Later לשבועיים. בלי קוד מלא — רק דגשים וסדר עדיפויות.
```
