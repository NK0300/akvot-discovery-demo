# 00-GAP-MAP · MD-WAVE · GO-IMPL-500 · CYCLE1

**Stamp:** 2026-09-24T07:48:36+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Workspace:** `/workspace/akvot-quick-demo`  
**Mode:** Honest code+test read · **NO invent PASS** · **NO promote** · Core/B0/A2/C1 frozen  
**Prior wave cited:** `INTERIM-FF-WAVE-REPORT.md` (2026-09-23) · `FINAL-500-EXECUTION-REPORT.md` · `CHIEF-GAP-ANALYSIS-REPORT.md` (2026-09-20 — partially superseded by later QueryPlan/web_origin code)

---

## 0. Classification legend

| Tag | Meaning |
|-----|---------|
| **WIRED_E2E** | Seed → pipeline → emit/SSE → UI path exists with real data flow (may still be flag-gated / Preview-only) |
| **PARTIAL** | Module exists and unit-tested; not fully flowing, flag-OFF default, or not user-visible in prod B0 |
| **CONCEPTUAL** | Types/docs/descriptors/stubs only — no HTTP / no orch launch |
| **MISSING** | No real implementation for the capability |

**Honesty rule:** Flag-default-OFF Preview path that works in unit/e2e when forced ON = **PARTIAL** for production user path, **WIRED_E2E (Preview/flag)** when the flag is considered as the evaluated surface. This map marks both.

---

## 1. Target path (SEED → UI) — flow verdict

| Step | Verdict | Evidence |
|------|---------|----------|
| SEED | **WIRED_E2E** | `POST /api/discovery/sessions` → `createDiscoverySession` (`api/discovery/sessions/index.js`, `orchestrator.js`) |
| UNDERSTAND (soft ER) | **PARTIAL** | `softEntityResolve` = opaque `seed:sha256` hash stub — not real ER (`providers.js` ~1105) |
| QUERY PLAN | **PARTIAL** | `buildQueryPlan` / `planForSession` real; gated by `DISCOVERY_ENABLE_QUERYPLAN` **default OFF** (`flags.js`, `planOrchestration.js`, `orchestrator.js` `shouldUseQueryPlan`) |
| FAMILY SELECT | **PARTIAL** | `runFamilyOrchestration` / `familyOrchestrator.js` executes when QueryPlan ON; B0 path skips it and flat-fans `getDefaultProviders()` |
| SEARCH/LOOKUP | **WIRED_E2E (B0)** | WD `wbsearchentities` + claims enrich; OL author search; WP OpenSearch — live HTTPS APIs |
| URL/DOMAIN DISCOVERY from **name** | **MISSING** | No SERP / name→domain resolver in Discovery. `web_origin` requires URL/hostname already known |
| SAFE FETCH | **WIRED_E2E (flag)** | `urlSafety.assertSafePublicHttpsUrl` + `webOrigin` metadata fetch; SSRF unit-green; **LIVE Preview SSRF still OPEN** (FF-SERVER) |
| EXTRACT | **PARTIAL** | Origin metadata (title/og) + registry fields; WD P856 → **facet only** when claim-pack ON — **not** auto-fed to fetch |
| NORMALIZE | **WIRED_E2E** | `normalizeRawHit` / `stampRegistryFinding` / fingerprint dedupe (`store.js`, `providers.js`) |
| CORROBORATE | **PARTIAL** | `coalesceBySoftEntity` + edges; A2 typed soft-ref coalesce needs VIAF flag; B0 multi-independence ≈0 across wikimedia |
| RELATIONSHIPS | **PARTIAL** | `relationship.js` + `sanitizeRelationshipGraph` always clamp; edges are evidence-provenance, not identity |
| GRAPH | **PARTIAL→WIRED (unit)** | `buildEvidenceGraph` in orch S6/S8; SSE `graph` additive when plan-SSE path; UI soft panel |
| UNKNOWN/GAPS | **WIRED_E2E** | `buildDiscoveryGaps` → `session.gaps` → emit scrub (`gaps.js`, `orchestrator.js` ~782) |
| SSE | **WIRED_E2E** | `GET …/sessions/:id/events` → `writeProgressiveSse` (`events.js`, `sse.js`); Acc scrub every chunk |
| UI | **WIRED_E2E** | `discovery-ui.js` EventSource + poll fallback + fixtures; plan/graph parsers defensive |

