# 03 — SOURCE FAMILY CONTRACT · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · abstraction · **NO live provider wiring**

---

## Abstraction

A **Source Family** is a logical discovery surface with shared independence, authority, and safety semantics.  
A **Provider** is a concrete adapter that implements one or more capabilities of a family.

```text
SourceFamily
  ├── id, displayName, authorityClass, independenceClass, safetyClass
  ├── capabilities[]
  ├── entityTypesSupported[]
  ├── inputRequirements
  ├── outputTypes[]
  ├── cost / latency / rateLimit profiles
  ├── failureModes[]
  └── providers[]   ← adapters (may be zero until Preview wiring)
```

**Rule:** Adding a provider without a family registration is disallowed in the target architecture.  
**Rule:** Endpoint count ≠ independence (see `05-INDEPENDENCE-MODEL.md`).

---

## Family descriptor fields

| Field | Meaning |
|-------|---------|
| `familyId` | Stable snake_case id (e.g. `knowledge_graph`) |
| `authorityClass` | `registry` \| `encyclopedia` \| `bibliographic` \| `regulatory` \| `web_origin` \| `news` \| `scholarly` \| `government` \| `archives` \| `other` |
| `independenceClass` | How this family counts toward independent corroboration (see `05`) |
| `safetyClass` | `trusted_api` \| `public_metadata` \| `untrusted_web` \| `credentialed` |
| `capabilities` | e.g. `search`, `lookup_by_id`, `origin_metadata`, `filing_search` |
| `entityTypes` | Subset of seed classes this family may be planned for |
| `inputRequirements` | `raw_seed` \| `typed_ref` \| `url` \| `domain` \| `locale` |
| `outputTypes` | `finding`, `evidence`, `typed_soft_ref`, `url_candidate`, `document_meta` |
| `costClass` | `low` \| `medium` \| `high` |
| `latencyClass` | Expected p50/p95 bands (design targets; not measured here) |
| `rateLimitClass` | Known choke points (MediaWiki, SEC fair-access, etc.) |
| `failureModes` | From `10-FAILURE-MODEL.md` |
| `previewFlag` | Optional env flag pattern (e.g. `DISCOVERY_ENABLE_*`) — **no wiring in this pack** |
| `productionEligible` | Always `false` until Chief promote GO |

---

## Initial conceptual families

| familyId | Authority | Independence note | Example providers (conceptual only) | Entity types |
|----------|-----------|-------------------|-------------------------------------|--------------|
| `knowledge_graph` | registry/KG | Distinct from encyclopedia if hostFamily rules say so; WD+WP collapse today | Wikidata (B0) | person, org, company, ambiguous |
| `encyclopedia` | encyclopedia | Same `wikimedia` hostFamily as WD today → **not** independent of KG | Wikipedia OpenSearch (B0) | person, org, company, ambiguous |
| `bibliographic` | bibliographic | Independent of wikimedia when hostFamily distinct | Open Library (B0) | person, document |
| `authority` | registry | Independent when distinct host (e.g. VIAF) | VIAF (A2 Preview) | person, org |
| `web_origin` | web_origin | Origin metadata; **never** mints typed soft-refs for attach | C1 WEB-ORIGIN (Preview) | url, domain; one-hop from URLs |
| `filings` | regulatory | High independence vs library/KG | SEC-EDGAR candidate (not wired) | company |
| `registries` | regulatory/gov | Jurisdiction-specific independence | Public company registries (candidate) | company, organization |
| `news` | news | Medium; mention ≠ reference | Public RSS (candidate) | person, org, company |
| `scholarly` | scholarly | Medium–High | ORCID/Crossref candidate | person, document |
| `government` | government | High when distinct | Gov open data (candidate) | org, company, document |
| `archives` | archives | Medium–High | Digital archives (candidate) | person, document, organization |

**Extensible:** new families register with full descriptor; no silent default into production B0.

Cite: Integration Review `05-SOURCE-STRATEGY.md` · Gap Analysis SOURCE-CAPABILITY-MATRIX · KPI source-family diversity.

---

## Mapping current B0 / Preview (factual)

| Runtime provider | Conceptual family | hostFamily today | Lane |
|------------------|-------------------|------------------|------|
| wikidata | `knowledge_graph` | `wikimedia` | B0 LOCKED |
| wikipedia OpenSearch | `encyclopedia` | `wikimedia` | B0 LOCKED |
| openlibrary | `bibliographic` | `openlibrary` | B0 LOCKED |
| viaf | `authority` | `viaf` | A2 FROZEN EXPERIMENTAL |
| web_origin | `web_origin` | registrable domain / `web_origin` | C1 FROZEN EXPERIMENTAL |

---

## Capability × intent matrix (design)

| Intent | Primary families (conceptual) |
|--------|-------------------------------|
| DISCOVER_IDENTITY_REFERENCES | knowledge_graph, authority, bibliographic |
| DISCOVER_OFFICIAL_WEB_ORIGIN | web_origin |
| DISCOVER_DOCUMENTS | bibliographic, scholarly, archives |
| DISCOVER_ORGANIZATION_PRESENCE | knowledge_graph, encyclopedia, registries, web_origin |
| DISCOVER_PUBLICATIONS | bibliographic, scholarly |
| DISCOVER_NEWS | news |
| DISCOVER_FILINGS | filings |
| DISCOVER_REGISTRIES | registries, government |
| DISCOVER_ALIASES | knowledge_graph, encyclopedia, authority (search hints only) |
| DISCOVER_RELATED_ENTITIES | any with explicit relatedness provenance — never URL-alone |

---

## NO live provider wiring

This document defines **contracts only**. It does not add providers to `DEFAULT_PROVIDERS`, set Preview flags, call external APIs, or rank a “winner” source for promote. Promotion of any family into B0 remains **HOLD**.
