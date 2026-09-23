# 07-QA-RESULTS · A2-SAFE vs B0

**Stamp:** 2026-09-20T10:42:29+03:00  
**Preview:** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` · https://akvot-simple-demo-221421o5s-k-akvot.vercel.app  
**Promote:** HOLD

## Smoke QA (Server live measure)

| Check | Result | Detail |
|-------|--------|--------|
| mean multi ≥ 0.15 | **PASS** | 0.2074 |
| Acc leak = 0 | **PASS** | 0 |
| S01 no vacuum | **PASS** | findings=18 (B0=10) |
| Pretty-Wrong Stripe | **PASS** | S04 multi_rate=0 |
| Homonym adversarial | **PASS** | 12/12 · leak=0 |
| Core alias still 8ag | **PASS** | dpl_8agSZKvcb2pjehzXgMeckDgJvDV8 |
| Discovery B0 Avyhr | **PASS** | dpl_AvyhrW24gGRquWCPPZdydBiz81dv |
| Relationship labels emitted | **PASS** | S01 edges=45 · labels present |
| Promote | **HOLD** | no alias retarget |

## vs B0

| Seed | B0 findings | B0 multi | A2-safe findings | A2-safe multi |
|------|------------:|---------:|-----------------:|--------------:|
| S01 | 10 | 0 | 18 | 0.5556 |
| S04 | 14 | 0 | 22 | 0 |
| S05 | 6 | 0 | 30 | 0.0667 |

## Verdict

**QA smoke PASS** on A2-safe · **HOLD** for Chief review (no promote ask).
