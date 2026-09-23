# 10 — FP CASES ×5 · Rejected coalesces (high title sim, insufficient id)

**Stamp:** 2026-09-20 10:35 IDT  
**Definition of FP here:** A coalesce that **would have been wrong** if title-only were allowed — correctly **rejected** by Bound#1 / A2-safe policy.

All cases labeled **unit/fixture** unless marked live caveat.

---

### FP-1 · Exact title, no typed id (unit/fixture)

- **Sim:** title exact `Tim Berners-Lee` ×3 families  
- **Ids:** none shared  
- **Wrong if merged:** would union Evidence across unrelated registry rows  
- **Actual:** REJECT · single-family · no edge  

### FP-2 · Homonym person names, distinct VIAF (unit/fixture)

- **Sim:** identical display title  
- **Ids:** distinct `viaf:` / `qid:`  
- **Wrong if merged:** soft-ref cross-contam / inflated multi  
- **Actual:** REJECT · 3 kept · no cross-contam  

### FP-3 · Stripe vs Stripe, John (unit/fixture + live S04)

- **Sim:** high prefix / shared token  
- **Ids:** corp vs person VIAF diverge  
- **Wrong if merged:** Pretty-Wrong identity conflation  
- **Actual:** REJECT  

### FP-4 · Partial typed forms, no intersection (unit/fixture)

- **Sim:** high title overlap  
- **Ids:** `qid:` on A, different `viaf:` on B  
- **Wrong if merged:** treating “has some id” as “same id”  
- **Actual:** REJECT  

### FP-5 · Title-bridge inflation on FRNDab (live caveat · NON-promote)

- **Sim:** title: coalesce produced mean multi ~0.44–0.52  
- **Ids:** insufficient strong-key discipline  
- **Wrong if promoted:** Arch CAVEAT — Evidence attach across title-homonyms  
- **Actual:** Documented NON-promote; Bound#1 removed `title:`  

---

**Takeaway:** High title similarity is necessary-but-not-sufficient; typed soft-ref intersection is mandatory.
