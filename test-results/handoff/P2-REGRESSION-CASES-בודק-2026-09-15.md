# P2 REGRESSION CASES · בודק · 2026-09-15
**STATUS: READY** · FINAL coverage · **אל תריץ Gate / test:release על prod עד CoS GO**

Baseline FROZEN: `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu` · GATE P2 ACTIVE  
**AGENT:** בודק · QA Release Gate Owner  
**REFS:** `P2-BOUNDARIES-ארכיטקט-2026-09-15.md` (Arch READY) · `P2-CASES-דיוק-2026-09-15.md` · P1 Evidence suite+regression dpl_DNfPZ9  
**Aligned:** Boundaries + דיוק SPEC · T-C1/P2-A01 = **dossier · Q47507930**

### ID crosswalk (בודק ↔ דיוק)
| בודק | דיוק | Coverage |
|------|------|----------|
| S-A1..A8 | P2-S01..S07 (+phone S-A6) | SAFETY lock |
| K-B* | P2-K01..K04 + P1 recall extras | KEEP |
| T-C1 | **P2-A01** Assaf / אסף → Q47507930 | PRIMARY |
| T-C2 | P2-A02 Rapaport fold | soft document |
| T-C1b | P2-A03 אסף רפפורט | HE |
| T-C5 | P2-A05 Assaf Smith | near-miss · not Assaf QID |
| T-C6 | P2-A06 John Rappaport | no surname bleed |
| T-D* | P2-E01..E04 | entity-match |
| L-E* | P2-L01..L03 | latency measure |
| O-F* | P2-O01..O02 | health + requestId |

### Contract / Safety coverage (pre-Gate checklist)
1. `npm test` (Domain units) — local after impl
2. `npm run test:contract` — identity-p0
3. SAFETY core 6/6 inside `test:release` — **רק אחרי dpl+GO**
4. P2 HTTP battery A–F + דיוק IDs — אחרי dpl
5. P1 regression must stay green · pw=0

---
## Gate rules (locked)
- **pretty-wrong = 0** · dossier+faces על שאילתה לא-בטוחה / QID שגוי = **STOP**
- **שער commit יחיד** · `mayCommitDossier` / `canCommitIdentity` · threshold **0.75** · אין הורדה
- **אין** if ל־Assaf · אין Sync.me/Truecaller · UX FREEZE
- P1 regression חייב להישאר ירוק אחרי כל שינוי P2
- Recall ↑ רק אם precision+safety לא ↓

---

## A. SAFETY LOCK (P1 — must never regress)

| ID | INPUT | EXPECTED | Notes |
|----|-------|----------|-------|
| S-A1 | `דני כהן` | need_context · 0 faces · no QID | COMMON_HE |
| S-A1b | `משה כהן` | need_context · 0 faces | COMMON_HE |
| S-A2 | `John Smith` bare | need_context · 0 faces | softAmbiguous |
| S-A3 | Smith + IBM + NY | NOT dossier+faces | softAmb/thin/candidates OK |
| S-A4 | Smith + fake email | NOT dossier+faces · no email leak | G11 |
| S-A5 | junk HE | need_context\|thin · 0 faces | red-team |
| S-A6 | phone identifier | thin/identifier · scrub · no faces | phone≠identity |
| S-A7 | obscure HE + fictional org | need_context\|thin · 0 faces | unknown |
| S-A8 | bare `כהן` | need_context · 0 faces · never dossier | P-D8 |

**LOCK:** כשל ב-A = Gate FAIL.

---

## B. P0/P1 KEEP (must stay green)

| ID | INPUT | EXPECTED | Notes |
|----|-------|----------|-------|
| K-B1 | בנימין נתניהו | dossier · Q43723 | |
| K-B2 | אורלי לוי | dossier · Q466537 | |
| K-B3 | נתניהו / ביבי / ביבי לבד | dossier · Q43723 | P1 recall |
| K-B4 | Angela Merkel / Zehava·זהבה·Zahava Gal-On | dossier · Q567 / Q2630062 | |
| K-B5 | Benjamin / Bibi / Netanyahu Latin | dossier · Q43723 | |
| K-B6 | יאיר לפיד / לפיד | dossier · Q1396120 | |
| K-B7 | Domain units + contract identity-p0 + SAFETY suite | exit 0 | `npm run test:release` |

---

## C. P2 TARGET — Assaf / Latin class (EXPECTED מ־דיוק SPEC)

