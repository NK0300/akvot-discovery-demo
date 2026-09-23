# EXP-A2 COALESCE — RESULT

**Stamp:** 2026-09-20 10:14 IDT (Asia/Jerusalem)  
**Verdict:** **PASS**

## Preview
| Field | Value |
|-------|-------|
| dpl | `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2` |
| URL | https://akvot-simple-demo-h9cq1ob4m-k-akvot.vercel.app |
| Env | `DISCOVERY_ENABLE_VIAF=1` (Preview only) |
| Promote | **HOLD** |

## Aliases (verified post-measure)
| Alias | dpl | Status |
|-------|-----|--------|
| `akvot-discovery.vercel.app` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **UNCHANGED** |
| `akvot-simple-demo.vercel.app` (Core) | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED / UNCHANGED** |

## Acc-style multi_independent (mean S01/S04/S05)

| Seed | Findings B0 | Findings Preview | multi B0 | multi Preview | VIAF |
|------|------------:|-----------------:|---------:|--------------:|------|
| S01 Tim Berners-Lee | 10 | **18** | 0.000 | **0.8333** | yes |
| S04 Stripe | 22 | 30 | 0.000 | **0.3333** | yes |
| S05 Red Cross | 22 | 30 | 0.000 | **0.4000** | yes |
| **Mean** | | | **0.000** | **0.5222** | **3/3** |
| Pooled | | | 0 | **0.4744** (37/78) | |

Gate: mean Preview **0.5222 ≥ 0.15** · delta **+0.5222** · S01 coverage **18** (no vacuum to 1).

## Acc leak
| Check | Result |
|-------|--------|
| Forbidden QID `Q1701775` | **0** |
| ACC-SCAN.json | **PASS** |

## Pretty-Wrong checks
| Case | Result |
|------|--------|
| Stripe ≠ Stripe, John | **PASS** (John stays viaf-only single-family) |
| Magna Carta TED talk ≠ person cluster | **PASS** (single-family wikidata) |

## Units (local)
- corroboration.viaf / coalesce: **passed=28 failed=0**
- providers.viaf: **passed=27 failed=0**
- adversarial Acc: **passed=65 failed=0**
- discovery orchestrator: **passed=105 failed=0**

## STOP
**No promote. No alias retarget. Core untouched.**

## Acc family map note
Acc EXP-A2 redef counts `wikidata` ≠ `wikipedia` ≠ `openlibrary` ≠ `viaf`.  
Re-scored Preview under that map: mean **0.5222** · pooled **0.4744** (same as product `hostFamily` wikimedia-collapse for these seeds). B0 Acc-map mean remains **0**.
