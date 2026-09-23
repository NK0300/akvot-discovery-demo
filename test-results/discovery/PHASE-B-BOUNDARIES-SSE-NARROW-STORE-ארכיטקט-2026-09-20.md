# Phase B · BOUNDARIES · SSE / NARROW / PERSISTENT STORE · ארכיטקט · 2026-09-20

**STATUS:** **HARDENING OPEN** · **Preview only** · **SSE + `/narrow` + persistent session store** · Acc scrub locked on every emit path · **Entity-Agnostic**
**LOCKS:** Core / alias `dpl_8ag…` untouched · **NO promote** · **NO Core rewrite** · **NO WP4** · **DOCS ONLY**

**Purpose:** This addendum narrows Phase B CONTINUE to harden the Preview Discovery session surface. It does not reopen the original Phase B scope and does not authorize deployment promotion.

**Refs:** `PHASE-B-BOUNDARIES-ארכיטקט-2026-09-20.md` · `PHASE-A-SERVER-שרת-2026-09-20.md` §§1, 3–5 · `PHASE-B-ARCH-GLANCE-ארכיטקט-2026-09-20.md` §1 / §8 · `PHASE-B-ARCH-STATUS-ארכיטקט-2026-09-20.md` · canonical schemas under `schemas/`

---

## 1. Hardening-wave decision

The previous Preview glance recorded two soft gaps: SSE `/events` and `POST /narrow` were deferred, and the session `Map` was in-memory-only and could return cross-instance 404. Phase B CONTINUE is **OPEN only for these gaps plus complete Acc coverage of their emit/re-hydrate paths**.

The wave remains additive Discovery only. It must produce a **new Preview** for validation; it must not modify, promote, or alias the locked Core deployment.

---

## 2. IN · required for this wave

| # | Hardening item | Boundary / acceptance intent |
|---|---|---|
| 1 | `GET /api/discovery/sessions/:id/events` | SSE `text/event-stream` progressive chunks from the durable session. Chunks are additive, carry an event id/cursor where supported, include progress/status, and end in a terminal session state. Reconnect/poll must not silently lose prior findings. Every chunk is Acc-scrubbed before serialization. |
| 2 | `POST /api/discovery/sessions/:id/narrow` | Accept facet filters, load the session, and **recompute server-side** the filtered findings, facets, ranking inputs, and progress/snapshot view. No client-only filtering is authoritative. The response is a scrubbed canonical session snapshot and the durable session state/version is updated. |
| 3 | Persistent session store (Preview) | Replace the in-memory `Map` as source of truth with the recommended **Upstash Redis / Vercel-compatible Redis adapter**. It is durable across Vercel serverless function instances, uses a bounded session TTL, supports get/create/update (with version or conditional-write protection), and keeps sessions isolated by session id. An in-process cache may be an optimization only, never the SoT. |
| 4 | Acc scrub on create snapshot | Before returning the `POST /sessions` snapshot, apply the `forbiddenIdentities` SoT scrub to findings, entity refs, facets, graph/relationship nodes, and banned response fields; stamp `forbiddenIdentitiesVersion`. Persist only the canonical/scrubbed session representation where practical. |
| 5 | Acc scrub on `GET` snapshot | Rehydrate from the persistent store, then scrub again before response serialization, including cache/HIT revalidation. A stored or cached forbidden id is never emitted merely because it was previously accepted. |
| 6 | Acc scrub on SSE chunks | Scrub each chunk after any provider/session read and immediately before `res.write`. Apply response bans (`dossier`, `faces`, identity-commit `photoUrl`) to every event, including terminal/error events. |
| 7 | Acc scrub on narrow response | Scrub the server-recomputed narrow result and its facets/relationships before returning it; stamp the Acc version. Narrow must not become a bypass around the normal emit path. |
| 8 | Acc scrub on cache HIT | Any session, finding, or provider cache rehydrate goes through the same scrub-before-emit boundary; cache HIT is not trusted as already safe. Core lookup cache remains separate and unchanged. |
| 9 | Entity-Agnostic validation | Exercise **at least three Seeds through the same path**: `דוד כהן`, `Alex Morgan`, and `example.org` / `Example Organization` (or equivalent approved fixtures). No literal-value branch, name allowlist, or entity-special case. |
| 10 | Existing Discovery contracts | Preserve schema compliance, public/authorized-source rules, cite-or-drop provenance, soft provider errors, finding ranking (not identity ranking), and the no-identity-commit boundary. |

### SSE minimum contract

- `Content-Type: text/event-stream`; no response buffering that defeats progressive delivery.
- Events are ordered/additive by session cursor or event id; a reconnect may resume or safely replay without creating duplicate authoritative findings.
- Each payload is a canonical, Acc-scrubbed projection; provider errors remain soft and do not expose raw sensitive data.
- Terminal status is one of `partial`, `complete`, or `failed_soft`; no event claims identity certainty.

