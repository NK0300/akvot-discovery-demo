# 18 — DEFINITION OF IMPLEMENTATION READY · PRE-GO RED CLOSURE

**Stamp:** 2026-09-21T23:50:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Closes:** **R-DOR** (Chief verdict §C)  
**Elevates:** `ARCHIVE-00-21/18-DEFINITION-OF-IMPLEMENTATION-READY.md` + `16-ACCEPTANCE-MATRIX.md`  
**Primary R-DOR artifact (Chief brief):** [`DOR-ACCEPTANCE-MATRIX.md`](./DOR-ACCEPTANCE-MATRIX.md).
**Pointer:** ARCHIVE-18 remains historical; this PRE-GO-18 supplies extended DoR rows (incl. Rollback); both elevate ARCHIVE. Letter `R-FUTURE-EVIDENCE-PACK-STRUCTURE.md` stays evidence-pack **template** (different topic).  
**Ties:** Acceptance (`ARCHIVE-Gate-P` / SoT-letter-Q) ↔ this DoR  
**Mode:** DOCUMENTATION ONLY · implementable · testable · falsifiable · observable

---

## 1. Ready when ALL rows PASS (contractual)

| ID | Requirement | Test (falsify) | Failure | Evidence | Rollback |
|----|-------------|----------------|---------|----------|----------|
| DOR-01 | SoT 01–18 + D0 unchanged (cite-only) | Diff SoT vs freeze stamp | SoT edited this pass | SoT hash/stamp cite | N/A (immutable) |
| DOR-02 | Contracts complete without dual-canon contradiction | Scan A–R vs ARCHIVE vs PRE-GO; CANON-MERGE-MAP applied | Dual binding / ignored ARCHIVE | CANON-MERGE-MAP + FINAL verdict | Reopen R-CANON |
| DOR-03 | Locks restated: B0 LOCKED · Core LOCKED · A2-safe FROZEN · A2-bound REJECTED · C1 Bound FROZEN · PROMOTE HOLD · no D1/D2/providers/crawl | Checklist on GO stamp | Missing lock | GO stamp text | Flag OFF / no GO |
| DOR-04 | Identity-safety: SAME-ENTITY=0 · URL-alone UNKNOWN · title-bridge forbidden · UNKNOWN axioms | T-UNK-01…06 | Any SAME-ENTITY / BAD_URL_ALONE_SAME≠0 | Label histograms · Bound pack | Disable Preview families |
| DOR-05 | Budget hard-stop + taxonomy + no infinite fallback | T-BUD-01…08 | Extra calls after exhaust / collapsed status | Call ledger · budget telemetry | Kill-switch OFF |
| DOR-06 | Kill-switch: flag OFF → B0 verbatim; mid-flight partial finalize | Toggle mid-session | Orch continues QP fanout | Flag test journal | Flag OFF |
| DOR-07 | Acc emit matrix on all surfaces; SSE ⊆ API; no debug loophole | T-ACC-01…08 · T-SSE-03…05 | leak≠0 / debug on prod | Acc bait reports | Flag OFF · scrub hotfix process |
| DOR-08 | SSE always terminates (`done`); reconnect idempotent | T-SSE-01,02,06 | Hang / missing done | SSE traces | Kill stream / flag OFF |
| DOR-09 | Acceptance matrix rows with Test\|Failure\|Evidence for R1–R3 themes | Missing column/row for UNKNOWN/Budget/Acc/SSE/SSRF/Bound/Core | Narrative-only gate | ARCHIVE-16 + this DoR + PRE-GO contracts | Hold GO |
| DOR-10 | Do-not-implement register F01–F25 cited by WPs | WP references missing F-ids | Crawl/title-coalesce/etc. sneaks in | ARCHIVE-17 cite | CI guard / reject WP |
| DOR-11 | Migration dual-run: flag OFF path B0-identical (CONTROL) | Snapshot compare flag OFF vs B0 | Drift | CONTROL harness (future GO) | Flag OFF |
| DOR-12 | Core untouched | Guard/diff mayCommitDossier | Core call | Static guard | Immediate stop |
| DOR-13 | Schemas authority pinned (SoT wins; pack mirrors non-authoritative) | Impl validates against undeclared fork | Wrong schema wired | Schema pin note | Unpin fork |
| DOR-14 | D0 relationship explicit on any GO-IMPL-PREVIEW | GO without superseding D2-NOT-NOW when scope includes QP+URL Preview | Process violation | Chief GO text | No GO |
| DOR-15 | No code / measure / promote in readiness packs alone | Code/flag wiring without GO stamp | Unauthorized impl | Pack STATUS STOP | Revert / HOLD |
| DOR-16 | Owners assigned (Acc / Server / QA / Arch) for chosen slice | Empty owner checkboxes on GO | Unowned gate | Q exit + GO stamp | Hold |
| DOR-17 | Open questions listed (not silently closed) | Silent assumption of KPI/heuristic closure | Fake GREEN | ARCHIVE-19/20 cite | Chief decide |
| DOR-18 | SSRF urlSafety on every fetch under plan path | T-ACC-07 / C1 SSRF suite FAIL | Fetch to unsafe | SSRF PASS record | Block family |

