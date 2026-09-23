# Phase A Architecture Freeze Pack · Entity-Agnostic Invariant Addendum · ארכיטקט · 2026-09-20

**STATUS:** **FROZEN addendum** · Acc P0 promote **CLOSED on `dpl_8ag…`** · **Phase B HOLD** · **WP4 NO-GO**

**REFERENCE:** `PHASE-A-ARCHITECTURE-FREEZE-PACK-ארכיטקט-2026-09-20.md` — this is an addendum to **FROZEN v1.0**. It clarifies the invariant only; it does **not** reopen Phase B.

**SCOPE:** DOCS ONLY. No code, no deploy, no Phase B work.

---

## Chief CRITICAL LOCK · Entity-agnostic Discovery

1. **«דוד כהן» = Seed example ONLY** for tests and illustration. It is **FORBIDDEN** to implement hard-coded logic, conditions, maps, routing, ranking, fixtures-as-production-assumptions, or any other behavior around that name or around any specific entity.
2. **ANY input is a Seed only:** name, person, company, domain, phone, address, identifier, or any other user-provided input. No input kind is a privileged target.
3. The engine goal is a **general engine that expands from any Seed** — it is not “find דוד כהן.”
4. All Entity Resolution, Discovery, relationship, correlation, scoring, ranking, Acc, and UI/API behavior MUST remain agnostic to the Seed’s value and entity type.

## Canonical general pipeline

Every input follows the same pipeline:

`Seed → Entity Resolution → Discovery → Relationship Expansion → Cross-Source Correlation → Evidence Scoring → Findings`

A Seed is an initial search anchor, not an identity assertion or a preselected dossier. Same-name matches remain separate unless the existing evidence-backed Entity Resolution rules justify a relationship; UNKNOWN remains UNKNOWN.

## Fixture obligation · Vertical Slice AC

The Vertical Slice AC MUST pass on **at least three distinct Seeds**, using the same pipeline and acceptance criteria for each. The following are proposed fixtures only and MUST NOT be special-cased:

| Fixture | Kind | Seed-only usage |
|---|---|---|
| `דוד כהן` | Hebrew person-name input | Illustration and regression fixture only |
| `Alex Morgan` | Ambiguous Latin person-name input | Ambiguity / no-forced-merge fixture only |
| `example.org` / `Example Organization` | Domain / organization input | Organization/domain expansion fixture only |

For each fixture, the slice must demonstrate the existing Phase A lifecycle and contracts (including VS-S01–S10, the applicable VS-U checks, and VS-A01–A06) without a branch, lookup table, assumption, or expected result that depends on the literal seed value. The three fixtures are examples of coverage, not an exhaustive allowlist; additional Seeds must behave through the same general engine.

## Acc invariants remain Seed-agnostic

All `ACC-DISC` invariants continue to apply **regardless of Seed kind or value**:

- **ACC-DISC-01:** forbidden identity leakage is zero across findings, candidates, facets, graph, progressive events, cache rehydration, and UI surfaces.
- **ACC-DISC-02:** Discovery/Entity Mode gates remain enforced; no unauthorised identity certainty or dossier commit.
- **ACC-DISC-03:** UNKNOWN ≠ FALSE.
- **ACC-DISC-04:** no unjustified information drop.
- **ACC-DISC-05:** merge/bind only on explicit evidence-backed relationships.
- **ACC-DISC-06:** rank Findings by evidence, not identity; forbidden identities never appear in ranked output.

No Acc invariant may be weakened, bypassed, or made conditional on a particular name, person, company, domain, phone, address, or identifier.

## Acceptance / freeze decision

- [ ] Vertical Slice AC is specified for ≥3 distinct Seeds, including the three proposed fixtures above.
- [ ] No entity-specific special case exists in the architecture, fixtures-as-production assumptions, or acceptance criteria.
- [ ] ACC-DISC-01…06 are asserted for every Seed fixture.
- [ ] Core boundary, public/authorized-only rule, provenance, and UNKNOWN≠FALSE remain unchanged.
- [ ] This addendum is frozen with Pack v1.0 and does not authorize implementation, deployment, promote, or Phase B.

**Decision:** **FROZEN addendum** · Acc P0 promote **CLOSED on `dpl_8ag…`** · **Phase B HOLD** · **WP4 NO-GO**.
