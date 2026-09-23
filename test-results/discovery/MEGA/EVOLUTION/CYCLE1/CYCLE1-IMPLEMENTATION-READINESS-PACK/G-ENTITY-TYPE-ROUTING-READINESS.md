# G — ENTITY-TYPE ROUTING READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/08-ENTITY-TYPE-ROUTING.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

SeedClassRouter changes discovery intent/family selection — **NOT** identity classifier/scoring. Classes: person, company, organization, domain, url, document, ambiguous, unknown. Errors degrade to ambiguous/unknown.

## Current code gap

| AS-IS | TO-BE |
|---|---|
| No seedClass; person-centric bias via verbatim fanout | Lightweight heuristic router → plan input |
| Soft ER opaque seed hash only | Router may read known typed refs; must not invent |
| Company seeds still hit VIAF-first culture (S04 lesson) | Prefer filings/registries/news when families exist; honest skip if not |
| URL seeds treated like name strings (S16) | Early WEB_ORIGIN intent |

## Proposed work packages

1. **WP-ET-DETECT** — Heuristic seedClass detector (fallible → ambiguous)  
2. **WP-ET-ROUTE-TABLE** — Intent/family preference tables from SoT 08  
3. **WP-ET-NO-SCORE** — Forbid confidence-% UI / identity scores  
4. **WP-ET-OBS** — Emit seedClass + reasonSelected  

## Owner suggestion

Arch (tables) · Server (detector) · Acc (no identity tokens) · QA (S04/S12–S16 regression cases).

## Risks

Mis-classification → suboptimal plan (acceptable) vs false SAME-* (unacceptable) · scoring theater.

## Exit criteria

- [ ] Wrong class never produces SAME-*  
- [ ] Ambiguous/unknown → tight/minimal budgets  
- [ ] No scoring percentage in Discovery experimental emit  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
