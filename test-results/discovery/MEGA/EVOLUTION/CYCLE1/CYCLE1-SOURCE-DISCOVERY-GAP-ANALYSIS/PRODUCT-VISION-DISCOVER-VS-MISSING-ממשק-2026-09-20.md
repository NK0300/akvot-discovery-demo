# PRODUCT VISION — DISCOVER VS MISSING

**Owner:** ממשק  
**Date:** 2026-09-20 11:01 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** NOTES ONLY · NO code · NO EXP-B · NO promote  
**Baseline:** B0 Discovery frozen · A2-safe Preview experimental only  
**Locks:** Core locked · HOLD

> Product note for Cycle 1 Source & Discovery Gap Analysis. **INFORMATION ≠ IDENTITY.** The product should maximize useful public-web discovery while making source limits, independence, and uncertainty legible.

## 1. What a user successfully discovers today

### B0

A user can successfully discover a **source-backed set of findings around a seed**, not a resolved person or organization:

- A flat, ranked `findings[]` surface from the live trio: Wikidata, Open Library, and Wikipedia OpenSearch.
- Titles, URLs, provider labels, kinds (`registry` / `page`), summaries or snippets when available, evidence links, facets, and discovery-ranking rationale.
- Useful first-pass signals for notable names, library-author records, encyclopedia pages, and some organization/document labels.
- Repeated findings across runs and provider/source provenance. This is retrieval stability, not identity stability.
- Empty or partial results that can be observed, although the current surface does not always explain whether the cause is no match, missing context, unsupported intent, or provider failure.

The measured B0 surface is narrow: three live adapters, roughly two source families (`wikimedia`, `openlibrary`), mean domains about **1.34**, and **244/244 findings single-family** in the Phase 3/4 corpus. Wikidata and Wikipedia are different providers but one Wikimedia family. The current display can therefore look like corroboration while mostly showing registry/page variants and near-duplicates.

### A2-safe Preview

The A2-safe Preview adds an experimental VIAF path and typed cross-source coalescing. What a user can discover additionally:

- Some public authority crosswalks between Wikidata, VIAF, and Open Library.
- A defensible **SAME-REFERENCE** relationship when normalized typed keys intersect across source families (`viaf:`, `qid:`, `ol:`).
- More useful provenance density for canonical people and selected organizations, without a claim that the references are the same real-world identity.
- Honest separation where typed evidence is absent or conflicts.

The safe attach ceiling is **SAME-REFERENCE**. It never creates **SAME-ENTITY**, a dossier, or an identity choice. The gain is seed-specific: S01 shows successful typed bridges; S04 remains at multi=0 because authority coverage is absent; S05 remains low because related organizations have different authority granularity. A2-safe hardening was forensics-only and did not change that result.

### The user-facing truth

Today the product can answer:

> “What public findings and references can I collect around this input, from the sources that answered?”

It cannot honestly answer:

> “Which person or organization is this?”

A URL, title, snippet, provider, ranking score, source count, or typed reference is information about a claim. None is identity by itself. Even multiple independent families can support a claim while leaving the entity unresolved.

## 2. What is missing from a public-web discovery product vision

These are product gaps and directions, not permission to implement them in this closed cycle.

### Authority

The live stack has structured authority for some notable people and library records, but weak coverage for corporate/legal entities. A public-web discovery product needs source-native identifiers appropriate to the question:

- corporate filings and national/company registries for legal organizations;
- official or government portals where the jurisdiction is relevant;
- library and scholarly authority for people and works;
- URL-origin and domain records for a domain seed.

“Authority” should mean a durable, relevant source artifact—not a prestigious logo or a high domain weight.

### Independence

The product needs to show **independent source families**, not merely provider count or more cards. A future surface should distinguish:

- `2 providers · 1 source family`;
- `2 independent source families`;
- source family unknown or independence not established.

Recirculation, shared backends, mirrors, and same-family Wikimedia results should not inflate corroboration. Independence is evidence provenance, not identity confidence.

### HE / locale

Hebrew users need more than a Hebrew label on an English result. The vision includes:

- explicit HE, EN, and other/unknown content coverage;
- native-HE-source present/absent as a coverage fact;
- locale-aware source selection and snippets;
- future Hebrew public, government, news, or official sources where legally and operationally appropriate.

HE coverage is a user-value and coverage issue. It is not automatically a higher-authority or independent-source signal. Hebrew Wikipedia remains Wikimedia, not a new family.

### Organization granularity

