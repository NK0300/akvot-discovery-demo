# 08 — ENTITY-TYPE ROUTING · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · routing ≠ identity classification / scoring

---

## Purpose

Change **discovery intent and family selection** by seed class so the planner stops expecting VIAF to fix Stripe (S04 lesson) or library adapters to resolve bare URLs (S16 lesson).

**This is NOT:**

- An identity classifier  
- A confidence/scoring model  
- A Core entity resolution Gate  
- Permission to emit SAME-ENTITY  

---

## Seed classes

| seedClass | Detection cues (design; heuristic, fallible) | Primary intents |
|-----------|-----------------------------------------------|-----------------|
| `person` | Person-like name tokens; optional typed refs later | IDENTITY_REFERENCES, PUBLICATIONS, DOCUMENTS, ALIASES |
| `company` | Corp markers (Inc, Ltd, GmbH…); ticker-like | ORGANIZATION_PRESENCE, FILINGS, REGISTRIES, NEWS, WEB_ORIGIN |
| `organization` | Org/NGO/gov naming without clear corp filing path | ORGANIZATION_PRESENCE, REGISTRIES, NEWS, IDENTITY_REFERENCES |
| `domain` | Hostname / registrable domain | OFFICIAL_WEB_ORIGIN (early) |
| `url` | URL-shaped seed | OFFICIAL_WEB_ORIGIN (early) |
| `document` | ISBN/DOI-like / title+doc cues | DOCUMENTS, PUBLICATIONS, SCHOLARLY |
| `ambiguous` | Compound/role/under-specified (S12–S15 class) | Conservative: IDENTITY_REFERENCES + ALIASES with tight budget; prefer UNKNOWN over inventing |
| `unknown` | No reliable cue | Minimal B0-compatible fanout; UNKNOWN-safe |

Detection errors must degrade to `ambiguous` / `unknown`, never to identity theater.

---

## Routing effects

| seedClass | Prefer families | Deprioritize / skip |
|-----------|-----------------|---------------------|
| person | knowledge_graph, authority, bibliographic, scholarly | filings (unless also company signal) |
| company | filings, registries, news, knowledge_graph, web_origin | person-centric authority-only paths as sole strategy |
| organization | registries, government, knowledge_graph, news | assuming brand = legal entity |
| domain / url | web_origin first | library/KG verbatim as sole path |
| document | bibliographic, scholarly, archives | news blast |
| ambiguous | small budget multi-intent exploratory | large alias fanout; title-bridge |
| unknown | B0 substrate only | speculative families |

---

## Relationship to softEntityResolve

Existing opaque `seed:<hash>` soft refs remain. Routing may **read** known typed refs from session but must not invent them. Routing labels are plan inputs, not Acc identity tokens.

---

## Acceptance

- Wrong class → suboptimal plan, **not** false SAME-*  
- Ambiguous seeds may return empty/UNKNOWN — valid  
- No scoring UI (“82% person”) in Discovery experimental lanes  
