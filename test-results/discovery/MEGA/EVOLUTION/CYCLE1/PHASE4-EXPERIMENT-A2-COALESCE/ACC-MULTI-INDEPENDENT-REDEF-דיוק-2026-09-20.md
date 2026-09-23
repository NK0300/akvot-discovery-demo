# ACC multi_independent_rate REDEFINITION — soft-entity coalesce · דיוק · 2026-09-20

**Stamp:** 2026-09-20T10:13:07+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** דיוק (Accuracy)  
**Phase:** CYCLE1 · PHASE4-EXPERIMENT-A2-COALESCE  
**Mode:** Acc metric redef ONLY · **NO product code** · **NO promote** · **BEFORE Preview**  
**Preview:** **WAITING_FOR_PREVIEW**  
**Promote:** **HOLD**

---

## Purpose

Freeze Acc `multi_independent_rate` for the **post-coalesce** world (EXP-A2 Option A: soft-entity coalesce + multi-provider `Evidence[]` on one `FindingId` · Acc scrub · no dossier).

This is **not** Option B (metric-only “count sibling VIAF findings as diversity”) — Chief/Arch rejected Option B. This redef keeps Finding-level independence honest while aligning the unit of analysis with coalesce output.

## Locks (unchanged)

| Lock | Value |
|------|-------|
| Discovery B0 alias | `https://akvot-discovery.vercel.app` → `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| Core | **LOCKED** `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| Forbidden | `Q1701775` / `wd-Q1701775` |
| B0 BEFORE (frozen) | S01/S04/S05 multi=**0.0** · leak=**0** |
| B0 path | `PHASE4-EXPERIMENT-A-VIAF/` Acc B0 pack |

## Why EXP-A Acc FAIL (false-positive trap)

EXP-A Preview emitted VIAF as **parallel single-family Findings** (`viaf-*` rows with Evidence spanning only `viaf`). Session-level VIAF presence rose; **per-Finding** `hostFamilyCount` stayed 1 → `multi_independent_rate` stayed **0**.

**Rejected false-positive (explicit):** counting VIAF-only **sibling** Findings as cross-family diversity. Sibling rows are **not** corroboration. Diversity requires ≥2 distinct provider families on the **same** `FindingId`’s `Evidence[]` after coalesce.

## Redefined metric — post-coalesce

### Unit of analysis

**`FindingId` after soft-entity coalesce** (not parallel pre-merge sibling findings; not session-level provider presence).

### Family map (Acc; language mirrors = 1 family)

| Family | Rule |
|--------|------|
| `wikidata` | `*.wikidata.org` OR `providerId=wikidata` |
| `wikipedia` | `*.wikipedia.org` / `*.wikimedia.org` (non-wikidata) OR `providerId=wikipedia` — **lang mirrors = 1 family** |
| `openlibrary` | `*.openlibrary.org` OR `providerId=openlibrary` |
| `viaf` | `*.viaf.org` OR `providerId=viaf` |
| `other:<registrable apex>` | any other registrable apex host → own family bucket |

**Independent:** `wikidata` ≠ `wikipedia` ≠ `openlibrary` ≠ `viaf` ≠ distinct `other:*`.  
**Not independent:** `en.wikipedia` ≡ `he.wikipedia` (same `wikipedia`); `www.` stripped.

### multi_independent predicate (Finding)

A Finding counts as **multi_independent** iff its surviving `Evidence[]` contains **≥2 distinct provider families** under the map above.

`providers.length` alone is **not** corroboration.

### Rate (per seed session)

```
multi_independent_rate(seed) =
  (# Findings with multi_independent) /
  (# Findings with ≥1 Evidence)
```

Denominator excludes empty-Evidence rows. Numerator ⊆ denominator.

### Aggregate gate — EXP-A2

| Gate | Rule |
|------|------|
| **Primary aggregate** | **mean** of `multi_independent_rate` on **S01, S04, S05** ≥ **0.15** |
| Report also | pooled rate (optional diagnostic; **not** the EXP-A2 pass gate) |

```
mean_rate = (rate_S01 + rate_S04 + rate_S05) / 3
PASS iff mean_rate ≥ 0.15
```

## Acc hard gates (UNCHANGED)

| Gate | Threshold | Notes |
|------|-----------|-------|
| Acc leak `Q1701775` / `wd-Q1701775` | **= 0** | seeds + adversarial |
| Pretty-wrong dossier bind | **none** | no `mayCommitDossier` / faces / identityScore bind from coalesce |
| Acc scrub | **after merge** | `emitSnapshot` / sanitize **after** soft-entity Evidence attach |
| Core / B0 | **LOCKED** | no alias retarget · no promote |

## Findings-count regression watch (coverage discipline)

Soft-entity coalesce **must not wipe coverage silently**.

| Seed | B0 BEFORE findings (frozen) | Watch |
|------|----------------------------:|-------|
| S01 Tim Berners-Lee | **10** | Prior unconstrained softLabel vacuum: **10→1** Acc-unsafe — **reject** if Preview collapses similarly |
| S04 Stripe | **14** | Report before/after counts |
| S05 Red Cross | **6** | Report before/after counts |

**Required on AFTER pack (when Preview arrives):** per-seed `findings_count_before` / `findings_count_after` · flag regression if S01 collapses toward 1 without explicit Arch waiver. Option A attach_keep should preserve peer Findings while attaching shared multi-family `Evidence[]`.

## What this redef does / does not do

| Does | Does not |
|------|----------|
| Align Acc unit with coalesce `FindingId` + `Evidence[]` | Invent Preview results |
| Reject VIAF-sibling false-positive | Change product code |
| Set mean≥0.15 gate on S01/S04/S05 | Promote / retarget alias |
| Keep leak / scrub / no-dossier hard gates | Treat Option B as valid |

## Seeds (GOLDEN-CORPUS-v0)

| ID | Seed | Category |
|----|------|----------|
| S01 | Tim Berners-Lee | person |
| S04 | Stripe | company |
| S05 | Red Cross | organization |

## Status

**WAITING_FOR_PREVIEW** · Acc redef **READY** · **HOLD** promote · Core/B0 locked · **no AFTER metrics yet**.

## Paths

- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-COALESCE/ACC-MULTI-INDEPENDENT-REDEF-דיוק-2026-09-20.md`
- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-COALESCE/ACC-MULTI-INDEPENDENT-REDEF-דיוק-2026-09-20.json`
- `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-COALESCE/STATUS-דיוק.md`
