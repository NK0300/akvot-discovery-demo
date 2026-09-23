# 20 — RISKS AND ASSUMPTIONS

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT 18 residual risks · IR §5–6 safety/scale

---

## Top risks

| Rank | Risk | Severity | Mitigation in contracts |
|------|------|----------|-------------------------|
| 1 | Product pressure to “fix” empties → Bound erosion | Critical | Do-not-implement · acceptance gates · UNKNOWN valid |
| 2 | Acc surface growth via plan/SSE/graph JSON | High | Acc extend checklist · sanitize plan events |
| 3 | Fanout cost / rate-limits even with budgets | Medium–High | Tight defaults · deterministic degradation · B0-first Preview |
| 4 | SeedClass misrouting | Medium | Degrade ambiguous/unknown |
| 5 | Temptation to wire many new families at once | High | Orchestrate existing B0±A2±C1 only first (SoT 18) |
| 6 | Adaptive re-PLAN loops | Medium | maxPlanRevisions tiny |
| 7 | Dual-run drift (flag OFF ≠ legacy) | High | Snapshot CONTROL tests in future measure pack |
| 8 | Unmeasured freshness/coverage treated as known | Medium | Keep UNKNOWN (SoT 13) |

---

## Assumptions (unresolved = treat carefully)

| Assumption | Status |
|------------|--------|
| Existing provider soft-fail substrate sufficient for family isolation | Assumed from AS-IS; verify in Preview |
| AS-IS SSE finite-event model extends cleanly with `plan` event | Assumed |
| Additive session fields tolerated by all clients | Assumed; unknown clients ignore |
| urlSafety remains sufficient for UrlOriginStage elevation | Assumed (C1 SSRF PASS) |
| No Core change required | Contractual requirement |
| Design default budget bands are safe starting points | **UNKNOWN until measured** |

---

## Residual UNKNOWN

Measured KPI lifts from QueryPlan · optimal budgets · broad-web recall · freshness corpus-wide — **UNKNOWN** until future measurement GO.
