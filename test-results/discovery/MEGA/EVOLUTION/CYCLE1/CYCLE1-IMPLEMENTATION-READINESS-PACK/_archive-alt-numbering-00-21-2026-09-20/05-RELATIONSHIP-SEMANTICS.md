# 05 — RELATIONSHIP SEMANTICS · Chief Gate E

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** SoT 05 · 06 · 07 · 15 · C1 `02-RELATIONSHIP-BOUNDS` · `06-RELATIONSHIP-TRUTH-TABLE` · A2-safe FROZEN · A2-bound REJECTED  
**Vocab closed:** SAME-ENTITY | SAME-REFERENCE | RELATED-ENTITY | POSSIBLE-MATCH | UNKNOWN | CONTRADICTORY

---

## 1. Preservation axioms (non-negotiable)

| Axiom | Meaning |
|-------|---------|
| **UNKNOWN ≠ FALSE** | Absence of proof is not disproof |
| **INFORMATION ≠ IDENTITY** | Useful metadata is not entity truth |
| **DISCOVERY ≠ IDENTITY** | Finding a page/ref is not SAME-ENTITY |
| **RELATED ≠ SAME** · **POSSIBLE ≠ SAME** | Soft signals never attach |
| **No identity inference from architecture** | Pipeline shape must not imply identity |

---

## 2. When SAME-ENTITY is legal

| Context | Legal? |
|---------|--------|
| Experimental Discovery lanes (A2/C1/QueryPlan Preview) | **NEVER** |
| URL/domain/title/og/host overlap | **NEVER** |
| Future dedicated Core ER Gate | Out of scope this pack; would require separate Chief GO |

**Implementation contract:** classifier MUST NOT emit SAME-ENTITY under Discovery experimental/Preview lanes. Gate: SAME-ENTITY count = 0.

---

## 3. When SAME-REFERENCE is legal

**ONLY when:** ≥1 normalized typed soft-ref shared across ≥2 **distinct hostFamilies**, keys ∈ {`viaf:`, `qid:`, `ol:`} (A2-safe Bound).

**NOT legal when:**

- URL/hostname/registrableDomain alone  
- `web_origin:` entityRef / seed-is-URL self-cite  
- Title / siteName / og lexical overlap  
- Same hostFamily (e.g. WD+WP both wikimedia) pretending independence  

**Attach?** YES only on typed path. Ceiling = SAME-REFERENCE.

C1-PREPATCH SAME-REFERENCE-on-URL-alone = **KEEP FAIL** — must not regress (SoT 06).

---

## 4. When UNKNOWN is mandatory

| Signal | Label |
|--------|-------|
| Insufficient evidence for RELATED/POSSIBLE/CONTRADICTORY/SAME-* | **UNKNOWN** |
| URL/domain alone (C1-PATCHED Bound) | **UNKNOWN** (preferred over RELATED when Bound says URL-alone→UNKNOWN) |
| Seed-is-URL self-cite provenance | **UNKNOWN** |
| Fetch blocked/empty/soft-fail stub | **UNKNOWN** (not CONTRADICTORY) |
| Ambiguous/compound seeds with no typed intersection | **UNKNOWN** / empty OK |

**C1 Bound FROZEN:** URL-alone → UNKNOWN · BAD_URL_ALONE_SAME=0.

---

## 5. RELATED-ENTITY · POSSIBLE-MATCH · CONTRADICTORY

| Label | When | Attach? |
|-------|------|---------|
| RELATED-ENTITY | Documented relatedness ≠ identity; URL-alone max was RELATED in pre-patch tables — **C1-PATCHED prefers UNKNOWN for URL-alone** | NO |
| POSSIBLE-MATCH | Incomplete typed path OR soft lexical overlap (≥2 tokens) without typed keys | NO |
| CONTRADICTORY | Explicit typed/id conflict; Acc-forbidden id claimed | NO |

HTTP/transport failures are **failure classes**, not CONTRADICTORY (SoT 10 · C1).

---

## 6. No-edge rule

If the system cannot cite provenance for a relationship → **omit edge** or emit explicit `unknown` edge — never invent (SoT 07).

---

## 7. Decision table (implementation)

| Signal present | Max label | Attach | Edge |
|----------------|-----------|--------|------|
| Typed soft-ref ∩ across ≥2 hostFamilies | SAME-REFERENCE | YES | same-reference |
| URL/domain only | UNKNOWN | NO | unknown |
| Seed-is-URL self-cite | UNKNOWN | NO | unknown / omit |
| Lexical title/og ≥2 tokens | POSSIBLE-MATCH | NO | possible-match |
| Documented relatedness w/ rationale | RELATED-ENTITY | NO | related-entity |
| Mutually exclusive typed ids | CONTRADICTORY | NO | contradicts |
| Insufficient | UNKNOWN | NO | unknown / omit |
| Any path to SAME-ENTITY under Preview | **FORBIDDEN** | — | — |

---

## 8. Architecture must not invent identity

QueryPlan, family orchestration, budgets, SSE ordering, and graph layout are **orchestration**. They never authorize SAME-ENTITY, ownership, or title-bridge (SoT 17 · Gate H).