---

## 2. Areas A–O

### A — Discovery core

| Capability | Class | Cite |
|------------|-------|------|
| Session create + `runPipeline` stages S1–S10 | **WIRED_E2E** | `orchestrator.js` `runPipeline` |
| B0 flat provider fanout (flag OFF) | **WIRED_E2E** | `orchestrator.js` ~593–633 |
| QueryPlan + FamilyOrchestrator path | **PARTIAL** | Works when `DISCOVERY_ENABLE_QUERYPLAN=1`; default OFF = never entered in prod B0 |
| Soft ER / understand | **PARTIAL** | Hash stub only |
| Budget ledger / empty_no_fanout | **WIRED_E2E (flag path)** | `budget.js`, `familyOrchestrator.js`; B0 uses simpler wall/`providerMs` budgets |
| Dual-run harness | **PARTIAL** | `dualRunHarness.js` — measure helper, not user path |

### B — Public web

| Capability | Class | Cite |
|------------|-------|------|
| General web search (SERP) | **MISSING** | No Discovery SERP adapter. Core `api/lookup.js` has Bing **images** — **out of Discovery scope**, not wired here |
| Uncontrolled crawl | **MISSING (intentional)** | Hard lock; F11 |
| `web_origin` origin-metadata fetch | **PARTIAL** | Provider + one-hop in orch; needs `DISCOVERY_ENABLE_WEB_ORIGIN=1`; input must be URL/host or hints/`urlTargets` |
| Name → company website | **MISSING** | Critical product hole (see §4) |

### C — Families

| Family | Wired? | Class | Notes |
|--------|--------|-------|-------|
| `knowledge_graph` → `wikidata` | YES | **WIRED_E2E** | B0 default |
| `encyclopedia` → `wikipedia` | YES | **WIRED_E2E** | B0 default |
| `bibliographic` → `openlibrary` | YES | **WIRED_E2E** | B0 default |
| `authority` → `viaf` | Flag | **PARTIAL** | `DISCOVERY_ENABLE_VIAF` default OFF; A2-safe frozen experimental |
| `web_origin` → `web_origin` | Flag | **PARTIAL** | `DISCOVERY_ENABLE_WEB_ORIGIN` default OFF; C1 frozen (URL-alone → UNKNOWN) |
| `filings` / `news` / `registries` / `scholarly` / `government` / `archives` | NO | **CONCEPTUAL** | `candidateFamilies.js` `wired:false` · skip `candidate_unwired_f11` |

**Truly wired today (HTTP that can run):** WD, WP, OL always; VIAF + web_origin only when env flags ON.

### D — Providers

| Provider | Class | Notes |
|----------|-------|-------|
| `wikidataProvider.search` | **WIRED_E2E** | + optional claim pack (`DISCOVERY_WD_CLAIM_PACK`) |
| `openLibraryProvider.search` | **WIRED_E2E** | + optional works search (`DISCOVERY_OL_WORKS_SEARCH`) |
| `wikipediaOpenSearchProvider.search` | **WIRED_E2E** | + optional pageprops (`DISCOVERY_WP_PAGEPROPS`) |
| `viafProvider.search` | **PARTIAL** | Flag ON only |
| `webOriginProvider.search` | **PARTIAL** | Flag ON; SSRF-gated; metadata-only |
| Filings/news/registry HTTP | **CONCEPTUAL** | F11 HOLD |

### E — URL / Domain

