# 11 — ENTITY-TYPE ROUTING · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY · lightweight  
**Ground:** Integration Review §4 · Gap `06-ENTITY-TYPE-GAPS` · S04 Stripe lesson

---

## Principle

Route **person / org / domain / document** (and ambiguous) toward **family subsets**.  
This is a **routing prior**, not an identity classifier. Wrong route → fewer/noiser findings — never SAME-ENTITY.

---

## Types (closed for minimum design)

| Type | Signals (sketch) | Prefer families | Demote / avoid |
|------|------------------|-----------------|----------------|
| `person` | Person-like name tokens; VIAF personal nametype later | wikimedia · viaf · openlibrary · scholarly(slot) | filings(slot) |
| `org` | Brand / Inc / Ltd / NGO cues; corporate VIAF | wikimedia · viaf · filings(slot) · news(slot) | OL author-primary noise |
| `domain` | hostname / registrable domain | web_origin · rdap_dns(slot) · wikimedia label | OL |
| `document` | ISBN/title-work cues; quote-heavy | openlibrary · wikimedia · scholarly(slot) | viaf-as-person assumption |
| `ambiguous` / `unknown` | Conflict / underspecified | Conservative wikimedia (+ web_origin if URL) | Broad fanout |

Orthogonal to intent taxonomy (07): type ⊆ routing; intent ⊆ query shape. Example: `org` + `domain` seed `stripe.com` → U0 early + org-prefer registry — **not** “Stripe is identified.”

---

## Subset tables (executable sketch)

### person
1. viaf (if flag) + wikidata + wikipedia  
2. openlibrary authors  
3. web_origin only if URL candidates present  

### org
1. wikidata + wikipedia + viaf corporate (if flag)  
2. web_origin if URL/domain  
3. filings/gov **slots only** (no adapter)  
4. Demote OL author ranking for org-intent (PHASE5 Step 48)

### domain
1. **U0 web_origin early**  
2. Optional WD/WP on registrable label  
3. Never ownership / SAME-* from domain  

### document
1. openlibrary + wikidata  
2. wikipedia if work page  
3. No crawl of full text  

---

## Anti-lessons (must encode)

| Lesson | Routing rule |
|--------|--------------|
| S04 Stripe | Do not expect VIAF/OL author path to fix corp authority gap |
| S05 Red Cross | Authority granularity ≠ multi inflate |
| S16 URL | Domain/url type → U0 before registry verbatim bag |

---

## Interaction with QueryPlan

```text
seed → intent (07) × entityType (11) → family subset ∩ enabled flags → steps (06)
```

If intent and type conflict (e.g. url intent + person remnant): **intent url wins for U0**; remnant may add constrained name step.

---

## STOP

Lightweight routing design. No ML entity linker · no Core types · no impl.
