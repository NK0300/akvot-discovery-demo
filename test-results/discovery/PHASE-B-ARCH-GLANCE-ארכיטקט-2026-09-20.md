# Phase B · ARCH GLANCE · ארכיטקט · 2026-09-20

**STATUS:** **PASS** · recommend **Chief Review** · **NO promote** · **NO alias change** · **WP4 NO-GO**  
**Checked:** 2026-09-20 ~02:55 Asia/Jerusalem (UTC+3)  
**Preview:** `dpl_BvWg9yUsibVqdrCAexSTMpwoabZ6` · `https://akvot-simple-demo-p5zxut9y5-k-akvot.vercel.app`  
**Core alias (LOCKED):** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · **untouched**  
**Refs:** BOUNDARIES · Pack v1.0 · SERVER-SLICE · VS/Core QA · Acc-DISC · UX Preview Verify

---

## Verdict

| Gate | Result |
|------|--------|
| **Arch glance (schema / module / Core boundary)** | **PASS** |
| Acc evidence present | **YES** · `PHASE-B-ACC-DISC-דיוק-2026-09-20.md` · Acc-DISC **GO** · Core alias **GO** · leak=0 |
| Overall | **PASS (full)** — recommend **Chief Review** |
| Promote / alias | **STOP** — explicit Chief GO only; alias stays LOCKED |
| WP4 | **NO-GO** |

---

## 1. Module map vs BOUNDARIES

| Declared | Observed | Hold |
|----------|----------|------|
| `api/lib/discovery/*` orchestrator / providers / emit / store / facets | **Present** — `emit.js`, `facets.js`, `index.js`, `orchestrator.js`, `providers.js`, `store.js` (+ unit test) | PASS |
| `api/discovery/sessions` POST + GET `:id` | **Present** — `sessions/index.js`, `sessions/[id].js` | PASS |
| Acc scrub SoT `api/lib/forbiddenIdentities.js` | `emit.js` imports `sanitizeCandidatesPayload` + QID primitives; stamps `forbiddenIdentitiesVersion` | PASS |
| Core `api/lookup.js` + Core orchestrator **unchanged** for Discovery commit | Discovery never calls `mayCommitDossier`; `lookup.js` mtime older than Discovery add; Core regression PASS on alias | PASS |
| Cache poison / Core rewrite | Additive routes only; no Discovery→identity-commit path | PASS |

**Soft (documented, in-slice OK):** SSE `/events` + `/narrow` deferred (poll + POST `snapshot`). Session store = in-memory Map → cross-instance GET 404; mitigated by Acc-scrubbed `snapshot` on POST. `viaf` stub not landed (wikidata + openlibrary only — public stubs OK per BOUNDARIES). Soft ER = hash stub.

---

## 2. Acc scrub · forbiddenIdentities SoT

- **Import strip:** `emit.sanitizeDiscoveryPayload` → `sanitizeCandidatesPayload` on candidates-equivalent projection + local QID scrub on findings / evidence / facets / graph nodes.
- Emit deletes `dossier` / `faces` / `photoUrl`.
- Version stamped: **`2026-09-19.1`** (matches Acc SoT).
- Unit: inject `Q1701775` stripped before return (`orchestrator.test.mjs`).
- Live Acc-DISC (דיוק): Discovery leak **0** · Core alias leak **0** · pw **0**.

**Hold:** PASS.

---

## 3. No dossier / faces on Discovery emit

| Surface | Evidence |
|---------|----------|
| Code | `emit.js` deletes dossier/faces/photoUrl; orchestrator comment + no `mayCommitDossier` call |
| VS (בודק) | S1–S3 POST snapshots: none |
| Acc-DISC | disc-seed-* : dossier=false · faces=0 |
| Sample raw | S1/S2/S3-POST: keys lack dossier/faces/photoUrl |

**Hold:** PASS.

---

## 4. Entity-Agnostic · no `דוד כהן` hardcode