| Capability | Class | Evidence |
|------------|-------|----------|
| Detect URL/hostname seed | **WIRED_E2E** | `looksLikeUrlOrHostname`, `detectSeedClass` |
| Normalize + SSRF gate | **WIRED_E2E** | `normalizeWebOriginSeed`, `urlSafety.js`, `security.js` urlTargets gate |
| Extract URLs embedded in seed text | **WIRED_E2E** | `extractUrlCandidatesFromSeed` |
| One-hop from finding `provenanceUrl` (non-wiki hosts) | **PARTIAL** | `orchestrator.js` ~645–719; **skipped on QueryPlan path**; wiki/OL/VIAF hosts skipped |
| WD P856 official website → fetch | **PARTIAL / hole** | `claimPackFromWikidataEntity` returns `officialWebsiteUrls` but caller **never uses** the array — only merges `facetHints` (`providers.js` ~468–481). Facet string ≠ web_origin Evidence |
| Discover domain from bare person/org **name** | **MISSING** | No resolver |

### F — Evidence

| Capability | Class | Cite |
|------------|-------|------|
| Fingerprint dedupe | **WIRED_E2E** | `store.js` |
| Enrich provenance/strength/why | **WIRED_E2E** | `evidence.js` `enrichSessionEvidence` |
| Acc scrub on emit | **WIRED_E2E** | `emit.js` |
| Candidate ≠ fact stamps | **WIRED_E2E** | `stampRegistryFinding`, family orch |
| Thick quotes / freshness | **PARTIAL** | Prior Acc reports: thin WP quotes; freshness proxy |

### G — Graph

| Capability | Class | Cite |
|------------|-------|------|
| `buildEvidenceGraph` in pipeline | **WIRED_E2E** | `orchestrator.js` S6 + rebuild S8 |
| URL-alone ceiling / block SAME-ENTITY | **WIRED_E2E** | `evidenceGraph.js` `urlAloneCeiling`; C1 lock |
| SSE `graph` event | **PARTIAL** | Additive when plan-SSE / QueryPlan path (`sse.js`); UI soft ingest |
| Live Preview graph e2e | **PARTIAL** | Unit+orch green; FINAL report: live Preview RUNNOW deferred |

### H — Corroboration

| Capability | Class | Cite |
|------------|-------|------|
| Soft-entity coalesce | **PARTIAL** | Stronger with VIAF typed refs (A2); B0 mostly shared-host |
| `corroborationEdges` on session | **WIRED_E2E** | orch → emit |
| Independence counting honesty | **PARTIAL** | WD+WP share `wikimedia` — correctly not double-counted (`sourceFamily.independenceTag`) |
| Multi-family corp corroboration | **MISSING** | Needs filings/registries |

### I — Intelligence

| Capability | Class | Notes |
|------------|-------|-------|
| Seed class / intent scheduling | **PARTIAL** | Real in `queryPlan.js`; flag OFF unused |
| Ranking / contradictions | **WIRED_E2E** | `rankFindings`, `detectContradictions` |
| LLM “understand” / dossier | **MISSING (intentional)** | Discovery Acc scrub forbids identity dossier; Core Entity Mode separate |
| Adaptive fanout on empty | **MISSING (intentional)** | Budget contract: empty ≠ fanout |

### J — Security

| Capability | Class | Notes |
|------------|-------|------|
| SSRF allow/deny + redirect re-gate | **WIRED_E2E (unit)** | `urlSafety.js`, `adapterContract.js`, `security.js` |
| Acc / forbidden QID redaction | **WIRED_E2E** | `forbiddenIdentities.js`, emit scrub |
| Rate limit | **PARTIAL** | Memory/in-process only; `distributed:false` honest (`requestGuards.js`) |
| LIVE Preview SSRF pack | **PARTIAL / OPEN** | FF-SERVER residual |
| Secrets in repo | **OK (policy)** | `.env.example` flags OFF; do not commit secrets |

### K — Observability

