# B — SOURCE-FAMILY READINESS · CYCLE1 IMPLEMENTATION READINESS PACK

**Stamp:** 2026-09-20T13:38:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**Mode:** PLANNING ONLY · **NO code · NO deploy · NO promote · NO D1/D2 · NO providers · NO crawl · NO C2+**  
**SoT citation:** `CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/03-SOURCE-FAMILY-CONTRACT.md` (IMMUTABLE this pass)  
**Blocked until Chief GO:** YES — this document is readiness planning, not an implementation authorization.

---

## SoT summary

SourceFamily = logical discovery surface; Provider = adapter. Adding a provider without family registration is disallowed in target architecture. Endpoint count ≠ independence (SoT 05).

Initial conceptual families: knowledge_graph, encyclopedia, bibliographic, authority, web_origin, filings, registries, news, scholarly, government, archives — candidates beyond B0/A2/C1 **not wired**.

## Current code gap

| AS-IS | TO-BE |
|---|---|
| Flat `DEFAULT_PROVIDERS` = WD · OL · WP | Family registry with descriptors |
| VIAF / WEB-ORIGIN appended via env flags | Same flags, but behind familyId + previewFlag |
| No authorityClass / independenceClass / safetyClass on adapters | Full family descriptor (SoT 03) |
| No capability × intent matrix in runtime | Orchestrator selects families per intent |

Factual map today: wikidata→knowledge_graph/wikimedia; wikipedia→encyclopedia/wikimedia; openlibrary→bibliographic; viaf→authority; web_origin→web_origin.

## Proposed work packages

1. **WP-SF-REGISTRY** — SourceFamily registry module (descriptors only; no new HTTP)  
2. **WP-SF-MAP-B0** — Map existing adapters to familyIds without changing B0 default path  
3. **WP-SF-ORCHESTRATOR** — Budget-gated family calls + soft-fail isolation  
4. **WP-SF-PREVIEW-FLAGS** — Preserve `DISCOVERY_ENABLE_VIAF` / `DISCOVERY_ENABLE_WEB_ORIGIN` patterns  
5. **WP-SF-NO-NEW-PROVIDERS** — Explicit register: filings/news/… remain descriptors-only until separate GO  

## Owner suggestion

Registry/orchestration: Arch → Server · Acc for safetyClass emit · QA for family isolation tests.

## Risks

Temptation to wire many families at once (SoT 18 High) · WD+WP marketed as independent · productionEligible flipped without Chief.

## Exit criteria

- [ ] Every invoked provider resolves to a registered familyId  
- [ ] B0 path unchanged when Preview flag off  
- [ ] hostFamily + familyId both recorded in telemetry  
- [ ] No new external adapters introduced in first Preview slice  


---

## Blocked until Chief GO

No code, Preview flag wiring, measurement runs, or promote discussion from this contract alone. HOLD is default.

→ `00-EXECUTIVE-READINESS.md` · `STATUS-ארכיטקט.md` · `Q-ACCEPTANCE-GATES-FUTURE-IMPL.md`
