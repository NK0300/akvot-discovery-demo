# ARCH · Adapter-2 FILL-SPEC · DuckDuckGo Instant Answer JSON · 2026-09-24

**Who:** ארכיטקט  
**GO:** Chief 2026-09-24 (after Acc fill.1.1 PASS · QA Overall PARTIAL coverage · אמינות GREEN on `dpl_CJPdnzg…`)  
**Status:** FILL-SPEC **LOCKED** · Server **GO implement** · **NO PROMOTE**  
**Outside:** Wave 1 TREATMENT `dpl_J92G9…` · do not flip GENERAL_WEB-only Preview env as substitute

---

## 1. Why now

Adapter-1 (WP OpenSearch→extlinks, fill.1.1) closed TBL http-drop and keeps C1 honesty.  
**Coverage residual:** Smith/כהן (and similar) still hit `opensearch_error` / `extlinks_error` → 0 GW candidates.  
Adapter-2 adds an **independent structured** name→URL path when WP path is empty/flaky — **not** HTML SERP scrape.

---

## 2. Locked Adapter-2

| Field | Lock |
|-------|------|
| **Adapter** | **DuckDuckGo Instant Answer API** — JSON only |
| **Endpoint** | `https://api.duckduckgo.com/?q={q}&format=json&no_redirect=1&no_html=1&skip_disambig=1` |
| **Extract** | `AbstractURL` (if https/gate-ok) + `RelatedTopics[].FirstURL` + nested `Topics[].FirstURL` |
| **Emit** | same Track-C / Adapter-1 shape: `kind=url_candidate` · `relationship=UNKNOWN` · `identityClaim=false` · `whyFound` · cite-or-drop |
| **Flag (NEW)** | `DISCOVERY_ENABLE_DDG_INSTANT` **default OFF** |
| **Module** | new `api/lib/discovery/ddgInstantAnswer.js` (do **not** overload `searchGeneralWeb` forever — orchestrator may call both) |
| **Provider id** | `ddg_instant_answer` |
| **Version** | `2026-09-24.adapter2.stub→fill.1` |

### 2.1 Hard non-goals

- ❌ DDG **HTML** SERP / lite HTML scrape / bing/brave scrape  
- ❌ Crawl / recursive link-follow / CDX  
- ❌ F11 filings/news LIVE  
- ❌ SAME-ENTITY / soft-ref from title/domain/snippet  
- ❌ Enabling on TREATMENT `dpl_J92G9…`  
- ❌ Flipping project-wide Preview env (deploy `-e` only for measure Preview)

### 2.2 Relationship to Adapter-1

| Flag | Role |
|------|------|
| `DISCOVERY_ENABLE_GENERAL_WEB` | Adapter-1 WP path (unchanged) |
| `DISCOVERY_ENABLE_DDG_INSTANT` | Adapter-2 DDG IA path (**new**) |

Both may be ON on a **separate** measure Preview. Default both OFF in code = B0.  
Combined emit cap across both: still ≤5 url_candidates **per provider**; session may show both families — UX already paints `url_candidate` UNKNOWN.

---

## 3. Budgets / safety

1. **≤1** IA HTTP call per session seed  
2. **≤5** emitted findings from this provider  
3. Timeout ≤ **4000 ms** · body ≤ **64_000** bytes · AbortSignal + dispose (isolated slice; parent abort honored; **one** transient retry max like fill.1.1)  
4. Host allowlist: add to `ADAPTER_HOST_ALLOWLIST` / `assertAdapterFetchUrl`:
   - `api.duckduckgo.com`
   - (optional redirect target fetch: **none** — we do **not** fetch FirstURL bodies in Adapter-2; URL is candidate only)  
5. Every FirstURL / AbstractURL → `gateGeneralWebHitUrl` (http→https upgrade-then-re-gate · SSRF · registry-host drop)  
6. Cite-or-drop: `provenanceUrl` = the IA request URL (canonical api.duckduckgo.com) **or** drop the hit  
7. Snippets/Text from IA are **why-found / quote only** — never identity

### 3.1 Emit shape (required fields)

```
{
  id, title, url, snippet?,
  kind: 'url_candidate',
  epistemicState: 'candidate',
  relationship: 'UNKNOWN',
  identityClaim: false,
  urlAlone: true,
  urlCandidate: true,
  urlIsNotIdentity: true,
  whyFound: string,  // must say DDG IA · not identity · C1
  providerId: 'ddg_instant_answer',
  sourceFamily: 'general_web',
  familyId: 'ddg_instant_answer',
  hostFamily: 'web_search',
  provenance: { method: 'ddg_instant_answer', apiUrl, ... }
}
```

---

## 4. Wiring (Server)

1. Implement `searchDdgInstantAnswer(req, ctx)` behind `isDdgInstantEnabled()`  
2. Orchestrator: **one** call when flag ON and wall budget remains — after B0 / optional after Adapter-1; failures → provider status + empty (honest), never invent  
3. `flags.js` + `.env.example` document default OFF · not for Wave1 TREATMENT  
4. Unit tests (≥): flag-off noop · AbstractURL+RelatedTopics parse · nested Topics · SSRF/registry drop · http upgrade · cap5 · timeout/retry · C1 UNKNOWN / no SAME-ENTITY  
5. Evidence note under `docs/GO-IMPL-500/MD-WAVE/` + ACTION-LOG  

### 4.1 Measure Preview

Separate Preview with deploy `-e DISCOVERY_ENABLE_DDG_INSTANT=1` (optionally also GENERAL_WEB=1 for dual path).  
**Do not** modify `dpl_J92G9…` or `dpl_CJPdnzg…` project env.  
Then @בודק/@דיוק A/E · @ממשק soft light-up · @אמינות as needed.

---

## 5. Done / not-done

| Claim | When |
|-------|------|
| Adapter-2 code DONE | flag OFF default · tests green · allowlist landed |
| Measure PASS | separate Preview · Acc/QA honesty+C1 · cite-or-drop |
| Wave 1 product DONE | **still NO** until reliable name→unknown-domain across intended seeds (Chief product bar) — Adapter-2 is coverage leverage, not auto DONE |

---

## 6. Explicit Arch locks for allowlist

`adapterContract.js` **must** gain:

```
ddg_instant_answer: ['api.duckduckgo.com']
```

(and providerId mapping used by `assertAdapterFetchUrl`). No other DDG hosts this slice.

---

**Arch owner:** ארכיטקט · **Implement:** שרת · **promote:** false
