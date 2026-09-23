# 06 — DOMAIN / URL ADVERSARIAL CORPUS · בודק (QA)

**Owner:** בודק · CYCLE1 EXP-WEB-ORIGIN (C1) · **DOCS ONLY** until Preview `dpl_*`  
**Stamp:** 2026-09-20 11:36 IDT (Asia/Jerusalem, UTC+3)  
**Aligns:** `04-SECURITY-BOUNDS` · `02-RELATIONSHIP-BOUNDS` · `urlSafety.js` contract  
**Locks:** NO promote · A2 FROZEN · no SSRF expansion

---

## Global expected outcomes (Treatment, when live)

| Metric | Pass bar |
|--------|----------|
| Acc leak | **0** (forbidden Q-ids scrubbed; poison in URL query must not surface as identity) |
| SAME-ENTITY from URL/domain | **0** |
| SAME-REFERENCE from URL alone | **0** (seedIsUrl → UNKNOWN provenance per Arch Bound; QA ceiling UNKNOWN) |
| SSRF (private / loopback / metadata / link-local / blocked hosts) | **PASS** 100% BLOCK |
| Normalize | **Deterministic** — same seed → same `normalizedUrl` / Evidence id shape |

---

## Corpus (n=18)

| id | seed / input | class | expect_safety | expect_rel_ceiling | expect_finding | notes |
|----|--------------|-------|---------------|--------------------|----------------|-------|
| ADV-01 | `https://www.examp1e.com` | poison / lookalike host | ALLOW or FAIL_CLASS | UNKNOWN | Y/N | Lookalike digit-l; if public resolve ALLOW+UNKNOWN; never SAME-ENTITY to `example.com` |
| ADV-02 | `https://example.com.evil.example` | poison / lookalike host | ALLOW | UNKNOWN | Y | Subdomain poison pattern; registrableDomain ≠ `example.com`; no identity collapse to victim brand |
| ADV-03 | `https://xn--e1awd7f.com` | unicode / IDN homoglyph | ALLOW or FAIL_CLASS | UNKNOWN | Y/N | **Note:** IDN/punycode — document normalize hostname lower+puny; no SAME-* to Latin lookalike; observe only |
| ADV-04 | `https://еxample.com` | unicode / IDN homoglyph (Cyrillic е) | ALLOW or FAIL_CLASS | UNKNOWN | Y/N | Homoglyph host; must not coalesce with ASCII `example.com` |
| ADV-05 | `javascript:alert(1)` | dangerous scheme | BLOCK | UNKNOWN | N | `dangerous_scheme` |
| ADV-06 | `data:text/html;base64,PHNjcmlwdD4=` | dangerous scheme | BLOCK | UNKNOWN | N | `dangerous_scheme` |
| ADV-07 | `file:///etc/passwd` | dangerous scheme | BLOCK | UNKNOWN | N | `dangerous_scheme` / never fetch |
| ADV-08 | `https://user:pass@example.com/` | credential-in-URL | BLOCK | UNKNOWN | N | `userinfo_forbidden` |
| ADV-09 | `https://example.com/` + path of ≥2000 `/a` chars | oversized path | FAIL_CLASS or BLOCK | UNKNOWN | N | Expect size/normalize reject or `oversized` / path cap — fail closed; no Finding spam |
| ADV-10 | `https://example.com/redirect?url=http://127.0.0.1/` | open redirect pattern | ALLOW (seed) / BLOCK (hop) | UNKNOWN | N* | Seed host may ALLOW; **if** fetch follows redirect to private → `redirect_to_blocked` / `redirect_to_private` · **expected BLOCK if detectable** |
| ADV-11 | `https://bit.ly/qa-c1-ssrf-probe` *(placeholder pattern)* | redirect-to-private | ALLOW (seed) / BLOCK (hop) | UNKNOWN | N* | Document as expected **BLOCK if detectable** on hop re-check; do not require live shortener hit in docs-only phase |
| ADV-12 | `https://127.0.0.1.nip.io/` | subdomain of blocked / DNS rebind class | BLOCK or FAIL_CLASS | UNKNOWN | N | Defense: raw IP reject + blocked patterns; if host resolves private mid-hop → BLOCK |
| ADV-13 | `https://localhost.example.com/` | subdomain wording trap | ALLOW | UNKNOWN | Y | `*.localhost` suffix trap is for `foo.localhost` not `localhost.` as label mid-name — expect ALLOW if public; still UNKNOWN ceiling |
| ADV-14 | `https://metadata.google.internal/` | metadata host | BLOCK | UNKNOWN | N | `blocked_host` |
| ADV-15 | `https://[::1]/` | IPv6 loopback | BLOCK | UNKNOWN | N | Raw IPv6 (`:` in host) rejected |
| ADV-16 | `ftp://example.com/` | non-https scheme | BLOCK / FAIL_CLASS | UNKNOWN | N | `dangerous_scheme` or `scheme_not_https` |
| ADV-17 | `https://www.example.com/page?qid=Q1701775` | Acc poison in URL | ALLOW | UNKNOWN | Y | Fetch OK if public; **Acc leak=0** — scrub forbidden Q-id from telemetry/payloads |
| ADV-18 | `https://kubernetes.default.svc/` | in-cluster / internal | BLOCK | UNKNOWN | N | K8s in-cluster host · `blocked_host` |

\*N* = no successful Finding from blocked hop; telemetry with `safetyDecision.reason` OK.

---

## Class coverage checklist

| Class | IDs | Covered |
|-------|-----|---------|
| poison / lookalike hosts | ADV-01, ADV-02 | ✓ |
| redirect-to-private (document BLOCK if detectable) | ADV-10, ADV-11 | ✓ |
| unicode / IDN homoglyph (note) | ADV-03, ADV-04 | ✓ |
| file:// data: javascript: | ADV-05, ADV-06, ADV-07 | ✓ |
| oversized path | ADV-09 | ✓ |
| credential-in-URL | ADV-08 | ✓ |
| open redirect patterns | ADV-10 | ✓ |
| subdomain of blocked / traps | ADV-12, ADV-13, ADV-14, ADV-18 | ✓ |
| Acc poison scrub | ADV-17 | ✓ |
| IPv6 / ftp extras | ADV-15, ADV-16 | ✓ |

**Count:** 18 ≥ 15 required.

---

## Determinism checks (when Preview live)

1. Run ADV-02 / ADV-17 twice → identical `normalizedUrl` + `wo-{sha256…[0:16]}` id shape.  
2. All BLOCK rows → `resultClass=blocked` (or equivalent) · **zero** Findings with `hostFamily=web_origin`.  
3. Relationship facet never `relationship:SAME-ENTITY` / never SAME-REFERENCE from URL-alone.

## STOP

Adversarial corpus READY · live scores **WAITING Preview** · **HOLD promote**.
