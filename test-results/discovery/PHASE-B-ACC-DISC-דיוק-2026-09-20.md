# Phase B · Acc-DISC + Core regression · דיוק · 2026-09-20

**Checked:** 2026-09-20T02:54:28+03:00 (Asia/Jerusalem, UTC+3)  
**Promote:** **NO** (explicit)  
**Discovery Preview:** `https://akvot-simple-demo-p5zxut9y5-k-akvot.vercel.app` · `dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6`  
**Core Alias:** `https://akvot-simple-demo.vercel.app` · expected `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · observed build `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`

## Verdict

| Gate | Result | Leakage | Notes |
|------|--------|---------|-------|
| **Acc-DISC** | **GO** | 0 | ≥3 entity-agnostic Seeds · NEVER Q1701775 on Discovery emit |
| **Core alias (Acc P0)** | **GO** | 0 · pw=0 | Assaf / כהן / Smith POST+ctx |

## Health

| Target | build | match |
|--------|-------|-------|
| Discovery Preview | `dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6` | PASS |
| Alias | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | PASS |

## Acc-DISC cases (Discovery API)

Endpoints: `POST /api/discovery/sessions` · `GET /api/discovery/sessions/:id` (poll; GET may 404 cross-instance — POST snapshot SoT).

| Case | Seed | status | findings | leak | dossier | faces | Result |
|------|------|--------|----------|------|---------|-------|--------|
| disc-seed-he-soft | דוד כהן | partial | 13 | 0 | false | 0 | PASS |
| disc-seed-he-soft-get | דוד כהן | skip | — | — | — | — | SKIP (sticky Map) |
| disc-seed-smith-ctx | John Smith | partial | 15 | 0 | false | 0 | PASS |
| disc-seed-smith-ctx-get | John Smith | skip | — | — | — | — | SKIP (sticky Map) |
| disc-seed-org-domain | example.org | complete | 2 | 0 | false | 0 | PASS |
| disc-seed-org-domain-get | example.org | skip | — | — | — | — | SKIP (sticky Map) |
| preview-lookup-smith-ctx | — | candidates | — | 0 | false | 0 | PASS |

### Invariants exercised
- **ACC-DISC-01** leakage=0 (findings / candidates / facets / graph / progressive)
- **ACC-DISC-02** Discovery never emits dossier / identity commit
- **ACC-DISC-03** UNKNOWN≠FALSE (no false dossier from soft HE / ambiguous / org seeds)
- **ACC-DISC-06** NEVER Q1701775 in ranked Discovery outputs
- Smith+ctx also via preview `/api/lookup` scrub

## Core alias regression (Acc P0 must PASS)

| Case | ui | qid | faces | leak | pw | Result |
|------|----|-----|-------|------|----|--------|
| alias-assaf | dossier | Q47507930 | 8 | 0 | 0 | PASS |
| alias-cohen | need_context | null | 0 | 0 | 0 | PASS |
| alias-smith-post-ctx-nocache | candidates | null | 0 | 0 | 0 | PASS |
| alias-smith-post-ctx-warm | candidates | null | 0 | 0 | 0 | PASS |

Expectations:
- Assaf → `dossier` · `Q47507930`
- כהן → `need_context|thin|candidates` · faces=0
- Smith POST+ctx → never `Q1701775` · faces=0 · pw=0

## Leakage

- Discovery total: **0**
- Core alias total: **0**
- Pretty-wrong (pw): **0**

## Artifacts

- JSON: `test-results/discovery/PHASE-B-ACC-DISC-דיוק-2026-09-20.json`
- MD: `test-results/discovery/PHASE-B-ACC-DISC-דיוק-2026-09-20.md`
- Raw: `test-results/discovery/PHASE-B-ACC-DISC-raw/`
- Runner: `test-results/discovery/run-phase-b-acc-disc-2026-09-20.mjs`

## Decision

- Acc-DISC: **GO**
- Core alias: **GO**
- **NO promote** performed.
