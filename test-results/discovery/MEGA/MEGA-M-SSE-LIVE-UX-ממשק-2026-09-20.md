# MEGA · Track M · SSE / Live UX · ממשק · 2026-09-20

**STATUS:** Client harden **READY** · **NO deploy** · **NO promote** · Core `/api/lookup` + alias `dpl_8ag…` **untouched**  
**Owner:** ממשק (UX) · track M (SSE/live UX)  
**Time:** 2026-09-20 ~07:20–07:35 IDT (Asia/Jerusalem)  
**Aligns:** `PHASE-B-BOUNDARIES-SSE-NARROW-STORE-ארכיטקט-2026-09-20.md` · `PHASE-B-UX-SSE-NARROW-ממשק-2026-09-20.md` · server `api/lib/discovery/sse.js` + `…/events.js`

---

## 1. M checklist

| # | Item | Status | Notes |
|---|------|--------|-------|
| M1 | SSE **reconnect** with cursor / Last-Event-ID | **PASS (client)** | `?cursor=` + `?lastEventId=` on connect; EventSource closed on error so browser thrash is disabled; manual exponential backoff (cap 5) |
| M2 | Avoid infinite reconnect thrash on **terminal** | **PASS (client)** | On `done`/`complete`/`failed_soft`/`partial`(settled) → close ES, `reachedTerminal`, no further reconnect |
| M3 | **replay-from-complete** — open events on already-complete session | **PASS (client)** | `hydrateSession`: **GET snapshot first** (no blank) → optional SSE replay (`?replay=1` / `?discoveryReplay=1`) with **merge-by-id** |
| M4 | No duplicate spam / no blank on replay | **PASS (client)** | `mergeById` / `mergeFindingChunk`; empty findings snapshot cannot wipe a good feed unless server-narrow |
| M5 | **partial→final** consistency | **PASS (client)** | Explicit states `running` / `partial` / `complete` / `failed_soft` / `reconnecting`; terminal never regresses to `running` on reconnect paint |
| M6 | Findings merge by id | **PASS** | Shared across SSE chunks, snapshot merge, replay |
| M7 | No identity chrome | **PASS** | `stripIdentityChrome` on apply paths; footer still «אין דיוקן · אין תיק · אין ״זה האדם״»; belt-delete dossier/faces/photoUrl |
| M8 | Live E2E vs Preview SSE | **PENDING** | KV creds blocked; work against current Preview contract + local code. Re-verify when Preview SSE durable. |

Machine-readable: `MEGA/MEGA-M-STATUS.json`.

---

## 2. What changed

### `discovery-ui.js`

| Area | Change |
|------|--------|
| UI states | `STATUS_HE.reconnecting`; progress strip class + attempt `#n/5` + `cursor:` tag |
| Reconnect | `runViaSse` rewrite: backoff, max 5, close-on-error (own reconnect), terminal short-circuit, GET snapshot fallback (`tx:sse→get`) |
| Cursor | Query `cursor` + `lastEventId` (mirrors server `events.js` headers/query); still tracks `ev.lastEventId` / payload `cursor` |
| Replay-from-complete | `fetchSessionSnapshot` + `hydrateSession`; deep-link `?session=` / `?sessionId=`; create-terminal path honors `?discoveryReplay=1` |
| SSE events | Handle server frames: `meta`, `provider`, `status`, `done` (plus prior set). Meta never treated as full snapshot wipe |
| Consistency | `settleTerminalStatus` / `clearReconnectOverlay`; `preserveTerminal` on snapshot; merge hint when ids overlap |
| Identity | `stripIdentityChrome` on findings + state |
| Export | `AkvotDiscovery.hydrateSession`, `fetchSessionSnapshot`, `isTerminalStatus` |

### `index.html` (minimal)

- CSS: `.disc-status.reconnecting|complete|failed`, progress border when reconnecting  
- Hint: documents `?session=<id>[&replay=1]` and transport params  

**Not touched:** `api/lookup.js`, Core Entity UI, alias, deploy/promote, KV secrets.

---

## 3. How to demo

### Offline / fixture (no Preview)

```text
/?mode=discovery&discoverySource=fixture&seed=seed-person-he&autorun=1
```

Progress strip shows `tx:fixture`; statuses advance running→partial→complete. No identity chrome.

### Live API (Preview contract)

```text
/?mode=discovery
/?mode=discovery&discoveryTransport=sse
/?mode=discovery&discoveryTransport=poll
```

1. Enter any Seed (Entity-Agnostic).  
2. Watch `tx:sse`, findings append, `cursor:` advance.  
3. On drop mid-stream: `מתחבר מחדש…` + `#n/5`, findings retained, then resume or `tx:sse→get`.  
4. On terminal: status settles; **no** reconnect loop.

### Replay-from-complete

```text
# After you have a sessionId from create/GET:
/?mode=discovery&session=<SESSION_ID>
/?mode=discovery&session=<SESSION_ID>&replay=1

# Or force SSE replay when create already returns terminal snapshot:
/?mode=discovery&discoveryReplay=1
```

Expect: immediate GET paint (never blank) → with `replay=1`, SSE frames merge by id (no duplicate cards).

### Local static

```bash
cd /workspace/akvot-quick-demo
npx --yes serve -l 4173 .
```

### Console QA hooks

```js
AkvotDiscovery.getState()
AkvotDiscovery.isTerminalStatus(AkvotDiscovery.getState().status, AkvotDiscovery.getState().providers)
AkvotDiscovery.hydrateSession('<id>', { replay: true })
```

---

## 4. Behavior sketch

```
POST /sessions
  ├─ snapshot + terminal → paint
  │     └─ ?discoveryReplay=1 → SSE replay (merge) · else done
  ├─ SSE (default)
  │     ├─ events → merge · cursor
  │     ├─ mid-stream error → reconnecting · backoff · ?cursor=
  │     ├─ max reconnect → GET snapshot (sse→get) · settle
  │     └─ done/complete/failed_soft|partial-settled → close · no thrash
  └─ poll fallback

?session=<id>
  → GET snapshot (paint)
  → if running → SSE/poll
  → if terminal + ?replay=1 → SSE replay merge
```

---

## 5. Known gaps / blockers

| Gap | Severity | Notes |
|-----|----------|-------|
| KV / durable store credentials blocked | Blocker for live multi-instance E2E | Do not wait; client ready against Preview + fs-regen contract |
| Live Preview reconnect E2E not re-run this wave | Soft | Code+evidence only; Server Preview verify later |
| Browser EventSource cannot set custom `Last-Event-ID` on first construct | Spec limit | Mitigated via `?cursor=` / `?lastEventId=` query (server already accepts) |
| Server progressive is currently **replay-built** from complete session (`buildProgressiveEvents`) | Context | Client still correct for live chunk streams when Server emits them |

---

## 6. Locks held

| Lock | Status |
|------|--------|
| HOLD promote | **Held** |
| Core `/api/lookup` + `dpl_8ag…` | **Untouched** |
| Entity-Agnostic | **Held** |
| NO secrets in client | **Held** |
| NO identity chrome | **Held** |
| NO deploy (unless UX static — not needed) | **No deploy** |

---

## 7. Files

| Path | Role |
|------|------|
| `discovery-ui.js` | M harden |
| `index.html` | Minimal CSS + hint |
| `test-results/discovery/MEGA/MEGA-M-SSE-LIVE-UX-ממשק-2026-09-20.md` | This evidence |
| `test-results/discovery/MEGA/MEGA-M-STATUS.json` | Machine status |

**Decision:** Track M client UX **READY** · await Preview live verify · **NO promote**.
