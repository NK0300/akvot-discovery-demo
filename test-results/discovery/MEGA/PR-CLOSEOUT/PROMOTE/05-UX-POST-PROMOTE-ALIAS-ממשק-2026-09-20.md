# UX post-promote alias verification — ממשק — 2026-09-20

- **Checked:** 2026-09-20 09:06 IDT (Asia/Jerusalem, UTC+3)
- **Mode:** verify-only; `vercel curl`; no promote/rollback/alias mutation
- **Discovery deployment:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`
- **Aliases checked:** `https://akvot-discovery.vercel.app`, `https://akvot-discovery-k-akvot.vercel.app`
- **Core:** not touched; no Core request or mutation issued
- **Overall:** **PARTIAL** — lifecycle and durable KV checks pass; O1 remains open

## Checks

| Check | Result | Evidence |
|---|---|---|
| `GET /` primary | **PASS** — HTTP 200; HTML contains `מצב גילוי` and Discovery banner | `raw/05-ux-post-promote-root-primary.txt` |
| `GET /` secondary | **PASS** — HTTP 200; same Discovery chrome | `raw/05-ux-post-promote-root-secondary.txt` |
| `/api/health` | **PASS** on both aliases; `ok=true`, build=`dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | `raw/05-ux-post-promote-api-health-primary.txt`, `raw/05-ux-post-promote-api-health-secondary.txt` |
| `/api/discovery/health` | **PASS** on both; HTTP 200, `storeBackend=upstash`, `durable=true`, `promoteEligible=true`, `kvReachable=true`, `durabilityState=durable-kv`, WRUD all true | `raw/05-ux-post-promote-discovery-health-primary.txt`, `raw/05-ux-post-promote-discovery-health-secondary.txt` |
| POST session `{ "seed": "example.org" }` | **PASS** — HTTP 201; session=`kv1.d5303cf7d2861d50b59bcdac341376ab`; store Upstash/shared-KV durable | live response; correlation=`ux-post-promote-alias-2026-09-20` |
| GET session | **PASS** — HTTP 200, same session ID, 3 findings, durable Upstash store | `raw/05-ux-post-promote-get1.txt`; cross-alias GET also 200: `raw/05-ux-post-promote-get1-cross-alias.txt` |
| GET events (SSE) | **PASS** — `text/event-stream`; ordered ids 1–11; `meta`, `progress`, 3×`provider`, 3×`finding`, `facets`, `status`, `done`; `done` present; forbidden-leak count 0 | `raw/05-ux-post-promote-events.txt` |
| POST narrow | **PASS** — HTTP 200; filter `provider=wikipedia`; findings 3→1; `narrow.applied` and `version=3`; leak 0 | `raw/05-ux-post-promote-narrow.txt` |
| GET after narrow | **PARTIAL / O1** — HTTP 200 but returns 3 findings rather than narrow response’s 1 | `raw/05-ux-post-promote-get-after-narrow.txt` |
| HIT: second GET same session | **PASS** for 200/same-session durable re-read; 3 findings, leak 0. Vercel header is `x-vercel-cache: MISS` because endpoint is `Cache-Control: no-store`; this is not claimed as CDN HIT. | `raw/05-ux-post-promote-get-hit.txt` |

## O1

**O1 remains OPEN (soft residual): narrow → GET/SSE projection.** The narrow response correctly returns 1 Wikipedia finding (`beforeCount=3`, `afterCount=1`), but the subsequent GET returns the original 3 findings. Mismatch: `GET findings (3) - narrow findings (1) = 2`. This reproduces the known server/orchestrator projection issue; same-session narrow response itself is correct.

## Decision / hold

**PARTIAL. Hold further promote.** Do not run another promote or alias mutation. Discovery aliases remain on `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`; Core remains untouched and locked by instruction.

## Raw evidence

All fresh lifecycle artifacts are under:

`/workspace/akvot-quick-demo/test-results/discovery/MEGA/PR-CLOSEOUT/PROMOTE/raw/`
