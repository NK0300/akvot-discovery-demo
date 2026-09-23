# CHECKPOINT-C-ARCH-GLANCE · ארכיטקט · Evidence Engine

**Stamp:** 2026-09-23T22:51:41+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · Tech Lead / Architecture · GO-IMPL-500 Checkpoint C  
**Mode:** DOCS ONLY · **NO** `*.js` / `*.mjs` / `*.html` / `package.json` edits  
**Server evidence:** `CHECKPOINT-C-EVIDENCE.md` (stamp 2026-09-22T00:05:30+03:00 · **SOLID (unit-green) · HOLD promote**)  
**Locks honored:** Core / B0 / A2 / C1 **FROZEN** · F11 **HOLD** · flags default **OFF** · **NO promote**  
**Collisions avoided:** did **not** edit Server SSRF/security surfaces (`security.js`, `requestGuards.js`, `emit.js`, `providers.js`, `familyOrchestrator.js`) — read-only cites only for scrub/orch wire.

---

## One-liner

**CONSISTENT** with Server Checkpoint C **SOLID** · `evidence.js` explainWhy + enrichSessionEvidence wired · CANDIDATE≠FACT (`fact` demoted · `identityScore=null`) · Acc bait scrub · metadata_only C1 ceiling · Phase-4 relationship scaffolding noted as E · Arch changed **0** runtime files · **NO promote**.

---

## Verdict

| Gate (vs Server C claims) | Server stamp | Arch spot-check | Result |
|---------------------------|--------------|-----------------|--------|
| Evidence module present | **PASS** `evidence.js` | Module on disk · `EVIDENCE_ENGINE_VERSION` · exports strength/aging/independence/provenance/group/dedup/audit/`explainWhy`/`enrichSessionEvidence` | **CONSISTENT** |
| Explainability («why did I get this?») | **PASS** `explainWhy` · `identityScore=null` | `explainWhy` L398+ · `identityScore: null` · `epistemicCeiling: 'candidate'` · provenanceChain + contradictions/corroboration scrub | **CONSISTENT** |
| Session wire (additive) | **PASS** `enrichSessionEvidence` after contradictions | `orchestrator.js` L778–780 · after `detectContradictions` · sets `evidenceGroups` / `evidenceDedup` / `evidenceEngineVersion` | **CONSISTENT** |
| B0 / flag-off unbroken | **PASS** orch / webOrigin / normalize unchanged | Enrich is additive on session; no QueryPlan / familyOrchestrator thrash; Foundation locks cited intact | **CONSISTENT** |
| Acc scrub on evidence payloads | **PASS** bait `Q1701775` leak=0 | Enrich Acc-redacts `signalSummary`; `explainWhy` scrub helpers; e2e asserts poison leak=0 | **CONSISTENT** |
| CANDIDATE≠FACT | **PASS** `fact` demoted; no Discovery `fact` emit | `epistemicStateFor` demotes `fact`→`candidate` · finding `why.identityScore=null` · enum lists `fact` only as known-token defense | **CONSISTENT** |
| Contradiction / dedup / aging | **PASS** units | `classifyEvidenceAging` · `groupEvidence` · `dedupEvidenceReport` · independence via `sourceFamily` | **CONSISTENT** |
| Phase 4 relationship start | **PARTIAL** (C doc) | Scaffolding in C; closed under Checkpoint E glance — not a C reopen | **CONSISTENT** (scoped) |
| `evidence.test.mjs` | **51 / 0** | **55** `assert(` call sites on disk (count ≥ claim; FF-ACC additions likely) | **CONSISTENT** (count Δ = OK residual) |

### Overall Arch verdict: **CONSISTENT**

No material drift from Server C SOLID. Residuals below are **OK** / deferred (not reopen Checkpoint C).

---

## Architecture view · Evidence product

