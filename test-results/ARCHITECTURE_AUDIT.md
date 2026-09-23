# ARCHITECTURE_AUDIT — Akvot 5-Hour Sprint

| Field | Value |
|-------|-------|
| AGENT | ארכיטקט |
| DATE | 2026-09-09 |
| MODE | Discovery Hour 0-1 |
| SCOPE | NO CODE — read-only discovery only |

**Prod:** https://akvot-simple-demo.vercel.app · dpl_5N3G · FAST-foreign-path live

---

## A. Current Architecture

Flat Vercel serverless demo. Zero runtime dependencies. Single browser surface plus one API entrypoint.
Flat Vercel serverless demo. Zero runtime dependencies listed in package.json (type module only). Single browser surface + one API entrypoint.

| Path | Role | Size |
|------|------|------|
| api/lookup.js | God file: validate, CORS, rate-limit, classify, wikiPath/seed, Stage B hook, Gemini hook, Application commit, scrub, SSE/JSON | ~4270 LOC |
| api/lib/orchestrator.js | Commit policy helpers: wikiCommitted / focus / canCommit, decideStage, attachOrchestratorFields | ~313 LOC |
| api/lib/stageB.js | Optional Stage B enrichment | ~396 LOC |
| api/lib/orchestrator.test.mjs | Unit tests for orchestrator | 32 tests |
| index.html | UI: A-D uiState, SSE client, dossier render | ~1230 LOC |
| vercel.json | Routes, headers (CSP), function config | - |
| .env.local | GOOGLE_GENERATIVE_AI_API_KEY (local) | - |
| test-results/ | Artifacts; **gitignored** | - |

**Runtime shape:** process-local Map cache + rateLimitMap; no DB; no KV; cold-start resets both.

**KEEP (do not regress):** A-D uiState, wiki.seeded, Latin bare early need_context, Cohen gate, scrub / SSRF / CSP.

---

## B. Data Flow

```
Browser  GET|POST /api/lookup
    -> validate + CORS + rate-limit
    -> classify (name / lang / bare vs context)
    -> wikiPath / seed
    -> Stage B (optional)
    -> Gemini (optional; needs GOOGLE_GENERATIVE_AI_API_KEY)
    -> decideStage + attachOrchestratorFields
    -> scrub (SSRF / PII / unsafe fields)
    -> SSE stream  |  JSON fallback
```

Measurable stages: classify -> seed -> (B?) -> (Gemini?) -> decide -> scrub -> respond. UI drives A-D uiState from SSE events / final payload.

---

## C. Critical Components

1. **lookup.js Application layer** — owns HTTP, branching, and can **bypass** orchestrator commit gates.
2. **orchestrator.js policy** — wikiCommitted, focus, canCommit, decideStage, attachOrchestratorFields (intended SoT for commit).
3. **stageB.js** — optional enrichment; must not mutate commit truth alone.
4. **COMMON_HE_SURNAMES + isCommonHeBareName** — duplicated in lookup + orchestrator (drift risk).
5. **Cohen gate** — bare/common Hebrew surname -> need_context (KEEP).
6. **Latin bare early need_context** — KEEP; prevents premature dossier.
7. **Scrub + SSRF + CSP** — last-mile safety (KEEP).
8. **Process-local cache / rateLimitMap** — correctness and abuse limits are instance-scoped only.
9. **index.html A-D uiState** — client contract for loading / context / result / error.
10. **Prod FAST-foreign-path (dpl_5N3G)** — live path for foreign/Latin queries; must stay green.

---

## D. Source of Truth

| Concern | Intended SoT | Actual SoT today | Gap |
|---------|--------------|------------------|-----|
| Commit (wikiCommitted / focus / canCommit) | orchestrator.js | Split: orchestrator computes; **Application in lookup.js can bypass** | Policy not enforced at single gate |
| Hebrew bare-name list | One shared module | **Both** lookup.js and orchestrator.js | Drift -> inconsistent need_context |
| Stage decision | decideStage + attachOrchestratorFields | Same, but Application may ignore for dossier attach | Bypass -> pretty-wrong output |
| Cache / rate limit | Shared durable store | Process-local Map / rateLimitMap | Multi-instance inconsistency |
| Secrets | Vercel env | .env.local locally; prod via Vercel | OK if not committed |
| UI contract | A-D uiState + wiki.seeded | index.html | KEEP stable |

