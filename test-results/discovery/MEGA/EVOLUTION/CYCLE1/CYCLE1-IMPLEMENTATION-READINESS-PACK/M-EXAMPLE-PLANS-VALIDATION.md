# M — EXAMPLE PLANS VALIDATION · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/14-EXAMPLE-PLANS.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

Eight conceptual plans: person, company, organization, domain, URL, document, ambiguous, no-match. Identity-safe checklist on all. **Not executed in this pack.**

## How plans will be tested later (planning only)

| Fixture | seedClass expect | Validation focus |
|---------|------------------|------------------|
| Ada Lovelace | person | KG/authority/bibliographic ordering; no title-bridge |
| Stripe, Inc. | company | Presence first; filings skipped honest if unwired (S04) |
| ICRC | organization | Granularity; no false coalesce |
| example.com | domain | UrlOrigin early; UNKNOWN Bound |
| https://…/about | url | Single-stage; BAD_URL_ALONE_SAME=0 |
| ISBN / work | document | bibliographic first |
| CEO of Stripe | ambiguous | Tight budget; empty OK |
| Xzqwl-9f3-… | unknown | Minimal B0; no crawl to force hit |

## Current code gap (as-is vs to-be)

| AS-IS (`api/lib/discovery/`) | TO-BE (SoT 14 validation later) |
|---|---|
| No plan goldens; verbatim `q` for all seeds | Golden plan JSON per 8 seed classes |
| No automated identity-safety checklist on plans | Checklist from SoT 14 cross-cutting section |
| IR seeds S04/S12–S16 used in packs historically | Mapped as CONTROL vs TREATMENT fixtures after GO |

## Proposed work packages

1. **WP-EX-GOLDEN-JSON** — Serialize expected plan shapes (reasons, intents, budgets)  
2. **WP-EX-DIFF** — CONTROL verbatim vs TREATMENT plan (measure later)  
3. **WP-EX-CHECKLIST** — Automate identity-safety checklist from SoT 14  
4. **WP-EX-CORPUS** — Map to Integration Review seeds S04/S05/S12–S16  

## Owner suggestion

Arch (golden expectations) · QA (runners after GO) · Acc (checklist).

## Risks

Treating examples as live provider wiring · over-fitting to happy paths.

## Exit criteria (when Chief GO executes measure)

- [ ] Each of 8 classes has golden plan snapshot  
- [ ] Identity-safety checklist 100% on goldens  
- [ ] No example requires new providers to “pass”  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
