# ARCH-L3 · F11 Capability Registry SPEC · ארכיטקט

**Stamp:** 2026-09-24T07:51:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · Tech Lead · **SPEC ONLY**  
**Mode:** DOCS ONLY · **NO** `*.js` / `*.mjs` / `*.html` / `package.json` edits · **NO HTTP** · **NO adapter implementation** · **NO promote**  
**Lane:** MD-WAVE L3 (Chief `00-GAP-MAP.md` §L3)  
**Collision:** Server owns runtime (`providers.js` / `webOrigin.js` / `security.js` / `familyOrchestrator.js`) — Arch did **not** touch them  
**Align:** `api/lib/discovery/candidateFamilies.js` (RO) · SoT `03-SOURCE-FAMILY-CONTRACT` · `budget.js` `FAMILY_STATUS` · orch skip `candidate_unwired_f11`

---

## One-liner

**F11 capability registry contract** for `registries` / `filings` / `news` (appendix: scholarly / government / archives) — **wired:false · productionEligible:false · no HTTP · orch must keep honest `unsupported`** until separate Chief GO on a first adapter.

Hebrew: **רשם יכולות F11 בלבד — בלי HTTP, בלי השקה, עד GO נפרד.**

---

## 0. Non-goals (binding)

| Forbidden this L3 | Why |
|-------------------|-----|
| New HTTP adapter / host / crawl / SERP | F11 HOLD · Chief: no invent SERP · C1 URL-alone→UNKNOWN frozen |
| Flip `wired:true` / `productionEligible:true` | Promote forbidden |
| Edit L1 Server files | Server owns runtime gap map / providers |
| Schedule F11 families into live launches | Orch already skip; plan must not fake GO |
| Name→domain invent via commercial SERP | Critical path hole stays MISSING until separate Arch/Server GO (not this L3) |
| Duplicate Chief `00-GAP-MAP.md` | Gap classifications live there; this doc = **capability registry contract only** |

---

## 1. Capability schema (closed fields)

Extends SoT 03 SourceFamily descriptor + existing `CANDIDATE_FAMILIES` shape. Every F11 family **must** carry these fields in registry (design target; runtime already has most via `candidateFamilies.js`).

```text
CapabilityFamilyDescriptor
  familyId            string   // snake_case · stable
  displayName         string
  authorityClass      enum     // registry | media | bibliographic | government | archive | …
  independenceClass   enum     // independent | shared_host_family | dependent | untrusted_web | unknown
  hostFamily          string   // corroboration tag · distinct per F11 family until shared CDN proven
  safetyClass         enum     // trusted_api | public_metadata | untrusted_web | credentialed
  capabilities[]      string   // closed capability verbs (below)
  entityTypes[]       string   // subset of seed classes
  inputRequirements[] string   // raw_seed | typed_ref | url | domain | locale | registry_id | filing_id
  outputTypes[]       string   // finding | evidence | typed_soft_ref | url_candidate | document_meta
  costClass           low|medium|high
  latencyClass        low|medium|high
  rateLimitClass      string   // e.g. external | sec_edgar | companies_house
  failureModes[]      string   // ⊆ budget.FAMILY_STATUS + adapter taxonomy
  previewFlag         string   // DISCOVERY_ENABLE_* · default OFF when later wired
  b0                  false    // NEVER true for F11
  productionEligible  false    // ALWAYS until Chief promote GO
  wired               false    // ALWAYS until Chief GO on first adapter
  providerIds[]       []       // empty until adapter GO
  skipReason          'candidate_unwired_f11'
  // ── L3 extensions (design; not yet on disk) ──
  healthHooks         object   // see §3
  budgetHooks         object   // see §3
  citeOrDrop          object   // see §5
  orchPlugPolicy      object   // see §4
```

### Closed capability verbs (F11)

