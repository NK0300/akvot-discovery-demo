# CHECKPOINT-E-ARCH-GLANCE · ארכיטקט · Relationship + Graph

**Stamp:** 2026-09-23T22:51:41+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · Tech Lead / Architecture · GO-IMPL-500 Checkpoint E  
**Mode:** DOCS ONLY · **NO** `*.js` / `*.mjs` / `*.html` / `package.json` edits  
**Server evidence:** `CHECKPOINT-E-GRAPH.md` (stamp 2026-09-22T00:08:00+03:00 · **DEMONSTRABLE PASS · HOLD promote**)  
**Locks honored:** Core / B0 / A2 / C1 **FROZEN** · F11 **HOLD** · flags default **OFF** · **NO promote**  
**Collisions avoided:** did **not** edit Server SSRF/security surfaces (`security.js`, `requestGuards.js`, `emit.js`, `providers.js`, `familyOrchestrator.js`) — read-only cites for scrub/orch/SSE wire only.

---

## One-liner

**CONSISTENT** with Server Checkpoint E **DEMONSTRABLE PASS** · orch post-enrich `sanitizeRelationshipGraph(buildEvidenceGraph…)` · emit `scrubGraphPayload` Acc→Foundation→rel sanitize · SSE `scrubGraphChunk` · `explainEdge` identityClaim=false · no laundering / URL-alone→unknown · SAME-ENTITY never on wire · Arch changed **0** runtime files · **NO promote**.

---

## Verdict

| Gate (vs Server E claims) | Server stamp | Arch spot-check | Result |
|---------------------------|--------------|-----------------|--------|
| Wire `sanitizeRelationshipGraph` into orch graph path | **PASS** rebuild after enrich + contradictions | `orchestrator.js` L799–813 · always-on honesty clamp (not Preview-only) | **CONSISTENT** |
| Emit-path defense | **PASS** Acc → Foundation → rel sanitize | `emit.js` `scrubGraphPayload` L573–639 · Acc strip → `scrubGraphForEmit` → `sanitizeRelationshipGraph` | **CONSISTENT** |
| SSE `graph` Acc path | **PASS** `scrubGraphChunk` | `sse.js` L265–270 · `scrubGraphChunk` → payload path; plan/graph flag-gated | **CONSISTENT** |
| Edge-click explainability | **PASS** `explainEdge` | `relationship.js` `explainEdge` · `identityClaim:false` · `epistemicCeiling:'candidate'` · evidenceIds + provenance | **CONSISTENT** |
| Acc forbidden QIDs on endpoints/edges | **PASS** | `hasAccForbidden` via SoT · sanitize drops nodes/edges · tests poison leak=0 | **CONSISTENT** |
| No graph laundering / URL-alone UNKNOWN | **PASS** | `canTransitionRelationship` · `emitSafeRelationship` · `urlAloneCeiling` · title-bridge block | **CONSISTENT** |
| B0 flag-off unbroken | **PASS** orch 105/0 · honesty always on | Sanitize not gated on QueryPlan; flag-OFF still cannot emit same-entity / forbidden QIDs | **CONSISTENT** |
| `relationship.test.mjs` | **43 / 0** | **44** `assert(` call sites on disk (count ≥ claim) | **CONSISTENT** (count Δ = OK residual) |

### Overall Arch verdict: **CONSISTENT**

No material drift from Server E PASS. Residuals below are **OK** / deferred (not reopen Checkpoint E).

---

## Architecture view · Graph emit pipeline

```
findings/evidence ranked
  → contradictions + enrichSessionEvidence     [Checkpoint C]
  → buildEvidenceGraph(..., contradictions)    [E rebuild]
  → sanitizeRelationshipGraph                  // candidate · no laundering · Acc endpoints
  → emitSnapshot → sanitizeDiscoveryPayload
       → scrubGraphPayload
            → Acc QID strip (nodes/edges/signalSummary)
            → scrubGraphForEmit (Foundation clamp · SAME-ENTITY→never)
            → sanitizeRelationshipGraph (again)
  → SSE graph? (DISCOVERY_ENABLE_PLAN_SSE) → scrubGraphChunk
```

