# BEFORE / AFTER EXAMPLES — URL-alone Bound

**Stamp:** 2026-09-20 12:05 IDT

## Example A — `https://www.who.int`

| Surface | C1-PREPATCH `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` | C1-PATCHED `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
|---------|-------------------------|-------------------------|
| finding.relationship | **SAME-REFERENCE** ❌ | **UNKNOWN** ✅ |
| evidence.relationship | **SAME-REFERENCE** ❌ | **UNKNOWN** ✅ |
| facetHints | `relationship:SAME-REFERENCE` ❌ | `relationship:UNKNOWN` ✅ |
| SAME-ENTITY | 0 | 0 |
| providers.web_origin | ok | ok |

Proof PREPATCH: `C1-PREPATCH/FAIL-who.int-SNIPPET.json` · `raw/TREAT-S16-NARROW.json`  
Proof PATCHED: `C1-PATCHED/PATCHED-who.int-SNIPPET.json` · `raw/BOUND-FIX-who.int.json`

## Example B — bare `who.int`

| Surface | PREPATCH | PATCHED |
|---------|----------|---------|
| finding.relationship | SAME-REFERENCE (prepatch TREAT-W5) | **UNKNOWN** |
| evidence / facet | SAME-REFERENCE | **UNKNOWN** |

## Example C — `example.com` (soft-fail path)

| | PATCHED |
|--|---------|
| providers.web_origin | error (cite-or-drop) |
| wo findings | 0 |
| SAME-* anywhere | **absent** — Bound held |

## Example D — SSRF `http://127.0.0.1/`

| | PATCHED |
|--|---------|
| wo findings | 0 |
| private provenance | 0 |
| Block | **PASS** |
