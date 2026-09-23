# CHECKPOINT B — DISCOVERY ENGINE · GO-IMPL-500

**Stamp:** 2026-09-22T00:10:00+03:00 IDT  
**Status:** **PASS**  
**Depends on:** Checkpoint A = PASS  
**Locks honored:** B0/Core/A2/C1 · F11 (no new HTTP) · flags default OFF · Acc scrub · budget hard-stop

---

## Verdict

| Gate | Result |
|------|--------|
| Existing public sources (WD/WP/OL) Seed→Plan→Family→Evidence→Result under QueryPlan ON | **PASS** |
| Flag OFF = B0 verbatim (no queryPlan) | **PASS** |
| Family journal deduped; empty ≠ fanout | **PASS** |
| F11 candidates `unsupported`/`skipped` (never fake ok) | **PASS** |
| Seed routing: person/org/url/domain (existing providers only) | **PASS** |
| Evidence confirmationState=`candidate`; provenance fields present | **PASS** |
| Acc bait scrub on plan emit | **PASS** |
| C1 url-alone ceiling → unknown | **PASS** |
| checkpointB.e2e.test.mjs | **36/0** |

---

## What shipped (Phase 2 complete within F11)

1. **Live adapters wired** through `familyOrchestrator` when `DISCOVERY_ENABLE_QUERYPLAN=1`  
   - wikidata → knowledge_graph · wikipedia → encyclopedia · openlibrary → bibliographic  
   - VIAF / web_origin remain flag-gated (unchanged defaults OFF)
2. **Launch dedupe** — one GO launch per familyId (no vanity double-fetch)
3. **Candidate families** — descriptors only; journal status `unsupported` + `candidate_unwired_f11`
4. **Seed routing expanded** — 2–3 token alphabetic → `person` (SEARCH INTENT ≠ identity); org/url/domain unchanged
5. **confirmationState=candidate** preserved through normalizeRawHit + orch path
6. **E2E suite** `checkpointB.e2e.test.mjs` (36 asserts)

## Explicitly NOT done (correct)

- No filings/news/registry HTTP (F11)  
- No crawl / private sources  
- No productionEligible / promote  
- No A2-bound / C1 unfreeze  

## Residual

- Dual-run CONTROL/TREATMENT harness still future (GO-MEASURE)  
- VIAF/webOrigin e2e under their own flags covered by unit eligibility; live network not required in Checkpoint B mocks  
- sessionStore Upstash health flake — env-only, ignored  

## Continue

→ Phase 5 Progressive SSE (Checkpoint D started) · Phase 4 graph explain-why · obs lite
