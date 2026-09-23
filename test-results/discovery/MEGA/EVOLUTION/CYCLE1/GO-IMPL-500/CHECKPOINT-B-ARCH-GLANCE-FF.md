# CHECKPOINT-B-ARCH-GLANCE-FF · Discovery adapter deepening

**Stamp:** 2026-09-23T22:44:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Workspace:** `/workspace/akvot-quick-demo` (local only)  
**Verdict:** **CONSISTENT** for runtime invariants; one documentation-age drift is recorded below.

## SoT drift check

| SoT / lock | Read-only check | Result |
|---|---|---|
| Seed → Plan → Family → Evidence | QueryPlan path is flag-gated; planned families normalize into cited findings/evidence. | **CONSISTENT** |
| URL-alone → `UNKNOWN` | Evidence graph ceiling remains in force; a URL is provenance, not identity. | **CONSISTENT** |
| Candidate ≠ fact | Existing adapters emit `confirmationState=candidate`, `epistemicState=candidate`, `identityClaim=false`; evidence carries candidate/URL-ceiling fields. | **CONSISTENT** |
| F11 | No filings/news/scholarly/government/archive HTTP was added; unwired candidates remain `candidate_unwired_f11` / unsupported. | **CONSISTENT** |
| Locks | No promote; no Core/B0/A2/C1 changes; no new source family; QueryPlan, VIAF, and web-origin flags remain default OFF. | **CONSISTENT** |

### Real drift (documentation only)

The older `CHECKPOINT-B-ARCH-GLANCE-ארכיטקט.md` is stamped **DOCS ONLY** and says `providers.js` was untouched. That statement predates the later FF-SERVER adapter work (Actions 69–76) and this FF adapter wave; it is stale history, not runtime drift. The older Phase 1 consistency note also contains an outdated “orchestration OPEN” wording, superseded by the later runtime-green / Checkpoint-B evidence. No code rollback is warranted.

## Existing adapters deepened (no new HTTP families)

- Wikidata, Open Library, Wikipedia, and opt-in VIAF now share bounded NFKC/whitespace normalization, canonical record IDs, duplicate suppression, normalized signals, and explicit provenance (`sourceRecordId`, retrieval time, extraction method, signal summary).
- The existing adapter normalization path retains `sourceRecordId` and typed references in addition to existing candidate/URL-ceiling fields; B0 store semantics are unchanged.
- Soft failures keep compatibility `code` values and add stable taxonomy (`category`, `retryable`, `providerId`, `phase`), including cancellation, timeout, rate-limit, upstream 4xx/5xx, invalid response, and policy-blocked classes.
- Existing public endpoints and provider families only; no adapter promotion or new source family.

## Validation

Relevant suites passed: VIAF/provider adapter **52/0**, corroboration **50/0**, adapter contract **57/0**, phase2 **57/0**, Checkpoint B **36/0**, evidence **55/0**, security **186/0**, GO-IMPL harden **86/0**.

**NO promote · flags default OFF · F11 HOLD · Core/B0/A2/C1 frozen.**
