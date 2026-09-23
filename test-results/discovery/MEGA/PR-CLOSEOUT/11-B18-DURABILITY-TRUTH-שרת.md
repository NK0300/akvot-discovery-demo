# 11 — B18 Durability Truth (שרת)
**Stamp:** 2026-09-20 ~08:52 IDT (Asia/Jerusalem UTC+3)  
**Preview:** `dpl_4trZGxgN7CKKtC6Zed6SbACzF6Po` · https://akvot-simple-demo-7ogfp6yun-k-akvot.vercel.app  
**Promote:** **NO** · Core `dpl_8ag…` **LOCKED**

## Invariant
**Never** emit `durable:true` or `promoteEligible:true` unless backend is `vercel-kv|upstash` **AND** a successful KV probe (or last-known-good probe) confirms reachability.

## Implementation
| Mechanism | Behavior |
|-----------|----------|
| `lastKvProbe` | In-process `{ok,at,failureClass}` |
| `recordKvProbe` / `getKvProbeState` / `resetKvProbeForTests` | Probe state API |
| `getStoreInfo` | `durable = kvBackend && probeOk`; fail → `explicitFallback=true`, `durabilityState=durable-degraded` |
| `redisCommand` | success → `recordKvProbe(true)`; final fail → `recordKvProbe(false, failureClass)` |
| `sessionStore.set` | KV fail → clear memory, throw 503 (`KV_SET_FAILED`) — fail-loud |
| `healthCheck` | success re-reads info; fail forces `durable:false`, `promoteEligible:false` |
| `pingKvReachability` | PING used by `GET /api/health` so flags warm |
| `createDiscoverySession` / `emitSnapshot` | Refresh live probe-gated flags after write |

## Live Preview proof
```
/api/health: durable=true promoteEligible=true durabilityState=durable-kv kvPing.ok=true
/api/discovery/health: WRITE/READ/UPDATE/DELETE ok · durable=true · mode=kv-shared
CREATE/GET store: durable=true promoteEligible=true durabilityState=durable-kv
```

## Units
- Pending probe → durable false
- Fail probe → durable false + explicitFallback
- Good probe → durable true
- Mock fetch fail → set throws 503 + durable false
- Mock success → durable true
- Mock 401 → auth + durable false
- **sessionStore: passed=125 failed=0**

## Status
**CLOSED** for Preview · **NO PROMOTE**
