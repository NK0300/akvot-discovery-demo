# 01 — FORENSICS · S01 / S04 / S05 · ארכיטקט

**Owner:** ארכיטקט (Arch) · Project A · **DOCS ONLY**  
**Stamp:** 2026-09-20 10:47 IDT (Asia/Jerusalem, UTC+3)  
**Canonical Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`  
**URL:** https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app  
**SoT raw:** `PHASE4-EXPERIMENT-A2-COALESCE/raw/typed-enrich-smoke/` + COALESCE `22-PREVIEW-TYPED-ENRICH.json` (mean multi **0.2408**)  
**Server raw (do not clobber):** `FORENSICS/raw/` · intermediate `FORENSICS/decompose-typed-enrich-intermediate.json` integrated  
**Locks:** B0 `dpl_Avyhr…` **FROZEN** · Core `dpl_8ag…` **LOCKED** · A2-bound **REJECTED** · **HOLD promote** · **NO** alias · **NO EXP-B** · **NO** Core change

---

## Executive answer (TRUTH > MULTI)

| Seed | Coalesce? | multi_rate | Why |
|------|-----------|-----------:|-----|
| **S01** Tim Berners-Lee | **YES** | 0.5556 | WD+OL+VIAF share `viaf:85312226` / `qid:Q80` / `ol:OL25245A` → **SAME-REFERENCE** attach_keep |
| **S04** Stripe | **NO** | 0.0000 | **Zero** cross-family typed refs; person/work homonyms + WP org without typed keys; Stripe Inc WD absent |
| **S05** Red Cross | **BARELY** | 0.1667 | Two typed clusters (ARC Q470110; ICRC OL↔VIAF); majority national/homonym/half-enriched |

Prefer **truthful multi=0** (S04) over inventing SAME-ENTITY from title.

---

## Failure-class taxonomy (Arch)

| Class | Meaning |
|-------|---------|
| **missing ref** | Finding has no typed soft-ref (`viaf:`/`qid:`/`ol:`) |
| **ref present unsupported** | Typed ref exists but no peer Finding in-session shares it across hostFamilies |
| **ref conflict** | Contradictory typed ids on one Finding / component (none observed this pack) |
| **normalization failure** | Malformed / unparseable typed ref (none observed this pack) |
| **source limitation** | Provider/API did not expose joinable remote_ids / P214 / WKP for an otherwise plausible peer |
| **graph/coalesce limitation** | Peers + keys exist but UF/attach failed (none required this pack) |
| **true independent entity** | Distinct real-world entity; correctly unattached under A2-safe |

Companion JSON: `01-FORENSICS-S01-S04-S05-ארכיטקט.json`

---

## S01 · Tim Berners-Lee

**findings_n=18** · **multi_n=10** · **multi_rate=0.5556**  
**Why:** YES coalesce: WD+OL+VIAF share viaf:85312226 / qid:Q80 / ol:OL25245A → SAME-REFERENCE attach_keep on 10/18 Findings. Remaining = independent works/articles (distinct QID) or WP missing ref.

### Failure-class roll-up

| Class | n |
|-------|--:|
| coalesce_ok | 10 |
| true independent entity | 7 |
| missing ref | 1 |

### Finding-level table

| # | finding_id | source | URL | typed ref | ref type | normalized | relationship decision | conf | failure class | evidence chain (brief) |
|---|------------|--------|-----|-----------|----------|------------|----------------------|-----:|---------------|------------------------|
| 0 | `wd-Q80` · Tim Berners-Lee | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.955 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 1 | `ol-OL25245A` · Tim Berners-Lee | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.945 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 2 | `viaf-85312226` · Tim Berners-Lee | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.935 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 3 | `viaf-85312226` · Tim Berners-Lee, 1955- | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.925 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 4 | `viaf-85312226` · Tim Berners-Lee, angla kompu | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.915 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 5 | `viaf-85312226` · Tim Berners-Lee, britischer  | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.905 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 6 | `viaf-85312226` · Tim Berners-Lee, Britaniko a | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.895 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 7 | `viaf-85312226` · Tim Berners-Lee, Brits natuu | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.885 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 8 | `viaf-85312226` · Tim Berners-Lee, britský inf | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.875 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 9 | `viaf-85312226` · Tim Berners-Lee, britanniala | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q80 | `ol:OL25245A, qid:Q80, viaf:85312226` | ol,qid,viaf | `qid:Q80` | SAME-REFERENCE · coalesce attach_keep | 0.865 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q80; openlibrary→https://openlibrary.org/authors/OL25245A; viaf→https://viaf.org/viaf/85312226 (+7) |
| 10 | `wd-Q120373140` · Tim Berners-Lee | wikidata | https://www.wikidata.org/wiki/Q120373140 | `qid:Q120373140` | qid | `qid:Q120373140` | RELATED-ENTITY (informational) · no attach | 0.9 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q120373140 |
| 11 | `wd-Q120373262` · Tim Berners-Lee | wikidata | https://www.wikidata.org/wiki/Q120373262 | `qid:Q120373262` | qid | `qid:Q120373262` | RELATED-ENTITY (informational) · no attach | 0.9 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q120373262 |
| 12 | `wd-Q22991023` · Tim Berners-Lee: A Magna Car | wikidata | https://www.wikidata.org/wiki/Q22991023 | `qid:Q22991023` | qid | `qid:Q22991023` | RELATED-ENTITY (informational) · no attach | 0.9 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q22991023 |
| 13 | `wd-Q22946133` · Tim Berners-Lee: The year op | wikidata | https://www.wikidata.org/wiki/Q22946133 | `qid:Q22946133` | qid | `qid:Q22946133` | RELATED-ENTITY (informational) · no attach | 0.9 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q22946133 |
| 14 | `wd-Q22980417` · Tim Berners-Lee: The next we | wikidata | https://www.wikidata.org/wiki/Q22980417 | `qid:Q22980417` | qid | `qid:Q22980417` | RELATED-ENTITY (informational) · no attach | 0.9 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q22980417 |
| 15 | `wd-Q19761597` · Tim Berners-Lee | wikidata | https://www.wikidata.org/wiki/Q19761597 | `qid:Q19761597` | qid | `qid:Q19761597` | RELATED-ENTITY (informational) · no attach | 0.9 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q19761597 |
| 16 | `wd-Q55693401` · Tim Berners-Lee | wikidata | https://www.wikidata.org/wiki/Q55693401 | `qid:Q55693401` | qid | `qid:Q55693401` | RELATED-ENTITY (informational) · no attach | 0.9 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q55693401 |
| 17 | `wp-en-Tim_Berners_Lee` · Tim Berners-Lee | wikipedia | https://en.wikipedia.org/wiki/Tim_Berners-Lee | `—` | — | `—` | UNKNOWN (no attach) | 0.75 | **missing ref** | wikipedia→https://en.wikipedia.org/wiki/Tim_Berner |

### Per-finding WHY (non-coalesce / weak)

- **`wd-Q120373140`** (Tim Berners-Lee): distinct QID (biography/TED/article) sharing display label with Q80 but no shared typed soft-ref; INFORMATION≠IDENTITY
- **`wd-Q120373262`** (Tim Berners-Lee): distinct QID (biography/TED/article) sharing display label with Q80 but no shared typed soft-ref; INFORMATION≠IDENTITY
- **`wd-Q22991023`** (Tim Berners-Lee: A Magna Carta for the web): distinct QID (biography/TED/article) sharing display label with Q80 but no shared typed soft-ref; INFORMATION≠IDENTITY
- **`wd-Q22946133`** (Tim Berners-Lee: The year open data went worldwide): distinct QID (biography/TED/article) sharing display label with Q80 but no shared typed soft-ref; INFORMATION≠IDENTITY
- **`wd-Q22980417`** (Tim Berners-Lee: The next web): distinct QID (biography/TED/article) sharing display label with Q80 but no shared typed soft-ref; INFORMATION≠IDENTITY
- **`wd-Q19761597`** (Tim Berners-Lee): distinct QID (biography/TED/article) sharing display label with Q80 but no shared typed soft-ref; INFORMATION≠IDENTITY
- **`wd-Q55693401`** (Tim Berners-Lee): distinct QID (biography/TED/article) sharing display label with Q80 but no shared typed soft-ref; INFORMATION≠IDENTITY
- **`wp-en-Tim_Berners_Lee`** (Tim Berners-Lee): provider emitted no VIAF/QID/OL typed soft-refs (source does not expose join keys on this Finding)

---

## S04 · Stripe

**findings_n=22** · **multi_n=0** · **multi_rate=0.0**  
**Why:** NO coalesce: zero cross-family typed refs in session. VIAF/OL return person/work homonyms; WP org pages lack typed refs; Stripe Inc Wikidata absent. Prefer multi=0 over false merge.

### Failure-class roll-up

| Class | n |
|-------|--:|
| true independent entity | 20 |
| missing ref | 2 |

### Finding-level table

| # | finding_id | source | URL | typed ref | ref type | normalized | relationship decision | conf | failure class | evidence chain (brief) |
|---|------------|--------|-----|-----------|----------|------------|----------------------|-----:|---------------|------------------------|
| 0 | `viaf-30463651` · Stripe, John, 1643-1737 | viaf | https://viaf.org/viaf/30463651 | `viaf:30463651` | viaf | `viaf:30463651` | UNKNOWN (no attach) | 0.88 | **true independent entity** | viaf→https://viaf.org/viaf/30463651 |
| 1 | `viaf-126600779` · Stripes | viaf | https://viaf.org/viaf/126600779 | `viaf:126600779` | viaf | `viaf:126600779` | UNKNOWN (no attach) | 0.9 | **true independent entity** | viaf→https://viaf.org/viaf/126600779 |
| 2 | `viaf-138753783` · Striped house museum of art  | viaf | https://viaf.org/viaf/138753783 | `viaf:138753783` | viaf | `viaf:138753783` | UNKNOWN (no attach) | 0.88 | **true independent entity** | viaf→https://viaf.org/viaf/138753783 |
| 3 | `viaf-57307946` · Stripecke, Renata | viaf | https://viaf.org/viaf/57307946 | `viaf:57307946` | viaf | `viaf:57307946` | UNKNOWN (no attach) | 0.88 | **true independent entity** | viaf→https://viaf.org/viaf/57307946 |
| 4 | `viaf-156206104` · Stripe, Adelle, 1976- | viaf | https://viaf.org/viaf/156206104 | `viaf:156206104` | viaf | `viaf:156206104` | UNKNOWN (no attach) | 0.88 | **true independent entity** | viaf→https://viaf.org/viaf/156206104 |
| 5 | `viaf-124465779` · Striped Horse France | viaf | https://viaf.org/viaf/124465779 | `viaf:124465779` | viaf | `viaf:124465779` | UNKNOWN (no attach) | 0.88 | **true independent entity** | viaf→https://viaf.org/viaf/124465779 |
| 6 | `viaf-83910682` · Střípek, Jiří, asi 1545-asi  | viaf | https://viaf.org/viaf/83910682 | `viaf:83910682` | viaf | `viaf:83910682` | UNKNOWN (no attach) | 0.88 | **true independent entity** | viaf→https://viaf.org/viaf/83910682 |
| 7 | `viaf-172149106019768490790` · Stripe Eroeg | viaf | https://viaf.org/viaf/172149106019768490790 | `viaf:172149106019768490790` | viaf | `viaf:172149106019768490790` | UNKNOWN (no attach) | 0.88 | **true independent entity** | viaf→https://viaf.org/viaf/172149106019768490 |
| 8 | `ol-OL8376862A` · Five Stripe Books | openlibrary | https://openlibrary.org/authors/OL8376862A | `ol:OL8376862A` | ol | `ol:OL8376862A` | UNKNOWN (no attach) | 0.88 | **true independent entity** | openlibrary→https://openlibrary.org/authors/OL837686 |
| 9 | `ol-OL8613090A` · Adelle Stripe | openlibrary | https://openlibrary.org/authors/OL8613090A | `ol:OL8613090A` | ol | `ol:OL8613090A` | UNKNOWN (no attach) | 0.88 | **true independent entity** | openlibrary→https://openlibrary.org/authors/OL861309 |
| 10 | `ol-OL13079935A` · Stripe | openlibrary | https://openlibrary.org/authors/OL13079935A | `ol:OL13079935A` | ol | `ol:OL13079935A` | UNKNOWN (no attach) | 0.88 | **true independent entity** | openlibrary→https://openlibrary.org/authors/OL130799 |
| 11 | `ol-OL10372320A` · STRIPE | openlibrary | https://openlibrary.org/authors/OL10372320A | `ol:OL10372320A` | ol | `ol:OL10372320A` | UNKNOWN (no attach) | 0.88 | **true independent entity** | openlibrary→https://openlibrary.org/authors/OL103723 |
| 12 | `ol-OL3492368A` · Stephen Stripe | openlibrary | https://openlibrary.org/authors/OL3492368A | `ol:OL3492368A` | ol | `ol:OL3492368A` | UNKNOWN (no attach) | 0.88 | **true independent entity** | openlibrary→https://openlibrary.org/authors/OL349236 |
| 13 | `ol-OL14670551A` · Stripe Journals | openlibrary | https://openlibrary.org/authors/OL14670551A | `ol:OL14670551A` | ol | `ol:OL14670551A` | UNKNOWN (no attach) | 0.88 | **true independent entity** | openlibrary→https://openlibrary.org/authors/OL146705 |
| 14 | `ol-OL3905682A` · Subdued Stripe | openlibrary | https://openlibrary.org/authors/OL3905682A | `ol:OL3905682A` | ol | `ol:OL3905682A` | UNKNOWN (no attach) | 0.88 | **true independent entity** | openlibrary→https://openlibrary.org/authors/OL390568 |
| 15 | `ol-OL15943217A` · Sebastian Friedrich Stripe | openlibrary | https://openlibrary.org/authors/OL15943217A | `ol:OL15943217A` | ol | `ol:OL15943217A` | UNKNOWN (no attach) | 0.88 | **true independent entity** | openlibrary→https://openlibrary.org/authors/OL159432 |
| 16 | `wp-en-Stripe` · Stripe | wikipedia | https://en.wikipedia.org/wiki/Stripe | `—` | — | `—` | UNKNOWN (no attach) | 0.7 | **missing ref** | wikipedia→https://en.wikipedia.org/wiki/Stripe |
| 17 | `wp-en-Striped_hyena` · Striped hyena | wikipedia | https://en.wikipedia.org/wiki/Striped_hyena | `—` | — | `—` | UNKNOWN (no attach) | 0.85 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Striped_hy |
| 18 | `wp-en-Stripe_Inc_` · Stripe, Inc. | wikipedia | https://en.wikipedia.org/wiki/Stripe,_Inc. | `—` | — | `—` | UNKNOWN (no attach) | 0.7 | **missing ref** | wikipedia→https://en.wikipedia.org/wiki/Stripe,_In |
| 19 | `wp-en-Striped_polecat` · Striped polecat | wikipedia | https://en.wikipedia.org/wiki/Striped_polecat | `—` | — | `—` | UNKNOWN (no attach) | 0.85 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Striped_po |
| 20 | `wp-en-Striped_skunk` · Striped skunk | wikipedia | https://en.wikipedia.org/wiki/Striped_skunk | `—` | — | `—` | UNKNOWN (no attach) | 0.85 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Striped_sk |
| 21 | `wp-en-Stripes_film_` · Stripes (film) | wikipedia | https://en.wikipedia.org/wiki/Stripes_(film) | `—` | — | `—` | UNKNOWN (no attach) | 0.85 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Stripes_(f |

### Per-finding WHY (non-coalesce / weak)

- **`viaf-30463651`** (Stripe, John, 1643-1737): person/work/org surface 'Stripe, John, 1643-1737' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`viaf-126600779`** (Stripes): Pretty-Wrong / homonym 'Stripes' — distinct entity
- **`viaf-138753783`** (Striped house museum of art Tokyo): person/work/org surface 'Striped house museum of art Tokyo' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`viaf-57307946`** (Stripecke, Renata): person/work/org surface 'Stripecke, Renata' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`viaf-156206104`** (Stripe, Adelle, 1976-): person/work/org surface 'Stripe, Adelle, 1976-' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`viaf-124465779`** (Striped Horse France): person/work/org surface 'Striped Horse France' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`viaf-83910682`** (Střípek, Jiří, asi 1545-asi 1575): person/work/org surface 'Střípek, Jiří, asi 1545-asi 1575' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`viaf-172149106019768490790`** (Stripe Eroeg): person/work/org surface 'Stripe Eroeg' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`ol-OL8376862A`** (Five Stripe Books): person/work/org surface 'Five Stripe Books' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`ol-OL8613090A`** (Adelle Stripe): person/work/org surface 'Adelle Stripe' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`ol-OL13079935A`** (Stripe): person/work/org surface 'Stripe' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`ol-OL10372320A`** (STRIPE): person/work/org surface 'STRIPE' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`ol-OL3492368A`** (Stephen Stripe): person/work/org surface 'Stephen Stripe' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`ol-OL14670551A`** (Stripe Journals): person/work/org surface 'Stripe Journals' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`ol-OL3905682A`** (Subdued Stripe): person/work/org surface 'Subdued Stripe' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`ol-OL15943217A`** (Sebastian Friedrich Stripe): person/work/org surface 'Sebastian Friedrich Stripe' with family-local typed ref only; zero cross-family typed intersection in session (Stripe Inc WD absent)
- **`wp-en-Stripe`** (Stripe): org-like WP page with zero typed entityRefs; WD Stripe company absent from session — cannot SAME-REFERENCE
- **`wp-en-Striped_hyena`** (Striped hyena): homonym WP surface 'Striped hyena'; no typed refs; correctly unattached
- **`wp-en-Stripe_Inc_`** (Stripe, Inc.): org-like WP page with zero typed entityRefs; WD Stripe company absent from session — cannot SAME-REFERENCE
- **`wp-en-Striped_polecat`** (Striped polecat): homonym WP surface 'Striped polecat'; no typed refs; correctly unattached
- **`wp-en-Striped_skunk`** (Striped skunk): homonym WP surface 'Striped skunk'; no typed refs; correctly unattached
- **`wp-en-Stripes_film_`** (Stripes (film)): homonym WP surface 'Stripes (film)'; no typed refs; correctly unattached

---

## S05 · Red Cross

**findings_n=30** · **multi_n=5** · **multi_rate=0.1667**  
**Why:** BARELY: two SAME-REFERENCE clusters (American Red Cross Q470110↔viaf:122023057↔OL17804A; ICRC OL124327A↔viaf:160178001). Rest = national societies / homonyms / half-enriched WD+viaf without peer / OL without remote_ids.

### Failure-class roll-up

| Class | n |
|-------|--:|
| ref present unsupported | 12 |
| true independent entity | 11 |
| coalesce_ok | 5 |
| missing ref | 1 |
| source limitation | 1 |

### Finding-level table

| # | finding_id | source | URL | typed ref | ref type | normalized | relationship decision | conf | failure class | evidence chain (brief) |
|---|------------|--------|-----|-----------|----------|------------|----------------------|-----:|---------------|------------------------|
| 0 | `wd-Q470110` · American Red Cross | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q470110 | `ol:OL17804A, qid:Q470110, viaf:122023057` | ol,qid,viaf | `qid:Q470110` | SAME-REFERENCE · coalesce attach_keep | 0.945 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q470110; openlibrary→https://openlibrary.org/authors/OL17804A; viaf→https://viaf.org/viaf/122023057 |
| 1 | `ol-OL17804A` · American National Red Cross | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q470110 | `ol:OL17804A, qid:Q470110, viaf:122023057` | ol,qid,viaf | `qid:Q470110` | SAME-REFERENCE · coalesce attach_keep | 0.935 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q470110; openlibrary→https://openlibrary.org/authors/OL17804A; viaf→https://viaf.org/viaf/122023057 |
| 2 | `viaf-122023057` · Red Cross USA | openlibrary,viaf,wikidata | https://www.wikidata.org/wiki/Q470110 | `ol:OL17804A, qid:Q470110, viaf:122023057` | ol,qid,viaf | `qid:Q470110` | SAME-REFERENCE · coalesce attach_keep | 0.925 | **coalesce_ok** | wikidata→https://www.wikidata.org/wiki/Q470110; openlibrary→https://openlibrary.org/authors/OL17804A; viaf→https://viaf.org/viaf/122023057 |
| 3 | `ol-OL124327A` · International Committee of t | openlibrary,viaf | https://openlibrary.org/authors/OL124327A | `ol:OL124327A, qid:Q5987345, viaf:160178001` | ol,qid,viaf | `qid:Q5987345` | SAME-REFERENCE · coalesce attach_keep | 0.784 | **coalesce_ok** | openlibrary→https://openlibrary.org/authors/OL124327; viaf→https://viaf.org/viaf/160178001 |
| 4 | `viaf-160178001` · Red Cross. International Com | openlibrary,viaf | https://openlibrary.org/authors/OL124327A | `ol:OL124327A, qid:Q5987345, viaf:160178001` | ol,qid,viaf | `qid:Q5987345` | SAME-REFERENCE · coalesce attach_keep | 0.774 | **coalesce_ok** | openlibrary→https://openlibrary.org/authors/OL124327; viaf→https://viaf.org/viaf/160178001 |
| 5 | `wd-Q7178` · International Red Cross and  | wikidata | https://www.wikidata.org/wiki/Q7178 | `qid:Q7178, viaf:145680594` | qid,viaf | `qid:Q7178` | POSSIBLE-MATCH · no attach | 0.8 | **ref present unsupported** | wikidata→https://www.wikidata.org/wiki/Q7178 |
| 6 | `wd-Q48438` · Saint George | wikidata | https://www.wikidata.org/wiki/Q48438 | `qid:Q48438, viaf:27862930` | qid,viaf | `qid:Q48438` | UNKNOWN (no attach) | 0.92 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q48438 |
| 7 | `wd-Q7305591` · Redd Kross | wikidata | https://www.wikidata.org/wiki/Q7305591 | `qid:Q7305591, viaf:191149196678574792964` | qid,viaf | `qid:Q7305591` | UNKNOWN (no attach) | 0.92 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q7305591 |
| 8 | `wd-Q104700248` · Red Cross | wikidata | https://www.wikidata.org/wiki/Q104700248 | `qid:Q104700248` | qid | `qid:Q104700248` | RELATED-ENTITY (topic) · no attach | 0.85 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q104700248 |
| 9 | `wd-Q1968122` · National Red Cross and Red C | wikidata | https://www.wikidata.org/wiki/Q1968122 | `qid:Q1968122` | qid | `qid:Q1968122` | RELATED-ENTITY · no attach | 0.82 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q1968122 |
| 10 | `wd-Q116059498` · Red Cross | wikidata | https://www.wikidata.org/wiki/Q116059498 | `qid:Q116059498` | qid | `qid:Q116059498` | RELATED-ENTITY (topic) · no attach | 0.85 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q116059498 |
| 11 | `wd-Q50320550` · Red Cross | wikidata | https://www.wikidata.org/wiki/Q50320550 | `qid:Q50320550` | qid | `qid:Q50320550` | UNKNOWN (no attach) | 0.92 | **true independent entity** | wikidata→https://www.wikidata.org/wiki/Q50320550 |
| 12 | `viaf-167237176` · Red Cross and Red Crescent | viaf | https://viaf.org/viaf/167237176 | `viaf:167237176` | viaf | `viaf:167237176` | POSSIBLE-MATCH · no attach | 0.78 | **ref present unsupported** | viaf→https://viaf.org/viaf/167237176 |
| 13 | `viaf-151269599` · Red Cross. Switzerland. Schw | viaf | https://viaf.org/viaf/151269599 | `viaf:151269599` | viaf | `viaf:151269599` | POSSIBLE-MATCH · no attach | 0.78 | **ref present unsupported** | viaf→https://viaf.org/viaf/151269599 |
| 14 | `viaf-148420048` · Red Cross (Great Britain) | viaf | https://viaf.org/viaf/148420048 | `viaf:148420048` | viaf | `viaf:148420048` | POSSIBLE-MATCH · no attach | 0.78 | **ref present unsupported** | viaf→https://viaf.org/viaf/148420048 |
| 15 | `viaf-997897` · Red Cross international lawy | viaf | https://viaf.org/viaf/997897 | `viaf:997897` | viaf | `viaf:997897` | POSSIBLE-MATCH · no attach | 0.78 | **ref present unsupported** | viaf→https://viaf.org/viaf/997897 |
| 16 | `viaf-312731766` · Red Cross, Henry Dunant Inst | viaf | https://viaf.org/viaf/312731766 | `viaf:312731766` | viaf | `viaf:312731766` | POSSIBLE-MATCH · no attach | 0.78 | **ref present unsupported** | viaf→https://viaf.org/viaf/312731766 |
| 17 | `viaf-159584209` · Red Cross, Deutsches Rotes K | viaf | https://viaf.org/viaf/159584209 | `viaf:159584209` | viaf | `viaf:159584209` | POSSIBLE-MATCH · no attach | 0.78 | **ref present unsupported** | viaf→https://viaf.org/viaf/159584209 |
| 18 | `ol-OL2917704A` · Red Cross | openlibrary | https://openlibrary.org/authors/OL2917704A | `ol:OL2917704A` | ol | `ol:OL2917704A` | UNKNOWN (no attach) | 0.75 | **ref present unsupported** | openlibrary→https://openlibrary.org/authors/OL291770 |
| 19 | `ol-OL10303910A` · American Red Cross | openlibrary | https://openlibrary.org/authors/OL10303910A | `ol:OL10303910A` | ol | `ol:OL10303910A` | POSSIBLE-MATCH · no attach | 0.83 | **source limitation** | openlibrary→https://openlibrary.org/authors/OL103039 |
| 20 | `ol-OL4511273A` · Red Cross. | openlibrary | https://openlibrary.org/authors/OL4511273A | `ol:OL4511273A` | ol | `ol:OL4511273A` | UNKNOWN (no attach) | 0.75 | **ref present unsupported** | openlibrary→https://openlibrary.org/authors/OL451127 |
| 21 | `ol-OL6290095A` · Red Cross. Portuguese Red Cr | openlibrary | https://openlibrary.org/authors/OL6290095A | `ol:OL6290095A` | ol | `ol:OL6290095A` | UNKNOWN (no attach) | 0.75 | **ref present unsupported** | openlibrary→https://openlibrary.org/authors/OL629009 |
| 22 | `ol-OL13846643A` · Red Cross. Portuguese Red Cr | openlibrary | https://openlibrary.org/authors/OL13846643A | `ol:OL13846643A` | ol | `ol:OL13846643A` | UNKNOWN (no attach) | 0.75 | **ref present unsupported** | openlibrary→https://openlibrary.org/authors/OL138466 |
| 23 | `ol-OL2343831A` · Red Cross. Junior Red Cross. | openlibrary | https://openlibrary.org/authors/OL2343831A | `ol:OL2343831A` | ol | `ol:OL2343831A` | UNKNOWN (no attach) | 0.75 | **ref present unsupported** | openlibrary→https://openlibrary.org/authors/OL234383 |
| 24 | `wp-en-Red_Cross` · Red Cross | wikipedia | https://en.wikipedia.org/wiki/Red_Cross | `—` | — | `—` | UNKNOWN (no attach) | 0.75 | **missing ref** | wikipedia→https://en.wikipedia.org/wiki/Red_Cross |
| 25 | `wp-en-Red_Cross_parcel` · Red Cross parcel | wikipedia | https://en.wikipedia.org/wiki/Red_Cross_parcel | `—` | — | `—` | UNKNOWN (no attach) | 0.8 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Red_Cross_ |
| 26 | `wp-en-Red_Cross_Youth_Philippines_` · Red Cross Youth (Philippines | wikipedia | https://en.wikipedia.org/wiki/Red_Cross_Youth… | `—` | — | `—` | UNKNOWN (no attach) | 0.8 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Red_Cross_ |
| 27 | `wp-en-Red_Cross_of_Constantine` · Red Cross of Constantine | wikipedia | https://en.wikipedia.org/wiki/Red_Cross_of_Co… | `—` | — | `—` | UNKNOWN (no attach) | 0.8 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Red_Cross_ |
| 28 | `wp-en-Red_crossbill` · Red crossbill | wikipedia | https://en.wikipedia.org/wiki/Red_crossbill | `—` | — | `—` | UNKNOWN (no attach) | 0.8 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Red_crossb |
| 29 | `wp-en-Red_Cross_EP_` · Red Cross (EP) | wikipedia | https://en.wikipedia.org/wiki/Red_Cross_(EP) | `—` | — | `—` | UNKNOWN (no attach) | 0.8 | **true independent entity** | wikipedia→https://en.wikipedia.org/wiki/Red_Cross_ |

### Per-finding WHY (non-coalesce / weak)

- **`wd-Q7178`** (International Red Cross and Red Crescent Movement): WD Finding carries viaf:145680594 but no VIAF/OL Finding in session shares that id — enrich half-complete; recovery = bring peer by typed id only
- **`wd-Q48438`** (Saint George): homonym/unrelated 'Saint George' — distinct typed id, correctly unattached
- **`wd-Q7305591`** (Redd Kross): homonym/unrelated 'Redd Kross' — distinct typed id, correctly unattached
- **`wd-Q104700248`** (Red Cross): topic/emblem/category 'Red Cross' — not same org reference as ARC/ICRC clusters
- **`wd-Q1968122`** (National Red Cross and Red Crescent society): distinct QID 'National Red Cross and Red Crescent society' without P214 bridge into session peers; related movement ≠ SAME-REFERENCE
- **`wd-Q116059498`** (Red Cross): topic/emblem/category 'Red Cross' — not same org reference as ARC/ICRC clusters
- **`wd-Q50320550`** (Red Cross): homonym/unrelated 'Red Cross' — distinct typed id, correctly unattached
- **`viaf-167237176`** (Red Cross and Red Crescent): VIAF-only national/person surface; no WD/OL peer shares this VIAF in session
- **`viaf-151269599`** (Red Cross. Switzerland. Schweizerisches Rotes Kreuz): VIAF-only national/person surface; no WD/OL peer shares this VIAF in session
- **`viaf-148420048`** (Red Cross (Great Britain)): VIAF-only national/person surface; no WD/OL peer shares this VIAF in session
- **`viaf-997897`** (Red Cross international lawyer (1914-2002) Jean Pictet): VIAF-only national/person surface; no WD/OL peer shares this VIAF in session
- **`viaf-312731766`** (Red Cross, Henry Dunant Institute): VIAF-only national/person surface; no WD/OL peer shares this VIAF in session
- **`viaf-159584209`** (Red Cross, Deutsches Rotes Kreuz): VIAF-only national/person surface; no WD/OL peer shares this VIAF in session
- **`ol-OL2917704A`** (Red Cross): OL-only author/org key; no shared viaf/qid with another Finding
- **`ol-OL10303910A`** (American Red Cross): OL American Red Cross present alongside WD Q470110 cluster but OL remote_ids did not emit joinable viaf/qid shared with that cluster — source enrichment gap (NOT title-bridge candidate)
- **`ol-OL4511273A`** (Red Cross.): OL-only author/org key; no shared viaf/qid with another Finding
- **`ol-OL6290095A`** (Red Cross. Portuguese Red Cross.): OL-only author/org key; no shared viaf/qid with another Finding
- **`ol-OL13846643A`** (Red Cross. Portuguese Red Cross): OL-only author/org key; no shared viaf/qid with another Finding
- **`ol-OL2343831A`** (Red Cross. Junior Red Cross.): OL-only author/org key; no shared viaf/qid with another Finding
- **`wp-en-Red_Cross`** (Red Cross): provider emitted no VIAF/QID/OL typed soft-refs (source does not expose join keys on this Finding)
- **`wp-en-Red_Cross_parcel`** (Red Cross parcel): homonym/related WP surface 'Red Cross parcel'; no typed refs
- **`wp-en-Red_Cross_Youth_Philippines_`** (Red Cross Youth (Philippines)): homonym/related WP surface 'Red Cross Youth (Philippines)'; no typed refs
- **`wp-en-Red_Cross_of_Constantine`** (Red Cross of Constantine): homonym/related WP surface 'Red Cross of Constantine'; no typed refs
- **`wp-en-Red_crossbill`** (Red crossbill): homonym/related WP surface 'Red crossbill'; no typed refs
- **`wp-en-Red_Cross_EP_`** (Red Cross (EP)): homonym/related WP surface 'Red Cross (EP)'; no typed refs

---

## Cross-seed invariants

1. **Ceiling:** attach meaning = **SAME-REFERENCE** only (never invent SAME-ENTITY).
2. **Code annotations** (`related-entity` on graph edges when `titleSecondary=disagree`) are provisional — contract still caps at SAME-REFERENCE.
3. **INFORMATION ≠ IDENTITY:** `same_title_multi_domain` contradictions fire on all three seeds — title never joins.
4. **Recovery (design-only):** typed cross-source enrich OK; title/name/sim/threshold **FORBIDDEN** — see `04-S04-S05-RECOVERY-BOUNDS-ארכיטקט.md`.

## STOP

Forensics classified. **NO recovery code. NO promote. NO Acc/QA PASS claim for hardening.**

---

## Integration note · Acc forensics (do not clobber)

Acc wrote `FORENSICS/ACC-*-דיוק-2026-09-20.*` on the same canonical dpl. Headline agrees: **S01 yes / S04 no / S05 barely**. Arch taxonomy (this file) remains the contract vocabulary input for §03; Acc FC-* ids are measurement labels. See `FILE-INDEX.md` crosswalk.

**Still:** NO promote · NO recovery code · NO Arch claim of Acc/QA hardening PASS.
