# QA-AFTER-vs-B0 · בודק · EXP-A2 coalesce · 2026-09-20

**Role:** בודק (golden smoke)  
**Stamp:** 2026-09-20T10:18:05+03:00 (Asia/Jerusalem)  
**Promote:** **HOLD**  
**Core:** LOCKED `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · Assaf/כהן/Smith — untouched  
**Aliases:** untouched (`https://akvot-discovery.vercel.app` stays B0)

## Targets

| Lane | Deployment | URL |
|------|------------|-----|
| **Preview (coalesce)** | `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2` | https://akvot-simple-demo-h9cq1ob4m-k-akvot.vercel.app |
| **B0** | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | https://akvot-discovery.vercel.app |
| **Core LOCKED** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | https://akvot-simple-demo.vercel.app |

## Metric (Acc redef)

- **Unit:** FindingId after coalesce  
- **multi_independent:** Evidence[] has **≥2** distinct provider families  
- **Families:** `wikidata` ≠ `wikipedia` ≠ `openlibrary` ≠ `viaf` ≠ `other:<apex>` (lang Wikipedia mirrors = one family)  
- **Rate:** multi_n / findings_with_≥1_Evidence  
- **Gate:** mean(S01, S04, S05) **≥ 0.15** · Acc leak **= 0** · S01 findings vs B0 (no vacuum)

## Seeds

| ID | Seed | Category |
|----|------|----------|
| S01 | Tim Berners-Lee | person |
| S04 | Stripe | company |
| S05 | Red Cross | organization |

## Results — Preview (AFTER)

| Seed | Findings | With ≥1 Ev | Multi_n | **Rate** | Families | VIAF | Leak |
|------|----------|------------|---------|----------|----------|------|------|
| S01 | 18 | 18 | 15 | **0.8333** | openlibrary, viaf, wikidata, wikipedia | Y | 0 |
| S04 | 22 | 22 | 2 | **0.0909** | viaf, wikidata, wikipedia | Y | 0 |
| S05 | 30 | 30 | 12 | **0.4** | openlibrary, viaf, wikidata, wikipedia | Y | 0 |

- **mean multi_independent_rate:** **0.4414**  
- **pooled (diagnostic):** 0.4143 (29/70)

## Results — B0 live (re-measure)

| Seed | Findings | With ≥1 Ev | Multi_n | Rate | Families | Leak |
|------|----------|------------|---------|------|----------|------|
| S01 | 9 | 9 | 0 | 0 | wikidata, wikipedia | 0 |
| S04 | 22 | 22 | 0 | 0 | openlibrary, wikidata, wikipedia | 0 |
| S05 | 22 | 22 | 0 | 0 | openlibrary, wikidata, wikipedia | 0 |

- **mean (live B0):** 0.0000

## B0 frozen Acc BEFORE (reference)

| Seed | Findings | Rate | Leak |
|------|----------|------|------|
| S01 | 10 | 0.0 | 0 |
| S04 | 14 | 0.0 | 0 |
| S05 | 6 | 0.0 | 0 |
| **mean** | — | **0.0** | **0** |

## Coverage watch (S01)

| | Findings |
|--|----------|
| B0 frozen | 10 |
| B0 live | 9 |
| Preview | **18** |
| No vacuum | **PASS** |

## Acc leak

- Forbidden: Q1701775 / wd-Q1701775  
- Preview: 0 · B0: 0 · **Total: 0** → **PASS**

## Gates

| Gate | Result | Value |
|------|--------|-------|
| mean multi ≥ 0.15 | **PASS** | 0.4414 |
| Acc leak = 0 | **PASS** | 0 |
| S01 no vacuum | **PASS** | Preview 18 vs B0 frozen 10 |

## Overall

# **PASS**

**Promote: HOLD** (explicit — no alias retarget, no Core touch)

## Artifacts

- `QA-AFTER-vs-B0-בודק-2026-09-20.json`
- `raw-qa/` (create + poll + final per seed × Preview/B0)
- Acc redef: `ACC-MULTI-INDEPENDENT-REDEF-דיוק-2026-09-20.md`

## Method

`vercel curl --deployment <dpl> --scope k-akvot` from `/workspace/akvot-quick-demo`  
POST `/api/discovery/sessions` → poll until complete/partial → score Acc redef on snapshot.
