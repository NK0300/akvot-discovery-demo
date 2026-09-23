# 04 — S04 / S05 RECOVERY BOUNDS · ארכיטקט

**Owner:** ארכיטקט · **DESIGN ONLY — NO CODE**  
**Stamp:** 2026-09-20 10:47 IDT (Asia/Jerusalem, UTC+3)  
**Canonical Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`  
**Chief constraint:** typed cross-source OK · title / name / sim / threshold tricks **FORBIDDEN**  
**Locks:** HOLD promote · NO alias · NO EXP-B · NO Core change · B0 FROZEN · A2-bound REJECTED

---

## 1. Goal of “recovery”

Increase **truthful** SAME-REFERENCE attach where typed evidence already exists in the authority network but failed to intersect **in-session** — without raising false merges (esp. S04 Pretty-Wrong).

**Success metric preference:** TRUTH > MULTI. multi↑ with false Stripe↔person joins = **FAIL**.

---

## 2. S04 Stripe — bounds

### Why multi=0 (do not “fix” away)

- Zero cross-family typed joins in typed-enrich session.
- VIAF/OL hits are **true independent** persons/works/homonyms.
- WP `Stripe` / `Stripe, Inc.` = **missing ref**.
- Stripe Inc **Wikidata Finding absent** → no P214 bridge.

### ALLOWED recovery paths (design)

| ID | Path | Mechanism | Expected effect | Risk |
|----|------|-----------|-----------------|------|
| R4.1 | **Ensure WD org Finding in pool** | Discovery/query enrichment that retrieves Stripe company QID via **WD search / sitelink from WP**, then P214/remote ids if any | May create WD↔? join **only if** another family emits same typed key | Low if still typed-only |
| R4.2 | **WP → sitelink QID typed emit** | If Wikipedia provider can emit `qid:` from wk sitelinks / WD API (not from title string) | Turns WP missing-ref into typed carrier | Medium — must use sitelink API, never title parse |
| R4.3 | **VIAF corp filter / type facet** | Prefer org-typed VIAF records when seed context is org (still **no** title coalesce) | Reduces person noise; may surface corp VIAF that shares QID | Low |
| R4.4 | **OL remote_ids on org authors** | Already allowed enrich; no-op if empty | Only helps if OL has Stripe Inc author key with viaf/qid | Low |

### FORBIDDEN recovery paths (S04)

| ID | Path | Why forbidden |
|----|------|---------------|
| X4.1 | `title:` / exact title coalesce | Homonym Evidence cross-contam (A2-bound REJECTED) |
| X4.2 | Name similarity / Jaro / Levenshtein / embedding threshold | POSSIBLE≠SAME; Pretty-Wrong |
| X4.3 | “Stripe” ⊂ “Stripe, John” rules / substring | Explicit Acc adversarial case |
| X4.4 | Force-merge WP Stripe Inc with any VIAF named Stripe* | No shared typed key |
| X4.5 | SoftLabel vacuum / subset collapse | EXP-A vacuum class |
| X4.6 | Alias / promote / Core identity write | Out of lane |
| X4.7 | Threshold on multi_rate to pass gate | TRUTH > MULTI |

### S04 Arch verdict

**Accept multi=0** as correct under A2-safe until a **typed** WD/VIAF/OL org key intersects. Recovery is coverage/enrich — not similarity.

---

## 3. S05 Red Cross — bounds

### Why barely (0.1667)

- **OK clusters:** ARC (`qid:Q470110`↔`viaf:122023057`↔`ol:OL17804A`); ICRC (`ol:OL124327A`↔`viaf:160178001`).
- **Gaps:** WD+viaf without VIAF peer (e.g. Q7178 Movement `viaf:145680594`); OL American Red Cross without remote_ids; national Red Cross VIAF islands; homonyms (Saint George, Redd Kross, crossbill).

### ALLOWED recovery paths (design)

| ID | Path | Mechanism | Expected effect | Risk |
|----|------|-----------|-----------------|------|
| R5.1 | **Typed peer fetch by known VIAF** | When WD emits `viaf:NNNN` and no Finding has it, optionally fetch that VIAF record **by id** (not by name search) | Converts ref-present-unsupported → SAME-REFERENCE | Low — id fetch |
| R5.2 | **Typed peer fetch by known QID** | OL/VIAF row with `qid:` → ensure WD Finding for that QID present | Completes ICRC-like clusters | Low |
| R5.3 | **OL remote_ids backfill** | Re-read author `remote_ids` for OL rows near ARC | May join `ol-OL10303910A` → ARC cluster **if** ids match | Low; if ids differ keep separate |
| R5.4 | **P214 batch already on** | Keep WD→viaf enrich | Necessary but not sufficient without peers | — |
| R5.5 | **National society = stay separate** | Document as RELATED-ENTITY | Protects against mega-merge of Movement | N/A (policy) |

### FORBIDDEN recovery paths (S05)

| ID | Path | Why forbidden |
|----|------|---------------|
| X5.1 | Merge all “Red Cross*” titles into one Evidence set | RELATED≠SAME; national societies distinct |
| X5.2 | Title similarity threshold across ARC/ICRC/Movement | Would false-attach Movement↔painting↔band |
| X5.3 | Hierarchical org ontology invent (parent Movement absorbs nationals) | SAME-ENTITY Gate territory — out of A2-safe |
| X5.4 | Name-only link of `ol-OL10303910A` to Q470110 | source limitation must be fixed via **remote_ids**, not title |
| X5.5 | Promote / alias / EXP-B | STOP |

### S05 Arch verdict

Recovery **R5.1–R5.3** are in-bounds (typed id fetch / enrich). Do **not** collapse movement-level RELATED into SAME-REFERENCE without shared keys.

---

## 4. Global allow / deny checklist (Chief)

| Action | S04 | S05 |
|--------|-----|-----|
| Typed cross-source enrich (P214, WKP, remote_ids) | ALLOW | ALLOW |
| Fetch provider record **by typed id** | ALLOW | ALLOW |
| Title / exact-title coalesce | **DENY** | **DENY** |
| Fuzzy name / sim / embedding threshold | **DENY** | **DENY** |
| Substring / token overlap join | **DENY** | **DENY** |
| Invent SAME-ENTITY | **DENY** | **DENY** |
| Attach ceiling above SAME-REFERENCE | **DENY** | **DENY** |
| Code implementation this pack | **NO** | **NO** |

---

## 5. Exit criteria before any recovery code

1. Forensics failure classes accepted (this pack §01).  
2. Vocabulary final acknowledged (§03).  
3. These bounds reviewed by Chief.  
4. Acc/QA hardening AFTER planned on Preview only — **still HOLD promote**.

---

## STOP

**Design only. NO recovery code in this pack. HOLD promote.**
