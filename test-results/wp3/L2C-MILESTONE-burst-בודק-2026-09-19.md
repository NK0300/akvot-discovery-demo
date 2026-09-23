# L2-C burst milestone — בודק — 2026-09-19

- Result: PASS (exit code 0); CLIENT_STRESS only; no abort.
- Artifacts:
  - JSON: `test-results/wp3/L2-FAILURE-L2C-burst-13bb4056.json`
  - MD: `test-results/wp3/L2-FAILURE-L2C-burst-13bb4056.md`
- Requests: 187; error: 0%; timeout: 0; HTTP 200: 187; prettyWrongN: 0; pw: 0.
- Wall latency: p50 4040ms, p95 38209ms, p99 45202ms; throughput 1.948 RPS.
- Cache HIT ratio: 2.7%.
- INFRA: Wiki upstream pressure (2054 HTTP 429s, 159 timeouts, 2213 retries); no Vercel ACCESS/403 observed.
- Gate: miss-storm permitted.
