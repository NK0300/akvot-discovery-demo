# L2-C cohen-load milestone — בודק — 2026-09-19

- Result: PASS for this probe (exit code 0); CLIENT_STRESS only; no harness abort.
- Artifacts:
  - JSON: `test-results/wp3/L2-FAILURE-L2C-cohen-load-161364ea.json`
  - MD: `test-results/wp3/L2-FAILURE-L2C-cohen-load-161364ea.md`
- Requests: 15; error: 0%; timeout: 0; HTTP 200: 15; prettyWrongN: 0; pw: 0.
- Wall latency: p50 33232ms, p95 40182ms, p99 40182ms; throughput 0.227 RPS.
- Cache HIT ratio: 0% (15/15 misses).
- INFRA: Wiki upstream pressure (403 HTTP 429s, 4 timeouts, 407 retries); no Vercel ACCESS/403 observed.
- Gate: recovery was not started because a separate concurrent Acc sample reported pw=1 and issued `L2-STOP-ACC-PW-Chief-2026-09-19.md`.
