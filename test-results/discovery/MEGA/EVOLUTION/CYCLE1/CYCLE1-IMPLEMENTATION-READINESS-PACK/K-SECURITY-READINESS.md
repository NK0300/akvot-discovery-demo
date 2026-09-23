# K — SECURITY READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/12-SECURITY-MODEL.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Orthogonal controls: urlSafety SSRF envelope · maxRedirects re-validate · maxResponseBytes · budgets/rate limits · seed caps · credential isolation · session isolation · poisoned metadata ceiling · Acc sanitize on all emit including plan. Discovery MUST NOT call Core identity commit.

## Current code gap

| AS-IS | TO-BE |
|---|---|
| `urlSafety.js` assertSafePublicHttpsUrl — KEEP | Every UrlOriginStage + any plan urlTarget |
| `emit.js` sanitizeDiscoveryPayload — KEEP | Extend to queryPlan / graph summaries |
| C1 SSRF PASS evidence | Must hold under QueryPlan path (no bypass) |
| Core untouched | Migration forbids Core edits |

## Proposed work packages

1. **WP-SEC-URL** — Plan urlTargets pass urlSafety or marked blocked (no fetch)  
2. **WP-SEC-ACC** — sanitize plan/graph/SSE extensions  
3. **WP-SEC-REDIRECT** — maxRedirects + re-validate each hop  
4. **WP-SEC-CORE-LOCK** — Static/CI guard: no mayCommitDossier from Discovery orch  
5. **WP-SEC-POISON** — Meta untrusted; Acc poison patterns gated  

## Owner suggestion

**Acc** (lead) · Server (urlSafety hooks) · QA (SSRF suite) · Arch (orthogonality).

## Risks

QueryPlan bypassing urlSafety · Acc leak via new fields · credential in plan JSON.

## Exit criteria

- [ ] SSRF suite PASS under Preview path  
- [ ] Acc leakage=0 · Core pw/leak=0  
- [ ] Plan JSON contains no credentials  
- [ ] Safe empty preferred over unsafe rich  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
