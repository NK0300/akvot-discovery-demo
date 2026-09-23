# 02 — CURRENT DISCOVERY GRAPH

**Stamp:** 2026-09-20T11:00:19+03:00 · Asia/Jerusalem (IDT)  
**Mode:** docs-only · describes B0 + A2-experimental Preview paths without promoting either  
**SoT code:** `api/lib/discovery/orchestrator.js` · `providers.js` · `store.js`

---

## Pipeline (seed → providers → findings → typed refs → coalesce)

```
POST /api/discovery/sessions
  body.seed | body.q  ──trim──► session.seed
  body.locale || 'en' ─────────► session.locale   (NO auto HE-detect on B0)
  body.hints (opaque) ─────────► stored; NOT used to rewrite q

S1  softEntityResolve(seed)
      → softRefs: ["seed:<sha256[0:12]>"]  · status:candidate
      → NO alias list · NO query expansion

S2  for each provider in getDefaultProviders():
      B0:        [wikidata, openlibrary, wikipedia]
      A2 Preview:[wikidata, openlibrary, wikipedia] + viaf IFF DISCOVERY_ENABLE_VIAF=1
      p.search({ q: session.seed, locale, hints, budgetMs })
           ▲
           └── SAME raw seed string for every provider (no QueryPlan)

S3  normalize provider hits → Evidence rows (url, quote/summary, domain, providerId)
S4  attach Evidence to Finding candidates (kind=registry|page)
S5  dedupeByEvidenceFingerprint (URL|quote|provider scoped)  ← NOT cross-family merge
S6  [A2-safe Preview ONLY] coalesceKeysForFinding + corroborateBySoftLabel
      typed keys: viaf: | qid: | ol: | fingerprint
      attach_keep IFF |typedKeys(A)∩typedKeys(B)|≥1
                   AND hostFamilyUnion ≥ 2
                   AND ¬CONTRADICTORY
      ceiling label: SAME-REFERENCE (Gate) · never dossier / identity claim
      vocabulary: SAME-ENTITY · SAME-REFERENCE · RELATED-ENTITY · POSSIBLE-MATCH · UNKNOWN · CONTRADICTORY
S7  rank (DOMAIN_AUTHORITY · corroboration · directness · freshness · httpsOnly)
S8  facets · Acc scrub · emit (GET/SSE/narrow)
```

## hostFamily map (runtime)

| Host pattern | Family |
|--------------|--------|
| wikidata / wikipedia / wikimedia | `wikimedia` |
| openlibrary | `openlibrary` |
| viaf | `viaf` |
| other | registrable domain pair (e.g. `who.int`) |

WD + WP = **one family**. Multi-independent requires ≥2 families on the **same Finding** after coalesce.

## What is NOT in the graph today

| Missing layer | Effect |
|---------------|--------|
| QueryPlan / multi-query fanout | Compound/role/URL seeds forwarded as opaque bags → empties (S13–S16) |
| Locale auto-detect | HE seeds stay on EN wiki unless caller sets locale=he |
| Secondary id fanout (QID→VIAF hop as new query) | Enrich helps keys; does not expand discovery surface |
| News / filings / gov / scholarly emitters | Authority table orphans; S04 coverage hole |
| Open-web crawler (`web_public`) | Interface-only; deferred |
| Relationship invention | Explicitly forbidden — INFORMATION ≠ IDENTITY |

## Lane comparison

| Step | B0 (production lock) | A2-safe experimental Preview |
|------|----------------------|------------------------------|
| Providers | WD·OL·WP | + VIAF (flag) |
| Cross-family coalesce | NO (multi=0) | YES typed-only (mean multi≈0.21) |
| Alias / promote | B0 alias FROZEN | Preview only · NO promote |
| Title-only merge | N/A | **FORBIDDEN** (A2-bound REJECTED) |

## Product stance

**MAXIMUM PUBLIC-WEB DISCOVERY** = more independent grounded Evidence.  
**MULTI** = metric of independence attach — **not** the product goal.  
Do not invent relationships the sources do not support.
