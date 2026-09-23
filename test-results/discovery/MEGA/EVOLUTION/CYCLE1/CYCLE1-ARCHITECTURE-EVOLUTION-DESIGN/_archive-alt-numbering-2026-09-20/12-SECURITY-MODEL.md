# 12 — SECURITY MODEL · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · orthogonal to discovery logic · reuse urlSafety / Acc

---

## Threats & controls

| Threat | Control |
|--------|---------|
| SSRF / private net / metadata IPs | `urlSafety.assertSafePublicHttpsUrl` before every fetch; C1 SSRF PASS must hold |
| Open redirects abuse | `maxRedirects` + re-validate each hop |
| Untrusted URLs | UrlOriginStage treats content as untrusted metadata; no identity upgrade |
| Response-size bombs | `maxResponseBytes`; truncate/soft-fail |
| Provider abuse / ban risk | Budgets, rateLimitClass, fair-access policies |
| Query injection | Structured lookups where possible; seed length caps (`MAX_SEED_CHARS`); no eval of seed |
| Credential isolation | No Discovery provider creds in browser; server env only; never in plan JSON emit |
| Cross-session leakage | Session ids unguessable; store isolation; Acc scrub |
| Poisoned metadata | og/title treated as untrusted; ceiling POSSIBLE-MATCH; never SAME-*; Acc poison patterns (e.g. Q1701775) gated |
| Acc identity leakage | sanitizeDiscoveryPayload on all emit surfaces including plan summaries |

---

## Orthogonality

Security controls are **not** discovery ranking features. A safe empty result beats an unsafe rich result.

---

## Core lock

Discovery orchestration MUST NOT call Core identity commit / `mayCommitDossier`. Core Acc P0 remains LOCKED and unmodified by this design.
