# L4 · Must-Win #2 · wave≥2 + web_origin enrich · שרת · 2026-09-24

**Who:** Backend / שרת  
**SoT:** `ARCH-MUST-WIN-2-WAVE2-ארכיטקט-2026-09-24.md` (**LOCKED**) · parent LOOP-SPINE  
**Status:** **CODE WIRED** · flags **default OFF** · Night Preview separate (`-e` only) · TREATMENT untouched · **NO PROMOTE**  
**Evidence class:** spine journal `wave≥2` · evaluate gates held · not docs-only

---

## What landed

| Piece | Detail |
|-------|--------|
| `nightLoop.js` | Multi-wave `beginWave()` loop up to `maxWaves` (default **3**) · per-wave eligible hops → expand → evaluate → URL-dedupe / enrich-merge → corroborate → `decideStop` |
| Wave-1 | `general_web` then optional `ddg_instant` (unchanged) |
| Wave-2 | `web_origin` when `DISCOVERY_ENABLE_WEB_ORIGIN` ON · ≤**2** evaluate-ok URLs (stable sort by url) · enrich title/snippet/whyFound only · re-`evaluateUrlCandidate` · still `UNKNOWN` · `identityClaim=false` · no SAME-ENTITY · cite-or-drop · ≤2 fetches · wall/AbortSignal · night ledger fetch count |
| Wave-2 flag OFF | wave-2 **still begins** · eligible empty → journal `wave2_no_eligible_hop` → stop `NO_PROGRESS` (honest) |
| Stop fix | Do **not** `ALL_HOPS_SETTLED` after wave-1 alone while `maxWaves>1` and candidates+budget remain |
| Version | `2026-09-24.night.loop.2` |
| Flags | `DISCOVERY_ENABLE_NIGHT` · `DISCOVERY_ENABLE_GENERAL_WEB` · `DISCOVERY_ENABLE_WEB_ORIGIN` — all default **OFF** |
| Orch | passes `enableWebOrigin`; surfaces `spineJournal` (≤80) on `session.nightLoop` |
| Tests | loopSpine/night **67/0** · webOrigin **96/0** · generalWeb **66/0** · orch **113/0** |

---

## Locks honored

| Lock | Status |
|------|--------|
| NO promote | ✓ |
| TREATMENT untouched | ✓ |
| Flags default OFF | ✓ |
| No new HTTP host | ✓ (reuse `webOrigin.js` public hop-validated fetch) |
| No crawl / SERP | ✓ |
| C1 UNKNOWN · identityClaim=false | ✓ |
| OL/ORCID HOLD | ✓ |
| Wave 1 product DONE | **still NO** |

---

## Night Preview measure (`-e` only)

```bash
cd /workspace/akvot-quick-demo
vercel deploy --yes --target=preview \
  -e DISCOVERY_ENABLE_NIGHT=1 \
  -e DISCOVERY_ENABLE_GENERAL_WEB=1 \
  -e DISCOVERY_ENABLE_WEB_ORIGIN=1
```

**Do not** set project Preview env · **Do not** touch TREATMENT · **Do not** promote.

Success smoke: spine journal **`wave≥2`** · evaluate gates held · Acc pw=0 / SAME-from-URL=0.

---

## Code SHA + Preview (filled after deploy/smoke)

| Field | Value |
|-------|-------|
| Code SHA | _pending commit_ |
| Night MW2 dpl | _pending_ |
| Night MW2 URL | _pending_ |
| Deploy env | `-e DISCOVERY_ENABLE_NIGHT=1 -e DISCOVERY_ENABLE_GENERAL_WEB=1 -e DISCOVERY_ENABLE_WEB_ORIGIN=1` |
| Seed | `ABC Construction` (+ parallel e.g. W3C) |
| 5-number pack | _pending smoke_ |

---

## Non-goals (held)

❌ HTML SERP / link-follow crawl / CDX · ❌ New hosts / ORCID / OL deepen · ❌ Identity unfreeze · ❌ Claiming Wave 1 product DONE · ❌ Docs-only “wave” without `beginWave` ≥2 in journal
