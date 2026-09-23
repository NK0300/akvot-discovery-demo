# DOR-ACCEPTANCE-MATRIX · PRE-GO RED CLOSURE

**Stamp:** 2026-09-21T23:52:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Closes:** **R-DOR** (Chief verdict §C)  
**Merges:** `ARCHIVE-00-21/18-DEFINITION-OF-IMPLEMENTATION-READY.md` + `ARCHIVE-00-21/16-ACCEPTANCE-MATRIX.md`  
**Cite-only SoT:** 18 gates · IR acceptance · C1/A2 Bound · D0  
**Gate namespace:** use qualified IDs per `CANON-MERGE-MAP.md` (`SoT-letter-*` vs `ARCHIVE-Gate-*`)  
**Mode:** DOCUMENTATION ONLY · NO CODE · this matrix does **not** itself authorize GO-IMPL

---

## 1. Definition of Implementation Ready (ARCHIVE-18 elevated)

Ready for Chief to **consider** a future GO-IMPL **only when ALL hold**:

| # | Condition | PRE-GO status |
|---|-----------|---------------|
| 1 | SoT freeze honored — Architecture SoT 01–18 + D0 unchanged; cite-only | **HOLD** · untouched this pass |
| 2 | Contracts complete — ARCHIVE-00-21 + PRE-GO-RED-CLOSURE normative; A–R = nav/index; no dual-canon contradiction | **CLOSED** via `CANON-MERGE-MAP.md` |
| 3 | Locks restated — B0 LOCKED · Core LOCKED · A2-safe FROZEN · A2-bound REJECTED · C1 Bound FROZEN · PROMOTE HOLD · no D1/D2/providers/crawl | **RESTATED** (this doc + FINAL verdict) |
| 4 | Identity-safety closed — SAME-ENTITY forbidden; URL-alone UNKNOWN; title-bridge forbidden; ownership forbidden; UNKNOWN axioms | **CLOSED** via `UNKNOWN-NORMATIVE-CONTRACT.md` |
| 5 | Budget + kill-switch specified — hard caps + flag OFF → B0 verbatim | **CLOSED** via `BUDGET-FANOUT-CONTRACT.md` + kill-switch row §3 |
| 6 | Migration dual-run specified — flag OFF identical; Core untouched | **INDEX** ARCHIVE-14/15 · O letter |
| 7 | Acceptance matrix testable — invariant\|test\|expected\|failure\|evidence | **CLOSED** · this document §2 |
| 8 | Do-not-implement register — F01–F25 | **ELEVATE** ARCHIVE-17 (cite; P = process index) |
| 9 | Open questions listed — ARCHIVE-19; do not silently block | **AMBER residual** (honest) |
| 10 | No code in this pack — planning only | **HONORED** |
| 11 | Schemas design-only — pack `schemas/*` non-authoritative; SoT schemas win | **DECLARED** · CANON-MERGE-MAP |
| 12 | Sequencing proposed — S1–S4 / P1–P2 = **options catalog only**; D0 D2 NOT NOW stands | **DECLARED** · FINAL verdict |

### Explicitly NOT claimed by “Implementation Ready” / this PRE-GO closure

- Implementation correctness · Measured KPI lifts · Promote readiness  
- Authority to enable Preview flags in production  
- Resolution of all open architectural questions  
- **GO-IMPL itself** — requires **separate Chief GO** after this verdict

### Chief next GO types (distinct · ARCHIVE-18)

| GO | Meaning | Now? |
|----|---------|------|
| GO-IMPL-PREVIEW | Code behind flags OFF-by-default | **NOT NOW** — await separate Chief GO |
| GO-MEASURE | CONTROL vs TREATMENT evidence pack | **NOT NOW** |
| GO-PROMOTE-* | Separate; default HOLD | **HOLD** |

---

## 2. Acceptance matrix (ARCHIVE-16 + R1–R3 themes)

Columns: **invariant | test | expected | failure | evidence**