The product must preserve distinctions among brand, legal entity, parent movement, national society, subsidiary, chapter, and similarly named organization. A user needs to see when sources refer to different organizational levels, not a single merged “Red Cross” answer.

### URL / role / intent

Name lookup is not enough for a public-web discovery product. The vision needs intent-aware paths for:

- URL/domain origin metadata;
- roles and compound queries such as “CEO of …”;
- aliases and constraints retained as context;
- explicit unsupported or under-specified states when the system has no honest resolver.

A URL result should be grounded in the origin/domain question; a role result should preserve the role constraint. Neither should be silently treated as a person-name search.

### Progressive uncertainty

Uncertainty should be legible from loading through result review:

- collecting findings;
- multiple unresolved hypotheses;
- source-limited or provider-partial;
- needs context;
- unsupported intent;
- no match after the available checks.

The denominator must be honest: show which sources were checked, failed, unavailable, or not applicable. Do not turn a discovery score, progress indicator, or `evidenceCoverage=1.0` into identity confidence.

## 3. Product impact of S04 and S05 as honest UX

### S04 — source-limit / authority coverage limitation

For `Stripe`, multi=0 is a correct limitation under the safe rules, not a defect to hide. The measured problem is missing or unusable corporate authority: empty Wikidata P214, VIAF person homonyms without a typed bridge, Open Library rows without remote IDs, and an under-keyed Wikipedia path.

The honest UX should:

- say that available sources did not produce a typed cross-family reference for the organization;
- keep person homonyms and organization candidates separate;
- distinguish “source limitation / partial coverage” from `no_match`;
- preserve the possible findings without force-ranking one as the organization;
- make clear which authority source was not available, absent, or unsupported.

Do not manufacture multi, promote a title match, or imply that a famous source has resolved Stripe.

### S05 — authority-granularity limitation

For `Red Cross`, the available typed evidence can support some specific clusters, such as an American Red Cross reference, while ICRC, the international movement, and national societies may remain distinct. That is useful discovery, not failure to merge.

The honest UX should:

- expose organization level and jurisdiction when the source provides it;
- keep movement, society, national body, and unrelated homonyms as separate hypotheses;
- use **RELATED-ENTITY** only for a documented relationship, never as an attach instruction;
- show “not the same reference” when authority keys differ;
- prefer a visibly incomplete but accurate graph over a complete-looking mega-organization.

S04 and S05 should therefore appear as first-class product limitations. The user should understand why “more findings” does not equal “one answer,” and why a low multi result can be the safer result.

## 4. Later notes for SAME-REFERENCE / RELATED / POSSIBLE / UNKNOWN

Use the canonical labels when the underlying model exists; avoid shortening them into ambiguous trust badges.

| Later surface | Meaning to a user | Display note | Prohibited implication |
|---|---|---|---|
| **SAME-REFERENCE** | Typed references overlap across at least two source families. Evidence may be shown together. | Attach to the specific finding/hypothesis edge. Expand to show the shared typed key and families. | Not “same person,” “verified,” or SAME-ENTITY. |
| **RELATED-ENTITY** (`RELATED`) | Distinct references have a documented thematic or organizational relationship. | Keep separate cards/nodes; show the reason and relationship direction if known. | Not permission to union evidence or merge identities. |
| **POSSIBLE-MATCH** (`POSSIBLE`) | A typed signal is incomplete; a future peer or enrichment could establish SAME-REFERENCE. | Use as an open lead with “what is missing,” not as a confidence score. | Not attachable, not a failed test, not SAME. |
| **UNKNOWN** | Evidence is insufficient to classify the relationship. | Make it a first-class, calm state; say “not enough typed evidence.” | Not false, not no-match, and never an automatic rejection or merge. |

These labels belong to a finding, hypothesis, or relationship—not to the whole search as a blanket identity status. They should be progressive and reversible only when new typed evidence arrives. A future UI can show the evidence path, source families, and missing coverage beside the label. It should not expose provisional graph annotations as gate-grade identity claims.

## 5. Candidate experiments from a UX lens

These are trade-off notes, not a “best” order and not implementation approval.

