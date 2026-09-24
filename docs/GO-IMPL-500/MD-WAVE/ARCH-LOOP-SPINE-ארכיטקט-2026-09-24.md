# ARCH · LOOP-SPINE · Night Mission Must-Win #2 · 2026-09-24

**Who:** ארכיטקט  
**Status:** **LOCKED** for Server wire · Must-Win #2 spine · Must-Win #1 adapter contracts nest under this  
**Locks:** **NO PROMOTE** · Core/B0 intact · flags default OFF · C1 · cite-or-drop · SSRF · F11 (no new HTTP family LIVE without Arch+Chief GO)  
**Audience:** שרת (wire) · Projects Manager · Chief · Acc/QA measure against this shape

---

## 0. One spine (non-negotiable)

Product loop is **one** charter sequence:

```
discover → evaluate → expand → corroborate → stop
```

Adapters (WP OpenSearch, DDG IA, web_origin, WD/WP/OL, future allowlisted sources) are **hops inside `expand`**, not parallel product branches and not separate Done paths.

| Wrong | Right |
|-------|--------|
| Per-adapter DONE / per-flag product path | One loop; adapter = expand hop |
| SERP/crawl as “discovery product” | Structured allowlisted hops only |
| Coverage invent to look green | Fail-closed + stop rules |

---

## 1. Phase contracts

### 1.1 `discover`
- **In:** session seed (person / org / url / domain) + active flags.
- **Out:** seed routing + launch set (which expand hops are eligible).
- **Rules:** SEARCH INTENT ≠ IDENTITY. Empty seed → no fanout. Flag OFF hop = not launched (B0 for that hop).

### 1.2 `evaluate`
- **In:** raw hop results + prior candidates.
- **Gates (all required before promote-to-candidate graph):**
  1. **SSRF / host allowlist** — drop otherwise  
  2. **http→https upgrade-then-re-gate** (where Adapter-1/2 FILL-SPEC says so)  
  3. **C1:** URL/title alone → `relationship=UNKNOWN` · `identityClaim=false` · never SAME-ENTITY from URL/title  
  4. **cite-or-drop:** missing provenanceUrl → drop  
  5. **Epistemic:** INFORMATION≠IDENTITY · CANDIDATE≠FACT · CORRELATION≠PROOF
- **Out:** gated candidates only (or honest empty + reason codes).

### 1.3 `expand`
- **In:** evaluate-ok frontier + remaining budget.
- **Shape:** fan-in of **allowlisted** hops under one wall-clock / session budget ledger.
- **Hop kinds (examples, not Done forks):**
  - Core B0: WD / WP / OL (existing)
  - Flagged: `web_origin` · `GENERAL_WEB` (Adapter-1) · `DDG_INSTANT` (Adapter-2) · future Arch-GO only
- **Rules:**
  - New HTTP **family** LIVE requires Arch FILL-SPEC + Chief GO (F11).
  - Transient errors → bounded retry/backoff **inside hop budget**; never invent URLs.
  - Hop failure → journal reason (`ia_error`, `opensearch_error`, …) · continue other hops if budget remains.
  - Cap emits **per provider** as FILL-SPEC; session may show multiple families; UX paints UNKNOWN url_candidate.

### 1.4 `corroborate`
- **In:** gated candidates across hops.
- **Out:** soft cross-hop notes only — **never** identity merge from URL/title/same-name alone.
- **Ceiling:** corroboration may raise **confidence of a candidate link**, not flip UNKNOWN→SAME-ENTITY without Arch-locked identity path (none LIVE under Night Mission without separate GO).

### 1.5 `stop`
Hard stop when **any** of:
1. Session / wall budget exhausted (`BUDGET_EXHAUSTED` → no more fanout)
2. All eligible hops launched + settled (ok or fail-closed)
3. AbortSignal / parent cancel
4. Empty frontier after evaluate (no invent)
5. Explicit stop taxonomy from budget engine (Checkpoint A)

