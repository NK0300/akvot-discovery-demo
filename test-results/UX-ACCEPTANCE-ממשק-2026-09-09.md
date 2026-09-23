# L6 UX Acceptance — ממשק · 2026-09-09

**SUT:** https://akvot-simple-demo.vercel.app · phase `orchestrator-v0-b`  
**תקן ייחוס:** ISO 25010 (usability) · contract `uiState` מ־RETHINK-ui

## פסק דין L6
**PASS** — 4 מצבי תצוגה חיים, חגורת פנים, שדה מדינה. כשיר לדמו.

## חוזה שנבדק (חי)

| מקרה | uiState צפוי | תוצאה | פנים |
|------|--------------|--------|------|
| בנימין נתניהו | dossier | PASS · Q43723 · confidence high | כן |
| דני כהן | need_context | PASS · common_name | **0** |
| John Smith + org=MIT | candidates | PASS · 6 מועמדים · foreign | 0 |

## כיסוי UI

| פריט | סטטוס |
|------|--------|
| `resolveUiState` + fallback | ✓ |
| `need_context` + מדינה (זרים קודם) | ✓ |
| `candidates` · «זה האדם» · evidence links | ✓ |
| `dossier` · cite-or-drop · chips scenario/confidence | ✓ |
| `thin` refine + מדינה | ✓ |
| חגורת פנים (need_context / confidence=none) | ✓ |
| לא דורסים `uiState=dossier` מפורש | ✓ |
| POST מזהים / GET שם | ✓ (קיים) |
| Cancel / loading לפי תרחיש | ✓ |

## פערים (לא חוסמים דמו)
- אין בדיקות e2e אוטומטיות ל־DOM (רק חוזה API→מצב)
- נגישות: aria חלקי על כרטיסי מועמד
- תחושת מהירות: p50 סוללה עדיין גבוה — UX לא מסתיר, רק מציג שלבים

## KEEP
cite-or-drop · https-only · 0 פנים על שם נפוץ · בקשת הקשר מוקדמת

