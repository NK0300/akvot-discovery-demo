# FINAL ACCURACY REPORT — דיוק · 2026-09-09

**ROLE:** Accuracy / Identity Evaluation Owner  
**ACTIVE ALIAS:** `dpl_D2zvC3QvUVgz6kaSaWqnSUCoD9hU` · phase `orchestrator-v0-b`  
**EVIDENCE:** `ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.md` · `ACCURACY_REPORT.md` · units 67/67

## Metrics (live HTTP after P1)
| N | PASS | FAIL | TP | FP | TN | FN | OVER-GATE | PRETTY-WRONG |
|---|------|------|----|----|----|----|-----------|--------------|
| 35 | 34 | 1 | 19 | 0 | 15 | 1 | 1 | 0 |

- Regression P1 (נתניהו/ביבי/Zehava/Merkel): **4/4 PASS**
- KEEP safety (כהן/Smith/email/IBM+NY): **5/5 PASS**
- Unseen v2 coverage: included in N=35 · categories exact→transliteration
- Sole FAIL: `Assaf Rappaport` → need_context (expected dossier Q47507930) · **OVER-GATE** · P2 seed/Latin gap · **not FP / not pretty-wrong**

## Rules held
- UNKNOWN stays UNKNOWN when no evidence
- No threshold lowering on `mayCommitDossier`
- email/phone ≠ identity
- Single commit gate SoT
- Public sources only · no Sync.me/Truecaller

## Recommendation
**GO** (release candidate) — Assaf = P2 documented, non-blocking.
