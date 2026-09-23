# 06-ACC · ACC-GATES-AND-CONSTRAINTS · דיוק · 2026-09-20

**Stamp:** 2026-09-20T11:37:49+03:00 (2026-09-20 11:37 IDT)  
**Owner:** דיוק (Accuracy) · CYCLE1 EXP-WEB-ORIGIN (C1) · PREVIEW ONLY  
**Mode:** Gates + constraints READY · **live Acc = WAITING_FOR_PREVIEW**  
**Promote:** **HOLD · NO promote** · NO B0 / Core / A2 mutation

---

## Chief LOCK (identity Bound)

| Rule | Acc enforcement |
|------|-----------------|
| URL/domain alone → identity label max **UNKNOWN** | Acc **FAIL** if any `web_origin` Finding/Evidence emits **SAME-ENTITY** or **SAME-REFERENCE** from URL/domain/seed-is-URL alone |
| **RELATED-ENTITY** only with extra typed (non-URL) evidence | Lexical title/site overlap may yield RELATED/POSSIBLE; host/reg alone ≠ typed evidence |
| `web_origin` = **evidence**, not identity collapse | `web_origin:` entityRefs **must not** mint coalesce soft-refs; Acc audit coalesce keys |

SoT: Arch `02-RELATIONSHIP-BOUNDS` · `03-NO-IDENTITY-COLLAPSE-CHECKLIST` · Gap `ACC-CONSTRAINTS-FOR-NEXT-EXPERIMENTS-דיוק.md`

---

## Hard Acc gates (must all PASS when Preview live)

| # | Gate | Pass condition | Fail ⇒ |
|---|------|----------------|--------|
| AG1 | **leak = 0** | Acc scrub leak = 0 on nested / SSE / narrow / HIT / logs / telemetry / facets / contradictions / softEr | BLOCK accept |
| AG2 | **forbidden Q never surface** | `Q1701775` and other poison QIDs never appear in findings, evidence, facets, SSE, narrow, HIT, logs, telemetry strings | BLOCK |
| AG3 | **URL-alone identity** | No SAME-ENTITY · no SAME-REFERENCE from URL/domain alone (incl. seedIsUrl self-cite) | Acc **FAIL** |
| AG4 | **Pretty-Wrong / false-merge = 0** | Homonym URL↔person/org · lookalike host · brand domain → no false SAME-* merge; false_merge_risk_n = 0 | BLOCK |
| AG5 | **Core alias pw=0 leak=0** | Core `akvot-simple-demo.vercel.app` / Core dpl unchanged: Pretty-Wrong=0 · Acc leak=0 (smoke on alias; no retarget) | BLOCK |
| AG6 | **SSRF fail-closed** | localhost / private / metadata / redirect-to-private → BLOCK + safe telemetry · **0** Findings from blocked hops | BLOCK |
| AG7 | **title-only coalesce = 0** | No title:/sim coalesce keys introduced by C1 | BLOCK (A2-bound class) |
| AG8 | **UNKNOWN preferred** | Insufficient / URL-alone → UNKNOWN (not invented SAME) | BLOCK |
| AG9 | **MULTI ≠ objective** | multi reported as metric only; not a promote gate for C1 | Framing |
| AG10 | **Locks** | B0 LOCKED · Core LOCKED · A2 FROZEN · HOLD promote | Verify stamp |

---

## Leak surfaces (Acc scan checklist — full when Preview)

| Surface | What Acc scans | Pass |
|---------|----------------|------|
| Nested snapshot (GET session) | findings · evidence · facets · graph · contradictions · softEr · providers · progress | leak=0 · no Q1701775 |
| SSE `/events` | finding chunks · facets chunks · scrubFindingChunk | leak=0 |
| Narrow | narrow payload / projected candidates | leak=0 · Core chrome scrubbed |
| HIT / create response | initial create body | leak=0 |
| Logs / runner raw | pack `raw/*` strings | no poison Q surface |
| Telemetry / safetyDecision | reasons may cite block class; **must not** echo forbidden Q as identity | scrubbed |

---

## Gates A–O · Acc-relevant checklist

Aligned with QA `07-CONTROL-VS-TREATMENT-PLAN` A–O + Hardening A–L pattern. Acc owns F / AG* measurement; peers own docs/impl.

