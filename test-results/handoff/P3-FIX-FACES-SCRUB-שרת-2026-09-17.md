# P3 FIX · faces/photoUrl scrub on demote · שרת · 2026-09-17

**STATUS:** LOCAL FIX DONE · units **111/111** · **NO dpl**

**WHAT:** Acc finding — after `revalidateDomainSafePayload` demote, `faces:true` + `photoUrl` leaked. Scrub class-level on demote + attach soft paths.

**EVIDENCE:** this file · `api/lib/orchestrator.js` · units 111/111 · Acc note `P3-ACC-X3-LOCAL-SMITH-WARM-PW-דיוק-2026-09-17.md`

**MEASURED:** units · poison demote → `faces` falsy · `!photoUrl`

**NOT:** dpl · alias still `dpl_Crsqe…`

**NEXT:** @ארכיטקט micro-glance · then Preview → Acc HTTP×3 / re-harness
