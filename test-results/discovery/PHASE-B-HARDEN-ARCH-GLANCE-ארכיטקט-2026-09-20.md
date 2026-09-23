# Phase B · HARDEN ARCH GLANCE · ארכיטקט · 2026-09-20

**STATUS:** **PASS** · recommend **Chief Review** · **NO promote** · **NO alias change** · **WP4 NO-GO**  
**Checked:** 2026-09-20 ~04:15 Asia/Jerusalem (IDT / UTC+3)  
**Preview:** `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB` · `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app`  
**Core alias (LOCKED):** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · **untouched**  
**Refs:** `PHASE-B-BOUNDARIES-SSE-NARROW-STORE-ארכיטקט-2026-09-20.md` · SERVER-HARDEN · HARDEN-EVIDENCE · HARDEN-QA · Acc-DISC-HARDEN · UX-SSE-NARROW · UX-HARDEN-PREVIEW-VERIFY

**Scope:** Docs + code/boundary glance of HARDEN Preview (SSE / narrow / persistent store) vs BOUNDARIES addendum. **NO promote. NO alias change.**

---

## Verdict

| Gate | Result |
|------|--------|
| **Arch glance (SSE / narrow / store vs BOUNDARIES)** | **PASS** |
| Persistent store (Map no longer SoT) | **PASS** · `fs-regen` Preview SoT · Map = warm cache only |
| SSE `/events` + Acc scrub | **PASS** · present · scrubbed per chunk |
| `POST /narrow` + Acc scrub | **PASS** · server recompute · scrubbed |
| Acc scrub on rehydrate / HIT / regen | **PASS** · `emitSnapshot` / `sanitizeDiscoveryPayload` on every path |
| QA ≥3 Seeds · leakage=0 · Core alias | **PASS** · HARDEN-EVIDENCE / HARDEN-QA |
| Acc-DISC HARDEN | **GO** · leakage=0 · Core alias GO |
| Entity-Agnostic · Core untouched | **PASS** |
| Soft gaps (fs-regen vs Redis; seed-object; SSE replay) | **Called out** · non-blocking for Chief Review on Preview |
| Overall | **PASS** — recommend **Chief Review** |
| Promote / alias | **STOP** — explicit Chief GO only; `dpl_8ag…` stays LOCKED |
| WP4 | **NO-GO** |

---

## 1. Module map vs BOUNDARIES §4

| Declared responsibility | Observed | Hold |
|-------------------------|----------|------|
| `store.js` persistent adapter boundary | Re-exports `sessionStore` / `mintSessionId` / `detectStoreBackend` / `getStoreInfo`; comment: Map **NEVER** SoT | PASS |
| `sessionStore.js` durable backend | KV if env; else **`fs-regen`** (`/tmp` + seed-encoded `ds1.` id + regen). TTL 1h. Version + `conditionalSet`. Memory Map = warm cache only | PASS (Preview) |
| `emit.js` shared Acc scrub | `sanitizeDiscoveryPayload` + `scrubFindingChunk` / `scrubFacetsChunk`; stamps `forbiddenIdentitiesVersion`; deletes dossier/faces/photoUrl | PASS |
| `narrow.js` server facet recompute | `parseNarrowFilters` / `applyNarrow` → filtered findings + recomputed facets; caller scrubs via `emitSnapshot` | PASS |
| `sse.js` progressive frames | `buildProgressiveEvents` / `writeProgressiveSse`; Acc scrub before each frame; `id:` cursor; `Last-Event-ID` resume | PASS |
| `sessions/index.js` create | POST create + scrubbed snapshot | PASS (Server evidence) |
| `sessions/[id]/index.js` GET | Durable GET → rehydrate → Acc scrub (HIT/regen) | PASS |
| `sessions/[id]/events.js` SSE | `GET` · `text/event-stream` · scrubbed progressive write | PASS |
| `sessions/[id]/narrow.js` POST | Invokes `narrowDiscoverySession` · scrubbed response | PASS |
| `forbiddenIdentities.js` SoT | Reused; not forked · version `2026-09-19.1` | PASS |
| Core `api/lookup.js` + Core orchestrator | **UNCHANGED** · `lookup.js` mtime 2026-09-18 (pre-wave); Discovery never calls `mayCommitDossier` | PASS |

