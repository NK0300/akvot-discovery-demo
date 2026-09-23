# I — FAILURE MODEL READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/10-FAILURE-MODEL.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Failure classes: provider_unavailable, rate_limited, timeout, empty, malformed, blocked_url, unsafe_url, contradictory_evidence, unsupported_entity_type, budget_exhausted. Isolation: one family fail ≠ corrupt others. UNKNOWN valid. Transport fail ≠ auto-CONTRADICTORY.

## Current code gap

| AS-IS | TO-BE |
|---|---|
| Provider soft-fail in orchestrator/providers | KEEP; extend per-family execution records |
| `failureInject` / `faultInject` test hooks | KEEP for Preview validation |
| urlSafety blocks | Map to blocked_url / unsafe_url |
| Limited structured failureClass on session | Explicit providerStatus + failureClass telemetry |

## Proposed work packages

1. **WP-FAIL-ENUM** — Standardize failureClass enum on execution records  
2. **WP-FAIL-ISOLATE** — Per-family try/catch; session consistency  
3. **WP-FAIL-HONEST** — Surface skipped/empty/error (no silent omission)  
4. **WP-FAIL-INJECT** — Extend inject hooks for budget_exhausted / unsupported_entity_type  

## Owner suggestion

Server · QA (inject suites) · Acc (malformed never bypasses scrub).

## Risks

Vanity findingsCount hiding failures · rewriting plan history on fail · treating empty as error to “fix”.

## Exit criteria

- [ ] Soft-fail one family leaves others intact  
- [ ] unsafe_url never fetches  
- [ ] empty/UNKNOWN remain valid outcomes  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
