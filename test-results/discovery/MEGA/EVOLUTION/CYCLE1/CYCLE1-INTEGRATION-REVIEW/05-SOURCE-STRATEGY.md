# 05 — SOURCE STRATEGY · CYCLE1 INTEGRATION REVIEW

**Stamp:** 2026-09-20T12:21:00+03:00 IDT  
**Mode:** DOCUMENT-ONLY · factual trade-offs · **NO winner selection** · NO implementation  
**Revisit candidates:** SEC-EDGAR · registries · news · scholarly · HE locale · QueryPlan  
**(Context live:** B0 WD/WP/OL · A2 VIAF experimental · C1 WEB-ORIGIN experimental**)**

---

## How to read this section

Each candidate is scored on trade-off dimensions only. **Do not** treat order as ranking. Expected discovery value is qualitative relative to measured gaps (S04/S05/S07/S13–S16), not a numeric contest.

---

## Candidate: SEC-EDGAR (US public company filings)

| Dimension | Trade-off |
|-----------|-----------|
| **Unlocks** | Legal company names, CIK, filing-backed Evidence for US public corps (S04-class). |
| **Entity types** | US public companies; weak for persons/NGOs/non-US. |
| **Source independence** | NEW family `filings` ≠ wikimedia/openlibrary/viaf/web_origin. |
| **Evidence quality** | Very high legal authority; true filing dates (freshness). |
| **False-positive risk** | Name→CIK ambiguity; brand ≠ legal entity; ticker collisions. |
| **Operational cost** | Free public SEC; mandatory User-Agent; fair-access discipline. |
| **Rate limits** | Strict SEC fair-access; ban risk if impolite. |
| **Failure modes** | Non-US miss; rate-limit; ambiguous CIK; HTML/index parse fragility. |
| **Relationship semantics** | Filing about issuer ≠ SAME-ENTITY with brand seed; attach only on strong typed corp IDs — never title. |
| **Expected discovery value** | High for **authority coverage** on US corps; does not fix URL/HE/compound gaps. |

## Candidate: National / company registries (public)

| Dimension | Trade-off |
|-----------|-----------|
| **Unlocks** | Jurisdiction-native legal entity numbers/status (org-legal). |
| **Entity types** | Registrable orgs; jurisdiction-specific (incl. potential HE/IL). |
| **Source independence** | `gov_registry` family; DOMAIN_AUTHORITY gov weights currently orphan emitters. |
| **Evidence quality** | High when jurisdiction matches; update lag. |
| **False-positive risk** | Brand≠legal; cross-jurisdiction collisions; scrapers banned. |
| **Operational cost** | Often free open data; some paid/TOS — **OUT if paid/blocked**. |
| **Rate limits** | Per-registry; uneven. |
| **Failure modes** | Coverage holes; HE/IL uneven; PII sensitivity beyond public-record intent. |
| **Relationship semantics** | Registry row is legal reference — not merge of movement/chapter (S05 lesson). |
| **Expected discovery value** | High for org-legal **authority**; complements SEC; weak for persons/URLs. |

## Candidate: News / press (public RSS or open APIs)

| Dimension | Trade-off |
|-----------|-----------|
| **Unlocks** | Fresh event/reputation Evidence; HE news potential. |
| **Entity types** | Persons/orgs in headlines; not legal identity. |
| **Source independence** | NEW `news` family — freshness & corroboration, not authority-of-record. |
| **Evidence quality** | Low–medium journalistic; paywall/mirror risk. |
| **False-positive risk** | Homonym collisions; outlet bias; recirculated wires. |
| **Operational cost** | Free RSS OK; commercial APIs OUT unless licensed. |
| **Rate limits** | Outlet-specific. |
| **Failure modes** | Stale mirrors; scraping bans; Acc surface from names in copy. |
| **Relationship semantics** | Mention ≠ SAME-REFERENCE; max POSSIBLE-MATCH/RELATED without typed IDs. |
| **Expected discovery value** | Medium for **freshness/diversity**; poor as sole org authority. |

## Candidate: Scholarly (ORCID / Crossref / DOI public)

| Dimension | Trade-off |
|-----------|-----------|
| **Unlocks** | Researcher profiles, DOI metadata, affiliations (CG-10). |
| **Entity types** | Academic persons/works; weak for corps/celebrities. |
| **Source independence** | `scholarly` distinct from openlibrary if hosts/IDs distinct. |
| **Evidence quality** | High for academics; publication dates available. |
| **False-positive risk** | Name ambiguity; affiliation noise. |
| **Operational cost** | Free public APIs; polite pool. |
| **Rate limits** | Provider pools. |
| **Failure modes** | Non-scholar seeds empty; over-weight academia. |
| **Relationship semantics** | ORCID/DOI typed keys possible future soft-refs — Gate discipline required. |
| **Expected discovery value** | High for scholarly **document/person** lane; niche for general web vision. |

## Candidate: HE locale (locale infer + he.wikipedia + quote floor)

| Dimension | Trade-off |
|-----------|-----------|
| **Unlocks** | Native HE pages/snippets for HE seeds (S07); readability. |
| **Entity types** | HE persons/orgs/labels. |
| **Source independence** | **LOW** — still `wikimedia` family; does NOT raise multi-independent. |
| **Evidence quality** | Improves quote_len if floor enforced; DOMAIN_AUTHORITY HE default 0.4 caveat. |
| **False-positive risk** | Transliteration gaps; EN secondary undemoted flood. |
| **Operational cost** | Low (existing Wikipedia adapter + locale). |
| **Rate limits** | Same MediaWiki. |
| **Failure modes** | Volume drop; still thin OpenSearch; false sense of “new source”. |
| **Relationship semantics** | Unchanged; language ≠ identity. |
| **Expected discovery value** | High **user-locale fidelity**; low independence; does not close S04/S16 alone. |

## Candidate: QueryPlan (intent routing: URL/role/compound/alias)

| Dimension | Trade-off |
|-----------|-----------|
| **Unlocks** | Head-entity + constraint facets; under-specified honesty; routes URL seeds to origin path (partially proven by C1 provider). |
| **Entity types** | All seed types via routing — not a new source family by itself. |
| **Source independence** | Indirect — enables right family to be called; does not mint families. |
| **Evidence quality** | Depends on downstream providers; can reduce junk. |
| **False-positive risk** | Parse errors; celebrity default if role constraint dropped (S11). |
| **Operational cost** | Engineering complexity; Preview-flag discipline. |
| **Rate limits** | May multiply queries if fanout unbounded — must cap. |
| **Failure modes** | Over-routing; silent fallback to name-only certainty. |
| **Relationship semantics** | Must preserve Bound: plan must not invent SAME-*; constraints are facets not merges. |
| **Expected discovery value** | High for **coverage proxy / intent holes** (S12–S15); orthogonal to filings authority. |

---

## Already-frozen experimental (context, not candidates for re-selection)

| Lane | Role in strategy |
|------|------------------|
| **VIAF + A2-safe** | Person-rich crosswalk; frozen; seed-specific multi; do not revive A2-bound. |
| **C1 WEB-ORIGIN** | Public-web origin family proved; Bound CLOSED; frozen experimental; production flag off. |

---

## Strategy stance (no winner)

Next source/architecture moves should be chosen by **which vision gap Chief prioritizes** (authority vs locale vs intent vs freshness), under Acc/Bound gates — not by which candidate inflates MULTI fastest.
