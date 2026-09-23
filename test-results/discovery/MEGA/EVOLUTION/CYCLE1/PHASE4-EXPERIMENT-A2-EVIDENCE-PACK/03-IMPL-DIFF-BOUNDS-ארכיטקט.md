# 03 — IMPL DIFF / Bound#1 compliance · ארכיטקט

**Owner:** ארכיטקט · DOCS ONLY (code citations, no edit)  
**Stamp:** 2026-09-20 10:36 IDT (Asia/Jerusalem, UTC+3)  
**Code SoT:** `/workspace/akvot-quick-demo/api/lib/discovery/store.js`  
**Cross-link (Server impl narrative):** `03-IMPL-DIFF-שרת.md` · do not overwrite

---

## 1. Verdict

| Check | Result |
|-------|--------|
| Bound#1 — UF coalesce keys typed only (`viaf:` / `qid:` / `ol:`) | **PASS** (code) |
| `title:` as coalesce key | **GONE** from `coalesceKeysForFinding` |
| Defense-in-depth skip `title:` in UF | **PASS** (`k.startsWith('title:') continue`) |
| Prefer multi=0 over false merges | **PASS** (policy + Bound#1 smoke multi=0) |
| FRNDab title-bridge residual | **CLEARED** relative to Bound#1 Preview |
| Acc/QA live PASS | **NOT claimed** |
| Promote | **HOLD** |

---

## 2. Bound#1 vs FRNDab title-bridge caveat

| Lane | Preview dpl | Coalesce keys | Homonym risk | Arch |
|------|-------------|---------------|--------------|------|
| **FRNDab** (Option A caveat) | `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2` | exact `title:` **+** typed | Title-homonyms union Evidence/entityRefs | **CAVEAT** — `ARCH-GLANCE-COALESCE-…` |
| **Bound#1** | `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` | typed only | Title alone does **not** cluster | **PASS** — `ARCH-GLANCE-BOUND1-…` |
| **A2-safe enrich** | `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` | typed only + provider enrich | Same Bound#1 policy; multi rises via shared typed refs | Pack under review · **HOLD** |

**Proof title-only gone (John Smith Arch probe, Bound#1 glance):**  
`viaf:111` / `wd-Q999` / `viaf:222` · same display title → findings_n=3 kept · corroborationEdges=0 · no Evidence/entityRefs cross-contam.  
Positive control: shared `viaf:85312226` across families → attach fires.

FRNDab is **NON-promote** documentation of the residual that Bound#1 removed. Do not reintroduce `title:` as a UF key.

---

## 3. Code citations (`store.js`)

### 3.1 `coalesceKeysForFinding` (~L309–L355)

```text
* Bound #1: NEVER emit title: — title is secondary annotation only, never a sole coalesce key.
…
// title intentionally omitted — use coalesceTitleKey as secondary check only
… keys.add(`viaf:…`) / keys.add(`qid:…`) / keys.add(`ol:…`) only
```

Sources scanned: `entityRefs`, evidence provenance URLs, finding.id hooks (`viaf-`, `wd-Q`, `ol-`).

### 3.2 `corroborateBySoftLabel` / `coalesceBySoftEntity` (~L409–L613)

```text
* EXP-A2 Bound #1: attach cross-family Evidence onto Findings that share STRONG
* typed soft-refs (viaf / qid / ol). Title is NEVER a sole coalesce key — only a
* secondary annotation/check on the edge. Fingerprint dedupe is upstream.
…
// Bound #1: UF only on strong typed keys (viaf:/qid:/ol:) — never title:
if (k.startsWith('title:')) continue; // defense-in-depth
…
titleSecondary ∈ {agree, disagree, absent}  // annotation only
mode: 'attach_keep'
```

`coalesceBySoftEntity` ≡ `corroborateBySoftLabel` (alias ~L612).

### 3.3 Fingerprint (orthogonal, upstream)

`dedupeByEvidenceFingerprint` (~L101+) runs **before** coalesce in orchestrator S5. Shared fingerprint satisfies “fingerprint OR typed soft-ref” without putting fingerprint into UF keys.

### 3.4 `labelRelationship` (~L386–L406)

Vocabulary: `same-source` | `same-reference` | `same-entity` | `related-entity` | `possible-match` | `unknown`.  
Contract ceiling for A2-safe **attach**: **`same-reference`** — see `01-DEFINITION-ארכיטקט.md` §2–3.

---

## 4. Coalesce key inventory (locked)

| Key family | UF coalesce? | Secondary only? | Status |
|------------|--------------|-----------------|--------|
| `viaf:` | YES | — | Bound#1 ALLOW |
| `qid:` | YES | — | Bound#1 ALLOW |
| `ol:` | YES | — | Bound#1 ALLOW |
| evidenceFingerprint | Upstream dedupe | — | Orthogonal ALLOW |
| `title:` / `coalesceTitleKey` | **NO** | YES (`titleSecondary`) | Bound#1 DENY as sole key |
| softLabel subset | **NO** | — | DENY (vacuum class) |

---

## 5. A2-safe enrich delta (providers — Server owns detail)

Bound#1 alone → live mean multi **0** (no cross-family typed intersection).  
Typed soft-ref enrich (`dpl_7Mmf…`) adds cross-family refs (VIAF WKP/QID, WD P214→viaf, OL remote_ids) **without** restoring `title:` keys.  
Server smoke mean multi **0.2408** · leak **0** — **smoke only; Acc/QA not claimed**.

See `03-IMPL-DIFF-שרת.md` for provider helper names and unit counts.

---

## 6. DESIGN.md lag

`PHASE4-EXPERIMENT-A2-COALESCE/DESIGN.md` still documents exact title + typed keys as coalesce keys (pre-Bound#1). **Code is authoritative.** Reconcile Design before any promote discussion.

---

## Path refs

- Prior Arch: `../PHASE4-EXPERIMENT-A2-COALESCE/ARCH-GLANCE-BOUND1-ארכיטקט-2026-09-20.md`
- Prior Arch: `../PHASE4-EXPERIMENT-A2-COALESCE/ARCH-GLANCE-COALESCE-ארכיטקט-2026-09-20.md` (FRNDab caveat)
- Prior Arch: `../PHASE4-EXPERIMENT-A-VIAF/ARCH-RCA-CROSS-FAMILY-MERGE-ארכיטקט-2026-09-20.md`
- Code: `api/lib/discovery/store.js`, `orchestrator.js` (S5), `emit.js` (Acc scrub)

## STOP

**No promote. No code changes from this doc. No EXP-B.**
