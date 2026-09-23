# Discovery Evolution CYCLE1 Phase2 — UX/SSE/Narrow Observation

**Observer:** ממשק  
**Observed:** 2026-09-20 09:48 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** observation only; no code changes, deploys, alias changes, or promote actions  
**B0:** `https://akvot-discovery.vercel.app` → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core:** locked; not touched (`dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`)

## Phase1 baseline read

Phase1 evidence was present and PASS. Its baseline recorded durable shared KV (`storeBackend=upstash`, `durable=true`, `promoteEligible=true`, `kvReachable=true`), a complete `example.org` session with three findings, and an 11-frame SSE sequence ending in `done`. Phase2 uses the same B0 alias and confirms the same observable result shape.

## Live measure-only probe

| Probe | Observation |
|---|---|
| `GET /api/discovery/health` | `ok=true`; `storeBackend=upstash`; `durable=true`; `durabilityState=durable-kv`; `kvReachable=true`; `promoteEligible=true`; health latency `113 ms` |
| `POST /api/discovery/sessions` with `{"seed":"example.org"}` | `201`-equivalent successful JSON; session `kv1.9c4d61492aeb8ee222ef4e9142c09d97`; `status=complete`; three findings |
| `GET /api/discovery/sessions/:id` | Complete snapshot; three findings; same three IDs/titles/providers as Phase1 |
| SSE `/events` | 11 frames: `meta`, `progress`, 3×`provider`, 3×`finding`, `facets`, `status`, `done`; cursor/ID 1–11; `findingCount=3`; `forbiddenStripped=0` |
| SSE replay with `Last-Event-ID: 5` | Returned IDs 6–11 only, ending in `done`; replay boundary is useful and exact |
| `POST /narrow` with provider `wikidata` | Derived response: `beforeCount=3`, `afterCount=2`; two Wikidata findings and recomputed provider/kind facets |
| GET after narrow | Still returns the unfiltered three-finding snapshot |

Raw evidence is in `raw/live-health.json`, `raw/live-get-example.org.json`, `raw/live-sse-example.org.txt`, `raw/live-sse-replay-after-5.txt`, `raw/live-narrow-wikidata.json`, and `raw/live-get-after-narrow-example.org.json`.

## Quality notes

### Perceived progressive completeness

The frame sequence exposes meaningful milestones: session metadata/store state, progress, provider states, each finding with evidence, facets, terminal status, and `done`. That is a coherent progressive contract. This probe is API-level and the session was already `complete` at POST time, so it does not measure human-perceived timing, loading animation quality, or whether the browser renders intermediate frames distinctly.

### SSE frame usefulness / replay

Frames are individually useful rather than heartbeat-only: findings include evidence and provider data; facets arrive after findings; `status` and `done` make terminal state explicit. `Last-Event-ID: 5` replayed exactly frames 6–11, including the terminal frame. Replay behavior is therefore observable PASS for this session. A future UI check should still verify reconnect handling and duplicate suppression in the browser.

### Narrow UX contract vs GET — O1 soft-known

Narrowing Wikidata reduced the derived response from 3 to 2 findings and recomputed facets, while the subsequent GET remained the original 3 findings. **O1 note:** narrow is an ephemeral/derived view operation, not an apparent mutation of the durable session. The UI contract should make this clear: a refresh or GET restores the full result, and the narrowed response must not be represented as a persisted session rewrite. This is a soft-known contract, not a failure.

### HIT consistency

HIT consistency is strong for this probe: POST snapshot, GET, SSE finding frames, and GET-after all agree on the same three finding IDs (`wd-Q306656`, `wd-Q908643`, `wp-en-Example_org`) and provider/evidence mapping. Narrow is an exact subset (the two Wikidata findings). Phase1 and Phase2 show the same `example.org` result shape. No forbidden identity was present; SSE reported `forbiddenStripped=0`.

### No identity chrome

Observed payloads present discovery findings, evidence, providers, facets, scores, and a soft candidate display hint for the seed; they do not present an asserted resolved identity or identity-selection chrome. The response carries the forbidden-identities version and remains discovery-shaped. This is appropriate for B0 discovery observation.

## Blind spots for Source / Strategy phases (for Arch)

- No browser-level visual observation was performed; progressive paint, skeletons, focus order, keyboard behavior, and screen-reader announcements remain unmeasured.
- No direct Source view contract was exercised beyond provider/evidence fields; provenance quality, source freshness display, link behavior, quote truncation, and source-level error UX remain open.
- No Strategy view contract was exercised; ranking rationale is present in data, but user comprehension of ranking, ambiguity, confidence, and next-action guidance remains open.
- No empty, partial-provider, timeout, cancellation, retry, pagination, or multi-session concurrency UX was measured in this observation.
- Narrow replay/refresh semantics are now evidenced for O1, but persistence expectations for selected filters and browser back/forward behavior need explicit product treatment.

## Result

**PASS observation.** Evidence-only observation completed on B0. **HOLD promote.** No code, deploy, alias, or promote action performed.
