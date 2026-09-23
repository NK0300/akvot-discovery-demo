# 06 — URL-ORIGIN INTEGRATION · Chief Gate F

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT `06-URL-ORIGIN-INTEGRATION.md` · C1 Evidence Pack (Bound, SEMANTIC-CONTRACT, SECURITY-BOUNDS) · AS-IS `webOrigin.js`  
**Preserve:** C1-PATCHED Bound FROZEN · PROMOTE HOLD

---

## 1. When UrlOriginStage executes

| Trigger | Phase | Notes |
|---------|-------|-------|
| seedClass ∈ {url, domain} OR `looksLikeUrlOrHostname(seed)` | **Early** (before/alongside primary DISCOVER for other families) | Intent `DISCOVER_OFFICIAL_WEB_ORIGIN` |
| Finding URLs collected + budget + plan revision/EXPAND | **Late optional one-hop** | maxUrls cap; **no recursion** |
| Preview flag OFF | Does not run (B0 path) | Kill-switch |
| urlSafety fail | Never fetches | failureClass blocked_url / unsafe_url |

---

## 2. What it CAN discover

- Canonical URL node  
- Domain / registrableDomain node  
- Page metadata (title, og, siteName) as Evidence (`metadata_only`)  
- Document-like header/meta fields (still not identity)  
- Soft-fail / blocked / empty failure classes  

---

## 3. What it CANNOT conclude

- SAME-ENTITY / SAME-REFERENCE from URL alone  
- Domain ownership / WHOIS→identity  
- Recursive crawl frontier / browser automation  
- Mint typed soft-refs (`web_origin:` attach keys)  
- Acc-forbidden identities from meta  
- Silent identity upgrade via pipeline placement (“early” ≠ “more true”)

---

## 4. Metadata → evidence

```text
urlSafety.assertSafePublicHttpsUrl
  → fetch (maxRedirects, maxResponseBytes)
  → extract meta
  → Evidence { extractionMethod: origin_metadata, evidenceStrength: metadata_only }
  → Finding with relationshipState per Bound (typically UNKNOWN)
  → graph nodes url/domain + unknown/derived-from edges
```

Untrusted content handling: og/title = untrusted; ceiling POSSIBLE-MATCH for lexical overlap; Acc scrub; poison patterns gated (SoT 12 · C1).

---

## 5. UNKNOWN propagation

- URL-alone → UNKNOWN (FROZEN)  
- Useful findings may remain UNKNOWN (SoT 06 Progressive)  
- UNKNOWN propagates to graph `unknown` edges and SSE relationshipLabelCounts  
- Never coerce to FALSE or SAME-*

---

## 6. Preserve C1 Bound (checklist)

| Rule | Gate |
|------|------|
| URL/hostname/domain alone → UNKNOWN | BAD_URL_ALONE_SAME=0 |
| web_origin never mints typed soft-refs for attach | assert |
| SAME-ENTITY = 0 under experimental lanes | assert |
| Seed-is-URL self-cite → UNKNOWN provenance | assert |
| C1-PREPATCH URL-alone SAME-REFERENCE = KEEP FAIL | regression pack |
| One-hop max; no crawl | budget + non-goals |
| SSRF suite PASS | urlSafety |

---

## 7. Migration note

Elevate C1 from “extra provider + post-batch hop” to **planned stage** behind Preview (`SoT 16`). B0 production remains without web_origin until Chief promote GO. **This pack does not promote or re-implement.**
