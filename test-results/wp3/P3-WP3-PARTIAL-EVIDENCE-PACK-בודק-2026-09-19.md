# P3 · WP3 L2 PARTIAL EVIDENCE PACK · בודק · 2026-09-19

**STATUS:** **FAIL Acc gate** · WP3 **NOT CLOSED** · L2-C/L2-D **HOLD**  
**MODE:** MEASURE ONLY · **NO Core / denylist / dpl / UX**  
**TIME:** 2026-09-19 ~22:56 IDT  

## Executive

| Field | Value |
|-------|--------|
| Baseline | `dpl_7vAAEXkrSBYfS2XVR2VyujmxV3rR` · https://akvot-simple-demo.vercel.app |
| Fingerprint | `L2-FINGERPRINT-FROZEN-שרת-2026-09-19.json` |
| Harness | `wp3-l2-1.1.0` |
| WP3 verdict | **FAIL Acc gate** (F-L2-ACC-001) |
| Load (L2-A) | **PASS** · 390 req · err=0% · harness pw=0 |
| Soak (L2-B) | **PASS** · 274 req · err=0% · harness pw=0 |
| Failure (L2-C) | **INCOMPLETE** · burst/miss-storm/cohen-load PASS (222) · recovery **NOT RUN** (ABORT on Acc STOP) |
| Breakpoint (L2-D) | **NOT STARTED** (HOLD) |
| Acc | **NO-GO** · quiet ×3 intermittent Q1701775 ranking-leak |
| WP4 | **BLOCKED** |
| Rollback | `dpl_6TmottkUQ3UbnHYfGNwYjeQbFJd8` |

