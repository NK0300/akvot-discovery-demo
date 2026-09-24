# 03 · Architecture Delta · ארכיטקט · 2026-09-24

**Status:** DESIGNED  
**Owner:** ארכיטקט  
**Locks:** NO PROMOTE · Core protected · C1 UNKNOWN hard · no new adapters as *next* step

---

## Key test
> If tomorrow we add **20 families**, must **Core** change?

| Today (gap) | Target |
|-------------|--------|
| `PROVIDER_TO_FAMILY` / `FAMILY_TO_PROVIDER` / `B0_FAMILIES` live in `queryPlan.js` | **Family Registry** is sole SoT; QueryPlan never hardcodes provider ids |
| Night hops (`general_web`, `ddg_instant`) bypass registry | Register as families (capability rows) · orchestrator launches by familyId |
| Adding a family touches plan maps + orch + sometimes Core emit | Add = registry descriptor + provider module + flag · **Core/session/SSE unchanged** |

**Answer after this pack:** Core must **not** change for +20 families. If a proposed change requires Core edit → **reject** or mark EXPERIMENTAL track.

---

## Delta (what changes vs Checkpoint A/B)

| Area | Stay | Evolve |
|------|------|--------|
| Core lookup / session / SSRF / Acc scrub | frozen | — |
| C1 URL≠IDENTITY · cite-or-drop | frozen | — |
| QueryPlan | intents + seedClass | intent → **familyIds by capability** (not provider ids) |
| Family registry | B0 + viaf/web_origin + F11 candidates | single SoT; night GW/DDG as registry rows |
| Orchestrator | per-family launch + budget | family-agnostic runner; plugin resolve |
| Frontier | implicit in nightLoop/ledger | explicit queue model (§07) |
| Evidence graph | urlAloneCeiling · no SAME-ENTITY | unchanged ceiling; provenance mandatory |
| Night LOOP-SPINE | keep | becomes **one consumer** of orchestrator+frontier, not a parallel product |

---

## Non-goals (this pack)
- ❌ New HTTP adapters / hosts as the evolution “win”
- ❌ Weaken C1 / invent SAME-ENTITY
- ❌ Promote / TREATMENT touch
- ❌ Visual discovery as near-term build (§12 capability-only)

---

## Runtime boundary (Server coordinate next)
Arch owns contracts (§04–08). Server owns: flag wiring, launch loop, budget ledger binding, Preview `-e`.  
**No Core PR** for registry growth.

**Tag:** DESIGNED
