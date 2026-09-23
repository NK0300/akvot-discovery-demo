# MEGA-M · KV Preview re-verification · ממשק · 2026-09-20

**Overall: PASS (fixed on Preview). Promote: HOLD. Deploy: not run. Core: untouched.**

- **Preview:** `https://akvot-simple-demo-p68nhr48g-k-akvot.vercel.app`
- **Deployment:** `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e`
- **Checked:** 2026-09-20 07:47:21 IDT (Asia/Jerusalem)
- **Network method:** protected Vercel CLI `vercel curl` only.
- **Raw evidence:** `test-results/discovery/MEGA/raw/kv-preview-reverify-2026-09-20-0746/`

## Acceptance checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | `GET /` discovery UX | **PASS** | HTTP 200; `מצב גילוי` and `tab-discovery` present. Banner is `INFORMATION ≠ IDENTITY · אין דיוקן / תיק זהות / «זה האדם». Preview בלבד.` The occurrence of `«זה האדם»` is explicitly negated, so it is not a failure. |
| 2 | `GET /discovery-ui.js` MEGA-M symbols | **PASS** | HTTP 200, 54,704 bytes; `hydrateSession`, `reconnecting`, `EventSource`, `events`, and `narrow` all present. |
| 3 | `GET /api/discovery/health` | **PASS** | First attempt HTTP 200; `ok=true`, `storeBackend=upstash`, `durable=true`, `promoteEligible=true`, `fallback=false`, `mode=kv-shared`. Store probe WRITE/READ/UPDATE/DELETE all true. Reported health latency: **117 ms** (CLI request elapsed 2,664 ms). No retry needed. |
| 4 | POST string seed `example.org` | **PASS** | HTTP 201; `sessionId=kv1.54825ad93761a737ae2b4d8ab4eeda7a`; status `complete`; snapshot has 3 findings and Upstash/durable metadata. |
| 5 | GET same session | **PASS** | HTTP **200**, not 404; same session returned 3 findings, `status=complete`, Upstash shared-KV metadata. This proves POST→GET durability is fixed. |
| 6 | First `/events` SSE (`--max-time 8`) | **PASS** | HTTP 200; `text/event-stream; charset=utf-8`; 4,705 bytes / 11 frames: `meta`, `progress`, 3×`provider`, 3×`finding`, `facets`, `status`, `done`. |
| 7 | Replay `/events` | **PASS** | HTTP 200; same text/event-stream and 11 replay frames; not 404 and not empty. |
| 8 | POST `/narrow` | **PASS** | `{filters:{kind:["registry"]}}` → HTTP 200; `beforeCount=3`, `afterCount=2`, `status=complete`, version 3. |

## Conclusion

The previous blockers are fixed on `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e`: health is green, POST→GET durable persistence is confirmed, SSE emits frames and replays, and narrow is 200 rather than 404. **Overall PASS. HOLD promote** per instruction; no deployment or promotion was attempted.

## Raw files

- `RESULTS.json`
- `01-root.txt` / `01-root.headers`
- `02-client.txt` / `02-client.headers`
- `03-health-1.txt` / `03-health-1.headers`
- `04-post-example-org.txt` / `04-post-example-org.headers`
- `05-get-session.txt` / `05-get-session.headers`
- `06-events-first.txt` / `06-events-first.headers`
- `07-events-replay.txt` / `07-events-replay.headers`
- `08-narrow.txt` / `08-narrow.headers`
