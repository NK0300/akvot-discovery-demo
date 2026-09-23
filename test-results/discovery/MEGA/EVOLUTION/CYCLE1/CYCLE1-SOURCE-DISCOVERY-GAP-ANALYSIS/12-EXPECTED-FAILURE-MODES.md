# 12 — EXPECTED FAILURE MODES

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Applies to recommended `CYCLE1-EXP-WEB-ORIGIN` and notes siblings**

---

## EXP-WEB-ORIGIN failure modes

| ID | Mode | Likelihood | Detection | Mitigation |
|----|------|------------|-----------|------------|
| FM-01 | SSRF to private/metadata IPs | med if ungated | Acc+security probes | Reuse `urlSafety`; deny list; https only |
| FM-02 | Empty title/og → drop → still 0 findings | med | S16 snippet length metrics | Fallback to hostname label with explicit `weak` tag OR honest emptyReason |
| FM-03 | Vanity flood from secondary WD/WP token query | med | findingsCount control on S02 | Demote domain_token purpose; cap ≤N |
| FM-04 | Attaching origin to wrong registry entity | low–med | Adversarial domain≠org cases | No SAME-ENTITY from title; typed/URL keys only |
| FM-05 | robots/ToS block | med | provider partial/error | Surface partial; don’t scrape around robots |
| FM-06 | Non-HTML origins (PDF/API) | low | content-type check | Skip or metadata-only |
| FM-07 | Internationalized domains / punycode | low | IDN fixtures | Normalize via URL parser |
| FM-08 | Acc leakage via reflected URL params | low | Acc inject suite | Scrub forbidden tokens in snippets |

## Sibling candidates (watch)

| Candidate | Top failure |
|-----------|-------------|
| HE-LOCALE | Over-filter thin quotes → empty S07; still monoculture |
| SEC-EDGAR | Brand→wrong CIK; fair-access ban |
| NEWS | Homonym headline FP treated as corroboration |
| QUERYPLAN | `CEO of Microsoft` celebrity default (S11 class) |

## Hard stop conditions (Preview abort)

- Any Acc leak ≠ 0  
- SSRF probe fail  
- Alias/B0/Core mutation attempted  
- Title-only coalesce reintroduced  
