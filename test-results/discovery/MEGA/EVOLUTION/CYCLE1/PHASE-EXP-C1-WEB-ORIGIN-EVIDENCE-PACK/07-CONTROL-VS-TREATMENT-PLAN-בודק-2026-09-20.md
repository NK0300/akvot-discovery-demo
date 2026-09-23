# 07 — CONTROL vs TREATMENT METRICS PLAN · בודק (QA)

**Owner:** בודק · CYCLE1 EXP-WEB-ORIGIN (C1)  
**Stamp:** 2026-09-20 11:36 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** Plan + stubs only · **live numbers = PENDING Preview**  
**Locks:** NO promote · A2 FROZEN · do **not** compare Treatment to modified A2

---

## Arms

| Arm | Definition | Status |
|-----|------------|--------|
| **CONTROL** | B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · `akvot-discovery.vercel.app` · flag **off** | LOCKED |
| **TREATMENT** | Same product surface + WEB-ORIGIN Preview (`DISCOVERY_ENABLE_WEB_ORIGIN=1`) | **TBD** `dpl_*` when שרת deploys — **do not invent** |
| **Out of comparison** | A2 EXPERIMENTAL (any variant) | **FROZEN** — not a Treatment baseline |

Corpus inputs: `05-SEED-MATRIX-בודק-2026-09-20` (n=16) · `06-DOMAIN-ADVERSARIAL-CORPUS-בודק-2026-09-20` (n=18).

---

## Metrics (PENDING Preview — fill when live)

| Metric | CONTROL (expect) | TREATMENT (expect) | Delta rule | Live |
|--------|------------------|--------------------|------------|------|
| Findings count (URL/domain seeds SM-01..06,16) | thin / 0 `web_origin` | ≥1 grounded `web_origin` where ALLOW+snippet | Δ findings · Treatment ≥ Control on URL seeds | **PENDING** |
| `web_origin` count (`hostFamily=web_origin`) | **0** | ≥1 on SM-03/SM-05/SM-16 class | count_T − count_C | **PENDING** |
| Acc leak | 0 | **0** | must stay 0 | **PENDING** |
| Pretty-Wrong (PW) | baseline | no regression beyond agreed band | report both | **PENDING** |
| Relationship label distribution | N/A or non-`web_origin` | UNKNOWN dominant on URL-alone; **0** SAME-ENTITY; **0** SAME-REFERENCE from URL | histogram | **PENDING** |
| Latency p50 / p95 (ms) | if available on CONTROL | if available on TREATMENT | report; soft | **PENDING** |
| URL-spam rate | — | Findings per URL seed ≤ cap (vanity); no unbounded path spam | rate + ADV-09 | **PENDING** |
| SSRF block rate (SM-09..12 + ADV block rows) | N/A or already blocked | **100%** BLOCK | hard gate | **PENDING** |

### Explicit non-KPIs

- **Do not chase multi** (`multi_independent` may rise; **not** primary).  
- **TRUTH > COVERAGE** — drop weak/unsafe; cite-or-drop snippet&lt;40.  
- Soft: weak_evidence_rate should not worsen corpus-wide &gt;+0.05 (informational).

---

## Gates A–O checklist stub → Chief / pack SoT

Pointing to Chief-style gate list (A2 hardening `07-GATE-CHECK.md` A–L) + C1 acceptance (`CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/13-ACCEPTANCE-CRITERIA.md` G1–G10) + Arch `03` checklist. **All WAITING live Preview** unless noted docs-only.

| Gate | Name | C1 mapping | Status |
|------|------|------------|--------|
| **A** | Experiment definition | Arch `01`/`02` READY; URL≠identity; QA Bound UNKNOWN ceiling | **DOCS PASS** |
| **B** | Baseline | CONTROL = B0 Avyhr locked | **DOCS PASS** · live **PENDING** |
| **C** | Implementation / Preview dpl | שרת Preview + flag matrix | **WAITING** Preview dpl |
| **D** | Tests / unit | Server owns; QA consumes runner | **WAITING** |
| **E** | Adversarial | Corpus `06` n=18 READY | **CORPUS READY** · live **PENDING** |
| **F** | Acc | leak=0 · scrub poison ADV-17 | **WAITING** Acc + live |
| **G** | QA smoke | Seed matrix `05` n=16 vs CONTROL/TREATMENT | **WAITING** Preview |
| **H** | Comparison metrics | This doc table | **WAITING** numbers |
| **I** | Representative success | Pack slot `09-RAW-REPRESENTATIVE` / success ≥5 URL seeds | **WAITING** |
| **J** | FP rejected | Slot `10-FP-CASES` — no SAME-* from URL | **WAITING** |
| **K** | UNKNOWN / FN | Slot `11-FN-CASES` — UNKNOWN default documented | **WAITING** |
| **L** | Limitations + decision | HOLD promote · no C2–C6 | **HOLD** (docs) |
| **M** | SSRF / security | Arch `04` + ADV block rows 100% | **WAITING** live SSRF PASS |
| **N** | Locks unchanged | B0 + Core + A2 frozen; no alias retarget | **HOLD** verify on stamp |
| **O** | Promote ask | **FORBIDDEN** until Chief GO after live green | **NO promote** |

Chief list refs: `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/07-GATE-CHECK.md` (A–L pattern) · Gap `13-ACCEPTANCE-CRITERIA.md` (G1–G10) · Arch `03-NO-IDENTITY-COLLAPSE-CHECKLIST`.

---

## Run protocol (when dpl lands)

1. Stamp TREATMENT `dpl_*` + URL into `STATUS-בודק.md` + `13` (Server owns publish).  
2. Run CONTROL then TREATMENT on `05` + `06` via `scripts/run-c1-eval.mjs` (or peer runner).  
3. Fill metrics table · Acc leak · relationship histogram · SSRF block rate.  
4. **Do not** retarget B0 alias · **do not** mutate A2 · **do not** promote.

## STOP

Metrics plan READY · numbers **WAITING Preview** · **TRUTH > COVERAGE** · **NO promote**.
