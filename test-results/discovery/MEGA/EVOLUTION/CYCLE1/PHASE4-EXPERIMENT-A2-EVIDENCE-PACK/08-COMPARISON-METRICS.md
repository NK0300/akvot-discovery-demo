# 08-COMPARISON-METRICS · B0 | A | A2-bound | A2-safe

**Stamp:** 2026-09-20T10:42:29+03:00 IDT (Asia/Jerusalem, UTC+3)  
**A2-safe Preview:** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` · https://akvot-simple-demo-221421o5s-k-akvot.vercel.app  
**Promote:** **HOLD**

## Matrix

| Lane | dpl | mean multi | pooled | S01 findings | Acc leak | false title-merge | Pretty-Wrong | notes |
|------|-----|------------|--------|--------------|----------|-------------------|--------------|-------|
| **B0** | `dpl_Avyhr…` | **0** | 0 | 10 | 0 | N/A | baseline | Discovery alias frozen |
| **A** (EXP-A VIAF) | `dpl_4Rj7c…` | **0** | 0 | ~18 | 0 | none | guarded | VIAF siblings; no cross-family attach |
| **A2-bound (FRNDab)** | `dpl_FRNDab…` | **0.5189** | 0.4675 | 17 | 0 | **CAVEAT** title: | residual | NOT promote-path |
| **A2-safe** | `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` | **0.2074** | 0.1714 | 18 | **0** | **0** (Bound#1) | Stripe multi=0 | typed soft-ref + labels |

## A2-safe per-seed (live)

| Seed | findings | multi_rate | viaf_n | edges | relationship | leak |
|------|---------:|-----------:|-------:|------:|--------------|-----:|
| S01 Tim Berners-Lee | 18 | **0.5556** | 10 | 45 | {'related-entity': 45} | 0 |
| S04 Stripe | 22 | **0** | 8 | 0 | {} | 0 |
| S05 Red Cross | 30 | **0.0667** | 9 | 1 | {'related-entity': 1} | 0 |

- **mean multi:** **0.2074** (gate ≥0.15 → **PASS**)
- **Acc leak total (seeds+homonym):** **0**
- **Homonym corpus:** 12/12 pass · leak=0

## Reading

- FRNDab high multi is **not** a win — title-only bridge (Arch/Acc caveat).
- Bound#1 Fz2iq multi=0 proved safety without enrichment.
- A2-safe restores multi via **typed** cross-family refs only; S04 Stripe stays 0 (Pretty-Wrong expected).
- Live graph edges label mostly `related-entity` when titleSecondary=disagree (date/locale VIAF variants) while sharing typed keys — still attach_keep, **not** dossier/`same-entity` collapse.

See also `08-COMPARISON-METRICS.json`.
