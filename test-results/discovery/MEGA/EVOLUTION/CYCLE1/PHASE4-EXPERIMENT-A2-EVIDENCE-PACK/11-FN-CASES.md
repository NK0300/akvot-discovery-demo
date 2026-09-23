# 11 — FN CASES · Coverage holes (missed multi despite related entities)

**Stamp:** 2026-09-20 10:35 IDT  
**Definition of FN here:** Entities that **could** deserve same-reference attach but stay multi=0 / single-family because typed soft-refs are missing or incomplete — **not** because title-only was refused.

---

### FN-1 · S04 Stripe · multi=0 (live smoke · primary)

| Field | Value |
|-------|-------|
| Preview | `dpl_7Mmf…` A2-safe enrich |
| Metrics | findings=22 · multi_n=**0** · viaf_n=8 · providers_ge2=0 |
| Families | openlibrary, viaf, wikipedia (no effective WD typed bridge in smoke) |
| Why hole | Corp ambiguity + Pretty-Wrong + missing shared `viaf:`/`qid:`/`ol:` across families |
| Not a bug of Bound#1 | Correct safety; enrichment simply did not create intersection |

### FN-2 · Wikipedia peers without qid mint (live pattern)

Wikipedia Evidence does not by itself emit coalesce keys; without WD/VIAF/OL enrich, related wiki rows stay single-family.

### FN-3 · VIAF without WKP (live / unit-shaped)

AutoSuggest hits lacking WKP cannot offer `qid:` to meet WD findings unless WD P214 (or OL remote) supplies the same VIAF.

### FN-4 · OL authors missing remote_ids (coverage)

`ol:KEY`-only findings cannot join VIAF/WD clusters → under-count multi on seeds with sparse OL metadata.

### FN-5 · Bound#1 pre-enrich S01 multi=0 (historical)

| Field | Value |
|-------|-------|
| Preview | `dpl_Fz2iq…` |
| Metrics | mean multi **0** despite VIAF present |
| Why | Family-local refs only (`viaf:*` vs `wd-Q*` vs `ol-*`) — **resolved** by A2-safe enrich for S01/S05 subset |

---

## Implications

- Gate mean ≥0.15 is **smoke-pass** on enrich (0.2408) but S04 remains a known FN hole.
- Future work must extend **typed** enrich coverage — **never** re-enable title-only to close FNs.
