# ARCH-GLANCE — EXP-A2 Option A coalesce · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20 10:16 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** ארכיטקט (Arch) · Project A  
**Mode:** DOCS + code glance ONLY · **NO code changes** · **NO deploy** · **HOLD promote**  
**Preview (canonical):** `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2` · https://akvot-simple-demo-h9cq1ob4m-k-akvot.vercel.app  
**Locks:** B0 alias `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` **UNCHANGED** · Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED** · no alias retarget

---

## Verdict

| Gate | Result |
|------|--------|
| **Overall Arch** | **CAVEAT** |
| Pretty-Wrong false-merge (Stripe≠Stripe John · TED≠person) | **PASS** |
| Coverage / attach_keep (no softLabel vacuum) | **PASS** |
| Acc scrub AFTER coalesce | **PASS** |
| No dossier / identity claim from coalesce | **PASS** |
| Entity-agnostic (no Assaf/Cohen/Smith special-case) | **PASS** |
| Bound #1 strict: coalesce only fingerprint **OR** strong typed soft-ref (never weak name-only) | **CAVEAT / residual FAIL** — exact `title:` key is name-based and sufficient alone |
| Bound #5: distinct soft-refs stay separate **Findings** | **PASS** (attach_keep) · **CAVEAT** on Evidence[] / entityRefs **union** across title-homonyms |
| Acc/QA live AFTER | **NOT claimed** (Acc/QA confirm separately) |
| **Promote** | **HOLD** |

**One-liner:** Option A attach_keep coalesce is architecturally sound for Pretty-Wrong + coverage + scrub/dossier bounds, but **title-exact coalesce without typed soft-ref** leaves a residual homonym Evidence/entityRefs false-attach risk — **HOLD promote**.

---

## Soft-entity key (what it is)

### Pipeline order (`orchestrator.js` S5→S10)

1. `normalizeRawHit` → pair `{finding, evidence}`
2. `dedupeByEvidenceFingerprint(pairs)` — URL|quote|provider scoped (**cannot** cross-family alone)
3. `coalesceBySoftEntity(deduped)` ≡ `corroborateBySoftLabel` — **EXP-A2 Option A**
4. `rankFindings` (`scoreIdentity: null`)
5. `detectContradictions` / facets / graph
6. **`emitSnapshot(session)` Acc scrub** — then persist

Citations: `orchestrator.js` ~L456–L520 · `store.js` `coalesceBySoftEntity` / `corroborateBySoftLabel` · `emit.js` `sanitizeDiscoveryPayload`.

### Coalesce keys (`coalesceKeysForFinding`)

| Key family | Source | Normalization |
|------------|--------|---------------|
| `title:<coalesceTitleKey>` | `finding.title` | `coalesceTitleKey` → VIAF `Surname, Given` keeps both tokens; date/corp second clauses → head only; descriptive lowercase/long clauses → head; corp suffixes stripped via `corpNormalizeKey` + `softLabel` |
| `viaf:<id>` | entityRefs / provenanceUrl / finding.id | digits only |
| `qid:<Q…>` | entityRefs / wikidata URL / `wd-Q…` id | uppercased QID |
| `ol:<id>` | entityRefs / openlibrary author URL / `ol-…` id | author id |

Union-Find over shared keys → components.  
**If** `members.length ≥ 2` **and** `familyUnion.size ≥ 2`: **ATTACH** union(`evidenceIds`/`providers`/`facetHints`/`entityRefs`) onto **every** member; **KEEP all Findings** (`mode: 'attach_keep'`).  
Same-family-only clusters untouched.

`softEntityKey(title)` returns multi-token `coalesceTitleKey` or `null` (refuses single-token e.g. Stripe) — used for Acc/tests exposure; **coalesce itself still adds `title:` for single-token titles**.

---

## False-merge watch checklist

### 1. Soft entity key fields / normalization

- Primary cluster keys: exact `title:` + typed `viaf:` / `qid:` / `ol:` (`store.js` `coalesceTitleKey`, `coalesceKeysForFinding`).
- **Not** the old softLabel **subset** vacuum (`labelsCompatible` reduced to exact equality; unused in UF path).
- Fingerprint dedupe is prior and orthogonal (same URL only).

### 2. Can two different people with same display name merge? (must be NO without strong ref)

| Layer | Behavior |
|-------|----------|
| Finding rows | **Stay separate** (attach_keep) — bound #5 Finding-id sense **PASS** |
| Evidence[] / providers / entityRefs | **Unioned** if they share exact `title:` even with **distinct** `viaf:` / `qid:` — **no typed soft-ref required** |

**Local Arch probe (2026-09-20):** `John Smith` viaf:111 + wd-Q999 + viaf:222 → 3 Findings kept, 1 `coalesce_key_multi_family` edge, each Finding gets `providers:[viaf,wikidata]` and `entityRefs` including **both** viaf ids.  
→ Against Bound #1 (“never weak name-only”) this is a **residual false-attach** risk (inflated `multi_independent`, cross-contaminated soft-refs).

