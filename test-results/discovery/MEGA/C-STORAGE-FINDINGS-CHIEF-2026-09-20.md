# C — Storage findings (Chief interim) · 2026-09-20

## Env / credentials
- Vercel project: `akvot-simple-demo` (`prj_Xm61SjyuvgYXDf7Vs0IxBXbDI5V5`)
- Known: no `KV_REST_API_*` / `UPSTASH_REDIS_REST_*` on project (Gemini only) → backend resolves to **`fs-regen`**
- **BLOCKER for promote / storage-GREEN**

## Adapter (`api/lib/discovery/sessionStore.js`)
- Selection order: vercel-kv → upstash → fs-regen ✓
- fs-regen: `/tmp` + seed-encoded `ds1.*` session ids + regenerate-on-miss
- Acc scrub expected on regenerate path (verify in Wave C tests)

## DEFECT (step 51) — false confidence
`getStoreInfo().durable` is `backend !== 'memory'`.
There is no `memory` backend → **fs-regen reports `durable: true`**.
This violates "fallback must not create false confidence."

**Required fix:**
```js
durable: backend === 'vercel-kv' || backend === 'upstash',
fallback: backend === 'fs-regen',
promoteEligible: backend === 'vercel-kv' || backend === 'upstash',
```

## Routes
- POST/GET `api/discovery/sessions`
- SSE `api/discovery/sessions/[id]/events`
- narrow `api/discovery/sessions/[id]/narrow`

## Promote policy
HOLD until: KV creds live + promoteEligible=true + Acc/QA/SSE evidence GREEN + Chief GO.
