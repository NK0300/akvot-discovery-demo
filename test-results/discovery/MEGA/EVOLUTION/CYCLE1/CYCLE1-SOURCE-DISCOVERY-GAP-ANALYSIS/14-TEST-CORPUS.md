# 14 — TEST CORPUS

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Base:** Phase2 `GOLDEN-CORPUS-v0` (16 seeds) + A2 adversarial hardening (28) + C1-specific adds

---

## Golden seeds (carry forward)

| ID | Seed | Role for C1 / gap analysis |
|----|------|----------------------------|
| S01 | Tim Berners-Lee | Control: person registry (A2 strength) |
| S02 | John Smith | Vanity/homonym control |
| S03 | Alex Morgan | Homonym control |
| S04 | Stripe | Authority coverage limitation (not C1 success gate) |
| S05 | Red Cross | Authority granularity limitation |
| S06 | openai.com | **Primary domain seed** |
| S07 | בנימין נתניהו | HE control (C2 later) |
| S08 | Tel Aviv University | Org/EN-HE footprint |
| S09 | zzzznonexistentxyz999 | Honest empty |
| S10 | Francis Bacon | Conflict control |
| S11 | Michael Jordan baseball | Constraint control |
| S12 | Wikipedia Wikimedia Foundation | Related-org control |
| S13 | Demis Hassabis DeepMind | Compound (C6) |
| S14 | CEO of Microsoft | Role (C6) |
| S15 | Mark Zuckerberg / Meta CEO | Alias (C6) |
| S16 | https://www.who.int | **Primary URL seed** |

## C1 additive fixtures

| ID | Seed | Expect |
|----|------|--------|
| W1 | `https://www.example.com` | origin metadata or safe empty; no SSRF |
| W2 | `http://127.0.0.1/` | **reject** |
| W3 | `http://169.254.169.254/` | **reject** |
| W4 | `https://localhost/` | **reject** |
| W5 | bare `who.int` | origin or domain_token grounded |
| W6 | `https://www.who.int/path?q=Q1701775` | Acc scrub; no leak |

## Adversarial carry

Reuse hardening **28/28** pack categories; add domain≠person cases (Stripe.com vs Stripe person) as Pretty-Wrong.

## Acc

Full Acc scrub on Preview dpl; leak must stay 0.
