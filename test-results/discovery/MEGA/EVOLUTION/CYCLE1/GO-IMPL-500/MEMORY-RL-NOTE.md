# MEMORY-RL-NOTE · Discovery in-process rate limit · GO-IMPL-500

**Stamp:** 2026-09-23T22:49:00+03:00 IDT (updated · prune edges)  
**Owner:** Backend / שרת  
**Verdict:** memory RL **documented + hardened** · distributed RL **OPEN / not claimed** · **NO Upstash RL PASS invented**

---

## Caps (honest)

| Constant | Value | Meaning |
|----------|-------|---------|
| `RATE_LIMIT_BACKEND` | `memory` | in-process `Map` only |
| `RATE_LIMIT_MAX` | **40** | max trips per key per window (Discovery create) |
| `RATE_LIMIT_WINDOW_MS` | **60_000** | 60s sliding window start |
| `RATE_LIMIT_MAX_KEYS` | **2_000** | max tracked keys before new-key fail-closed |
| `distributed` | **false** | never claimed true |
| `upstashWiredForRateLimit` | **false** | Upstash may back **sessionStore**; **not** Discovery RL |

## Hardening (follow-on · softfail/obs/RL wave)

5. **`opts.now` test clock** — unit-only; proves prune-expired frees capacity + window renew without inventing distributed RL.

## Hardening this wave

1. **Key isolation** — counters are per-key; key A trip does not charge or trip key B (unit proven).  
2. **Fail-closed overflow** — when map is at `maxKeys` after expired prune, a **new** key gets `429` with `overflow: true` / `failureClass: rate_limit_overflow` instead of evicting active counters (unique-key flood bypass defense).  
3. **Prune = expired only** — removed oldest-active eviction (that weakened isolation).  
4. **Introspection** — `getDiscoveryRateLimitInfo()` exposes `overflowPolicy: 'fail_closed_new_key'` + honesty note.

## What this is NOT

- Not multi-instance / multi-isolate distributed rate limiting.  
- Not Upstash / Vercel KV rate limit.  
- Not a production distributed gate.  
- Demo / single-instance Preview scoped.

## Tests

- `security.checkpoint.test.mjs` — trip · isolation A/B · overflow fail-closed · 429 honesty fields  
- Regression green alongside SSRF pack this wave.

