# Phase B UX Harden · Discovery Mode Preview Verify · ממשק · 2026-09-20

**Run time:** 2026-09-20 04:09 IDT (UTC+3)
**Preview:** `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app`
**Deployment:** `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB`
**Method:** `vercel curl` only; no deploy and no promote

**OVERALL: FAIL** — the exact requested object seed is accepted with `201/ok:true`, but is coerced to `"[object Object]"`; the session is therefore not domain-seeded as requested. All other live UX/API transport checks passed.

## Checks

| # | Check | Result | Live evidence |
|---:|---|:---:|---|
| 1 | `GET /` contains `tab-discovery`, «מצב גילוי», and `INFORMATION ≠ IDENTITY`; Discovery banner has no «זה האדם» | **PASS** | `root.txt` lines 533–541; Discovery banner is `מצב גילוי … INFORMATION ≠ IDENTITY … אין … «זה האדם»`.
| 2 | `GET /discovery-ui.js` contains EventSource, `/events`, and `narrow` | **PASS** | `discovery-ui.js.txt` lines 103–104, 342–358, 693–724; `200`, JavaScript content type.
| 3 | `GET /discovery-fixtures/index.json` has ≥3 fixture ids | **PASS** | `fixtures-index.txt` lines 27–34; 3 ids: `seed-person-he`, `seed-person-latin`, `seed-domain-org`.
| 4 | POST session with `{"seed":{"raw":"example.org","kind":"domain"}}` returns ok + sessionId + scrubbed snapshot | **FAIL** | `session-create.txt` lines 4 and 24: `201`, `ok:true`, sessionId and snapshot exist, but snapshot `seed`, `q`, and `displayHint` are `"[object Object]"`; object seed/kind were not preserved.
| 5 | `GET /api/discovery/sessions/:id` exposes findings/facets and regeneration/store if present | **PASS** | `session-get.txt` lines 4 and 24: `200`, findings (8), facets, `regenerated:true`, `store.backend:fs-regen`, durable/cross-instance note.
| 6 | POST `/narrow` with `kind=registry` server-recomputes | **PASS** | `narrow.txt` lines 4 and 24: `200`, `narrow.applied.kind=[registry]`, `beforeCount:8`, `afterCount:8`, `version:3`.
| 7 | GET `/events` with max-time 6 returns progressive SSE | **PASS** | `events.txt` lines 4–5: `200`; line 12 `content-type: text/event-stream; charset=utf-8`; lines 24–83 show meta, progress, provider, finding, facets, status, done events.
| 8 | Entity soft CTA remains in index while Discovery has no identity chrome | **PASS** | `root.txt` line 541 has Discovery information-only banner; line 1053 has Entity CTA `בחר כמועמד להמשך`; no identity CTA in Discovery banner.

## Blocker

- **Seed contract mismatch:** the requested object form is stringified server-side to `"[object Object]"`. This causes generic-domain evidence to become OpenLibrary/Object results rather than domain-seeded results. The endpoint is reachable and returns a durable/regenerable session, but check 4 is not UX-safe as requested.

## Locks

- **NO promote:** no promote/alias action executed.
- **No deploy:** no deployment action executed.
- **Core untouched:** only Preview root/static Discovery assets and `/api/discovery/*` routes were read/written; no Core `/api/lookup` call or change.
- **Entity-Agnostic:** Discovery banner and findings remain INFORMATION ≠ IDENTITY; no identity conclusion was introduced.

## Evidence

Raw `vercel curl` captures: `test-results/discovery/PHASE-B-HARDEN-raw/` (`root.txt`, `discovery-ui.js.txt`, `fixtures-index.txt`, `session-create.txt`, `session-get.txt`, `narrow.txt`, `events.txt`).

## Addendum — string seed (UI contract) recheck

Server handler docs: `body: { seed: string, hints?, locale? }`. Live UX (`discovery-ui.js`) posts `{ seed: q, q, locale }` with **string** `q` from the Seed field.

Retest POST with `{"seed":"example.org","q":"example.org","locale":"he"}`:
- ok=True · status=complete · findings=2
- seed='example.org' · q='example.org'
- `[object Object]` present: False

**Clarification:** Check 4 FAIL was against Pack-shaped object seed, not the live UI string contract. UX chrome + SSE + narrow remain **PASS**. Soft: Server should soft-reject/coerce object seeds without String(obj) — tracked for @שרת, not UX chrome blocker.

**UX verdict for Chief:** chrome/SSE/narrow/fixtures **PASS** · seed-object SoT soft gap → Server · **NO promote**.
