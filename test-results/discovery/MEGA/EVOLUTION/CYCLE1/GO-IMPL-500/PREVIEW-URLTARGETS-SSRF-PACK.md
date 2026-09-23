# PREVIEW-URLTARGETS-SSRF-PACK · GO-IMPL-500 · Backend / שרת

**Stamp:** 2026-09-23T22:42:14+03:00 IDT (Asia/Jerusalem)  
**Owner:** Backend / שרת  
**Wave:** Server lane — Preview urlTargets SSRF pack expand + RL memory harden + soft-fail/obs  
**Verdict:** **unit+wire PASS** · **live Preview OPEN** · **NO PROMOTE**  
**Locks:** F11 hold · Core/B0/A2/C1 frozen · flags default OFF · no production alias

---

## 1. Gate measurement (existing)

| Control | Location | Status |
|---------|----------|--------|
| `assertSafePublicHttpsUrl` / `isBlockedDiscoveryHost` | `api/lib/discovery/urlSafety.js` | PASS (https-only, no userinfo, block private/metadata/raw-IP/DNS-rebind suffixes) |
| `assertPlanUrlTargetsSafe` | `api/lib/discovery/security.js` | PASS — detects `UNSAFE_MARKED_ALLOWED` poison |
| `selectFetchablePlanUrlTargets` | `security.js` | PASS — poison → `failClosed` + **zero** urls |
| `runPlanUrlTargetsFetchGate` | `security.js` | PASS — re-assert before each simulated fetch |
| `simulatePreviewUrlTargetsSsrfPack` | `security.js` | PASS — expanded adversarial battery |
| Runtime wire | `providers.js` (web_origin) · `familyOrchestrator.js` · `orchestrator.js` (one-hop) | PASS (unit+wire) |

## 2. Adversarial fixture expand (this wave)

`simulatePreviewUrlTargetsSsrfPack` now exercises **43** unit-safe adversarial URLs + poison plans:

- localhost / `.localhost` / loopback IPv4+IPv6 / IPv4-mapped IPv6
- decimal / hex / short IP forms (`2130706433`, `0x7f000001`, `127.1`) — URL API normalizes → blocked
- cloud metadata (`169.254.169.254`, `metadata.google.internal`, `metadata.azure.com`, `instance-data`, `metadata`)
- k8s (`kubernetes.default`, `kubernetes.default.svc`)
- private / CGNAT / multicast / raw public IP (all raw IPs blocked for provenance)
- DNS-rebinding wildcards: `.nip.io` / `.sslip.io` / `.xip.io` / `localtest.me`
- schemes: `file://` · `ftp://` · `blob:` · `javascript:` · `data:` · `http://`
- userinfo: `user:pass@` and `user@`
- suffix traps: `.local` / `.internal`

**Poison cases (safety=allowed on unsafe):** mixed plan, DNS-rebind, file://, userinfo, decimal IP, http — all → `failClosed` + zero fetch.

**Clean plan:** public https allowed; declared-blocked traps excluded.

Pack result (local): **11/11 cases PASS** · `fixtureCount=43` · `livePreviewStatus=OPEN`.

## 3. Live Preview

| Item | Result |
|------|--------|
| Vercel project | `akvot-simple-demo` (`prj_Xm61SjyuvgYXDf7Vs0IxBXbDI5V5`) |
| list_deployments | **403 Forbidden** — scope `k-akvot` requires re-auth |
| Preview redeploy this wave | **NOT done** |
| Live flag-ON SSRF pack | **OPEN** (honest — do not invent Preview PASS) |
| Promote / production alias | **HOLD / NO promote** |

## 4. Tests

| Suite | Result |
|-------|--------|
| `security.checkpoint.test.mjs` | **186 / 0** (was 117) |
| `goImpl.harden.test.mjs` | **86 / 0** (was 79) |
| `budget.test.mjs` | **39 / 0** |
| `adapterContract.test.mjs` | **57 / 0** |
| `webOrigin.test.mjs` | **96 / 0** |
| `phase1.foundation.test.mjs` | **79 / 0** |

## 5. Files touched

- `api/lib/discovery/security.js` — expanded `simulatePreviewUrlTargetsSsrfPack`; version `2026-09-23.security-ssrf-pack2`
- `api/lib/discovery/security.checkpoint.test.mjs` — expanded SSRF block list + pack asserts + RL overflow/isolation
- `api/lib/discovery/requestGuards.js` — memory RL fail-closed overflow (see `MEMORY-RL-NOTE.md`)
- `api/lib/discovery/obs.js` — deny-list +hints/provenanceUrl/content/html/snippet/entityRef(s)
- `api/lib/discovery/goImpl.harden.test.mjs` — obs deny asserts

## 6. Exit honesty

- [x] Unit SSRF adversarial pack green  
- [x] Poison safety=allowed → failClosed proven  
- [x] Runtime wire still green (web_origin poison → empty findings)  
- [ ] Live Vercel Preview pack — **OPEN** (403 scope / no redeploy)  
- [x] NO promote  


## 7. ACTION-LOG

This wave: **81–87** (band after Arch 77–80; prior Server FF was 69–76). Honest **7** actions · not padded to 500.
