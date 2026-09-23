# ACC-ADVERSARIAL-MATRIX · GO-IMPL-500 · Phase Accuracy 351–400 scaffolding

**Stamp:** 2026-09-22T00:02:07+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** Accuracy / QA under GO-IMPL  
**Workspace:** `/workspace/akvot-quick-demo`  
**Mode:** Tests + Acc scrub helpers · **NO PROMOTE**  
**Binds:** `PRE-GO-RED-CLOSURE/ACC-EMIT-SURFACE-MATRIX.md` · C1 Bound · A2-safe only · Core Acc P0 `forbiddenIdentities`

---

## 0. Locks (non-negotiable)

| Lock | Assert |
|------|--------|
| Core Acc P0 / `forbiddenIdentities` | Denylist non-empty · `Q1701775` present · version `2026-09-19.1` · strip never weakened |
| C1 Bound | URL-alone → **UNKNOWN** (never `SAME-REFERENCE` / `SAME-ENTITY`) |
| A2-safe only | Typed soft-ref (`viaf:` / `qid:` / `ol:`) may attach; **no title-bridge revive** |
| Acc emit surface | plan / SSE plan / graph / evidence / findings / errors scrubbed per ACC-EMIT-SURFACE-MATRIX |
| Promote | **Do not promote** |

---

## 1. Matrix rows (ACC-M-001 … ACC-M-022)

| ID | Family | Case | Expected | Test |
|----|--------|------|----------|------|
| ACC-M-001 | homonym | Common names, same title, distinct evidence | Separate Findings; no forced merge; forbidden stripped | `adversarial.matrix.acc.test.mjs` |
| ACC-M-002 | homonym | Same-name orgs | Both Findings kept; title-bridge `SAME-ENTITY` edge **blocked** | matrix |
| ACC-M-003 | url | Unrelated URLs | Distinct Findings; relationship UNKNOWN | matrix |
| ACC-M-004 | url | Ambiguous domain (`apple.com`) | URL-alone `SAME-REFERENCE` bait → clamped to `unknown` | matrix + emit `urlAloneCeiling` |
| ACC-M-005 | c1 | URL-alone seeds | `labelWebOriginRelationship` → UNKNOWN ≠ SAME-* | matrix + `webOrigin.test.mjs` |
| ACC-M-006 | evidence | Stale / contradictory | Safe kept; contradiction `findingIds` scrubbed; leak=0 | matrix |
| ACC-M-007 | evidence | Duplicate evidence rows | Both rows kept (honesty; no silent identity merge) | matrix |
| ACC-M-008 | evidence | Misleading / poison meta (`og:title` QID) | Poison finding stripped; ok kept; leak=0 | matrix |
| ACC-M-009 | evidence | Redirect → forbidden QID URL | Finding/evidence dropped; leak=0 | matrix |
| ACC-M-010 | resilience | Source outage (`provider_5xx`) | Inject observable soft-fail / throw | matrix + `failureInject` |
| ACC-M-011 | resilience | Partial results | `status=partial` preserved; finding kept | matrix |
| ACC-M-012 | resilience | Budget exhaustion | `BUDGET_EXHAUSTED` constant; plan reason without identity theater | matrix + `budget.js` |
| ACC-M-013 | resilience | Timeout inject | `shouldInject('provider_timeout')` gated | matrix |
| ACC-M-014 | emit | **BAIT-PLAN-01** Q1701775 in plan reasons/queries/knownRefs | `scrubPlanPayload` / `scrubPlanChunk` leak=0; `forbiddenStripped>0` | matrix |
| ACC-M-015 | emit | **BAIT-PLAN-02** credential-shaped intent | Bearer / password → `[REDACTED]` | matrix |
| ACC-M-016 | emit | **BAIT-SSE-01** finding chunk | `scrubFindingChunk` → `null` | matrix |
| ACC-M-017 | emit | **BAIT-SSE-02** error message | `scrubErrorChunk` leak=0 + credential redact | matrix |
| ACC-M-018 | emit | **BAIT-GRAPH-01** `signalSummary` poison | `scrubGraphChunk` leak=0; forbidden node absent | matrix |
| ACC-M-019 | emit | **BAIT-GRAPH-02** URL-alone / title-bridge SAME-* edge | Edges blocked | matrix |
| ACC-M-020 | emit | Nested `plan` + `queryPlan` on snapshot | `sanitizeDiscoveryPayload` leak=0 across plan/SSE/graph/facets/errors | matrix |
| ACC-M-021 | a2 | Typed soft-ref identity edge | `same-entity` **never on wire** after Foundation clamp | matrix + `evidenceGraph.scrubGraphForEmit` |
| ACC-M-022 | a2 | Title-bridge SAME-REFERENCE | Edge blocked (no revive) | matrix |

