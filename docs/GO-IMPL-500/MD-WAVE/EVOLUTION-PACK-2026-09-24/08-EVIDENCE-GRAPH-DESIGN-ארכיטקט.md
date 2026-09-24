# 08 · Evidence Graph Design · ארכיטקט · 2026-09-24

**Status:** IMPLEMENTED (ceiling) + DESIGNED (growth rules)  
**Code:** `evidenceGraph.js`

---

## 1. Hard ceilings (do not weaken)
| Rule | |
|------|--|
| C1 | URL/title alone → `unknown` · never SAME-ENTITY on wire |
| `urlAloneCeiling` | web_origin / url|domain seed without typed soft-ref → unknown |
| Provenance | edges need planId/familyId/evidenceIds (strict when QueryPlan ON) |
| Forbidden | `same-entity` emit · identity commit from graph |

Closed vocab: `GRAPH_RELATIONSHIPS` · clamp only downgrades.

---

## 2. +20 families rule
New family findings attach as nodes with `familyId` + provenance.  
Graph builder must **not** special-case family ids for ceiling — only `hostFamily` / typed soft-ref / urlAlone signals.

---

## 3. Corroboration
Independent families (distinct hostFamily) may add `supports` / `possible-match` — **never** identity merge.  
Untrusted_web enrich (wave-2 origin) stays UNKNOWN.

| Piece | Tag |
|-------|-----|
| buildEvidenceGraph · clamp · scrub | IMPLEMENTED |
| Family-agnostic node attach for registry growth | DESIGNED |
| Rich multi-hop corroboration scoring | EXPERIMENTAL |

**Tag:** IMPLEMENTED / DESIGNED
