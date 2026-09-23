# Phase B · BOUNDARIES · ארכיטקט · 2026-09-20

**STATUS:** **Phase B OPEN** · **Preview only** · alias **`dpl_8ag…` Acc P0 LOCKED untouched** · **Entity-Agnostic** · **DO NOT DESTROY CORE**  
**SCOPE:** DOCS ONLY kickoff — Arch declares boundaries. **NO alias promote. NO Core rewrite. NO WP4.**  
**Refs:** Pack v1.0 `PHASE-A-ARCHITECTURE-FREEZE-PACK-ארכיטקט-2026-09-20.md` · Entity-Agnostic addendum · SERVER `PHASE-A-SERVER-שרת-2026-09-20.md` · Chief GO `PHASE-B-CHIEF-GO-2026-09-20.md` · schemas/` 

---

## 1. Goal

**E2E Maximum Public Discovery Engine vertical slice** — additive Discovery Layer only.

- Product: public Findings + Evidence engine · **not** People Search / identity guesser
- Same general pipeline for **any Seed** (Entity-Agnostic)
- Core Entity Mode path (`/api/lookup`, `mayCommitDossier`) **unchanged**
- Deliverable gate: **Preview** Evidence Pack → Chief Review → promote Discovery **only** on explicit GO

---

## 2. Canonical pipeline (Entity-Agnostic)

Every Seed follows **one** path (no entity special-case):

```
Seed
  → ER soft (hints only; UNKNOWN≠FALSE)
  → Discovery (providers → Findings + Evidence)
  → Relationship Expansion (evidence-backed edges only)
  → Cross-Source Correlation (fingerprint / soft refs; no false bind)
  → Evidence Scoring (finding-relevance, not identity confidence)
  → Findings
  → Facets
  → Provenance (cite-or-drop)
