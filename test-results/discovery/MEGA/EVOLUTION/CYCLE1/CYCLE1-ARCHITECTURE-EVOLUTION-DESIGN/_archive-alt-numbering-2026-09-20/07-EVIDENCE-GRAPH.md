# 07 — EVIDENCE GRAPH · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · complement to findings list · **not a dossier**

---

## Purpose

Represent discovery results as an explicit graph so multi-independent, contradiction, and relationship KPIs are native — without collapsing into identity dossiers.

Cite: Integration Review minimum item 5; Phase3 schema gaps; A2/C1 vocabulary.

---

## Node types

| Node type | Meaning |
|-----------|---------|
| `seed` | User seed (opaque soft hash may annotate; not identity) |
| `finding` | Normalized discovery finding |
| `evidence` | Evidence row (quote/summary/url/provider) |
| `reference` | Typed soft-ref (`qid:` / `viaf:` / `ol:` / future typed) |
| `url` | Canonical URL |
| `domain` | Registrable domain |
| `document` | Document/work metadata node |
| `organization` | Org **mention/presence** node (not legal identity commit) |
| `person` | Person **mention/presence** node (not Core identity) |
| `source` | Provider or family source descriptor |

**Caution:** `person` / `organization` nodes are **graph labels for routing/display**, not SAME-ENTITY assertions.

---

## Edge types

| Edge | Meaning | Attach? |
|------|---------|---------|
| `supports` | Evidence supports Finding | n/a |
| `derived-from` | Node derived from another (e.g. domain from url) | n/a |
| `same-reference` | Shared typed soft-ref across hostFamilies (A2-safe) | YES (typed path only) |
| `same-entity` | Identity collapse | **FORBIDDEN** under experimental Discovery lanes |
| `related-entity` | Documented relatedness ≠ identity | NO |
| `possible-match` | Soft lexical / incomplete typed path | NO |
| `contradicts` | Explicit conflict | NO |
| `unknown` | Explicit UNKNOWN relationship | NO |

---

## Provenance requirement

**Every edge MUST carry provenance:**

```text
edgeProvenance = {
  planId, intentId, familyId, providerId?,
  evidenceIds[], softRefKeys?,
  signalSummary,   // human-readable, Acc-scrubbed
  createdAt
}
```

**No implicit edges.** If the system cannot cite provenance, it must not create the edge (emit UNKNOWN or omit).

---

## Mapping from today’s store

| Today | Graph |
|-------|-------|
| Finding + Evidence[] | finding ←supports— evidence |
| coalesceBySoftEntity | same-reference edge + merged evidence |
| detectContradictions | contradicts edges |
| web_origin label UNKNOWN | unknown edge seed↔url or finding↔url |
| facets | projections over graph, not new edges |

---

## UX compatibility

SSE/NARROW/HIT may continue to expose flat findings lists derived from the graph. Graph is the **internal honesty model**; flat list is a view.

---

## Non-goals

- Building a user-facing “identity dossier”  
- Auto same-entity edges from URL/title/domain  
- Mutating historical evidence packs to backfill graphs  
