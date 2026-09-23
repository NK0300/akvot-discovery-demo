# FINDING-COUNTS — בודק · 2026-09-20

**Stamp:** 2026-09-20T09:53:15+03:00 IDT  
**Mode:** Observation only · NO CODE · NO PROMOTE · B0 only  
**Deployment:** `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` @ https://akvot-discovery.vercel.app  
**Acc deep-scan Q1701775:** **0** (create+get, all seeds)

## Aggregate

| Metric | Value |
|--------|-------|
| Seeds | 5 |
| Findings total (pool) | 57 |
| Mean findings / seed | 11.4 |
| Mean coverage | 1.000 |
| Mean provenance completeness | 1.000 |
| Acc leakage total | **0** |

### Flag counts (pool)

| Class | Count | Pool rate | Mean per-seed rate |
|-------|------:|----------:|-------------------:|
| duplicate | 6 | 0.1053 | 0.0857 |
| near-dup | 19 | 0.3333 | 0.2238 |
| contradiction | 19 | 0.3333 | 0.2238 |
| no-evidence | 0 | 0.0000 | 0.0000 |
| weak-evidence | 44 | 0.7719 | 0.7457 |
| single-source | 57 | 1.0000 | 1.0000 |
| multi-source | 0 | 0.0000 | 0.0000 |

### Kind / provider / domain mix (pool)

- **kinds:** {"registry": 38, "page": 19}
- **providers:** {"openlibrary": 29, "wikidata": 9, "wikipedia": 19}
- **domains:** {"openlibrary.org": 29, "wikidata.org": 9, "en.wikipedia.org": 19}

## Per-seed

| id | seed | n | status | dup | near | contr | no-ev | weak | single | multi | coverage | prov | Acc | domains |
|----|------|--:|--------|----:|-----:|------:|------:|-----:|-------:|------:|---------:|-----:|----:|---------|

| FQ01 | דוד כהן | 5 | partial | 0 | 0 | 0 | 0 | 4 | 5 | 0 | 1.00 | 1.00 | 0 | openlibrary.org |
| FQ02 | Alex Morgan | 21 | partial | 0 | 10 | 10 | 0 | 19 | 21 | 0 | 1.00 | 1.00 | 0 | en.wikipedia.org, openlibrary.org, wikidata.org |
| FQ03 | example.org | 3 | complete | 0 | 0 | 0 | 0 | 2 | 3 | 0 | 1.00 | 1.00 | 0 | en.wikipedia.org, wikidata.org |
| FQ04 | John Smith+IBM/NY/US | 14 | partial | 0 | 9 | 9 | 0 | 8 | 14 | 0 | 1.00 | 1.00 | 0 | en.wikipedia.org, openlibrary.org |
| FQ05 | כהן | 14 | partial | 6 | 0 | 0 | 0 | 11 | 14 | 0 | 1.00 | 1.00 | 0 | en.wikipedia.org, openlibrary.org |

### Per-seed rates

| id | dup | near | contr | no-ev | weak | single | multi |
|----|----:|-----:|------:|------:|-----:|-------:|------:|
| FQ01 | 0.000 | 0.000 | 0.000 | 0.000 | 0.800 | 1.000 | 0.000 |
| FQ02 | 0.000 | 0.476 | 0.476 | 0.000 | 0.905 | 1.000 | 0.000 |
| FQ03 | 0.000 | 0.000 | 0.000 | 0.000 | 0.667 | 1.000 | 0.000 |
| FQ04 | 0.000 | 0.643 | 0.643 | 0.000 | 0.571 | 1.000 | 0.000 |
| FQ05 | 0.429 | 0.000 | 0.000 | 0.000 | 0.786 | 1.000 | 0.000 |

### Notable session signals


- **FQ01 `דוד כהן`** session `kv1.2ad2c1acc9fa9f10ca77dd8b4284e96f` · contradictions=0 · idCollisions={} · providersStatus={'wikidata': 'error', 'openlibrary': 'ok', 'wikipedia': 'error'}
- **FQ02 `Alex Morgan`** session `kv1.7fa51090f9f22cdb91d894f7931c5613` · contradictions=1 · idCollisions={} · providersStatus={'wikidata': 'ok', 'openlibrary': 'partial', 'wikipedia': 'partial'}
- **FQ03 `example.org`** session `kv1.501561a083669ed5bbdae564d7641687` · contradictions=0 · idCollisions={} · providersStatus={'wikidata': 'ok', 'openlibrary': 'ok', 'wikipedia': 'ok'}
- **FQ04 `John Smith+IBM/NY/US`** session `kv1.7291c35503783a88bb291e82833d8c80` · contradictions=1 · idCollisions={} · providersStatus={'wikidata': 'error', 'openlibrary': 'partial', 'wikipedia': 'partial'}
- **FQ05 `כהן`** session `kv1.174ee069c73bd91143fbf3063c26b317` · contradictions=0 · idCollisions={'wp-en-_': 6} · providersStatus={'wikidata': 'error', 'openlibrary': 'partial', 'wikipedia': 'partial'}

## Machine-readable

`FINDING-COUNTS-בודק-2026-09-20.json`  
Full flag rows: `FINDING-ANALYSIS-בודק-2026-09-20.json`

## Raw evidence

```
/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/PHASE3-FINDING-QUALITY/raw/
  reuse-Alex_Morgan-{create,get}.json          # Phase2 B02
  reuse-example.org-{create,get}.json           # Phase2 B03
  reuse-John_Smith-{create,get}.json            # Phase2 B07 (no-hints reference)
  create|get-F01-david-cohen.json                 # דוד כהן fresh
  create|get-F02-bare-cohen.json                  # כהן fresh
  create|get-F03-smith-ctx.json                   # John Smith+IBM/NY/US fresh
```