| Verb | Meaning | Allowed families |
|------|---------|------------------|
| `search` | Lexical / identifier search over public metadata | all six |
| `lookup_by_id` | Fetch by stable public id (CIK, CRN, DOI, …) | registries · (future scholarly) |
| `filing_search` | Search regulatory filing corpus (not body scrape) | filings |
| `headline_search` | Public headline / press-release metadata (not full-text crawl) | news |
| `origin_metadata` | **Forbidden** on F11 families | reserved for `web_origin` only |

**No** `serp_search` · **no** `crawl` · **no** `browser_automation` verbs in this registry.

### Closed soft-ref / output rules

| May emit (when later wired) | Must NOT emit |
|-----------------------------|----------------|
| `finding` + `evidence` with `confirmationState='candidate'` | `fact` / identity commit |
| Facets / public ids as **facet strings** | New coalesce keys (`cik:`/`crn:`/`isin:`) without separate A2 SoT GO |
| `url_candidate` only after `urlSafety` + plan-visible `urlTargets` | Hidden fetch / name→SERP invent |
| Typed soft-refs **only** if SoT already allows (`viaf:`/`qid:`/`ol:`) | `title:` / `web_origin:` / URL-alone SAME-* |

---

## 2. Primary families (align `candidateFamilies.js`)

### 2.1 `registries`

| Field | Spec value | Runtime today (RO) |
|-------|------------|--------------------|
| familyId | `registries` | ✓ |
| authorityClass | `registry` | ✓ |
| independenceClass | `independent` | ✓ |
| hostFamily | `registries` | ✓ (until first adapter proves shared host) |
| safetyClass | `public_metadata` | ✓ |
| capabilities | `search`, `lookup_by_id` | ✓ |
| entityTypes | `company`, `organization` | ✓ |
| inputRequirements | `raw_seed` (+ design: `registry_id` when lookup) | raw_seed only today |
| outputTypes | `finding`, `evidence` (+ design: `url_candidate` after safety) | finding, evidence |
| costClass / latency | medium / high | ✓ |
| rateLimitClass | `external` (design rename ok: `companies_registry`) | external |
| failureModes | timeout, error, empty, unsupported, unavailable | ✓ |
| previewFlag | `DISCOVERY_ENABLE_REGISTRIES` | ✓ |
| wired / productionEligible / providerIds | **false / false / []** | ✓ |
| skipReason | `candidate_unwired_f11` | ✓ |

**Conceptual provider slot (NOT implemented):** public company registry class (e.g. Companies House / OpenCorporates-class **public API**). Naming a vendor here ≠ authorize HTTP.

**Independence:** distinct `hostFamily:'registries'` ⇒ may count as independent of `wikimedia` / `openlibrary` / `viaf` **once** a real adapter exists and hostFamily stays distinct. Until then corroboration count = 0 (unsupported rows do not corroborate).

### 2.2 `filings`

| Field | Spec value | Runtime today (RO) |
|-------|------------|--------------------|
| familyId | `filings` | ✓ |
| authorityClass | `registry` (SoT: regulatory filings sit under registry authority; optional future `regulatory` enum = HOLD) | ✓ `registry` |
| independenceClass | `independent` | ✓ |
| hostFamily | `filings` | ✓ |
| safetyClass | `public_metadata` | ✓ |
| capabilities | `search` (+ design verb `filing_search`) | search only |
| entityTypes | `company`, `organization` | ✓ |
| inputRequirements | `raw_seed` (+ design: `filing_id`) | raw_seed |
| outputTypes | `finding`, `evidence`, `document_meta` (design add) | finding, evidence |
| costClass / latency | medium / medium | ✓ |
| rateLimitClass | `external` (design: `sec_fair_access` class) | external |
| failureModes | timeout, error, empty, unsupported, unavailable | ✓ |
| previewFlag | `DISCOVERY_ENABLE_FILINGS` | ✓ |
| wired / productionEligible / providerIds | **false / false / []** | ✓ |

**Conceptual provider slot:** SEC-EDGAR-class **public** filing metadata (title, form type, filed date, accession) — **not** full HTML scrape, **not** private feeds.

**Epistemic ceiling:** filing hit = candidate document evidence about an org seed. Form title / issuer name lexical overlap ≠ SAME-ENTITY. URL in filing → `url_candidate` only via plan+urlSafety; C1 Bound still applies.

