# EXPERIMENT-CANDIDATES — Cycle1 Phase5 Search Strategy (Steps 41–50)

**Stamp (IDT):** 2026-09-20T10:06:46+03:00  
**Mode:** DESIGN ONLY · NO implementation · NO deploy · NO promote  
**Baseline B0:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` UNCHANGED  
**Core:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED  
**EXP-A context:** Preview PASS mean multi=0.414 · S01 10→1 · S04/S05 per-seed <0.15 · **HOLD promote**

> Success = INFORMATION GAIN (independence / intent coverage / native language / constraint match) — **not** vanity findingsCount.

---

## Priority board

| Priority | ID | Primary gaps | Status |
|----------|----|--------------|--------|
| 0 (done Preview) | EXP-A VIAF + soft-label | QD-01, BS-SRC-01, PG-01 | PASS mean · HOLD promote · tune later |
| **1** | **EXP-B** HE locale + quote floor | QD-05, PG-04, BS-SRC-04, BS-SRC-08 | DESIGN |
| **2** | **EXP-C** URL/role/compound resolvers | QD-04, PG-02, BS-SRC-05, BS-SRC-06 | DESIGN |
| 3 stretch | EXP-D publication / OL-author demotion | QD-05 | DESIGN optional |
| defer | Spelling fanout / relationship hops | ENR-01/10 | NO |

---

## EXP-B — HE locale + native Wikipedia + snippet floor

**Tied to:** QD-05 (primary), PG-04, BS-SRC-04, BS-SRC-08 · secondary QD-01 only via less EN bias (family still wikimedia)

### Hypothesis
Auto-detecting Hebrew script → `locale=he` (he.wikipedia + WD uselang=he) plus enforcing quote/summary ≥40 chars (demote/drop thinner) raises usable Evidence on S07 without Acc leakage and without increasing vanity count on EN flood seeds.

### Design (no code now)
1. **S1.5 locale infer:** if seed matches `[\u0590-\u05FF]` → set locale=`he` when body.locale absent/default.
2. Confirm Wikipedia OpenSearch `descs[]` survive normalize/emit (B0 WP quote_mean≈0 / thin).
3. Soft floor: quote_len<20 demoted in rank; empty quote+summary excluded from top-N display set (still in raw for audit if needed).
4. Optional dual-query: he.WP primary + en.WP secondary demoted (same family — does **not** claim independence).
5. Preview flag e.g. `DISCOVERY_EXP_HE_LOCALE=1` — B0 alias untouched.

### Success metrics (must beat vanity)

| Metric | Seeds | B0 baseline | Success |
|--------|-------|------------:|---------|
| `he.wikipedia.org` in evidence domains | S07 | false | true both runs |
| WP `quote_len` mean on S07 WP rows | S07 | ~0 | ≥40 |
| weak_evidence_rate (corpus w/ findings) | all | 0.5205 | ≤0.40 |
| Findings S07 | S07 | 2 | ≥2 (no empty regression) |
| Acc leak Q1701775 | all | 0 | 0 |
| findingsCount on S02 (control) | S02 | ~21 | ≤ baseline+10% (no flood) |

### Noise / holds
- Does **not** close QD-01 alone (still wikimedia).
- Pair narrative with EXP-A for Independence story.
- ENR-03 if EN secondary not demoted.

### Non-goals
Promote · Core · news/gov.il scrapers · transliteration dictionaries.

---

## EXP-C — URL / role / compound intent resolvers

**Tied to:** QD-04 (primary), PG-02, BS-SRC-05, BS-SRC-06 · secondary QD-05 via groundedness gate

### Hypothesis
A small **QueryPlan** that (a) resolves URL/hostname seeds to origin metadata under `urlSafety`, and (b) parses compound/role seeds into head-entity query + constraint facetHint, yields ≥1 grounded finding on S13/S14/S15/S16 without Acc leakage and without Core touch.

### Design (no code now)

#### C1 — URL / domain path (S06, S16)
1. Detect seed matching `https?://` or bare hostname (`openai.com`).
2. Canonicalize via `assertSafePublicHttpsUrl` (https only; block private/link-local/metadata).
3. Fetch **origin metadata only** (title / og:site_name) — no link crawl, no `web_public` full crawler.
4. Emit `kind:page`, hostFamily `web_origin`, provenanceUrl = origin https, snippet≥40 or drop.
5. Optional secondary: hostname token → existing WD/WP q (labeled `queryPurpose=domain_token`) — demote if origin exists.

