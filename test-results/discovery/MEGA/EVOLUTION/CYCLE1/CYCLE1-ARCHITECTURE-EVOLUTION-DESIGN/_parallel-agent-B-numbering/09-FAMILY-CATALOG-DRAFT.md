# 09 — FAMILY CATALOG DRAFT · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Note:** Existing families = describe current adapters. Future slots = **design slots only** — NO providers · NO impl.

---

## Existing families (Cycle1 reality)

| Family id | independenceKey | Adapters today | B0? | Preview flag | Typed soft-refs | Relationship ceiling alone | Notes |
|-----------|-----------------|----------------|-----|--------------|-----------------|----------------------------|-------|
| `wikimedia` | `wikimedia` | `wikidata`, `wikipedia` | YES | — | `qid:` (WD); WP page ≠ typed id | none → findings only | Same independence family for multi |
| `openlibrary` | `openlibrary` | `openlibrary` | YES | — | `ol:` (+ enrich viaf/qid when present) | none | Author-search biased; weak for pure orgs |
| `viaf` | `viaf` | `viaf` | NO | `DISCOVERY_ENABLE_VIAF=1` | `viaf:` (+ WKP→qid when present) | none | A2-safe coalesce peer |
| `web_origin` | `web_origin` | `web_origin` | NO | `DISCOVERY_ENABLE_WEB_ORIGIN=1` | **no typed id from URL alone** | **UNKNOWN** (C1 Bound) | Metadata-only · one-hop · C1-PATCHED `dpl_Ho6jg…` |

Cite: `providers.js` `getDefaultProviders` · `webOrigin.js` · A2/C1 freezes.

---

## Future design slots (NOT implemented · NOT scheduled)

| Slot id | Intended role | Example public sources (illustrative) | Why slot exists | Blockers before any Preview |
|---------|---------------|----------------------------------------|-----------------|------------------------------|
| `filings` | Regulatory / corporate filings | Fair-access filings APIs | S04 authority orphan | Acc · license · SSRF · Chief GO |
| `news` | Public news/RSS mentions | Public RSS / news APIs | Mention coverage | Mention ≠ reference · rate limits · Acc |
| `gov` | Gov/edu authority pages | Official .gov/.edu open endpoints | DOMAIN_AUTHORITY weights orphan | No ownership inference · urlSafety |
| `scholarly` | Papers / profiles | Public scholarly APIs | Person scholarly path | Soft-ref typing rules · Acc |
| `rdap_dns` | Domain registration metadata | RDAP public | Domain intent complement | NOT ownership · UNKNOWN ceiling |

These are **catalog placeholders** for orchestration design. Listing ≠ permission to build.

---

## Capability × entity-type matrix (lightweight · see also 11)

| Family | person | org | domain/url | document |
|--------|--------|-----|------------|----------|
| wikimedia | ● | ● | ○ (label) | ○ |
| openlibrary | ● | △ (noise) | — | ● |
| viaf | ● | ● | — | ○ |
| web_origin | — | ○ | ● | ○ |
| filings (slot) | — | ● | — | ● |
| news (slot) | ○ | ○ | ○ | ○ |
| gov (slot) | — | ○ | ● | ○ |

● primary · ○ secondary · △ weak/noisy · — out of family role

---

## Independence reminder

Adding a slot does **not** auto-increase honest multi. Multi requires distinct independenceKeys + typed SAME-REFERENCE (or explicit non-attach metrics). Vanity family count ≠ product win.

---

## STOP

Catalog draft only. Future slots require separate Chief GO + Acc/Server design before Preview.
