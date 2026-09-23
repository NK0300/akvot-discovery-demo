# Discovery Acc Scrub Surface Matrix — ארכיטקט — 2026-09-20

**Mode:** DOCS ONLY · Arch glance · **NO Core rewrite** · **NO promote**  
**Scope:** Discovery emit boundary and rehydrate surfaces only.  
**Live blocker:** Acc-DISC **NO-GO** for Smith+ctx: forbidden `wd-Q1701775` remains at `snapshot.contradictions[].findingIds` (POST) and the corresponding GET/HIT contradiction.  

> **Supersession (2026-09-20T07:47 IDT):** B23 CLOSED / PASS and B22 CLOSED on Preview `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e` — see `MEGA-B23-SCRUB-GLANCE-ארכיטקט-2026-09-20.md` + updated `MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md`. Rows below retain pre-fix snapshot for history.
**SoT:** `api/lib/forbiddenIdentities.js` (`isForbiddenQid`, `extractQid`, `normalizeQid`, `FORBIDDEN_IDENTITIES_VERSION`).  
**Inspected:** `api/lib/discovery/emit.js`, `MEGA-B-P1-ACC-SCRUB-GAPS-BOUND-ארכיטקט-2026-09-20.md`, `MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md`, `MEGA-B-ACC-EMIT-GLANCE-ארכיטקט-2026-09-20.md`, and KV Acc NO-GO evidence in `MEGA-ACC-DISC-KV-דיוק-2026-09-20.md`.

## Surface matrix

Status is the current implementation/evidence status, not the desired P1 contract.

| Discovery emit surface | Current scrub behavior / evidence | Status | Gate implication |
|---|---|---:|---|
| `findings[]` (`id`, `title`, `summary`) | `scrubFinding` rejects a finding containing a forbidden QID; surviving findings are cite-or-drop reconciled against surviving evidence. | **WIRED / PASS** | Finding surface is clean in the live Smith+ctx run; still covered by final emit re-scrub. |
| `findings[].evidenceIds[]` | Indirectly constrained: findings survive only when at least one referenced safe evidence ID remains; final evidence is reduced to IDs referenced by final findings. The list itself is not independently token-filtered. | **PARTIAL** | Unit must cover forbidden/dangling IDs and assert no forbidden visible reference remains. |
| `findings[].entityRefs[]` | `scrubFinding` checks refs against the SoT predicate and drops the poisoned finding/ref path; safe refs remain on safe findings. | **WIRED / PASS** | No known live leak on this surface. |
| `findings[].facetHints[]` | Current `scrubFinding` spreads `f` and does **not** filter `facetHints`; bucket scrubbing does not protect hints embedded in findings. | **OPEN (B22)** | P1 gap; a poisoned hint can survive until Server patch. |
| Facet buckets: `value` / `valueIds` and identity-bearing aliases | Current `scrubFacet` filters `bucket.value` only. It does not explicitly inspect a `valueId` or future label/ref alias. | **PARTIAL / OPEN** | Safe `value` buckets are covered; `valueId`/alias coverage is required before closure. |
| `graph.nodes[]` | Current code filters forbidden node `id`. Required bound also covers `qid`, label/title/name, entity refs, and other visible identity fields. | **PARTIAL** | Node-ID path is wired; full node identity-field bound is not closed. Edges are not separately reconciled in current emit code. |
| `candidates[]` accidental/Core chrome | Projects a candidates-equivalent view through `sanitizeCandidatesPayload`, then deletes `out.candidates`; Discovery remains findings-only. | **CLOSED** | Verified closed; never reopen as a Discovery output surface. |
| `contradictions[].findingIds[]` | `sanitizeDiscoveryPayload` currently preserves pass-through contradictions and does not intersect IDs with `finalFindings`. Live leak: `wd-Q1701775` at `snapshot.contradictions[0].findingIds[2]` on POST and GET/HIT. | **OPEN / NO-GO (B23)** | Direct promote blocker. Must be fixed before Acc-DISC closure. |
| SSE finding chunks | `scrubFindingChunk` routes finding/evidence through the canonical sanitizer; live Smith SSE evidence reported leak=0. | **WIRED / PASS (observed)** | Any contradiction-bearing or assembled SSE payload must use the same B23 scrub before frame emission. |
| SSE facets chunks | `scrubFacetsChunk` routes facets through the canonical sanitizer; live stream reported clean. | **WIRED / PASS (observed)** | Retest after the complete facet value/valueId bound is implemented. |
| Narrow response / recomputed view | Narrow emit is routed through the canonical snapshot sanitizer and live narrow reported leak=0. A contradiction carried in the rehydrated view remains exposed by the B23 pass-through gap. | **PARTIAL / BLOCKED by B23** | Scrub the working view before filtering, persist only the scrubbed view, and scrub the response again. |
| GET / HIT rehydrate | GET/HIT uses the stored/rehydrated session and the canonical emit path, but the raw contradiction reference survives that path. Live Smith+ctx GET/HIT has the same forbidden QID leak. | **OPEN / NO-GO (B23)** | Re-scrub every HIT/rehydrate; persistence is not proof of safety. |
| POST snapshot | Canonical `sanitizeDiscoveryPayload` is invoked, but contradictions are copied by the object spread without reconciliation. | **OPEN / NO-GO (B23)** | Exact live failing surface. |
| Never-fields: `dossier`, `faces`, `photoUrl` | Explicitly deleted from the sanitized output. | **WIRED / PASS** | Never emit, regardless of scrub result. |

