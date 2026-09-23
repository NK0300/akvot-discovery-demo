# WP3 · ACC NO-GO · CHIEF ORDER · 2026-09-19 ~22:57 IDT

**DECISION:** FAIL → PRESERVE → ROOT CAUSE → (later) FIX → REGRESSION → RE-GATE  
**PROD:** `dpl_7vAA…` FROZEN · NO deploy/patch/Core/cache/denylist  
**WP3:** FAIL / HOLD · Acc Gate FAIL  
**WP4:** NO GO  

## Hard stop
L2-C / L2-D stopped. No further load/failure streams.

## Required now
1. Evidence pack (L2-A/B + Acc STOP + Acc×3 quiet + full Smith failure state)
2. Minimal reproduction of Q1701775#1 with faces=0 → pw=1
3. Root-cause report (hypothesis + Evidence) — **no fix execution**
4. Proposed fix only (written)

## Questions for RCA
- How can Q1701775 rank #1 when faces=0?
- Why doesn't faces=0 block binding/ranking leak?
- candidate selection / cache / race / fallback / classification paths?
