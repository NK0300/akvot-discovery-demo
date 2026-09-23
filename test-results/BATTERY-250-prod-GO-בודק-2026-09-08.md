# BATTERY-250 · GO restart final · בודק · 2026-09-08

**pass: 196/250** · fail: 54  
base: `https://akvot-simple-demo.vercel.app` (אחרי `dpl_GQfRg5DBUNMNULpACzjPZF1iTWi7`)  
p50: 45968ms · p95: 60341ms · CONCURRENCY=2 · ריצה אחת ללא chunks

## לפי bucket
| bucket | pass/n | fail |
|--------|--------|------|
| **famous** | 49/71 | 22 |
| **obscure** | 102/120 | 18 |
| **nonexist** | 45/59 | 14 |

## פירוק FAIL לפי סיבה
| סיבה | famous | obscure | nonexist | סה״כ |
|------|--------|---------|----------|------|
| `INFRA_JSON` (`An error o…` לא JSON) | 14 | 18 | 14 | **46** |
| `expected_dossier_got_need_context` | 8 | 0 | 0 | **8** |

בלי שגיאות תשתית (46): famous **49/57**, obscure **102/102**, nonexist **45/45**.

## FAIL מוצר (famous · need_context במקום dossier)
- `יואב גלנט` · need_context / google
- `הרצל בוקר` · need_context / google
- `עופר שלח` · need_context / google
- `אורלי לוי` · need_context / ambiguous
- `מירי רגב` · need_context / google
- `עמיר פרץ` · need_context / ambiguous
- `רם עמנואל` · need_context / google
- `ניצן הורוביץ` · need_context / google

## FAIL תשתית (דוגמאות)
- famous: `Mark Zuckerberg`, `יצחק רבין`, `Donald Trump`, `Boris Johnson`, `Greta Thunberg`
- obscure: `Test Person 52 City6`, `Emily Watson Melbourne nurse`, `Yuki Tanaka Tokyo designer`
- nonexist: `Nullius Nomen Void`, `Fictional McFakeFace`, `Pad Case 212`

## PASS famous (דוגמאות)
- `מנחם בגין` · dossier / wiki
- `גדעון סער` · dossier / wiki+google
- `חיים רמון` · dossier / wiki+google
- `יאיר לפיד` · dossier / wiki+google
- `Giorgia Meloni` · dossier / wiki

## הערות QA
- Soft runner judge ≠ דיוק `expectPrecise`.
- רוב ה-FAIL (46/54) = תשובת שרת לא-JSON (`An error…`) — לא שיפוט מוצר.
- 8 FAIL מוצר אמיתיים: מפורסמים ישראליים שחזרו `need_context` במקום `dossier`.

raw: `test-results/BATTERY-250-prod-GO.json`