### Relationship norms (Checkpoint E)

| Rule | Enforcement | Cite |
|------|-------------|------|
| Closed vocab | `RELATIONSHIP_VOCAB` | relationship.js |
| SAME-ENTITY never on wire | `FORBIDDEN_EMIT_RELATIONSHIPS` + clamp + sanitize meta `sameEntityEmitted:0` | rel + evidenceGraph + emit |
| No graph laundering | `canTransitionRelationship` requires typed soft-ref to upgrade | L84+ |
| URL-alone / web_origin / title-bridge | ceiling **`unknown`** | `emitSafeRelationship` · `urlAloneCeiling` |
| Typed soft-ref attach | `same-reference` only when viaf/qid/ol refs present | transition + clamp |
| Candidate lifecycle | `candidateStateFor` demotes fact/confirmed/identity → `candidate` | L151–164 |
| Provenance-mandatory edges | `buildProvenancedEdge` rejects orphans / laundering | L171+ |
| Edge explain | `explainEdge` · never identity certainty | L302+ |

### Flag / B0 interaction

| State | Graph honesty | Plan/graph SSE |
|-------|---------------|----------------|
| QueryPlan / Plan-SSE **OFF** (default) | sanitize **still on** (always-on clamp) | no `plan`/`graph` SSE events |
| Plan-SSE **ON** | same sanitize | `scrubGraphChunk` before push |

**Flag OFF ≠ weaker honesty** — Server E explicit; Arch concurs.

---

## Consistency with SoT / PRE-GO / prior Arch

| Theme | Checkpoint E expectation | Arch read | Verdict |
|-------|--------------------------|-----------|---------|
| **SAME-REFERENCE typed soft-ref** | attach-only; no title-bridge identity | transition + `hasTypedSoftRef` ceilings | **PASS** |
| **SAME-ENTITY = 0 on wire** | forbidden emit list + scrub | FORBIDDEN + clamp + emit meta | **PASS** |
| **URL-alone → UNKNOWN** | C1 Bound | `urlAloneCeiling` / emitSafe | **PASS** |
| **CANDIDATE ≠ FACT** | candidateState demote | `candidateStateFor` · explainEdge ceiling | **PASS** |
| **Acc SSE** | scrub before wire | scrubGraphPayload + scrubGraphChunk | **PASS** |
| **B0 flag-off** | honesty always; no plan thrash | orch wire ungated · SSE gated | **PASS** |
| **No promote** | HOLD | Flags OFF · no productionEligible | **PASS / HOLD** |
| **F11** | no new HTTP | relationship layer only | **PASS / HOLD** |

C glance (this wave) **CONSISTENT** — E consumes C enrich then rebuilds graph; order matches Server normative pipeline.

Carry-forward CAVEATs (do **not** reopen E):

1. Gate A scrub `hasTypedSoftRef: true` may over-coerce SAME→`same-reference` — safe direction; SAME-ENTITY still blocked.  
2. Early S6 pre-contradiction `buildEvidenceGraph` still present (overwritten at E wire) — harmless double build.

---

## Residuals / drift notes

| Item | Class | Note |
|------|-------|------|
| `relationship.test.mjs` assert count 44 vs Server **43/0** | **OK residual (doc age)** | Disk ≥ claimed green; not architecture reopen |
| C doc claimed relationship **27/0** (scaffolding) | **Doc age** | Superseded by E **43/0** stamp; cite E |
| Live Preview RUNNOW for SSE `graph` + edge explain | **OK residual** | Server deferred · no promote |
| Early S6 double build | **OK residual** | Server E §6.2 · optional cleanup later |
| Full Security Checkpoint F | **Out of scope** | Draft / PARTIAL · Arch avoids F-security write surfaces |
| UX edge-click panel | **Out of scope** | Checkpoint D may surface; Arch does not claim UX close |

**No DRIFT items requiring code fix.** Arch did not modify runtime.

