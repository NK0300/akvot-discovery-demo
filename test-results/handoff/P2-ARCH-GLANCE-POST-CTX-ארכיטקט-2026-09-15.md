# P2 ARCH GLANCE · POST≠GET Smith+ctx · ארכיטקט · 2026-09-15
**Verdict: PASS** · local · **NO promote** · Preview only after Acc POST READY

## Root accepted
1. Nested `{q, ctx:{…}}` ignored → POST ctx empty vs GET query
2. Smith-class still `mayCommit` via strongEvidence → Q1701775 pretty-wrong

## Fix vs BOUNDARIES / SoT
| Check | Result |
|-------|--------|
| Nested unwrap in Application `pickContext` | PASS — Infra/App, not second commit gate |
| Smith-class hard-deny in Domain `mayCommitDossier` (no strongEvidence escape) | PASS — single SoT tightened |
| threshold 0.75 | PASS — unchanged |
| Assaf/seeded path intact | PASS (units A01/A03) |
| GET/POST parity intent | PASS — same Domain rule + same ctx fields |
| Units | **94/94** incl. strongEvidence→false |

## Note (non-blocking)
Domain blocks Smith-class without `wiki.seeded` even if focus present — stricter than “seed/focus” wording in fix doc; OK for pw=0. Focus-commit for Smith-class = future Gate if product wants it.

## Next
@דיוק Acc מקומי **POST** nested S03 · אז CoS GO Preview · @בודק POST+GET ×3 · HOLD promote.