- Grep over `api/lib/discovery/*.js` + `api/discovery/**`: **no** `דוד כהן` / Hebrew-David hardcode in production modules (fixture only in QA/Acc docs).
- Seed path: opaque `seed`/`q` string → same pipeline for all Seeds.
- Providers: wbsearchentities / OpenLibrary author search parameterized by `req.q` only.
- VS Entity-Agnostic: identical snapshot top-level keys across ≥3 Seeds · same POST path · **PASS**.

**Hold:** PASS.

---

## 5. Schema alignment (Pack v1.0)

Canonical: `test-results/discovery/schemas/`.

| Schema | Preview hold |
|--------|----------------|
| `finding` | Required `id`/`kind`/`title`/`evidenceIds`/`providers` (min 1) — PASS on S1–S3 samples |
| `evidence` | `id` + **https** `provenanceUrl` + `providerId` + `retrievedAt` — cite-or-drop in `store.normalizeRawHit` — PASS |
| `discovery-session` | `sessionId`/`q`/`status`/`findings`/`facets`/`forbiddenIdentitiesVersion` — PASS |
| `facet` | `key`/`label`/`buckets` (or emptyReason) — PASS |
| `entity` / `relationship` | Soft ER stub + graph nodes only; no name-only identity edges with forced merge — soft OK for slice |
| Response bans | No dossier/faces/photoUrl — PASS |

**Hold:** PASS (Preview schema compliance glance).

---

## 6. QA Evidence

| Track | Source | Result |
|-------|--------|--------|
| VS ≥3 Seeds | `PHASE-B-VS-בודק-2026-09-20.md` | **PASS** · דוד כהן · Alex Morgan · example.org |
| Acc-DISC leakage | VS + Acc-DISC | **PASS** · **0** · version `2026-09-19.1` |
| Core regression | `PHASE-B-CORE-REGRESSION-בודק-2026-09-20.md` + Acc Core alias | **PASS** · Assaf/כהן/Smith · build `dpl_8ag…` |
| Preview Evidence Pack | `PHASE-B-PREVIEW-EVIDENCE-בודק-2026-09-20.md` | All tracks PASS · Promote STOP |
| Acc full (דיוק) | `PHASE-B-ACC-DISC-דיוק-2026-09-20.md` | **Present + GO** → Arch verdict **PASS full** (not pending-Acc) |
| UX Preview | `PHASE-B-UX-PREVIEW-VERIFY-ממשק-2026-09-20.md` | **PASS** · tab-discovery / fixtures ≥3 / INFORMATION≠IDENTITY |

---

## 7. OUT / locks (reaffirm)

| Lock | Status |
|------|--------|
| Alias promote | **NOT DONE** · `dpl_8ag…` LOCKED |
| Discovery promote | **await Chief GO** |
| Core rewrite | **not performed** |
| WP4 | **NO-GO** |
| Identity commit from Discovery | **absent** |

---

## 8. Soft notes (non-blocking for Chief Review)

1. Cross-instance GET session 404 — documented; POST.snapshot SoT for VS/Acc.
2. SSE / narrow not in slice.
3. `viaf` provider not implemented (wikidata + openlibrary sufficient for Preview).
4. Soft ER hash stub — not full ER (BOUNDARIES soft path OK).
5. Live inject Acc harness on Preview not present — unit inject + observe-only live leak=0.

---

## Decision

**PASS (full)** — schema / module map / Acc scrub SoT / Entity-Agnostic / Core boundary hold.  
Acc evidence **present and GO**. UX Preview **PASS**. QA VS≥3 + Core regression **PASS**.

→ Recommend **Chief Review** of Preview Evidence Pack.  
→ **NO promote** · **alias untouched** · **WP4 NO-GO** until explicit Chief GO.

**Artifact:** `test-results/discovery/PHASE-B-ARCH-GLANCE-ארכיטקט-2026-09-20.md`
