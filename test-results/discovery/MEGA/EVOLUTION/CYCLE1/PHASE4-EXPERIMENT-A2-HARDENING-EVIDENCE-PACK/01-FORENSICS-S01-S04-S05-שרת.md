# 01 — FORENSICS S01 / S04 / S05 (שרת)

**Stamp:** 2026-09-20 10:51 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** שרת · A2-SAFE HARDENING · Phase 1 forensics first  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` · https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app  
**Data:** `PHASE4-EXPERIMENT-A2-COALESCE/raw/typed-enrich-smoke/*-final.json` (dpl-matched)  
**Locks:** B0 Discovery frozen · Core locked · **NO PROMOTE · NO EXP-B · NO code · NO deploy · NO alias**

## Rates (Acc redef multi_independent)

| Seed | findings | multi_n | multi_rate | viaf_n | unique_ids | WD status |
|------|---------:|--------:|-----------:|-------:|-----------:|-----------|
| S01 Tim Berners-Lee | 18 | 10 | **0.5556** | 10 | 11 | `partial` |
| S04 Stripe | 22 | 0 | **0.0** | 8 | 22 | `error` |
| S05 Red Cross | 30 | 5 | **0.1667** | 14 | 30 | `partial` |
| **mean** | — | — | **0.2408** | — | — | — |

## S01 — Tim Berners-Lee

**Verdict:** COALESCE SUCCESS (partial) · multi_rate=**0.5556**

### Why

Canonical person Tim Berners-Lee is jointly identified by three typed soft-refs that intersect across families: qid:Q80 (Wikidata), viaf:85312226 (VIAF + WD P214), ol:OL25245A (Open Library + remote_ids). coalesceKeysForFinding attaches providers onto each family's finding → 10/18 findings carry providers [wikidata, openlibrary, viaf] and facet corroboration:multi_family. External P214(Q80)=85312226 confirms the join key. Remaining 8 findings: 7 Wikidata works/talks/related QIDs with only qid: (true_independent_entity) + 1 Wikipedia page with only wp: (missing_ref). Note: finding id viaf-85312226 appears 8× (attach_keep without collapse) — graph surface duplication, not extra entities.

### Gap class counts

| gap_class | n | detail breakdown |
|-----------|--:|------------------|
| `coalesced_ok` | 10 | `attach_keep_multi_family`×10 |
| `true_independent_entity` | 7 | `wd_related_qid_no_cross_family`×4, `wd_work_or_talk_not_person`×3 |
| `missing_ref` | 1 | `singleton_wp_no_typed`×1 |

### Finding-level table

| # | finding_id | title | providers | URL | typed_refs | ref_types | norm_entity | decision | conf | ev_n | gap_class | gap_detail |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | wd-Q80 | Tim Berners-Lee | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.955 | 10 | coalesced_ok | attach_keep_multi_family |
| 1 | ol-OL25245A | Tim Berners-Lee | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.945 | 10 | coalesced_ok | attach_keep_multi_family |
| 2 | viaf-85312226 | Tim Berners-Lee | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.935 | 10 | coalesced_ok | attach_keep_multi_family |
| 3 | viaf-85312226 | Tim Berners-Lee, 1955- | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.925 | 10 | coalesced_ok | attach_keep_multi_family |
| 4 | viaf-85312226 | Tim Berners-Lee, angla komputosciencisto, inventinto de la Tut-Tera Teksaĵo | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.915 | 10 | coalesced_ok | attach_keep_multi_family |
| 5 | viaf-85312226 | Tim Berners-Lee, britischer Informatiker, Erfinder des World Wide Web | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.905 | 10 | coalesced_ok | attach_keep_multi_family |
| 6 | viaf-85312226 | Tim Berners-Lee, Britaniko a sientista ti kompiuter, inbentor ti World Wide Web | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.895 | 10 | coalesced_ok | attach_keep_multi_family |
| 7 | viaf-85312226 | Tim Berners-Lee, Brits natuurkundige | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.885 | 10 | coalesced_ok | attach_keep_multi_family |
| 8 | viaf-85312226 | Tim Berners-Lee, britský informatik | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.875 | 10 | coalesced_ok | attach_keep_multi_family |
| 9 | viaf-85312226 | Tim Berners-Lee, britannialainen tietotekniikka-asiantuntija ja World Wide Webin keksijä | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q80 | qid:Q80, wd-Q80, viaf:85312226, ol:OL25245A, ol-OL25245A | ol,qid/wd,viaf | qid:Q80 | coalesce_attach_keep | 0.865 | 10 | coalesced_ok | attach_keep_multi_family |
| 10 | wd-Q120373140 | Tim Berners-Lee | wikidata | https://www.wikidata.org/wiki/Q120373140 | qid:Q120373140, wd-Q120373140 | qid/wd | qid:Q120373140 | singleton_keep | 0.618 | 1 | true_independent_entity | wd_related_qid_no_cross_family |
| 11 | wd-Q120373262 | Tim Berners-Lee | wikidata | https://www.wikidata.org/wiki/Q120373262 | qid:Q120373262, wd-Q120373262 | qid/wd | qid:Q120373262 | singleton_keep | 0.608 | 1 | true_independent_entity | wd_related_qid_no_cross_family |
| 12 | wd-Q22991023 | Tim Berners-Lee: A Magna Carta for the web | wikidata | https://www.wikidata.org/wiki/Q22991023 | qid:Q22991023, wd-Q22991023 | qid/wd | qid:Q22991023 | singleton_keep | 0.598 | 1 | true_independent_entity | wd_work_or_talk_not_person |
| 13 | wd-Q22946133 | Tim Berners-Lee: The year open data went worldwide | wikidata | https://www.wikidata.org/wiki/Q22946133 | qid:Q22946133, wd-Q22946133 | qid/wd | qid:Q22946133 | singleton_keep | 0.588 | 1 | true_independent_entity | wd_work_or_talk_not_person |
| 14 | wd-Q22980417 | Tim Berners-Lee: The next web | wikidata | https://www.wikidata.org/wiki/Q22980417 | qid:Q22980417, wd-Q22980417 | qid/wd | qid:Q22980417 | singleton_keep | 0.578 | 1 | true_independent_entity | wd_work_or_talk_not_person |
| 15 | wd-Q19761597 | Tim Berners-Lee | wikidata | https://www.wikidata.org/wiki/Q19761597 | qid:Q19761597, wd-Q19761597 | qid/wd | qid:Q19761597 | singleton_keep | 0.568 | 1 | true_independent_entity | wd_related_qid_no_cross_family |
| 16 | wd-Q55693401 | Tim Berners-Lee | wikidata | https://www.wikidata.org/wiki/Q55693401 | qid:Q55693401, wd-Q55693401 | qid/wd | qid:Q55693401 | singleton_keep | 0.558 | 1 | true_independent_entity | wd_related_qid_no_cross_family |
| 17 | wp-en-Tim_Berners_Lee | Tim Berners-Lee | wikipedia | https://en.wikipedia.org/wiki/Tim_Berners-Lee | — | wikipedia | — | singleton_keep | 0.478 | 1 | missing_ref | singleton_wp_no_typed |

### Evidence chains (compact)

- **wd-Q80** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **ol-OL25245A** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **viaf-85312226** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **viaf-85312226** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **viaf-85312226** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **viaf-85312226** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **viaf-85312226** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **viaf-85312226** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **viaf-85312226** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **viaf-85312226** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q80 · openlibrary:https://openlibrary.org/authors/OL25245A · viaf:https://viaf.org/viaf/85312226 · viaf:https://viaf.org/viaf/85312226 (+6)
- **wd-Q120373140** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q120373140
- **wd-Q120373262** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q120373262
- **wd-Q22991023** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q22991023
- **wd-Q22946133** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q22946133
- **wd-Q22980417** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q22980417
- **wd-Q19761597** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q19761597
- **wd-Q55693401** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q55693401
- **wp-en-Tim_Berners_Lee** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Tim_Berners-Lee

## S04 — Stripe

**Verdict:** NO COALESCE (multi=0) · multi_rate=**0.0**

### Why

Wikidata provider status=error → zero WD findings and zero qid:/viaf: bridges from P214. VIAF Autocomplete returns homonym/historical hits (John Stripe 1643, Adelle Stripe, Striped Horse France, …) each with family-local viaf: only — AutoSuggest did not emit WKP/QID for these. Open Library returns author string-matches (Five Stripe Books, Adelle Stripe, Stephen Stripe, …) with only ol:/ol- refs — remote_ids enrich absent on these records (no viaf:/qid: on findings). Wikipedia returns wp:en:* only (Stripe, Stripe Inc., striped animals, film) — no typed soft-refs under Bound#1 (title: coalesce banned). Result: no shared typed key across any two Acc families → multi_n=0. Even if WD had succeeded for Stripe Inc (Q200897), external P214 is empty — company often lacks VIAF. Pretty-Wrong / Ambiguous seed: many true independent lexical hits, not a single canonical company record.

### Gap class counts

| gap_class | n | detail breakdown |
|-----------|--:|------------------|
| `source_limitation` | 16 | `viaf_family_local_no_wkp`×8, `ol_no_remote_ids`×8 |
| `missing_ref` | 6 | `singleton_wp_no_typed`×6 |

### Finding-level table

| # | finding_id | title | providers | URL | typed_refs | ref_types | norm_entity | decision | conf | ev_n | gap_class | gap_detail |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | viaf-30463651 | Stripe, John, 1643-1737 | viaf | https://viaf.org/viaf/30463651 | viaf:30463651 | viaf | viaf:30463651 | singleton_keep | 0.701 | 1 | source_limitation | viaf_family_local_no_wkp |
| 1 | viaf-126600779 | Stripes | viaf | https://viaf.org/viaf/126600779 | viaf:126600779 | viaf | viaf:126600779 | singleton_keep | 0.691 | 1 | source_limitation | viaf_family_local_no_wkp |
| 2 | viaf-138753783 | Striped house museum of art Tokyo | viaf | https://viaf.org/viaf/138753783 | viaf:138753783 | viaf | viaf:138753783 | singleton_keep | 0.681 | 1 | source_limitation | viaf_family_local_no_wkp |
| 3 | viaf-57307946 | Stripecke, Renata | viaf | https://viaf.org/viaf/57307946 | viaf:57307946 | viaf | viaf:57307946 | singleton_keep | 0.671 | 1 | source_limitation | viaf_family_local_no_wkp |
| 4 | viaf-156206104 | Stripe, Adelle, 1976- | viaf | https://viaf.org/viaf/156206104 | viaf:156206104 | viaf | viaf:156206104 | singleton_keep | 0.661 | 1 | source_limitation | viaf_family_local_no_wkp |
| 5 | viaf-124465779 | Striped Horse France | viaf | https://viaf.org/viaf/124465779 | viaf:124465779 | viaf | viaf:124465779 | singleton_keep | 0.651 | 1 | source_limitation | viaf_family_local_no_wkp |
| 6 | viaf-83910682 | Střípek, Jiří, asi 1545-asi 1575 | viaf | https://viaf.org/viaf/83910682 | viaf:83910682 | viaf | viaf:83910682 | singleton_keep | 0.641 | 1 | source_limitation | viaf_family_local_no_wkp |
| 7 | viaf-172149106019768490790 | Stripe Eroeg | viaf | https://viaf.org/viaf/172149106019768490790 | viaf:172149106019768490790 | viaf | viaf:172149106019768490790 | singleton_keep | 0.631 | 1 | source_limitation | viaf_family_local_no_wkp |
| 8 | ol-OL8376862A | Five Stripe Books | openlibrary | https://openlibrary.org/authors/OL8376862A | ol:OL8376862A, ol-OL8376862A | ol | ol:OL8376862A | singleton_keep | 0.586 | 1 | source_limitation | ol_no_remote_ids |
| 9 | ol-OL8613090A | Adelle Stripe | openlibrary | https://openlibrary.org/authors/OL8613090A | ol:OL8613090A, ol-OL8613090A | ol | ol:OL8613090A | singleton_keep | 0.576 | 1 | source_limitation | ol_no_remote_ids |
| 10 | ol-OL13079935A | Stripe | openlibrary | https://openlibrary.org/authors/OL13079935A | ol:OL13079935A, ol-OL13079935A | ol | ol:OL13079935A | singleton_keep | 0.566 | 1 | source_limitation | ol_no_remote_ids |
| 11 | ol-OL10372320A | STRIPE | openlibrary | https://openlibrary.org/authors/OL10372320A | ol:OL10372320A, ol-OL10372320A | ol | ol:OL10372320A | singleton_keep | 0.556 | 1 | source_limitation | ol_no_remote_ids |
| 12 | ol-OL3492368A | Stephen Stripe | openlibrary | https://openlibrary.org/authors/OL3492368A | ol:OL3492368A, ol-OL3492368A | ol | ol:OL3492368A | singleton_keep | 0.546 | 1 | source_limitation | ol_no_remote_ids |
| 13 | ol-OL14670551A | Stripe Journals | openlibrary | https://openlibrary.org/authors/OL14670551A | ol:OL14670551A, ol-OL14670551A | ol | ol:OL14670551A | singleton_keep | 0.536 | 1 | source_limitation | ol_no_remote_ids |
| 14 | ol-OL3905682A | Subdued Stripe | openlibrary | https://openlibrary.org/authors/OL3905682A | ol:OL3905682A, ol-OL3905682A | ol | ol:OL3905682A | singleton_keep | 0.526 | 1 | source_limitation | ol_no_remote_ids |
| 15 | ol-OL15943217A | Sebastian Friedrich Stripe | openlibrary | https://openlibrary.org/authors/OL15943217A | ol:OL15943217A, ol-OL15943217A | ol | ol:OL15943217A | singleton_keep | 0.516 | 1 | source_limitation | ol_no_remote_ids |
| 16 | wp-en-Stripe | Stripe | wikipedia | https://en.wikipedia.org/wiki/Stripe | — | wikipedia | — | singleton_keep | 0.488 | 1 | missing_ref | singleton_wp_no_typed |
| 17 | wp-en-Striped_hyena | Striped hyena | wikipedia | https://en.wikipedia.org/wiki/Striped_hyena | — | wikipedia | — | singleton_keep | 0.478 | 1 | missing_ref | singleton_wp_no_typed |
| 18 | wp-en-Stripe_Inc_ | Stripe, Inc. | wikipedia | https://en.wikipedia.org/wiki/Stripe,_Inc. | — | wikipedia | — | singleton_keep | 0.468 | 1 | missing_ref | singleton_wp_no_typed |
| 19 | wp-en-Striped_polecat | Striped polecat | wikipedia | https://en.wikipedia.org/wiki/Striped_polecat | — | wikipedia | — | singleton_keep | 0.458 | 1 | missing_ref | singleton_wp_no_typed |
| 20 | wp-en-Striped_skunk | Striped skunk | wikipedia | https://en.wikipedia.org/wiki/Striped_skunk | — | wikipedia | — | singleton_keep | 0.448 | 1 | missing_ref | singleton_wp_no_typed |
| 21 | wp-en-Stripes_film_ | Stripes (film) | wikipedia | https://en.wikipedia.org/wiki/Stripes_(film) | — | wikipedia | — | singleton_keep | 0.438 | 1 | missing_ref | singleton_wp_no_typed |

### Evidence chains (compact)

- **viaf-30463651** (`source_limitation`): viaf:https://viaf.org/viaf/30463651
- **viaf-126600779** (`source_limitation`): viaf:https://viaf.org/viaf/126600779
- **viaf-138753783** (`source_limitation`): viaf:https://viaf.org/viaf/138753783
- **viaf-57307946** (`source_limitation`): viaf:https://viaf.org/viaf/57307946
- **viaf-156206104** (`source_limitation`): viaf:https://viaf.org/viaf/156206104
- **viaf-124465779** (`source_limitation`): viaf:https://viaf.org/viaf/124465779
- **viaf-83910682** (`source_limitation`): viaf:https://viaf.org/viaf/83910682
- **viaf-172149106019768490790** (`source_limitation`): viaf:https://viaf.org/viaf/172149106019768490790
- **ol-OL8376862A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL8376862A
- **ol-OL8613090A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL8613090A
- **ol-OL13079935A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL13079935A
- **ol-OL10372320A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL10372320A
- **ol-OL3492368A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL3492368A
- **ol-OL14670551A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL14670551A
- **ol-OL3905682A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL3905682A
- **ol-OL15943217A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL15943217A
- **wp-en-Stripe** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Stripe
- **wp-en-Striped_hyena** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Striped_hyena
- **wp-en-Stripe_Inc_** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Stripe,_Inc.
- **wp-en-Striped_polecat** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Striped_polecat
- **wp-en-Striped_skunk** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Striped_skunk
- **wp-en-Stripes_film_** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Stripes_(film)

## S05 — Red Cross

**Verdict:** BARE COALESCE (~0.17) · multi_rate=**0.1667**

### Why

Exactly two typed clusters fire: (1) American Red Cross Q470110 ∩ viaf:122023057 ∩ ol:OL17804A → 3 multi-family findings; (2) ICRC Q5987345 ∩ viaf:160178001 ∩ ol:OL124327A → 2 multi-family findings (openlibrary+viaf). 5/30 = 0.1667. Near-miss: wd-Q7178 (International Red Cross and Red Crescent Movement) carries viaf:145680594 from WD P214 (external confirms P214=145680594) but VIAF provider never emitted finding viaf-145680594 for seed 'Red Cross' → gap_class ref_present_unsupported (wd_p214_viaf_no_peer_finding). Same pattern on Q48438 / Q7305591. Remaining mass: national societies / people / WP disambiguation as true independents or family-local source_limitation (OL no remote_ids; VIAF no WKP); Wikipedia wp:-only.

### Gap class counts

| gap_class | n | detail breakdown |
|-----------|--:|------------------|
| `source_limitation` | 12 | `viaf_family_local_no_wkp`×6, `ol_no_remote_ids`×6 |
| `missing_ref` | 6 | `singleton_wp_no_typed`×6 |
| `coalesced_ok` | 5 | `attach_keep_multi_family`×5 |
| `true_independent_entity` | 4 | `wd_related_qid_no_cross_family`×4 |
| `ref_present_unsupported` | 3 | `wd_p214_viaf_no_peer_finding`×3 |

### Finding-level table

| # | finding_id | title | providers | URL | typed_refs | ref_types | norm_entity | decision | conf | ev_n | gap_class | gap_detail |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | wd-Q470110 | American Red Cross | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q470110 | qid:Q470110, wd-Q470110, viaf:122023057, ol:OL17804A, ol-OL17804A | ol,qid/wd,viaf | qid:Q470110 | coalesce_attach_keep | 0.945 | 3 | coalesced_ok | attach_keep_multi_family |
| 1 | ol-OL17804A | American National Red Cross | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q470110 | qid:Q470110, wd-Q470110, viaf:122023057, ol:OL17804A, ol-OL17804A | ol,qid/wd,viaf | qid:Q470110 | coalesce_attach_keep | 0.935 | 3 | coalesced_ok | attach_keep_multi_family |
| 2 | viaf-122023057 | Red Cross USA | wikidata,openlibrary,viaf | https://www.wikidata.org/wiki/Q470110 | qid:Q470110, wd-Q470110, viaf:122023057, ol:OL17804A, ol-OL17804A | ol,qid/wd,viaf | qid:Q470110 | coalesce_attach_keep | 0.925 | 3 | coalesced_ok | attach_keep_multi_family |
| 3 | ol-OL124327A | International Committee of the Red Cross | openlibrary,viaf | https://openlibrary.org/authors/OL124327A | ol:OL124327A, ol-OL124327A, viaf:160178001, qid:Q5987345, wd-Q5987345 | ol,qid/wd,viaf | qid:Q5987345 | coalesce_attach_keep | 0.784 | 2 | coalesced_ok | attach_keep_multi_family |
| 4 | viaf-160178001 | Red Cross. International Committee, Geneva | openlibrary,viaf | https://openlibrary.org/authors/OL124327A | ol:OL124327A, ol-OL124327A, viaf:160178001, qid:Q5987345, wd-Q5987345 | ol,qid/wd,viaf | qid:Q5987345 | coalesce_attach_keep | 0.774 | 2 | coalesced_ok | attach_keep_multi_family |
| 5 | wd-Q7178 | International Red Cross and Red Crescent Movement | wikidata | https://www.wikidata.org/wiki/Q7178 | qid:Q7178, wd-Q7178, viaf:145680594 | qid/wd,viaf | qid:Q7178 | singleton_keep | 0.668 | 1 | ref_present_unsupported | wd_p214_viaf_no_peer_finding |
| 6 | wd-Q48438 | Saint George | wikidata | https://www.wikidata.org/wiki/Q48438 | qid:Q48438, wd-Q48438, viaf:27862930 | qid/wd,viaf | qid:Q48438 | singleton_keep | 0.658 | 1 | ref_present_unsupported | wd_p214_viaf_no_peer_finding |
| 7 | wd-Q7305591 | Redd Kross | wikidata | https://www.wikidata.org/wiki/Q7305591 | qid:Q7305591, wd-Q7305591, viaf:191149196678574792964 | qid/wd,viaf | qid:Q7305591 | singleton_keep | 0.648 | 1 | ref_present_unsupported | wd_p214_viaf_no_peer_finding |
| 8 | wd-Q104700248 | Red Cross | wikidata | https://www.wikidata.org/wiki/Q104700248 | qid:Q104700248, wd-Q104700248 | qid/wd | qid:Q104700248 | singleton_keep | 0.638 | 1 | true_independent_entity | wd_related_qid_no_cross_family |
| 9 | wd-Q1968122 | National Red Cross and Red Crescent society | wikidata | https://www.wikidata.org/wiki/Q1968122 | qid:Q1968122, wd-Q1968122 | qid/wd | qid:Q1968122 | singleton_keep | 0.628 | 1 | true_independent_entity | wd_related_qid_no_cross_family |
| 10 | wd-Q116059498 | Red Cross | wikidata | https://www.wikidata.org/wiki/Q116059498 | qid:Q116059498, wd-Q116059498 | qid/wd | qid:Q116059498 | singleton_keep | 0.618 | 1 | true_independent_entity | wd_related_qid_no_cross_family |
| 11 | wd-Q50320550 | Red Cross | wikidata | https://www.wikidata.org/wiki/Q50320550 | qid:Q50320550, wd-Q50320550 | qid/wd | qid:Q50320550 | singleton_keep | 0.608 | 1 | true_independent_entity | wd_related_qid_no_cross_family |
| 12 | viaf-167237176 | Red Cross and Red Crescent | viaf | https://viaf.org/viaf/167237176 | viaf:167237176 | viaf | viaf:167237176 | singleton_keep | 0.581 | 1 | source_limitation | viaf_family_local_no_wkp |
| 13 | viaf-151269599 | Red Cross. Switzerland. Schweizerisches Rotes Kreuz | viaf | https://viaf.org/viaf/151269599 | viaf:151269599 | viaf | viaf:151269599 | singleton_keep | 0.571 | 1 | source_limitation | viaf_family_local_no_wkp |
| 14 | viaf-148420048 | Red Cross (Great Britain) | viaf | https://viaf.org/viaf/148420048 | viaf:148420048 | viaf | viaf:148420048 | singleton_keep | 0.561 | 1 | source_limitation | viaf_family_local_no_wkp |
| 15 | viaf-997897 | Red Cross international lawyer (1914-2002) Jean Pictet | viaf | https://viaf.org/viaf/997897 | viaf:997897 | viaf | viaf:997897 | singleton_keep | 0.551 | 1 | source_limitation | viaf_family_local_no_wkp |
| 16 | viaf-312731766 | Red Cross, Henry Dunant Institute | viaf | https://viaf.org/viaf/312731766 | viaf:312731766 | viaf | viaf:312731766 | singleton_keep | 0.541 | 1 | source_limitation | viaf_family_local_no_wkp |
| 17 | viaf-159584209 | Red Cross, Deutsches Rotes Kreuz | viaf | https://viaf.org/viaf/159584209 | viaf:159584209 | viaf | viaf:159584209 | singleton_keep | 0.531 | 1 | source_limitation | viaf_family_local_no_wkp |
| 18 | ol-OL2917704A | Red Cross | openlibrary | https://openlibrary.org/authors/OL2917704A | ol:OL2917704A, ol-OL2917704A | ol | ol:OL2917704A | singleton_keep | 0.486 | 1 | source_limitation | ol_no_remote_ids |
| 19 | ol-OL10303910A | American Red Cross | openlibrary | https://openlibrary.org/authors/OL10303910A | ol:OL10303910A, ol-OL10303910A | ol | ol:OL10303910A | singleton_keep | 0.476 | 1 | source_limitation | ol_no_remote_ids |
| 20 | ol-OL4511273A | Red Cross. | openlibrary | https://openlibrary.org/authors/OL4511273A | ol:OL4511273A, ol-OL4511273A | ol | ol:OL4511273A | singleton_keep | 0.466 | 1 | source_limitation | ol_no_remote_ids |
| 21 | ol-OL6290095A | Red Cross. Portuguese Red Cross. | openlibrary | https://openlibrary.org/authors/OL6290095A | ol:OL6290095A, ol-OL6290095A | ol | ol:OL6290095A | singleton_keep | 0.456 | 1 | source_limitation | ol_no_remote_ids |
| 22 | ol-OL13846643A | Red Cross. Portuguese Red Cross | openlibrary | https://openlibrary.org/authors/OL13846643A | ol:OL13846643A, ol-OL13846643A | ol | ol:OL13846643A | singleton_keep | 0.446 | 1 | source_limitation | ol_no_remote_ids |
| 23 | ol-OL2343831A | Red Cross. Junior Red Cross. | openlibrary | https://openlibrary.org/authors/OL2343831A | ol:OL2343831A, ol-OL2343831A | ol | ol:OL2343831A | singleton_keep | 0.436 | 1 | source_limitation | ol_no_remote_ids |
| 24 | wp-en-Red_Cross | Red Cross | wikipedia | https://en.wikipedia.org/wiki/Red_Cross | — | wikipedia | — | singleton_keep | 0.408 | 1 | missing_ref | singleton_wp_no_typed |
| 25 | wp-en-Red_Cross_parcel | Red Cross parcel | wikipedia | https://en.wikipedia.org/wiki/Red_Cross_parcel | — | wikipedia | — | singleton_keep | 0.398 | 1 | missing_ref | singleton_wp_no_typed |
| 26 | wp-en-Red_Cross_Youth_Philippines_ | Red Cross Youth (Philippines) | wikipedia | https://en.wikipedia.org/wiki/Red_Cross_Youth_(Philippines) | — | wikipedia | — | singleton_keep | 0.388 | 1 | missing_ref | singleton_wp_no_typed |
| 27 | wp-en-Red_Cross_of_Constantine | Red Cross of Constantine | wikipedia | https://en.wikipedia.org/wiki/Red_Cross_of_Constantine | — | wikipedia | — | singleton_keep | 0.378 | 1 | missing_ref | singleton_wp_no_typed |
| 28 | wp-en-Red_crossbill | Red crossbill | wikipedia | https://en.wikipedia.org/wiki/Red_crossbill | — | wikipedia | — | singleton_keep | 0.368 | 1 | missing_ref | singleton_wp_no_typed |
| 29 | wp-en-Red_Cross_EP_ | Red Cross (EP) | wikipedia | https://en.wikipedia.org/wiki/Red_Cross_(EP) | — | wikipedia | — | singleton_keep | 0.358 | 1 | missing_ref | singleton_wp_no_typed |

### Evidence chains (compact)

- **wd-Q470110** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q470110 · openlibrary:https://openlibrary.org/authors/OL17804A · viaf:https://viaf.org/viaf/122023057
- **ol-OL17804A** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q470110 · openlibrary:https://openlibrary.org/authors/OL17804A · viaf:https://viaf.org/viaf/122023057
- **viaf-122023057** (`coalesced_ok`): wikidata:https://www.wikidata.org/wiki/Q470110 · openlibrary:https://openlibrary.org/authors/OL17804A · viaf:https://viaf.org/viaf/122023057
- **ol-OL124327A** (`coalesced_ok`): openlibrary:https://openlibrary.org/authors/OL124327A · viaf:https://viaf.org/viaf/160178001
- **viaf-160178001** (`coalesced_ok`): openlibrary:https://openlibrary.org/authors/OL124327A · viaf:https://viaf.org/viaf/160178001
- **wd-Q7178** (`ref_present_unsupported`): wikidata:https://www.wikidata.org/wiki/Q7178
- **wd-Q48438** (`ref_present_unsupported`): wikidata:https://www.wikidata.org/wiki/Q48438
- **wd-Q7305591** (`ref_present_unsupported`): wikidata:https://www.wikidata.org/wiki/Q7305591
- **wd-Q104700248** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q104700248
- **wd-Q1968122** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q1968122
- **wd-Q116059498** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q116059498
- **wd-Q50320550** (`true_independent_entity`): wikidata:https://www.wikidata.org/wiki/Q50320550
- **viaf-167237176** (`source_limitation`): viaf:https://viaf.org/viaf/167237176
- **viaf-151269599** (`source_limitation`): viaf:https://viaf.org/viaf/151269599
- **viaf-148420048** (`source_limitation`): viaf:https://viaf.org/viaf/148420048
- **viaf-997897** (`source_limitation`): viaf:https://viaf.org/viaf/997897
- **viaf-312731766** (`source_limitation`): viaf:https://viaf.org/viaf/312731766
- **viaf-159584209** (`source_limitation`): viaf:https://viaf.org/viaf/159584209
- **ol-OL2917704A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL2917704A
- **ol-OL10303910A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL10303910A
- **ol-OL4511273A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL4511273A
- **ol-OL6290095A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL6290095A
- **ol-OL13846643A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL13846643A
- **ol-OL2343831A** (`source_limitation`): openlibrary:https://openlibrary.org/authors/OL2343831A
- **wp-en-Red_Cross** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Red_Cross
- **wp-en-Red_Cross_parcel** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Red_Cross_parcel
- **wp-en-Red_Cross_Youth_Philippines_** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Red_Cross_Youth_(Philippines)
- **wp-en-Red_Cross_of_Constantine** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Red_Cross_of_Constantine
- **wp-en-Red_crossbill** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Red_crossbill
- **wp-en-Red_Cross_EP_** (`missing_ref`): wikipedia:https://en.wikipedia.org/wiki/Red_Cross_(EP)

## Top failure classes — S04 / S05

### S04 Stripe (multi=0) — ranked

1. **`source_limitation`** — 16/22 (73%)
2. **`missing_ref`** — 6/22 (27%)

Root-cause narrative:
1. **source_limitation (16)** — WD provider `error` (no qid/P214 bridge at all); 8× VIAF family-local no WKP; 8× OL no `remote_ids`.
2. **missing_ref (6)** — Wikipedia `wp:`-only under Bound#1 (no `title:` coalesce).
3. Underlying seed shape: lexical Stripe* homonyms (true independent people/animals/film) dominate VIAF/OL/WP — not Stripe Inc.
4. External: Q200897 (Stripe Inc) has **empty P214** — even a healthy WD run would lack VIAF bridge.

### S05 Red Cross (multi≈0.17) — ranked

1. **`source_limitation`** — 12/30 (40%)
2. **`missing_ref`** — 6/30 (20%)
3. **`true_independent_entity`** — 4/30 (13%)
4. **`ref_present_unsupported`** — 3/30 (10%)

Root-cause narrative:
1. **source_limitation (12)** — 6× VIAF no WKP + 6× OL no remote_ids (national societies / authors stay family-local).
2. **missing_ref (6)** — Wikipedia `wp:`-only.
3. **true_independent_entity (4)** — related WD QIDs without cross-family peers (distinct orgs/topics).
4. **ref_present_unsupported (3)** — WD P214 viaf on Q7178 / Q48438 / Q7305591 with **no VIAF peer finding** (Autocomplete miss).
5. Coalesce that *did* fire: Q470110 + Q5987345 clusters only (5 findings).

## Gap taxonomy used

- `missing_ref`
- `ref_present_unsupported`
- `ref_conflict`
- `normalization_failure`
- `source_limitation`
- `graph/coalesce_limitation`
- `true_independent_entity`
- `coalesced_ok`

## Refs

- JSON twin: `01-FORENSICS-S01-S04-S05-שרת.json`
- Typed ref audit stub: `02-TYPED-REF-AUDIT-שרת.md`
- Status: `STATUS-שרת.md`
- Raw smoke: `../PHASE4-EXPERIMENT-A2-COALESCE/raw/typed-enrich-smoke/`
