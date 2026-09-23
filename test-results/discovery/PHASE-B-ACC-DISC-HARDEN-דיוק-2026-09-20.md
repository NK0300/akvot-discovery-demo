# Phase B · Acc-DISC HARDEN Preview · דיוק · 2026-09-20

**Checked:** 2026-09-20T04:11:51+03:00 (Asia/Jerusalem, UTC+3)  
**Promote:** **NO** (explicit)  
**Prior Acc:** `dpl_BvWg…` does **NOT** carry over — re-ran on harden Preview  
**Discovery Preview:** `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app` · `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB`  
**Core Alias:** `https://akvot-simple-demo.vercel.app` · expected `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · observed `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Server evidence:** `PHASE-B-SERVER-HARDEN-שרת-2026-09-20.md`

## Verdict

| Gate | Result | Leakage | Notes |
|------|--------|---------|-------|
| **Acc-DISC** | **GO** | 0 | ≥3 Seeds · SSE · narrow · HIT/regen · NEVER Q1701775 |
| **Core alias (Acc P0)** | **GO** | 0 · pw=0 | Assaf Q47507930 · כהן soft · Smith never Q170 · pw=0 |

## Health

| Target | build | match |
|--------|-------|-------|
| Discovery Preview | `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB` | PASS |
| Alias | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | PASS |

## Acc-DISC cases

| Case | Seed / surface | status/ui | findings | leak | dossier | faces | fiv / notes | Result |
|------|----------------|-----------|----------|------|---------|-------|-------------|--------|
| disc-seed-he-soft | דוד כהן | partial | 13 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-he-soft-get | דוד כהן | partial regen | 13 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx | John Smith | partial | 15 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-smith-ctx-get | John Smith | partial regen | 15 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain | example.org | complete | 2 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-seed-org-domain-get | example.org | complete regen | 2 | 0 | false | 0 | 2026-09-19.1 | PASS |
| disc-sse-smith-or-primary | discovery-sse | sse:22 | 15 | 0 | false | 0 | seen | PASS |
| disc-narrow-provider | discovery-narrow | narrow:8 | 8 | 0 | false | 0 | 2026-09-19.1 | PASS |
| preview-lookup-smith-ctx | lookup | candidates | — | 0 | false | 0 | — | PASS |

### Paths exercised
1. **POST** `/api/discovery/sessions` × 3 Seeds (HE soft · Smith+IBM/NY/US · example.org)
2. **GET** `/api/discovery/sessions/:id` — HIT/regen (`fs-regen`); Acc scrub + `forbiddenIdentitiesVersion` required
3. **SSE** `GET …/:id/events` — scrub on every chunk; NEVER Q1701775 → **PASS**
4. **Narrow** `POST …/:id/narrow` — recompute scrub → **PASS**
5. Preview `/api/lookup` Smith+ctx — never Q1701775

### Invariants
- **ACC-DISC-01** leakage=0 (findings / facets / graph / SSE chunks / narrow)
- **ACC-DISC-02** Discovery never emits dossier / identity commit
- **ACC-DISC-03** UNKNOWN≠FALSE
- **ACC-DISC-06** NEVER Q1701775
- HIT/regen still carries `forbiddenIdentitiesVersion` (`2026-09-19.1`)

## Core alias regression (Acc P0)

| Case | ui | qid | faces | leak | pw | Result |
|------|----|-----|-------|------|----|--------|
| alias-assaf | dossier | Q47507930 | 2 | 0 | 0 | PASS |
| alias-cohen | need_context | null | 0 | 0 | 0 | PASS |
| alias-smith-post-ctx-nocache | candidates | null | 0 | 0 | 0 | PASS |
| alias-smith-post-ctx-warm | candidates | null | 0 | 0 | 0 | PASS |

## Leakage

- Discovery total: **0**
- Core alias total: **0**
- Pretty-wrong (pw): **0**

## SSE / Narrow notes

- SSE: content-type event-stream · events scrubbed per chunk · leak=0
- Narrow: version bump + Acc scrub · leak=0

## Artifacts

- JSON: `test-results/discovery/PHASE-B-ACC-DISC-HARDEN-דיוק-2026-09-20.json`
- MD: `test-results/discovery/PHASE-B-ACC-DISC-HARDEN-דיוק-2026-09-20.md`
- Raw: `test-results/discovery/PHASE-B-ACC-DISC-HARDEN-raw/`
- Runner: `test-results/discovery/run-phase-b-acc-disc-harden-2026-09-20.mjs`

## Decision

- Acc-DISC: **GO**
- Core alias: **GO**
- **NO promote** performed.
