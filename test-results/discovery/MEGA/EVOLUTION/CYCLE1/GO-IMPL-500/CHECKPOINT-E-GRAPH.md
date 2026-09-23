# CHECKPOINT-E-GRAPH · GO-IMPL-500 · Phase 4 Relationship + Graph

**Stamp:** 2026-09-22T00:08:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** Accuracy / QA (relationship · graph emit · Acc)  
**Mode:** Code + tests + docs · **NO PROMOTE**  
**Locks:** B0/Core/A2/C1 · CANDIDATE≠FACT · no graph laundering · URL-alone→UNKNOWN · Acc scrub · SAME-ENTITY never on wire

---

## 1. Status: **DEMONSTRABLE PASS (unit + orch regression) · HOLD promote**

| Requirement | Result |
|-------------|--------|
| Wire `sanitizeRelationshipGraph` into orch graph path | **PASS** — rebuild after enrich with contradictions, then sanitize |
| Emit-path defense | **PASS** — `scrubGraphPayload` → Acc strip → `scrubGraphForEmit` → `sanitizeRelationshipGraph` |
| SSE `graph` Acc path | **PASS** — `scrubGraphChunk` (flag-gated plan/graph SSE unchanged) |
| Edge-click explainability | **PASS** — `explainEdge` (evidenceIds + provenance; identityClaim=false) |
| Acc forbidden QIDs on endpoints/edges | **PASS** — `isForbiddenQid` / softRef / signal; tests green |
| No graph laundering / URL-alone UNKNOWN | **PASS** (units; C1 Bound intact) |
| B0 flag-off unbroken | **PASS** orch 105/0 · honesty clamp always on (not a Preview-only gate) |

---

## 2. Files changed (this dispatch)

| File | Change |
|------|--------|
| `api/lib/discovery/relationship.js` | `hasAccForbidden` via SoT; `explainEdge`; stronger Acc on build/sanitize |
| `api/lib/discovery/relationship.test.mjs` | Edge explain + Acc + wire path · **43 PASS / 0 FAIL** |
| `api/lib/discovery/orchestrator.js` | Post-enrich: `buildEvidenceGraph` + `sanitizeRelationshipGraph` |
| `api/lib/discovery/emit.js` | Compose `sanitizeRelationshipGraph` into `scrubGraphPayload` |
| `api/lib/discovery/sse.js` | Graph frames via `scrubGraphChunk` |
| `api/lib/discovery/index.js` | Export `explainEdge` |
| `CHECKPOINT-E-GRAPH.md` | This doc |
| `CHECKPOINT-F-SECURITY.md` | Draft lite (SSRF / limits / redaction) |
| `ACTION-LOG.md` | Actions 39+ |

**Not thrashed:** `queryPlan.js`, `budget.js`, `familyOrchestrator.js`.

---

## 3. Graph emit pipeline (normative)

```text
findings/evidence ranked
  → contradictions + enrichSessionEvidence (Checkpoint C)
  → buildEvidenceGraph(..., contradictions)
  → sanitizeRelationshipGraph   // candidate state · no laundering · Acc endpoints
  → emitSnapshot → sanitizeDiscoveryPayload
       → scrubGraphPayload
            → Acc QID strip
            → scrubGraphForEmit (Foundation)
            → sanitizeRelationshipGraph (again)
  → SSE graph? (DISCOVERY_ENABLE_PLAN_SSE) → scrubGraphChunk
```

---

## 4. Edge explainability contract

```text
explainEdge(edge, session) → {
  ok, from, to, relationship,
  identityClaim: false,
  epistemicCeiling: 'candidate',
  provenance: { planId, intentId, familyId, providerId, softRefKeys, signalSummary, createdAt },
  evidenceIds[], evidence[]  // cited rows only
}
```

UX may call this on edge-click (Checkpoint D panel already surfaces edge evidence detail).

---

## 5. Tests

| Suite | Result |
|-------|--------|
| `relationship.test.mjs` | **43 / 0** |
| `evidence.test.mjs` | 51 / 0 |
| `evidenceGraph.test.mjs` | 16 / 0 |
| `orchestrator.test.mjs` | 105 / 0 |
| `adversarial.matrix.acc.test.mjs` | 75 / 0 |
| `sse.contract.test.mjs` | 24 / 0 |
| SSRF spot (urlSafety) | 4/4 + seed limit PASS |

---

## 6. Residual OPEN

1. Live Preview RUNNOW for SSE `graph` + edge explain — deferred (no promote).  
2. Early S6 `buildEvidenceGraph` still runs before contradictions (overwritten at E wire) — harmless double build; optional cleanup later.  
3. Full Security Checkpoint F — draft only (see sibling doc).

---

## STOP

NO PROMOTE · HOLD
