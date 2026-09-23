# 18 — DEFINITION OF IMPLEMENTATION READY · Chief Gate R

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Purpose:** Objective conditions before Chief may issue next **GO for implementation** (still not a promote GO).

---

## Ready when ALL hold

1. **SoT freeze honored** — Architecture SoT 01–18 + D0 unchanged; this pack cites only.  
2. **Contracts complete** — Docs 00–21 + STATUS + CHIEF-REVIEW-PACK + FILE-INDEX present; Gates A–R covered without contradiction to SoT.  
3. **Locks restated** — B0 LOCKED · Core LOCKED · A2-safe FROZEN · A2-bound REJECTED · C1 Bound FROZEN · PROMOTE HOLD · no D1/D2/providers/crawl.  
4. **Identity-safety closed** — SAME-ENTITY forbidden; URL-alone UNKNOWN; title-bridge forbidden; ownership forbidden; UNKNOWN axioms stated.  
5. **Budget + kill-switch specified** — hard caps + flag OFF rollback to B0 verbatim.  
6. **Migration dual-run specified** — flag OFF path identical; Core untouched.  
7. **Acceptance matrix testable** — each invariant has test idea + failure condition + evidence type.  
8. **Do-not-implement register** — explicit forbidden list.  
9. **Open questions listed** — unresolved items do not silently block; Chief can decide.  
10. **No code in this pack** — planning only; AS-IS code map read-only.  
11. **Schemas design-only** — optional JSON schemas mirror contracts; not runtime-wired.  
12. **Sequencing proposed** — phased Preview flags; still NO impl until GO.

---

## Explicitly NOT claimed by “Implementation Ready”

- Implementation correctness  
- Measured KPI lifts  
- Promote readiness of QueryPlan / A2 / C1  
- Authority to enable Preview flags in production  
- Resolution of all open architectural questions  

---

## Chief next GO types (distinct)

| GO | Meaning |
|----|---------|
| GO-IMPL-PREVIEW | Allow code behind flags OFF-by-default (future) |
| GO-MEASURE | Allow CONTROL vs TREATMENT evidence pack (future) |
| GO-PROMOTE-* | Separate; default HOLD |

This pack requests **review only**, not GO-IMPL.

---

## PRE-GO POINTER (2026-09-21)

**Normative DoR for RED closure** elevated to:  
`../PRE-GO-RED-CLOSURE/18-DEFINITION-OF-IMPLEMENTATION-READY.md`  
(columns Requirement|Test|Failure|Evidence|Rollback). This ARCHIVE-18 remains the historical Gate-R source elevated by `CANON-MERGE-MAP.md`.
