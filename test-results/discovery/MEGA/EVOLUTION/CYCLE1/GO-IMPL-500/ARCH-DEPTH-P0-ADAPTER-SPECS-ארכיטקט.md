# ARCH-DEPTH-P0-ADAPTER-SPECS · ארכיטקט · GO-IMPL-500

**Stamp:** 2026-09-23T22:49:49+0300 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · **implementation specs only** · Server implements later  
**Mode:** DOCS ONLY · **NO** `*.js` / `*.mjs` / `*.html` / `package.json` edits · **NO promote**  
**F11:** deepen **existing** hosts only — `www.wikidata.org` · `openlibrary.org` · `en|he.wikipedia.org`  
**Chief remap:** P0-3 = Wikipedia `pageprops→qid` + short extract (opportunities ranked this P1-1; Chief GO elevates to P0 for this wave)  
**Collision:** Server owns Preview SSRF — Arch does **not** touch `security.js` / `providers.js` (write) / `familyOrchestrator.js` / `emit.js` / `index.html`

**Sources (RO cites):**
- `EXISTING-ADAPTER-SOURCE-OPPORTUNITIES-ארכיטקט.md` (P0-1, P0-2, P1-1→Chief P0-3)
- `SOT-DRIFT-CHECK-ארכיטקט.md` · `LOCAL-WAVE-ARCH-SOT.md`
- `api/lib/discovery/providers.js` (WD ~L271–370 · OL ~L373–470 · WP ~L473–543 · `buildTypedSoftRefs` L204–226 · `viafIdsFromWikidataEntity` L258–269)
- `adapterContract.js` (`stampRegistryFinding` SAME→UNKNOWN · `confirmationState:'candidate'` · `identityClaim:false`)
- `evidenceGraph.js` (`urlAloneCeiling` · typed soft-ref coalesce `viaf:|qid:|ol:` only · `FORBIDDEN_GRAPH_RELATIONSHIPS`)
- `budget.js` `DEFAULT_DISCOVERY_BUDGET` (`maxRequests:24` · `maxProviderMs:3500` · `maxRetries:0`)
- `flags.js` pattern (`envOn` · default OFF · snapshot)

---

## Cross-cutting rules (all three P0s)

| Rule | Spec |
|------|------|
| Hosts | **No new registrable domains.** Same URL families already fetched. |
| Soft-refs | Coalesce attach keys remain **`viaf:` / `qid:` / `ol:` only** (`buildTypedSoftRefs` + `evidenceGraph` regex). Do **not** mint `isbn:` / `doi:` / `lc:` / `wp:` / `title:` / `instance:` as coalesce keys. |
| Epistemic | `confirmationState='candidate'` · `identityClaim=false` · prefer omit/UNKNOWN over invent · title-alone ≠ SAME-REFERENCE |
| Relationship | Adapter boundary already clamps SAME-* → UNKNOWN (`stampRegistryFinding`). Enrichment must not set SAME-ENTITY. Max useful typed path: `same-reference` only when `qid:`/`viaf:`/`ol:` present. |
| Soft-fail | Enrichment errors push `adapterErrorRecord` + keep search hits (`providers.js` P214 / OL remote_ids pattern). |
| Acc | Facet/summary strings pass existing scrub surfaces; no forbidden QIDs; no identity theater strings like `relationship:SAME-ENTITY`. |
| Plan urlTargets | P856 / canonical URLs → **candidate** for plan `urlTargets` **only after** existing `urlSafety` / SSRF gate (Server). Never hidden expansion. |
| Tests | Unit **names only** below — Arch does **not** add `*.test.mjs`. |
| Promote | **NO** `productionEligible:true` · **NO** alias retarget |

---

## Flag matrix (default OFF)

| Flag env | Default | Gates |
|----------|---------|-------|
| `DISCOVERY_WD_CLAIM_PACK` | **OFF** | P0-1 parse/emit of allowlisted claims beyond P214 |
| `DISCOVERY_OL_WORKS_SEARCH` | **OFF** | P0-2 `/search.json` works path |
| `DISCOVERY_WP_PAGEPROPS` | **OFF** | P0-3 `action=query` extracts+pageprops enrich |

