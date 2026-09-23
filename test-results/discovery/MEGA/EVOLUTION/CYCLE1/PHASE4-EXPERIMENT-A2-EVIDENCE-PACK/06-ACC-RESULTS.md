# 06-ACC-RESULTS · A2-SAFE

**Stamp:** 2026-09-20T10:42:29+03:00  
**Preview:** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q`  
**Forbidden:** Q1701775 / wd-Q1701775

## Leak roll-up

| Surface | Leak |
|---------|-----:|
| S01/S04/S05 live | 0 |
| Homonym corpus (12) | 0 |
| GET / NARROW / SSE / nested (S01) | see JSON surfaces |
| Units adversarial + prCloseout | 0 (65/0 · 107/0) |
| **TOTAL measured** | **0** |

## Surfaces (S01)

```json
{
  "sid": "kv1.6ebffa2c3f6f5f4d7497627fe9b2109b",
  "surfaces": {
    "GET": {
      "leak": 0,
      "findings": 18,
      "edges": 45
    },
    "NARROW": {
      "leak": 0
    },
    "SSE": {
      "leak": 0,
      "bytes": 55687
    },
    "NESTED": {
      "leak": 0
    }
  }
}
```

## Verdict

# **PASS** Acc leak=0 · HOLD promote

JSON: `06-ACC-RESULTS.json`