**Hold:** Module map matches BOUNDARIES §4. Recommended Redis is inactive (no KV env) — see §7 soft gaps; Preview uses documented `fs-regen` which retires Map-as-SoT.

---

## 2. CHECK · Persistent / fs-regen store + Acc on rehydrate

| Requirement (BOUNDARIES) | Evidence |
|--------------------------|----------|
| Replace in-memory Map as SoT | `sessionStore` is async durable facade; Map used only as in-process warm cache + test inject. Orchestrator production path → `sessionStore.get/set` |
| Cross-instance durability | Seed-encoded `ds1.<b64url>` id; on miss `maybeRegenerate` re-runs pipeline, Acc-scrubs, sets `_regenerated: true` |
| Acc scrub on GET / HIT / regen | `getDiscoverySession` → always `emitSnapshot` → `sanitizeDiscoveryPayload` (HIT not trusted) |
| Acc scrub on create | Pipeline end + POST return scrub findings/evidence/facets before persist/return |
| TTL / version | TTL 1h; monotonic `version` bump on pipeline complete + narrow; `conditionalSet` available |
| Live Preview | HARDEN-QA: all 3 Seeds GET `regenerated=true`, `store.backend=fs-regen`, leak=0 |

**Hold:** **PASS** for Preview. SoT is no longer Map-only.

---

## 3. CHECK · SSE events + POST narrow (scrubbed)

### SSE (`GET …/sessions/:id/events`)

| Contract | Observed |
|----------|----------|
| `Content-Type: text/event-stream` | Route sets charset utf-8; QA confirms |
| Ordered / cursor / event id | `id:` = monotonic cursor; `Last-Event-ID` / `?cursor=` resume skip |
| Acc scrub every chunk | Full sanitize → `scrubFindingChunk` / `scrubFacetsChunk` before `res.write` |
| Terminal ∈ `{partial, complete, failed_soft}` | `status` + `done` events; soft `error` path |
| Event sequence | `meta` → `progress` → `provider*` → `finding*` → `facets` → `status` → `done` |
| Live ≥3 Seeds | S1 ev=20 · S2 ev=22 · S3 ev=9 · leak=0 · cursorIds=true |

### Narrow (`POST …/sessions/:id/narrow`)

| Contract | Observed |
|----------|----------|
| Facet filters only (not identity commit) | Accepts `facets` / `filters` / `selected` |
| Server recompute findings + facets | `applyNarrow` filters + `aggregateFacets` |
| Durable version bump | `ensureSessionVersion({ bump: true })` + persist `lastNarrow` |
| Acc scrub before return | `emitSnapshot` / sanitize; bans dossier/faces |
| Live ≥3 Seeds | S1 13→8 v=3 · S2 15→8 v=3 · S3 2→2 v=3 · leak=0 |

**Hold:** **PASS**.

---

## 4. CHECK · QA PASS ≥3 Seeds · leakage=0 · Core alias PASS

Source: `PHASE-B-HARDEN-EVIDENCE-בודק-2026-09-20.md` + `PHASE-B-HARDEN-QA-בודק-2026-09-20.md`

| Seed | POST | GET regen | SSE | Narrow | Acc ver | Leak | Bans |
|------|------|-----------|-----|--------|---------|------|------|
| דוד כהן | partial · 13 | yes | OK | 13→8 | 2026-09-19.1 | 0 | none |
| Alex Morgan | partial · 15 | yes | OK | 15→8 | 2026-09-19.1 | 0 | none |
| example.org | complete · 2 | yes | OK | 2→2 | 2026-09-19.1 | 0 | none |

| Core alias (`dpl_8ag…`) | Result |
|-------------------------|--------|
| Assaf → dossier / Q47507930 | PASS |
| כהן soft / need_context | PASS |
| Smith candidates · never Q1701775 | PASS |
| Leakage | **0** |
| Promote | **NOT DONE** |

**Hold:** **PASS**.

---

## 5. CHECK · Acc-DISC HARDEN GO · leakage=0