```
ranked findings + evidence (+ contradictions)
    │
    └─ enrichSessionEvidence(session)          [Checkpoint C · additive]
          │
          ├─ enrichEvidenceRow per evidence
          │     ├─ fingerprint / familyId / hostFamily
          │     ├─ evidenceStrength  (strong|moderate|weak|metadata_only)
          │     │     └─ web_origin → metadata_only (C1 · never upgrades identity)
          │     ├─ agingBand / ageMs / retrievedAt
          │     ├─ provenance { planId, intentId, familyId, providerId, … }
          │     ├─ independence peers (sourceFamily)
          │     ├─ epistemicState  candidate | corroborated_candidate
          │     │     └─ fact → demote candidate (CANDIDATE≠FACT)
          │     └─ audit + engineVersion
          │
          ├─ finding.why = explainWhy({ findingId })
          │     ├─ provenanceChain[] + contradictions + corroboration
          │     ├─ identityClaim=false · identityScore=null
          │     └─ epistemicCeiling=candidate
          │
          └─ session.evidenceGroups / evidenceDedup / evidenceEngineVersion
                │
                └─ emitSnapshot → sanitizeDiscoveryPayload
                      (evidenceEngineVersion in DEEP_SKIP_KEYS · Acc scrub)
```

### Epistemic floors (Checkpoint C)

| Floor | Value | Cite |
|-------|-------|------|
| `epistemicState` | `candidate` \| `corroborated_candidate` — **never** emit `fact` | `epistemicStateFor` |
| `identityScore` | **`null`** | `explainWhy` / finding `why` |
| `evidenceStrength` | observation strength — **not** identity confidence | `classifyEvidenceStrength` |
| web_origin / C1 | **`metadata_only`** ceiling | strength classifier |
| EVIDENCE≠INFERENCE | `claimKind` / `inference` / `identityClaim` fields | enrich contract |
| Acc | forbidden QID scrub on explain + enrich surfaces | evidence scrub helpers + emit sanitize |

---

## Consistency with SoT / PRE-GO / prior Arch

| Theme | Checkpoint C expectation | Arch read | Verdict |
|-------|--------------------------|-----------|---------|
| **INFORMATION ≠ IDENTITY** | explainWhy never identity score | `identityScore: null` · `identityClaim=false` | **PASS** |
| **CANDIDATE ≠ FACT** | fact demoted | `epistemicStateFor` + finding ceiling | **PASS** |
| **UNKNOWN ≠ FALSE** | strength/aging do not invent identity | metadata_only + candidate ceiling | **PASS** |
| **URL ≠ IDENTITY** | web_origin strength ceiling | `metadata_only` path | **PASS** |
| **Acc scrub** | bait leak=0 on enrich/explain | Q1701775 asserts + sanitizeDiscoveryPayload | **PASS** |
| **B0 flag-off** | enrich additive; no plan thrash | orch post-contradiction wire only | **PASS** |
| **No promote** | HOLD | Flags OFF · no productionEligible flip | **PASS / HOLD** |
| **F11** | no new HTTP | Evidence consumes planId when present; no adapter HTTP | **PASS / HOLD** |

Carry-forward from Gate A / B (do **not** reopen C):

1. Default `maxRetries:0` rate_limited harden — intentional.  
2. Graph scrub `hasTypedSoftRef: true` over-coerce — safe direction; owned under E glance.  
3. Prior B glance **CONSISTENT** — Seed→Plan→Family→Evidence path remains the consumer of this enrich.

---

## Residuals / drift notes

| Item | Class | Note |
|------|-------|------|
| `evidence.test.mjs` assert count 55 vs Server **51/0** | **OK residual (doc age)** | Disk ≥ claimed green; likely FF-ACC assert additions after C stamp; not architecture reopen |
| Live Preview RUNNOW for `why` surface | **OK residual** | Server deferred · no promote |
| SSE explainability snippet | **OK residual** | Helpers only · not wired as SSE event |
| Orch early S6 `buildEvidenceGraph` before contradictions | **OK residual** | Server C §7.3 · E overwrites with sanitize — see E glance |
| `EPISTEMIC_STATES` includes token `fact` | **OK / defense** | Enum documents known inbound token; demote path prevents emit |
| Phase 4 relationship close | **Out of scope for C** | Closed under Checkpoint E |

