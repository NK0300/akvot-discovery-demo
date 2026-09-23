# 12 — OBSERVABILITY · Chief Gate L

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT `11-OBSERVABILITY.md` · `13-METRIC-MODEL.md` · AS-IS obs.js

---

## 1. Required fields

| Field | Required |
|-------|----------|
| planId, sessionId, correlationId | YES |
| seedHash (opaque), seedClass | YES |
| familyId, providerId, intentId | YES per call |
| reasonSelected | YES |
| budgetSnapshot | YES |
| executionTimeMs | YES |
| resultCount / findingCount / evidenceCount | YES |
| failureClass | WHEN FAIL |
| relationshipLabelCounts (incl. UNKNOWN) | YES |
| lifecycleState | YES |
| urlOrigin metrics (attempts/blocked/unsafe/UNKNOWN) | WHEN used |
| graph node/edge counts | WHEN graph on |
| independenceMetrics (MULTI) | OPTIONAL secondary only |

---

## 2. Metrics / logs / traces

| Signal | Examples |
|--------|----------|
| Metrics | plan_build_ms, family_call_ms, budget_exhausted_total, unknown_label_ratio, sse_done_total, soft_fail_by_class |
| Logs | scrubbed plan summary, skip reasons, Bound violations=0 asserts |
| Traces | span per plan → intent → family → provider |

No secrets. Acc applies to orchestration telemetry (SoT 11).

---

## 3. Progressive observability

SSE phase transitions without dumping raw provider payloads. HIT includes scrubbed plan summary for explainability.

---

## 4. KPI honesty

Do not invent measured KPIs. Freshness / broad coverage may be UNKNOWN until Preview measurement (SoT 13 · IR). MULTI secondary only — never sole success gate.
