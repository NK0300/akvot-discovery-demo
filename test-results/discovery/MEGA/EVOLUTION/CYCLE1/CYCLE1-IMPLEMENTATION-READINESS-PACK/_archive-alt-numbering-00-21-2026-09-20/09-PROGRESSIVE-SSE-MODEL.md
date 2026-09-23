# 09 — PROGRESSIVE SSE MODEL · Chief Gate I

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT `09-PROGRESSIVE-LIFECYCLE.md` · AS-IS `sse.js` (meta|progress|provider|finding|facets|status|done|error) · SSE_RECONNECT_DOCS

---

## 1. Event types (target compatible with AS-IS)

| Event | When | Acc scrub |
|-------|------|-----------|
| `meta` | CREATE | YES |
| `plan` | PLAN complete (NEW additive) | YES — scrub reasons/secrets |
| `progress` | Phase transitions / % | YES |
| `provider` | Family/provider start/end | YES |
| `finding` | Progressive finding | YES (scrubFindingChunk) |
| `graph` | Optional incremental graph delta (NEW additive) | YES |
| `facets` | RECONCILE / updates | YES |
| `status` | Lifecycle status | YES |
| `error` | Soft/hard failure | YES |
| `done` | Terminal always | YES |

**Compatibility:** Existing NARROW/HIT/GET session remain. Unknown clients ignore `plan`/`graph`. Flag OFF → no `plan` event; AS-IS event set only.

---

## 2. Ordering

1. Finite ordered list (AS-IS `buildProgressiveEvents` pattern).  
2. Lifecycle order: meta → plan → (provider|finding|progress)* → facets → status → done.  
3. `error` may appear before `done`; stream **always** terminates with `done` (or error then done).  
4. Stable finding order: sort by (rank, fingerprint) before emit for reproducibility when rebuilding from snapshot.

---

## 3. Partial · completion · failure · cancel

| Case | SSE behavior |
|------|--------------|
| Partial budget stop | status=partial + budgetExhaustedReason → done |
| Family soft-fail | provider error chunk; continue findings |
| FAIL_PLAN | error → done |
| Cancel | status=cancelled / error → done |
| Complete | status=complete → done |

---

## 4. Reconnect · idempotency

Inherit AS-IS SSE_RECONNECT_DOCS:

- `Last-Event-ID` / `lastEventId` / `cursor`  
- Skip frames with id ≤ Last-Event-ID  
- Acc scrub on replay  
- No infinite wait / hang  
- Event ids monotonic per session  

Idempotency: re-emitting same findingId with same fingerprint is safe; clients upsert by findingId.

---

## 5. SSE lifetime budget

`maxSseLifetimeMs` + finite event list. No long-poll hang. Reconnect for late HIT snapshot if needed.

---

## 6. Plan/graph on wire

- `plan` payload: scrubbed summary (planId, seedClass, intents, families, budgets, reasons) — **no credentials**, Acc sanitize.  
- Full plan may live on session HIT; SSE carries summary.  
- `graph` optional; default may omit and derive list-only for bandwidth.

Schema: `schemas/SseEvent.schema.json`.
