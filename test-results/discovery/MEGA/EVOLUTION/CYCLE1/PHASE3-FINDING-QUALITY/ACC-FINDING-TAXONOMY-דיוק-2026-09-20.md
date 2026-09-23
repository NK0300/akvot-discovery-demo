# ACC-FINDING-TAXONOMY — דיוק · CYCLE1 PHASE3 · 2026-09-20

**Stamp:** 2026-09-20T09:53:31+03:00 IDT (Asia/Jerusalem)  
**Mode:** OBSERVATION ONLY · NO code · NO promote · NO Core touch  
**Baseline B0:** `https://akvot-discovery.vercel.app` → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv`  
**Core LOCKED:** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Acc leak (Q1701775 / wd-Q1701775):** **0**  
**Complements:** `ARCH-TAXONOMY-SCHEMA-GAPS-ארכיטקט-2026-09-20.md` (schema gaps) — this pack is Acc counts+examples on live B0 samples.

---

## Scope

| Item | Value |
|------|-------|
| Corpus | GOLDEN-CORPUS-v0 + Acc Phase2 raw |
| Primary pack | `PHASE2-OBSERVATION/raw/acc-דיוק/create-S*.json` |
| Fallback | `PHASE2-OBSERVATION/raw/create-S*-r1.json` |
| Focus seeds (≥8) | S01 person · S02 common · S03 ambiguous · S04 company · S06 domain · S07 HE · S09 no-match · S10 conflict |
| Extra (complement) | S05 org · S08 multilingual · S11 wrong-person · S12 dup-source-trap |
| Unit | Finding multi-label; clusters for near-dup / contradiction pairs |
| Live re-fetch | Not required — Acc pack already has healthy S10 (n=22, contr=1) + S11 (n=2) |

---

## Class definitions (Acc)

| Class | Definition used on samples |
|-------|----------------------------|
| **duplicate** | Exact fingerprint: same norm(title)+entityRefs+summary[:100] within session. Post-`dedupeByEvidenceFingerprint` survivors — expect ~0. |
| **near-dup** | Same norm(title) with **different** entityRefs, or summary similarity ≥0.88 across titles. |
| **contradiction** | Member of `session.contradictions[]` **or** same-title multi-entity cluster (INFORMATION≠IDENTITY). |
| **no-evidence** | Empty `evidenceIds` / missing provenance. Cite-or-drop should drop these → emit count expect 0. |
| **weak** | Quote &lt;40 chars (or empty) **or** `scoreFinding` &lt;0.55. |
| **single-source** | `providers.length≤1` and ≤1 host-family on evidence/domains. |
| **multi-source** | ≥2 providers **or** ≥2 independent host-families on the **finding**. |
| *false-identity-risk* | Acc annotation (not primary class): pretty-wrong smell. |
| *forbidden-qid-leak* | Any `Q1701775` / `wd-Q1701775` → **Acc FAIL**. |

---

## Taxonomy totals (FOCUS · finding-level · multi-label)

**Findings sampled:** 95 across 8 focus seeds (S09 empty expected).

| Class | Count | Notes |
|-------|------:|-------|
| duplicate | **0** | Matches Phase2 `dup_rate_mean=0` (merge absorbs exact FP) |
| near-dup | **49** | Dominated by same-title multi-entity on S02/S03/S10 |
| contradiction | **48** | Session objects present on S01/S02/S03/S04/S10 |
| no-evidence | **0** | Cite-or-drop holds on emit; empty sessions are *session*-level, not labeled findings |
| weak | **81** | Thin/empty quotes dominate (esp. wikipedia stubs, short WD descriptions) |
| single-source | **95** | **100%** of findings — each row is one provider / one host-family |
| multi-source | **0** | No finding-level multi-provider corroboration (session domains can still be 2–3) |
| false-identity-risk | **2** | S02 top-row flood · S03 top-row flood (FOCUS); +S11 basketball in EXTRA |
| forbidden-qid-leak | **0** | Acc PASS |

### Totals table (machine)

```
duplicate=0 | near-dup=49 | contradiction=48 | no-evidence=0
weak=81 | single-source=95 | multi-source=0
false-identity-risk=2 | forbidden-qid-leak=0 | accLeak=0
```

---

## Examples (seed id · finding ids)

### duplicate
- *(none on emit)* — Phase2/Acc post-dedupe survivors only.

### near-dup + contradiction (same-title multi-entity)
| Seed | Cluster title | Example finding ids |
|------|---------------|---------------------|
| S02 | john smith | `wd-Q3182477`, `wd-Q332377`, `wd-Q6258357`, `ol-OL177707A`, `wp-en-John_Smith` (16 members in session contradiction) |
| S03 | alex morgan | `wd-Q233510`, `wd-Q126278685`, `ol-OL1437248A`, `wp-en-Alex_Morgan` (10 members) |
| S10 | francis bacon | `wd-Q154340` (painter 1909–1992), `wd-Q37388` (philosopher 1561–1626), `ol-OL23720A`, `wp-en-Francis_Bacon` (12 members) |
| S01 | tim berners-lee | `wd-Q80`, `ol-OL25245A`, `wp-en-Tim_Berners_Lee` (+ WD variants) |
| S04 | stripe | `wd-Q7624104` (payments co), `wd-Q3421342` (color band) — brand vs noun |

### no-evidence
- Emit count **0**. Session empties: **S09** (expected no-match PASS), EXTRA S08/S12 (blind zero — not labeled findings).

### weak
| Seed | Finding id | Signal |
|------|------------|--------|
| S07 | `wp-en-_` | HE title `בנימין נתניהו`, **empty quote** |
| S06 | `wp-en-Openai_com` | empty quote |
| S10 | `ol-OL23720A` | quote `"Essays"` (6 chars) |
| S01 | `wd-Q80` | quote 38 chars (borderline thin) |

### single-source
- All 95 focus findings — e.g. S01 `wd-Q80` providers=`[wikidata]` domains=`[www.wikidata.org]`.

### multi-source
- **0** at finding level. Session-level multi-domain appears only via contradiction objects (e.g. S10 domains wikidata+openlibrary+wikipedia) — **not** per-finding corroboration.

### false-identity-risk
| Seed | Finding id | Reason |
|------|------------|--------|
| S02 | `wd-Q3182477` | Ambiguous flat list — top row (botanist) pretty-wrong risk |
| S03 | `wd-Q233510` | Ambiguous flat list — top row risk |
| S11* | `wp-en-Michael_Jordan_basketball_` | Seed context baseball but basketball finding present (*EXTRA) |

### forbidden-qid-leak
- **None.** Scanned create+get Acc packs + Phase2 ACC-SCAN.

---

## Per-seed class counts (FOCUS)

| Seed | Cat | n | near-dup | contr | weak | single | multi | FIR | Session contr |
|------|-----|--:|--------:|------:|-----:|-------:|------:|----:|--------------:|
| S01 | person | 10 | 7 | 7 | 9 | 10 | 0 | 0 | 1 |
| S02 | common | 21 | 16 | 16 | 12 | 21 | 0 | 1 | 1 |
| S03 | ambiguous | 21 | 10 | 10 | 20 | 21 | 0 | 1 | 1 |
| S04 | company | 14 | 4 | 3 | 14 | 14 | 0 | 0 | 1 |
| S06 | domain | 6 | 0 | 0 | 6 | 6 | 0 | 0 | 0 |
| S07 | HE | 1 | 0 | 0 | 1 | 1 | 0 | 0 | 0 |
| S09 | no-match | 0 | — | — | — | — | — | — | 0 |
| S10 | conflict | 22 | 12 | 12 | 19 | 22 | 0 | 0 | 1 |

### EXTRA (complement only)
| Seed | n | Notes |
|------|--:|-------|
| S05 | 6 | all weak+single; Acc pack had WD/OL errors |
| S08 | 0 | blind empty (unexpected) |
| S11 | 2 | baseball **and** basketball titles; basketball = FIR |
| S12 | 0 | dup-source-trap blind empty |

---

## Acc observations (quality, not schema)

1. **Exact duplicate emit = 0** — dedupe works; ScoreCARD cannot see merge survivors (aligns Arch gap).
2. **Near-dup ≈ contradiction on common names** — same-title multi-entity is the dominant Acc quality signal; UI/schema need cluster edges (Arch `nearDupOf` / Contradiction).
3. **Finding-level multi-source = 0** — `providerDiversity` / session domains overstate corroboration (PG-01); every finding is single-source.
4. **Weak is the majority class (81/95)** — thin registry quotes; not “unsupported” (coverage still 1.0).
5. **no-evidence labeled = 0** but **vacuous coverage** on empties remains (Arch coverage paradox).
6. **S10 Acc pack healthy** (painter vs philosopher + session contradiction) — better than Phase2-main r1 where WD/WP errored and only OpenLibrary remained.
7. **S11** surfaces both baseball and basketball — context not exclusive; basketball row is Acc FIR.
8. **Forbidden QID leak = 0** across focus+extra.

---

## Files
- JSON twin: `ACC-FINDING-TAXONOMY-דיוק-2026-09-20.json`
- Raw: `raw/acc-דיוק/phase3-taxonomy-scorecard-analysis.json`, `finding-tags.json`
- Promote: **HOLD**
