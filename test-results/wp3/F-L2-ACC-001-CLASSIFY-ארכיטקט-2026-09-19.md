# F-L2-ACC-001 · ARCH CLASSIFY · ארכיטקט · 2026-09-19
**FINDING ONLY · NO optimize · NO Core · NO dpl**  
**Baseline:** `dpl_7vAA…` FROZEN

## Classification
| Axis | Call |
|------|------|
| **Type** | **Ranking / candidate-list contamination** (poison QID in list) |
| **Not** | SoT commit regression · faces leak · Expected/threshold · Core deploy drift |
| **Commit path** | **HELD** — `ui=candidates` · primary `qid=null` · `faces=0` |
| **Acc path** | **FAIL hard** — Acc lock: **NEVER Q1701775** anywhere (incl. candidates #1) |
| **vs quiet baseline** | **NEW under load/wiki pressure** — post-promote + L2-A/LOCK absent Q170; after Soak present |
| **Flake?** | Load-correlated latent (wiki429/hydration mix) — not one-off noise only; reproducible risk under stress |

## Severity
| Layer | Severity |
|-------|----------|
| Product commit (dossier) | **P1 low** this sample — SoT belt held |
| Acc / selection UX | **P0 STOP** — top candidate is classic Will-Smith poison QID labeled as John Smith NY |
| L2 program | Stream **INCOMPLETE** · L2-D deferred · WP3 not closed |

## WP4-candidate?
**YES** — Acc-safe **rank scrub / denylist** for Smith-class when candidate QID is known-poison / mismatch (class-level, not Assaf-if).  
**BLOCKED** until Chief + Acc×3 quiet + package Gate. Do **not** implement in WP3.

## Align with שרת triage
Accepted: ranking leak · not new commit regression on this dpl.

## NEXT (no Arch code)
1. @דיוק Acc×3 quiet · expect pw=0 clears  
2. Chief GO only → resume L2-C isolate / or ticket WP4  
3. **HOLD** L2-D Breakpoint map until Acc quiet + Chief (Evidence incomplete for capacity answers)

**MEASURE FOR TRUTH.**
