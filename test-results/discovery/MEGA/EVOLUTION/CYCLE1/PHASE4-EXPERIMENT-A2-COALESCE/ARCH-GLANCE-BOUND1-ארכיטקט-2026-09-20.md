# ARCH-GLANCE Bound #1 — EXP-A2 title-only harden · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20 10:23 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** ארכיטקט (Arch) · Project A  
**Mode:** DOCS + code glance ONLY · **NO code changes** · **NO deploy** · **HOLD promote**  
**Preview (Bound #1):** `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` · https://akvot-simple-demo-2u3mwx1k4-k-akvot.vercel.app  
**Prior glance (CAVEAT):** `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2` · title-only residual — `ARCH-GLANCE-COALESCE-ארכיטקט-2026-09-20.md`  
**Locks:** B0 Discovery `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` **UNCHANGED** · Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED** · no alias retarget

---

## Verdict

| Gate | Result |
|------|--------|
| **Bound #1** (typed keys / fingerprint only — never `title:` alone) | **PASS** (code + local Arch probe) |
| Pretty-Wrong / attach_keep coverage | **PASS** (unchanged path; S01 findings_n=18 Server smoke) |
| Acc scrub AFTER coalesce | **PASS** (order + emit scrub) |
| No dossier / identity from coalesce | **PASS** |
| Entity-agnostic | **PASS** |
| Bound #5 Findings stay separate (attach_keep; no false Finding-id merge) | **PASS** |
| Homonym Evidence/entityRefs cross-contam (prior residual) | **PASS** — title alone no longer unions |
| Acc/QA live AFTER | **NOT claimed** |
| Server smoke multi=0 | Expected under Bound #1 (typed cross-family refs not yet live) — **not Acc PASS** |
| **DESIGN.md lag** | **CAVEAT** — still documents exact `title:` as coalesce key; code no longer does |
| **Promote** | **HOLD** |

**One-liner:** Bound #1 **PASS** on Preview `dpl_Fz2iq…` — `title:` removed from UF coalesce; John Smith viaf:111 / wd-Q999 / viaf:222 stay unattached — **HOLD promote**; Acc/QA not claimed.

---

## Task 1 — Code glance (`store.js`)

### `coalesceKeysForFinding` (~L309–L351)

- Emits **only** `viaf:` / `qid:` / `ol:` from entityRefs, provenance URL, finding.id.
- Comment: *Bound #1: NEVER emit title: — title is secondary annotation only*.
- **No** `title:` key added (prior Option A path removed).

### `corroborateBySoftLabel` / `coalesceBySoftEntity` (~L382–L581)

- UF clusters **only** on strong typed keys (`viaf:` / `qid:` / `ol:`).
- Defense-in-depth: `if (k.startsWith('title:')) continue`.
- `coalesceTitleKey` retained for **secondary** edge annotation `titleSecondary` ∈ {agree, disagree, absent} — **never** sole coalesce key.
- attach_keep unchanged: when typed-key component has ≥2 families → union Evidence/providers/entityRefs onto every member; **KEEP all Findings**.
- `coalesceBySoftEntity` ≡ `corroborateBySoftLabel`.

### Fingerprint (orthogonal, upstream)

- `dedupeByEvidenceFingerprint` still runs **before** coalesce (orchestrator S5).
- Shared `evidenceFingerprint` collapses same-URL/quote/provider pairs prior to UF — Bound #1 “fingerprint OR typed soft-ref” satisfied without putting fingerprint into UF keys.

---

## Task 2 — Local Arch probe (John Smith)

**Setup:** same title `John Smith` · distinct typed refs · three families/providers:

| Finding | Typed key | Provider |
|---------|-----------|----------|
| viaf-111 | `viaf:111` | viaf |
| wd-Q999 | `qid:Q999` | wikidata |
| viaf-222 | `viaf:222` | viaf |

**Result (2026-09-20 10:23 IDT):**

| Check | Observed |
|-------|----------|
| findings_n | **3** (kept) |
| corroborationEdges | **0** |
| `title:` emitted | **false** |
| Evidence/entityRefs cross-contam | **none** (each keeps own ref; providers length=1) |
| Positive control (shared `viaf:85312226` across viaf+wikidata) | **1** edge · providers unioned · `titleSecondary: disagree` ok |

→ Title-homonyms with distinct typed refs **do NOT** union Evidence/entityRefs. Prior CAVEAT residual **cleared**.

---

## Task 3 — Server STATUS / DESIGN (PHASE4 folder)

| Doc | Note |
|-----|------|
| `STATUS-שרת.md` / `BOUND1-TITLE-ONLY-FIX-שרת.md` / `.json` / `21-PREVIEW-BOUND1.json` | Bound #1 Preview `dpl_Fz2iq…` · multi mean **0** · Acc leak **0** · S01 findings **18** · promote **HOLD** · aliases untouched |
| `DESIGN.md` | **Lag:** still lists exact title + typed keys as coalesce keys (pre-Bound #1). Code is authoritative; Design should be reconciled before any promote consideration |

Server claim alignment with Arch: typed keys only · multi smoke=0 expected · HOLD — **yes**.

---

## Prior gates (re-verify, not Acc claim)

| # | Bound | Arch |
|---|-------|------|
| 1 | Coalesce attach only fingerprint **OR** typed soft-ref (`viaf:`/`qid:`/`ol:`) — never `title:` alone | **PASS** |
| 2 | Acc scrub AFTER coalesce | **PASS** (`orchestrator` coalesce → `emitSnapshot` → `sanitizeDiscoveryPayload`) |
| 3 | Never dossier / identity from coalesce | **PASS** (`scoreIdentity: null`; emit deletes dossier; no `mayCommitDossier`) |
| 4 | Entity-agnostic | **PASS** (no Assaf/Cohen/Smith special-case) |
| 5 | Distinct soft-refs stay separate Findings; no false Finding-id merge | **PASS** (attach_keep) |
| 5b | No Evidence/entityRefs union on title-homonyms | **PASS** (this Bound #1 fix) |
| 6 | multi_independent live ≥ gate | **NOT claimed** — Server smoke mean 0 (expected until typed cross-family enrichment) |

---

## Recommendation

1. **HOLD promote.** No alias retarget. Core `dpl_8ag…` locked. B0 `dpl_Avyhr…` unchanged.  
2. Acc/QA confirm live AFTER on Bound #1 Preview separately — Arch does **not** claim Acc/QA PASS.  
3. Reconcile `DESIGN.md` to Bound #1 (typed keys only; title secondary) before any promote discussion.  
4. Do **not** start EXP-B from this glance.

---

## Path refs

- This doc: `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-COALESCE/ARCH-GLANCE-BOUND1-ארכיטקט-2026-09-20.md`
- Prior CAVEAT: `ARCH-GLANCE-COALESCE-ארכיטקט-2026-09-20.md`
- Status: `STATUS-ארכיטקט.md` (same folder)
- Server: `BOUND1-TITLE-ONLY-FIX-שרת.md` · `21-PREVIEW-BOUND1.json` · `STATUS-שרת.md`
- Code: `api/lib/discovery/store.js` (`coalesceKeysForFinding`, `corroborateBySoftLabel`, `coalesceBySoftEntity`, `coalesceTitleKey` secondary, `dedupeByEvidenceFingerprint`)
- Code: `api/lib/discovery/orchestrator.js` (S5 coalesce → S10 emitSnapshot)
- Code: `api/lib/discovery/emit.js` (Acc scrub · no dossier)
- Preview: `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw`

## STOP

**No promote. No code changes. No deploy. No EXP-B. Acc/QA confirm separately.**
