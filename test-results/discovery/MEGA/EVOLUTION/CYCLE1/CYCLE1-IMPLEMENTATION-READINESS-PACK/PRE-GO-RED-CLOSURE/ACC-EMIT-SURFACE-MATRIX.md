# ACC-EMIT-SURFACE-MATRIX · PRE-GO RED CLOSURE

**Stamp:** 2026-09-21T23:52:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Closes:** **R-ACC** (Chief verdict §C · Chief R2)  
**Elevates / extends:** `ARCHIVE-00-21/11-SECURITY-MODEL.md` §2 Acc scrub checklist  
**Cite-only SoT:** `12-SECURITY-MODEL.md` · IR Acc · C1 SECURITY-BOUNDS · AS-IS `emit.js` / `urlSafety.js`  
**Binds:** every SSE event in `SSE-UNTRUSTED-SURFACE-CONTRACT.md`  
**Mode:** DOCUMENTATION ONLY · NO CODE · NO A2/C1/B0/Core changes

---

## 0. Disposition vocabulary (closed)

| Code | Meaning |
|------|---------|
| **ALLOW** | May emit / persist after Acc scrub (`sanitizeDiscoveryPayload` or equivalent) |
| **REDACT** | Field-level strip / hash / truncate before emit or log |
| **BLOCK** | Omit entirely · reject emit · deny persist of that field/payload |
| **UNKNOWN** | Relationship / label **ceiling** (emit max UNKNOWN; never upgrade identity). Not an Acc disposition for secrets — use REDACT/BLOCK for secrets |

**Orthogonal (not Acc columns):** **SSRF** = fetch-path ALLOW vs BLOCK via `urlSafety.assertSafePublicHttpsUrl` before **every** outbound fetch. QueryPlan / SSE / Acc scrub **cannot** bypass SSRF. Fetch BLOCK (`unsafe_url`) ≠ Acc BLOCK, though both may co-occur.

---

## 1. Normative surface × disposition matrix

| Surface | ALLOW (scrubbed) | REDACT (field-level) | BLOCK (omit/reject) | UNKNOWN (label ceiling) | SSRF orthogonal |
|---------|------------------|----------------------|---------------------|-------------------------|-----------------|
| **API** GET session / NARROW / facets | findings, facets, status, scrubbed summaries | raw provider strings, internal stack, IP literals | credentials, Acc-forbidden ids, private keys, Core commit payloads | relationship labels ≤ UNKNOWN unless typed path | N/A (response) |
| **QueryPlan JSON** (persist + emit) | planId, seedClass, intents, families, budgets, scrubbed `reasons[]` | intent query text if Acc-bait; urlTarget host literals → public-safe form | KV tokens, env secrets, private IPs, identity directives (`SAME_ENTITY` etc.), provider credentials | plan must **never** encode identity claims; insufficient → no SAME-* | urlTargets **must** pass urlSafety before fetch; unsafe → status `unsafe_url`, no fetch |
| **Family execution journal** | familyId, providerId, status, skipReason codes, timing | raw error bodies, response snippets, request URLs with secrets | credentials, Acc-forbidden identity strings in reasons | empty/UNKNOWN outcomes stay non-identity | per-call urlSafety before fetch |
| **SSE `meta`** | session meta scrubbed | — | secrets, Acc ids | — | N/A |
| **SSE `plan`** | scrubbed plan summary (planId, seedClass, intents, families, budgets, reasons) | reason/query/urlTarget bait fields | credentials; identity directives | no SAME-* in plan event | N/A (emit); plan urlTargets gated at fetch |
| **SSE `progress`** | phase, %, scrubbed counters | internal hostnames | secrets | — | N/A |
| **SSE `provider`** | family/provider start/end, status codes | raw error text | credentials, Acc ids in messages | — | N/A |
| **SSE `finding`** | scrubFindingChunk path | quotes/rawRef Acc-forbidden spans | Acc-forbidden identity; unscrubbed raw | label ceiling per UNKNOWN contract | N/A |
| **SSE `graph`** | optional delta: nodes/edges with provenance | signalSummary person/org mention strings | `same-entity` edges; orphan edges; Acc-forbidden node labels | unknown / omit when insufficient | N/A |
| **SSE `facets` / `status`** | facets, lifecycle status | — | secrets | — | N/A |
| **SSE `error`** | failureClass, scrubbed message | stack, upstream bodies | credentials, Acc ids | failure ≠ CONTRADICTORY | N/A |
| **SSE `done`** | terminal marker always | — | — | — | N/A |
| **Graph JSON** (HIT / API) | nodes/edges with planId/familyId/evidenceId | signalSummary lexical bait | same-entity edges; edges without provenance; Acc-forbidden labels | unknown edge or omit | N/A |
| **Candidates / softRefs** | typed soft-refs (`viaf:`/`qid:`/`ol:`) as candidates only | lexical title bridges presented as typed | auto-confirm; URL-alone as SAME-REFERENCE | candidate≠confirmed; URL-alone → UNKNOWN | N/A |
| **Evidence rows** | evidenceId, provenance, scrubbed quote/snippet | rawRef Acc-forbidden spans | Acc-forbidden on emit; orphan evidence without planId | — | fetch path urlSafety |
| **Debug / failureInject** | flag-gated; scrubbed fixtures | all PII-like fields | production emit of debug with Acc bait; credentials | — | inject must not bypass urlSafety |
| **Errors (client)** | failureClass + safe message | stacks, upstream | secrets, Acc ids | not relationship CONTRADICTORY | N/A |
| **Logs** | structured codes, planId, familyId, scrubbed reasons | seed text, URLs, error bodies | tokens, private IPs, Acc-forbidden ids, credentials | — | log unsafe URL attempts as blocked, never fetch |
| **Metrics / obs** | counters, budgets remaining (scrubbed reasons codes) | free-text labels with seed/PII | secret-bearing labels | Freshness UNKNOWN until measured (no invented KPIs) | N/A |
| **Persist / HIT / session store** | scrubbed session snapshot; isolation by unguessable id | raw provider payloads at rest if retained → redact policy | cross-session leakage; client-injected planId truth; Core identity commit | stored labels honor UNKNOWN ceiling | persisted urlTargets still re-validated before any later fetch |
| **Cache** | isolated keys; no shared mutable seed-keyed poison | cached raw bodies | cross-tenant/seed contamination; Acc-forbidden cache values on emit | — | cached URL fetch results must have been urlSafety-gated at write |

