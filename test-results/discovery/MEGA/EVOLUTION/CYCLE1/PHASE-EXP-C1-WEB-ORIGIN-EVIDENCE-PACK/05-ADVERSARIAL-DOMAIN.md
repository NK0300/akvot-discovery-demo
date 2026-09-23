# 05 — ADVERSARIAL DOMAIN / SSRF CORPUS

**Stamp:** 20/09/2026, 11:40:51 IDT

| ID | Seed | Expected | Actual | wo | leak |
|----|------|----------|--------|----|------|
| ADV-sub | `https://en.wikipedia.org` | ALLOW/SOFT | NO emit / soft-fail | 0 | 0 |
| ADV-park | `https://example.com` | ALLOW/SOFT | NO emit / soft-fail | 0 | 0 |
| ADV-query | `https://www.who.int/path?utm_source=x&q=1` | ALLOW/SOFT | NO emit / soft-fail | 0 | 0 |
| ADV-www | `https://www.who.int` | ALLOW/SOFT | EMIT wo | 1 | 0 |
| ADV-http | `http://example.com` | ALLOW/SOFT | NO emit / soft-fail | 0 | 0 |
| ADV-private | `http://127.0.0.1/` | BLOCK | NO emit (ok) | 0 | 0 |
| ADV-meta | `http://169.254.169.254/` | BLOCK | NO emit (ok) | 0 | 0 |
| ADV-local | `https://localhost/` | BLOCK | NO emit (ok) | 0 | 0 |
| ADV-internal | `https://metadata.google.internal/` | BLOCK | NO emit (ok) | 0 | 0 |
| ADV-poison | `https://www.example.com/page?qid=Q1701775` | ALLOW+SCRUB | NO emit / soft-fail | 0 | 0 |
| ADV-unrelated | `https://www.w3.org` | ALLOW/SOFT | EMIT wo | 1 | 0 |
| ADV-social | `https://twitter.com` | ALLOW/SOFT | EMIT wo | 1 | 0 |
| ADV-doc | `https://www.rfc-editor.org` | ALLOW/SOFT | EMIT wo | 1 | 0 |
| ADV-archive | `https://web.archive.org` | ALLOW/SOFT | NO emit / soft-fail | 0 | 0 |
| ADV-js | `javascript:alert(1)` | BLOCK | NO emit (ok) | 0 | 0 |

## SSRF suite
All of ADV-private / ADV-meta / ADV-local / ADV-internal / ADV-js → **wo=0** · **PASS**

## Acc poison
ADV-poison (`...?qid=Q1701775`) → leak=0 across payload (Acc scrub / no re-emit of forbidden identity).

## Pretty-wrong / identity
No web_origin finding labeled SAME-ENTITY. Domain/URL alone → SAME-REFERENCE or no emit.
