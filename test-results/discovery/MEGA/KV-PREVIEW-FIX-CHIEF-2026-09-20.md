# KV-PREVIEW-FIX · Chief · 2026-09-20

**OVERALL:** **PASS** · **PROMOTE HOLD** (no `vercel --prod` / no alias promote)  
**Checked:** 2026-09-20T07:50:03+03:00 Asia/Jerusalem (IDT / UTC+3)  
**Preview:** `https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app` · `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2`  
**Repo:** `/workspace/akvot-quick-demo`  
**Access:** `vercel curl --deployment dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2 --scope k-akvot`

Fail reasons closed: `storage_crud`, `acc_scrub`

---

## Gate summary

| # | Gate | Verdict | Notes |
|---|------|---------|-------|
| 1 | `GET /api/health` flags | **PASS** | storeBackend=upstash · durable=true · promoteEligible=true · build match |
| 2 | Storage CRUD (shared-kv) | **PASS** | `/api/discovery/health` WRUD GREEN · POST session + GET same id **200** · regenerated≠true |
| 3 | Acc scrub ≥ Smith seed | **PASS** | Smith+IBM/NY/US · **leak Q1701775=0** incl. `contradictions[].findingIds` · forbiddenStripped≥1 |
| 4 | Core alias identity-p0 | **PASS** | `akvot-simple-demo.vercel.app` · 5/5 · pw=0 · leakage=0 · untouched |

---

## Before → After

| Item | BEFORE (KV-PREVIEW-VERIFY FAIL) | AFTER (this fix) |
|------|----------------------------------|------------------|
| Preview dpl | `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv` | `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` |
| Upstash REST from Preview | `kv set/get failed: fetch failed` | WRUD ok · latencyMs≈119 |
| Session POST→GET | GET **404** (memory-only write) | GET **200** · same `sessionId` · durable |
| Acc Smith | `wd-Q1701775` in `contradictions[].findingIds` | **no Q1701775** anywhere in POST/GET JSON |
| Env Preview TOKEN | Missing / stale after Claim window | Re-applied URL+TOKEN (Preview/Production/Development) |

---

## A — Storage

### Root cause
1. Preview `UPSTASH_REDIS_REST_TOKEN` was absent/stale while health could still report creds present from partial env / prior deploy.
2. REST client needed hardening: trim/quote-strip creds, body-style Redis command POST (Upstash SoT), timeout+one retry, IPv4-first DNS.
3. Durable `set` previously swallowed KV errors and kept in-process memory → false POST success + cross-instance GET 404.

### Creds (no secrets printed)
- DB id: `4c3b3c0b-c797-4203-8c42-dc464866876d` (akvot-discovery)
- Host: `causal-oriole-287287.upstash.io` (REST base; token redacted)
- Claim console (human): `https://upstash.com/start-redis/console/4c3b3c0b-c797-4203-8c42-dc464866876d`
- Env names: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` on Preview + Production + Development
- Local box probe (agent): SET/GET/DEL via body-style POST → HTTP 200 before redeploy

### Code
- `api/lib/discovery/sessionStore.js` — `normalizeKvCreds`, `redisCommand` (body POST + retry), fail-loud durable `set` (503 / clear memory on KV failure)
- No `--prod` / no alias promote

### Proof — `/api/health`
```json
{
  "ok": true,
  "phase": "orchestrator-v0-b",
  "build": "dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2",
  "baselineHint": "dpl_DNfPZ9",
  "discoveryStore": {
    "storeBackend": "upstash",
    "durable": true,
    "fallback": false,
    "explicitFallback": false,
    "fsRegenFallback": false,
    "promoteEligible": true,
    "kvCredsPresent": true,
    "crossInstance": "shared-kv"
  }
}
```

### Proof — `/api/discovery/health` (WRUD)
```json
{
  "ok": true,
  "backend": "upstash",
  "storeBackend": "upstash",
  "latencyMs": 119,
  "correlationId": "hc-mu9c6dpq-43e277",
  "fsRegenFallback": false,
  "explicitFallback": false,
  "promoteEligible": true,
  "durable": true,
  "fallback": false,
  "kvCredsPresent": true,
  "mode": "kv-shared",
  "steps": [
    {
      "step": "WRITE",
      "ok": true,
      "ms": 37
    },
    {
      "step": "READ",
      "ok": true,
      "ms": 37
    },
    {
      "step": "UPDATE",
      "ok": true,
      "ms": 69
    },
    {
      "step": "DELETE",
      "ok": true,
      "ms": 119
    }
  ],
  "ttlMs": 3600000,
  "faultInjectAvailable": false
}
```

### Proof — session CRUD
| Step | Result |
|------|--------|
| POST `/api/discovery/sessions` John Smith + IBM/NY/US | **201** · `sessionId=kv1.e765dd338954a3fc801362ee1d169c0a` · storeBackend=upstash · durable=True |
| GET `/api/discovery/sessions/{id}` | **200** · same id · durable=True · regenerated=None |

Raw: `test-results/discovery/MEGA/raw/kv-preview-fix/smith-post.json`, `smith-get.json`, `disc-health.json`, `health.json`

---

## B — Acc scrub

### Gap
Findings/graph were scrubbed, but `snapshot.contradictions[].findingIds` could still carry forbidden ids (ACC-DISC-06).

### Fix
- `api/lib/discovery/emit.js` — `scrubContradiction` filters `findingIds` to survivors + drops forbidden QID tokens; `deepStripForbidden` final nested sweep on leftover surfaces
- Unit: `adversarial.acc.test.mjs` **B23** — contradictions[].findingIds with `Q1701775` / `wd-Q1701775` scrubbed/dropped
- Core lookup / Acc P0 alias behavior **untouched** (identity-p0 5/5 still green)

### Proof — Smith Preview
| Check | Result |
|-------|--------|
| POST leak `Q1701775` | **False** |
| GET leak `Q1701775` | **False** |
| contradiction findingIds contain forbidden | **False** |
| `forbiddenStripped` | 1 |
| `forbiddenIdentitiesVersion` | 2026-09-19.1 |
| findings count | 21 |
| dossier/faces | absent on Discovery emit |

Sample contradiction findingIds (post-scrub): `['wd-Q3182477', 'wd-Q332377', 'wd-Q6258357', 'wd-Q6258267', 'wd-Q6258259', 'wd-Q541460', 'wd-Q991529', 'ol-OL177707A', 'ol-OL12988612A', 'ol-OL2642558A', 'ol-OL2404636A', 'ol-OL15752758A']`

---

## C — Tests

| Suite | Result |
|-------|--------|
| `node api/lib/discovery/adversarial.acc.test.mjs` | passed=46 failed=0 (incl. B23) |
| `npm test` (full) | **exit 0** · includes discovery + Acc + failureInject + **identity-p0 5/5** on Core alias |
| Local Upstash smoke (box) | WRITE/READ/UPDATE/DELETE ok against `causal-oriole-287287.upstash.io` |

---

## Decision

| Item | Value |
|------|-------|
| Storage | **PASS** |
| Acc | **PASS** |
| Overall hotfix | **PASS** |
| Promote | **HOLD** (Chief GO still required; Core alias not promoted by this work) |
| New Preview URL | `https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app` |
| New dpl | `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` |

### Constraints honored
- NO `vercel --prod`
- NO alias promote
- Public sources only
- No full tokens in this markdown (host + db id only)
