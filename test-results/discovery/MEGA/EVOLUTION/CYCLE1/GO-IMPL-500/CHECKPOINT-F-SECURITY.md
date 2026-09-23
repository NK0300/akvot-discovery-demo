# CHECKPOINT-F-SECURITY · GO-IMPL-500 · Security close (honest)

**Stamp:** 2026-09-23T21:39:34+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** Backend / שרת (runtime wire) + Accuracy / QA (helpers · emit · obs)  
**Wave:** LOCAL-WAVE-F-SEC residuals close — **urlTargets fetch-gate RUNTIME WIRE** + Acc providers scrub strengthen  
**Verdict:** **PARTIAL PASS (unit+runtime-wire)** · **NO PROMOTE**  
**Locks:** B0/Core/A2/C1 frozen · Acc scrub · UNKNOWN≠FALSE · URL≠IDENTITY · CANDIDATE≠FACT · BUDGET_EXHAUSTED stops fanout · **F11 hold** (no new HTTP provider families)  
**Flags:** QUERYPLAN / VIAF / webOrigin **default OFF** · no Vercel promote/alias · **no live Preview redeploy claimed**

---

## 1. Verdict summary

| Layer | Result | Evidence |
|-------|--------|----------|
| Input validation | **PASS** | seed/hints/body caps · empty reject · `security.checkpoint.test.mjs` |
| SSRF / urlSafety | **PASS** (unit + hardened) | block list incl. instance-data / metadata.azure / `https://0/` · allow public https |
| QueryPlan urlTargets gate (helpers) | **PASS** | `assertPlanUrlTargetsSafe` · `selectFetchablePlanUrlTargets` · `runPlanUrlTargetsFetchGate` — poison → failClosed + zero fetch |
| QueryPlan urlTargets **runtime wire** | **PASS** (unit+wire) | Wired into `providers.js` web_origin search · `familyOrchestrator.js` web_origin hints · `orchestrator.js` one-hop filter — **fail-closed** |
| Payload limits | **PASS** | MAX_SEED · MAX_BODY · MAX_HINTS · `assertPayloadSize` |
| Rate / isolation | **PASS** (unit · **memory**) | per-key trip · key isolation · `RATE_LIMIT_BACKEND=memory` · no Upstash RL |
| Secret protection | **PASS** (emit path) | credential redact on plan/SSE/error/source content |
| Log + SSE + graph + error redaction | **PASS** | F suite + hardened scrub |
| Source-content sanitization | **PASS** | `sanitizeSourceContent` Acc+secret strip |
| providers DEEP_SKIP Acc | **PASS** (closed) | explicit DEEP_SKIP · `scrubProvidersState` pre-scrub · Acc QID values **and keys** · no identity laundering · providers key retained |
| Observability lite | **PASS** (unit) | structured log — no seed/Acc/credentials |
| Perf lite (timeout/cancel) | **PASS** (unit) | `withSourceTimeout` — fails closed; **never** bypasses SSRF |
| Live Preview QueryPlan urlTargets SSRF pack | **OPEN / optional** | **no live Vercel Preview redeploy this wave** — unit+runtime-wire PASS only; **do not invent Preview PASS** |
| Distributed / multi-instance rate | **OPEN** | memory Map only; Upstash wired for **sessionStore**, **not** Discovery RL |
| Production / promote | **HOLD** | no Chief promote order |

**Why PARTIAL (not full PASS / not PROMOTE):** Residuals for urlTargets **boundary+wire** and providers **DEEP_SKIP Acc** are closed at **unit + runtime-wire**. Live Preview pack and distributed rate remain OPEN. Honest close ≠ invented green.

---

## 2. Files touched (this residual-close wave)

