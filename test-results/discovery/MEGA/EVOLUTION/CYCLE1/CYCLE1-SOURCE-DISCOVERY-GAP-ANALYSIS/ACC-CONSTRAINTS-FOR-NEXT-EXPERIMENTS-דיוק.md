# ACC CONSTRAINTS FOR NEXT EXPERIMENTS · דיוק

**Stamp:** 2026-09-20T11:03:09+03:00 (2026-09-20 11:03 IDT)  
**Owner:** דיוק  
**Applies to:** Any next EXP after CYCLE1 Gap Analysis (including candidate EXP-WEB-ORIGIN) — **only after Chief GO**  
**This file does NOT authorize EXP-B.** Status: constraints only · **STOP · NO EXP-B · NO promote**

**Frozen baseline:** A2-safe = APPROVED EXPERIMENTAL (NOT promoted) · A2-bound = REJECTED · B0+Core LOCKED  
Cite: `../A2-EXPERIMENTAL-BASELINE.md` · both A2 packs `STATUS-דיוק.md` (CLOSED / EXPERIMENTAL-BASELINE)

---

## Hard Acc gates (must all PASS)

| # | Gate | Pass condition | Fail ⇒ |
|---|------|----------------|--------|
| G1 | **leak = 0** | Acc scrub leak count = 0 on corpus | BLOCK promote / BLOCK EXP accept |
| G2 | **no title / sim merge** | No title-only, substring, or similarity coalesce keys | REJECT lane (A2-bound class) |
| G3 | **SAME-REFERENCE ceiling** | Experimental typed attach label ≤ SAME-REFERENCE (not SAME-ENTITY) unless Chief reopens Gate | BLOCK |
| G4 | **adversarial homonym** | Homonym corpus false-merge must **not increase** vs frozen A2-safe (false-merge=0) | BLOCK |
| G5 | **S04 / S05 = product limits** | Must not treat S04 multi=0 or S05 multi≈0.1 as Acc FAIL or chase with force-merge | Framing reject |
| G6 | **UNKNOWN preferred** | Missing typed ∩ / soft-ref miss / org-sibling → UNKNOWN / RELATED / POSSIBLE — never invented SAME | BLOCK |
| G7 | **wd+wp ≠ two independents** | Acc hostFamily keeps wikimedia as one | Acc formula lock |
| G8 | **MULTI ≠ objective** | Success criteria must include truth/coverage/authority — multi is secondary metric only | Framing reject |

---

## Vocabulary lock (do not mutate)

```
SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY
```

Inequalities: RELATED≠SAME · POSSIBLE≠SAME · UNKNOWN≠FALSE · UNKNOWN≠SAME · CONTRADICTORY≠SAME

---

## Coalesce lock (A2-safe pattern)

```
attach := |typedKeys(A) ∩ typedKeys(B)| ≥ 1
       ∧ hostFamilyUnion ≥ 2
       ∧ ¬CONTRADICTORY(A,B)
ceiling := SAME-REFERENCE
```

Title secondary agree/disagree = annotation only — **never** attach key.

---

## S04 / S05 — explicit Acc non-goals

| Seed | Frozen Acc | Next EXP must NOT |
|------|------------|-------------------|
| S04 Stripe | multi=0.0 | Title-bridge, sim merge, brand-name force-coalesce, redefine Acc to count islands as multi |
| S05 Red Cross | multi=0.1 | Collapse national/movement/ICRC into one Finding; treat org-disambig as FN bug |

These are **AUTHORITY / GRANULARITY product limits**, not Acc defects.

---

## Adversarial

- Frozen A2-safe: false-merge (homonym) = **0** · adversarial Smith PASS  
- Hardening adversarial pack preserved  
- Any next EXP: adversarial homonym **must not ↑ false-merge** (G4)

---

## What Acc will measure (next EXP pack — when authorized)

1. leak  
2. false-merge / adversarial  
3. title-only key count (=0 required)  
4. mean multi **as metric only** (report; do not optimize as sole objective)  
5. FC catalog deltas (soft-ref holes, islands) — honesty over inflation  
6. Vocabulary label distribution (UNKNOWN vs SAME-REFERENCE)

---

## Explicit non-authorization

- **NO EXP-B** from this document  
- **NO promote** of A2-safe or any successor without Chief GO + Acc gate PASS  
- **NO code** in Gap Analysis phase  
- Historical A2 Acc numbers **IMMUTABLE**

---

## STOP

**Acc constraints frozen for next experiments · READY for Chief · NO EXP-B · NO promote.**
