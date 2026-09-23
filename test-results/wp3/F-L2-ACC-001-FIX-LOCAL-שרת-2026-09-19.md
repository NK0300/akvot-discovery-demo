# F-L2-ACC-001 · FIX LOCAL (Acc P0) · שרת · 2026-09-19 ~23:21 IDT

**STATUS:** LOCAL FIX COMPLETE · units green · **NO Preview yet** (wait Arch GO)  
**PROD:** `dpl_7vAA…` FROZEN · **zero vercel deploy / promote / alias touch this turn**  
**Design:** Arch BOUND `test-results/handoff/P3-ACC-P0-FIX-DESIGN-BOUND-ארכיטקט-2026-09-19.md`

---

## What changed

| File | Change |
|------|--------|
| `api/lib/forbiddenIdentities.js` | **NEW** SoT denylist v`2026-09-19.1` · `{ Q1701775 }` · normalize/extract · `payloadContainsForbidden` · `stripForbiddenFromPayload` · `sanitizeCandidatesPayload` (fail-safe → `candidates=[]`) |
| `api/lib/orchestrator.js` | Import sanitize · call from `attachOrchestratorFields` + both returns of `revalidateDomainSafePayload` |
| `api/lib/forbiddenIdentities.test.mjs` | **NEW** strip / invariant / version / Assaf+P0 commit guards |
| `api/lib/orchestrator.test.mjs` | Acc P0 attach scrub assertions appended |
| `package.json` | `test` includes forbiddenIdentities suite |
| `test-results/wp3/F-L2-ACC-001-DENYLIST-SPEC-שרת-2026-09-19.md` | FIX-5 denylist documentation |

**Not changed:** `mayCommitDossier` thresholds, softAmb, trusted-seed, Stage-B ranking/NY-boost, H1 כהן, cache TTL, UX, Assaf-only ifs.

---

## Why this fixes RCA (F-L2-ACC-001)

RCA: Stage-B Wikidata intermittently emits `candidates[0].id = wd-Q1701775` (score ~0.9 via city “New York”) + matching `sources[].url`. Prior P0 blocked dossier/faces/qid commit only — Acc treats **any** Q1701775 in candidates/sources as pw=1.

FIX: Domain emit scrub **drops** forbidden QIDs before JSON/SSE success (attach + revalidate/cache HIT). Strip ≠ score downgrade. Invariant: forbidden ∉ dossier AND ∉ candidates/sources after sanitize.

---

## Unit results (local, no network deploy)

| Suite | Result |
|-------|--------|
| `node api/lib/orchestrator.test.mjs` | **128 passed, 0 failed** |
| `node api/lib/forbiddenIdentities.test.mjs` | **39 passed, 0 failed** |
| `node test-results/contract-identity-p0.mjs` | **5/5 PASS** (hits existing prod URL for contract KEEP/P0 — **not** a new deploy) |

Proven:
- `wd-Q1701775` candidate stripped
- `sources` URL with Q1701775 stripped
- non-forbidden WD (`Q6258357`) + VIAF preserved
- dossier P0 commit guards intact (Smith mayCommit false; Assaf seeded true)
- version `2026-09-19.1`

---

## Preview

**NO Preview yet** — wait Arch GO on this package.

## Deploy confirmation

- No `vercel deploy`
- No promote
- No alias touch
- Working tree changes are local code + test-results docs only

---

## Next (out of scope this turn)

MIN REPRO → LOAD → ACC GATE → Chief REVIEW → Preview Evidence → Promote only explicit GO
