# 06 — ENTITY-TYPE GAPS

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Types in scope:** person · org · domain · doc · alias · historical

---

| Entity type | Live support | Gaps | Candidate sources |
|-------------|--------------|------|-------------------|
| **person** | WD/WP/OL strong; VIAF A2 Preview strong for library notables | Homonyms (S02/S03); HE locale thin; scholarly IDs absent; bare surnames | HE wiki locale · ORCID/Crossref · news (corroboration only) |
| **org** | WD/WP partial; VIAF corporate nametype uneven | S04 brand≠legal; S05 multi-org movements; no filings/registries; gov emitters absent | SEC EDGAR · company registries · gov portals · official origin |
| **domain** | Seed accepted as string only | S06/S16 no origin Evidence; no RDAP | web_origin metadata · RDAP public |
| **doc** | OL authors; WD works QIDs (often noise) | No DOI/Crossref primary path; WP thin quotes | Crossref · archives · scholarly |
| **alias** | Soft-label merge post-hoc (A2); no alias expansion pre-query | S15 punctuation aliases; transliteration HE↔EN absent | QueryPlan alias split · VIAF displayForm feedback (careful) |
| **historical** | None dedicated | No archive timeline; freshness≠history | Wayback CDX · historical registries |

## Cross-type risks

- Treating **doc/work** hits as **person** identity (QD-05 publication noise).
- Treating **domain** WHOIS privacy-redacted fields as person identity.
- Collapsing **org** national societies into one entity (S05) — RELATED≠SAME.

## Product implication

Maximum public-web discovery must cover **domain** and **org-legal** types — current stack is person/encyclopedia-centric.
