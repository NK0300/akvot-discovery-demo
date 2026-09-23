# E — URL-ORIGIN STAGE READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/06-URL-ORIGIN-INTEGRATION.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Elevate WEB-ORIGIN to **early discovery stage** via intent `DISCOVER_OFFICIAL_WEB_ORIGIN`. **Preserve C1 Bound** (FROZEN). Preview-flag only path. Production B0 without web_origin until Chief promote GO.

Bound non-negotiable: URL/domain alone → UNKNOWN · never typed soft-ref mint · SAME-ENTITY forbidden · BAD_URL_ALONE_SAME=0 · seed-is-URL self-cite → UNKNOWN.

## Current code gap

| AS-IS | TO-BE |
|---|---|
| `webOrigin.js` + flag `DISCOVERY_ENABLE_WEB_ORIGIN=1` as trailing/provider + one-hop post-batch | UrlOriginStage first-class; early for url/domain seeds |
| Invoked as provider in flat list | Invoked by QueryPlan intent + stage placement |
| C1 Bound semantics present | Must not regress; KEEP FAIL pre-patch evidence |

**Reuse C1 Bound · Preview-flag only** — no promote, no crawl, no recursion beyond one-hop budget.

## Proposed work packages

1. **WP-UO-STAGE** — Stage API wrapping existing webOrigin metadata fetch (no crawl)  
2. **WP-UO-INTENT** — Wire intent DISCOVER_OFFICIAL_WEB_ORIGIN in planner (Preview)  
3. **WP-UO-EARLY** — seedClass url/domain → early stage ordering  
4. **WP-UO-ONEHOP** — Late optional one-hop under maxUrls; no recursion  
5. **WP-UO-BOUND-GATES** — Acc/QA: BAD_URL_ALONE_SAME=0 · SSRF PASS · UNKNOWN labels  

## Owner suggestion

Server (stage) · Arch (placement) · Acc (Bound/Acc) · QA (SSRF + URL-alone suite).

## Risks

Regression to SAME-REFERENCE-on-URL-alone · crawl creep · ownership inference · Acc poison via og:title.

## Exit criteria

- [ ] Flag off → no web_origin calls (B0 unchanged)  
- [ ] Flag on + url/domain seed → early UrlOriginStage  
- [ ] BAD_URL_ALONE_SAME=0 · SSRF suite PASS  
- [ ] No typed soft-ref mint from web_origin  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
