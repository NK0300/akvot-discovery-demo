# 04 — TESTS · שרת · Unit counts & coalesce invariants

**Stamp:** 2026-09-20 10:35 IDT  
**Re-run locally:** `node --test api/lib/discovery/providers.viaf.test.mjs api/lib/discovery/corroboration.viaf.test.mjs`

---

## Counts (A2-safe enrich wave)

| Suite | Passed | Failed |
|-------|-------:|-------:|
| `providers.viaf` | **44** | **0** |
| `corroboration.viaf` | **50** | **0** |
| `orchestrator` | 113 | 0 |
| `adversarial.acc` | 65 | 0 |
| `prCloseout.acc` | 107 | 0 |

Source stamp: `22-PREVIEW-TYPED-ENRICH.json` · `TYPED-SOFTREF-ENRICH-שרת.md`

Bound#1 earlier corroboration count was **35/0** (title-only fix cases); enrich wave added WKP/P214/OL remote_ids + enriched merge cases → **50/0** (labelRelationship vocabulary asserts).

---

## Invariants covered

### Homonym — NO merge

| Case | Expectation | Status |
|------|-------------|--------|
| Title-only peers (shared display name, no typed id) | Stay single-family; no corroboration edge; coverage preserved | PASS |
| Title-homonym distinct VIAF/QID | 3 findings kept; no Evidence/entityRefs cross-contam; providers not unioned | PASS |
| Homonym typed forms (qid on one side, different viaf on other, no shared key) | No merge | PASS |
| Pretty-Wrong `Stripe` ↛ `Stripe, John` | John stays viaf-only single-family | PASS |

### Same typed key — DOES merge (attach_keep)

| Case | Expectation | Status |
|------|-------------|--------|
| Same `viaf:85312226` across wikidata + viaf | Multi-family attach; findings length preserved; edge recorded; `titleSecondary` agree | PASS |
| Same `qid:Q…` across families | Multi-family attach; attach_keep | PASS |
| Enriched viaf/qid across WD+OL+VIAF | Multi-family attach when typed keys intersect | PASS |

### Provider enrich units (`providers.viaf`)

| Case | Status |
|------|--------|
| VIAF WKP → `qid:` / `wd-Q…` + keep `viaf:` | PASS |
| WD P214 → `viaf:` soft-ref | PASS |
| OL emits `ol:` · remote viaf/qid | PASS |
| OL / WD emit **no** `title:` ref | PASS |
| `extractViafWikidataQid` / `viafIdsFromWikidataEntity` helpers | PASS |

---

## Live smoke alignment (not unit)

- Bound#1 preview: multi=0 (no typed intersection yet) — consistent with units requiring shared typed keys.
- Enrich preview: S01 multi fires on `viaf:85312226` / `qid:Q80`; S04 Stripe multi=0 (Pretty-Wrong / no shared typed id) — consistent.


**A2-SAFE Preview:** `dpl_4Zxd9MnMs6WsTgSLrryyvGY3htpY` · HOLD promote.
