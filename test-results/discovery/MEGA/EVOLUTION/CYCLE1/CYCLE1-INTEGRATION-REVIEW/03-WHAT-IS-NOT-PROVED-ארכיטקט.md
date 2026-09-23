# 03 — WHAT IS NOT PROVED · ארכיטקט

**Stamp:** 2026-09-20 12:22 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · Integration Review  
**Purpose:** Explicit non-claims so Chief is not sold promote readiness

---

## 1. S04 / S05 = product limitations (not bugs)

From HARDENING CLOSED + Baseline:

| Seed class | Classification | Do **not** |
|------------|----------------|------------|
| **S04** Stripe | **AUTHORITY / SOURCE COVERAGE LIMITATION** | Manufacture recovery · force multi · title/sim shortcuts |
| **S05** Red Cross | **CROSS-ENTITY / AUTHORITY-GRANULARITY LIMITATION** | Collapse movement ≠ society ≠ national · invent relationships |

A2 gain is **seed-specific** (entities with rich cross-family authority IDs). S04 multi stayed **0** on cited A2-safe metrics; S05 stayed near-floor (~0.07). That is **expected product behavior**, not an incomplete bugfix.

Sources: `A2-EXPERIMENTAL-BASELINE.md` · HARDENING `04-S04-S05-RECOVERY-BOUNDS-ארכיטקט.md` · `CLOSED-EXPERIMENTAL-BASELINE-ארכיטקט.md`

---

## 2. No promote readiness

| Artifact | Ready for Chief review as experimental? | Ready to promote / alias? |
|----------|-----------------------------------------|---------------------------|
| A2-safe | YES — APPROVED EXPERIMENTAL · FROZEN | **NO** |
| A2-bound | N/A — **REJECTED** | **NO** |
| C1-PATCHED | YES — CLOSED FROZEN APPROVED EXPERIMENTAL | **NO** |
| B0 / Core | Already production locks | **Do not retarget** from Cycle1 experiments |

**Not proved:** that A2-safe or C1 should become B0 default, Discovery alias, or Core behavior.

---

## 3. MULTI ≠ product objective

MULTI / `multi_independent` is a **metric** used in packs. Cycle1 deliberately rejects optimizing coalesce or providers **for multi**. Raising multi by weakening identity bounds (title-bridge, URL-as-SAME-REFERENCE) is a **known anti-pattern** (A2-bound REJECTED · C1-PREPATCH Acc FAIL).

---

## 4. SAME-ENTITY Gate — not delivered

A2-safe and C1 **forbid** SAME-ENTITY. A future entity-resolution Gate is **out of scope** and **not proved**. Code annotations that say “same-entity” remain provisional, not Gate.

---

## 5. Independence / coverage product vision — not closed

Gap Analysis documents remaining coverage, authority, independence, and entity-type gaps. Cycle1 experiments **do not** close those product gaps; they bound safe experimental directions.

Path: `…/CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/`

---

## 6. UX provenance display — deferred

C1 pack includes UX note that provenance display is later (`UX-PROVENANCE-DISPLAY-LATER-ממשק-2026-09-20.md`). **Not proved** as shipped product UX.

---

## 7. HE-Locale / C2–C6 — not executed as GO’d product work

Historical Gap recommendation **EXP-GAP-1 HE-Locale** was **measure design**, not authorized impl. C2–C6 candidates remain **non-GO**. Integration Review does **not** treat them as proved or next-by-default.

---

## OWNER slots (confirm one-pagers welcome)

| Role | Suggested confirm (optional) |
|------|------------------------------|
| **@דיוק (Acc)** | One-pager: Acc leak=0 + Bound CLOSED on C1-PATCHED + A2 freeze hygiene |
| **@בודק (QA)** | One-pager: corpus measurability / adversarial coverage still sufficient for freeze |
| **@שרת (Server)** | One-pager: Preview flags only · B0/Core untouched · no pending promote deploy |

---

## STOP

Absence of promote proof is intentional. **HOLD**.
