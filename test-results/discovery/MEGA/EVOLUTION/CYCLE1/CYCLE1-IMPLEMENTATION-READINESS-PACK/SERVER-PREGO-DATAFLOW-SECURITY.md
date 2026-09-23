# SERVER PRE-GO · DATAFLOW + SECURITY DEEP REVIEW
## שרת (Backend) · CYCLE1 IMPLEMENTATION READINESS · CYCLE1 Prego

**Stamp:** 2026-09-21T23:47:40+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Role:** שרת / Server · Project A · `akvot-quick-demo`  
**Mode:** **STOP / REVIEW ONLY** · DOCUMENT ONLY  
**NO CODE · NO DEPLOY · NO PROMOTE · NO MEASURE · NO providers · NO crawl · NO B0/Core/SoT changes · A2/C1 FROZEN**

**Readiness root:**  
`/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-IMPLEMENTATION-READINESS-PACK/`  
**SoT Design root (IMMUTABLE · cite-only):**  
`/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/`

> **Gap ≠ permission to change SoT.** Every AS-IS vs TO-BE delta below is a **documentation observation** for Chief. It does **not** authorize edits to SoT 01–18, contracts A–R content, B0, Core, A2, or C1 code.

---

## 0. Scope & method

| In scope | Out of scope |
|----------|--------------|
| Deep review of dataflow + security surfaces across readiness A–R + SoT 01–18 (esp. 02, 04, 06, 10, 12) | Any implementation, Preview wiring, measurement |
| Live code skim as **reference for gaps only** (paths under `api/lib/discovery/`, `api/lib/forbiddenIdentities.js`, route CORS) | Mutating live code, SoT, A–R contract bodies |
| Acc scrub / Bound / budget / session durability truth | New providers, crawl, D1/D2, promote language |

**Live reference paths (read-only this pass):**

| Surface | Path |
|---------|------|
| SSRF / host allow | `api/lib/discovery/urlSafety.js` |
| UrlOrigin / C1 fetch | `api/lib/discovery/webOrigin.js` |
| Acc emit scrub | `api/lib/discovery/emit.js` |
| Bound clamp (finding+evidence+facetHints) | `api/lib/discovery/store.js` (`clampWebOriginRelationship`) |
| Orchestrator / budgets / AbortSignal | `api/lib/discovery/orchestrator.js` |
| Session / KV durability | `api/lib/discovery/sessionStore.js` |
| Fault / failure inject | `api/lib/discovery/faultInject.js`, `failureInject.js` |
| Request caps | `api/lib/discovery/requestGuards.js` |
| SSE / narrow | `api/lib/discovery/sse.js`, `narrow.js` |
| Forbidden QIDs | `api/lib/forbiddenIdentities.js` |
| Providers (flat) | `api/lib/discovery/providers.js` |
| CORS | `api/discovery/sessions/**`, `api/discovery/health.js` |

---

## 1. End-to-end dataflow (target SoT vs AS-IS)

### 1.1 Target (SoT 01 · Architecture Overview)

```text
seed
  → softEntityResolve (opaque; non-identity)          [STAYS]
  → urlSafety before any fetch                        [STAYS]
  → SeedClassRouter                                   [NEW design]
  → QueryPlanBuilder (intents · families · urlTargets · budgets · reasons)
  → SourceFamilyOrchestrator (budget-gated · soft-fail)
  → EvidenceCollection (B0 adapters behind families)
  → UrlOriginStage (EARLY for url/domain; optional one-hop; NO crawl)
  → RelationshipClassifier (C1/A2 vocab · Bound closed)
  → EvidenceGraph (complement, not dossier)
  → Acc scrub · facets · rank
  → Progressive: SSE / NARROW / HIT / session store
```

Cite: SoT `01-ARCHITECTURE-OVERVIEW.md` §Current / §Target; readiness `CROSSWALK-SOT-01-18-TO-A-R.md`.

### 1.2 AS-IS (live · B0 + frozen experiments)

```text
seed (POST body.seed|q) — requestGuards MAX_SEED_CHARS=500
  → softEntityResolve
  → getDefaultProviders()  (B0 WD/OL/WP; +VIAF/+WEB-ORIGIN flags)
  → provider.search({ q: RAW seed })     ← NO QueryPlan
  → normalizeRawHit → Evidence → Finding (store.js)
  → dedupe · A2-safe coalesce (Preview) · rank · detectContradictions
  → Acc sanitizeDiscoveryPayload (emit.js)
  → sessionStore (KV if env else /tmp+regen)
  → GET snapshot / SSE / NARROW
```

