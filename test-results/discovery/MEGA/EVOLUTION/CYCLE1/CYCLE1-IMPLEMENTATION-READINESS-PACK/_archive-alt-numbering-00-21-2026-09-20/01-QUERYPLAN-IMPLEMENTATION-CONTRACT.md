# 01 — QUERYPLAN IMPLEMENTATION CONTRACT · Chief Gate A

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** IMPLEMENTATION CONTRACT (planning) · **NO code this pack**  
**SoT cite:** Architecture SoT `02-QUERYPLAN-CONTRACT.md` · `08-ENTITY-TYPE-ROUTING.md` · `14-EXAMPLE-PLANS.md` · `QUERYPLAN-SCHEMA.json` · CHIEF-DECISION-D0 (SoT immutable)

---

## 1. Purpose

A **QueryPlan** is a deterministic, explainable, budget-aware **search-intent schedule**.

> **SEARCH INTENT ≠ ENTITY TRUTH** (SoT 02)

It answers: *what should we try to discover next, from which source families, under which caps?*  
It **MUST NOT** answer: *who/what is this entity?*

---

## 2. Inputs (read-only observations)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `seed` | string | YES | Bounded by existing `MAX_SEED_CHARS` (`requestGuards.js`) |
| `seedClass` | enum | YES | person\|company\|organization\|domain\|url\|document\|ambiguous\|unknown (SoT 08) |
| `seedHash` | string | YES | Opaque soft ER hash — **not** identity |
| `knownRefs` | typed soft-ref[] | NO | Existing `qid:`/`viaf:`/`ol:` on session only — **never invent** |
| `urls` / `domains` | string[] | NO | Candidates; urlSafety before fetch |
| `findings` / `evidence` | arrays | NO | May be empty at first PLAN |
| `session` | SessionMeta | YES | sessionId, correlationId, Preview flags, locale hint |
| `discoveryState` | LifecycleState | YES | See `03-DISCOVERY-LIFECYCLE-STATE-MACHINE.md` |
| `budgetsRemaining` | BudgetSnapshot | YES | See `08-BUDGET-MODEL.md` |
| `configVersion` | string | YES | Planner + family registry version for reproducibility |
| `flags` | object | YES | Explicit Preview flags (QueryPlan / VIAF / WEB-ORIGIN) |

**Invariant:** QueryPlanBuilder does not mutate Core, does not invent soft-refs, does not call `mayCommitDossier`.

---

## 3. Outputs

| Field | Required | Description |
|-------|----------|-------------|
| `planSchemaVersion` | YES | e.g. `1.0.0-impl-ready` (design baseline `1.0.0-design` SoT) |
| `planId` | YES | Stable id for obs/replay |
| `orderedIntents` | YES | DiscoveryIntent[] priority-sorted |
| `sourceFamilies` | YES (via intents) | Family ids selected per intent |
| `queries` / `lookupTargets` | YES per family call | May differ from raw seed |
| `urlTargets` | WHEN url/domain | Post-urlSafety status: pending\|allowed\|blocked\|unsafe |
| `budgets` | YES | Plan + per-intent caps |
| `priority` / phase tags | YES | Ordering |
| `stopConditions` | YES | Halt rules |
| `dedupeRules` | YES | Fingerprint / URL / typed-ref only; titleBridgeForbidden=true |
| `provenanceRequirements` | YES | Minimum fields to emit Finding |
| `reasons` | YES | Non-empty per selection — empty reason = **invalid plan** |
| `forbiddenDirectives` | YES | Deny list present on every plan |

### Forbidden outputs (hard reject at validate)

- Identity conclusions, SAME-ENTITY claims, identity confidence scores  
- Title-bridge / similarity-as-identity directives  
- Domain-ownership assertions  
- Silent budget expansion tokens  
- Credentials / Acc-forbidden identities  
- OPEN_CRAWL directives  

---

## 4. Deterministic fields & hashing

1. **Same inputs → same plan** (SoT 02 Determinism rules).  
2. Sort keys: `intentId` ASC priority ASC, then `familyId` ASC, then query string ASC.  
3. Locale / flags / budget deltas are **explicit inputs** — changing them changes plan and must appear in `reasons`.  
4. Wall-clock / random must **not** affect selection.  
5. Provider availability failures do **not** rewrite plan history; they annotate execution records (SoT 02 rule 3 · SoT 10).  
6. `planInputSnapshotHash` = stable hash of (seedHash, seedClass, knownRefs sorted, urls sorted, flags, configVersion, budgetsRemaining) — stored for replay.

---

## 5. Intent / entity-type routing

