# FIX GATE · Acc P0 · CHIEF ORDER · 2026-09-19 ~23:17 IDT

**STATUS:** OPEN  
**PROD:** `dpl_7vAA…` FROZEN · NO promote  
**WP3:** FAIL/HOLD · **WP4:** NO-GO  
**RCA base:** F-L2-ACC-001 (candidates emit Q1701775 with faces=0)

## Fixes
1. Candidate sanitization — remove forbidden QIDs before any candidates[] emit (not score downgrade)
2. Acc invariant — forbidden ∉ dossier AND ∉ candidates → pw=0
3. Minimal repro regression (quiet/repeated/COLD/WARM/WD±429)
4. Load regression after minimal PASS
5. Denylist (if used) must be documented: SoT, version, load/update, missing/stale, fail-safe, observability

## Sequence
FIX → UNIT → MIN REPRO → LOAD → ACC GATE → CHIEF REVIEW → Preview → Promote (explicit GO only)

## Evidence pack required
change · RCA mapping · before/after minrepro · regression · load · pw · leakage · artifacts · Preview dpl