Cite: SoT 01 as-is map; readiness **A** / **E** / **H** gap tables.

### 1.3 Stage-by-stage Server lens

| Stage | SoT cite | Readiness | Live truth | Server note |
|-------|----------|-----------|------------|-------------|
| Seed ingest | 02 inputs · 12 seed caps | A · K · requestGuards | `validateDiscoveryCreateBody` caps seed/hints/body | GREEN substrate |
| QueryPlan | 02 | **A** | **Absent** — verbatim `q` | Gap (planning only) |
| Families | 03 | **B** | Flat provider list | Gap |
| Budget | 04 | **C** | `DEFAULT_BUDGETS` = sessionWallMs 12_000 · providerMs 3_500 · firstPaintMs only | Partial — fanout/URL/evidence caps missing |
| UrlOrigin early | 06 | **E** | Flag-gated provider + post-batch one-hop (`MAX_ONE_HOP_URLS=5`) | Bound present; **placement** not early stage |
| Evidence graph | 07 | **F** | Flat findings+evidence + contradictions array | Gap (graph schema design-only) |
| Emit / SSE / narrow | 09 · 11 · 12 | H · J · K | Acc scrub on snapshot, SSE chunks, narrow | GREEN substrate; plan fields not yet in scrub checklist |
| Session durability | 10 · store | I · H | KV if env; else `fs-regen` durable=**false** | Truthful flags exist (B18) |

---

## 2. Security surfaces (Server deep)

### 2.1 SSRF envelope — `urlSafety.js`

| Control | Live behavior | SoT 12 / readiness K | Alignment |
|---------|---------------|----------------------|-----------|
| Scheme allowlist | `https:` only; reject `javascript:`/`data:`/`file:`/`blob:` | Scheme allowlist | **ALIGNED** |
| Userinfo | Forbidden | Credential isolation | **ALIGNED** |
| Host blocklist | localhost / `.localhost` / `.local` / `.internal` / metadata / k8s defaults | Private/metadata | **ALIGNED** |
| Raw IP | Reject **all** IPv4 literals + all IPv6 (`:` in host); private ranges + CGNAT + multicast as defense-in-depth | Private IP | **ALIGNED** (strict: hostname-only provenance) |
| API | `assertSafePublicHttpsUrl` · `isBlockedDiscoveryHost` | Every fetch / plan urlTarget | **KEEP**; QueryPlan path must not bypass (K WP-SEC-URL · Q Gate 5) |

**Gap (document only):** SoT/K require plan `urlTargets` to pass urlSafety **or** mark `blocked` without fetch. No QueryPlan yet → risk is **future** bypass if planner invents fetch URLs outside UrlOriginStage. Not a live defect today for B0 (no arbitrary URL fetch except C1 web_origin path).

### 2.2 Redirect / DNS / private IP

| Control | Live (`webOrigin.js`) | SoT 04/06/12 | Alignment / risk |
|---------|----------------------|--------------|------------------|
| Manual redirects | `redirect: 'manual'`; follow Location | maxRedirects + re-validate | **ALIGNED** |
| Per-hop re-validate | `assertSafePublicHttpsUrl(current)` each hop | SoT 12 open-redirect abuse | **ALIGNED** |
| maxRedirects | `MAX_REDIRECTS = 3` | Design ≤3 | **ALIGNED** |
| Post-DNS IP check | **Not present** — hostname string gate only; Node `fetch` resolves DNS after allow | SoT “private net / metadata IPs” | **AMBER gap** — DNS rebinding / resolved-IP recheck not specified in SoT 12 nor readiness K as explicit WP |
| Recursive fetch / crawl | Explicitly forbidden; one-hop cap `MAX_ONE_HOP_URLS=5` | 06 · 17 · P | **ALIGNED** · no crawl |

**Server finding:** Hostname-only SSRF is strong for literal private IPs and blocked TLDs; **DNS-to-private after resolve** is a known residual class. Readiness K does not name a **WP-SEC-DNS-REBIND**. Document as AMBER residual — **not** a license to change SoT; escalate to Chief if Preview S2 elevates UrlOriginStage.

### 2.3 Timeouts / size limits

