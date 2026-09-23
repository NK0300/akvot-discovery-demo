# 00 — FREEZE + FORENSICS · Arch slice · ארכיטקט · 2026-09-20

**Stamp:** 2026-09-20T08:47:20+03:00 IDT (Asia/Jerusalem)  
**Wave:** PR-CLOSEOUT · **DOCS ONLY** first wave  
**Policy:** NO promote · NO Core rewrite · Core alias `dpl_8ag…` **LOCKED**  
**Scope:** Architecture freeze of Freeze+Forensics **BEFORE** Server B17/B18 code changes  
**Companion Chief freeze:** `PR-CLOSEOUT/00-FREEZE-FORENSICS.md` · `00-FREEZE-FORENSICS.json` · `00-FREEZE-SNAPSHOT.txt` · `00-CHIEF-MANDATE.md`

---

## 1. Commit / baseline refs (from existing MEGA Evidence — do not invent)

| Ref | Value | Evidence path |
|-----|-------|---------------|
| Git commit / branch | **n/a** (no `.git` in tree) | `PR-CLOSEOUT/00-FREEZE-FORENSICS.md` §1 · `00-FREEZE-SNAPSHOT.txt` |
| Vercel project | `prj_Xm61SjyuvgYXDf7Vs0IxBXbDI5V5` · `akvot-simple-demo` · scope `k-akvot` | same |
| **Canonical Preview** | `dpl_9PkJ5WJFEEYMjpSr5W8mf1GDv6A2` | `MEGA-KV-PREVIEW-ARCH-GLANCE-ארכיטקט-2026-09-20.md` · `QR-RELEASE-BATTERY-9PkJ-בודק-2026-09-20.md` · `MEGA-ACC-SMOKE-9PkJ-דיוק-2026-09-20.md` · `MEGA-M-CANONICAL-9PkJ-VERIFY-ממשק-2026-09-20.md` |
| Canonical URL | `https://akvot-simple-demo-2v59j4kvl-k-akvot.vercel.app` | same |
| Prior Preview (historical scrub wave) | `dpl_CAVh2rDSNDFfjrGzw8EJWJNmPN4e` | `MEGA-B23-SCRUB-GLANCE-ארכיטקט-2026-09-20.md` · `MEGA-ACC-DISC-B23-דיוק-2026-09-20.md` · `MEGA-C-KV-REST-REFRESH-שרת-2026-09-20.md` |
| **Core Prod alias (LOCKED)** | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` · `https://akvot-simple-demo.vercel.app` | `QR-CORE-ALIAS-SMOKE-בודק-2026-09-20.md` · `MEGA-ACC-SMOKE-9PkJ-CORE-דיוק-2026-09-20.md` · `MEGA-ACC-CORE-P0-B23-GATE-דיוק-2026-09-20.md` |
| KV SoT claim | Upstash `akvot-discovery` · `UPSTASH_REDIS_REST_*` (names only) | `KV-PREVIEW-FIX-CHIEF-2026-09-20.md` · freeze §3–4 |
| Acc SoT version | `forbiddenIdentitiesVersion=2026-09-19.1` | `MEGA-ACC-SMOKE-9PkJ-דיוק-2026-09-20.md` |
| Arch forensics pack | B11–B30 DONE | `MEGA-B-FORENSICS-11-30-ארכיטקט-2026-09-20.md` · `MEGA-B-ARCHITECTURE-MAP-ארכיטקט-2026-09-20.md` |
| P1 roll-up | B22/B23 CLOSED · B17/B18 OPEN | `MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md` |
| Control board | Promote **HOLD / NO** | `00-CONTROL-BOARD.md` |

**9PkJ live health (freeze probe, cited):**  
`storeBackend=upstash` · `durable=true` · `fallback=false` · `promoteEligible=true` · `kvCredsPresent=true` · discovery WRUD ok · `mode=kv-shared`  
→ `PR-CLOSEOUT/00-FREEZE-FORENSICS.md` §2 · `MEGA/raw/release-9pkj/api-health.json` · `discovery-health.json`

---

## 2. Architecture lifecycle map — Seed → Discovery → emit / SSE / narrow / HIT → Acc scrub

