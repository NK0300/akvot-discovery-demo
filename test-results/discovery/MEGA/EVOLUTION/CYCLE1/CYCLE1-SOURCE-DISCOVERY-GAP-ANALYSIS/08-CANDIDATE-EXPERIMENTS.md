# 08 — CANDIDATE EXPERIMENTS

**Stamp:** 2026-09-20T11:00:19+03:00 · IDT  
**Mode:** DESIGN ONLY · ≥5 candidates · public/legal only · NO impl without Chief GO  
**Constraint:** Do not mutate frozen A2 packs · NO promote · NO EXP-B until GO (Chief)

---

## Candidate board

| ID | Name | Primary gap closed | New family? | Risk class |
|----|------|--------------------|-------------|------------|
| **C1** | **EXP-WEB-ORIGIN** — URL/domain origin metadata | CG-01/02 · QD-04 · MAXIMUM PUBLIC-WEB | YES `web_origin` | SSRF / Acc co-bound |
| **C2** | **EXP-HE-LOCALE** — auto HE + he.wikipedia + quote floor | CG-05 · QD-05 · BS-SRC-04/08 | NO (still wikimedia) | Low SSRF; thin-filter overdrop |
| **C3** | **EXP-SEC-EDGAR** — public US filings | S04 authority coverage | YES `filings` | Rate-limit · name→CIK FP |
| **C4** | **EXP-NEWS-PUBLIC** — allowlisted RSS/open news | Freshness · IG-04 | YES `news` | Name collision FP |
| **C5** | **EXP-SCHOLARLY** — ORCID/Crossref public | person/doc scholarly | YES `scholarly` | Ambiguous names |
| **C6** | **EXP-QUERYPLAN** — compound/role/alias parse | CG-03/04 · S13–S15 | NO (uses existing providers) | Wrong-head parse · celebrity default |
| **C7** | **EXP-GOV-ALLOWLIST** — *.gov / *.gov.il pages | Authority orphan BS-SRC-07 | YES `gov` | Allowlist ops · politics |
| **C8** | **EXP-RDAP** — public domain RDAP | Domain entity type | pairs `web_origin` | Redaction / privacy service |
| **C9** | **EXP-ARCHIVES** — Wayback CDX | historical entity | YES `archives` | Slow · overclaim |
| defer | web_public full crawler | max surface | YES | Security HOLD |

---

## C1 — EXP-WEB-ORIGIN (detail)

**Hypothesis:** Detect URL/hostname seeds → fetch **origin metadata only** under `urlSafety` → emit `kind:page` family `web_origin` with snippet≥40 → ≥1 grounded finding on S16/S06 without Acc leak and without inventing entity links.

**Design bounds:** https only · no link crawl · no private IP · Preview flag · B0 untouched.

## C2 — EXP-HE-LOCALE (detail)

**Hypothesis:** Hebrew script → `locale=he` + preserve OpenSearch descs + quote floor → `he.wikipedia.org` on S07 and weak_evidence_rate↓. Does **not** claim independence gain.

## C3 — EXP-SEC-EDGAR (detail)

**Hypothesis:** Brand/org seeds → public SEC company search → CIK-backed filing Evidence family `filings` supplies authority coverage for S04-like US corps where VIAF/P214 fail — without title-bridge.

## C4 — EXP-NEWS-PUBLIC (detail)

**Hypothesis:** Allowlisted public RSS for seed tokens yields time-stamped corroboration Evidence (family `news`) improving freshness currency — never SAME-ENTITY from headline alone.

## C5 — EXP-SCHOLARLY (detail)

**Hypothesis:** ORCID/Crossref public search for person/doc seeds adds scholarly identifiers (ORCID/DOI) as typed refs independent of OL bibliographic noise.

## C6 — EXP-QUERYPLAN (detail)

**Hypothesis:** S1.5 plan splits compound/role/alias seeds into head query + facetHint constraint → coverage on S13–S15; S12 returns `emptyReason=under-specified` instead of junk.

## Explicit non-candidates now

- A2-bound title-bridge revival  
- EXP-B implementation before Chief GO  
- Mutating historical A2 evidence packs  
- Core identity dossier path  
