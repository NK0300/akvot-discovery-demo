# 13 — DETERMINISM & REPRODUCIBILITY · Chief Gate M

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT 02 Determinism · Gate A/K · SoT 16 packs replayable

---

## 1. Planning determinism

**Same seed + config → same QueryPlan** (ordered intents, families, queries, budgets, reasons text templates).

Inputs in snapshot hash: seedHash, seedClass, knownRefs, urls, flags, configVersion, budgetsRemaining, locale hint.

Non-inputs: wall clock, random, provider live availability (availability affects **execution**, not plan bytes).

---

## 2. Versioning

| Version field | Purpose |
|---------------|---------|
| planSchemaVersion | Plan JSON shape |
| familyRegistryVersion | Family descriptors |
| configVersion | Flags + budget defaults + router rules |
| relationshipVocabVersion | Closed vocab SoT |
| executionId | Unique per run (non-deterministic id OK) |
| planId | Stable from snapshot hash (deterministic) |

---

## 3. Evidence snapshot semantics

HIT/FINALIZE stores:

- scrubbed queryPlan  
- findings/evidence arrays  
- optional evidenceGraph  
- execution journal (family results, failureClasses)  
- budget final snapshot  
- relationshipLabelCounts  

Replay: given plan + mocked family responses → equivalent findings/graph (stable sort). Live network replay may differ — document CONTROL vs TREATMENT methodology (SoT 16 Phase 2).

---

## 4. Execution non-determinism (declared)

Latency, provider ordering completion, transient 5xx → soft-fail annotations may differ. **Plan** and **merge sort** remain deterministic. Tests should mock providers for golden plan/graph asserts.
