# SEED-METRICS — בודק · 2026-09-20

**Stamp:** 2026-09-20T09:50:29+03:00 → 2026-09-20T09:52:23+03:00 IDT
**Mode:** Observation only · NO CODE · NO PROMOTE
**Discovery B0:** https://akvot-discovery.vercel.app → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` (expect `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`) · **PASS**
**Core LOCKED:** https://akvot-simple-demo.vercel.app → `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` (expect `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`) · **PASS**

## Coverage / diversity

| Metric | Value |
|--------|-------|
| seedCount | 12 |
| uniqueSeeds | 12 |
| types | HE_person_soft, Latin_ambiguous, org_domain, empty_invalid, Smith_plus_ctx, celeb_Core_only_note, bare_surname, EN_twin |
| typeCoverageOk | true |
| findings_n min/avg/max | 0 / 9.25 / 22 |
| providers_union | wikidata, openlibrary, wikipedia |
| storeBackend | upstash |
| regenerated_any | false |
| dup_title_hints | 7 |
| leakage_total | **0** |

## Per-seed metrics

| id | type | class | status | findings_n | providers | create_ms | get_ms | leak | regen | store |
|----|------|-------|--------|------------|-----------|-----------|--------|------|-------|-------|
| B01 | HE_person_soft | soft_discovery | partial | 10 | wikidata+openlibrary+wikipedia | 3061 | 2427 | 0 | false | upstash |
| B02 | Latin_ambiguous | soft_discovery | partial | 21 | wikidata+openlibrary+wikipedia | 2866 | 2719 | 0 | false | upstash |
| B03 | org_domain | soft_discovery | complete | 3 | wikidata+openlibrary+wikipedia | 4490 | 2359 | 0 | false | upstash |
| B04 | org_domain | soft_discovery | partial | 14 | wikidata+openlibrary+wikipedia | 5857 | 2277 | 0 | false | upstash |
| B05 | empty_invalid | soft_discovery | error err:seed required | 0 | — | 2309 | 0 | 0 | false | — |
| B06 | empty_invalid | soft_discovery | complete | 0 | wikidata+openlibrary+wikipedia | 3203 | 2217 | 0 | false | upstash |
| B07 | Smith_plus_ctx | soft_discovery | partial | 13 | wikidata+openlibrary+wikipedia | 5847 | 2330 | 0 | false | upstash |
| B08 | celeb_Core_only_note | Core_regression_only | partial | 14 | wikidata+openlibrary+wikipedia | 6182 | 2346 | 0 | false | upstash |
| B09 | bare_surname | soft_discovery | partial | 22 | wikidata+openlibrary+wikipedia | 3617 | 2693 | 0 | false | upstash |
| B10 | EN_twin | soft_discovery | failed_soft | 0 | wikidata+openlibrary+wikipedia | 5854 | 2342 | 0 | false | upstash |
| B11 | Latin_ambiguous | soft_discovery | partial | 14 | wikidata+openlibrary+wikipedia | 4379 | 2245 | 0 | false | upstash |
| B12 | empty_invalid | soft_discovery | failed_soft | 0 | wikidata+openlibrary+wikipedia | 5812 | 2239 | 0 | false | upstash |

## Dup title hints

| id | findings_n | unique_titles | dup_delta |
|----|------------|---------------|-----------|
| B01 | 10 | 8 | 2 |
| B02 | 21 | 12 | 9 |
| B04 | 14 | 11 | 3 |
| B07 | 13 | 6 | 7 |
| B08 | 14 | 7 | 7 |
| B09 | 22 | 21 | 1 |
| B11 | 14 | 11 | 3 |

## Core regression spot (Assaf / כהן / Smith)

| lookup | mode | qid | pw | leak | ms |
|--------|------|-----|----|------|----|
| assaf | ambiguous | null | 0 | 0 | 7663 |
| cohen-he | candidates | null | 0 | 0 | 3866 |
| smith | ambiguous | null | 0 | 0 | 7771 |
| smith-ctx | candidates | null | 0 | 0 | 10023 |

**pw total:** 0 · **leakage total:** 0 · **still 8ag:** true · **PASS**

## QA gate

- disc_build_B0: **PASS**
- core_build_8ag: **PASS**
- leakage_0: **PASS**
- type_coverage: **PASS**
- seed_count_ge_8: **PASS**
- core_pw_0: **PASS**
- core_leak_0: **PASS**

**Overall:** **PASS**

