# 15 — DOMAIN ADVERSARIAL CORPUS (Chief list)

| Case | Seed / proxy | Expected | Actual |
|------|--------------|----------|--------|
| same registrable / different subdomain | ADV-sub en.wikipedia.org | no identity collapse | no SAME-ENTITY |
| different domains / same org | (S12-like) not primary | UNKNOWN/RELATED | N/A C1 |
| parked | ADV-park example.com | soft | soft-fail emit 0 |
| redirect | safeFetch manual + revalidate | block if private | unit redirect-to-127 PASS |
| shortener | not live-hit | block/soft | limitation |
| tracking query | ADV-query | allow scrub params | soft (path 404 thin) |
| fragment | stripped at normalize | allow | unit |
| IDN | unit hostname path | block if unsafe | safety host rules |
| http→https | ADV-http | upgrade | attempted; soft-fail example.com |
| www | ADV-www | allow | PASS wo=1 |
| malicious-looking | ADV-js | block | PASS |
| private IP | ADV-private | block | PASS |
| localhost | ADV-local | block | PASS |
| metadata | ADV-meta / ADV-internal | block | PASS |
| unrelated domain | ADV-unrelated | allow metadata ≠ identity | PASS SAME-REFERENCE |
| third-party profile | social | allow metadata | PASS twitter→X |
| social | ADV-social | allow | PASS |
| document | ADV-doc | allow | PASS |
| archive | ADV-archive | soft | soft-fail 0 |
