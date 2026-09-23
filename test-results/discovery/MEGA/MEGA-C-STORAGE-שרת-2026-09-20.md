# MEGA-C · STORAGE / HEALTH / TELEMETRY / SSE / FAULT · שרת · 2026-09-20

**STATUS:** IMPLEMENTED · Preview deploy OK · **NO PROMOTE**  
**Wave:** C 31–60 + L + M + N (non-KV complete)  
**Aligned:** `PHASE-B-BOUNDARIES-KV-SOT-ארכיטקט-2026-09-20.md`  
**Core:** `/api/lookup` **untouched** · alias `dpl_8ag…` **LOCKED**  
**Promote:** **HOLD** (KV creds missing; `promoteEligible:false`)  
**Checked:** 2026-09-20 ~07:24 Asia/Jerusalem (IDT / UTC+3)

---

## 1. Preview deploy (NO alias promote)

| Field | Value |
|-------|-------|
| Preview URL | `https://akvot-simple-demo-r96vensj6-k-akvot.vercel.app` |
| Deployment id (dpl) | `dpl_3TndxBYU4rvafTYsLA8aWU5Mfj23` |
| Target | `null` (Preview, not Production) |
| Inspector | `https://vercel.com/k-akvot/akvot-simple-demo/3TndxBYU4rvafTYsLA8aWU5Mfj23` |
| Prior Preview (superseded) | `dpl_d2N8hQczgvqpFW5S5G55uqQKFkYH` |
| Core alias Acc P0 | `dpl_8ag…` **LOCKED / untouched** |

---

## 2. Storage health API

**Route:** `GET /api/discovery/health`

Probe: **WRITE → READ → UPDATE → DELETE** against active backend (`detectStoreBackend`).

### Preview smoke (`vercel curl --deployment dpl_3Tndx…`)

```json
{
  "ok": true,
  "backend": "fs-regen",
  "storeBackend": "fs-regen",
  "latencyMs": 8,
  "correlationId": "hc-mu9baz3m-2a2995",
  "fsRegenFallback": true,
  "explicitFallback": true,
  "promoteEligible": false,
  "durable": false,
  "kvCredsPresent": false,
  "mode": "fs-regen-local",
  "steps": [
    {"step":"WRITE","ok":true},
    {"step":"READ","ok":true},
    {"step":"UPDATE","ok":true},
    {"step":"DELETE","ok":true}
  ]
}
```

Also mirrored (lighter) on `GET /api/health` → `discoveryStore.{storeBackend,explicitFallback,fsRegenFallback,promoteEligible,kvCredsPresent}`.

---

## 3. fs-regen = explicit fallback-only (BOUNDARIES KV SoT)

| Flag | fs-regen value | Meaning |
|------|----------------|---------|
| `storeBackend` | `fs-regen` | Active adapter |
| `explicitFallback` | `true` | QA cannot confuse with KV SoT |
| `fsRegenFallback` | `true` | Health/API alias |
| `promoteEligible` | `false` | Promote Gate blocked |
| `durable` | `false` | No false confidence (defect step 51 fixed) |
| `kvCredsPresent` | `false` | Env still missing |

When KV/UPSTASH env appears later, `detectStoreBackend()` flips to `vercel-kv` / `upstash` automatically — health + session responses light up without route rewrites.

`publicStoreInfo()` strips `fsDir` from all public Discovery responses (no path leak).

---

## 4. Telemetry (no secrets)

- `logStoreOp(op, {backend,latencyMs,ok,error,correlationId})` → structured `[discovery.store.telemetry]` logs
- Health returns `latencyMs` + `correlationId` + step timings
- Session create/GET/SSE/narrow carry `store` flags (`storeBackend`, `explicitFallback`, `promoteEligible`)
- Never logs tokens / REST URLs with credentials

---

## 5. SSE lifecycle (L)

