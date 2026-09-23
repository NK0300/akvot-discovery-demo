# EXPANSION-NOISE-RISKS — Cycle1 Phase5 Step 50

**Stamp (IDT):** 2026-09-20T10:06:46+03:00  
**Mode:** measurable risk register for any future QueryPlan expansion  
**Policy:** INFORMATION GAIN > vanity findingsCount · Acc leak must stay 0 · B0 alias untouched  

---

## Principle

Expansion that increases `findingsCount` without raising **independent usable evidence** (new host family, native language snippet, grounded URL origin, constraint-satisfying hit) is **noise**. EXP-A already showed mean multi↑ while S01 count **fell** 10→1 — count alone is a vanity metric.

---

## Risk register

| ID | Risk | Mechanism | Observable metrics | Linked gaps | Severity | Mitigation (design) |
|----|------|-----------|--------------------|-------------|----------|---------------------|
| ENR-01 | **Vanity count inflation** | Synonym / spelling fanout multiplies same-family hits | `findingsCount`↑ · `near_title_rate`↑ · `multi_independent_rate` flat · Diversity score flat | QD-02, PG-03 | HIGH | Cap queries/provider ≤2; require new hostFamily or constraint match for “gain” credit |
| ENR-02 | **Soft-label over-merge** | Aggressive alias/spelling → labelsCompatible merges distinct people | S01-style collapse; Ambiguity↓ falsely; person-split lost | QD-02, QD-03, PG-03 | HIGH | Merge only cross-family; keep same-family near-dups visible; emit ambiguityClusters |
| ENR-03 | **EN echo on HE seeds** | Dual HE+EN without native prefer → EN registry flood | `he.wikipedia.org` absent; quote_lang=en; S07 n thin vs S02 flood | QD-05, PG-04, BS-SRC-04 | HIGH | Script detect → locale=he primary; EN secondary demoted; quote≥40 |
| ENR-04 | **SSRF / unsafe origin** | URL/domain expand fetches seed URL | Acc+security FAIL; blocked hosts | BS-SRC-05 | CRITICAL | Reuse `urlSafety`; https-only; no private IP; metadata only; Acc co-bound |
| ENR-05 | **Org→author pollution** | Extra OL author queries on brand tokens (Stripe) | publication/author share↑; corporate-fit↓ | QD-05, BS-SRC-03 | MED | Org-intent → skip or demote OL authors; prefer VIAF corporate |
| ENR-06 | **VIAF weak-token drift** | Short tokens AutoSuggest off-topic corporate/personal | multi family present but relevance low; S04/S05 multi <0.15 per-seed | QD-01 residual | MED | nametype filter; soft-match title to seed; don’t promote on mean alone |
| ENR-07 | **Role default celebrity** | Context ignored; head name only (Jordan) | Wrong-person; Acc pretty-wrong adjacent | PG-02, S11 | HIGH | Constraint token must appear in title/summary OR demote; unstable runs = FAIL |
| ENR-08 | **Acc facet reopen** | New facetHints / entityRefs / web_origin | Forbidden QID / nested scrub miss | BS-ACC-SOFT | HIGH | Extend Acc fixtures before Preview; leak=0 hard gate |
| ENR-09 | **Budget starvation** | N queries × providers blow wallMs | providers=skipped/partial; false empty | BS-OBS-RANK | MED | QueryPlan budget share; primary q first; secondary only if primary empty |
| ENR-10 | **Relationship hop explosion** | Employer/subsidiary fanout before head resolve | noise×N; relationship class still 0 useful | Step 49 | HIGH | **Defer** until EXP-C head resolution PASS |
| ENR-11 | **Honest-empty → noisy-empty** | Keyword trap invents hits | Coverage vanity; under-specified hidden | QD-04 S12 | MED | Prefer explicit `emptyReason=under-specified` over junk |
| ENR-12 | **Preview≠B0 attribution** | Measuring expansion on wrong dpl | False gate close (BS-DRIFT) | BS-DRIFT | MED | Tag every measure with dpl; B0 SoT stays Avyhr |

---

## Measurable “INFORMATION GAIN” definition (for Phase5+ experiments)

A Preview run earns IG credit when **≥1** of:

1. **Independence:** `multi_independent_rate`↑ on gate seeds **or** new `hostFamily` appears with surviving provenanceUrl  
2. **Coverage of intent:** grounded findings≥1 on previously empty S13/S14/S15/S16 (not on S09 nomatch)  
3. **Native language:** `he.wikipedia.org` (or HE WD description) on HE-script seeds with quote_len≥40  
4. **Constraint satisfaction:** context/role token reflected in retained finding (S11/S14)

**Does NOT earn IG credit alone:**

- Higher findingsCount  
- Same-family near-dup flood  
- Soft-label merge that only collapses labels without new family  
- EN Wikipedia echo of HE seed  

---

## EXP-A residual noise (already observed)

| Observation | Noise class | Action for strategy |
|-------------|-------------|---------------------|
| S01 10→1 | ENR-02 (expected under merge) | Report multi **and** evidence family cardinality; don’t sell count↓ as FAIL |
| S04 multi 0.136 / S05 0.105 | ENR-06 | Per-seed gate optional; mean PASS ≠ per-seed PASS |
| VIAF weak related hits | ENR-06 | Soft-match / nametype before promote consideration |

---

## Expansion classes ranked by noise/IG ratio

| Expansion class | Noise/IG | Phase5 stance |
|-----------------|----------|---------------|
| HE locale auto + quote floor | LOW / HIGH | **EXP-B — GO design** |
| URL origin metadata + compound/role parse | MED / HIGH (SSRF gated) | **EXP-C — GO design** |
| Soft-label cross-family (existing EXP-A) | MED / HIGH | HOLD promote; tune soft-match |
| Org-intent OL demotion | LOW / MED | EXP-D stretch ranking-only |
| Spelling edit-distance fanout | HIGH / LOW | DEFER |
| Relationship graph hops | HIGH / UNKNOWN | DEFER |
| News/filings crawl | HIGH / HIGH later | Out of Phase5 |

---

## Gates before any expansion Preview

1. Acc Q1701775 variants = 0  
2. Core `dpl_8ag…` untouched · Discovery alias `dpl_Avyhr…` untouched  
3. Success metrics use IG definition above (not raw count)  
4. ENR-04 SSRF tests green if URL path enabled  
5. Budget: sessionWallMs not regressing provider_ok rate on S01  