**Snapshot:** extend `discoveryFlagSnapshot()` with the three booleans (read-only env) when Server implements.  
**B0 verbatim:** flag OFF ⇒ current provider emit surface unchanged (WD still enriches P214 only; OL authors only; WP OpenSearch only).  
**QueryPlan independence:** these flags are **adapter-depth** knobs; they do not require `DISCOVERY_ENABLE_QUERYPLAN` (may run on B0 provider path when ON — Server choice). Prefer gating inside provider `search()` so B0 OFF path stays byte-stable when flags OFF.

---

## P0-1 · Wikidata bounded claim pack (existing `wbgetentities`)

### 1. Current behavior (cite)

| Step | Today | Cite |
|------|-------|------|
| Search | `wbsearchentities` → up to 8 QIDs; finding `id=wd-Q…`, `entityRefs=buildTypedSoftRefs({qid})`, facets `provider:wikidata`/`kind:registry` | `providers.js` L294–320 |
| Enrich | **One** batch `wbgetentities&ids=Q…\|…&props=claims` | L327–331 |
| Parse | **Only** `claims.P214` → `viaf:` soft-refs via `viafIdsFromWikidataEntity` | L258–269 · L336–347 |
| Cost | Search **1** + claims batch **1** = **2 HTTP** / provider call (already) | — |
| Important | `props=claims` already returns the full claims object; P31/P569/… are **present in response today but ignored** | L328–330 |

### 2. Proposed request / response mapping

**Request change:** **none required** for first cut. Keep existing `wbgetentities` URL (`props=claims`). Optional later (not this P0): `&props=claims` stays; do **not** add SPARQL.

**Parse allowlist** (when `DISCOVERY_WD_CLAIM_PACK=1`):

| Prop | Datavalue shape | Emit mapping | Soft-ref? |
|------|-----------------|--------------|-----------|
| **P214** | string digits | keep current → `viaf:` | **YES** (`viaf:`) |
| **P31** | wikibase-entityid `Q…` | `facetHints` += `instance:Q…` (cap **3** distinct); optional summary bit `instance:Q…` | **NO** |
| **P569** | time `+YYYY-MM-DDT…` | facet `birth:YYYY` or `birth:YYYY-MM-DD` (year-prefer if month/day `00`); summary append only if non-empty | **NO** |
| **P570** | time | facet `death:YYYY` (same normalize) | **NO** |
| **P27** | entityid | facet `citizenship:Q…` (cap **2**) | **NO** |
| **P106** | entityid | facet `occupation:Q…` (cap **3**) | **NO** |
| **P856** | string URL | facet `officialWebsite:https://…` **only if** URL passes existing public-HTTPS classifier used for provenance/urlSafety; may feed plan `urlTargets` candidate list **after** SSRF gate — **never** mint soft-ref from URL | **NO** |

**Helper sketch (Server):** `claimPackFromWikidataEntity(entity) → { facetHints:string[], summaryBits:string[], viafIds:string[], officialWebsiteUrls:string[] }`  
Reuse P214 helper; add small snak readers (`mainsnak.datavalue.value` entity id / time / string). Prefer omit on missing/malformed snak.

**Finding patch (flag ON):**
- Merge facets into existing `facetHints` (dedupe; hard cap **12** total new claim facets per finding).
- Optionally append ≤160 chars of summaryBits to `summary` / `provenance.signalSummary` (normalizeAdapterText).
- `extractionMethod`: `api_search+claims` (already) or `api_search+claims_pack` when any non-P214 facet attached.
- `entityRefs`: **only** grow via `buildTypedSoftRefs({ viafId, qid })` — unchanged contract.
- `confirmationState` / `identityClaim`: untouched (`stampRegistryFinding` path).

### 3. Budget cost

| Item | Delta |
|------|-------|
| Extra HTTP | **0** (parse already-fetched claims JSON) |
| CPU / bytes | Negligible; still under `maxResponseBytes` of existing claim response |
| Ledger `requests` | No change vs today |
| Risk | Facet cardinality → keep caps above; do not dump all claims |

### 4. Identity ceilings

- P31 / P106 / P27 / dates = **search/facet hints only** — never “is person = identity truth”.
- P856 URL ≠ SAME-* · ≠ `entityRefs` · C1 Bound still applies if only URL evidence.
- No `instance:Q5` ⇒ coerce seedClass/person.
- Description lexical overlap still ≤ possible-match; claims do not authorize SAME-ENTITY.
- Forbidden QID bait: existing `stampRegistryFinding` / Acc scrub remains authoritative.

### 5. Acceptance tests (unit names only — do not add files)

