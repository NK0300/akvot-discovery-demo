# 07 — BASELINE SNAPSHOT · CYCLE1 FREEZE

**Stamp:** 2026-09-20T12:21:00+03:00 IDT  
**Mode:** DOCUMENT-ONLY freeze label · **do not alter historical measurements**  
**Composition:** **B0 + A2-safe + C1-PATCHED** (as labeled classes)  
**Machine copy:** `BASELINE-FREEZE.json`

---

## Class legend

| Class | Meaning |
|-------|---------|
| **PRODUCTION** | Live Discovery / Core aliases — LOCKED |
| **EXPERIMENTAL** | Preview-only · APPROVED or FROZEN · **NOT PROMOTED** |
| **REJECTED** | Explicitly rejected; do not revive |
| **HISTORICAL FAIL** | Kept as regression evidence |

---

## PRODUCTION locks

| Surface | Deployment | Alias | Key metrics (cited) | Pack |
|---------|------------|-------|---------------------|------|
| Discovery B0 | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | akvot-discovery.vercel.app | Providers WD·WP·OL; multi=0.0; Acc leak=0; store upstash durable; web_origin OFF | `PHASE1-BASELINE/FREEZE.md` · BASELINE-EVIDENCE-PACK |
| Core | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | akvot-simple-demo.vercel.app | pw=0 · leak=0 · Acc P0 | `PHASE1-BASELINE` · `CORE-PATCHED.md` |

---

## EXPERIMENTAL freezes (Cycle-1 integrated baseline)

### A2-safe (typed soft-ref coalesce + VIAF)

| Field | Value |
|-------|-------|
| **Class** | EXPERIMENTAL · FROZEN |
| Flag | `DISCOVERY_ENABLE_VIAF=1` Preview only |
| Historical Preview dpl | `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` |
| mean multi | **~0.21** |
| S01 / S04 / S05 multi | **~0.56 / 0 / ~0.07** |
| Acc leak | **0** |
| Adversarial | **28/28** hardening · prior **12/12** homonym |
| Vocabulary | SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY |
| Packs (immutable) | `PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/` · `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/` · `A2-EXPERIMENTAL-BASELINE.md` |

### C1-PATCHED (WEB-ORIGIN Bound CLOSED)

| Field | Value |
|-------|-------|
| **Class** | EXPERIMENTAL · APPROVED · CLOSED · FROZEN · **NOT PROMOTED** |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` Preview only |
| dpl | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
| URL | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app |
| S16 | findings 0→1 · wo=1 · **UNKNOWN** |
| W5 | wo=1 · **UNKNOWN** |
| S01/S04/S05 wo | **0** (no URL spam) |
| Acc leak / BAD_URL_ALONE_SAME | **0 / 0** |
| Rel12 | **12/12 PASS** |
| Units | **96/0** |
| SSRF | **PASS** |
| Core pw/leak | **0/0** |
| Pack | `PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK/` (SEMANTIC-CONTRACT · RELATIONSHIP-TRUTH-TABLE · ACC-PATCHED · DISCOVERY-RECHECK · CHIEF-EVIDENCE-REPORT) |

---

## REJECTED

| Item | Why | Cite |
|------|-----|------|
| **A2-bound** (title-bridge) | Invents relationships; multi~0.52 illegitimate | A2-EXPERIMENTAL-BASELINE |
| Promote A2 or C1 to B0 alias | HOLD without Chief GO | STATUS locks |
| SAME-ENTITY under C1/A2-safe | Forbidden | SEMANTIC-CONTRACT |
| Open `web_public` crawler | Deferred / unsafe without GO | SOURCE matrix |

---

## HISTORICAL FAIL (KEEP)

| Item | dpl | Failure | Use |
|------|-----|---------|-----|
| **C1-PREPATCH** | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | URL-alone **SAME-REFERENCE** on who.int | Regression · Bound proof · BEFORE-AFTER |
| EXP-A VIAF Acc metric FAIL (pre-A2) | e.g. `dpl_H9o45…` class / Canonical notes | multi stayed 0 without coalesce | RCA: siblings ≠ cross-family attach |

Pack: `C1-PREPATCH/` · `PHASE4-EXPERIMENT-A-VIAF/`

---

## What Cycle-1 baseline claims / does not claim

| Claims (evidence-backed) | Does NOT claim |
|--------------------------|----------------|
| B0 production Acc-safe registry/page discovery | Broad web coverage |
| A2-safe typed coalesce can raise multi on rich authority persons | Generalized entity discovery |
| C1 WEB-ORIGIN discovers public origin Evidence with UNKNOWN honesty | Org identity resolution |
| Prepatch failure detected, preserved, corrected, regression-tested | Independent-source corroboration as product objective |
| Security/Acc/Core locks intact across experiments | Production crawling · QueryPlan shipped |

---

## Freeze rules

1. Do **not** mutate historical pack metrics or raw JSON.
2. Do **not** redeploy or retarget aliases as part of this Integration Review.
3. Labels PRODUCTION | EXPERIMENTAL | REJECTED | HISTORICAL FAIL are authoritative for Chief.
4. Integrated baseline = conceptual freeze of **B0 + A2-safe + C1-PATCHED** capabilities/evidence — **not** a single merged production deployment.
