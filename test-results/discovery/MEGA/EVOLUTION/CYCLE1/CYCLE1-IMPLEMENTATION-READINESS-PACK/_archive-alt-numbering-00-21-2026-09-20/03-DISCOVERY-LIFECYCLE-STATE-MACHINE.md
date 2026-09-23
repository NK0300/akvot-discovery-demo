# 03 — DISCOVERY LIFECYCLE STATE MACHINE · Chief Gate C

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** `09-PROGRESSIVE-LIFECYCLE.md` · `10-FAILURE-MODEL.md` · `04-DISCOVERY-BUDGET.md`  
**AS-IS:** session `status` / `stage` in orchestrator + SSE events — elevate to explicit machine behind Preview.

---

## 1. States

```text
CREATE → PLAN → DISCOVER → ENRICH → CORROBORATE → EXPAND → RECONCILE → FINALIZE
         ↘ FAIL_PLAN (terminal)
Any non-terminal → CANCELLED (terminal)
FINALIZE outcomes: complete | partial | failed
```

| State | Meaning | May emit SSE |
|-------|---------|--------------|
| CREATE | Session minted; seed accepted; softEntityResolve; seedClass tentative | meta |
| PLAN | QueryPlan built & validated | plan (new) / progress |
| DISCOVER | Primary family orchestration | provider, finding, progress |
| ENRICH | Typed-ref enrich within family (existing P214/remote_ids pattern) | finding |
| CORROBORATE | A2-safe typed coalesce across hostFamilies | finding (attach) |
| EXPAND | Budget-capped UrlOrigin one-hop / planned secondary | finding (UNKNOWN-safe) |
| RECONCILE | Contradictions, rank, facets, graph finalize | facets, status |
| FINALIZE | Terminal snapshot HIT-rehydratable | status, done |
| FAIL_PLAN | Plan validation failed and no fallback | error, done |
| CANCELLED | Client/orchestrator cancel | error/status, done |

---

## 2. Legal transitions

| From | To | Guard |
|------|----|-------|
| CREATE | PLAN | seed accepted |
| PLAN | DISCOVER | plan valid |
| PLAN | FAIL_PLAN | plan invalid AND fallback disabled |
| PLAN | DISCOVER | plan invalid AND fallback=B0_verbatim (kill-switch) — treat as synthetic minimal plan |
| DISCOVER | ENRICH | primary calls done or partial continue |
| DISCOVER | RECONCILE | skip ENRICH if no enrich work |
| ENRICH | CORROBORATE | typed refs available OR skip |
| CORROBORATE | EXPAND | budget+URL candidates OR skip |
| EXPAND | RECONCILE | always |
| RECONCILE | FINALIZE | always |
| *non-terminal* | CANCELLED | cancel signal |
| DISCOVER/ENRICH/… | FINALIZE | wall/budget hard stop (partial) |

**Illegal:** FINALIZE → DISCOVER without new session; SKIP urlSafety; CORROBORATE → invent soft-refs; EXPAND → recursive crawl; any → emit SAME-ENTITY.

---

## 3. Terminal states

| Terminal | status field | When |
|----------|--------------|------|
| FINALIZE complete | `complete` | All planned intents attempted; no hard fail |
| FINALIZE partial | `partial` | budget_exhausted / wall / family soft-fails with some success |
| FINALIZE failed | `failed` | No usable progress + hard failure class |
| FAIL_PLAN | `failed` | Invalid plan, no fallback |
| CANCELLED | `cancelled` | Explicit cancel |

---

## 4. Partial completion

- Partial is **first-class** (SoT 09).  
- SSE may stream after CREATE/PLAN/DISCOVER chunks.  
- Family soft-fail → continue others.  
- UNKNOWN labels allowed at any state.  
- Evidence already accepted remains; failures annotate execution journal — do not delete unrelated evidence (Gate J).

---

## 5. UNKNOWN preservation

Lifecycle must never coerce UNKNOWN → FALSE or UNKNOWN → SAME-*.  
Empty discovery is valid terminal content (SoT 10 · Gate G).

---

## 6. Re-PLAN rules (tight)

Re-PLAN only when ALL hold (SoT 09):

1. Budget remains  
2. New typed refs or URL candidates appear  
3. `maxPlanRevisions` not exceeded  
4. Reason recorded  

Default `maxPlanRevisions` ≤ 2 (SoT 04). No autonomous open-ended expansion.

---

## 7. Compatibility

| Surface | Interaction |
|---------|-------------|
| SSE | Map states → event types (`09-PROGRESSIVE-SSE-MODEL.md`) |
| GET session / HIT | Rehydrate includes queryPlan + graph/findings |
| NARROW | Facet recompute; does **not** re-PLAN unless explicit |
| Flag OFF | Legacy CREATE→(implicit discover)→DONE path preserved |
