# 11 — SECURITY MODEL · Chief Gate K

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT `12-SECURITY-MODEL.md` · IR Acc invariants · C1 SECURITY-BOUNDS · AS-IS urlSafety.js · emit.js · requestGuards.js

---

## 1. Threat → control matrix

| Threat | Control |
|--------|---------|
| SSRF / private / metadata IPs | `urlSafety.assertSafePublicHttpsUrl` before **every** fetch; QueryPlan cannot bypass |
| Open redirects | maxRedirects + re-validate each hop |
| Untrusted URLs / meta | metadata_only; no identity upgrade; Acc poison gates |
| Response bombs | maxResponseBytes |
| Provider abuse | budgets · rateLimitClass · fair-access |
| Query injection | structured lookups; MAX_SEED_CHARS; no eval(seed) |
| Credential isolation | server env only; never in plan JSON emit / SSE |
| Cross-session leakage | unguessable session ids; store isolation; Acc scrub |
| Provenance tampering | server-signed/stored provenance only; clients cannot inject planId truth |
| Cross-request contamination | no shared mutable provider caches keyed by seed without isolation; soft ER opaque |
| Acc identity leakage | sanitizeDiscoveryPayload on **all** emit surfaces **including plan/orchestration/SSE plan events** |

---

## 2. Acc scrub extends to plan/orchestration

Checklist before Preview GO:

- plan.reasons · intent queries · urlTargets · graph signalSummary · budget telemetry · family skip reasons  
- Forbidden identities version honored  
- No KV tokens, private IPs, credentials in logs/SSE/HIT  

Cite: SoT 11 · IR Acc · C1 Acc leak=0 gates.

---

## 3. Network boundaries

- Public HTTPS only for UrlOrigin  
- Trusted API hosts for B0/A2 adapters per existing allow patterns  
- No private-net targets · no browser automation  

---

## 4. Resource exhaustion

Budgets (08) are security controls as well as product caps. Safe empty ≫ unsafe rich (SoT 12).

---

## 5. Core lock

Discovery orchestration MUST NOT call Core identity commit / `mayCommitDossier`. Core Acc P0 unmodified (SoT 12 · 16).