---

## 2. Acc scrub extension checklist (from ARCHIVE-11 §2 — binding)

Before any Preview GO-IMPL, scrub **at least**:

- `plan.reasons` · intent queries · `urlTargets` · graph `signalSummary` · budget telemetry strings · family skip/error reasons  
- Forbidden-identities version honored on **all** rows above  
- No KV tokens, private IPs, credentials in logs / SSE / HIT / plan JSON  
- `sanitizeDiscoveryPayload` (or successor) applied to **API, plan, graph, SSE plan/graph/finding/error, journal, metrics labels**

---

## 3. Acc bait plan (plan / SSE / graph) — falsifiable later

| Bait ID | Inject | Surfaces under test | Pass |
|---------|--------|---------------------|------|
| BAIT-PLAN-01 | Acc-forbidden identity string in `plan.reasons[]` | QueryPlan persist, API, SSE `plan` | leak=0; REDACT or BLOCK |
| BAIT-PLAN-02 | Credential-shaped token in intent query | Plan JSON, SSE `plan`, logs | BLOCK/REDACT; never on wire |
| BAIT-SSE-01 | Acc-forbidden id in finding title/snippet | SSE `finding`, API HIT | scrubFindingChunk leak=0 |
| BAIT-SSE-02 | Acc-forbidden id in SSE `error` message | SSE `error` | scrubbed / BLOCK |
| BAIT-GRAPH-01 | Person/org Acc-forbidden mention in `signalSummary` | SSE `graph`, graph JSON | REDACT/BLOCK; leak=0 |
| BAIT-GRAPH-02 | Attempt emit `same-entity` edge | graph JSON, SSE `graph` | BLOCK / reject; count=0 |
| BAIT-SEED-SSE | Poisoned seed/meta → progressive events | meta→finding→done path | leak=0 end-to-end |

---

## 4. Tests · Failure · Evidence (R-ACC quadruple)

### Test

| Test ID | How verified later |
|---------|-------------------|
| T-ACC-01 | Bait corpus BAIT-* against each matrix row → Acc leak count = 0 |
| T-ACC-02 | Plan JSON schema/deny-list rejects credentials + identity directives |
| T-ACC-03 | SSRF suite (169.254 / localhost / metadata) under QueryPlan urlTargets → `unsafe_url`, **zero** fetches |
| T-ACC-04 | Graph validator rejects same-entity + orphan edges |
| T-ACC-05 | Logs/metrics sample contains no tokens / Acc-forbidden ids |
| T-ACC-06 | Cache key isolation: seed A cannot read seed B Acc material |

### Failure (gate fails when)

| Failure | Disqualifying? |
|---------|----------------|
| Acc leakage ≠ 0 on any ALLOW surface | **YES** |
| Credentials in plan / SSE / HIT | **YES** |
| SSRF suite FAIL / bypass via QueryPlan | **YES** |
| same-entity edge persisted or SSE-emitted | **YES** |
| Matrix row missing for a shipped surface | **YES** (reopen R-ACC) |

### Evidence

| Artifact | Proves |
|----------|--------|
| Acc leak report (bait corpus) | leak=0 |
| Plan fixture scrub diff | reasons/queries sanitized |
| SSRF pack under plan path | unsafe_url, no fetch |
| Graph validator report | no same-entity / orphans |
| This matrix + SSE contract bind table | every surface dispositioned |

**R-ACC:** CLOSED (documentation). Residual AMBER: field-level REDACT catalogs may deepen at GO-IMPL; matrix rows are binding minimum.

---

## STOP

NO CODE · NO MEASURE · NO PROMOTE · NO GO-IMPL WITHOUT NEW CHIEF ORDER