```
SEED (entity-agnostic: name | org | domain | soft HE/EN)
  → POST /api/discovery/sessions          CREATE + pipeline
  → providers (wikidata, openlibrary, wikipedia) · soft errors
  → normalize / evidence / ER soft / facets / contradictions
  → emitSnapshot (sanitizeDiscoveryPayload → forbiddenIdentities SoT)
  → WRITE durable session (Upstash disc:sess:* | else fs-regen)
  → SSE GET …/events                      progressive frames (scrub per chunk)
  → NARROW POST …/narrow                  facet filter → UPDATE → scrub response
  → HIT GET …/{id}                        Acc-scrubbed snapshot (always re-scrub)
  → RELOAD (cold GET; memory miss → KV GET)
  → RECOVER (fs-regen only: maybeRegenerate seed-decode → durable=false)
  → Acc scrub surfaces (matrix)           findings/evidence/facets/contradictions/…
  → EXPIRE TTL 1h
```

**Source maps (cite, do not duplicate invent):**  
- `MEGA-B-ARCHITECTURE-MAP-ארכיטקט-2026-09-20.md` §§1–5  
- `PR-CLOSEOUT/00-FREEZE-FORENSICS.md` §§5–8  
- `MEGA-B-LAYER-BOUNDS-D-K-ארכיטקט-2026-09-20.md` (layer bounds)

**Core parallel (LOCKED — Discovery never calls):**  
`lookup.js` → orchestrator `mayCommitDossier` / `sanitizeCandidatesPayload` — untouched this wave.

---

## 3. Acc surfaces matrix pointer

**Pointer:** `MEGA-SCRUB-SURFACE-MATRIX-ארכיטקט-2026-09-20.md`  
**Supersession for B22/B23 rows:** `MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md` (2026-09-20T07:47:43+03:00) · `MEGA-B23-SCRUB-GLANCE-ארכיטקט-2026-09-20.md`

| Surface / gap | Status at Freeze | Evidence |
|---------------|------------------|----------|
| **B23** `contradictions[].findingIds` | **CLOSED / PASS** | Scrub glance + Acc smoke 9PkJ · leak Q1701775=0 POST+GET |
| **B22** `facetHints` | **CLOSED / PASS** | P1 closure · unit `B23 facetHints no forbidden` |
| **Candidates** `candidates[]` | **CLOSED** | emit delete after SoT · never Discovery output |
| findings / evidence / SSE / narrow / HIT (leak=0 on 9PkJ) | **PASS (observed)** | `MEGA-ACC-SMOKE-9PkJ-דיוק-2026-09-20.md` · `QR-RELEASE-BATTERY-9PkJ` RB-03/08/11 |
| Matrix historical rows still marking B22/B23 OPEN | **superseded** | Matrix header supersession note |

---

## 4. B17 / B18 — OPEN as P1 closeout targets (Server)

| ID | Title | Status | Owner |
|----|-------|--------|-------|
| **B17** | Hidden/soft fallback: `fs-regen` when KV env absent | **OPEN** | Server — telemetry must stay explicit: `durable=false`, `fallback/explicitFallback/fsRegenFallback=true`, `promoteEligible=false` |
| **B18** | Seed-decode regenerate on durable miss | **OPEN** | Server — `maybeRegenerate` → `_regenReason='fs-miss-seed-decode'`; forces durable=false / promoteEligible=false; Acc scrub via `emitSnapshot` after regen |

**Cite:** `MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md` · `MEGA-B-FORENSICS-11-30-ארכיטקט-2026-09-20.md` · freeze §7/§9 (`00-FREEZE-FORENSICS.md`)  
**Not claimed closed this Arch wave.** Canonical Preview currently on Upstash GREEN — that does **not** close B17/B18 fallback-path contracts.

---

## 5. Telemetry expectations map — health / promoteEligible / durable