**Concrete failure mode:** Smith+ctx / G11 -> pretty-wrong dossier+faces when Application bypasses orchestrator commit.

---

## E. Duplicate Logic

| Logic | Locations | Risk |
|-------|-----------|------|
| COMMON_HE_SURNAMES | lookup.js **and** orchestrator.js | List edit in one file only -> gate mismatch |
| isCommonHeBareName | lookup.js **and** orchestrator.js | Same predicate, two copies |
| Commit policy | Orchestrator (wikiCommitted/focus/canCommit) vs Application path in lookup.js | Bypass -> false-positive dossier |
| Classify -> need_context | Early Latin bare + Cohen gate in lookup; parallel signals in orchestrator | Order/duplication bugs already patched once; still fragile |

**Rule for sprint:** one export for surnames/bare-name; Application **must not** attach dossier/faces unless orchestrator canCommit === true.

---

## F. Critical Risks

### F1. Application bypass of orchestrator commit
- **SEVERITY:** P0
- **IMPACT:** Pretty-wrong dossier+faces (Smith+ctx / G11); user trust loss; false identity attachment
- **ROOT CAUSE:** Commit fields live in orchestrator.js, but Application in lookup.js can proceed without canCommit
- **RECOMMENDED FIX:** Single hard gate before dossier/faces attach: if (!canCommit) -> need_context|refuse; delete bypass branches

### F2. Duplicated COMMON_HE_SURNAMES / isCommonHeBareName
- **SEVERITY:** P0
- **IMPACT:** Cohen/bare gates diverge between layers; flaky need_context vs false commit
- **ROOT CAUSE:** Copy-paste into both lookup.js and orchestrator.js
- **RECOMMENDED FIX:** One shared module (or orchestrator export only); lookup imports; add 1 regression test per list change

### F3. God file lookup.js (~4270 LOC)
- **SEVERITY:** P1
- **IMPACT:** High change risk; reviews miss bypasses; sprint velocity collapses on merge conflicts
- **ROOT CAUSE:** HTTP + classify + wiki + Stage B + Gemini + commit + scrub in one file
- **RECOMMENDED FIX:** Extract classify, wikiPath, commit-gate, scrub behind thin handlers; keep behavior identical (no feature change in Discovery)

### F4. Process-local cache + rateLimitMap (no DB/KV)
- **SEVERITY:** P1
- **IMPACT:** Cache miss storms across instances; rate limit ineffective under multi-instance; cost/429 noise
- **ROOT CAUSE:** In-memory Map per isolate; no shared store
- **RECOMMENDED FIX:** Vercel KV / Upstash for rate limit + short TTL cache keys; keep scrub before write

### F5. Gemini optional path coupled to Application
- **SEVERITY:** P1
- **IMPACT:** Hallucinated enrichment can look committed if scrub/commit order wrong
- **ROOT CAUSE:** Optional Gemini after seed without mandatory re-check of canCommit
- **RECOMMENDED FIX:** Gemini output advisory only until orchestrator re-decides stage; never set wikiCommitted from model text

### F6. Split commit policy (wikiCommitted/focus/canCommit vs Application)
- **SEVERITY:** P0 (paired with F1)
- **IMPACT:** Tests in orchestrator.test.mjs (32) pass while prod path still wrong
- **ROOT CAUSE:** Unit tests cover orchestrator; integration path in lookup not forced through same gate
- **RECOMMENDED FIX:** Integration smoke: Smith+ctx, G11, Cohen bare — assert no faces/dossier when canCommit false

---

## G. Technical Debt

| ID | Debt | Measurable signal |
|----|------|-------------------|
| TD1 | lookup.js god file ~4270 LOC | >1 concern per file; hard to review |
| TD2 | Duplicate HE surname / bare-name helpers | Two definitions; no single import |
| TD3 | Commit policy split Application vs orchestrator | Bypass possible; orch tests insufficient alone |
| TD4 | No shared cache/KV | Process-local Maps only |
| TD5 | Zero runtime deps / no shared lint-test harness beyond orch tests | Only orchestrator.test.mjs (32); lookup untested as unit |
| TD6 | test-results/ gitignored | Good for secrets/noise; means audits must be regenerated each sprint |
| TD7 | SSE + JSON dual respond paths | Two serializers; scrub must run on both |
| TD8 | Stage B + Gemini optional branches | Combinatorial path count up without matrix tests |

