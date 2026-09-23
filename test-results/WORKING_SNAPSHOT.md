# WORKING_SNAPSHOT · akvot-quick-demo · 2026-09-09

**timestamp:** 2026-09-09 ~12:06 Asia/Jerusalem (TAKEOVER STOP)
**git:** not available on demo box (no .git)
**live prod:** https://akvot-simple-demo.vercel.app · last known dpl_5N3G… (foreign-path #1) · P0 commit-gate NOT deployed yet
**code root:** /workspace/akvot-quick-demo

## Files changed (local, pending deploy)
- api/lib/orchestrator.js — mayCommitDossier / canCommitIdentity; COMMON_HE SoT; units expanded
- api/lookup.js — uses Domain mayCommitDossier; no local COMMON_HE duplicate
- index.html — CTA «זה האדם» → «בחר כמועמד להמשך» (P0-4)
- test-results/* — audits, PRIORITY_MATRIX, FIX-P0-commit-gate report

## Current architecture (demo)
Monolith api/lookup.js (~4k LOC) + api/lib/orchestrator.js + stageB.js · single /api/lookup · Vercel serverless · no DB · in-memory cache/rate-limit

## Known bugs (open on prod until P0 dpl)
- P0: Smith+ctx / G11-email → dossier+faces (pretty-wrong) — FIXED LOCALLY, not on prod
- P1: no CI npm test / 12-gate not blocking deploy
- P1: no /api/health; wiki floor ~5.5–5.9s Latin bare

## Tests
- Domain units: 46/46 PASS (local after P0)
- Prod smoke (dpl_5N3G): Cohen/Netanyahu/Smith bare PASS; G11 FAIL; Smith+ctx flaky/pretty-wrong

## Status
DEMO WORKSTREAM mid-sprint. TAKEOVER: STOP coding 10m for STATUS reports. Architect = Coordinator. P0 local ready; CoS withheld deploy GO pending STATUS + CURRENT_STATE.

## Transfer note
Demo ≠ real Origin repo. Classify later A/B/C/D in TRANSFER_PLAN.
