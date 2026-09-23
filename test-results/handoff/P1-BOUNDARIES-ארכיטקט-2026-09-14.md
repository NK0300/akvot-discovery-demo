# P1 BOUNDARIES · seed-alias / wikiExact · ארכיטקט · SPEC ONLY
Date: 2026-09-14 | Baseline: dpl_D2zv FROZEN | Mode: MAINTENANCE · no code/dpl

## Locked (do not change in P1)
- Production alias dpl_D2zv
- Single SoT: mayCommitDossier/canCommitIdentity in orchestrator.js
- Evidence threshold 0.75 unchanged
- softAmbiguous / email-phone / COMMON_HE Cohen gate unchanged
- No second commit gate; no lookup bypass of decideStage
- UX FREEZE

## ALLOWED for P1 (implementation later, after Gate)
### A. knownIdentities / seed-alias (class-level)
- Expand KNOWN_IDENTITY_SEEDS + UNIQUE_SURNAME_ALIASES + latinFold aliases
- Nicknames and transliterations that map to ONE canonical QID with public evidence
- Unique surnames ONLY when explicitly listed and disjoint from COMMON_HE
- resolveKnownIdentityQid remains sole seed SoT; lookup imports only

### B. wikiExact (already in Domain)
- Keep HE+Latin wikiExact parity: found+qid+!ambiguous+!softAmbiguous
- Pipeline MUST keep softAmbiguous=true for common Latin names (Smith class)
- Seeded path (wiki.seeded) unchanged

## FORBIDDEN in P1
- Lowering evidence threshold or mayCommitDossier rules to raise recall
- Hardcoded ifs for Assaf / single FAIL cases (P2 backlog, not P1)
- Fuzzy matching without evidence; candidate inflation; alias to ambiguous QID
- Putting COMMON_HE bare names (Cohen/Levi/Peretz alone) into unique-surname set
- Parallel commit logic in lookup.js; duplicate COMMON_HE; changing EVAL expected
- New production dpl without full Release Gate

## Entry contract (for דיוק cases + בודק regression)
| Input class | Expected uiState | Faces | Notes |
|-------------|------------------|-------|-------|
| Canonical HE celeb (Binyamin Netanyahu) | dossier + QID | ok | KEEP |
| Nickname (Bibi / Bibi Netanyahu) | dossier + same QID | ok | P1 alias |
| Unique surname alone when listed (Netanyahu) | dossier + QID | ok | P1 |
| Latin translit celeb (Zehava Galon, Merkel) | dossier + QID | ok | P1 |
| Common HE bare (Danny Cohen) | need_context | 0 | NEVER alias |
| Common Latin bare (John Smith) | need_context | 0 | softAmb |
| Smith+ctx / G11 email | candidates or thin | 0 | no dossier |
| Unknown / junk | need_context or thin | 0 | UNKNOWN stays |
| Ambiguous without evidence | need_context or candidates | 0 | no force match |

## Acceptance (from directive 13)
Recall up AND precision not down AND safety not down AND pretty-wrong=0 AND contract+units+full regression PASS AND SoT+gate remain single.

## Next
1. דיוק: case pack per categories
2. בודק: regression cases before any implement
3. שרת/ממשק: WAIT
4. Implement only after new Gate; Assaf = P2 backlog