**Coverage families:** homonym · url/domain · C1 Bound · evidence integrity · resilience · emit bait (plan/SSE/graph) · A2-safe.

---

## 2. Acc scrub surfaces (emit helpers)

| Helper | Surface | Module |
|--------|---------|--------|
| `sanitizeDiscoveryPayload` | API HIT / snapshot (findings, evidence, facets, contradictions, **plan**, **queryPlan**, **graph**, **errors**) | `api/lib/discovery/emit.js` |
| `scrubPlanPayload` / `scrubPlanChunk` | QueryPlan JSON · SSE `plan` | emit → `queryPlan.scrubQueryPlanForEmit` / `planSummaryForSse` |
| `scrubGraphPayload` / `scrubGraphChunk` | Graph JSON · SSE `graph` | emit Acc QID strip → `evidenceGraph.scrubGraphForEmit` |
| `scrubFindingChunk` / `scrubFacetsChunk` | SSE `finding` / `facets` | emit |
| `scrubErrorChunk` | SSE `error` / `errors[]` | emit |
| `sanitizeCandidatesPayload` | Core candidates (unchanged SoT) | `api/lib/forbiddenIdentities.js` |

### Acc gaps noted (honest)

| Gap | Severity | Notes |
|-----|----------|-------|
| SSE `buildProgressiveEvents` does not yet emit `plan` / `graph` events | AMBER | Helpers + matrix bait ready; Foundation must wire SSE event types through Acc helpers |
| `DEEP_SKIP_KEYS` still skips `providers` deep-strip | AMBER | Provider error strings could theoretically carry Acc bait if not pre-scrubbed |
| Live Preview RUNNOW for ACC-M-* against QueryPlan Preview path | OPEN | Fixtures/unit green; live evidence deferred (no promote) |
| Field-level REDACT catalogs for every plan reason code | AMBER | Residual from PRE-GO matrix §R-ACC |

---

## 3. Prior corpus reused

| Corpus | Path |
|--------|------|
| MEGA ADV-01…07 fixtures | `test-results/discovery/MEGA/adversarial/` |
| Existing Acc adversarial units | `api/lib/discovery/adversarial.acc.test.mjs` (65 PASS) |
| C1 webOrigin Bound | `api/lib/discovery/webOrigin.test.mjs` |
| PR-CLOSEOUT Acc | `api/lib/discovery/prCloseout.acc.test.mjs` |
| Design SoT 10 cases | `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/15-ADVERSARIAL-DESIGN-CASES.md` |
| IR suite plan | `CYCLE1-IMPLEMENTATION-READINESS-PACK/N-ADVERSARIAL-SUITE-PLAN.md` |
| Emit surface SoT | `PRE-GO-RED-CLOSURE/ACC-EMIT-SURFACE-MATRIX.md` |

---

## 4. Test commands

```bash
node api/lib/forbiddenIdentities.test.mjs
node api/lib/discovery/adversarial.acc.test.mjs
node api/lib/discovery/adversarial.matrix.acc.test.mjs   # NEW
node api/lib/discovery/webOrigin.test.mjs
node api/lib/discovery/prCloseout.acc.test.mjs
npm run test:adversarial-matrix
npm test   # includes matrix
```

---

## 5. Run results (this pass)

| Suite | Result |
|-------|--------|
| `forbiddenIdentities.test.mjs` | **39 passed, 0 failed** |
| `adversarial.acc.test.mjs` | **65 passed, 0 failed** |
| `adversarial.matrix.acc.test.mjs` | **75 passed, 0 failed** · matrixRows=22 |
| `webOrigin.test.mjs` | **96 passed, 0 failed** |
| `prCloseout.acc.test.mjs` | **107 passed, 0 failed** |

**Invented green:** none — all asserts executed locally this stamp.

---

## 6. Coordination note for Foundation

Acc owns scrub helpers + failing bait tests. Foundation QueryPlan / SSE plan events **must** call:

- persist/HIT: `scrubPlanPayload` / `sanitizeDiscoveryPayload` (already scrubs nested `plan` / `queryPlan`)
- SSE `plan`: `scrubPlanChunk`
- SSE `graph`: `scrubGraphChunk`
- SSE `error`: `scrubErrorChunk`

Do **not** weaken `forbiddenIdentities` scrub. Do **not** emit `same-entity` on wire. URL-alone remains UNKNOWN.

---

## STOP

NO PROMOTE · HOLD default · expand live RUNNOW only under new Chief order.