| Capability | Class | Cite |
|------------|-------|------|
| Metrics / structured logs | **PARTIAL** | `obs.js`, `logDiscoveryEvent` — scrubbed; Preview matrices exist historically |
| Health / store probe | **WIRED_E2E** | `api/discovery/health.js`, `sessionStore.js` (KV probe can fail in box → honest non-durable) |

### L — Persistence

| Capability | Class | Notes |
|------------|-------|------|
| In-memory /tmp + seed regen | **WIRED_E2E** | Default without KV |
| Vercel KV / Upstash | **PARTIAL** | When env present + probe OK; INTERIM: health promoteEligible mismatches observed in box |
| Cross-instance durable promote-eligible | **MISSING for promote** | Explicit lock: NO promote |

### M — UI

| Capability | Class | Cite |
|------------|-------|------|
| Discovery mode + progressive findings | **WIRED_E2E** | `discovery-ui.js`, `index.html` |
| SSE reconnect / Last-Event-ID | **WIRED_E2E** | UI + `sse.js` contract |
| Plan / graph / budget panels | **PARTIAL** | Parsers+panels exist; live plan/graph only when server emits (flag path) |
| Fixture progressive stages | **WIRED_E2E** | `discovery-fixtures/*` offline demo |
| Mobile / a11y polish | **PARTIAL** | Checkpoint D / FF-UX unit+smoke; browser paint sometimes deferred |

### N — Tests

| Capability | Class | Notes |
|------------|-------|------|
| Large unit/e2e surface | **WIRED** | `package.json` `test` / phase suites; FF wave cites hundreds green |
| Full suite fresh 1567/0 | **PARTIAL** | INTERIM: sessionStore 2 health fails in current box; prior 1567/0 historical only |
| Live Preview flag-ON Acc pack | **OPEN** | Not claimed PASS |

### O — Prod readiness

| Item | Class |
|------|-------|
| B0 Discovery alias locked | **WIRED** (frozen baseline) |
| QueryPlan / VIAF / web_origin / P0 deepen flags | **default OFF** |
| Promote / production enablement of experimental | **MISSING / LOCKED NO** |
| Distributed RL | **MISSING** |
| F11 new HTTP families | **HOLD / CONCEPTUAL** |

---

## 3. Chief questions 481–500 (evidence answers)

> Numbered “481–500” are treated as the Chief close-out cluster on families / URL discovery / plan orch / web search / SSE / flags (mission brief). Answers are from **current code**, not aspirational docs.

### Q: What families are truly wired? (WD/WP/OL and any others)

**Answer:**  
- **Always on (B0):** `wikidata` → family `knowledge_graph`; `wikipedia` → `encyclopedia`; `openlibrary` → `bibliographic`.  
  Cite: `DEFAULT_PROVIDERS` / `getDefaultProviders()` in `providers.js` ~1088–1118; `SOURCE_FAMILIES` in `sourceFamily.js`.  
- **Opt-in Preview flags:** `viaf` → `authority` (`DISCOVERY_ENABLE_VIAF`); `web_origin` → `web_origin` (`DISCOVERY_ENABLE_WEB_ORIGIN`).  
- **Not wired:** `filings`, `news`, `registries`, `scholarly`, `government`, `archives` — descriptors only (`candidateFamilies.js`, `wired:false`, orch skip `candidate_unwired_f11`).

### Q: Can it discover a URL/domain from a name without knowing the URL? How?

**Answer: NO (honest).**  
- `webOriginProvider.search` only collects candidates from: URL/hostname seed, URLs embedded in seed text, plan `urlTargets` / hints (`webOriginUrls`/`oneHopUrls`). Cite: `providers.js` ~997–1052.  
- One-hop in `runPipeline` takes **existing finding `provenanceUrl`s** (skipping wiki/OL/VIAF hosts) — does **not** invent domains from names. Cite: `orchestrator.js` ~645–670.  
- WD P856 official websites become **facetHints** under `DISCOVERY_WD_CLAIM_PACK` but **`officialWebsiteUrls` array is unused** by the caller — no automatic fetch. Cite: `providers.js` `claimPackFromWikidataEntity` + search loop ~463–511.  
- **No** Discovery SERP / RDAP / registry domain lookup.

