# 10 — FAILURE MODEL · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · isolation · UNKNOWN valid

---

## Failure classes

| Class | Meaning | Typical handling |
|-------|---------|------------------|
| `provider_unavailable` | Host down / DNS / 5xx | Soft-fail family; continue others |
| `rate_limited` | 429 / fair-access throttle | Back off family; do not steal other budgets silently |
| `timeout` | Exceeded maxProviderMs | Soft-fail call; record latency |
| `empty` | 200 but no usable hits | Valid; may keep intent unsatisfied |
| `malformed` | Unparseable payload | Soft-fail; no partial poison into graph without validation |
| `blocked_url` | urlSafety / policy block | No fetch; telemetry; not CONTRADICTORY |
| `unsafe_url` | SSRF / private / metadata IP | Hard block; Acc/security gate |
| `contradictory_evidence` | Explicit typed/id conflict | `contradicts` edge; no attach |
| `unsupported_entity_type` | Family cannot serve seedClass | Skip family with reason |
| `budget_exhausted` | Cap hit | Stop further fanout; partial OK |

---

## Isolation rules

1. **One family fail ≠ corrupt others** — shared session remains consistent.  
2. Failures do not rewrite QueryPlan history; they annotate execution records.  
3. Malformed provider payloads never bypass Acc scrub / fingerprint validation.  
4. HTTP/transport failures are **not** auto-CONTRADICTORY (C1 semantic contract).  
5. **UNKNOWN is valid** — empty discovery is not a license to invent SAME-*.

---

## Mapping to existing substrate

- Provider soft-fail pattern in orchestrator/providers — KEEP  
- `failureInject` / `faultInject` for tests — KEEP for Preview validation later  
- urlSafety blocks — KEEP  
- Session store failure classes — orthogonal durability  

---

## User-visible honesty

Prefer explicit `providerStatus: error|partial|skipped|empty` over silent omission. Vanity findingsCount must not hide failure classes.