### 3. VIAF-only siblings → wiki findings?

- Same exact title key (or shared typed id) + ≥2 families → **intentional** attach (TBL path) — desired corroboration.
- Distinct titles (e.g. `Stripe, John` vs `Stripe`, TED-style descriptive title) → **no** coalesce — unit-covered.
- VIAF siblings with **same display title** but **different VIAF ids** → falsely attach via `title:` (homonym case above).

### 4. Acc scrub order

**PASS.** Coalesce at S5; scrub at S10 via `emitSnapshot` → `sanitizeDiscoveryPayload` (Finding / Evidence / facets / contradictions / nested sweep). SSE path also Acc-scrubs every chunk (`sse.js`). Forbidden `Q1701775` must not survive emit surfaces. RESULT/ACC-AFTER report leak=0 (Acc owns live confirmation).

### 5. Dossier / qid / photo from coalesce?

**PASS — no path.**  
- Coalesce only mutates `providers` / `evidenceIds` / `facetHints` / `entityRefs` + corroborationEdges note `INFORMATION≠IDENTITY`.  
- `rankFindings` sets `scoreIdentity: null`.  
- `explainRanking` `identityScore: null`.  
- `emit.js` deletes `dossier` / `photoUrl`; never emits faces; graph nodes are `seed`/`finding` kinds only.  
- Orchestrator header: does **not** call `mayCommitDossier`.

### 6. Entity-agnostic?

**PASS.** No Assaf/Cohen/Smith (or any person-name) special-case in `store.js` / `orchestrator.js` / `emit.js`. Guards are structural (title shape, corp/date/descriptive heuristics, multi-token softEntityKey exposure).

---

## Bound map (Option A RCA vs code)

| # | Bound | Arch |
|---|-------|------|
| 1 | Coalesce only evidenceFingerprint **OR** strong typed soft-ref (never weak name-only) | **CAVEAT** — Design/impl add exact `title:` as a first-class coalesce key (`DESIGN.md`, `coalesceKeysForFinding`) |
| 2 | Acc scrub AFTER coalesce; forbidden Q never in Finding/Evidence/contradictions/facetHints | **PASS** (order + emit scrub) · leak live = Acc |
| 3 | NEVER produce dossier / identity claim from coalesce | **PASS** |
| 4 | Entity-agnostic | **PASS** |
| 5 | No false merge: distinct soft-refs stay separate Findings | **PASS** on Finding ids · **CAVEAT** on shared Evidence/entityRefs via title |
| 6 | multi_independent = FindingId after coalesce with ≥2 provider families in Evidence[] | **Aligned** with Acc redef + attach_keep (RESULT mean 0.5222 on Preview) |

---

## Docs / measure glance (not Acc claim)

| Source | Note |
|--------|------|
| `DESIGN.md` | Option A attach_keep · exact title + typed keys · Pretty-Wrong |
| `10-IMPL-שרת.md` | Impl paths; intermediate Preview id may differ from canonical |
| `RESULT.md` / `ACC-AFTER-S01-S04-S05.md` / `BEFORE-AFTER.json` | Preview `dpl_FRNDab…` · mean multi 0.5222 · leak 0 · S01 findings 18 · Promote HOLD |
| `ACC-MULTI-INDEPENDENT-REDEF-דיוק-2026-09-20.md` | Finding-level ≥2 families; reject VIAF-sibling false-positive |
| Units | `corroboration.viaf.test.mjs` covers TBL merge, TED non-merge, Stripe≠Stripe John |

---

## Recommendation

1. **HOLD promote.** No alias retarget. Core `dpl_8ag…` locked. B0 `dpl_Avyhr…` unchanged.  
2. Acc/QA must still confirm live AFTER on canonical Preview (Arch does **not** claim Acc/QA PASS).  
3. Before any promote consideration: decide whether Bound #1 stays **strict** (title key must not cluster alone — require typed soft-ref intersection) or Design’s exact-title key is an accepted Option A waiver with documented residual homonym risk.  
4. Do **not** start EXP-B from this glance.

---

## Path refs

- This doc: `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-COALESCE/ARCH-GLANCE-COALESCE-ארכיטקט-2026-09-20.md`
- Status: `STATUS-ארכיטקט.md` (same folder)
- Code: `api/lib/discovery/store.js` (`coalesceTitleKey`, `coalesceKeysForFinding`, `corroborateBySoftLabel`, `coalesceBySoftEntity`, `softEntityKey`, `dedupeByEvidenceFingerprint`, `rankFindings`)
- Code: `api/lib/discovery/orchestrator.js` (S5 coalesce → S10 `emitSnapshot`)
- Code: `api/lib/discovery/emit.js` (Acc scrub · no dossier)
- Code: `api/lib/discovery/corroboration.viaf.test.mjs`
- Preview: `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2`

## STOP

**No promote. No code changes. No deploy. No EXP-B. Acc/QA confirm separately.**
