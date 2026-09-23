# CHIEF-GAP-ANALYSIS-REPORT — CYCLE1 SOURCE & DISCOVERY

**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/`  
**Stamp:** 2026-09-20T11:00:19+03:00 · Asia/Jerusalem (IDT)  
**Mode:** Analysis / docs only · **NO implementation** · **NO Preview deploy for new features** · **NO EXP-B** · **NO promote**  
**Chief prior decision honored:** A2-safe = APPROVED EXPERIMENTAL · A2-bound = REJECTED · B0/Core LOCKED · NO EXP-B until GO

---

## A — What sources are LIVE today?

| Lane | Live sources |
|------|----------------|
| **B0 production** | Wikidata · Wikipedia (en default; he if locale=he) · Open Library |
| **A2 experimental Preview** | Above **+ VIAF** when `DISCOVERY_ENABLE_VIAF=1` |
| **Not live (do not invent)** | News · filings/SEC · company registries · scholarly ORCID/Crossref · gov emitters · RDAP/WHOIS · archives · `web_public` crawler |

**Cite:** `SERVER-PROVIDER-INVENTORY` · `SOURCE-TYPE-MAP` · `providers.js` `DEFAULT_PROVIDERS` / `getDefaultProviders()`.

---

## B — What is the discovery graph today?

Seed → soft ER (opaque hash) → **verbatim** `q` to each provider → Evidence → Finding → fingerprint dedupe → **(A2 Preview only)** typed soft-ref coalesce (`viaf:`/`qid:`/`ol:`) with hostFamily≥2 → rank → Acc scrub → emit.  
**No** QueryPlan, alias expansion, locale auto-detect, or URL origin resolver.  
Detail: `02-CURRENT-DISCOVERY-GRAPH.md`.

---

## C — Coverage gaps?

Intent holes: URL/domain (S16/S06), compound/role/alias (S13–S15), HE locale unused (S07 Phase2), under-specified honesty (S12). Coverage proxy 9/15.  
Detail: `03-COVERAGE-GAPS.md`.

---

## D — Authority gaps?

**S04 Stripe** = AUTHORITY / SOURCE COVERAGE LIMITATION (no corp filing/registry IDs; VIAF person-homonyms).  
**S05 Red Cross** = AUTHORITY GRANULARITY LIMITATION (related orgs correctly separate; merging would invent relationships).  
DOMAIN_AUTHORITY gov/edu weights are **orphans** (no emitters).  
Detail: `04-AUTHORITY-GAPS.md`.

---

## E — Independence gaps?

B0 multi-independent = **0.0** (wikimedia↔openlibrary not co-attached).  
A2-safe mean multi ≈ **0.21** (seed-specific; S01↑ S04=0 S05 low).  
Still missing families: `web_origin`, `filings`, `news`, `gov`, `scholarly`, `archives`.  
WD+WP must not be counted as two independents.  
Detail: `05-INDEPENDENCE-GAPS.md`.

---

## F — Entity-type gaps?

Strongest on **person** (library/KG). Weak on **domain**, **org-legal**, **alias** pre-query, **historical**, **scholarly doc**.  
Detail: `06-ENTITY-TYPE-GAPS.md`.

---

## G — Evidence gaps?

WP thin quotes 100%; weak_evidence_rate ≈0.52; freshness proxy-only; Wikipedia under-keyed for coalesce; OL remote_ids often missing.  
Detail: `07-EVIDENCE-GAPS.md`.

---

## H — Candidate experiments (≥5)?

C1 WEB-ORIGIN · C2 HE-LOCALE · C3 SEC-EDGAR · C4 NEWS-PUBLIC · C5 SCHOLARLY · C6 QUERYPLAN · (+ C7 GOV · C8 RDAP · C9 ARCHIVES).  
Full board: `08-CANDIDATE-EXPERIMENTS.md` · scores: `09-TRADEOFF-ANALYSIS.md`.

---

## I — Trade-offs (factual)?

WEB-ORIGIN scores high on discovery gain, independence, entity (domain) coverage with controllable SSRF via existing urlSafety.  
HE-LOCALE scores high on reproducibility/reliability but **low independence**.  
SEC-EDGAR scores high on authority/evidence for US corps with compliance complexity.  
No candidate is labeled “best” in the score table — recommendation is rationale-tied (section J).

---

## J — Recommendation for Chief GO?

**GO candidate:** `CYCLE1-EXP-WEB-ORIGIN` — URL/Domain Origin Metadata (Preview flag only).  
**Runner-up:** `EXP-HE-LOCALE` (language fidelity; schedule after or parallel only with explicit GO).  
**Second-wave for S04:** `EXP-SEC-EDGAR` / company registry (authority coverage — not an A2 tweak).  
**Do not:** revive A2-bound · mutate A2 packs · promote · implement EXP-B without GO · open full `web_public` crawler.

Rationale: product goal is **maximum public-web discovery without inventing relationships**; C1 adds a true new public-web family and closes S16/S06 empties without pretending to fix authority limitations inside A2.  
Detail: `10-RECOMMENDED-EXPERIMENT.md`.

---

## Engineering vs Product Vision

| Lens | Statement |
|------|-----------|
| **Product Vision** | Maximum **public-web** discovery; honest empties; INFORMATION ≠ IDENTITY; MULTI is a metric; no invented relationships |
| **Engineering (B0)** | Three public registry/page adapters; durable Acc=0; Core locked; high recirculation; monoculture QD-01 |
| **Engineering (A2 experimental)** | VIAF + typed coalesce unlocks multi for **rich crosswalk persons**; frozen; not production |
| **Tension** | Engineering optimized library/KG person lookup; Vision asks for web/org-legal surface area |
| **Resolution path** | Keep A2 frozen as experimental baseline; open **new source families** under Chief GO; never title-bridge to fake vision metrics |

---

## Freeze / locks checklist

| Item | State |
|------|-------|
| A2-EXPERIMENTAL-BASELINE | Stamped · packs frozen · vocab preserved · 28/28 adversarial |
| B0 Discovery alias | FROZEN `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| Core | LOCKED `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| A2-bound | REJECTED |
| Promote | NO |
| EXP-B impl | NO until GO |
| This pack | READY FOR CHIEF REVIEW · NO IMPLEMENTATION |

---

## Executive return

| Field | Value |
|-------|-------|
| Pack path | `.../CYCLE1/CYCLE1-SOURCE-DISCOVERY-GAP-ANALYSIS/` |
| Recommended next experiment | **CYCLE1-EXP-WEB-ORIGIN** |
| Why (1¶) | Live discovery is still a wiki/OL/(Preview VIAF) stack; URL/domain seeds have no grounded public-web Evidence. A Preview-flagged origin-metadata resolver under existing urlSafety adds independence family `web_origin`, serves MAXIMUM PUBLIC-WEB DISCOVERY without inventing relationships or mutating frozen A2, and leaves S04/S05 authority limits to later filings/registry work rather than unsafe coalesce. |
| Status | **READY FOR CHIEF REVIEW · NO IMPLEMENTATION** |
