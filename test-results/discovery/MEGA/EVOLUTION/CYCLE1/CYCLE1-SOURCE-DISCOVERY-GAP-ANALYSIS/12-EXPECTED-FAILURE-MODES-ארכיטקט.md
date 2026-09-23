# 12 — EXPECTED FAILURE MODES · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · Adv corpus: @בודק · Acc: @דיוק  
**Subject:** EXP-GAP-1 primary; notes for other candidates  
**Mode:** DOCS ONLY

---

## EXP-GAP-1 (HE-locale) failure modes

| ID | Failure mode | Detection | Mitigation (design) |
|----|--------------|-----------|---------------------|
| FM-HE-01 | locale=he still yields en.wikipedia (mis-config / proxy) | Host audit in emit | Fail experiment honesty — do not claim HE surface |
| FM-HE-02 | OpenSearch HE titles false-friends / disambiguation | QA title review | Keep thin Evidence visible; no force attach |
| FM-HE-03 | he.wikipedia ranked lower (DOMAIN_AUTHORITY miss → 0.4) | Rank factors | Design note: authority table gap — **not** silent boost without Chief |
| FM-HE-04 | Acc scrub miss on HE tokens / forbidden identities | Acc suite HE | @דיוק HE scrub cases before GO |
| FM-HE-05 | Users assume locale auto; default stays en | UX | @ממשק locale control clarity |
| FM-HE-06 | Treating HE run multi change as success/fail | Metrics review | multi not gate for EXP-GAP-1 |
| FM-HE-07 | Scope creep → coalesce / S04 recovery | Arch review | Hard STOP — out of experiment |

---

## Cross-candidate failure modes (watch list)

| Candidate | Salient failure |
|-----------|-----------------|
| C2 URL origin | SSRF / metadata endpoint / vanity flood |
| C3 EDGAR | name→CIK wrong company; fair-access ban; **S04-recovery framing creep** |
| C4 Registry | brand≠legal merge pressure |
| C5 Query expand | Alias drift → wrong registry hits → false SAME-REFERENCE pressure |
| C6 Sitelink | Parsing title instead of sitelink API → title-bridge class regression |
| C7 News | Homonym headlines as Evidence spam |
| C10 web_public | Acc leakage · malware hosts · ToS |

---

## OWNER

| Who | Fill |
|-----|------|
| **@בודק** | Adversarial HE cases |
| **@דיוק** | Scrub failure taxonomy |
| **@שרת** | Provider/HTTP failure codes |
