# ARCH · Second-flag fill contract · `generalWebSearch` · 2026-09-24

**Who:** ארכיטקט · **GO:** Chief (huddle lock) + שרת start  
**Status:** FILL-SPEC **LOCKED** for Server implement · **NO PROMOTE**  
**Outside:** Wave 1 TREATMENT (`CLAIM_PACK`+`WEB_ORIGIN` only) · QP stays OFF for this track  
**Stub baseline:** `api/lib/discovery/generalWebSearch.js` · `GENERAL_WEB_SEARCH_VERSION=2026-09-24.stub.1`

---

## 1. Goal (north star slice)

**name → unknown public URL/domain candidate** when WD has **no P856**.  
Output is **INFORMATION**, never identity: `relationship=UNKNOWN` · `identityClaim=false` · `urlAlone`/`urlCandidate` · why-found.  
Align emit with Track C fixture (`seed-c-search-url-candidates`) + UX paint already shipped.

Done for this fill ≠ Wave 1 product DONE. Wave 1 product still needs live Preview measure on GENERAL_WEB flag-ON (separate TREATMENT) after Server ships.

---

## 2. Locked Adapter-1 (one only)

| Field | Lock |
|-------|------|
| **Adapter** | **Wikipedia OpenSearch → page `extlinks` harvest** (en + he only) |
| **Why** | Public MediaWiki API · host already allowlisted · Chief exceed-idea E · no commercial SERP · no open crawl |
| **Not this slice** | DuckDuckGo/Bing/Brave HTML · Common Crawl · F11 registries/filings/news · QueryPlan family LIVE invent |
| **Flag** | `DISCOVERY_ENABLE_GENERAL_WEB` **default OFF** |
| **Version bump on fill** | `2026-09-24.fill.1` (keep stub.1 behavior when flag OFF / empty q) |

### 2.1 Call budget (hard)

1. **≤1** OpenSearch call per session seed (`action=opensearch&limit≤5`)  
2. **≤2** page fetches (`action=query&prop=extlinks|info|extracts&exintro&explaintext&ellimit≤20`)  
3. **≤5** emitted URL-candidate findings total (`MAX_GENERAL_WEB_RESULTS`)  
4. Wall clock ≤ `GENERAL_WEB_TIMEOUT_MS` (4000) · body ≤ `GENERAL_WEB_MAX_BODY_BYTES` (64k) per response · AbortSignal required  
5. Hosts only via `assertAdapterFetchUrl(..., 'wikipedia')` / existing WP allowlist

### 2.2 Cite-or-drop + C1

- Every kept URL must pass `gateGeneralWebHitUrl` / `assertSafePublicHttpsUrl`  
- Drop: wiki/wikidata/viaf/openlibrary hosts (registry, not “unknown domain”) · private/SSRF · non-https  
- Extlink **title/domain lexical overlap ≠ SAME-ENTITY** · never mint typed soft-ref from URL  
- Evidence row required per finding (provenanceUrl = MediaWiki API or page URL that justified the extlink) · else drop  
- `epistemicState: 'candidate'` · `relationship: 'UNKNOWN'` (normalize case to pipeline) · `identityClaim: false`

### 2.3 Emit shape (Server → session)

Match Track C / stub typedef:

```
{
  id, title, url, snippet?,
  kind: 'url_candidate',
  epistemicState: 'candidate',
  relationship: 'UNKNOWN' | 'unknown',
  identityClaim: false,
  urlAlone: true,
  urlCandidate: true,
  whyFound: string,           // HE/EN ok · must say search/extlink ≠ identity
  providerId: 'general_web_search',
  sourceFamily: 'general_web',
  familyId: 'general_web_search',
  hostFamily: 'web_search',
  evidenceIds: [...],
  provenance: { method: 'wp_opensearch_extlinks', pageTitle, wikiLang, ... }
}
```

Optional: feed **allowed** URLs into existing `urlDomainCandidates` / web_origin **only if** those flags are also ON. GENERAL_WEB alone must not silently enable WEB_ORIGIN.

---

## 3. Wiring (Server)

1. Implement fill inside `searchGeneralWeb` when flag ON (replace `not_implemented_awaiting_server_fill`)  
2. Orchestrator: call **once** after B0 providers when `isGeneralWebSearchEnabled()` · never on Wave 1 TREATMENT env  
3. Do **not** mark QueryPlan general-web family LIVE · keep capability registry DISABLED/EXPERIMENTAL until measure GO  
4. Flag OFF ⇒ verbatim stub empty + `reason: flag_off` (B0 path unchanged)  
5. Unit tests: flag-off noop · SSRF drop · registry-host drop · C1 UNKNOWN · cap5 · timeout abort · Track-C shape fixture assert

---

## 4. Measure gate (after fill)

Separate Preview with **only** `DISCOVERY_ENABLE_GENERAL_WEB=1` (and whatever B0 needs) — **not** mixed into `dpl_J92G9Xd…` TREATMENT.  
Then @בודק/@דיוק A/E on search titles/domains (pretty-wrong + C1) before broad B.  
@ממשק soft light-up already ready on fixture; live paint after payload lands.

---

## 5. Explicit non-goals

- No promote · no Core/B0 break · no hidden SAME-ENTITY  
- No F11 new families · no uncontrolled crawl · no SERP HTML scrape this slice  
- Filling stub ≠ claiming Maximum Public-Web Engine DONE

---

## 6. Files expected (Server)

- `api/lib/discovery/generalWebSearch.js` (+ tests)  
- orchestrator hook (minimal)  
- evidence note under `docs/GO-IMPL-500/MD-WAVE/`  
- ACTION-LOG append  

**Arch owner of this SPEC:** ארכיטקט · **Implement:** שרת