1. `wd_claim_pack_flag_off_parses_p214_only`
2. `wd_claim_pack_flag_on_emits_instance_occupation_facets`
3. `wd_claim_pack_does_not_mint_softref_from_p31_or_p856`
4. `wd_claim_pack_p214_still_adds_viaf_softref`
5. `wd_claim_pack_malformed_snak_omitted_soft_fail`
6. `wd_claim_pack_facet_caps_respected`
7. `wd_claim_pack_p856_unsafe_url_dropped`
8. `wd_claim_pack_zero_extra_http_mock_count`

### 6. STOP / non-goals

- SPARQL / WbStack / query.wikidata.org fanout  
- Unbounded claim dump / `props=*` label thrash (P1 sitelinks is **out**)  
- New hosts · Commons file fetch from P18  
- Treat P31 as coalesce / promote key  
- Invent birth year from description text when P569 absent  

### 7. Flag needs

**`DISCOVERY_WD_CLAIM_PACK`** default **OFF**. OFF = today’s P214-only behavior (B0 claim surface stable).

---

## P0-2 · Open Library works `/search.json` (same host)

### 1. Current behavior (cite)

| Step | Today | Cite |
|------|-------|------|
| Search | `GET https://openlibrary.org/search/authors.json?q=…&limit=8` | `providers.js` L395 |
| Map | author `key` → `ol:` soft-ref · `kind:registry` · summary from `top_work` | L399–423 |
| Enrich | up to **6** `GET /authors/{OL…A}.json` → `remote_ids.viaf` / `wikidata` | L425–454 |
| Cost | **1 + ≤6** HTTP / provider call | — |
| Gap | No works/editions search; document seedClass still hits **authors** path only | `queryPlan.js` document → bibliographic family, but adapter ignores doc shape |

### 2. Proposed request / response mapping

**When:** `DISCOVERY_OL_WORKS_SEARCH=1` **AND** (`req.hints?.seedClass === 'document'` **OR** `req.hints?.preferWorks === true` **OR** capability routing passes `doc` with bibliographic intent).  
**When flag OFF or person/org seed:** keep authors path verbatim.

**Request (same hostFamily `openlibrary.org`):**
```
GET https://openlibrary.org/search.json?q={encodeURIComponent(q)}&limit=8
```
Optional safe params already public: `fields=key,title,author_name,author_key,first_publish_year,isbn,edition_key,cover_edition_key,publisher` (if Server wants smaller payload — optional).

**Response `docs[]` → finding map:**

| JSON field | Finding field |
|------------|---------------|
| `key` (e.g. `/works/OL45804W`) | `sourceRecordId` = normalized work key `OL…W`; `id` = `ol-work-{safe}`; provenance `https://openlibrary.org{key}` |
| `title` | `title` (normalize ≤240) |
| `author_name[]` | summary prefix `Authors: a; b` (cap 3 names); facet `authorName:…` |
| `author_key[]` | facet `authorKey:OL…A` (cap 3); **do not** auto-launch author enrich fanout from works hit in v1 |
| `first_publish_year` | facet `firstPublishYear:YYYY` |
| `isbn[]` | facet `isbn:…` (cap 3) — **facet only** |
| `edition_key[]` / `cover_edition_key` | facet `edition:OL…M` (cap 2) |
| soft-ref | `entityRefs = buildTypedSoftRefs({ olKey })` after extending normalizer to accept **`/works/OL…W`** and bare `OL…W` (and optionally `/books/OL…M`) — still prefix `ol:` |

**`buildTypedSoftRefs` extension (Server):** today strips only `/authors/` (L218–223). Spec: also strip `/works/` and `/books/`; accept keys matching `/^OL\d+[AMW]$/i`. Do **not** add `isbn:` to soft-ref builder.

**Kind / evidence:** `kind: 'document'` or keep `registry` with facet `kind:work` — prefer **`kind:'document'`** + `evidenceType:'document'` for Acc clarity; `facetHints`: `provider:openlibrary`, `kind:work`.

**Enrichment v1:** **no** per-work detail hop (avoid authors-style ×6 blowup). Soft-refs from work key alone. Optional P1: single cover_edition `.json` — **out of this P0**.

**Dual-path policy (flag ON + ambiguous seed):**
- If seedClass `document` → **works only** (replace authors for that call).
- If seedClass `person`/`organization` → **authors only** (unchanged).
- If `ambiguous`/`unknown` → authors first (current); do **not** silently issue both (would +1 HTTP always). Server may add explicit hint later.

