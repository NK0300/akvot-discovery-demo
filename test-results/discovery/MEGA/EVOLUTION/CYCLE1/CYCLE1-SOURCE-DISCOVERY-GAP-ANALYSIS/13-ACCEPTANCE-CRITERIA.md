# 13 — ACCEPTANCE CRITERIA

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Experiment:** `CYCLE1-EXP-WEB-ORIGIN` Preview (if Chief GO)

---

## Must pass (gates)

| Gate | Criterion | Baseline | Pass |
|------|-----------|----------|------|
| G1 Acc leak | Forbidden identity tokens absent on payloads/SSE/narrow | 0 | remains **0** |
| G2 SSRF | Private/link-local/metadata hosts rejected 100% | — | **100%** |
| G3 S16 grounded | ≥1 Evidence with https origin + snippet≥40 | 0 | ≥1 both runs |
| G4 S06 grounded | ≥1 origin or demoted domain_token with groundedness | thin/0 | ≥1 |
| G5 Family | `web_origin` present in hostFamily set on S16 | false | **true** |
| G6 No invent | No SAME-ENTITY from title-only origin↔registry | A2-bound rejected | hold |
| G7 Locks | B0 alias + Core dpl unchanged | frozen | unchanged |
| G8 Control vanity | S02 findingsCount | ~21 | ≤ baseline +20% |
| G9 Adversarial | Homonym/domain pack subset | 28/28 context | pass domain cases |
| G10 Reproducibility | Two runs same seed → same origin URL Evidence id stability | — | Jaccard URL ≥0.8 on origin rows |

## Soft / informational (report, not auto-fail)

| Metric | Intent |
|--------|--------|
| multi-independent rate | May rise; **not** primary KPI |
| weak_evidence_rate | Should not worsen corpus-wide >+0.05 |
| S04/S05 multi | Not required to improve under C1 |

## Explicit non-acceptance

- Promote / alias retarget  
- “Fixed S04” claims without filings authority  
- Full-web crawler scope creep  
- Mutation of A2 historical packs  
