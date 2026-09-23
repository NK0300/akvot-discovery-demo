# 03 — VOCABULARY (executor finalize)

**Stamp:** 2026-09-20 10:52:51+03:00 IDT  
**Canonical prose:** `03-VOCABULARY-FINAL-ארכיטקט.md` (Arch owns)

## Closed set
SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY

## Deterministic attach rule (A2-safe)
```
attach := |typedKeys(A) ∩ typedKeys(B)| ≥ 1
       ∧ hostFamilyUnion ≥ 2
       ∧ ¬CONTRADICTORY(A,B)
ceiling label on attach := SAME-REFERENCE   # never SAME-ENTITY under A2-safe Gate
titleSecondary agree/disagree → annotation only (code may emit related-entity / same-entity labels — Gate ceiling still SAME-REFERENCE)
```

## CONTRADICTORY
Same typed key claiming incompatible roles (person VIAF vs org QID with conflicting type evidence) OR explicit contradiction list entries that block attach. **Attach := false.** Prefer UNKNOWN over forced SAME.

## Inequalities
RELATED≠SAME · POSSIBLE≠SAME · UNKNOWN≠FALSE · UNKNOWN≠SAME · CONTRADICTORY≠SAME
