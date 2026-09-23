# 03 — COVERAGE GAPS · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · corpus notes: @בודק · Acc: @דיוק  
**Mode:** Gap Analysis · DOCS ONLY · NO EXP-B · NO promote  
**Product objective:** MAXIMUM PUBLIC-WEB DISCOVERY without inventing relationships. MULTI = metric only.

---

## Coverage map (seed intents × live surface)

| Intent class | Example seeds | B0 coverage | A2-safe Preview | Gap type |
|--------------|---------------|-------------|-----------------|----------|
| Canonical person | S01 (rich authority IDs) | High volume, multi=0 | Mean multi↑ (~0.21 lane); S01 often benefits | Independence was the gap; **partially addressed experimentally** — frozen, not promoted |
| Homonym / celebrity | S02-class | Registry flood + near-dups (QD-02) | Typed attach helps only when IDs align | Noise / near-dup quality |
| Corp / brand | S04 Stripe | Registry/person noise; thin legal authority | multi=0 **correct** under typed ceiling | **AUTHORITY/SOURCE COVERAGE** (limitation, not bug) |
| Movement / federation | S05 Red Cross | Multiple real entities | Barely multi; granularity islands | **CROSS-ENTITY / AUTHORITY-GRANULARITY** |
| HE person | S07 | EN wiki + WD; findings μ≈2; no he.wikipedia on measured B0 | Same unless locale=he | **Locale / language fidelity** |
| URL / domain | S06 / S16 | Often empty/thin | No URL resolver | **Adapter absence** |
| Role / compound / alias | S12–S15 | Often 0 findings despite providers ok | No query expansion | **Search-strategy absence** (PHASE5) |
| Org legal identity (non-US wiki-famous) | — | Weak | Weak | Registry monoculture |
| Gov / .gov.il official | — | DOMAIN_AUTHORITY orphan | No emitter | **Emitter absence** |
| Fresh events / news | — | None | None | **Family absence** |

---

## Structural causes (not run noise)

1. **Tiny public trio** on B0 → domain universe ≤3 hosts.  
2. **No query expansion** → opaque seed bags fail role/URL/compound.  
3. **Locale default `en`** → HE host path unused.  
4. **Authority IDs uneven** → A2-safe gains concentrate on rich cross-family ID entities (seed-specific).  
5. **Prestige without emitters** → gov/edu weights unused.

---

## Explicit non-goals for “fixing” coverage

- Do **not** manufacture S04/S05 recovery to inflate multi.  
- Do **not** use title/sim/threshold to invent relationships.  
- Do **not** treat empty OpenSearch as strong coverage.  
- Do **not** optimize A2 further for multi as product objective.

---

## Gap priority (Arch lens — discovery surface, not multi)

| Priority | Gap | Lever class |
|----------|-----|-------------|
| P1 | HE locale surface unused | Partially wired — low blast radius |
| P1 | URL/domain / compound intents empty | New resolver / planner (candidates only) |
| P2 | Corp legal authority thin | New filings/registry family (not S04 hack) |
| P2 | Gov/official orphan | Allowlisted gov emitter |
| P3 | News freshness | New news family |
| — | S04/S05 multi | **Accept as limitations** under typed ceiling |

---

## OWNER

| Who | Fill |
|-----|------|
| **@בודק** | Per-seed coverage table from golden corpus |
| **@דיוק** | Which empties are Acc-correct vs coverage holes |
| **@שרת** | Provider error vs true empty distinction |
