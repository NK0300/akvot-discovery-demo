# Phase B · SERVER HARDEN · SSE / NARROW / STORE · שרת · 2026-09-20

**STATUS:** IMPLEMENTED · Preview deploy OK · **NO PROMOTE**  
**Aligned:** `PHASE-B-BOUNDARIES-SSE-NARROW-STORE-ארכיטקט-2026-09-20.md`  
**Core:** `/api/lookup` untouched · alias `dpl_8ag…` LOCKED  
**Entity-agnostic:** opaque `seed`/`q` — no person-name special-cases  
**Checked:** 2026-09-20 ~03:40 Asia/Jerusalem (IDT / UTC+3)

---

## 1. What landed

| Item | Path / behavior |
|------|-----------------|
| Persistent store | `api/lib/discovery/sessionStore.js` (+ re-export from `store.js`) |
| Acc emit | `emit.js` — snapshot + `scrubFindingChunk` / `scrubFacetsChunk` |
| Narrow | `api/lib/discovery/narrow.js` + `POST …/:id/narrow` |
| SSE | `api/lib/discovery/sse.js` + `GET …/:id/events` |
| Orchestrator | durable get/set, regen-from-seed, version bump, narrow persist |
| Routes | `sessions/index.js`, `sessions/[id]/index.js`, `events.js`, `narrow.js` |

### API

| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/api/discovery/sessions` | create + Acc-scrubbed `snapshot` + `store` info |
| `GET` | `/api/discovery/sessions/:id` | rehydrate → Acc scrub (HIT path) |
| `GET` | `/api/discovery/sessions/:id/events` | SSE `text/event-stream`; `id:` cursor; `Last-Event-ID` resume |
| `POST` | `/api/discovery/sessions/:id/narrow` | server recompute facets/findings; durable version bump |

### SSE events (ordered, Acc-scrubbed)
`meta` → `progress` → `provider*` → `finding*` → `facets` → `status` → `done`  
(error soft-path: `error` with `failed_soft`)

---

## 2. Store choice (Preview)

| Check | Result |
|-------|--------|
| `KV_REST_API_*` / `UPSTASH_REDIS_REST_*` | **Absent** (only `GOOGLE_GENERATIVE_AI_API_KEY` on project) |
| Selected backend | **`fs-regen`** |
| SoT | Durable session id encodes seed/hints (`ds1.<b64url>`) + `/tmp/akvot-discovery-sessions` cache |
| Cross-instance | On miss: **regenerate-from-seed** from id, Acc-scrub, persist to `/tmp` |
| In-memory Map | **Warm cache only — NOT SoT** (BOUNDARIES §3) |
| TTL | 1h |
| Version | Monotonic `version` on pipeline complete + narrow |

**Blocker / fallback (documented):** No Upstash/Vercel KV credentials → cannot use recommended Redis adapter without new secrets. `fs-regen` is the production-realistic Preview option that Acc/QA can verify: **POST then GET succeeds across instances** (`regenerated: true` observed).

When KV env is added later, `detectStoreBackend()` switches to `vercel-kv` / `upstash` automatically — no route changes.

---

## 3. Acc scrub paths (matrix)

| Emit surface | Scrub |
|--------------|-------|
| POST create `snapshot` | `sanitizeDiscoveryPayload` before return + persisted scrubbed findings |
| GET snapshot | rehydrate → scrub again (HIT not trusted) |
| SSE each chunk | `scrubFindingChunk` / `scrubFacetsChunk` / full sanitize before `res.write` |
| Narrow response | recompute → `emitSnapshot` scrub → persist `lastNarrow` |
| Forbidden QID | `Q1701775` stripped; version `2026-09-19.1` |
| Bans | no `dossier` / `faces` / `photoUrl` on Discovery |

---

## 4. Unit results (local)

```
node api/lib/discovery/orchestrator.test.mjs
→ passed=66 failed=0  (store / SSE / narrow / Acc / multi-seed)

node api/lib/orchestrator.test.mjs
→ 128 passed, 0 failed

