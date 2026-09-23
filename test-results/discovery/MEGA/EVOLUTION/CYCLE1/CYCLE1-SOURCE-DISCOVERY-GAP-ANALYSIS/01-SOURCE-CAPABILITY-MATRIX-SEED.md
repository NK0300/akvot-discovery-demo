# 01 — SOURCE CAPABILITY MATRIX

**Stamp:** 2026-09-20T11:00:19+03:00 · Asia/Jerusalem (IDT / UTC+3)
**Mode:** Analysis only · NO CODE · NO Preview deploy for new features · NO EXP-B · NO promote
**Locks:** B0 `dpl_Avyhr…` FROZEN · Core `dpl_8ag…` LOCKED · A2 experimental baseline FROZEN

> Do **not** invent that a source is live if it is not. Prefer public/legal sources only.

## Status legend
| status | meaning |
|--------|---------|
| **live** | On B0 `DEFAULT_PROVIDERS` and observed in emit |
| **live_experimental_preview_only** | On A2 Preview via `DISCOVERY_ENABLE_VIAF=1` — **not** B0 |
| **candidate_*** | Missing or unused — proposal only |

## LIVE today

| source | hostFamily | data types | identifier types | authority | coverage | freshness | cost | rate limit | failure modes | privacy/safety | independence semantics | status |
|--------|------------|------------|------------------|-----------|----------|-----------|------|------------|---------------|----------------|------------------------|--------|
| Wikidata | wikimedia | registry entity labels; QID; descriptions; optional P214/WKP crosswalks when enrich | qid:; wd-Q*; P214→viaf when enrich | high (structured KG registry; prestige DOMAIN_AUTHORITY 0.9) | strong for notable persons/orgs/docs; weak for URL/role/compound seeds; corporate brands often thin on authority IDs (S04 P214=[]) | registry currency; runtime freshness factor≈0.9 from retrievedAt not source mtime | free public API; authMode=none | wbsearchentities limit=8/query; provider budgetMs; public fair-use | partial at hit cap; error on some seeds (S10); homonym QIDs; work/talk QIDs as publication noise | public-only; Acc scrub of forbidden identity tokens | SAME family as Wikipedia (wikimedia). WD+WP ≠ multi-independent. | **live** |
| Wikipedia OpenSearch | wikimedia | encyclopedia page titles; OpenSearch snippets (often empty on B0) | page title/URL; rarely mints qid:/viaf:/ol: for coalesce | medium-high prestige (EN 0.7); HE host defaults to 0.4 if missing from DOMAIN_AUTHORITY | good for notable names; HE path underused without locale=he; under-keyed for A2 coalesce | page revisions exist but not consumed; factor≈0.9 retrievedAt | free public MediaWiki API | OpenSearch limit=6; robots=respect | quote_mean≈0 / thin=100% on B0; EN bias for HE seeds; false-friend OpenSearch titles; error on S10 | public-only | wikimedia — does NOT count as independent of Wikidata | **live** |
| Open Library | openlibrary | library author registry; bibliographic noise (works-about-person) | ol:; OL*A; remote_ids when enrich | medium (DOMAIN_AUTHORITY 0.75); bibliographic not corporate legal | authors/person-like; weak for companies/URLs; high volume | catalog currency; retrievedAt proxy | free public API | authors search limit=8 | publication/author noise (QD-05); missing remote_ids → FN for coalesce; sole survivor when WD/WP error | public-only | independent of wikimedia; B0 multi still 0 because Evidence not co-attached on Finding until A2-safe Preview | **live** |
| VIAF | viaf | authority control crosswalk; personal/corporate/geographic nametype AutoSuggest | viaf:; WKP links when present | high for persons with library authority; weak/mismatched for modern corps without WKP (S04) | rich for canonical persons (S01); person-homonyms for brand names; org granularity issues (S05 ICRC≠Movement) | authority file currency | free public AutoSuggest/SRU | AutoSuggest limit=8; nametype filter | person VIAF hits for corp seeds; no WKP → no typed triangle; titleSecondary disagree → related-entity; force-merge forbidden | public-only; Acc adversarial 28/28 on hardening | DISTINCT family from wikimedia/openlibrary — required for A2-safe multi-independent attach | **live_experimental_preview_only** |

## Missing / candidate sources

