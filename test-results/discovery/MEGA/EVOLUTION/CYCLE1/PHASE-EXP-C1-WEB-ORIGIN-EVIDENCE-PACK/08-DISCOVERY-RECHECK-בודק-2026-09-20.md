# 08 · DISCOVERY RECHECK · בודק · 2026-09-20

**Stamp:** 2026-09-20 12:00:42 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** בודק (QA) · CYCLE1 · EXP-WEB-ORIGIN (C1)  
**Treatment class:** **C1-PATCHED**  
**Promote:** **HOLD · NO promote** · **NO C2** · **STOP for Chief Review**

---

## Verdict: **PASS** (QA discovery recheck)

| Gate | Result |
|------|--------|
| URL-alone → UNKNOWN | **PASS** (S16 + W5) |
| BAD_URL_ALONE_SAME | **0** · **PASS** |
| units ≥96 | **96/0** · **PASS** (cited `UNITS-SUMMARY.json` / `UNITS-webOrigin-patched.log`) |
| Meaningful discovery (not URL spam) | **PASS** — S16/W5 wo≥1; S01/S04/S05 wo=0 |
| Acc leak (scanned) | **0** |
| B0 / Core untouched | **PASS** · LOCKED |
| Acc prerequisite | **PASS** · Bound **CLOSED** (`06-ACC/ACC-REAFTER-Ho6jg-דיוק`) |

---

## Canonical arms (confirmed from `21-PREVIEW.json`)

| Arm | dpl | URL / host | Status |
|-----|-----|------------|--------|
| **TREATMENT C1-PATCHED** | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app | LIVE · flag `DISCOVERY_ENABLE_WEB_ORIGIN=1` Preview only |
| **CONTROL B0** | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | https://akvot-discovery.vercel.app | **LOCKED** |
| **Core** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | akvot-simple-demo.vercel.app | **LOCKED** · not mutated |
| PREPATCH scrap | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | — | **do not use for metrics** |

---

## Bound (QA)

URL / host / domain alone → relationship **UNKNOWN** (never SAME-REFERENCE / SAME-ENTITY).  
`BAD_URL_ALONE_SAME` must be **0**.

---

## Per-seed · CONTROL vs TREATMENT (live)

| Seed | Role | CTRL findings_n | CTRL wo_n | TREAT findings_n | TREAT wo_n | TREAT labels (wo) | BAD_URL_ALONE_SAME | Acc leak | Notes |
|------|------|----------------:|----------:|-----------------:|-----------:|-------------------|-------------------:|---------:|-------|
| **S16** `https://www.who.int` | URL | 0 | 0 | **1** | **1** | **UNKNOWN** (finding+evidence+facet) | **0** | 0 | Primary C1 win; title WHO |
| **W5** `who.int` | bare host | 7 | 0 | **16** | **1** | **UNKNOWN** | **0** | 0 | +1 web_origin alongside registries |
| **S01** Tim Berners-Lee | person | 10 | 0 | 18 | **0** | — (no wo) | 0 | 0 | Δ findings from other providers; **no URL spam** |
| **S04** Stripe | company | 22 | 0 | 30 | **0** | — | 0 | 0 | wo=0 · no invent from name |
| **S05** Red Cross | org | 22 | 0 | 30 | **0** | — | 0 | 0 | wo=0 · no invent from name |

### Deltas (TREAT − CTRL)

| Seed | Δ findings_n | Δ web_origin_n |
|------|-------------:|---------------:|
| S16 | +1 | **+1** |
| W5 | +9 | **+1** |
| S01 | +8 | **0** |
| S04 | +8 | **0** |
| S05 | +8 | **0** |

S01/S04/S05 finding inflation is **not** web_origin spam (wo_n stays 0 on both arms). Preview may surface more registry/VIAF hits than B0; out of scope for Bound.

---

## S16 / W5 relationship proof (TREATMENT)

| Surface | S16 | W5 |
|---------|-----|----|
| finding.relationship | **UNKNOWN** | **UNKNOWN** |
| evidence.relationship | **UNKNOWN** | **UNKNOWN** |
| facetHints | `relationship:UNKNOWN` | `relationship:UNKNOWN` |
| SAME-REFERENCE | 0 | 0 |
| SAME-ENTITY | 0 | 0 |
| Finding id | `wo-7fd08b15039288ff` | `wo-7fd08b15039288ff` |
| Title | World Health Organization (WHO) | World Health Organization (WHO) |

Sessions (TREAT): S16 `kv1.f7c00541518627f1bb4ec05abf47dc6c` · W5 `kv1.7387690dd06c19a7f02afb97c7f36210`

---

## Units

| Source | Result |
|--------|--------|
| `UNITS-SUMMARY.json` | **96** passed · **0** failed |
| `UNITS-webOrigin-patched.log` | `webOrigin tests: 96 passed, 0 failed` |
| Covers | URL-alone→UNKNOWN · never SAME-REFERENCE on URL · person seed no spam · Acc scrub · SSRF |

Live re-run not required (already ≥96 on patched tree).

---

## Acc prerequisite (דיוק)

Acc **PASS** · Bound **CLOSED** on C1-PATCHED — cited, not re-run:  
`06-ACC/ACC-REAFTER-Ho6jg-דיוק-2026-09-20.md` · BAD_URL_ALONE_SAME=0 · leak=0.

---

## Access / repro

```bash
cd /workspace/akvot-quick-demo
node test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK/scripts/discovery-recheck-בודק-2026-09-20.mjs
# uses: vercel curl --deployment <dpl> --scope k-akvot -- /api/discovery/sessions
# TREAT=dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w · CTRL=dpl_AvyhrW24gGRquWCPPZdydBiz81dv
```

Raw: `raw/recheck-בודק-2026-09-20/`

---

## STOP

**READY · Acc PASS prerequisite · units 96/0 · discovery recheck PASS · HOLD · NO promote · NO C2 · STOP for Chief Review.**
