# Acc Gate FORMAL · דיוק · 2026-09-20

**STATUS:** Acc Gate **GO** for Chief REVIEW · **NO promote** · alias **FROZEN**  
**When:** 2026-09-19T21:27:07.895Z (box local Asia/Jerusalem UTC+3)  
**Stricter than:** FIX-3 minrepro

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
| F7 Scan all bodies Q1701775 | **PASS** | files=17 hits=0 |
| **leakage** | **0** | |
| **pw** | **0** | |
| **Acc Gate** | **GO** | Chief REVIEW · HOLD promote |

## Detail tables

### F1 quiet×5
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | ms | raw |
|---|--------|-----|-------|------|----------|-----|-----------|----|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `4f8c89b7-9c81-4dde-b89f-8bf48216ed0e` | 5895 | F1-quiet-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `4d416080-facf-43c2-a0f2-39ced0b4a7db` | 8382 | F1-quiet-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `8b985158-834c-4e95-ba9a-64c0a0e9df07` | 8799 | F1-quiet-smith-3.json |
| 4 | candidates | null | 0 | false | — | 2026-09-19.1 | `c1e99041-e1c2-4cc0-829f-f8c7374890b8` | 8747 | F1-quiet-smith-4.json |
| 5 | candidates | null | 0 | false | — | 2026-09-19.1 | `72485513-7ecd-4a1a-97b8-96721c90d732` | 8773 | F1-quiet-smith-5.json |

### F2 COLD×3 (nocache:1)
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | ms | raw |
|---|--------|-----|-------|------|----------|-----|-----------|----|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `ac56c52c-925d-420f-abc8-5feadce76b3b` | 8226 | F2-cold-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `42f354e5-31b9-4ba3-87e6-ff0577ae0d79` | 8342 | F2-cold-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `f50bddb2-96aa-4164-ac17-a815871d3215` | 9053 | F2-cold-smith-3.json |

### F3 WARM×3
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | ms | raw |
|---|--------|-----|-------|------|----------|-----|-----------|----|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `71095ab9-546e-4c31-abe1-312fc06e0bba` | 8746 | F3-warm-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `d6b26a15-24e5-438e-9d89-a6dc5487f154` | 8471 | F3-warm-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `0f4bad0d-b4ec-4a0f-bfc6-7e918f3b7220` | 8468 | F3-warm-smith-3.json |

### F4 Assaf×2 / F5 כהן×2 / F6 T-C6×1
| Cell | i | uiState | mode | qid | faces | Q170 | requestId | raw |
|------|---|--------|------|-----|-------|------|-----------|-----|
| F4 | 1 | dossier | wiki+google | Q47507930 | 7 | false | `a16e7036-1fc5-4a50-87b1-5bc7d6dca67e` | F4-assaf-1.json |
| F4 | 2 | dossier | wiki+google | Q47507930 | 7 | false | `a16e7036-1fc5-4a50-87b1-5bc7d6dca67e` | F4-assaf-2.json |
| F5 | 1 | need_context | candidates | null | 0 | false | `7b55ac05-b73b-4c93-ba17-7914ce8c3d55` | F5-cohen-1.json |
| F5 | 2 | need_context | candidates | null | 0 | false | `7b55ac05-b73b-4c93-ba17-7914ce8c3d55` | F5-cohen-2.json |
| F6 | 1 | need_context | candidates | null | 0 | false | `7787db72-75bd-496b-accc-3dc17b590298` | F6-john-rappaport-1.json |

## Body scan (F7)
- files scanned: **17**
- Q1701775 hits: **0**
- offenders: none

## Artifacts
- `test-results/wp3/ACC-P0-GATE-FORMAL-דיוק-2026-09-20.md`
- `test-results/wp3/ACC-P0-GATE-FORMAL-דיוק-2026-09-20.json`
- `test-results/wp3/ACC-P0-GATE-FORMAL-raw/` (health + F1–F6 payloads)

## Handoff
**Acc Gate GO** → Chief REVIEW · **HOLD promote** · alias `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` frozen · Preview `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` only.
