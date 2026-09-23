# 14 — OBSERVABILITY AND KPIS · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Ground:** Integration Review Discovery KPI set · A2 “MULTI secondary” · C1 honesty metrics  
**Rule:** Do **not** invent live metrics in this pack — define what to measure later.

---

## Product objective reminder

Ask whether Akvot discovers more true, useful, independently supported public information while remaining honest about UNKNOWN — **not** whether findingsCount or multi can be made bigger.

**MULTI is secondary.**

---

## KPI classes (design)

### A. Plan quality (new)

| KPI | Definition (design) | Honesty note |
|-----|---------------------|--------------|
| Plan hit rate | Share of sessions where ≥1 planned step yields ≥1 emitted finding | Not vanity |
| Intent-correct routing rate | Manual/golden: class matches expected for seed matrix | Needs @בודק corpus |
| Skipped-budget rate | Steps skipped due to wall | Cost signal |
| Empty-but-honest rate | Underspecified/url-fail → 0 findings without SAME-* | Positive honesty |

### B. Family coverage

| KPI | Definition |
|-----|------------|
| Family coverage | Distinct families with ≥1 finding / session |
| Family enable rate | Flag_on families attempted |
| Authority orphan gap | Seeds expecting filings/gov still empty (track gap — don’t fake) |

### C. UNKNOWN honesty (primary safety)

| KPI | Definition | Cite |
|-----|------------|------|
| URL-alone SAME-* count | Must be **0** | C1 Bound |
| Acc leak | Must be **0** | Acc packs |
| UNKNOWN label rate on U0-only | Should be high/exclusive for URL-alone | C1 |

### D. Independence (secondary)

| KPI | Definition | Caveat |
|-----|------------|--------|
| mean multi | Existing A2 metric | Secondary · seed-specific |
| SAME-REFERENCE attach rate | Typed only | Never from URL |

### E. Safety / cost

| KPI | Definition |
|-----|------------|
| SSRF reject count | urlSafety denies |
| Fanout size | steps × families |
| Provider error soft-fail rate | Existing |

---

## What not to optimize

- findingsCount inflation  
- multi via title-bridge  
- suppressing UNKNOWN to look complete  
- dual-locale double-count as “coverage”

---

## Telemetry attachment

Prefer session-scoped scrubbed summaries + existing `obs.js` counters. No PII · no secrets · no forbidden identities in metric labels.

---

## Cite-only historical baselines (do not rewrite)

| Lane | multi | Acc leak | Notes |
|------|-------|----------|-------|
| B0 | 0 | 0 | production |
| A2-safe | ≈0.21 | 0 | FROZEN EXPERIMENTAL |
| C1-PATCHED | — | 0 | URL UNKNOWN · SSRF PASS |

Packs: `A2-EXPERIMENTAL-BASELINE.md` · C1 evidence pack.

---

## STOP

KPI design only. No dashboard impl · no invented numbers.
