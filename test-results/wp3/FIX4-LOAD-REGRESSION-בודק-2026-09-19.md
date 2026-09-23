# FIX-4 Load Regression · בודק · 2026-09-19

**STATUS:** **PASS** · CLIENT_STRESS · Preview only · no Core patch · no promote · alias frozen

Generated: 2026-09-20T00:17:41+03:00 (Asia/Jerusalem, UTC+3)

## Target
- BASE: `https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app`
- Preview dpl: `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ`
- Health build: `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` · match=true
- Access: `vercel curl --scope k-akvot` with Origin `https://akvot-simple-demo.vercel.app`

## Required invariants
- pw count: **0**
- Q1701775 leakage: **0 hits / 0 requests**
- forbiddenStripped: **L2/34=1**
- denylist version: **2026-09-19.1**
- timeouts: **0** · errors: **0**

## Levels
| Level | Concurrency | Completed | Result | Leak hits | Timeouts | Errors | Stop reason |
| --- | --- | --- | --- | --- | --- | --- | --- |
| L1 | 2 | 30/30 | PASS | 0 | 0 | 0 | — |
| L2 | 5 | 40/40 | PASS | 0 | 0 | 0 | — |
| L3 | 10 | 30/30 | PASS | 0 | 0 | 0 | — |

## p50/p95 latency (ms)
| Level | Case | Requests completed | p50 | p95 |
| --- | --- | --- | --- | --- |
| L1 | smith | 20 | 8545 | 9211 |
| L1 | assaf | 5 | 2284 | 2347 |
| L1 | cohen | 5 | 2283 | 2357 |
| L2 | smith | 28 | 8318 | 8616 |
| L2 | assaf | 6 | 2243 | 2700 |
| L2 | cohen | 6 | 2256 | 2766 |
| L3 | smith | 20 | 8538 | 9257 |
| L3 | assaf | 5 | 2444 | 2822 |
| L3 | cohen | 5 | 2615 | 2915 |

## Stop reason
none; ladder completed

## Artifacts
- Runner: `test-results/wp3/FIX4-LOAD-raw/run-fix4-load.mjs`
- Raw payloads: `test-results/wp3/FIX4-LOAD-raw/`
- JSON report: `test-results/wp3/FIX4-LOAD-REGRESSION-בודק-2026-09-19.json`
