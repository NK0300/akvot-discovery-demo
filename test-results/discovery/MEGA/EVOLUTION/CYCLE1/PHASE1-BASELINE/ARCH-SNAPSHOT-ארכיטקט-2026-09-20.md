# ARCH-SNAPSHOT — Discovery Evolution CYCLE1 PHASE1 · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T09:47:30+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DOCS ONLY · B0 Evidence Pack architecture snapshot  
**Policy:** NO code · NO promote · NO Core rewrite  
**Baseline tag:** **B0**  
**Discovery alias (B0):** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · https://akvot-discovery.vercel.app  
**Core (LOCKED):** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · https://akvot-simple-demo.vercel.app  

> Cite-only. Metrics and gate outcomes below are taken from existing PROMOTE / PR-CLOSEOUT / PHASE1-BASELINE evidence. No invented numbers.

---

## 1. Locked deployments (B0)

| Surface | Full deployment ID | Alias | Evidence |
|---------|-------------------|-------|----------|
| Discovery PRODUCTION alias | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | https://akvot-discovery.vercel.app (+ `akvot-discovery-k-akvot.vercel.app`) | `PR-CLOSEOUT/PROMOTE/PROMOTE-RESULT-CHIEF.md` · `ARCH-GLANCE-PROMOTE-ארכיטקט-2026-09-20.md` · `PHASE1-BASELINE/BASELINE-EVIDENCE-PACK.md` |
| Core PRODUCTION | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | https://akvot-simple-demo.vercel.app | Same · **LOCKED / unchanged** |

**Promote policy for Evolution Cycle 1:** HOLD further promote / alias retarget without a new Chief GO (`ARCH-GLANCE-PROMOTE` §Gate · `PROMOTE-RESULT-CHIEF` policy line).

---

## 2. Routes (Discovery progressive API)

Canonical paths under `api/discovery/` (also declared in `vercel.json` `functions`):

| Method | Route | Entry | Role |
|--------|-------|-------|------|
| `POST` | `/api/discovery/sessions` | `api/discovery/sessions/index.js` | Create session · seed ingest · pipeline · Acc-scrubbed snapshot |
| `GET` | `/api/discovery/sessions/:id` | `api/discovery/sessions/[id]/index.js` | GET / HIT rehydrate · Acc scrub on emit |
| `GET` | `/api/discovery/sessions/:id/events` | `api/discovery/sessions/[id]/events.js` | Progressive SSE · scrub per chunk |
| `POST` | `/api/discovery/sessions/:id/narrow` | `api/discovery/sessions/[id]/narrow.js` | Server facet recompute · scrubbed narrow view |
| `GET` | `/api/discovery/health` | `api/discovery/health.js` | Store WRUD probe · durability / promoteEligible telemetry |

**Cited maps:** `MEGA/MEGA-B-ARCHITECTURE-MAP-ארכיטקט-2026-09-20.md` §1 · Phase B boundaries `PHASE-B-BOUNDARIES-ארכיטקט-2026-09-20.md` §4 · `vercel.json`.

App health companion (not Discovery-owned): `GET /api/health` exposes `discoveryStore.*` telemetry without secrets (`PROMOTE-RESULT-CHIEF` §OBSERVABILITY).

---

## 3. Modules (`api/lib/discovery/*` + sessionStore)

| Module | Role | Acc scrub |
|--------|------|-----------|
| `orchestrator.js` | S0–S10 lifecycle · create/get/narrow/runPipeline | via `emitSnapshot` |
| `sessionStore.js` | Backend select: vercel-kv → **upstash** → fs-regen fallback | caller scrubs on read/emit |
| `providers.js` | Runtime `DEFAULT_PROVIDERS`: wikidata · openlibrary · wikipediaOpenSearch | raw hits; emit scrubs |
| `store.js` | normalize · fingerprint · `rankFindings` · contradictions | n/a (pre-emit) |
| `emit.js` | `sanitizeDiscoveryPayload` over `forbiddenIdentities` SoT | **primary** |
| `sse.js` | Progressive events · scrub every chunk | yes |
| `narrow.js` | Facet filter apply | caller scrub |
| `facets.js` | Facet aggregate | caller scrub |
| `obs.js` / `requestGuards.js` / `urlSafety.js` / `faultInject.js` | Telemetry · guards · URL safety · env-gated fault | n/a |
| `index.js` | Barrel re-exports | — |

**Cited:** `MEGA-B-ARCHITECTURE-MAP-ארכיטקט-2026-09-20.md` §3 · live module listing under `api/lib/discovery/`.

**SoT Acc:** `api/lib/forbiddenIdentities.js` (`FORBIDDEN_IDENTITIES_VERSION` / `isForbiddenQid` / `sanitizeCandidatesPayload`). Discovery never imports Core identity-commit paths.

---

## 4. Acc scrub emit surfaces (pointer)

Canonical surface matrix (historical + post-B23 closure):

**Pointer:** `test-results/discovery/MEGA/MEGA-SCRUB-SURFACE-MATRIX-ארכיטקט-2026-09-20.md`

