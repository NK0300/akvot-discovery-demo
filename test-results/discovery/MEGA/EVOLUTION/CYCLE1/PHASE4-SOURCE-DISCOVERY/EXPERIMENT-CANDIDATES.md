# EXPERIMENT-CANDIDATES — Cycle1 Phase4 (Step 40)

**Status:** DESIGN ONLY · no implementation · no deploy · no promote  
**Stamp (IDT):** 2026-09-20T09:54:30+03:00  
**Baseline:** B0 · Core `dpl_8ag…` LOCKED  
**Addresses:** QD-01 (source monoculture), QD-04 (coverage holes), QD-05 (publication/noise & thin evidence)  
**Also touches:** PG-01, PG-02, PG-04 · BS-SRC-01..05

> Do **not** implement in Phase4. Candidates are measurable hypotheses for later Cycle1 phases.

---

## EXP-A — Independent registry provider (VIAF) to break monoculture
**QD:** QD-01 (primary), QD-05 (secondary via better identity anchors)  
**Blind spot:** BS-SRC-01  

### Hypothesis
Adding a live **VIAF** SearchProvider to `DEFAULT_PROVIDERS` increases per-finding multi-independent-source rate on proper-name / org seeds without raising Acc leakage.

### Design (no code now)
1. Provider adapter: VIAF public SRU/AutoSuggest (authMode none, robots respect) — already named in pack / Acc stubs.
2. Independence family: `viaf` distinct from `wikimedia` and `openlibrary`.
3. Ranking: map `viaf.org` into DOMAIN_AUTHORITY (e.g. 0.85) **and** require family-based Independence factor from SOURCE-QUALITY-MODEL.
4. Merge rule: same soft label + different family → corroboration edge, not title-only contradiction.

### Metrics (must measure)
| Metric | Seeds | B0 baseline | Success |
|---|---|---:|---|
| `multi_independent_source_rate` | S01, S04, S05 (r1) | 0.0 | ≥0.15 |
| `families_union` includes viaf | S01/S04/S05 | false | true on ≥2/3 seeds |
| Acc leakage Q1701775 | all | 0 | remains 0 |
| `single_family_finding_rate` | S01/S04/S05 | 1.0 | ≤0.85 |

### Risks / holds
- Acc adversarial fixtures already mention viaf — extend scrub tests before enable.
- Do not promote; Preview-only lane if implemented later.

---

## EXP-B — HE locale + native sources + snippet floor (noise/thin)
**QD:** QD-05 (primary), QD-01 (secondary via he.wikipedia family still wikimedia but reduces EN bias / empty quotes)  
**Blind spots:** BS-SRC-04, BS-SRC-08  

### Hypothesis
(1) Passing `locale=he` for Hebrew seeds so Wikipedia hits `he.wikipedia.org`, and (2) enforcing quote/summary ≥40 chars (or drop/demote), will raise Evidence/Relevance proxies on S07 and cut weak_evidence_rate without new Acc leakage.

### Design
1. Seed-language detect (Hebrew script) → `locale=he` on create.
2. Confirm OpenSearch `descs[]` survive normalize/emit (B0 shows empty WP quotes — fix path TBD in later phase).
3. Soft filter: findings with quote_len<20 demoted; <0 with no summary excluded from top-N.
4. Optional: prefer WD descriptions in `uselang=he` when locale=he.

### Metrics
| Metric | Seeds | B0 baseline | Success |
|---|---|---:|---|
| `he.wikipedia.org` domain present | S07 | false | true both runs |
| wikipedia `quote_len` mean (S07 WP rows) | S07 | 0 | ≥40 |
| weak_evidence_rate (corpus) | all w/ findings | 0.5205 | ≤0.40 |
| Acc leakage | all | 0 | 0 |
| Findings count S07 | S07 | 2 | ≥2 (no regression to 0) |

### Risks
- Still same wikimedia family — does **not** alone close QD-01; pair with EXP-A.
- Over-filtering may empty thin seeds — monitor Coverage.

---

## EXP-C — Intent resolvers for URL / role / compound seeds (coverage)
**QD:** QD-04 (primary), QD-05 (filter junk from naive web)  
**Blind spots:** BS-SRC-05, BS-SRC-06  

### Hypothesis
Adding (a) URL/domain origin resolver under existing `urlSafety.js` and (b) lightweight compound-seed parse (head entity + constraint) yields ≥1 grounded finding on S13/S14/S15/S16 without Acc leakage and without Core touch.

### Design
1. **URL/domain path (S06/S16):** if seed matches URL/hostname → fetch allowlisted origin metadata (title, og:site_name) as `kind:page` / family `web_origin`; still no open crawl.
2. **Compound path (S13–S15):** split on stopwords (`CEO of`, `/`, org tokens) → primary entity query to existing providers + constraint retained as facetHint.
3. **Keyword trap (S12):** require ≥1 token to match provider hit title loosely or return explicit empty with reason `under-specified` (honest empty ≠ silent empty).
4. Groundedness gate: new web_origin evidence must have https + snippet≥40.

### Metrics
| Metric | Seeds | B0 baseline | Success |
|---|---|---:|---|
| findings ≥1 grounded | S16 | 0 | ≥1 both runs |
| findings ≥1 grounded | S13, S14, S15 | 0 | ≥1 on ≥2 of 3 seeds |
| Coverage proxy (non-nomatch seeds w/ ≥1 r1) | 15 seeds | 9/15 (60) | ≥12/15 (≥80) |
| Acc leakage | all | 0 | 0 |
| web_origin family present | S16 | false | true |

### Risks
- SSRF — must reuse `urlSafety` allowlist/deny; Acc+security co-bound.
- `web_public` full crawler remains out of scope; origin metadata only.

---

## EXP-D (optional stretch) — Publication demotion / work-vs-person filter
**QD:** QD-05  
**Hypothesis:** Demoting WD QIDs whose description matches work/talk/book patterns and OL-only bibliographic hits when a WD person entity exists will cut publication primary share without harming identity-relevant count on S01.

| Metric | B0 | Success |
|---|---:|---:|
| publication primary share (P3-style on S01) | high TED/work QIDs | ≥30% relative reduction |
| identity-relevant count S01 | keep ≥ baseline−1 | non-regress |
| Acc | 0 | 0 |

---

## Priority for later Cycle1 phases
1. **EXP-A** (QD-01) — unlocks Independence  
2. **EXP-C** (QD-04) — unlocks Coverage on intent seeds  
3. **EXP-B** (QD-05 / PG-04) — HE + thin evidence  
4. EXP-D as cheap ranking-only follow-on

## Explicit non-goals this phase
- No provider code changes  
- No deploy / promote  
- No Core `dpl_8ag` touch  
- No Strategy A/B implementation
