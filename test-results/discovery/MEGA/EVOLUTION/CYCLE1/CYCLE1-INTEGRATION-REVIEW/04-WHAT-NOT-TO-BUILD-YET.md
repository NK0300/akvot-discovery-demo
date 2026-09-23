# 04 — WHAT WE SHOULD NOT BUILD YET · CYCLE1 INTEGRATION REVIEW

**Stamp:** 2026-09-20T12:21:00+03:00 IDT  
**Mode:** DOCUMENT-ONLY · premature-work advisory · NO implementation  
**Principle:** Maximize true useful public discovery while remaining honest about UNKNOWN — not inflate metrics.

---

## Premature work board

### 1. Indiscriminate / open-web crawling (`web_public` full crawler)

| | |
|--|--|
| **Temptation** | “Cover the whole web” to close vision gap. |
| **Why premature** | Interface-only / deferred in source matrix; SSRF · ToS · malware hosts · Acc leakage surface · vanity flood. C1 deliberately proved **origin metadata + one-hop only**. No evidence that unbounded crawl improves independent useful discovery without identity theater. |
| **Evidence** | SOURCE-CAPABILITY-MATRIX `web_public` = candidate_deferred; C1 `12-KNOWN-LIMITATIONS` one-hop; Gap Analysis “Do not open full web_public crawler”. |

### 2. Aggressive query expansion / spelling fanout

| | |
|--|--|
| **Temptation** | Raise coverage proxy 9/15 → 12/15 by blasting aliases. |
| **Why premature** | Phase5 marks spelling fanout / relationship hops **NO**. Expansion without intent model increases false-friend titles and Acc surface. Provider-verbatim empties on compound seeds are QueryPlan/intent gaps — not solved by blind expansion. |
| **Evidence** | PHASE5 EXPERIMENT-CANDIDATES defer ENR-01/10; EXPANSION-NOISE-RISKS.md. |

### 3. Identity scoring / “verified person” meters

| | |
|--|--|
| **Temptation** | Turn ranking or multi into confidence of who someone is. |
| **Why premature** | Chief contract: INFORMATION ≠ IDENTITY. SAME-ENTITY forbidden under C1/A2-safe. No Cycle-1 pack proves identity resolution. Core remains locked Acc P0. |
| **Evidence** | SEMANTIC-CONTRACT · PRODUCT-VISION “What NOT to build” · CORE-PATCHED. |

### 4. Title similarity / title-bridge coalesce

| | |
|--|--|
| **Temptation** | Lift multi (A2-bound ~0.52) for org seeds like Stripe. |
| **Why premature** | **A2-bound REJECTED**. Title-only merge invents SAME-REFERENCE without typed soft-refs. S04/S05 are authority coverage/granularity limits — not merge failures. |
| **Evidence** | A2-EXPERIMENTAL-BASELINE · hardening S04/S05 recovery bounds. |

### 5. Domain ownership inference (WHOIS → SAME-ENTITY / org identity)

| | |
|--|--|
| **Temptation** | Treat registrable domain or RDAP registrant as org identity. |
| **Why premature** | C1 Bound: URL/hostname alone → max UNKNOWN; never SAME-* from URL alone. GDPR redaction / privacy services make registrant unreliable. Ownership ≠ discovery provenance. |
| **Evidence** | SEMANTIC-CONTRACT hard Bound · Rel12 · SOURCE matrix RDAP notes. |

### 6. Large-scale scraping (news sites, registries without public API/ToS)

| | |
|--|--|
| **Temptation** | Fast org/news coverage. |
| **Why premature** | Prefer public/legal APIs (SEC fair-access, RDAP, licensed RSS). Scraping raises ban/ToS/legal risk and Acc attack surface before source-family semantics exist. |
| **Evidence** | Gap Analysis prefer public/legal only · ACC-CONSTRAINTS-FOR-NEXT-EXPERIMENTS. |

### 7. Generic AI relevance scoring as discovery authority

| | |
|--|--|
| **Temptation** | LLM ranks or invents “relevant” links to fill empties. |
| **Why premature** | Would blur provenance; risks hallucinated relationships; contradicts evidence-backed vision. Gemini key exists in env inventory for other product surfaces — **not** a Discovery authority source in Cycle-1. No measured Acc-safe AI-relevance experiment. |
| **Evidence** | Vision “without inventing relationships” · PHASE1 env note (key name only) · no Discovery AI provider in DEFAULT_PROVIDERS. |

### 8. Promoting experimental lanes to B0 / alias retarget

| | |
|--|--|
| **Temptation** | Ship A2 or C1 to production Discovery alias. |
| **Why premature** | Explicit HOLD: A2 frozen experimental; C1 approved experimental **NOT PROMOTED**; B0 LOCKED. Promoting without Chief GO collapses Preview safety envelope. |
| **Evidence** | STATUS C1 · A2-EXPERIMENTAL-BASELINE · Chief locks in user brief. |

### 9. QueryPlan implementation in this Integration Review cycle

| | |
|--|--|
| **Temptation** | Immediately code compound/role/URL planning. |
| **Why premature for *this pack*** | Hard lock: **NO QueryPlan implementation** in Integration Review. Architecture question may recommend it as next move — analysis only. |
| **Evidence** | User HARD LOCKS · PHASE5 design-only. |

### 10. Reviving EXP-B / parallel experiments without Chief GO

| | |
|--|--|
| **Temptation** | Parallel HE-locale + filings + news. |
| **Why premature** | Integration Review is STOP for Chief; no new experiments in this pack. Prior STATUS: wait Chief GO. |
| **Evidence** | Gap Analysis freeze checklist · user brief. |

---

## Compact rule

If a change **invents relationships**, **hides UNKNOWN**, **inflates MULTI as the goal**, or **bypasses typed/public evidence** — do not build it yet, regardless of metric attractiveness.
