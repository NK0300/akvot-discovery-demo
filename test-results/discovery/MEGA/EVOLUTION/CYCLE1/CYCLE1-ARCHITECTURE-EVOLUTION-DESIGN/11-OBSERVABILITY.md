# 11 — OBSERVABILITY · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · no secrets · Acc applies to orchestration layer

---

## Required telemetry fields

| Field | Required | Notes |
|-------|----------|-------|
| `planId` | YES | QueryPlan instance |
| `sessionId` | YES | Existing session mint |
| `correlationId` | YES | Existing obs.js pattern |
| `seedHash` | YES | Opaque; not raw seed in logs if sensitive |
| `seedClass` | YES | Routing label |
| `familyId` | YES per call | |
| `providerId` | YES per call | |
| `intentId` | YES | |
| `reasonSelected` | YES | Explainability |
| `budgetSnapshot` | YES | Remaining + exhausted reasons |
| `executionTimeMs` | YES | Per family/provider/plan |
| `resultCount` | YES | findings/evidence produced |
| `failureClass` | WHEN FAIL | From `10-FAILURE-MODEL` |
| `findingCount` / `evidenceCount` | YES | Session totals |
| `relationshipLabelCounts` | YES | Incl. UNKNOWN |
| `independenceMetrics` | OPTIONAL | MULTI secondary only |

---

## Acc / secrets

- Acc scrub applies to **orchestration telemetry and plan reasons** that may surface on emit/SSE/logs.  
- No credentials, KV tokens, private IPs, or forbidden identity QIDs in telemetry.  
- Reuse `emit.js` sanitize patterns; extend checklist for plan JSON fields.

Cite: Integration Review Acc invariants; C1 gates A–I Acc leak=0.

---

## Progressive observability

SSE lifecycle events should include plan phase transitions without dumping raw provider payloads. HIT rehydrate includes scrubbed plan summary for explainability.