#### C2 — Compound / alias path (S13, S15)
1. Split on `/`, commas, and known org tokens; head = longest proper-name-like span.
2. Primary provider q = head; retain remainder as `facetHints: ["constraint:…"]`.
3. Soft-match: prefer findings whose title/summary intersects constraint tokens.

#### C3 — Role path (S14 `CEO of Microsoft`)
1. Pattern `ROLE of ORG` → q=ORG; facetHint `role:CEO`.
2. Do **not** invent person identity; surface org registry hits + role hint for UI.
3. Wrong-person control: S11 requires baseball constraint in title/summary or demote celebrity default.

#### C4 — Keyword trap honesty (S12)
If after plan still under-specified → explicit `emptyReason=under-specified` rather than junk (ENR-11).

### Success metrics

| Metric | Seeds | B0 baseline | Success |
|--------|-------|------------:|---------|
| grounded findings ≥1 | S16 | 0 | ≥1 both runs |
| grounded findings ≥1 | S13, S14, S15 | 0 | ≥1 on **≥2 of 3** |
| Coverage proxy (non-nomatch ≥1 on r1) | 15 seeds | 9/15 (60) | ≥12/15 (≥80) |
| `web_origin` family present | S16 | false | true |
| Acc leak | all | 0 | 0 |
| SSRF / blocked-host probes | safety suite | — | 100% reject |
| findingsCount S02 control | S02 | ~21 | no +>20% vanity |

### Noise / holds
- ENR-04 SSRF — Acc+security co-bound; Chief GO before Preview.
- ENR-07 celebrity default — S11 is a hard behavioral gate.
- No open-web crawler; origin metadata only.

### Non-goals
Filings/SEC · news wires · relationship hops · Core identity resolve.

---

## EXP-D (stretch) — Publication / OL-author demotion (ranking-only)

**Tied to:** QD-05  
**Hypothesis:** Demote WD work/talk patterns and OL-only bibliographic hits when org/person registry evidence exists → relevance↑ without new queries.

| Metric | B0 | Success |
|--------|---:|--------:|
| publication primary share (S01-style) | high | ≥30% relative reduction |
| identity/corporate-relevant count | keep ≥ baseline−1 | non-regress |
| Acc | 0 | 0 |

---

## EXP-A follow-ups (no new promote)

Already measured. Strategy notes for later tuning (not Phase5 impl):

| Issue | Metric | Possible Preview tweak |
|-------|--------|------------------------|
| S04/S05 per-seed multi <0.15 | 0.136 / 0.105 | tighter soft-match; corporate nametype weight |
| S01 count collapse | 10→1 | keep; report evidence family cardinality alongside rate |
| Mean vs per-seed gate | mean 0.414 PASS | Document dual reporting before any promote debate |

---

## Explicit non-goals this phase

- No provider/orchestrator code changes in Phase5 deliverable  
- No deploy / promote / alias retarget  
- No Core `dpl_8ag` touch  
- No spelling edit-distance fanout · no relationship graph expansion  

## Recommended next after Chief GO

1. Preview **EXP-B** (low SSRF risk, high HE IG)  
2. Preview **EXP-C** behind flag + urlSafety Acc pack  
3. Revisit EXP-A promote only if per-seed multi and Acc packs still green  

