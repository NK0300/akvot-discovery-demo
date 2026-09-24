# Discovery Evolution Pack · 2026-09-24

**Authority:** Chief Directive — DISCOVERY EVOLUTION (Nachman)  
**Status:** Arch contracts §03–08/12–15 LANDED · §15 CHIEF RATIFIED · §16 Server runtime boundary DESIGNED · MW2 Acc/QA/UX measure IN FLIGHT · Track B code HOLD until A closes  
**Locks:** NO PROMOTE · TREATMENT UNTOUCHED · Core protected · Wave 1 DONE = NO · C1 UNKNOWN hard

## Status legend (per section)
IMPLEMENTED | DESIGNED | EXPERIMENTAL | PROPOSED | UNKNOWN

## Sections
| # | File | Owner | Status |
|---|------|-------|--------|
| 01 | Current State | Chief | OPEN |
| 02 | MW2 Closeout | Acc / QA / UX / Server | MEASURE IN FLIGHT |
| 03 | Architecture Delta | Arch | **DESIGNED** |
| 04 | QueryPlan Contract | Arch | **DESIGNED** (+ IMPLEMENTED subset) |
| 05 | Family Registry Contract | Arch | **DESIGNED** |
| 06 | Orchestrator Design | Arch (+ Server runtime later) | **DESIGNED** |
| 07 | Frontier Model | Arch | **DESIGNED** |
| 08 | Evidence Graph Design | Arch | **IMPLEMENTED**/DESIGNED |
| 09 | Progressive UX/SSE Design | UX | PENDING |
| 10 | Observability Plan | Server | PENDING |
| 11 | QA / Accuracy Strategy | QA / Acc | PENDING |
| 12 | Visual Discovery Future Capability | Arch | **EXPERIMENTAL** capability-only |
| 13 | Risks / Gaps | Chief + Arch | **DESIGNED** (Arch draft) |
| 14 | Recommended Implementation Order | Chief + Arch | **PROPOSED** |
| 15 | Explicit HOLD / GO boundaries | Chief | **CHIEF RATIFIED** |
| 16 | Server Runtime Boundary | Server | **DESIGNED** (plan only · Track B HOLD) |

## Live MW2 Preview (for §02)
- SHA: `1ed1a94472555afd736aa79a49bcb322eaba0517`
- dpl: `dpl_6F9mjR76d18vYtgbcofhWceF1LP2`
- URL: https://akvot-simple-demo-j1ds295z1-k-akvot.vercel.app
- env: `-e` NIGHT + GENERAL_WEB + WEB_ORIGIN only

## Principle
Not «which API to add» — «what public evidence can we discover next from evidence already found».

## Arch landing (2026-09-24)
ארכיטקט delivered §03–08 + §12–15 drafts. Key test: **+20 families ⇒ Core unchanged** (registry SoT; orch family-agnostic). Next: Server runtime boundary review; Chief ratify HOLD/GO.