### 3. Budget cost

| Scenario | HTTP delta vs today |
|----------|---------------------|
| Flag OFF | **0** |
| Flag ON + document seed | **1** search (works) **instead of** authors search; **0** author detail hops → often **cheaper** than authors path (1 vs 1+≤6) |
| Flag ON + both paths (forbidden in v1) | would be +1 — **STOP** |

Ledger: still one provider invocation; `requests` +=1 for the search.json call (same as authors.json today).

### 4. Identity ceilings

- Bibliographic finding = **candidate document evidence**.
- Title match alone ≠ SAME-REFERENCE to person seed.
- `isbn:` / `doi:` facets ≠ coalesce keys.
- `authorKey` facet ≠ auto SAME-REFERENCE to a person finding without shared `viaf:`/`qid:`/`ol:` author key attach (and even then graph clamp rules apply).
- Do not invent ISBN from title.

### 5. Acceptance tests (unit names only)

1. `ol_works_flag_off_uses_authors_json_only`
2. `ol_works_flag_on_document_seed_hits_search_json`
3. `ol_works_maps_title_year_isbn_facets`
4. `ol_works_mints_ol_softref_for_work_key`
5. `ol_works_does_not_mint_isbn_softref`
6. `ol_works_no_per_hit_detail_fanout`
7. `ol_works_person_seed_still_authors_when_flag_on`
8. `ol_works_title_alone_not_same_reference`

### 6. STOP / non-goals

- HTML scrape · mirrors · `openlibrary.org` non-JSON browse pages  
- Subject/facet vanity search (P2)  
- Parallel authors+works on every call  
- ISNI/`remote_ids` completeness (P1-3)  
- New host / archive.org borrow links as identity  

### 7. Flag needs

**`DISCOVERY_OL_WORKS_SEARCH`** default **OFF**.

---

## P0-3 · Wikipedia `pageprops→qid` + short extract (same wiki host)

### 1. Current behavior (cite)

| Step | Today | Cite |
|------|-------|------|
| Search | MediaWiki `action=opensearch` on `en.wikipedia.org` or `he.wikipedia.org` | `providers.js` L497–501 |
| Map | title, desc snippet, page URL; `entityRefs: ['wp:lang:title']`; **no `qid:`** | L508–528 |
| Enrich | **none** (return after OpenSearch) | L530–535 |
| Cost | **1 HTTP** | — |
| Gap | `wp:` ref is **not** an A2 coalesce key (`evidenceGraph` only `viaf|qid|ol`) → Wikipedia hits cannot typed-attach to WD/VIAF/OL without pageprops |

### 2. Proposed request / response mapping

**When:** `DISCOVERY_WP_PAGEPROPS=1` and OpenSearch returned ≥1 title and budget signal not aborted.

**Request (same host as OpenSearch):**
```
GET https://{en|he}.wikipedia.org/w/api.php
  ?action=query
  &prop=extracts|pageprops|info
  &ppprop=wikibase_item
  &exintro=1
  &explaintext=1
  &exchars=400
  &inprop=url
  &titles={Title1|Title2|Title3}
  &format=json
  &origin=*
```
**Title cap:** top **min(3, findings.length)** titles only (not all 6) to bound bytes/CPU.  
**Encoding:** join with `|`; `encodeURIComponent` per title; MediaWiki allows multiple titles.

**Response map → patch existing OpenSearch findings (match on title):**

| API field | Emit |
|-----------|------|
| `pageprops.wikibase_item` (`Q…`) | Merge `buildTypedSoftRefs({ qid })` into `entityRefs` (**this is the P0 win**) |
| `extract` | Prefer as `summary`/`quote` if longer/cleaner than OpenSearch desc; `normalizeAdapterText(…, 400)` |
| `info.canonicalurl` or `fullurl` | If present and safe HTTPS same-host, may refresh `provenanceUrl` for consistency; must still pass SSRF/public check used for provenance |
| missing/`invalid` page | skip patch; keep OpenSearch row |

**extractionMethod:** `api_search+pageprops` when qid or extract applied.  
**Facets:** keep `provider:wikipedia`/`kind:page`; add `wikibase:Q…` facet optional (qid soft-ref is enough).  
**Do not** remove `wp:lang:title` ref (non-coalesce provenance aid); additive `qid:` is what enables attach.

