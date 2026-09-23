# MEGA-M · CANONICAL hotfix Preview verification · ממשק · 2026-09-20

**Overall: PASS. Promote: HOLD. Deploy: not run. Core: untouched.**

- **Canonical Preview:** `https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app`
- **Deployment:** `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2`
- **Checked:** 2026-09-20 07:52 IDT (Asia/Jerusalem)
- **Network method:** protected Vercel CLI `vercel curl` only; no direct curl.
- **Raw evidence:** `test-results/discovery/MEGA/raw/canonical-9PkJ-verify-2026-09-20-0751/`
- **Gate note:** This canonical hotfix verification supersedes `dpl_CAVh` for the formal gate. The prior CAVH result remains historical evidence only.

## Acceptance checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | `GET /` discovery UX | **PASS** | HTTP 200; `tab-discovery`, `מצב גילוי`, and `INFORMATION ≠ IDENTITY` present. The literal `«זה האדם»` is inside a banner that explicitly negates it (`אין ... «זה האדם»`), so it does not fail the discovery-chrome bar. |
| 2 | `GET /discovery-ui.js` MEGA-M symbols | **PASS** | HTTP 200; response body 55,458 bytes; `hydrateSession`, `reconnecting`, `EventSource`, `events`, and `narrow` present. |
| 3 | `GET /api/discovery/health` | **PASS** | First attempt HTTP 200; `ok=true`, `storeBackend=upstash`, `durable=true`, `promoteEligible=true`, `fallback=false`, `mode=kv-shared`; WRITE/READ/UPDATE/DELETE all true. Reported health latency 117 ms. No retry needed. |
| 4 | POST string seed `example.org` | **PASS** | HTTP 201; `sessionId=kv1.5270f6fc11bf32720f89d10709c32057`; `status=complete`; snapshot contains 3 findings and shared-Upstash/durable metadata. |
| 5 | GET same session | **PASS** | HTTP 200, not 404; same session and `example.org` returned with `status=complete` and 3 findings. **POST→GET durable persistence confirmed.** |
| 6 | First `/events` SSE (`--max-time 8`) | **PASS** | HTTP 200; `text/event-stream; charset=utf-8`; 11 frames: `meta`, `progress`, 3×`provider`, 3×`finding`, `facets`, `status`, `done`. |
| 7 | Replay `/events` | **PASS** | HTTP 200; same event-stream content type and 11 replay frames; replay is non-empty. |
| 8 | POST `/narrow` | **PASS** | `{filters:{kind:["registry"]}}` → HTTP 200; `beforeCount=3`, `afterCount=2`, `status=complete`, version 3. |

## Conclusion

The canonical hotfix Preview passes the requested Discovery SSE/narrow bar: health is green, POST→GET is durable, first and replay SSE both emit frames, and narrow returns 200 with the expected 3→2 reduction. **HOLD promote** as instructed; no deployment or promotion was attempted.

## Raw files

- `01-root.txt`
- `02-client.txt`
- `03-health-1.txt`
- `04-post-example-org.txt`
- `05-get-session.txt`
- `06-events-first.txt`
- `07-events-replay.txt`
- `08-narrow.txt`
