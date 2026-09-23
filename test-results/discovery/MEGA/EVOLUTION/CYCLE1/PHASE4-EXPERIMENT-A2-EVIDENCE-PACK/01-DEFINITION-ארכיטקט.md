# 01 — DEFINITION · A2-safe sufficient-evidence contract · ארכיטקט

**Owner:** ארכיטקט (Arch) · Project A · DOCS ONLY  
**Stamp:** 2026-09-20 10:36 IDT (Asia/Jerusalem, UTC+3)  
**Pack:** PHASE4-EXPERIMENT-A2-EVIDENCE-PACK  
**Preview enrich (Server SoT):** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` · https://akvot-simple-demo-mcqip894c-k-akvot.vercel.app  
**Locks:** Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED** · B0 Discovery `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` **FROZEN** · **HOLD promote** · **NO** alias · **NO EXP-B**

Cross-link (Server seed, do not overwrite): `01-DEFINITION.md`

---

## 1. Product intent (A2-safe)

A2-safe coalesce **attaches** multi-provider Evidence onto Findings that share a **strong typed soft-ref** (or that already share an upstream evidence fingerprint). It does **not** resolve persons/orgs into dossiers, does **not** invent identity from title similarity, and does **not** collapse Finding rows (mode = **attach_keep**).

**INFORMATION ≠ IDENTITY.** Multi-family Evidence on a FindingId is corroboration of a **reference**, not a same-person claim.

---

## 2. Identity labels (MUST stay separate — do NOT collapse)

| Label | Definition | May drive Evidence attach? |
|-------|------------|----------------------------|
| **same-source** | Same provenance / same evidence fingerprint (URL\|quote\|provider) already collapsed upstream by `dedupeByEvidenceFingerprint` | N/A — already co-located at S5 fingerprint |
| **same-reference** | Share ≥1 typed soft-ref key (`viaf:` / `qid:` / `ol:`) across ≥2 hostFamilies | **YES** — sole A2-safe attach allow path |
| **same-entity** | Entity-resolution Gate claim (single person/org identity / dossier) | **NO** under A2-safe — never invent from title; not granted by coalesce alone |
| **related-entity** | Distinct typed ids; may be org-family / sibling / related labels | **NO** attach unless a **shared** typed key also exists |
| **possible-match** | Title / string similarity without shared typed key | **NO** — reject attach |
| **unknown** | Insufficient typed keys and insufficient corroboration | **NO** — reject attach |

**Hard ceiling:** Coalesce attach (multi-provider Evidence on FindingId) is **`same-reference` at most** until a future **entity-resolution Gate**. Never invent **`same-entity`** from title similarity alone.

> Code note (`labelRelationship` in `store.js`): when typed keys already intersect and `titleSecondary` is `agree`/`disagree`, the helper may *annotate* `same-entity` / `related-entity`. **A2-safe contract treats those annotations as provisional labels, not Gate-grade identity.** Promote-grade evidence must still call attach **`same-reference`**. See `12-LIMITATIONS-ארכיטקט.md`.

---

## 3. Sufficient-evidence contract (executable)

### ALLOW — attach Evidence (typed soft-ref / shared fingerprint)

Attach **is allowed** when **all** of the following hold:

1. **Join key is strong:**
   - Shared typed soft-ref: at least one of `viaf:NNNN`, `qid:Q…`, `ol:KEY` appears on ≥2 Findings in the UF component **after** Bound#1 key emission (`coalesceKeysForFinding`), **OR**
   - Shared `evidenceFingerprint` already merged pairs upstream (orthogonal; not a UF key).
2. **Family diversity:** component `familyUnion.size ≥ 2` (cross-family).
3. **Mode:** `attach_keep` — union `evidenceIds` / `providers` / `facetHints` / `entityRefs` onto **every** member; **KEEP all Finding ids**.
4. **Relationship ceiling for the attach edge:** treat as **`same-reference`** (INFORMATION≠IDENTITY note required on edge).
5. **Acc scrub AFTER** coalesce (emit path) — forbidden Q / seed-poison must not survive measured surfaces.

**Resulting identity label for the attach:** `same-reference` (not `same-entity`).

### REJECT — do not attach

Reject attach when **any** of the following hold:

| Reject reason | Example | Label to emit (if any) |
|---------------|---------|------------------------|
| Join key would be `title:` alone | Exact title homonym, distinct VIAF/QID | `possible-match` or `unknown` |
| High title similarity only | Stripe ≈ Stripe John / TED descriptive | `possible-match` |
| Same-family-only cluster | Two VIAF siblings, no foreign family | no attach (component untouched) |
| Distinct typed ids, no shared key | `viaf:111` vs `viaf:222` vs `qid:Q999` same display name | stay separate · `related-entity` or `unknown` |
| Soft-label subset / vacuum | EXP-A `dpl_4Rj7c…` S01 10→1 class | **forbidden** design |

Prefer **multi=0** over **multi↑ + false merges**.

### UNKNOWN — insufficient evidence

Mark **`unknown`** (no attach) when:

- No typed soft-ref and no shared fingerprint, **or**
- Typed refs present but incomplete / conflicting enrichment leaves no **shared** key across families, **or**
- Observer cannot decide between `possible-match` and `related-entity` without an entity-resolution Gate.

UNKNOWN is a **first-class outcome**, not a failure of measurement.

---

## 4. Coalesce key inventory (Bound #1 locked)

| Key | ALLOW as UF coalesce key? | Notes |
|-----|---------------------------|-------|
| `viaf:` | **YES** | Digits from entityRefs / viaf.org URL / `viaf-NNNN` id |
| `qid:` | **YES** | From `qid:` / `wd-Q…` / bare `Q…` / wikidata URL |
| `ol:` | **YES** | From `ol:` / `ol-…` / openlibrary.org/authors URL |
| shared `evidenceFingerprint` | Upstream only | `dedupeByEvidenceFingerprint` before coalesce |
| `title:` | **NO** | Secondary annotation only (`titleSecondary`) |
| similarity / softLabel subset | **NO** | Vacuum class — rejected |

Code SoT: `api/lib/discovery/store.js` · `coalesceKeysForFinding` (~L309–L355) · `corroborateBySoftLabel` (~L417+) · Bound#1 comment: *NEVER emit title:*.

---

## 5. Pretty-Wrong / Acc discipline (contract constraints)

- `Stripe` ↛ `Stripe, John` (corp vs person title-key guard — title never sole key).
- Acc scrub **AFTER** coalesce (`emitSnapshot` → `sanitizeDiscoveryPayload`).
- Never dossier / faces / `mayCommitDossier` / Core identity path from coalesce.
- Entity-agnostic: no Assaf/Cohen/Smith special-case.
- Forbidden QID leak gate = 0 on measured surfaces (Acc owns live claim).

---

## 6. Canonical Previews (document only — no promote)

| Lane | dpl | Role |
|------|-----|------|
| A2-safe enrich | `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` | Typed soft-ref enrich · Server smoke mean multi≈0.2408 |
| A2 Bound#1 | `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` | Typed keys, no enrich · multi=0 |
| A2 caveat title-bridge | `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2` | **NON-promote** · title: coalesce residual |
| B0 Discovery | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **FROZEN** |
| Core | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED** |

---

## STOP

**HOLD promote. NO alias. NO EXP-B. Acc/QA not claimed by Arch.**
