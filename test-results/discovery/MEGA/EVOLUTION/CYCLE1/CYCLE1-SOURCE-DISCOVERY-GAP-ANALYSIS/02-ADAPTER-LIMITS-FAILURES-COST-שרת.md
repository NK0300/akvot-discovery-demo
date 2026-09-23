# 02 — ADAPTER LIMITS · FAILURES · COST (שרת)

**Stamp:** 2026-09-20 IL (Asia/Jerusalem, UTC+3)  
**Agent:** שרת · CYCLE1 SOURCE & DISCOVERY GAP ANALYSIS  
**Mode:** DOCS ONLY · NO code · NO deploy · NO promote · NO EXP-B  
**SoT:** `api/lib/discovery/providers.js` · `orchestrator.js`  
**Forensics:** A2 HARDENING pack `01-FORENSICS-S01-S04-S05-שרת.*` · `02-TYPED-REF-AUDIT-שרת.*`

---

## 1. providerMs / budgetMs

| Layer | Value | Behavior |
|-------|------:|----------|
| Orchestrator `budgets.providerMs` | **3500** | Passed as `budgetMs` into each provider `search` |
| Adapter default if unset | **3000** | `budgetSignal(req.budgetMs \|\| 3000)` |
| Session wall (orch) | **12000** | Wall abort → provider `session_budget` / skipped |

Abort → provider returns `partial: true` + error code `timeout` (or http_*) where applicable.

---

## 2. Soft-fail behavior

| Adapter | Search failure | Enrichment failure |
|---------|----------------|--------------------|
| **wikidata** | catch → findings (maybe empty) + `partial` + errors | **P214** batch: catch → search hits **kept**; error logged (`P214 enrich: …`) |
| **openlibrary** | catch → partial + errors | **remote_ids** per author: catch → that author stays ol:-only; others continue |
| **wikipedia** | catch → partial + errors | n/a (no typed enrich) |
| **viaf** | catch → partial + errors | n/a beyond AutoSuggest WKP field parse |

Orchestrator maps batch: ok / **partial** / error → session may become `partial` without dropping other providers.

---

## 3. P214 enrich limits (Wikidata)

- One `wbgetentities` for **all** QIDs from the search batch (≤8).
- Props: `claims` only; extract **P214** numeric VIAF ids → emit `viaf:` soft-refs.
- Soft-fail: timeout/http does **not** discard wbsearch hits.
- Limit implication: entities without P214 (many orgs/companies) never gain viaf bridge from WD alone.
- Forensics: Q200897 (Stripe Inc) P214 empty; S04 WD=`error` → zero P214 path entirely.

---

## 4. AutoSuggest / VIAF limits

- Endpoint: `GET https://viaf.org/viaf/AutoSuggest?query=…` (public JSON).
- Cap: **n ≤ 8** findings after nametype filter (`personal` / `corporate` / `geographic`).
- Typed refs: `viaf:` always; `qid:` only if AutoSuggest hit carries parseable WKP.
- **Not on B0** — gated by `DISCOVERY_ENABLE_VIAF=1` (Preview / A2-safe).
- Failure modes: lexical homonyms (S04 Stripe*); missing WKP → family-local; peer miss when WD has P214 but AutoSuggest did not return that VIAF id (S05 Q7178 / 145680594).

---

## 5. Open Library remote_ids limits

- Search: authors only (`/search/authors.json`, limit 8).
- Enrich: **top 6** author detail fetches for `remote_ids.viaf` / `remote_ids.wikidata`.
- When remote_ids absent → ol:/ol- only → **no cross-family join** (S04 all 8 OL = `ol_no_remote_ids`).
- Cost: +up to 6 public GETs inside same provider budget.

---

## 6. Cost class

| Provider | Cost |
|----------|------|
| wikidata | **public free** API (rate-limit courtesy / User-Agent; no API key in code) |
| openlibrary | **public free** |
| wikipedia | **public free** MediaWiki |
| viaf | **public free** AutoSuggest |
| web_public | n/a (absent) |

No paid crawler, no proprietary KB, no auth secrets in adapter path. Cost risk = latency / provider abort under shared session wall — not $ spend.

---

## 7. Failure-modes inventory (from forensics)

| ID | Class | Adapter(s) | Observed | Product note |
|----|-------|------------|----------|--------------|
| FM-WD-ERR | provider error | wikidata | S04 status=`error` | Zero qid/viaf bridges that seed |
| FM-WD-P214-EMPTY | authority gap | wikidata | companies often lack P214 | No VIAF join even if WD ok |
| FM-OL-NO-REMOTE | enrich miss | openlibrary | S04 ×8 | Family-local ol: only |
| FM-OL-STRING | precision | openlibrary | Stripe* author noise | Authors search ≠ company ER |
| FM-WP-ONLY | typed-ref gap | wikipedia | S01/S04/S05 wp: only | Bound#1 bans title: coalesce |
| FM-VIAF-LOCAL | no WKP | viaf | S04 ×8 | viaf: without qid peer |
| FM-VIAF-PEER-MISS | coverage | viaf + WD | S05 Q7178 | P214 present, AutoSuggest peer absent |
| FM-VIAF-ABSENT-B0 | runtime gap | viaf | B0 DEFAULT | Adapter exists; flag off on B0 |
| FM-WEB-ABSENT | missing adapter | web_public | all lanes | Interface-only |
| FM-ATTACH-DUP | surface noise | coalesce (A2) | S01 viaf id ×8 | Metric/UX duplication — not Acc leak |
| FM-RELATED-QID | denominator | wikidata | S01 talks/works | True independents dilute multi_rate |

**Explicit non-goals (Chief closed A2):** NO fake S04/S05 recovery · NO further multi optimization · NO EXP-B impl this pack.

---

## 8. HOLD

Server inventory for Gap Analysis = **DONE**. Arch-led sections TBD. STOP for Arch lead merge. B0 + Core LOCKED.
