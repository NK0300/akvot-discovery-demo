# CHIEF-EVIDENCE-REPORT — EXP-A2-SAFE

**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/`  
**Stamp:** 2026-09-20T10:42:29+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Preview:** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` · https://akvot-simple-demo-221421o5s-k-akvot.vercel.app  
**Mode:** Preview evidence only · **HOLD promote** · **NO** alias retarget · **NO promote ask**

### Locks

| Lock | Status |
|------|--------|
| Discovery B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` | **FROZEN / UNCHANGED** |
| Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` | **LOCKED / UNCHANGED** |
| Title-only coalesce | **FORBIDDEN** |
| Title as identity key | **FORBIDDEN** |
| Similarity-alone same-entity | **FORBIDDEN** |

---

## A — Experiment definition

See `01-EXPERIMENT-DEFINITION.md`.

Typed soft-ref keys only (`viaf:` / `qid:` / `ol:` / fingerprint). Relationship vocabulary: same-source | same-reference | same-entity | related-entity | possible-match | unknown. Coalesce = attach_keep · INFORMATION≠IDENTITY.

**Status:** COMPLETE.

---

## B — Baseline

See `02-BASELINE.md`.

| Lane | mean multi | leak |
|------|------------|------|
| B0 | 0 | 0 |
| EXP-A | 0 | 0 |
| A2-bound FRNDab (caveat) | 0.5189 | 0 |
| A2 Bound#1 Fz2iq | 0 | 0 |
| A2-safe (this Preview) | **0.2074** | **0** |

**Status:** COMPLETE.

---

## C — Implementation diff

See `03-IMPLEMENTATION-DIFF.md`.

Paths: `api/lib/discovery/providers.js` · `store.js` (`coalesceKeysForFinding`, `labelRelationship`, `corroborateBySoftLabel`) · `orchestrator.js` (graph edges from/to + relationship) · unit tests. No secrets.

**Status:** COMPLETE.

---

## D — Test results

See `04-TEST-RESULTS.md`.

| Suite | Result |
|-------|--------|
| providers.viaf | 44/0 |
| corroboration.viaf | **50/0** |
| orchestrator | 105/0 |
| adversarial.acc | 65/0 |
| prCloseout.acc | 107/0 |

**Status:** COMPLETE.

---

## E — Adversarial homonym

See `05-ADVERSARIAL-HOMONYM.md` + `.json`.

Corpus **12** · pass **12** · leak **0**.

**Status:** COMPLETE · **PASS**.

---

## F — Acc results

See `06-ACC-RESULTS.md` + `.json`.

Full Acc leak measured **0** (payloads / nested / SSE / narrow / HIT paths sampled on S01 + homonym injects). Units Acc 0.

**Status:** COMPLETE · **PASS**.

---

## G — QA results

See `07-QA-RESULTS.md`.

Mean multi **0.2074** ≥ 0.15 · S01 coverage preserved · Pretty-Wrong Stripe multi=0 · Core/B0 locks PASS.

**Status:** COMPLETE · smoke **PASS** · HOLD.

---

## H — Comparison metrics

See `08-COMPARISON-METRICS.md` + `.json`.

Table B0 | A | A2-bound(FRNDab) | A2-safe — A2-safe preferred over FRNDab for safety; multi restored without title-bridge.

**Status:** COMPLETE.

---

## I — Representative success (5)

See `09-REPRESENTATIVE-SUCCESS.md`.

TBL Q80/VIAF/OL · ARC · ICRC · unit same-VIAF · title-variant typed attach.

**Status:** COMPLETE.

---

## J — False-positive rejected (5)

See `10-FALSE-POSITIVE-REJECTED.md`.

Title-only · title-homonym · Stripe↔Stripe John · non-intersecting typed forms · FRNDab title-bridge rejected as promote path.

**Status:** COMPLETE.

---

## K — False-negative / ambiguous UNKNOWN (5)

See `11-FALSE-NEGATIVE-AMBIGUOUS.md`.

S04 Stripe hole · wiki under-key · VIAF sans WKP · OL sans remote_ids · related Red Cross without shared typed id.

**Status:** COMPLETE.

---

## L — Limitations + decision

See `12-KNOWN-LIMITATIONS.md` · `13-DECISION-RECOMMENDATION.md`.

**Recommendation:** A2-safe smoke/Acc **PASS** · prefer over A2-bound · **HOLD promote** · **STOP for Chief Evidence Review** · no promote ask · no EXP-B.

**Deploy / locks:** `PREVIEW-DEPLOY.json` · `CORE-LOCK-CHECK.json` · `FILE-INDEX.md`.

---

## Executive return

| Field | Value |
|-------|-------|
| Preview dpl | `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` |
| Preview url | https://akvot-simple-demo-221421o5s-k-akvot.vercel.app |
| mean multi | **0.2074** (gate 0.15 PASS) |
| Acc leak | **0** |
| Recommendation | **HOLD** for Chief · A2-safe preferred · NO promote |
| Pack root | `.../PHASE4-EXPERIMENT-A2-EVIDENCE-PACK/` |
