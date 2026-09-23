# 15 — ADVERSARIAL DESIGN CASES · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · expected architectural behavior

---

## Cases

### 1. Homonyms (two famous people, same name)

| | |
|--|--|
| **Risk** | Coalesce or rank merges distinct people |
| **Expected behavior** | Separate Findings; SAME-REFERENCE only on shared typed soft-ref across hostFamilies; title similarity NEVER merges (A2-bound REJECTED) |
| **Evidence** | A2 adversarial 12/12 · hardening 28/28 |

### 2. URL-alone seed

| | |
|--|--|
| **Risk** | Label SAME-REFERENCE / SAME-ENTITY from URL |
| **Expected behavior** | UrlOriginStage emits metadata; relationship **UNKNOWN**; BAD_URL_ALONE_SAME=0 |
| **Evidence** | C1-PATCHED Bound · C1-PREPATCH KEEP FAIL |

### 3. Title-bridge temptation

| | |
|--|--|
| **Risk** | Inflate MULTI via title keys (A2-bound ~0.52) |
| **Expected behavior** | Planner/orchestrator **deny** title coalesce; MULTI secondary only |
| **Evidence** | A2-EXPERIMENTAL-BASELINE REJECTED |

### 4. Domain-ownership inference

| | |
|--|--|
| **Risk** | WHOIS/RDAP/registrableDomain → org identity |
| **Expected behavior** | Forbidden; domain node is provenance only; UNKNOWN |
| **Evidence** | C1 SEMANTIC-CONTRACT · What-not-to-build #5 |

### 5. Poisoned metadata (og:title contains forbidden QID / Acc bait)

| | |
|--|--|
| **Risk** | Acc leak or false identity via meta |
| **Expected behavior** | Treat meta untrusted; Acc scrub emit; poison patterns gated; no SAME-* from meta |
| **Evidence** | C1 Acc gates J · emit scrub |

### 6. SSRF seeds (http://169.254.169.254/ · localhost · private IP)

| | |
|--|--|
| **Risk** | Orchestrator fetches internal |
| **Expected behavior** | urlSafety hard block before fetch; failureClass `unsafe_url`; no bypass via QueryPlan |
| **Evidence** | C1 SSRF PASS · urlSafety.js |

### 7. Compound / role seeds (`CEO of X`)

| | |
|--|--|
| **Risk** | Invent person↔org SAME-ENTITY; alias blast |
| **Expected behavior** | seedClass=ambiguous; tight budget; empty/UNKNOWN valid; no identity theater |
| **Evidence** | Integration Review S12–S15 coverage gaps |

### 8. Empty families (filings not wired)

| | |
|--|--|
| **Risk** | Fake filings hits or silent skip without reason |
| **Expected behavior** | Intent may be planned but family `unsupported`/`skipped` with reason; S04-style authority gap remains honest |
| **Evidence** | A2 S04 AUTHORITY LIMITATION |

### 9. Budget exhaustion mid-fanout

| | |
|--|--|
| **Risk** | Silent extra providers; partial corruption |
| **Expected behavior** | Stop; mark `budget_exhausted`; return partial progressive results; no plan mutation without revision record |
| **Evidence** | Scalability risk IR §6 |

### 10. Contradictory refs (mutually exclusive typed ids)

| | |
|--|--|
| **Risk** | Attach anyway / hide conflict |
| **Expected behavior** | `contradicts` edge; no SAME-REFERENCE attach; CONTRADICTORY label when applicable |
| **Evidence** | A2/C1 vocab · detectContradictions substrate |

---

## Architectural invariant under adversarial pressure

> Pressure to “fix empties” must never weaken Bound, Acc, or independence honesty.
