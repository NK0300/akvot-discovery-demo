# MEGA-M · KV Preview verification · ממשק · 2026-09-20

**Overall: PARTIAL. Promote: HOLD. Deploy: not run. Core: untouched.**

- **Preview:** `https://akvot-simple-demo-ndmmkolpg-k-akvot.vercel.app`
- **Deployment:** `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv`
- **Verified:** 2026-09-20 07:34–07:37 IDT (Asia/Jerusalem)
- **Network method:** protected Vercel CLI `vercel curl` only.
- **Raw evidence:** `test-results/discovery/MEGA/raw/kv-preview-2026-09-20-0734/`

## Checks

| # | Check | Result | Evidence / observation |
|---|---|---|---|
| 1 | `GET /` discovery UX | **FAIL** | HTTP 200. `tab-discovery`, `מצב גילוי`, and `INFORMATION ≠ IDENTITY` are present. The Discovery banner still contains the literal prohibited phrase `«זה האדם»` (root line 522), so the complete check fails. |
| 2 | `GET /discovery-ui.js` MEGA-M symbols | **PASS** | HTTP 200, 55,458 bytes. `hydrateSession`, `reconnecting`, `EventSource`, `/narrow`, and `/events` are all present. Preview client matches local MEGA-M; no client lag observed. |
| 3 | `GET /api/discovery/health` | **FAIL / timeout** | Two GET attempts ended in `FUNCTION_INVOCATION_TIMEOUT`; no health JSON returned. Session-create responses report `storeBackend=upstash`, `durable=true`, `promoteEligible=true`, `fallback=false`. |
| 4 | POST string seed `example.org` | **PASS** | HTTP 201, `ok=true`, `sessionId=kv1.ceeb19ff749a1063c6633ad72d8204e5`, `seed=example.org`, terminal `status=complete`; no `[object Object]`. Response snapshot had 2 findings and facets. |
| 5 | GET session | **FAIL** | GET returned HTTP 404 `session not found` for the created KV session. 404 telemetry still reports Upstash/durable/promote-eligible; no `regenerated` result. |
| 6 | First `/events` SSE | **FAIL** | `--max-time 6` returned no bytes and timed out; no `text/event-stream` headers/frames were observed. |
| 7 | Replay `/events` | **FAIL** | Second `--max-time 6` request likewise returned no bytes and timed out; replay-from-complete not verified. It was not a 404, but no stream was delivered. |
| 8 | POST `/narrow` with `{"filters":{"kind":["registry"]}}` | **FAIL** | HTTP 404 `session not found`; server recompute not reached. |
| 9 | Optional second seed `Alex Morgan` | **PASS (smoke)** | HTTP 201, string seed accepted, `sessionId=kv1.d7b16efa080f93b1c35af77c96f37f88`, snapshot contained findings/facets, store metadata Upstash/durable/promoteEligible=true. |

## Storage/client conclusion

The Preview advertises **`storeBackend=upstash`**, **durable=true**, and **promoteEligible=true** in session-create and 404 telemetry. However, the dedicated health probe timed out, and created sessions were not readable by GET/narrow; SSE consequently produced no stream. Treat KV persistence/health as unresolved, not green.

The latest Preview `discovery-ui.js` **does contain MEGA-M** reconnect/hydration symbols and is the same 55,458-byte client as local; it does **not** lag local MEGA-M.

**HOLD promote. No deployment or promotion was attempted.**

## Raw files

- `root-include.txt`, `root.txt`
- `client-include.txt`, `discovery-ui.js`
- `health.txt`, `health-retry.txt`
- `create-session.txt`, `get-session.txt`, `get-session-by-dpl.txt`
- `events-first.txt`, `events-replay.txt`, `events-by-dpl.txt`
- `narrow.txt`
- `create-session-alex.txt`
