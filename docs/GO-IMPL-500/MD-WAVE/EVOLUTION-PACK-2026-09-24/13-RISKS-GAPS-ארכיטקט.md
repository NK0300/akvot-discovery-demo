# 13 · Risks / Gaps · ארכיטקט (+ Chief) · 2026-09-24

**Status:** DESIGNED · updated after MW2 closeout PARTIAL  
**Locks:** NO PROMOTE · Wave 1 DONE = NO

| Risk | Severity | Owner | Mitigation |
|------|----------|-------|------------|
| Dual orch paths (QueryPlan vs nightLoop) diverge | High | Arch + Server | Track B: unify under §06 · Night = policy preset |
| Provider maps still in `queryPlan.js` | High | Server (Arch FILL) | Track B step 1: migrate to registry SoT (§05) before +N families |
| Soft-wrong URL candidates (gulfnews class) | Med | Acc | Keep C1 UNKNOWN · Acc pw=0 · do not “fix” with identity |
| ABC/extlinks flake → n=0 | Med | Server + Acc | Retry/stability; do not claim Done on single green run |
| **OpenSearch flake 3/6 QA sessions** (`TBL`/`Smith`/`כהן` → `opensearch_error` → EMPTY_FRONTIER · no wave 2) | **High** | **Server** (primary) · Acc/QA watch | Stabilize `general_web` OpenSearch (timeouts/retry/backoff · journal reason) · Acc re-measure after fix · **do not invent candidates on error** · tracked from MW2 QA PARTIAL — not forgotten |
| Registering GW/DDG without FILL discipline | Med | Arch | PROPOSED until Arch FILL + allowlist row |
| Visual / news / filings temptation | High | Chief | F11 + §12 capability-only · HOLD LIVE |
| Core edit sneaks in for “just one family” | High | Arch + Chief | Key test gate on every PR |

**Gaps:** Frontier type not shared · general_web not in SOURCE_FAMILIES · capability-based intent match not coded.

**Tag:** DESIGNED (OpenSearch flake row = OPEN risk from MW2 measure)
