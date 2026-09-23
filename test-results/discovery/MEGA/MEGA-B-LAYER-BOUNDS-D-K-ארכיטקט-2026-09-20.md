# MEGA-B · Layer Bounds D–K · ארכיטקט · 2026-09-20

**Refs:** Pack v1.0 `PHASE-A-ARCHITECTURE-FREEZE-PACK-ארכיטקט-2026-09-20.md` · Entity-Agnostic addendum · `PHASE-B-BOUNDARIES-KV-SOT-ארכיטקט-2026-09-20.md` · `PHASE-B-BOUNDARIES-ארכיטקט-2026-09-20.md`  
**Policy:** HOLD promote · Acc P0 Core alias LOCKED · NO Core rewrite · KV SoT required for Discovery promote

This document bounds **Discovery / ER soft / Evidence / Contradiction** layers relative to Pack + Entity-Agnostic + KV SoT. What each layer **MAY** vs **MUST NOT** do.

---

## Global invariants (all layers)

| MAY | MUST NOT |
|-----|----------|
| Operate on any Seed as opaque input | Hard-code entity names / Seed-value branches (Entity-Agnostic) |
| Use public/authorized sources only | Private / auth-walled / robots-bypass sources |
| Reuse `forbiddenIdentities.js` Acc SoT | Invent a second denylist or skip scrub on emit |
| Live on Preview with fs-regen for dev | Claim fs-regen satisfies promote Gate / KV SoT |
| Emit Findings + Evidence + Facets | Call `mayCommitDossier` / emit dossier / faces / identity-commit photo |
| Soft-fail providers | Poison Core `lookup.js` in-memory cache |

---

## D — Discovery layer (`api/lib/discovery/*` + `api/discovery/sessions/*`)

### MAY
- Run S0–S10 pipeline for any Seed (`createDiscoverySession` / `runPipeline`).
- Call SearchProviders (currently wikidata + openlibrary; viaf when added).
- Persist sessions via `sessionStore` (KV when creds present; fs-regen fallback only).
- Emit progressive SSE / narrow / snapshots **after** Acc scrub.
- Report `storeBackend`, `fallback`, `promoteEligible`, `kvCredsPresent` telemetry (no secrets).
- Use faultInject **only** when `DISCOVERY_FAULT_INJECT=1` (Preview/dev).

### MUST NOT
- Commit identity or write Core dossier fields.
- Treat fs-regen as production SoT or set `promoteEligible=true` on fs-regen.
- Special-case Seeds (incl. fixtures-as-production-assumptions).
- Skip Acc scrub on create snapshot, GET rehydrate, SSE chunks, narrow, or cache/HIT paths.
- Mutate `api/lookup.js` / Core orchestrator behavior.
- Promote to Prod alias without Chief GO + KV Evidence GREEN.

---

## E — ER soft (`softEntityResolve` + Pack §G)

### MAY
- Produce **soft refs** (`seed:<hash>`) and hints from opaque Seed + optional hints object.
- Keep status in {candidate|corroborated|unknown} semantics (UNKNOWN≠FALSE).
- Attach soft `entityRefs` on Findings when evidence justifies.

### MUST NOT
- Assert sameness of identity from name alone (same name ≠ same person).
- Merge/bind entities without evidence-backed relationship rules.
- Clear ambiguity via Core seed maps (`knownIdentities`) inside Discovery.
- Emit faces / dossier confidence / `scoreIdentity` as identity certainty (prefer omit key).

---

## F — Evidence layer (`store.normalizeRawHit` · Pack §F)

### MAY
- Require `https` `provenanceUrl` (cite-or-drop).
- Fingerprint evidence; dedupe by fingerprint (not by display name).
- Attach providerId, retrievedAt, quote, robotsOk, contentType.
- Rank **Findings** by evidence factors (`explainRanking` / `rankFindings`).

### MUST NOT
- Emit Finding without ≥1 Evidence id.
- Drop conflicting evidence silently (prefer contradictions surface).
- Use evidence score as identity confidence.
- Bypass Acc scrub because evidence was previously stored.

---

## G — Contradiction layer (`detectContradictions`)

### MAY
- Surface same-title / multi-domain conflicts (`same_title_multi_domain`).
- Preserve INFORMATION≠IDENTITY messaging.
- Attach contradiction list on session for UI/QA.

### MUST NOT
- Auto-collapse conflicting Findings into one identity.
- Hide contradictions to force a pretty single answer.
- Emit contradiction rows that still reference Acc-stripped finding ids (must filter post-scrub — see B23).
- Treat contradiction absence as proof of single entity.

---

## H — Facets / Narrow

### MAY
- Aggregate dynamic facets from findings (provider/kind/hint).
- Server-recompute on `POST …/narrow` (canonical); UI may overlay client filter only until next server narrow.

### MUST NOT
- Encode identity chrome in facet keys/values.
- Allow forbidden QID tokens in facetHints/buckets past Acc scrub (see B22).
- Persist unscoped narrow as identity commit.

---

## I — Emit / SSE / Acc scrub boundary

### MAY
- Call `sanitizeDiscoveryPayload` / chunk scrubbers as last gate before bytes leave the process.
- Project findings → candidates-equivalent solely to reuse `sanitizeCandidatesPayload`, then **drop** candidates from Discovery emit.

### MUST NOT
- Trust stored/regenerated sessions without re-scrub.
- Emit `dossier` / `faces` / `photoUrl` / Core `candidates` lists on Discovery surfaces.
- Log secrets, tokens, or raw PII in scrub telemetry (counts/version only).

---

## J — KV SoT boundary (promote Gate)

### MAY
- Select `vercel-kv` or `upstash` when full env pairs present.
- Keep fs-regen for local/Preview recovery with **explicit** fallback telemetry.

### MUST NOT
- Promote while `storeBackend === 'fs-regen'` or `promoteEligible !== true`.
- Treat adapter unit tests as substitute for live KV Evidence.
- Invent or embed KV credentials in repo/docs.

---

## K — Core boundary (DO NOT DESTROY CORE)

### MAY
- Coexist with Core Entity Mode on the same deployment.
- Share Acc SoT module (`forbiddenIdentities.js`) and public registry hosts.

### MUST NOT
- Import or call `mayCommitDossier` / `canCommitIdentity` from Discovery.
- Depend on `KNOWN_IDENTITY_SEEDS` for Discovery ranking/routing.
- Change Core Acc P0 alias behavior under Discovery workstreams.
- Rewrite `api/lookup.js` as part of Discovery waves (HOLD / LOCKED).

---

## Layer ownership cheat-sheet

| Layer | Primary paths | Promote relevance |
|-------|---------------|-------------------|
| Discovery | `api/lib/discovery/*`, `api/discovery/sessions/*` | Preview Evidence required |
| ER soft | `providers.softEntityResolve` | Entity-Agnostic AC |
| Evidence | `store.js` normalize/rank | Schema gate |
| Contradiction | `store.detectContradictions` + emit filter | Acc post-filter |
| Acc scrub | `emit.js` + `forbiddenIdentities.js` | ACC-DISC-01 |
| KV SoT | `sessionStore.js` | Gate: not fs-regen |
| Core | `lookup.js`, Core orchestrator/stageB/knownIdentities | LOCKED |

**Decision:** Bounds frozen for Waves D–K planning · **HOLD promote** · KV creds **BLOCKED** · Core alias **LOCKED**.
