# 04 — IDENTITY VOCABULARY INTEGRATION · A2 + C1 · ארכיטקט

**Stamp:** 2026-09-20 12:22 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · unified SoT across A2 + C1  
**Canonical parents:** HARDENING `03-VOCABULARY-FINAL-ארכיטקט.md` · C1 `05-SEMANTIC-CONTRACT-ארכיטקט.md`

---

## Closed set (unchanged)

1. **SAME-ENTITY**  
2. **SAME-REFERENCE**  
3. **RELATED-ENTITY**  
4. **POSSIBLE-MATCH**  
5. **UNKNOWN**  
6. **CONTRADICTORY**

C1 **inherits** HARDENING vocabulary — does not rename, weaken, or invent labels.

---

## Non-negotiable inequalities

| Rule | Meaning |
|------|---------|
| **RELATED ≠ SAME** | RELATED never licenses SAME-REFERENCE attach or SAME-ENTITY |
| **POSSIBLE ≠ SAME** | POSSIBLE never licenses attach |
| **UNKNOWN ≠ FALSE** | UNKNOWN is first-class insufficient evidence |
| **UNKNOWN ≠ SAME** | UNKNOWN never upgrades to SAME-* without new typed evidence |
| **URL ≠ typed id** | URL / host / domain / origin / page / seed-URL alone are **not** typed soft-refs |

---

## Unified ceilings

| Context | Attach allowed? | Max identity claim from that signal alone |
|---------|-----------------|-------------------------------------------|
| Shared typed soft-ref (`viaf:` / `qid:` / `ol:`) across families | **YES** → label **SAME-REFERENCE** | SAME-REFERENCE (not SAME-ENTITY) |
| Title / string sim / `title:` key | **NO** | — (A2-bound REJECTED) |
| URL / hostname / domain / normalize / web_origin alone | **NO** | **UNKNOWN** (C1 Bound CLOSED) |
| RELATED / POSSIBLE / CONTRADICTORY signals | **NO** attach | As labeled |

---

## SAME-REFERENCE (single definition for A2+C1)

**SAME-REFERENCE** iff ≥1 **canonical typed soft-ref** is shared across ≥2 distinct hostFamilies.

**NOT evidence for SAME-REFERENCE:** same URL · same host · same registrableDomain · same origin · same page · metadata seed · URL-normalize equivalence alone · `web_origin:{domain}` entityRef · seed-is-URL self-cite · title agree.

---

## UNKNOWN (mandatory cases under C1)

URL seed alone · bare host alone · domain alone · normalize-alone · seed-is-URL self-cite / provenance echo → **UNKNOWN**.

Principle: **useful may stay UNKNOWN**.

---

## Transition matrix (summary)

| From → To | Allowed? |
|-----------|----------|
| UNKNOWN → POSSIBLE (typed half-enrich) | YES |
| POSSIBLE → SAME-REFERENCE (shared typed key) | YES |
| URL-alone → SAME-* | **FORBIDDEN** |
| SAME-REFERENCE → SAME-ENTITY under A2/C1 | **FORBIDDEN** (needs future Gate) |
| CONTRADICTORY → SAME-* | **FORBIDDEN** without resolving conflict |
| Title/sim → SAME-* | **FORBIDDEN** |

---

## Integration statement

> A2 proved **when** typed soft-refs license SAME-REFERENCE attach.  
> C1 proved **that** web provenance must **not** pretend to be typed identity.  
> Together: **INFORMATION ≠ IDENTITY** · provenance family ≠ identity shortcut.

---

## STOP

Vocabulary is **FROZEN** with A2 + C1 experimental baselines. No silent renames in next work without Chief GO + Arch revise.
