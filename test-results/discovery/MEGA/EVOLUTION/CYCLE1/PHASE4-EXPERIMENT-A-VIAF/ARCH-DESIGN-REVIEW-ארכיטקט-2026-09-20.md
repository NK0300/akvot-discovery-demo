# ARCH-DESIGN-REVIEW — EXP-A VIAF · Discovery Evolution CYCLE1 · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T09:56:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Decision:** **DESIGN REVIEW DONE** · await Preview Evidence  
**Mode:** **DOCS ONLY** · NO code · NO promote  
**Core:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED**  
**Discovery B0 alias:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` **UNCHANGED**

> EXP-A is a narrow, Preview-only source-diversity experiment. This document locks the contract and gates; it does not authorize implementation, deployment, alias movement, or promotion.

---

## 1. Locked decision and scope

| Item | Locked design |
|---|---|
| Provider | **VIAF only** as a public authority-registry `SearchProvider` |
| `authMode` | `none` — no credential, account, token, or private endpoint |
| `robotsPolicy` | `respect` — honor robots/ToS and polite request limits; soft-fail on refusal or error |
| Finding role | VIAF hits are **Findings / registry** with linked public Evidence only |
| Lane | **Preview only**; no Core path and no B0 alias retarget |
| Identity semantics | INFORMATION ≠ IDENTITY; no identity confidence or dossier commit |
| Gate | Chief GO is required before any adapter/code work; Evidence review is required before any promotion discussion |

**Core and B0 are frozen.** No Core edit, schema mutation, production change, or Discovery alias movement is part of EXP-A.

---

## 2. Provider contract (design only)

The adapter, if later authorized, must implement the existing SearchProvider boundary and nothing broader:

```text
providerId:       viaf
kind:             registry
authMode:         none
robotsPolicy:     respect
hostFamily:       viaf
publicOnly:       true
mayCommitDossier: false
```

### 2.1 Query and result boundary

- Search VIAF's public authority-registry surface for the supplied query; do not crawl the open web.
- Return registry hits as neutral Findings. A hit is not a resolved person, organization, face, or dossier identity.
- Preserve the provider's public VIAF record identifier and title/label only when supported by the returned record.
- Soft-fail on timeout, rate-limit, robots denial, malformed data, or unavailable endpoint; do not convert failure into “no contradiction” or identity confidence.
- The provider is **entity-agnostic**: the same contract applies to every seed and query shape supported by the provider capability. No `seedId`, seed-name, QID, or fixture-specific branch is permitted.

### 2.2 Provenance and independence

Every accepted VIAF Evidence item must include a non-empty, public canonical VIAF `provenanceUrl` (prefer the individual VIAF record URL, not an untraceable search-result label), for example:

```text
providerId:   viaf
hostFamily:   viaf
provenanceUrl: https://viaf.org/viaf/<public-record-id>
```

- **No Finding without Evidence.provenanceUrl.** If Evidence is missing, malformed, or removed by Acc scrub, drop the Finding; never emit an orphan Finding or fabricate a URL.
- The VIAF family must remain distinct from `wikidata`, `wikipedia`/`wikimedia`, and `openlibrary` families for `multi_independent_rate`.
- `providers.length` alone is not corroboration. Independence is counted by distinct accepted `hostFamily` values on surviving Evidence.
- A VIAF result must not copy, infer, or substitute a Wikidata QID, Wikipedia URL, or Open Library identifier as its provenance.

---

## 3. Acc / identity safety locks

The emit path must apply the normal cite-or-drop rule and a VIAF-specific scrub before anything reaches Preview output. The following are mandatory:

1. **No identity overclaim:** VIAF output remains `kind=registry`; it may not set identity confidence, resolve a person/entity, or invoke `mayCommitDossier` (must remain false / unavailable).
2. **Never faces:** no face, portrait, image-identity, biometric, or face-derived field may be emitted or inferred from VIAF.
3. **Forbidden QIDs:** scrub Wikidata QIDs and QID-shaped identifiers from VIAF titles, summaries, URLs, Evidence, Finding fields, facet hints, contradictions, and any derived text. A scrubbed item is dropped if provenance or citeability is no longer valid.
4. **Contradictions:** VIAF hits must not emit identity contradictions or contradiction claims. Any contradiction-shaped payload is scrubbed/dropped; provider failure must not be represented as a contradiction.
5. **Facet hints:** scrub all `facetHints` from VIAF emits. No provider-derived facet hint may escape the Acc boundary.
6. **Evidence first:** emit only Findings whose `evidenceIds` resolve to surviving Evidence with mandatory `provenanceUrl`, `providerId`, and retrieval metadata.
7. **No side effects:** no dossier write, commit, merge, face pipeline, Core call, or alias operation is reachable from the provider.

**Acc acceptance invariant:** `accLeakage = 0`; any forbidden field, QID, contradiction, facet hint, face signal, or provenance-less Finding is an EXP-A failure, regardless of source-diversity lift.

---

## 4. Measurement contract

### 4.1 Primary success metric

On the existing S01/S04/S05 target set, compute the same ScoreCARD definition used for CYCLE1:

```text
multi_independent_rate = accepted Findings with >=2 distinct independent hostFamilies
                         / accepted Findings in the measured target set
