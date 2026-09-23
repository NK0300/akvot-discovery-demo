# FILE-INDEX — PHASE-EXP-C1-WEB-ORIGIN-EVIDENCE-PACK

**Stamp:** 2026-09-20 12:00 IDT

| File | Purpose |
|------|---------|
| 01-EXPERIMENT-DEFINITION.md | Hypothesis · bounds |
| 01-DATA-MODEL-WEB-ORIGIN-ארכיטקט.md | Arch Finding/Evidence model |
| 01-DESIGN.md | Design notes |
| 02-BASELINE.md | B0/Core/A2 freeze pointers |
| 02-RELATIONSHIP-BOUNDS-ארכיטקט.md | Arch relationship ceilings |
| 03-IMPLEMENTATION-DIFF.md | Preview code paths |
| 03-IMPL-שרת.md | Server impl notes |
| 03-NO-IDENTITY-COLLAPSE-CHECKLIST-ארכיטקט.md | Server Preview checklist |
| 04-TEST-RESULTS.md | Unit + live seed matrix |
| 04-SECURITY-BOUNDS-ארכיטקט.md | Arch security contract |
| 05-ADVERSARIAL-DOMAIN.md/.json | Domain/SSRF corpus |
| 05-ADVERSARIAL-HOMONYM.md | Homonym carry |
| 05-ADVERSARIAL/ | Acc poison + SSRF corpus (דיוק) |
| 05-SEED-MATRIX-בודק-2026-09-20.md/.json | QA seed matrix |
| **05-SEMANTIC-CONTRACT-ארכיטקט.md** | **Arch formal semantic contract (READY)** |
| 06-ACC-RESULTS.md/.json | Acc leak=0 (early) |
| 06-ACC/ | Acc gates + AFTER (דיוק) |
| 06-DOMAIN-ADVERSARIAL-CORPUS-בודק-2026-09-20.md/.json | QA adversarial corpus |
| **06-RELATIONSHIP-TRUTH-TABLE-ארכיטקט.md** | **Arch truth table · expected labels (READY)** |
| 07-CONTROL-VS-TREATMENT-PLAN-בודק-2026-09-20.md | QA C/T plan |
| 07-QA-RESULTS.md | Gate table |
| **07-C1-PREPATCH-VS-PATCHED-ארכיטקט.md** | **C1-PREPATCH 268R vs C1-PATCHED Ho6jg stamp (READY)** |
| 08-COMPARISON-METRICS.md/.json | CONTROL vs TREATMENT · **live Ho6jg recheck 12:00 IDT** |
| **08-DISCOVERY-RECHECK-בודק-2026-09-20.md/.json** | **QA live discovery recheck PASS · S16/W5/S01/S04/S05** |
| 09-REPRESENTATIVE-SUCCESS.md | Useful discoveries |
| 09-RAW-REPRESENTATIVE/ | Raw reps |
| 10-FALSE-POSITIVE-REJECTED.md | Blocked |
| 10-FP-CASES/ | FP cases |
| 11-FALSE-NEGATIVE-AMBIGUOUS.md | Soft / ambiguous |
| 11-FN-CASES/ | FN cases |
| 12-KNOWN-LIMITATIONS.md | Product limits |
| 13-DECISION-RECOMMENDATION.md | HOLD |
| 13-ARCH-GLANCE-STATUS-ארכיטקט.md | Arch glance scorecard |
| 14-SEED-MATRIX.md | Matrix pointer |
| 15-DOMAIN-ADVERSARIAL-CORPUS.md | Chief adversarial list |
| 16-GATES-A-O.md | Acc/Core/SSRF/identity gates |
| 17-REPRESENTATIVES-BUCKETS.md | Bucket index |
| 18-TELEMETRY.md | Telemetry contract |
| 19-REPRODUCIBILITY.md | Commands |
| 20-LATENCY.md | Latency notes |
| 20-PREVIEW.json | Interim Preview (BynXm5i) |
| 21-PREVIEW.json | **C1-PATCHED** Server Bound-FIX Preview (Ho6jg) |
| 21-STOP-NO-PROMOTE.md | Hard stop |
| ARCH-GLANCE-BOUND-FIX-ארכיטקט-2026-09-20.md | Arch Bound re-glance PASS + CAVEAT |
| BOUND-FIX-URL-ALONE-UNKNOWN-שרת.md | Server Bound FIX report |
| CHIEF-EVIDENCE-REPORT.md | Chief brief |
| CORE-LOCK-CHECK.json | Lock + core smoke |
| PREVIEW-DEPLOY.json | Historical PREPATCH dpl (268R) — retained |
| STATUS.md | Pack status (may lag stamps) |
| STATUS-ארכיטקט.md | Arch status · WAITING Acc · HOLD · NO C2 |
| STATUS-שרת.md | Server status · Ho6jg |
| STATUS-דיוק.md | Acc PASS · Bound CLOSED on Ho6jg |
| STATUS-בודק.md | QA status · discovery recheck PASS · STOP Chief |
| FILE-INDEX.md | This file |
| raw/ | Live session JSON + BOUND-FIX + C1-PATCHED-who + runner.log + ACC-SCAN |
| scripts/ | Repro runners · includes `discovery-recheck-בודק-2026-09-20.mjs` |


## C1 Bound-FIX pack addenda (2026-09-20 12:05 IDT)
| Path | Role |
|------|------|
| C1-PREPATCH/ | Scrap Acc FAIL `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` pointers |
| C1-PATCHED/ | Bound FIX `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` pointers |
| SEMANTIC-CONTRACT.md | Closed vocab + Hard Bound |
| RELATIONSHIP-TRUTH-TABLE.md | Chief 12 cases |
| BEFORE-AFTER-EXAMPLES.md | who.int before/after |
| ACC-PATCHED.md | Acc re-AFTER PASS |
| CORE-PATCHED.md | Core 0/0 |
| DISCOVERY-RECHECK.md | Deltas only · labels clean |
| CHIEF-EVIDENCE-REPORT.md | STATUS READY · C1-PATCHED · NO PROMOTE |
| STATUS.md | READY FOR CHIEF REVIEW · C1-PATCHED · NO PROMOTE |
