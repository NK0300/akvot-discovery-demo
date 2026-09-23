# WP3 L2 · STOP · Acc pw>0 · Chief · 2026-09-19

**STATUS:** **STOP / HOLD**  
**TRIGGER:** דיוק Acc sample L2-B→L2-C boundary  
**TIME:** 2026-09-19 ~22:47 IDT  

## Finding
| Field | Value |
|-------|--------|
| Case | POST John Smith + IBM/NY/US |
| ui | candidates (not dossier) |
| faces | 0 |
| qid top-level | null |
| **Contamination** | **Q1701775 #1 candidate** (`wd-Q1701775`, score 0.9, why: match New York) |
| Acc rule | NEVER Q1701775 → **pw=1 hard** |
| Assaf / כהן | PASS |
| Baseline | `dpl_7vAA…` match |

## Decision
- **ABORT L2-C** (CLIENT_STRESS) immediately  
- Preserve Evidence (L2-A/B + Acc sample + partial L2-C)  
- **NO Core / NO Expected rewrite / NO deploy**  
- Open Finding F-L2-ACC-001 for Arch+Server triage  
- WP3 not closed · WP4 BLOCKED  

## Resume criteria (all required)
1. Finding classified (regression vs load flake vs ranking leak)  
2. Acc quiet re-sample ×3 PASS · pw=0  
3. Chief explicit GO to resume L2-C or close WP3 as FAIL/INCONCLUSIVE with pack  

## Evidence
- `L2-ACC-SAMPLE-L2B-דיוק-2026-09-19.{md,json}`
- L2-A Load PASS · L2-B Soak PASS (pre-stop)
- Partial L2-C: burst + miss-storm milestones
