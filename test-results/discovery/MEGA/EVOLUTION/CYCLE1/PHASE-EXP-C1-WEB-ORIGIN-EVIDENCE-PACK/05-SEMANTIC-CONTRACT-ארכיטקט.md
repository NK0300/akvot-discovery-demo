# 05 — SEMANTIC CONTRACT · web_origin labels · ארכיטקט

**Owner:** ארכיטקט (Arch) · CYCLE1 EXP-WEB-ORIGIN (C1) · **DOCS ONLY**  
**Stamp:** 2026-09-20 11:53 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** PREVIEW ONLY · **HOLD promote** · **NO C2–C6** · B0/Core **LOCKED** · A2 **FROZEN**  
**C1 gate:** **NOT PASS** until Acc confirms · Arch Bound glance on C1-PATCHED is not Acc PASS  
**Inherits:** `02-RELATIONSHIP-BOUNDS-ארכיטקט.md` · HARDENING vocab SoT · Bound FIX (`ARCH-GLANCE-BOUND-FIX-ארכיטקט-2026-09-20.md`)  
**Companion:** `06-RELATIONSHIP-TRUTH-TABLE-ארכיטקט.md` · `07-C1-PREPATCH-VS-PATCHED-ארכיטקט.md`

---

## Closed vocabulary (unchanged)

`SAME-ENTITY` | `SAME-REFERENCE` | `RELATED-ENTITY` | `POSSIBLE-MATCH` | `UNKNOWN` | `CONTRADICTORY`

C1 **inherits** HARDENING vocab — does not weaken, rename, or invent labels.

---

## Non-negotiable principle

> A useful finding may stay **UNKNOWN**.  
> **Never** upgrade certainty because the finding was discovered via URL / host / domain / page / origin / metadata / seed-as-URL.

`web_origin` = **evidence / provenance family**, not an identity shortcut.

---

## SAME-REFERENCE (canonical definition)

| | |
|--|--|
| **Means** | **SAME-REFERENCE** iff ≥1 **canonical typed soft-ref** is shared across ≥2 distinct hostFamilies |
| **Typed ids only** | `qid:` (Wikidata QID) · `viaf:` (VIAF) · `ol:` (Open Library) — normalized per A2-safe Bound |
| **NOT evidence for SAME-REFERENCE** | Same URL · same host · same registrableDomain · same origin · same page · same metadata seed · URL-normalize equivalence alone · `web_origin:{domain}` entityRef · seed-is-URL self-cite |
| **Attach** | YES only on the typed soft-ref path — **never** from `web_origin` alone |

**URL-alone / hostname-alone / domain-alone / normalize-alone → `UNKNOWN`.**  
Not RELATED. Not POSSIBLE. Not SAME-*.

---

## Label ceilings under C1 (`web_origin` context)

### SAME-ENTITY

| | |
|--|--|
| **Allowed?** | **FORBIDDEN** under C1 / A2-safe / Preview |
| **Forbidden shortcuts** | Shared URL/host/domain/origin; title/og agree; `web_origin:` entityRef; hostname lexical match; seed-is-URL |
| **Requires** | Future dedicated entity-resolution Gate (out of scope) |

### SAME-REFERENCE

| | |
|--|--|
| **Allowed when** | Shared canonical typed id (`qid:` ∪ `viaf:` ∪ `ol:`) across distinct hostFamilies |
| **Forbidden when** | Only URL / host / domain / normalize / metadata / seed-URL overlap |
| **From URL alone** | **FORBIDDEN** — must emit **UNKNOWN** (provenance), never SAME-REFERENCE |

### RELATED-ENTITY

| | |
|--|--|
| **Allowed when** | **Independent explicit typed evidence** of relatedness beyond URL/host/domain — e.g. non-URL seed + documented thematic link with Arch/observer rationale, **or** extra typed signal that is **not** identity |
| **Not allowed from** | URL seed alone · bare host alone · domain alone · normalize-alone · same-URL two findings · same-host different paths (alone) |
| **Attach** | **NO** |

### POSSIBLE-MATCH

| | |
|--|--|
| **Allowed when** | Incomplete path toward future SAME-REFERENCE (partial typed enrichment) **or** soft lexical overlap (non-URL seed ↔ title/siteName) **without** typed key intersection — Preview annotation only |
| **Ceiling** | Never upgrades to SAME-* without typed soft-ref intersection |
| **Not allowed from** | URL/host/domain/normalize alone |
| **Attach** | **NO** |

### UNKNOWN

| | |
|--|--|
| **Default** | Insufficient independent typed evidence for RELATED / POSSIBLE / CONTRADICTORY / SAME-* |
| **Mandatory** | URL seed alone · bare host alone · domain alone · normalize-alone · seed-is-URL self-cite / provenance echo |
| **Also** | Soft-fail / blocked / weak snippet with no Finding — telemetry stub may be UNKNOWN |
| **Attach** | **NO** |
| **Principle** | UNKNOWN ≠ FALSE · UNKNOWN ≠ SAME · **useful may stay UNKNOWN** |

### CONTRADICTORY

| | |
|--|--|
| **Allowed when** | Explicit conflict relevant to identity/attach (forbidden Acc id; mutually exclusive typed ids claimed as one) |
| **Not auto** | HTTP errors · blocked hosts · weak snippets (failure classes, not CONTRADICTORY) |
| **Attach** | **NO** |

---

## Upgrade rules (hard)

| From signal | May become | Never become |
|-------------|------------|--------------|
| URL / host / domain / normalize alone | **UNKNOWN** only | RELATED · POSSIBLE · SAME-REFERENCE · SAME-ENTITY |
| URL + shared typed QID/VIAF/OL (across families) | SAME-REFERENCE (typed path) | SAME-ENTITY (still forbidden under C1) |
| Non-URL seed + extra relatedness evidence | RELATED-ENTITY (max without typed id share) | SAME-* |
| Lexical overlap without typed keys | POSSIBLE-MATCH (ceiling) | SAME-* |
| Typed key conflict / forbidden id | CONTRADICTORY | SAME-* |

**Never upgrade** because discovery path was URL-based.

---

## Coalesce / attach

| Key | Rule |
|-----|------|
| Typed soft-refs | `viaf:` · `qid:` · `ol:` only |
| `web_origin:{reg\|host}` | Observability only — **excluded** from coalesce soft-ref set |
| Attach on RELATED / POSSIBLE / UNKNOWN / CONTRADICTORY | **NO** |
| Attach on SAME-REFERENCE | YES — typed path only |
| Attach on SAME-ENTITY | **NO** under C1 |

---

## Compliance pointer (Server Bound FIX)

| Path | Contract expectation |
|------|----------------------|
| `labelWebOriginRelationship` | `seedIsUrl` / hostname-alone → **UNKNOWN** |
| `clampWebOriginRelationship` | Defense: NEVER emit SAME-* on `web_origin` finding/evidence/facets |
| Orchestrator graph edge default | `unknown` (not same-reference) |
| Units | URL-alone seeds assert UNKNOWN; never SAME-* |

Stamp / dpl history: see `07-C1-PREPATCH-VS-PATCHED-ארכיטקט.md`.

---

## STOP

Semantic contract **READY**. C1 **WAITING Acc**. **HOLD promote. NO C2. NO Acc PASS claim.**
