# 16 — MIGRATION AND FLAGS · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT · DESIGN-ONLY · NO PROMOTE  
**Locks:** B0 LOCKED · Core LOCKED · A2 FROZEN · C1 FROZEN EXPERIMENTAL

---

## Migration principle

**Preview-flag path only.** Coexist with frozen A2/C1. Never flip B0 defaults without Chief GO. Design pack itself ships **zero** runtime flags.

---

## Flag map (current + future design)

| Flag | Today | Future (design) | B0? |
|------|-------|-----------------|-----|
| (none) | WD · OL · WP | unchanged | YES locked |
| `DISCOVERY_ENABLE_VIAF=1` | VIAF adapter | stays Preview; A2 coalesce behavior frozen experimental | NO |
| `DISCOVERY_ENABLE_WEB_ORIGIN=1` | web_origin + one-hop | may gate U0 stage refactor — same Bound | NO |
| `DISCOVERY_ENABLE_QUERYPLAN=1` (proposed name) | — | Gates QP0/QP1 + family orchestration behind Preview | NO until Chief |
| Family slot flags | — | One flag per future family if ever built | NO |

Naming of QueryPlan flag is **proposal only** — Server may choose final env name at impl GO.

---

## Coexistence rules

| Component | Coexistence |
|-----------|-------------|
| A2-safe coalesce | Unchanged algorithm/ceiling when VIAF path on; QueryPlan must not feed `title:` keys |
| C1 Bound | U0 stage MUST preserve UNKNOWN for URL-alone |
| B0 verbatim path | When QueryPlan flag off → **AS-IS pipeline** bit-compatible |
| Core | No migration steps touching Core |

---

## Phased rollout (design — not scheduled)

```text
Phase D0  DESIGN freeze (this pack) ← STOP for Chief
Phase P1  Preview: QueryPlan classify+log only (no query rewrite) — optional measure slice
Phase P2  Preview: QueryPlan rewrite + family budgets · WEB-ORIGIN early stage behind flags
Phase P3  Acc/QA/Server evidence pack · Chief decide HOLD vs iterate
Phase Px  Promote discussion ONLY with explicit Chief GO + gates (17) — not default
```

No EXP-B · no C2+ in this document’s charter.

---

## Rollback

Flag off → AS-IS. No data migration. Sessions without `queryPlan` remain valid.

---

## STOP

Migration design only. **Never B0 without Chief GO.**
