# 16 — ACCEPTANCE MATRIX · Chief Gate P

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT 18 gates A–L · IR acceptance gates · C1/A2 Bound gates  
**Note:** Expected results are **contractual**; measured KPIs UNKNOWN until Preview runs.

---

## Matrix

| Component | Invariant | Test (design) | Expected | Failure condition | Evidence required |
|-----------|-----------|---------------|----------|-------------------|-------------------|
| QueryPlan | Same inputs → same plan | Golden snapshot hash | Byte-identical plan | Nondeterministic fields | Plan fixtures |
| QueryPlan | reasons non-empty | Schema validate | reject empty | Missing reason | Validator tests |
| QueryPlan | No identity directives | Deny-list fuzz | reject | SAME_ENTITY etc. present | Adversarial cases SoT 15 |
| SeedClass | Misclass → ambiguous | Ambiguous corpus | no SAME-* | Identity theater | S12–S15 style cases |
| Family orch | Isolation | faultInject one family | others intact | Cross-corrupt | failureInject suite |
| Family orch | Skip unwired | filings intent | skipped+reason | Fake hits | Execution journal |
| Budget | No silent expansion | Cap=0 requests | budget_exhausted partial | Extra provider call | Telemetry assert |
| Budget | Wall stop | maxWallMs low | FINALIZE partial | Hang | Latency record |
| Evidence | Provenance mandatory | Emit without planId | reject/omit | Orphan finding | Contract test |
| Relationship | SAME-ENTITY=0 | Homonym+URL corpora | 0 | Any SAME-ENTITY | A2/C1 adversarial |
| Relationship | URL-alone UNKNOWN | URL seeds | UNKNOWN; BAD_URL_ALONE_SAME=0 | SAME-* on URL | C1 Bound pack |
| Relationship | Title-bridge forbidden | Title-similar pair | no attach | SAME-REFERENCE via title | A2-bound REJECTED |
| URL-origin | SSRF block | 169.254/localhost | unsafe_url no fetch | Fetch occurs | C1 SSRF PASS |
| URL-origin | No typed mint | web_origin run | no viaf/qid/ol minted by WO | Attach key web_origin: | C1 contract |
| Graph | No implicit edges | Build without provenance | omit/unknown | Orphan edge | Graph validator |
| Graph | same-entity not emitted | Attempt | reject | Edge persisted | Schema + runtime |
| SSE | Always terminates | All paths | done emitted | Hang | SSE_RECONNECT_DOCS |
| SSE | Acc scrub | Poison meta | leak=0 | Acc identity on wire | emit scrub tests |
| Acc | Plan surfaces scrubbed | Plan reasons bait | leak=0 | Leak in plan/SSE | Extended checklist |
| Core | Untouched | Diff/guard | no mayCommitDossier | Core call | Static/guard test |
| B0 | Flag OFF identical | CONTROL path | verbatim behavior | Drift | Snapshot compare |
| Kill-switch | Flag OFF | Toggle mid | B0 path | Orch continues | Flag test |
| MULTI | Secondary only | Metrics policy | not promote gate | Sole success metric | Metric model |
| UNKNOWN | Preserved | Empty/URL | UNKNOWN≠FALSE | Coerced false | Label counts |
| Promote | HOLD | Process | no alias change | Autonomous promote | D0 |

---

## Safety gates (disqualifying)

Acc leakage ≠ 0 · Core pw/leak ≠ 0 · BAD_URL_ALONE_SAME ≠ 0 · SAME-ENTITY ≠ 0 under experimental lanes · SSRF suite FAIL · silent expansion observed.
