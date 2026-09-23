# CHIEF-IMPLEMENTATION-READINESS-VERDICT

**Stamp:** 2026-09-21T23:46:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack reviewed:** `CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** **REVIEW ONLY** · NO CODE · NO DEPLOY · NO PROMOTE · NO MEASURE · NO providers · NO crawl  
**Reviewer role:** Adversarial Implementation-Readiness examiner (executor subagent)  
**Authority claimed:** NONE — documents gaps only; does not authorize GO-IMPL / GO-MEASURE / GO-PROMOTE

## Locks restated (honored by this review)

| Lock | State |
|------|-------|
| Architecture SoT 01–18 | **IMMUTABLE** cite-only · **NO edits this pass** |
| CHIEF-DECISION-D0 | HOLD implementation · D1/D2 **NOT NOW** · PROMOTE HOLD |
| B0 Discovery PRODUCTION | **LOCKED** |
| Core Acc P0 | **LOCKED** · no Core changes |
| A2-safe | **FROZEN EXPERIMENTAL** |
| A2-bound | **REJECTED** |
| C1-PATCHED Bound | **FROZEN EXPERIMENTAL** (URL-alone → UNKNOWN · BAD_URL_ALONE_SAME=0) |
| This verdict | Writes **only** into readiness pack · does not unfreeze A2/C1 · no B0/Core changes |

**Canonical set declared by pack root:** letter contracts **A–R** + `00-EXECUTIVE-READINESS.md` + `CROSSWALK-SOT-01-18-TO-A-R.md` + `STATUS-ארכיטקט.md` + `CANONICAL.md` + `FILE-INDEX.md` + `schemas/` (cite-only SoT schemas).  
**Also reviewed (quarantined, substantive):** `_archive-alt-numbering-00-21-2026-09-20/` — cited as **ARCHIVE-00-21**.

---

## A. GREEN — closed / sufficient for future GO planning

- **Locks + HOLD stance** restated consistently in `00-EXECUTIVE-READINESS.md`, `STATUS-ארכיטקט.md`, D0 (`CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/CHIEF-DECISION-D0.md`).
- **SoT → letter crosswalk exists** — `CROSSWALK-SOT-01-18-TO-A-R.md` maps SoT 00–18 + schemas to A–R.
- **Planning-only discipline** — every A–R doc ends with “Blocked until Chief GO”; STATUS forbids Preview wiring / measure / promote.
- **Migration coexistence table (planning)** — `O-MIGRATION-FLAGS-PLAN.md` correctly keeps VIAF / WEB-ORIGIN independently toggleable; illustrative `DISCOVERY_ENABLE_QUERYPLAN` default off; productionEligible stays false without Chief.
- **Non-goals direction** — `P-NON-GOALS-ENFORCEMENT.md` cites SoT 17 hard stops (crawl, identity scoring, title-bridge, autonomous promote, Core, providers).
- **Future evidence-pack template** — `R-FUTURE-EVIDENCE-PACK-STRUCTURE.md` is a usable scaffold when a later GO executes (not now).
- **Adversarial case map (planning)** — `N-ADVERSARIAL-SUITE-PLAN.md` maps SoT 15’s 10 cases to reuse of A2/C1 evidence (URL-alone, SSRF, title-bridge, Bound).
- **Example-plan fixtures table** — `M-EXAMPLE-PLANS-VALIDATION.md` lists 8 seed-class fixtures + identity-safety focus (not executed).
- **Acceptance gate skeleton** — `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md` Gate 0 = explicit Chief GO; Gates 4–10 Acc/urlSafety/Bound/SSRF; Gate 15 promote separate.
- **AS-IS code map awareness** — A–R gap tables correctly note verbatim `q=seed`, flat providers, wall-only budgets, emit/urlSafety keep — path `api/lib/discovery/` surveyed read-only.
- ARCHIVE-00-21 **substantive depth** (relationship axioms, lifecycle transitions, acceptance matrix, kill-switch, DoR, F01–F25) is **valuable material** — but it is **not** currently canonical at pack root (see §D / §E).

---

## B. AMBER — needs clarification / Chief decision before GO-IMPL

### B1 · Canonical thinness vs ARCHIVE-00-21 depth
- **WHAT:** Root A–R contracts are ~2–3.5 KB planning stubs (gap → WP names → exit checkboxes). ARCHIVE-00-21 docs are thicker implementation contracts (inputs/outputs/invariants/tables).
- **WHY:** Pack root `CANONICAL.md` declares A–R canonical and ARCHIVE quarantine — so implementers guided to thinner set.
- **IMPACT:** Ambiguous GO-IMPL: which text is binding? Risk of “ready” rubber-stamp on incomplete contracts.
- **PROPOSED CONTRACT:** Chief pick one: (i) promote selected ARCHIVE sections into A–R as normative appendices, or (ii) explicitly declare ARCHIVE normative-for-impl pending merge, or (iii) rewrite A–R to equal ARCHIVE depth. Document-only.
- **RISK:** Dual-source drift; implementer cherry-picks thinner path.
- **BLOCKER?** Y (elevates to RED as R-CANON below if unresolved)

### B2 · Gate-letter collision (SoT-letter A–R ≠ ARCHIVE Chief Gates A–R)
- **WHAT:** Letter **A** in pack = QueryPlan readiness (SoT 02). ARCHIVE Gate **A** also QueryPlan — but letter **C** pack = Budget while ARCHIVE Gate **C** = Lifecycle; pack **H** = Lifecycle while ARCHIVE Gate **H** = Budget; pack **P** = Non-goals while ARCHIVE Gate **Q** = Do-not-implement; pack **Q** = Acceptance while ARCHIVE Gate **P** = Acceptance matrix; pack has no dedicated DoR letter matching ARCHIVE Gate **R**.
- **WHY:** Race between letter-SoT mapping and Chief-brief 00–21 Gate A–R mapping (`ARCHIVE-00-21/00-EXECUTIVE-ARCHITECTURE-MAP.md` §Chief A–R coverage index).
- **IMPACT:** Chief / Acc / QA citing “Gate K” may mean Security (ARCHIVE) or Security (pack K) — luckily aligned for K — but C/H/P/Q/R collide.
- **PROPOSED CONTRACT:** Freeze one Gate ID namespace; publish alias table; never use bare “Gate C” without doc path.
- **RISK:** Mis-owned acceptance; false PASS.
- **BLOCKER?** Y for unambiguous GO language (ties to R-CANON)

### B3 · D0 “D2 NOT NOW” vs Preview slice options S1–S3 / ARCHIVE P1–P2
- **WHAT:** D0 locks **D2 QP+URL-origin Preview = NOT NOW**. `00-EXECUTIVE-READINESS.md` still offers planning slices **S1** (QueryPlan stub) and **S2** (UrlOrigin elevation). ARCHIVE-00-21 `21-RECOMMENDED-IMPLEMENTATION-SEQUENCING.md` phases P1 QueryPlan / P2 UrlOrigin as future GO-IMPL-PREVIEW.
- **WHY:** Planning language can be misread as soft-authorization of D2.
- **IMPACT:** Process confusion; premature Preview wiring requests.
- **PROPOSED CONTRACT:** Explicit line: S1–S4 / P1–P5 are **options catalogs only**; any QP Preview requires **new Chief GO that supersedes D0 D2-NOT-NOW** — readiness pack alone never lifts D0.
- **RISK:** Medium process; Low if STATUS HOLD remains default.
- **BLOCKER?** N for review completeness; **Y** before any GO-IMPL-PREVIEW stamp

### B4 · Kill-switch / rollback not first-class in canonical A–R
- **WHAT:** ARCHIVE-00-21 `15-KILL-SWITCH-ROLLBACK.md` specifies flags, emergency disable, family disable, FALLBACK_VERBATIM, rollback boundary. Canonical only has `WP-MIG-KILL` bullet inside `O-MIGRATION-FLAGS-PLAN.md`.
- **WHY:** GO-IMPL needs instant OFF → B0 verbatim as acceptance precondition.
- **IMPACT:** Incomplete Definition of Ready vs ARCHIVE Gate O/R.
- **PROPOSED CONTRACT:** Promote kill-switch section into O (or new letter) with flag matrix + mid-flight session finalize-partial rules.
- **RISK:** Orphan Preview sessions / unclear rollback.
- **BLOCKER?** Y before GO-IMPL-PREVIEW (not before review)

### B5 · Determinism vs allowed nondeterminism underspecified in A–R
- **WHAT:** `A-QUERYPLAN-READINESS.md` exit criteria require identical plan JSON; ARCHIVE-00-21 `13-DETERMINISM-REPRODUCIBILITY.md` separates plan determinism from execution timing / soft-fail variance / executionId nondeterminism.
- **WHY:** Without declared allowed nondeterminism, QA may over-fail live runs or under-test plan goldens.
- **PROPOSED CONTRACT:** Adopt ARCHIVE-13 rules into A (or dedicated section): plan bytes deterministic; execution journal may vary under network; goldens mock providers.
- **RISK:** Flaky gates or false confidence.
- **BLOCKER?** N (AMBER clarification)

### B6 · FamilyExecutionResult status taxonomy incomplete vs Chief R3
- **WHAT:** ARCHIVE-00-21 `02-SOURCE-FAMILY-ORCHESTRATION-CONTRACT.md` status enum: `ok|empty|error|skipped|timeout|rate_limited|blocked_url|unsafe_url|unsupported`. Missing first-class: **`budget_exhausted`**, **`unavailable`**, **`UNKNOWN`** (as outcome class), and explicit **budget available vs exhausted** state distinct from skip/fail.
- **WHY:** Chief R3 requires distinguish budget available/exhausted, skipped, failed, timeout, unavailable, unsupported, UNKNOWN; hard stop; no infinite fallback.
- **IMPACT:** Orchestration may collapse exhausted→error or skip→empty and invite retry fanout.
- **PROPOSED CONTRACT:** Closed status + failureClass matrix; exhaustion always hard-stops remaining fanout; fallback limited to single kill-switch verbatim path with `fallbackReason` (no loop).
- **RISK:** Fanout / rate-limit / vanity fill.
- **BLOCKER?** Y before GO-IMPL (ties to R-BUDGET)

### B7 · Open questions / risks only in ARCHIVE
- **WHAT:** ARCHIVE-00-21 `19-OPEN-ARCHITECTURAL-QUESTIONS.md` (Q1–Q12) and `20-RISKS-AND-ASSUMPTIONS.md` not mirrored in canonical A–R.
- **WHY:** Chief needs visible residual UNKNOWN (budget numbers, Acc scrub field list completeness, plan SSE mandatory vs opt-in).
- **PROPOSED CONTRACT:** Promote open-questions list into pack root (e.g. appendix to Q or new STATUS section).
- **RISK:** Silent assumption of closure.
- **BLOCKER?** N (AMBER)

### B8 · schemas/ directory ambiguity
- **WHAT:** `FILE-INDEX.md` + `schemas/README.md` say schemas not forked / optional; directory still contains `QueryPlan.schema.json`, `Budget.schema.json`, `Evidence.schema.json`, `FamilyExecutionResult.schema.json`, `SseEvent.schema.json`, etc. (ARCHIVE race artifacts).
- **WHY:** Dual machine contracts vs SoT `QUERYPLAN-SCHEMA.json` etc.
- **PROPOSED CONTRACT:** Quarantine or delete readiness-pack schema forks **or** formally declare them design-only mirrors with hash pin to SoT; never diverge silently.
- **RISK:** Impl validates against wrong schema.
- **BLOCKER?** N if cited as non-authoritative; Y if someone wires them

### B9 · Observability MVP field list thin in J
- **WHAT:** `J-OBSERVABILITY-READINESS.md` lists required fields at SoT-summary level; ARCHIVE-00-21 `12-OBSERVABILITY.md` adds metric names (`budget_exhausted_total`, `unknown_label_ratio`, …).
- **PROPOSED CONTRACT:** Merge MVP metric/event checklist into J before measure GO.
- **BLOCKER?** N for GO-IMPL-PREVIEW planning; Y before GO-MEASURE

---

## C. RED — blocks GO-IMPL until resolved (contract/doc only — do NOT implement fixes)

### R-ACC · Acc / emit surface matrix missing (Chief R2)
- **WHAT:** No readiness-pack document defines **ALLOW / REDACT / BLOCK / UNKNOWN** for **every** output surface: API responses, QueryPlan JSON, family execution state, SSE events (`plan`/`graph`/finding/…), graph JSON, candidates, evidence rows, debug, errors, logs, metrics, persisted session/HIT, cache.
- **WHY:** Canonical `K-SECURITY-READINESS.md` and ARCHIVE-00-21 `11-SECURITY-MODEL.md` give threat→control and Acc scrub *checklist* (reasons, queries, urlTargets…) but **not** a per-surface disposition matrix. SoT `12-SECURITY-MODEL.md` likewise lacks the matrix. C1 seed matrices elsewhere use ALLOW/BLOCK for **URL fetch safety**, not Acc emit disposition across orchestration surfaces.
- **IMPACT:** Acc surface growth (SoT 18 High residual) can ship without gateable review; seed→SSE poison path underspecified for new `plan`/`graph` events.
- **PROPOSED CONTRACT:** New normative table (doc-only), e.g. rows = surfaces above; cols = ALLOW (scrubbed) | REDACT (field-level) | BLOCK (omit/reject emit) | UNKNOWN (relationship/label ceiling). Extend sanitizeDiscoveryPayload checklist to each row. SSRF remains orthogonal BLOCK-on-fetch.
- **RISK:** Acc leak via plan.reasons / graph signalSummary / logs — **Critical** for Preview.
- **BLOCKER?** **Y**

### R-CANON · Canonical incompleteness for unambiguous GO-IMPL
- **WHAT:** Declared canonical A–R omit first-class contracts that ARCHIVE-00-21 (and Chief 00–21 checklist) treat as Gates:
  - Relationship / UNKNOWN axioms (`ARCHIVE-00-21/05-RELATIONSHIP-SEMANTICS.md`)
  - Evidence field + provenance floor (`ARCHIVE-00-21/04-EVIDENCE-CONTRACT.md`)
  - Lifecycle legal transitions + terminals (`ARCHIVE-00-21/03-DISCOVERY-LIFECYCLE-STATE-MACHINE.md`) — pack H is thinner
  - Kill-switch (`ARCHIVE-00-21/15-KILL-SWITCH-ROLLBACK.md`)
  - Numbered Do-not-implement register F01–F25 (`ARCHIVE-00-21/17-DO-NOT-IMPLEMENT-REGISTER.md`) — pack P is process-only
  - Definition of Implementation Ready (`ARCHIVE-00-21/18-DEFINITION-OF-IMPLEMENTATION-READY.md`)
  - Testable Acceptance matrix (`ARCHIVE-00-21/16-ACCEPTANCE-MATRIX.md`) — pack Q is ordered gates without test/failure/evidence columns
  - Determinism contract (`ARCHIVE-00-21/13-DETERMINISM-REPRODUCIBILITY.md`)
- **WHY:** `STATUS-ארכיטקט.md` claims pack **READY**; ARCHIVE `STATUS.md` claims contracts “concrete enough” — but root canonical set is the thinner letter pack.
- **IMPACT:** Chief cannot say GO-IMPL unambiguously against A–R alone without importing quarantine text informally.
- **PROPOSED CONTRACT:** Resolve B1/B2: merge or re-canonize; then re-run readiness review.
- **RISK:** False READY; partial impl against stubs.
- **BLOCKER?** **Y**

### R-UNKNOWN · UNKNOWN erosion controls not normative in canonical set (Chief R1)
- **WHAT:** Strong axioms live primarily in ARCHIVE-00-21/05 (`UNKNOWN ≠ FALSE`, `INFORMATION ≠ IDENTITY`, `DISCOVERY ≠ IDENTITY`, URL-alone → UNKNOWN, failure ≠ CONTRADICTORY, no fanout invitation from empty). Canonical A–R only scatter Bound phrases in D/E/F/I/L — **no single normative UNKNOWN contract**.
- **WHY:** Product pressure to “fix empties” is SoT 18 Critical residual; orchestration must respect UNKNOWN without inviting more providers.
- **IMPACT:** Planner/orchestrator authors reading only A–R may treat empty as error-to-retry (fanout) or coerce UNKNOWN→RELATED/FALSE.
- **PROPOSED CONTRACT:** Promote ARCHIVE-05 decision table into canonical (new letter or expand D/E/F); require execution journal reasons that **forbid** “retry until hit” on UNKNOWN/empty.
- **RISK:** Bound regression · identity theater.
- **BLOCKER?** **Y**

### R-BUDGET · Hard-stop / status distinction incomplete (Chief R3)
- **WHAT:** Canonical `C-DISCOVERY-BUDGET-READINESS.md` states exhaustion → partial FINALIZE but lacks: (1) closed taxonomy Chief listed; (2) deterministic degradation order (ARCHIVE-08 has cancel EXPAND → skip low-priority → …); (3) explicit ban on infinite fallback / uncapped secondary hops beyond SoT cite; (4) graph node/edge / retry / parallel / SSE lifetime caps present in ARCHIVE-08 but absent from C; (5) status enum gap (B6).
- **WHY:** Fanout without hard stop is IR scalability risk SoT 04 cites.
- **IMPACT:** Preview could soft-retry or re-PLAN around exhaustion.
- **PROPOSED CONTRACT:** Merge ARCHIVE-08 + closed status matrix into C; maxRetries default 0; maxPlanRevisions hard; no mid-session cap raise without revision reason (already SoT — must be acceptance-tested).
- **RISK:** Cost / ban / silent expansion.
- **BLOCKER?** **Y**

### R-DOR · Definition of Ready + acceptance testability not closed in canonical
- **WHAT:** ARCHIVE-00-21/18 lists 12 objective Ready conditions; ARCHIVE-00-21/16 acceptance matrix has invariant → test → expected → failure → evidence. Canonical Q lists gates 0–15 but **without** per-invariant test design / failure condition / evidence type. Pack STATUS marks READY without satisfying ARCHIVE DoR item 2 (“contracts complete without contradiction”) given dual CANONICAL.
- **WHY:** Chief cannot verify “beyond works” acceptance.
- **PROPOSED CONTRACT:** Adopt DoR checklist + acceptance matrix into canonical Q/R; STATUS must not say READY until matrix rows exist for R1–R3 themes.
- **RISK:** GO based on narrative readiness.
- **BLOCKER?** **Y**

### R-SSE · SSE as untrusted surface under-specified in canonical H
- **WHAT:** ARCHIVE-00-21/09 specifies `plan`/`graph` additive events, Acc scrub, ordering, always-`done`, reconnect idempotency, maxSseLifetimeMs. Canonical `H-PROGRESSIVE-LIFECYCLE-READINESS.md` only sketches phase events + scrub.
- **WHY:** SSE is a primary Acc/leak and hang surface; seed→SSE path must be threat-reviewed (R2).
- **IMPACT:** New events may ship without scrub/termination contracts.
- **PROPOSED CONTRACT:** Promote ARCHIVE-09 into H; bind each SSE event type into R-ACC matrix.
- **RISK:** Hang · Acc leak · client confusion.
- **BLOCKER?** **Y** (subset of R-ACC + lifecycle)

---

## D. CONTRADICTIONS

| ID | Conflict | Detail |
|----|----------|--------|
| D1 | **Dual CANONICAL markers** | Root `CANONICAL.md` (13:41 IDT): A–R canonical; ARCHIVE quarantine. `ARCHIVE-00-21/CANONICAL.md` (13:40 IDT): **00–21** canonical; letter drafts non-canonical. Mutually exclusive. |
| D2 | **STATUS READY claims** | Root `STATUS-ארכיטקט.md`: Status **READY**. ARCHIVE `STATUS.md`: “concrete enough for future Preview GO”. Both claim readiness while substantive contracts disagree on canonicity. |
| D3 | **Gate letter namespace** | Pack letters follow SoT section topics (CROSSWALK). ARCHIVE Chief Gates A–R remap topics (lifecycle=C, budget=H, acceptance=P, DoR=R). Same letter ≠ same gate. |
| D4 | **Chief A–R checklist vs pack A–R** | ARCHIVE `00-EXECUTIVE-ARCHITECTURE-MAP.md` §Chief A–R coverage expects dedicated Evidence, Relationship, Kill-switch, DoR docs. Pack A–R maps SoT 02–18 differently and **drops** standalone Relationship/Evidence/Kill-switch/DoR. |
| D5 | **D0 D2 NOT NOW vs slice catalogs** | D0: D2 QP+URL Preview NOT NOW. Pack `00` S1–S2 and ARCHIVE `21` P1–P2 describe that Preview as future sequencing — OK if strictly “not now”, **contradictory if read as invited**. |
| D6 | **schemas fork vs “not forked”** | README/FILE-INDEX deny fork; `schemas/*.json` files present with ARCHIVE-oriented names (`FamilyExecutionResult`, `SseEvent`) absent from SoT root schema set. |
| D7 | **SoT vs readiness depth** | SoT 01–18 + D0 remain coherent design base. Readiness pack does **not** contradict SoT locks, but **under-implements** SoT intent as impl contracts in the *canonical* letter set (gap ≠ SoT edit — documentation defect). |
| D8 | **FILE-INDEX “Ignore ARCHIVE” vs review mandate** | FILE-INDEX says ignore ARCHIVE; Chief review brief requires citing ARCHIVE contradictions — this verdict follows Chief brief. |

---

## E. MISSING CONTRACTS

Explicit gaps vs Chief required themes / ARCHIVE 00–21 checklist (relative to **canonical** A–R):

| Missing / thin | Needed for | Notes |
|----------------|------------|-------|
| Per-surface Acc disposition matrix ALLOW/REDACT/BLOCK/UNKNOWN | R2 · R-ACC | Not in K or ARCHIVE-11 |
| Normative UNKNOWN / relationship decision table | R1 · R-UNKNOWN | ARCHIVE-05 exists; not canonical |
| Evidence field + provenance floor contract | Provenance · candidate≠confirmed | ARCHIVE-04; pack F thinner |
| Lifecycle legal transition table + terminals | Family/session state machine | ARCHIVE-03; pack H thinner |
| Closed execution status taxonomy (Chief R3 list) | Budget/fanout | Partial in ARCHIVE-02/10 |
| Deterministic degradation order + maxRetries/parallel/SSE/graph caps | R3 | ARCHIVE-08 extras absent from C |
| Kill-switch & rollback | DoR / O | ARCHIVE-15; only WP in O |
| Numbered Do-not-implement register | Clarity | ARCHIVE-17 F01–F25; P thinner |
| Definition of Implementation Ready | DoR completeness | ARCHIVE-18 |
| Acceptance matrix (test/failure/evidence columns) | Acceptance beyond “works” | ARCHIVE-16; Q lacks columns |
| Determinism & allowed nondeterminism | QueryPlan determinism | ARCHIVE-13 |
| Open questions + risks register | Honesty | ARCHIVE-19/20 |
| SSE event contract (plan/graph/done/hang) | SSE untrusted surface | ARCHIVE-09 |
| Candidate vs confirmed explicit rule | candidate≠confirmed | Implied in SoT/ARCHIVE-05; not spelled in A–R |
| URL≠identity / graph no-laundering single checklist | URL / graph | Split across E/F; need one acceptance row |
| Security seed→SSE threat path | R2 | Not end-to-end in K/H |
| Observability MVP metric names | Obs | Thin in J |
| Resolved Gate ID namespace | Process | D3 |

---

## F. SECURITY GAPS

### Where disposition is defined (partial)

| Area | Defined? | Cite |
|------|----------|------|
| urlSafety fetch ALLOW vs BLOCK (SSRF) | YES (fetch path) | SoT 12 · K · C1 packs · ARCHIVE-11 |
| Acc sanitize on findings/facets | YES (AS-IS emit) | K AS-IS keep |
| Acc extend to plan reasons/queries/urlTargets | Checklist only | ARCHIVE-11 §2 · K WP-SEC-ACC |
| Core mayCommitDossier forbidden | YES | K · SoT 12 |
| Credentials never in plan JSON | YES (rule) | K · ARCHIVE-11 |
| Poisoned meta ceiling | YES (narrative) | K · E · SoT 12 |

### Where ALLOW/REDACT/BLOCK/UNKNOWN **undefined** (gaps)

| Surface | Gap |
|---------|-----|
| API GET session / HIT full payload | No field-level Acc disposition for new `queryPlan` / `evidenceGraph` |
| QueryPlan JSON (persist + emit) | Scrub mentioned; no REDACT field list / BLOCK deny-list beyond “no credentials” |
| Family execution journal / skip reasons | May carry raw provider error strings — disposition UNKNOWN |
| SSE `plan` / `graph` / `progress` / `error` | ARCHIVE-09 says scrub; no per-field matrix |
| Graph JSON nodes/edges/signalSummary | F/K mention scrub; no BLOCK rules for person/org mention nodes |
| Candidates / softRefs | Typed-only rule exists; emit disposition incomplete |
| Evidence quotes / rawRef | ARCHIVE-04 rawRef “never Acc-forbidden on emit” — not in canonical F |
| Debug / failureInject surfaces | Not threat-reviewed for Preview |
| Logs / metrics / obs | J/K “no secrets”; no REDACT catalog |
| Persisted store / cache | Session isolation stated; cache key isolation “no shared mutable caches” only in ARCHIVE-11 |
| Errors to client | failure≠negative finding stated in I; Acc on error payloads underspecified |

### SSRF / plan JSON / Acc scrub extension

- **SSRF:** Contractual keep under QueryPlan path (K exit criteria) — **good**, but must appear as acceptance matrix row (missing in Q).
- **Plan JSON:** Highest new Acc surface — checklist exists, matrix does not → **R-ACC**.
- **Acc scrub extension:** WP named; **not** closed as testable gate with bait corpus for plan/SSE/graph.

---

## G. UNKNOWN / BOUND GAPS

| Erosion path | Present control | Gap |
|--------------|-----------------|-----|
| UNKNOWN → FALSE | ARCHIVE-05 axiom; not canonical | Promote or risk ignore |
| UNKNOWN → SAME-* / RELATED on URL-alone | E Bound · C1 | Acceptance row missing in Q |
| Empty → “try more families” fanout | Soft SoT 04 / P | No hard “empty does not authorize expansion” in C |
| Failure → CONTRADICTORY | I · ARCHIVE-10 | OK if canonical I retained |
| SeedClass wrong → identity theater | G | Exit “wrong class never SAME-*” OK; needs matrix test |
| Metrics Freshness invented | L says UNKNOWN | Good — keep |
| C1 Bound freeze under UrlOriginStage elevation | E | Must re-assert under plan path (N notes) — not closed |
| Graph laundering (implicit edges / same-entity) | F | Exit criteria exist; no validator acceptance row in Q |
| candidate≠confirmed | Implicit | Needs explicit Finding state / label contract in canonical |

---

## H. BUDGET / FANOUT GAPS

| Path | Hard stop? | Notes |
|------|------------|-------|
| maxRequests / maxFamilyCalls | Partial (C + SoT 04) | Need status=`budget_exhausted` + no further launch |
| maxUrls / one-hop | Partial (E/C) | ARCHIVE bands ≤5+≤5; canonical cites align C1 — OK if enforced |
| maxWallMs | AS-IS substrate | Soft-stop → FINALIZE partial must be acceptance-tested |
| maxFindings / vanity | Named in SoT/C | Truncate without extra providers — needs test |
| maxPlanRevisions | SoT/H | Re-PLAN loop risk if reason weak |
| Retries | ARCHIVE-02 default 0 | **Absent from canonical C/B** — gap |
| Parallel families | ARCHIVE-02 ≤3 | **Absent from C** |
| SSE lifetime | ARCHIVE-08/09 | **Absent from H/C** |
| Graph growth caps | ARCHIVE-08 | **Absent from C/F** |
| rate_limited steal budget | SoT 04 / ARCHIVE-08 | Mentioned in C risks; not hard rule |
| Kill-switch fallback verbatim | ARCHIVE-15 | Single fallback OK; **must not** chain into adaptive expansion |
| Infinite fallback / “fix empty” | Forbidden narratively | **Not** acceptance-enforced in Q |

---

## I. ACCEPTANCE GAPS

Missing to test future implementation (beyond “it works”):

1. Golden plan byte-identity tests (A exit) — **no fixture files yet** (OK pre-GO; must be Gate before measure).
2. Per-invariant **failure condition + evidence type** columns (ARCHIVE-16) — absent from Q.
3. Acc bait corpus for **plan / SSE plan / graph** fields — not specified in K/N.
4. Flag-OFF B0 byte-identical CONTROL harness — named in O/Q; no method detail.
5. Budget cap=0 → zero further provider calls assert — not in Q rows.
6. Status taxonomy asserts (skipped vs exhausted vs timeout vs unsupported vs UNKNOWN).
7. SSE always terminates (`done`) + no hang under cancel/FAIL_PLAN/budget stop.
8. SAME-ENTITY=0 · BAD_URL_ALONE_SAME=0 · SSRF PASS under **QueryPlan path** (not only legacy C1 provider path).
9. Kill-switch toggle mid-flight behavior.
10. MULTI secondary policy lint (not sole promote gate).
11. Do-not-implement CI guards (title coalesce / crawl APIs) — P WP only.
12. Owners assigned per gate for chosen slice — Q exit checkbox empty.

---

## J. GO CONDITIONS

### Before Chief may issue **GO-IMPL-PREVIEW** (planning authorization still ≠ code until stamp; separate from GO-MEASURE / GO-PROMOTE)

ALL must be true:

1. **Canon resolved** — Single binding contract set (A–R merged with needed ARCHIVE depth **or** ARCHIVE promoted); dual CANONICAL contradiction closed; Gate ID namespace frozen.
2. **R-ACC closed** — Normative ALLOW/REDACT/BLOCK/UNKNOWN matrix for all listed surfaces + Acc bait plan for plan/SSE/graph.
3. **R-UNKNOWN closed** — Normative UNKNOWN axioms + decision table in canonical pack; empty/UNKNOWN must not authorize fanout.
4. **R-BUDGET closed** — Closed status taxonomy (incl. budget available/exhausted, skipped, failed, timeout, unavailable, unsupported, UNKNOWN); hard stop; degradation order; maxRetries default 0; no infinite fallback; ARCHIVE-08 caps reconciled into C.
5. **Kill-switch contract** first-class (flag OFF → B0 verbatim; mid-flight partial finalize).
6. **DoR + Acceptance matrix** adopted (ARCHIVE-18/16 class) with test/failure/evidence columns covering R1–R3, identity-safety, SSRF, Bound, SSE termination, Core lock.
7. **Do-not-implement register** numbered and cited by every future WP.
8. **D0 relationship explicit** — Written Chief decision that GO-IMPL-PREVIEW **supersedes** D0 “D2 NOT NOW” *or* GO limited to non-D2 scope Chief defines; S0 HOLD remains default until that stamp.
9. **Locks restated** on the GO stamp: B0 LOCKED · Core LOCKED · A2-safe frozen · A2-bound rejected · C1 Bound frozen · PROMOTE HOLD · no providers/crawl/C2+.
10. **Owners assigned** (Acc / Server / QA / Arch) for chosen slice; non-goals acknowledged.
11. **schemas authority** pinned (SoT schemas only, or explicitly versioned mirrors).
12. **No code / no flag wiring / no measure** until the GO stamp exists — this verdict is not that stamp.

### Before **GO-MEASURE** (later; not requested now)

All GO-IMPL-PREVIEW conditions + golden plans + CONTROL/TREATMENT harness + adversarial suite green or Chief-waived + evidence pack R structure filled + Acc/Bound/SSRF gates recorded.

### Before **GO-PROMOTE-*** (later)

Separate Chief decision; default **HOLD**; MULTI never sole gate; safety gates disqualify.

---

## DOCUMENT MATRIX (appendix)

| Doc ID | Purpose | Gaps severity | Notes |
|--------|---------|---------------|-------|
| 00-EXECUTIVE-READINESS | TL;DR · HOLD · S0–S4 options | A | S1–S2 vs D0 D2 tension (B3) |
| A-QUERYPLAN-READINESS | SoT 02 readiness / WPs | A | Thin vs ARCHIVE-01; determinism partial |
| B-SOURCE-FAMILY-READINESS | SoT 03 registry / orch | A | Missing status taxonomy / parallelism / retries |
| C-DISCOVERY-BUDGET-READINESS | SoT 04 budgets | **R** | Hard-stop/taxonomy/caps incomplete (R-BUDGET) |
| D-INDEPENDENCE-READINESS | SoT 05 independence | G/A | Directionally sound; UNKNOWN axioms not owned here |
| E-URL-ORIGIN-STAGE-READINESS | SoT 06 · C1 Bound | A | Bound OK; Acc seed→SSE path not end-to-end |
| F-EVIDENCE-GRAPH-READINESS | SoT 07 graph | A | Thinner than ARCHIVE-04/07; laundering tests thin |
| G-ENTITY-TYPE-ROUTING-READINESS | SoT 08 router | A | Heuristics open (ARCHIVE Q1) |
| H-PROGRESSIVE-LIFECYCLE-READINESS | SoT 09 SSE/lifecycle | **R** | Missing transitions + SSE contract (R-SSE) |
| I-FAILURE-MODEL-READINESS | SoT 10 failures | A | Enum OK; status vs failureClass blur |
| J-OBSERVABILITY-READINESS | SoT 11 obs | A | MVP metrics thin |
| K-SECURITY-READINESS | SoT 12 security | **R** | No per-surface Acc matrix (R-ACC) |
| L-METRICS-READINESS | SoT 13 dims | G/A | MULTI secondary OK; freshness UNKNOWN OK |
| M-EXAMPLE-PLANS-VALIDATION | SoT 14 goldens plan | G/A | Fixtures planned; not created (OK pre-GO) |
| N-ADVERSARIAL-SUITE-PLAN | SoT 15 suite plan | G/A | Good map; not runnable until GO |
| O-MIGRATION-FLAGS-PLAN | SoT 16 flags | A | Kill-switch only as WP (B4) |
| P-NON-GOALS-ENFORCEMENT | SoT 17 stops | A | Thinner than F01–F25 register |
| Q-ACCEPTANCE-GATES-FUTURE-IMPL | Gates 0–15 | **R** | No test/failure/evidence matrix (R-DOR) |
| R-FUTURE-EVIDENCE-PACK-STRUCTURE | Future pack template | G | Template only — appropriate |
| CROSSWALK-SOT-01-18-TO-A-R | SoT→letter map | A | Collides with ARCHIVE Gate letters (D3) |
| STATUS-ארכיטקט | READY · STOP | **R** | READY claim premature vs RED gaps |
| CANONICAL.md (root) | Declares A–R canonical | **R** | Contradicts ARCHIVE CANONICAL (D1) |
| FILE-INDEX.md | Index | A | Says ignore ARCHIVE; schemas note ambiguous |
| schemas/* | Design JSON | A | Present despite “not forked” |
| ARCHIVE-00-21/00–21 + STATUS + CHIEF-REVIEW-PACK | Thicker contracts | A/G | Substantive but **quarantined**; Gate remap; still missing Acc surface matrix |
| ARCHIVE-00-21/17-DO-NOT-IMPLEMENT | F01–F25 | G | Strong — not canonical |
| ARCHIVE-00-21/18-DEFINITION-OF-READY | DoR | G | Strong — not canonical |
| ARCHIVE-00-21/16-ACCEPTANCE-MATRIX | Testable matrix | G | Strong — not canonical |
| ARCHIVE-00-21/05-RELATIONSHIP | UNKNOWN axioms | G | Strong — not canonical |
| SoT 01–18 + D0 | Architecture SoT | G (cite) | Immutable; design gates MET ≠ impl ready |

Severity key: **G** = green enough for planning · **A** = amber clarification · **R** = red blocks GO-IMPL

---

## OVERALL VERDICT

### **NOT READY FOR GO-IMPL**

**Top blockers:**

1. **R-ACC** — No ALLOW/REDACT/BLOCK/UNKNOWN Acc disposition matrix across all emit/persist surfaces (Chief R2).
2. **R-CANON** — Canonical A–R thinner than ARCHIVE-00-21 and mutually contradictory CANONICAL markers / Gate letter namespaces; Chief cannot bind implementers unambiguously.
3. **R-UNKNOWN + R-BUDGET** — UNKNOWN axioms and closed budget/fanout hard-stop taxonomy not normative in the canonical set (Chief R1/R3); acceptance/DoR not testable in Q.

Also RED: **R-DOR**, **R-SSE** (supports the above).

**Not claimed:** GO-IMPL-PREVIEW · GO-MEASURE · GO-PROMOTE · any code authorization.  
**Default remains:** **HOLD** per D0 and pack STATUS STOP language (despite premature READY label).

---

## STOP LINE

REVIEW COMPLETE · NO CODE · NO MEASURE · NO PROMOTE · NO GO-IMPL · AWAITING CHIEF DECISION
