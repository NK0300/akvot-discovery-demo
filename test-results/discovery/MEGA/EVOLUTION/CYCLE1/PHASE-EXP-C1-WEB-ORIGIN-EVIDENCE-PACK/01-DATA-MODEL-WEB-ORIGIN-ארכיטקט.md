# 01 — DATA MODEL · family `web_origin` · ארכיטקט

**Owner:** ארכיטקט · Project A · CYCLE1 EXP-WEB-ORIGIN (C1) · **PREVIEW ONLY**  
**Stamp:** 2026-09-20 11:33 IDT (Asia/Jerusalem, UTC+3)  
**Locks:** B0 prod LOCKED · Core LOCKED · A2 FROZEN · **NO promote** · **NO C2–C6** · **NO QueryPlan** · **NO crawling**  
**Vocab SoT:** `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/03-VOCABULARY-FINAL-ארכיטקט.md`  
**Aligns with Server Preview code (glance):** `api/lib/discovery/webOrigin.js`, passthrough in `store.js` / gate in `providers.js`

---

## Purpose

`web_origin` is an **evidence family** that records public HTTPS **origin metadata** (title / og:site_name / short description) for a URL or hostname seed.

| Principle | Rule |
|-----------|------|
| **TRUTH > COVERAGE** | Drop weak / unsafe / undersized; never invent identity |
| **EVIDENCE > ASSUMPTION** | Fields are observed / derived from URL parse + safe fetch only |
| **DISCOVERY > DECORATION** | Metadata-only; no recursive link discovery |
| **WEB-ORIGIN ≠ IDENTITY SHORTCUT** | URL/domain **never** implies SAME-ENTITY |

---

## Finding type

| Field | Value / rule |
|-------|----------------|
| `hostFamily` | **`web_origin`** (closed token) |
| `providerId` | **`web_origin`** (opt-in via `DISCOVERY_ENABLE_WEB_ORIGIN=1`) |
| `kind` | **`page`** |
| `evidenceType` | **`page`** |
| `id` | Deterministic Preview shape: `wo-{sha256(web_origin\|registrableDomain\|provenanceUrl)[0:16]}` |
| `title` | Prefer `siteName` → `title` → `hostname` (≤240) |
| `summary` | title + description join (≤500) or snippet |
| `facetHints` | MUST include `provider:web_origin`, `kind:page`, `hostFamily:web_origin`, `relationship:{LABEL}` |
| `entityRefs` | Informational only: `web_origin:{registrableDomain\|hostname}` — **NOT** a typed soft-ref for coalesce / SAME-REFERENCE |
| `relationship` | One of closed vocab (see `02-RELATIONSHIP-BOUNDS`) — **ceiling under C1: RELATED-ENTITY / POSSIBLE-MATCH / UNKNOWN / CONTRADICTORY**; SAME-ENTITY **forbidden**; SAME-REFERENCE **only** per shared typed soft-ref Bound (not URL alone) |
| `registrableDomain` / `hostname` | Echoed for observability; **not** identity keys |

**Cite-or-drop:** No Finding without Evidence bearing `provenanceUrl` (https) and quote/snippet ≥ `MIN_SNIPPET_CHARS` (Server Preview: 40).

---

## Evidence shape (MUST fields)

Every `web_origin` Evidence record **MUST** include:

| MUST field | Type | Meaning |
|------------|------|---------|
| `originalUrl` | string ≤500 | Raw seed / candidate as supplied |
| `normalizedUrl` | string ≤500 | Post-normalize canonical https URL (hash stripped; userinfo forbidden) |
| `origin` | string ≤300 | URL `origin` (`https://host[:port]`) |
| `hostname` | string ≤253 | Lowercased hostname |
| `registrableDomain` | string ≤253 | eTLD+1 heuristic (discovery-only; **not** full PSL) |
| `scheme` | string ≤16 | Allowlist result — C1: **`https` only** |
| `path` | string ≤500 | Pathname after normalize (default `/`) |
| `sourceFinding` / ref | string ≤120 \| null | Optional upstream Finding id when one-hop from prior Evidence |
| `retrievedAt` | ISO-8601 string | Fetch / normalize time (UTC Z) |
| `httpStatus` | number \| omitted | Final hop HTTP status when fetched |
| `resultClass` | string ≤64 | Deterministic outcome class (see enum below) |
| `evidence` (payload) | object | Quote/snippet + optional `webOriginMeta` |
| `safetyDecision` | object | Gate outcome (see enum below) |