### 2.3 `news`

| Field | Spec value | Runtime today (RO) |
|-------|------------|--------------------|
| familyId | `news` | ✓ |
| authorityClass | `media` | ✓ |
| independenceClass | `independent` (design note: many wire APIs share CDN → may downgrade to `shared_host_family` when first adapter known) | ✓ independent |
| hostFamily | `news` | ✓ |
| safetyClass | `untrusted_web` | ✓ |
| capabilities | `search` (+ design `headline_search`) | search |
| entityTypes | person, organization, company, ambiguous | ✓ |
| inputRequirements | `raw_seed` | ✓ |
| outputTypes | `finding`, `evidence` | ✓ |
| costClass / latency | medium / medium | ✓ |
| rateLimitClass | `external` | ✓ |
| failureModes | timeout, error, empty, rate_limited, unavailable (+ design: unsupported) | no `unsupported` today — **add on wire** |
| previewFlag | `DISCOVERY_ENABLE_NEWS` | ✓ |
| wired / productionEligible / providerIds | **false / false / []** | ✓ |

**Hard rules for news (even after future GO):**

- **No commercial SERP** invent · no Google/Bing web search as Discovery family.
- Headline / snippet = **untrusted_web** evidence · relationship ceiling ≤ POSSIBLE-MATCH without typed soft-refs.
- Must not mint attach soft-refs from headline text.
- Prefer public press-release / open news **metadata APIs** over scrape; scrape = separate Chief GO (likely REJECT under F11 spirit).

---

## 3. Health + budget hooks (contracts only)

### 3.1 Health hooks (design)

```text
FamilyHealthSnapshot
  familyId
  wired: false                 // F11 always false until GO
  adapterPresent: false        // providerIds.length === 0
  previewFlag
  previewFlagOn: boolean       // env read only; ON alone MUST NOT launch if wired:false
  lastSkipReason: 'candidate_unwired_f11'
  lastStatus: 'unsupported'    // when journaled
  httpAllowed: false           // hard
```

**Rule:** `previewFlagOn && !wired` ⇒ still **unsupported** (flag without adapter ≠ launch). Prevents “flag theater.”

### 3.2 Budget hooks (design · align `budget.js`)

| Hook | Behavior for F11 (unwired) |
|------|----------------------------|
| `canLaunch` / `reserve` | **Must not reserve** requests/urls for F11 — skip before reserve (today: orch continues with `unsupported` + `requestsUsed:0`) |
| `recordUsage` | No findings/evidence deltas from F11 |
| `denyUnplannedFanout` | Empty B0 ≠ invite filings/news |
| Status taxonomy | Journal `status:'unsupported'` · `outcomeClass` via `outcomeClassForStatus('unsupported')` → `SOURCE_UNSUPPORTED` |
| Caps (future wire) | When Chief GO wires first adapter: inherit `DEFAULT_DISCOVERY_BUDGET`; add family-specific `maxFamilyCalls` slice; `silentExpansionForbidden:true` stays |

**Future wire cost sketch (NOT authorized):**

| Family | Typical reserve need | Notes |
|--------|----------------------|-------|
| registries | requests:1–2 · urls:0 | lookup_by_id may +1 |
| filings | requests:1–2 · urls:0 | metadata only |
| news | requests:1 · urls:0 | headline API; if returns URLs → separate urlTargets gate, never auto-fetch |

---

## 4. Family Orchestration plug-in (without launch)

### 4.1 Dependency direction

```text
QueryPlan (intents may *name* conceptual families)
    ↓ read-only descriptors
candidateFamilies / SOURCE_FAMILIES registry
    ↓
planOrchestration.planLaunches  → mark skip / statusHint:unsupported
    ↓
familyOrchestrator.runFamilyOrchestration
    → candidateSkipReason / CANDIDATE_FAMILY_IDS
    → journal unsupported · requestsUsed:0 · NEVER provider.search
    ↓
budget ledger unchanged (no reserve for F11)
    ↓
emit / SSE / graph   → no F11 findings; optional gap row honest
```

