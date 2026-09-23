# Acc P0 FIX GATE · ARCH DESIGN BOUND + DENYLIST SPEC · ארכיטקט · 2026-09-19
**STATUS:** DESIGN APPROVED for local impl · Preview only after Arch GO on finished package · **NO alias promote**  
**Baseline FROZEN:** `dpl_7vAA…` · WP3 FAIL/HOLD · WP4 NO-GO  
**RCA:** `F-L2-ACC-001-RCA-*` · contract gap SoT vs Acc NEVER-QID-in-payload

---

## FIX-1 — Candidate sanitization (emit scrub)

### Single scrub point (Domain)
New helper in `api/lib/` (e.g. `forbiddenIdentities.js` or `orchestrator.js` export):

`sanitizeCandidatesPayload(payload, { q, ctx })` → strips forbidden QIDs from:
- `candidates[]` (by `id` / `qid` / `wd-Q…` / URL containing `/wiki/Q…`)
- `sources[]` that are identity-bearing Wikidata rows for those QIDs
- any top-level `qid` if somehow set to forbidden (belt)

**Strip = drop**, never downgrade/score-cap (Chief FIX-1).

### Call sites (Application must not bypass)
1. Before every JSON/SSE success that can include `candidates` (early Stage-B candidates, decideStage attach, final assemble, **cache HIT revalidate path**)
2. Prefer one Domain call from `attachOrchestratorFields` **and** final `revalidateDomainSafePayload` / `obsJson` pre-emit — belt+suspenders
3. Stage-B may still *discover* WD rows internally; **response must not emit** them

### Forbidden
- Ranking reweight / NY-boost tune as substitute for scrub (scope creep)
- Touching `mayCommitDossier` thresholds / softAmb / trusted-seed
- H1 כהן / cache TTL / sticky / UX
- Assaf-only if

---

## FIX-2 — Acc invariant (explicit)
After sanitize, assert for response:
```
forbiddenQids ∩ extractQids(payload) = ∅
```
where extract includes: top `qid`, each `candidates[].id|qid`, WD URLs in `sources`.  
Violation → treat as emit bug (unit fail). Dossier path already SoT-gated; invariant covers **both** dossier and candidates.

---

## FIX-5 — Denylist SoT / version / fail-safe / observability

| Field | Spec |
|-------|------|
| **SoT file** | `api/lib/forbiddenIdentities.js` (new) — single export `FORBIDDEN_IDENTITY_QIDS` + `normalizeQid()` + `payloadContainsForbidden()` + `stripForbiddenFromPayload()` |
| **Initial set** | `{ Q1701775 }` — Acc P0 ban (legacy Will-Smith PW / NEVER rule). Version comment: Acc lock 2026-09 · RCA F-L2-ACC-001 |
| **Version** | `FORBIDDEN_IDENTITIES_VERSION = '2026-09-19.1'` exported; include in health or `wikiMeta`/payload `forbiddenIdentitiesVersion` (additive obs, optional on health) |
| **Load** | Static module const (deterministic). No remote fetch. |
| **Update** | PR + Acc Gate only · bump version string · units must list each QID |
| **Missing/stale** | Empty set = fail-closed in **test** (unit asserts non-empty for Acc P0). Prod: empty set logs warning via existing counters only if we add `forbiddenStripCount` — do not invent QIDs |
| **Fail-safe** | If scrub throws → prefer drop candidates to `[]` + keep `uiState` / need_context|thin rather than emit raw (document in code). Never escalate to dossier |
| **Observability** | Additive: `forbiddenStripped: N` on payload or timings (optional); must not change uiState. OBS wikiMeta untouched otherwise |
| **Class-level** | Apply to **all** responses (not Smith-only if) — denylist is global Acc ban; Smith is the repro class |

---

## SoT vs Acc (architecture)
| Layer | Owns |
|-------|------|
| Domain commit (`mayCommit` / trusted seed) | dossier+faces |
| Domain sanitize (this FIX) | Acc NEVER-QID in candidates/sources |
| Acc Expected | documents NEVER Q1701775 · no rewrite of other cases |

---

## Package approval checklist (Arch GO before Preview)
- [ ] `forbiddenIdentities.js` + units (strip / invariant / version)
- [ ] Wired on all candidates emit paths + cache HIT
- [ ] orchestrator + Smith Acc units still green · **no** mayCommit/threshold diff
- [ ] Diff review: no H1/cache/UX/ranking optimize
- [ ] Rollback: ignore Preview · alias stays `dpl_7vAA…`

**Arch GO** = this bound + green local package from @שרת → then Preview only.

---

## Sequence reminder
FIX → UNIT → MIN REPRO → LOAD → ACC GATE → Chief REVIEW → Preview Evidence → **Promote only explicit GO**

**MEASURE FOR TRUTH. NO SCOPE CREEP.**
