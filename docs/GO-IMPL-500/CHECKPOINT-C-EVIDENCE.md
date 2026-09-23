# CHECKPOINT-C-EVIDENCE · GO-IMPL-500 · Phase 3 Evidence Engine (~151–200)

**Stamp:** 2026-09-22T00:05:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** Accuracy / QA (evidence product capability)  
**Mode:** Code + tests + docs · **NO PROMOTE**  
**Locks:** B0/Core/A2/C1 frozen · UNKNOWN≠FALSE · URL≠IDENTITY · CANDIDATE≠FACT · EVIDENCE≠INFERENCE · BUDGET_EXHAUSTED stops fanout · Acc scrub green

---

## 1. Status: **SOLID (unit-green) · HOLD promote**

Checkpoint C delivers evidence as a first-class Discovery capability with explainability, without weakening Acc or B0 flag-off path.

| Gate | Result |
|------|--------|
| Evidence module present | **PASS** `api/lib/discovery/evidence.js` |
| Explainability («why did I get this?») | **PASS** `explainWhy` — provenance chain; `identityScore=null` |
| Session wire (additive) | **PASS** `enrichSessionEvidence` in `orchestrator.js` after contradictions |
| B0 / flag-off unbroken | **PASS** orch 105/0 · webOrigin 96/0 · existing normalize path unchanged |
| Acc scrub on evidence payloads | **PASS** bait `Q1701775` leak=0 after enrich+sanitize |
| CANDIDATE≠FACT | **PASS** `fact` demoted; no Discovery `fact` emit |
| Contradiction / dedup / aging | **PASS** units |
| Phase 4 relationship start | **PARTIAL** `relationship.js` + 27/0 tests (Checkpoint E scaffolding) |

---

## 2. Files changed

| File | Role |
|------|------|
| `api/lib/discovery/evidence.js` | **NEW** — strength, aging, independence, provenance, grouping, dedup, audit, `explainWhy`, `enrichSessionEvidence` |
| `api/lib/discovery/evidence.test.mjs` | **NEW** — 51 PASS |
| `api/lib/discovery/relationship.js` | **NEW** (Phase 4) — vocab, no-laundering transitions, provenanced edges, candidate state, graph sanitize |
| `api/lib/discovery/relationship.test.mjs` | **NEW** — 27 PASS |
| `api/lib/discovery/orchestrator.js` | Wire `enrichSessionEvidence`; emitSnapshot passes `evidenceEngineVersion` / groups / dedup / corroborationEdges |
| `api/lib/discovery/emit.js` | `evidenceEngineVersion` in `DEEP_SKIP_KEYS` |
| `api/lib/discovery/index.js` | Barrel exports |
| `package.json` | `test:evidence`, `test:relationship`; included in `npm test` |
| `CHECKPOINT-C-EVIDENCE.md` | This doc |
| `ACTION-LOG.md` | Append-only actions 11+ |

**Not edited (Foundation lock):** `queryPlan.js`, `budget.js`, `familyOrchestrator.js`.

**Integrated (not duplicated):** `store.js` fingerprint/contradictions/ranking · `sourceFamily.js` independence · `evidenceGraph.js` clamp/scrub · Acc `emit.js` sanitize.

---

## 3. Evidence product shape (contract)

### Evidence row (enriched, additive)

| Field | Meaning |
|-------|---------|
| `fingerprint` | Content-addressed dedupe key |
| `familyId` / `hostFamily` | Source family + independence layer |
| `evidenceStrength` | `strong` \| `moderate` \| `weak` \| `metadata_only` — **not** identity confidence |
| `agingBand` / `ageMs` / `retrievedAt` | Observation freshness |
| `provenance` | `{ planId, intentId, familyId, providerId, extractionMethod, signalSummary, createdAt }` |
| `source` | Provider descriptor + `safetyClass` |
| `independence` | Peer independent/dependent evidence ids |
| `epistemicState` | `candidate` \| `corroborated_candidate` — **never** `fact` |
| `claimKind` / `inference` / `identityClaim` | EVIDENCE≠INFERENCE · no identity |
| `audit` | Engine version + ops trail |

### Finding (additive)

| Field | Meaning |
|-------|---------|
| `why` | `{ discoveryScore, identityScore: null, rationale, provenanceCount }` |
| `epistemicState` | Candidate ceiling |
| `evidenceStrengthBest` / `evidenceHostFamilies` | Rollup |

### Explainability

```text
explainWhy({ findingId | evidenceId }, session)
  → provenanceChain[] + contradictions + corroboration
  → identityClaim=false · identityScore=null · epistemicCeiling=candidate
```

### Session extras

`evidenceGroups` · `evidenceDedup` · `evidenceEngineVersion`

---

## 4. Tests run (this checkpoint)

| Suite | Result |
|-------|--------|
| `evidence.test.mjs` | **51 / 0** |
| `relationship.test.mjs` | **27 / 0** |
| `forbiddenIdentities.test.mjs` | 39 / 0 |
| `adversarial.acc.test.mjs` | 65 / 0 |
| `adversarial.matrix.acc.test.mjs` | 75 / 0 |
| `webOrigin.test.mjs` | 96 / 0 |
| `orchestrator.test.mjs` | 105 / 0 |
| `evidenceGraph.test.mjs` | 16 / 0 |

**Invented green:** none.

---

## 5. Acc / Bound notes

- Enrichment Acc-redacts `Q1701775` in `signalSummary`; full snapshot still runs `sanitizeDiscoveryPayload`.
- `metadata_only` ceiling for `web_origin` (C1) — strength never upgrades identity.
- URL-alone / title-bridge handled in Phase 4 `relationship.js` (`canTransitionRelationship` / `emitSafeRelationship`).

---

## 6. Checkpoint E progress (Phase 4 — started, not closed)

| Item | Status |
|------|--------|
| `relationship.js` vocab + forbidden emit list | DONE |
| No graph laundering (typed soft-ref required to upgrade) | DONE (units) |
| `buildProvenancedEdge` mandatory provenance | DONE |
| `candidateStateFor` demotes fact/confirmed | DONE |
| `sanitizeRelationshipGraph` | DONE |
| Wire relationship sanitize into orch graph path | **OPEN** (Foundation may compose with `buildEvidenceGraph`; Acc/rel helpers ready) |
| Full Checkpoint E doc / gate close | **OPEN** |

---

## 7. Residual / OPEN

1. Live Preview RUNNOW for evidence `why` surface — deferred (no promote).  
2. SSE event for explainability snippet — not wired (helpers only).  
3. Orch graph rebuild after contradictions currently builds graph **before** contradictions; enrich does not re-call `buildEvidenceGraph` — acceptable for C; E may compose `sanitizeRelationshipGraph(session.graph)`.  
4. Foundation QueryPlan/budget/familyOrchestrator still landing — evidence engine consumes `planId` when present.

---

## STOP

NO PROMOTE · HOLD · Coordinate Foundation via tests (they must keep evidence/Acc green).