**No DRIFT items requiring code fix.** Arch did not modify runtime.

---

## Evidence anchors (read-only)

| Artifact | Claim used |
|----------|------------|
| `CHECKPOINT-C-EVIDENCE.md` | Status **SOLID** · gate table · files · contract · tests · residuals |
| `api/lib/discovery/evidence.js` | enrich / explainWhy / epistemic demote / metadata_only |
| `api/lib/discovery/evidence.test.mjs` | assert sites · Acc poison · CANDIDATE≠FACT |
| `api/lib/discovery/orchestrator.js` | L778–780 enrich after contradictions |
| `api/lib/discovery/emit.js` | `evidenceEngineVersion` in `DEEP_SKIP_KEYS` (RO cite) |
| `api/lib/discovery/index.js` | barrel exports `enrichSessionEvidence` / `explainWhy` |
| Prior Arch | `CHECKPOINT-B-ARCH-GLANCE-ארכיטקט.md` · `GATE-A-RUNTIME-GREEN-ארכיטקט.md` |

**Checksums (integrity · Arch wrote 0 runtime bytes):**  
`evidence.js` `734e1446…085a36` · `emit.js` `38b992cb…7d0485` · `orchestrator.js` `b7fc5596…e0ee6f` · `security.js` `96f3d790…aeffd4` · `providers.js` `86b9c9df…4f4bcc` · `familyOrchestrator.js` `c6ad414b…87661d`

**js/mjs/html/package.json edits this glance: 0.**

---

## Explicit non-claims

- Arch did **not** change runtime; **glance only**.  
- **NO promote** / no GO-PROMOTE / no alias change.  
- **NO** Core / B0 / A2 / C1 **unfreeze**.  
- **F11 HOLD** — no filings/news/registry/crawl/private HTTP.  
- **NOT** Checkpoint E close (separate glance).  
- **NOT** Checkpoint F security closure.  
- **NOT** Cloud/GitHub push (local docs under GO-IMPL-500 only).  
- **NOT** live Preview RUNNOW verification this wave.

---

## Status board (Checkpoint C Arch)

| Item | Owner | State |
|------|-------|-------|
| Server `CHECKPOINT-C-EVIDENCE.md` | Acc / QA | **SOLID · HOLD** (cited) |
| This glance `CHECKPOINT-C-ARCH-GLANCE-ארכיטקט.md` | Arch | **CLOSED · CONSISTENT** |
| `evidence.js` product contract | Server/Acc | **GREEN** |
| orch `enrichSessionEvidence` wire | Server | **GREEN** |
| CANDIDATE≠FACT / identityScore=null | Server | **GREEN** |
| Acc bait scrub on explain/enrich | Acc | **GREEN** |
| Live Preview `why` / SSE snippet | Future | **RESIDUAL OK** |
| Promote / A2-C1 unfreeze / F11 HTTP | — | **HOLD / FROZEN** |

---

## ACTIONS (this glance)

| # | Time (IDT) | Action |
|---|------------|--------|
| 1 | 22:51 | Read `CHECKPOINT-C-EVIDENCE.md` + B glance / GATE-A-RUNTIME-GREEN format |
| 2 | 22:51 | Read-only: `evidence.js`, orch enrich wire, emit DEEP_SKIP, evidence.test assert count |
| 3 | 22:51 | Wrote this glance · verdict **CONSISTENT** · ACTION-LOG band via wave |

**Meaningful doc actions:** glance + log (shared wave).  
**Runtime edits: 0.** · **Promote: NO.**

---

## STOP

Arch Checkpoint C **CONSISTENT** with Server SOLID · DOCS ONLY · NO CODE · NO PROMOTE · Core/B0/A2/C1 FROZEN · F11 HOLD
