# 13 — API AND SESSION CONTRACT · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Ground:** Progressive session / SSE / narrow as-is · Acc emit scrub

---

## Compatibility principle

**Additive only.** Existing clients that ignore unknown fields MUST keep working. No break of GET snapshot shape required fields · SSE event stream basics · narrow query params.

---

## Proposed session fields (design)

| Field | When | Content | Acc |
|-------|------|---------|-----|
| `queryPlan` | After QP1 | `{ planId, seedClass, intents[], steps[](summary), caps, reasons[] }` | Scrub reasons/ids |
| `queryPlan.steps[].query` | Optional redacted in public | May omit full query string in public snapshot if sensitive; prefer `queryHash` + purpose | Scrub |
| `familyStatus` | During/after F0 | Map familyId → pending\|ok\|partial\|error\|skipped\|skipped_budget\|flag_off | OK |
| `webOriginTelemetry` | Existing C1 | Keep | Scrub |
| `corroborationEdges` / `graph` | Existing + 12 | Vocabulary labels | Scrub |

Do **not** put Core identity, forbidden QIDs, or raw internal FS paths in plan.

---

## Progressive SSE compatibility

| Concern | Design |
|---------|--------|
| Existing events | Preserve; clients ignore unknown event types |
| Optional new event | `plan` (or `query_plan`) once per session when plan sealed |
| First paint | MAY occur before all families finish — unchanged |
| Ordering | Prefer emit `plan` before or with first findings batch when possible |
| Replay | planId stable for session |

---

## API surfaces

| Surface | Change |
|---------|--------|
| `POST /api/discovery/sessions` | No required body change; optional future `hints.plan` debug only |
| `GET .../sessions/[id]` | May include `queryPlan` · `familyStatus` |
| `GET .../events` (SSE) | Optional `plan` event |
| `.../narrow` | Narrow filters findings; plan summary remains on session |

---

## Flag visibility

Public snapshot MAY include `flags: { viaf: bool, webOrigin: bool, queryPlan: bool }` as booleans — never env secrets.

---

## Versioning

Bump `session.version` when plan attached (existing `ensureSessionVersion`). Document field as experimental until Chief promote discussion (not this pack).

---

## Review-note @ממשק

Confirm SSE clients tolerate unknown event types (MEGA SSE UX packs historically progressive).

---

## STOP

Contract design only. No API code in this pack.