| Candidate | User value | Trade-offs / UX risks | What to measure |
|---|---|---|---|
| **Independent authority provider (VIAF or another public authority family)** | More crosswalks for canonical people and some organizations; lets users see genuine family-level independence. | Homonyms, authority-file bias, and more cards can increase false certainty. A typed bridge may still be absent for companies. | Can users distinguish providers from independent families? Do typed bridges improve useful reference discovery without “verified” interpretation? |
| **URL/domain origin path** | Makes a domain seed actionable: origin title, site name, and grounded public metadata instead of treating the URL as a person-name string. | SSRF/allowlist constraints; thin or vanity metadata; users may overread site-declared identity. | Grounded URL findings, correct empty/unsupported states, and whether users understand origin metadata is not ownership proof. |
| **Role / compound intent path** | Preserves the user’s actual question and reduces irrelevant celebrity/name results. | Parsing errors, under-specified roles, and a risk of presenting a plausible person as the answer. | `need_context` comprehension, role constraint retention, and no silent fallback to name-only certainty. |
| **HE-locale and native-source coverage** | Higher user value for Hebrew speakers: readable local-language evidence and better discovery of local public sources. | It may reduce result volume, over-filter thin sources, or remain within the same Wikimedia family. Language coverage is not independence or authority. | Native HE-source presence, snippet usefulness, language labeling accuracy, and whether users mistake Hebrew coverage for verification. |
| **Public legal authority for organizations (filings / registries / official portals)** | Addresses S04-like gaps with legal names, jurisdiction, company numbers, and source-native dates. | Jurisdiction gaps, legal-name-versus-brand mismatch, access/rate limits, and sensitivity around public organizational data. | Correct organization granularity, typed identifiers, source-limit explanations, and false-merge rate. |
| **Uncertainty and provenance comprehension study** | Tests whether users understand source count versus independence, partial coverage, and UNKNOWN before adding more sources. | May make the UI feel less decisive; too many warnings can create alert fatigue. | Recognition of “information, not identity,” interpretation of SAME-REFERENCE, and distinction between provider failure and no-match. |

The HE-locale option has direct local user value even if it produces no new independent family. By contrast, an authority-family experiment primarily improves cross-source grounding, while URL/role work improves intent coverage. These are different user needs and should not be collapsed into one “quality” score. **EXP-B remains closed/not authorized here.**

## 6. What NOT to build

- **Identity theater:** no “verified person,” “trusted identity,” identity-confidence meter, dossier CTA, photo, or green state derived from ranking, source count, or prestige.
- **Prestige logos as proof:** recognizable Wikimedia, library, government, or brand logos are provenance markers, not endorsements or identity evidence.
- **Title-bridge as certainty:** no exact-title, substring, fuzzy-name, embedding, or similarity threshold may create SAME-REFERENCE or SAME-ENTITY.
- **Provider-count theater:** do not count Wikidata and Wikipedia as independent merely because their chips differ; do not reward repeated recirculation as corroboration.
- **Organization mega-merges:** do not collapse brand/legal entity, movement, national society, chapter, or subsidiary because the name is similar.
- **Fake completeness:** no “87% complete” or equivalent without a defensible denominator that includes failures, unsupported paths, and expected coverage.
- **Silent failure semantics:** `contradictions=[]` is not “no conflict” when a provider failed; an empty result is not automatically `no_match`.
- **Identity by ranking:** top-ranked is a discovery ordering, never “the right person” or organization.
- **Dossier before choice:** no action that assumes identity until a future, separate identity-resolution gate exists. A2-safe remains capped at SAME-REFERENCE.

## Evidence basis / hand-off

- `PHASE3-FINDING-QUALITY/PHASE3-UX-FLAT-LIST-AMBIGUITY-ממשק-2026-09-20.md`
- `PHASE4-SOURCE-DISCOVERY/ARCH-SOURCE-INVENTORY-BIAS-ארכיטקט-2026-09-20.md`
- `PHASE4-SOURCE-DISCOVERY/PHASE4-UX-SOURCE-DIVERSITY-SURFACE-ממשק-2026-09-20.md`
- `PHASE4-SOURCE-DISCOVERY/SOURCE-QUALITY-MODEL.md`
- `CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/01-SOURCE-CAPABILITY-MATRIX.md`
- `CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/02-CURRENT-DISCOVERY-GRAPH.md`
- `CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/03-COVERAGE-GAPS.md`
- `CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/04-AUTHORITY-GAPS.md`
- `CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/05-INDEPENDENCE-GAPS.md`
- `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/03-VOCABULARY-FINAL-ארכיטקט.md`
- `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/04-S04-S05-RECOVERY-BOUNDS-ארכיטקט.md`
- `PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/01-EXECUTIVE.md`

**Status:** deliverable complete · HOLD · no EXP-B · no promote · STOP.
