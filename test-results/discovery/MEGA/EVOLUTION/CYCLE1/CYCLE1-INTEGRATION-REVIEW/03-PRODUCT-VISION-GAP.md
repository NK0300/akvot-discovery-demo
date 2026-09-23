# 03 — PRODUCT-VISION GAP · CYCLE1 INTEGRATION REVIEW

**Stamp:** 2026-09-20T12:21:00+03:00 IDT  
**Vision:** *Given a seed, discover the richest possible set of public, relevant, evidence-backed information across the web, without inventing relationships.*  
**Mode:** DOCUMENT-ONLY · CURRENT | EVIDENCE | GAP | IMPACT per dimension A–O

---

## A — Discovery breadth

| | |
|--|--|
| **CURRENT** | Narrow surface: 3 B0 adapters (+ VIAF Preview + WEB-ORIGIN Preview). Provider-verbatim seed. |
| **EVIDENCE** | DEFAULT_PROVIDERS=3; coverage proxy 9/15; C1 adds S16 0→1 only for URL path (`03-COVERAGE-GAPS` · `08-COMPARISON-METRICS`). |
| **GAP** | No QueryPlan; no news/filings/scholarly/gov; compound/role empties; HE underused. |
| **IMPACT** | Many true public facts never enter the session; vision “across the web” unmet in production. |

## B — Discovery depth

| | |
|--|--|
| **CURRENT** | One-shot provider search + optional enrich (P214, remote_ids) + C1 one-hop origin metadata. No recursive crawl. |
| **EVIDENCE** | orchestrator one-hop block; C1 limitations §4 one-hop only (`12-KNOWN-LIMITATIONS`). |
| **GAP** | No secondary discovery from discovered IDs as new queries; thin Wikipedia quotes (quote_mean≈0 B0). |
| **IMPACT** | Shallow evidence graphs; users see titles more than rich corroborating quotes. |

## C — Source diversity

| | |
|--|--|
| **CURRENT** | Families: wikimedia · openlibrary · (viaf Preview) · (web_origin Preview). |
| **EVIDENCE** | SOURCE-CAPABILITY-MATRIX · Phase4 SOURCE-TYPE-MAP · mean domains ~1.34 Phase3/4 cite in UX vision note. |
| **GAP** | filings · news · gov_registry · scholarly · archives · RDAP absent. |
| **IMPACT** | Monoculture QD-01; recirculation looks like corroboration. |

## D — Independent corroboration

| | |
|--|--|
| **CURRENT** | B0 multi=0.0; A2-safe mean multi≈0.21 (seed-specific); WD+WP ≠ two independents. MULTI is secondary metric. |
| **EVIDENCE** | A2-EXPERIMENTAL-BASELINE · 05-INDEPENDENCE-GAPS. |
| **GAP** | No generalized independent-source diversity across entity types; S04 multi=0 correct but incomplete for corps. |
| **IMPACT** | Product cannot yet show systematic independent support for most seeds. |

## E — Entity coverage (persons)

| | |
|--|--|
| **CURRENT** | Strongest lane: library/KG persons with authority IDs. |
| **EVIDENCE** | S01 A2 multi≈0.56; VIAF person-rich. |
| **GAP** | Homonyms; HE persons; scholarly-only persons; non-notable. |
| **IMPACT** | Person discovery usable for notables; not generalized. |

## F — Domain coverage

| | |
|--|--|
| **CURRENT** | C1 Preview proves origin metadata for some public HTTPS origins; B0 empty on S16. |
| **EVIDENCE** | S16/W5 recheck; Rel12; bot/WAF soft-fails. |
| **GAP** | Broad domain resolution unmeasured; RDAP absent; no ownership claim (correct). |
| **IMPACT** | URL/domain seeds partially unlocked experimentally; production still B0-empty. |

## G — Org coverage

| | |
|--|--|
| **CURRENT** | Name-string registry hits; granularity preserved (S05); no legal authority IDs for many corps (S04). |
| **EVIDENCE** | S04/S05 authority gaps · A2 hardening forensics. |
| **GAP** | Filings/registries; jurisdiction; brand≠legal. |
| **IMPACT** | Org discovery looks populated but lacks independent legal corroboration. |

