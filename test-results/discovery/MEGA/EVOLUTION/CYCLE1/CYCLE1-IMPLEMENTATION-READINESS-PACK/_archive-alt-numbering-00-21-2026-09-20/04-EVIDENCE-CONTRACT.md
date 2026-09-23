# 04 — EVIDENCE CONTRACT · Chief Gate D

**Stamp:** 2026-09-20T13:36:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**SoT cite:** `01-ARCHITECTURE-OVERVIEW.md` (stays) · `07-EVIDENCE-GRAPH.md` · `02` provenanceRequirements · C1 SEMANTIC-CONTRACT · AS-IS `store.js` normalizeRawHit

---

## 1. Finding (normalized discovery unit)

| Field | Required | Notes |
|-------|----------|-------|
| `findingId` | YES | Stable within session |
| `title` / `label` | YES | Acc-scrubbed |
| `summary` / `quote` | PER provenanceRequirements | Floor chars from plan |
| `providerId` | YES | Adapter id |
| `familyId` | YES (target) | Source family |
| `hostFamily` | YES | Independence layer |
| `sourceUrl` / registry label | PER plan | Provenance |
| `softRefs` | NO | Only typed `qid:`/`viaf:`/`ol:` — never `web_origin:` for attach |
| `relationshipState` | YES | Closed vocab label (see 05) |
| `evidenceIds` | YES | Supporting evidence |
| `fingerprint` | YES | Dedupe key |
| `planId` / `intentId` | YES (target) | Provenance to plan |
| `createdAt` | YES | Session-local timestamp |

**Not a dossier. Not Core identity.**

---

## 2. Evidence row

| Field | Required | Notes |
|-------|----------|-------|
| `evidenceId` | YES | |
| `findingId` | YES | Parent |
| `providerId` / `familyId` | YES | |
| `url` | WHEN applicable | Canonical; urlSafety lineage |
| `origin` | WHEN web_origin | Metadata origin descriptor |
| `timestamp` | YES | Observed/fetched |
| `provenance` | YES | planId, intentId, extractionMethod, signalSummary |
| `extractionMethod` | YES | e.g. `api_search` · `registry_lookup` · `origin_metadata` · `enrich_typed_ref` |
| `evidenceStrength` | YES | explainable enum: `strong`\|`moderate`\|`weak`\|`metadata_only` — **not** identity confidence |
| `quote` / `summary` | PER floor | |
| `rawRef` | NO | Opaque pointer; never Acc-forbidden payload on emit |

---

## 3. Source descriptor

| Field | Notes |
|-------|-------|
| `providerId` | AS-IS adapter |
| `familyId` | Registry |
| `authorityClass` | SoT 03 |
| `safetyClass` | trusted_api \| public_metadata \| untrusted_web \| credentialed |
| `hostFamily` | Independence |

---

## 4. URL · origin · timestamp

- URL must be canonicalized before fingerprint/graph node.  
- Origin metadata (title/og/siteName) = **untrusted** content (SoT 12 · C1).  
- Timestamp = fetch/observe time; freshness KPI may remain UNKNOWN until instrumented (SoT 13).

---

## 5. Provenance (mandatory)

Every Finding/Evidence emitted under QueryPlan path MUST include:

```text
provenance = {
  planId, intentId, familyId, providerId,
  extractionMethod, signalSummary (Acc-scrubbed),
  createdAt
}
```

If provenance cannot be cited → **do not emit** Finding (or emit UNKNOWN relationship only with explicit gap reason).

---

## 6. Evidence strength (non-identity)

| Strength | When |
|----------|------|
| strong | Typed registry hit with quote/summary + source URL/label |
| moderate | Bibliographic/API hit with partial fields |
| weak | Thin snippet |
| metadata_only | web_origin page meta — **ceiling** for URL path; never upgrades identity |

**Forbidden:** mapping strength → SAME-ENTITY or identity %.

---

## 7. Relationship state on Finding

Closed set (inherit A2/C1 HARDENING):  
`SAME-ENTITY` · `SAME-REFERENCE` · `RELATED-ENTITY` · `POSSIBLE-MATCH` · `UNKNOWN` · `CONTRADICTORY`

Default for insufficient signal: **UNKNOWN**. See `05-RELATIONSHIP-SEMANTICS.md`.

---

## 8. AS-IS mapping

| Today | Contract |
|-------|----------|
| normalizeRawHit | KEEP as normalization substrate |
| dedupeByEvidenceFingerprint | KEEP |
| coalesceBySoftEntity (A2-safe) | KEEP ceiling SAME-REFERENCE typed path |
| detectContradictions | KEEP → contradicts edges |
| emit sanitize | KEEP + extend to plan fields |

Schema: `schemas/Evidence.schema.json`.