## B23 contradiction fix bound — @שרת

**No Core change.** Extend the existing Discovery emit sanitizer only.

1. Scrub findings and evidence first, then compute `finalFindings` exactly as today.
2. Build `survivingFindingIds = Set(finalFindings.map(f => f.id))`.
3. For every `contradictions[]` object, filter `findingIds` in two gates:
   - reject/filter any ID that is or contains a forbidden QID under the shared `forbiddenIdentities` SoT (including `wd-Q1701775`); and
   - retain only IDs present in `survivingFindingIds`, so a contradiction cannot reference a finding dropped by scrub.
4. Replace `contradiction.findingIds` with that intersection. Drop the contradiction when the intersection is empty.
5. Scrub/drop visible contradiction fields (`title`, `domains`, `note`, `type`, and future refs/identity-bearing scalars) with the same SoT. Drop the object if an un-scrubbable visible scalar remains forbidden.
6. Emit only the reconciled contradiction array. No dangling finding ID, forbidden ID, or forbidden free-text token may remain.

Use the existing `forbiddenIdentities.js` exports/version as the sole source of truth. Do not add a Discovery denylist, literal QID, parallel regex denylist, or Core identity import. The scrub must happen **before emit** on every route: **POST snapshot, GET, SSE assembled/chunk paths, narrow, and GET/HIT rehydrate**. Raw KV/fs objects may be used internally only; they must be re-scrubbed before response, persistence of a canonical view, or frame write.

## Units required before closure

- **Focused emit unit:** one contradiction with one forbidden and one safe ID leaves only the safe surviving ID; all-forbidden/all-dropped IDs remove the contradiction; dangling IDs are removed; no `wd-Q1701775` appears in serialized output.
- **Contradiction field unit:** forbidden `title`, `domains`, `note`, `type`, and future ref/scalar inputs are filtered or drop the contradiction according to the bound.
- **Surface regression units:** POST, GET/HIT rehydrate, narrow, and SSE (including terminal/status/assembled frames) assert leakage=0 and no `dossier`/`faces`/`photoUrl`.
- **Existing P1 coverage:** `facetHints` poison/safe mix, evidence `url`/`qid`/`id`/`quote`, entity refs, facets (`value` plus `valueId` aliases), graph node/edge topology, and accidental candidates deletion.
- **SoT/unit invariant:** assert `FORBIDDEN_IDENTITIES_VERSION` is present and all forbidden checks use the shared SoT; no Discovery-local denylist or QID literal is introduced.

## Decision

**scrub matrix PARTIAL · promote HOLD · Core locked.**  
B23 is live Acc-DISC **NO-GO** until contradiction IDs are scrubbed/reconciled across POST/GET/SSE/narrow/HIT and the required units pass. This artifact is documentation only; no Core rewrite and no promote performed.
