# Acc scrub static analysis · Discovery surfaces · 2026-09-20

**Zone:** Asia/Jerusalem (UTC+3) · checked ~07:21 IDT  
**Sacred:** leakage=0 · NEVER Q1701775 · Discovery never dossier/faces · no `mayCommitDossier`

## Call graph (Acc scrub mandatory)

| Path | Entry | Scrub helper | Status |
|------|-------|--------------|--------|
| Create POST snapshot | `createDiscoverySession` → `emitSnapshot` | `sanitizeDiscoveryPayload` | **WIRED** |
| GET rehydrate / HIT | `getDiscoverySession` | `emitSnapshot` (comment: Acc scrub on every rehydrate) | **WIRED** |
| fs-regen miss | `maybeRegenerate` → create → GET `emitSnapshot` | scrub on emit | **WIRED** |
| Narrow POST | `narrowDiscoverySession` → `emitSnapshot` | scrub before return | **WIRED** (`narrow.js`: caller scrubs) |
| SSE progressive | `buildProgressiveEvents` / `writeProgressiveSse` | `sanitizeDiscoveryPayload` + `scrubFindingChunk` + `scrubFacetsChunk` | **WIRED** |
| Route `/events` | `loadSessionRaw` + `writeProgressiveSse` | SSE scrub | **WIRED** |
| Route `/narrow` | `narrowDiscoverySession` | emit scrub | **WIRED** |

## SoT

- Denylist: `api/lib/forbiddenIdentities.js` · version **2026-09-19.1**
- Discovery emit: `api/lib/discovery/emit.js`
- Unit coverage: `orchestrator.test.mjs` + `adversarial.acc.test.mjs` (ADV-01…04)

## Gap found + closed this run

| Gap | Detail | Fix |
|-----|--------|-----|
| Candidates passthrough | `sanitizeDiscoveryPayload` `...snapshot` could retain Core `candidates[]` with forbidden QID | **Closed** in `emit.js`: note strip + `delete out.candidates` (Discovery findings-only) |

## Unit evidence (this run)

- Discovery orchestrator: **83 PASS / 0 FAIL**
- Adversarial Acc: **36 PASS / 0 FAIL**
- Forbidden identities: **39 PASS / 0 FAIL**
- Core orchestrator (prior): **128 PASS / 0 FAIL**
- Contract identity-p0 (alias live): **5/5 PASS** · leakage=0 · pw=0

## Non-goals

- No Prod alias promote
- No `sessionStore.js` rewrite (tests-only coordination)