### Standard Evidence envelope (existing store)

Also present via `normalizeRawHit`:

- `id` = `ev-{fingerprint}`
- `provenanceUrl` / `url` — canonical https cite
- `domain` — host from provenance
- `providerId` = `web_origin`
- `evidenceType` = `page`
- `quote` — metadata snippet (≤500)
- `contentType` — typically `text/html`
- `robotsOk` — boolean
- `hostFamily` = `web_origin` (C1 passthrough)

### `evidence` / `webOriginMeta` payload

```text
webOriginMeta: {
  title?: string ≤240,
  siteName?: string ≤240,
  description?: string ≤400
}
quote / snippet: join of available meta parts · ≤500 · min length gate before emit
```

**No** body crawl, **no** link lists, **no** recursive discovery fields.

---

## `safetyDecision` enum / shape

```text
safetyDecision := {
  stage: "normalize" | "fetch_hop" | "final",
  ok: boolean,
  reason: SafetyReason
}
```

### `SafetyReason` (closed for C1 Arch contract)

| reason | Meaning |
|--------|---------|
| `allow` | Passed urlSafety + normalize |
| `empty` | Empty input |
| `not_url_or_hostname` | Seed not URL/hostname-shaped |
| `invalid_url` | URL parse failure |
| `dangerous_scheme` | javascript/data/file/blob/ftp/… |
| `scheme_not_https` | Non-https after upgrade attempt |
| `userinfo_forbidden` | username/password present |
| `blocked_host` | localhost/loopback/private/link-local/metadata/internal/raw-IP/… |
| `unsafe` | Other assertSafePublicHttpsUrl failure |
| `redirect_to_blocked` | Redirect hop failed host/scheme policy |
| `redirect_to_private` | Alias of blocked private after redirect (telemetry may use `blocked_host` / `redirect_to_blocked`) |

Server implements enforcement in `urlSafety.js` + hop re-check in `webOrigin.js`. Arch does **not** expand SSRF surface.

---

## `resultClass` / HTTP failure classes (deterministic telemetry)

| resultClass | When |
|-------------|------|
| `ok` | Metadata retrieved within limits |
| `blocked` | Safety reject (normalize or hop) |
| `timeout` | Abort/timeout |
| `error` | Network / redirect_missing / redirect_invalid |
| `http_error` | Non-2xx final |
| `oversized` | Body / Content-Length over cap |
| `redirect_limit` | Exceeded max redirects |
| `aborted` | External signal abort |
| `weak_snippet` | Fetch ok but snippet &lt; min chars (cite-or-drop) |
| `skipped` | No fetch attempted |

`failureClass` (telemetry) MAY mirror finer codes: `timeout`, `network_error`, `http_{status}`, `body_too_large`, `too_many_redirects`, `redirect_to_blocked`, `unsafe_url`, `weak_snippet`, `safety_{reason}`.

---

## Identity / coalesce key policy (model-level)

| Key form | Coalesce / SAME-REFERENCE? |
|----------|----------------------------|
| `viaf:` / `qid:` / `ol:` | YES — existing typed soft-refs (unchanged A2) |
| `web_origin:{domain}` entityRef | **NO** — display/obs only |
| hostname / registrableDomain / URL string | **NO** — never coalesce keys |
| title / siteName / snippet overlap | **NO** — never identity keys |

---

## Out of model (C1)

- QueryPlan nodes · crawler frontier · unrestricted fetch · RDAP/WHOIS (future candidate, not C1) · SAME-ENTITY Gate · promotion to B0/Core

---

## STOP

Arch data model READY for Preview. **HOLD promote.** Server owns runtime; Acc/QA own measurement slots.
