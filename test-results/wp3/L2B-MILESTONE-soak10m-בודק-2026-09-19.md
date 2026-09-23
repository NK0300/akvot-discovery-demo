# L2-B Soak milestone — בודק — 2026-09-19

- Result: PASS (exit code 0); harness completed without abort.
- Artifacts:
  - JSON: `test-results/wp3/L2-SOAK-L2B-soak10m-30836c77.json`
  - MD: `test-results/wp3/L2-SOAK-L2B-soak10m-30836c77.md`
- Requests: 274 total; error: 0/274 (0%); timeout: 0; all observed statuses HTTP 200; prettyWrongN: 0.
- Bucket latency drift (wall p50/p95 ms):
  - 0 (0–120s, n=52): 7029/38117
  - 1 (120–240s, n=35): 10605/45192
  - 2 (240–360s, n=45): 6347/45187
  - 3 (360–480s, n=75): 3279/45180
  - 4 (480–600s, n=62): 5960/37654
  - 5 (600–635s, n=5, trailing partial): 34626/45184
- Cache HIT ratio by bucket: 0.096, 0.057, 0.111, 0.240, 0.274, 0.000 (partial trailing bucket).
- Drift note: p50 fluctuated 3279–10605ms in full buckets, with p95 near 45s throughout; trailing partial bucket is too small for trend inference.
- INFRA flags: no Vercel ACCESS/403 mitigation observed. Upstream Wiki pressure recorded: 3270 HTTP 429s, 110 Wiki timeouts, 3380 retries; all requests remained HTTP 200 with harness error 0%.
- L2-C gate: Soak passed; ready for parent decision to launch L2-C. Do not start L2-C here.
