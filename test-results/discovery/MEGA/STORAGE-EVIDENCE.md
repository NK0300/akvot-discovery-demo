# STORAGE-EVIDENCE — Discovery sessionStore
**Date:** 2026-09-20 ~07:22 IDT  
**Module:** `api/lib/discovery/sessionStore.js` (+ `store.js` normalize/rank)  
**Promote:** **NO** · KV credentials **BLOCKED**

## 1. Backend selection

| Priority | Env present | backend | durable | fallback | promoteEligible |
|----------|-------------|---------|---------|----------|-----------------|
| 1 | `KV_REST_API_URL` + `KV_REST_API_TOKEN` | `vercel-kv` | true | false | true |
| 2 | `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | `upstash` | true | false | true |
| 3 | else (CURRENT) | `fs-regen` | **false** | **true** | **false** |

**Current box / Vercel:** only `GOOGLE_GENERATIVE_AI_API_KEY` → `storeBackend=fs-regen`.

## 2. HIGH-VALUE FIX (step 51)

**Bug:** `getStoreInfo()` set `durable: backend !== 'memory'`. Backends are only `vercel-kv|upstash|fs-regen`, so **fs-regen reported `durable:true`** (false confidence for QA/promote).

**Fix:**
```js
durable: backend === 'vercel-kv' || backend === 'upstash'
fallback: backend === 'fs-regen'
promoteEligible: durable === true
storeBackend: backend  // explicit telemetry alias
explicitFallback: fallback
kvCredsPresent: boolean (never secrets)
```

## 3. Health: WRITE → READ → UPDATE → DELETE

`healthCheck({ correlationId })` exercises the active backend:

1. WRITE probe session  
2. READ + correlationId match  
3. UPDATE version bump persist  
4. DELETE + confirm missing  

**Local result (2026-09-20 IDT):** `ok=true`, steps all true, `mode=fs-regen-local`, `promoteEligible=false`.  
Live Redis path **skipped** when env absent (documented; tests do not invent creds).

## 4. TTL / missing / malformed / correlation

| Case | Behavior |
|------|----------|
| TTL | `TTL_MS=3600000` (1h); fs payload `_expiresAt`; KV `EX` seconds |
| Missing key | `get` → `null` |
| Malformed ds1 id | `decodeSessionId` → `null` |
| Malformed JSON file | `fsGet` catch → `null` |
| correlationId | health + delete + regen telemetry; never logs tokens |
| Version conflict | `conditionalSet` → 409 |

## 5. fs-regen fallback telemetry (never silent)

On GET miss + seed-decodable id:
- `_regenerated=true`, `_regenReason='fs-miss-seed-decode'`
- `_storeInfo.fallback=true`, `durable=false`, `promoteEligible=false`
- `console.info('[discovery.store] fs-regen fallback', { storeBackend, … })`
- Structured `[discovery.store.telemetry]` on health/ops (no secrets)

## 6. Secrets policy

- No tokens/URLs-with-creds in logs or `getStoreInfo()`  
- `kvCredsPresent` is boolean only  
- Client health exposes `discoveryStore` without `fsDir`

## 7. Tests

| Suite | Result |
|-------|--------|
| `api/lib/discovery/sessionStore.test.mjs` | **35 passed**, 0 failed |
| Discovery orch (incl. durable assertions + health) | **91 passed**, 0 failed |
| Live Redis | **SKIPPED** — env absent (BLOCKER) |

## 8. BLOCKER for storage-GREEN / promote

**KV/UPSTASH credentials missing on Vercel.**  
Until creds exist + health GREEN on shared KV + Acc P0 gates: **`promoteEligible=false` · ready for next promote = NO**.
