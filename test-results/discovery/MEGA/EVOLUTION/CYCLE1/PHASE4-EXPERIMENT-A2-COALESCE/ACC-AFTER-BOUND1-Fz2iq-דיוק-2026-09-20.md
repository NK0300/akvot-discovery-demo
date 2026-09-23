# ACC-AFTER Bound #1 (Fz2iq) — PRIMARY · דיוק · 2026-09-20

**Stamp:** 2026-09-20T10:26:08+03:00 → 2026-09-20T10:27:50+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A2-COALESCE  
**Mode:** Acc AFTER PRIMARY · **HOLD promote** · NO Core/B0 alias mutation  
**Preview (PRIMARY):** `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` · https://akvot-simple-demo-2u3mwx1k4-k-akvot.vercel.app  
**Locks:** B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` aliasStill=true · Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED

---

## Acc redef (frozen)

Unit = `FindingId` after coalesce · multi iff `Evidence[]` ≥2 families (`wikidata`≠`wikipedia`≠`openlibrary`≠`viaf`≠`other:<apex>`) · rate = multi / Findings≥1 Evidence · gate **mean(S01,S04,S05) ≥ 0.15**

## Per-seed (PRIMARY Bound #1)

| Seed | Findings | With≥1 Ev | Multi_n | **Rate** | Families | VIAF | Leak | vs B0 |
|------|----------|-----------|---------|----------|----------|------|------|-------|
| S01 | 18 | 18 | 0 | **0** | openlibrary, viaf, wikidata, wikipedia | 8 | 0 | 10→18 |
| S04 | 30 | 30 | 0 | **0** | openlibrary, viaf, wikidata, wikipedia | 8 | 0 | 14→30 |
| S05 | 30 | 30 | 0 | **0** | openlibrary, viaf, wikidata, wikipedia | 8 | 0 | 6→30 |

- **mean multi_independent_rate:** **0** (gate 0.15 → **FAIL**)
- **pooled (diagnostic):** 0 (0/78)
- **Acc leak total:** 0
- **S01 coverage:** 18 vs B0 frozen 10 · vacuum=NO → **PASS**

## Adversarial (PRIMARY)

- Smith+IBM/NY/US · inject Q1701775 / wd-Q1701775 / seed-poison
- adv_leak_total=0 · dossier=false → **PASS**

## Core smoke (once · LOCKED 8ag)

| Case | Result | Detail |
|------|--------|--------|
| Assaf Q47507930 | PASS | ui=dossier qid=Q47507930 |
| כהן soft | PASS | ui=need_context faces=0 |
| Smith never Q1701775 | PASS | nc=candidates warm=candidates |
| pw=0 / leak=0 | PASS | pw=0 leak=0 |
| build | PASS | dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 |

**Core overall:** **PASS**

## Gates

| Gate | Result | Value |
|------|--------|-------|
| mean multi ≥ 0.15 | **FAIL** | 0 |
| Acc leak = 0 | **PASS** | 0 |
| S01 no vacuum | **PASS** | 18 vs B0=10 |
| Adversarial | **PASS** | leak=0 |
| Core / B0 | **PASS** | Core true · B0 true |

## Verdict (Chief promote-path = Bound #1)

# **FAIL**

**Promote: HOLD** (always — no alias retarget)

**Note:** Bound #1 removed title-only coalesce; multi≈0 may be expected when typed soft-refs do not yet intersect across families. Honest Acc FAIL on multi gate is OK.

## Paths

- `ACC-AFTER-BOUND1-Fz2iq-דיוק-2026-09-20.md` + `.json`
- raw: `raw/acc-after-דיוק/bound1/`
