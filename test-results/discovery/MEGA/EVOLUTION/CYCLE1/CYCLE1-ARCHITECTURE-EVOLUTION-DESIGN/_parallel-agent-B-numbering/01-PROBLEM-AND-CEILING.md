# 01 — PROBLEM AND CEILING · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT (Asia/Jerusalem)  
**Owner:** ארכיטקט · DESIGN-ONLY · NO CODE  
**Ground:** Integration Review `08-ARCHITECTURAL-QUESTION.md` · PHASE5 `SEARCH-STRATEGY-MAP.md` · A2/C1 freezes

---

## Verdict (locked from Integration Review)

**Provider-verbatim fanout of the raw seed to a fixed adapter list is necessary but not sufficient** for Maximum Public-Web Discovery.

```text
Provider-verbatim architecture:
  ✓ sufficient for Acc-safe B0 registry/page discovery
  ✓ extensible via Preview flags (A2, C1 proved)
  ✗ insufficient for vision-scale public-web discovery
```

Cite: `CYCLE1-INTEGRATION-REVIEW/08-ARCHITECTURAL-QUESTION.md`

---

## Problem statement (executable)

| Today | Consequence |
|-------|-------------|
| Seed string forwarded as `q` to every SearchProvider | Intent-blind: URL, role, name, compound share one opaque bag |
| Flat `DEFAULT_PROVIDERS` (+ optional Preview adapters) | Source monoculture; new sources = ad-hoc if-statements |
| C1 WEB-ORIGIN as flag-gated provider + post-batch one-hop | Pattern proved, but not a planned first-class stage |
| A2 coalesce post-retrieval | Raises multi only when typed IDs already exist — cannot invent families |
| Acc/Bound honesty scaled | Coverage did not |

---

## Ceiling table (evidence-tied · do not invent metrics)

| Ceiling | Cycle1 evidence | Implication for this design |
|---------|-----------------|------------------------------|
| Intent blindness | PHASE5 / Phase2–3: compound/role/alias seeds (S13–S15 class) → often 0 grounded; coverage proxy cited 9/15 in Integration Review | Need **QueryPlan** seed classification + routed queries |
| Source monoculture | B0 = WD · OL · WP (3 adapters · ~2 families); B0 multi=0.0 (`A2-EXPERIMENTAL-BASELINE.md`) | Need **source-family orchestration** with budgets/independence |
| Authority orphans | S04 filings absent; DOMAIN_AUTHORITY gov/edu weights with no emitters (Gap Analysis / Integration Review) | Family catalog must include **design slots** for filings/gov — not B0 impl |
| Locale inert | S07 HE unused without caller `locale` (PHASE5 Step 45) | QueryPlan must carry locale hints; auto-detect = future Preview slice only |
| URL path special-cased | C1-PATCHED `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` FROZEN EXPERIMENTAL; flag `DISCOVERY_ENABLE_WEB_ORIGIN=1` | Promote C1 pattern to **URL-origin early stage** in plan — still Preview-gated |
| Independence ≠ discovery | A2-safe mean multi≈0.21; attach when typed IDs exist | Coalesce stays A2-safe ceiling; orchestration supplies families |
| Safety ≠ breadth | Acc leak=0 · Bound CLOSED · Rel12 PASS on C1-PATCHED | Preserve Acc/Bound; evolution must not trade honesty for coverage |

Deployment refs (historical · not promote targets):  
- B0 Discovery: `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
- Core: `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED  
- A2-safe Preview: `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` FROZEN EXPERIMENTAL  
- C1-PATCHED: `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` FROZEN EXPERIMENTAL  

---

## What remains valuable (do not discard)

Soft ER opaque seed hash · Provider adapter interface + soft-fail · Evidence fingerprint dedupe · Acc scrub emit · urlSafety SSRF envelope · Typed soft-ref coalesce SAME-REFERENCE (A2-safe) · Relationship vocabulary + URL-alone UNKNOWN Bound (C1) · Progressive session / SSE / narrow / facets.

These are the **safe substrate**. This pack extends them — does not replace Acc/Bound discipline.

---

## Minimum evolution this pack designs (not implements)

1. **QueryPlan** + intent routing  
2. **Source-family orchestration**  
3. **URL-origin as early/first-class stage** (C1 pattern → planned stage)  

Plus lightweight entity-type routing + evidence-graph relationship edges (complement). Adaptive secondary queries = later, after 1–3.

---

## Explicit out of this pack

NO CODE · NO deploy · NO promote · NO providers · NO EXP-B · NO C2+ · NO crawl · NO inventing live metrics.

---

## Review-note slots

| Role | Slot |
|------|------|
| **@שרת** | Confirm AS-IS S0–S10 map matches `api/lib/discovery/orchestrator.js` |
| **@דיוק** | Confirm ceiling citations do not invent Acc numbers beyond frozen packs |
| **@בודק** | Confirm seed-class examples align with golden corpus labels |

---

## STOP

Design problem framed. Implementation status: **NONE**.