node api/lib/forbiddenIdentities.test.mjs
→ 39 passed, 0 failed
```

Core `api/lookup.js` mtime unchanged (not modified this wave).

---

## 5. Preview deploy

| Field | Value |
|-------|-------|
| Preview URL | `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app` |
| Deployment id (dpl) | `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB` |
| Inspect | https://vercel.com/k-akvot/akvot-simple-demo/BMhUKUQ4rV4j7jgjPWLdLaXq5LLB |
| Target | `null` (Preview, not Production) |
| Promote | **NOT DONE** |
| Prior Preview (superseded) | `dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6` |
| Core alias | `dpl_8ag…` **LOCKED / untouched** |

---

## 6. Preview smoke (≥3 Seeds) via `vercel curl --deployment`

| Seed | POST status | findings | leak Q1701775 | dossier/faces |
|------|-------------|----------|---------------|---------------|
| Alex Morgan | partial | 15 | 0 | none |
| example.org | complete | 2 | 0 | none |
| דוד כהן | partial | 13 | 0 | none |

### Durable GET after POST
- Session: Alex Morgan  
- `GET /api/discovery/sessions/:id` → `ok=true`, findings=15, **`regenerated: true`**, Acc version `2026-09-19.1`, leak=0  
- Proves cross-instance durability via seed-encoded id (fs-regen).

### Narrow
```
POST …/narrow  {"facets":{"provider":["openlibrary"]}}
→ beforeCount=15 afterCount=8  version=3  leak=0  no dossier
```

### SSE
- `Content-Type: text/event-stream`
- Events include `meta`, `progress`, `provider`, `finding`×N, `facets`, `status`, `done`
- Monotonic `id:` cursors; leak=0

### Core regression
```
GET /api/lookup?q=Assaf Rappaport → uiState=dossier qid=Q47507930
```

Raw artifacts: `test-results/discovery/PHASE-B-HARDEN-raw/`

---

## 7. How to test (≥3 seeds)

```bash
DPL=dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB
# Create
vercel curl --deployment $DPL /api/discovery/sessions -- \
  -X POST -H 'content-type: application/json' \
  -d '{"seed":"Alex Morgan"}'
# → note sessionId

# Durable GET (may show regenerated:true on cold instance)
vercel curl --deployment $DPL "/api/discovery/sessions/<URLENC_SESSION_ID>"

# SSE
vercel curl --deployment $DPL "/api/discovery/sessions/<URLENC_SESSION_ID>/events" -- -N

# Narrow
vercel curl --deployment $DPL "/api/discovery/sessions/<URLENC_SESSION_ID>/narrow" -- \
  -X POST -H 'content-type: application/json' \
  -d '{"facets":{"provider":["wikidata"]}}'

# Repeat seeds: example.org · דוד כהן (same paths)
# Core untouched:
vercel curl --deployment $DPL "/api/lookup?q=Assaf%20Rappaport"
```

Local units:
```bash
npm run test:discovery
node api/lib/orchestrator.test.mjs
node api/lib/forbiddenIdentities.test.mjs
```

---

## 8. Files changed (additive / Discovery only)

- `api/lib/discovery/sessionStore.js` **new**
- `api/lib/discovery/narrow.js` **new**
- `api/lib/discovery/sse.js` **new**
- `api/lib/discovery/emit.js` (chunk scrubbers)
- `api/lib/discovery/orchestrator.js` (durable + narrow + version)
- `api/lib/discovery/store.js` (re-export persistence boundary)
- `api/lib/discovery/index.js` / `orchestrator.test.mjs`
- `api/discovery/sessions/[id]/index.js` · `events.js` · `narrow.js`
- `api/discovery/sessions/index.js`
- `vercel.json` (maxDuration for new functions)
- this Evidence doc

**Not modified:** `api/lookup.js`, Core orchestrator identity-commit paths.

---

## 9. Blockers / limits

1. **No KV credentials** → Redis adapter ready but inactive; Preview uses **fs-regen** (documented, Acc-verifiable). Add `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_*`) to switch SoT to shared Redis without code change.
2. `/tmp` is per-instance ephemeral; durability across instances relies on **seed-encoded sessionId regen** (re-hits providers).
3. SSE on serverless replays progressive chunks from completed/regenerated session (pipeline still awaited on POST for reliability).
4. Soft ER remains hash stub; `viaf` not in this wave.
5. Deployment Protection → use `vercel curl --deployment <dpl>`.

---

## Decision

**HARDEN COMPLETE for Preview** · SSE + narrow + durable store (fs-regen) · Acc scrub all emit paths · ≥3 Seeds green · Core untouched · **NO promote**.

→ Ready for Acc + QA Evidence packs → Arch glance → Chief Review.
