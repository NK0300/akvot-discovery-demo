# 10 — RECOMMENDED EXPERIMENT

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Recommendation for Chief GO:** `CYCLE1-EXP-WEB-ORIGIN` — **EXP-WEB-ORIGIN (URL/Domain Origin Metadata)**  
**Mode if approved later:** Preview-only flag · B0/Core untouched · NO promote in experiment · does not mutate A2 frozen packs

---

## One recommendation

Implement a **Preview-flagged** provider/resolver that:
1. Detects seeds matching `https?://…` or bare public hostnames.
2. Canonicalizes via existing `urlSafety` / `assertSafePublicHttpsUrl` (https only; block private/link-local/metadata).
3. Fetches **origin metadata only** (HTML `<title>` / `og:site_name` / short description) — **no** link crawl, **no** `web_public` spider.
4. Emits Evidence `kind:page`, `hostFamily=web_origin`, provenanceUrl=origin, requires snippet/quote ≥40 chars or drop.
5. Optional demoted secondary: hostname token → existing WD/WP/OL query labeled `queryPurpose=domain_token` (same families; does not fake independence).
6. Acc scrub after emit; SSRF adversarial suite mandatory.

## Rationale tied to matrix

| Matrix fact | How C1 uses it |
|-------------|----------------|
| Live stack is registry/encyclopedia monoculture (WD/WP/OL ± VIAF Preview) | Adds **new** independence family `web_origin` |
| S16/S06 coverage = 0 grounded origin Evidence | Directly targets MAXIMUM **PUBLIC-WEB** DISCOVERY |
| DOMAIN_AUTHORITY has no web emitter | Creates real Evidence behind web hosts instead of prestige-only |
| A2 gain is seed-specific (rich crosswalk IDs) | Does not pretend to fix S04/S05 inside A2; orthogonal path |
| A2-bound rejected | Never uses title-bridge; origin URL is self-grounding |
| Prefer public/legal | Origin HTTPS metadata only; ToS/robots respect |
| MULTI is metric not goal | Success = grounded web Evidence present — multi may rise as side effect |

## Why not the other top candidates (as primary)

| Candidate | Why not primary now |
|-----------|---------------------|
| C2 HE-LOCALE | High value, lower risk — **recommended runner-up**; does not expand public-web surface or independence families |
| C3 SEC-EDGAR | Best for S04 authority coverage — strong **second wave** after web-origin path exists; higher compliance complexity |
| C4 NEWS | Freshness useful; higher FP; weaker authority |
| C6 QUERYPLAN | Complements C1; can ship as thin S1.5 alongside but SSRF+origin is the distinct product lever |

## Chief GO ask

**GO / NO-GO** on Preview implementation of `CYCLE1-EXP-WEB-ORIGIN` only.  
Explicitly **NO** promote · **NO** B0 alias move · **NO** A2 pack mutation · **NO** EXP-B unless separately GO'd (HE-LOCALE may be renamed/sequenced after GO).
