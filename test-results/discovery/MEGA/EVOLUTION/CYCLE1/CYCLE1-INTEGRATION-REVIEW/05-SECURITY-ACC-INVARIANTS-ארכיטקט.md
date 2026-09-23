# 05 — SECURITY & ACC INVARIANTS · ארכיטקט

**Stamp:** 2026-09-20 12:22 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · Integration Review  
**Parents:** C1 `04-SECURITY-BOUNDS-ארכיטקט.md` · Acc `ACC-PATCHED.md` · A2 Acc scrub practice · HARDENING vocabulary

---

## Invariant set (must hold on any future Preview work)

### 1. urlSafety (fail closed)

All URLs entering discovery normalize/fetch **MUST** pass existing `urlSafety` / `assertSafePublicHttpsUrl` contract:

- https only (after upgrade re-validate)  
- No userinfo · no dangerous schemes  
- Block: localhost / private / link-local / metadata / internal / raw IP provenance / weird numeric hosts  
- Redirects: re-assert safety every hop · cap (C1 Preview: `MAX_REDIRECTS = 3`)  
- Timeout + body size caps · candidate cap (C1: `MAX_ONE_HOP_URLS = 5`) — **no crawl frontier**

Source: C1 `04-SECURITY-BOUNDS-ארכיטקט.md` · Acc SSRF **PASS** on C1-PATCHED

### 2. Acc scrub

- Scrub forbidden Q-ids from findings / evidence / facets / contradictions / GET / narrow / SSE surfaces  
- Leak target: **0** (Cycle1 packs cite leak=0 on B0, A2-safe, C1-PATCHED)  
- ProvenanceUrl remains public https only after scrub  

Source: C1 `ACC-PATCHED.md` · Acc STATUS-דיוק · A2 Baseline

### 3. Forbidden QIDs / poison surface

Acc poison Q surface must stay **0** (cited on C1-PATCHED re-AFTER). Do not emit or echo forbidden identity ids into user-visible or metric surfaces.

### 4. No identity collapse

| Forbidden shortcut | Why |
|--------------------|-----|
| URL/host/domain → SAME-ENTITY or SAME-REFERENCE | C1 Bound · Acc FAIL on PREPATCH |
| title: / string sim → attach | A2-bound REJECTED |
| RELATED / POSSIBLE → attach | Vocab ceilings |
| UNKNOWN forced to SAME-* “to look complete” | UNKNOWN ≠ SAME |
| Dossier / Core identity rewrite from Discovery Preview | Core LOCKED |

### 5. Preview vs production

| Surface | Rule |
|---------|------|
| B0 Discovery | **LOCKED** — no experimental flag as default |
| Core | **LOCKED** — pw/leak 0/0 preserved |
| Preview flags | `DISCOVERY_ENABLE_VIAF=1` · `DISCOVERY_ENABLE_WEB_ORIGIN=1` — Preview only · not B0 `DEFAULT_PROVIDERS` without Chief GO |

---

## Cited PASS snapshots (historical — do not mutate)

| Check | C1-PATCHED `dpl_Ho6jg…` |
|-------|-------------------------|
| Acc leak | **0** |
| URL-alone SAME-* | **0** |
| SSRF | **PASS** |
| Core pw / leak | **0 / 0** |
| who.int labels | **UNKNOWN** |

---

## Explicit security non-goals

- Open-web crawler / sitemap follow  
- Unrestricted fetch / ftp/file/data  
- Security exceptions for “known-good” private IPs  
- Enabling web_origin on Production/B0 without Preview flag + Chief GO  

---

## OWNER slots

| Role | Optional confirm |
|------|------------------|
| **@דיוק** | Acc invariant checklist still green on frozen dpls |
| **@שרת** | urlSafety + flag gating unchanged on B0/Core |

---

## STOP

Invariants above are **HOLD conditions** for any next GO. Breaking them is Acc FAIL / Security FAIL — not a tradeoff for multi.
