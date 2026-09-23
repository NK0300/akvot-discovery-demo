# 09 — TRADEOFF ANALYSIS

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Scoring:** 1=low · 5=high for beneficial dimensions. **FP risk:** 1=low risk · 5=high risk.  
**Rule:** Factual trade-offs only — **no** subjective “best” label in scores.

| Candidate | discovery gain | independence | evidence quality | entity coverage | FP risk | complexity | reliability | reproducibility | Notes |
|-----------|---------------:|-------------:|-----------------:|----------------:|--------:|-----------:|------------:|----------------:|-------|

| C1 EXP-WEB-ORIGIN | 5 | 5 | 4 | 5 | 3 | 3 | 3 | 4 | Directly serves public-web discovery; new family; SSRF gated by existing urlSafety; origin snippets often grounded. |
| C2 EXP-HE-LOCALE | 3 | 1 | 4 | 3 | 2 | 2 | 4 | 5 | High language fidelity; low complexity; independence unchanged (wikimedia); reproducible MediaWiki APIs. |
| C3 EXP-SEC-EDGAR | 4 | 5 | 5 | 4 | 3 | 4 | 4 | 4 | Strong legal authority for US corps (S04 class); filings family; CIK mapping FP risk; SEC fair-access complexity. |
| C4 EXP-NEWS-PUBLIC | 4 | 4 | 3 | 3 | 4 | 3 | 3 | 3 | Freshness gain; headline FP/homonym risk higher; outlet allowlist maintenance; weaker as authority. |
| C5 EXP-SCHOLARLY | 3 | 4 | 4 | 4 | 2 | 3 | 4 | 4 | Strong for academic persons/docs; limited for brands/NGOs; public APIs stable. |
| C6 EXP-QUERYPLAN | 4 | 2 | 3 | 4 | 3 | 3 | 3 | 3 | Unlocks empty compound seeds without new hosts; independence only via existing families; parse errors→wrong entity. |
| C7 EXP-GOV-ALLOWLIST | 3 | 4 | 4 | 3 | 2 | 4 | 3 | 3 | Fills authority orphan; ops-heavy allowlist; politics/sensitivity; not universal coverage. |
| C8 EXP-RDAP | 2 | 3 | 3 | 4 | 2 | 2 | 3 | 4 | Domain-type support; redaction limits evidence; pairs with C1 better than standalone. |
| C9 EXP-ARCHIVES | 2 | 3 | 3 | 3 | 2 | 3 | 2 | 3 | Historical type; slow/partial captures; easy to overclaim longevity as identity. |

## Reading guide (non-prescriptive)

- High **discovery gain** + high **independence** + controllable **FP risk** → aligns with MAXIMUM PUBLIC-WEB DISCOVERY.
- High evidence quality alone (library/filings) may still miss URL seeds.
- Low independence (C2) can still be valuable for locale fidelity — different axis than MULTI.
- Complexity includes security/ Acc co-bounds (especially C1 SSRF, C3 fair-access).

## Rejected trade-off paths (already decided)

| Path | Trade-off | Decision |
|------|-----------|----------|
| A2-bound title-bridge | multi↑ · truth↓ | **REJECTED** |
| Force S04/S05 multi inside A2 | metric↑ · invents authority | **NO** — limitations labeled |
| Full web_public crawler | surface↑ · security↓ | **DEFER** |
