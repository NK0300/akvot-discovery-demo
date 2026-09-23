# 08 — COMPARISON METRICS (live recheck)

**Stamp:** 2026-09-20 12:00:42 IDT  
**Owner refresh:** בודק discovery recheck · C1-PATCHED  
**Promote:** HOLD · NO C2

## Lane summary

| Lane | dpl | web_origin | Notes |
|------|-----|------------|-------|
| B0 CONTROL | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | OFF | S16 findings=0 · W5 wo=0 |
| C1 TREATMENT **PATCHED** | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` | ON | S16/W5 UNKNOWN · BAD=0 |
| C1-PREPATCH scrap | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | — | **do not use for metrics** |
| Core | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | — | LOCKED · untouched |

## Live CONTROL vs TREATMENT (2026-09-20 12:00 IDT)

| Seed | CTRL f / wo | TREAT f / wo | TREAT relationship (wo) | BAD_URL_ALONE_SAME |
|------|------------:|-------------:|-------------------------|-------------------:|
| S16 https://www.who.int | 0 / 0 | **1 / 1** | **UNKNOWN** | **0** |
| W5 who.int | 7 / 0 | 16 / **1** | **UNKNOWN** | **0** |
| S01 Tim Berners-Lee | 10 / 0 | 18 / **0** | — | 0 |
| S04 Stripe | 22 / 0 | 30 / **0** | — | 0 |
| S05 Red Cross | 22 / 0 | 30 / **0** | — | 0 |

## Discovery impact
- **S16**: 0 → 1 web_origin Evidence (WHO title) — primary C1 win · label **UNKNOWN**
- **W5**: +1 web_origin alongside registry hits · label **UNKNOWN**
- **S01/S04/S05**: wo_n stays **0** — person/company/org not inflated by URL spam
- **BAD_URL_ALONE_SAME** = **0**
- Units **96/0**

## Machine
See `08-DISCOVERY-RECHECK-בודק-2026-09-20.json` (canonical live) and this stamp’s update note in `08-COMPARISON-METRICS.json` (`live_recheck` block). Historical PREPATCH rows retained under `treat_prepatch_scrap` if present — **not** for gates.
