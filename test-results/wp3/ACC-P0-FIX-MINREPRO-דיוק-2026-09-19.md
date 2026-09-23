# Acc P0 FIX-3 · MINIMAL REPRO · דיוק · 2026-09-19

**STATUS:** Acc **GO** for FIX-4 handoff · **NO promote** · alias **FROZEN**  
**When:** 2026-09-19 ~23:35 IDT (Asia/Jerusalem UTC+3)  
**Spec:** `test-results/handoff/P3-ACC-P0-FIX-EXPECTED-דיוק-2026-09-19.md`

## Target
| Field | Value |
|-------|--------|
| BASE | `https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app` |
| dpl | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` |
| health.build | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` · match=true |
| Origin | `https://akvot-simple-demo.vercel.app` |
| Access | `vercel curl --scope k-akvot` |
| Alias | FROZEN · promote=false |
| Denylist ver | `2026-09-19.1` (observed on all probes) |

## HARD invariant
| Check | Result |
|-------|--------|
| Q1701775 / wd-Q1701775 anywhere in response JSON | **0 hits** across all matrix raw payloads |
| leakage_count | **0** |
| pw | **0** |
| faces on Smith soft path | **0** (all M1–M4) |
| STOP Acc FAIL if any Q1701775 | not triggered |

## Gate summary
| Cell | Result | Notes |
|------|--------|-------|
| M1 quiet×3 Smith POST+IBM/NY/US | **PASS** | ui∈candidates · faces=0 · Q170∉ |
| M2 COLD×3 +nocache | **PASS** | same |
| M3 WARM×3 after cold | **PASS** | 2×candidates + 1×thin(ambiguous) · faces=0 · Q170∉ |
| M4 repeated quiet×5 | **PASS** | all candidates · leakage=0 |
| M5 WD 429/empty | **SKIP_OPTIONAL** | no harness; natural soft OK |
| M6 Assaf | **PASS** | dossier Q47507930 (mode=wiki) |
| M7 כהן | **PASS** | need_context · not dossier |
| M8 John Rappaport (T-C6) | **PASS** | need_context · qid=null · not Assaf |
| **leakage** | **0** | |
| **pw** | **0** | |
| **Acc → FIX-4** | **GO** | |

## Detail tables

### M1 quiet×3
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | raw |
|---|--------|-----|-------|------|----------|-----|-----------|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `de9790fe-9ba9-409e-89e3-91bb99aedd01` | M1-quiet-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `ce3230c2-5c86-44c6-ab17-221caa970baa` | M1-quiet-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `8bac22b4-f379-42d0-9191-bd7ac94c2a31` | M1-quiet-smith-3.json |

### M2 COLD×3 (nocache:1)
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | raw |
|---|--------|-----|-------|------|----------|-----|-----------|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `59e3ed8d-9e56-4a81-be5d-5064b5f504d5` | M2-cold-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `42b8fd37-b147-4cdd-978a-710277c498b3` | M2-cold-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `5adb6882-9cab-4d2f-926a-07bb49dcf565` | M2-cold-smith-3.json |

### M3 WARM×3
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | raw |
|---|--------|-----|-------|------|----------|-----|-----------|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `8b38478e-a494-4750-9eb7-bbbf763159c5` | M3-warm-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `7ddcea56-38b0-4182-80dc-7edfafedeb63` | M3-warm-smith-2.json |
| 3 | thin | null | 0 | false | — | 2026-09-19.1 | `cb614e39-ab76-44af-a465-2690ee1d7c6a` | M3-warm-smith-3.json |

### M4 repeated quiet×5
| i | uiState | qid | faces | Q170 | stripped | ver | requestId | raw |
|---|--------|-----|-------|------|----------|-----|-----------|-----|
| 1 | candidates | null | 0 | false | — | 2026-09-19.1 | `007d41d5-3821-4c1c-9ef8-e33211039f57` | M4-repeat-smith-1.json |
| 2 | candidates | null | 0 | false | — | 2026-09-19.1 | `6af4b896-ac42-491c-b9be-f1a9d101576d` | M4-repeat-smith-2.json |
| 3 | candidates | null | 0 | false | — | 2026-09-19.1 | `7ec55b17-2bac-4ab5-bc23-399d825fe8c4` | M4-repeat-smith-3.json |
| 4 | candidates | null | 0 | false | — | 2026-09-19.1 | `70594efb-822f-486d-a018-4654b188b292` | M4-repeat-smith-4.json |
| 5 | candidates | null | 0 | false | 1 | 2026-09-19.1 | `a1c8c6bc-06d0-400c-993e-29797d1a8cc2` | M4-repeat-smith-5.json |

### M6 Assaf / M7 כהן / M8 T-C6
| Cell | uiState | mode | qid | faces | Q170 | requestId | raw |
|------|---------|------|-----|-------|------|-----------|-----|
| M6 | dossier | wiki | Q47507930 | 2 | false | `411c1ec0-dae7-42a7-8f72-4befe914fa26` | M6-assaf-1.json |
| M7 | need_context | candidates | null | 0 | false | `1874ef37-6645-49b2-a6fe-f9426c1c6522` | M7-cohen-1.json |
| M8 | need_context | ambiguous | null | 0 | false | `8367fb80-e197-44f2-b8a5-fdd300e17670` | M8-john-rappaport-1.json |

## M5 note
No Preview harness to force WD 429/empty. Observed natural soft Smith paths (candidates/thin) with **Q1701775 absent**. Scrub field `forbiddenStripped` present when WD returned banned QID (see raw where non-null).

## Artifacts
- `test-results/wp3/ACC-P0-FIX-MINREPRO-דיוק-2026-09-19.md`
- `test-results/wp3/ACC-P0-FIX-MINREPRO-דיוק-2026-09-19.json`
- `test-results/wp3/ACC-P0-FIX-MINREPRO-raw/` (health + M1–M8 payloads)

## Handoff
**Acc GO** → @בודק FIX-4 load on same Preview `dpl_5UFys…` · **NO promote** · alias frozen until Chief explicit GO.
