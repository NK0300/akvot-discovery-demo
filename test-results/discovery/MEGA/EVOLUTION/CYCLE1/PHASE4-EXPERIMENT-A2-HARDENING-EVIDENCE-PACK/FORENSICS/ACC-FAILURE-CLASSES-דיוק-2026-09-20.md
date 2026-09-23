# ACC Failure Classes · דיוק · 2026-09-20

**Stamp:** 2026-09-20T10:48:30+03:00 (2026-09-20 10:48 IDT)  
**Agent:** דיוק · HARDENING P1  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`  
**NO promote · NO code · NO EXP-B · TRUTH > MULTI**

## Catalog

| ID | Definition |
|----|------------|
| `FC-NO-TYPED-REF` | Finding lacks viaf/qid/ol typed refs (wikipedia wp: or empty). Cannot enter typed coalesce. |
| `FC-REF-PRESENT-NO-CROSS-FAMILY` | Typed ref present but Finding remains single-family (viaf-only / qid-only / ol-only siblings). |
| `FC-VIAF-ONLY-SIBLING` | Subclass: viaf family + viaf: ref only; no WD/OL attach. |
| `FC-QID-ONLY-NO-ENRICH` | Subclass: wikidata family + qid only; enrichment did not attach VIAF/OL evidence. |
| `FC-OL-ONLY-NO-ENRICH` | Subclass: openlibrary family + ol only; no cross-family attach. |
| `FC-HOMONYM-BLOCK` | Correct non-merge of distinct entities sharing lexical stem (TRUTH>MULTI success). |
| `FC-SOFT-REF-MISS` | Soft typed ref present (e.g. viaf on a WD Finding) but counterpart family Evidence not attached → still single-family. |
| `FC-TYPED-CROSS-BUT-SINGLE-FAMILY` | ≥2 typed key kinds on Finding yet evidence_families still length 1. |
| `FC-FAMILY-MIRROR-ONLY` | Would count wd+wp as multi under Acc redef without authority (viaf/ol). Observed count=0 on these seeds — documented as non-issue here. |
| `FC-COVERAGE-DILUTION` | Large n of single-family Findings dilutes multi_rate even when a canonical cluster coalesces. |
| `FC-ORG-DISAMBIG-SIBLING` | National/affiliate org variants correctly kept separate (Red Cross national societies). |
| `FC-BRAND-CANONICAL-UNMERGED` | Brand-named Findings that look like the target brand but lack cross-family typed intersection. |

### FC-FAMILY-MIRROR-ONLY note

Under Acc redef, `wikidata`+`wikipedia` alone would count as multi. On A2-safe S01/S04/S05 finals **observed count = 0**. Multi Findings here always include authority families (`viaf`/`openlibrary`) with typed keys — not WP↔WD mirror inflation.

## Per-seed multi-gap → classes

### S01 · Tim Berners-Lee (person-canonical)

- findings=18 · multi=10 · **rate=0.5556** · gap=8

| Class | count |
|-------|------:|
| `OK-MULTI` | 10 |
| `FC-COVERAGE-DILUTION` | 8 |
| `FC-QID-ONLY-NO-ENRICH` | 7 |
| `FC-REF-PRESENT-NO-CROSS-FAMILY` | 7 |
| `FC-NO-TYPED-REF` | 1 |

**Primary drivers of multi gap:**

- `FC-QID-ONLY-NO-ENRICH` ×7 — Distinct QIDs for talks/works about TBL — correct non-merge
- `FC-NO-TYPED-REF` ×1 — wp-en-Tim_Berners_Lee wikipedia-only
- `FC-COVERAGE-DILUTION` ×8 — 8 singles vs 10 multi still yields high rate 0.5556

<details><summary>Examples (≤3 per top class)</summary>

**OK-MULTI**
- `wd-Q80` · Tim Berners-Lee · fam=['openlibrary', 'viaf', 'wikidata']
- `ol-OL25245A` · Tim Berners-Lee · fam=['openlibrary', 'viaf', 'wikidata']
- `viaf-85312226` · Tim Berners-Lee · fam=['openlibrary', 'viaf', 'wikidata']

**FC-COVERAGE-DILUTION**
- `wd-Q120373140` · Tim Berners-Lee · fam=['wikidata']
- `wd-Q120373262` · Tim Berners-Lee · fam=['wikidata']
- `wd-Q22991023` · Tim Berners-Lee: A Magna Carta for the web · fam=['wikidata']

**FC-QID-ONLY-NO-ENRICH**
- `wd-Q120373140` · Tim Berners-Lee · fam=['wikidata']
- `wd-Q120373262` · Tim Berners-Lee · fam=['wikidata']
- `wd-Q22991023` · Tim Berners-Lee: A Magna Carta for the web · fam=['wikidata']

**FC-REF-PRESENT-NO-CROSS-FAMILY**
- `wd-Q120373140` · Tim Berners-Lee · fam=['wikidata']
- `wd-Q120373262` · Tim Berners-Lee · fam=['wikidata']
- `wd-Q22991023` · Tim Berners-Lee: A Magna Carta for the web · fam=['wikidata']

</details>

### S04 · Stripe (brand/homonym-heavy)

- findings=30 · multi=0 · **rate=0.0** · gap=30

| Class | count |
|-------|------:|
| `FC-COVERAGE-DILUTION` | 30 |
| `FC-REF-PRESENT-NO-CROSS-FAMILY` | 24 |
| `FC-BRAND-CANONICAL-UNMERGED` | 14 |
| `FC-HOMONYM-BLOCK` | 9 |
| `FC-OL-ONLY-NO-ENRICH` | 8 |
| `FC-QID-ONLY-NO-ENRICH` | 8 |
| `FC-VIAF-ONLY-SIBLING` | 8 |
| `FC-NO-TYPED-REF` | 6 |

**Primary drivers of multi gap:**

- `FC-REF-PRESENT-NO-CROSS-FAMILY` ×24 — All typed Findings are single-family islands
- `FC-HOMONYM-BLOCK` ×5 — Zoology/film/people — correct Acc refusal
- `FC-COVERAGE-DILUTION` ×30 — No multi cluster; rate forced to 0
- `FC-VIAF-ONLY-SIBLING` ×8 — 8 unique VIAFs never intersect WD/OL
- `FC-BRAND-CANONICAL-UNMERGED` ×~8 — Stripe-named WD/WP/OL lack shared authority keys

<details><summary>Examples (≤3 per top class)</summary>

**FC-COVERAGE-DILUTION**
- `wd-Q7624104` · Stripe · fam=['wikidata']
- `wd-Q3421342` · stripe · fam=['wikidata']
- `wd-Q127900502` · Stripe · fam=['wikidata']

**FC-REF-PRESENT-NO-CROSS-FAMILY**
- `wd-Q7624104` · Stripe · fam=['wikidata']
- `wd-Q3421342` · stripe · fam=['wikidata']
- `wd-Q127900502` · Stripe · fam=['wikidata']

**FC-BRAND-CANONICAL-UNMERGED**
- `wd-Q7624104` · Stripe · fam=['wikidata']
- `wd-Q3421342` · stripe · fam=['wikidata']
- `wd-Q127900502` · Stripe · fam=['wikidata']

**FC-HOMONYM-BLOCK**
- `wd-Q297115` · Meloidae · fam=['wikidata']
- `wd-Q469754` · Perca flavescens · fam=['wikidata']
- `wd-Q842647` · striped bass · fam=['wikidata']

</details>

### S05 · Red Cross (org-disambiguation)

- findings=30 · multi=3 · **rate=0.1** · gap=27

| Class | count |
|-------|------:|
| `FC-COVERAGE-DILUTION` | 27 |
| `FC-REF-PRESENT-NO-CROSS-FAMILY` | 21 |
| `FC-ORG-DISAMBIG-SIBLING` | 13 |
| `FC-OL-ONLY-NO-ENRICH` | 7 |
| `FC-VIAF-ONLY-SIBLING` | 7 |
| `FC-NO-TYPED-REF` | 6 |
| `FC-HOMONYM-BLOCK` | 5 |
| `FC-QID-ONLY-NO-ENRICH` | 4 |
| `FC-SOFT-REF-MISS` | 3 |
| `FC-TYPED-CROSS-BUT-SINGLE-FAMILY` | 3 |
| `OK-MULTI` | 3 |

**Primary drivers of multi gap:**

- `FC-COVERAGE-DILUTION` ×27 — 3 multi drowned by 27 singles → 0.1
- `FC-REF-PRESENT-NO-CROSS-FAMILY` ×18 — viaf/ol/qid islands for national societies
- `FC-SOFT-REF-MISS` ×3 — WD has viaf soft-ref but VIAF Evidence not attached
- `FC-ORG-DISAMBIG-SIBLING` ×7 — Correct national society separation
- `FC-HOMONYM-BLOCK` ×~4 — band/bird/EP/saint — correct

<details><summary>Examples (≤3 per top class)</summary>

**FC-COVERAGE-DILUTION**
- `wd-Q7178` · International Red Cross and Red Crescent Movement · fam=['wikidata']
- `wd-Q48438` · Saint George · fam=['wikidata']
- `wd-Q7305591` · Redd Kross · fam=['wikidata']

**FC-REF-PRESENT-NO-CROSS-FAMILY**
- `wd-Q7178` · International Red Cross and Red Crescent Movement · fam=['wikidata']
- `wd-Q48438` · Saint George · fam=['wikidata']
- `wd-Q7305591` · Redd Kross · fam=['wikidata']

**FC-ORG-DISAMBIG-SIBLING**
- `wd-Q7178` · International Red Cross and Red Crescent Movement · fam=['wikidata']
- `wd-Q1968122` · National Red Cross and Red Crescent society · fam=['wikidata']
- `viaf-160178001` · Red Cross. International Committee, Geneva · fam=['viaf']

**FC-OL-ONLY-NO-ENRICH**
- `ol-OL124327A` · International Committee of the Red Cross · fam=['openlibrary']
- `ol-OL2917704A` · Red Cross · fam=['openlibrary']
- `ol-OL10303910A` · American Red Cross · fam=['openlibrary']

</details>

## Top failure classes — S04 & S05

### S04 Stripe (multi=0)

1. **`FC-REF-PRESENT-NO-CROSS-FAMILY`** — 24/30 Findings have a typed ref but never gain a second Acc family — islands
1. **`FC-COVERAGE-DILUTION`** — 30 singles → multi_rate=0 with no canonical cluster
1. **`FC-HOMONYM-BLOCK`** — Lexical Stripe* zoology/film/people correctly blocked (TRUTH>MULTI)
1. **`FC-VIAF-ONLY-SIBLING`** — 8 distinct VIAF people/orgs; no shared key with WD/OL

### S05 Red Cross (multi=0.1)

1. **`FC-COVERAGE-DILUTION`** — 27 singles dilute American Red Cross 3-Finding multi cluster to 0.1
1. **`FC-REF-PRESENT-NO-CROSS-FAMILY`** — National society VIAF/OL/WD remain single-family
1. **`FC-SOFT-REF-MISS`** — 3 WD Findings carry viaf: but counterpart family Evidence not attached
1. **`FC-ORG-DISAMBIG-SIBLING`** — Correct non-merge across national Red Cross orgs

## Why S01 succeeds

Person-canonical authority triangle Q80↔viaf:85312226↔ol:OL25245A fires viaf+qid+ol coalesce keys on 10 Findings.

Remaining 8 Findings are distinct works/QIDs or WP-only — left unknown/same-source, not force-merged.

## Acc leak

**Still 0.** No `Q1701775` / `wd-Q1701775` in S01/S04/S05 finals.

## STOP

Forensics **READY** · **NO promote** · **NO EXP-B** · await **Arch/Server** for code GO.

## Paths

- `FORENSICS/ACC-FAILURE-CLASSES-דיוק-2026-09-20.md` + `.json`
- `FORENSICS/ACC-FINDING-FORENSICS-S01-S04-S05-דיוק-2026-09-20.md` + `.json`
- `STATUS-דיוק.md`