**Providers / security / webOrigin sit below adapters** — F11 has **zero** adapters ⇒ those modules stay untouched.

### 4.2 Required orch invariants (already true · must not regress)

Cite RO: `familyOrchestrator.js` ~417–435 · `planOrchestration.js` ~112–119 · `sourceFamily.js` `isUnwiredIntent` / `familySkipReason` · `candidateFamilies.js` `candidateSkipReason`.

| Invariant | Binding |
|-----------|---------|
| F11 in plan list | Allowed as **descriptor visibility** only |
| F11 launch | **Forbidden** while `wired:false` |
| Journal status | `unsupported` + `skipReason:'candidate_unwired_f11'` |
| Fake `ok` / empty-as-success | **Forbidden** |
| Flag ON alone | **Does not** authorize HTTP |
| Intent ids `DISCOVER_FILINGS` / `DISCOVER_NEWS` / `DISCOVER_REGISTRIES` | Exist in QueryPlan vocab; `isUnwiredIntent` → skip path |

### 4.3 How a future Chief GO flips one family (procedure sketch · not this wave)

1. Chief GO names **one** family + **one** public host/API + flag still default OFF.  
2. Server adds adapter under `providers.js` (or sibling) + allowlist + tests + budget account.  
3. Arch/Server set `wired:true` **only** for that family; `providerIds:[…]`; keep `productionEligible:false`.  
4. Orch: remove from hard F11 skip **only** when `wired:true` **and** previewFlag ON.  
5. Measure dual-run · Acc · SSRF if URLs · **separate** promote GO later.  

Until step 1–3 complete: this L3 registry stays conceptual.

### 4.4 URL / domain plug (no identity leap)

F11 families **must not** close Chief §E name→domain MISSING hole by inventing SERP.

| Allowed (future) | Forbidden |
|------------------|-----------|
| Emit `url_candidate` from **cited** official field (registry website column, filing cover URL) after `assertSafePublicHttpsUrl` | Guess domain from org name |
| Feed candidate into plan `urlTargets` with provenance `{sourceFamily, sourceRecordId, extractionMethod}` | Silent expansion / hidden fetch |
| web_origin fetch only if `DISCOVERY_ENABLE_WEB_ORIGIN` + C1 Bound | URL-alone → SAME-* |

C1 freeze unchanged: **URL-alone → UNKNOWN**.

---

## 5. Cite-or-drop (emit contract)

Align adapterContract / stampRegistryFinding spirit:

| Rule | F11 (when unwired) | F11 (when later wired) |
|------|--------------------|------------------------|
| No findings | Correct | Prefer omit over invent |
| confirmationState | n/a | always `candidate` |
| identityClaim | n/a | always `false` |
| Acc scrub | n/a | same surfaces as B0 |
| Provenance | n/a | require `providerId`, `sourceRecordId` or drop |
| Relationship | n/a | ≤ POSSIBLE-MATCH without typed soft-refs; news ≤ UNKNOWN often |
| Gaps | May surface `family_unsupported:filings` style gap | honest empty ≠ fanout |

---

## 6. Intent ↔ family map (conceptual scheduling)

| IntentId (vocab exists) | Primary family | Scheduled in `intentsForSeedClass` today? | Orch outcome if forced |
|-------------------------|----------------|-------------------------------------------|------------------------|
| `DISCOVER_REGISTRIES` | registries | **No** (F11 HOLD) | unsupported |
| `DISCOVER_FILINGS` | filings | **No** | unsupported |
| `DISCOVER_NEWS` | news | **No** | unsupported |

Company/org seeds today route to B0 (+ authority if VIAF flag) — **not** filings/registries. That HOLD is intentional (Chief 00-GAP-MAP · SoT D08b).

Design note for future GO: company seedClass may add priority intents for registries/filings **after** wired:true — still behind flags · still budget-capped · still no SERP.

---

## 7. Appendix — secondary F11 families

