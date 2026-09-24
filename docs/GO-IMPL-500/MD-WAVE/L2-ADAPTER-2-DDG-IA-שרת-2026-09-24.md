# L2 · Adapter-2 DDG Instant Answer fill · שרת · 2026-09-24

**Who:** Backend / שרת  
**GO:** Arch FILL-SPEC LOCKED `ARCH-ADAPTER-2-DDG-IA-FILL-ארכיטקט-2026-09-24.md`  
**Status:** **CODE COMPLETE** · flag **default OFF** · **NO PROMOTE** · TREATMENT `dpl_J92G9…` **untouched** · Wave 1 product **NOT DONE**

---

## What landed

| Piece | Detail |
|-------|--------|
| Module | `api/lib/discovery/ddgInstantAnswer.js` + `.test.mjs` |
| Flag | `DISCOVERY_ENABLE_DDG_INSTANT` via `isDdgInstantEnabled()` · **default OFF** |
| Provider | `ddg_instant_answer` · version `2026-09-24.adapter2.fill.1` |
| Endpoint | `https://api.duckduckgo.com/?q=…&format=json&no_redirect=1&no_html=1&skip_disambig=1` |
| Extract | `AbstractURL` + `RelatedTopics[].FirstURL` + nested `Topics[].FirstURL` |
| Emit | Track-C: `kind=url_candidate` · `relationship=UNKNOWN` · `identityClaim=false` · `urlAlone`/`urlCandidate`/`urlIsNotIdentity` · whyFound · `sourceFamily=general_web` · `familyId=ddg_instant_answer` · `hostFamily=web_search` |
| Gate | Reuses `gateGeneralWebHitUrl` (http→https upgrade-then-re-gate · SSRF · registry drop) — **no duplicated SSRF** |
| Allowlist | `ddg_instant_answer: ['api.duckduckgo.com']` only |
| Budgets | ≤1 IA call · ≤5 emits · timeout ≤4000ms · body ≤64000 · AbortSignal + dispose · **one** transient retry · parent abort honored |
| Cite-or-drop | `provenanceUrl` = IA request URL or drop |
| Snippets | why-found only · never identity |
| Failures | honest empty + `reason`/`errorCode` (never invent) |
| Orchestrator | one call when flag ON and wall budget remains (after B0 / after Adapter-1) · flags independent · GENERAL_WEB unchanged |
| `.env.example` | `DISCOVERY_ENABLE_DDG_INSTANT=0` · not for Wave1 TREATMENT |

---

## Tests

```
node api/lib/discovery/ddgInstantAnswer.test.mjs → 78/0
```

Coverage (≥ Arch list): flag-off noop · AbstractURL+RelatedTopics parse · nested Topics · SSRF/registry drop · http upgrade · cap5 · timeout/retry · C1 UNKNOWN / no SAME-ENTITY · allowlist host-only · cite-or-drop.

Regression: `generalWebSearch.test.mjs` 66/0 · `adapterContract.test.mjs` 63/0.

---

## Locks honored

| Lock | Status |
|------|--------|
| NO promote | ✓ |
| TREATMENT `dpl_J92G9…` untouched | ✓ |
| Flag default OFF in code | ✓ |
| No HTML SERP / crawl / F11 | ✓ |
| C1 UNKNOWN · cite-or-drop · SSRF | ✓ |
| GENERAL_WEB path unchanged | ✓ |
| Wave 1 product NOT DONE | ✓ |

---

## How to enable (deploy -e only)

```bash
vercel deploy --yes --target=preview -e DISCOVERY_ENABLE_DDG_INSTANT=1
# Do NOT set project Preview env · Do NOT touch TREATMENT dpl · Do NOT promote
```

---

## Deploy + smoke (this turn)

| Field | Value |
|-------|-------|
| Code SHA | `e4355451a55cbca39ce0d694321d516bcb641b22` (`e435545`) |
| Preview dpl | `dpl_8RbS15aXGi63MxLhqXaAEzDZSy5k` |
| Preview URL | https://akvot-simple-demo-pnmmxdn7e-k-akvot.vercel.app |
| Flag on Preview | `DISCOVERY_ENABLE_DDG_INSTANT=1` via deploy `-e` only (project Preview env **not** set) |
| Track C UX on bundle | **yes** · `discovery-ui.js?v=c1a1` (SHA `8061784`) |
| TREATMENT | `dpl_J92G9…` **untouched** |
| Evidence path | `docs/GO-IMPL-500/MD-WAVE/L2-ADAPTER-2-DDG-IA-שרת-2026-09-24.md` |
| Locks | **NO promote** |

### Light smoke (`vercel curl`)

- Health `/api/discovery/health` → `ok:true` · durable KV
- Flag ON observed: `providers.ddg_instant_answer` present (absent when flag OFF)
- Seeds `World Wide Web Consortium` · `Ada Lovelace` → `providers.ddg_instant_answer=ia_error` · 0 invented candidates (honest empty)
- Live DDG TLS from box + Preview currently EOF/timeout to `api.duckduckgo.com` — cite-or-drop / never-invent path held
- `general_web_search` **absent** (GENERAL_WEB left OFF) · project env has no `DISCOVERY_ENABLE_DDG_INSTANT` / no `DISCOVERY_ENABLE_GENERAL_WEB`

