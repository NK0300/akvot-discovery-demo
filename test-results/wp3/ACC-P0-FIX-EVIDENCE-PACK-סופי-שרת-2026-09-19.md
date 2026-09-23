# Acc P0 FIX · Evidence Pack סופי · שרת · 2026-09-19/20

**STATUS:** READY for Chief REVIEW / Acc Gate formal  
**PROMOTE:** **HOLD** · alias `dpl_7vAA…` **FROZEN** · WP4 **NO-GO**

---

## 1. השינוי

| Item | Detail |
|------|--------|
| SoT | `api/lib/forbiddenIdentities.js` v**`2026-09-19.1`** · `{ Q1701775 }` |
| Emit scrub | `sanitizeCandidatesPayload` in `attachOrchestratorFields` + `revalidateDomainSafePayload` (incl. cache HIT) |
| Behavior | **Strip/drop** forbidden from `candidates[]` + identity `sources[]` + top `qid` · **not** score downgrade |
| Fail-safe | scrub throw → `candidates=[]` (no raw emit) |
| Out of scope | ranking / NY-boost / mayCommit / H1 / cache TTL / UX |

Units (local): orchestrator **128**/0 · forbiddenIdentities **39**/0 · contract-identity-p0 **5**/5

Docs: `F-L2-ACC-001-FIX-LOCAL-שרת-2026-09-19.md` · `F-L2-ACC-001-DENYLIST-SPEC-שרת-2026-09-19.md`  
Design: `handoff/P3-ACC-P0-FIX-DESIGN-BOUND-ארכיטקט-2026-09-19.md` · Arch GO: `handoff/P3-ACC-P0-FIX-ARCH-GO-ארכיטקט-2026-09-19.md`

---

## 2. למה מתקן את ה־RCA (F-L2-ACC-001)

| Before | After |
|--------|--------|
| SoT חסם dossier/faces בלבד (`qid=null` · faces=0) | + Acc NEVER-QID גם ב־**candidates/sources** |
| Stage-B WD + `match: New York` → `wd-Q1701775` #1 → Acc pw=1 | Domain scrub drops Q170 לפני emit |
| Intermittent quiet/load | Strip deterministic · versioned denylist |

RCA pack: `F-L2-ACC-001-RCA-שרת-2026-09-19.md` (+ Arch/דיוק/code-notes)

---

## 3. Before / After (minrepro)

| Phase | Result |
|-------|--------|
| **Before** (prod alias quiet Acc×3) | Smith r2: `candidates[0]=wd-Q1701775` · pw=1 · STOP |
| **Before** (minrepro quiet×4) | HIT @i=4 · same QID #1 · faces=0 |
| **After** Preview Smith×5 (שרת) | **leakage=0** · stripped×2 when WD returned ban · ui=candidates |
| **After** Acc FIX-3 (דיוק) | M1–M4 **PASS** · pw=0 · leakage=0 · Assaf dossier · כהן need_context |
| **After** FIX-4 (בודק) | L1→L3 **100/100** · err=0 · to=0 · pw=0 · leakage=0 · stripped under load |

---

## 4. Counts

| Metric | Value |
|--------|--------|
| **pw** | **0** (Acc FIX-3 + FIX-4) |
| **Q1701775 leakage** | **0** |
| FIX-4 requests | 100/100 completed |
| Denylist version observed | `2026-09-19.1` |
| forbiddenStripped | observed (Preview smoke + FIX-4 L2) |

---

## 5. Preview id (artifacts only)

| Field | Value |
|-------|--------|
| **dpl** | `dpl_5UFysCAY6zFeREfmHmUwYMqQidUQ` |
| URL | `https://akvot-simple-demo-4ij5qy655-k-akvot.vercel.app` |
| Alias | `dpl_7vAA…` **unchanged** · **no promote** |

---

## 6. Evidence index

| Role | Artifact |
|------|----------|
| שרת local | `F-L2-ACC-001-FIX-LOCAL-שרת-2026-09-19.md` |
| שרת Preview | `F-L2-ACC-001-PREVIEW-שרת-2026-09-19.md` + dir |
| דיוק FIX-3 | `ACC-P0-FIX-MINREPRO-דיוק-2026-09-19.md` |
| בודק FIX-4 | `FIX4-LOAD-REGRESSION-בודק-2026-09-19.md` |
| בודק pack | `ACC-P0-FIX-EVIDENCE-PACK-בודק-2026-09-19.md` |
| **This pack** | `ACC-P0-FIX-EVIDENCE-PACK-סופי-שרת-2026-09-19.md` |

---

## 7. Next (not executed)

1. @דיוק Acc Gate formal (if not already covered by FIX-3 GO)  
2. @ארכיטקט glance pack  
3. **Chief REVIEW** → promote **only** on explicit GO  
4. WP4 remains **NO-GO** until Acc Gate PASS on alias (post-promote)

**שרת:** stand by · no Core · no alias touch.
