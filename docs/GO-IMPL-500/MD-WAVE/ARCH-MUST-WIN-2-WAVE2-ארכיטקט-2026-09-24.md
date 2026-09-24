# ARCH · Must-Win #2 · wave≥2 expand · 2026-09-24

**Who:** ארכיטקט  
**Status:** **LOCKED** · Server **GO implement**  
**SoT parent:** `ARCH-LOOP-SPINE-ארכיטקט-2026-09-24.md`  
**Why now:** Night `dpl_HETtu7…` PARTIAL — yield=1 + single `beginWave` + only Hop A = **honest Hop**, not multi-wave loop. Server HOLD until this FILL.

**Locks:** **NO PROMOTE** · TREATMENT untouched · flags default **OFF** · C1 · cite-or-drop · SSRF · **no crawl** · **no new HTTP host** · OL/ORCID still HOLD

---

## 0. Definition: Hop vs Loop (measure honesty)

| Shape | Evidence |
|-------|----------|
| **Hop** | one eligible expand provider · `wave=1` · stop `ALL_HOPS_SETTLED` after it |
| **Loop (Must-Win #2 bar)** | journal shows **`wave≥2`** · expand ran again under budget · stop is `NO_PROGRESS` / `ALL_HOPS_SETTLED` after wave-2 / `BUDGET` / `MAX_WAVES` — not “one hop and done” while maxWaves unused |

PARTIAL on Hop A remains correct for `dpl_HETtu7…`. New Night Preview after this wire.

---

## 1. LOCKED behavior

### 1.1 Multi-wave driver (required)
`nightLoop` must **loop** `ledger.beginWave()` while `ok`, up to `maxWaves` (default **3** already in `NIGHT_BUDGET_DEFAULTS`) — **not** a single `beginWave()` call.

Per wave:
1. pick eligible hops for **this wave** (below)  
2. expand → evaluate (existing gates) → merge candidates (URL dedupe)  
3. corroborate (ceiling UNKNOWN — no identity merge)  
4. `decideStop` — if stop, break; else continue next wave

### 1.2 Wave-1 hops (unchanged set)
| Hop | Flag | Role |
|-----|------|------|
| `general_web` | `DISCOVERY_ENABLE_GENERAL_WEB` | Hop A locale 1.2 |
| `ddg_instant` | `DISCOVERY_ENABLE_DDG_INSTANT` | optional · fail-closed OK · **does not block** |

Order: `general_web` then `ddg_instant`.  
Night Preview may omit DDG; loop bar still needs **wave≥2** via §1.3.

### 1.3 Wave-2 hop (NEW — reuse existing family, no new host)
| Field | Lock |
|-------|------|
| **When** | After wave-1: budget remains · `wave<maxWaves` · ≥1 evaluate-ok `url_candidate` in frontier |
| **Hop id** | `web_origin` |
| **Flag** | `DISCOVERY_ENABLE_WEB_ORIGIN` **default OFF** (existing) |
| **Input** | ≤**2** URLs from wave-1 candidates (stable sort by url; already evaluate-gated) |
| **Action** | existing web_origin / hop-validated public fetch — **enrich only** (title/snippet/whyFound) · re-run `evaluateUrlCandidate` |
| **Emit** | still `relationship=UNKNOWN` · `identityClaim=false` · **no** SAME-ENTITY · cite-or-drop |
| **Caps** | ≤2 origin fetches · honor wall/AbortSignal · count toward night ledger fetches |
| **If flag OFF** | wave-2 **still begins**; eligible hops empty → journal `wave2_no_eligible_hop` → stop `NO_PROGRESS` (honest: loop attempted, no second hop wired). Prefer Preview with WEB_ORIGIN=1 for a real enrich path. |

### 1.4 Wave-3
Optional only if budget + new evaluate-ok URLs appeared in wave-2 **and** a remaining eligible hop exists. Else stop. No open-ended crawl.

---

## 2. Stop taxonomy (clarify)
| Reason | When |
|--------|------|
| `ALL_HOPS_SETTLED` | all hops **for all attempted waves** settled (ok or fail-closed) |
| `NO_PROGRESS` | wave≥2 ran but 0 new URLs / no eligible hop |
| `BUDGET_EXHAUSTED` / `ABORTED` / `MAX_WAVES` | unchanged |
| `EMPTY_FRONTIER` | no seed / no hops |

Do **not** use `ALL_HOPS_SETTLED` after wave-1 alone while `maxWaves>1` and wave-2 was never attempted when candidates+budget remained — that was the Hop-shaped PARTIAL.

---

## 3. Night Preview measure (`-e` only)
```text
DISCOVERY_ENABLE_NIGHT=1
DISCOVERY_ENABLE_GENERAL_WEB=1
DISCOVERY_ENABLE_WEB_ORIGIN=1
# optional: DISCOVERY_ENABLE_DDG_INSTANT=1  (fail-closed OK)
```
Never project-wide Preview env · never TREATMENT · **NO PROMOTE**.

Success smoke (any one demo seed): spine journal **`wave≥2`** + evaluate gates held · Acc pw=0 / SAME-from-URL=0.  
Enrich soft-wrong (e.g. gulfnews) still UNKNOWN — Acc watch unchanged.

---

## 4. Non-goals
- ❌ HTML SERP / link-follow crawl / CDX  
- ❌ New hosts / ORCID / OL deepen (still HOLD)  
- ❌ Identity unfreeze  
- ❌ Claiming Wave 1 product DONE  
- ❌ Docs-only “wave” without `beginWave` ≥2 in journal

---

## 5. Version
Stamp night loop: `2026-09-24.night.loop.2` (or Server equivalent) when wave driver + web_origin wave-2 land.

**Verdict:** Must-Win #2 FILL **LOCKED** · Server **GO** · **NO PROMOTE**
