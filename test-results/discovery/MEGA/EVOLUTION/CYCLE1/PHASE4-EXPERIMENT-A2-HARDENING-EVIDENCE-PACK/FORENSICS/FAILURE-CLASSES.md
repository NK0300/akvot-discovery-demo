# FAILURE-CLASSES.md — non-coalesce taxonomy

**Stamp:** 2026-09-20 10:52:51+03:00 IDT  
**Preview:** `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q`  

Attach requires typed soft-ref ∩ across ≥2 **hostFamily** buckets. Wikipedia+Wikidata → same `wikimedia`. Title peers never attach.

## Catalog

### `WIKIPEDIA_UNDERKEYED`
Wikipedia emits `wp:` only — not a coalesce key.

### `WD_MISSING_P214`
WD has qid but empty P214 → no viaf bridge.

### `VIAF_MISSING_WKP`
VIAF has viaf: only — no qid.

### `OL_MISSING_REMOTE_IDS`
OL has ol: only — no viaf/qid.

### `TYPED_KEYS_NO_CROSS_FAMILY_PEER`
Typed keys present but no other-family peer shares them.

### `TITLE_PEER_NO_TYPED_INTERSECTION`
Same title, disjoint typed keys — correctly UNKNOWN.

### `SAME_FAMILY_ONLY_CLUSTER`
Shared keys but one hostFamily only.

### `NO_TYPED_KEYS`
No viaf/qid/ol.

### `AUTHORITY_GAP_NO_CROSS_FAMILY_BRIDGE`
Upstream lacks cross-family bridge (e.g. Stripe Inc P214=[]).

### `CORRECT_NON_COALESCE_HOMONYM`
Distinct entities sharing lexical seed — non-coalesce = Acc success.

## S04 counts

| Class | n |
|-------|--:|
| `TYPED_KEYS_NO_CROSS_FAMILY_PEER` | 24 |
| `TITLE_PEER_NO_TYPED_INTERSECTION` | 9 |
| `WD_MISSING_P214` | 8 |
| `VIAF_MISSING_WKP` | 8 |
| `OL_MISSING_REMOTE_IDS` | 8 |
| `WIKIPEDIA_UNDERKEYED` | 6 |
| `NO_TYPED_KEYS` | 6 |

## S05 counts

| Class | n |
|-------|--:|
| `TYPED_KEYS_NO_CROSS_FAMILY_PEER` | 22 |
| `OL_MISSING_REMOTE_IDS` | 8 |
| `VIAF_MISSING_WKP` | 7 |
| `TITLE_PEER_NO_TYPED_INTERSECTION` | 6 |
| `WIKIPEDIA_UNDERKEYED` | 6 |
| `NO_TYPED_KEYS` | 6 |
| `WD_MISSING_P214` | 4 |