---

## Evidence anchors (read-only)

| Artifact | Claim used |
|----------|------------|
| `CHECKPOINT-E-GRAPH.md` | Status **DEMONSTRABLE PASS** · pipeline · explainEdge · tests · residuals |
| `api/lib/discovery/relationship.js` | vocab · transition · sanitize · explainEdge · Acc |
| `api/lib/discovery/relationship.test.mjs` | assert sites · wire sanitize · scrubGraphChunk Acc |
| `api/lib/discovery/evidenceGraph.js` | `urlAloneCeiling` · `buildEvidenceGraph` · `scrubGraphForEmit` |
| `api/lib/discovery/orchestrator.js` | L799–813 post-enrich sanitize wire |
| `api/lib/discovery/emit.js` | `scrubGraphPayload` compose (RO cite) |
| `api/lib/discovery/sse.js` | `scrubGraphChunk` graph frames (RO cite) |
| `api/lib/discovery/index.js` | export `explainEdge` / `sanitizeRelationshipGraph` |
| Sibling | `CHECKPOINT-C-ARCH-GLANCE-ארכיטקט.md` (this wave) · `CHECKPOINT-B-ARCH-GLANCE-ארכיטקט.md` |

**Checksums (integrity · Arch wrote 0 runtime bytes):**  
`relationship.js` `9a16ccac…a4d25a` · `evidenceGraph.js` `53c5df0b…995763` · `emit.js` `38b992cb…7d0485` · `sse.js` `117d9898…55b8b5` · `orchestrator.js` `b7fc5596…e0ee6f` · `security.js` `96f3d790…aeffd4` · `requestGuards.js` `ae1b018f…2024a8` · `providers.js` `86b9c9df…4f4bcc` · `familyOrchestrator.js` `c6ad414b…87661d`

**js/mjs/html/package.json edits this glance: 0.**

---

## Explicit non-claims

- Arch did **not** change runtime; **glance only**.  
- **NO promote** / no GO-PROMOTE / no alias change.  
- **NO** Core / B0 / A2 / C1 **unfreeze**.  
- **F11 HOLD** — no new HTTP adapters.  
- **NOT** Checkpoint F security closure.  
- **NOT** live Preview RUNNOW / Cloud push.  
- **NOT** rewrite of early S6 double-build (residual OK).

---

## Status board (Checkpoint E Arch)

| Item | Owner | State |
|------|-------|-------|
| Server `CHECKPOINT-E-GRAPH.md` | Acc / QA | **DEMONSTRABLE PASS · HOLD** (cited) |
| This glance `CHECKPOINT-E-ARCH-GLANCE-ארכיטקט.md` | Arch | **CLOSED · CONSISTENT** |
| orch sanitize wire (always-on) | Server | **GREEN** |
| emit scrubGraphPayload compose | Acc/Server | **GREEN** |
| SSE scrubGraphChunk | Acc/Server | **GREEN** |
| explainEdge / no laundering / URL→unknown | Acc | **GREEN** |
| Live Preview graph SSE / edge UX | Future | **RESIDUAL OK** |
| Promote / A2-C1 unfreeze / F11 HTTP | — | **HOLD / FROZEN** |

---

## ACTIONS (this glance)

| # | Time (IDT) | Action |
|---|------------|--------|
| 1 | 22:51 | Read `CHECKPOINT-E-GRAPH.md` + B/C glance format |
| 2 | 22:51 | Read-only: relationship.js, evidenceGraph, orch L799–813, emit scrubGraphPayload, sse scrubGraphChunk |
| 3 | 22:51 | Wrote this glance · verdict **CONSISTENT** · ACTION-LOG band via wave |

**Meaningful doc actions:** glance + log (shared wave).  
**Runtime edits: 0.** · **Promote: NO.**

---

## STOP

Arch Checkpoint E **CONSISTENT** with Server DEMONSTRABLE PASS · DOCS ONLY · NO CODE · NO PROMOTE · Core/B0/A2/C1 FROZEN · F11 HOLD
