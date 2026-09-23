# 08 — ARCHITECTURAL QUESTION · CYCLE1 INTEGRATION REVIEW

**Stamp:** 2026-09-20T12:21:00+03:00 IDT  
**Question:** *Is the current provider-verbatim architecture sufficient to scale toward Maximum Public-Web Discovery?*  
**Mode:** Analysis only · **DO NOT IMPLEMENT**

---

## Answer: **NO**

Provider-verbatim fanout of the raw seed to a fixed adapter list is **necessary but not sufficient** for the product vision. Cycle-1 proved important **capability islands** (typed coalesce; WEB-ORIGIN Bound) on top of that architecture — and simultaneously proved its **scaling ceiling**.

---

## Why not sufficient (evidence-tied)

| Ceiling | Evidence | Implication |
|---------|----------|-------------|
| Intent blindness | S13–S15 compound/role/alias → 0 grounded; coverage proxy 9/15 | Same `q` string cannot serve URL, role, and name intents |
| Source monoculture | B0 = 3 adapters · 2 families · multi=0.0 | Cannot discover “across the web” without new families **and** routing |
| Authority orphans | S04 filings absent; DOMAIN_AUTHORITY gov/edu weights with no emitters | Ranking anticipates sources the pipeline never calls |
| Locale inert | S07 HE unused without caller locale | Verbatim + default `en` under-serves locale |
| URL path special-cased | C1 added provider + one-hop — still flag-gated Preview; not a general origin-resolution layer | Ad-hoc provider ≠ systematic URL-origin architecture |
| Independence attach ≠ discovery | A2 coalesce raises multi only when typed IDs already exist | Coalesce cannot invent missing source families |
| Safety success is not breadth | Acc=0 · Bound CLOSED · Rel12 PASS | Honesty scaled; **coverage** did not |

Chief decision context matches: C1 proved additional public-web discovery + UNKNOWN honesty; C1 did **not** prove broad coverage, generalized entity discovery, crawling, or org identity resolution.

---

## What remains valuable (do not discard)

- Soft ER opaque seed hash (non-identity).
- Provider adapter interface + soft-fail.
- Evidence fingerprint dedupe.
- Acc scrub emit surfaces.
- urlSafety SSRF envelope.
- Typed soft-ref coalesce ceiling SAME-REFERENCE (A2-safe).
- Relationship vocabulary + URL-alone UNKNOWN Bound (C1).
- Progressive session / SSE / narrow / facets.

These are the **safe substrate**. Evolution should extend them — not replace Acc/Bound discipline.

---

## Minimum architectural evolution required (analysis only)

Not a build list for this pack — the **smallest set** that could unlock vision-scale discovery without inventing relationships:

### 1. QueryPlan / intent routing (minimum)

Classify seed → plan steps (name | url/domain | role/compound | under-specified) → choose queries + facetHints + which provider families to call → cap fanout.  
**Why minimum:** Without it, every new provider still receives opaque bags (S12–S16 class failures persist).

### 2. Source orchestration / provider families

Register sources as **families** with independence semantics, budgets, and failure classes — not only a flat `DEFAULT_PROVIDERS` array. Enable Preview flags per family (pattern already used for VIAF / WEB-ORIGIN).  
**Why minimum:** Vision requires filings/news/scholarly/gov as peers, not one-off if-statements forever.

### 3. URL-origin resolution as a first-class path

Promote the C1 pattern from “extra provider” to a **planned origin-resolution stage** (metadata only; one-hop; Bound UNKNOWN; urlSafety) invoked by QueryPlan for URL/domain intents and optionally for discovered URLs.  
**Why minimum:** Public-web discovery without identity collapse depends on this path remaining honest.

### 4. Entity-type routing (lightweight)

Route person vs org-legal vs domain vs document toward family subsets (e.g. corp → filings candidate; person → VIAF/scholarly; domain → web_origin/RDAP).  
**Why minimum:** Stops expecting VIAF to fix Stripe (S04 lesson).

### 5. Evidence graph / relationship edges (complement, not identity)

Keep findings as nodes; typed SAME-REFERENCE attach; RELATED/POSSIBLE/UNKNOWN/CONTRADICTORY as edges — never dossier.  
**Why minimum:** Multi-independent and contradiction KPIs need graph-native representation beyond flat list UX (Phase3 schema gaps).

### 6. Adaptive discovery (later; not minimum-now)

Budget-aware secondary queries from discovered typed IDs — only after QueryPlan + family orchestration exist; still no open crawl.

---

## Explicitly out of minimum set

Indiscriminate crawling · identity scoring · title-bridge · domain-ownership inference · unbounded query expansion · promoting experimental flags to B0 without Chief GO.

---

## Sufficiency verdict box

```text
Provider-verbatim architecture:
  ✓ sufficient for Acc-safe B0 registry/page discovery
  ✓ extensible via Preview flags (A2, C1 proved)
  ✗ insufficient for Maximum Public-Web Discovery at vision scale

Minimum evolution:
  QueryPlan + source-family orchestration + first-class URL-origin path
  + entity-type routing + evidence-graph relationships
  (adaptive discovery later)

Implementation status this pack: NONE (analysis only)
```
