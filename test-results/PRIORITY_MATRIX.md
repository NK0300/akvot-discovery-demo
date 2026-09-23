# PRIORITY_MATRIX · 5-hour sprint · 2026-09-09

**War Room lead:** Chief of Staff  
**Sources:** ARCHITECTURE_AUDIT · BACKEND_AUDIT · PRODUCTION_AUDIT · UX_AUDIT · QA_AUDIT (+ STAGE 0 דיוק)  
**ACCURACY_AUDIT:** pending if late — P0 identity findings already covered by QA/Backend/STAGE0

Sprint clock: Hour 1 discovery DONE → Hours 1–2 STABILIZATION (P0+P1 only)

---

## P0 — MUST FIX (this hour)

| ID | Issue | Owner | Files | Expected | Test |
|----|-------|-------|-------|----------|------|
| P0-1 | Pretty-wrong commit: Smith+ctx / G11-email → dossier+faces | שרת (+דיוק review) | api/lookup.js, api/lib/orchestrator.js | dossier/faces only wiki.seeded OR evidence≥T with ≥2 entity-matching sources; email/phone ≠ identity | Contract: Smith+IBM+NY → candidates|need_context **no faces**; Smith+email → thin|need_context|candidates **no faces/dossier** |
| P0-2 | Duplicate COMMON_HE / bare-name gates | שרת (+ארכיטקט) | lookup.js, orchestrator.js | Single source in orchestrator only | Unit: Cohen bare need_context; Levy seeded still dossier |
| P0-3 | Release-blocking HTTP/smoke gate missing | בודק | smoke-12gate / package.json | G11 + Smith+ctx in SAFETY contract; fail = no GO deploy | 12-gate SAFETY includes G11; document in QA |
| P0-4 | UX over-commit copy «זה האדם» + dossier looks too certain | ממשק (+דיוק) | index.html | Soften CTA; no absolute identity language on ambiguous/candidates | Manual: candidates screen copy |

---

## P1 — FIX NOW (if P0 landing)

| ID | Issue | Owner |
|----|-------|-------|
| P1-1 | npm test / CI hook for Domain+12-gate SAFETY | בודק |
| P1-2 | /api/health + requestId in logs/JSON | שרת (prod) |
| P1-3 | evidenceScore entity-match (org/city) before commit | דיוק+שרת |
| P1-4 | UI Domain leak — prefer explicit uiState DTO | ממשק (minimal) |
| P1-5 | Wiki floor ~5.5–5.9s / 429 flaky (measure only unless quick win) | שרת |

---

## P2 — IF TIME
God-file extract · KV cache · Conflicts/Evidence panels · QID without seed

## P3 — FUTURE
Full Investigation Workspace · Graph/Timeline · polish

## KEEP (do not break)
Cohen bare · Netanyahu dossier · Latin bare ~≤8s need_context · wiki.seeded · scrub/SSRF/CSP · Emily not 45s

## Rules
ONE matcher/scoring path — improve, do not duplicate. No fake success. Deploy only after CoS GO + SAFETY smoke.

## Immediate order
1. שרת: implement P0-1 + P0-2 locally  
2. ממשק: P0-4 copy  
3. בודק: P0-3 contract tests (may write tests before/alongside fix)  
4. דיוק: review criteria + ACCURACY_AUDIT if not done  
5. ארכיטקט: gate owners/files — block duplicate engines  
6. CoS: GO deploy only when P0-1/2/3 green
