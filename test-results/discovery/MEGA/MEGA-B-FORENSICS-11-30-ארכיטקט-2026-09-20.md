# MEGA-B · Forensics 11–30 · ארכיטקט · 2026-09-20

**Scope:** Dead code · duplicates · hidden fallbacks · Preview≠Prod · Acc scrub gaps · Entity-Agnostic · schema↔runtime  
**Method:** `rg` + `Read` on listed paths only · **NO inventing** · HOLD promote · KV creds BLOCKED (noted)  
**Locks:** Acc P0 Core `dpl_8ag…` · NO Core rewrite · NO promote

Severity: **P0** ship-blocker / Acc leak risk · **P1** promote/contract · **P2** debt/drift · **P3** hygiene

---

## Summary counts

| Severity | Count |
|----------|------:|
| P0 | 0 |
| P1 | 5 |
| P2 | 10 |
| P3 | 5 |
| **Total verified findings** | **20** |

---

## Findings

### B11 — Unused export alias `canCommitIdentity`
- **Severity:** P3
- **Evidence:** `api/lib/orchestrator.js` exports `canCommitIdentity = mayCommitDossier`; `rg` shows **no** importers outside that file (non-test).
- **Recommendation:** Keep as documented alias or stop exporting; do not use from Discovery.

### B12 — Probe exports unused on routes (`payloadContainsForbidden`, `extractPayloadQids`)
- **Severity:** P3
- **Evidence:** Defined + default-exported in `api/lib/forbiddenIdentities.js`; only internal use of `extractPayloadQids` inside `payloadContainsForbidden`. No `api/discovery/*` or `api/lookup.js` callers.
- **Recommendation:** Wire into Acc health/probe later, or mark test-only; not a leak by itself.

### B13 — Exported-but-internal Core helpers
- **Severity:** P3
- **Evidence:** `COMMON_LATIN_SURNAMES`, `candidateHasEvidence`, `hasOrgCityEvidenceMatch` exported from `api/lib/orchestrator.js` but only referenced inside that module (non-test).
- **Recommendation:** Un-export or document as public Domain API; Discovery must not import.

### B14 — Duplicate Open Library author search (Core vs Discovery)
- **Severity:** P2
- **Evidence:** `api/lib/stageB.js` `openLibrarySearch` → `openlibrary.org/search/authors.json`; `api/lib/discovery/providers.js` `openLibraryProvider` same host/path, different candidate/finding shapes.
- **Recommendation:** Shared thin client later; keep output adapters separate (Core candidates ≠ Discovery findings). No promote impact.

### B15 — Duplicate Wikidata `wbsearchentities` (Core vs Discovery)
- **Severity:** P2
- **Evidence:** `stageB.js` `wikidataSearch` and `providers.js` `wikidataProvider` both call Wikidata `action=wbsearchentities`.
- **Recommendation:** Same as B14 — shared fetch util; do not merge identity commit logic into Discovery.

### B16 — Duplicate name-token overlap helpers
- **Severity:** P3
- **Evidence:** `stageB.js` `norm` / `nameTokens` / `tokenOverlap` vs `lookup.js` `normNameTokens` / `tokenOverlapSafe` (latinFold correctly SoT’d to `knownIdentities.js`).
- **Recommendation:** Optional consolidate under lib helper; low priority.

### B17 — Hidden / soft fallback: `fs-regen` when KV env absent
- **Severity:** P1
- **Evidence:** `sessionStore.js` `detectStoreBackend()` returns `fs-regen` unless KV/UPSTASH pairs present. Project env has no those vars (Chief/storage docs + `.env.local` only shows Gemini key name). `getStoreInfo().fallback/explicitFallback/fsRegenFallback=true`, `promoteEligible=false`.
- **Recommendation:** Provision KV/UPSTASH on Preview (Wave C). Until then HOLD promote. Telemetry already explicit — do not silence.

### B18 — Hidden fallback: seed-decode regenerate on durable miss
- **Severity:** P1
- **Evidence:** `orchestrator.js` `getDiscoverySession` / `loadSessionRaw` / `narrowDiscoverySession` call `maybeRegenerate` when `allowRegen !== false` and `decodeSessionId` yields seed; sets `_regenReason='fs-miss-seed-decode'`, forces `durable:false`, `promoteEligible:false`.
- **Recommendation:** Keep for Preview cross-instance; Acc scrub already runs via `emitSnapshot` after regen. Require KV SoT before promote (KV SoT boundaries).

### B19 — UX soft fallbacks: fixture mode + SSE→poll
- **Severity:** P2
- **Evidence:** `discovery-ui.js` header + `forceFixture` / `discoverySource=fixture`; `runViaSse` catch continues to `runViaPoll`.
- **Recommendation:** Document as UX resilience; fixture path must remain catalog-only (Entity-Agnostic). No server Acc bypass (fixtures are client-rendered).

### B20 — Soft-fail provider path (`failed_soft` / `partial`)
- **Severity:** P2
- **Evidence:** `runPipeline` provider `catch` → `providers[id]='error'`; empty findings + anyError → `status='failed_soft'`; outer catch also `failed_soft`. Providers return soft errors without aborting siblings.
- **Recommendation:** Intended Pack behavior (soft provider errors). Ensure SSE terminal events still Acc-scrub (verified via `buildProgressiveEvents`).

### B21 — Preview ≠ Prod drift (Discovery Preview vs alias Core)
- **Severity:** P1
- **Evidence:** Control board + `vercel.json` Discovery routes present; promote HOLD; Core alias Acc P0 locked; Discovery store = fs-regen while Core lookup uses in-process `Map` cache in `lookup.js` (separate poison domain).
- **Recommendation:** Never treat Preview Discovery GREEN as Prod alias readiness. Separate Evidence packs.