| source | hostFamily | data types | identifier types | authority | coverage | freshness | cost | rate limit | failure modes | privacy/safety | independence semantics | status |
|--------|------------|------------|------------------|-----------|----------|-----------|------|------------|---------------|----------------|------------------------|--------|
| Hebrew Wikipedia (locale-driven) | wikimedia | HE encyclopedia pages | page URL/title | medium; DOMAIN_AUTHORITY miss → default 0.4 today | HE person/org seeds (S07) | wiki revision | free | same OpenSearch | still same wikimedia family; thin snippets; transliteration gaps | public-only | NOT independent of EN wiki / Wikidata | **candidate_partially_wired** |
| URL / domain origin metadata | web_origin (proposed) | page title; og:site_name; HTTPS origin metadata — NO open crawl | hostname; canonical URL | variable (site-declared); groundedness gate required | S06/S16 URL/domain seeds currently empty/thin | live fetch of origin | egress + host ToS; public HTTPS only | strict per-session; urlSafety SSRF deny | SSRF; empty og tags; vanity count if uncapped; private IP probes | MUST reuse urlSafety; https-only; no private/link-local/metadata | NEW family ≠ wikimedia/openlibrary/viaf — true public-web discovery lever | **candidate** |
| Company filings / SEC EDGAR (public) | filings | 10-K/8-K filings; CIK; company legal names | CIK; ticker; accession | very high for US public companies (legal) | S04-like corps with US filings; not NGOs/persons | filing dates (true source currency) | free public SEC fair-access; User-Agent required | SEC fair access policy (strict) | name→CIK ambiguity; non-US corps miss; rate-limit bans; legal-name ≠ brand | public filings only; no non-public data | NEW family filings — addresses S04 AUTHORITY COVERAGE limitation | **candidate** |
| National / company registries (public) | gov_registry | legal entity name; company number; status | company_number; jurisdiction code | high legal authority when jurisdiction matches | orgs with registrable footprint; jurisdiction-specific | registry update lag | often free open data; some paid — OUT if paid/TOS blocks | per-registry | jurisdiction miss; brand≠legal name; scraping bans; HE/IL coverage uneven | public registry only; no private directors PII beyond public record intent | gov_registry family; DOMAIN_AUTHORITY already anticipates *.gov/*.gov.il but no emitter today | **candidate** |
| News / press wires (public RSS or open APIs) | news | headlines; datelines; named entities in copy | article URL; outlet domain | low–medium (journalistic; not legal identity) | fresh events/reputation; HE news for locale | high (core value) | free RSS; commercial APIs OUT unless licensed | outlet-specific | FP name collisions; paywall; bias/outlet monoculture; stale mirrors | public articles only; Acc scrub | NEW news family — freshness & corroboration, not authority-of-record | **candidate** |
| Scholarly / ORCID / Crossref (public) | scholarly | researcher profiles; DOI metadata; affiliations | ORCID; DOI | high for academics; weak for corps/celebrities | scholarly persons/docs; complements OL | publication dates available | free public APIs | polite pool | name ambiguity; non-scholar seeds empty; affiliation noise | public scholarly metadata | scholarly ≠ openlibrary (despite bibliographic adjacency) if hosts distinct | **candidate** |
| Government / official portals | gov | official pages; press releases; org charts | gov URL; agency codes | high official; DOMAIN_AUTHORITY 0.85 coded but unused | gov orgs, HE public figures official pages | variable | free public web; allowlisted fetch only | site-specific | allowlist maintenance; SSRF; thin pages; political content sensitivity | public gov pages; no citizen PII databases | gov family — distinct; table orphan until emitter | **candidate** |
| Web archives (Wayback CDX public) | archives | historical snapshots; first/last capture | archive URL; timestamp | medium historical evidence; not identity authority | historical entity / domain longevity | historical by design | free public CDX | IA polite use | holes in capture; slow; robots; over-claim longevity→identity | public captures only | archives family — evidence of history not same-entity | **candidate** |
| Public domain WHOIS / RDAP | web_origin | registrar; nameservers; registration events (public fields only) | domain; handle if public | medium for domain ownership signals; redaction common | domain seeds S06 | registry events | free RDAP | registry limits | GDPR redaction; privacy services; stale; whois scrape ToS — prefer RDAP | public RDAP fields only; no non-public WHOIS harvest | pairs with web_origin; not a person authority | **candidate** |
| web_public open crawler | web | arbitrary pages | URL | uncontrolled | max surface — high FP risk | live | high egress/ops | complex | SSRF; malware hosts; ToS; Acc leakage surface; vanity flood | Acc+Security co-bound; currently interface-only Phase A freeze | would be independent but OUT until Chief+Security GO | **candidate_deferred_interface_only** |

## Key facts (evidence-backed)
- B0 live adapters = **exactly 3**: wikidata · openlibrary · wikipedia (`SERVER-PROVIDER-INVENTORY`).
- VIAF = **code present + A2 Preview flag** · **absent from B0 DEFAULT_PROVIDERS** · frozen experimental.
- Independence families on B0 emit: `{wikimedia, openlibrary}` only · multi-independent rate **0.0**.
- A2-safe Preview: VIAF family + typed coalesce → mean multi **~0.21** · S01-heavy · S04=0 · S05 low.
- `DOMAIN_AUTHORITY` lists gov/edu weights with **no live emitters** (orphan).
- Prefer public/legal candidates only; `web_public` full crawler remains deferred.

See also: `01-SOURCE-CAPABILITY-MATRIX.json`.