### 3. Budget cost

| Item | Delta |
|------|-------|
| Extra HTTP | **+1** query call when flag ON and ≥1 hit |
| Titles | Cap **3** in one batch (single request — not N requests) |
| Worst case per WP provider call | OpenSearch 1 + query 1 = **2 HTTP** (still well under `maxRequests:24` / `maxProviderMs:3500`) |
| Abort | Honor `budget.signal`; soft-fail query → return OpenSearch-only findings |

### 4. Identity ceilings

- `qid:` from `pageprops` = **typed soft-ref** (good) — enables `same-reference` path when graph has typed hay; still **candidate ≠ fact**.
- Page extract lexical overlap ≤ **possible-match**; never title-only SAME-REF.
- Do not parse infobox as identity commit.
- Do not follow interwiki / Wikidata sitelinks fanout from this call (P1-2 separate).
- `wp:lang:title` alone still does **not** satisfy `urlAloneCeiling` typed-ref check (regex is viaf|qid|ol only) — correct.

### 5. Acceptance tests (unit names only)

1. `wp_pageprops_flag_off_opensearch_only_no_second_http`
2. `wp_pageprops_flag_on_batches_top3_titles_one_query`
3. `wp_pageprops_qid_merged_into_entityrefs_via_buildTypedSoftRefs`
4. `wp_pageprops_extract_caps_400_chars`
5. `wp_pageprops_missing_wikibase_item_keeps_opensearch_row`
6. `wp_pageprops_soft_fail_returns_partial_opensearch`
7. `wp_pageprops_title_alone_without_qid_not_same_reference`
8. `wp_pageprops_he_host_stays_he_wikipedia_org`

### 6. STOP / non-goals

- Full article crawl · `prop=revisions` · parse wikitext infobox  
- Langlinks expansion (P2-1)  
- New domains (wikimedia.org commons file, wikidata.org from WP adapter) — WD remains separate family  
- Treating OpenSearch desc overlap as SAME-REFERENCE  

### 7. Flag needs

**`DISCOVERY_WP_PAGEPROPS`** default **OFF**.

---

## Implementation order (Server suggestion)

1. **P0-1** first — **0 extra HTTP**, highest leverage, touches existing claims batch.  
2. **P0-3** second — +1 HTTP, unlocks cross-family `qid:` attach from encyclopedia.  
3. **P0-2** third — document-seed quality; replace path under flag.

Each behind its own flag; land tests named above in Server’s provider/adapter suites (Arch does not add files).

---

## Server handoff checklist

| # | Item |
|---|------|
| 1 | Add 3 `envOn` flags + snapshot fields (default OFF) |
| 2 | P0-1: `claimPackFromWikidataEntity` + wire under flag in existing claims loop |
| 3 | P0-2: branch `search.json` for document seed; extend `buildTypedSoftRefs` olKey for works |
| 4 | P0-3: post-OpenSearch `action=query` top-3 batch under flag |
| 5 | Unit tests (names in §§5) green; no new hosts in allowlists |
| 6 | Confirm `security.js` / SSRF pack untouched by this deepen (P856/urlTargets still Server SSRF lane) |
| 7 | **NO promote** |

---

## §25 STOP board (this wave)

| Trigger | Status |
|---------|--------|
| F11 new HTTP host/adapter | **CLEAR** — same three hosts |
| Core / B0 unfreeze | **CLEAR** — flags OFF preserve surfaces |
| A2-bound / title-bridge | **CLEAR** — soft-ref set unchanged (qid/viaf/ol only) |
| C1 URL→SAME | **CLEAR** — P856/canonical not soft-refs |
| Identity theater | **CLEAR** — facets ≠ truth |
| Unbounded fanout | **CLEAR** — caps + maxRetries 0 |
| Arch runtime edits | **CLEAR** — docs only |

---

## Hebrew room one-liner

מפרטי העמקה (P0) מוכנים לשרת: ויקידאטה claims קיימים בלי HTTP נוסף, Open Library `search.json` למסמכים, ו־Wikipedia pageprops→qid — הכל מאחורי דגלים OFF ובלי HTTP חדש / בלי promote.

---

## STOP

Arch-depth P0 specs **CLOSED (docs)** · zero runtime edits · **NO promote** · Server may schedule under locks · Preview SSRF remains Server-owned.