### Q: Does QueryPlan / FamilyOrchestrator actually execute?

**Answer: YES when flag ON; NO on default B0 path.**  
- Gate: `shouldUseQueryPlan` → `isQueryPlanEnabled` → env `DISCOVERY_ENABLE_QUERYPLAN` (default OFF). Cite: `flags.js`, `planOrchestration.js` ~442, `orchestrator.js` ~435–592.  
- Flag ON + valid plan: `planForSession` → `runFamilyOrchestration` → journal/budget/findings merge.  
- Flag ON + invalid plan: kill-switch fallback to B0 flat fanout once.  
- Unit/e2e: `checkpointB.e2e.test.mjs`, phase1/phase2, goImpl harden — cited green in FF reports.

### Q: General web search — real or fake?

**Answer: FAKE / ABSENT in Discovery.**  
- Discovery providers are registry/API search only (WD/OL/WP/VIAF) + optional origin metadata fetch.  
- No Google/Bing/DDG/Searx adapter under `api/lib/discovery/`.  
- Core `lookup.js` Bing image path is **not** the Discovery engine and must not be counted as Discovery general web search.

### Q: Progressive SSE/UI — real?

**Answer: YES (WIRED_E2E).**  
- Server: `api/discovery/sessions/[id]/events.js` → `writeProgressiveSse` (`sse.js`) with Acc-scrubbed events (`meta|plan*|progress|provider|finding|graph*|facets|status|error|done`).  
- Client: `discovery-ui.js` EventSource + reconnect/backoff + poll fallback + fixtures.  
- Caveat: `plan`/`graph` additive events depend on QueryPlan/plan-SSE flags; default B0 still streams findings/progress/status/done.

### Q: Flags — Discovery-related and default state?

| Flag | Default | Role |
|------|---------|------|
| `DISCOVERY_ENABLE_QUERYPLAN` | **OFF** | Plan + family orch path |
| `DISCOVERY_ENABLE_PLAN_SSE` | **OFF** (auto-on if QueryPlan on) | SSE `plan`/`graph` additive |
| `DISCOVERY_ENABLE_VIAF` | **OFF** | VIAF provider + authority family |
| `DISCOVERY_ENABLE_WEB_ORIGIN` | **OFF** | web_origin provider + C1 fetch |
| `DISCOVERY_WD_CLAIM_PACK` | **OFF** | WD P31/P569/…/P856 facets |
| `DISCOVERY_OL_WORKS_SEARCH` | **OFF** | OL works `/search.json` |
| `DISCOVERY_WP_PAGEPROPS` | **OFF** | WP pageprops→qid + short extract |
| Candidate flags (`…_FILINGS` etc.) | N/A | Documented on unwired candidates only — **no runtime enable** |

Cite: `flags.js` `discoveryFlagSnapshot`; `.env.example` documents QueryPlan OFF.

---

## 4. Priority scenario: Person → unknown company website

**Desired:** seed person name → discover employer/company → discover official website → safe origin evidence → UI (without inventing SAME-ENTITY).

**What works today**
1. Person seed → WD/WP/OL hits (B0) — **WIRED**.  
2. Optional VIAF multi-ref coalesce (Preview) — **PARTIAL**.  
3. If user/seed already contains `https://company.com` → web_origin can fetch metadata (Preview flag) — **PARTIAL**.  
4. Graph/gaps/SSE show candidates honestly — **WIRED**.

