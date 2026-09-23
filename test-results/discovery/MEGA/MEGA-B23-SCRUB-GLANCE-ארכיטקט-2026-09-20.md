# MEGA-B23 · Scrub Glance · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T07:47:43+03:00 Asia/Jerusalem (IDT)  
**Mode:** DOCS + code glance · **HOLD promote** · **NO Core rewrite** · Core Acc P0 **LOCKED**  
**Target Preview:** `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e`  
**URL:** `https://akvot-simple-demo-p68nhr48g-k-akvot.vercel.app`

---

## Verdict

| Gate | Result |
|------|--------|
| **B23 `contradictions[].findingIds` scrub** | **PASS / CLOSED** |
| Code wired (`scrubContradiction`) | **YES** |
| Live leak `Q1701775` on this Preview | **0** |
| Acc formal multi-seed battery (≥3 seeds) | Still pending (promote gate only) |
| Promote | **HOLD** |
| Core alias | **LOCKED** (`dpl_8ag…` untouched) |

**PASS** — code + server evidence + arch recheck show scrub wired and `leak_Q1701775=0` on Smith+ctx POST for this dpl. Not PARTIAL: live contradiction surface is clean. Not NO-GO: leak does not remain.

---

## Code glance — `api/lib/discovery/emit.js`

| Piece | Evidence | Status |
|-------|----------|--------|
| `scrubContradiction(c, survivingFindingIds, strippedIds)` | Filters forbidden QID tokens in `findingIds` + scalars (`title/note/type/kind/reason/summary`); filters `domains`; intersects IDs with `survivingFindingIds`; drops contradiction when intersection empty | **WIRED** |
| Call site in `sanitizeDiscoveryPayload` | After `finalFindings` → `survivingFindingIds = Set(finalFindings.map(f => f.id))` → `contradictionsIn.map(scrubContradiction).filter(Boolean)` | **WIRED** |
| Deep sweep | `deepStripForbidden` final nested pass | **WIRED** |
| B22 `facetHints` (also patched in same wave) | `scrubFinding` filters `facetHints` via SoT predicate | **WIRED** (see P1) |
| Graph edges | Keep only edges whose endpoints survive node scrub | **WIRED** |
| SoT | `forbiddenIdentities.js` only — no Smith special-case / no Discovery denylist | **OK** |

Bound match: `MEGA-B-P1-ACC-SCRUB-GAPS-BOUND-…` §4 and `MEGA-SCRUB-SURFACE-MATRIX-…` B23 fix bound.

---

## Server evidence fold — `MEGA-C-KV-REST-REFRESH-שרת-2026-09-20`

| Item | Value |
|------|-------|
| dpl | `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e` |
| Checked (שרת) | 2026-09-20T07:45:30+03:00 IDT |
| Units | adversarial.acc **46/0** (+10 B23); orchestrator **113/0** (+3 B23) |
| Live Smith+ctx | POST 201 / GET 200 · `leak_Q1701775=false` · `contradictionsFindingIdsClean=true` · `forbiddenStripped=1` · fiv=`2026-09-19.1` |
| Storage | health WRUD GREEN · upstash · durable=true · promoteEligible=true (Preview only) |

Acc/QA handoff in MEGA-C still asks for formal ≥3-seed re-verify before **promote** discussion — that does **not** reopen B23 scrub once code+live Smith show leak=0.

---

## Arch recheck (this glance) — same Preview

### Health (`vercel curl`)

- `GET /api/discovery/health` → ok · storeBackend=`upstash` · durable=true · promoteEligible=true · fsRegenFallback=false · WRUD all ok · latencyMs≈122  
- `GET /api/health` → `build=dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e` · discoveryStore upstash / shared-kv

### Smith+ctx POST

- Body: `{ seed: "John Smith", hints: { org: "IBM", city: "New York", country: "US" } }`
- HTTP **201** · sessionId `kv1.04e8035c835fea842eba28f04e168c1d` · store=upstash · findings=21 · contradictions=1
- `contradictions[0].findingIds` — **no** `wd-Q1701775` (survivors only, e.g. `wd-Q3182477`, `ol-…`, `wp-en-John_Smith`)
- Full JSON: `leak_Q1701775_anywhere=false` · `fid_leaks=[]`
- `forbiddenStripped=1` · `forbiddenIdentitiesVersion=2026-09-19.1` · dossier/faces=null

### Units (local re-run)

`node --test api/lib/discovery/adversarial.acc.test.mjs` → **passed=46 failed=0** including:
- B23 contradictions findingIds no forbidden
- B23 contradictions keep safe ids
- B23 all-poison contradiction dropped
- B23 facetHints no forbidden
- B23 full JSON leakage=0

---

## Acc evidence for this dpl

| Source | Present? | Note |
|--------|----------|------|
| `MEGA-C-KV-REST-REFRESH-שרת-2026-09-20.{md,json}` | **YES** | Server live Smith leak=0 on `dpl_CAVh…` |
| Formal Acc-DISC battery on `dpl_CAVh…` | **NO** (prior Acc NO-GO was `dpl_BAke…`) | Pending Acc/QA ≥3 seeds before promote |
| This arch Smith POST | **YES** | Confirms findingIds scrub on target URL/build |

Stale docs still saying B23 OPEN/NO-GO (`MEGA-SCRUB-SURFACE-MATRIX`, older emit glance) describe pre-`dpl_CAVh` / pre-`scrubContradiction` state — superseded by this glance + MEGA-C.

---

## P1 closure update

| ID | Prior | Now |
|----|-------|-----|
| **B23** | OPEN / NO-GO | **CLOSED / PASS** on Preview `dpl_CAVh…` |
| **B22** | OPEN | **CLOSED** in code (`facetHints` filter + unit) — same emit wave |
| B17 / B18 | OPEN (Server telemetry) | unchanged |
| B21 | DOCUMENTED drift | unchanged |
| Candidates scrub | CLOSED | unchanged |
| Promote | HOLD | **HOLD** |
| Core | LOCKED | **LOCKED** |

Open actionable P1 after this glance: **B17 · B18** (B21 documented drift only).

---

## Decision

**B23 CLOSED · PASS · HOLD promote · Core locked.**  
No promote. No Core rewrite. Acc/QA may still run the formal ≥3-seed battery on this Preview as the promote-gate pack; scrub surface itself is closed.
