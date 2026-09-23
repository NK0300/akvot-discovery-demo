# MEGA · M8 · Live Preview E2E · ממשק · 2026-09-20

**Verdict: PARTIAL** — Preview server/API reconnect/replay smoke passes; the existing Preview serves an older `discovery-ui.js`, so the latest MEGA-M client hardening remains local-only. **Promote: HOLD. Deploy: not run.**

- **Preview:** `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app`
- **Deployment:** `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB`
- **Verified:** 2026-09-20 07:24 IDT (Asia/Jerusalem)
- **Network method:** Vercel CLI `vercel curl` only; no direct curl/fetch, no deploy, no promote.

## Checks

| Check | Result | Evidence |
|---|---|---|
| Preview client asset | **PASS / stale client noted** | HTTP 200, 39,272 bytes. Preview does **not** contain latest `reconnecting` or `hydrateSession` markers. Local MEGA-M client is 55,458 bytes and contains both. Preview headers show `last-modified: Sun, 20 Sep 2026 01:07:12 GMT`, `x-vercel-cache: HIT`. |
| POST session with string seed `example.org` | **PASS** | HTTP 201; `status=complete`; session ID recorded in `raw/M8-live/session-id.txt`; response has 2 findings in its terminal snapshot. |
| GET session → findings | **PASS** | HTTP 200; same session, `status=complete`, 2 findings. |
| GET `/events` (max-time 5) | **PASS** | HTTP 200; `content-type: text/event-stream; charset=utf-8`; 9 frames: meta, progress, 2 provider, 2 finding, facets, status, done. |
| GET `/events` again on same completed session | **PASS** | HTTP 200, not 404; same text/event-stream and same 9 replay frames. This is replay-from-complete behavior; findings are re-emitted. |
| POST narrow | **PASS** | HTTP 200; `status=complete`, 2 findings, 3 facets, `narrow.applied={}`. |

## Interpretation

The harden Preview API contract is live without KV for this smoke: the session ID is seed-regenerable (`store.backend=fs-regen`, `crossInstance=regenerate-from-seed`), and both repeated SSE requests replay the completed stream. This validates server-side reconnect/replay smoke, but it does not validate the latest local UI reconnect/hydrate implementation because that client was not deployed to this existing Preview.

Therefore M8 is **partial**, not full pass: API/server E2E is pass; latest Preview client E2E is not claimable. No promotion was attempted.

## Raw evidence

- `test-results/discovery/MEGA/raw/M8-live/discovery-ui.js`
- `test-results/discovery/MEGA/raw/M8-live/discovery-ui.headers.txt`
- `test-results/discovery/MEGA/raw/M8-live/post.json` / `post.headers`
- `test-results/discovery/MEGA/raw/M8-live/get.json` / `get.headers`
- `test-results/discovery/MEGA/raw/M8-live/events-1.txt` / `events-1.headers`
- `test-results/discovery/MEGA/raw/M8-live/events-2.txt` / `events-2.headers`
- `test-results/discovery/MEGA/raw/M8-live/narrow.json` / `narrow.headers`
