# MEGA L — OBSERVABILITY
**Date:** 2026-09-20 ~07:30 IDT (Asia/Jerusalem UTC+3)  
**Owner:** Executor (L Observability)  
**Promote:** **HOLD / NO**

## Correlation / request IDs

| Surface | Present? | Notes |
|---------|----------|-------|
| POST `/api/discovery/sessions` | **YES** | `X-Correlation-Id` / body; minted if absent; echoed |
| GET `/api/discovery/health` | **YES** | Header or query; used in store health probe |
| GET session / narrow / SSE | **PARTIAL** | Session id primary; SSE opts.correlationId for lifecycle metrics |
| Core `/api/lookup` | **YES** (unchanged) | `X-Request-Id` — out of scope |

## Storage backend telemetry

| Signal | Present? | Notes |
|--------|----------|-------|
| `storeBackend` / `backend` | **YES** | `getStoreInfo()` — never silent |
| `durable` / `fallback` / `promoteEligible` | **YES** | fs-regen → durable=false, promoteEligible=false |
| `kvCredsPresent` | **YES** | boolean only — **no secrets** |
| `logStoreOp` / store telemetry | **YES** | latencyMs, ok, correlationId, sessionIdPrefix |
| fs-regen fallback log | **YES** | explicit promoteEligible=false |
| Health WRITE→READ→UPDATE→DELETE | **YES** | `/api/discovery/health` |

## SSE lifecycle metrics

| Event | Metric key | Hook |
|-------|------------|------|
| open / resume | `sse.open` / `sse.resume` | `recordSseLifecycle` in `writeProgressiveSse` |
| frame | `sse.frame` | per written frame |
| hang_guard | `sse.hang_guard` | resume-past-end synthetic `done` |
| terminal_done | `sse.terminal_done` | normal completion |
| disconnect | `sse.disconnect` | write throw (EPIPE) |
| terminal_error | `sse.terminal_error` | error+done after disconnect |

**Reconnect contract:** `SSE_RECONNECT_DOCS` — Last-Event-ID skip; always terminates with `done` or `error`+`done`; finite event list (no hang).

## Gaps + minimal hooks added

| Gap (before) | Hook added |
|--------------|------------|
| No Discovery-local counters | `obs.js` — incrMetric / recordLatency / getMetricsSnapshot |
| SSE lifecycle not metered | `recordSseLifecycle` wired in `sse.js` |
| Create latency not recorded | `recordLatency('discovery.create', …)` in orchestrator |
| Create rate/size not guarded | `requestGuards.js` + route wire-up |

## Residual gaps (document only — HOLD)
- No OpenTelemetry exporter (Preview demo)  
- Rate-limit counters are per-instance  
- GET/narrow optional correlation mint if client omits header  

## Secrets policy
Metrics and store telemetry **must not** include tokens, full session payloads, or env values. Verified in `failureInject.test.mjs`.
