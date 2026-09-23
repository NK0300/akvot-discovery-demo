# EXISTING-ADAPTER-SOURCE-OPPORTUNITIES · ארכיטקט · GO-IMPL-500

**Stamp:** 2026-09-23T22:42:21+0300 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · **proposes only** · Server implements later  
**F11 boundary:** **NO new HTTP providers / adapters / domains / crawl / private APIs**  
**In scope:** Deepen **existing live** adapters only — `wikidata` · `wikipedia` · `openlibrary` · already-wired Preview `viaf` · `web_origin` (behind flags)  
**Out of scope:** filings / news / registries / scholarly / government / archives (remain `candidate_unwired_f11`)  
**Epistemic floor:** candidate ≠ fact · UNKNOWN preferred · typed soft-refs attach-only · title-alone ≠ SAME-REFERENCE

---

## Ranking legend

| Rank | Meaning |
|------|---------|
| **P0** | Highest leverage · same host · cheap · identity-safe · fits current budget shape |
| **P1** | Valuable · still same public API · slightly more props/queries |
| **P2** | Nice-to-have · keep tightly capped · easy to over-fetch |

Arch does **not** implement. Server may pick P0 items under separate GO; flags stay default OFF; **NO promote**.

---

## LIVE adapter inventory (read-only)

| Provider | Host(s) today | Current fetch | Already enriching |
|----------|---------------|---------------|-------------------|
| `wikidata` | `www.wikidata.org` | `wbsearchentities` + batch `wbgetentities&props=claims` | label, description, `qid:`, **P214→`viaf:`** |
| `wikipedia` | `en.wikipedia.org` / `he.wikipedia.org` | MediaWiki `action=opensearch` | title, desc snippet, page URL, `wp:lang:title` |
| `openlibrary` | `openlibrary.org` | `/search/authors.json` + `/authors/{key}.json` | name, top_work, `ol:`, remote_ids **viaf/wikidata** |
| `viaf` (flag) | `viaf.org` | `AutoSuggest` | viafid, displayForm, nametype, lc/dnb, WKP→`qid:` |
| `web_origin` (flag) | seed/urlTargets (public HTTPS only) | one-hop metadata | title/og/siteName/desc/snippet · relationship ceiling UNKNOWN |

---

## P0 — propose first (Server later)

### P0-1 · Wikidata — bounded claim pack on existing `wbgetentities`

**Idea:** Extend the **already-issued** `wbgetentities` batch (same URL family) beyond P214 to a small allowlisted prop set for **facet / evidence fields only** (not identity commit).

| Prop | Use as | Ceiling |
|------|--------|---------|
| **P31** (instance of) | `facetHints` / summary bit `instance:Q…` | candidate label only — never “is person = identity truth” |
| **P569 / P570** | life date strings in summary when present | UNKNOWN-safe biography hint |
| **P27** | country of citizenship as facet | not ownership / jurisdiction fact theater |
| **P106** | occupation facet (person seeds) | search hint ≠ merge key |
| **P856** | official website **URL candidate** → may feed plan `urlTargets` only after urlSafety | **must not** mint SAME-* from URL |
| **P214** | keep (already live) | typed `viaf:` soft-ref |

**Identity-safe ceiling:** extra claims → evidence/facets/`entityRefs` typed ids only when property is an authority id (P214 etc.). P31/P106 never authorize SAME-ENTITY. Prefer omit over invent.

**NOT to do:** SPARQL fanout crawls · unbounded claim dump · new hosts · treat description lexical overlap as SAME-REFERENCE.

### P0-2 · Open Library — works search on same host (not only authors)

**Idea:** For `document` / publication intents, add **`/search.json`** (works/editions) on `openlibrary.org` beside existing authors path — **same adapter**, same hostFamily.

| Field (public JSON) | Use |
|---------------------|-----|
| `key` / `edition_key` / `cover_edition_key` | `ol:` / edition soft-ref shape already in A2 vocab spirit |
| `title`, `author_name`, `first_publish_year` | finding title/summary |
| `isbn` / `doi` when present | document facets (not identity) |
| `author_key` | link to existing author enrich path |

**Identity-safe ceiling:** bibliographic finding = candidate document evidence. Title match alone ≠ SAME-REFERENCE to person seed.

**NOT to do:** scrape HTML · hit non-openlibrary mirrors · invent ISBN from title.

### P0-3 · VIAF AutoSuggest — use more fields already in JSON (no second hop required)

**Idea:** AutoSuggest rows already expose `nametype`, `lc`, `dnb`, `bnf`, `wkp`, etc. Surface more into `facetHints` / summary / optional typed refs **only for ids already returned**.

