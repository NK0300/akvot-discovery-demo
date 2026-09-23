# ARCH-BLINDSPOTS — Discovery Evolution CYCLE1 PHASE2 · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T09:47:45+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DOCS ONLY · Observation blind spots for upcoming Source / Strategy phases  
**Policy:** NO code · NO promote · Core `dpl_8ag…` LOCKED · Discovery B0 alias `dpl_Avyhr…`  
**Inputs:** PHASE1 `ARCH-SNAPSHOT-ארכיטקט-2026-09-20.md` · soft O1 Evidence · Pack / MEGA arch maps  

> Each blind spot: **ID · risk · why it blocks Maximum Discovery · recommended next phase owner.**  
> Do not invent closure or metrics; cite existing soft/open Evidence only.

---

## Blind-spot register

### BS-O1 — Narrow ≠ GET / SSE projection (soft O1)

| Field | Content |
|-------|---------|
| **ID** | **BS-O1** (maps UX/Server **O1**) |
| **Risk** | Medium (UX correctness / durable view honesty). Same-session narrow UI paints correctly; reload/HIT/SSE ignore `lastNarrow`. |
| **Why it blocks Maximum Discovery** | Maximum Discovery requires a single durable Findings view after facet narrow. Today `narrowDiscoverySession` persists `raw.lastNarrow` + `narrowActive` but does **not** replace `raw.findings`; GET/HIT emit full findings; SSE progressive findings remain full. Users cannot trust reload or stream as the narrowed Evidence set — breaks facet-driven exploration and Strategy-phase ranking-after-narrow. |
| **Evidence (cite)** | `PR-CLOSEOUT/05-UX-SSE-DEEP-ממשק-2026-09-20.md` checklist #6 YELLOW · O1 · `20-ARCH-GLANCE-ALL` §UX O1 · `PROMOTE/05-UX-POST-PROMOTE-ALIAS-ממשק-2026-09-20.md` (narrow 3→1; GET after narrow still 3) · `05-UX-SSE-FINAL-Avyhr-ממשק-2026-09-20.md` |
| **Recommended next phase owner** | **שרת** (orchestrator projection) · co-verify **ממשק** · Arch glance after fix · **not** Acc-primary |

---

### BS-PROV — Provider coverage gaps (`web_public` Phase A interface-only; viaf absent at runtime)

| Field | Content |
|-------|---------|
| **ID** | **BS-PROV** |
| **Risk** | High for Source-phase completeness / Medium for current B0 demo bar. |
| **Why it blocks Maximum Discovery** | Pack v1.0 SearchProviders include **wikidata / viaf / openlibrary** and **`web_public` as interface-only in Phase A** (concrete crawler deferred). Runtime `DEFAULT_PROVIDERS` = wikidata · openlibrary · wikipediaOpenSearch — **viaf omitted**; **`web_public` still interface-only**. Source expansion cannot reach public-web Evidence diversity or VIAF registry coverage without closing this gap — caps cross-source correlation and cite-or-drop breadth. |
| **Evidence (cite)** | `PHASE-A-ARCHITECTURE-FREEZE-PACK` provider table (`web_public` interface-only) · `MEGA-B-ARCHITECTURE-MAP` §2/§7 · `MEGA-B-FORENSICS-11-30` viaf note · `api/lib/discovery/providers.js` `DEFAULT_PROVIDERS` |
| **Recommended next phase owner** | **Source phase · שרת** (provider adapters) · Acc/Security co-bound for `web_public` · Arch updates Pack provider map |

---

### BS-DRIFT — Preview ≠ Prod drift patterns (B21 / pack ID drift)

| Field | Content |
|-------|---------|
| **ID** | **BS-DRIFT** |
| **Risk** | Medium (Evidence integrity / promote discipline). Not an Acc FAIL. |
| **Why it blocks Maximum Discovery** | Historical packs cite multiple Preview IDs (`9PkJ`, `CAVh`, `4trZ`, `Avyhr`) while Core stays on `dpl_8ag…`. Architecture map documented Preview≠Prod (store / UX / promote HOLD). Evolution Source/Strategy work that mixes Preview residual Evidence with alias B0 without explicit dpl tagging will mis-attribute ranking/provider behavior and falsely “close” gates. Maximum Discovery needs one SoT alias (`dpl_Avyhr…`) + explicit Preview lab lanes — drift patterns must stay documented and gated. |
| **Evidence (cite)** | `MEGA-B-ARCHITECTURE-MAP` §6 Preview≠Prod · `20-ARCH-GLANCE-ALL` G12 DOCUMENTED · OI-2/OI-3 pack ID drift · `ARCH-GLANCE-PROMOTE` soft opens (stale POST-SMOKE residue) |
| **Recommended next phase owner** | **ארכיטקט** (Evidence SoT / lane labeling) · **בודק** re-bind matrices to B0 alias · Chief gate on any new promote |

---

### BS-ACC-SOFT — Acc surfaces still soft (if any)

