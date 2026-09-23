# 02 — GOALS AND NON-GOALS · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY · NO CODE

---

## Goals (this design pack)

| ID | Goal | Success signal (design-level) |
|----|------|-------------------------------|
| G1 | Define **QueryPlan** contract: classify seed → ordered plan steps → routed queries/families/caps | Spec 06 + 07 complete; failure modes listed |
| G2 | Define **source-family** registry shape: independence, budgets, Preview flags | Spec 08 + 09 catalog draft |
| G3 | Elevate **URL-origin** from ad-hoc C1 provider to early/first-class planned stage | Spec 10 reuses C1 fields/Bound; one-hop only |
| G4 | Lightweight **entity-type routing** → family subsets | Spec 11; stops expecting VIAF to fix Stripe-class orgs |
| G5 | Evidence-graph **relationship edges** (nodes/edges; no dossier) | Spec 12; vocabulary frozen |
| G6 | Session/obs **plan visibility** compatible with progressive SSE | Spec 13 |
| G7 | Observability/KPI design with **MULTI secondary** | Spec 14 |
| G8 | Failure/safety envelope (SSRF, Acc, overclaim, fanout) | Spec 15 |
| G9 | Migration/flags: Preview-first coexistence with frozen A2/C1 | Spec 16 |
| G10 | Acceptance gates for **future** impl GO + Chief decision ask | Spec 17 + 18 |

**Product principle:** systematically discover more true, useful, independently supported public information while remaining honest about UNKNOWN — **not** inflate finding counts.

---

## Non-goals (explicit · HOLD)

| ID | Non-goal | Why |
|----|----------|-----|
| NG1 | **No crawl** / sitemap frontier / recursive link follow | C1 Bound + security; MAX_ONE_HOP only |
| NG2 | **No promote** to B0 / alias retarget / Core changes | B0 + Core LOCKED |
| NG3 | **No identity from URL** / host / domain alone | C1 Bound: URL-alone → UNKNOWN |
| NG4 | **No title-bridge** / string-sim attach | A2-bound REJECTED |
| NG5 | **No inventing relationships** / dossier / Core identity rewrite | Acc + vocabulary |
| NG6 | **No EXP-B / C2+ impl** in this pack | Chief scope: DESIGN-ONLY |
| NG7 | **No new live providers** (filings/news/gov) | Catalog = design slots only |
| NG8 | **No unbounded query expansion** / spelling flood | Fanout caps in QueryPlan |
| NG9 | **No knownIdentities-driven expansion** | Entity-agnostic Discovery |
| NG10 | **No production code** in this pack | STOP for Chief |

---

## Scope boundary vs Integration Review minimum set

| Minimum evolution item (08) | This pack |
|-----------------------------|-----------|
| QueryPlan / intent routing | YES — design |
| Source-family orchestration | YES — design |
| URL-origin first-class path | YES — design |
| Entity-type routing (lightweight) | YES — design |
| Evidence graph / relationship edges | YES — design |
| Adaptive discovery (secondary from typed IDs) | DESIGN defer note only — not minimum-now |

---

## STOP

Goals/non-goals frozen for this pack. Any future impl that violates NG1–NG10 is out of charter without Chief revise.
