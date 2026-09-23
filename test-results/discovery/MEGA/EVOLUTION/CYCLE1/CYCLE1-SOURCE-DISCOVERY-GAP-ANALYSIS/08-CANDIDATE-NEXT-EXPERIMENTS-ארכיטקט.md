# 08 — CANDIDATE NEXT EXPERIMENTS · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט  
**Mode:** **CANDIDATES ONLY** · **NO impl** · **NO EXP-B start** · **NO promote**  
**Constraints:** Do not optimize A2 for multi · Do not manufacture S04/S05 recovery · No invented relationships · Public-web only

---

## Candidate slate

| ID | Title | One-line hypothesis | Independence effect | Relationship invention risk | Blast radius | Addresses |
|----|-------|---------------------|---------------------|----------------------------|--------------|-----------|
| **C1** | **HE-Locale Surface Activation** | Setting/using `locale=he` (and/or HE-script auto-detect design) surfaces `he.wikipedia.org` + HE WD labels for HE seeds without new adapters | **None** (still wikimedia) | **Low** — no new coalesce | **Lowest** — partially wired | S07 / QD-05 HE thin / PG-04 |
| **C2** | URL / Domain Origin Metadata | For URL-like seeds, fetch public HTTPS origin metadata (title/og) via urlSafety — no open crawl | **New family** web_origin | Low if no ER merge | Medium — SSRF/Security | S06/S16 coverage |
| **C3** | SEC EDGAR Public Filings | Name→CIK search emits filing Evidence for US public companies | **New family** filings | Low if typed CIK only; **do not frame as S04 recovery** | Medium — fair-access | Corp legal authority coverage |
| **C4** | National / Company Registry (public) | Jurisdiction registry lookup for legal names/numbers | gov_registry | Medium (brand≠legal) | Medium–High | Org legal coverage |
| **C5** | Query Expansion Lite (alias/transliteration) | Multi-query fanout from seed (HE↔EN transliteration, AKA) without coalesce change | Indirect (more hits) | **Medium** — wrong alias → wrong hits | Medium | Compound/HE/alias intents |
| **C6** | WP Sitelink → QID Typed Emit | Wikipedia provider emits `qid:` from sitelinks API (not title parse) | Helps typed attach when VIAF on | Low if sitelink-only | Low–Medium | Typed coverage; **not** title-bridge |
| **C7** | News RSS Allowlist | Public RSS headlines as Evidence | news family | Medium FP names | Medium | Freshness |
| **C8** | ORCID / Crossref | Scholarly public metadata | scholarly family | Low–Medium name ambig | Low–Medium | Doc/person scholarly |
| **C9** | A2-safe promote-readiness (measurement only) | Re-measure frozen A2-safe under Chief gates — **no code** | n/a | n/a | Docs only | Decision hygiene — **not** an experiment impl |
| **C10** | web_public open crawl | Arbitrary public pages | Max independence potential | **High** Acc/FP | **Deferred** — interface-only until Chief+Security | Max surface |

---

## Explicitly OUT / deferred

| Item | Why |
|------|-----|
| A2-bound title-bridge revival | **REJECTED** |
| S04/S05 multi recovery experiments | Product limitations — do not manufacture |
| Further A2 coalesce tuning for multi | MULTI not product objective |
| EXP-B implementation | **NO** until Chief GO after this Gap Analysis |
| Core / B0 alias changes | LOCKED / FROZEN |

---

## HE-locale (C1) — detail

**Already in code:** `wikipediaOpenSearchProvider` switches host to `he.wikipedia.org` when `locale` lang slice === `he`; Wikidata uses locale for label language.  
**Gap:** create path defaults `locale=en`; measured S07 used EN wiki.  
**Experiment shape (design only):** Preview-only runs with `locale=he` on HE corpus + optional design note for script auto-detect — **measure** HE host presence, quote language, Acc leak=0 — **no** new coalesce rules.

---

## OWNER

| Who | Fill |
|-----|------|
| **@שרת** | Feasibility / ToS for C2–C8 |
| **@דיוק** | Acc threat model per candidate |
| **@בודק** | Minimal corpus per candidate |
| **@ממשק** | Locale control UX for C1 |
