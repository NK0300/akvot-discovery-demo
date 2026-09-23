# KV Provision · Chief · 2026-09-20

**STATUS:** LIVE on Preview · promote HOLD  
**Method:** Upstash `start-redis` (agent CLI) → Vercel env `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` (Preview/Production/Development) → `vercel deploy`

## Preview
| Field | Value |
|-------|-------|
| dpl | `dpl_BAkeDgvpvqGEg53zXxScGdESvdPv` |
| URL | `https://akvot-simple-demo-ndmmkolpg-k-akvot.vercel.app` |
| target | null (Preview) |

## Health (`GET /api/health`)
```json
"discoveryStore": {
  "storeBackend": "upstash",
  "durable": true,
  "fallback": false,
  "promoteEligible": true,
  "kvCredsPresent": true,
  "crossInstance": "shared-kv"
}
```

## Caveats
- Temporary Upstash DB expires **2026-09-23** unless user Claims: https://upstash.com/start-redis/console/4c3b3c0b-c797-4203-8c42-dc464866876d
- Vercel Marketplace Upstash install still blocked on terms acceptance (needs human click once for permanent marketplace resource)
- Core alias untouched · NO promote until Acc+QA Evidence GREEN + Chief GO

## Next
Acc-DISC + QA RELEASE battery + SSE verify on this Preview.