| Surface | Post-B23 / promote Evidence status (cite) |
|---------|-------------------------------------------|
| `findings[]` / `entityRefs[]` | WIRED · leak=0 on promote Acc (`PROMOTE-RESULT-CHIEF` §ACC · `ACC-FULL-SURFACE.md`) |
| `facetHints[]` (B22) | CLOSED on Preview wave (`MEGA-B23-SCRUB-GLANCE` · P1 fold) |
| `contradictions[].findingIds[]` (B23) | CLOSED · `scrubContradiction` wired (`MEGA-B23-SCRUB-GLANCE` · Acc leak=0) |
| SSE finding / facets chunks | PASS observed · promote lifecycle leak=0 |
| Narrow response | Scrubbed narrow response PASS; **O1** = GET/SSE projection soft open (see Phase 2) |
| GET / HIT rehydrate | Acc leak=0 on alias; projection ≠ narrow filter (O1) |
| Never-fields `dossier` / `faces` / `photoUrl` | Deleted on sanitize · PASS |

**Promote Acc roll-up (cite, do not invent):** total Acc leakage **0** across seeds + adversarial Q1701775 variants — `PROMOTE-RESULT-CHIEF` §ACC · `ACC-POST-PROMOTE-דיוק-2026-09-20.md` · PHASE1 `09-ACC-REGRESSION` / `BASELINE-EVIDENCE-PACK.md` §09.

---

## 5. Core boundary — Discovery additive · lookup untouched

| Rule | State | Evidence |
|------|-------|----------|
| Discovery additive only (P9) | **IN FORCE** | Phase B boundaries §1 · Pack P9/P10 |
| `/api/lookup` + Core orchestrator / `mayCommitDossier` | **UNCHANGED** | `CORE-REGRESSION.md` · promote Core table |
| Core alias `dpl_8ag…` | **LOCKED** | inspect + health build = `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Core Acc P0 / pw | **pw=0 · leakage=0** (cite) | `PROMOTE-RESULT-CHIEF` §CORE · PHASE1 `08-CORE-REGRESSION` |
| Discovery never commits identity | **HELD** | Architecture map §2 · ACC-DISC mode gates |

Discovery and Core share Acc SoT (`forbiddenIdentities`) but **not** cache / dossier / faces paths.

---

## 6. KV SoT — Upstash on Discovery alias

Live alias health (cite `PROMOTE-RESULT-CHIEF` §LIVE HEALTH · PHASE1 baseline):

| Signal | Cited value on `akvot-discovery.vercel.app` |
|--------|-----------------------------------------------|
| `storeBackend` | **upstash** |
| `durable` | **true** |
| `promoteEligible` | **true** |
| `kvReachable` | **true** |
| `durabilityState` | durable-kv |
| mode | kv-shared |
| WRUD | WRITE/READ/UPDATE/DELETE all ok (promote + baseline health probes) |

**Not claimed here:** inventing new latency SLAs. Timing samples exist only where already recorded in `PHASE1-BASELINE/METRICS-BOOTSTRAP.json` (B0 bootstrap) and promote raw health JSONs — Evolution Source/Strategy phases must re-measure rather than treat bootstrap as a gate.

---

## 7. B0 smoke / promote Evidence index (cite)

| Pack | Path | Role |
|------|------|------|
| Promote chief result | `MEGA/PR-CLOSEOUT/PROMOTE/PROMOTE-RESULT-CHIEF.md` | GREEN/PROMOTED alias verify · seeds ≥6 · Acc=0 · Core locked |
| Promote arch glance | `MEGA/PR-CLOSEOUT/PROMOTE/ARCH-GLANCE-PROMOTE-ארכיטקט-2026-09-20.md` | PASS · STOP further promote without new GO |
| UX post-promote | `MEGA/PR-CLOSEOUT/PROMOTE/05-UX-POST-PROMOTE-ALIAS-ממשק-2026-09-20.md` | PARTIAL · O1 OPEN |
| PR-CLOSEOUT arch all | `MEGA/PR-CLOSEOUT/20-ARCH-GLANCE-ALL-ארכיטקט-2026-09-20.md` | G1–G13 Evidence · G14 HOLD |
| Scrub matrix | `MEGA/MEGA-SCRUB-SURFACE-MATRIX-ארכיטקט-2026-09-20.md` | Emit surface inventory |
| Arch map | `MEGA/MEGA-B-ARCHITECTURE-MAP-ארכיטקט-2026-09-20.md` | Modules · pipeline · Preview≠Prod |
| PHASE1 baseline pack | `EVOLUTION/CYCLE1/PHASE1-BASELINE/BASELINE-EVIDENCE-PACK.md` | B0 steps 01–10 PASS |

---

## 8. Architecture snapshot verdict

| Item | Verdict |
|------|---------|
| Routes / modules documented for B0 | **DONE** |
| Acc scrub pointer | **DONE** → scrub matrix + B23 glance + promote Acc |
| Core boundary | **HELD** · lookup untouched · `dpl_8ag` LOCKED |
| KV SoT on alias | **upstash durable** (cited) |
| Further promote this cycle | **HOLD** |

**Phase1 Arch snapshot: DONE.** No code · no promote performed by this document.
