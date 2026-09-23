# LOCAL-WAVE-F-SEC · REPORT

**Stamp:** 2026-09-23T21:37:00+03:00 IDT  
**Workspace:** `/workspace/akvot-quick-demo`  
**Goal:** Close Security Checkpoint F residuals · full force · honest · **no promote**

---

## What changed

### 1) urlTargets / urlSafety SSRF (Preview-oriented)
- Hardened `urlSafety.js`: extra cloud metadata aliases (`instance-data`, `metadata.azure.com`, `https://0/`, etc.).
- Fetch gate helpers in `security.js`; **tests added** for:
  - poison plan (unsafe marked `allowed`) → `failClosed` + **zero** fetchable URLs
  - clean mixed plan → only public https fetched
  - `runPlanUrlTargetsFetchGate` never calls fetchFn on poison / private
  - `http://` marked allowed → not fetchable
- **Still OPEN:** live Preview flag-ON measure (not simulated here).

### 2) providers DEEP_SKIP AMBER → closed
- `emit.js`: `providers` added to **explicit** `DEEP_SKIP_KEYS` (+ exported `EMIT_DEEP_SKIP_KEYS`).
- Mandatory pre-scrub via `scrubProvidersState` (Acc QID + credentials) **before** deepStrip.
- Tests: Acc bait scrubbed · nested scrub · **no identity laundering** into findings/candidates · map still present after skip.

### 3) Rate limit in-memory harden + document
- `requestGuards.js`: `RATE_LIMIT_BACKEND = 'memory'` · `getDiscoveryRateLimitInfo()` documents `upstashWiredForRateLimit: false` · `distributed: false`.
- Aggressive prune / maxKeys eviction · `clientKeyFromReq` prefers `x-real-ip` / rightmost `x-vercel-forwarded-for`.
- **Did not** wire Upstash for RL (sessionStore Upstash exists; RL path intentionally memory-only).

### 4) Docs
- `CHECKPOINT-F-SECURITY.md` updated: **PARTIAL PASS (improved)** — honest residuals.
- This report + ACTION-LOG append (real actions only).

---

## Tests

| Suite | Result |
|-------|--------|
| `security.checkpoint.test.mjs` | **111 / 0** |
| `prCloseout.acc.test.mjs` | **107 / 0** |
| `failureInject.test.mjs` | **51 / 0** |
| `webOrigin.test.mjs` | **96 / 0** |

---

## Still open

1. Live Preview QueryPlan urlTargets SSRF pack (Foundation Preview measure).  
2. Distributed / multi-instance rate limit.  
3. Production obs log-shipper seed re-injection sample.  
4. Chief GO for any PARTIAL→PASS / promote discussion.

---

## Locks respected

- No Vercel promote / alias changes  
- Core Acc P0 · B0 · A2-safe · C1 (URL-alone→UNKNOWN) **not unfrozen**  
- No new HTTP adapters (F11)  
- Flags QueryPlan / VIAF / webOrigin **default OFF**  
- No GitHub push  

---

## STOP

**F PARTIAL (improved)** · NO PROMOTE · residuals documented
