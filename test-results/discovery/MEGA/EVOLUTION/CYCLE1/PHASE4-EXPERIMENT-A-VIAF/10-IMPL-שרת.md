# EXP-A VIAF — IMPL (שרת)

**Stamp (IDT):** 2026-09-20T09:59:50+03:00  
**Action:** Preview `vercel deploy` (NOT `--prod`) · **NO alias / NO promote**

## New Preview

| Field | Value |
|-------|-------|
| Deployment id | `dpl_H9o45VTQZgAFXYzgHM6Lahhb4xCU` |
| URL | https://akvot-simple-demo-93bc30m30-k-akvot.vercel.app |
| Target | `null` (Preview) |
| Inspector | https://vercel.com/k-akvot/akvot-simple-demo/H9o45VTQZgAFXYzgHM6Lahhb4xCU |
| Flag | `DISCOVERY_ENABLE_VIAF=1` (Vercel env · **Preview only**) |

## Code

| Path | Change |
|------|--------|
| `api/lib/discovery/providers.js` | `viafProvider` (AutoSuggest) + `getDefaultProviders()` gated by flag |
| `api/lib/discovery/orchestrator.js` | `opts.providers \|\| getDefaultProviders()` |
| `api/lib/discovery/index.js` | export `viafProvider`, `getDefaultProviders` |
| `api/lib/discovery/store.js` | DOMAIN_AUTHORITY `viaf.org`/`www.viaf.org` = 0.85 |
| `api/lib/discovery/providers.viaf.test.mjs` | units (flag / happy / soft-fail / Acc scrub) |

## Alias HOLD (verified post-deploy)

| Alias | dpl | Status |
|-------|-----|--------|
| Discovery `akvot-discovery.vercel.app` | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **UNCHANGED** |
| Core `akvot-simple-demo.vercel.app` | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **UNCHANGED** (LOCKED) |

**promote HOLD** · B0 Discovery alias unchanged.

## Unit counts (local)

| Suite | Result |
|-------|--------|
| providers.viaf | **passed=27 failed=0** |
| adversarial Acc | **passed=65 failed=0** |
| discovery orchestrator | **passed=113 failed=0** |

## Preview smoke S01 / S04 / S05 (after create + GET)

| Seed | findings_n | viaf_findings | families_union | providersMap.viaf |
|------|----------:|-------------:|----------------|-------------------|
| S01 Tim Berners-Lee | 17 | 8 | viaf, wikimedia | partial |
| S04 Stripe | 30 | 8 | openlibrary, viaf, wikimedia | partial |
| S05 Red Cross | 30 | 8 | openlibrary, viaf, wikimedia | partial |

Raw: `raw/smoke-S01.json` · `raw/smoke-S04.json` · `raw/smoke-S05.json`

### multi_independent note

Per-finding `providers.length≥2` rate on this smoke ≈ **0** (adapters still emit single-provider findings; corroboration/merge across families is Acc/QA metric ownership). **Session-level** `families_union` now includes **viaf** on **3/3** target seeds (B0: false). Acc/QA own formal `multi_independent_rate` ≥0.15 measurement against this Preview.

## Soft-fail

VIAF errors/timeouts return partial batch; observed `viaf: partial` alongside live findings (AutoSuggest success with cap=8 → partial flag). Pipeline never throws.

## Status

Preview **READY** · VIAF **LIVE** behind flag · **STOP BEFORE PROMOTE**
