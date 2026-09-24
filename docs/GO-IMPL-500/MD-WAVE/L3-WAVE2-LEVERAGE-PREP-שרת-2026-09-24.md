# L3 · Wave 2 leverage prep · שרת · 2026-09-24

**Who:** Backend / שרת  
**Audience:** Arch / Chief review (docs only — **no adapter code**)  
**GO gate:** Acc/QA green-honest on GENERAL_WEB follow-up Preview **`dpl_CJPdnzgMe9iUG8qFFMo13DVT9z15`** · Arch glance fill.1.1 · Chief GO  
**Status:** **PREP ONLY** · flag default **OFF** · TREATMENT `dpl_J92G9XdqwmTmb7qkT5KdUsAXwy3j` **untouched** · **NO PROMOTE** · **HOLD CODE**

---

## Purpose

After Acc/QA rerun on `dpl_CJPdnz…` is green/honest, what **bounded next sources** can exceed **name → unknown public domain** without open crawl / SERP HTML / F11 — while Wave 1 product DONE still requires **reliable** name→unknown-domain.

Align: Arch FILL-SPEC spirit · public APIs · allowlisted hosts · cite-or-drop · C1 UNKNOWN · `identityClaim=false` · hard caps · separate Preview measure only.

---

## Adapter-1 today (honest coverage)

| Item | Value |
|------|-------|
| Adapter-1 | Wikipedia OpenSearch → page `extlinks` · **en/he ONLY** (`fill.1.1`) |
| Flag | `DISCOVERY_ENABLE_GENERAL_WEB` **default OFF** |
| Caps | ≤1 OpenSearch · ≤2 page titles · ≤5 URL candidates · 4s / 64k · AbortSignal |
| Gate | http→https upgrade · `assertSafePublicHttpsUrl` · registry-host drop (wiki/WD/VIAF/OL/…) |
| C1 | `relationship=UNKNOWN` · `identityClaim=false` · URL≠identity · provenance required |
| Preview | `dpl_CJPdnz…` (GENERAL_WEB=1 only) · **≠** TREATMENT |

**Already covers:** seeds that hit en/he Wikipedia with outbound https (or upgradable http) extlinks to non-registry hosts.

**Gaps (not Wave-1-DONE yet):**
- No useful WP page / thin extlinks / all registry → empty or PARTIAL
- Locale limited to en/he in `wikiHostForLocale` (FILL-SPEC lock) even though `assertAdapterFetchUrl('wikipedia')` already accepts `^[a-z]{2,3}\.wikipedia\.org$`
- Not a SERP · not Maximum Discovery · flaky MW still possible despite retry
- P856 / L1 WD officialWebsite path is **separate** (CLAIM_PACK / WEB_ORIGIN / urlTargets) — does **not** fill GENERAL_WEB when WD has **no P856**

---

## Ranked leverage options (evaluate — do not implement)

### 1) Additional MediaWiki locales (beyond en/he) — **reuse Adapter-1 host family**

| Field | Sketch |
|-------|--------|
| **Input → output** | seed name + locale hint → OpenSearch on `xx.wikipedia.org` → same extlinks harvest → ≤5 `url_candidate` UNKNOWN |
| **Budget caps** | Keep global ≤1 OpenSearch + ≤2 pages + ≤5 emits **or** Arch-locked small locale allowlist (e.g. en/he/de/fr/es) with **same** total caps (no multiply-by-locale) |
| **C1 risk** | Low if gate/registry drop unchanged · lexical title/domain still ≠ SAME-ENTITY |
| **SSRF / allowlist** | Host pattern already allowed under provider `wikipedia` in `adapterContract.js`; **FILL-SPEC still says en/he ONLY** → needs Arch lock to expand `wikiHostForLocale` |
| **Depends on Acc/QA green** | Yes — only if coverage PARTIAL is locale-shaped (non-en/he seeds empty) |
| **Arch FILL-SPEC lock before Server code?** | **YES** (explicit locale list + cap math) |

### 2) Wikidata sitelinks / P856-adjacent soft URL harvest — **mostly already in L1**

| Field | Sketch |
|-------|--------|
| **What exists** | P856 → `officialWebsiteUrls` / facets · L1 urlTargets bridge · `urlDomainCandidates` (flags OFF by default) |
| **Sitelinks** | Point at **wiki** pages → would hit `REGISTRY_HOST_RE` drop if fed as GENERAL_WEB unknown-domain · **not** a name→unknown-domain exceed |
| **Safe residual** | Soft-display / why-found only · optional extra P-claims that are **typed URL values** already gated (not invent new P-numbers here) |
| **Budget caps** | Keep existing P856 caps (≤3–5) · do **not** dual-count into GENERAL_WEB ≤5 without Arch math |
| **C1 risk** | Medium if someone conflates P856 with identity — preserve UNKNOWN / no typed soft-ref from URL |
| **Depends on Acc/QA green** | Weak leverage for GENERAL_WEB gap when **no P856** (Wave 1 north star) |
| **Arch lock?** | **YES** for any new claim IDs; **NO new Server GENERAL_WEB code** recommended for sitelinks |