### Narrow minimum contract

- Request filters are facet values/keys, not an identity-commit instruction.
- Filtering and facet counts are recomputed by the server from the session's durable findings/evidence.
- Evidence provenance and schema-required fields remain intact; no name-only relationship is manufactured.

---

## 3. OUT · hard locks

| Out of scope | Hold |
|---|---|
| Alias promote, including `dpl_8ag…` | **OUT. Locked and untouched. No promote.** |
| Core rewrite or Core lookup/orchestrator changes | **OUT.** `api/lookup.js`, Core orchestrator, `mayCommitDossier`, and Core cache remain untouched. |
| WP4 | **OUT / NO-GO.** |
| Identity commit from Discovery | **OUT.** No dossier, faces, identity certainty, or identity-commit photo binding. |
| In-memory-only session as SoT | **OUT after this wave.** Memory can be a non-authoritative request cache only. |
| Discovery promote | **OUT until explicit Chief GO after all gates.** |
| New private/auth-walled sources, robots bypass, credential use, provider expansion unrelated to this hardening | **OUT.** |
| Identity commit from Discovery | **OUT.** The Discovery path remains Findings + Evidence + Facets only. |

---

## 4. Module map update · Server implementation target

| Module / route | Hardening responsibility |
|---|---|
| `api/lib/discovery/store.js` | Persistent adapter boundary. Recommended Preview backend: Upstash Redis / Vercel-compatible Redis. Expose session create/get/update, TTL, cursor/version handling, and cache rehydrate; no in-memory `Map` as SoT. |
| `api/lib/discovery/emit.js` | Shared canonical projection and Acc scrub boundary. Provide snapshot and SSE serialization; scrub immediately before every response write. |
| `api/lib/discovery/narrow.js` | Server-side facet-filter application, recomputation of findings/facets/rank inputs, durable update, and scrubbed response projection. |
| `api/discovery/sessions/index.js` | Create session, persist the initial canonical session, and return the scrubbed create snapshot. |
| `api/discovery/sessions/[id].js` | Durable `GET` snapshot; rehydrate then Acc-scrub, including cache HIT. |
| `api/discovery/sessions/[id]/events.js` | SSE route; stream progressive scrubbed chunks from the durable session/cursor. |
| `api/discovery/sessions/[id]/narrow.js` | `POST` narrow route; validate filters, invoke server recompute, persist, and return scrubbed snapshot. |
| `api/lib/forbiddenIdentities.js` | Existing Acc scrub SoT v2026-09-19.1+; reuse, do not fork. |
| Core `api/lookup.js` + Core orchestrator | **UNCHANGED.** No Discovery call to `mayCommitDossier`; no Core cache poisoning. |

Exact framework route placement may vary, but the responsibilities above are mandatory and the `store.js` / `emit.js` / narrow-handler separation must remain reviewable.

---

## 5. Persistence and rehydrate rules

1. Session records have an explicit TTL and contain only the Discovery session model required for Preview; no cross-user/session reuse.
2. Writes are versioned or conditionally updated so concurrent SSE/provider/narrow work cannot silently overwrite newer findings.
3. Store read → normalize → **Acc scrub** → schema check → emit is the mandatory rehydrate path.
4. Cache HIT and persistent-store HIT follow the same path; neither is trusted as pre-scrubbed.
5. Store unavailability degrades to a documented soft failure; it must not silently fall back to an in-memory-only authoritative session.
6. Observability records session id, stage, cursor/version, scrub count/version, and soft errors without raw PII.

---

## 6. Acceptance evidence required before review

- New Preview URL/deployment identified by Server; locked Core alias remains untouched.
- SSE evidence for all three Seeds: progressive chunks, terminal status, reconnect/replay or cursor behavior, and no forbidden leakage.
- Narrow evidence for all three Seeds: server recompute changes the filtered result/facets, durable GET sees the update, and response has no forbidden fields/ids.
- Cross-instance/durable-store evidence: create or advance in one function context and successfully GET/SSE/narrow from another context after rehydrate.
- Acc scrub matrix covers: create snapshot, GET snapshot, SSE chunk, narrow response, and cache HIT; leakage = 0.
- Core regression remains green; no alias promote; no Core rewrite; WP4 remains NO-GO.

---

## 7. Gate sequence (locked)

```
Impl
  → new Preview
  → Acc + QA on ≥3 Seeds
  → Arch glance
  → Chief Review
  → PROMOTE only on explicit Chief GO
```

Until the final explicit Chief GO, the default is Preview-only and **NO promote**. The `dpl_8ag…` Core/alias deployment is not a target of this sequence.

---

## Decision

**HARDENING OPEN · BOUNDARIES SSE/NARROW/STORE READY · await Server new Preview.**

**NO promote · Core untouched · WP4 NO-GO · in-memory-only SoT retired by this wave · Entity-Agnostic ≥3 Seeds required.**