| Limit | Live | SoT / readiness |
|-------|------|-----------------|
| Fetch timeout | `DEFAULT_FETCH_TIMEOUT_MS = 4_000` + `AbortSignal.timeout` (+ external via `AbortSignal.any`) | 04 maxProviderMs band · 10 timeout class |
| Body cap | `MAX_FETCH_BODY_BYTES = 256_000`; content-length precheck + arrayBuffer check | 04/12 maxResponseBytes |
| Seed / body | `MAX_SEED_CHARS=500`, body 32k, hints 4k | 12 seed caps |
| Session wall | `sessionWallMs=12_000` + `AbortSignal.timeout` on pipeline | 04 maxWallMs |
| Provider Ms | `providerMs=3_500` | 04 |

**Aligned** on C1 path; DiscoveryBudget dimensions beyond latency (**C**) still absent on plan snapshot.

### 2.4 Scheme allowlist · no recursive fetch · no crawl

Confirmed live + SoT + readiness **E** / **P** / SoT **17**:

- No link frontier / browser automation WPs accepted (P register).
- UrlOriginStage MAY emit URL/domain/page meta; MUST NOT recursive crawl (SoT 06).
- Live `extractUrlCandidatesFromSeed` capped; one-hop only.

**GREEN** on non-goal enforcement intent; CI guards for crawl APIs are **future** (P WP-NG-CI-GUARDS) — not blocking Prego (no code).

### 2.5 Acc scrub surfaces (forbidden QID / contradictions `findingIds`)

| Surface | Live mechanism | Named in readiness? |
|---------|----------------|---------------------|
| Findings / evidence / facets | `emit.js` `scrubFinding` / `scrubEvidence` / `scrubFacet` via `isForbiddenQid` / `FORBIDDEN_IDENTITY_QIDS` (**Q1701775**) | **K** “sanitizeDiscoveryPayload — KEEP · Extend to queryPlan”; **J** Acc scrub · **N** poisoned meta |
| Contradictions `.findingIds` | `scrubContradiction` filters survivors + strips forbidden QID tokens in ids/scalars; deep sweep notes `findingIds` | **Partially** — SoT 12 “Acc scrub”; **F** detectContradictions→contradicts; **emit.js comment B23** is code truth. Readiness **K/J do not explicitly name `findingIds` as a scrub surface** |
| SSE chunks | `sse.js` → `sanitizeDiscoveryPayload` + `scrubFindingChunk` / `scrubFacetsChunk` | H · J · K |
| Narrow | Caller scrub via `emitSnapshot` | H |
| webOrigin telemetry | `scrubTelemetry` string-replaces Q1701775 (narrower than full denylist) | **AMBER** — dual scrub paths; full denylist on emit is SoT of record |
| Plan JSON / reasons | Not present yet | A · J · K · Q Gate 4 — **must** extend before Preview |

**Confirm:** Readiness names Acc sanitize / poison patterns / Q1701775 (SoT 12 table · K summary) but **does not explicitly checklist `contradictions[].findingIds`**. Server recommends Chief/Acc note this as **documentation completeness AMBER** for Gate 4 — not a SoT change, and not an impl GO.

### 2.6 URL-alone → UNKNOWN clamp (C1 Bound) — finding + evidence + facet

| Layer | Live | SoT 06 / readiness E | Alignment |
|-------|------|----------------------|-----------|
| Relationship label | `labelWebOriginRelationship`: seedIsUrl → **UNKNOWN** always | Bound FROZEN | **ALIGNED** |
| Store clamp | `clampWebOriginRelationship`: SAME-ENTITY / SAME-REFERENCE / SAME-SOURCE → **UNKNOWN** | Bound | **ALIGNED** |
| Facet hints | `relationship:SAME-*` rewritten → `relationship:UNKNOWN` in `normalizeRawHit` | Bound | **ALIGNED** |
| Gate | BAD_URL_ALONE_SAME=0 | E exit · Q Gate 9 · N | Design/readiness **require** re-assert under QueryPlan/UrlOriginStage |

**Readiness vs SoT:** **E** and SoT **06** Bound tables match. Live clamp covers finding.relationship, evidence.relationship, and facetHints. **GREEN** Bound preservation on AS-IS C1 path. Future planner must not invent SAME-* directives (SoT 02 Gate H · A).

### 2.7 Budget / abort / AbortSignal contracts

