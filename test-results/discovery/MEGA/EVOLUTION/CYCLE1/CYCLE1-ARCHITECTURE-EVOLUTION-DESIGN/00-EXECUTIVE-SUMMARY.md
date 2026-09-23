# 00 — EXECUTIVE SUMMARY · CYCLE1 ARCHITECTURE EVOLUTION DESIGN PACK

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/`  
**Mode:** DESIGN DOCUMENTS ONLY

---

## מה החבילה · What this pack is

The **minimum architecture design** to evolve Akvot Discovery from provider-verbatim fanout toward:

**intent/entity-type understanding → QueryPlan → source-family orchestration → evidence collection → URL-origin expansion → relationship classification → evidence graph → progressive delivery**

— without identity guessing, without crawl, without promote, without new providers, without implementing QueryPlan.

---

## למה · Why (evidence-tied)

Integration Review concluded provider-verbatim is **Acc-safe but insufficient** for Maximum Public-Web Discovery (intent blindness, source monoculture, authority orphans, URL path special-cased). Minimum evolution was outlined analysis-only; **this pack specifies that evolution as design contracts**.

Cite: `CYCLE1-INTEGRATION-REVIEW/08-ARCHITECTURAL-QUESTION.md` · `09-CHIEF-RECOMMENDATION.md`.

---

## מנעולים · Locks honored

B0 LOCKED · Core LOCKED · A2-safe FROZEN EXPERIMENTAL · A2-bound REJECTED · C1-PATCHED WEB-ORIGIN FROZEN EXPERIMENTAL (URL-alone→UNKNOWN) · PROMOTE HOLD.

---

## מה נשמר · What stays

Acc scrub · urlSafety · SSE/NARROW/HIT · A2-safe typed coalesce semantics · C1 Bound · soft ER hash · provider soft-fail · fingerprint dedupe · closed relationship vocabulary.

---

## שערי עיצוב A–L · Design gates

Deterministic · explainable · entity-agnostic · provider-extensible · budget-aware · provenance-preserving · UNKNOWN-safe · identity-safe · failure-isolated · observable · reproducible · progressive-compatible — **MET at design level** (see `18-CHIEF-RECOMMENDATION.md`).

---

## STOP

**אין קוד · אין deploy · אין promote · אין ספקים חדשים · אין EXP-B · אין crawl · אין מימוש QueryPlan.**

→ `STATUS.md` · `CHIEF-REVIEW-PACK.md`
