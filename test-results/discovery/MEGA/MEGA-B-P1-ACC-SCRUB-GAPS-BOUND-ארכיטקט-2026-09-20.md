# MEGA-B · P1 Acc Scrub Gaps — Design Bound · ארכיטקט · 2026-09-20

**Status:** READY for Server implementation later; Preview only. **No Core change. No promote. HOLD promote.**

## 1. Binding invariant

Every Discovery response, SSE frame, narrow response, and store-rehydrated working view must be Acc-safe: no forbidden identity QID from `forbiddenIdentities.js` may remain in any visible identifier, reference, label, URL, free-text field, aggregate, or graph relationship. Scrubbing is strip/drop, not score downgrade and not identity resolution.

The single source of truth remains `api/lib/forbiddenIdentities.js`: `FORBIDDEN_IDENTITY_QIDS`, `FORBIDDEN_IDENTITIES_VERSION`, `normalizeQid`, `extractQid`, `isForbiddenQid`, and the shared value/token predicate. Do not add a Discovery denylist, QID literal, regex-based denylist, or Core identity import.

## 2. Required field bound

| Surface | Required rule | Failure behavior |
|---|---|---|
| Finding `id`, `title`, `summary` | Reject the whole finding when a field contains/matches a forbidden QID. | Drop finding and record `forbiddenStripped`. |
| Finding `entityRefs[]` | Remove forbidden refs; retain safe refs. A finding with an explicitly forbidden identity-bearing ref may be dropped if the ref is the finding identity. | Drop ref or finding per above; never pass through. |
| Finding `facetHints[]` | **P1 fix:** filter each hint through the SoT predicate. Do not rely on facet-bucket scrubbing; hints are emitted inside findings and may be persisted. | Remove poisoned hint; retain safe hints. |
| Evidence `id`, `provenanceUrl`/`url`, `quote`, `qid`, and provenance aliases | Reject evidence containing a forbidden QID. A finding whose evidence links disappear must then be removed by cite-or-drop. | Drop evidence, then unlink/drop orphan finding. |
| Facet bucket `value` (and any future label/ref carrying an identity) | Filter bucket entries with the SoT predicate; recompute `emptyReason` when a facet becomes empty. | Drop bucket, never redact into a new identity. |
| `contradictions[]` | Filter `findingIds` to IDs surviving the final finding scrub; scrub/drop `title`, `domains`, `note`, `type`, and any future refs. Drop a contradiction with no surviving IDs or with a forbidden token in an un-scrubbable scalar. | Drop contradiction or remove invalid refs; never leave a dangling ID. |
| Graph `nodes[]` | Inspect node `id`, `qid`, `label`/`title`/`name`, `entityRefs`, and other visible identity-bearing fields. Drop a poisoned node. | Drop node. |
| Graph `edges[]` | Keep only edges whose `from`/`to` (or source/target aliases) refer to surviving nodes; inspect edge labels/refs too. | Drop dangling or poisoned edge. |
| `candidates[]` / Core candidate chrome | Discovery is findings-only. If present on an accidental path, run the Core SoT sanitizer and then delete the field. | Never emit candidates. |
| `seed`, `q`, `softEr.displayHint`, and `narrow.applied` echoes | These are request/UX echoes, not identity results, but must not echo a forbidden QID. Omit/null the poisoned scalar or filter the poisoned applied value; preserve safe non-QID text. | Omit/null/filter. |
| `dossier`, `faces`, `photoUrl` | Never emit, regardless of scrub result. | Delete field. |

Opaque operational fields (`status`, `providers`, progress/counters, store telemetry) remain as-is unless a future schema adds identity-bearing content. `_fingerprint` and other internal fields are not emit surfaces and must not be introduced into responses.

## 3. Placement: emit and store rehydrate

### Canonical emit boundary

`sanitizeDiscoveryPayload()` in `api/lib/discovery/emit.js` remains the sole Discovery output sanitizer. The Server patch should extend its existing `scrubFinding()` and graph/facet handling, add `facetHints` filtering, and add contradiction reconciliation after `finalFindings` is known. Reuse the SoT predicate; remove the local duplicate `valueHasForbidden` in `emit.js` in the same later implementation.

The order is binding: (1) scrub findings and evidence; (2) remove findings without surviving evidence; (3) scrub facets; (4) compute surviving finding/evidence/node ID sets; (5) scrub contradictions and graph nodes/edges; (6) remove candidates/Core chrome and never-fields; (7) attach version and additive strip telemetry. No pre-scrub object spread may become the final return.