| File | Role |
|------|------|
| `api/lib/discovery/security.js` | Acc scrub strengthen (forbidden QID **keys** + qid/entityRef fields) · existing fetch-gate helpers unchanged in contract |
| `api/lib/discovery/providers.js` | **WIRE:** `selectFetchablePlanUrlTargets` before `resolveWebOriginCandidates`; poison → zero plan urls; every candidate re-checked via `assertSafePublicHttpsUrl` |
| `api/lib/discovery/familyOrchestrator.js` | **WIRE:** on `web_origin`, inject gated `webOriginUrls` / plan targets into provider hints; poison → empty hop lists |
| `api/lib/discovery/orchestrator.js` | **WIRE:** one-hop block SSRF-filters via `assertSafePublicHttpsUrl`; plan poison → zero hops (QueryPlan path still skips ad-hoc one-hop) |
| `api/lib/discovery/security.checkpoint.test.mjs` | **117 PASS / 0 FAIL** (was 111; +Acc key scrub + runtime-wire contract) |
| `CHECKPOINT-F-SECURITY.md` | This close doc (re-stamped) |
| `CHECKPOINT-F-SECURITY/F-RESIDUALS-CLOSE-שרת.md` | Short שרת stamp note |

**Not collided:** `index.html` · UX polish · Core Acc P0 · B0 flag-OFF · A2-safe · C1 URL-alone→UNKNOWN · no QUERYPLAN default ON · no new F11 adapters · no Vercel promote.

---

## 3. Controls matrix (runtime wire detail)

| Control | Mechanism |
|---------|-----------|
| SSRF | `assertSafePublicHttpsUrl` / `assertFetchUrlSafe` — https-only, no userinfo, block private/metadata/raw IP + cloud aliases |
| Plan urlTargets (helpers) | Classify at plan build · boundary re-validate · **fail-closed fetch gate** |
| Plan urlTargets (**runtime**) | `providers.webOriginProvider.search` · `familyOrchestrator.executeFamilyCall(web_origin)` · `orchestrator` one-hop — all call `selectFetchablePlanUrlTargets` / `assertSafePublicHttpsUrl` |
| Fail-closed poison | Unsafe marked `safety=allowed` → `poison`/`failClosed` → **zero** plan/hop fetch URLs (safe seed alone may still proceed if individually safe) |
| Acc providers | DEEP_SKIP + `scrubProvidersState` — redact values & **keys** with forbidden QIDs; keep `providers` object present |
| F11 | No new HTTP provider families; one-hop still capped (≤3); no crawl expand |

---

## 4. Tests run (this stamp)

| Suite | Result |
|-------|--------|
| `security.checkpoint.test.mjs` | **117 / 0** |
| `webOrigin.test.mjs` | **96 / 0** (sanity after providers wire) |

Live Preview pack: **not run** · **OPEN**.

---

## 5. Residual risks (binding honesty)

1. **Live Preview QueryPlan `urlTargets` SSRF pack** — unit + runtime-wire green; end-to-end under flag-ON live Preview **not claimed** (no redeploy this wave).  
2. **In-memory rate limit** — demo/single-instance Preview scoped; **not** multi-instance distributed.  
3. **Obs stdout JSON** — ensure production log shippers do not re-inject seed (OPEN).  
4. **No promote** — F PARTIAL (unit+wire) does **not** authorize GO-MEASURE / production enablement.

**Closed this residual wave:**  
- urlTargets fetch-gate **runtime wire** (providers + family orch + orch one-hop) → **closed at unit+wire**.  
- providers DEEP_SKIP Acc (incl. forbidden QID **keys**) → **closed**.  
- Live Preview pack → still **OPEN/optional**.

---

## 6. Exit criteria checklist

- [x] Unit SSRF pack (block list) green  
- [x] Payload caps proven  
- [x] Log/SSE/graph/error redaction proven (unit)  
- [x] Source-content sanitization helper + tests  
- [x] Obs structured fields without Acc leakage  
- [x] Timeout/cancel fail-closed without SSRF bypass  
- [x] providers DEEP_SKIP explicit + scrub + no identity laundering  
- [x] Preview-oriented plan urlTargets fetch gate (simulation)  
- [x] **Runtime wire** of `selectFetchablePlanUrlTargets` into web_origin fetch path  
- [x] Rate limit memory harden + document (no invented Upstash RL)  
- [ ] Live Preview plan urlTargets SSRF (OPEN / optional)  
- [ ] Distributed rate / production log sample (OPEN)  
- [ ] Chief order to elevate PARTIAL → PASS for promote discussion (HOLD)

---

## STOP

**PARTIAL PASS (unit+runtime-wire)** · **NO PROMOTE** · HOLD · live Preview SSRF pack still OPEN/optional · distributed RL still OPEN
