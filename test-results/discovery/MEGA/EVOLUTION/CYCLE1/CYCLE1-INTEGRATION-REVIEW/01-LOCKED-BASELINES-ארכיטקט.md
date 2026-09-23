# 01 — LOCKED BASELINES · ארכיטקט

**Stamp:** 2026-09-20 12:22 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · Integration Review · **DOCS ONLY**  
**Rule:** Cite existing packs · **do not mutate** historical metrics

---

## Lock table (canonical stamps)

| Lock | dpl / stamp | State | Source path |
|------|-------------|-------|-------------|
| **B0 Discovery** | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · https://akvot-discovery.vercel.app | **LOCKED / FROZEN** · production baseline SoT · UNCHANGED | `STATUS-ארכיטקט.md` (CYCLE1) · C1 `CHIEF-EVIDENCE-REPORT.md` · `A2-EXPERIMENTAL-BASELINE.md` |
| **Core** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · akvot-simple-demo.vercel.app | **LOCKED** · pw=0 · leak=0 | CYCLE1 STATUS · C1 ACC-PATCHED / STATUS-דיוק |
| **A2-safe** | Metrics lane Preview `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` · Canonical Preview also cited `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` | **FROZEN** · APPROVED EXPERIMENTAL · **NO promote** | `A2-EXPERIMENTAL-BASELINE.md` · HARDENING `CLOSED-EXPERIMENTAL-BASELINE-ארכיטקט.md` · A2 Evidence STATUS |
| **A2-bound** | `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2` (title-bridge) | **REJECTED** | A2 Evidence `13-DECISION-RECOMMENDATION-ארכיטקט.md` · HARDENING CLOSED |
| **A2 Bound#1** | `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` | Typed-only compliance reference · not promote | A2 Evidence STATUS |
| **C1-PREPATCH** | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | **RETAINED scrap** · Acc FAIL (URL-alone → SAME-REFERENCE) · do not Acc-PASS | C1 `07-C1-PREPATCH-VS-PATCHED-ארכיטקט.md` · `STATUS-דיוק.md` |
| **C1-PATCHED** | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` · https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app | **CLOSED / FROZEN** · APPROVED EXPERIMENTAL · Acc PASS · Bound CLOSED | C1 `STATUS.md` · `ACC-PATCHED.md` · `CHIEF-EVIDENCE-REPORT.md` |
| **EXP-A VIAF (historical)** | Canonical Preview `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` | Historical · Acc-safe PASS / metric FAIL · no B0 change | CYCLE1 `STATUS-ארכיטקט.md` |

---

## A2 freeze (do not rewrite)

From `A2-EXPERIMENTAL-BASELINE.md` (historical metrics — cite only):

| Lane | mean multi | S01 | S04 | S05 | Acc leak | Notes |
|------|------------|-----|-----|-----|----------|-------|
| B0 | 0 | 0 | 0 | 0 | 0 | production lock |
| A (VIAF emit) | 0 | 0 | 0 | 0 | 0 | siblings, no cross-family attach |
| A2-bound | ~0.52 | — | — | — | 0 | **REJECTED** (title-bridge) |
| A2-safe | ~0.21 | ~0.56 | 0 | ~0.07 | 0 | **APPROVED EXPERIMENTAL** |
| A2-hardening | = A2-safe | — | — | — | 0 | forensics-only · no code change |

Detail metrics table also in HARDENING `06-METRICS.md` (A2-safe mean **0.2074** · leak **0** · S04 **0** · S05 **0.0667** on cited lane).

**Flag (Preview only, not B0):** `DISCOVERY_ENABLE_VIAF=1` — not in B0 `DEFAULT_PROVIDERS`.

---

## C1 freeze (do not rewrite)

| Check | Result (C1-PATCHED) | Source |
|-------|---------------------|--------|
| Acc leak | **0** | `ACC-PATCHED.md` |
| URL-alone SAME-ENTITY / SAME-REFERENCE | **0 / 0** | Acc re-AFTER |
| who.int ×3 surfaces | **UNKNOWN** | Acc Bound audit |
| SSRF | **PASS** | Acc + Security bounds |
| Core pw / leak | **0 / 0** | Acc STATUS |
| Units webOrigin | **96 passed / 0 failed** | C1 `CHIEF-EVIDENCE-REPORT.md` |
| Rel12 Bound cases | **PASS 12/12** | C1 STATUS |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` · Preview only | C1 STATUS |

---

## Frozen pack roots

```
…/CYCLE1/A2-EXPERIMENTAL-BASELINE.md
…/CYCLE1/PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/
…/CYCLE1/PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/
…/CYCLE1/PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK/
…/CYCLE1/CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/
…/CYCLE1/CYCLE1-INTEGRATION-REVIEW/   ← this pack
```

---

## STOP

Baselines above are **locked**. Integration Review may cite them; it must **not** mutate them.
