# 02 — DISCOVERY SURFACE · CYCLE1 INTEGRATION REVIEW

**Stamp:** 2026-09-20T12:21:00+03:00 IDT  
**Mode:** DOCUMENT-ONLY · measured evidence preferred · UNKNOWN where unmeasured  
**Cite corpus:** Phase2 golden seeds · Phase4 SOURCE · Gap Analysis · C1 Discovery Recheck · A2 packs

> Do **not** invent coverage. Numbers below are cited from existing packs or labeled UNKNOWN.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| **B0** | Production Discovery (`dpl_Avyhr…`) — WD · WP · OL |
| **A2** | Preview experimental — + VIAF + typed coalesce |
| **C1** | Preview experimental — + WEB-ORIGIN (PATCHED Bound) |
| **UNKNOWN** | Not measured / not instrumented in Cycle-1 packs |

---

## Per seed-type surface

### Person

| Aspect | State |
|--------|-------|
| **Current discovery paths** | B0: Wikidata search + optional P214 enrich; Wikipedia OpenSearch; Open Library authors. A2: + VIAF AutoSuggest; typed coalesce on `viaf:`/`qid:`/`ol:`. C1: web_origin one-hop only if non-registry finding URLs appear (typically **wo=0** on person seeds — measured S01). |
| **Available source families** | `wikimedia` · `openlibrary` · (`viaf` Preview) · (`web_origin` rare on person) |
| **Missing source families** | scholarly (ORCID/Crossref) · news · gov/official · archives |
| **Known limitations** | Homonyms (celebrity default risk S11); HE locale unused without `locale=he` (S07 Phase2); bibliographic noise from OL works-about; A2 gain seed-specific (S01 rich; not universal). |
| **Measured** | S01 Tim Berners-Lee: B0 findings=10 / wo=0; C1-PATCHED findings=18 / wo=0 (`08-COMPARISON-METRICS.md`). A2-safe mean multi ≈0.21 · S01 multi ≈0.56 (`A2-EXPERIMENTAL-BASELINE.md`). |

### Company

| Aspect | State |
|--------|-------|
| **Current discovery paths** | Same B0 trio as opaque name string. A2 VIAF often returns **person** homonyms without WKP triangle. C1 does **not** invent origin from company name (S04 wo=0). |
| **Available source families** | `wikimedia` · `openlibrary` · (`viaf` Preview — weak for modern corps) |
| **Missing source families** | filings (SEC-EDGAR) · national company registries · news · gov portals |
| **Known limitations** | **S04 Stripe = AUTHORITY / SOURCE COVERAGE LIMITATION** — P214=[]; VIAF person-homonyms; OL remote_ids missing; multi=0 on A2-safe. Not a coalesce bug. |
| **Measured** | S04: B0 findings=22 / wo=0; C1 findings=30 / wo=0; A2-safe S04 multi=0 (`A2-EXPERIMENTAL-BASELINE.md` · C1 recheck). |

### Organization (NGO / movement / society)

| Aspect | State |
|--------|-------|
| **Current discovery paths** | B0 name lookup; A2 typed coalesce when keys exist; C1 may add origin for **URL/host seeds** of org sites (e.g. who.int), labeled UNKNOWN. |
| **Available source families** | as person/company + `web_origin` for URL/domain seeds |
| **Missing source families** | gov registries · official portals · news · jurisdiction-specific authorities |
| **Known limitations** | **S05 Red Cross = AUTHORITY GRANULARITY LIMITATION** — related orgs correctly separate (ICRC ≠ Movement ≠ national societies); merging would invent relationships. |
| **Measured** | S05: B0 f=22 wo=0; C1 f=30 wo=0; A2-safe S05 multi ≈0.07. W5 `who.int`: C1 wo=1 UNKNOWN (`DISCOVERY-RECHECK`). |

### Domain

| Aspect | State |
|--------|-------|
| **Current discovery paths** | B0: domain treated as name string → thin/empty origin Evidence (CG-02). C1-PATCHED: `web_origin` provider fetches origin title/og under urlSafety; relationship **UNKNOWN**; soft-fail/cite-or-drop on bot/WAF/thin titles. |
| **Available source families** | C1 Preview: `web_origin`; B0 registries may still return name-token hits |
| **Missing source families** | RDAP/public WHOIS · archives (Wayback) · broader allowlisted public web |
| **Known limitations** | Bot/WAF blocks (openai.com); snippet threshold ≥40; heuristic eTLD+1; no ownership inference. Rel12 R04/R06: UNKNOWN_OR_NONE when no emit. |
| **Measured** | W5 who.int: CTRL wo=0 → TREAT wo=1 UNKNOWN. R06 openai.com: no wo emit Bound OK. Broad domain coverage beyond corpus: **UNKNOWN**. |

