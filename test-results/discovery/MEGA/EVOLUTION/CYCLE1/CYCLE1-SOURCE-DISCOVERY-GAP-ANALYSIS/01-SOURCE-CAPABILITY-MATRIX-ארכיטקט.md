# 01 — SOURCE CAPABILITY MATRIX · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט (Arch) · **Deepen inventory:** @שרת  
**Mode:** Gap Analysis · DOCS ONLY · **NO code** · **NO EXP-B** · **NO promote**  
**Locks:** A2 EXPERIMENTAL-BASELINE FROZEN · B0 `dpl_Avyhr…` FROZEN · Core `dpl_8ag…` LOCKED  
**Seeded from:** `api/lib/discovery/providers.js` · PHASE4 `ARCH-SOURCE-INVENTORY-BIAS` · `SERVER-PROVIDER-INVENTORY-שרת`

> Do **not** invent that a source is live if it is not. Prefer public/legal sources only.  
> MULTI is a **metric**, not the product objective. Goal: **MAXIMUM PUBLIC-WEB DISCOVERY** without inventing relationships.

---

## Status legend

| status | meaning |
|--------|---------|
| **live** | On B0 `DEFAULT_PROVIDERS` and observed in emit |
| **live_experimental_preview_only** | On A2 Preview via `DISCOVERY_ENABLE_VIAF=1` — **not** B0 |
| **candidate_*** | Missing or unused — proposal only |
| **OWNER:@שרת** | Server must deepen host/ToS/rate/endpoint inventory |

---

## LIVE today (code + emit)

| source | hostFamily | data types | identifier types | authority | coverage | freshness | cost | rate / budget | failure modes | privacy/safety | independence | status |
|--------|------------|------------|------------------|-----------|----------|-----------|------|---------------|---------------|----------------|--------------|--------|
| Wikidata | wikimedia | registry labels; QID; descriptions; optional P214 enrich | `qid:` · `wd-Q*` · P214→`viaf:` when enrich | high (DOMAIN_AUTHORITY 0.9) | strong notable persons/orgs/docs; thin for URL/role/compound; corps often P214=[] (S04 class) | retrievedAt proxy ≈0.9 — not source mtime | free · authMode=none | wbsearchentities limit=8 · providerMs | partial at cap; homonym QIDs; work/talk noise; error some seeds | public-only · Acc scrub | SAME family as Wikipedia — WD+WP ≠ multi-independent | **live** |
| Wikipedia OpenSearch | wikimedia | page titles; OpenSearch snippets (often empty on B0) | `wp:{lang}:{title}` — rarely mint qid/viaf/ol | medium-high EN 0.7; HE host defaults 0.4 if missing from DOMAIN_AUTHORITY | notable names; HE path underused without locale=he | retrievedAt proxy | free | OpenSearch limit=6 · robots=respect | quote_mean≈0 / thin≈100% B0; EN bias for HE seeds | public-only | wikimedia — not independent of Wikidata | **live** |
| Open Library | openlibrary | author registry; bibliographic noise | `ol:` · OL*A · remote_ids→viaf/qid when enrich | medium 0.75 | authors/person-like; weak companies/URLs | retrievedAt proxy | free | authors search limit=8 | publication noise (QD-05); missing remote_ids → FN coalesce | public-only | independent of wikimedia; B0 multi still 0 until cross-family Evidence attach (A2-safe Preview) | **live** |
| VIAF | viaf | authority AutoSuggest; nametype personal/corporate/geographic | `viaf:` · WKP→qid when present | high for library-authority persons; weak modern corps without WKP (S04) | rich canonical persons (S01); person-homonyms for brands; org granularity (S05) | authority-file currency | free AutoSuggest | limit=8 · nametype filter | person hits for corp seeds; no WKP → no typed triangle; titleSecondary disagree → RELATED | public-only · Adv 28/28 hardening | DISTINCT family — required for A2-safe multi-independent attach | **live_experimental_preview_only** |

**Runtime:** `DEFAULT_PROVIDERS = [wikidata, openlibrary, wikipedia]`; VIAF only if `DISCOVERY_ENABLE_VIAF=1` (`getDefaultProviders()`).

---

## Missing / candidate sources

| source | hostFamily (proposed) | why interesting | independence vs live | risk / ToS | status | OWNER |
|--------|----------------------|-----------------|----------------------|------------|--------|-------|
| Hebrew Wikipedia (locale-driven) | wikimedia | HE seeds (S07); already coded host switch `locale===he` | NOT independent of EN wiki / WD | low — already wired, unused on default locale=en | **candidate_partially_wired** | Arch + @שרת locale path |
| URL / domain origin metadata | web_origin | S06/S16 URL seeds empty; public HTTPS origin only — NO open crawl | NEW family | SSRF · urlSafety mandatory · host ToS | **candidate** | @שרת + Security |
| SEC EDGAR (public filings) | filings | US public-company legal authority (S04-class coverage — **not** S04 recovery hack) | NEW family | SEC fair-access UA; name→CIK ambiguity | **candidate** | @שרת |
| National / company registries | gov_registry | legal entity numbers; jurisdiction match | NEW family | jurisdiction miss; brand≠legal; some paid OUT | **candidate** | @שרת |
| News / press (public RSS) | news | freshness; HE news locale | NEW family | FP collisions; paywall; outlet monoculture | **candidate** | @שרת |
| ORCID / Crossref | scholarly | researcher DOI/ORCID | scholarly ≠ OL if hosts distinct | name ambiguity; non-scholar empty | **candidate** | @שרת |
| Gov / official portals | gov | DOMAIN_AUTHORITY 0.85 orphan — no emitter | gov family | allowlist; SSRF; political sensitivity | **candidate** | @שרת |
| Wayback CDX | archives | historical evidence ≠ identity | archives family | polite use; holes; slow | **candidate** | @שרת |
| RDAP (public WHOIS) | web_origin | domain registration public fields | pairs with web_origin | GDPR redaction; prefer RDAP not scrape | **candidate** | @שרת |
| web_public open crawler | web | max surface | would be independent | Acc+Security co-bound; Phase A freeze interface-only | **candidate_deferred_interface_only** | Chief+Security |

---

## Key facts (evidence-backed)

- B0 live adapters = **exactly 3** (WD · OL · WP). VIAF = code present + Preview flag · **absent from B0**.
- Independence families on B0 emit: `{wikimedia, openlibrary}` · multi-independent rate **0.0**.
- A2-safe Preview: VIAF + typed coalesce → mean multi **~0.21** · S01-heavy · S04=0 · S05 low — **frozen experimental**, not promoted.
- `DOMAIN_AUTHORITY` lists gov/edu weights with **no live emitters** (orphan).
- Prefer public/legal candidates only.

---

## OWNER markers

| Who | Fill |
|-----|------|
| **@שרת** | Deepen endpoint inventory, ToS, rate limits, error taxonomy → extend `01-SOURCE-CAPABILITY-MATRIX.json` |
| **@דיוק** | Acc scrub implications per candidate family |
| **@בודק** | Corpus seeds that exercise each live/candidate row |
| **@ממשק** | Surface implications for source-diversity UI (see PHASE4 UX note) |

Companion JSON (seed): `01-SOURCE-CAPABILITY-MATRIX.json` (if present — Server may replace).
