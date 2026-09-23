# 10 — FAILURE MODEL · Chief Gate J

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT `10-FAILURE-MODEL.md` · AS-IS soft-fail providers · failureInject/faultInject · sessionStore FAILURE_CLASSES

---

## 1. Failure classes (closed for orchestration)

| Class | Handling |
|-------|----------|
| provider_unavailable | Soft-fail family; continue others |
| rate_limited | Back off family; optional single retry if budget |
| timeout | Soft-fail call; record latency |
| empty | Valid; intent unsatisfied OK |
| malformed | Soft-fail; no poison into graph |
| blocked_url | No fetch; not CONTRADICTORY |
| unsafe_url | Hard block; security gate |
| contradictory_evidence | contradicts edge; no attach |
| unsupported_entity_type | Skip family with reason |
| budget_exhausted | Stop fanout; partial OK |
| plan_invalid | FAIL_PLAN or fallback verbatim |
| cancelled | Terminal cancel |

---

## 2. Isolation

1. One family fail ≠ corrupt unrelated evidence (SoT 10).  
2. Failures annotate execution journal; do **not** rewrite QueryPlan history.  
3. Malformed payloads never bypass Acc scrub / fingerprint validation.  
4. Transport failures ≠ auto-CONTRADICTORY.  
5. UNKNOWN valid — empty ≠ license to invent SAME-*.

---

## 3. Classification · fallback · observable state

| Layer | Fallback |
|-------|----------|
| Plan invalid + flag fallback | B0 verbatim synthetic plan |
| Family fail | Skip; others continue |
| UrlOrigin fail | UNKNOWN/empty origin; continue |
| Store durability | Existing sessionStore classes — orthogonal |

Observable: `providerStatus` / family status on session; vanity findingsCount must not hide failures (SoT 10).

---

## 4. Determinism

Same failure injection + inputs → same skip/soft-fail annotations. Timeouts recorded as timeout class even if wall clock differs slightly — plan selection remains deterministic; execution timing may vary (document in reproducibility).
