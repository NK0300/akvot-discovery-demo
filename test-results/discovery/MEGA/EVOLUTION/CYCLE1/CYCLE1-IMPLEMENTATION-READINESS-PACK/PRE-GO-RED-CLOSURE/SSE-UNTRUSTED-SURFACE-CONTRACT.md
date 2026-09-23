# SSE-UNTRUSTED-SURFACE-CONTRACT · PRE-GO RED CLOSURE

**Stamp:** 2026-09-21T23:52:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Closes:** **R-SSE** (Chief verdict §C) · supports **R-ACC**  
**Elevates:** `ARCHIVE-00-21/09-PROGRESSIVE-SSE-MODEL.md` (normative)  
**Cite-only SoT:** `09-PROGRESSIVE-LIFECYCLE.md` · AS-IS `sse.js` · SSE_RECONNECT_DOCS  
**Bind:** each event → `ACC-EMIT-SURFACE-MATRIX.md`  
**Mode:** DOCUMENTATION ONLY · NO CODE

---

## 1. Principle

SSE is an **untrusted emit surface**: every frame is Acc-scrubbed; the stream is finite; **always terminates with `done`**; reconnect is idempotent; lifetime bounded by `maxSseLifetimeMs`. New additive events (`plan`, `graph`) inherit the same rules.

---

## 2. Schema version · allow-set discipline

| Field | Contract |
|-------|----------|
| `sseSchemaVersion` | Integer; initial design **1** |
| Compatibility | Unknown clients ignore unknown event types; producers MUST NOT emit types outside the allow-set without version bump **and** a new Acc matrix row |
| Flag OFF | AS-IS event set only (no `plan` / `graph`) |
| **SSE ⊆ API allow-set** | Every field on the wire must be permitted under `ACC-EMIT-SURFACE-MATRIX.md` for API/HIT. **No SSE-only privileged fields.** |
| `debug` event | **BLOCK** by default on production Preview paths (no debug loophole) |

---

## 3. Event types (ARCHIVE-09 · Acc scrub bind)

| Event | When | Acc scrub | Acc matrix row | Additive? |
|-------|------|-----------|----------------|-----------|
| `meta` | CREATE | YES | SSE `meta` | AS-IS |
| `plan` | PLAN complete | YES — scrub reasons/secrets | SSE `plan` | **NEW** additive |
| `progress` | Phase transitions / % | YES | SSE `progress` | AS-IS |
| `provider` | Family/provider start/end | YES | SSE `provider` | AS-IS |
| `finding` | Progressive finding | YES (`scrubFindingChunk`) | SSE `finding` | AS-IS |
| `graph` | Optional incremental graph delta | YES | SSE `graph` | **NEW** additive |
| `facets` | RECONCILE / updates | YES | SSE `facets` / `status` | AS-IS |
| `status` | Lifecycle status | YES | SSE `facets` / `status` | AS-IS |
| `error` | Soft/hard failure | YES | SSE `error` | AS-IS |
| `done` | Terminal **always** | YES | SSE `done` | AS-IS |

**Compatibility:** Existing NARROW/HIT/GET sessions remain. Unknown clients ignore `plan`/`graph`. Flag OFF → no `plan`/`graph` events; AS-IS event set only.

---

## 4. Ordering (binding)

1. Finite ordered list (AS-IS `buildProgressiveEvents` pattern).  
2. Lifecycle order: `meta` → `plan` → (`provider` | `finding` | `progress`)* → `facets` → `status` → `done`.  
3. `error` may appear before `done`; stream **always** terminates with `done` (or `error` then `done`).  
4. Stable finding order: sort by `(rank, fingerprint)` before emit when rebuilding from snapshot (reproducibility).

---

## 5. Partial · completion · failure · cancel

| Case | SSE behavior |
|------|--------------|
| Partial budget stop | `status=partial` + `budgetExhaustedReason` → **`done`** |
| Family soft-fail | `provider` error chunk; continue other findings |
| FAIL_PLAN | `error` → **`done`** |
| Cancel | `status=cancelled` / `error` → **`done`** |
| Complete | `status=complete` → **`done`** |
| `maxSseLifetimeMs` | Emit **`done`**; client may reconnect for late HIT |

---

## 6. Reconnect · idempotency

Inherit AS-IS SSE_RECONNECT_DOCS:

- `Last-Event-ID` / `lastEventId` / `cursor`  
- Skip frames with id ≤ Last-Event-ID  
- Acc scrub on **replay**  
- No infinite wait / hang  
- Event ids monotonic per session  

Idempotency: re-emitting same `findingId` with same fingerprint is safe; clients upsert by `findingId`.

---

## 7. Lifetime budget

| Control | Contract |
|---------|----------|
| `maxSseLifetimeMs` | Hard wall on SSE stream lifetime |
| Finite event list | No open-ended long-poll hang |
| Late HIT | Reconnect / GET snapshot if needed after `done` |

Bound to `BUDGET-FANOUT-CONTRACT.md` SSE dimension.

---

## 8. Plan / graph on the wire

- **`plan` payload:** scrubbed summary only — `planId`, `seedClass`, intents, families, budgets, reasons — **no credentials**; Acc sanitize per matrix.  
- Full plan may live on session HIT; SSE carries summary.  
- **`graph`:** optional; default may omit (list-only) for bandwidth; if emitted, Acc + no `same-entity` / orphan edges.

---

## 9. Seed → SSE threat path (R-ACC bind)

Poisoned seed/meta MUST NOT survive Acc scrub into `finding` / `plan` / `graph` / `error`. Bait plan: `BAIT-SEED-SSE`, `BAIT-SSE-*`, `BAIT-PLAN-*`, `BAIT-GRAPH-*` in `ACC-EMIT-SURFACE-MATRIX.md` §3.

---

## 10. Tests · Failure · Evidence (R-SSE quadruple)

### Test

| Test ID | How verified later |
|---------|-------------------|
| T-SSE-01 | All lifecycle paths (ok/partial/fail/cancel/budget_exhausted) emit **`done`** |
| T-SSE-02 | Acc bait on `plan`/`graph`/`finding`/`error` → leak=0 |
| T-SSE-03 | Reconnect with Last-Event-ID skips already-sent; Acc scrub on replay |
| T-SSE-04 | `maxSseLifetimeMs` low → `done` within bound; no hang |
| T-SSE-05 | Flag OFF → no `plan`/`graph` events; AS-IS set only |
| T-SSE-06 | Event order respects §4; findings stable-sorted on rebuild |

### Failure (gate fails when)

| Failure | Disqualifying? |
|---------|----------------|
| Hang / missing `done` on any path | **YES** |
| Acc leak on any SSE event | **YES** |
| Infinite reconnect wait | **YES** |
| `plan`/`graph` emitted without scrub or with credentials | **YES** |
| Flag OFF still emits additive plan/graph | **YES** |

### Evidence

| Artifact | Proves |
|----------|--------|
| SSE path matrix report | done on all terminals |
| Acc bait SSE report | leak=0 |
| Reconnect fixture log | idempotent skip + scrub |
| Lifetime timer record | done ≤ maxSseLifetimeMs |
| This contract + Acc matrix bind | every event dispositioned |

**R-SSE:** CLOSED (documentation). Residual AMBER: optional `graph` bandwidth default — product choice, not a RED reopen.

---

## STOP

NO CODE · NO MEASURE · NO PROMOTE · NO GO-IMPL WITHOUT NEW CHIEF ORDER