**KEEP list (not debt — protect):** A-D uiState, wiki.seeded, Latin bare early need_context, Cohen gate, scrub/SSRF/CSP.

---

## H. Top 10 Fixes

### H1. Enforce single commit gate (no Application bypass)
- **SEVERITY:** P0
- **IMPACT:** Stops Smith+ctx / G11 pretty-wrong dossier+faces
- **ROOT CAUSE:** Application can ignore canCommit
- **RECOMMENDED FIX:** Hard canCommit check immediately before dossier/faces; fail closed to need_context

### H2. Dedupe COMMON_HE_SURNAMES + isCommonHeBareName
- **SEVERITY:** P0
- **IMPACT:** One gate definition; Cohen/bare consistent
- **ROOT CAUSE:** Dual copies in lookup + orchestrator
- **RECOMMENDED FIX:** Shared export; delete duplicate; snapshot test list length + Cohen cases

### H3. Integration smokes for commit bypass
- **SEVERITY:** P0
- **IMPACT:** Catches F1/F6 where unit tests miss
- **ROOT CAUSE:** Orch tests not equal to full /api/lookup path
- **RECOMMENDED FIX:** Add prod/local cases: Smith+ctx, G11, Cohen bare, Latin bare — assert stage + no faces

### H4. Re-validate stage after Gemini / Stage B
- **SEVERITY:** P1
- **IMPACT:** Model/enrichment cannot force commit
- **ROOT CAUSE:** Optional paths skip re-decideStage
- **RECOMMENDED FIX:** Always decideStage -> attachOrchestratorFields after optional stages; then scrub

### H5. Extract commit + classify from god file
- **SEVERITY:** P1
- **IMPACT:** Smaller review surface; fewer accidental bypasses
- **ROOT CAUSE:** ~4270 LOC monolith
- **RECOMMENDED FIX:** Move pure functions to api/lib/; lookup stays thin I/O (behavior-preserving)

### H6. Shared rate limit (KV)
- **SEVERITY:** P1
- **IMPACT:** Effective abuse control across instances
- **ROOT CAUSE:** rateLimitMap process-local
- **RECOMMENDED FIX:** Upstash/Vercel KV counter with TTL; keep local fallback only for soft-fail

### H7. Shared short-TTL response cache (KV)
- **SEVERITY:** P2
- **IMPACT:** Lower Gemini/wiki cost; stable latency on repeat queries
- **ROOT CAUSE:** Process-local Map lost on cold start
- **RECOMMENDED FIX:** Cache scrubbed payload by normalized query hash; exclude need_context personalization if any

### H8. Expand test matrix beyond 32 orch tests
- **SEVERITY:** P1
- **IMPACT:** Measurable coverage on bypass + FAST-foreign-path
- **ROOT CAUSE:** Only orchestrator.test.mjs as formal suite
- **RECOMMENDED FIX:** Gate suite for FAST-foreign-path + Cohen + Latin bare + commit-false cases in CI

### H9. Dual-path scrub audit (SSE and JSON)
- **SEVERITY:** P1
- **IMPACT:** No field leaks on either respond mode
- **ROOT CAUSE:** Two serializers after decide
- **RECOMMENDED FIX:** One scrub(payload) call site used by both SSE event builder and JSON return

### H10. Document KEEP invariants in code comments / checklist
- **SEVERITY:** P2
- **IMPACT:** Prevents sprint regressions on A-D uiState, wiki.seeded, Latin bare, Cohen, scrub/SSRF/CSP
- **ROOT CAUSE:** Tribal knowledge across agents
- **RECOMMENDED FIX:** Checklist in PR template + smoke asserting each KEEP invariant still holds on dpl_*

---

## Discovery Exit Criteria (Hour 0-1)

- [x] Sections A-H complete
- [x] F/H items each have SEVERITY · IMPACT · ROOT CAUSE · RECOMMENDED FIX
- [x] KEEP invariants listed
- [x] No application code changed
- [ ] Next: Hour 1-2 implement H1-H3 only (gate + dedupe + smokes)

---

*End of Discovery audit — AGENT ארכיטקט — 2026-09-09 — NO CODE*

