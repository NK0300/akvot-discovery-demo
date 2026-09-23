# DISCOVERY-RECHECK — deltas only

**Stamp:** 2026-09-20 12:05 IDT  
**Rule:** Do **not** claim discovery success until labels clean.  
**label_clean_on_patched:** **true**  
**relationship_12:** **PASS** (12/12)

## Label delta (primary Bound)

| Seed | PREPATCH `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | PATCHED `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
|------|--------------------------|----------------------------|
| `https://www.who.int` | **SAME-REFERENCE** (finding+evidence+facet) | **UNKNOWN** (finding+evidence+facet) |
| `who.int` | SAME-REFERENCE (prepatch TREAT-W5) | **UNKNOWN** |

## Acc re-AFTER row deltas (PATCHED)

| ID | wo | rel_hist | SE | SR | leak |
|----|---:|----------|---:|---:|-----:|
| S16 | 1 | {'UNKNOWN': 1} | 0 | 0 | 0 |
| W5 | 1 | {'UNKNOWN': 1} | 0 | 0 | 0 |
| W7 | 1 | {'UNKNOWN': 1} | 0 | 0 | 0 |
| S01 | 0 | — | — | — | 0 |

## Control B0 web_origin
Expect **0** wo on B0 (flag off): `{'ACC-S01': 0, 'S16': 0}`

## Acc totals (PATCHED)
`{"treat_leak": 0, "raw_body_leak": 0, "same_entity": 0, "same_reference": 0, "private_provenance": 0, "BAD_URL_ALONE_SAME": 0, "treat_rows_n": 18, "raw_seed_echo_only": 2, "identity_surface_leak": 0}`

JSON: `raw/DISCOVERY-RECHECK.json`
