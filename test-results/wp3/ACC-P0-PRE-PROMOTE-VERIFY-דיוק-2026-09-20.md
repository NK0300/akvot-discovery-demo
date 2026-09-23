# Acc PRE-PROMOTE VERIFY · דיוק · 2026-09-20

**STATUS:** Acc PRE-PROMOTE **GO** · **NO promote by דיוק** · alias **FROZEN**  
**When:** 2026-09-20 00:55:24 IDT (Asia/Jerusalem UTC+3) · finished ISO 2026-09-19T21:55:24.273Z  
**Pre-promote verify** · same Preview · **NO promote**

## Target
| Field | Value |
|-------|--------|
| BASE | `https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app` |
| dpl | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` |
| health.build | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` · match=true |
| Origin | `https://akvot-simple-demo.vercel.app` |
| Access | `vercel curl --scope k-akvot` |
| Alias | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` **FROZEN** · promote=false |
| Denylist ver | `2026-09-19.1` |

## HARD invariant
| Check | Result |
|-------|--------|
| Q1701775 / wd-Q1701775 anywhere in response JSON | **0 hits** across all matrix + body scan |
| leakage_count | **0** |
| pw | **0** |
| faces on Smith soft path | **0** (F1–F3) |
| STOP Acc FAIL if any Q1701775 | not triggered |

## Gate summary
| Cell | Result | Notes |
|------|--------|-------|
| F1 quiet×5 Smith POST+IBM/NY/US | **PASS** | ui soft · faces=0 · Q170∉ |
| F2 COLD×3 +nocache | **PASS** | same |
| F3 WARM×3 after cold | **PASS** | same · scrub on HIT too |
| F4 Assaf×2 | **PASS** | dossier Q47507930 |
| F5 כהן×2 | **PASS** | need_context\|thin · never dossier |
| F6 John Rappaport×1 | **PASS** | not Assaf QID |
| F7 Scan all bodies Q1701775 | **PASS** | files=18 hits=0 |
| **leakage** | **0** | |
| **pw** | **0** | |
| **Acc PRE-PROMOTE** | **GO** | Chief/שרת promote only · alias frozen |

## Detail tables

### F1 quiet×5
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | ms | raw |
|---|--------|-----|-------|------|----------|-----|-----------|----|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `e585bb7a-6ed6-47ed-bbb1-926cbd80674d` | 6054 | F1-quiet-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `a0721908-1e14-40e9-879f-8bc351394a82` | 9245 | F1-quiet-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `2ea7de73-8ad7-4368-bab4-9c05c88ce10c` | 8572 | F1-quiet-smith-3.json |
| 4 | candidates | null | 0 | false | — | 2026-09-19.1 | `52ef9b69-b510-4d1e-8e29-36948f8fcae3` | 9354 | F1-quiet-smith-4.json |
| 5 | candidates | null | 0 | false | — | 2026-09-19.1 | `36debd3b-0251-4665-8bda-d690ab766f30` | 8409 | F1-quiet-smith-5.json |

### F2 COLD×3 (nocache:1)
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | ms | raw |
|---|--------|-----|-------|------|----------|-----|-----------|----|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `2f4c36cd-3c75-4078-b7d5-4286b2485879` | 8421 | F2-cold-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `f6c4ab6b-4ae6-4780-b4e3-8480ca2b5c2d` | 8551 | F2-cold-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `0ffb0967-3ff1-42e5-8152-2b1c026a84dd` | 8519 | F2-cold-smith-3.json |

### F3 WARM×3
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | ms | raw |
|---|--------|-----|-------|------|----------|-----|-----------|----|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `b822854e-533f-4b9b-b651-24c6e281b5e4` | 8431 | F3-warm-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `dd7d0687-3214-4e83-a2bf-be52cd90fecd` | 8406 | F3-warm-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `f76aef2e-69a7-40d7-80ed-a7525889d4fe` | 8519 | F3-warm-smith-3.json |

### F4 Assaf×2 / F5 כהן×2 / F6 T-C6×1
| Cell | i | uiState | mode | qid | faces | Q170 | requestId | raw |
|------|---|--------|------|-----|-------|------|-----------|-----|
| F4 | 1 | dossier | wiki | Q47507930 | 2 | false | `0e93d2b0-134c-4d44-b38c-d7c7c3141abd` | F4-assaf-1.json |
| F4 | 2 | dossier | wiki | Q47507930 | 2 | false | `3c237448-45c9-4b5f-9177-b9c87d65cebd` | F4-assaf-2.json |
| F5 | 1 | need_context | candidates | null | 0 | false | `106b3893-2f50-49e6-b542-c4fa094ddec1` | F5-cohen-1.json |
| F5 | 2 | need_context | candidates | null | 0 | false | `d8ca8f71-919a-4a3b-973f-cc8755b8a626` | F5-cohen-2.json |
| F6 | 1 | need_context | ambiguous | null | 0 | false | `4c02d537-2878-4351-8c77-4c8f939a9f9a` | F6-john-rappaport-1.json |

## Body scan (F7)
- files scanned: **18**
- Q1701775 hits: **0**
- offenders: none

## Artifacts
- `test-results/wp3/ACC-P0-PRE-PROMOTE-VERIFY-דיוק-2026-09-20.md`
- `test-results/wp3/ACC-P0-PRE-PROMOTE-VERIFY-דיוק-2026-09-20.json`
- `test-results/wp3/ACC-P0-PRE-PROMOTE-VERIFY-raw/` (health + F1–F6 payloads)

## Handoff
**Acc PRE-PROMOTE GO** → Chief/שרת promote only · **HOLD** · alias `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` frozen · Preview `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` only.
