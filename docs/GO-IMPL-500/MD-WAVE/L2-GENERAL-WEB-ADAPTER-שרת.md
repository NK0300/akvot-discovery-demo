# L2 · GENERAL_WEB adapter fill · שרת · 2026-09-24

**Who:** Backend / שרת  
**GO:** Chief second-flag · OUTSIDE TREATMENT · Arch FILL-SPEC LOCK (ACTION-LOG 267)  
**Status:** **IMPLEMENTED** (code) · flag **default OFF** · **NO PROMOTE** · TREATMENT env **untouched**

---

## Align

| Lock | Value |
|------|-------|
| Arch evidence | `docs/GO-IMPL-500/MD-WAVE/ARCH-SECOND-FLAG-GENERAL-WEB-FILL-ארכיטקט-2026-09-24.md` |
| Stub baseline | `2026-09-24.stub.1` (flag OFF / empty q preserved) |
| Fill version | `2026-09-24.fill.1` |
| Adapter-1 | **Wikipedia OpenSearch → page extlinks** (en + he ONLY) |
| Flag | `DISCOVERY_ENABLE_GENERAL_WEB` default **OFF** |
| TREATMENT | `dpl_J92G9…` — **do not flip** GENERAL_WEB on Preview TREATMENT |

---

## What shipped

1. **`api/lib/discovery/generalWebSearch.js`** — fill behind stub.1:
   - Flag OFF → empty + `reason: flag_off` + `stub: true` (B0 unchanged)
   - Flag ON → ≤1 OpenSearch + ≤1 batched extlinks query (≤2 titles) + ≤5 URL-candidate findings
   - Every extlink through `gateGeneralWebHitUrl` → `assertSafePublicHttpsUrl` + registry-host drop (wiki/wikidata/viaf/OL/…)
   - C1: `epistemicState: candidate` · `relationship: UNKNOWN` · `identityClaim: false` · URL≠identity
   - Cite-or-drop: `provenanceUrl` = wiki page/API that justified the extlink
   - Budgets: `GENERAL_WEB_TIMEOUT_MS=4000` · `GENERAL_WEB_MAX_BODY_BYTES=64k` · AbortSignal via `adapterBudgetSignal`
   - Hosts via `assertAdapterFetchUrl(..., 'wikipedia')` (en/he allowlist)
2. **Orchestrator** — one call after B0 / P856 bridge when flag ON; never enables WEB_ORIGIN by itself
3. **`store.js`** — allow `url_candidate` / `web_search` kinds + web_search passthrough (UNKNOWN forced)
4. **Unit tests** — `generalWebSearch.test.mjs` **47/0**
5. **`.env.example`** — note: fill.1 · default OFF · not for Wave1 TREATMENT

---

## How to enable (env only)

```bash
# Preview opt-in LATER (separate from Wave1 TREATMENT dpl_J92G9…)
DISCOVERY_ENABLE_GENERAL_WEB=1
```

- Local / new Preview only after Chief measure GO  
- **Do NOT** set on current TREATMENT deployment  
- **Do NOT** promote to Production

---

## Honest gaps

| Gap | Note |
|-----|------|
| Source | Wikipedia OpenSearch+extlinks only — **not** a general SERP / Maximum Discovery |
| Coverage | Only seeds that hit en/he Wikipedia pages with outbound extlinks |
| Cap | ≤5 candidates · ≤2 titles · no crawl · no link-follow beyond extlinks list |
| Rate limits | Public MW API · shared Wikimedia fair-use · fail-closed on timeout/abort |
| F11 | No new families LIVE · QueryPlan general-web family still DISABLED |
| Measure | Live Preview with GENERAL_WEB=1 alone still required before product claim |
| Wave 1 | Product NOT DONE · Acc/QA A/E TREATMENT stands · this flag stays OFF there |

---

## Confirmations

- [x] TREATMENT Preview env **not** modified  
- [x] NO promote  
- [x] Flag default OFF  
- [x] No SERP HTML / open crawl / F11 expand  
- [x] UX WIP left unstaged (if dirty)

---

## Test

```bash
npm run test:general-web
# 47 passed, 0 failed
```