| Component | Invariant | Test (design) | Expected | Failure condition | Evidence required |
|-----------|-----------|---------------|----------|-------------------|-------------------|
| QueryPlan | Same inputs → same plan | Golden snapshot hash | Byte-identical plan | Nondeterministic fields | Plan fixtures |
| QueryPlan | reasons non-empty | Schema validate | reject empty | Missing reason | Validator tests |
| QueryPlan | No identity directives | Deny-list fuzz | reject | SAME_ENTITY etc. present | Adversarial SoT 15 |
| SeedClass | Misclass → ambiguous | Ambiguous corpus | no SAME-* | Identity theater | S12–S15 style |
| Family orch | Isolation | faultInject one family | others intact | Cross-corrupt | failureInject suite |
| Family orch | Skip unwired | filings intent | skipped+reason | Fake hits | Execution journal |
| **Budget (R3)** | No silent expansion | Cap=0 / exhausted | `budget_exhausted` partial; no further HTTP | Extra provider call | Telemetry · T-BUD-01 |
| **Budget (R3)** | Wall stop | maxWallMs low | FINALIZE partial + SSE done | Hang | Latency · T-BUD-05 |
| **Budget (R3)** | maxRetries default 0 | Soft-fail inject | retry≤policy (0 def) | Retry storm | Call ledger · T-BUD-04 |
| **Budget (R3)** | empty≠fanout | empty family mock | zero unplanned launches | Extra family | Journal · T-BUD-02 |
| Evidence | Provenance mandatory | Emit without planId | reject/omit | Orphan finding | Contract test |
| **Relationship (R1)** | SAME-ENTITY=0 | Homonym+URL corpora | 0 | Any SAME-ENTITY | A2/C1 adversarial · T-UNK-02/05 |
| **Relationship (R1)** | URL-alone UNKNOWN | URL seeds | UNKNOWN; BAD_URL_ALONE_SAME=0 | SAME-* on URL | C1 Bound · T-UNK-01 |
| **Relationship (R1)** | Title-bridge forbidden | Title-similar pair | no attach | SAME-REFERENCE via title | A2-bound REJECTED |
| **Relationship (R1)** | Failure≠CONTRADICTORY | timeout inject | failureClass only | CONTRADICTORY label | T-UNK-04 |
| **Relationship (R1)** | UNKNOWN≠FALSE | Empty/URL | UNKNOWN preserved | Coerced false | Label counts |
| URL-origin | SSRF block | 169.254/localhost | `unsafe_url` no fetch | Fetch occurs | C1 SSRF · T-ACC-03 |
| URL-origin | No typed mint | web_origin run | no viaf/qid/ol minted by WO | Attach key web_origin: | C1 contract |
| Graph | No implicit edges | Build without provenance | omit/unknown | Orphan edge | Graph validator |
| Graph | same-entity not emitted | Attempt | reject | Edge persisted | Schema + T-ACC-04 |
| **SSE (R-SSE)** | Always terminates | All paths | `done` emitted | Hang | T-SSE-01 |
| **SSE (R-SSE)** | Acc scrub | Poison meta/plan/graph | leak=0 | Acc identity on wire | T-SSE-02 · BAIT-* |
| **SSE (R-SSE)** | Lifetime bound | maxSseLifetimeMs low | done within bound | Hang past budget | T-SSE-04 |
| **Acc (R2)** | Plan surfaces scrubbed | Plan reasons bait | leak=0 | Leak in plan/SSE | BAIT-PLAN-* · T-ACC-01 |
| **Acc (R2)** | All matrix surfaces dispositioned | Checklist vs ACC matrix | every shipped surface has row | Undocumented surface | ACC-EMIT-SURFACE-MATRIX |
| Core | Untouched | Diff/guard | no mayCommitDossier | Core call | Static/guard test |
| B0 | Flag OFF identical | CONTROL path | verbatim behavior | Drift | Snapshot compare |
| **Kill-switch** | Flag OFF → B0 | Toggle mid-flight | Finalize partial; new sessions B0; no adaptive expand | Orch continues QueryPlan fanout | Flag test · T-BUD-07 · ARCHIVE-15 |
| MULTI | Secondary only | Metrics policy | not promote gate | Sole success metric | Metric model |
| Promote | HOLD | Process | no alias change | Autonomous promote | D0 |
| **Canon** | ARCHIVE wins vs A–R | Cross-doc scan | no unresolved dual bind | Dual CANONICAL guidance | CANON-MERGE-MAP · T-CANON |
| **Gate IDs** | Namespace freeze | Lint new docs | qualified Gate IDs only | Bare “Gate C” in new normative | CANON-MERGE-MAP §3 |

### Safety gates (disqualifying — ARCHIVE-16)

Acc leakage ≠ 0 · Core pw/leak ≠ 0 · BAD_URL_ALONE_SAME ≠ 0 · SAME-ENTITY ≠ 0 under experimental lanes · SSRF suite FAIL · silent expansion observed · missing `done` on SSE path.

---

## 3. Kill-switch DoR row (explicit)

| Item | Contract | Test | Expected | Failure | Evidence |
|------|----------|------|----------|---------|----------|
| Kill-switch / rollback | ARCHIVE-15: `DISCOVERY_ENABLE_QUERYPLAN=OFF` → B0 path; in-flight finalize partial; FALLBACK_VERBATIM only for `plan_invalid` with `fallbackReason`; **not** for budget fill | Toggle mid-session + new session | Partial finalize; new = B0; no adaptive fanout | QueryPlan continues / expands after OFF | Flag test log · journal `fallbackReason` |

---

## 4. Gate namespace freeze (D3)

| Rule | Detail |
|------|--------|
| `SoT-letter-A` … `SoT-letter-R` | Pack root A–R (SoT topic crosswalk / nav) |
| `ARCHIVE-Gate-A` … `ARCHIVE-Gate-R` | ARCHIVE Chief Gates (00 map) |
| Never | Bare “Gate C/H/P/Q/R” without prefix in new normative docs |
| Alias table | `CANON-MERGE-MAP.md` §3 |

---

## 5. Companion detailed DoR rows (Rollback column)

Extended Requirement\|Test\|Failure\|Evidence\|**Rollback** rows (DOR-01…DOR-18) live in:

→ [`18-DEFINITION-OF-IMPLEMENTATION-READY.md`](./18-DEFINITION-OF-IMPLEMENTATION-READY.md)

**Authority:** This `DOR-ACCEPTANCE-MATRIX.md` is the Chief-brief primary R-DOR artifact (ARCHIVE-18 + ARCHIVE-16 merge). Companion-18 deepens falsifiable DoR rows; on conflict within PRE-GO, **this matrix + FINAL verdict win**; both elevate ARCHIVE.

---

## 6. Closure quadruple (R-DOR)

| Element | Present? | Cite |
|---------|----------|------|
| Contract | YES | ARCHIVE-18 DoR checklist (§1) + this acceptance matrix (§2–3) |
| Test | YES | Per-row Test column + T-* IDs from sibling contracts |
| Failure | YES | Per-row Failure + Safety gates |
| Evidence | YES | Per-row Evidence column |

**R-DOR:** CLOSED (documentation). Residual AMBER: open questions (ARCHIVE-19), numeric budget bands UNKNOWN until measure, schemas non-authoritative — do not reopen RED if locks hold.

---

## STOP

NO CODE · NO MEASURE · NO PROMOTE · **still NOT an impl GO** · await separate Chief GO-IMPL
