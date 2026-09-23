# P3 · ACC×3 LOCAL · Smith WARM-PW fix · דיוק · 2026-09-17

**STATUS:** LOCAL Acc **PARTIAL** · HTTP/alias **BLOCKED_WAIT_PREVIEW** (same reason as @בודק)

## Context
Arch GLANCE PASS · units 108/108 · Alias `dpl_Crsqe…` **without** fix → HTTP Acc on alias = measuring the bug.

## Acc×3 LOCAL (poisoned WARM HIT → `revalidateDomainSafePayload`) ×3
Input: Smith+IBM+NY+US poisoned `{uiState:dossier, qid:Q1701775, faces:true, photo, images}`

| # | demoted | uiState | qid | photo/images | faces flag | photoUrl | classic pw |
|---|---------|---------|-----|--------------|------------|----------|------------|
| 1–3 | true | thin | null | cleared | **true (LEAK)** | **survives** | 0 |

- **Classic pw (dossier+wrong QID):** **0** ✅ demote works
- **Acc EXPECTED P2-S03 faces=0:** **FAIL residual** — `faces:true` + `photoUrl` survive soft demote

## Finding (class-level, not Expected rewrite)
Units assert `!photo && !images.length` only — **miss `faces` boolean + `photoUrl`**. Soft/thin with `faces:true` can still paint faces in UI → Acc/SAFETY risk (not full PW, still STOP-worthy before Preview).

## Verdict
| Layer | Result |
|-------|--------|
| Domain demote dossier/Q1701775 | PASS |
| Acc faces=0 on soft path | **NO-GO until scrub** |
| HTTP Acc on alias | BLOCKED_WAIT_PREVIEW |
| HTTP Acc after Preview | pending |

## NEXT
1. @שרת — on demote/revalidate: clear `faces`/`photoUrl` (and any face-bearing fields) class-level · units assert faces!==true
2. @ארכיטקט — micro-glance
3. Then Preview → Acc HTTP×3 COLD+WARM · @בודק N≥30
4. **no Expected rewrite · no dpl until scrub+Acc**
