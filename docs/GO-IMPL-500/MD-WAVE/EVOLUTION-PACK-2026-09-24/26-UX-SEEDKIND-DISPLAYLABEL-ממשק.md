# §26 — UX: seedKind מפורש בבקשה + displayLabel מה־Registry — ממשק · 2026-09-24

סטטוס: client בלבד · `?v=c1m4` · נעילות: NO PROMOTE · אין deploy/Preview · אין flags · INFORMATION≠IDENTITY · C1.
בסיס: `6d70bc2` (§25 v1.2) מעל `a78e39c` (Registry capabilities).

## מה
1. **`seedKind` בגוף הבקשה** (`POST /api/discovery/sessions`), רק כשהמשתמש לחץ במפורש על toggle (או על chip דוגמה שמסמן את ה־toggle באופן גלוי), ורק אם הערך ∈ {`person`, `organization`} (lowercase, התאמה מדויקת).
   - לפני: `{seed, q, locale, hints?}`.
   - אחרי: `{seed, q, locale, hints?, seedKind?}`. בלי בחירה מפורשת, המפתח **לא קיים** (לא null ולא מחרוזת ריקה).
   - `hints` עוברים allow-list (`org|city|site`). לעולם לא נשלחים `type`, `entityType` או `hints.seedClass`.
   - נוסף toggle **«אדם»** (`data-seed-kind="person"`). «שם» (`name`) נשאר ברירת המחדל ו**אינו** ממופה ל־person, כי שם מוסדי בעברית ≠ אדם (§25 §0).
   - הסקה אוטומטית (`applySeedKindHint`: URL/דומיין) לא נחשבת בחירה מפורשת. אם היא מזיזה את ה־toggle הלחוץ, לא נשלח `seedKind`.
2. **תווית משפחה:** הסדר הוא `displayLabel {he,en}` מה־payload → `FAMILY_LABEL_*` → id גולמי.
   - מקורות: `plan.families[i]` כאובייקט, `familyJournal[i].displayLabel`, `f.sourceFamily.displayLabel`, `f.familyDisplayLabel`. ה־`displayLabel` של הממצא עצמו **לא** משמש, כי הוא עלול להיות שם הישות.
   - guard זהות (גיבוי ל־Registry): אם באחת השפות מופיע `מאומת|מאומתת|זהה|זהות|אומת|verified|confirmed|same|identical|identity`, התווית נזרקת. תקרת אורך: 48. תמיד `esc()`.
   - התווית היא שם מקור בלבד. היא לא נוגעת ב־status, ב־UNKNOWN, ב־identityClaim או ב־relationship.

## למה
§25 v1.2 קבע את `seedKind` כמקור override יחיד מוצהר. slice B של השרת צורך אותו. ה־Registry מצהיר `displayLabel` נקי.

## קבצים
`discovery-ui.js` (אזור `§25-client:begin/end`) · `index.html` (toggle «אדם» + `?v=c1m4`) · `scripts/ux-mission-stage-smoke.mjs` (+32 בדיקות). אין שינוי ב־Core, ב־Registry, ב־Policy או ב־providers.

## בדיקות
- mission-stage smoke: 77/0 (45 קודמות + 32 חדשות: היעדר מפתח, org/person, זבל, מפתחות סיווג, displayLabel/guard/raw/escape).
- יתר ה־UX smokes (c/j/k/l/l4/m): ירוקים. `npm test`: 0 fail.
- בדיקה בדפדפן (fetch stub): ללא לחיצה → `{seed,q,locale}` · ארגון → `+seedKind:"organization"` · אדם → `+seedKind:"person"` · «שם» → ללא מפתח · ארגון + URL (הסקה) → ללא מפתח.
- parity golden `bb3a7f6` על worktree נקי של הקומיט: זהה (אין שינוי Core).
