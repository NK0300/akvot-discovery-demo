# Phase B · Acc plan (ACC-DISC) · דיוק · 2026-09-20

**STATUS:** PLAN LOCKED · WAIT Preview · then Acc battery  
**Alias Acc P0:** `dpl_8ag…` CLOSED · **DO NOT TOUCH**  
**Phase B:** Preview-only Discovery slice · Entity-Agnostic · ≥3 Seeds

## Acc scope (Discovery emit surfaces)
Apply ACC-DISC-01…06 from `PHASE-A-ACC-דיוק-2026-09-20.md` to every Discovery response:
- findings / candidates-equivalent / facets / graph nodes / progressive chunks / cache HIT rehydrate
- NEVER forbidden QID (Q1701775 class + denylist SoT v2026-09-19.1+)
- Discovery never calls `mayCommitDossier`
- Entity Mode only evidence-backed
- UNKNOWN≠FALSE · no unjustified drop · merge-only-on-evidence

## Multi-Seed Acc battery (fixtures — not special-cased)
| Seed class | Example fixture only | Acc checks |
|------------|----------------------|------------|
| HE person soft | (any soft HE name) | soft UI · no false dossier · no forbidden QID |
| Latin ambiguous+ctx | Smith+IBM/NY/US | NEVER Q1701775 anywhere · faces=0 |
| Org/domain Seed | example.org class | findings+provenance · no false person bind |
| Keep celeb | Assaf | Core lookup still PASS dossier Q47507930 (Core regression) |

≥3 Seeds exercised on Discovery Preview; Core `/api/lookup` Assaf/כהן/Smith still PASS on **alias** (regression, not Discovery).

## Pass criteria
- leakage=0 · pw=0 (forbidden nowhere)
- no false identity bind
- Core regression PASS on alias (untouched)
- Evidence under `test-results/discovery/PHASE-B-ACC-*.md`

## Out of scope
Alias promote · WP4 · Core rewrite · single golden-path Seed.

@שרת Preview URL → Acc run · @בודק VS matrix parallel.
