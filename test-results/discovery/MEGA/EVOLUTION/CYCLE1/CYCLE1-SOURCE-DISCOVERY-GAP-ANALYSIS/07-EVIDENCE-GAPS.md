# 07 — EVIDENCE GAPS

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Tied to:** QD-05 · SOURCE-QUALITY-MODEL · A2 under-key notes

---

## Measured evidence weaknesses

| Signal | B0 value | Gap |
|--------|----------|-----|
| Wikipedia `quote_mean` | **0.0** | OpenSearch descs empty → thin page Evidence |
| Wikipedia `thin_lt20_rate` | **1.0** | Pages inflate count without grounded snippets |
| weak_evidence_rate | **0.5205** | >half findings weak by length/structure |
| Freshness factor | **0.9 constant** | `retrievedAt` ≠ source lastmod/published |
| Per-finding providers | usually 1 | Corroboration factor capped / misleading |
| WP typed keys for coalesce | rare | Wikipedia under-keyed for A2 attach |
| OL remote_ids | often absent | Blocks OL↔VIAF/WD triangle |
| Language field on Evidence | absent | Cannot gate HE fidelity |

## Evidence quality model factors (design — not implemented)

Independence 0.22 · Groundedness 0.18 · Intent fit 0.18 · Non-noise 0.14 · Corroboration 0.12 · Freshness currency 0.08 · Emitter reliability 0.08  
Hard gates: Acc scrub · robots/https · monoculture flag.

## Gaps by failure class

| Class | Example | Fix direction (docs) |
|-------|---------|----------------------|
| Thin snippet | WP OpenSearch | Persist descs[]; quote floor ≥40 |
| Wrong kind | TED/work QID for person seed | Publication demotion (EXP-D stretch) |
| Missing typed key | WP-only rows | Enrich / don’t overclaim multi |
| Stale currency | Registry fetch marked “fresh” | Source-native dates when present |
| Fake corroboration | WD+WP | Family-based independence |
| Empty honest | S09 | Keep; add emptyReason for S12 |

## Acc / safety evidence

- Acc leak **0** on B0 and A2-safe packs.
- Adversarial hardening **28/28** · prior A2-safe homonym **12/12**.
- Evidence gaps must not be “fixed” by leaking identity dossiers.
