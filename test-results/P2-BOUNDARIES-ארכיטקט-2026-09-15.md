# P2 BOUNDARIES · FINAL · ארכיטקט
Date: 2026-09-15 | Status: **READY** | Baseline FROZEN: `dpl_DNfPZ9oMSzqtjErqYeRtpT2t2fSu`
Aligned: `P2-CASES-דיוק-2026-09-15` · `P2-REGRESSION-CASES-בודק-2026-09-15`
Mode: Architecture approval for local impl · **NO prod dpl** until CoS P2 Release Gate

## Locked from P1 (do not break)
- Production baseline until Evidence + new Gate
- Single SoT: `mayCommitDossier` / `canCommitIdentity` · threshold **0.75**
- softAmbiguous · email/phone ≠ identity · COMMON_HE Cohen gate
- pretty-wrong = 0 · no Sync.me/Truecaller · UX FREEZE
- No second commit gate · no lookup bypass of `decideStage`

## Workstream 1 — Latin / Assaf class (recall)
### Canonical EXPECTED (דיוק)
- **P2-A01** `Assaf Rappaport` / **P2-A03** `אסף רפפורט` → **dossier · Q47507930** (baseline probe already; keep via class, not Assaf-only if)
- Near-miss `Assaf Smith` / `John Rappaport` → not Assaf QID
### ALLOWED
- Class-level `knownIdentities`: Latin public figures with unique full name / unique surname listed explicitly
- Transliteration via `latinFold` (same QID)
- wikiExact Domain path: found+qid+!ambiguous+!softAmbiguous (HE+Latin parity)
- Pipeline keeps softAmbiguous=true for Smith-class Latin
### FORBIDDEN
- `if` / special-case for Assaf alone
- Common surnames in `UNIQUE_SURNAME_ALIASES`
- Lowering mayCommit threshold · fuzzy without QID/evidence · inventing QID
### Acceptance
- דיוק C cases PASS · Smith/Cohen/G11 FP = 0 · P1 regression green

## Workstream 2 — evidence substring → entity-match
### ALLOWED
- Tighten org/city match to token/boundary (not bare URL-path substring noise)
- Prefer structured title/note over raw URL path
- Keep 0.75; may raise org/city match *quality* only
### FORBIDDEN
- Drop 0.75 · drop httpsN>=2 / orgCityOk · email/phone alone as evidence · change uiState contract
### Acceptance
- P2-E01 URL-noise → not dossier · true org+city still can commit when SoT says so · Smith+ctx/G11 non-dossier

## Workstream 3 — ctx-path latency
### ALLOWED
- Measure first (p50/p95 Smith+ctx / email) · then safe cuts within AbortSignal/hardDeadline (Stage B budget, skip Gemini when ≥2 evidenced, cap parallel)
### FORBIDDEN
- Remove safety/evidence for speed · raise hardDeadline without CoS GO · touch commit SoT for micro-opts
### Acceptance
- Before/after numbers documented · no SAFETY/contract regression

## Workstream 4 — observability minimum
### ALLOWED
- `GET /api/health` (or agreed) → ok + build/phase · no secrets
- `requestId` on lookup (header and/or JSON)
### FORBIDDEN
- Log raw PII · expose keys · new infra deps without need
### Acceptance
- health 200 · requestId on lookup · no PII in smoke logs

## Impl guidance for שרת (local only)
1. If P2-A01 already green on baseline → **do not** add Assaf-only code; verify class path + add peer Latin gaps from דיוק only if missing
2. Priority gaps likely: entity-match tighten · health+requestId · latency measure(+safe cut)
3. Units for every Domain/Infra change · **no dpl** until CoS GO

## Owner sequencing
1. ~~דיוק SPEC~~ · ~~Boundaries~~ → **READY**
2. דיוק FINALIZE ALIGNED · בודק coverage ready (no Gate run yet)
3. שרת local impl + units
4. Arch review · דיוק Acc · בודק contract/safety/P1 reg
5. CoS P2 Release Gate → GO/NO-GO → dpl only then → new baseline on Evidence

## Red lines
pretty-wrong · second commit gate · threshold drop · Assaf-only if · Sync.me/Truecaller · UX without blocker · prod dpl before Gate → **STOP**.