```

Maps to orchestrator **S0–S10** (SERVER §1 / Pack §D). Progressive emit after Acc scrub (S9→S10).

**Seed fixtures (≥3, same path — not allowlist / not hard-coded):**

| Fixture | Kind | Role |
|---------|------|------|
| `דוד כהן` | Hebrew person-name | illustration / regression only |
| `Alex Morgan` | Ambiguous Latin person-name | no-forced-merge |
| `example.org` / `Example Organization` | Domain / org | org/domain expansion |

---

## 3. Module map (declare — Server implements)

Proposed paths under `api/`. Arch owns boundaries; **Server** owns Preview impl.

| Path | Role |
|------|------|
| `api/discovery/` **or** `api/lib/discovery/` | Discovery Orchestrator S0–S10, session store, progressive emit (POST/GET/SSE/narrow) |
| `api/discovery/providers/` (or under lib) | SearchProvider stubs: `wikidata`, `viaf`, `openlibrary`; `web_public` **only if authorized** |
| `api/lib/forbiddenIdentities.js` | **Reuse Acc scrub SoT** v2026-09-19.1+ — all Discovery emit surfaces |
| `api/lookup.js` + Core `orchestrator.js` | **UNCHANGED** — Entity Mode only; Discovery **never** calls `mayCommitDossier` |

**Cache:** Discovery caches source-aware · **must not poison** Core lookup cache · HIT rehydrate → Acc scrub again.

---

## 4. Slice boundaries

### IN (Preview vertical slice)

| # | In scope |
|---|----------|
| 1 | Finding / Evidence / Session / Relationship / Facet / Entity(soft) / ImageProvenance **schema compliance** (Pack v1.0) |
| 2 | Progressive session API: `POST /api/discovery/sessions` · `GET …/:id` · `GET …/:id/events` · `POST …/:id/narrow` |
| 3 | Acc scrub on **all** Discovery emit (findings, entityRefs, facets, graph, SSE, cache HIT) via `forbiddenIdentities` SoT |
| 4 | **≥3 Seeds** same general path (Entity-Agnostic addendum) |
| 5 | Public providers only — wikidata / viaf / openlibrary stubs OK; `web_public` only if authorized |
| 6 | Soft ER · evidence-backed relationships · cite-or-drop provenance · finding rank (not identity) |
| 7 | Facets + progressive first paint ≤ ~800ms where feasible · soft provider errors |

### OUT (hard NO)

| # | Out of scope |
|---|--------------|
| 1 | Identity commit / `mayCommitDossier` from Discovery |
| 2 | `faces` / dossier / identity-commit `photoUrl` on Discovery responses |
| 3 | **Alias promote** (Acc P0 on `dpl_8ag…` stays LOCKED; Discovery promote only later explicit GO) |
| 4 | **Core rewrite** (`lookup.js` / Core orchestrator) |
| 5 | **WP4** |
| 6 | Special-case entity names / hard-coded Seed branches |
| 7 | Private / auth-walled sources · robots bypass · credential stuffing |

---

## 5. Schema compliance checklist (Pack v1.0)

Canonical: `test-results/discovery/schemas/`. Preview payloads MUST validate.

| Schema | Must |
|--------|------|
| `finding.schema.json` | `id`, `kind`∈{page\|registry\|document\|contact_public\|media\|other}, `title`, `evidenceIds` **minItems 1**, `providers` **minItems 1**; `entityRefs` soft only; `scoreFinding` = finding-relevance **not** identity; `additionalProperties: false` |
| `evidence.schema.json` | `id`, **`provenanceUrl` (uri required)**, `providerId`, `retrievedAt`; cite-or-drop |
| `discovery-session.schema.json` | `sessionId`, `q`, `status`∈{running\|partial\|complete\|failed_soft}, `findings`, `facets`, **`forbiddenIdentitiesVersion` required** |
| `entity.schema.json` | soft only · `status`∈{candidate\|corroborated\|unknown} · **no faces** · confidence soft |
| `relationship.schema.json` | `evidenceIds` **minItems 1** · no name-only edges |
| `facet.schema.json` | `key`, `label`, `buckets[{value,count}]` · or `emptyReason` |
| `image-provenance.schema.json` | never emit image without **`sourcePageUrl`** |

**Response bans:** no `dossier` · no `faces` · no identity-commit photo binding on Discovery surfaces.

---

## 6. Vertical Slice AC pointer

- **≥3 Seeds** — Entity-Agnostic addendum (`PHASE-A-ENTITY-AGNOSTIC-ADDENDUM-ארכיטקט-2026-09-20.md`)
- **VS-S01…S10** · **VS-U01…U08** · **VS-A01…A06** — QA pack `PHASE-A-QA-בודק-2026-09-20.md` / Pack §§J–K
- Same AC for every Seed; no literal-value branches
- Acc: `ACC-DISC-01…06` on every Seed (leakage=0 · no unauthorized identity certainty · UNKNOWN≠FALSE · no unjustified drop · evidence-backed merge only · rank Findings not identities)
- Core: `/api/lookup` P0 suite remains green · Discovery never enters `mayCommitDossier`

---

## 7. Gate

```
Server Preview (additive Discovery)
  → Preview Evidence Pack (schemas + ≥3 Seeds + Acc scrub proofs + Core untouched)
  → Chief Review
  → promote Discovery ONLY on explicit Chief GO
```

- Acc P0 alias **`dpl_8ag…` LOCKED** — do not touch / do not promote via this Phase B work
- Default: Preview only until GO

---

## 8. Arch ownership

| Owner | Owns |
|-------|------|
| **ארכיטקט** | Boundaries (this doc) · schema compliance glance after Server Preview · Entity-Agnostic invariant hold |
| **שרת** | Preview implementation under declared module map · progressive API · providers · Acc scrub wire-in |
| **דיוק** | Acc SoT / ACC-DISC on Discovery surfaces |
| **בודק** | VS-S/U/A execution against Preview Evidence Pack |
| **Chief** | GO / NO-GO on Discovery promote |

**After Server Preview:** Arch does a short schema-compliance + boundary glance (IN/OUT + Core untouched) before Chief Review.

---

## 9. Principles carry-forward (locked)

P1–P10 from Pack v1.0 remain in force — especially **P9 additive Discovery** · **P10 DO NOT DESTROY CORE** · P1 INFORMATION≠IDENTITY · P2 Provenance · P5 UNKNOWN≠FALSE · P6 same name ≠ same person · P8 public/authorized only.

---

## Phase B CONTINUE addendum · hardening pointer

Focused hardening boundaries are in `PHASE-B-BOUNDARIES-SSE-NARROW-STORE-ארכיטקט-2026-09-20.md`: SSE `/events`, server-recomputed `/narrow`, persistent Preview session store, and Acc scrub on every emit/cache rehydrate path. **NO promote · NO Core rewrite · NO WP4.**


**Decision:** Phase B boundaries **READY** · await **Server Preview** · **NO promote** · **NO Core rewrite** · **NO WP4**.
