# 15 — FAILURE MODES AND SAFETY · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY  
**Ground:** C1 security bounds · Acc invariants · PHASE5 expansion noise · Integration Review risks

---

## Hazard → control matrix

| Hazard | How QueryPlan/families could make it worse | Control (design) |
|--------|--------------------------------------------|------------------|
| **SSRF** | More URL targets from plan/one-hop | urlSafety every hop · caps · https only · block private/metadata · fail closed |
| **Acc leak** | Plan reasons / facets echo forbidden QIDs | Acc scrub all new surfaces · leak=0 gate |
| **Overclaim / identity collapse** | Routing treated as identity; URL→SAME-* | Bound UNKNOWN · typed-only SAME-REFERENCE · no title-bridge |
| **Fanout blowup** | Multi-query × multi-family | Max steps/queries/families (06) · budget skip · no spelling flood |
| **Vanity coverage** | Dual locale / alias flood | Constraints ≠ queries · MULTI secondary |
| **OL noise on orgs** | Org seeds → author hits | Entity-type demote (11) |
| **Crawl creep** | “Just one more hop” | One-hop hard cap · no frontier |
| **Preview→B0 bleed** | Flag defaulting on | Preview flags · never B0 without Chief GO |
| **Core contamination** | Discovery writes identity | Core LOCKED · no mayCommitDossier |

---

## Soft-fail posture

| Component | On failure |
|-----------|------------|
| Single family/adapter | error/partial · continue |
| U0 target | drop target · continue |
| Entire plan classify | underspecified conservative plan |
| Acc scrub strip | emit scrubbed · telemetry stripped count |

Session hard-fail only for existing classes (e.g. empty seed 400) — not for “no findings.”

---

## Adversarial themes (design tests for future impl)

Reuse C1 adversarial domain + A2 homonym lessons:

- URL that looks like identity claim  
- Homonym multi-pressure  
- Redirect to blocked host  
- Seed with forbidden Q echo  
- Compound seed that invites relationship invention  

Future impl GO must include Acc + SSRF + Bound suites — see 17.

---

## STOP

Safety design. No security exceptions for “known-good” private IPs · no crawl · no code.
