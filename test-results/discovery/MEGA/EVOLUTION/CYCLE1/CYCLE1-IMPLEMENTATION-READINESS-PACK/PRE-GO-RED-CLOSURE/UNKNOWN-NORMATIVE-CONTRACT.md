# UNKNOWN-NORMATIVE-CONTRACT · PRE-GO RED CLOSURE

**Stamp:** 2026-09-21T23:53:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Closes:** **R-UNKNOWN** (Chief verdict §C · Chief R1)  
**Elevates:** `ARCHIVE-00-21/05-RELATIONSHIP-SEMANTICS.md` (normative)  
**Cite-only SoT:** `05-INDEPENDENCE-MODEL.md` · `06-URL-ORIGIN-INTEGRATION.md` · `07-EVIDENCE-GRAPH.md` · `10-FAILURE-MODEL.md` · `17-NON-GOALS.md` · C1 Bound · A2-safe FROZEN · A2-bound REJECTED  
**Mode:** DOCUMENTATION ONLY · NO CODE · NO A2/C1 unfreeze

---

## 1. Axioms (non-negotiable)

| ID | Axiom | Meaning |
|----|-------|---------|
| U1 | **UNKNOWN ≠ FALSE** | Absence of proof is not disproof |
| U2 | **INFORMATION ≠ IDENTITY** | Useful metadata is not entity truth |
| U3 | **DISCOVERY ≠ IDENTITY** | Finding a page/ref is not SAME-ENTITY |
| U4 | **RELATED ≠ SAME** · **POSSIBLE ≠ SAME** | Soft signals never attach as identity |
| U5 | **No identity inference from architecture** | QueryPlan / budgets / SSE / graph layout never authorize SAME-ENTITY |
| U6 | **candidate ≠ confirmed** | Soft/candidate refs never auto-promote to confirmed identity |
| U7 | **Empty does not authorize fanout** | empty / UNKNOWN outcome MUST NOT invite additional families/providers beyond the validated plan |
| U8 | **Failure ≠ CONTRADICTORY** | Transport/provider failures are failure classes, not relationship CONTRADICTORY |

Closed vocab: `SAME-ENTITY` | `SAME-REFERENCE` | `RELATED-ENTITY` | `POSSIBLE-MATCH` | `UNKNOWN` | `CONTRADICTORY`

---

## 2. IS / IS NOT

| IS | IS NOT |
|----|--------|
| Mandatory label when evidence insufficient | Equivalent to FALSE / “not related” |
| Valid terminal session content | License to invent RELATED/SAME-* to “fill” UI |
| Ceiling for URL/domain-alone (C1-PATCHED Bound) | Upgrade path via title/og/host overlap |
| Honest partial / empty discovery | Error that must be retried until hit |
| Graph `unknown` edge or **omit edge** | Implicit same-entity / ownership edge |

---

## 3. State + event → next (decision / transition)

| Current label / situation | Event / signal | Next max label | Attach? | Fanout? |
|---------------------------|----------------|----------------|---------|---------|
| (none) | Typed soft-ref ∩ across ≥2 distinct hostFamilies (`viaf:`/`qid:`/`ol:`) | SAME-REFERENCE | YES | No extra beyond plan |
| (none) | URL/domain only | **UNKNOWN** | NO | **NO** (empty/UNKNOWN ≠ expand) |
| (none) | Seed-is-URL self-cite | **UNKNOWN** | NO | NO |
| (none) | Lexical title/og ≥2 tokens | POSSIBLE-MATCH | NO | NO |
| (none) | Documented relatedness + rationale | RELATED-ENTITY | NO | NO |
| (none) | Mutually exclusive typed ids | CONTRADICTORY | NO | NO |
| (none) | Insufficient / soft-fail / blocked fetch | **UNKNOWN** | NO | NO |
| Any Preview/experimental lane | Path claiming SAME-ENTITY | **FORBIDDEN** | — | — |
| UNKNOWN | “UI empty” pressure / vanity | Stay UNKNOWN | NO | **NO** |
| empty family result | Planner temptation to add families | Stay empty+reason | — | **NO** (U7) |
| failureClass timeout/error | Classify as CONTRADICTORY | **FORBIDDEN** — remain failureClass | — | Soft-fail only |
| candidate softRef | Auto-confirm | **FORBIDDEN** | — | — |