### B22 — Acc scrub coverage gap: `facetHints` not scrubbed
- **Severity:** P1
- **Evidence:** `emit.js` `scrubFinding` checks `id/title/summary/entityRefs` only; spreads `...f` retaining `facetHints`. Forbidden QID tokens inside `facetHints[]` would survive finding-level scrub (bucket scrub only applies to aggregated facets).
- **Recommendation:** Scrub or drop `facetHints` entries that match forbidden QID / `valueHasForbidden` before emit. Acc regression test with injected hint.

### B23 — Acc scrub coverage gap: `contradictions` pass-through
- **Severity:** P1
- **Evidence:** `sanitizeDiscoveryPayload` builds `out = { ...snapshot, findings, evidence, facets, … }` — **no** dedicated contradictions scrub. Pipeline sets `session.contradictions = detectContradictions(...)` **before** scrub; `emitSnapshot` includes `contradictions`. Stripped finding ids can remain listed in `contradictions[].findingIds` even after findings drop.
- **Recommendation:** Filter contradictions to surviving finding ids post-scrub, or scrub/drop contradictions in `sanitizeDiscoveryPayload`.

### B24 — Entity-Agnostic: Discovery pipeline clean; Pack provider gap
- **Severity:** P2
- **Evidence:** `providers.js` / `facets.js` / `softEntityResolve` treat seed as opaque (hash softRefs). No hardcoded person names under `api/lib/discovery/*.js` (test asserts absence of `davidCohen`/`isSmith` keys). Core `knownIdentities.js` **does** hardcode seeds — allowed for **Core Entity Mode SoT**, must not bleed into Discovery branches. Pack/boundaries list **viaf** provider; `DEFAULT_PROVIDERS = [wikidataProvider, openLibraryProvider]` only.
- **Recommendation:** Add viaf Discovery provider **or** amend Pack provider map. Keep Core seeds out of Discovery conditionals.

### B25 — Schema↔runtime: Finding `additionalProperties:false` vs extras
- **Severity:** P2
- **Evidence:** `schemas/finding.schema.json` forbids extras; `rankFindings` attaches `scoreIdentity: null` and `ranking:{…}` (`store.js`). Tests assert `scoreIdentity === null`.
- **Recommendation:** Extend schema (allow `ranking`, forbid/omit `scoreIdentity`) **or** strip extras at emit. Prefer omit `scoreIdentity` key entirely (null still violates agnostic optics).

### B26 — Schema↔runtime: Evidence extras
- **Severity:** P2
- **Evidence:** `schemas/evidence.schema.json` properties closed; `normalizeRawHit` adds `url`, `domain`, `evidenceType`.
- **Recommendation:** Update schema to allow provenance aliases **or** strip before emit/schema-check gate.

### B27 — Schema↔runtime: DiscoverySession shape
- **Severity:** P2
- **Evidence:** `discovery-session.schema.json`: `findings` items = **string**, `facets` = **object**. Runtime sessions/snapshots embed **finding objects** and `facets` as **array** (`aggregateFacets` return).
- **Recommendation:** Align schema to runtime (embedded findings + facet array) — Pack freeze follow-up; blocks strict schema gate.

### B28 — Pack S7 relationship layer stub
- **Severity:** P2
- **Evidence:** `orchestrator.js` sets `session.stage = 'S7'` then immediately `S8`; `graph.edges = []` always; no relationship expansion module.
- **Recommendation:** Implement evidence-backed edges in later wave **or** document S7 as reserved-no-op in Pack addendum.

### B29 — Local Acc helper duplication beside SoT
- **Severity:** P3
- **Evidence:** `emit.js` reimplements `valueHasForbidden` while also importing SoT primitives from `forbiddenIdentities.js` (which has its own `valueHasForbidden`).
- **Recommendation:** Import/share one helper to avoid scrub drift.

### B30 — Dual sessionStore import surface + deprecated Map helper
- **Severity:** P2
- **Evidence:** `store.js` re-exports `sessionStore`/`healthCheck`/… from `sessionStore.js`; `index.js` also exports them; `getSessionStore` marked `@deprecated` but still exported and returns `createMemoryMapAdapter()`.
- **Recommendation:** Single import path (`sessionStore.js` or orchestrator). Keep Map adapter test-only; never promote path.

---

## Explicit non-findings (verified OK / already fixed)

| Topic | Status |
|-------|--------|
| `getStoreInfo().durable` false-positive on fs-regen | **Fixed in current code** (`durable = vercel-kv \|\| upstash`) — interim C-STORAGE note stale |
| Discovery create/GET/narrow/SSE Acc scrub entrypoints | Present (`emitSnapshot` / SSE chunk scrub) |
| Discovery calling `mayCommitDossier` | **Not found** |
| Secrets in docs | None written |

---

## KV credentials note

**BLOCKED** — no Upstash/Vercel KV env pair on project. Adapter + fs-regen continue; **promote remains HOLD**.


---

## P1 closure fold · 2026-09-20 ~07:24 IDT

See `MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md` + `MEGA-B-ACC-EMIT-GLANCE-ארכיטקט-2026-09-20.md`.

| ID | Status |
|----|--------|
| B17 / B18 | OPEN — Server in progress (telemetry/durable=false; KV creds BLOCKED) |
| B21 | DOCUMENTED drift |
| B22 facetHints | OPEN (emit.js still spreads unscanned hints) |
| B23 contradictions | OPEN (no post-scrub filter in sanitizeDiscoveryPayload) |
| Candidates Acc scrub | **CLOSED** (delete out.candidates after SoT scrub) |

**HOLD promote · Core locked · NO Core rewrite.**
