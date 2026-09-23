# 06-ACC · ACC-REAFTER-Ho6jg · דיוק · 2026-09-20

**Stamp:** 2026-09-20T11:58:04+03:00 (2026-09-20 11:58 IDT)  
**Owner:** דיוק (Accuracy) · CYCLE1 EXP-WEB-ORIGIN (C1)  
**Treatment class:** **C1-PATCHED** · scrap **C1-PREPATCH** `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja`  
**Promote:** **HOLD · NO promote** · **NO C2** · **STOP for Chief Review**

---

## Verdict: **PASS** · Identity Bound **CLOSED**

| Item | Value |
|------|-------|
| Official Treatment (C1-PATCHED) | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
| URL | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` |
| Acc | **PASS** |
| Bound | **CLOSED** — URL/hostname-alone → **UNKNOWN** |
| who.int label | **UNKNOWN** (finding + evidence + facet) |
| BAD_URL_ALONE_SAME | **0** |
| Acc leak | **0** (nested/SSE/narrow/HIT; poison seed-echo excluded) |
| Core pw / leak | **0 / 0** |
| B0 | LOCKED `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` UNCHANGED |
| Promote | **HOLD** |
| C2 | **NO** |

---

## Semantic (Chief LOCK)

- **SAME-REFERENCE** = same canonical typed id (QID/VIAF/OL) **ONLY**
- **NOT** same URL / host / domain / page / origin / metadata / seed
- URL-alone / domain-alone / hostname-alone / normalize-alone → **UNKNOWN** only

---

## Identity label audit (live · `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w`)

### S16 `https://www.who.int` → UNKNOWN ×3

| Surface | Value |
|---------|-------|
| finding.relationship | **UNKNOWN** |
| evidence.relationship | **UNKNOWN** |
| facetHints | `['provider:web_origin', 'kind:page', 'hostFamily:web_origin', 'relationship:UNKNOWN']` |
| SAME-ENTITY / SAME-REFERENCE | **0 / 0** |
| Acc leak | **0** |
| Finding id | `wo-7fd08b15039288ff` |
| providers.web_origin | ok |

### Bare host / URL-alone

| Seed | wo_n | relationship | SE | SR | leak |
|------|-----:|--------------|---:|---:|-----:|
| S16 `https://www.who.int` | 1 | **UNKNOWN** | 0 | 0 | 0 |
| W5 `who.int` | 1 | **UNKNOWN** | 0 | 0 | 0 |
| W7 `https://www.microsoft.com` | 1 | **UNKNOWN** | 0 | 0 | 0 |
| W1 / S06 / ACC-U* / H04 / P* | 0 | — (soft/error; cite-or-drop) | 0 | 0 | 0 |

**Proof:** `raw/acc-reafter-Ho6jg-דיוק/BOUND-IDENTITY-AUDIT.json` · `06-ACC/BOUND-IDENTITY-AUDIT-Ho6jg-דיוק-2026-09-20.json`

---

## Gates (Acc)

| Gate | Result | Note |
|------|--------|------|
| AG1 leak=0 | **PASS** | identity surfaces clean; poison Q only in client seed echo |
| AG2 poison Q surface | **PASS** | ACC-P01/P04 · no Q1701775 in findings/evidence/facets/SSE/narrow |
| AG3 URL-alone identity | **PASS** | who.int UNKNOWN ×3 · BAD_URL_ALONE_SAME=0 |
| AG4 pretty-wrong / private | **PASS** | pw=0 · private_prov=0 |
| AG5 Core 8ag | **PASS** | Assaf Rappaport→Q47507930 · כהן soft · Smith¬Q1701775 |
| AG6 SSRF block | **PASS** | S01/S02/S04/S05/ADV-js wo=0 |
| AG10 B0 lock | **PASS** | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| Promote / C2 | **HOLD / NO** | STOP for Chief |

**Pack Acc PASS:** **PASS** · Bound **CLOSED**.

---

## Adversarial (corpus subset)

| Class | IDs | Result |
|-------|-----|--------|
| Poison | ACC-P01, ACC-P04 | leak=0 · no SAME-* |
| SSRF | ACC-S01, S02, S04, S05 | wo=0 · private_prov=0 |
| Redirect/scheme | ACC-R01, ADV-js | wo=0 · leak=0 |
| Entity-looking URL | ACC-U01, U02, H04 | no SAME-* |

---

## Control / locks

| Lock | State |
|------|-------|
| B0 CONTROL | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · akvot-discovery.vercel.app · **LOCKED UNCHANGED** |
| Core | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · Assaf→Q47507930 · כהן soft · Smith¬Q1701775 · pw=0 leak=0 |
| A2 | FROZEN |
| Alias retarget | **NO** |
| C1-PREPATCH scrap | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` · **do not Acc-PASS** |

---

## Paths

| Deliverable | Path |
|-------------|------|
| Acc re-AFTER md | `06-ACC/ACC-REAFTER-Ho6jg-דיוק-2026-09-20.md` |
| Acc re-AFTER json | `06-ACC/ACC-REAFTER-Ho6jg-דיוק-2026-09-20.json` |
| Identity audit | `06-ACC/BOUND-IDENTITY-AUDIT-Ho6jg-דיוק-2026-09-20.json` |
| Raw | `raw/acc-reafter-Ho6jg-דיוק/` |
| STATUS | `STATUS-דיוק.md` |

---

## STOP

**Acc PASS · Bound CLOSED · HOLD promote · NO C2 · STOP for Chief Review.**
