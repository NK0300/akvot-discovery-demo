# 01 — SOURCE CAPABILITY MATRIX (שרת)

**Stamp:** 2026-09-20 IL (Asia/Jerusalem, UTC+3)  
**Agent:** שרת · CYCLE1 SOURCE & DISCOVERY GAP ANALYSIS  
**Mode:** DOCS ONLY · NO code · NO deploy · NO promote · NO EXP-B  
**SoT:** `api/lib/discovery/providers.js` · `orchestrator.js` (`providerMs: 3500`)  
**Locks:** B0 Discovery `dpl_Avyhr…` · Core `dpl_8ag…` LOCKED · A2 CLOSED EXPERIMENTAL-BASELINE

> Live vs absent adapters for Discovery. Sidecar: `01-SOURCE-CAPABILITY-MATRIX-שרת.json`.

---

## Runtime summary

| Lane | Adapters |
|------|----------|
| **B0 / Production** (`DEFAULT_PROVIDERS`, VIAF flag unset) | `wikidata` · `openlibrary` · `wikipedia` |
| **Preview (flag)** `DISCOVERY_ENABLE_VIAF=1` | above + `viaf` |
| **Absent** | `viaf` on B0 · `web_public` (interface-only / no crawler) |

---

## Capability matrix

| id | endpoint | entity types | auth | rate / budget | soft-fail | cost class | HE support | typed refs emitted (qid / viaf / ol) | known failure modes (forensics) |
|----|----------|--------------|------|---------------|-----------|------------|------------|--------------------------------------|----------------------------------|
| `wikidata` | `wikidata.org/w/api.php` `wbsearchentities` (+ optional `wbgetentities` P214) | person_name · org · doc (registry / QID) | none | `budgetMs` default **3000** (orchestrator **providerMs 3500**); search **limit=8** | search catch → `partial`+errors; **P214 enrich soft-fails** (hits kept) | public free | lang from `locale` (`he` ok on API) | **qid:** always; **viaf:** from P214 batch when present | **S04:** provider status=`error` → zero WD / zero qid bridges; P214 empty on company QIDs (e.g. Stripe Inc); related-QID flood dilutes multi denominator |
| `openlibrary` | `openlibrary.org/search/authors.json` (+ author `.json` remote_ids) | person_name · org · doc (**authors-only**) | none | budget **3000**/orch **3500**; search **limit=8**; remote_ids enrich **top 6** | search catch → partial; **per-author enrich soft-fail** | public free | query passthrough (no dedicated HE host) | **ol:** always; **viaf:** / **qid:** iff `remote_ids` present | **S04:** `ol_no_remote_ids` ×8 — family-local only; string-match noise on company seeds; works/subjects not searched |
| `wikipedia` | `{en\|he}.wikipedia.org/w/api.php` OpenSearch | person_name · org · doc (page) | none | budget **3000**/orch **3500**; **limit=6** | search catch → partial | public free | **yes** — `locale` lang=`he` → `he.wikipedia.org` else `en` | **wp:{lang}:{title} only** — **no qid/viaf/ol** | **WP wp:-only** (Bound#1): cannot cross-family join; S01/S04/S05 `singleton_wp_no_typed`; HE host thin in DOMAIN_AUTHORITY (default 0.4) |
| `viaf` | `viaf.org/viaf/AutoSuggest` | person_name · org · doc (authority registry) | none | budget **3000**/orch **3500**; Autocomplete **n≤8**; nametype filter personal/corporate/geographic | search catch → partial | public free | query passthrough (Latin-heavy corpus) | **viaf:** always; **qid:** only when AutoSuggest emits WKP | **Preview flag only** · **absent on B0**; S04 `viaf_family_local_no_wkp` ×8; Autosuggest misses peers (S05 Q7178 P214 no peer); lexical homonyms |
| `web_public` | — (none) | — | — | — | — | — | — | — | **ABSENT** · interface-only / no crawler · Acc+Security co-bound if ever implemented |

---

## B0 vs Preview emit

| Provider | B0 emit | Preview (VIAF=1 / A2-safe) |
|----------|---------|----------------------------|
| wikidata | yes | yes |
| openlibrary | yes | yes |
| wikipedia | yes | yes |
| viaf | **no** | **yes** (flag) |
| web_public | **no** | **no** |

---

## Forensics-backed failure anchors (immutable rates)

From `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/01-FORENSICS-S01-S04-S05-שרת.md` (A2-safe Preview):

| Seed | Headline failure | Adapter implication |
|------|------------------|---------------------|
| **S04 Stripe** | WD=`error`; OL remote_ids miss; WP wp:-only; VIAF family-local | No shared typed key → multi=0 (AUTHORITY / SOURCE COVERAGE — not fake-recovery target) |
| **S05 Red Cross** | Sparse cross-family; Q7178 P214 unsupported (no VIAF peer) | Bare coalesce (~0.17); CROSS-ENTITY / AUTHORITY-GRANULARITY |
| **S01 TBL** | Rich qid∩viaf∩ol | Coalesce success path when all three bridges exist |

---

## HOLD

NO EXP-B · NO further multi optimization · NO fake S04/S05 recovery · historical metrics immutable · wait Arch lead merge + Chief GO.