```

The VIAF family is independent from Wikidata/Wikipedia/Wikimedia and Open Library. Do not count two provider IDs in one family as two independent sources. Report the aggregate and per-seed values for S01, S04, and S05.

**Success:** `multi_independent_rate >= 0.15` on S01/S04/S05, with `accLeakage=0`, mandatory provenance compliance, and no Core/B0 drift.

**Honest failure:** if the threshold is not met, evidence is insufficient, or guardrails fail, record **FAIL** plus an RCA covering provider availability, query coverage, provenance survival, family classification, ranking/merge effects, and seed-level results. Do not round, hide, or relabel a fail as a win.

### 4.2 Required evidence packet (after Chief GO only)

- Preview deployment/run identifier and immutable timestamp.
- Raw provider response references and normalized Finding/Evidence output.
- Per-seed counts for S01/S04/S05: hits, accepted Findings, provenance-complete Findings, host families, `multi_independent_rate`, and Acc scrub/drop counts.
- Explicit checks that Core remains locked and B0 alias remains exactly `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`.
- Honest PASS or FAIL+RCA; no promotion recommendation based on design alone.

Use additional arbitrary seeds as an entity-agnostic regression check. The named S01/S04/S05 set is a measurement cohort, not a code special-case.

---

## 5. Preview-only execution gates

| Gate | Requirement | State |
|---|---|---|
| Design review | This document locks scope, safety, provenance, independence, and metric | **DONE** |
| Chief authorization | Explicit GO before adapter/code or Preview deployment | **WAIT** |
| Preview evidence | Evidence packet satisfies §4 and Acc invariants | **PENDING** |
| Architecture/Acc review | Review measured output and any FAIL+RCA | **PENDING** |
| Promote / alias change | Chief GO after Evidence; B0 must remain unchanged until then | **HOLD** |

No design text in this file is a promote authorization.

---

## 6. Explicit OUT

- News scrapers, web crawling, or unbounded `web_public` discovery.
- Any Core change, Core redeploy, or Core alias operation.
- Discovery alias promotion or B0 alias retarget.
- EXP-B, EXP-C, and EXP-D.
- Identity resolution, dossier commits, face processing, QID enrichment, contradiction generation, or facet generation.
- Authenticated/private providers, private APIs, or sources that do not permit the public registry contract.

---

## 7. Acceptance checklist

- [x] VIAF is specified as public registry `SearchProvider` only.
- [x] `authMode=none`; `robotsPolicy=respect`.
- [x] VIAF `providerId` / `hostFamily` / provenance family is distinct from Wikidata, Wikipedia/Wikimedia, and Open Library.
- [x] No Finding without `Evidence.provenanceUrl`.
- [x] No identity overclaim; no `mayCommitDossier`; no faces.
- [x] Acc scrub covers forbidden QIDs, contradictions, and `facetHints` on every emit.
- [x] Design is entity-agnostic; no seed special-case.
- [x] Preview only; B0 alias unchanged pending Chief GO after Evidence.
- [x] Success threshold is `multi_independent_rate >= 0.15` on S01/S04/S05, otherwise honest FAIL+RCA.
- [x] OUT includes news scrapers, Core, Discovery alias promote, and EXP-B/C/D.

**EXP-A VIAF design review: DONE · await Preview Evidence · HOLD promote.**

**Report path:**  
`/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A-VIAF/ARCH-DESIGN-REVIEW-ארכיטקט-2026-09-20.md`
