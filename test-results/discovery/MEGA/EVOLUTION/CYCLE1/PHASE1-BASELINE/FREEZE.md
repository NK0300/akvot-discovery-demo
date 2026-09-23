# PHASE1-BASELINE FREEZE (Steps 01–06)

**Stamp:** 2026-09-20T09:47:15+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Policy:** NO CODE CHANGES · NO alias/promote mutations · Evidence only  
**Overall (01–06):** **PASS**

---

## 01–02 Discovery PRODUCTION alias freeze

| Field | Value |
|-------|-------|
| Alias (primary) | https://akvot-discovery.vercel.app |
| Alias (secondary) | https://akvot-discovery-k-akvot.vercel.app |
| **Full deployment id** | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| Deployment URL | https://akvot-simple-demo-6palh6t62-k-akvot.vercel.app |
| target (of dpl) | **preview** (aliased to Discovery production hostname) |
| readyState | READY |
| createdAt | 2026-09-20T08:52:05+03:00 IDT |
| commit SHA | *unavailable* (no `.git`; `vercel inspect --json` meta/gitSource null) |
| health build | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| Expected | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| Match | **PASS** |

Evidence: `raw/01-disc-inspect.txt` · `raw/07-disc-api-health.json`

---

## 03–04 Core PRODUCTION freeze (LOCKED)

| Field | Value |
|-------|-------|
| Alias (primary) | https://akvot-simple-demo.vercel.app |
| Alias (secondary) | https://akvot-simple-demo-k-akvot.vercel.app |
| **Full deployment id** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Deployment URL | https://akvot-simple-demo-3i5lh8hts-k-akvot.vercel.app |
| target | **production** |
| readyState | READY |
| createdAt | 2026-09-20T00:56:41+03:00 IDT |
| Expected prefix | `dpl_8ag…` |
| health build | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Unchanged / LOCKED | **PASS** |
| Alias retarget | **NOT done** (touch=false) |

Evidence: `raw/02-core-inspect.txt` · `raw/08-core-api-health.json` · `raw/03-alias-ls.txt`

---

## 05 Config fingerprint (NO SECRETS)

### Env KEY NAMES only (`vercel env ls`)

| Name | Environments |
|------|----------------|
| UPSTASH_REDIS_REST_TOKEN | Development, Preview, Production |
| UPSTASH_REDIS_REST_URL | Development, Preview, Production |
| GOOGLE_GENERATIVE_AI_API_KEY | Production, Preview, Development |

Absent: `KV_REST_API_URL`, `KV_REST_API_TOKEN`

Evidence: `raw/04-env-ls.txt` (values redacted)

### Durable / store flags from `/api/health` (Discovery alias)

| Flag | Value |
|------|-------|
| storeBackend | `upstash` |
| durable | `True` |
| fallback | `False` |
| promoteEligible | `True` |
| kvReachable | `True` |
| durabilityState | `durable-kv` |
| crossInstance | `shared-kv` |
| kvCredsPresent | `True` |

`/api/discovery/health`: ok=`True` · mode=`kv-shared` · WRUD all ok · latencyMs=`207`

---

## 06 Provider configuration (names/types only)

| Provider / integration | Type / notes |
|------------------------|--------------|
| wikidata | discovery provider |
| wikipedia | discovery provider |
| openlibrary | discovery provider |
| upstash | KV/session store (`UPSTASH_REDIS_REST_*` keys present; values not recorded) |
| GOOGLE_GENERATIVE_AI_API_KEY | env key name only (Gemini); value not recorded |

**No tokens/keys in evidence.**

---

## KV state summary (health)

```
backend=upstash
durable=True
promoteEligible=True
kvReachable=True
```

---

## Forbidden identity SoT

- File: `api/lib/forbiddenIdentities.js`
- Version: `2026-09-19.1`
- QIDs: `Q1701775`

---

## Alias map (read-only)

| Source deployment host | Alias |
|------------------------|-------|
| akvot-simple-demo-6palh6t62-k-akvot.vercel.app | akvot-discovery.vercel.app |
| akvot-simple-demo-6palh6t62-k-akvot.vercel.app | akvot-discovery-k-akvot.vercel.app |
| akvot-simple-demo-3i5lh8hts-k-akvot.vercel.app | akvot-simple-demo.vercel.app |
| akvot-simple-demo-3i5lh8hts-k-akvot.vercel.app | akvot-simple-demo-k-akvot.vercel.app |