| Item | Behavior |
|------|----------|
| Event order | `meta → progress → provider* → finding* → facets → status → done` |
| Reconnect | `Last-Event-ID` / `?lastEventId=` / `?cursor=` — skip `id <= last` |
| Hang policy | Finite event list; resume-past-end emits lightweight `done` |
| Error path | `error` then `done` (`failed_soft`) — stream always terminates |
| Docs | `SSE_RECONNECT_DOCS` in `api/lib/discovery/sse.js` |
| Acc | Every chunk scrubbed before write |

---

## 6. Failure injection (M) — Preview/dev only

**Gate:** `DISCOVERY_FAULT_INJECT=1` (env). Query/body `fault` / `injectFault` ignored unless gate on.

| Fault | Effect |
|-------|--------|
| `store_miss` | Force miss / health 503 |
| `provider_timeout` | Soft provider throw |
| `scrub_path` | Inject forbidden QID → Acc must strip |
| `store_latency` | Bounded artificial latency |

Preview currently: `faultInjectAvailable: false` (env not set on Vercel — correct for prod-like Preview).

---

## 7. Unit results (local)

| Suite | Result |
|-------|--------|
| `sessionStore.test.mjs` | **58 passed**, 0 failed |
| `orchestrator.test.mjs` (discovery) | **110 passed**, 0 failed |
| `adversarial.acc.test.mjs` | **36 passed**, 0 failed |
| Core `orchestrator.test.mjs` | **128 passed**, 0 failed |
| `forbiddenIdentities.test.mjs` | **39 passed**, 0 failed |

Covers: health WRITE→READ→UPDATE→DELETE, explicitFallback/fsRegenFallback, scrub on all emits, SSE Last-Event-ID resume + no-hang done, fault-inject gating, Acc adversarial.

---

## 8. Files changed (this wave)

| Path | Change |
|------|--------|
| `api/discovery/health.js` | **NEW** storage health probe route |
| `api/lib/discovery/faultInject.js` | **NEW** gated failure hooks |
| `api/lib/discovery/sessionStore.js` | explicitFallback/fsRegenFallback, telemetry, health latencyMs |
| `api/lib/discovery/orchestrator.js` | publicStoreInfo, fault wiring, flags on emit |
| `api/lib/discovery/sse.js` | reconnect docs, terminal done/error harden |
| `api/discovery/sessions/index.js` | store flags + fault/correlation pass-through |
| `api/discovery/sessions/[id]/index.js` | publicStoreInfo + fault |
| `api/discovery/sessions/[id]/events.js` | SSE headers + terminal harden + fault |
| `api/discovery/sessions/[id]/narrow.js` | publicStoreInfo |
| `api/health.js` | discoveryStore explicit flags |
| `api/lib/discovery/index.js` | exports |
| `vercel.json` | `api/discovery/health.js` maxDuration |
| `api/lib/discovery/sessionStore.test.mjs` | MEGA C units |
| `api/lib/discovery/orchestrator.test.mjs` | fallback/SSE/scrub/fault units |

**NOT touched:** `api/lookup.js`, Core alias promote, inventing KV secrets.

---

## 9. Blockers

| Blocker | Owner | Impact |
|---------|-------|--------|
| **KV credentials MISSING** (`KV_REST_API_*` / `UPSTASH_REDIS_REST_*`) | Nachman/Chief | `storeBackend=fs-regen`; `promoteEligible=false`; storage promote Gate HOLD |
| Promote | Chief GO required | HOLD until KV live + Acc/QA Evidence GREEN |

**Non-blocked:** health probe, telemetry, explicit fallback flags, SSE lifecycle, fault hooks (code), units, Preview Evidence — all GREEN on fs-regen.

---

## 10. Success criteria checklist

- [x] Health endpoint proves WRITE→READ→UPDATE→DELETE on active backend
- [x] Responses mark `promoteEligible:false` when backend is fs-regen
- [x] Discovery units + core orch + forbidden still green
- [x] Preview URL+dpl reported
- [x] Core `/api/lookup` untouched
- [x] KV still documented blocked; fs-regen explicit fallback

**Pointer JSON:** `MEGA-C-STORAGE-health.json` (same folder).

**Decision:** Preview-only · HOLD promote · continue when KV env provisioned (`detectStoreBackend` auto-switch).
