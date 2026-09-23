# MEGA-B · Architecture Map · ארכיטקט · 2026-09-20

**Owner:** Arch B (forensics 11–30) · **Mode:** DOCS + code analysis · **Promote:** HOLD  
**Locks:** Acc P0 Core alias `dpl_8ag…` LOCKED · NO Core rewrite · NO promote  
**KV credentials:** BLOCKED (no `KV_REST_API_*` / `UPSTASH_REDIS_REST_*` on project) — noted; work continues on adapter + docs  
**Workspace:** `/workspace/akvot-quick-demo` · Public sources only · No secrets in this doc

---

## 1. Surfaces (verified)

| Surface | Entry | Role |
|---------|-------|------|
| Core lookup | `api/lookup.js` (~4514 LOC) | Entity Mode / dossier path · Acc P0 sacred |
| Core orchestrator | `api/lib/orchestrator.js` | Stage decisions · `mayCommitDossier` · Domain revalidate |
| Stage-B | `api/lib/stageB.js` | Registry discover: ORCID / Open Library / VIAF / Wikidata |
| Forbidden / Acc SoT | `api/lib/forbiddenIdentities.js` | QID denylist · `sanitizeCandidatesPayload` |
| Known seeds (Core) | `api/lib/knownIdentities.js` | Celeb/public-figure QID seed SoT (Core only) |
| Discovery create | `POST api/discovery/sessions/index.js` | Session mint + pipeline |
| Discovery get | `GET api/discovery/sessions/[id]/index.js` | Acc-scrubbed snapshot (+ fs-regen) |
| Discovery SSE | `GET api/discovery/sessions/[id]/events.js` | Progressive SSE (scrub per chunk) |
| Discovery narrow | `POST api/discovery/sessions/[id]/narrow.js` | Server facet recompute |
| Discovery health | `GET api/discovery/health.js` | Store WRITE→READ→UPDATE→DELETE probe |
| App health | `GET api/health.js` | Phase/build + discoveryStore telemetry |
| UX | `discovery-ui.js` | Discovery mode UI · SSE preferred · poll/fixture fallbacks |

---

## 2. Layer pipeline (Discovery)

```
ingest (POST seed|q)
  → providers (wikidata, openlibrary)     [Pack also names viaf — not in DEFAULT_PROVIDERS]
  → normalize (normalizeRawHit / cite-or-drop https)
  → evidence (fingerprint, provenanceUrl)
  → ER soft (softEntityResolve — opaque hash refs; UNKNOWN≠FALSE)
  → facets (aggregateFacets provider/kind/hint)
  → emit / SSE / narrow (sanitizeDiscoveryPayload → Acc SoT)
  → Acc scrub (forbiddenIdentities v2026-09-19.1+)
  → UI (discovery-ui.js)
```

**Core parallel (UNCHANGED, LOCKED):**

```
query → lookup.js → wiki/google/stageB → Core orchestrator decideStage/mayCommitDossier
      → revalidateDomainSafePayload → sanitizeCandidatesPayload → response
```

Discovery **never** calls `mayCommitDossier` / `canCommitIdentity`.

---

## 3. Module roles (`api/lib/discovery/`)

| Module | Role | Writes cache? | Acc scrub |
|--------|------|---------------|-----------|
| `orchestrator.js` | S0–S10 lifecycle · create/get/narrow/runPipeline · fs-regen hook | via sessionStore | emitSnapshot on create/get/narrow/pipeline end |
| `sessionStore.js` | Backend select: vercel-kv → upstash → **fs-regen** | yes (/tmp or KV) | caller scrubs on read/emit |
| `providers.js` | Wikidata + Open Library · softEntityResolve | no | n/a (raw hits) |
| `store.js` | normalize · fingerprint · rank · contradictions | no | n/a |
| `emit.js` | Discovery Acc scrub wrapper over forbiddenIdentities SoT | no | **yes** (primary) |
| `sse.js` | Progressive events · scrub every chunk | no | yes |
| `narrow.js` | Facet filter apply | no | caller scrub |
| `facets.js` | Facet aggregate | no | caller scrub |
| `faultInject.js` | Preview/dev fault hooks (env-gated) | no | n/a |
| `index.js` | Barrel re-exports | — | — |

---

## 4. Store backends (runtime status)

| id | Status | Evidence |
|----|--------|----------|
| `vercel-kv` | **blocked** | Needs `KV_REST_API_URL` + `KV_REST_API_TOKEN` — absent |
| `upstash` | **blocked** | Needs `UPSTASH_REDIS_REST_*` — absent |
| `fs-regen` | **active (fallback)** | `detectStoreBackend()` default; `/tmp` + seed-encoded `ds1.*` ids; GET miss → `maybeRegenerate` |

`getStoreInfo()` (verified current code): `durable` / `promoteEligible` only true for kv|upstash; `fallback` / `explicitFallback` / `fsRegenFallback` true for fs-regen. Interim doc that claimed `durable:true` on fs-regen is **stale** — code already fixed.

---

## 5. Acc scrub call graph

```
forbiddenIdentities.sanitizeCandidatesPayload  ← SoT
        ↑
discovery/emit.sanitizeDiscoveryPayload
        ↑
orchestrator.emitSnapshot  → create snapshot · GET · narrow · pipeline persist
sse.buildProgressiveEvents / scrubFindingChunk / scrubFacetsChunk
Core: orchestrator.attachOrchestratorFields / revalidateDomainSafePayload → same SoT
```

---

## 6. Preview ≠ Prod (drift snapshot)

| | Discovery Preview | Prod Core alias |
|--|-------------------|-----------------|
| Deploy | Preview functions (sessions/SSE/narrow/health) | Acc P0 `dpl_8ag…` LOCKED |
| Store | fs-regen (KV blocked) | N/A for Discovery (not promoted) |
| Promote | HOLD | Core untouched |
| UX | discovery-ui + fixtures | Entity Mode via lookup |

---

## 7. Pack v1.0 alignment notes

- Pack: providers wikidata / viaf / openlibrary — **runtime Discovery omits viaf**.
- Pack S7 relationship expansion — **orchestrator sets `stage='S7'` then immediately S8; `graph.edges=[]` always**.
- Schemas under `test-results/discovery/schemas/` — runtime shapes diverge (see forensics).

---

## Machine-readable companion

`MEGA-B-ARCHITECTURE-MAP-ארכיטקט-2026-09-20.json`


## 8. P1 closure fold (2026-09-20 ~07:24 IDT)

See `MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md`.

- **CLOSED:** Candidates Acc scrub (`emit.js` delete after SoT)
- **OPEN:** B17 · B18 (Server in progress) · B22 facetHints · B23 contradictions
- **DOCUMENTED:** B21 Preview≠Prod
- **HOLD promote · Core locked**
