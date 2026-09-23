# 02 — QUERYPLAN CONTRACT · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · deterministic contract · **NO implementation**

---

## Purpose

A **QueryPlan** is a deterministic, explainable, budget-aware **search-intent schedule**.  
It answers: *what should we try to discover next, from which source families, under which caps?*  
It **MUST NOT** answer: *who/what is this entity?*

> **SEARCH INTENT ≠ ENTITY TRUTH**

---

## Inputs (conceptual)

| Input | Type | Notes |
|-------|------|-------|
| `seed` | string | Raw user seed (bounded by MAX_SEED_CHARS) |
| `seedType` / `seedClass` | enum | person\|company\|organization\|domain\|url\|document\|ambiguous\|unknown |
| `knownRefs` | typed soft-ref[] | Existing `qid:` / `viaf:` / `ol:` already on session — **not** invented |
| `urls` / `domains` | string[] | Explicit or extracted URL/hostname candidates (urlSafety-checked before fetch) |
| `findings` | Finding[] | Current session findings (may be empty at PLAN) |
| `evidence` | Evidence[] | Current evidence rows |
| `session` | SessionMeta | sessionId, correlationId, flags, locale hint |
| `discoveryState` | LifecycleState | CREATE\|PLAN\|DISCOVER\|… |
| `budgetsRemaining` | BudgetSnapshot | Remaining caps from `04-DISCOVERY-BUDGET.md` |

Inputs are **read-only observations**. QueryPlanBuilder does not mutate Core or invent soft-refs.

---

## Outputs (conceptual)

| Output | Description |
|--------|-------------|
| `planId` | Stable id for observability / replay |
| `orderedIntents` | DiscoveryIntent[] in execution priority |
| `sourceFamilies` | SourceFamilyId[] selected per intent |
| `queries` / `lookupTargets` | Provider-facing query strings or structured lookups (may differ from raw seed) |
| `urlTargets` | URLs/hosts for UrlOriginStage (post-urlSafety) |
| `budgets` | Per-plan and per-intent caps |
| `priority` | Ordering / phase tags |
| `stopConditions` | When to halt further fanout |
| `dedupeRules` | Fingerprint / soft-ref / URL canonicalize rules |
| `provenanceRequirements` | Minimum evidence fields required to emit a Finding |
| `reasons` | Explainable selection rationale per intent/family (no secrets) |

### Forbidden outputs

- Identity conclusions, SAME-ENTITY claims, confidence-of-identity scores  
- Title-bridge / similarity-as-identity directives  
- Domain-ownership assertions  
- Silent budget expansion tokens  
- Credentials or Acc-forbidden identities  

---

## Conceptual Discovery Intents (extensible)

| Intent ID | Purpose | Typical seed classes |
|-----------|---------|----------------------|
| `DISCOVER_IDENTITY_REFERENCES` | Find authority / registry soft-refs as **references**, not identity truth | person, organization, ambiguous |
| `DISCOVER_OFFICIAL_WEB_ORIGIN` | Resolve public HTTPS origin metadata for URL/domain | url, domain |
| `DISCOVER_DOCUMENTS` | Bibliographic / work / document metadata | document, person, organization |
| `DISCOVER_ORGANIZATION_PRESENCE` | Org naming / presence across public families | company, organization |
| `DISCOVER_PUBLICATIONS` | Publications tied to typed refs or name queries | person, organization, document |
| `DISCOVER_NEWS` | Public news/RSS mentions (mention ≠ reference) | company, organization, person, ambiguous |
| `DISCOVER_FILINGS` | Regulatory filings (fair-access APIs) | company |
| `DISCOVER_REGISTRIES` | Public registries / jurisdiction records | company, organization |
| `DISCOVER_ALIASES` | Alternate labels **as search hints only** (not identity merge) | ambiguous, person, organization |
| `DISCOVER_RELATED_ENTITIES` | Relatedness signals with explicit provenance (never SAME-*) | any with typed relatedness evidence |

---

## Determinism rules

1. **Same inputs → same plan** (stable sort keys; no wall-clock randomness in selection).  
2. Locale / flag / budget deltas are **explicit inputs** — changing them changes the plan, recorded in `reasons`.  
3. Provider availability failures do **not** rewrite the plan retroactively; they mark intent/family execution as failed/skipped.  
4. Plan version field (`planSchemaVersion`) enables replay across code revisions.

---

## Acceptance criteria (Gates A–L)

| Gate | Criterion | Contract requirement |
|------|-----------|----------------------|
| **A Deterministic** | Identical input snapshot → identical ordered intents + families + queries | Stable hashing of input snapshot; documented sort |
| **B Explainable** | Every selected intent/family has machine+human `reason` | `reasons[]` required; empty reason = invalid plan |
| **C Entity-agnostic** | No Core identity commit; soft refs opaque | Forbidden: dossier, mayCommitDossier, Acc identity tokens |
| **D Provider-extensible** | New provider registers under a SourceFamily without rewriting planner core | Family registry interface (`03`) |
| **E Budget-aware** | Plan embeds caps; orchestrator refuses silent overruns | Budgets required on plan + each intent |
| **F Provenance-preserving** | Emitted findings/evidence must meet provenanceRequirements | Plan states minimum quote/URL/provider fields |
| **G UNKNOWN-safe** | Plans may yield empty or UNKNOWN-labeled results without inventing links | Stop conditions include “empty is valid” |
| **H Identity-safe** | No intent may instruct SAME-ENTITY, URL→SAME-*, title-bridge, ownership inference | Explicit deny list in planner validation |
| **I Failure-isolated** | Plan marks families independent for soft-fail | Per-family try/catch semantics |
| **J Observable** | planId, intents, families, reasons, budgets logged (scrubbed) | Align `11-OBSERVABILITY.md` |
| **K Reproducible** | Plan JSON serializable; packs can store plan snapshot | Schema `QUERYPLAN-SCHEMA.json` |
| **L Progressive-compatible** | Partial plan execution emits SSE-safe progressive states | Lifecycle hooks in `09` |

---

## Planner validation (design checklist)

1. Every intent ∈ known intent set (or registered extension).  
2. Every family ∈ SourceFamily registry.  
3. No deny-listed identity directives.  
4. Budgets ≤ session remaining.  
5. URL targets pass urlSafety **or** are marked `blocked` without fetch.  
6. Reasons non-empty for each selection.  
7. Acc scrub applicable to any plan fields that later surface on emit.

---

## Relationship to existing code (read-only map)

| Today | After evolution (design) |
|-------|--------------------------|
| `provider.search({ q: raw seed })` for all | QueryPlan supplies per-family query/lookup |
| Flag-gated flat provider list | Families selected by plan + Preview flags |
| C1 web_origin as provider + hop | Intent `DISCOVER_OFFICIAL_WEB_ORIGIN` + UrlOriginStage |
| No plan artifact | Persist `queryPlan` on session for HIT/SSE explain |

Cite: Integration Review `08-ARCHITECTURAL-QUESTION.md` minimum item 1.

---

## Non-claims

This contract does **not** implement QueryPlan, does not wire providers, and does not promote Preview flags to B0.
