# F-RESIDUALS-CLOSE · שרת (Backend)

**Stamp:** 2026-09-23T21:39:34+03:00 IDT (Asia/Jerusalem)  
**Actor:** Backend / שרת worker  
**Promote:** **NO** · F11: **NO** · Core/B0/A2/C1: **untouched**

## Closed residuals

1. **QueryPlan urlTargets SSRF — runtime wire (fail-closed)**
   - `providers.js` `webOriginProvider.search`: if `hints.queryPlan` / `urlTargets` / `planUrlTargets` → `selectFetchablePlanUrlTargets`; poison/failClosed → **zero** plan urls; seeds still individually pass `assertSafePublicHttpsUrl`.
   - `familyOrchestrator.js`: on `web_origin`, inject gated `webOriginUrls` + plan hints into provider search.
   - `orchestrator.js` one-hop (~641+): filter via `assertSafePublicHttpsUrl`; plan poison → zero hops. No crawl expand.

2. **providers DEEP_SKIP Acc**
   - `scrubProvidersState` strengthened: forbidden QID **keys** + `qid`/`entityRef(s)` fields; providers object retained.

## Evidence

- `security.checkpoint.test.mjs`: **117 PASS / 0 FAIL**
- `webOrigin.test.mjs`: **96 / 0**
- Live Vercel Preview pack: **not redeployed · still OPEN/optional**

## Verdict

**PARTIAL PASS (unit+runtime-wire)** · **NO PROMOTE**

## Files

- `api/lib/discovery/security.js`
- `api/lib/discovery/providers.js`
- `api/lib/discovery/familyOrchestrator.js`
- `api/lib/discovery/orchestrator.js`
- `api/lib/discovery/security.checkpoint.test.mjs`
- `CHECKPOINT-F-SECURITY.md`
- this note

No collision with `index.html` / UX polish.
