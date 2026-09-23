## I. Security pass (PR-CLOSEOUT)

**Owner:** Acc+QA · **Verdict:** **PASS** (Preview controls) · residuals accepted for Preview

### I.1 Proven controls
SSRF/URL https-only · private IP/localhost/metadata blocked · suffix traps · oversized/malformed create rejected on live Preview · rate-limit unit · session scrub isolation · no secrets in Acc evidence files (`kvCredsPresent` boolean only).

### I.2 Live rejects
| Probe | Error |
|-------|-------|
| oversized seed | seed exceeds 500 chars |
| empty seed | seed required |
| huge hints | hints too large |

### I.3 Residuals (do not block this Acc pack; block promote later)
Unauthenticated session read · process-local rate limit · no DNS-rebinding resolve gate · CORS `*`.

### I.4 Evidence
`SECURITY-PASS.md` / `.json` · `../SECURITY-AUDIT.md` · `urlSafety.js` / `requestGuards.js`

### I.5 Gate mapping
Supports Security Preview gate. **HOLD promote.**
