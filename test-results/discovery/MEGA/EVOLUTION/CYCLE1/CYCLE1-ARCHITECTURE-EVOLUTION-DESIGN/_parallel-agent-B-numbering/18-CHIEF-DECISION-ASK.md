# 18 — CHIEF DECISION ASK · CYCLE1 ARCHITECTURE EVOLUTION DESIGN

**Stamp:** 2026-09-20T12:31:00+03:00 IDT (Asia/Jerusalem)  
**Owner:** ארכיטקט (Arch) · **STOP · NO CODE · NO IMPL**

---

## Executive blurb · תקציר

**EN:** Cycle1 proved Acc-safe B0, A2-safe typed coalesce (frozen experimental), and C1 WEB-ORIGIN Bound UNKNOWN (frozen experimental). Provider-verbatim is **not** sufficient for vision-scale discovery. This pack designs the minimum evolution — QueryPlan + source-family orchestration + URL-origin as an early first-class stage — without code, promote, crawl, or identity-from-URL.

**HE:** Cycle1 הוכיח B0 בטוח, A2-safe קפוא, ו-C1 עם Bound של URL→UNKNOWN. ארכיטקטורת provider-verbatim **אינה מספיקה** לחזון. החבילה הזו מעצבת רק את האבולוציה המינימלית — QueryPlan + משפחות מקורות + URL-origin כשלב מתוכנן מוקדם — בלי קוד, בלי promote, בלי crawl, בלי זהות מ-URL.

---

## What is READY

Design pack `01–18` + FILE-INDEX + STATUS under:

`/workspace/akvot-quick-demo/test-results/discovery/MEGA/EVOLUTION/CYCLE1/CYCLE1-ARCHITECTURE-EVOLUTION-DESIGN/`

Status: **DESIGN READY · STOP for Chief · NO CODE**

---

## What Chief must decide next

### Ask (one sentence)

**Please (1) freeze this architecture design pack as the SoT for minimum evolution, and (2) choose whether the first future Preview slice — only after a separate explicit GO — should be QueryPlan classify+log, QueryPlan+URL-origin-early behind existing C1 flag, or HOLD all impl.**

### Options board

| Option | Meaning | Arch note |
|--------|---------|-----------|
| **D0 — Design freeze + HOLD impl** | Accept 01–18 as design SoT · no code | **Arch default** |
| **D1 — Later Preview: plan classify+log only** | Measure routing without rewrite | Lowest blast if Chief wants motion later |
| **D2 — Later Preview: QP + U0 early** | Reuse C1 flag/Bound · still Preview | Only after Gate 0–1 in 17 |
| **D3 — Reject / revise design** | Send Arch back with comments | Valid |
| **Promote A2/C1** | Out of this pack’s ask | **Not recommended now** |

---

## Explicitly NOT asked

- Implement QueryPlan now  
- Enable web_origin or VIAF on B0  
- EXP-B / C2+ / crawl / filings adapters  
- Invent live metrics  

---

## Review-note slots (optional before Chief freeze)

| Role | Optional |
|------|----------|
| **@שרת** | AS-IS map + flag coexistence glance |
| **@דיוק** | Invariants + UNKNOWN honesty glance |
| **@בודק** | Intent/taxonomy vs golden seeds glance |

---

## STOP

**אין קוד · אין deploy · אין promote · אין ספקים חדשים · אין EXP-B · אין C2+.**  
Design READY · waiting on Chief only.
