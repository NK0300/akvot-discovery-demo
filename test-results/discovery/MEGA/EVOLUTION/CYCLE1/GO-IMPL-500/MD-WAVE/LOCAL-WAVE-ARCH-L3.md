# LOCAL-WAVE-ARCH-L3 · ארכיטקט · MD-WAVE

**Stamp:** 2026-09-24T07:51:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** Arch (ארכיטקט) · L3 sole deliverable  
**Mode:** DOCS ONLY · zero runtime edits · NO promote · F11 HOLD  
**Chief cite:** `MD-WAVE/00-GAP-MAP.md` L3 · F11 candidate #1 design

---

## 1) New E2E capability (user-visible)

**None this wave.** Spec/contracts only. No HTTP · no adapter · no flag flip · no orch launch of F11 families. User-visible Discovery path unchanged (B0 WD/OL/WP; Preview flags still default OFF).

## 2) Wired vs merely present

| Family | Present (descriptor) | Wired E2E | This wave |
|--------|----------------------|-----------|-----------|
| registries / filings / news | YES (`candidateFamilies.js`) | **NO** — CONCEPTUAL | Extended **capability registry SPEC** only |
| scholarly / government / archives | YES | **NO** | Appendix in SPEC |
| knowledge_graph / encyclopedia / bibliographic | LIVE B0 | YES | untouched |
| authority / web_origin | Flag Preview | PARTIAL | untouched |

Honest: descriptors were already present; L3 adds **orch/health/budget/cite-or-drop contract** so a future Chief GO can wire without identity leap or SERP invent.

## 3) Tests + security/budget account

| Item | Status |
|------|--------|
| New unit/e2e tests | **None** (docs-only) |
| Security / SSRF | Untouched · Preview SSRF OPEN remains Server residual |
| Budget | Spec: F11 must not `reserve` while unwired; journal `unsupported` · `requestsUsed:0` (already runtime behavior) |
| Acc | No new emit surface |

## 4) Flag state

| Flag | Default | L3 note |
|------|---------|---------|
| `DISCOVERY_ENABLE_FILINGS` / `_NEWS` / `_REGISTRIES` / `_SCHOLARLY` / `_GOVERNMENT` / `_ARCHIVES` | **N/A in flags.js today** (names reserved in descriptors) | Spec keeps names; **ON alone must not launch** if `wired:false` |
| QueryPlan / VIAF / web_origin / P0 deepen | default **OFF** | untouched |

## 5) Remaining gaps + what needs Chief GO

| Gap | Needs |
|-----|-------|
| First real registries or filings HTTP adapter | **Chief GO** (name host + scope) then Server implement behind flag OFF |
| news without SERP | Chief GO on allowed public headline API — or REJECT |
| name/org → URL/domain | **MISSING** (Chief 00-GAP-MAP §E) — **out of L3**; separate Arch/Server track · no SERP invent |
| Schedule DISCOVER_FILINGS/NEWS/REGISTRIES in intentsForSeedClass | Only after `wired:true` + Chief GO |
| Promote / productionEligible | **FORBIDDEN** |

### Scenarios A–E (status vs F11 registry)

| ID | Scenario | F11 registry status |
|----|----------|---------------------|
| **A** | Person seed (Assaf-class) | F11 not scheduled · B0 path only · SPEC n/a |
| **B** | Org/company seed | filings/registries still CONCEPTUAL · orch would `unsupported` if forced · SPEC ready for future GO |
| **C** | URL/domain seed | web_origin Preview (not F11) · C1 UNKNOWN frozen · F11 N/A |
| **D** | Document seed | bibliographic LIVE · scholarly appendix CONCEPTUAL |
| **E** | Explicit DISCOVER_NEWS/FILINGS/REGISTRIES intent | Intent vocab exists · `isUnwiredIntent` / candidate skip → **unsupported** · SPEC documents plug-without-launch |

---

## Deliverables

| File | Role |
|------|------|
| `ARCH-L3-F11-CAPABILITY-REGISTRY-SPEC-ארכיטקט.md` | Full capability / health / budget / orch plug SPEC |
| `LOCAL-WAVE-ARCH-L3.md` | This short room report |
| Competing gap-map under MAXIMUM-DISCOVERY | **Not written** (Chief owns `00-GAP-MAP.md`) |

**Hebrew one-liner:** רשם יכולות F11 ל-registries/filings/news — חוזה בלבד, בלי HTTP ועד GO נפרד.

**Runtime edits: 0 · Promote: NO · F11 HOLD**
