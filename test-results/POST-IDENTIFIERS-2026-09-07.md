# POST-for-identifiers + CORS Allow-Methods — 2026-09-07

**Status:** code ready locally; **NOT deployed** (CoS merges/deploys).

## Goal
Stop putting phone/email in GET query strings. Client POSTs JSON when identifiers are present; name-only can stay GET. Server accepts GET+POST with CORS `Allow-Methods` updated in one coordinated change.

## Server (`api/lookup.js`)

1. **`setCors` / 405:** `Access-Control-Allow-Methods` and `Allow` → `GET, POST, OPTIONS`. OPTIONS still 204. Origin allowlist, rate-limit, and `x-akvot-token` unchanged.
2. **Handler:** accepts `GET` and `POST` only.
3. **`readJsonBody(req)`:** uses `req.body` when Vercel already parsed (object / string / Buffer); otherwise reads raw request stream (64KB cap) and `JSON.parse`s. Fields used: `q`, `city`, `org`, `role`, `context`, `phone`, `email`, `focus`, `stream`, `nocache`.
4. **`pickContextFrom(input)` + `pickContext(req, body)`:**
   - GET → params from `req.query` (phone/email in query still accepted for back-compat).
   - POST → body merged over query for non-sensitive fields; **phone/email only from POST body** (not query).
5. **Streaming:** `stream:1` / `nocache` read from body (with query fallback via `paramFrom`) on POST; same `progressWriter` / SSE path.
6. **`clientIp`:** prefers `x-vercel-forwarded-for` when present, then XFF / `x-real-ip` / socket.

`node --check api/lookup.js` — pass.

## Client (`index.html`)

1. Lookup fetch: if `ctx.phone` or `ctx.email` → **`POST /api/lookup`** with JSON body `{ q, stream:1, city?, org?, role?, context?, phone?, email?, focus? }` and `Content-Type: application/json`. Phone/email never go in the URL.
2. Name-only (no phone/email) → **GET** `?stream=1&q=...` plus non-sensitive ctx via `ctxQuery(ctx, {omitIds:true})`.
3. AbortController + SSE reader path unchanged for both methods.
4. `ctxQuery` gained `omitIds` so identifiers are not appended on GET paths that use it after this change.

## Deploy
**Not run.** No `vercel --prod`. Files left for Chief of Staff to merge/deploy.

## How client chooses GET vs POST
- **POST** when `ctx.phone` or `ctx.email` is set.
- **GET** when neither identifier is present (name / non-sensitive context only).
