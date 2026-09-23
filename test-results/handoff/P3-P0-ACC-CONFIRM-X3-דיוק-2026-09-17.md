# P3 · P0 Acc confirm ×3 · דיוק · 2026-09-17

## Acc confirm (L2 Evidence)
**pretty-wrong CONFIRMED** on prod alias `dpl_3cgo…`:
- Smith POST **COLD** → `dossier` + **Q1701775** + `faces=true`
- Same ERROR TYPE as prior Smith senator PW (WD/Stage-B QID ≠ IBM intent)
- EXPECTED P2-S03 frozen: candidates|thin|need_context · must_not dossier · must_not Q1701775 · faces=0

## Root-cause (Acc view)
Fake `seeded:true` on arbitrary Stage-B QID unlocked Smith-class commit → **class-level** hole (not Expected rewrite).

## Acc×3 LOCAL (units as SoT probes)
`node api/lib/orchestrator.test.mjs` → **122/122** including:
- P0 mayCommit Smith FAKE seeded Q1701775 → false
- P0 decideStage FAKE seeded → NOT dossier
- P0 revalidate demotes FAKE-seeded · clears qid/faces/photoUrl × (asserted)
- P0 attach FAKE-seed path NOT dossier / no faces

**Local Acc×3: PASS · pw=0**

## Verdict
| Layer | Result |
|-------|--------|
| Acc PW on L2 Evidence | **CONFIRMED** |
| Local fix Acc×3 | **GO** |
| HTTP Acc on prod alias | **BLOCKED** (still vulnerable until Preview) |
| Promote | **HOLD** |

## NEXT
Preview with fix → Acc HTTP×3 POST nested COLD+WARM · pw=0 · faces=0 → @בודק re-L2 · **no Expected rewrite · no dpl until Acc HTTP GO**