### URL

| Aspect | State |
|--------|-------|
| **Current discovery paths** | B0: S16 `https://www.who.int` → **0** grounded findings. C1-PATCHED: web_origin Evidence with title; labels UNKNOWN on finding+evidence+facet. C1-PREPATCH: SAME-REFERENCE FAIL (KEEP). |
| **Available source families** | `web_origin` (Preview) |
| **Missing source families** | recursive crawl (explicitly out) · archives · RDAP |
| **Known limitations** | One-hop only; no identity from URL; Wikipedia/Wikidata/VIAF URLs may soft-fail cite-or-drop (Rel12 R07–R09 Bound OK). |
| **Measured** | S16: CTRL 0/0 → TREAT 1/1 UNKNOWN; BAD_URL_ALONE_SAME=0; Rel12 12/12 PASS. |

### Ambiguous / compound / role / alias

| Aspect | State |
|--------|-------|
| **Current discovery paths** | Verbatim seed to all providers — **no QueryPlan**. Compound/role/alias (S13–S15) often 0 grounded. |
| **Available source families** | B0 trio only (name luck) |
| **Missing source families** | Intent routing · constraint soft-match · head-entity parse |
| **Known limitations** | CG-03 · S11 celebrity default risk · S12 under-specified honesty incomplete. |
| **Measured** | Coverage proxy non-nomatch ≥1: **9/15 (60%)** B0 (`03-COVERAGE-GAPS.md`). Grounded ≥1 on ≥2 of S13/S14/S15: **0** (B0). Post-C1 change for these seeds: **UNKNOWN** (C1 did not target compound/role). |

### No-match

| Aspect | State |
|--------|-------|
| **Current discovery paths** | Honest empty when providers return nothing (S09). |
| **Available source families** | N/A |
| **Missing** | Explicit `emptyReason` taxonomy fully productized (partial schema gaps Phase3). |
| **Measured** | S09 empty correct (`03-COVERAGE-GAPS` CG-07). Do not fill with invented relationships. |

### Document / scholarly work

| Aspect | State |
|--------|-------|
| **Current discovery paths** | Open Library **authors** search primarily; WD/WP may surface work/talk QIDs as publication noise. |
| **Available source families** | `openlibrary` · `wikimedia` |
| **Missing source families** | Crossref · ORCID · DOI · archives |
| **Known limitations** | CG-10 scholarly gap; OL bibliographic noise (QD-05). |
| **Measured** | Document-type coverage rate across Cycle-1 corpus: **UNKNOWN** (no dedicated document KPI instrumented). |

---

## Cross-cutting measured facts

| Fact | Value | Cite |
|------|------:|------|
| B0 live adapters | **3** | SERVER-PROVIDER-INVENTORY · providers.js |
| B0 multi-independent rate | **0.0** | Phase4 · Gap Analysis |
| A2-safe mean multi | **~0.21** | A2-EXPERIMENTAL-BASELINE |
| A2-bound | REJECTED (~0.52 title-bridge) | A2-EXPERIMENTAL-BASELINE |
| C1 S16 grounded | **0 → 1** (UNKNOWN) | 08-COMPARISON-METRICS |
| C1 Acc leak / Core pw | **0 / 0** | ACC-PATCHED · CORE-PATCHED |
| C1 Rel12 | **12/12** | RELATIONSHIP-TRUTH-TABLE |
| Adversarial A2 hardening | **28/28** | A2-EXPERIMENTAL-BASELINE |
| Broad web coverage % | **UNKNOWN** | not claimed by C1 |

---

## Product principle (surface reading)

Akvot can systematically discover **more true, useful, independently supported public information** while remaining honest about **UNKNOWN** — measured for URL/domain via C1, and for cross-family authority attach via A2-safe on rich persons. It has **not** measured generalized entity discovery, org identity resolution, or broad-domain recall.
