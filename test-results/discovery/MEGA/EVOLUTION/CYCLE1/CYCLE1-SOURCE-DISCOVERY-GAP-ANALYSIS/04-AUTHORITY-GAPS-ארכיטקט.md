# 04 — AUTHORITY GAPS · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · Acc authority semantics: @דיוק  
**Mode:** Gap Analysis · DOCS ONLY · NO EXP-B · NO promote  
**Ties:** S04 = AUTHORITY/SOURCE COVERAGE LIMITATION · S05 = CROSS-ENTITY/AUTHORITY-GRANULARITY LIMITATION

---

## What “authority” means here

Discovery ranking uses `DOMAIN_AUTHORITY` prestige weights (WD 0.9 · gov heuristic 0.85 · OL 0.75 · EN-WP 0.7 · default 0.4).  
**Authority ≠ identity.** INFORMATION ≠ IDENTITY. Prestige alone must not license SAME-ENTITY.

---

## Authority gaps observed

| Gap ID | Description | Evidence | Classification |
|--------|-------------|----------|----------------|
| **AG-S04** | Modern corps (Stripe-class) lack intersecting typed authority IDs across families; VIAF/OL return person/work homonyms; WD company Finding may be absent | Hardening forensics · multi=0 | **AUTHORITY / SOURCE COVERAGE LIMITATION** (product limit, not bug) |
| **AG-S05** | Movement ≠ ICRC ≠ national society; authority files mint distinct VIAF/QID/OL; partial triangles only | Hardening · multi barely | **CROSS-ENTITY / AUTHORITY-GRANULARITY LIMITATION** |
| **AG-ORPHAN** | `*.gov` / `*.edu` / `*.gov.il` weights exist; **no provider emits** those hosts | ARCH-SOURCE-INVENTORY | Emitter / family absence |
| **AG-HE-WP** | `he.wikipedia.org` missing from DOMAIN_AUTHORITY → default 0.4 if emitted | providers.js + store.js | Ranking disincentive for HE wiki |
| **AG-THIN** | High prestige + thin/empty quote (WP thin≈100% B0) still rank-boosted | PHASE4 source-analysis | Authority-without-evidence (SQ-AUTH-EV blind spot) |
| **AG-LEGAL** | No filings/registry legal-name authority for corps | inventory | Family absence — candidate filings/gov_registry |

---

## S04 / S05 — locked product limits

### S04 Stripe — AUTHORITY/SOURCE COVERAGE LIMITATION

- Zero cross-family typed joins under Bound#1 is **correct**.  
- Recovery bounds (design-only): typed enrich paths only — **forbidden** title/sim/substring/force-merge.  
- **Do not manufacture S04 recovery** in next experiment framing.

### S05 Red Cross — CROSS-ENTITY/AUTHORITY-GRANULARITY LIMITATION

- Distinct real entities must stay distinct (RELATED-ENTITY / UNKNOWN — not SAME).  
- Partial SAME-REFERENCE where typed keys truly intersect is OK.  
- **Do not collapse** movement/society/national into one Finding to chase multi.

Canonical: HARDENING `04-S04-S05-RECOVERY-BOUNDS-ארכיטקט.md` · `CLOSED-EXPERIMENTAL-BASELINE-ארכיטקט.md`.

---

## Authority vs product objective

| Wrong framing | Right framing |
|---------------|---------------|
| “Raise multi on S04/S05” | Expand **truthful public-web discovery** surface |
| “More prestige domains” | Authority **with evidence** + independent families |
| “Wiki is official enough” | Legal/registry/filings for corp legal identity when needed |

---

## OWNER

| Who | Fill |
|-----|------|
| **@דיוק** | Acc definition of authority-with-evidence gates |
| **@שרת** | Which public authority APIs are legally usable |
