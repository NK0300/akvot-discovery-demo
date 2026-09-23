# MEGA-C · KV REST Refresh + Acc B23 scrub · שרת · 2026-09-20

**OVERALL:** **PASS (Preview)** · **NO PROMOTE**  
**Checked:** 2026-09-20T07:45:30+03:00 Asia/Jerusalem (IDT / UTC+3)  
**Repo:** `/workspace/akvot-quick-demo` · project `k-akvot/akvot-simple-demo`

---

## Old FAIL (`dpl_BAke…`)

| Field | Value |
|-------|-------|
| dpl | `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv` |
| URL | `https://akvot-simple-demo-ndmmkolpg-k-akvot.vercel.app` |
| Storage | health TIMEOUT; logs `kv set/get failed: fetch failed`; POST 201 → GET **404** (memory-only) |
| Acc | Smith leak `wd-Q1701775` at `snapshot.contradictions[].findingIds` |

---

## New Preview (this deploy)

| Field | Value |
|-------|-------|
| dpl | `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e` |
| URL | `https://akvot-simple-demo-p68nhr48g-k-akvot.vercel.app` |
| target | **preview** (not production) |
| created | 2026-09-20T07:43:39+03:00 IDT |
| Core alias | `dpl_8ag…` **LOCKED / untouched** |

### Env refresh
- Claimed Upstash: `https://causal-oriole-287287.upstash.io` (local PING/SET/GET verified)
- Preview: `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` removed + re-added (Secret)
- Development: refreshed similarly
- **Production: NOT rotated**

---

## WRUD proof

### Health `GET /api/discovery/health`
```json
{
  "ok": true,
  "backend": "upstash",
  "storeBackend": "upstash",
  "latencyMs": 208,
  "correlationId": "hc-mu9c06ov-4bb153",
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
      "ms": 123
    },
    {
      "step": "READ",
      "ok": true,
      "ms": 123
    },
    {
      "step": "UPDATE",
      "ok": true,
      "ms": 153
    },
    {
      "step": "DELETE",
      "ok": true,
      "ms": 208
    }
  ],
  "ttlMs": 3600000,
  "faultInjectAvailable": false
}
```

| Expect | Observed | OK |
|--------|----------|----|
| storeBackend=upstash | `upstash` | Y |
| durable=true | `True` | Y |
| promoteEligible=true | `True` | Y |
| fsRegenFallback=false | `False` | Y |
| WRITE→READ→UPDATE→DELETE | all ok | Y |
| latencyMs | `208` | Y |

Also `GET /api/health` → `discoveryStore.storeBackend=upstash`, `build=dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e`, `crossInstance=shared-kv`.

### Session path (shared-kv)
| Step | Result |
|------|--------|
| POST `/api/discovery/sessions` (דוד כהן) | **201** · `kv1.582a…` · store=upstash · ~1.33s |
| GET same id | **200** (not 404) · findings=19 · upstash · ~0.43s |
| POST narrow provider=wikidata | **200** · afterCount=8 · ~0.53s |
| DELETE session | **405** method not allowed (API surface); KV DELETE covered by health probe |

**No POST 201 + GET 404.** Runtime logs: no `kv set/get failed` / `fetch failed` (only Node `url.parse` deprecation noise).

---

## Acc scrub (B23)

### Code
- `api/lib/discovery/emit.js`: `scrubContradiction()` intersects `findingIds` with surviving findings; drops forbidden QID tokens in ids/scalars; filters `domains`; also `facetHints` on findings + graph edge dangling-node cleanup.
- Entity-agnostic via `forbiddenIdentities` SoT — **no Smith special-case**.

### Units
| Suite | passed | failed |
|-------|--------|--------|
| adversarial.acc | 46 | 0 (+10 B23) |
| discovery.orchestrator | 113 | 0 (+3 B23) |
| forbiddenIdentities | 39 | 0 |
| sessionStore | 58 | 0 |

### Live Smith+ctx on this Preview
- POST **201** / GET **200** · store=upstash
- `leak_Q1701775=false` (incl. `contradictions[].findingIds`)
- `forbiddenStripped=1` · `forbiddenIdentitiesVersion=2026-09-19.1`
- dossier/faces absent

---

## Acc/QA handoff

**Acc/QA must re-verify** storage CRUD gate + ≥3 Discovery seeds on `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e` before any promote discussion.  
**שרת did NOT promote.** Core alias untouched.

## Blockers
None for Preview storage/scrub fix. Promote remains HOLD pending Acc/QA.
