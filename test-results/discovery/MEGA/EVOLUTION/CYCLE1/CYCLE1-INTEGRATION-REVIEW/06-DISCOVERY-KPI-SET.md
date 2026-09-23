# 06 — DISCOVERY KPI SET · MEASURE WHAT MATTERS

**Stamp:** 2026-09-20T12:21:00+03:00 IDT  
**Mode:** DOCUMENT-ONLY · canonical definitions · **multi-independent is SECONDARY**  
**Machine copy:** `KPI-DEFINITIONS.json`

> Product objective: systematically discover more **true, useful, independently supported** public information while remaining honest about **UNKNOWN**.  
> **Not** the objective: make MULTI or findingsCount bigger.

---

## Canonical KPI table

| # | KPI | Definition | Unit | How measured | Instrumented now? |
|---|-----|------------|------|--------------|-------------------|
| 1 | **Relevant findings / seed** | Count of findings that pass groundedness (non-empty provenance URL + usable quote/summary or registry label) and are not Acc-scrubbed junk | findings/seed | Post-emit session findings with quality filters; corpus golden seeds | **PARTIAL** — findings_n recorded in rechecks; “relevant” filter not single canonical function |
| 2 | **Novel findings / seed** | Findings whose evidenceFingerprint (or canonical URL) not seen in B0 control for same seed | findings/seed | Diff TREATMENT vs CONTROL fingerprints | **PARTIAL** — C1 reports Δ findings/wo; novelty not named KPI |
| 3 | **Evidence coverage** | Share of findings with ≥1 Evidence row meeting quote/summary floor (e.g. ≥40 chars where applicable) | ratio 0–1 | Per-session evidence lengths | **PARTIAL** — weak_evidence_rate≈0.52 Phase3; floor experimental in C1/Phase5 design |
| 4 | **Source-family diversity** | Count of distinct `hostFamily` values among Evidence on the session (not provider count) | families/session | hostFamily map | **YES** — used in Phase4/A2; WD+WP collapsed |
| 5 | **Independent-source diversity** | Count of Findings with Evidence spanning ≥2 hostFamilies after typed coalesce (**SECONDARY**) | mean multi / rate | A2 Acc multi metric | **YES** on A2 Preview packs; B0=0.0 |
| 6 | **Entity-type coverage** | Share of seed-type buckets (person/company/org/domain/URL/doc/…) with ≥1 grounded finding | ratio by bucket | Seed matrix labels × outcomes | **PARTIAL** — seed matrix exists; not one rolled KPI |
| 7 | **URL/domain coverage** | Share of URL/domain seeds with ≥1 `web_origin` (or equivalent) grounded Evidence | ratio | C1 S16/W5 style | **YES** for C1 corpus; **UNKNOWN** broad web |
| 8 | **Contradiction rate** | Contradictions detected / findings (or per session) | rate | `detectContradictions` | **PARTIAL** — detector exists; rate not gated |
| 9 | **UNKNOWN preservation** | On URL/hostname-alone web_origin emits: share labeled UNKNOWN; BAD_URL_ALONE_SAME count | ratio + count | Rel12 · Acc Bound audit | **YES** on C1-PATCHED (BAD=0; Rel12 12/12) |
| 10 | **False merge rate** | Merges/attaches that violate typed soft-ref rules or collapse distinct authority keys (incl. title-bridge) | rate / count | Adversarial + S04/S05 forensics | **PARTIAL** — A2-bound rejected; adversarial 28/28; continuous rate UNKNOWN |
| 11 | **Pretty-wrong (pw)** | Core Acc pretty-wrong count on locked Core alias | count | Core regression suite | **YES** — Core pw=0 locked |
| 12 | **Acc leakage** | Forbidden identity tokens on Discovery emit surfaces (findings/evidence/facets/contradictions/GET/narrow/SSE) | count | Acc full-surface | **YES** — B0/A2/C1 leak=0 cited |
| 13 | **Latency** | Session create → terminal / provider batch ms / health WRUD | ms | obs.js · health · budgets | **PARTIAL** — budgets exist; Evolution must re-measure vs bootstrap |
| 14 | **Provider failure rate** | Share of provider states `error`/`partial`/`skipped` per session or corpus | rate | session.providers map | **PARTIAL** — states emitted; corpus rollup not canonical |

---

## Instrumentation notes

- Prefer citing pack paths over inventing dashboards.
- KPI 5 (multi) remains **secondary** — use for independence attach quality, never as promote sole gate.
- KPI 9–12 are **safety/honesty gates**; regressing them blocks any discovery gain claim.
- Where Instrument = PARTIAL/UNKNOWN, next engineering should add measurement **before** claiming improvement.

---

## Non-KPIs (explicitly reject as product objectives)

| Vanity | Why reject |
|--------|------------|
| Raw findingsCount | Inflates via recirculation / bibliographic noise |
| Provider chip count | WD+WP ≠ independence |
| Prestige domain weight alone | Orphan gov weights; not emitters |
| Identity confidence % | Forbidden theater |
