# 12 — LIMITATIONS · A2-safe · ארכיטקט

**Owner:** ארכיטקט · DOCS ONLY  
**Stamp:** 2026-09-20 10:36 IDT (Asia/Jerusalem, UTC+3)  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`

---

## 1. What A2-safe does NOT claim

| Claim | Status |
|-------|--------|
| Acc/QA formal PASS on enrich Preview | **NOT claimed** — waiting Acc/QA pack sections |
| Promote / alias retarget authorization | **NOT claimed** — **HOLD** |
| Entity resolution / dossier / same-person Gate | **NOT claimed** — attach ceiling = `same-reference` |
| Complete cross-family enrichment for all seeds | **NOT claimed** — S04 Stripe multi=0 expected |
| DESIGN.md already reconciled to Bound#1 | **NOT claimed** — Design lag remains |
| EXP-B readiness | **NOT claimed** — STOP until Chief Evidence Review |

---

## 2. Known operational limits

### 2.1 multi may stay low until enrichment

Bound#1 alone (`dpl_Fz2iq…`) → mean multi **0** even with VIAF present: providers emit family-local refs with no shared typed intersection.  
A2-safe enrich raises multi only where public APIs expose joinable ids (WKP/P214/OL remote_ids). Seeds without shared typed ids stay multi=0 by design (prefer multi=0 over false merges).

### 2.2 Pretty-Wrong / ambiguous orgs stay unattached

S04 Stripe: viaf_n=8 · multi_n=0 — corp/person ambiguity; no shared typed id across families. Correct reject under contract.

### 2.3 attach_keep ≠ Finding collapse

Multiple Finding rows may all carry the same multi-provider Evidence set after attach. Coverage is preserved; UI/Acc must not interpret that as a single dossier.

### 2.4 `labelRelationship` annotation vs contract ceiling

Code may annotate `same-entity` / `related-entity` when typed keys intersect and `titleSecondary` agrees/disagrees. **A2-safe product contract still caps attach meaning at `same-reference`** until an entity-resolution Gate exists. Do not treat the annotation as Gate PASS.

### 2.5 DESIGN.md lag

`PHASE4-EXPERIMENT-A2-COALESCE/DESIGN.md` still lists exact title as a coalesce key. Code Bound#1 is SoT. Lag is a documentation debt, not a license to reintroduce `title:`.

### 2.6 Enrichment coverage gaps → UNKNOWN

Findings with only family-local refs, missing P214/WKP/remote_ids, or conflicting ids remain **unknown** / single-family — not automatic failures of Bound#1.

### 2.7 Homonym still possible if authorities share a bad typed id

Bound#1 prevents title-only false attach. If two distinct real-world entities incorrectly share the same VIAF/QID in upstream data, A2-safe will attach — that is an authority-data risk, not solved here.

---

## 3. Measurement caveats

- Server smoke mean multi **0.2408** (gate 0.15) is **smoke**, not Acc ScoreCARD PASS.
- Pooled vs mean rates differ; Acc owns formal AFTER methodology.
- B0 Discovery alias and Core remain frozen/locked — comparing against alias live is out of scope for this Preview pack.

---

## STOP

Limitations are intentional. Do not “fix” by reintroducing title coalesce or starting EXP-B.