## H — Document coverage

| | |
|--|--|
| **CURRENT** | OL authors + incidental WD works; no DOI/ORCID path. |
| **EVIDENCE** | CG-10 · SOURCE matrix scholarly=candidate. |
| **GAP** | Scholarly metadata family. |
| **IMPACT** | Document/work seeds under-served; UNKNOWN corpus rate. |

## I — URL discovery

| | |
|--|--|
| **CURRENT** | C1-PATCHED: discover origin Evidence without suppressing honesty (UNKNOWN). PREPATCH FAIL preserved. |
| **EVIDENCE** | BEFORE-AFTER · DISCOVERY-RECHECK · SEMANTIC-CONTRACT. |
| **GAP** | Production flag off; no crawl; limited host success rate UNKNOWN beyond corpus. |
| **IMPACT** | Principle proved experimentally: URL discovery ≠ identity inference. |

## J — Evidence quality

| | |
|--|--|
| **CURRENT** | Mixed: WD structured; WP thin quotes 100% on B0 samples; OL variable; C1 title/og with ≥40 threshold. |
| **EVIDENCE** | Phase3 weak_evidence_rate≈0.52; Gap Analysis 07-EVIDENCE-GAPS. |
| **GAP** | Quote floors; freshness from source mtime; language fields. |
| **IMPACT** | Ranking/UX can over-trust thin cards. |

## K — Provenance

| | |
|--|--|
| **CURRENT** | providerId · URL · domain · facetHints · hostFamily; Acc scrub of forbidden tokens. |
| **EVIDENCE** | emit/store · UX provenance later note in C1 pack. |
| **GAP** | Independence vs provider-count legibility; emptyReason; language/hostFamily frozen schemas incomplete (Phase3). |
| **IMPACT** | Users may misread provider chips as independent corroboration. |

## L — Contradictions

| | |
|--|--|
| **CURRENT** | `detectContradictions` session-level; vocabulary includes CONTRADICTORY. |
| **EVIDENCE** | Phase3 taxonomy · store.js. |
| **GAP** | Contradiction rate KPI not canonically instrumented as product gate; silent vs labeled near-dup. |
| **IMPACT** | Conflict honesty incomplete for ScoreCARD. |

## M — Unknown handling

| | |
|--|--|
| **CURRENT** | C1 Bound: URL-alone → UNKNOWN (closed). Vocabulary: UNKNOWN first-class. Acc PASS. |
| **EVIDENCE** | SEMANTIC-CONTRACT · Rel12 12/12 · Acc BAD_URL_ALONE_SAME=0. |
| **GAP** | Broader UNKNOWN UX for under-specified / provider-partial / unsupported intent. |
| **IMPACT** | Principle held for URL path; other intents still fuzzy empties. |

## N — Identity safety

| | |
|--|--|
| **CURRENT** | INFORMATION ≠ IDENTITY; SAME-ENTITY forbidden under C1/A2-safe; Acc leak=0; Core pw=0; A2-bound REJECTED. |
| **EVIDENCE** | ACC-PATCHED · CORE-PATCHED · A2 adversarial 28/28 · forbiddenIdentities SoT. |
| **GAP** | Ongoing risk if future sources invent merges or title-bridges. |
| **IMPACT** | Safety is a hard asset — any next experiment must preserve it. |

## O — Operational reliability

| | |
|--|--|
| **CURRENT** | B0 Upstash durable; WRUD ok; provider soft-errors; budgets providerMs/sessionWallMs; rate limits. |
| **EVIDENCE** | PHASE1 FREEZE · health promoteEligible=true. |
| **GAP** | Provider failure rate KPI not uniformly reported per family; Preview egress WAF variance. |
| **IMPACT** | Scaling new families raises rate-limit/ToS/SSRF ops cost. |

---

## Vision tension (one line)

Engineering (B0) optimized **library/KG person lookup with Acc=0**; Vision asks for **maximum public-web discovery with honest UNKNOWN**. Cycle-1 experimentally added VIAF coalesce and WEB-ORIGIN Bound — still far from vision breadth without inventing relationships.