Source: `PHASE-B-ACC-DISC-HARDEN-דיוק-2026-09-20.md`

| Gate | Result |
|------|--------|
| Acc-DISC | **GO** · leakage **0** |
| Core alias Acc P0 | **GO** · leak=0 · pw=0 |
| Surfaces | POST · GET HIT/regen · SSE chunks · narrow · Preview lookup Smith |
| Invariants ACC-DISC-01/02/03/06 | Held · NEVER Q1701775 · no dossier/faces · version stamped on HIT/regen |

**Hold:** **PASS / GO**.

---

## 6. CHECK · Entity-Agnostic · Core untouched

| Check | Result |
|-------|--------|
| Same path for ≥3 Seeds | POST → GET → events → narrow identical shape; identical snapshot top-level keys (HARDEN-QA) |
| No Seed literal branches in Discovery modules | Grep: no `דוד כהן` / forbidden QID hardcode in `api/lib/discovery` or `api/discovery` production JS |
| Opaque `seed`/`q` | Orchestrator `String(body.seed ?? body.q)` — no person-name special-case |
| Core `api/lookup.js` | Untouched this wave (mtime 2026-09-18); no Discovery→`mayCommitDossier` |
| Alias `dpl_8ag…` | LOCKED · health match · regression PASS |

**Hold:** **PASS**.

---

## 7. Soft / known gaps (non-blocking for Preview Chief Review)

1. **fs-regen vs recommended Redis (BOUNDARIES §2.3)**  
   No `KV_REST_API_*` / `UPSTASH_REDIS_REST_*` on project → Redis adapter code present but inactive. Preview SoT = `/tmp` cache + **seed-encoded sessionId regenerate-from-seed**. Acc/QA verified cross-instance GET (`regenerated: true`). Adding KV env auto-switches via `detectStoreBackend()` without route changes.  
   **Implication:** Narrow `lastNarrow` / exact finding set may re-derive via provider re-hit on cold instance (not shared Redis state). Acceptable for Preview; Redis remains the production-preferred SoT when secrets land.

2. **SSE is progressive replay of completed/regenerated session**  
   Serverless pattern: POST awaits pipeline; `/events` streams scrubbed progressive frames from durable session (not live mid-provider push). Still meets BOUNDARIES minimum (event-stream, ordered cursor, Acc scrub, terminal status). Soft: true mid-flight streaming deferred.

3. **Object-shaped seed soft gap (UX verify check 4)**  
   `{"seed":{"raw":"example.org","kind":"domain"}}` coerces to `"[object Object]"`. Live UI posts **string** seed — recheck PASS. Soft: Server should soft-reject non-string seeds (tracked for שרת; not HARDEN chrome/SSE/narrow blocker).

4. Soft ER remains hash stub; `viaf` not in this wave (unchanged from prior glance; OUT of HARDEN focus).

5. Deployment Protection → Acc/QA use `vercel curl --deployment <dpl>` (documented).

---

## 8. OUT / locks (reaffirm)

| Lock | Status |
|------|--------|
| Alias promote / change (`dpl_8ag…`) | **NOT DONE** · LOCKED |
| Discovery promote | **await explicit Chief GO** |
| Core rewrite | **not performed** |
| WP4 | **NO-GO** |
| Identity commit from Discovery | **absent** |
| In-memory-only session as SoT | **retired** (Map = cache only) |

---

## 9. Gate sequence position

```
Impl ✓ → new Preview ✓ (dpl_BMh…) → Acc + QA ≥3 Seeds ✓ → Arch glance ✓ (this doc)
  → Chief Review (next) → PROMOTE only on explicit Chief GO
```

**This glance does not authorize promote or alias change.**

---

## Decision

**PASS · recommend Chief Review.**

HARDEN Preview satisfies BOUNDARIES addendum intent for SSE + narrow + persistent store (Preview `fs-regen`) with Acc scrub on all emit/rehydrate paths, Entity-Agnostic ≥3 Seeds, leakage=0, Core alias untouched. Soft gaps (§7) are documented and non-blocking for Preview Chief Review.

**NO promote · NO alias change · WP4 NO-GO · Core `dpl_8ag…` LOCKED.**
