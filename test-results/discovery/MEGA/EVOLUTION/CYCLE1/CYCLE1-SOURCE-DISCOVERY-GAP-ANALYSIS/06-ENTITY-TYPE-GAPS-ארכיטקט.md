# 06 — ENTITY TYPE GAPS · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · UX types: @ממשק · Acc: @דיוק  
**Mode:** Gap Analysis · DOCS ONLY · NO EXP-B · NO promote

---

## Declared capabilities vs reality

All live providers declare `capabilities: ['person_name', 'org', 'doc']` — but adapters are **name/author/OpenSearch** lookups, entity-agnostic seed string.

| Entity / intent type | Support today | Gap |
|----------------------|---------------|-----|
| Person (notable, library authority) | Strong registry hit rate | Homonyms; pub noise; HE thin |
| Person (local / non-notable) | Weak / empty | No local web / news / registry |
| Organization (wiki-famous) | Partial WD/WP | Granularity (S05); corp without WKP (S04) |
| Organization (legal / filings) | **Absent** | No CIK/company_number emitters |
| Document / work | OL noise as “about person”; WP pages | No Crossref/DOI-first path |
| URL / website / domain | **Absent** | No origin/RDAP resolver |
| Role / title / office | **Absent** | No query expansion / role parse |
| Alias / AKA / transliteration | **Absent** | No alias layer (PHASE5) |
| Place / geographic | VIAF nametype geographic (Preview only) | Not first-class Finding kind |
| Event | **Absent** | No news/event family |
| HE-script entities | Partial WD labels; WP only if locale=he | Default locale=en |

---

## Kind mix bias

PHASE4: registry ~73% · page ~27%. Dossier feels “official” while still single-family on B0.

---

## Soft ER

`softEntityResolve` → opaque `seed:<hash>` only — **not** typed entity classification. No person/org/doc routing.

---

## OWNER

| Who | Fill |
|-----|------|
| **@ממשק** | How entity types should appear in UI facets |
| **@דיוק** | Forbidden identity / entity-type Acc edges |
| **@בודק** | Corpus coverage per entity type |
