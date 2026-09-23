# 06 — URL-ORIGIN INTEGRATION · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · elevates C1 pattern · **preserves C1 Bound**

---

## Role in target architecture

**WEB-ORIGIN** becomes an **early discovery stage** invoked by QueryPlan intent `DISCOVER_OFFICIAL_WEB_ORIGIN`, not merely an optional trailing provider.

```text
URL/domain seed (or extracted URL candidates)
  → urlSafety gate
  → UrlOriginStage (metadata fetch; one-hop max)
  → emit URL / domain / page / document-meta Evidence
  → relationship label per C1 Bound
  → evidence graph nodes (url, domain) + provenance edges
  → NEVER silent identity upgrade
```

Cite: C1 Evidence Pack SEMANTIC-CONTRACT · RELATIONSHIP-BOUNDS · Integration Review system map.

---

## Bound (non-negotiable · FROZEN)

| Rule | State |
|------|-------|
| URL / hostname / domain alone → **UNKNOWN** | FROZEN (C1-PATCHED) |
| URL discovery ≠ identity | FROZEN |
| `web_origin` never mints typed soft-refs for attach | FROZEN |
| SAME-ENTITY forbidden under experimental lanes | FROZEN |
| BAD_URL_ALONE_SAME must remain 0 | Gate |
| Title/og lexical overlap ceiling POSSIBLE-MATCH (no attach) | Inherit C1 |
| Seed-is-URL self-cite → UNKNOWN provenance (not SAME-REFERENCE) | C1-PATCHED |

C1-PREPATCH SAME-REFERENCE-on-URL-alone = **KEEP FAIL** evidence — must not regress.

---

## What UrlOriginStage MAY emit

- URL node (canonicalized)  
- Domain / registrableDomain node  
- Page metadata (title, og, siteName) as Evidence fields  
- Document-like metadata if present in headers/meta (still not identity)  
- Soft-fail / blocked / empty as failure classes (not CONTRADICTORY)

## What it MUST NOT emit

- SAME-ENTITY / SAME-REFERENCE from URL alone  
- Domain ownership / WHOIS→identity  
- Recursive crawl frontier  
- Acc-forbidden identities  
- Silent coalesce keys prefixed `web_origin:` used for attach  

---

## Pipeline placement

| When | Trigger |
|------|---------|
| Early | seedClass ∈ {url, domain} or seed looksLikeUrlOrHostname |
| Late (optional) | One-hop from finding URLs already collected — **budget-capped**; no recursion |
| Never | Open crawl; browser automation; private-net targets |

---

## Progressive delivery

Partial origin metadata may stream via SSE as soon as UrlOriginStage returns, labeled UNKNOWN when Bound requires. Useful findings may stay UNKNOWN.

---

## Migration note

Elevate C1 from “extra provider” to planned stage **behind Preview flag** first (`16-MIGRATION-PATH.md`). Production B0 remains without web_origin until Chief promote GO. **PROMOTE = HOLD.**
