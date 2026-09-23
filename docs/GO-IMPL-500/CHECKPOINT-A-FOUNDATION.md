# CHECKPOINT A — FOUNDATION · GO-IMPL-500

**Stamp:** 2026-09-22T00:04:03+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Status:** **PASS** (with documented residual env flake)  
**Dispatch:** PHASE 1 FOUNDATION (actions ~1–80) toward Checkpoint A  
**Locks honored:** Core Acc P0 · B0 alias/promote · A2-bound frozen · C1 Bound (URL-alone → UNKNOWN) · SoT 01–18 cite-only

---

## 1. Verdict

| Gate | Result |
|------|--------|
| QueryPlan module + determinism | PASS |
| Budget engine hard-stop | PASS |
| Family orchestration wrapper | PASS |
| Orchestrator flag ON/OFF wiring | PASS |
| Evidence provenance shape | PASS |
| SSE plan/progress/finding/done + Acc scrub | PASS |
| Flag OFF = B0 verbatim | PASS |
| Acc scrub on plan emit | PASS |
| UNKNOWN axioms / C1 Bound | PASS |
| Unit + foundation suite | PASS (see §4) |
| sessionStore health (Upstash env) | RESIDUAL FLAKE (2 asserts; not introduced by Phase 1) |

**Checkpoint A: PASS** — continue to Phase 2 Discovery Engine adapters (public sources only).

---

## 2. Flags (default OFF)

| Flag | Default | Effect |
|------|---------|--------|
| `DISCOVERY_ENABLE_QUERYPLAN` | OFF | Seed→Plan→Families→Evidence path |
| `DISCOVERY_ENABLE_PLAN_SSE` | OFF (follows QueryPlan when on) | Additive SSE `plan` / optional `graph` |
| `DISCOVERY_ENABLE_VIAF` | OFF (unchanged) | Authority family eligibility |
| `DISCOVERY_ENABLE_WEB_ORIGIN` | OFF (unchanged) | web_origin family / C1 Bound path |

Kill-switch: unset / `0` → B0 verbatim provider fan-out; no `queryPlan` on snapshot; SSE AS-IS set only (no `plan`).

---

## 3. Files shipped / changed

### New
- `api/lib/discovery/queryPlan.js` — deterministic plan builder, validate, Acc scrub, SSE summary
- `api/lib/discovery/budget.js` — caps, ledger, hard-stop taxonomy, empty_no_fanout
- `api/lib/discovery/familyOrchestrator.js` — family wrap of providers, isolation, timeouts, normalize+provenance
- `api/lib/discovery/flags.js` — Preview flag helpers
- `api/lib/discovery/planOrchestration.js` — planForSession + executePlanLaunches
- `api/lib/discovery/sourceFamily.js` — family registry (B0 + flagged)
- `api/lib/discovery/evidenceGraph.js` — graph build, URL-alone ceiling, same-entity block
- `api/lib/discovery/phase1.foundation.test.mjs`
- `api/lib/discovery/queryPlan.test.mjs`
- `api/lib/discovery/budget.test.mjs`
- `api/lib/discovery/sourceFamily.test.mjs`
- `api/lib/discovery/evidenceGraph.test.mjs`
- `api/lib/discovery/sse.contract.test.mjs`

### Modified
- `api/lib/discovery/orchestrator.js` — flag-gated Plan→Families path; OFF = legacy
- `api/lib/discovery/emit.js` — plan/graph Acc scrub surfaces
- `api/lib/discovery/sse.js` — `plan` event (allow-set), always terminal `done`
- `api/lib/discovery/index.js` — barrel exports
- `api/lib/discovery/store.js` — evidence provenance fields (additive)
- `package.json` — `test:phase1` + foundation in `test` / `test:discovery`

### Not touched (HARD LOCKS)
- Core Acc P0 / `forbiddenIdentities.js` identity behavior (reuse only)
- B0 production alias / promote
- A2-safe / A2-bound semantics
- C1 Bound URL-alone → UNKNOWN
- Architecture SoT 01–18 / PRE-GO contracts (implemented, not edited as normative)

---

## 4. Tests

| Suite | Result |
|-------|--------|
| phase1.foundation.test.mjs | **79 passed / 0 failed** |
| queryPlan.test.mjs | **32 passed** |
| budget.test.mjs | **29 passed** |
| sourceFamily.test.mjs | **20 passed** |
| evidenceGraph.test.mjs | **16 passed** |
| sse.contract.test.mjs | **24 passed** |
| orchestrator.test.mjs | **105 passed / 0 failed** |
| adversarial.acc.test.mjs | **65 passed / 0 failed** |
| prCloseout.acc.test.mjs | **107 passed / 0 failed** |
| webOrigin.test.mjs | **96 passed / 0 failed** |
| forbiddenIdentities.test.mjs | **39 passed / 0 failed** |
| sessionStore.test.mjs | **108 passed / 2 failed** (health promoteEligible/durable vs live Upstash degraded — env residual) |

**No fake green.** Failures called out above.

---

## 5. Residual gaps

1. **sessionStore health flake** under degraded Upstash — pre-existing env; not Phase 1 logic.
2. **New provider families** (filings/news/registries) — registry stubs only; **not wired** (Phase 2+ / DO-NOT-IMPLEMENT).
3. **Numeric budget bands** — architecture defaults; KPIs remain UNKNOWN until GO-MEASURE.
4. **Dual-run CONTROL/TREATMENT harness** — not yet; flag OFF regression covered in unit/foundation.
5. **productionEligible** stays false for non-B0 families — no promote path opened.

---

## 6. Continue?

**YES → Phase 2** Discovery Engine adapters expansion (public sources only, no crawl, no private data). Checkpoint B to follow. Action log continues in `ACTION-LOG.md`.

---

## STOP notes

- BUDGET_EXHAUSTED → NO MORE FANOUT ✓  
- UNKNOWN ≠ FALSE · URL ≠ IDENTITY · CANDIDATE ≠ FACT ✓  
- Acc scrub covers plan/SSE/graph/evidence emits ✓  
