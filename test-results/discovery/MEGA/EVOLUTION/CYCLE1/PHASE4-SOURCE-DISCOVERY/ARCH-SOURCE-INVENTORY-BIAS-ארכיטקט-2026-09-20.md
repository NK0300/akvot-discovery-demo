# ARCH-SOURCE-INVENTORY-BIAS — Discovery Evolution CYCLE1 PHASE4 · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T09:53:57+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DOCS ONLY · Source Discovery inventory + bias map  
**Policy:** NO code · NO promote · Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED · Discovery B0 alias `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**QD locked (Phase3):** QD-01 monoculture · QD-02 near-dup · QD-03 shallow contradictions · QD-04 coverage · QD-05 pub noise / HE thin  

> Inventory of what the architecture *declares*, what B0 *actually emits*, and why QD-01 / HE-thin / wiki-heavy are structural — not accidental run noise.

---

## 1. Inventory — providers / adapters declared in code

**SoT:** `api/lib/discovery/providers.js` · wired by `orchestrator.js` via `opts.providers || DEFAULT_PROVIDERS` · re-exported from `api/lib/discovery/index.js`.

| id | Export | capabilities | robotsPolicy | authMode | Public-only? | Endpoint / shape | Limits | Notes |
|----|--------|--------------|--------------|----------|--------------|------------------|--------|-------|
| `wikidata` | `wikidataProvider` | `person_name`, `org`, `doc` | `respect` | `none` | **Yes** | Wikidata `wbsearchentities` JSON | limit=8 | kind=`registry`; provenance `wikidata.org/wiki/Q…`; facet `provider:wikidata` |
| `openlibrary` | `openLibraryProvider` | `person_name`, `org`, `doc` | `respect` | `none` | **Yes** | Open Library `/search/authors.json` | limit=8 | kind=`registry`; **authors-only** search (not works/subjects); facet `provider:openlibrary` |
| `wikipedia` | `wikipediaOpenSearchProvider` | `person_name`, `org`, `doc` | `respect` | `none` | **Yes** | MediaWiki OpenSearch | limit=6 | kind=`page`; host = `he.wikipedia.org` **iff** `locale` lang slice === `he`, else **`en.wikipedia.org`** |

**Runtime default set:**

```text
DEFAULT_PROVIDERS = [wikidataProvider, openLibraryProvider, wikipediaOpenSearchProvider]
```

**Declared but NOT in runtime adapters (BS-PROV):**

| Pack / map id | Runtime status | Public-only intent |
|---------------|----------------|--------------------|
| `viaf` | **Absent** — no adapter in `providers.js`; not in `DEFAULT_PROVIDERS` | Would be public registry (Pack v1.0) |
| `web_public` | **Interface-only** (Phase A freeze) — no concrete crawler adapter | Public web; Acc/Security co-bound when implemented |

**Non-provider helpers in same module:** `softEntityResolve(seed)` — opaque seed hash only; not a SearchProvider.

**Related ranking authority table** (`store.js` `DOMAIN_AUTHORITY`) — discovery ranking weights, not identity:

| Domain | Weight |
|--------|-------:|
| `www.wikidata.org` / `wikidata.org` | 0.9 |
| `openlibrary.org` | 0.75 |
| `en.wikipedia.org` | 0.7 |
| `www.wikipedia.org` | 0.65 |
| `*.gov` / `*.gov.il` (fallback heuristic) | 0.85 |
| `*.edu` | 0.7 |
| default | 0.4 |

**Note:** `he.wikipedia.org` is **not** in `DOMAIN_AUTHORITY` — would fall through to default **0.4** if ever emitted. `.gov`/`.edu` weights exist but **no provider emits those hosts** on B0.

---

## 2. What B0 emit evidence shows is actually used

**Lane:** Discovery alias B0 `dpl_Avyhr…` · Core untouched.  
**Corpora cited:** PHASE2 golden 16×2 · PHASE3 scorecard · PHASE4 `raw/source-analysis.json` (244 finding instances across GET payloads).

### 2.1 Providers observed on emit

| Provider id | Finding instances (PHASE4 source-analysis) | Seeds touched (examples) | Status signals (PHASE2 AGGREGATES) |
|-------------|--------------------------------------------|--------------------------|-------------------------------------|
| `openlibrary` | **98** | S01–S05, S08, S10 | often `ok` / `partial`; sole survivor on S10 when WD/WP `error` |
| `wikidata` | **80** | S01–S08 | frequently `partial` (hit limit) or `ok`; `error` on S10 |
| `wikipedia` | **66** | S01–S07, S11 | `ok` / `partial`; `error` on S10 |

**Not observed on any B0 emit:** `viaf`, `web_public`, inject-only lab providers, `he.wikipedia.org` host.

### 2.2 Domain / family mix (actual)

| Domain | n | Family |
|--------|--:|--------|
| `openlibrary.org` | 98 | openlibrary |
| `www.wikidata.org` | 80 | wikimedia |
| `en.wikipedia.org` | 66 | wikimedia |

| Metric | Value | Cite |
|--------|------:|------|
| PHASE2 `domainsMean` | **1.34** (p50=1) | `AGGREGATES.json` / `OBSERVATION-SUMMARY.md` |
| PHASE3 Diversity score | **15.0** | `FINDING-QUALITY-SCORECARD.md` |
| Single-source rate (family) | **1.0** (244/244) | `SINGLE-SOURCE.json` |
| Multi-independent-source rate | **0.0** | `MULTI-INDEPENDENT-SOURCE.json` |
| PHASE4 `single_family_rate` | **1.0** | `raw/source-analysis.json` |
| PHASE4 `multi_family_finding_rate` | **0.0** | same |
| PHASE4 `multi_provider_finding_rate` | **0.0** | same (per-finding evidence almost always one provider) |
| Mean `ranking.factors.providerDiversity` | **~1.0** on sampled seeds | source-analysis per-seed |
| Kinds | registry **178** · page **66** | source-analysis |
| Acc leakage | **0** | PHASE2/3/4 |

### 2.3 HE / multilingual peek (S07)

| Field | Observed |
|-------|----------|
| Seed | `בנימין נתניהו` |
| Findings μ | **2** (both runs) |
| Domains | **`en.wikipedia.org`, `www.wikidata.org` only** — **no** `he.wikipedia.org`, no openlibrary |
| Families | **wikimedia only** (n=1) |
| Titles | EN + HE labels (`Benjamin Netanyahu`, `בנימין נתניהו`) |

→ Native HE host path unused on measured B0 runs (locale default `en` and/or OpenSearch staying on EN wiki). Aligns PG-04 / QD-05 HE thin.

### 2.4 Provider reliability / noise (PHASE4)

| Provider | quote_mean | thin_lt20_rate | heuristic |
|----------|----------:|---------------:|-----------|
| wikidata | 38.3 | 0.26 | high_volume_mixed |
| openlibrary | 43.7 | 0.08 | high_volume_mixed |
| wikipedia | **0.0** | **1.0** | high_volume_mixed (OpenSearch descs often empty → weak/thin) |

**Freshness:** factor_mean **0.9** constant — `retrievedAt` is session-now, **not** source modification time (`source-analysis.freshness.note`).

### 2.5 Unknown / not instrumented

| Gap | State |
|-----|-------|
| Per-provider contribution mix in durable obs meters | **unknown at Strategy level** (BS-OBS-RANK) — batch analysis only |
| True source mtime / publication date | **unknown** (freshness proxy only) |
| Independence of WD↔WP beyond hostFamily heuristic | **modeled as same family `wikimedia`** in Phase3/4 analysis; not a runtime schema field yet |
| Preview-lane provider mix ≠ B0 | Do not mix (BS-DRIFT) — this inventory is **B0 alias only** |

---

## 3. Provider bias map — why QD-01 / HE thin / wiki-heavy are architectural

### 3.1 QD-01 — Source-family monoculture (locked)

| Architectural cause | Mechanism | Effect on emit |
|---------------------|-----------|----------------|
| **Tiny public registry trio** | Only WD + OL + WP in `DEFAULT_PROVIDERS` | Domain universe capped at ≤3 hosts forever |
| **Wikimedia double-count** | WD + WP are separate `providerId`s but **one hostFamily** | `providerDiversity` / corroboration (`providers.size/3`) **overstates** independence; Phase3 multi-independent=**0.0** |
| **BS-PROV gap** | `viaf` omitted · `web_public` interface-only | No non-wikimedia / non-OL public web Evidence |
| **Authority table prestige** | WD 0.9 > OL 0.75 > EN-WP 0.7 | Rank prefers registry monoculture even when snippets thin |
| **No hostFamily in schema** | Phase3 ARCH gap: missing `sourceIndependence` / `hostFamily` | ScoreCARD cannot gate independence; Diversity=15.0 |

**Cite chain:** PG-01 → QD-01 → BS-PROV · PHASE2 domains_mean=1.34 · PHASE3 Diversity=15 · PHASE4 families={wikimedia, openlibrary} only.

### 3.2 Wiki-heavy / registry-heavy

| Cause | Detail |
|-------|--------|
| Dual Wikimedia adapters always on | Every session fans out to WD+WP (+OL) in parallel |
| Hit caps encourage floods | WD≤8, WP≤6, OL≤8 → high findingsCount with same-title near-dups (QD-02 fuel) |
| Wikipedia OpenSearch = titles+empty desc | PHASE4 wikipedia `quote_mean=0` / thin=100% → pages inflate count without Evidence depth (QD-05) |
| Open Library authors-only | Works-about-person / publication noise share person titles (S01 TED/biography pattern in QD-05) |
| Kind mix | **73% registry** (178/244) vs 27% page — dossier feels “official” while still single-family |

### 3.3 HE thin / EN-registry bias (QD-05 partial · PG-04)

| Cause | Detail |
|-------|--------|
| Locale gate is binary `he` vs else→EN | `wikipediaOpenSearchProvider` only switches host when `locale` lang === `he` |
| Measured S07 still on **en.wikipedia.org** | Implies create path used default `locale=en` **or** HE seed resolved via EN index |
| No HE-native providers | No Hebrew news, Knesset, `.gov.il` crawler, Hebrew library — only possible HE surface is he.wikipedia (unused on B0 measure) |
| WD language param | Uses `locale` for label language but provenance remains wikidata.org — EN-registry gravity |
| Authority miss for he.wikipedia | If HE wiki ever emits, weight falls to **0.4** default — disincentivizes non-EN wiki even when present |

### 3.4 Cross-links to other locked QDs (source lens only)

| QD | Source-architecture contribution |
|----|----------------------------------|
| **QD-02** near-dup | Multi-QID / multi-author hits for same normalized title from WD+OL+WP without entity cluster |
| **QD-03** shallow contradictions | `detectContradictions` = same_title_multi_domain; when WD/WP error (S10) conflict signal vanishes — only OL remains |
| **QD-04** coverage hole | Providers are **name/author/opensearch** lookups — no role/alias/URL resolvers → S12–S16 empty despite providers often `ok` |
| **QD-05** pub noise / thin | OL author works + WP empty quotes + short WD descriptions; HE sparse |

---

## 4. Blind spots for Source Quality Model (draft criteria)

**Purpose:** Criteria for a future Source Quality Model / ScoreCARD — **authority-with-evidence**, not prestige. Docs only; no schema impl here (see Phase3 additive field recommendations).

| Criterion ID | Draft definition | Pass intuition (aspirational) | Blind spot today |
|--------------|------------------|-------------------------------|------------------|
| **SQ-IND** Independence | Evidence hosts map to ≥2 **independent hostFamilies** (e.g. wikimedia ≠ openlibrary ≠ viaf ≠ web_public ≠ gov) | multi-independent rate ≥0.25 on rich person/org seeds | WD+WP counted as 2 providers / 1 family; rate=**0.0** |
| **SQ-LANG** Language fidelity | At least one Evidence artifact in seed-locale script/language when locale ≠ en | HE seed → ≥1 `he.*` or clearly HE-bodied source | S07 EN wiki + WD only; no language field on Evidence |
| **SQ-FRESH** Freshness-with-provenance | Prefer source-declared modified/published time; session `retrievedAt` is crawl time only | Factor distinguishes stale registry vs live page | Freshness factor stuck ~0.9; no source mtime |
| **SQ-AUTH-EV** Authority-with-evidence | High authority **only if** quote/structured claim meets length/type floor; prestige domain alone insufficient | Reject rank boost when quote thin or empty | DOMAIN_AUTHORITY boosts WD even when snippet short; WP thin=100% still scored |
| **SQ-COV** Intent coverage | Providers must cover role/alias/URL/compound intents, not only proper-name registry hit | S13–S16 ≥1 grounded finding | Name-lookup adapters → QD-04 empties |
| **SQ-DIV-OBS** Observable diversity | Durable meters: per-provider mix, family cardinality, independentHostCount | Strategy can regress-test Maximum Discovery | BS-OBS-RANK open — analysis JSON ≠ runtime obs |
| **SQ-FAIL-HONEST** Failure honesty | Provider `error`/`partial` must surface as coverage gap, not “no contradiction” | S10-like degradation flagged | Soft failure hides conflict (QD-03) |

**Anti-criteria (explicit non-goals):**

- Prestige of Wikimedia / “official registry” as identity confidence  
- Equating `providers.length` with corroboration  
- Treating empty OpenSearch hits as strong page Evidence  
- Mixing Preview dpl Evidence into B0 Source gates (BS-DRIFT)

**Hand-off to schema (from Phase3, still no impl):** `sourceIndependence{providerCount,hostCount,hostFamilies[],independentHostCount}` · `evidence.hostFamily` · `evidence.language` · qualityTags — Additive only.

---

## 5. Optional minimal experiment design (docs only) — QD-01

**Gate:** Wait **Chief GO** before any code, adapter, or promote. This section is design-only.

### Hypothesis
Adding **one** non-wikimedia, non-openlibrary **independent** public provider (Pack candidate: `viaf` **or** a narrowly scoped `web_public` allowlist) will raise multi-independent-source rate on S01/S04/S05 without Acc leakage.

### Minimal design (no code)

| Item | Spec |
|------|------|
| **Primary QD** | QD-01 (monoculture); secondary watch QD-05 thin rate |
| **Baseline** | B0 alias freeze · Core LOCKED · current PHASE3/4 metrics |
| **Treatment (conceptual)** | Lab Preview lane only: `DEFAULT_PROVIDERS + viaf` **xor** `+ web_public(allowlist)` — never Core |
| **Holdouts** | Seeds S01, S04, S05 (rich); S07 (HE); S09 (no-match control); S10 (conflict) |
| **Success metrics** | (1) multi-independent rate on S01/S04/S05 ≥ **0.25** · (2) domains_mean ≥ **2.0** · (3) Diversity scorecard lift vs 15.0 · (4) Acc leakage **0** · (5) S09 stays empty |
| **Guardrails** | Acc scrub on new evidence shapes · urlSafety · no promote · BS-DRIFT lane tags · BS-OBS-RANK metric hooks before claiming win |
| **Non-goals this experiment** | Fixing QD-02 clustering, QD-04 resolvers, HE-native corpus (separate experiments) |
| **Decision** | If lift fails → bias is ranking/merge not missing adapter; if lift works → Pack provider map update + Source Quality Model SQ-IND gate |

### Sequencing recommendation
1. Close **docs** Source Quality Model criteria (this file §4) with דיוק.  
2. Chief GO → Preview-only adapter spike.  
3. Re-run golden + Phase3 scorecard proxies.  
4. **HOLD promote** until Chief + Acc + Arch glance.

---

## 6. BS-PROV status (Phase4 glance)

| Field | Content |
|-------|---------|
| **ID** | BS-PROV |
| **Still open?** | **Yes** |
| **Runtime** | `viaf` absent · `web_public` interface-only · DEFAULT = WD+OL+WP |
| **Measured impact** | Confirmed by B0 emit: only 3 domains / 2 families; QD-01 locked |
| **Owner** | Source phase · שרת (adapters) · Acc/Security for `web_public` · Arch updates Pack map after GO |
| **Promote** | **HOLD** |

---

## Cite index

```
api/lib/discovery/providers.js
api/lib/discovery/orchestrator.js
api/lib/discovery/store.js          (DOMAIN_AUTHORITY, explainRanking)
api/lib/discovery/index.js
EVOLUTION/CYCLE1/PHASE2-OBSERVATION/ARCH-BLINDSPOTS-ארכיטקט-2026-09-20.md  (BS-PROV)
EVOLUTION/CYCLE1/PHASE2-OBSERVATION/OBSERVATION-SUMMARY.md
EVOLUTION/CYCLE1/PHASE2-OBSERVATION/AGGREGATES.json
EVOLUTION/CYCLE1/PHASE3-FINDING-QUALITY/FINDING-QUALITY-SCORECARD.md
EVOLUTION/CYCLE1/PHASE3-FINDING-QUALITY/QUALITY-GATES-NOTES.md
EVOLUTION/CYCLE1/PHASE3-FINDING-QUALITY/SINGLE-SOURCE.json
EVOLUTION/CYCLE1/PHASE3-FINDING-QUALITY/MULTI-INDEPENDENT-SOURCE.json
EVOLUTION/CYCLE1/PHASE3-FINDING-QUALITY/ARCH-TAXONOMY-SCHEMA-GAPS-ארכיטקט-2026-09-20.md
EVOLUTION/CYCLE1/PHASE4-SOURCE-DISCOVERY/raw/source-analysis.json
```

**Phase4 Arch source inventory / bias: DONE · HOLD promote · wait Chief GO for any provider code.**
