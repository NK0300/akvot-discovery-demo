# P — NON-GOALS ENFORCEMENT · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/17-NON-GOALS.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary — hard stops

Out of scope: unrestricted crawl · autonomous browser · identity scoring · similarity identity · title bridges · domain ownership inference · hidden source expansion · opaque ranking · autonomous promotion · EXP-B · QueryPlan code this pass · mutating prior packs · Core changes · single confidence score.

## Enforcement plan (process · not code)

| Non-goal | Hard stop mechanism |
|----------|---------------------|
| Crawl / browser | Reject WPs that add link frontiers / headless browsers |
| Identity scoring / confidence % | Acc + Arch review of emit schema |
| Title bridges / A2-bound | Keep REJECTED; CI assert no title: coalesce keys |
| Domain ownership | Bound tests; code review checklist |
| Hidden expansion | Budget observability required |
| Opaque ranking | Metrics must cite dimensions (SoT 13) |
| Autonomous promotion | Chief-only; Arch STOP language |
| New providers / EXP-B / C2+ | Pack locks; WP-SF-NO-NEW-PROVIDERS |
| Core changes | Explicit non-goal in every WP |
| Mutating historical packs | Write only new evidence pack paths |

## Current code gap (as-is vs to-be)

| AS-IS | TO-BE |
|---|---|
| Non-goals documented in SoT 17 + IR What-not-to-build | Living enforcement register + PR checklist |
| Acc/urlSafety/tests partially encode stops | Explicit CI guards after GO (title coalesce, SAME-ENTITY, crawl APIs) |
| No pack-level “do not implement” gate on WPs | Every future WP cites this register |

## Proposed work packages

1. **WP-NG-REGISTER** — Living do-not-implement register (this file is seed)  
2. **WP-NG-REVIEW** — Checklist on every future impl PR  
3. **WP-NG-CI-GUARDS** — After GO: lint/tests for title coalesce / SAME-ENTITY / crawl APIs  

## Owner suggestion

Arch (register) · Acc (identity/Acc stops) · Chief (promote stop) · QA (CI guards later).

## Risks

“Just this once” exceptions under product pressure.

## Exit criteria

- [ ] Every future impl GO cites this register  
- [ ] Violations return to Chief Review before SoT change  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
