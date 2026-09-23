# 09 — CHIEF RECOMMENDATION · CYCLE1 INTEGRATION REVIEW

**Stamp:** 2026-09-20T12:21:00+03:00 IDT  
**עברית לכותרות · English for technical precision**  
**Mode:** DOCUMENT-ONLY · **NO winner ranking** · STOP for Chief

---

## 1. הערכת ארכיטקטורה נוכחית · Current architecture assessment

**Provider-verbatim + Acc scrub + Preview-flagged adapters** is a **solid Acc-safe substrate** and successfully hosted A2-safe and C1-PATCHED experiments. It is **not sufficient** to scale to Maximum Public-Web Discovery: intent-blind seeds, source monoculture, and authority orphans (S04) are architectural, not tuning, limits.  
**Verdict:** Substrate KEEP · Vision path requires **minimum evolution** (QueryPlan + family orchestration + first-class URL-origin) — analysis only; no impl in this pack.

---

## 2. הפער המוצרי הגדול ביותר · Largest product gap

**Public-web / org-legal / intent breadth vs today’s library/KG person-centric surface.**  
Users still cannot systematically get rich, relevant, evidence-backed public information for URL/role/compound/org-legal seeds on **production** B0. C1 unlocks URL/domain only on Preview.

---

## 3. פער הראיות הגדול ביותר · Largest evidence gap

**Unmeasured generalized coverage** beyond golden corpora: broad domain success rate, document/scholarly coverage, contradiction rate as product KPI, novel-vs-relevant findings definitions only PARTIAL.  
Cycle-1 measured deeply on Acc/Bound/Rel12/A2 multi — lightly on vision-scale recall.

---

## 4. פער המקורות הגדול ביותר · Largest source gap

**Non-wikimedia independent families for organizations and the live web:** filings/registries (S04), and production-ready `web_origin` (still Preview). News/scholarly/gov remain candidates. HE locale improves fidelity but **not** independence.

---

## 5. סיכון הבטיחות הגדול ביותר · Largest safety risk

**Relationship/identity collapse under pressure to “fix” empties** — title-bridges, URL→SAME-*, ownership inference, AI-invented links, or premature SAME-ENTITY.  
C1-PREPATCH proved the failure mode; Bound must stay closed. Acc leak and Core pw are currently 0 — regressing them is disqualifying.

---

## 6. סיכון הסקיילביליות הגדול ביותר · Largest scalability risk

**Adding providers without QueryPlan/family orchestration** → multiplicative latency, rate-limit bans (SEC/MediaWiki), WAF soft-fails, vanity findingsCount, and Acc surface growth — while intent holes remain.  
Ops cost rises faster than useful discovery without routing/budgets.

---

## 7. המהלך הארכיטקטוני הבא המומלץ · Recommended next architectural move

**Design-only (Chief GO required before code):** specify a **minimal QueryPlan + source-family orchestration** that incorporates the frozen C1 URL-origin Bound path and keeps A2-safe typed coalesce — **without** promote, without crawl, without identity scoring.  
This Integration Review does **not** implement QueryPlan.

---

## 8. מועמדים לניסוי הבא · Candidates for next experiment (trade-offs · NO winner)

| Candidate | Unlocks | Main trade-off | Independence | Safety note |
|-----------|---------|----------------|--------------|-------------|
| QueryPlan Preview (role/compound/under-specified) | Intent coverage S12–S15 | Parse FP; fanout cost | Indirect | Must not invent SAME-*; S11 constraint gate |
| HE-locale Preview | S07 fidelity / quotes | Still wikimedia; low independence | Low | Acc=0; no identity theater |
| SEC-EDGAR / filings Preview | S04 authority | Fair-access; US-only; CIK ambiguity | High (new family) | Brand≠legal; no title merge |
| Registries (public) | Org-legal jurisdiction | Coverage uneven; TOS | High | S05 granularity |
| News (public RSS) | Freshness | Homonyms; bias | Medium | Mention≠reference |
| Scholarly ORCID/Crossref | Docs/academics | Niche | Medium–High | Name ambiguity |
| Production promote of C1 or A2 | Alias reach | **HOLD** — not an “experiment”, a promote decision | — | Requires separate Chief GO |

**No ranking.** Choose by which gap Chief prioritizes.

---

## 9. שערי קבלה · Acceptance gates (any next move)

| Gate | Requirement |
|------|-------------|
| Acc leakage | **0** on full Discovery surfaces |
| Core pw / leak | **0 / 0** · Core dpl untouched |
| B0 alias | Unchanged unless explicit promote GO |
| URL-alone Bound | UNKNOWN · BAD_URL_ALONE_SAME=0 (if web_origin in play) |
| SAME-ENTITY | Forbidden under experimental Discovery lanes |
| Title-bridge / A2-bound | Stay REJECTED |
| MULTI | Secondary metric only — not sole success |
| Vanity findingsCount | Control seeds must not flood beyond agreed band |
| SSRF / urlSafety | 100% block on private/metadata probes |
| Evidence pack | Preview-only · reproducible · no historical pack mutation |
| Promote | **HOLD** default |

---

## STOP

**מחכים להחלטת Chief · READY FOR CHIEF REVIEW · NO CODE · NO PROMOTE · NO NEW EXPERIMENT**
