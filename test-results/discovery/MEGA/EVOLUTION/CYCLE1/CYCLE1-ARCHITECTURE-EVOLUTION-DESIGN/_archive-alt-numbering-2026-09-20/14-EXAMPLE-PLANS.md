# 14 — EXAMPLE PLANS · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:30:00+03:00 IDT (Asia/Jerusalem, UTC+3)  
**Mode:** DESIGN ONLY · conceptual QueryPlans · **identity-safe** · NOT executed

> These examples illustrate planner outputs. They do not call providers, do not deploy, and do not assert entity truth.

---

## Shared plan skeleton

```text
planId, seedClass, orderedIntents[], families[], budgets, stopConditions, reasons[]
relationshipSemantics: inherit A2/C1 vocab · SAME-ENTITY forbidden · URL-alone UNKNOWN
```

Default stop: budget exhausted OR all intents attempted OR wall clock hit.  
Empty/UNKNOWN results are valid.

---

## 1) Person seed

| Field | Example |
|-------|---------|
| **Input** | `"Ada Lovelace"` |
| **Detected seed class** | `person` |
| **Discovery intents** | 1 DISCOVER_IDENTITY_REFERENCES · 2 DISCOVER_PUBLICATIONS · 3 DISCOVER_DOCUMENTS · 4 DISCOVER_ALIASES (tight) |
| **Source families** | knowledge_graph, authority, bibliographic, (scholarly if Preview) |
| **Ordering** | KG/authority first → bibliographic → optional scholarly |
| **Budget** | maxFamilyCalls=4; maxRequests=8; maxUrls=0 unless URL found later |
| **Expected outputs** | Findings with provenance; possible typed soft-refs qid/viaf/ol; coalesce SAME-REFERENCE only if typed intersection across hostFamilies |
| **Relationship semantics** | Homonyms stay separate Findings; no title-bridge |
| **Stop** | Caps hit or families exhausted; UNKNOWN OK for weak hits |

---

## 2) Company seed

| Field | Example |
|-------|---------|
| **Input** | `"Stripe, Inc."` |
| **Detected seed class** | `company` |
| **Discovery intents** | 1 DISCOVER_ORGANIZATION_PRESENCE · 2 DISCOVER_FILINGS · 3 DISCOVER_REGISTRIES · 4 DISCOVER_NEWS · 5 DISCOVER_OFFICIAL_WEB_ORIGIN (if domain discovered) |
| **Source families** | knowledge_graph, encyclopedia, filings*, registries*, news*, web_origin* (*Preview/candidate — not wired in this pack) |
| **Ordering** | Presence (B0 families) → filings/registries when flagged → news last |
| **Budget** | Reserve slice for filings; prevent news vanity flood (maxFindings tight) |
| **Expected outputs** | Name-string registry hits; **no** fake legal identity; S04 authority gap remains until filings family exists |
| **Relationship semantics** | Brand ≠ legal entity; granularity preserved (cf. S05 lesson for orgs) |
| **Stop** | Do not title-bridge to inflate MULTI |

---

## 3) Organization seed

| Field | Example |
|-------|---------|
| **Input** | `"International Committee of the Red Cross"` |
| **Detected seed class** | `organization` |
| **Discovery intents** | ORGANIZATION_PRESENCE · IDENTITY_REFERENCES · REGISTRIES · NEWS |
| **Source families** | knowledge_graph, encyclopedia, authority, registries*, government* |
| **Ordering** | KG/encyclopedia → authority → registries |
| **Budget** | Medium; avoid merging distinct national societies by title |
| **Expected outputs** | Multiple related org Findings possible; RELATED-ENTITY only with provenance |
| **Relationship semantics** | S05-style granularity: do not coalesce distinct authority keys |
| **Stop** | Contradiction → contradicts edge, no attach |

---

## 4) Domain seed