Same schema · same hooks · same orch plug · still **wired:false**.

### 7.1 `scholarly`

| Field | Value (align runtime) |
|-------|----------------------|
| authorityClass | bibliographic |
| independenceClass | independent · hostFamily `scholarly` |
| safetyClass | trusted_api |
| capabilities | search |
| entityTypes | person, document, organization |
| previewFlag | `DISCOVERY_ENABLE_SCHOLARLY` |
| Conceptual slot | Crossref-class **public** metadata (DOI) — not Sci-Hub / PDF scrape |
| Soft-ref | DOI as **facet only** until SoT GO; do not mint `doi:` coalesce key silently |

### 7.2 `government`

| Field | Value |
|-------|-------|
| authorityClass | government |
| independenceClass | independent · hostFamily `government` |
| safetyClass | public_metadata |
| capabilities | search |
| entityTypes | organization, company, person |
| previewFlag | `DISCOVERY_ENABLE_GOVERNMENT` |
| Conceptual slot | Open data portals / official public datasets — jurisdiction-specific; no private FOIA bypass |

### 7.3 `archives`

| Field | Value |
|-------|-------|
| authorityClass | archive |
| independenceClass | independent · hostFamily `archives` |
| safetyClass | public_metadata |
| capabilities | search |
| entityTypes | person, organization, document |
| previewFlag | `DISCOVERY_ENABLE_ARCHIVES` |
| Conceptual slot | Digital archive catalog APIs (metadata) — no bulk dump crawl |

---

## 8. Acceptance checklist (docs / future Server)

| # | Check | Owner |
|---|-------|-------|
| 1 | All six remain `wired:false` · `productionEligible:false` · `providerIds:[]` | Runtime (today true) |
| 2 | Orch journal F11 → `unsupported` + `candidate_unwired_f11` · 0 HTTP | Server (today true) |
| 3 | No SERP / crawl verb in registry | Arch (this SPEC) |
| 4 | previewFlag names stable (`DISCOVERY_ENABLE_{FILINGS,NEWS,REGISTRIES,SCHOLARLY,GOVERNMENT,ARCHIVES}`) | Arch + future flags.js |
| 5 | Health: flag ON ∧ !wired ⇒ still unsupported | Design invariant |
| 6 | Budget: no reserve for unwired | Design · orch |
| 7 | C1 URL-alone UNKNOWN unchanged | Frozen |
| 8 | First adapter requires **separate Chief GO** | Chief |
| 9 | This L3 does **not** claim WIRED_E2E for any F11 family | Honesty |

---

## 9. What Server must NOT do from this SPEC alone

- Implement adapters  
- Add hosts to allowlist  
- Flip flags default ON  
- Schedule DISCOVER_FILINGS/NEWS/REGISTRIES into `intentsForSeedClass`  
- Feed F11 into dual-run TREATMENT as success criteria  

**What Server may do later (after Chief GO):** implement **one** adapter matching this schema; keep flag OFF; unit+SSRF+budget tests; leave `productionEligible:false`.

---

## 10. Deliverables / cites

| Artifact | Path |
|----------|------|
| This SPEC | `GO-IMPL-500/MD-WAVE/ARCH-L3-F11-CAPABILITY-REGISTRY-SPEC-ארכיטקט.md` |
| Wave report | `GO-IMPL-500/MD-WAVE/LOCAL-WAVE-ARCH-L3.md` |
| Chief gap map (do not duplicate) | `GO-IMPL-500/MD-WAVE/00-GAP-MAP.md` |
| Runtime descriptors (RO) | `api/lib/discovery/candidateFamilies.js` |
| Orch skip (RO) | `familyOrchestrator.js` · `planOrchestration.js` |
| SoT | `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/03-SOURCE-FAMILY-CONTRACT.md` |

**Runtime edits this wave: 0.** · **Promote: NO.** · **F11 HOLD.**

---

## STOP

L3 capability registry SPEC closed · registries/filings/news primary · appendix scholarly/government/archives · plug without launch · no HTTP · no SERP · no promote
