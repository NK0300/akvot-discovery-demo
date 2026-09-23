# 06 — OPEN RISKS AND NON-GOALS · ארכיטקט

**Stamp:** 2026-09-20 12:22 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט · Integration Review  
**Decision locked:** **NO C2–C6** · **NO crawl** · **NO QueryPlan** without Chief GO

---

## Explicitly OUT (this Integration Review window)

| Item | Status | Why |
|------|--------|-----|
| **C2** (Gap slate historically “URL origin”; post-C1 numbering = next candidates) | **NO** | No GO · C1 already closed web_origin experimental lane |
| **C3** SEC EDGAR / filings | **NO** | No GO · risk of misread as S04 recovery |
| **C4** National / company registry | **NO** | No GO · brand≠legal risk |
| **C5** Query expansion lite | **NO** | No GO · wrong-hit / relationship-adjacent risk |
| **C6** WP sitelink → QID typed emit | **NO** | No GO · must not become title-bridge |
| **C7–C10** (news / ORCID / promote-measure / web_public crawl) | **NO** | Deferred · crawl especially Security-gated |
| **Open crawl / web_public unrestricted** | **NO** | Interface-only until Chief+Security |
| **QueryPlan** | **NO** | Not authorized · strategy docs ≠ GO |
| **Promote A2 or C1** | **NO** | APPROVED EXPERIMENTAL ≠ production |
| **Alias retarget B0 / Core change** | **NO** | Locks intact |
| **S04/S05 recovery experiments** | **NO** | Product limitations |
| **A2-bound title-bridge revival** | **NO** | REJECTED |
| **A2 coalesce tuning for multi** | **NO** | MULTI ≠ product objective |
| **Mutate historical pack metrics** | **NO** | Freeze rule |

Sources: Gap `08-CANDIDATE-NEXT-EXPERIMENTS-ארכיטקט.md` · C1 STATUS · A2 Baseline · Chief locks in this task

---

## Open risks (acknowledged, not solved)

| Risk | Note |
|------|------|
| Identity collapse regressions | Any future provider that upgrades URL/title → SAME-* reopens Acc FAIL class (see C1-PREPATCH) |
| SSRF / redirect tricks | urlSafety hop re-check must remain; expansion of fetch scope raises blast radius |
| Seed-specific A2 gains over-generalized | S01-like typed triangles ≠ Stripe/Red Cross |
| Gap candidate naming drift | Historical “C1=HE-Locale” vs executed “C1=WEB-ORIGIN” — use pack paths + dpls, not bare “C1” alone in speech |
| Parallel doc lanes in this folder | Non-Arch notes may coexist; Arch Integration Review files (`*-ארכיטקט.md`) are Chief SoT for this deliverable |

---

## Non-goals restated

- Not closing product vision gaps in this pack  
- Not lobbying for HE-Locale or any candidate  
- Not authorizing Server/Acc/QA implementation work  
- Not rewriting A2 or C1 evidence  

---

## STOP

**HOLD all impl.** Next motion requires **explicit Chief GO** naming the lane.
