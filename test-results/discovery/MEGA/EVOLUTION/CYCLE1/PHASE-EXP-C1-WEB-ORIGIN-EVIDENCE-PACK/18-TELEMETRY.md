# 18 — TELEMETRY

Deterministic fields (Acc-scrubbed): correlationId, sessionId, seed (truncated/scrubbed), family=web_origin, safety result, fetch result, failureClass, latencyMs, relationship, hostname, registrableDomain.

Attached on provider batch `_webOriginTelemetry` and session `webOriginTelemetry` when present.  
Forbidden Q-ids scrubbed via `scrubTelemetry`.
