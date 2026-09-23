# Phase B CONTINUE · UX · SSE + `/narrow` · ממשק · 2026-09-20

**STATUS:** Client wire **READY** · **NO deploy** · **NO promote** · awaits **Server new Preview**  
**Aligns:** `PHASE-B-BOUNDARIES-SSE-NARROW-STORE-ארכיטקט-2026-09-20.md` · Pack progressive API · prior UX slice  
**Owner:** ממשק (UX)  
**Time:** 2026-09-20 ~03:39 IDT (Asia/Jerusalem)

---

## 1. What wired (thin, additive)

| Surface | Behavior |
|---------|----------|
| **SSE progressive** | After `POST /api/discovery/sessions`, prefer `EventSource` on `GET …/sessions/:id/events`. Append/merge findings by id; update progress/providers/facets; track `cursor` / `lastEventId` for ordered additive resume. |
| **Poll fallback** | On EventSource unsupported, SSE boot timeout (~2.8s), or early close → `GET …/sessions/:id` poll loop (unchanged contract). |
| **POST snapshot** | If create returns Acc-scrubbed `snapshot` (serverless Preview pattern), paint immediately; if already terminal, skip SSE. |
| **`POST …/narrow`** | Facet chip toggle / clear → `{ filters: { [key]: string[] } }` → replace findings+facets from scrubbed snapshot (`narrowSource=server`). **Not** client-authoritative when API succeeds. |
| **Client filter fallback** | Fixtures / offline / narrow 404·405·501 → existing client-side facet filter (`narrowSource=client`). |
| **Fixture path** | `?discoverySource=fixture` unchanged — progressive `stages[]`; narrow stays client-side. |

**Explicitly absent in Discovery:** faces · dossier · «זה האדם» · identity CTA. Belt-delete of `dossier`/`faces` on apply.

**Not touched:** `api/lookup.js`, Core Entity Mode UI, alias `dpl_8ag…`, deploy/promote.

---

## 2. Arch BOUNDARIES alignment

| Arch requirement | Client handling |
|------------------|-----------------|
| SSE `text/event-stream` progressive chunks | `EventSource` on `/events`; named events + default `message` |
| Ordered / cursor / event id; reconnect without silent loss | Store `discState.cursor` from `lastEventId` / payload `cursor`; `?cursor=` on connect; merge-by-finding-id (replay-safe); EventSource `Last-Event-ID` on auto-reconnect |
| Terminal ∈ `{ partial, complete, failed_soft }` | `isTerminalStatus`: leave `running`; `complete`/`failed_soft` stop; `partial` stops when no provider `pending` |
| Narrow = **server recompute** | `POST …/narrow` with facet `filters` only; response replaces feed; client filter not SoT when `narrowSource=server` |
| Acc scrub on emit | Consume scrubbed payloads; no rehydrate of stripped ids; no identity chrome |
| Store durability | Client-agnostic — uses sessionId from create; works once Server persists cross-instance |

### SSE event names accepted (flexible to Server emit)

`snapshot` · `session` · `finding` / `findings` · `progress` / `status` / `chunk` · `facets` · `complete` / `done` / `terminal` · `tombstone` · `error` · default `message` (snapshot-shaped JSON).

### Narrow request (Arch minimum)

```http
POST /api/discovery/sessions/:id/narrow
Content-Type: application/json

{ "filters": { "provider": ["wikidata"], "kind": ["page"] } }
```

Response: canonical session snapshot (`findings`, `evidence?`, `facets`, `status`, `providers`, `progress`, `forbiddenIdentitiesVersion`, …).

---

## 3. How to demo (query params)

**Fixture / offline (no Server Preview required):**

```text
/?mode=discovery&discoverySource=fixture&seed=seed-person-he&autorun=1
/?mode=discovery&discoverySource=fixture&seed=seed-person-latin&autorun=1
/?mode=discovery&discoverySource=fixture&seed=seed-domain-org&autorun=1
```

Toggle facet chips → client narrow (`narrow:client` tag). Progress strip shows `tx:fixture`.

**Live API (when Server CONTINUE Preview exposes SSE + narrow + durable store):**

```text
/?mode=discovery
# optional force transports:
/?mode=discovery&discoveryTransport=sse
/?mode=discovery&discoveryTransport=poll
```

1. Enter any Seed (Entity-Agnostic — same path).  
2. Progress strip: `tx:sse` or `tx:poll`; findings append.  
3. Toggle facets → `narrow:server` after successful `/narrow`; clear → empty filters recompute.  
4. If SSE missing → automatic poll; if `/narrow` missing → `narrow:client` overlay.  
5. Switch «מצב ישות» — Core Entity `/api/lookup` path unchanged.

**Local static check:**

```bash
cd /workspace/akvot-quick-demo
npx --yes serve -l 4173 .
# open fixture URLs above
```

---

## 4. SSE + narrow behavior + fallbacks

```
POST /sessions
  ├─ snapshot present + terminal → paint · done
  ├─ prefer SSE (default / discoveryTransport=sse)
  │     ├─ events arrive → merge · cursor · progress
  │     ├─ terminal status → close EventSource
  │     └─ timeout / unsupported / early close → POLL
  └─ discoveryTransport=poll → GET :id loop

Facet toggle
  ├─ api session → POST /narrow { filters }
  │     ├─ 2xx → replace findings+facets (server SoT)
  │     └─ fail → client filter
  └─ fixture / offline → client filter only
```

Cancel («בטל») aborts fetch + closes EventSource + clears timers.

---

## 5. Locks held

| Lock | Status |
|------|--------|
| Additive only | Discovery UI only; no Core rewrite |
| NO identity chrome | No faces/dossier/«זה האדם» in Discovery |
| Entity-Agnostic | No Seed literal branches in UI |
| DO NOT DESTROY CORE `/api/lookup` | Untouched |
| NO deploy / NO promote | **Not performed** |
| Alias `dpl_8ag…` | Untouched |
| Preview-only mindset | Evidence + code ready for Server Preview verify |

---

## 6. Files changed

| Path | Change |
|------|--------|
| `discovery-ui.js` | SSE prefer + poll fallback; `/narrow` server recompute; cursor; terminal=`partial|complete|failed_soft`; fixture path preserved |
| `index.html` | **No change** (already includes `discovery-ui.js`) |
| `test-results/discovery/PHASE-B-UX-SSE-NARROW-ממשק-2026-09-20.md` | This evidence |

---

## 7. Blockers / depends

| Blocker | Notes |
|---------|-------|
| **Server new Preview** | Arch BOUNDARIES require `events.js` + `narrow.js` + persistent store (Upstash/Redis). Not live for UX verify yet. |
| Live SSE/narrow E2E | Deferred until Server Preview URL/dpl — then re-verify ≥3 Seeds + Acc scrub on chunks/narrow. |
| In-memory Map SoT | Server wave retires this; client already sessionId-based. |

**Hand-off:** שרת → ship Preview with SSE + narrow + store · בודק/דיוק → Acc+QA on ≥3 Seeds · ארכיטקט glance · Chief GO later.

---

## 8. Success checklist (this agent)

- [x] Code ready to use SSE + narrow when Preview exposes them  
- [x] Poll + fixture still work  
- [x] Evidence MD written  
- [x] Aligned to Arch `PHASE-B-BOUNDARIES-SSE-NARROW-STORE-…`  
- [x] **NO deploy**

**Decision:** UX CONTINUE wire **READY** · **await Server Preview** · **NO promote**.
