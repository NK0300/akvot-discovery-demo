# 15 — KILL-SWITCH & ROLLBACK · Chief Gate O

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT 16 Preview flags · SoT 17 non-goals · D0 HOLD

---

## 1. Feature flags (illustrative names — not wired this pack)

| Flag | Default | Effect |
|------|---------|--------|
| DISCOVERY_ENABLE_QUERYPLAN | OFF | Master orchestration switch |
| DISCOVERY_ENABLE_VIAF | OFF (existing A2) | authority family Preview |
| DISCOVERY_ENABLE_WEB_ORIGIN | OFF (existing C1) | UrlOrigin Preview |
| DISCOVERY_ENABLE_EVIDENCE_GRAPH | OFF | Persist/emit graph |
| DISCOVERY_QUERYPLAN_FALLBACK_VERBATIM | ON when QP on | plan_invalid → B0 verbatim |

---

## 2. Emergency disable

1. Set DISCOVERY_ENABLE_QUERYPLAN=OFF → immediate B0 path.  
2. Optionally disable VIAF / WEB_ORIGIN independently.  
3. No data migration required for disable (additive fields ignored).  
4. In-flight sessions: finalize partial; new sessions skip PLAN.

---

## 3. Family disable

Registry `enabled=false` or flag off → skip with reason `family_disabled`. Does not remove historical evidence.

---

## 4. URL-origin disable

DISCOVERY_ENABLE_WEB_ORIGIN=OFF → no UrlOriginStage; url/domain seeds fall back to minimal B0 or empty UNKNOWN-honest results per plan rules — **never** invent SAME-*.

---

## 5. QueryPlan fallback

plan_invalid + FALLBACK_VERBATIM → synthetic plan equivalent to today’s verbatim fanout (B0 ± other flags). Observable `fallbackReason`.

---

## 6. Rollback boundary

| In boundary | Out of boundary |
|-------------|-----------------|
| Preview flags, additive session fields, new modules behind flag | B0 provider list, Core, Acc P0, C1 Bound semantics, A2-safe Bound, urlSafety |
| Evidence packs for Preview | Mutating historical Cycle-1 packs |

Rollback = flag OFF. No promote to reverse. B0/Core preservation is the rollback guarantee.

---

## 7. Preservation asserts (always)

B0 LOCKED · Core LOCKED · A2-bound stays REJECTED · C1 URL-alone UNKNOWN · Acc=0 · PROMOTE HOLD unless separate GO.
