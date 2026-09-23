# 01 — ARCHITECTURE OVERVIEW · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/`  
**Mode:** DESIGN DOCUMENTS ONLY · **NO code · NO deploy · NO promote · NO new providers · NO EXP-B · NO crawl · NO QueryPlan impl**

## LOCKS (honored)

| Lock | State |
|------|-------|
| B0 Discovery PRODUCTION | **LOCKED** |
| Core Acc P0 | **LOCKED** (migration must not require Core changes) |
| A2-safe | **FROZEN EXPERIMENTAL** (typed soft-ref coalesce) |
| A2-bound | **REJECTED** |
| C1-PATCHED WEB-ORIGIN | **FROZEN EXPERIMENTAL** (URL-alone → UNKNOWN) |
| PROMOTE | **HOLD** |


---

## מטרה · Objective

Evolve from **seed → provider-verbatim discovery** toward:

```text
seed
  → intent / entity-type understanding
  → discovery plan (QueryPlan)
  → source-family orchestration
  → evidence collection
  → URL-origin expansion
  → relationship classification
  → evidence graph
  → progressive delivery
```

**Without identity guessing.** Principle: an **orchestration layer**, not a larger pile of providers. Discover more without believing more than evidence supports.

Cite: Integration Review `08-ARCHITECTURAL-QUESTION.md` (sufficiency = NO; minimum evolution outlined).

---

## Current pipeline (as-is · B0 + frozen experiments)

Cite: `CYCLE1-INTEGRATION-REVIEW/01-CURRENT-SYSTEM-MAP.md`

```text
seed (POST body.seed|q)
  │
  ├─ softEntityResolve → seed:<hash> softRefs (opaque; NOT identity)
  ├─ getDefaultProviders()
  │     B0:        WD · OL · WP
  │     A2 Preview:+ VIAF (flag)
  │     C1 Preview:+ WEB-ORIGIN (flag) + one-hop post-batch
  ├─ provider.search({ q: SAME raw seed })   ← PROVIDER-VERBATIM · NO QueryPlan
  ├─ normalizeRawHit → Evidence → Finding
  ├─ dedupeByEvidenceFingerprint
  ├─ A2-safe coalesce (Preview): viaf:∪qid:∪ol: · hostFamily≥2 · ceiling SAME-REFERENCE
  ├─ rankFindings · detectContradictions
  ├─ aggregateFacets
  ├─ Acc scrub (emit)
  └─ session → GET / SSE / NARROW / HIT
```

**Ceilings proved:** intent blindness (S12–S15); source monoculture (B0 multi=0.0); authority orphans (S04); URL path special-cased as flag-gated provider rather than planned stage.

---

## Target pipeline (design · minimum evolution)

```text
seed
  │
  ├─ [STAYS] softEntityResolve (opaque seed hash; non-identity)
  ├─ [STAYS] urlSafety assert before any fetch
  │
  ├─ SeedClassRouter (lightweight entity-type routing — NOT identity classifier)
  │     person | company | organization | domain | URL | document | ambiguous | unknown
  │
  ├─ QueryPlanBuilder  ★ NEW (orchestration)
  │     inputs: seed, seedClass, knownRefs, URLs/domains, findings, evidence, session, discoveryState
  │     outputs: ordered DiscoveryIntents · SourceFamilies · queries/lookups · URL targets
  │              · budgets · priority · stopConditions · dedupeRules · provenanceRequirements
  │     MUST NOT emit identity conclusions — SEARCH INTENT only
  │
  ├─ SourceFamilyOrchestrator  ★ NEW
  │     family registry (capability, authority, independence, cost, safety class)
  │     budget-gated family calls · soft-fail isolation
  │     Preview-flag per family (pattern already used for VIAF / WEB-ORIGIN)
  │
  ├─ EvidenceCollection (existing adapters behind families)
  │     B0 families remain default production path until promote GO
  │
  ├─ UrlOriginStage  ★ FIRST-CLASS (C1 pattern elevated)
  │     early stage for URL/domain intents; optional one-hop from discovered URLs
  │     metadata only · Bound: URL-alone → UNKNOWN · no typed soft-ref mint
  │
  ├─ RelationshipClassifier (inherit C1/A2 vocab · Bound closed)
  │     SAME-ENTITY forbidden under experimental lanes
  │     SAME-REFERENCE only typed soft-ref across distinct hostFamilies
  │
  ├─ EvidenceGraph  ★ NEW (complement, not dossier)
  │     nodes + provenance-bearing edges · no implicit edges
  │
  ├─ [STAYS] Acc scrub · fingerprint dedupe · facets · rank (explainable dims)
  └─ [STAYS] Progressive delivery: SSE / NARROW / HIT / session store
```