| ID | INPUT class | EXPECTED (draft עד SPEC דיוק) | Notes |
|----|-------------|-------------------------------|-------|
| T-C1 | `Assaf Rappaport` / `אסף רפפורט` | **dossier · Q47507930** (דיוק P2-A01) · **לא** if מיוחד | class-level · baseline probe + SPEC ALIGNED |
| T-C2 | Assaf near-variants / translit (אם ב־SPEC) | same QID class או need_context — **לא** pretty-wrong | |
| T-C3 | Latin unique public figure gap (דיוק list) | dossier + QID כאשר seeded class-level | boundaries §1 ALLOWED |
| T-C4 | Common Latin bare (Smith-class twin) | need_context · softAmb · 0 faces | precision guard |
| T-C5 | Near-miss Latin (homonym / weak ctx) | need_context\|candidates · **לא** wrong dossier | |

**Rules:** T-C1 EXPECTED סופי = dossier·Q47507930 (SPEC דיוק + probe). KEEP על baseline · אחרי שינויי class/entity — עדיין PASS · Assaf-only if = FAIL ארכיטקטורה.

---

## D. P2 TARGET — entity-match (org/city)

| ID | INPUT | EXPECTED | Notes |
|----|-------|----------|-------|
| T-D1 | Name + org token רק כ־URL noise (לא entity) | **לא** dossier | substring רעש ≠ evidence |
| T-D2 | Name + org+city אמיתיים (structured) | can reach candidates/dossier רק אם evidence≥0.75 + SoT | לא להוריד סף |
| T-D3 | Smith+IBM+NY (S-A3 twin) | עדיין NOT dossier+faces | regression lock |
| T-D4 | email/phone alone as "evidence" | **לא** מספיק ל־commit | G11/G10 |

---

## E. P2 — latency (measure; soft gate)

| ID | Path | Action | Fail criteria |
|----|------|--------|---------------|
| L-E1 | Smith+ctx / email ctx | מדידת p50/p95 **לפני** ואחרי קיצור | regression SAFETY/contract = FAIL |
| L-E2 | | קיצור רק אחרי מספרים · בתוך AbortSignal | הסרת evidence/safety למהירות = STOP |

**לא מפיל Gate על latency לבד** אלא אם פגע ב־A/B/D.

---

## F. P2 — observability minimum

| ID | Check | EXPECTED |
|----|-------|----------|
| O-F1 | `GET /api/health` (או equiv) | HTTP 200 · ok · build/phase · **no secrets** |
| O-F2 | lookup response | `requestId` ב־header ו/או JSON |
| O-F3 | smoke logs | **אין** PII גולמי (email/phone) |

---

## G. Suite commands

```bash
# Pre-implement / local after code (no dpl)
npm test
npm run test:contract
# Post-dpl only after CoS GO:
AKVOT_BASE=https://akvot-simple-demo.vercel.app npm run test:release
# + P2 regression HTTP battery (this list A–F) · report:
# test-results/P2-REGRESSION-dplXXXX-בודק-YYYY-MM-DD.{md,json}
```

---

## Sequencing (בודק)
1. **עכשיו:** רשימה זו · ממתין ל־SPEC דיוק למלא T-C* EXPECTED סופיים
2. **לפני implement:** baseline probe על T-C1 (Assaf) על `dpl_DNfPZ9…` — תיעוד בלבד
3. **אחרי implement מקומי:** units+contract+SAFETY · regression A+B ירוקים
4. **אחרי CoS GO + dpl:** `test:release` מלא + P2 HTTP regression · Evidence ל־baseline חדש

## Red lines
pretty-wrong · threshold drop · Assaf-only if · SoT כפול · Sync.me/Truecaller · UX בלי blocker · dpl בלי GO → **STOP**

---

## Baseline probe (2026-09-15 ~13:42 IDT) · `dpl_DNfPZ9…`

| ID | INPUT | ACTUAL on frozen baseline | Note |
|----|-------|---------------------------|------|
| T-C1 | `Assaf Rappaport` | **ui=dossier · qid=Q47507930 · mode=wiki · confidence=high · photo present** | שונה מ־P1-era need_context/P2-doc · לא if בקוד — wikiExact/class path. דיוק חייב לאשר QID+EXPECTED ב־SPEC לפני שינוי seed. |

*Probe: GET /api/lookup?q=Assaf%20Rappaport&nocache=1 · Origin=prod*