### 3) Open Library / VIAF external-URL fields (typed soft-ref style) — **hosts already in stack**

| Field | Sketch |
|-------|--------|
| **OL today** | search + author `remote_ids` → `viaf:` / `qid:` / `ol:` soft-refs · **not** author website / links harvest |
| **VIAF today** | AutoSuggest → registry findings + typed soft-refs · **not** external personal/org URLs |
| **Input → output (proposed)** | OL author JSON `links` / website-like fields (if present) **or** VIAF source-link fields → gated https non-registry URLs → `url_candidate` UNKNOWN **or** stay soft-ref-only |
| **Budget caps** | ≤2 detail fetches · ≤3 URL emits · reuse `assertAdapterFetchUrl('openlibrary'|'viaf')` · cite provenanceUrl = OL/VIAF record |
| **C1 risk** | Low–med · must **not** mint SAME-ENTITY from link label; registry self-URLs stay dropped |
| **Depends on Acc/QA green** | Yes · useful when WP thin but bibliographic authority rich |
| **Arch lock?** | **YES** (emit shape: GENERAL_WEB vs authority family · flag story) · Arch glance already lists “OL author links deepen” as rank 3 |

### 4) Curated public directory APIs already allowlisted

| Field | Sketch |
|-------|--------|
| **In repo allowlist today** | `wikidata` · `openlibrary` · `wikipedia` (lang subdomains) · `viaf` · `web_origin` (gated fetches) |
| **Not in allowlist** | DuckDuckGo / ORCID / other directories — **do not invent hosts** that break SSRF |
| **Leverage** | Prefer deepen **existing** hosts (options 1–3) before new provider IDs |
| **C1 / caps** | N/A until a concrete API is Arch-locked |
| **Arch lock?** | **YES** before any new host string in `adapterContract.js` |

### 5) Arch-suggested Adapter-2 candidates (from glance fill.1.1) — **evaluate, not adopt**

Arch glance (`ARCH-GLANCE-L2-FILL-1.1-ארכיטקט-2026-09-24.md`) ranked:

1. **DuckDuckGo Instant Answer JSON** (`api.duckduckgo.com` RelatedTopics FirstURL) — structured API · not HTML SERP  
2. **ORCID** public person search → biography URLs  
3. OL author links deepen (overlaps option 3)

| Field | Sketch |
|-------|--------|
| **Input → output (DDG IA)** | name → IA JSON RelatedTopics FirstURL[] → gate → ≤5 UNKNOWN url_candidate |
| **Budget caps** | ≤1 IA call · ≤5 URLs · same C1/cite · new provider allowlist row required |
| **C1 risk** | Med — IA snippets/titles tempting for over-claim; force UNKNOWN + why-found |
| **SSRF** | **`api.duckduckgo.com` / ORCID hosts NOT in `adapterContract` today** → must Arch-lock + allowlist before Server |
| **OUT clarity** | DDG **HTML SERP scrape** remains **OUT**; IA JSON is a different shape — still needs FILL-SPEC |
| **Depends on Acc/QA green** | **YES** — only if coverage PARTIAL after fill.1.1 rerun |
| **Arch lock?** | **YES (hard)** — new Adapter-2 FILL-SPEC · new flag or same GENERAL_WEB · separate Preview |

---

## Explicitly OUT (unchanged)

- Commercial / HTML **SERP scrape** (Bing/Brave/DDG HTML)
- Common Crawl / random domain crawl / link-follow beyond cited API rows
- F11 registries / filings / news families LIVE
- Flipping TREATMENT Preview `dpl_J92G9…` or global Preview env flags
- Promote / Core lookup-gate / SSRF / Acc scrub / Domain commit changes in this prep

---

## Recommendation (Server stance)

1. **HOLD CODE** until Acc/QA on `dpl_CJPdnz…` + Arch glance fill.1.1 acknowledgment + **Chief GO**.  
2. If rerun is **green on honesty** but **PARTIAL on coverage**: prefer **smallest delta** first — (1) locale expand **or** (3) OL links deepen on **existing** allowlist — before new hosts (DDG IA / ORCID).  
3. If Arch locks Adapter-2 DDG IA: Server implements only after FILL-SPEC + allowlist + unit pack · flag OFF · separate Preview · TREATMENT frozen.  
4. Wave 1 product DONE still **not** claimed by Adapter-1 alone until reliable name→unknown-domain measure closes.

---

## **HOLD CODE until Acc/QA on dpl_CJPdnz… + Arch glance fill.1.1 + Chief GO.**

**promote:** false · **TREATMENT:** untouched · **docs only this commit**
