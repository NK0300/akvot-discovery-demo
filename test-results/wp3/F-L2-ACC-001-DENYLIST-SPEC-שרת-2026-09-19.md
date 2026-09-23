# F-L2-ACC-001 · DENYLIST SPEC (FIX-5) · שרת · 2026-09-19

**STATUS:** IMPLEMENTED (local) · Aligns Arch DESIGN BOUND `P3-ACC-P0-FIX-DESIGN-BOUND-ארכיטקט-2026-09-19.md`  
**PROD alias:** untouched · **NO Preview / NO promote this turn**

---

## SoT

| Field | Value |
|-------|-------|
| **SoT file** | `api/lib/forbiddenIdentities.js` |
| **Exports** | `FORBIDDEN_IDENTITY_QIDS`, `FORBIDDEN_IDENTITIES_VERSION`, `normalizeQid`, `extractQid`, `payloadContainsForbidden`, `stripForbiddenFromPayload`, `sanitizeCandidatesPayload` |
| **Initial set** | `{ Q1701775 }` — Acc P0 NEVER (Smith Acc pretty-wrong / historic NY politician). Digits match live fail artifacts (`wd-Q1701775` in MINREPRO smith-4 + Acc×3 quiet r2). |
| **Version** | `FORBIDDEN_IDENTITIES_VERSION = '2026-09-19.1'` |
| **Load** | Static module `Object.freeze([...])` — deterministic, no remote fetch |
| **Update** | PR + Acc Gate only · bump version string · units must list each QID |

---

## Behavior

- **Strip = drop** from `candidates[]` (by `id` / `qid` / `wd-Q…` / URL `/wiki/Q…`), identity-bearing `sources[]` rows for those QIDs, and top-level `qid` belt.
- **NOT** score downgrade, ranking reweight, NY-boost tune, `mayCommit` threshold, H1/cache/UX.
- Class-level: applies to **all** responses (global Acc ban; Smith is the repro class).

## Missing / stale

- Empty denylist = fail-closed in **unit** (`FORBIDDEN_IDENTITY_QIDS.length >= 1`).
- Prod: empty set does not invent QIDs; units guard non-empty for Acc P0.

## Fail-safe

- `sanitizeCandidatesPayload`: if scrub throws → `candidates=[]`, clear forbidden top `qid`, keep `uiState` (never escalate to dossier / never emit raw).

## Observability

- Additive on scrubbed payload: `forbiddenStripped: N`, `forbiddenIdentitiesVersion`.
- Optional `timings.forbiddenStripped` when timings object present.
- Must not change `uiState`. OBS `wikiMeta` otherwise untouched.

## Wire points (Domain)

1. `attachOrchestratorFields` — last line of defense on every attach (early Stage-B + final).
2. `revalidateDomainSafePayload` — both demote and non-demote returns → covers **cache HIT** + `domainSafeExitPayload` early exits.

## Acc invariant (FIX-2)

After sanitize: `forbiddenQids ∩ extractPayloadQids(payload) = ∅`  
(`payloadContainsForbidden(payload) === false`). Covers dossier **and** candidates.

## Units

- `api/lib/forbiddenIdentities.test.mjs` — strip / invariant / version / P0 commit guards
- `api/lib/orchestrator.test.mjs` — Acc P0 attach scrub + existing P0/P3 suite

