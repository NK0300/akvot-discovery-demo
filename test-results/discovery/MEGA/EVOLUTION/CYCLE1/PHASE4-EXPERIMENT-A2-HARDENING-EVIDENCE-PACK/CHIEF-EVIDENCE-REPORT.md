# CHIEF-EVIDENCE-REPORT — A2-SAFE HARDENING

**Pack:** `/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE4-EXPERIMENT-A2-HARDENING-EVIDENCE-PACK/`  
**Stamp:** 2026-09-20 10:52:51+03:00 IDT  
**Preview:** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` · https://akvot-simple-demo-221421o5s-k-akvot.vercel.app  
**Mode:** Forensics-only hardening · **HOLD promote** · **NO** alias · **NO EXP-B**

## Phase 9 answers

### 1. Forensic root causes
| Seed | Root cause |
|------|------------|
| **S01** | Succeeds: Q80 P214↔VIAF 85312226 (+OL when enrich) → attach_keep; titleSecondary disagree → related-entity annotation |
| **S04** | Authority gap: Stripe Inc P214=[]; VIAF=person homonyms sans WKP; OL no remote_ids; WP underkeyed; title peers correctly UNKNOWN |
| **S05** | ARC typed cluster only; ICRC VIAF 160178001 ≠ Movement P214 145680594; nationals correctly separate; OL under-enriched |

### 2. Recovery attempted?
**NO** (code). Candidates evaluated & rejected (WP→qid same-family; P214 impossible; title forbidden; VIAF force-merge forbidden).  
`A2-safe-hardening` = **no change / forensics-only**.

### 3. Metrics summary
| Lane | mean multi | S01 | S04 | S05 | leak |
|------|-----------:|----:|----:|----:|-----:|
| B0 | 0 | 0 | 0 | 0 | 0 |
| A | 0 | 0 | 0 | 0 | 0 |
| A2-bound | 0.5189 (REJECTED) | — | — | — | 0 |
| A2-safe | **0.2074** | 0.5556 | 0 | 0.0667 | 0 |
| A2-safe-hardening | **0.2074** | 0.5556 | 0 | 0.0667 | 0 |

S01-only gains labeled **seed-specific**.

### 4. Gates A–L
See `07-GATE-CHECK.md` — all addressed; promote remains HOLD.

### 5. Recommendation
**experimental** — not production-ready. **NO promote ask. NO EXP-B.** STOP for Chief Evidence Review.

### 6. Locks
B0 `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` FROZEN · Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED · A2-bound REJECTED · TRUTH>MULTI held.

### Sibling SoT note
Arch/Acc also documented typed-enrich `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`. Executor live forensics + hardening baseline = user-specified A2-safe `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q`.
