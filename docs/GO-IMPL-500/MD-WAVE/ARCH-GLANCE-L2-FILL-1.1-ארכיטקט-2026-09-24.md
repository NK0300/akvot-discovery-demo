# Arch glance · L2 GENERAL_WEB fill.1.1 · `fcd8cb2` · Preview `dpl_CJPdnzg…` · 2026-09-24

**Who:** ארכיטקט  
**Against:** FILL-SPEC + Arch upgrade-then-re-gate ACK · Server follow-up note  
**Verdict:** **CONSISTENT / PASS** · **NO PROMOTE** · Wave 1 product **NOT DONE** until Acc/QA rerun closes honest

---

## Checklist

| Lock | Result |
|------|--------|
| `tryUpgradeHttpToHttps` same-host/path only | **MET** |
| Raw http never passes gate | **MET** |
| Re-gate via `assertSafePublicHttpsUrl` + registry drop | **MET** |
| Dedicated GWS budget + dispose · parent abort honored | **MET** |
| One transient OpenSearch retry · 4xx not retried | **MET** |
| Version `2026-09-24.fill.1.1` · stub.1 contract kept | **MET** |
| Flag default OFF · TREATMENT untouched | **MET** (per Server) |
| No SERP/crawl/F11 | **MET** |
| Unit tests | **66/0** re-confirmed locally |

Chief TBL smoke cite (≥1 `url_candidate` info.cern.ch · UNKNOWN · identityClaim=false) aligns with upgrade RCA.

---

## Next exceed path (if Acc/QA PARTIAL on coverage returns)

Honesty/C1 already strong. Coverage hole = seeds with **no useful WP extlinks** (or MW flaky). Propose **one** next bounded adapter (flag-new, default OFF) — pick after rerun:

| Rank | Adapter-2 | Why | Hard no |
|------|-----------|-----|---------|
| **1** | **DuckDuckGo Instant Answer JSON** (`api.duckduckgo.com` RelatedTopics FirstURL) | Structured public API · no HTML scrape · same C1/cite/caps contract | No HTML SERP · no crawl |
| 2 | ORCID public person search → biography URLs | Scholarly name→URL when WP thin | No login walls |
| 3 | Open Library author links deepen (existing host) | Reuse allowlist | No new F11 family |

Do **not** open F11 filings/news until Adapter-2 measure. Keep Wave 1 TREATMENT (`dpl_J92G9…`) frozen.

---

**Execute:** Acc/QA/soft on `dpl_CJPdnzg…` only. Arch standby for PARTIAL → Adapter-2 FILL-SPEC.
