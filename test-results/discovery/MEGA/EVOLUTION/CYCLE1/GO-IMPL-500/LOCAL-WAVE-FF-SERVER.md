# LOCAL-WAVE-FF-SERVER · Backend (שרת) · GO-IMPL continue

**Stamp:** 2026-09-23T22:40:00+03:00 Asia/Jerusalem (IDT, UTC+3)  
**Workspace:** `/workspace/akvot-quick-demo` (local only · **NOT GitHub**)  
**Lane:** Server / Security  
**Author:** Backend (שרת)  
**Promote:** **NO** · **NO** Vercel alias · locks F11 / Core / B0 / A2 / C1 frozen  
**Flags:** QueryPlan / VIAF / webOrigin **default OFF** (gated tests only)

---

## Verdict

**PASS (unit + local simulate)** on Server/Security surface.  
**NOT** live Preview PASS. **NOT** promote authorization. **NOT** Acc P0 unfreeze.

Local Preview-oriented urlTargets SSRF pack **closed at unit+simulate+runtime-wire**.  
**LIVE Preview** flag-ON e2e pack remains **OPEN** (box cannot hit a real Preview deploy this wave — do not invent PASS).

---

## What landed

### 1) Preview-oriented urlTargets SSRF pack (advanced / locally closed)
- DNS-rebinding / local-dev wildcards blocked: `.nip.io` · `.sslip.io` · `.xip.io` · `localtest.me`
- `simulatePreviewUrlTargetsSsrfPack()` — poison / clean / traps / dns-rebind-marked-allowed-is-poison
- Runtime wire proven: `webOriginProvider.search` with poison plan + non-URL seed → **zero** findings (no private fetch)
- Explicit residual: **LIVE Preview still needed** for flag-ON e2e under real Vercel Preview

### 2) Harden residuals (only real gaps)
- Prior wave already closed budget latch / cancel≠timeout / soft-fail / obs deny-list
- **This wave:** rate-limit **honesty** — 429 returns `distributed:false` + `upstashWiredForRateLimit:false`; API body carries `rateLimit` extras
- Adapter fetch **redirect re-gate**: `safeFetchJson` `redirect:'manual'` + `resolveAdapterRedirectUrl` (SSRF+allowlist each hop)

### 3) Deepen existing adapters only (F11 hold)
- `stampRegistryFinding` on WD / OL / WP / VIAF:
  - cite-or-drop via `assertSafePublicHttpsUrl`
  - clamp SAME-* → UNKNOWN
  - candidate≠fact / identityClaim:false / evidenceType stamps
- Wikipedia no longer accepts non-public https provenance (was https-prefix only)

---

## Files changed

| File | Change |
|------|--------|
| `api/lib/discovery/urlSafety.js` | DNS-rebinding host traps |
| `api/lib/discovery/security.js` | `simulatePreviewUrlTargetsSsrfPack` · version `security-ff-server` |
| `api/lib/discovery/adapterContract.js` | redirect manual + resolve · version `adapter-harden2` |
| `api/lib/discovery/providers.js` | `stampRegistryFinding` on WD/OL/WP/VIAF |
| `api/lib/discovery/requestGuards.js` | RL honesty fields on trip/ok |
| `api/discovery/sessions/index.js` | 429 `rateLimit` extras |
| `api/lib/discovery/security.checkpoint.test.mjs` | traps / sim / wire / stamp / RL |
| `api/lib/discovery/adapterContract.test.mjs` | redirect SSRF units |
| `…/GO-IMPL-500/ACTION-LOG.md` | rows **69–76** |
| `…/GO-IMPL-500/LOCAL-WAVE-FF-SERVER.md` | this report |

---

## Test results (this wave)

| Suite | Result |
|-------|--------|
| `security.checkpoint.test.mjs` | **143 / 0** |
| `adapterContract.test.mjs` | **57 / 0** |
| `goImpl.harden.test.mjs` | **79 / 0** |
| `webOrigin.test.mjs` | **96 / 0** |
| `budget.test.mjs` | **39 / 0** |
| `providers.viaf.test.mjs` | **44 / 0** |
| `phase1.foundation.test.mjs` | **79 / 0** |
| `phase2.engine.test.mjs` | **57 / 0** |
| `checkpointB.e2e.test.mjs` | **36 / 0** |
| `failureInject.test.mjs` | **51 / 0** |

---

## ACTION-LOG range

- Prior max at wave start: **68**
- This wave: **69–76** (8 meaningful rows · **not padded**)
- Parallel UX lane used **90–94** (non-colliding; not claimed here)

---

## Open residuals / STOP reason

1. **LIVE Preview QueryPlan urlTargets SSRF pack** — still **OPEN**. Unit+local-sim+runtime-wire green; real Preview flag-ON measure **not run** from this box (no live Preview redeploy / no invent PASS).
2. **Distributed / multi-instance rate limit** — still **OPEN** (honest: memory Map only; documented on 429).
3. **Production obs log-shipper seed re-injection sample** — still OPEN.
4. Locks remain: no Core Acc P0 / B0 Discovery semantic changes · no A2-safe / C1 WEB-ORIGIN unfreeze · no F11 new HTTP adapters · flags default OFF · **NO promote**.

### STOP
**Local SSRF pack closed · LIVE Preview residual remains · NO PROMOTE.**  
Stopped after green units + honest docs; further LIVE Preview work needs a reachable Preview URL / Chief order (out of box scope this wave).

---

## Explicit

**NO promote** · **NO** production alias · **NO** GitHub push · Prefer UNKNOWN over wrong identity · Public sources only.
