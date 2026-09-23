# 02 — SOURCE-FAMILY ORCHESTRATION CONTRACT · Chief Gate B

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** IMPLEMENTATION CONTRACT (planning) · **NO live provider wiring this pack**  
**SoT cite:** `03-SOURCE-FAMILY-CONTRACT.md` · `05-INDEPENDENCE-MODEL.md` · `SOURCE-FAMILY-SCHEMA.json` · `10-FAILURE-MODEL.md`

---

## 1. Abstraction

```text
SourceFamily
  ├── familyId, authorityClass, independenceClass, safetyClass
  ├── capabilities[], entityTypes[], inputRequirements, outputTypes[]
  ├── cost/latency/rateLimit profiles
  ├── failureModes[], previewFlag?, productionEligible=false until GO
  └── providers[]  ← concrete adapters (B0/A2/C1 mapped; candidates unwired)
```

**Rule:** Adding a provider without family registration is disallowed in target architecture (SoT 03).  
**Rule:** Endpoint count ≠ independence (SoT 05).

---

## 2. Family registry (initial — conceptual)

| familyId | AS-IS provider | Lane | productionEligible |
|----------|----------------|------|--------------------|
| knowledge_graph | wikidata | B0 LOCKED | true (B0 only) |
| encyclopedia | wikipedia OpenSearch | B0 LOCKED | true (B0 only) |
| bibliographic | openlibrary | B0 LOCKED | true (B0 only) |
| authority | viaf | A2 FROZEN EXPERIMENTAL | false until promote GO |
| web_origin | web_origin | C1 FROZEN EXPERIMENTAL | false until promote GO |
| filings / registries / news / scholarly / government / archives | **none wired** | candidates | false · **DO NOT IMPLEMENT providers this pack** |

hostFamily today: WD+WP → `wikimedia` (not independent of each other) · OL → `openlibrary` · VIAF → `viaf` · web_origin → registrable domain / `web_origin`.

---

## 3. Scheduling

1. Orchestrator reads `orderedIntents` from validated QueryPlan.  
2. For each intent in priority order: expand `sourceFamilies` → provider adapters whose Preview/production eligibility allows.  
3. Skip family if: unsupported seedClass, flag off, budget exhausted, rate-limited cooldown, `productionEligible=false` without Preview.  
4. Record skip reason in execution journal (observable).

---

## 4. Parallelism

| Policy | Contract |
|--------|----------|
| Intra-intent | Families may run in parallel up to `maxParallelFamilies` (design default ≤ 3) subject to budgets |
| Inter-intent | Sequential by priority unless plan marks `parallelizableWith` (default off for determinism) |
| Shared budget | Atomic decrement of request/family counters before launch |
| Determinism | Completion order must not change persisted evidence identity; merge uses stable sort by (familyId, providerId, fingerprint) |

---

## 5. Dependencies

- UrlOrigin **early** for url/domain may precede KG intents (SoT 06).  
- CORROBORATE (A2-safe coalesce) depends on typed soft-refs existing — never invent.  
- EXPAND one-hop depends on DISCOVER findings with URLs + budget.  
- No dependency may imply SAME-ENTITY.

---

## 6. Cancellation · timeouts · retries

| Control | Contract |
|---------|----------|
| Timeout | Per-call `maxProviderMs` (AS-IS ~3500ms substrate); session `maxWallMs` (~12000ms) |
| Cancel | Session cancel / client disconnect → cooperative cancel; mark `cancelled`; do not corrupt stored evidence |
| Retries | Default **0** automatic retries for provider soft-fail; rate_limited may schedule **one** delayed retry only if budget remains and reason logged |
| Isolation | try/catch per family; one fail ≠ abort others (SoT 10) |

---

## 7. Result normalization

All family outputs normalize through existing substrate:

`normalizeRawHit` → Evidence → Finding · fingerprint dedupe · Acc scrub before emit.

Family-specific raw payloads **never** bypass fingerprint validation or Acc scrub.

Normalized family result record:

```text
FamilyExecutionResult = {
  familyId, providerId, intentId, planId,
  status: ok|empty|error|skipped|timeout|rate_limited|blocked_url|unsafe_url|unsupported,
  failureClass?, findings[], evidence[],
  executionTimeMs, requestsUsed, reasons[]
}
```

---

## 8. Independence during orchestration

- Prefer diverse `independenceClass` when budget allows — without vanity flood (SoT 05).  
- Telemetry records `hostFamily` and `familyId` distinctly.  
- WD+WP must never be marketed as two independent sources.  
- web_origin never mints typed soft-refs for attach.

---

## 9. Capability × intent matrix

Inherit SoT 03 matrix. Orchestrator must not call a family for an intent outside its capabilities without explicit registered extension.

---

## Schema

`schemas/SourceFamily.schema.json` · `schemas/FamilyExecutionResult.schema.json` (optional companion).