**What fails / holes**
1. **No name→URL discovery** (MISSING).  
2. Org presence via WD does not schedule web_origin unless URL known; QueryPlan org intents add web_origin family only when flag ON, but provider still needs URL candidates — empty for bare names.  
3. P856 URLs sit as facets when claim-pack ON — **not** promoted to `urlTargets` / one-hop fetch (**PARTIAL hole** — highest leverage quick win).  
4. Filings/registries that would ground “official site” for obscure corps — **CONCEPTUAL / F11**.  
5. QueryPlan default OFF → scheduling intelligence unused in prod B0.

**Recommended next build (parallel lanes) — see §6**

---

## 5. Top 10 leverage opportunities (close many of the ~500 points)

1. **P856 → gated `urlTargets` / one-hop web_origin** (flag-safe, C1 UNKNOWN on URL-alone) — closes URL-discovery-from-KG without SERP.  
2. **Preview dual-run: QueryPlan ON + web_origin ON** measure pack (no promote) — proves orch+SSE plan/graph E2E on Preview.  
3. **Feed facet `officialWebsite:*` into plan urlTargets scrub path** — makes org/person seeds with WD websites produce real web Evidence.  
4. **Chief-GO F11: one registries/filings adapter** (SEC or Companies House class) — authority for corps / S04 class gaps.  
5. **Optional public search API (carefully SSRF-bounded, candidate URLs only, UNKNOWN)** — only after Chief GO; currently MISSING.  
6. **HE locale / WP he path measure** — coverage without new family.  
7. **Wire `officialWebsiteUrls` array (already computed) instead of re-parsing facets** — small honesty fix in `providers.js` WD path.  
8. **Distributed RL (Upstash)** — closes prod-readiness residual called out as OPEN.  
9. **LIVE Preview SSRF adversarial** — close FF-SERVER OPEN residual.  
10. **UI: surface gaps + officialWebsite facets + web_origin findings in executive QUICK READ** — makes PARTIAL server work user-visible.

---

## 6. Recommended first parallel build lanes

| Lane | Owner-shaped | Scope | Lock respect |
|------|--------------|-------|--------------|
| **L1 · WD→web_origin bridge** | Server | Use `pack.officialWebsiteUrls` → session hints / plan urlTargets → existing web_origin fetch; keep URL-alone UNKNOWN | A2/C1 frozen; flag-gate |
| **L2 · QueryPlan Preview measure** | Acc + Server | Flag-ON dual-run on Preview; plan SSE → UI; no promote | B0 verbatim when OFF |
| **L3 · F11 candidate #1 design** | Arch | Spec only for registries/filings adapter; still no HTTP until Chief GO | F11 HOLD until GO |
| **L4 · UX gaps/website surfacing** | UX | Display gaps + officialWebsite facets; no identity CTA | Acc scrub |

---

## 7. Prior honest status (scan)

| Artifact | Take-away used |
|----------|----------------|
| `INTERIM-FF-WAVE-REPORT.md` | FF-SERVER/UX/ACC shipped locally; LIVE Preview SSRF OPEN; distributed RL OPEN; no promote; sessionStore health flake in box |
| `FINAL-500-EXECUTION-REPORT.md` | Checkpoints A–E largely unit PASS; F PARTIAL; not production-ready |
| `CHECKPOINT-B-ARCH-GLANCE-FF.md` | WD/OL/WP/VIAF deepened; F11 no new HTTP; flags OFF |
| `CHIEF-GAP-ANALYSIS-REPORT.md` (2026-09-20) | Pre-QueryPlan snapshot — **superseded** on “No QueryPlan” claim; still valid that news/filings/SERP absent |
| `03-PRODUCT-VISION-GAP.md` | Vision “across the web” unmet in production — still true |

---

## 8. Non-claims (do not inflate)

- Does **not** claim 500/500 complete.  
- Does **not** claim general web search.  
- Does **not** claim name→domain discovery.  
- Does **not** claim promote-ready or distributed RL.  
- Does **not** claim QueryPlan runs in production B0 (flag OFF).  
- Does **not** treat candidateFamilies as wired.

---

**NO PROMOTE · flags default OFF · Core/B0/A2/C1 frozen · F11 HOLD**