The same boundary covers `emitSnapshot()`, POST response snapshots, GET responses, narrow responses, `scrubFindingChunk()`, and `scrubFacetsChunk()`. `buildProgressiveEvents()` must continue to sanitize the assembled session before splitting it into SSE events; each finding/facets chunk remains a belt-and-suspenders check.

### Store and rehydrate boundary

The session store is persistence, not a second Acc policy. `sessionStore.get()` may return a raw persisted object to the orchestrator, but every rehydrate path must pass through the canonical emit sanitizer before it is returned or used as a response:

- `getDiscoverySession`: sanitize the loaded or regenerated session before return.
- `narrowDiscoverySession`: sanitize the rehydrated working copy before filtering, then persist only the canonical scrubbed `lastNarrow`/session view; sanitize the response again.
- `loadSessionRaw`/SSE: raw load is allowed internally only; `buildProgressiveEvents` is mandatory before any frame is written.
- `maybeRegenerate`/fs-regen: regenerated sessions enter the same sanitizer before response and before any canonical persistence update.

If a future store adapter adds a rehydrate hook, it must call this shared sanitizer (or a shared lower-level scrub helper) and import the SoT; it must not implement a second denylist. KV and fs-regen have identical scrub semantics. Store fallback flags remain telemetry only and do not weaken scrubbing.

Persisting a scrubbed canonical session is preferred, but persistence must never be treated as proof that a later read is safe: re-scrub on every rehydrate/emit. No raw poisoned object may be copied into `lastNarrow`, SSE state, or a response.

## 4. Contradiction-specific bound (B23)

Contradictions are derived before final emit, so `findingIds` can reference findings removed by Acc scrub. After final findings are determined:

1. Build `survivingFindingIds` from final findings.
2. Keep only contradiction objects with a non-empty intersection of `findingIds` and that set.
3. Replace `findingIds` with the intersection.
4. Filter `domains` and scrub all visible strings/refs with the SoT predicate.
5. Drop the object if any remaining visible identity-bearing scalar is forbidden or if no valid finding IDs remain.

This preserves the INFORMATION≠IDENTITY warning for safe findings while preventing a contradiction from becoming an orphaned identity side-channel.

## 5. Tests required before Server handoff

Add unit coverage without changing Core behavior:

- `api/lib/discovery/adversarial.acc.test.mjs` or a focused `emit` unit: injected forbidden `facetHints` is absent while safe hints remain.
- Finding test: forbidden `entityRefs` are removed; safe refs remain; forbidden id/title/summary still drops the whole finding.
- Contradiction test: one poisoned and one safe finding leaves only safe finding IDs; all-poisoned contradiction is absent; no dangling IDs.
- Graph test: poisoned node is absent and edges to/from it are absent; safe graph topology survives.
- Evidence test: forbidden QID in `url`, `qid`, `id`, or `quote` drops evidence and its orphaned finding.
- Narrow test: poisoned facet/filter value does not reappear in `narrow`, `lastNarrow`, or recomputed facets.
- Rehydrate test: inject a poisoned persisted session, clear memory, exercise GET, narrow, and SSE; JSON of every returned surface has no forbidden QID.
- SSE test: `buildProgressiveEvents`, finding chunks, facet chunks, terminal/status frames contain no forbidden QID and still terminate.
- SoT test: assert the sanitizer uses the exported SoT predicate/version; denylist remains declared only in `forbiddenIdentities.js` (no duplicate QID literal in Discovery).
- Regression: safe QIDs, non-QID strings, same-title contradictions, and entity-agnostic seeds remain intact; `dossier`/`faces` stay absent.

Acceptance is leakage=0 across POST/GET/narrow/SSE and rehydrate paths, with `forbiddenIdentitiesVersion` present and `forbiddenStripped` additive when applicable. Tests must be unit/local; no KV credentials are required.

## 6. Explicit non-scope / locks

- No Core change and no `mayCommitDossier`/identity-commit behavior.
- No Expected rewrite and no schema/fixture contract rewrite in this P1 bound.
- No provider expansion, graph relationship implementation, or ranking change.
- No KV provisioning or fallback behavior change; B17/B18 remain explicit and promote-blocking.
- Preview only later; **NO promote now. HOLD promote**.

## Handoff

P1 Acc scrub bound is READY for @שרת implementation when not blocked on KV. This document defines the contract only; it intentionally does not modify application code.