---

## 4. Forbidden transitions

| From | To | Why forbidden |
|------|-----|---------------|
| UNKNOWN | FALSE | U1 |
| UNKNOWN | SAME-ENTITY / SAME-REFERENCE (without typed multi-host path) | U3/U5 · C1 |
| URL-alone | SAME-* / RELATED (C1-PATCHED prefers UNKNOWN) | C1 Bound FROZEN |
| empty | “retry until hit” / uncapped secondary families | U7 · R-BUDGET |
| failure / timeout / blocked_url | CONTRADICTORY | U8 |
| POSSIBLE-MATCH / RELATED-ENTITY | SAME-ENTITY (attach upgrade) | U4 |
| candidate | confirmed (silent) | U6 |
| title / og / host overlap | SAME-REFERENCE attach | A2-bound REJECTED · title-bridge |
| Architecture artifact (plan shape) | Identity claim | U5 |

---

## 5. Tests (falsifiable)

| Test ID | How to falsify | Pass |
|---------|----------------|------|
| T-UNK-01 | URL-alone corpus under plan path → any SAME-* or BAD_URL_ALONE_SAME≠0 | BAD_URL_ALONE_SAME=0 · label UNKNOWN |
| T-UNK-02 | Homonym + title-similar pair → SAME-ENTITY or title-bridge SAME-REFERENCE | SAME-ENTITY=0 · no title attach |
| T-UNK-03 | Empty family (mock) → orchestrator launches extra unplanned family | Zero unplanned launches; journal reason `empty_no_fanout` |
| T-UNK-04 | Inject provider timeout → edge labeled CONTRADICTORY | failureClass=timeout only; no CONTRADICTORY |
| T-UNK-05 | Attempt SAME-ENTITY emit in Preview lane | Rejected / count=0 |
| T-UNK-06 | Finding without provenance planId/familyId | Omit/reject; never orphan attach |

---

## 6. Failure behavior

| Failure | Behavior |
|---------|----------|
| Classifier would emit forbidden label | Drop/coerce to UNKNOWN or omit edge; record `relationship_guard_block` |
| Fanout invitation from empty/UNKNOWN | Hard deny; status stays empty/UNKNOWN; **no** budget steal for “fix” |
| Acc-forbidden identity in payload | Acc scrub / BLOCK per `ACC-EMIT-SURFACE-MATRIX.md` |
| Bound regression vs C1 | **Disqualifying** for any future GO-MEASURE / promote |

---

## 7. Evidence artifacts expected

| Evidence | Description |
|----------|-------------|
| Label histogram | Counts per closed vocab on adversarial corpora |
| BAD_URL_ALONE_SAME | Must be 0 (C1 Bound) |
| SAME-ENTITY count | Must be 0 under experimental/Preview lanes |
| Execution journal | Skip/empty reasons showing `empty_no_fanout` / no retry-until-hit |
| Graph validator report | No orphan edges; no same-entity edges |

---

## 8. Closure quadruple (R-UNKNOWN)

| Element | Present? | Cite |
|---------|----------|------|
| Contract | YES | This document elevating ARCHIVE-05 |
| Test | YES | T-UNK-01…06 |
| Failure | YES | §6 |
| Evidence | YES | §7 |

**R-UNKNOWN:** CLOSED (documentation). Residual AMBER: seedClass heuristics (ARCHIVE-19 Q1) — does not reopen UNKNOWN axioms.

---

## STOP

NO CODE · NO MEASURE · NO PROMOTE · NO GO-IMPL WITHOUT NEW CHIEF ORDER · NO A2/C1 UNFREEZE
