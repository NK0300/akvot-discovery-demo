# RELATIONSHIP TRUTH TABLE — Chief 12 cases · C1-PATCHED

**Stamp:** 2026-09-20 12:05 IDT  
**dpl:** `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w`  
**Verdict:** **PASS** · 12/12 Bound-OK  
**Bound:** URL/hostname-alone → max UNKNOWN; never SAME-* from URL alone

| ID | Seed | Expect | Live wo rel | Bound | Note |
|----|------|--------|-------------|-------|------|
| R01 | `https://www.who.int` | UNKNOWN | UNKNOWN | PASS | wo≥1 UNKNOWN; zero SAME-* |
| R02 | `who.int` | UNKNOWN | UNKNOWN | PASS | wo≥1 UNKNOWN; zero SAME-* |
| R03 | `https://www.example.com` | UNKNOWN_OR_NONE | — | PASS | no wo emit; zero SAME-* |
| R04 | `example.com` | UNKNOWN_OR_NONE | — | PASS | no wo emit; zero SAME-* |
| R05 | `https://www.microsoft.com` | UNKNOWN | UNKNOWN | PASS | wo≥1 UNKNOWN; zero SAME-* |
| R06 | `openai.com` | UNKNOWN_OR_NONE | — | PASS | no wo emit; zero SAME-* |
| R07 | `https://en.wikipedia.org/wiki/John_Smith` | UNKNOWN_OR_NONE | — | PASS | no wo emit (soft-fail/cite-or-drop); zero SAME-* — Bound OK |
| R08 | `https://www.wikidata.org/wiki/Q80` | UNKNOWN_OR_NONE | — | PASS | no wo emit (soft-fail/cite-or-drop); zero SAME-* — Bound OK |
| R09 | `https://viaf.org/viaf/85312226` | UNKNOWN_OR_NONE | — | PASS | no wo emit (soft-fail/cite-or-drop); zero SAME-* — Bound OK |
| R10 | `https://www.example.com/page?qid=Q1701775` | UNKNOWN_OR_NONE | — | PASS | no wo emit; zero SAME-* |
| R11 | `Tim Berners-Lee` | NO_URL_ALONE_SAME | — | PASS | no URL-alone SAME-* on wo |
| R12 | `http://127.0.0.1/` | BLOCK | — | PASS | SSRF blocked; no wo |

## Decision quick-table (Arch/QA)
| Signal | Max label | Attach |
|--------|-----------|--------|
| URL/domain only | **UNKNOWN** | NO |
| Seed is the URL (self-cite) | **UNKNOWN** | NO |
| Lexical title/site ≥2 tokens (non-URL seed) | POSSIBLE-MATCH | NO |
| Lexical 1 token / weak host token (non-URL seed) | RELATED-ENTITY | NO |
| Shared viaf/qid/ol across families | SAME-REFERENCE | YES (typed path) |
| Gate-grade multi-signal identity | SAME-ENTITY | **NO under C1** |
| SSRF / blocked host | (no emit) | NO |

Raw: `raw/relationship-12/SUMMARY.json`