Stop ≠ “no evidence forever”; stop = no more fetch. UI stays honest (UNKNOWN / empty / reason).

---

## 2. Budgets (architecture defaults — wire ledger)

| Band | Default (Night Mission) | Notes |
|------|-------------------------|--------|
| Wall / session | honor existing orchestrator AbortSignal + parent timeout | no infinite expand |
| Per hop HTTP | FILL-SPEC (e.g. Adapter-1 ≤1 OS + pages; Adapter-2 ≤1 IA) | isolated slice + dispose |
| Emit cap / provider | ≤5 url_candidates (GW / DDG) unless FILL-SPEC says otherwise | do not multiply by locale |
| Transient retry | ≤1 per hop (fill.1.1 pattern) | TLS/EOF → fail-closed after retry |
| Bodies | FILL-SPEC byte caps | drop oversize |

Numeric KPI bands stay **UNKNOWN** until GO-MEASURE; these are **hard stops**, not SLOs.

---

## 3. Must-Win #1 nesting (adapter contracts)

Each adapter FILL-SPEC must declare:

1. Which **spine phase** it serves (always `expand` hop + feed `evaluate`)  
2. Flag name · default OFF  
3. Host allowlist · budgets · emit shape · non-goals  
4. Failure taxonomy (honest empty codes)  
5. Measure Preview ≠ TREATMENT; **NO PROMOTE**

**Conflict with Server wire:** none if DDG TLS mitigation stays retry/backoff fail-closed **inside expand**.  
**Conflict only if** wire plan forks per-adapter product DONE or skips evaluate gates.

---

## 4. Done semantics (honesty)

| Claim | Required |
|-------|----------|
| Hop WIRED | code + flag OFF default + unit |
| Hop MEASURED | named Preview + Acc/QA honesty |
| Loop spine READY | this doc LOCKED + Server implements phases without per-adapter Done forks |
| Wave 1 product DONE | **still NOT** until reliable name→unknown-domain across intended seeds — separate from this spine lock |
| Promote | **never** from this doc |

`urlTargets` / flag-ON alone ≠ success. Need fetch + evidence/graph path under evaluate gates.

---

## 5. Server wire checklist (provisional-scaffold OK if late)

Minimal shape Server can scaffold against **now**:

1. Single orchestrator path names phases: `discover|evaluate|expand|corroborate|stop` (telemetry + journal).  
2. Existing adapters registered as expand hops; no new Done APIs per adapter.  
3. Budget ledger consulted before each hop; stop taxonomy unchanged from Checkpoint A.  
4. evaluate gates centralized (reuse `gateGeneralWebHitUrl` / cite-or-drop / C1 helpers) — adapters emit raw, evaluate normalizes.  
5. Flags default OFF; Night Preview may `-e` flags ON for measure only.

If Arch doc arrives after Server start: **adopt this file as SoT**; discard any per-adapter Done branch in scaffold.

---

## 6. Out of scope (explicit)

- HTML SERP / crawl / private login walls  
- F11 filings/news LIVE without GO  
- Identity unfreeze / SAME-ENTITY from URL  
- Promote / productionEligible  
- Changing Wave 1 TREATMENT `dpl_J92G9…`

---

## 7. Pointers

- Checkpoint A budget / hard-stop: `docs/GO-IMPL-500/CHECKPOINT-A-FOUNDATION.md`  
- Checkpoint B engine: `docs/GO-IMPL-500/CHECKPOINT-B-ENGINE.md`  
- Adapter-1 FILL: `MD-WAVE/ARCH-SECOND-FLAG-GENERAL-WEB-FILL-ארכיטקט-2026-09-24.md`  
- Adapter-2 FILL: `MD-WAVE/ARCH-ADAPTER-2-DDG-IA-FILL-ארכיטקט-2026-09-24.md`  
- Safety skill: product-safety-gates (INFORMATION≠IDENTITY · no invent)

**Verdict:** LOOP-SPINE **LOCKED** · Server **GO wire to this spine** · provisional scaffold must converge here · **NO PROMOTE**
