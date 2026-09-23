# MEGA O — SECURITY-AUDIT
**Date:** 2026-09-20 ~07:30 IDT (Asia/Jerusalem UTC+3)  
**Owner:** Executor (O Security + L Obs + N Failure)  
**Scope:** Discovery (`api/lib/discovery/*`, `api/discovery/*`) — additive only  
**Promote:** **HOLD / NO** · Prod Acc P0 / Core alias untouched

## Executive summary

| Severity | Count | Notes |
|----------|------:|-------|
| P0 | 0 open | `.localhost` / `.local` / `.internal` SSRF gap **CLOSED** this run |
| P1 | 2 residual | Unauthenticated session read (Preview by-design); in-memory rate limit only |
| P2 | 3 | DNS-rebinding; CSP `unsafe-inline`; CORS `*` on Discovery |

**Promote stays HOLD:** **yes**.

## Findings

### P0 — CLOSED this run
| ID | Finding | Fix |
|----|---------|-----|
| O-SSRF-01 | `urlSafety` allowed `*.localhost`, `*.local`, `*.internal` (Node maps `*.localhost` → loopback) | Hardened `urlSafety.js`: suffix traps + full private IPv4 (172.16–31, CGNAT) + reject all raw IPs + dangerous schemes |
| O-SSRF-02 | Cite-or-drop could accept those hosts as provenance | `normalizeRawHit` → `assertSafePublicHttpsUrl` (tests cover javascript/data/file/.localhost) |

### P1 — residual / accepted for Preview
| ID | Finding | Status | Recommendation |
|----|---------|--------|----------------|
| O-AUTH-01 | Session GET/SSE/narrow unauthenticated; knowledge of `sessionId` = access | **Accepted Preview** | Auth before promote; opaque KV ids help |
| O-RL-01 | Create rate limit is process-local Map (not shared across serverless instances) | **Mitigated** | `requestGuards.checkDiscoveryRateLimit`; shared limiter needs KV |

### P2
| ID | Finding | Notes |
|----|---------|-------|
| O-DNS-01 | Hostnames resolving to private IPs (DNS rebinding) not blocked at resolve-time | Discovery does not fetch arbitrary user URLs; gate is hostname-based |
| O-XSS-01 | CSP allows `script-src 'unsafe-inline'` | vercel.json; Discovery UI uses `esc` + https-only href |
| O-CORS-01 | Discovery routes `Access-Control-Allow-Origin: *` | Demo Preview; tighten before promote |
| O-INFO-01 | `getStoreInfo()` may include `fsDir` path | Client routes should use `publicStoreInfo` (strips fsDir) |

## Control checklist

| Control | Status | Evidence |
|---------|--------|----------|
| SSRF / URL scheme | **GREEN** (post-fix) | https-only; block javascript/data/file/blob; private/metadata hosts; raw IP reject |
| Redirect follow | N/A Discovery | Fixed public provider APIs; Core lookup has manual redirect re-validate |
| Rate limits | **PARTIAL** | Create: 40/min/key in-memory |
| Request size | **GREEN** | `MAX_SEED_CHARS=500` + hints/body caps in `requestGuards.js` + orchestrator |
| XSS / Acc scrub | **GREEN** | `sanitizeDiscoveryPayload` on snapshot/SSE/narrow; UI esc/safeHref |
| Session isolation | **PARTIAL** | Opaque ids on KV; fs-regen encodes seed in id (Preview limitation) |
| Secret leakage in logs | **GREEN** | Telemetry: boolean `kvCredsPresent` only; no tokens |
| Acc scrub emit paths | **GREEN** | SCRUB-STATIC-ANALYSIS + adversarial + failureInject SSE scrub assert |
| Dependency CVEs | **N/A** | No runtime npm deps in package.json — **no invented CVEs** |

## Fixes applied this run (safe, additive)
1. `api/lib/discovery/urlSafety.js` — hardened host/scheme gate  
2. `api/lib/discovery/requestGuards.js` — seed/body size + rate limit  
3. Wired guards into `api/discovery/sessions/index.js`  
4. Seed length enforcement in `createDiscoverySession`  
5. SSE lifecycle metrics in `obs.js` / `sse.js`  
6. Tests: `api/lib/discovery/failureInject.test.mjs`

## Non-goals / HOLD
- No Prod Acc P0 / Core alias changes  
- No promote  
- No offensive scanning  
- No inventing KV secrets or CVEs  
