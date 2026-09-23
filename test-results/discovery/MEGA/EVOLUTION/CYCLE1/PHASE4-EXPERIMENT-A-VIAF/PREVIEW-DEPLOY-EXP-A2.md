# EXP-A2 Option A — Preview deploy (שרת)

**Stamp:** 2026-09-20T10:13:55+03:00 (Asia/Jerusalem)  
**Promote:** **HOLD** · **No alias** · Core/B0 untouched

## Preview

| Field | Value |
|-------|-------|
| dpl | `dpl_5bxMZ6qBgqVfAc2iXCcbotGpGuRo` |
| URL | https://akvot-simple-demo-42q85em03-k-akvot.vercel.app |
| Target | `null` (Preview) |
| Flag | `DISCOVERY_ENABLE_VIAF=1` (Preview env) |

## What shipped

Acc-constrained soft-entity coalesce (`coalesceBySoftEntity` / `corroborateBySoftLabel`):

- Exact coalesce keys (title / viaf / qid / ol) — no softLabel subset vacuum
- Attach multi-provider Evidence onto peer Findings (`attach_keep` coverage)
- Cross-family only (store hostFamily union ≥2)
- Acc scrub via emitSnapshot after coalesce · never dossier · entity-agnostic

## Smoke (Acc family map: wikidata≠wikipedia≠openlibrary≠viaf)

| Seed | findings | multi_n | multi_rate | viaf_n |
|------|---------:|--------:|-----------:|-------:|
| S01 Tim Berners-Lee | 18 | 15 | **0.8333** | 15 |
| S04 Stripe | 30 | 10 | **0.3333** | 9 |
| S05 Red Cross | 30 | 12 | **0.4** | 15 |
| **Mean** | | | **0.5222** | |
| **Pooled** | | | **0.4744** | |

Gate ≥0.15: mean **PASS** · pooled **PASS**

S01 coverage preserved at **18** findings (no 10→1 vacuum). TED-style titles stay single-family.

## Aliases (HOLD verified post-deploy)

| Alias | dpl | Status |
|-------|-----|--------|
| `akvot-discovery.vercel.app` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **UNCHANGED** |
| `akvot-simple-demo.vercel.app` (Core) | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED / UNCHANGED** |

## Units (local pre-deploy)

corroboration.viaf 23/0 · providers.viaf 27/0 · adversarial.acc 65/0 · orchestrator 113/0 · prCloseout.acc 107/0

## RCA

`RCA-CROSS-FAMILY-MERGE-שרת-2026-09-20.md` + `.json`

## STOP

**No promote. No alias retarget. Core untouched.** Hand to Acc/QA for formal AFTER pack on this Preview.
