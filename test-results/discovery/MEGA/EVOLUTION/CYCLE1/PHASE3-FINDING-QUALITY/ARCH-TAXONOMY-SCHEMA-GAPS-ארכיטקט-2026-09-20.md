# ARCH-TAXONOMY-SCHEMA-GAPS — Finding Quality · CYCLE1 PHASE3 · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T09:50:51+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DOCS ONLY · NO code · NO promote · NO schema file edits  
**Locks:** Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED** · Discovery B0 alias `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Inputs:** Phase2 `OBSERVATION-SUMMARY` (PG-01..04) · `ARCH-BLINDSPOTS` (BS-OBS-RANK) · `finding.schema.json` · `evidence.schema.json` · `api/lib/discovery/emit.js` + `store.js` field shapes (skim)

> Purpose: map **finding taxonomy** → **current Finding/Evidence schema + emit fields**, list what a **Quality ScoreCARD** cannot yet express, and recommend **additive** schema fields (docs only — no impl).

---

## 1. Taxonomy vocabulary (Phase3 Quality)

| Class | Meaning (Quality ScoreCARD) | Typical Phase2 signal |
|-------|-----------------------------|------------------------|
| **duplicate** | Same evidence fingerprint / same provenance+quote+provider collapsed or re-emitted as identical finding | Observation `duplicateRateMean=0` (post-dedupe); merge happens in `dedupeByEvidenceFingerprint` |
| **near-dup** | Distinct evidenceIds but same title/soft-ref + overlapping quote/host family; should cluster, not double-count | S02/S03 flat same-title lists; no near-dup edge today |
| **contradiction** | Competing claims / multi-domain same-label groups that must surface, not collapse (INFORMATION≠IDENTITY) | Session `contradictions[]` (`same_title_multi_domain`); S02 contr≈1; S10 conflict lost when registries error |
| **no-evidence** | Finding (or claim) with zero surviving Evidence after Acc scrub / cite-or-drop | Schema + emit **forbid** emit: filtered out; Observation `unsupportedMean=0` / coverage=1.0 is **vacuous when empty** |
| **weak** | Low evidence strength / thin quote / single shallow registry hit / low discoveryScore | `scoreFinding` + `ranking.factors` exist at runtime; no quality class enum |
| **single-source** | Exactly one provider **and/or** one provenance host family | Inferable from `providers.length===1` / `ranking.factors.domains.length===1`; S10 domains≈1 |
| **multi-source** | ≥2 independent providers **or** ≥2 independent hosts (corroboration) | `providers[]`, `evidenceIds[]`, `ranking.factors.providerDiversity` / `domains` — but **independence** of hosts not modeled (PG-01 monoculture) |

---

## 2. Current schema + emit field shapes (as-of B0)

### 2.1 `finding.schema.json` (strict)

**Required:** `id`, `kind`, `title`, `evidenceIds` (minItems:1), `providers` (minItems:1)  
**Optional:** `summary`, `facetHints[]`, `entityRefs[]`, `scoreFinding` (0..1)  
**`additionalProperties`: false**

| Field | Role vs taxonomy |
|-------|------------------|
| `evidenceIds` | Cite-or-drop anchor; enables multi-evidence count; **cannot be empty** in schema |
| `providers` | Source mix; proxy for single- vs multi-source |
| `scoreFinding` | Scalar rank remnant; not a quality class |
| `kind` / `facetHints` / `entityRefs` | Faceting / soft refs — not quality taxonomy |

**Not in schema:** `ranking`, quality class, relation links, contradiction refs, language, independence flags.

### 2.2 `evidence.schema.json` (strict)

**Required:** `id`, `provenanceUrl`, `providerId`, `retrievedAt`  
**Optional:** `quote`, `contentType`, `licenseHint`, `robotsOk`  
**`additionalProperties`: false**

| Field | Role vs taxonomy |
|-------|------------------|
| `provenanceUrl` + `providerId` | Identity of source; dedupe fingerprint inputs |
| `quote` | Strength / near-dup similarity signal (unlabeled) |
| `retrievedAt` | Freshness (used in runtime ranking, not schema-typed as quality) |

**Not in schema (but present on live B0 emit):** `url`, `domain`, `evidenceType` — runtime extras beyond frozen schema.

### 2.3 Runtime emit / store (skim) — beyond schema

From live GET (e.g. S02) and `store.js` / `emit.js`:

| Surface | Shape | Taxonomy relevance |
|---------|-------|--------------------|
| `finding.ranking` | `{ discoveryScore, identityScore:null, factors:{ authority, corroboration, directness, freshness, httpsOnly, providerDiversity, evidenceCount, domains[] }, rationale }` | Explains weak / single / multi **scores**; not a taxonomy label |
| `evidence.domain` / `url` / `evidenceType` | Host + type | Domain monoculture (PG-01); missing from schema |
| `session.contradictions[]` | `{ type, title, findingIds[], domains[], note }` | **Contradiction** class at session level; scrubbed by `scrubContradiction` in `emit.js` |
| Dedupe merge | `dedupeByEvidenceFingerprint` merges same FP → union providers/evidenceIds | **Duplicate** absorbed silently — no leftover `qualityClass=duplicate` |
| Acc emit filter | Drop findings with no surviving `evidenceIds` ∩ evidence | **no-evidence** never emitted as labeled row |
| `relationship.schema.json` | Entity edges only (`works_at`, …) | **Not** finding↔finding near-dup / contradiction edges |

---

## 3. Representability matrix (today)

| Taxonomy class | Representable today? | How (schema / emit / heuristic) | Gap severity for ScoreCARD |
|----------------|----------------------|----------------------------------|----------------------------|
| **duplicate** | **Partial (behavior only)** | Exact FP merge in store; Observation measures `dup_rate` externally | **High** — no durable label / count of merges / survivor id |
| **near-dup** | **No** | Same-title groups appear only inside `contradictions` when ≥2 domains; title-collision within one domain unmarked | **High** |
| **contradiction** | **Partial (session only)** | `contradictions[]` emit; **not** on Finding schema; type enum not schema-frozen | **Medium–High** (PG-03) |
| **no-evidence** | **No (as labeled finding)** | Schema requires ≥1 evidenceId; emit drops orphans; empty sessions look “covered” | **High** for ScoreCARD honesty (coverage paradox) |
| **weak** | **Partial (score only)** | `scoreFinding` + `ranking.factors`; no threshold / class / reason codes | **Medium** |
| **single-source** | **Yes (inferable)** | `providers.length===1` and/or `factors.domains.length===1` | **Low** as count; **Medium** if “independent host” required |
| **multi-source** | **Yes (inferable, overstated)** | `providers` / `providerDiversity` / `domains` | **High under PG-01** — registry family ≠ independent web corroboration |

**ScoreCARD blockers in one line:** cannot tag near-dup / labeled no-evidence / merge survivors; contradiction not first-class on Finding; multi-source overcounts same-family registries; ranking object + evidence.domain are **schema-illegal** under `additionalProperties:false` if validated strictly.

---

## 4. Relation to PG-01..04 and BS-OBS-RANK

| ID | Product / blind-spot claim | Schema/taxonomy implication |
|----|----------------------------|-----------------------------|
| **PG-01** Source-domain monoculture | domains_mean≈1.34; rich seeds stay in {wikidata, wikipedia, openlibrary} | Need **independence / hostFamily** on Evidence + ScoreCARD factor `independentHostCount` — today’s `providerDiversity` overstates corroboration |
| **PG-02** Keyword/context under-resolve | Empty / unstable traps (S11–S16) | Need **resolutionClass** / **intentFit** (or weak+no-hit reasons) — Finding schema has no “why empty / why weak” |
| **PG-03** Ambiguity & conflict not first-class | Flat lists; contradictions thin | Formalize **Contradiction** (+ optional **AmbiguityCluster**) schemas; link findings via `relation` / `clusterId` — not only session bag |
| **PG-04** HE path EN-registry biased | S07 bilingual titles but EN domains | Need `language` / `localeCoverage` on Evidence (and optional Finding) for multilingual ScoreCARD |
| **BS-OBS-RANK** Ranking/diversity obs gap | No durable metrics for mix, diversity≥N, rank histograms, narrow deltas | ScoreCARD fields below are the **metric contract** Arch hands Strategy · שרת; obs hooks must emit class counts + factor histograms (still docs-only here) |

Phase2 metrics useful as ScoreCARD baselines (not schema): findings μ/p50/p90, domains μ, dup_rate μ=0, evidenceCoverage μ=1.0 (vacuous), unsupported μ=0, Acc leakage=0.

---

## 5. Recommended additive schema fields (DOCS ONLY — no impl)

> Additive · optional · backward-compatible intent. Do **not** implement in Phase3. Keep Acc cite-or-drop and INFORMATION≠IDENTITY.

### 5.1 Finding — quality / taxonomy extensions

| Field | Type (proposed) | Purpose |
|-------|-----------------|---------|
| `qualityClass` | enum: `duplicate` \| `near_dup` \| `contradiction_member` \| `no_evidence` \| `weak` \| `single_source` \| `multi_source` \| `ok` | Primary ScoreCARD label (multi-label via array alt: `qualityTags[]`) |
| `qualityTags` | `string[]` (same enum) | Prefer **array** so a finding can be `weak` + `single_source` |
| `qualityScore` | number 0..1 | Explicit Quality ScoreCARD scalar (**≠** identity; may mirror or refine `scoreFinding`) |
| `qualityReasons` | `string[]` | Machine-stable reason codes (`thin_quote`, `single_registry_family`, `merged_fingerprint`, …) |
| `nearDupOf` | `string[]` (finding ids) | Near-dup cluster edges without identity collapse |
| `duplicateOf` | `string` \| null | Survivor id if this row was merged/suppressed |
| `contradictionIds` | `string[]` | Refs into formal Contradiction objects |
| `clusterId` | `string` | Ambiguity / same-label cluster (PG-03) |
| `ranking` | object (freeze runtime shape) | Promote live `ranking` into schema so validators stop rejecting ScoreCARD explainability |
| `sourceIndependence` | `{ providerCount, hostCount, hostFamilies[], independentHostCount }` | Fixes PG-01 overstated corroboration |

### 5.2 Evidence — strength / provenance extensions

| Field | Type (proposed) | Purpose |
|-------|-----------------|---------|
| `domain` | string | Freeze runtime host (already emitted) |
| `evidenceType` | string | Freeze runtime type |
| `language` | string (BCP-47) | PG-04 multilingual ScoreCARD |
| `strengthClass` | enum: `strong` \| `moderate` \| `weak` \| `unstated` | Evidence-side weak/no-quote |
| `hostFamily` | string | e.g. `wikimedia`, `openlibrary`, `gov_il` — independence grouping |
| `quoteChars` | number | Weakness / near-dup feature without storing more PII |

### 5.3 New small schemas (session-level)

| Schema | Required sketch | Purpose |
|--------|-----------------|---------|
| **Contradiction** | `id`, `type`, `findingIds` (min 2), `domains`?, `note`? | Freeze emit `contradictions[]`; extend `type` beyond `same_title_multi_domain` later |
| **QualityScorecard** (session aggregate) | `sessionId`, `countsByClass`, `domainsMean`, `independentHostsMean`, `contradictionCount`, `nearDupClusterCount`, `vacuousCoverage`, `accLeakage` | Durable Strategy / BS-OBS-RANK contract |

### 5.4 Finding↔Finding relations (optional, separate from entity `relationship.schema`)

| Field / type | Purpose |
|--------------|---------|
| `findingRelation.type` enum: `near_dup_of` \| `duplicate_of` \| `contradicts` \| `same_cluster` | Do **not** overload entity Relationship edges |
| `fromFindingId` / `toFindingId` + `evidenceIds?` | Traceable; Acc-scrubable |

### 5.5 Explicit non-goals (Phase3)

- No identity confidence fields · no dossier/faces · no Core touch · no promote  
- Do not weaken `evidenceIds` minItems for *emitted* findings; if ScoreCARD needs **no-evidence** rows, use a separate `droppedClaims[]` / `qualityEvents[]` channel rather than violating cite-or-drop on Findings  
- Do not treat same-title multi-domain as identity merge

---

## 6. Quality ScoreCARD — target columns (docs contract)

| Column | Source today | After additive fields |
|--------|--------------|------------------------|
| Class histogram (7 classes) | Heuristics only / mostly missing | `qualityTags` + session Scorecard counts |
| Multi-source rate | `providers` / `providerDiversity` | `sourceIndependence.independentHostCount ≥ 2` |
| Single-source rate | infer | `qualityTags` includes `single_source` |
| Contradiction rate | `contradictions.length` | + per-finding `contradictionIds` |
| Near-dup cluster rate | **absent** | `clusterId` / `nearDupOf` |
| Duplicate merge rate | Observation external | `duplicateOf` + merge events |
| Weak rate | score thresholds ad hoc | `weak` tag + `strengthClass` |
| No-evidence / unsupported | vacuous coverage=1.0 | `qualityEvents` / dropped channel — **not** fake Findings |
| Language coverage | titles peek only | `evidence.language` |
| Acc leakage | measured 0 | unchanged gate |

---

## 7. Ownership / next (still HOLD promote)

| Work | Owner | Gate |
|------|-------|------|
| Freeze additive field list into Pack appendix | **ארכיטקט** | This doc |
| Schema PR (finding/evidence/contradiction/scorecard) | Future Source/Strategy · שרת | After Chief allows code cycle — **not now** |
| Emit + rank hooks for class tags + obs histograms | Strategy · שרת (BS-OBS-RANK) | Metrics ≠ identity |
| Golden checks for class histograms on corpus | **בודק** | Dual-run stable |
| Acc on new fields (ids/quotes/domains) | **דיוק** | leakage=0 |

**Promote:** **HOLD**  
**Core:** untouched  
**Phase3 schema gaps (docs):** **DONE**

---

## Cite index

```
EVOLUTION/CYCLE1/PHASE2-OBSERVATION/OBSERVATION-SUMMARY.md          (PG-01..04, metrics)
EVOLUTION/CYCLE1/PHASE2-OBSERVATION/ARCH-BLINDSPOTS-ארכיטקט-2026-09-20.md  (BS-OBS-RANK)
EVOLUTION/CYCLE1/PHASE2-OBSERVATION/AGGREGATES.json
test-results/discovery/schemas/finding.schema.json
test-results/discovery/schemas/evidence.schema.json
test-results/discovery/schemas/relationship.schema.json
api/lib/discovery/emit.js     (scrubFinding / scrubEvidence / scrubContradiction)
api/lib/discovery/store.js    (dedupeByEvidenceFingerprint / explainRanking / detectContradictions)
```

**Report path:**  
`/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE3-FINDING-QUALITY/ARCH-TAXONOMY-SCHEMA-GAPS-ארכיטקט-2026-09-20.md`