| Contract | Live | SoT 04 / readiness C · I · H |
|----------|------|------------------------------|
| Wall AbortSignal | `AbortSignal.timeout(sessionWallMs)` in orchestrator | Soft-stop partial |
| Provider / fetch signal | webOrigin `fetchSignal(timeout, external)` | timeout failureClass |
| Budget dimensions | Latency triad only | Full DiscoveryBudget on plan — **GAP** |
| Exhaustion reason telemetry | Limited | `budgetRemaining` / `budgetExhaustedReason` — **GAP** |
| No silent expansion | Live: no adaptive re-plan mid-session | SoT forbidden mid-session raise without revision | **ALIGNED** intent |
| Inject | `failureInject` / `faultInject` (env-gated) | I KEEP; extend for budget_exhausted | Named in **I** / **N** |

### 2.8 CORS / egress boundaries

| Item | Live | SoT / readiness |
|------|------|-----------------|
| CORS | `Access-Control-Allow-Origin: *` on create/GET/SSE/narrow/health | **Not deeply specified** in SoT 12 or K |
| Credential in browser | SoT 12: no Discovery provider creds in browser; server env only | **ALIGNED** design intent |
| Egress | Server-side `fetch` only from UrlOrigin / providers; no browser fetch of arbitrary targets in design | Implicit |

**AMBER documentation:** Wildcard CORS is demo/Preview-typical; neither SoT 12 nor **K** states an allowlist or cookie credential policy for Discovery routes. Server flags for Chief awareness before any promote discussion (promote remains HOLD). **Not** a Prego code task.

### 2.9 Core lock

SoT 12 · K · Q Gate 2: Discovery MUST NOT call `mayCommitDossier` / Core identity commit. Live orchestrator comments “never dossier”. Readiness WP-SEC-CORE-LOCK = future static/CI guard. **Aligned intent.**

---

## 3. Session / KV durability truth · fault injection · telemetry failure classes

### 3.1 Durability truth (`sessionStore.js`)

| Backend | When | `durable` | Promote eligibility |
|---------|------|-----------|---------------------|
| `vercel-kv` / `upstash` | KV/UPSTASH env + successful probe (B18) | true only after good probe | `promoteEligible` gated |
| `fs-regen` | Else `/tmp` + seed-encoded id regen | **false** (no false confidence) | false |

Failure vocabulary: `STORE_OUTCOMES` + mandate `FAILURE_CLASSES` (`fetch_failed|auth|timeout|parse|not_found|conflict|unknown`). Health exposes durable flags. **GREEN** honesty vs older false-confidence risk.

SoT 10 maps store failures as orthogonal durability — readiness **I** cites KEEP. No contradiction.

### 3.2 Fault injection hooks

| Module | Gate | Purpose |
|--------|------|---------|
| `failureInject.js` | `opts.injectFailure` / `DISCOVERY_INJECT_FAILURE` | timeout / 429 / 5xx / redis_unavailable / SSE disconnect |
| `faultInject.js` | `DISCOVERY_FAULT_INJECT=1` (+ query/body when env set) | store miss, provider timeout, **scrub-path forbidden QID inject**, store latency |

Never implicit on production promote path. SoT 10 · readiness **I** / **N**: KEEP for Preview validation; extend for `budget_exhausted` / `unsupported_entity_type`.

### 3.3 Telemetry failure classes (SoT 10 vs live)

| SoT 10 class | Live coverage | Gap |
|--------------|---------------|-----|
| `provider_unavailable` / `rate_limited` / `timeout` / `empty` / `malformed` | Soft-fail patterns; partial enums | Unify on execution records (**I** WP-FAIL-ENUM) |
| `blocked_url` / `unsafe_url` | webOrigin `failureClass` + urlSafety reasons | Map explicitly |
| `contradictory_evidence` | `detectContradictions` | Graph edge later (**F**) |
| `budget_exhausted` | Soft wall stop; no first-class reason field | **C** / **I** |
| `unsupported_entity_type` | Absent (no SeedClassRouter) | **G** |

---

## 4. Contradictions · missing · AMBER vs GREEN (Server lens)

### 4.1 Contradictions (Readiness vs SoT 01–18)

| # | Topic | Finding |
|---|-------|---------|
| C1 | Bound URL-alone→UNKNOWN | **No contradiction** — SoT 06 ↔ E ↔ live clamp |
| C2 | urlSafety before fetch | **No contradiction** — SoT 12 ↔ K ↔ live |
| C3 | Failure classes transport≠CONTRADICTORY | **No contradiction** — SoT 10 ↔ I |
| C4 | Acc scrub on all emit | **Soft doc gap** — SoT 12 implies all surfaces; readiness K/J omit explicit `findingIds` checklist (live emit already scrubs) |
| C5 | DNS/private after resolve | SoT 12 threat table implies private net control; live+K emphasize hostname gate — **residual underspec**, not a hard text contradiction |
| C6 | Budget defaults | SoT 04 marks numbers as design bands / UNKNOWN until measure; C cites AS-IS triad — **aligned as planning**, not measured KPI claim |

