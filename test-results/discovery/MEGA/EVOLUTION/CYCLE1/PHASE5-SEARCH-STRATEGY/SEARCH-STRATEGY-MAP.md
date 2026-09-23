# SEARCH-STRATEGY-MAP — Cycle1 Phase5 (Steps 41–50)

**Stamp (IDT / Asia/Jerusalem):** 2026-09-20T10:06:30+03:00  
**Mode:** ANALYSIS + DESIGN ONLY · NO promote · NO Core · NO B0 alias retarget  
**B0 Discovery:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` @ https://akvot-discovery.vercel.app  
**Core:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED  
**EXP-A Preview (inspect only):** `dpl_4Rj7cPbjz2cvzzY6ktumo64Za5aE` · VIAF flag on · alias UNCHANGED  

> Goal of this map: show how seed becomes provider queries **today**, what expansion layers are absent, and which INFORMATION-GAIN levers are worth Preview experiments — without vanity finding-count inflation.

---

## Executive finding

**There is no query-expansion layer.** Seed text is forwarded verbatim as `q` to every SearchProvider. Locale may switch Wikipedia host / Wikidata `language`, but hints are unused for rewrite. Soft-label corroboration (EXP-A Preview) merges **after** retrieval — it does not expand queries.

| Layer | Present on B0? | Present on EXP-A Preview? |
|-------|----------------|---------------------------|
| Seed trim / length guard | YES | YES |
| Soft ER (opaque hash) | YES (no rewrite) | YES |
| Query planner / multi-query fanout | **NO** | **NO** |
| Alias / spelling / transliteration | **NO** | **NO** |
| Locale auto-detect (HE script) | **NO** (default `en`) | **NO** |
| Contextual / role / compound parse | **NO** | **NO** |
| URL / domain origin resolver | **NO** | **NO** |
| Org / relationship expansion | **NO** | **NO** |
| Soft-label cross-family merge | **NO** (B0) | YES (post-retrieval) |
| Providers | WD · OL · WP | + VIAF (flag) |

---

## Step 41 — How seed → queries today (code map)

```
POST /api/discovery/sessions
  body.seed | body.q  ──trim──► session.seed / session.q
  body.locale || 'en' ─────────► session.locale
  body.hints (opaque) ─────────► session.hints  (NOT used to rewrite q)

S1 softEntityResolve(seed, hints)
  → softRefs: ["seed:<sha256[0:12]>"]  · status:candidate
  → NO alternate strings, NO alias list

S2 for each provider in getDefaultProviders():
  p.search({ q: session.seed, locale, hints, budgetMs })
       ▲
       └── SAME raw seed string for every provider

S3–S8 normalize → dedupe fingerprint → [corroborate soft-label Preview]
  → rank → facets → Acc scrub emit
