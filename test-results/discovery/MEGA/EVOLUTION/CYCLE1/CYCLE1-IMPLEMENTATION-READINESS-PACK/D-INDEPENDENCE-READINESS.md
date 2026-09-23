# D — INDEPENDENCE READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/05-INDEPENDENCE-MODEL.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Endpoint ≠ independence. Same provider / same hostFamily / usually same source family = NOT independent corroboration. MULTI only after typed soft-ref coalesce across hostFamilies — **secondary metric**.

web_origin never mints typed soft-refs for attach; URL-alone → UNKNOWN.

## Current code gap

| AS-IS | TO-BE |
|---|---|
| A2-safe `coalesceBySoftEntity` (typed viaf/qid/ol) FROZEN EXPERIMENTAL | Keep; surface as same-reference edges in graph |
| WD+WP both hostFamily wikimedia | Telemetry must not claim independence |
| findingsCount / provider chips as UX proxies | Separate diversity vs MULTI metrics (SoT 13) |
| No planner preference for diverse independenceClass | Prefer diversity when budget allows — no vanity flood |

## Proposed work packages

1. **WP-IND-TELEM** — Distinct hostFamily + familyId counters  
2. **WP-IND-MULTI-SEC** — MULTI labeled secondary in packs/obs  
3. **WP-IND-WEB-ORIGIN** — Enforce no web_origin typed-ref mint for attach  
4. **WP-IND-RANK** — Explainable diversity/authority weights — never identity certainty  

## Owner suggestion

Arch (policy) · Server (telemetry) · Acc (no identity theater in emit) · QA (WD+WP collapse cases).

## Risks

Product pressure to treat chip count as independence · title-bridge temptation (A2-bound REJECTED).

## Exit criteria

- [ ] Docs/telemetry never market WD+WP as two independent sources  
- [ ] MULTI reported secondary only  
- [ ] web_origin attach path remains blocked  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