| Channel | Expected fields (freeze baseline) | Evidence |
|---------|-----------------------------------|----------|
| `GET /api/health` → `discoveryStore` | `storeBackend`, `durable`, `fallback`, `explicitFallback`, `fsRegenFallback`, `promoteEligible`, `kvCredsPresent`, `crossInstance` | freeze §2 · `raw/release-9pkj/api-health.json` |
| `GET /api/discovery/health` | `ok`, `storeBackend`, `durable`, `promoteEligible`, WRUD `steps[]`, `mode`, `latencyMs` | freeze §2 · discovery-health |
| Session `publicStoreInfo` / `_storeInfo` | same flags + `regenerated?` / `regenReason?` | freeze §9 |
| `[discovery.store.telemetry]` `logStoreOp` | op, storeBackend, latencyMs, ok, correlationId, sessionIdPrefix, promoteEligible, explicitFallback | freeze §9 · `OBSERVABILITY.md` |
| `obs.js` | mintCorrelationId, incrMetric, recordLatency, recordSseLifecycle | `OBSERVABILITY.md` |

**Contract (Arch):**

| Backend | durable | promoteEligible | fallback* |
|---------|---------|-----------------|-----------|
| `upstash` / `vercel-kv` | `true` | `true` | `false` |
| `fs-regen` | `false` | `false` | `true` (+ explicitFallback + fsRegenFallback) |

**B17 gap (OPEN — Server):** formal `outcome` / `failureClass` / `retryCount` / `backendType` / `durabilityState` / scrubbed session-ref taxonomy — listed in freeze §9; **not** claimed done.

---

## 6. Preview ≠ Prod drift note (B21)

| | Discovery Preview (canonical) | Prod Core alias |
|--|-------------------------------|-----------------|
| Deploy | `dpl_9PkJ…` | `dpl_8ag…` **LOCKED** |
| Store | Upstash shared-kv (Preview) | Core path N/A for Discovery promote |
| Acc-DISC GREEN | Preview Evidence only | ≠ Prod readiness |
| Promote | **HOLD** | Core untouched |

**Rule:** Never treat Preview Discovery GREEN as Prod alias readiness. Separate Evidence packs.  
**Cite:** Architecture map §6 · P1 closure B21 **DOCUMENTED** · `MEGA-KV-PREVIEW-ARCH-GLANCE-ארכיטקט-2026-09-20.md`

---

## 7. Explicit STOP — no promote this wave

- **DO NOT** `vercel --prod` / retarget Core alias `dpl_8ag…`
- **DO NOT** change Acc P0 Core behavior / Expected rewrite
- **DO NOT** invent GREEN for B17/B18
- Arch this wave: Freeze docs + consistency checklist + STATUS only
- Next: await Server B17/B18 Evidence packs → Arch glance all packs → still **NO promote** until Chief GO

---

## 8. Real MEGA path index (cited this freeze)

```
test-results/discovery/MEGA/
  00-CONTROL-BOARD.md
  ARCHITECTURE-MAP.md · ARCHITECTURE-MAP.json
  MEGA-B-FORENSICS-11-30-ארכיטקט-2026-09-20.md
  MEGA-B-ARCHITECTURE-MAP-ארכיטקט-2026-09-20.md(.json)
  MEGA-B-P1-CLOSURE-STATUS-ארכיטקט-2026-09-20.md
  MEGA-B-P1-ACC-SCRUB-GAPS-BOUND-ארכיטקט-2026-09-20.md
  MEGA-SCRUB-SURFACE-MATRIX-ארכיטקט-2026-09-20.md
  MEGA-B23-SCRUB-GLANCE-ארכיטקט-2026-09-20.md
  MEGA-KV-PREVIEW-ARCH-GLANCE-ארכיטקט-2026-09-20.md
  MEGA-ACC-SMOKE-9PkJ-דיוק-2026-09-20.md(.json)
  MEGA-ACC-SMOKE-9PkJ-CORE-דיוק-2026-09-20.md(.json)
  QR-RELEASE-BATTERY-9PkJ-בודק-2026-09-20.md(.json)
  KV-PREVIEW-FIX-CHIEF-2026-09-20.md(.json)
  MEGA-C-KV-REST-REFRESH-שרת-2026-09-20.md(.json)
  OBSERVABILITY.md · SECURITY-AUDIT.md
  raw/release-9pkj/
  PR-CLOSEOUT/00-FREEZE-FORENSICS.md(.json) · 00-CHIEF-MANDATE.md
```
