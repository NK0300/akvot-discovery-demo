# CANON-MERGE-MAP · PRE-GO RED CLOSURE

**Stamp:** 2026-09-21T23:53:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `CYCLE1-IMPLEMENTATION-READINESS-PACK/PRE-GO-RED-CLOSURE/`  
**Mode:** DOCUMENTATION ONLY · NO CODE · NO DEPLOY · NO PROMOTE · NO MEASURE  
**Closes:** **R-CANON** (Chief `CHIEF-IMPLEMENTATION-READINESS-VERDICT.md` §C) · resolves contradictions **D1–D4, D8**

---

## 1. Canon authority (binding · single statement)

| Layer | Role | Conflict rule |
|-------|------|---------------|
| **Architecture SoT 01–18 + CHIEF-DECISION-D0** | Immutable design SoT | Cite-only · **NO edits this pass** |
| **ARCHIVE-00-21** (`_archive-alt-numbering-00-21-2026-09-20/`) | **Deep normative** implementation specification | **WINS** on conflict with A–R |
| **A–R letter pack** (pack root) | Navigation · executive index · ownership · dependency map · review status · quick reference | Must **not** contradict 00–21; if conflict → **00–21 wins**; letter text treated as index until rewritten |
| **PRE-GO-RED-CLOSURE/** (this folder) | Normative closures elevating / extending ARCHIVE for RED themes | Binding for R-UNKNOWN · R-BUDGET · R-ACC · R-SSE · R-DOR · R-CANON merge |
| **B0 / Core / A2 / C1** | LOCKED / FROZEN / REJECTED per D0 | **NO changes** · no unfreeze |

**Explicit:** Dual `CANONICAL.md` markers (root vs ARCHIVE) are **resolved** by this map: ARCHIVE-00-21 + PRE-GO-RED-CLOSURE are normative-for-impl-planning; A–R remain as **index only**. A–R files are **NOT auto-deleted**.

**Gate ID namespace freeze:** Always qualify Gate IDs:
- `SoT-letter-A` … `SoT-letter-R` = pack root A–R (SoT topic crosswalk)
- `ARCHIVE-Gate-A` … `ARCHIVE-Gate-R` = ARCHIVE Chief Gates (00 map §Chief A–R)
- Never use bare “Gate C” without path prefix

---

## 2. Merge table · A–R ↔ ARCHIVE ↔ Resolution

| A–R (index) | ARCHIVE section (normative) | Status | Resolution |
|-------------|----------------------------|--------|------------|
| `00-EXECUTIVE-READINESS.md` | `00-EXECUTIVE-ARCHITECTURE-MAP.md` | **MERGED-INDEX** | Keep 00 as TL;DR HOLD/S0–S4 catalog. ARCHIVE-00 wins for pipeline map + Chief Gate index. S1–S4 = **options catalog only**; do **not** supersede D0 D2-NOT-NOW without new Chief GO (closes D5 as process AMBER, not RED). |
| `A-QUERYPLAN-READINESS.md` | `01-QUERYPLAN-IMPLEMENTATION-CONTRACT.md` + `13-DETERMINISM-REPRODUCIBILITY.md` | **ELEVATE-ARCHIVE** | ARCHIVE-01+13 normative. A = ownership/WP index. Plan bytes deterministic; execution timing may vary (ARCHIVE-13). |
| `B-SOURCE-FAMILY-READINESS.md` | `02-SOURCE-FAMILY-ORCHESTRATION-CONTRACT.md` | **ELEVATE-ARCHIVE + EXTEND** | ARCHIVE-02 normative. Status enum **extended** by `BUDGET-FANOUT-CONTRACT.md` (adds `budget_exhausted`, `unavailable`, outcome-class UNKNOWN). |
| `C-DISCOVERY-BUDGET-READINESS.md` | `08-BUDGET-MODEL.md` | **ELEVATE-ARCHIVE + EXTEND** | ARCHIVE-08 + `BUDGET-FANOUT-CONTRACT.md` normative. C remains index to WP owners. **00–21 wins** over thin C exit checkboxes. |
| `D-INDEPENDENCE-READINESS.md` | SoT 05 + ARCHIVE-02 §8 + ARCHIVE-05 | **INDEX-OK** | D cites independence; relationship/UNKNOWN axioms owned by `UNKNOWN-NORMATIVE-CONTRACT.md` (elevates ARCHIVE-05). No contradiction if D does not invent SAME-*. |
| `E-URL-ORIGIN-STAGE-READINESS.md` | `06-URL-ORIGIN-INTEGRATION.md` + ARCHIVE-05 §4 | **ELEVATE-ARCHIVE** | C1 Bound FROZEN (URL-alone→UNKNOWN) remains. E = Bound/owner index. |
| `F-EVIDENCE-GRAPH-READINESS.md` | `04-EVIDENCE-CONTRACT.md` + `07-EVIDENCE-GRAPH.md` | **ELEVATE-ARCHIVE** | ARCHIVE-04/07 normative for provenance floor + no-laundering. F = WP index. |
| `G-ENTITY-TYPE-ROUTING-READINESS.md` | ARCHIVE-01 seedClass + SoT 08 | **INDEX-OK** | Heuristics remain OPEN (ARCHIVE-19 Q1) → AMBER residual, not RED. |
| `H-PROGRESSIVE-LIFECYCLE-READINESS.md` | `03-DISCOVERY-LIFECYCLE-STATE-MACHINE.md` + `09-PROGRESSIVE-SSE-MODEL.md` | **ELEVATE-ARCHIVE + EXTEND** | ARCHIVE-03/09 + `SSE-UNTRUSTED-SURFACE-CONTRACT.md` normative. H = owner/status index. |
| `I-FAILURE-MODEL-READINESS.md` | `10-FAILURE-MODEL.md` | **ELEVATE-ARCHIVE + ALIGN** | ARCHIVE-10 normative; align status taxonomy with BUDGET-FANOUT hard-stop classes. |
| `J-OBSERVABILITY-READINESS.md` | `12-OBSERVABILITY.md` | **ELEVATE-ARCHIVE** | ARCHIVE-12 metric names normative before GO-MEASURE. J remains thin index → AMBER until measure GO. |
| `K-SECURITY-READINESS.md` | `11-SECURITY-MODEL.md` | **ELEVATE-ARCHIVE + EXTEND** | ARCHIVE-11 threat→control + **`ACC-EMIT-SURFACE-MATRIX.md`** closes R-ACC. K = owner index. |
| `L-METRICS-READINESS.md` | SoT 13 + ARCHIVE notes | **INDEX-OK** | MULTI secondary · Freshness UNKNOWN — keep. No invented KPIs. |
| `M-EXAMPLE-PLANS-VALIDATION.md` | SoT 14 + ARCHIVE sequencing | **INDEX-OK** | Fixtures planned, not created (OK pre-GO). |
| `N-ADVERSARIAL-SUITE-PLAN.md` | SoT 15 | **INDEX-OK** | Suite not runnable until GO-IMPL — OK. |
| `O-MIGRATION-FLAGS-PLAN.md` | `14-MIGRATION-PLAN.md` + `15-KILL-SWITCH-ROLLBACK.md` | **ELEVATE-ARCHIVE** | ARCHIVE-15 kill-switch = first-class normative. O WP-MIG-KILL points here. |
| `P-NON-GOALS-ENFORCEMENT.md` | `17-DO-NOT-IMPLEMENT-REGISTER.md` (F01–F25) | **ELEVATE-ARCHIVE** | F01–F25 normative numbered register. P = process enforcement index. |
| `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md` | `16-ACCEPTANCE-MATRIX.md` | **ELEVATE-ARCHIVE + EXTEND** | ARCHIVE-16 + `18-DEFINITION-OF-IMPLEMENTATION-READY.md` (PRE-GO) with Test\|Failure\|Evidence columns. Q Gate 0–15 remains ordered checklist pointing to matrix. |
| `R-FUTURE-EVIDENCE-PACK-STRUCTURE.md` | `18-DEFINITION-OF-IMPLEMENTATION-READY.md` (DoR) + `R` template | **SPLIT** | Pack letter R = evidence-pack **template** (keep). DoR normative lives in `DOR-ACCEPTANCE-MATRIX.md` (+ companion PRE-GO-18). Alias: DoR ≠ letter-R template. |
| `CROSSWALK-SOT-01-18-TO-A-R.md` | ARCHIVE-00 Chief Gate index | **AMEND-BY-POINTER** | Crosswalk remains SoT→letter navigation. Add note: Gate letters collide with ARCHIVE Gates — use qualified IDs (this map §1). Do **not** delete. |
| `CANONICAL.md` (root) | `ARCHIVE-00-21/CANONICAL.md` | **SUPERSEDED-BY-THIS-MAP** | Root CANONICAL historically declared A–R canonical + ARCHIVE quarantine → **contradicts** Chief PRE-GO decision. Resolution: this merge map + `FINAL-PRE-GO-VERDICT.md` §Canon are authoritative. Root CANONICAL.md should gain a pointer stub (see pack-root README); do not delete A–R. |
| `STATUS-ארכיטקט.md` | `ARCHIVE-00-21/STATUS.md` | **SUPERSEDED-FOR-READY-CLAIM** | Prior READY claim premature (verdict R-DOR). New status: `RED-CLOSURE-STATUS.md` + `FINAL-PRE-GO-VERDICT.md`. Root STATUS may keep HOLD/STOP; READY revoked pending Chief GO. |
| `FILE-INDEX.md` | ARCHIVE FILE/STATUS | **UPDATE-POINTER** | “Ignore ARCHIVE” instruction **revoked** for normative depth (closes D8). Index must list PRE-GO-RED-CLOSURE + ARCHIVE as normative. |
| `schemas/*` (pack) | SoT `*-SCHEMA.json` | **NON-AUTHORITATIVE** | Pack schemas = design mirrors only. SoT schemas win. Hash-pin or quarantine before any wiring (AMBER B8). |

---

## 3. Gate letter collision alias (D3)

| SoT-letter | Topic (pack) | ARCHIVE-Gate | Topic (ARCHIVE) | Safe cite form |
|------------|--------------|--------------|-----------------|----------------|
| C | Budget | H | Budget | `SoT-letter-C` / `ARCHIVE-Gate-H` |
| H | Lifecycle/SSE | C | Lifecycle | `SoT-letter-H` / `ARCHIVE-Gate-C` |
| H | Lifecycle/SSE | I | SSE | `SoT-letter-H` / `ARCHIVE-Gate-I` |
| P | Non-goals | Q | Do-not-implement | `SoT-letter-P` / `ARCHIVE-Gate-Q` |
| Q | Acceptance gates | P | Acceptance matrix | `SoT-letter-Q` / `ARCHIVE-Gate-P` |
| R | Evidence pack template | R | Definition of Ready | `SoT-letter-R` / `ARCHIVE-Gate-R` — **different topics**; DoR = `DOR-ACCEPTANCE-MATRIX.md` |

Aligned letters (A,B,D,E,F,G,I≈J,J≈L,K,L,M,N,O≈N/O): still prefer qualified cites.

---

## 4. Contradiction resolutions (explicit)

| ID | Conflict | Resolution |
|----|----------|------------|
| D1 | Dual CANONICAL | ARCHIVE-00-21 + PRE-GO-RED-CLOSURE normative; A–R = index. This map wins. |
| D2 | STATUS READY | Revoke READY; use PRE-GO STATUS + FINAL verdict. |
| D3 | Gate letter namespace | Qualified IDs frozen (§3). |
| D4 | Chief checklist vs pack A–R | Missing Relationship/Evidence/Kill-switch/DoR elevated via ARCHIVE + PRE-GO contracts. |
| D5 | D0 D2 NOT NOW vs S1–S2/P1–P2 | Catalogs only; D0 stands until new Chief GO. **AMBER process**. |
| D6 | schemas fork | Non-authoritative mirrors; SoT schemas win. **AMBER**. |
| D7 | SoT vs readiness depth | Not a SoT contradiction; documentation depth closed by elevation. |
| D8 | FILE-INDEX ignore ARCHIVE | Revoked; ARCHIVE is normative deep set. |

---

## 5. R-CANON closure evidence

| Element | Artifact |
|---------|----------|
| Contract | This `CANON-MERGE-MAP.md` + Chief PRE-GO canon decision |
| Test | Cross-doc scan: any A–R claim that contradicts ARCHIVE-00-21 on a resolved row → FAIL; Gate bare-letter use in new docs → FAIL |
| Failure | Dual binding guidance → treat as R-CANON reopen; do not GO-IMPL |
| Evidence | This file · `FINAL-PRE-GO-VERDICT.md` §Canon · updated root `CANONICAL.md` |

**R-CANON status:** CLOSED (documentation) — provided implementers cite ARCHIVE/PRE-GO, not thin A–R alone.

---

## STOP

NO CODE · NO MEASURE · NO PROMOTE · NO GO-IMPL WITHOUT NEW CHIEF ORDER
