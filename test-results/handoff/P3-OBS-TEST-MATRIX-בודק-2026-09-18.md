# P3 OBS EMIT — TEST MATRIX · בודק · 2026-09-18
**STATUS:** READY (spec) · WAIT Preview Evidence from @שרת  
**Baseline LOCKED:** `dpl_6TmottkUQ3UbnHYfGNwYjeQbFJd8`  
**Scope:** OBS emit ONLY (wikiMeta + HIT timing reset) · **no** Core/H1/cache/Smith/UX change  
**Arch:** `P3-OBS-EMIT-ARCH-BOUND-ארכיטקט-2026-09-18.md`

---

## 0. STATUS

| Field | Value |
|-------|--------|
| STATUS | **READY** · matrix SPEC · runs on Preview after emit dpl |
| WHAT | OBS positive / repeat / negative / operational matrix |
| EVIDENCE | this file · future `test-results/obs/OBS-*-בודק-*.{md,json}` |
| MEASURED | Spec only · alias today: wikiMeta **absent** (WP0) |
| NOT | Live Preview results (WAIT @שרת) |
| RISKS | Multi-instance no HIT · confusing ABSENT wikiMeta with product FAIL |
| NEXT | On Preview URL: run matrix → Chief deliverable · promote only on Gate |

---

## 1. Hard locks (non-OBS regression)

| Check | Expected |
|-------|----------|
| Assaf GET | dossier · **Q47507930** |
| Smith POST nested COLD+WARM | **not** dossier · **not** Q1701775 · faces=0 |
| T-C6 / כהן | need_context\|thin · 0 faces |
| pw | **0** |
| Any Core/H1/Smith behavior change | **STOP** · separate finding |

---

## 2. Positive cases (OBS must appear)

| ID | Request | OBS expect |
|----|---------|------------|
| O-P1 | Assaf GET COLD (nocache) | `wikiMeta` **present** (object) · `requestId` · `timings` |
| O-P2 | Smith POST nested COLD | `wikiMeta` present · ui=candidates · faces=0 |
| O-P3 | כהן GET COLD | `wikiMeta` present · ui=need_context\|thin |
| O-P4 | Assaf GET then repeat **without** nocache (HIT if same instance) | If `cached:true` / HIT: `timings.cacheHit` or reset total · **not** stale wall-vs-total lie |
| O-P5 | health | 200 · build = Preview dpl ≠ `dpl_6Tmott` |

---

## 3. Repeat / stability

| ID | Action | Expect |
|----|--------|--------|
| O-R1 | Smith POST ×5 COLD | wikiMeta every response · pw=0 |
| O-R2 | Assaf ×3 | dossier stable · wikiMeta each time |
| O-R3 | Same key ×10 no nocache | If any HIT: reset timings consistent · else document MISS (multi-instance) as **OBS note**, not FAIL |

---

## 4. Negative / edge

| ID | Action | Expect |
|----|--------|--------|
| O-N1 | Missing `q` / bad JSON | soft fail · no crash · wikiMeta optional |
| O-N2 | Wrong method | 405 · documented |
| O-N3 | Baseline alias `dpl_6Tmott` (control) | wikiMeta may still be **absent** — control only · not Gate FAIL |

---

## 5. Operational

| ID | Check | Expect |
|----|-------|--------|
| O-O1 | Latency wall vs timings.total on HIT | If HIT: timings not stale (G1) |
| O-O2 | Dup requestIds | rare OK · flag if all identical |
| O-O3 | Dropped body / empty | err tagged · no false PASS |
| O-O4 | ACCESS 403 streak | INFRA abort · not product FAIL |

---

## 6. Pass criteria (OBS GATE)

1. Preview build ≠ baseline `dpl_6Tmott`  
2. O-P1..P3: **wikiMeta present** on success JSON  
3. HIT path (if observed): timings reset / cacheHit flag  
4. Acc regression: Assaf/Smith/T-C6/כהן **UNCHANGED** · pw=0  
5. No Core/H1/cache/Smith behavior change  
6. Findings documented · rollback = stay on `dpl_6Tmott`

---

## 7. Chief deliverable skeleton

STATUS · OBS GATE · EVIDENCE · TESTS · REGRESSION · CORE/H1/CACHE/UX/SMITH · LATENCY · ERRORS · OPEN FINDINGS · ROLLBACK · RECOMMENDATION

*בודק · MEASURE FOR TRUTH · non-OBS finding → STOP*
