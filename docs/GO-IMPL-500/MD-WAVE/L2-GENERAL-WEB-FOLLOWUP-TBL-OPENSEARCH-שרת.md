# L2 · GENERAL_WEB follow-up · TBL http→https + OpenSearch resilience · שרת · 2026-09-24

**Who:** Backend / שרת  
**GO:** QA PARTIAL RCA on Preview `dpl_HYUbw4g…` (TBL `all_dropped_ssrf_or_registry` · Smith/כהן `opensearch_error`)  
**Status:** **CODE COMPLETE** · flag **default OFF** · **NO PROMOTE** · TREATMENT `dpl_J92G9…` **untouched** · Arch FILL-SPEC intact (OpenSearch→extlinks only)

---

## RCA (confirmed)

1. **TBL `all_dropped_ssrf_or_registry`:** Tim Berners-Lee WP extlinks are almost all `http://…`. `gateGeneralWebHitUrl` → `assertSafePublicHttpsUrl` rejected http → all dropped. Live: 50 extlinks starting `http://info.cern.ch`, `http://www.w3.org`, `http://news.bbc.co.uk`, …. W3C probe passed because it already had `https://eff.org`.
2. **Smith/כהן `opensearch_error`:** shared wall / transient WP failure. Need dedicated GWS budget slice + one retry + better `message`/`errorCode` (cite-or-drop honesty kept).

---

## Fix (bounded)

### A) HTTP→HTTPS upgrade before gate (cite-or-drop)
- New `tryUpgradeHttpToHttps` + `gateGeneralWebHitUrl` rewrite: same-host/path `http:` → `https:` then existing SSRF+registry gate.
- **Do NOT** allow raw http through. **Do NOT** loosen registry drop. **Do NOT** enable crawl/SERP.
- If https upgrade fails gate → drop (honest).

### B) OpenSearch resilience
- Dedicated `adapterBudgetSignal` / `generalWebBudgetSignal` slice (≤ `GENERAL_WEB_TIMEOUT_MS`); parent orch signal still cancels; `dispose()` in `finally`.
- One retry on transient OpenSearch failure (network/5xx/abort-not-parent) via `isTransientOpenSearchFailure`.
- `emptyResult` carries `message` + `errorCode` (+ `openSearchAttempts`) for observability.
- Body budget **not** bumped (JSON truncate not proven).

### C) Tests
- Unit: http://example.com/foo → accepts https://example.com/foo; still drops registry/private/SSRF.
- Unit: OpenSearch retry + persistent 5xx → `opensearch_error` with message/errorCode.
- `generalWebSearch.test.mjs` **66/0** (was 47/0).

### D) Version
- Adapter fill version → `2026-09-24.fill.1.1` (stub.1 contract unchanged).

---

## Locks honored

| Lock | Status |
|------|--------|
| NO promote | ✓ |
| TREATMENT `dpl_J92G9…` untouched | ✓ |
| Flag default OFF in code | ✓ |
| No F11 / no SERP / no crawl | ✓ |
| C1 UNKNOWN | ✓ |
| Arch OpenSearch→extlinks only | ✓ |
| UX WIP left unstaged | ✓ |

---

## How to enable (deploy -e only)

```bash
vercel deploy --yes --target=preview -e DISCOVERY_ENABLE_GENERAL_WEB=1
# Do NOT set project Preview env · Do NOT touch TREATMENT dpl
```

---

## Smoke (post-redeploy)

Seed **Tim Berners-Lee** on the new GENERAL_WEB Preview → expect ≥1 `url_candidate` if https upgrade works; if still 0, record honest `reason` (`all_dropped_ssrf_or_registry` / `empty_extlinks` / …).

---

## Confirmations

- [x] TREATMENT Preview env **not** modified  
- [x] NO promote  
- [x] Flag default OFF  
- [x] No SERP HTML / open crawl / F11 expand  
- [x] UX WIP left unstaged
