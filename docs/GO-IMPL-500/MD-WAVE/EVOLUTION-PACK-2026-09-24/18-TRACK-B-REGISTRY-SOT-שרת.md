# 18 · Track B step 1 · Registry SoT migrate · שרת · 2026-09-24

**Status:** **IMPLEMENTED** (map migrate + GW/DDG registry rows) · nightLoop→policy = still DESIGNED  
**Locks:** NO PROMOTE · TREATMENT untouched · flags default OFF · C1 hard · no Core/session/SSE edits  
**Pairs:** §05 · §16 · §17 FILL

---

## 1. What landed

| Change | Detail |
|--------|--------|
| SoT | `SOURCE_FAMILIES` derives `B0_FAMILIES` · `FAMILY_TO_PROVIDER` · `PROVIDER_TO_FAMILY` · `resolveFamilyProvider` |
| `queryPlan.js` | Stops owning hardcoded maps · imports/re-exports from `sourceFamily.js` |
| `familyOrchestrator.js` | Resolves provider id via registry helper · GW/DDG flag-off skip |
| Registry rows | `general_web` + `ddg_instant` per §17 (existing providers only) |

**Discovery Engine vs cleanup:** Registry SoT is engine plumbing (family growth without Core) — not product coverage; Wave 1 / MW2 product DONE unchanged.

---

## 2. Key test

```
git diff — touches only:
  api/lib/discovery/sourceFamily.js
  api/lib/discovery/sourceFamily.test.mjs
  api/lib/discovery/queryPlan.js
  api/lib/discovery/familyOrchestrator.js
  docs/.../18-TRACK-B-REGISTRY-SOT-שרת.md
  (+ README row if updated)
```

**No** Core / session / SSE path edits.

---

## 3. Tests

| Suite | Result |
|-------|--------|
| sourceFamily | **33 / 0** |
| queryPlan.wiring | **45 / 0** |
| npm run test:phase1 | **PASS** |
| loopSpine/night | **67 / 0** |
| generalWebSearch | **66 / 0** |
| ddgInstantAnswer | **78 / 0** |

---

## 4. OpenSearch flake (§13) — mitigation plan

QA MW2: coverage 3/6 · `opensearch_error` / `EMPTY_FRONTIER`.  
**Plan:** keep fail-closed (no invent candidates). Transient retry already in `generalWebSearch.js` (`attempts=2` on network/5xx).  
**IMPROVE landed (2026-09-24 · `gw.locale.1.3`):** bounded backoff before the single transient OpenSearch retry (`openSearchBackoffMs` · ~175–199ms, clamped to remaining GWS budget; rem≤0 → 0). Journal: `openSearchAttempts` / `openSearchRetried` / `openSearchBackoffMs`. Still fail-closed — empty findings on `opensearch_error` / timeout / abort. No new hosts · flags OFF · NO PROMOTE. Acc re-measure after deploy.

---

## 5. Explicit non-goals

- nightLoop full policy-unify on familyOrchestrator (Track B later)
- New adapters / hosts / F11 LIVE / promote / TREATMENT

**Tag:** IMPLEMENTED (registry SoT) · 2026-09-24 · **NO PROMOTE**

---

## 6. Addendum 2026-09-24 · capability-based intent match (§13/§19 gap · §04 §2)

**What changed:** intent→family membership is no longer hardcoded in `queryPlan.js`. It now comes from registry capability match:
`intent row capabilitiesNeeded ⊆ family.capabilities AND seedClass ∈ family.entityTypes AND eligible(flags)`.

- **Registry (`sourceFamily.js`) = declarations only.** Rows declare `capabilities[]` (closed `FAMILY_CAPABILITY_ENUM` = access `search|lookup_by_id|url_candidate` + intent `reference_search|open_knowledge_search|bibliographic_records|document_records|origin_metadata`), `entityTypes[]` (closed `ENTITY_TYPE_ENUM` = SEED_CLASSES) and optional plain `displayLabel {he,en}`. No priority, scoring, fallback or execution logic. `registryRowRejectReason` fail-closes rows with values outside the enums, identity-ish capabilities (identity/same/verified/claim…) or identity words in labels.
- `entityTypes` were widened to match what the families already served (e.g. knowledge_graph gets `url/domain/document`, web_origin gets `company/organization`). Nothing else reads `entityTypes`. `authority` deliberately omits `unknown` and `open_knowledge_search`, which keeps today's rules: unknown seeds are B0-only, and the url/domain fallback is B0-only.
- **queryPlan (`INTENT_SCHEDULE`)** keeps intent · priority · reason · `capabilitiesNeeded` per seedClass. The web-origin **fallback** (`fallbackCapabilitiesNeeded: open_knowledge_search`) lives here, not in the registry. There are no family-id literals in the schedule/membership code. The only family-id checks left in queryPlan.js are in the pre-existing `reasons` labels (`preview_viaf_flag` / `preview_web_origin_flag`), which were left untouched to keep output byte-identical.
- Helpers: `familiesForCapabilities` + `isFamilyRowEligible` (sourceFamily) · `familiesForIntent` + `INTENT_CAPABILITY_NEEDS` (queryPlan). `buildQueryPlan(input, { registry })` / `validateQueryPlan(plan, { registry })` provide a DI seam used only by tests. Production callers pass one argument.
- **validateQueryPlan (additive):** error `intent_family_capability_missing:<intent>:<family>` (fail-closed); warning `intent_family_entity_type_mismatch:…` (`ok` unaffected); result gains `warnings[]`.

**Parity (zero behavior change):**
| Gate | Result |
|---|---|
| QA golden `test-results/2026-09-24/QA-QUERYPLAN-GOLDEN-bb3a7f6.json` (35 cases, not modified) | **PARITY_OK** |
| `queryPlan.registryIntents.golden.test.mjs`: full planForSession/validate/plannedLaunches/launchesFromQueryPlan/skipReasons/eligible, 512 entries, golden frozen from pristine bb3a7f6 tree | **512/512 identical** |
| `queryPlan.registryIntents.parity.test.mjs`: verbatim legacy oracle vs registry, 128 combos × 10 intents = 1280 cells + +1 family + C1 identity reject | **0 diffs** |

**Not in this slice:** select-narrowing, empty-seed and org/.pdf classification behaviors are unchanged (next slices). No flag defaults changed · NO PROMOTE · no Core/session/SSE/UX edits.

**Tag:** IMPLEMENTED (capability match switch) · NO PROMOTE