```

### Provider query surfaces (exact)

| Provider id | Query construction | Locale effect | Limit |
|-------------|-------------------|---------------|-------|
| `wikidata` | `wbsearchentities&search=<encode(q)>&language=<locale[0:2]>&uselang=…` | WD label language | 8 |
| `openlibrary` | `/search/authors.json?q=<encode(q)>` | **none** | 8 |
| `wikipedia` | OpenSearch on `en.wikipedia.org` **or** `he.wikipedia.org` if locale==`he` | host switch only | 6 |
| `viaf` (Preview flag) | `viaf.org/viaf/AutoSuggest?query=<encode(q)>` | **none**; nametype filter personal/corporate/geographic | 8 |

**Code refs:** `api/lib/discovery/orchestrator.js` (`createDiscoverySession`, `runPipeline` S1–S2) · `api/lib/discovery/providers.js` · `api/lib/discovery/requestGuards.js`.

### Implications (measured)

- Proper-name seeds (S01/S02/S04/S05) hit registry OpenSearch well → volume without independence (B0 multi=0).
- Compound / role / URL seeds (S13–S16) sent as opaque bags → often **0 findings** (PG-02 / QD-04).
- HE seed S07 without `locale=he` → `en.wikipedia.org` + EN WD descriptions (PG-04 / BS-SRC-04).

---

## Step 42 — Query expansion behavior

| Behavior | Status | Notes |
|----------|--------|-------|
| Synonym / paraphrase expansion | ABSENT | — |
| Multi-query fanout (q0, q1, …) | ABSENT | Single `q` per provider call |
| Cursor / pagination expansion | Interface-only | Providers ignore `cursor` |
| Hint-driven rewrite (`hints.org`, `hints.role`) | ABSENT | Hints stored + softEr only |
| Budget-aware query pruning | Partial | Wall/provider timeouts skip providers; do not rewrite q |
| Post-hit secondary queries | ABSENT | No follow-on from QID / VIAF id |

**Design implication:** Any expansion must be an explicit **S1.5 QueryPlan** stage emitting `{queries[], purpose, riskClass}` with measurable INFORMATION GAIN — not silent string mutation.

---

## Step 43 — Aliases

| Mechanism | Today | Gap seed |
|-----------|-------|----------|
| Seed alias list | None | S15 `Mark Zuckerberg / Meta CEO` → 0 |
| VIAF displayForm as alias feedback | Preview returns alternate forms as **findings**, not as re-queries | Does not feed q2 |
| softLabel / labelsCompatible | Post-merge only (EXP-A) | Collapses S01 10→1; does not invent aliases up-front |
| Known-identity tables | Core-side Acc scrub only | Must NOT drive discovery expansion (entity-agnostic) |

**Candidate expansion (design):** Parse punctuation aliases (`/`, `aka`, parenthetical) → head entity query + constraint facetHint — see EXP-C.

---

## Step 44 — Spelling variants

| Variant class | Today | Risk if naïve |
|---------------|-------|---------------|
| Typo / edit-distance | None | Flood common-name space (S02) |
| Diacritic fold | softLabel strips punctuation/diacritics for **merge**, not query | Over-merge distinct people |
| Case fold | Providers typically case-insensitive | Low |
| Hyphen / space | Seed as-typed | Compound miss (S13) |

**Stance:** Prefer provider-native suggest (VIAF AutoSuggest, WD search) over client-side spelling fanout. If added: cap ≤1 spelling variant, require title soft-match ≥ threshold, measure near-dup rate.

---

## Step 45 — Multilingual variants

| Path | Today | Gap |
|------|-------|-----|
| Explicit `locale=he` | WP→he.wikipedia; WD uselang=he | B0 observation creates often omit locale |
| Auto-detect Hebrew script | **NO** | S07 stays EN-registry (BS-SRC-04) |
| Transliteration HE↔EN | **NO** | Miss bilingual coverage unless WD returns both labels |
| Parallel HE+EN queries | **NO** | Would raise coverage; risk double-count same family |

**Candidate:** EXP-B — script detect → locale=he; optional dual-locale WP (he primary, en secondary) with family still `wikimedia` (does **not** alone fix QD-01).

---

## Step 46 — Contextual expansion

| Seed class | Example | Today | Needed |
|------------|---------|-------|--------|
| Role | S14 `CEO of Microsoft` | Whole string → usually empty | Extract org head → provider q; retain role as facet |
| Context trap | S11 `Michael Jordan baseball` | Unstable 0/2 | Constraint token as soft filter / re-rank, not celebrity default |
| Compound person+org | S13 `Demis Hassabis DeepMind` | Empty both runs | Split head entity + org cue |
| Duplicate-source trap | S12 | Empty | Honest under-specified OR entity head |

**Rule:** Context tokens are **constraints**, not additional vanity queries. Success = grounded finding matching constraint, not higher findingsCount.

---

## Step 47 — Domain expansion

| Seed | Today | Gap |
|------|-------|-----|
| S06 `openai.com` | Token search on WD/WP/OL (wiki pages) | No origin fetch |
| S16 `https://www.who.int` | 0 findings | No URL normalize → hostname → metadata |

**Candidate:** EXP-C URL/domain path under `urlSafety.assertSafePublicHttpsUrl` — origin metadata only (`kind:page`, family `web_origin`), https + snippet≥40. **No open crawl.**

---

## Step 48 — Organization expansion

| Mechanism | Today |
|-----------|-------|
| OL | **Authors** search only — weak for Stripe / Red Cross / Microsoft |
| WD | Entity search (org QIDs possible) — no org-type boost |
| VIAF Preview | Prefers personal/corporate nametype — helps orgs somewhat |
| Filings / NGO registries | ABSENT (BS-SRC-03) |

**Design:** Org-intent detect (short brand token, `Inc`, `.com`) → prefer corporate VIAF + WD instance-of org; demote OL author noise. Defer filings to later cycle (news/filings out of Phase5 scope for impl).

---

## Step 49 — Relationship expansion

| Relationship class | Classification Phase3 | Expansion today |
|--------------------|----------------------|-----------------|
| affiliation | 2 / 129 | None |
| ownership / legal | 0 | None |
| relationship | 0 | None |

No graph hop from seed entity → employer / subsidiary. Graph in session is seed + finding nodes + corroboration edges only (EXP-A). **Do not** invent relationship fanout until entity head resolution works (EXP-C) — otherwise noise×N.

---

## Step 50 — Noise from expansion (summary)

See **EXPANSION-NOISE-RISKS.md**. Top measurable risks: vanity count (S01-style collapse masks flood), soft-label over-merge, EN echo of HE seeds, SSRF on URL expand, Acc reopen on new facets, OL author noise on org seeds.

---

## INFORMATION GAIN priorities (not vanity count)

| Rank | Lever | Primary QD/PG | Why IG↑ without vanity |
|------|-------|---------------|------------------------|
| 1 | Locale/script HE + quote floor | QD-05, PG-04, BS-SRC-04 | Native evidence language; same family but higher usable snippet |
| 2 | URL/domain + role/compound resolvers | QD-04, PG-02, BS-SRC-05/06 | Coverage on empty seeds; grounded≥1 beats n=22 junk |
| 3 | Keep EXP-A soft-label merge gated | QD-01 (Preview PASS mean 0.414) | Independence ↑; watch S04/S05 per-seed <0.15 & S01 count collapse |
| 4 | Org-intent demote OL-author | QD-05 | Relevance ↑ without new queries |
| 5 | Spelling / relationship fanout | — | **Defer** — high noise / low IG until 1–2 land |

---

## Explicit non-goals (this phase)

- NO promote / alias retarget (`dpl_Avyhr…` stays)  
- NO Core changes  
- NO news scrapers / filings impl  
- NO identity commit / knownIdentities-driven expansion  

