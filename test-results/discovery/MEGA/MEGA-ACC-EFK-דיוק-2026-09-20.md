# MEGA · Acc Entity Resolution (EFK) · דיוק · 2026-09-20

**STATUS:** LOCKED Acc rules (Discovery Phase B continuous) · **NO promote** · Core Acc P0 alias **LOCKED**  
**Checked:** 2026-09-20 ~07:23 IDT (Asia/Jerusalem, UTC+3)  
**SoT denylist:** `forbiddenIdentities` **v2026-09-19.1** · class **Q1701775**  
**Core alias:** `https://akvot-simple-demo.vercel.app` · `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8`  
**Discovery Preview:** `https://akvot-simple-demo-kppgm355g-k-akvot.vercel.app` · `dpl_BMhUKUQ4rV4j7jgjPWLdLaXq5LLB`

---

## 0. Mission

Discovery is a **public-web findings engine**, not an identity guesser.  
Acc owns: **no false identity binding**, **provenance mandatory**, **pretty-wrong = 0**, **UNKNOWN ≠ FALSE**, **INFORMATION ≠ IDENTITY**, **forbidden QID never emitted**.

Pretty-wrong (pw) = dossier + faces on the wrong person. Under Discovery, **ranking contamination** (forbidden QID in candidates / facets / graph / SSE / narrow / HIT) is also **P0 Acc FAIL** even when faces=0.

---

## 1. Provenance mandatory (cite-or-drop)

| Rule | Acc meaning | ID |
|------|-------------|-----|
| Every Finding must carry Evidence with `provenanceUrl` (https) | No cite → drop Finding (or emit without entityRef) | **ACC-EFK-01** |
| Soft co-occurrence / same title | Hint only · **not** identity | **ACC-EFK-02** |
| Merge / bind / Entity Mode | **Only** with typed Evidence links + provenance | **ACC-DISC-05** |
| Conflict | Keep both Findings · surface conflict · **no silent drop** | **ACC-DISC-04** |

Public sources only. No invented KV secrets. No private data.

---

## 2. Pretty-wrong = 0 (sacred)

| Surface | Never |
|---------|-------|
| Core `/api/lookup` Smith+ctx | NEVER `Q1701775` · NEVER dossier · faces=0 · **pw=0** |
| Discovery emit | NEVER `dossier` / `faces` / `photoUrl` identity paint · NEVER `mayCommitDossier` |
| Cache HIT / fs-regen / SSE chunk | Re-scrub · same Acc rules |

**Invariant:** `pw=0` · `leakage=0` everywhere.

Core KEEP unchanged: **Assaf Rappaport → dossier Q47507930**.

---

## 3. UNKNOWN ≠ FALSE

| Situation | Acc action |
|-----------|------------|
| Soft HE name (כהן / דוד כהן) | soft UI · need_context / findings · **not** false dossier |
| Ambiguous Latin + ctx (Smith+IBM/NY/US) | candidates / findings · **not** celeb bind |
| Org/domain Seed | findings+provenance · **no** false person bind |
| Insufficient Evidence | Prefer **UNKNOWN** / need_context over false bind |

**Invariant IDs:** `ACC-DISC-03` UNKNOWN≠FALSE · Core soft path preserved.

---

## 4. Entity resolution rules (EFK)

| Rule | Must | Must not |
|------|------|----------|
| Same display name | Keep ≥2 Findings if Evidence differs | Merge into one identity without Evidence |
| Soft refs (`soft:…`) | Allowed as hints | Promote to QID dossier |
| Forbidden QID in entityRefs | **Strip** (not demote) · count `forbiddenStripped` | Rank / facet / graph / candidate |
| Ambiguous HE/EN twins | Parallel Findings · conflict visible | Collapse to single person |
| Entity collision (poison inject) | Scrub all surfaces before emit | Pass through Q1701775 class |

Adversarial fixtures: `MEGA/adversarial/ADV-01…04` (Q13–Q16).

---

## 5. Forbidden QID surfaces (scrub mandatory)

Forbidden QIDs (SoT v2026-09-19.1+) must be **stripped** from:

| Surface | Acc ID |
|---------|--------|
| findings / entityRefs / finding ids | ACC-DISC-01 |
| candidates[] (Core or Discovery-equivalent) | ACC-DISC-01 / ACC-DISC-06 |
| facets value IDs / buckets | ACC-DISC-01 |
| graph nodes / edges | ACC-DISC-01 |
| SSE progressive chunks | ACC-DISC-01 |
| narrow recompute emit | ACC-DISC-01 |
| HIT / fs-regen rehydrate | ACC-DISC-01 (+ `forbiddenIdentitiesVersion` required) |
| UI HTML / CTA | never reintroduce |

**NEVER Q1701775** in ranked Discovery outputs = **ACC-DISC-06**.

Discovery Mode: findings + evidence + facets only · **ACC-DISC-02** (no identity commit).

---

## 6. Failure Acc

| Event | Action |
|-------|--------|
| Provider returns forbidden QID | Strip · `forbiddenStripped++` · continue soft |
| Scrub fails / denylist unload | Fail closed on identity-bearing fields |
| Leakage in live battery | Acc Gate **NO-GO** · HOLD promote |
| KV credentials blocked | Still produce Acc docs + Core regression; durable path uses fs-regen |

---

## 7. Relationship to Core Acc P0 (LOCKED)

| Topic | Status |
|-------|--------|
| Assaf → Q47507930 | KEEP · GREEN required |
| כהן soft | need_context\|thin\|candidates · faces=0 |
| Smith POST+ctx | NEVER Q1701775 · faces=0 · pw=0 |
| Alias `dpl_8ag…` | **LOCKED** · Discovery additive only · **NO rewrite** · **NO promote** |

---

## 8. Out of scope this MEGA Acc wave

Alias promote · Core rewrite · inventing KV secrets · WP4 · Expected rewrite allowing Q170 in candidates.

**Path:** `test-results/discovery/MEGA/MEGA-ACC-EFK-דיוק-2026-09-20.md`
