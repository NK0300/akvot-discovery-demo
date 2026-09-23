# CURRENT_STATE - Akvot mid-sprint TAKEOVER
timestamp: 2026-09-09 ~12:12 IDT | Coordinator: Architect
demo: /workspace/akvot-quick-demo (NOT GitHub SoT)
prod: akvot-simple-demo.vercel.app dpl_5N3G | local P0 NOT deployed

## WHAT WORKS?
- KEEP invariants on prod hold for celebs and Cohen bare
- Local Domain units 46/46 and contract harness present
- Discovery audits and PRIORITY_MATRIX complete

## WHAT IS BROKEN?
- Identity over-commit on ambiguous Latin/email still risk on old prod deploy
- Local Domain gate ready but not live until GO deploy
- No CI block; no health endpoint; memory-only cache

## WHAT CHANGED local vs prod
- Local YES / Prod NO: Domain commit gate, unified COMMON_HE, soft CTA, contract script
- Both YES: FAST foreign-path from prior deploy

## PARTIAL / MOCKED / REAL
- Partial: evidence scoring; UI state re-derive; Investigation UX
- Mocked: no DB/KV; seed map; soft battery judge
- Real: Vercel prod; public registries; Gemini server-side; lookup API

## NOT VERIFIED / NOT TRANSFERABLE
- Not verified: fresh deploy smoke; cross-isolate limits; GitHub handoff
- Transfer: test-results C; env/vercel B; memory maps need KV for A

## A/B/C/D
- A: Domain gate+units, CTA, contract harness, stageB/FAST path
- A/B: lookup wiring into Domain
- B: memory cache/rate-limit; seed map
- C: battery JSON runners
- D: do not reintroduce duplicate COMMON_HE

## COORDINATOR LOCK
- Core commit OWNER=Server until deploy+smoke green
- No parallel edits to orchestrator or lookup commit paths
- Next: Chief PRIORITY then GO deploy Server+UX then QA SAFETY then P1

## STATUS ROLLUP
All agents STOP. P0 local ready. Awaiting PRIORITY/GO.

## RELEASE GATE UPDATE 2026-09-09 ~12:37 IDT
- Deploy: dpl_9V8i on alias (not dpl_5N3G)
- P0 safety: CLEAR (pretty-wrong=0 per Accuracy eval N=16)
- QA: units 46/46 contract 5/5 SAFETY 6/6 GREEN slice
- Accuracy: YELLOW 12/16 — FAIL recall nicknames/Latin celebs (not FP)
- Decision: do NOT lower mayCommit thresholds; P1 = seed-alias / wikiExact transliteration
- SoT: single mayCommitDossier in orchestrator only
- Transfer: Domain gate+CTA+contract = A; seed map expansion = B; in-memory cache = B; test-results = C

## FINAL 2026-09-09: GO candidate dpl_D2zv — see handoff/FINAL-STATE-ארכיטקט-2026-09-09.md
