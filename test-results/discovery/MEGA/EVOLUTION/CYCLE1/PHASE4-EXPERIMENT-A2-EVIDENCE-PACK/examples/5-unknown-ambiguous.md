# examples/5-unknown-ambiguous · Arch scaffold

**Stamp:** 2026-09-20 10:36 IDT  
**Owner:** ארכיטקט  
**Rule:** Insufficient typed intersection → **UNKNOWN** · no attach · first-class outcome

---

### 1 · Bound#1 Preview pre-enrich (systemic UNKNOWN / multi=0)

| Field | Value |
|-------|-------|
| Preview | `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` |
| Observation | Mean multi=0 · VIAF present but family-local refs only |
| Why UNKNOWN | No shared typed soft-ref across families yet |
| Resolution path | A2-safe enrich (`dpl_7Mmf…`) — not title coalesce |

### 2 · S04 Stripe live enrich — still no cross-family typed join

| Field | Value |
|-------|-------|
| Preview | `dpl_7Mmf…` · findings_n=22 · multi_n=0 · viaf_n=8 |
| Samples | `viaf-30463651` Stripe, John · `viaf-126600779` Stripes · museum VIAFs |
| Why UNKNOWN | Enrichment cannot invent a shared qid/viaf across WD/OL/VIAF for the seed intent |
| Label | `unknown` / `possible-match` |

### 3 · International Red Cross Movement (S05) — typed id present, no multi attach observed

| Field | Value |
|-------|-------|
| Finding | `wd-Q7178` · refs include `viaf:145680594` · providers `[wikidata]` |
| Why UNKNOWN/unattached | No peer Finding in session shared that viaf/qid with foreign family Evidence |
| Note | Having a typed ref ≠ automatic multi; needs **shared** key + familyUnion≥2 |

### 4 · Saint George on Red Cross seed (S05) — off-topic authority hit

| Field | Value |
|-------|-------|
| Finding | `wd-Q48438` Saint George · `viaf:27862930` · single-family |
| Why UNKNOWN | No corroborating foreign-family Evidence sharing that key in-session |
| Label | `unknown` (wrt seed intent) |

### 5 · Acc/QA TBD — ambiguous enrichment conflict

| Field | Value |
|-------|-------|
| Scenario | TBD Acc: conflicting P214 / WKP / OL remote_ids on same Finding |
| Expected contract | Do not attach on conflict without shared stable key; prefer `unknown` |
| Owner | Acc/QA to instantiate with live adversarial case |

---

**Acc/QA:** Fill TBD rows; Arch marks UNKNOWN as allowed outcome under sufficient-evidence contract.