**Bottom line:** Capacity streams L2-A/B are green under harness `prettyWrongN=0`, but Acc lock failed on baseline quiet (Smith POST candidates with forbidden `Q1701775` #1). Product integrity gate blocks WP3 close and any WP4 perf work. No Core change in this pack.

---

## 1. Latency / capacity (L2-A)

Concurrency: Low=2 · Med=5 · High=10 · Peak=20 · cases Assaf / Smith POST+ctx / כהן · COLD+WARM.

| Step | N | err% | pw | Notable |
|------|---|------|-----|---------|
| Low | 120 | 0 | 0 | Cohen COLD p50≈33.9s · Assaf WARM p50≈79ms |
| Med | 120 | 0 | 0 | Cohen WARM p95 spike ≈40s (MISS) · Smith WARM≈COLD |
| High | 90 | 0 | 0 | Assaf WARM HIT 13/15 · Cohen COLD p50≈36.5s |
| Peak | 60 | 0 | 0 | Assaf WARM HIT 9/10 · Cohen WARM≈COLD under peak |

**Artifacts:**  
`L2-LOAD-L2A-low-7ec45493.{json,md}` · `…-med-03eef9bf` · `…-high-45839c8e` · `…-peak-38eed42e`  
Milestones: `L2A-MILESTONE-{low,med,high,peak}-בודק-2026-09-19.md`

**Measured hypotheses:**  
1. Multi-instance cache miss → Smith WARM≈COLD (HIT≈0 on Smith) — **supported**  
2. Cohen wiki tail ~20–28s — **supported** (p50 often 19–36s COLD; p95 ~45s budget)  
3. Assaf WARM HIT when warm — **supported** at High/Peak  

---

## 2. Reliability / soak (L2-B)

| Field | Value |
|-------|--------|
| Duration | 10m · buckets 2m · Med mix |
| Requests | 274 · HTTP 200 · err=0% · to=0 · harness pw=0 |
| HIT ratio | buckets ≈ 10% → 6% → 11% → 24% → 27% (partial trailing ignored) |
| p50 drift | ~3.3–10.6s across full buckets · p95 near ~45s throughout |
| INFRA | Wiki upstream pressure (429/timeout/retry) · **no** Vercel ACCESS/403 abort |

**Artifacts:** `L2-SOAK-L2B-soak10m-30836c77.{json,md}` · `L2B-MILESTONE-soak10m-בודק-2026-09-19.md`

---

## 3. Failure probes (L2-C) — incomplete

| Probe | Result | Notes |
|-------|--------|-------|
| burst | PASS · pw=0 | CLIENT_STRESS |
| miss-storm | PASS · pw=0 | CLIENT_STRESS |
| cohen-load | PASS · pw=0 | CLIENT_STRESS |
| recovery | **NOT RUN** | ABORT after Acc STOP |

Partial N≈222 · err=0% · harness pw=0 · no ACCESS/403.  
**Artifacts:** `L2-FAILURE-L2C-{burst,miss-storm,cohen-load}-*.{json,md}` · `L2C-SUMMARY-בודק-2026-09-19.md`

---

## 4. Safety / Acc (gate FAIL)

| Event | Result |
|-------|--------|
| Acc sample L2-A | prior samples under lock |
| Acc sample L2-B→L2-C | **STOP** · Smith POST · ui=candidates · faces=0 · qid=null · **Q1701775 #1 candidate** |
| Acc×3 quiet (דיוק) | **NO-GO** · r1 clean · **r2 Q1701775#1** · intermittent on quiet baseline |
| Classify (שרת×1 quiet) | temporarily clean → early “load-correlated” class |
| **RECLASSIFY** | intermittent **ranking-leak on baseline quiet** · **not** SoT commit · Acc **P0 gate blocker** |

**Hard rule applied:** NEVER Q1701775 anywhere (including candidates) → pw=1 even if ui≠dossier / faces=0.

**Artifacts:**  
`L2-STOP-ACC-PW-Chief-2026-09-19.md`  
`L2-ACC-SAMPLE-L2B-דיוק-2026-09-19.{md,json}`  
`L2-ACC-X3-QUIET-דיוק-2026-09-19.md`  
`L2-ACC-X3-NOGO-DECISION-Chief-2026-09-19.md`  
`F-L2-ACC-001-CLASSIFY-{שרת,ארכיטקט}-2026-09-19.md`  
`F-L2-ACC-001-RECLASSIFY-{שרת,ארכיטקט}-2026-09-19.md`

---

## 5. Resources / INFRA notes

- Vercel System Mitigations: **not** observed as abort cause in L2-A/B/partial-C  
- Wiki 429 / timeout / retry: **heavy** under load/soak — harness still HTTP 200 · Acc integrity separate  
- Cache: Smith path largely MISS (multi-instance) · Assaf can HIT when warm  

---

## 6. Bottleneck Top-10 (measurement only — for Arch L2-D when unblocked)

Deferred full L2-D map. Provisional from L2-A/B Evidence only:

1. Cohen wiki COLD tail (~20–45s)  
2. Smith POST WARM≈COLD / MISS  
3. Wiki 429/retry amplification under concurrency  
4. Peak Cohen WARM collapse to COLD-like  
5. p95 near Vercel 60s budget under soak  
6–10. TBD after Acc P0 gate + L2-C complete + Arch L2-D  

**No optimize.** Rankings above are MEASURE candidates only.

---

## 7. Four capacity questions (Evidence answer status)

| # | Question | Status |
|---|----------|--------|
| 1 | How much can it serve? | **Partial** — Low→Peak completed with err=0; peak concurrent 20 held HTTP 200 |
| 2 | Where does degradation start? | **Partial** — Cohen/wiki + Smith miss dominate before hard fail; Acc integrity failed first |
| 3 | Real bottleneck? | **Incomplete** — wiki tail + ranking-leak Acc; L2-D HOLD |
| 4 | What must change for next target? | **Acc P0 gate first** (ranking-leak Q1701775) · then finish L2-C/L2-D · WP4 still BLOCKED |

Until Acc gate green: **WP4 = BLOCKED**.

---

## 8. Open findings

| ID | Class | Severity | Action |
|----|-------|----------|--------|
| **F-L2-ACC-001** | intermittent ranking-leak (quiet baseline) · Q1701775 in Smith candidates | Acc **P0** | Separate Acc Gate (denylist candidate) — **Chief only** · **no patch in WP3** |

---

## 9. Rollback / freeze

- Prod alias frozen on `dpl_7vAA…` · rollback known `dpl_6Tmott…`  
- **NO** Core · denylist · dpl · UX · Expected rewrite in this pack  
- L2-C resume / L2-D / WP4: **HOLD** until Acc quiet green + Chief GO  

---

## 10. Recommendation (בודק)

1. Treat WP3 L2 as **FAIL Acc gate** with **partial capacity Evidence preserved** (L2-A/B PASS).  
2. Open **Acc P0 Gate** separately (Chief) for Q1701775 candidate denylist / ranking class — not a WP3 perf package.  
3. After Acc quiet ×3 PASS: resume L2-C recovery → L2-D → single final Evidence Pack.  
4. Do **not** conflate harness `prettyWrongN=0` with Acc NEVER-QID-in-candidates rule.

**Owner:** בודק · pack path: `test-results/wp3/P3-WP3-PARTIAL-EVIDENCE-PACK-בודק-2026-09-19.md`
