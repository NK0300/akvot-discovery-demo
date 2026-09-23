# ARCHITECTURE-MAP — PROJECT A (akvot / עקבות)
**Generated:** 2026-09-20 ~07:25 IDT  
**Checkout:** `/workspace/akvot-quick-demo`  
**Promote:** **NO** · Prod Acc P0 alias LOCKED · KV credentials BLOCKED

## 1. Layer map

| Layer | Entry / modules | Notes |
|-------|-----------------|-------|
| Core lookup | `api/lookup.js`, `api/lib/orchestrator.js`, `forbiddenIdentities.js` | Acc P0 LOCKED this run |
| Core health | `api/health.js` | Additive `discoveryStore` telemetry only |
| Discovery routes | `api/discovery/sessions/**` | POST / GET / SSE / narrow |
| Discovery libs | `api/lib/discovery/*` | orchestrator, providers, emit, sse, narrow, store, sessionStore |
| UI | `index.html`, `discovery-ui.js` | No secrets |
| Config | `vercel.json`, `.env.local` (Gemini only) | No KV/UPSTASH |

## 2. Storage selection (CRITICAL)

```
KV_REST_* → vercel-kv (durable=true, promoteEligible=true)
UPSTASH_* → upstash   (durable=true, promoteEligible=true)
else      → fs-regen  (durable=false, fallback=true, promoteEligible=false)  ← CURRENT
```

**Fix 2026-09-20 (step 51):** `getStoreInfo().durable` was `backend !== 'memory'` → fs-regen falsely reported durable.  
Now: `durable = backend === 'vercel-kv' || backend === 'upstash'`; expose `fallback`, `promoteEligible`, `storeBackend`.

## 3. Discovery pipeline (S0–S10)

POST create → soft ER → providers (wikidata, openlibrary) → normalize (https cite-or-drop) → dedupe by evidence fingerprint → graph stub → **explainable rank** (authority/corroboration/directness; `scoreIdentity=null`) → **contradiction surfacing** → Acc scrub → persist.

GET miss on fs-regen → decode seed from `ds1.*` id → regenerate with explicit telemetry (`_regenerated`, `_regenReason`, `fallback:true`).

## 4. Acc scrub surfaces

ALL emit paths: POST snapshot, GET, SSE chunks (`scrubFindingChunk` / `scrubFacetsChunk`), narrow, inject, regen. Forbidden QID SoT: `FORBIDDEN_IDENTITY_QIDS` includes **Q1701775**.

## 5. Hidden fallbacks / silent catches (inventory)

| Location | Behavior | Risk |
|----------|----------|------|
| ~~getStoreInfo durable~~ | ~~fs-regen durable:true~~ | **FIXED** |
| maybeRegenerate | GET miss → re-run pipeline | Now explicit telemetry |
| kv get/set catch | warn, continue | Soft degrade; healthCheck detects |
| provider search catch | soft error batch | Intended |
| decodeSessionId catch | null | Intended |

## 6. Config drift

- `baselineHint` in health still references older dpl — documentary only; **no alias promote**.
- KV env missing on Vercel → **BLOCKER** for storage-GREEN / promote.

## 7. Machine-readable

See `ARCHITECTURE-MAP.json` alongside this file.
