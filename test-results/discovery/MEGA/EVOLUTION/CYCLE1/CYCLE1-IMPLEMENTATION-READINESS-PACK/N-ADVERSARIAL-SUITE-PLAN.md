# N — ADVERSARIAL SUITE PLAN · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/15-ADVERSARIAL-DESIGN-CASES.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Ten adversarial cases with expected architectural behavior: homonyms, URL-alone, title-bridge, domain-ownership, poisoned metadata, SSRF, compound/role, empty families, budget exhaustion, contradictory refs.

## Suite plan (future · not run now)

| Case | Gate / assert | Reuse evidence |
|------|---------------|----------------|
| Homonyms | Separate Findings; no title merge | A2 adv 12/12 · harden 28/28 |
| URL-alone | UNKNOWN; BAD_URL_ALONE_SAME=0 | C1-PATCHED · PREPATCH KEEP FAIL |
| Title-bridge | Deny coalesce | A2-bound REJECTED |
| Domain ownership | Forbidden | C1 SEMANTIC-CONTRACT |
| Poisoned meta | Acc scrub; no SAME-* | C1 Acc gates |
| SSRF | urlSafety hard block | C1 SSRF PASS · urlSafety.js |
| Role seeds | ambiguous; tight budget | IR S12–S15 |
| Empty filings | skipped + reason | A2 S04 |
| Budget exhaust | partial + budget_exhausted | IR scalability |
| Contradictory refs | contradicts; no attach | detectContradictions |

Invariant: pressure to fill empties must never weaken Bound, Acc, or independence honesty.

## Current code gap (as-is vs to-be)

| AS-IS | TO-BE |
|---|---|
| A2/C1 adversarial tests exist (`adversarial.acc.test.mjs`, webOrigin/viaf tests) | Unified suite covering all 10 SoT 15 cases under QueryPlan Preview path |
| Bound/SSRF gates proved for C1 provider path | Must re-assert under planned UrlOriginStage (no bypass) |
| No budget_exhausted adversarial in orch | Add inject case (failureInject/faultInject KEEP) |

## Proposed work packages

1. **WP-ADV-MATRIX** — Case → test id → owner  
2. **WP-ADV-CI** — Preview CI job (after GO) fails on Bound/Acc/SSRF regress  
3. **WP-ADV-PACK** — Adversarial section in future evidence pack  

## Owner suggestion

QA (lead) · Acc (Acc/SSRF/Bound) · Server (hooks) · Arch (expected behavior).

## Risks

Skipping adversarial under schedule pressure · weakening Bound to “fix” empties.

## Exit criteria

- [ ] All 10 cases have automated or scripted asserts before any promote discussion  
- [ ] KEEP FAIL pre-patch URL-alone remains documented  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
