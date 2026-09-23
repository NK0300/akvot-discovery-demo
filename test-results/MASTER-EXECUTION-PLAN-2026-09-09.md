# MASTER EXECUTION PLAN · עקבות / akvot-simple-demo · 2026-09-09

**LEAD:** Chief of Staff  
**מקורות:** AUDIT STAGE 0 — שרת · ארכיטקט · ממשק · בודק · דיוק  
**אתר:** https://akvot-simple-demo.vercel.app  
**סטטוס:** ממתין לאישור לפני implementation

## 1. פסק דין
KEEP: כהן bare→need_context+0 פנים · wiki.seeded · A–D · Latin bare מהיר · JSON deadline · 4 מצבי UI · scrub/SSRF/CORS  
P0 פתוח: Smith+ctx / G11-email → dossier+פנים (pretty-wrong)  
מבנה: lookup.js ~4270 LOC · אין adapters · UI דולף Domain · אין CI 12-שער  
עיקרון: Accuracy × Evidence × Reliability × Usability × Speed

## 2. דירוג
### P0
1. Commit gate מפוצל (Smith+ctx, G11)
2. CTA «זה האדם» על ambiguous
3. כפילות COMMON_HE
4. אין חוזה HTTP חוסם ל־Smith+ctx/email בלי faces
### P1
5. חילוץ lookup.js → App/Domain/Infra sources
6. Evidence בלי התאמת ישות
7. UI גוזר uiState במקום DTO
8. Form≠Investigation
9. 12-שער לא ב־CI · אין npm test
10. Cache מקומי · observability חלש
### P2
11. Conflicts/Timeline/Graph/Next/Confidence
12. QID בלי seed ידני
13. מטריצת MASTER §14
### P3 KV cache אחרי P0
### P4 Polish אסור לפני P0–P1

## 3. שלבים
STAGE 1 Architecture (ארכיטקט) — מסמך בלבד  
STAGE 2 UX spec (ממשק) — IA, בלי redesign מלא עד P0  
STAGE 3a P0 Core (שרת+דיוק) — ראשון אחרי אישור: שער commit יחיד; email/phone≠זהות; COMMON_HE מאוחד; חוזה Smith+ctx בלי faces  
STAGE 3b P1 Modularity (שרת+ארכיטקט)  
STAGE 3c P1 Evidence (דיוק+שרת)  
STAGE 4 Testing (בודק) — CI 12-שער  
STAGE 5 Integration (LEAD)

## 4. בעלות
Commit: שרת | Boundaries: ארכיטקט | Copy: ממשק | CI: בודק | Evidence: דיוק | GO: Chief

## 5. לא עכשיו
אין תיקון Smith+ctx לפני אישור · אין rewrite · אין polish · אין 250 · אין Sync.me

## 6. אישור
ממתין ל־GO מ־Nachman. אחרי: STAGE 1 → מיד STAGE 3a P0.
