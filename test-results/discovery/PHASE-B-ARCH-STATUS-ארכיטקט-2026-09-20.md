# Phase B · ARCH STATUS · ארכיטקט · 2026-09-20

**STATUS:** **KV BOUNDARIES READY** · **BLOCKED on credentials** · **HOLD promote**

| Item | State |
|---|---|
| Phase B | OPEN · Preview only until Evidence · KV session store required as durable SoT |
| KV boundaries | `PHASE-B-BOUNDARIES-KV-SOT-ארכיטקט-2026-09-20.md` · READY |
| Credentials | BLOCKED · no `KV_REST_API_*` / `UPSTASH_REDIS_REST_*` on Vercel; Owner Nachman/Chief to provision |
| `sessionStore.js` | Adapter ready; live KV/Upstash runtime validation pending env |
| `detectStoreBackend` | Gate requires live `kv` or `upstash`; `fs-regen` is local/dev soft fallback only and fails promote Gate |
| Acc rehydrate | Scrub required on every KV HIT before emit/return |
| Emit / narrow / SSE | Contracts unchanged |
| Alias `dpl_8ag…` | Core/alias LOCKED and untouched |
| Core rewrite / WP4 | OUT · NO-GO |
| Promote | HOLD · no promote until credentials → KV Preview Evidence → Acc + QA ≥3 Seeds → Arch glance → explicit Chief GO |

**Owner/blocker:** Nachman/Chief must provision an accepted KV/Upstash env pair. Server cannot complete or validate the KV Preview without env.

**Entity-Agnostic · DOCS ONLY · NO Core rewrite · NO promote.**
