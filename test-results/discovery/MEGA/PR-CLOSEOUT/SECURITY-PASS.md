# SECURITY-PASS — PR-CLOSEOUT · Acc/QA (+ prior O audit)
**Stamp:** 2026-09-20T08:47:38+03:00 → 2026-09-20T08:49:39+03:00 IDT  
**Scope:** Discovery SSRF/URL/guards/session/logs · **No offensive scanning**  
**Promote:** **HOLD**

## Verdict: **PASS** (controls green for Preview; residuals accepted Preview-only)

## Control matrix

| Control | Status | Evidence |
|---------|--------|----------|
| SSRF / URL scheme | **PASS** | `urlSafety.js` https-only; reject javascript/data/file/blob |
| Private IP / localhost | **PASS** | 10/127/172.16–31/192.168/CGNAT/raw IPv4/IPv6 rejected |
| Metadata hosts | **PASS** | 169.254.169.254 · metadata.google.internal blocked |
| Suffix traps | **PASS** | `.localhost` / `.local` / `.internal` |
| Oversized seed/body/hints | **PASS** live | Preview rejected: seed>500, hints too large |
| Malformed / empty JSON body | **PASS** live | empty seed → `seed required` |
| Rate limit (create) | **PASS** unit | `checkDiscoveryRateLimit` trips after 40/min |
| Session isolation | **PASS** unit | independent scrub per sessionId; opaque `kv1.*` ids on Preview |
| Secret-in-logs | **PASS** | health exposes `kvCredsPresent` boolean only; no tokens in Acc artifacts |
| Acc scrub XSS-ish identity | **PASS** | leakage=0 full-surface |

## Live Preview security probes

| Probe | Rejected | leak | Result |
|-------|----------|------|--------|
| oversized-seed (600 chars) | yes · `seed exceeds 500 chars` | 0 | PASS |
| empty-seed | yes · `seed required` | 0 | PASS |
| malformed-hints-huge | yes · `hints too large` | 0 | PASS |

## Residual (accepted Preview · block promote if unaddressed later)

| ID | Note |
|----|------|
| O-AUTH-01 | Session GET/SSE/narrow unauthenticated (sessionId knowledge) |
| O-RL-01 | Rate limit process-local (not shared across instances) |
| O-DNS-01 | No resolve-time DNS-rebinding check (Discovery does not fetch arbitrary user URLs) |
| O-CORS-01 | `Access-Control-Allow-Origin: *` on Discovery routes |

## Artifacts
- `SECURITY-PASS.json`
- Units in `prCloseout.acc.test.mjs` + prior `failureInject.test.mjs` urlSafety asserts
- Companion: `../SECURITY-AUDIT.md`

## Decision
**SECURITY-PASS = PASS for Preview closeout evidence · HOLD promote**
