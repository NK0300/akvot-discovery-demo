# Phase B · BOUNDARIES · KV SESSION SoT · ארכיטקט · 2026-09-20

**STATUS:** **KV SoT REQUIRED** · **HOLD promote** · **Preview only until Evidence**  
**LOCKS:** Core / alias `dpl_8ag…` **LOCKED** · **WP4 NO-GO** · **NO Core rewrite** · **DOCS ONLY**

## 1. Decision

Phase B CONTINUE is limited to completing and validating the durable KV session store as the Discovery session source of truth. The current Preview is not promotable. Keep promotion on hold until the KV-backed Preview produces the required Evidence and receives an explicit Chief GO.

The Core deployment and alias `dpl_8ag…` remain untouched and locked. This document authorizes no Core rewrite, no alias promotion, and no WP4 work.

## 2. Source-of-truth rule

A durable cross-instance session store **MUST be Redis/KV** for the Discovery Preview promotion path: Upstash Redis over REST or Vercel KV/compatible Redis are accepted backends.

`fs-regen` is a **soft fallback for local/development only**. It is not an acceptable production source of truth and cannot satisfy the promote Gate. A Preview reporting `fs-regen` as its authoritative backend remains blocked from promotion.

The session-store adapter is in `sessionStore.js`. An in-process cache or filesystem regeneration may assist local/dev recovery, but neither may become the authoritative cross-instance session state.

## 3. Required credentials and environment

Server/owner must provision one complete accepted environment pair on Vercel Preview:

- **Vercel KV / Redis-compatible REST:** `KV_REST_API_URL` + `KV_REST_API_TOKEN`
- **Upstash Redis REST:** `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`

Partial pairs, absent variables, or local-only credentials do not satisfy this boundary. Current blocker: no `KV_REST_API_*` or `UPSTASH_REDIS_REST_*` variables are present on Vercel. Owner **Nachman/Chief** must provision them; Server cannot complete or validate the KV Preview without the environment.

## 4. Rehydrate and Acc boundary

Every rehydrate **HIT from KV** must pass through the existing Acc scrub before it can be emitted or returned:

```
KV read → normalize → Acc scrub → schema check → emit/return
```

This applies to snapshot responses, SSE chunks, narrow responses, and cache/HIT revalidation. A stored or cached forbidden identity is never trusted merely because it was previously scrubbed. Acc version/count telemetry must remain observable without raw PII.

## 5. Backend detection and promotion Gate

`detectStoreBackend` must report the live backend as `kv` for the Vercel KV/Redis-compatible pair or `upstash` for the Upstash REST pair. A live Preview must expose the detected value in its evidence.

**Promotion Gate:** `storeBackend != fs-regen`. A Preview that reports `fs-regen`, reports an unknown backend, or cannot demonstrate a live KV/Upstash read/write is blocked. The Gate is not satisfied by adapter code alone; it requires runtime Evidence.

## 6. Module and contract boundary

- **Module:** `sessionStore.js` is the adapter boundary for KV/Upstash get/create/update, TTL, and durable cross-instance session state.
- **Unchanged contracts:** emit, narrow, and SSE contracts remain unchanged. The adapter swap must not alter canonical response schemas, Acc scrub behavior, progressive SSE semantics, server-side narrow recomputation, provenance, or the no-identity-commit boundary.
- **Core boundary:** Core lookup/orchestration, Core cache, and the locked alias remain untouched.

## 7. Required Gate sequence

```text
credentials provisioned
  → Vercel Preview env configured
  → Preview reports storeBackend=kv (or accepted live upstash)
  → Acc + QA on ≥3 Seeds
  → Arch glance
  → explicit Chief GO
  → promote Discovery only
```

The three-Seed Evidence must demonstrate durable cross-instance rehydrate, Acc leakage = 0 across create/GET/SSE/narrow/cache-HIT paths, and preserved emit/narrow/SSE contracts. Until every step is green and Chief gives explicit GO, the default remains **Preview only · HOLD promote**.

## 8. Current blocker and ownership

**BLOCKED on credentials.** No accepted KV/Upstash environment pair is currently provisioned on Vercel. Owner **Nachman/Chief**: provision the required Preview variables and hand back runtime Evidence. **Server cannot complete without env.**

## Decision

**KV SoT REQUIRED · HOLD promote · CONTINUE KV store to replace fs-regen as SoT.**  
**Core/alias `dpl_8ag…` LOCKED · WP4 NO-GO · NO Core rewrite · Preview only until Evidence and explicit Chief GO.**

**Pointer:** `PHASE-B-BOUNDARIES-SSE-NARROW-STORE-ארכיטקט-2026-09-20.md`.