---

## Where new pieces sit

| Component | Pipeline position | Replaces? |
|-----------|-------------------|-----------|
| QueryPlan | After seed class; before family fanout | Provider-verbatim `q` for all adapters |
| Source-family orchestration | Fanout control + budgets | Flat `DEFAULT_PROVIDERS` array as sole routing |
| URL-origin stage | Early for URL/domain seeds; late one-hop optional | Ad-hoc `webOriginProvider` only |
| Evidence graph | After collection + relationship labels | Flat finding list as sole model (list UX can remain) |
| Entity-type routing | Input to QueryPlan | Implicit person-centric bias |
| Progressive lifecycle | Session state machine | Implicit CREATE→DONE only |

---

## What STAYS (do not discard)

| Capability | Why |
|------------|-----|
| Acc scrub (`emit.js`) | Acc=0 is disqualifying gate |
| urlSafety SSRF envelope | Orthogonal security; C1 SSRF PASS |
| SSE / NARROW / HIT / sessionStore | Progressive delivery substrate |
| A2-safe typed soft-ref coalesce semantics | FROZEN EXPERIMENTAL · ceiling SAME-REFERENCE |
| C1 URL-alone → UNKNOWN Bound | FROZEN EXPERIMENTAL · BAD_URL_ALONE_SAME=0 |
| Soft ER opaque seed hash | Non-identity |
| Provider adapter soft-fail | Failure isolation substrate |
| Evidence fingerprint dedupe | Vanity / recirculation control |
| Relationship vocabulary closed set | HARDENING SoT inherited by C1 |
| B0 DEFAULT_PROVIDERS production path | LOCKED until explicit promote GO |
| Core Acc P0 | Untouched · no Discovery identity commit |

---

## What does NOT change in Core

Discovery evolution is **additive Preview-flag orchestration**. Core lookup / Acc P0 alias remains LOCKED. No Core modification required for migration (see `16-MIGRATION-PATH.md`).

---

## Design acceptance gates A–L (overview)

| Gate | Name | Design intent |
|------|------|---------------|
| A | Deterministic | Same inputs → same QueryPlan |
| B | Explainable | Every intent/family choice has reason |
| C | Entity-agnostic | No Core identity; opaque soft refs |
| D | Provider-extensible | New providers register as family members |
| E | Budget-aware | Caps observable; no silent expansion |
| F | Provenance-preserving | Every edge/finding carries provenance |
| G | UNKNOWN-safe | Useful may stay UNKNOWN |
| H | Identity-safe | No SAME-ENTITY; no URL→SAME-*; no title-bridge |
| I | Failure-isolated | One family fail ≠ corrupt others |
| J | Observable | Plan/session/family/intent telemetry |
| K | Reproducible | Plans + packs replayable |
| L | Progressive-compatible | CREATE→…→FINALIZE works with SSE |

Detail: `02-QUERYPLAN-CONTRACT.md` · readiness: `18-CHIEF-RECOMMENDATION.md`.

---

## Explicit non-architecture

Unrestricted crawl · autonomous browser · identity scoring · similarity identity · title bridges · domain ownership inference · hidden source expansion · opaque ranking · autonomous promotion.

→ `17-NON-GOALS.md`
