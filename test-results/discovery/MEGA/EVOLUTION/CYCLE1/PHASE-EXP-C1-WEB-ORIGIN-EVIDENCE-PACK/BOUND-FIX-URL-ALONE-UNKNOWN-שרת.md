# BOUND FIX — URL-alone → UNKNOWN (שרת)

**Stamp:** 20/09/2026, 11:47:48 IDT  
**Role:** שרת · CYCLE1 EXP-WEB-ORIGIN (C1) · PREVIEW ONLY · **HOLD promote** · **No C2**

## Acc FAIL (confirmed)
| | |
|--|--|
| Bad dpl | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` |
| Seed | `https://www.who.int` |
| Live label | **SAME-REFERENCE** (forbidden for URL-alone) |
| Required | **UNKNOWN** |

## Fix shipped
| Path | Change |
|------|--------|
| `api/lib/discovery/webOrigin.js` `labelWebOriginRelationship` | `seedIsUrl` → **UNKNOWN** (never SAME-ENTITY / SAME-REFERENCE). RELATED-ENTITY only with non-URL seed + typed title/site overlap |
| `api/lib/discovery/store.js` | `clampWebOriginRelationship` on finding+evidence+facetHints — defense: web_origin never emits SAME-* |
| `api/lib/discovery/orchestrator.js` | graph edge default `unknown` (was `same-reference`) |
| `api/lib/discovery/providers.js` | passthrough only (uses buildWebOriginFinding) |
| `api/lib/discovery/emit.js` | Acc scrub only — **does not** set/rewrite relationship |

## Units
`node api/lib/discovery/webOrigin.test.mjs` → **96 passed / 0 failed**  
Asserts: URL seed → UNKNOWN; never SAME-REFERENCE for URL-alone.

## New Preview (this fix)
| | |
|--|--|
| dpl | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
| URL | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app |
| Inspect | https://vercel.com/k-akvot/akvot-simple-demo/Ho6jgJg4TGeDr5mjzv9sfRy4iW1w |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` (Preview env) |
| Alias | **UNTOUCHED** |
| Promote | **HOLD** |

## Live verify (vercel curl)

### `https://www.who.int` → UNKNOWN
```bash
vercel curl --deployment dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w --scope k-akvot \
  /api/discovery/sessions -- -sS -X POST -H 'content-type: application/json' \
  --data-binary '{"seed":"https://www.who.int","locale":"en"}'
# sessionId=kv1.12fc1032d31d4cff159265c0c36cb125 → status=complete
```

**JSON evidence (snippet):**
```json
{
  "seed": "https://www.who.int",
  "sessionId": "kv1.12fc1032d31d4cff159265c0c36cb125",
  "status": "complete",
  "providers": {
    "wikidata": "ok",
    "openlibrary": "ok",
    "wikipedia": "ok",
    "viaf": "ok",
    "web_origin": "ok"
  },
  "finding": {
    "id": "wo-7fd08b15039288ff",
    "hostFamily": "web_origin",
    "relationship": "UNKNOWN",
    "facetHints": [
      "provider:web_origin",
      "kind:page",
      "hostFamily:web_origin",
      "relationship:UNKNOWN"
    ],
    "hostname": "www.who.int"
  },
  "evidence.relationship": "UNKNOWN"
}
```

| Field | Value |
|-------|-------|
| finding.relationship | **UNKNOWN** |
| facetHints | relationship:**UNKNOWN** |
| evidence.relationship | **UNKNOWN** |
| SAME-REFERENCE / SAME-ENTITY | **absent** |
| providers.web_origin | ok |

### `example.com`
- providers.web_origin = **error** (fetch/soft-fail; cite-or-drop)
- web_origin findings = **0**
- **ZERO** SAME-REFERENCE / SAME-ENTITY anywhere in session JSON
- Bound held (no URL-alone SAME-* claim)

## STOP
Preview + Server bound fix complete. **HOLD promote. No alias. No C2.** Acc/QA own gates on new dpl.

---

## Chief semantic confirm (20/09/2026, 11:54:25 IDT)

**C1-PATCHED** `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` re-verified: finding + evidence + facet (+ narrow) all **UNKNOWN** for `https://www.who.int` and `who.int`.  
No successor Preview needed. **HOLD promote.**
