# L2-C miss-storm milestone — בודק — 2026-09-19

- Result: PASS (exit code 0); CLIENT_STRESS only; no abort.
- Artifacts:
  - JSON: `test-results/wp3/L2-FAILURE-L2C-miss-storm-1a2035bd.json`
  - MD: `test-results/wp3/L2-FAILURE-L2C-miss-storm-1a2035bd.md`
- Requests: 20; error: 0%; timeout: 0; HTTP 200: 20; prettyWrongN: 0; pw: 0.
- Wall latency: p50 6693ms, p95 9112ms, p99 9249ms; throughput 2.162 RPS.
- Cache HIT ratio: 0% (20/20 misses).
- INFRA: Wiki upstream pressure (99 HTTP 429s, 31 timeouts, 130 retries); no Vercel ACCESS/403 observed.
- Gate: cohen-load permitted.
