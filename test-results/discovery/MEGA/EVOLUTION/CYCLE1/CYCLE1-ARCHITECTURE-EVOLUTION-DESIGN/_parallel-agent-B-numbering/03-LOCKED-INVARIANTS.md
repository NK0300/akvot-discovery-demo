# 03 — LOCKED INVARIANTS · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Parents:** Integration Review `05-SECURITY-ACC-INVARIANTS` · `04-IDENTITY-VOCABULARY-INTEGRATION` · A2 Baseline · C1 Bound

---

## Freeze locks (must not break)

| Lock | State | Cite |
|------|-------|------|
| **B0 Discovery** | LOCKED production | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` |
| **Core** | LOCKED · pw/leak 0/0 | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` |
| **A2-safe** | FROZEN EXPERIMENTAL · NOT PROMOTED | `dpl_DZmXtttPqDjpecyXDnKpryJzyd6q` · typed coalesce |
| **A2-bound** | REJECTED | title-bridge |
| **C1-PATCHED** | FROZEN EXPERIMENTAL · CLOSED · NOT PROMOTED | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
| **PROMOTE** | HOLD | Integration Review / Chief |

---

## Acc scrub (HOLD)

- Scrub forbidden Q-ids from findings / evidence / facets / contradictions / GET / narrow / SSE  
- Leak target: **0** (frozen packs cite leak=0 on B0, A2-safe, C1-PATCHED)  
- ProvenanceUrl = public https only after scrub  
- QueryPlan / family telemetry MUST NOT emit Acc-forbidden identities  

**Review-note @דיוק:** confirm scrub surfaces still cover any future `session.queryPlan` field.

---

## Relationship vocabulary (CLOSED SET · FROZEN)

1. SAME-ENTITY  
2. SAME-REFERENCE  
3. RELATED-ENTITY  
4. POSSIBLE-MATCH  
5. UNKNOWN  
6. CONTRADICTORY  

### Non-negotiable inequalities

| Rule | Meaning |
|------|---------|
| RELATED ≠ SAME | RELATED never licenses attach |
| POSSIBLE ≠ SAME | POSSIBLE never licenses attach |
| UNKNOWN ≠ FALSE | UNKNOWN is first-class |
| UNKNOWN ≠ SAME | No upgrade without typed evidence |
| URL ≠ typed id | URL/host/domain/origin/page alone are **not** typed soft-refs |

---

## Bound: URL → UNKNOWN

URL seed alone · bare host alone · domain alone · normalize-alone · seed-is-URL self-cite / provenance echo → **UNKNOWN**.

Principle: **useful may stay UNKNOWN**. Discovery ≠ identity.

---

## SAME-REFERENCE = typed ids only

**SAME-REFERENCE** iff ≥1 canonical typed soft-ref shared across ≥2 distinct hostFamilies.

**Allowed typed prefixes (A2-safe ceiling today):** `viaf:` · `qid:` · `ol:`  

**NOT evidence for SAME-REFERENCE:** same URL · same host · same registrableDomain · same origin · same page · `web_origin:{domain}` entityRef · title agree · string sim.

**A2-safe coalesce ceiling:** attach Evidence across families at SAME-REFERENCE only — never SAME-ENTITY from Discovery Preview alone.

---

## urlSafety (fail closed)

All URLs entering discovery normalize/fetch MUST pass `urlSafety` / `assertSafePublicHttpsUrl`:

- https only (upgrade → re-validate)  
- No userinfo · no dangerous schemes  
- Block: localhost / private / link-local / metadata / internal / raw IP provenance  
- Redirects: re-assert every hop · cap (C1: `MAX_REDIRECTS = 3`)  
- Timeout + body size caps · candidate cap (C1: `MAX_ONE_HOP_URLS = 5`) — **no crawl frontier**

---

## Preview vs production

| Surface | Rule |
|---------|------|
| B0 `DEFAULT_PROVIDERS` | WD · OL · WP only — no experimental default |
| Preview flags | `DISCOVERY_ENABLE_VIAF=1` · `DISCOVERY_ENABLE_WEB_ORIGIN=1` — Preview only |
| Future QueryPlan / family flags | Preview-first · never B0 without Chief GO |

---

## Soft ER non-identity

`softEntityResolve` → `seed:<sha256[0:12]>` softRefs · status candidate · **NOT identity**. QueryPlan must not reinterpret softEr as entity truth.

---

## STOP

Breaking any invariant above = Acc FAIL / Security FAIL / Bound FAIL — not a multi tradeoff.