| Field | Proposal |
|-------|----------|
| `nametype` | facet `viafType:personal|corporate|geographic` (routing aid) |
| `lc` / `dnb` / other public codes in payload | facet strings `lc:…` (not new HTTP) |
| existing WKP | keep `qid:` soft-ref |

**Identity-safe ceiling:** extra authority codes are **references**, not coalesce keys unless SoT already allows (`viaf:`/`qid:`/`ol:`). Do **not** invent `lc:` as A2 coalesce key without separate Chief GO.

**NOT to do:** fetch full VIAF RDF/XML cluster pages · scrape · new OCLC endpoints beyond AutoSuggest without flag+GO.

---

## P1 — deepen next

### P1-1 · Wikipedia — `action=query` extract/pageprops on same wiki host

**Idea:** After OpenSearch, optionally `action=query&prop=extracts|pageprops|info` for top-N titles on **same** `*.wikipedia.org` host.

| Field | Use |
|-------|-----|
| `extract` (short) | richer quote/summary (cap chars) |
| `pageprops.wikibase_item` | `qid:` soft-ref when present → cross-family typed attach |
| `canonicalurl` | provenance consistency |

**Identity-safe ceiling:** `qid:` from pageprops is typed soft-ref (good). Page extract lexical overlap still ≤ POSSIBLE-MATCH; never title-only SAME-REF.

**NOT to do:** full article crawl · follow interwiki to new registries · parse infobox as identity commit.

### P1-2 · Wikidata — sitelinks / labels batch (same API)

**Idea:** `wbgetentities&props=labels|sitelinks` (or combined with claims) to expose Wikipedia sitelink titles as **search hints / provenance**, and multilingual labels for locale.

**Ceiling:** sitelink ≠ automatic Wikipedia family launch beyond plan; no silent fanout.

### P1-3 · Open Library — author `remote_ids` completeness + `works` list cap

**Idea:** Existing author `.json` already read; also map additional public `remote_ids` keys that appear (e.g. isni) as **facets only**; optionally cap `works` titles as publication evidence under bibliographic intent.

**Ceiling:** ISNI facet ≠ new coalesce key without GO. Works titles ≠ person SAME-REF.

### P1-4 · web_origin — enrich metadata fields already parsed (no crawl)

**Idea:** Ensure emitted `webOriginMeta` consistently carries `title`, `og:title`, `og:site_name`, `description`, `canonical` when present in the **single** allowed response — for UNKNOWN-labeled evidence quality only.

**Ceiling:** C1 Bound unchanged — URL-alone stays UNKNOWN; og/title never SAME-*; no second hop; no private-net.

**NOT to do:** link-following · sitemap · WHOIS · ownership inference (Design 06/17).

---

## P2 — optional / tightly capped

| ID | Adapter | Idea | Why P2 |
|----|---------|------|--------|
| P2-1 | Wikipedia | Langlinks limited to en↔he already in locale path | Easy locale thrash; keep budget tiny |
| P2-2 | Wikidata | P373 Commons category as facet | Low discovery value; noise risk |
| P2-3 | VIAF | Only if Chief GO: single public VIAF proxy JSON for one viaf id | New URL shape on viaf.org — needs explicit GO even if same registrable domain |
| P2-4 | OL | Subject/facet search | Broad; vanity risk |

---

## Cross-cutting rules (all ranks)

| Do | Don't |
|----|-------|
| Same public hosts already allowlisted | New domains / CDN scrape / Google / commercial SERP |
| Budget-account every extra fetch | Unbounded per-hit detail loops |
| `confirmationState=candidate` | Emit `fact` / identity commit |
| Prefer UNKNOWN when thin | Title-bridge SAME-REFERENCE |
| Typed soft-refs `viaf:`/`qid:`/`ol:` only for coalesce | `web_origin:` / `title:` / `lc:` as silent attach keys |
| Plan-visible urlTargets + urlSafety | Hidden expansion from P856/og:url |
| Soft-fail enrichment errors | Fail whole batch on enrich miss |

---

## Explicit F11 non-proposals (do not interpret as backlog to wire)

- SEC EDGAR / filings HTTP  
- News/RSS providers  
- Company registries / OpenCorporates-class  
- Crossref / scholarly new adapter  
- Government open-data portals  
- Digital archives hosts  
- Any “just one more provider” outside table above  

Those stay **`candidate_unwired_f11`** until separate Chief GO.

---

## Top 3 for Chief room (executive)

1. **P0-1 Wikidata bounded claims** (P31/P856/P106/… on existing wbgetentities)  
2. **P0-2 Open Library works search** on same host for document intents  
3. **P1-1 Wikipedia pageprops→qid** (+ short extract) on same wiki host  

---

## STOP

Arch proposal only · **NO runtime edits** · **NO F11 new HTTP** · **NO promote** · Server may schedule P0 under locks.