SeedClass → primary intents (SoT 08 · 14 examples). Detection errors **degrade to `ambiguous`/`unknown`**, never identity theater.

| seedClass | Primary intents (ordered) | Deprioritize |
|-----------|---------------------------|--------------|
| person | IDENTITY_REFERENCES → PUBLICATIONS → DOCUMENTS → ALIASES(tight) | filings as sole path |
| company | ORGANIZATION_PRESENCE → FILINGS* → REGISTRIES* → NEWS* → WEB_ORIGIN(if domain) | person-authority-only |
| organization | ORGANIZATION_PRESENCE → IDENTITY_REFERENCES → REGISTRIES* → NEWS* | brand=legal merge |
| domain / url | OFFICIAL_WEB_ORIGIN early | library/KG verbatim as sole |
| document | DOCUMENTS → PUBLICATIONS → IDENTITY_REFERENCES(authors as refs) | news blast |
| ambiguous | ALIASES(tight) → IDENTITY_REFERENCES → ORGANIZATION_PRESENCE | alias blast; title-bridge |
| unknown | Minimal IDENTITY_REFERENCES on B0 families | speculative families |

\* Families with `productionEligible=false` and no Preview flag → intent may appear but family execution = `skipped`/`unsupported` with reason (SoT 15 case 8). **No new providers in this readiness pass.**

Closed intent enum (SoT 02 · QUERYPLAN-SCHEMA):

`DISCOVER_IDENTITY_REFERENCES` · `DISCOVER_OFFICIAL_WEB_ORIGIN` · `DISCOVER_DOCUMENTS` · `DISCOVER_ORGANIZATION_PRESENCE` · `DISCOVER_PUBLICATIONS` · `DISCOVER_NEWS` · `DISCOVER_FILINGS` · `DISCOVER_REGISTRIES` · `DISCOVER_ALIASES` · `DISCOVER_RELATED_ENTITIES`

---

## 6. Query generation rules

| Rule | Contract |
|------|----------|
| Per-family query | Plan supplies `queries[].{familyId,q,lookup}` — adapters no longer assume raw seed only |
| Backward-compat path | Flag OFF → legacy verbatim `q=seed` (migration) |
| Alias intents | Search hints only — **not** identity merge (SoT 02 DISCOVER_ALIASES) |
| Typed lookup | Prefer structured lookup when knownRefs present |
| URL targets | Separate from text queries; safety enum required |
| Acc | Any plan field that may emit must be Acc-scrubbable |

---

## 7. Priorities

- Integer `priority` ≥ 1; lower executes first.  
- Within same priority: stable familyId sort.  
- Phase tags may map to lifecycle: PLAN selections → DISCOVER primary → ENRICH/EXPAND secondary (SoT 09).  
- UrlOrigin early for url/domain seeds must outrank KG verbatim (SoT 06 · 08).

---

## 8. Budget interaction

- Plan **embeds** caps; orchestrator refuses silent overruns (SoT 04 · Gate E).  
- Per-intent budgets ≤ plan budgets ≤ session remaining.  
- Exhaustion → stopConditions fire; partial OK.  
- Raising caps mid-session requires plan revision + reason + `maxPlanRevisions` headroom.

---

## 9. Failure behavior (planner)

| Condition | Behavior |
|-----------|----------|
| Validation fail (deny list / empty reasons / unknown family) | Do not execute; emit plan_invalid; fallback per kill-switch (flag OFF → B0 verbatim) |
| seedClass detection low confidence | Force `ambiguous` or `unknown` |
| All URL targets unsafe | stopCondition `unsafe_url_only`; no fetch |
| Empty acceptable | stopCondition `empty_acceptable` — valid terminal |

---

## 10. Validation checklist (must pass before DISCOVER)

1. Every intent ∈ closed set (or registered extension — none this pass).  
2. Every family ∈ SourceFamily registry.  
3. No deny-listed identity directives.  
4. Budgets ≤ session remaining.  
5. URL targets allowed **or** marked blocked/unsafe without fetch.  
6. Reasons non-empty for each selection.  
7. Acc scrub applicable to emit-facing plan fields.  
8. `titleBridgeForbidden=true` · `typedSoftRefAttachOnly=true`.

---

## 11. AS-IS migration note (read-only)

Today: `orchestrator` → `getDefaultProviders()` → `provider.search({ q: SAME raw seed })` (SoT 01).  
Target behind Preview: QueryPlan supplies per-family query/lookup; persist scrubbed `queryPlan` on session for HIT/SSE explain.

Schema mirror: `schemas/QueryPlan.schema.json`.
