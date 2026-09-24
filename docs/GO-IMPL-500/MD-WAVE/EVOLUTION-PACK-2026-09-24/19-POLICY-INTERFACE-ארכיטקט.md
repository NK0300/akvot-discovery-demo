# 19 · Policy Interface · ארכיטקט · 2026-09-24

**Status:** DESIGNED (+ modular stub `api/lib/discovery/policy.js`)  
**Wave 1 order:** #1 with QueryPlan — **before** Frontier runtime · **before** Adapter theater  
**Owner runtime:** שרת (Select/Execute path) · Arch owns contract  
**Locks:** NO PROMOTE · Core/C1/Treatment untouched · flags default OFF · Registry declarative ≠ Policy

---

## 1. What Policy is
Policy is the **decision layer** of the Discovery Engine. It answers *what next* given seed + plan + registry + frontier + evidence — never *how to HTTP*.

```
Universal Seed → QueryPlan → Policy → Registry (lookup) → Orchestrator (execute)
                                    ↘ Frontier / Evidence Graph / Mission Memory
```

| Policy MAY | Policy MUST NOT |
|------------|-----------------|
| choose launches from plan+registry capability match | hardcode provider hosts / adapter internals |
| gate Expand / Next / Stop from frontier+budget | invent identity or SAME-ENTITY |
| attach `policyId` + reasons to journal | mutate Core / Treatment / prod defaults |
| be a named preset (B0 / Night / MW2 caps) | silently enable experimental families |

---

## 2. Closed decision vocab
```
SELECT → EXECUTE → EVALUATE → RECORD → EXPAND → NEXT | STOP
```

| Decision | Input (min) | Output |
|----------|-------------|--------|
| `select` | plan.launches, registry eligibility, budget | ordered `{ intentId, familyId, priority, reason }[]` |
| `evaluate` | family batch + cite-or-drop + C1 | `{ ok, dropReason?, frontierAdds[] }` |
| `record` | evaluate result | journal row shape (orch writes) |
| `expand` | frontier + wave caps | `{ expand: bool, items[], reason }` |
| `next` / `stop` | mission state | `{ action: 'next'\|'stop', reason }` |

**Stop reasons (closed):** `BUDGET` · `MAX_WAVES` · `NO_PROGRESS` · `ALL_HOPS_SETTLED` · `POLICY_HOLD` · `SAFETY` · `EMPTY_PLAN`

---

## 3. Interface (code contract)
Module: `api/lib/discovery/policy.js`

```js
/** @typedef {{ id: string, version: string }} PolicyMeta */
/** @typedef {{
 *   select(ctx): { launches: object[], skipped?: object[] },
 *   evaluate(ctx, batch): { ok: boolean, frontierAdds: object[], dropReason?: string },
 *   expand(ctx): { expand: boolean, items: object[], reason: string },
 *   nextOrStop(ctx): { action: 'next'|'stop', reason: string }
 * }} DiscoveryPolicy
 */
```

Builtin presets (stubs / pure):
| Preset id | Role |
|-----------|------|
| `policy.b0.default` | plan launches only · no frontier expand |
| `policy.night.caps` | wave≥2 from frontier · MW2-shaped caps · **wire later** (not auto nightLoop migrate) |
| `policy.hold` | always STOP `POLICY_HOLD` (tests / freeze) |

Key test: **+20 families ⇒ Policy unchanged** (only registry rows grow).

---

## 4. QueryPlan relationship
- QueryPlan = **search-intent schedule** (deterministic).
- Policy = **runtime scheduler** over that plan + live state.
- Policy must not rewrite `seedClass` into identity; Acc scrub stays on emit.

Gap today: capability-match select still DESIGNED vs hardcoded family maps in plan — Policy.select is the place to close it without Core `if (familyId)`.

---

## 5. Night / MW2
Unifying `nightLoop` into Policy preset = **separate Chief GO** (Track B Step1 FINAL still holds).  
Until then: Night remains parallel consumer; Policy stub must not be required on prod path (flag OFF).

---

## 6. Core boundary
Core may pass `{ plan, registryView, frontier, budget, wave }` into Policy.  
Core must **not** grow when a new preset is added — presets live in `policy.js` / registry of policies.

**Tag:** DESIGNED · stub LANDED · orch wire = Server Step 2  
**אין promote**
