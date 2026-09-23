# ACC Finding-level Forensics · S01 / S04 / S05 · דיוק

**Stamp:** 2026-09-20T10:48:30+03:00 (2026-09-20 10:48 IDT)  
**Agent:** דיוק (Accuracy) · CYCLE1 HARDENING P1  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` · https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app  
**Mode:** Finding-level Acc forensics · **NO code** · **NO promote** · **NO EXP-B**  
**Policy:** Prefer UNKNOWN over false same-entity · **TRUTH > MULTI**

## Preview verify

| Check | Result |
|-------|--------|
| `vercel inspect … --scope k-akvot` | **Ready** · target=preview · created 2026-09-20 10:27:38 IDT |
| `vercel curl --deployment dpl_7Mmf… /api/discovery/health` | **ok=true** · upstash · durable-kv · kv-shared |
| Build surface | `api/discovery/health` (+ discovery session routes) present on this dpl |
| Acc leak Q1701775 | **0** on S01/S04/S05 finals |
| title/fingerprint coalesce keys | **0** |

## Prior Acc numbers (cite)

From `PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/06-ACC/ACC-FULL-דיוק-2026-09-20.md` · raw `…/raw/acc-live-דיוק/` (finals reused):

| Seed | Findings | multi | VIAF |
|------|----------:|------:|-----:|
| S01 Tim Berners-Lee | 18 | 10/18=**0.5556** | 10 |
| S04 Stripe | 30 | 0/30=**0** | 8 |
| S05 Red Cross | 30 | 3/30=**0.1** | 10 |

Mean multi_independent_rate **0.2185** · Acc leak **0**.

## Acc redef (this forensics)

`multi` = FindingId with ≥2 Acc Evidence families among `wikidata` | `wikipedia` | `openlibrary` | `viaf` | `other:apex`.

Identity labels: `same-source` | `same-reference` | `same-entity` | `related-entity` | `possible-match` | `unknown`.

Ceiling observed on multi Findings: **same-reference** (typed soft-ref). **No** Gate-grade `same-entity` assigned.

## S01 · Tim Berners-Lee · archetype **person-canonical**

- findings=18 · multi=10/18=0.5556 · viaf_n=10
- identity labels (cited Acc-FULL): `{"same-reference": 10, "same-source": 7, "unknown": 1}`
- family-set histogram: `{"openlibrary|viaf|wikidata": 10, "wikidata": 7, "wikipedia": 1}`
- coalesce key presence: viaf=10 · qid=17 · ol=10 · fingerprint=0 · cross_typed≥2=10 · no_typed=1
- unique typed: viaf=1 · qid=8 · ol=1

### Sample MULTI Findings (Evidence family sets + coalesce keys)

| FindingId | title | families | keys fired | entityRefs (abbrev) | label |
|-----------|-------|----------|------------|---------------------|-------|
| `wd-Q80` | Tim Berners-Lee | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | same-reference |
| `ol-OL25245A` | Tim Berners-Lee | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | same-reference |
| `viaf-85312226` | Tim Berners-Lee | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | same-reference |
| `viaf-85312226` | Tim Berners-Lee, 1955- | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | same-reference |
| `viaf-85312226` | Tim Berners-Lee, angla komputosciencisto, invent | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | same-reference |
| `viaf-85312226` | Tim Berners-Lee, britischer Informatiker, Erfind | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | same-reference |

### Sample SINGLE-family Findings

| FindingId | title | families | keys fired | keys absent | label |
|-----------|-------|----------|------------|-------------|-------|
| `wd-Q120373140` | Tim Berners-Lee | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q120373262` | Tim Berners-Lee | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q22991023` | Tim Berners-Lee: A Magna Carta for the web | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q22946133` | Tim Berners-Lee: The year open data went worldwi | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q22980417` | Tim Berners-Lee: The next web | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q19761597` | Tim Berners-Lee | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q55693401` | Tim Berners-Lee | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wp-en-Tim_Berners_Lee` | Tim Berners-Lee | wikipedia | (none) | viaf,qid,ol,fingerprint | same-source |

## S04 · Stripe · archetype **brand/homonym-heavy**

- findings=30 · multi=0/30=0.0 · viaf_n=8
- identity labels (cited Acc-FULL): `{"same-source": 24, "unknown": 6}`
- family-set histogram: `{"wikidata": 8, "viaf": 8, "openlibrary": 8, "wikipedia": 6}`
- coalesce key presence: viaf=8 · qid=8 · ol=8 · fingerprint=0 · cross_typed≥2=0 · no_typed=6
- unique typed: viaf=8 · qid=8 · ol=8

### Sample MULTI Findings (Evidence family sets + coalesce keys)

_None — multi_n=0._

### Sample SINGLE-family Findings