| Gate | Name | Acc-relevant criterion | Acc status NOW |
|------|------|------------------------|----------------|
| **A** | Experiment definition | URL≠identity Bound locked; vocab 6 labels; web_origin=evidence | **DOCS PASS** (Arch+Acc) |
| **B** | Baseline CONTROL | B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` · Acc leak=0 · pw hold | **PLAN READY** · live PENDING |
| **C** | Implementation / Preview dpl | Server STATUS/PREVIEW pointer required before Acc live | **WAITING_FOR_PREVIEW** |
| **D** | Tests | Acc consumes Server/QA runner; no Acc code mutation of Core/B0 | **WAITING** |
| **E** | Adversarial | Acc poison+SSRF corpus READY (`05-ADVERSARIAL/ACC-POISON-…`) + QA domain corpus | **CORPUS READY** · live PENDING |
| **F** | Acc | AG1–AG10 all PASS on Treatment vs Control | **WAITING** live |
| **G** | QA smoke | Seed matrix vs CONTROL/TREATMENT; Acc co-reads leak/labels | **WAITING** |
| **H** | Comparison metrics | Control B0 vs Treatment Preview · Acc leak · label hist · same_entity_from_url_n=0 | **WAITING** |
| **I** | Representative success | ≥5 grounded web_origin where ALLOW+snippet; labels ≤ Bound | **WAITING** |
| **J** | FP rejected | No SAME-* from URL; lookalike/homonym FP cases Acc-tagged | **WAITING** |
| **K** | UNKNOWN / FN | URL-alone default UNKNOWN documented; FN honesty | **WAITING** |
| **L** | Limitations + decision | HOLD promote · no C2–C6 · no A2 mutation | **HOLD** (docs) |
| **M** | SSRF / security | 100% BLOCK on private/meta/localhost + redirect-to-private Acc audit | **WAITING** live |
| **N** | Locks unchanged | B0+Core+A2 frozen; Core alias pw=0 leak=0 smoke | **HOLD** verify on live stamp |
| **O** | Promote ask | **FORBIDDEN** until Chief GO after Acc PASS | **NO promote** |

---

## Acc live plan (execute AFTER Preview appears in pack)

Trigger when **any** of: `STATUS-שרת.md` · `PREVIEW*` · `20-PREVIEW*` · `raw/deploy*` declares Treatment `dpl_*`.

1. **Control B0** vs **Treatment Preview** on QA seed matrix + Acc poison/SSRF subset  
2. **Acc leak scan** full surfaces (table above)  
3. **Identity label audit** on all `hostFamily=web_origin` findings — fail on SAME-ENTITY / SAME-REFERENCE from URL alone  
4. **Adversarial subset live** from `ACC-POISON-AND-SSRF-CORPUS`  
5. Write `06-ACC/ACC-AFTER-PREVIEW-דיוק-*.md` + `.json` · update `STATUS-דיוק.md`  
6. **NO promote** · **NO** B0/Core/A2 mutation

---

## Explicit non-goals

- Chasing multi as sole objective  
- Treating S04/S05 multi as Acc FAIL  
- Inventing Preview `dpl_*` before Server STATUS  
- Promoting C1 or retargeting aliases  

---

## Deliverables this stamp

| Path | State |
|------|-------|
| `06-ACC/ACC-GATES-AND-CONSTRAINTS-דיוק-2026-09-20.md` | **READY** |
| `06-ACC/ACC-GATES-AND-CONSTRAINTS-דיוק-2026-09-20.json` | **READY** |
| `05-ADVERSARIAL/ACC-POISON-AND-SSRF-CORPUS-דיוק-2026-09-20.md` | **READY** |
| `05-ADVERSARIAL/ACC-POISON-AND-SSRF-CORPUS-דיוק-2026-09-20.json` | **READY** |
| `STATUS-דיוק.md` | **WAITING_FOR_PREVIEW** |
| `06-ACC/ACC-AFTER-PREVIEW-דיוק-*` | **NOT YET** (no Server Preview pointer in pack) |

## STOP

**Acc plan READY · WAITING_FOR_PREVIEW · HOLD promote · NO Acc PASS|FAIL verdict until live.**
