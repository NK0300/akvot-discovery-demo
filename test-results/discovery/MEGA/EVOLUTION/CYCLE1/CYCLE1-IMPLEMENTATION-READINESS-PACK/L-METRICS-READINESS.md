# L — METRICS READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/13-METRIC-MODEL.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Separate explainable dimensions: Relevance, Evidence strength, Source authority, Source diversity, Independence (**MULTI secondary**), Freshness (UNKNOWN until measured), Relationship certainty. Forbidden: single confidence %, raw findingsCount as success, chip count as independence, MULTI as sole promote gate, title-similarity identity.

## Current code gap

| AS-IS | TO-BE |
|---|---|
| Facets + findings counts | Multi-dimension report in Preview packs |
| A2 MULTI from coalesce | Keep secondary; never sole gate |
| Freshness not instrumented | Report UNKNOWN honestly |
| Vanity risk | Cap maxFindings; band checks in gates |

## Proposed work packages

1. **WP-MET-DIMS** — Pack section per dimension  
2. **WP-MET-MULTI-SEC** — Label MULTI secondary in all reports  
3. **WP-MET-GATES** — Safety gates block claims if regress (Acc/Bound/SSRF)  
4. **WP-MET-UNKNOWN** — Explicit UNKNOWN for unmeasured dims  

## Owner suggestion

Arch (definitions) · QA (corpus measure) · Acc (safety gates) · Server (counters).

## Risks

Promote-by-MULTI · inventing freshness numbers · findingsCount vanity.

## Exit criteria

- [ ] Preview packs report dimensions separately  
- [ ] MULTI never sole promote recommendation  
- [ ] Unmeasured dims = UNKNOWN  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