---

## 2. Acceptance ↔ DoR glue

| Acceptance theme (Chief / ARCHIVE-16) | DoR IDs | PRE-GO contract |
|---------------------------------------|---------|-----------------|
| UNKNOWN / Bound / SAME-ENTITY=0 | DOR-04 | UNKNOWN-NORMATIVE-CONTRACT |
| Budget / no silent expansion | DOR-05 | BUDGET-FANOUT-CONTRACT |
| Acc / plan / SSE / graph scrub | DOR-07 | ACC-EMIT-SURFACE-MATRIX |
| SSE termination / reconnect | DOR-08 | SSE-UNTRUSTED-SURFACE-CONTRACT |
| Canon / contracts complete | DOR-02 | CANON-MERGE-MAP |
| Kill-switch / B0 CONTROL | DOR-06 · DOR-11 | ARCHIVE-15 via merge map |
| Core lock · SSRF · non-goals | DOR-12 · DOR-18 · DOR-10 | ARCHIVE-11/17 · SoT 12/17 |

Safety gates (disqualifying): Acc leak≠0 · Core pw/leak≠0 · BAD_URL_ALONE_SAME≠0 · SAME-ENTITY≠0 under experimental lanes · SSRF FAIL · silent expansion observed.

---

## 3. Explicitly NOT claimed by “Implementation Ready”

- Implementation correctness of unwritten code  
- Measured KPI lifts (UNKNOWN until GO-MEASURE)  
- Promote readiness of QueryPlan / A2 / C1  
- Authority to enable Preview flags in production  
- Resolution of all ARCHIVE-19 open questions  
- Supersession of D0 without new Chief GO  

---

## 4. Chief GO types (distinct)

| GO | Meaning |
|----|---------|
| GO-IMPL-PREVIEW | Allow code behind flags OFF-by-default (**future** · requires new Chief order) |
| GO-MEASURE | CONTROL vs TREATMENT evidence (**future**) |
| GO-PROMOTE-* | Separate; default **HOLD** |

This PRE-GO pack requests **Chief review of RED closure**, not GO-IMPL.

---

## 5. Closure quadruple (R-DOR)

| Element | Present? | Cite |
|---------|----------|------|
| Contract | YES | This DoR table + ARCHIVE-18/16 |
| Test | YES | Per-row Test column |
| Failure | YES | Per-row Failure column |
| Evidence | YES | Per-row Evidence column |

**R-DOR:** CLOSED (documentation). Residual AMBER: fixtures/harness not yet created (OK pre-GO); owners empty until Chief assigns slice.

---

## STOP

NO CODE · NO MEASURE · NO PROMOTE · NO GO-IMPL WITHOUT NEW CHIEF ORDER
