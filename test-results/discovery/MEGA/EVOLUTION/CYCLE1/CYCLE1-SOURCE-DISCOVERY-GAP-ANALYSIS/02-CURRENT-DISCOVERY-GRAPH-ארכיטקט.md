# 02 — CURRENT DISCOVERY GRAPH / PIPELINE · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · pipeline deepen: @שרת  
**Mode:** Gap Analysis · DOCS ONLY · NO EXP-B · NO promote  
**Code SoT:** `api/lib/discovery/{orchestrator,providers,store,emit,facets,narrow,sessionStore}.js`

---

## Pipeline stages (S0–S10)

```
POST /api/discovery/sessions
  body.seed|q ──trim──► session.seed
  body.locale || 'en' ─► session.locale
  body.hints (opaque) ─► session.hints   (NOT used to rewrite q)

S0  create session · mintSessionId · durable/map store
S1  softEntityResolve(seed) → softRefs seed:<hash12> · status:candidate
S2  fanout: for each provider in getDefaultProviders():
      p.search({ q: SAME raw seed, locale, budgetMs })
S3  normalizeRawHit → Evidence + Finding stubs
S4  dedupeByEvidenceFingerprint (URL/provider scoped)
S5  [A2-safe Preview] coalesceBySoftEntity — typed soft-ref ONLY (Bound#1)
S6  rankFindings (authority · corroboration · directness · freshness)
S7  aggregateFacets · detectContradictions (shallow)
S8  session.graph annotations (provisional labels)
S9  Acc scrub (sanitizeDiscoveryPayload) on emit
S10 status complete · SSE/poll snapshot
```

**No query-expansion layer** (PHASE5 SEARCH-STRATEGY-MAP). Seed is forwarded verbatim.

---

## Finding ↔ Evidence ↔ EntityRefs

| Object | Role | Notes |
|--------|------|-------|
| **Finding** | User-visible discovery unit (title, kind, ranking, evidenceIds[]) | NOT Core identity · identityScore always null |
| **Evidence** | Provenance artifact (provenanceUrl, domain, quote, providerId, fingerprint) | One Evidence ≈ one URL/provider hit after normalize |
| **entityRefs / soft-refs** | Typed keys on RawFinding: `viaf:` · `qid:` · `ol:` (+ legacy `wd-`/`ol-`) | Bound#1: **never `title:`** for coalesce |
| **hostFamily** | Independence class from domain: wikimedia · openlibrary · viaf · else eTLD+1 | WD+WP → **same** family |
| **graph** | Optional session graph edges / relationship labels | Labels provisional; attach ceiling = SAME-REFERENCE |

### A2-safe attach rule (frozen baseline)

```
SAME-REFERENCE attach iff:
  |keys(A) ∩ keys(B)| ≥ 1
  AND hostFamily(A) ≠ hostFamily(B)
  AND keys ∈ {viaf:*, qid:*, ol:*}
→ Evidence[] unioned onto Finding (INFORMATION ≠ IDENTITY)
```

Vocabulary (6): SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY.  
**Ceiling:** attach = SAME-REFERENCE only · never invent SAME-ENTITY.

---

## Provider graph (runtime)

| Lane | Providers | Families |
|------|-----------|----------|
| B0 / Production (flag unset) | WD · OL · WP | wikimedia · openlibrary |
| A2 Preview (`DISCOVERY_ENABLE_VIAF=1`) | + VIAF | + viaf |

---

## What is NOT in the graph today

- Query planner / multi-query fanout / alias / transliteration  
- Locale auto-detect from HE script  
- URL/domain origin resolver  
- Core identity commit / `mayCommitDossier` (explicitly out of Discovery)  
- hostFamily / sourceIndependence as durable schema fields on emit (Phase3 gap — docs only)  
- True source mtime freshness  

---

## OWNER

| Who | Fill |
|-----|------|
| **@שרת** | Exact stage timings, SSE event map, store durability matrix |
| **@דיוק** | Acc scrub points vs coalesce order |
| **@ממשק** | What UI shows vs raw Finding/Evidence/graph |
