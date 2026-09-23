# 02 — WHAT CYCLE1 PROVED · ארכיטקט

**Stamp:** 2026-09-20 12:22 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · synthesize only · **no invented metrics**

---

## 1. A2-safe coalesce — SAME-REFERENCE ceiling

**Proved (experimental Preview):** Cross-family Evidence attach is possible when Findings share a **normalized typed soft-ref** (`viaf:` ∪ `qid:` ∪ `ol:`) across ≥2 hostFamilies, with attach label ceiling = **SAME-REFERENCE**.

| Claim | Evidence | Not claimed |
|-------|----------|-------------|
| Typed-only Bound#1 attach path works | A2 Evidence pack · HARDENING Bound#1 / typed-ref audit | Promote readiness |
| Title-bridge (A2-bound) contaminates / is unsafe for promote | A2-bound REJECTED · homonym adversarial | — |
| Acc leak stays 0 under A2-safe | Baseline table · HARDENING `06-METRICS.md` (leak **0**) | Acc PASS as production gate |
| Adversarial homonym corpus held | HARDENING: **28/28** · prior A2-safe homonym **12/12** (`A2-EXPERIMENTAL-BASELINE.md`) | Exhaustive identity Gate |
| Vocabulary closed set usable | HARDENING `03-VOCABULARY-FINAL-ארכיטקט.md` | SAME-ENTITY under A2-safe |

**Ceiling (non-negotiable):** Attach = **SAME-REFERENCE** only · **never invent SAME-ENTITY** · RELATED ≠ SAME · POSSIBLE ≠ SAME · UNKNOWN ≠ FALSE.

**Paths:**
- `…/PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/`
- `…/PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/`
- `…/A2-EXPERIMENTAL-BASELINE.md`

**Preview refs (historical, not B0):** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` · `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`

---

## 2. C1 web_origin — URL-alone → UNKNOWN

**Proved (experimental Preview · C1-PATCHED):** `web_origin` can add a public-web **provenance / origin Evidence family** without identity collapse.

| Claim | Evidence | Not claimed |
|-------|----------|-------------|
| Bound FIX: URL/hostname/domain-alone labels **UNKNOWN** | Acc re-AFTER PASS on `dpl_Ho6jg…` · who.int → UNKNOWN ×3 | Promote / B0 enablement |
| PREPATCH wrongly emitted SAME-REFERENCE from URL-alone | Acc FAIL on `dpl_268R…` · retained as scrap | — |
| Acc leak = 0 · poison Q = 0 · private provenance = 0 | `ACC-PATCHED.md` | Production security certification beyond Preview |
| SSRF block PASS (127/localhost/metadata/js) | Acc + `04-SECURITY-BOUNDS-ארכיטקט.md` | Open crawl safety |
| Units webOrigin 96/0 · Rel12 12/12 Bound-OK | C1 `CHIEF-EVIDENCE-REPORT.md` · `STATUS.md` | Full product UX provenance display |
| Semantic contract inherits A2 vocab | C1 `05-SEMANTIC-CONTRACT-ארכיטקט.md` | Weakening SAME-REFERENCE definition |

**Principle proved in practice:** A useful finding may stay **UNKNOWN**. Never upgrade certainty because discovery was via URL/host/domain/page/origin.

**Paths:**
- `…/PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK/`
- especially `ACC-PATCHED.md` · `BOUND-FIX-URL-ALONE-UNKNOWN-שרת.md` · `05-SEMANTIC-CONTRACT-ארכיטקט.md`

**Canonical treatment:** `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` · flag `DISCOVERY_ENABLE_WEB_ORIGIN=1` (Preview only)

---

## 3. Acc leak = 0 patterns (Cycle1 lanes)

Across cited Cycle1 experimental lanes that entered evidence packs:

| Lane | Acc leak cited | Source |
|------|----------------|--------|
| B0 | 0 | Baseline / locks |
| EXP-A VIAF | 0 (Acc-safe) | CYCLE1 STATUS |
| A2-safe / hardening | 0 | Baseline · HARDENING metrics |
| C1-PATCHED | 0 | ACC-PATCHED |

**Pattern:** Preview experiments that respect Acc scrub + forbidden QIDs + no identity collapse from non-typed signals keep leak at **0** in pack reports. This is a **hygiene invariant**, not a promote argument.

---

## 4. Gap Analysis role (docs)

Cycle1 Gap Analysis framed candidate experiments and recommended **HE-Locale measure** historically as lowest-blast option — **docs only**, not impl authorization.  
Path: `…/CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/` · `10-RECOMMENDED-EXPERIMENT-FOR-CHIEF-ארכיטקט.md`

**Naming note:** Gap slate once labeled “C1 = HE-Locale” and “C2 = URL origin”. **Executed C1** in this Cycle is **WEB-ORIGIN** (`PHASE-EXP-C1-…`). HE-Locale remains a **historical option on the table**, not executed here.

---

## STOP

Proved ≠ promoted. All of the above stays **APPROVED EXPERIMENTAL** or **LOCKED baseline** as stamped — not production default.