| Field | Example |
|-------|---------|
| **Input** | `example.com` |
| **Detected seed class** | `domain` |
| **Discovery intents** | 1 DISCOVER_OFFICIAL_WEB_ORIGIN (early) · optional ORGANIZATION_PRESENCE if page meta suggests org **as search only** |
| **Source families** | web_origin primary; KG only if budget + explicit plan reason |
| **Ordering** | UrlOriginStage first |
| **Budget** | maxUrls=1–3; maxRedirects=3; no crawl |
| **Expected outputs** | Origin metadata Evidence; domain/url nodes |
| **Relationship semantics** | **URL/domain alone → UNKNOWN**; never SAME-*; never ownership inference |
| **Stop** | After origin attempt + optional tiny secondary; empty valid |

---

## 5) URL seed

| Field | Example |
|-------|---------|
| **Input** | `https://www.example.com/about` |
| **Detected seed class** | `url` |
| **Discovery intents** | DISCOVER_OFFICIAL_WEB_ORIGIN |
| **Source families** | web_origin |
| **Ordering** | Single-stage early |
| **Budget** | maxUrls=1; one-hop=0 unless plan revision |
| **Expected outputs** | Page/domain metadata; finding may be useful while label UNKNOWN |
| **Relationship semantics** | Seed-is-URL self-cite → UNKNOWN provenance (C1-PATCHED); BAD_URL_ALONE_SAME=0 |
| **Stop** | Soft-fail/blocked/empty → FINALIZE partial |

---

## 6) Document seed

| Field | Example |
|-------|---------|
| **Input** | `"ISBN 978-0-262-03384-8"` or work title |
| **Detected seed class** | `document` |
| **Discovery intents** | DISCOVER_DOCUMENTS · DISCOVER_PUBLICATIONS · DISCOVER_IDENTITY_REFERENCES (authors as refs) |
| **Source families** | bibliographic, scholarly*, knowledge_graph |
| **Ordering** | bibliographic first |
| **Budget** | Moderate; scholarly Preview optional |
| **Expected outputs** | Work metadata; author soft-refs if present — authors are RELATED/POSSIBLE paths, not auto SAME-ENTITY |
| **Stop** | No DOI family → UNKNOWN coverage honest |

---

## 7) Ambiguous / compound / role seed

| Field | Example |
|-------|---------|
| **Input** | `"CEO of Stripe"` or `"Python creator"` |
| **Detected seed class** | `ambiguous` |
| **Discovery intents** | DISCOVER_ALIASES (extract search hints) · DISCOVER_IDENTITY_REFERENCES · DISCOVER_ORGANIZATION_PRESENCE — **tight budgets** |
| **Source families** | knowledge_graph, encyclopedia; avoid speculative filings |
| **Ordering** | Conservative exploratory |
| **Budget** | maxFamilyCalls low; maxPlanRevisions=1 |
| **Expected outputs** | May be empty (S13–S15 class); partial role/org mentions without identity commit |
| **Relationship semantics** | Role ≠ identity; no inventing person-org SAME-* |
| **Stop** | Prefer UNKNOWN/empty over alias blast |

---

## 8) No-match seed

| Field | Example |
|-------|---------|
| **Input** | Rare string with no public footprint `"Xzqwl-9f3-nonexistent"` |
| **Detected seed class** | `unknown` or `ambiguous` |
| **Discovery intents** | Minimal DISCOVER_IDENTITY_REFERENCES against B0 families only |
| **Source families** | knowledge_graph, bibliographic, encyclopedia |
| **Ordering** | B0 verbatim-compatible queries |
| **Budget** | Minimal |
| **Expected outputs** | Empty findings; providers `empty`; status partial/complete with honesty |
| **Relationship semantics** | No graph edges invented |
| **Stop** | After B0 attempts; do not open crawl to “force a hit” |

---

## Cross-cutting identity-safety checklist for all examples

- [ ] No SAME-ENTITY  
- [ ] No URL-alone SAME-REFERENCE  
- [ ] No title-bridge coalesce  
- [ ] No domain ownership claim  
- [ ] UNKNOWN allowed  
- [ ] Budgets explicit  
- [ ] Reasons non-empty  
