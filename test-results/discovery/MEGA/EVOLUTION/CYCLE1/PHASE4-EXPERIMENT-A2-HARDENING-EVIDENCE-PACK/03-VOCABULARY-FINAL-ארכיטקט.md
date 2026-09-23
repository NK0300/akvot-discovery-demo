# 03 — VOCABULARY FINAL · ארכיטקט

**Owner:** ארכיטקט · Project A · **Arch owns this vocabulary**  
**Stamp:** 2026-09-20 10:47 IDT (Asia/Jerusalem, UTC+3)  
**Canonical Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`  
**Locks:** HOLD promote · NO alias · NO EXP-B · B0 FROZEN · Core LOCKED · A2-bound REJECTED

---

## Exact terms (closed set)

1. **SAME-ENTITY**  
2. **SAME-REFERENCE**  
3. **RELATED-ENTITY**  
4. **POSSIBLE-MATCH**  
5. **UNKNOWN**  
6. **CONTRADICTORY**

### Non-negotiable inequalities

| Rule | Meaning |
|------|---------|
| **RELATED ≠ SAME** | RELATED-ENTITY never licenses SAME-REFERENCE attach or SAME-ENTITY |
| **POSSIBLE ≠ SAME** | POSSIBLE-MATCH never licenses attach |
| **UNKNOWN ≠ FALSE** | UNKNOWN is first-class insufficient evidence — not a failed test |
| **UNKNOWN ≠ SAME** | UNKNOWN never upgrades to SAME-* without new typed evidence |

### A2-safe coalesce ceiling

> **Attach ceiling = SAME-REFERENCE** (multi-provider Evidence via typed soft-ref intersection).  
> **Never invent SAME-ENTITY.** Code `labelRelationship` annotations are provisional, not Gate.

---

## Definitions + transitions

### SAME-ENTITY

| Field | Rule |
|-------|------|
| **Meaning** | Gate-grade claim that Findings name one real-world person/org identity (dossier-eligible). |
| **Evidence required** | Dedicated **entity-resolution Gate** (out of A2-safe scope): multi-signal identity proof beyond typed soft-ref alone. |
| **Allowed sources** | Future Gate only — **not** coalesce, **not** title, **not** Acc multi. |
| **Forbidden shortcuts** | Shared VIAF/QID/OL alone; title agree; `titleSecondary`; graph `related-entity`/`same-entity` annotation; multi_rate. |
| **Deterministic rule** | `SAME-ENTITY := GatePASS(findingA, findingB)`. Under A2-safe: **always false / unset**. |
| **Attach?** | **NO** under A2-safe (ceiling blocks). |

### SAME-REFERENCE

| Field | Rule |
|-------|------|
| **Meaning** | ≥1 normalized typed soft-ref key is shared across ≥2 hostFamilies; Evidence may be unioned (attach_keep). INFORMATION ≠ IDENTITY. |
| **Evidence required** | Intersection of coalesce keys after Bound#1: `viaf:NNNN` ∪ `qid:Q…` ∪ `ol:KEY` nonempty across families; familyUnion ≥ 2. |
| **Allowed sources** | Provider-emitted + typed enrich (VIAF WKP, WD P214, OL remote_ids) — public APIs only. |
| **Forbidden shortcuts** | `title:`; string sim; softLabel subset; single-family only; inventing keys from display names. |
| **Deterministic rule** | `SAME-REFERENCE(A,B) := \|keys(A) ∩ keys(B)\| ≥ 1 ∧ family(A) ≠ family(B)` (via UF component). |
| **Attach?** | **YES** — sole A2-safe allow path. Label on attach edge: SAME-REFERENCE. |

### RELATED-ENTITY

| Field | Rule |
|-------|------|
| **Meaning** | Distinct typed identities that are thematically / organizationally related (movement, work-about-person, national society sibling). |
| **Evidence required** | Distinct keys (no intersection) **plus** human/Arch rationale (shared movement, work citing person, etc.) — **or** code annotation when keys intersect but `titleSecondary=disagree` (provisional only). |
| **Allowed sources** | Observation / QA notes; optional graph annotation. |
| **Forbidden shortcuts** | Using RELATED to attach Evidence; upgrading RELATED → SAME-REFERENCE without shared key; upgrading → SAME-ENTITY. |
| **Deterministic rule** | `RELATED-ENTITY := ¬keyIntersect ∧ relatedness_signal` **OR** provisional annotation. **Attach := false**. |
| **Attach?** | **NO**. |

### POSSIBLE-MATCH

| Field | Rule |
|-------|------|
| **Meaning** | Plausible future SAME-REFERENCE if missing peer / enrich arrives; not proven now. |
| **Evidence required** | Half-enrich (e.g. WD has `viaf:` but VIAF Finding absent); OL title-aligned without remote_ids; incomplete coverage. |
| **Allowed sources** | Forensics / recovery backlog (typed paths only). |
| **Forbidden shortcuts** | Threshold on name similarity; attaching on POSSIBLE; treating as Acc FAIL. |
| **Deterministic rule** | `POSSIBLE-MATCH := typed_signal_incomplete ∧ ¬keyIntersect`. **Attach := false**. |
| **Attach?** | **NO**. |

### UNKNOWN

| Field | Rule |
|-------|------|
| **Meaning** | Insufficient typed evidence to assert SAME-REFERENCE, RELATED, POSSIBLE, CONTRADICTORY, or SAME-ENTITY. |
| **Evidence required** | Absence of decisive typed intersection **and** absence of clear relatedness/homonym call. |
| **Allowed sources** | Default when observers disagree or data sparse (e.g. WP missing ref). |
| **Forbidden shortcuts** | UNKNOWN → reject-as-false; UNKNOWN → SAME-*; forcing a label to “look complete”. |
| **Deterministic rule** | `UNKNOWN := ¬SAME-REFERENCE ∧ ¬CONTRADICTORY ∧ ¬(clear RELATED|POSSIBLE|independent)`. |
| **Attach?** | **NO**. |

### CONTRADICTORY

| Field | Rule |
|-------|------|
| **Meaning** | Evidence argues against identifying / attaching (conflicting typed ids on one component, or explicit contradiction record). |
| **Evidence required** | `ref conflict` on a Finding; or store `contradictions[]` that block identity collapse; or mutually exclusive QIDs claimed as one. |
| **Allowed sources** | Provider conflicts; Acc forbidden-id; contradiction emitter (`same_title_multi_domain` is **informational**, not auto CONTRADICTORY for attach — it reinforces INFORMATION≠IDENTITY). |
| **Forbidden shortcuts** | Ignoring contradiction to keep multi high; using title-agree to override conflicting keys. |
| **Deterministic rule** | `CONTRADICTORY := keyConflict ∨ forbiddenIdentityHit ∨ GateReject`. **Attach := false** (scrub/keep separate). |
| **Attach?** | **NO**. |

---

## Transition matrix (allowed upgrades / downgrades)

| From → To | Allowed? | Requires |
|-----------|----------|----------|
| UNKNOWN → POSSIBLE-MATCH | YES | Documented half-enrich typed signal |
| POSSIBLE-MATCH → SAME-REFERENCE | YES | Peer Finding arrives with **shared typed key** |
| RELATED-ENTITY → SAME-REFERENCE | YES only if | New evidence shows **key intersection** (else FORBIDDEN) |
| SAME-REFERENCE → SAME-ENTITY | **NO** under A2-safe | Needs future Gate |
| ANY → SAME-ENTITY via title/sim | **FORBIDDEN** | — |
| SAME-REFERENCE → RELATED-ENTITY | YES (annotation) | `titleSecondary=disagree` provisional; **attach remains SAME-REFERENCE ceiling** |
| CONTRADICTORY → SAME-* | **FORBIDDEN** without resolving conflict | — |

---

## Mapping to failure classes (forensics)

| Failure class | Default vocab |
|---------------|---------------|
| coalesce_ok (multi-family typed) | **SAME-REFERENCE** |
| missing ref | **UNKNOWN** |
| ref present unsupported | **POSSIBLE-MATCH** or **UNKNOWN** |
| ref conflict | **CONTRADICTORY** |
| normalization failure | **UNKNOWN** / **CONTRADICTORY** if ambiguous parse |
| source limitation | **POSSIBLE-MATCH** |
| graph/coalesce limitation | **UNKNOWN** |
| true independent entity | **UNKNOWN** or **RELATED-ENTITY** (if relatedness clear) — never SAME-* |

---

## STOP

Vocabulary final for A2-safe hardening. Ceiling **SAME-REFERENCE**. **Never invent SAME-ENTITY.**