| Field | Content |
|-------|---------|
| **ID** | **BS-ACC-SOFT** |
| **Risk** | Low–Medium residual (not promote Acc FAIL on B0). Hard B22/B23 CLOSED; some matrix rows historically PARTIAL. |
| **Why it blocks Maximum Discovery** | Promote/Acc packs report **leakage=0** on required surfaces. Soft residuals that still matter for Maximum Discovery: (1) **O1** means narrow-filtered view is not the durable Acc-scrubbed GET projection — Strategy ranking-after-narrow lacks a scrubbed durable slice; (2) historical scrub matrix noted **PARTIAL** on independent `evidenceIds` token filter and facet **`valueId`/alias** depth — closed enough for B0 Acc bar, but Source-added providers / new facet shapes can reopen gaps if units do not extend; (3) adversarial / nested soft-failure paths must stay regression-locked when providers expand. |
| **Evidence (cite)** | `MEGA-SCRUB-SURFACE-MATRIX` (pre-fix PARTIAL rows + B23 supersession) · `MEGA-B23-SCRUB-GLANCE` CLOSED · `ACC-FULL-SURFACE.md` PASS · `PROMOTE-RESULT-CHIEF` Acc=0 · soft O1 packs above |
| **Recommended next phase owner** | **דיוק** (Acc regression on new Source surfaces) · **שרת** if emit bounds need extension · Arch keeps scrub matrix current |

---

### BS-OBS-RANK — Observability gaps for discovery ranking / diversity

| Field | Content |
|-------|---------|
| **ID** | **BS-OBS-RANK** |
| **Risk** | Medium for Strategy phase · Low for B0 promote bar. |
| **Why it blocks Maximum Discovery** | Pack S8 / ACC-DISC-06 require ranking by **evidence strength, source diversity, freshness, provider reliability, facet relevance** — not identity confidence. Runtime has `rankFindings` / `scoreFinding` in `store.js`, and `obs.js` meters create/SSE lifecycle — but MEGA Observability docs **do not** expose durable metrics for: per-provider contribution mix, diversity (≥N unique providers/hosts), ranking-factor histograms, narrow-after rank deltas, or Strategy A/B. Residual gaps also include no OTEL exporter and per-instance rate counters (`OBSERVABILITY.md` · `20-ARCH-GLANCE-ALL` OI-5/OI-6). Without ranking/diversity telemetry, Strategy cannot prove Maximum Discovery quality regressions. |
| **Evidence (cite)** | Pack freeze §S8 / diversity gate TBD · `MEGA/OBSERVABILITY.md` residual gaps · `api/lib/discovery/store.js` `rankFindings` (code exists; metrics not Strategy-ready) · `10-B17` / `11-B18` closed store telemetry ≠ ranking telemetry |
| **Recommended next phase owner** | **Strategy phase · שרת** (metric hooks) · **בודק** golden diversity checks · Arch defines metric contract · דיוק watches Acc-on-rank (no forbidden weak rows) |

---

## Roll-up

| ID | Theme | Blocks Maximum Discovery? | Soft vs hard | Next owner |
|----|-------|---------------------------|--------------|------------|
| BS-O1 | narrow≠GET/SSE | Yes (durable facet view) | **soft OPEN** (cited O1) | שרת + ממשק |
| BS-PROV | viaf / `web_public` | Yes (Source breadth) | Pack deferral / runtime gap | Source · שרת |
| BS-DRIFT | Preview≠Prod / pack IDs | Yes (Evidence SoT) | documented | ארכיטקט + בודק |
| BS-ACC-SOFT | Acc soft residuals | Conditional on Source expand | soft residual; B0 Acc PASS | דיוק + שרת |
| BS-OBS-RANK | ranking/diversity obs | Yes (Strategy proof) | gap vs Pack S8 | Strategy · שרת |

**P0 Evidence FAIL count for this glance:** **0** (no invent).  
**Promote:** **HOLD** — blind-spot work does not authorize promote or Core touch.

---

## Cite index

```
EVOLUTION/CYCLE1/PHASE1-BASELINE/ARCH-SNAPSHOT-ארכיטקט-2026-09-20.md
MEGA/PR-CLOSEOUT/05-UX-SSE-DEEP-ממשק-2026-09-20.md
MEGA/PR-CLOSEOUT/20-ARCH-GLANCE-ALL-ארכיטקט-2026-09-20.md
MEGA/PR-CLOSEOUT/PROMOTE/05-UX-POST-PROMOTE-ALIAS-ממשק-2026-09-20.md
MEGA/PR-CLOSEOUT/PROMOTE/PROMOTE-RESULT-CHIEF.md
MEGA/MEGA-SCRUB-SURFACE-MATRIX-ארכיטקט-2026-09-20.md
MEGA/MEGA-B-ARCHITECTURE-MAP-ארכיטקט-2026-09-20.md
MEGA/OBSERVABILITY.md
PHASE-A-ARCHITECTURE-FREEZE-PACK-ארכיטקט-2026-09-20.md
```

**Phase2 Arch blind spots: DONE.**
