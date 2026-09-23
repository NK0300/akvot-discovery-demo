# 01 — DEFINITION · EXP-A2-SAFE Identity Labels & Coalesce Keys

**Owner:** שרת · Evidence Pack · CYCLE1 PHASE4  
**Stamp:** 2026-09-20 10:35 IDT (Asia/Jerusalem, UTC+3)  
**Locks:** B0 `dpl_Avyhr…` FROZEN · Core `dpl_8ag…` LOCKED · NO PROMOTE · typed soft-ref ONLY

---

## Identity labels (INFORMATION ≠ IDENTITY)

These labels describe **how Findings relate after Evidence attach**. Coalesce **never collapses Findings into a single same-entity dossier**. Mode is always **attach_keep**.

| Label | Meaning | Coalesce behavior |
|-------|---------|-------------------|
| **same-source** | Same provider / same provenance URL family; Evidence already co-located | No new cross-family attach needed |
| **same-reference** | Share ≥1 **typed** soft-ref key (`viaf:` / `qid:` / `ol:` / shared fingerprint upstream) | **YES** — UF cluster → attach Evidence/providers onto **every** member; KEEP all Findings |
| **same-entity** | Strong identity claim (dossier / single person-org identity) | **NEVER** produced by EXP-A2 coalesce. Acc scrub stays AFTER. Never dossier. |
| **related-entity** | Distinct typed ids; titles/orgs may be related (e.g. American Red Cross vs ICRC) | Stay separate Findings unless a shared typed key exists |
| **possible-match** | High title similarity **without** shared typed id | **REJECT** coalesce · annotate only · remain possible-match / unknown |
| **unknown** | Insufficient typed keys and insufficient corroboration | No merge · no attach |

**Hard rule:** Coalesce may raise Evidence multi-family on Findings that share typed keys (**same-reference** attach). It must **never** collapse Findings to **same-entity**.

---

## Coalesce keys (ALLOW)

| Key form | Example | Source |
|----------|---------|--------|
| `viaf:NNNN` | `viaf:85312226` | VIAF AutoSuggest id; WD P214 enrich; OL `remote_ids.viaf` |
| `qid:Q…` | `qid:Q80` | WD id; VIAF WKP field; OL `remote_ids.wikidata` |
| `ol:KEY` | `ol:OL25245A` | Open Library author key |
| shared fingerprint | (upstream `dedupeByEvidenceFingerprint`) | Orthogonal to soft-ref coalesce |

Legacy forms `wd-Q…` / `ol-…` / `viaf-…` on ids/refs are **normalized into** the typed keys above by `coalesceKeysForFinding`.

---

## Coalesce keys (DENY)

| Forbidden | Why |
|-----------|-----|
| `title:` / title-only exact match | Homonym cross-contam (Arch Bound #1 caveat on FRNDab) |
| Soft-label subset / vacuum merge | EXP-A `dpl_4Rj7c…` S01 10→1 coverage collapse |
| Title similarity alone | High-sim ≠ identity (see `10-FP-CASES.md`) |

Title may appear only as **secondary edge annotation** (`titleSecondary`: `agree` | `disagree` | `absent`) — never as sole coalesce key.

---

## Pretty-Wrong / Acc discipline

- `Stripe` ↛ `Stripe, John` (corp vs person title-key guard)
- Acc scrub AFTER coalesce (`emitSnapshot` / `sanitizeDiscoveryPayload`)
- Forbidden QID / seed-poison leak gate = 0 on measured surfaces
- Core `dpl_8ag…` LOCKED — Discovery B0 alias `dpl_Avyhr…` FROZEN

---

## Canonical Previews (document only)

| Lane | dpl | Role |
|------|-----|------|
| A2 Bound#1 | `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` | Typed keys, no enrich · mean multi≈0 |
| A2-safe enrich | `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9` | Typed soft-ref enrich · mean multi≈0.241 |
| A2 caveat title-bridge | `dpl_FRNDabpFbbLhF4TWTyEKQv8VfEV2` | **NON-promote** path (title: still coalesced) |
| EXP-A VIAF no coalesce | `dpl_H9o45…` / `dpl_4Rj7c…` | Emit-only / vacuum caveat baselines |

---

**Arch companion (do not overwrite):** `01-DEFINITION-ארכיטקט.md` — sufficient-evidence contract / label ceiling.
