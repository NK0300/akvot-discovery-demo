# 03 — NO-IDENTITY-COLLAPSE CHECKLIST · Server Preview review · ארכיטקט

**Owner:** ארכיטקט · CYCLE1 EXP-WEB-ORIGIN (C1) · PREVIEW ONLY  
**Stamp:** 2026-09-20 11:33 IDT (Asia/Jerusalem, UTC+3)  
**Use:** Review Server Preview impl / dpl **before** Acc/QA sign-off. Arch glances; Server owns code fixes.

---

## Review targets (workspace)

| Path | Role |
|------|------|
| `api/lib/discovery/webOrigin.js` | Normalize, fetch, label, build Finding |
| `api/lib/discovery/urlSafety.js` | Host/scheme SSRF gate |
| `api/lib/discovery/providers.js` | `webOriginProvider` + `DISCOVERY_ENABLE_WEB_ORIGIN` |
| `api/lib/discovery/store.js` | Evidence passthrough / hostFamily |
| `api/lib/discovery/emit.js` | Acc scrub (unchanged contract) |
| coalesce / `coalesceKeysForFinding` | Must **not** treat domain/URL/`web_origin:` as soft-ref |

---

## Checklist

### A. Identity / vocabulary

- [ ] **A1** No code path assigns **SAME-ENTITY** from hostname, registrableDomain, URL equality, title, or og:site_name.
- [ ] **A2** **SAME-REFERENCE** only when shared typed soft-ref (`viaf:`/`qid:`/`ol:`) across families — **not** when seed is URL / domain matches.
- [ ] **A3** URL/domain-only signals capped at **RELATED-ENTITY** or **UNKNOWN**.
- [ ] **A4** POSSIBLE-MATCH from lexical overlap does **not** feed attach / coalesce.
- [ ] **A5** Facet `relationship:*` is observational; Acc/multi metrics must not treat it as identity confidence.
- [ ] **A6** `entityRefs` of form `web_origin:…` are **excluded** from coalesce key extraction.

### B. Evidence fidelity

- [ ] **B1** MUST fields present on emitted Evidence: originalUrl, normalizedUrl, origin, hostname, registrableDomain, scheme, path, sourceFinding/ref, retrievedAt, http/result class, evidence/quote, safetyDecision.
- [ ] **B2** Cite-or-drop: snippet &lt; min chars → **no** Finding.
- [ ] **B3** provenanceUrl is https canonical; no userinfo; hash stripped.
- [ ] **B4** No recursive crawl / link-follow frontier / QueryPlan expansion.

### C. Safety (see also `04-SECURITY-BOUNDS`)

- [ ] **C1** All candidates pass `assertSafePublicHttpsUrl` / `isBlockedDiscoveryHost` before fetch.
- [ ] **C2** Every redirect hop re-validated; redirect-to-private/blocked fails closed.
- [ ] **C3** Timeouts, body size cap, redirect cap enforced.
- [ ] **C4** Flag-gated: unset `DISCOVERY_ENABLE_WEB_ORIGIN` ⇒ provider absent (B0/prod unchanged).
- [ ] **C5** Telemetry scrubbed (no forbidden Q-ids; seed truncated).

### D. Lock / blast radius

- [ ] **D1** No B0 alias mutation · no Core mutation · no A2 coalesce rule change for web_origin domain keys.
- [ ] **D2** Preview-only dpl; **HOLD promote**.
- [ ] **D3** No C2–C6 scope creep in same change set.

---

## Glance result (workspace code @ stamp — pre-dpl)

| Item | Status |
|------|--------|
| SAME-ENTITY from domain | **PASS** (not assigned) |
| seedIsUrl → SAME-REFERENCE | **FAIL Bound A2** — should be UNKNOWN / non-SAME-REFERENCE |
| Coalesce exclusion of `web_origin:` | **PASS** (workspace): `coalesceKeysForFinding` extracts only viaf/qid/ol — `web_origin:` entityRefs do not mint soft-refs |
| urlSafety reuse + hop re-check | **PASS** (present) |
| Flag gate `DISCOVERY_ENABLE_WEB_ORIGIN` | **PASS** |
| Preview dpl id | **NONE YET** (WAITING) |

**Arch action:** Document only. Server owns label Bound fix. **Do not promote.**

---

## STOP

Checklist READY for Server Preview review.
