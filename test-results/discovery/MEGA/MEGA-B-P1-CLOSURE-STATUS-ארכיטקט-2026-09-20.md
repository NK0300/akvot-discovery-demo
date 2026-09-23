# MEGA-B · P1 Closure Status · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T07:47:43+03:00 IDT (Asia/Jerusalem)  
**Fold-into:** MEGA map / forensics B11–B30 P1 subset  
**Policy:** HOLD promote · Core Acc P0 LOCKED · NO Core rewrite  
**Method:** code re-inspect `emit.js` + MEGA-C server pack + arch Smith POST on `dpl_CAVh…`  
**Supersedes:** earlier ~07:24 IDT roll-up that still listed B22/B23 OPEN

---

## P1 roll-up

| ID | Title | Status | Owner / next |
|----|-------|--------|--------------|
| **B17** | Hidden/soft fallback: `fs-regen` when KV env absent | **OPEN — Server in progress** | Telemetry explicit: `durable=false`, `fallback/explicitFallback/fsRegenFallback=true`, `promoteEligible=false`. Creds BLOCKED on paths without KV. |
| **B18** | Seed-decode regenerate on durable miss | **OPEN — Server in progress** | `maybeRegenerate` → `_regenReason='fs-miss-seed-decode'`; forces durable=false / promoteEligible=false. Acc scrub via `emitSnapshot` after regen. KV SoT required before promote. |
| **B21** | Preview ≠ Prod drift (Discovery Preview vs alias Core) | **DOCUMENTED** (open as drift; not a code bug) | Never treat Preview Discovery GREEN as Prod alias readiness. Separate Evidence packs. |
| **B22** | Acc scrub gap: `facetHints` | **CLOSED** | `scrubFinding` filters `facetHints` via SoT; unit `B23 facetHints no forbidden` PASS. Same emit wave as B23 on `dpl_CAVh…`. |
| **B23** | Acc scrub gap: `contradictions[].findingIds` | **CLOSED / PASS** | `scrubContradiction` + survivingFindingIds intersection; MEGA-C + arch Smith POST `leak_Q1701775=0` on `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e`. |
| **Candidates Acc scrub** | Core `candidates[]` passthrough on Discovery emit | **CLOSED** | Acc note + `delete out.candidates`. |

**Open P1 list (actionable):** B17 · B18  
**Documented drift (non-fix):** B21  
**Closed this Acc/scrub wave:** Candidates · **B22** · **B23**

P0 count remains **0** (forensics). Promote remains **HOLD**.

---

## Evidence notes (accurate from code + live)

### Candidates CLOSED
`sanitizeDiscoveryPayload`: projects findings → SoT `sanitizeCandidatesPayload`; if `out.candidates` present → scrub + **delete**. Never emits dossier/faces/photoUrl.

### B22 CLOSED
`scrubFinding` filters `facetHints` with `valueHasForbidden` / `isForbiddenQid` and records strips. Unit coverage in `adversarial.acc.test.mjs`.

### B23 CLOSED
`scrubContradiction` after `finalFindings`:
1. Drop contradiction if forbidden token in scalar fields.
2. Filter `domains`.
3. Drop forbidden / non-surviving `findingIds`.
4. Drop contradiction if no IDs remain.
Live Preview Smith+ctx: findingIds clean; full JSON no `Q1701775`.  
Glance: `MEGA-B23-SCRUB-GLANCE-ארכיטקט-2026-09-20.md`.

### B17 / B18 — Server in progress
Preview `dpl_CAVh…` health shows durable KV path GREEN; fallbacks remain promote-blocking when KV absent. Core Prod env **not** rotated.

### B21 — documented drift
Preview Discovery ≠ Prod Core alias. Explicit in architecture map §6.

---

## Acc/QA checkpoint (fold)

| Item | Status |
|------|--------|
| Local adversarial Acc | **46 PASS / 0 FAIL** (incl. B23) |
| Server MEGA-C Smith live on `dpl_CAVh…` | leak=0 · findingIds clean |
| Arch recheck Smith POST on same URL/build | leak=0 · HTTP 201 · fiv=`2026-09-19.1` |
| Formal Acc ≥3-seed battery on `dpl_CAVh…` | **Pending** (promote gate; not B23 reopen) |
| Prior Acc NO-GO | Was `dpl_BAke…` (pre-scrub deploy) — superseded |

---

## MEGA map fold pointers

| Artifact | Role |
|----------|------|
| `MEGA-B23-SCRUB-GLANCE-ארכיטקט-2026-09-20.md` | **This wave** — B23 PASS / CLOSED |
| `MEGA-C-KV-REST-REFRESH-שרת-2026-09-20.md` / `.json` | Server KV refresh + B23 live Smith |
| `MEGA-SCRUB-SURFACE-MATRIX-ארכיטקט-2026-09-20.md` | Pre-fix matrix (B23 was NO-GO) — superseded for B22/B23 rows |
| `MEGA-B-P1-ACC-SCRUB-GAPS-BOUND-ארכיטקט-2026-09-20.md` | Design bound (implemented for B22/B23) |
| **This file** | P1 closure status fold |

---

## Decision

| Gate | Status |
|------|--------|
| Candidates Acc scrub | **CLOSED / PASS** |
| B22 facetHints | **CLOSED / PASS** |
| B23 contradictions findingIds | **CLOSED / PASS** (`dpl_CAVh…`) |
| B17 / B18 store fallbacks | **OPEN** (Server in progress; telemetry honest) |
| B21 Preview≠Prod | **DOCUMENTED** |
| Promote | **HOLD / NO** |
| Core | **LOCKED** |