| FindingId | title | families | keys fired | keys absent | label |
|-----------|-------|----------|------------|-------------|-------|
| `wd-Q7624104` | Stripe | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q3421342` | stripe | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q127900502` | Stripe | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q117454382` | Stripe | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q297115` | Meloidae | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q469754` | Perca flavescens | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q842647` | striped bass | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q368495` | striped skunk | wikidata | qid | viaf,ol,fingerprint | same-source |

## S05 · Red Cross · archetype **org-disambiguation**

- findings=30 · multi=3/30=0.1 · viaf_n=10
- identity labels (cited Acc-FULL): `{"same-reference": 3, "same-source": 21, "unknown": 6}`
- family-set histogram: `{"wikidata": 7, "viaf": 7, "openlibrary": 7, "wikipedia": 6, "openlibrary|viaf|wikidata": 3}`
- coalesce key presence: viaf=13 · qid=10 · ol=10 · fingerprint=0 · cross_typed≥2=6 · no_typed=6
- unique typed: viaf=11 · qid=8 · ol=8

### Sample MULTI Findings (Evidence family sets + coalesce keys)

| FindingId | title | families | keys fired | entityRefs (abbrev) | label |
|-----------|-------|----------|------------|---------------------|-------|
| `wd-Q470110` | American Red Cross | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q470110, wd-Q470110, viaf:122023057, ol:OL17804A, ol-OL17804A | same-reference |
| `ol-OL17804A` | American National Red Cross | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q470110, wd-Q470110, viaf:122023057, ol:OL17804A, ol-OL17804A | same-reference |
| `viaf-122023057` | Red Cross USA | openlibrary+viaf+wikidata | viaf,qid,ol | qid:Q470110, wd-Q470110, viaf:122023057, ol:OL17804A, ol-OL17804A | same-reference |

### Sample SINGLE-family Findings

| FindingId | title | families | keys fired | keys absent | label |
|-----------|-------|----------|------------|-------------|-------|
| `wd-Q7178` | International Red Cross and Red Crescent Movemen | wikidata | viaf,qid | ol,fingerprint | same-source |
| `wd-Q48438` | Saint George | wikidata | viaf,qid | ol,fingerprint | same-source |
| `wd-Q7305591` | Redd Kross | wikidata | viaf,qid | ol,fingerprint | same-source |
| `wd-Q104700248` | Red Cross | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q1968122` | National Red Cross and Red Crescent society | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q116059498` | Red Cross | wikidata | qid | viaf,ol,fingerprint | same-source |
| `wd-Q50320550` | Red Cross | wikidata | qid | viaf,ol,fingerprint | same-source |
| `viaf-160178001` | Red Cross. International Committee, Geneva | viaf | viaf | qid,ol,fingerprint | same-source |

## Contrast

### Person-canonical (S01) — why multi↑

Single authority person Q80 shares viaf:85312226 + ol:OL25245A across WD/OL/VIAF provider rows → typed soft-ref enrichment attaches → 10 Findings with families {openlibrary,viaf,wikidata}.

- Keys that fired: `['viaf:85312226', 'qid:Q80', 'ol:OL25245A']`
- Gap: 7 WD-only Findings carry distinct QIDs (talks/works ABOUT TBL) — correct non-merge (TRUTH>MULTI). 1 WP-only has only wp: soft ref (FC-NO-TYPED-REF).
- Identity ceiling: same-reference (typed soft-ref). Never Gate-grade same-entity.

### Brand / homonym-heavy (S04) — why multi=0

Homonym swarm: payments brand + zoology + people surnamed Stripe + books. 8 distinct VIAFs, 8 distinct QIDs, 8 distinct OLs — ZERO shared typed keys across families on any Finding. Acc correctly refuses merge.

- Homonym examples: Striped hyena, Striped polecat, striped skunk, Stripes (film), Stripe, John, 1643-1737, Adelle Stripe
- Brand note: Even Stripe Inc. (wp) vs WD Stripe QIDs lack shared viaf/ol attach — brand authority graph weak vs person-canonical.
- Policy: FC-HOMONYM-BLOCK is SUCCESS under Acc policy, not a bug.

### Org-disambiguation (S05) — why multi≈0.1

Only American Red Cross cluster coalesces: Q470110 / viaf:122023057 / ol:OL17804A → 3 multi Findings (rate 0.1). National societies remain separate VIAF/OL singletons (correct).

- Soft-ref miss: 3 WD Findings carry viaf soft-ref (e.g. Q7178→viaf:145680594) but stay wikidata-only → FC-SOFT-REF-MISS / FC-TYPED-CROSS-BUT-SINGLE-FAMILY.
- Dilution: 27/30 single-family Findings dilute rate despite 3 successful attaches.
- Noise: Redd Kross (band), Red crossbill, Red Cross (EP), Saint George, Red Cross of Constantine

## Verdict (forensics only)

| Item | Value |
|------|-------|
| Acc leak | **0** |
| title-only keys | **0** |
| false same-entity assigned | **0** (prefer unknown) |
| Promote | **HOLD · NO promote** |
| EXP-B | **NO** |
| Code | **NO** — await Arch/Server GO |

## Paths

- `FORENSICS/ACC-FINDING-FORENSICS-S01-S04-S05-דיוק-2026-09-20.md` + `.json`
- `FORENSICS/ACC-FAILURE-CLASSES-דיוק-2026-09-20.md` + `.json`
- `STATUS-דיוק.md`
- Prior cite: `PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/06-ACC/ACC-FULL-דיוק-2026-09-20.md`
- Raw reused: `PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/raw/acc-live-דיוק/{S01,S04,S05}-final.json`

