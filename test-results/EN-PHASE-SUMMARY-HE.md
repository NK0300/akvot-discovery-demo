# Phase EN-B — סיכום לנחמן

**פרוד:** https://akvot-simple-demo.vercel.app  
**דיפלוי אחרון:** `dpl_5EkoTGDF5YXd94hmVhmwYKZmzQxV` · phase=`en-b`  
**סוללה:** round1 **34/37** → אחרי תיקון+retest ממוזג **37/37 PASS** (0 FAIL קריטיים פתוחים)

## מה תוקן
1. **שמות EN/Latin** — דילוג על חיפוש HE ראשון; Wikidata + EN wiki + sitelink HE
2. **דף פירושונים EN** — John Smith / David Cohen → מסך מועמדים (בלי דיוקן שגוי)
3. **תעתיק IL** — Zehava Galon / Zahava Gal-On → wiki Q2630062
4. **ראשי מפורסם** — Michael Jordan נשאר Q41421 (לא false-ambiguous)
5. **org/email** — לא מורידים תיק wiki חד־משמעי למסך מועמדים
6. **429/latency** — פחות קריאות HE; Obama לא נופל ל־candidates בגלל "Barack Obama Sr."
7. **UI** — placeholder HE/EN + רמז באנגלית לשם נפוץ
8. **טלפון** — scrub + חסימת caller-ID apps נשמרו

## דגימות
| מקרה | תוצאה |
|------|--------|
| Barack Obama | wiki Q76 |
| Zehava Galon / Zahava Gal-On | wiki Q2630062 |
| Benjamin Netanyahu | wiki Q43723 |
| Elon Musk / Tim Cook / Mark Zuckerberg | wiki |
| John Smith / Michael Brown / James Wilson | candidates · 0 פנים |
| David Cohen | candidates · 0 פנים |
| Xyzzypq Blorfnak (זבל) | thin · 0 פנים |
| Obama + White House | wiki (לא demote) |
| דני כהן (ביקורת HE) | candidates |

## Retest (כשלונות round1)
| מקרה | אחרי תיקון |
|------|-------------|
| wiki-obama | PASS wiki Q76 |
| ctx-obama-org | PASS wiki Q76 |
| mid-bennett | PASS wiki Q39318 |
| +8 בקרות | **11/11 PASS** |

## כללים שנשמרו
- מקורות פומביים בלבד · אין caller-ID apps · אין הדפסת API keys · scrub טלפון/אימייל

## הערת latency
חלק מהשאילתות עדיין 40–60ש תחת Wikimedia 429 — התיק נפתר נכון; אין timeout קריטי פתוח אחרי retest.
