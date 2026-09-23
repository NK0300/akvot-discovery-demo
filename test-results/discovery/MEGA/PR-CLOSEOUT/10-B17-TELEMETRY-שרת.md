# 10 — B17 Storage Telemetry (שרת)
**Stamp:** 2026-09-20 ~08:52 IDT (Asia/Jerusalem UTC+3)  
**Preview:** `dpl_4trZGxgN7CKKtC6Zed6SbACzF6Po` · https://akvot-simple-demo-7ogfp6yun-k-akvot.vercel.app  
**Promote:** **NO** · Core `dpl_8ag…` **LOCKED**

## Mandate
Classify store failures; always emit `op, backend, ok, latencyMs, failureClass, correlationId`; never log tokens/secrets.

## FAILURE_CLASSES (mandate)
`fetch_failed` · `auth` · `timeout` · `parse` · `not_found` · `conflict` · `unknown`

Rich `outcome` taxonomy retained (`STORE_OUTCOMES`: success|miss|timeout|unavailable|connection_failure|http_failure|serdeser_failure|malformed|ttl_expiry|fallback|recovery|retry|concurrent|unexpected_exception). Mandate `failureClass` is mapped via `toMandateFailureClass`.

## Implementation
| Surface | Change |
|---------|--------|
| `logStoreOp` | Always includes `op`, `backend`, `ok`, `latencyMs`, `failureClass` (mandate), `correlationId`; scrubbed session ref; secret defense |
| `classifyStoreFailure` | Rich outcome classifier |
| `toMandateFailureClass` | Maps to mandate vocabulary |
| `redisCommand` | 401/403 → `auth`; records probe; retry telemetry |
| Units | Inject via mocked `fetch` + `logStoreOp` direct calls covering each class |

## Unit coverage (sessionStore.test.mjs)
- Each mandate class asserted via `toMandateFailureClass` + `logStoreOp`
- Mock fetch fail / 401 / success paths
- No secrets in telemetry payload
- **sessionStore tests: passed=125 failed=0**

## Evidence
- Code: `api/lib/discovery/sessionStore.js`
- Units: `api/lib/discovery/sessionStore.test.mjs`
- Companion JSON: `10-B17-TELEMETRY-שרת.json`

## Status
**CLOSED** for Preview · **NO PROMOTE**
