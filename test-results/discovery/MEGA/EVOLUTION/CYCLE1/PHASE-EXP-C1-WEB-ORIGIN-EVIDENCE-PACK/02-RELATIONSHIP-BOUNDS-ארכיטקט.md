# 02 — RELATIONSHIP BOUNDS · web_origin · ארכיטקט

**Owner:** ארכיטקט · CYCLE1 EXP-WEB-ORIGIN (C1) · PREVIEW ONLY  
**Stamp:** 2026-09-20 11:33 IDT (Asia/Jerusalem, UTC+3)  
**Vocab closed set:** SAME-ENTITY | SAME-REFERENCE | RELATED-ENTITY | POSSIBLE-MATCH | UNKNOWN | CONTRADICTORY  
**SoT:** HARDENING `03-VOCABULARY-FINAL-ארכיטקט.md` — C1 **inherits**, does not weaken.

---

## Non-negotiable (C1)

1. **URL/domain NEVER implies SAME-ENTITY.**
2. **`web_origin` = evidence, not identity collapse.**
3. **URL string alone → max `RELATED-ENTITY` or `UNKNOWN`.** Never SAME-* from URL/domain alone.
4. **RELATED ≠ SAME · POSSIBLE ≠ SAME · UNKNOWN ≠ FALSE · UNKNOWN ≠ SAME.**
5. **Attach ceiling remains SAME-REFERENCE** and only via **shared typed soft-ref** (`viaf:` ∪ `qid:` ∪ `ol:`) across hostFamilies — **unchanged from A2-safe.** `web_origin` does **not** mint typed soft-refs.

---

## What each label is allowed when (web_origin context)

### SAME-ENTITY

| | |
|--|--|
| **Allowed?** | **NEVER** under C1 / A2-safe / Preview |
| **Forbidden shortcuts** | Shared domain; same registrableDomain; URL equality; title/og agree; `web_origin:` entityRef; hostname lexical match |
| **Requires** | Future dedicated entity-resolution Gate (out of scope) |

### SAME-REFERENCE

| | |
|--|--|
| **Allowed when** | ≥1 **normalized typed soft-ref** shared across ≥2 **distinct** hostFamilies (`viaf:` / `qid:` / `ol:` only), per HARDENING Bound |
| **NOT allowed when** | Only shared URL string; only shared hostname/registrableDomain; only `web_origin:{domain}` entityRef; seed-is-URL self-cite; title/siteName overlap |
| **Attach?** | YES only on typed soft-ref path — **web_origin alone never creates attach** |
| **C1 note** | A lone `web_origin` Finding citing its own URL is **provenance**, not SAME-REFERENCE. Prefer label **UNKNOWN** (or omit relationship claim) for “this Evidence is about this URL.” |

### RELATED-ENTITY

| | |
|--|--|
| **Allowed when** | Distinct identities / sources with a **documented relatedness signal** that is **not** identity — e.g. org site for a person seed with clear thematic link **and** Arch/observer rationale; **or** hostname appeared as non-URL seed token with weak host↔seed link |
| **Ceiling from URL alone** | If the **only** signal is URL/domain ↔ seed hostname overlap → **RELATED-ENTITY is the MAX** (never SAME-*) |
| **Attach?** | **NO** |

### POSSIBLE-MATCH

| | |
|--|--|
| **Allowed when** | Incomplete **typed** path toward future SAME-REFERENCE (e.g. half-enrich elsewhere) **or** soft lexical overlap between seed tokens and origin meta (title/siteName) **without** typed keys — Preview annotation only |
| **Rules** | ≥2 meaningful seed tokens overlapping title/siteName/host haystack → POSSIBLE-MATCH **ceiling**; **never** upgrades to SAME-* without typed soft-ref intersection |
| **Forbidden** | Threshold-as-identity; attaching on POSSIBLE; domain equality → POSSIBLE as identity hint |
| **Attach?** | **NO** |

### UNKNOWN

| | |
|--|--|
| **Default** | Insufficient evidence for RELATED / POSSIBLE / CONTRADICTORY / SAME-* |
| **Also** | Metadata fetch failed / blocked / weak snippet (no Finding) — if a stub label is needed in telemetry, UNKNOWN |
| **Attach?** | **NO** |

### CONTRADICTORY

| | |
|--|--|
| **Allowed when** | Explicit conflict relevant to identity/attach (e.g. forbidden Acc id; mutually exclusive typed ids claimed as one) |
| **Not auto** | HTTP errors, blocked hosts, weak snippets — those are **failure classes**, not CONTRADICTORY |
| **Attach?** | **NO** |

---

## Decision table (quick)

| Signal present | Max label | Attach |
|----------------|-----------|--------|
| URL/domain only | RELATED-ENTITY or UNKNOWN | NO |
| Seed is the URL (self-cite) | UNKNOWN (provenance) — **not** SAME-REFERENCE | NO |
| Lexical overlap title/site (≥2 tokens) | POSSIBLE-MATCH | NO |
| Lexical overlap (1 token) / host token match | RELATED-ENTITY | NO |
| Shared `viaf:`/`qid:`/`ol:` across families | SAME-REFERENCE | YES (typed path only) |
| Gate-grade multi-signal identity | SAME-ENTITY | NO under C1 (Gate future) |
| Typed key conflict / forbidden id | CONTRADICTORY | NO |

---

## Bound compliance glance (Server Preview code in workspace)

File: `api/lib/discovery/webOrigin.js` → `labelWebOriginRelationship`

| Observation | Arch Bound |
|-------------|------------|
| Comment + path: domain/URL alone never SAME-ENTITY | **COMPLIANT** |
| `seedIsUrl` → returns **`SAME-REFERENCE`** | **BOUND DEVIATION** — URL self-cite must **not** use SAME-REFERENCE; max UNKNOWN (provenance) or RELATED-ENTITY if relatedness argued. **Server should fix before Acc green**; Arch does not rewrite in this pack. |
| Lexical overlap → POSSIBLE-MATCH / RELATED-ENTITY | **ACCEPTABLE Preview ceiling** if attach stays false and coalesce ignores these labels |
| `entityRefs: web_origin:{reg}` | **OK for obs** iff coalesceKeys **exclude** `web_origin:` prefix (verify in checklist) |

---

## STOP

Relationship bounds READY. **HOLD promote.** No identity collapse from URL/domain.
