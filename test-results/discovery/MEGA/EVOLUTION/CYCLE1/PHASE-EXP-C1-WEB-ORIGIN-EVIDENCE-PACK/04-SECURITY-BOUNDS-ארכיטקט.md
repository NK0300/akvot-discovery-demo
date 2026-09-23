# 04 — SECURITY BOUNDS · web_origin Arch contract · ארכיטקט

**Owner:** ארכיטקט · CYCLE1 EXP-WEB-ORIGIN (C1) · PREVIEW ONLY  
**Stamp:** 2026-09-20 11:33 IDT (Asia/Jerusalem, UTC+3)  
**Implements (Server):** `api/lib/discovery/urlSafety.js` + `api/lib/discovery/webOrigin.js`  
**Arch role:** Contract + bounds · **Server implements** · **NO SSRF expansion**

---

## Contract summary

> **ALL URLs** entering `web_origin` normalize/fetch **MUST** pass existing discovery URL safety. Fail closed. Deterministic telemetry. No unrestricted fetch. No recursive discovery.

---

## Reference: `api/lib/discovery/urlSafety.js`

### `isBlockedDiscoveryHost(hostname)` — reject when

| Class | Examples / rule |
|-------|-----------------|
| Empty | falsy host |
| Local / suffix traps | `localhost`, `*.localhost`, `*.local`, `*.internal` |
| Cloud metadata | `metadata`, `metadata.google.internal`, `metadata.google*` |
| K8s in-cluster | `kubernetes.default`, `kubernetes.default.svc` |
| Raw IPv6 | any host containing `:` |
| Raw IPv4 | **all** dotted quads rejected (incl. public) — provenance via hostname only |
| Private / special IPv4 (defense in depth) | 10/8, 127/8, 0/8, 169.254/16, 172.16–31/12, 192.168/16, 100.64–127/10 (CGNAT), ≥224 multicast/reserved |
| Weird numeric | decimal-only host, `0x…` hex host |

### `assertSafePublicHttpsUrl(url)` — require

| Check | Failure reason |
|-------|----------------|
| Non-empty trim | `empty` |
| `new URL` parse | `invalid_url` |
| Dangerous schemes | `dangerous_scheme` (`javascript:`, `data:`, `file:`, `blob:`) |
| Protocol === `https:` | `scheme_not_https` |
| No userinfo | `userinfo_forbidden` |
| Host not blocked | `blocked_host` |
| Else | `{ ok: true, canonical }` |

---

## Arch security bounds (Server MUST enforce for C1)

| Bound | Requirement | Preview constants (workspace) |
|-------|-------------|-------------------------------|
| Scheme allowlist | https only (http→https upgrade then re-validate OK) | normalize in `webOrigin.js` |
| Block classes | localhost / loopback / private / link-local / metadata / internal / unsupported / malformed / redirect-to-private | urlSafety + hop loop |
| Redirects | Manual follow; **re-assert safety every hop**; cap | `MAX_REDIRECTS = 3` |
| Timeout | Per-fetch AbortSignal timeout | `DEFAULT_FETCH_TIMEOUT_MS = 4000` |
| Size limit | Cap body / Content-Length | `MAX_FETCH_BODY_BYTES = 256_000` |
| Candidate cap | No crawl frontier; bounded one-hop list | `MAX_ONE_HOP_URLS = 5` |
| DNS/IP policy | No provenance via raw IP; blocked hosts never fetched | urlSafety |
| Failure telemetry | Deterministic `safetyDecision.reason` + `resultClass` / `failureClass` | scrubbed |
| Scope | Metadata parse only (title / og:site_name / description) | `parseOriginMetadata` |
| Forbidden | SSRF expansion · recursive discovery · unrestricted fetch · ftp/file/data · userinfo · B0 enablement without flag |

---

## Explicit non-goals (security)

- Open-web crawler / sitemap follow  
- Fetching private/corporate intranet after DNS rebinding tricks without hop re-check  
- Treating `web_origin` enablement on Production/B0 without explicit Preview flag + Chief GO  
- Shipping security “exceptions” for known-good private IPs  

---

## Acc / obs expectations

- Blocked attempts emit telemetry with reason — **not** Findings.  
- Scrub forbidden Q-ids from telemetry strings.  
- Leak surface: provenanceUrl must remain public https only after scrub.

---

## STOP

Security Arch contract READY. Server implements against `urlSafety.js`. **HOLD promote.**
