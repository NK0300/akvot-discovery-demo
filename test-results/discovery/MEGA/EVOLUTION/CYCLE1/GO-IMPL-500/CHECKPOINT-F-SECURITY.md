# CHECKPOINT-F-SECURITY · GO-IMPL-500 · Security close (honest)

**Stamp:** 2026-09-22T00:10:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** Accuracy / QA (security · emit · obs · urlSafety · requestGuards)  
**Verdict:** **PARTIAL PASS** (unit gate closed for Acc-owned surfaces) · **NO PROMOTE**  
**Locks:** B0/Core/A2/C1 frozen · Acc scrub · UNKNOWN≠FALSE · URL≠IDENTITY · CANDIDATE≠FACT · BUDGET_EXHAUSTED stops fanout

---

## 1. Verdict summary

| Layer | Result | Evidence |
|-------|--------|----------|
| Input validation | **PASS** | seed/hints/body caps · empty reject · `security.checkpoint.test.mjs` |
| SSRF / urlSafety | **PASS** (unit) | 16 block + 2 allow cases in F suite; webOrigin 96/0 corpus |
| Payload limits | **PASS** | MAX_SEED=500 · MAX_BODY=32k · MAX_HINTS=4k · `assertPayloadSize` |
| Rate / isolation | **PASS** (unit) | per-key rate trip; independent keys |
| Secret protection | **PASS** (emit path) | credential redact on plan/SSE/error/source content |
| Log + SSE + graph + error redaction | **PASS** | F suite + hardened `scrubSseError` |
| Source-content sanitization | **PASS** | `sanitizeSourceContent` Acc+secret strip |
| Observability lite | **PASS** (unit) | `buildStructuredLog` / `logDiscoveryEvent` — no seed/Acc/credentials |
| Perf lite (timeout/cancel) | **PASS** (unit) | `withSourceTimeout` — fails closed; **never** bypasses SSRF |
| Live Preview QueryPlan urlTargets SSRF | **OPEN** | requires Foundation Preview path measure |
| `providers` deep-skip Acc gap | **AMBER** residual | emit `DEEP_SKIP_KEYS` |
| Production / promote | **HOLD** | no Chief promote order |

**Why PARTIAL (not full PASS):** unit/security surfaces owned by Acc/emit/obs/urlSafety/requestGuards are green and documented; live Preview plan-urlTarget SSRF pack and production log sampling remain OPEN. Honest close ≠ invented green.

---

## 2. Files (this close)

| File | Role |
|------|------|
| `api/lib/discovery/security.js` | **NEW** — redact, source sanitize, fetch URL assert, timeout wrapper, payload size, bait probe |
| `api/lib/discovery/security.checkpoint.test.mjs` | **NEW** — **67 PASS / 0 FAIL** |
| `api/lib/discovery/obs.js` | `buildStructuredLog` · `logDiscoveryEvent` (alongside Foundation `structuredLog`) |
| `api/lib/discovery/sse.js` | `scrubSseError` Acc QID → `[REDACTED_QID]` |
| `api/lib/discovery/index.js` / `package.json` | exports · `test:security` |
| `CHECKPOINT-F-SECURITY.md` | This close doc |

**Not collided:** `queryPlan.js`, `budget.js`, `familyOrchestrator.js`.

---

## 3. Controls matrix

| Control | Mechanism |
|---------|-----------|
| SSRF | `assertSafePublicHttpsUrl` / `assertFetchUrlSafe` — https-only, no userinfo, block private/metadata/raw IP |
| Input caps | `validateDiscoveryCreateBody` — seed/hints/body |
| Rate | `checkDiscoveryRateLimit` — per client key |
| Acc emit | `sanitizeDiscoveryPayload` · plan/graph/error scrub · forbidden QIDs |
| Credentials | `redactSensitiveText` · plan scrub · SSE/error scrub |
| Source content | `sanitizeSourceContent` (og/snippet/quote) |
| Obs | correlationId/requestId/queryId/familyId + timings/budget/counts/state — message scrubbed |
| Timeout/cancel | `withSourceTimeout` — AbortError / provider_timeout; SSRF asserted separately first |

---

## 4. Tests run (close stamp)

| Suite | Result |
|-------|--------|
| `security.checkpoint.test.mjs` | **67 / 0** |
| `sse.contract.test.mjs` | (re-run) |
| `prCloseout.acc.test.mjs` | SEC-* subset |
| `webOrigin.test.mjs` | SSRF corpus |
| `relationship.test.mjs` | graph Acc |
| `failureInject.test.mjs` | security/obs section |

---

## 5. Residual risks (binding honesty)

1. **Preview QueryPlan `urlTargets` live SSRF pack** — unit urlSafety green; end-to-end under flag-ON Preview not claimed this close.  
2. **`providers` in emit `DEEP_SKIP_KEYS`** — provider error strings could carry Acc bait if not pre-scrubbed.  
3. **In-memory rate limit** — demo/Preview scoped; not distributed.  
4. **Obs stdout JSON** — ensure production log shippers do not re-inject seed.  
5. **No promote** — F PARTIAL does not authorize GO-MEASURE / production enablement.

---

## 6. Exit criteria checklist

- [x] Unit SSRF pack (block list) green  
- [x] Payload caps proven  
- [x] Log/SSE/graph/error redaction proven (unit)  
- [x] Source-content sanitization helper + tests  
- [x] Obs structured fields without Acc leakage  
- [x] Timeout/cancel fail-closed without SSRF bypass  
- [ ] Live Preview plan urlTargets SSRF (OPEN)  
- [ ] Distributed rate / production log sample (OPEN)  
- [ ] Chief order to elevate PARTIAL → PASS for promote discussion (HOLD)

---

## STOP

**PARTIAL PASS** · NO PROMOTE · HOLD
