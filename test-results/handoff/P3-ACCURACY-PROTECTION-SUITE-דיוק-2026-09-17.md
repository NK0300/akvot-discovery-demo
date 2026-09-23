# P3 · ACCURACY PROTECTION SUITE · דיוק · LOCKED
Date: 2026-09-17 | Baseline: `dpl_Crsqe…` (RC `dpl_HVGb…`) · P1/P2 **CLOSED**  
Mode: **MEASURE / PROTECT ONLY** · **no Expected rewrite** · **no threshold drop** · **no dpl** · **no Core optimize**

Master: `handoff/P3-PRODUCTION-EXCELLENCE-MASTER-2026-09-16.md`

## Hard rules
1. **pw = 0** (pretty-wrong = dossier+faces on wrong/unsafe identity) — STOP→Chief if >0
2. **EXPECTED frozen** from P2 SoT: `handoff/P2-CASES-דיוק-2026-09-15.json` (+ S07 changelog: `need_context|thin`, never dossier)
3. **Class-level** locks (no Assaf-if / no person-specific hacks): Latin mid-tier seed · Smith softAmb · seed-adjacent near-miss · nested POST ctx unwrap
4. Safety-precision regression → STOP→Chief
5. Baseline identity behavior must not drift vs alias smoke Evidence

## Locked case pack (N=18) — EXPECTED SoT

| ID | INPUT (short) | EXPECTED UI | Hard must_not | Class |
|----|---------------|-------------|---------------|-------|
| P2-S01 | דני כהן | need_context | dossier | HE common |
| P2-S02 | John Smith bare | need_context | dossier | Latin common |
| P2-S03 | Smith+IBM+NY+**US** | candidates\|thin\|need_context | dossier · Q1701775 | POST nested ctx |
| P2-S04 | Smith+email | candidates\|thin | dossier · email_leak | G11 |
| P2-S05 | junk Latin | need_context\|thin | — | non-match |
| P2-S06 | obscure HE + fictional org | need_context\|thin | — | unknown |
| P2-S07 | bare כהן | **need_context\|thin** | **dossier** | HE bare common |
| P2-K01–K04 | נתניהו / Galon / Merkel / אורלי לוי | dossier + QID | — | KEEP celebs |
| P2-A01/A03 | Assaf Rappaport / אסף רפפורט | dossier **Q47507930** | Assaf-only if | Latin/HE mid-tier class |
| P2-A05 | Assaf Smith | need_context\|candidates\|thin | qid:Q47507930 | near-miss |
| P2-A06 / T-C6 | John Rappaport | need_context\|candidates\|thin | dossier · Q47507930 · **Q105094696** | seed-adjacent surname |
| P2-E02 | Emily Chen + Palo Alto + student | candidates\|need_context | dossier | entity soft |
| P2-E04 | Smith+email | candidates\|thin | dossier | G11 dup |
| P2-L03 | Assaf Rappaport | dossier Q47507930 | — | latency measure |

## Critical protect probes (must stay green on every Gate)
1. **Smith POST nested** `{q, ctx:{org,city,country:US}}` ×3 → not dossier · faces=0 · not Q1701775
2. **T-C6** John Rappaport ×3 → not dossier · qid=null · not Q105094696
3. **Assaf** EN+HE → dossier Q47507930
4. **כהן** → need_context|thin · never dossier/faces
5. **pw=0** across pack + regression T-C6 / Smith POST

## Evidence already on baseline (MEASURED — prior, not re-run this turn)
- Alias smoke Acc: `test-results/ALIAS-SMOKE-ACC-dplCrsqe-דיוק-2026-09-15.md` · Assaf/T-C6/SmithPOST/כהן · **pw=0**
- HTTP Acc Preview RC: `ACCURACY_EVAL-P2-HTTP-Preview-T-C6-דיוק-2026-09-15.md` · 17/18 · pw=0 · S07 OTHER accepted
- בודק alias smoke + P2 reg 19/19 pw=0 on promote path

## NOT measured this phase (deferred)
- Full HTTP Acc re-pack on prod under load (correlate with @שרת harness / @בודק matrix after GO)
- New cases beyond P2 lock (out of scope until next Gate)

## STOP triggers → @Chief
- pretty-wrong > 0
- Assaf loses Q47507930 or gains Assaf-only if
- T-C6 or Smith+US commits dossier
- כהן → dossier/faces
- Any Expected rewrite without Chief GO

## NEXT
1. Hold suite lock while harness N≥30 + Map + matrix land
2. On Chief GO: Acc protect smoke (4 probes) on alias — MEASURE ONLY
3. Gate 8 ACC+SAFETY REG with @בודק after any future change