**No RED SoT↔Readiness logical contradictions** on Server-owned security/dataflow. Residual is **completeness / future-path risk**, not pack invalidation.

### 4.2 Missing (security / dataflow) — document only

1. QueryPlan artifact + urlSafety gate on `urlTargets` (A · K · Q5)  
2. Full DiscoveryBudget snapshot + exhaustion telemetry (C)  
3. UrlOriginStage **early** placement (E) — Bound OK, orchestration gap  
4. Evidence graph builder (F)  
5. Explicit Acc checklist for plan/reasons/`findingIds`/graph (J · K)  
6. DNS-resolve revalidation WP (optional harden — not in SoT text)  
7. CORS/egress policy statement (SoT 12 silent)  
8. Unified `failureClass` enum on family execution records (I)  
9. CI Core-lock / crawl / SAME-ENTITY guards (K · P) — after GO only  

### 4.3 Risk color summary

| Area | Color | Why |
|------|-------|-----|
| Live C1 SSRF + Bound clamp + Acc emit | **GREEN** | Proved substrate; keep under any future path |
| Session durability honesty | **GREEN** | durable=false on fs-regen |
| Readiness pack planning completeness (A–R) | **AMBER→GREEN planning** | Ready as planning; not impl GO |
| QueryPlan security continuity | **AMBER** | Bypass risk if Preview skips WP-SEC-URL |
| Acc surface growth (plan/SSE/graph) | **AMBER** | SoT 18 High · J/K |
| DNS rebind residual | **AMBER** | Underspec |
| CORS `*` | **AMBER** (promote-relevant only) | HOLD promote anyway |
| Budget fanout | **AMBER** | Scalability IR risk until C enforced |
| Impl without Chief GO | **RED if attempted** | Q Gate 0 · D0 HOLD |

---

## 5. Budget / acceptance notes (Server)

- Accept SoT 04 / **C** / **Q** Gates 8, 11 as Server-owned enforcement after GO.  
- AbortSignal wall + per-fetch timeout are **substrate KEEP**.  
- Do not treat readiness exit checkboxes as passed — they are **future**.  
- S0 HOLD default (`00-EXECUTIVE-READINESS.md`). If Chief later picks S1/S2, Server GO conditions listed in companion verdict file.

---

## 6. Explicit locks restated

```text
DOCUMENT ONLY · Gap ≠ SoT edit permission
NO CODE · NO DEPLOY · NO PROMOTE · NO MEASURE
NO providers · NO crawl · NO B0/Core/SoT mutations
A2/C1 FROZEN · PROMOTE HOLD · D0 HOLD
SoT 01–18 UNTOUCHED · Contracts A–R bodies UNTOUCHED
```

## 7. Deliverables from this Prego

| File | Role |
|------|------|
| `SERVER-PREGO-DATAFLOW-SECURITY.md` | This deep review |
| `SERVER-CONTRIB-CHIEF-IMPLEMENTATION-READINESS-VERDICT.md` | Server slice for Chief verdict |
| `STATUS-שרת-PREGO.md` | Server STATUS (no prior Server STATUS in pack) |

→ Companion verdict · `STATUS-שרת-PREGO.md` · Arch `STATUS-ארכיטקט.md` (unchanged)

---

## APPENDIX — Chief verdict alignment (stand-down)

**Stamp:** 2026-09-21T23:48:30+03:00 IDT  

Chief verdict **IN**: **NOT READY FOR GO-IMPL** · **RED×6** (`R-ACC` · `R-CANON` · `R-UNKNOWN` · `R-BUDGET` · `R-DOR` · `R-SSE`).

This deep-review document is retained as a **DOCUMENT-ONLY archive**. Substrate GREEN notes (urlSafety / Bound clamp / Acc emit / durability honesty) describe KEEP facts only and **do not** authorize GO-IMPL, Preview, measure, or code. Server **STANDS DOWN** and aligns with Chief NOT READY.

```text
ARCHIVE · STAND DOWN · NO GO-IMPL · NO CODE
```
