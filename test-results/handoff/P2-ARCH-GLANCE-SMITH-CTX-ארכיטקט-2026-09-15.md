# P2 ARCH GLANCE · Smith+ctx fix · ארכיטקט · 2026-09-15
**Verdict: PASS** · local fix · **NO promote** · Preview RC only after CoS GO

## Root accepted
1. Smith-class wikiExact → wrong primary (Q1701775) when softAmb cleared
2. `country=us` scored via `includes` on `https` — ISO2 URL noise

## Fix vs BOUNDARIES
| Check | Result |
|-------|--------|
| Single SoT `mayCommitDossier` | PASS — guard inside Domain |
| threshold 0.75 | PASS — unchanged |
| Class-level (COMMON_LATIN + detector) · not Assaf-if | PASS |
| Assaf not Smith-class (units) | PASS |
| softAmb forced in lookup for Smith-class | PASS — Application belt; Domain still owns commit |
| country ISO2 ≥3 / title-note only | PASS |
| Units | **93/93** incl. wikiExact Q1701775 → false |

## Non-blocking
- COMMON_LATIN is broad (lee/king/james) — intentional precision > recall; seeded unique still OK via `wiki.seeded`.
- Re-suite **must** include `d-smith-ctx-p0` with **country=US** ×3 (flake lock).

## Next
CoS GO → Preview חדש · @בודק re-suite (contract+SAFETY) · @דיוק HTTP Acc · HOLD alias עד Gate ירוק.
