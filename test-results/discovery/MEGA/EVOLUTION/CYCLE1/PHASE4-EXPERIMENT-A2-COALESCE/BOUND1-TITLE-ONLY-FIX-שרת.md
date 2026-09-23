# EXP-A2 Bound #1 — Title-only coalesce fix (שרת)

**Stamp:** 2026-09-20 10:19 IDT (Asia/Jerusalem, UTC+3)  
**Agent:** שרת · Project A  
**Mode:** Preview only · **HOLD promote** · **NO** alias retarget  
**Preview:** `dpl_Fz2iqzpX5sXVyyN4CnzatKKyxckw` · https://akvot-simple-demo-2u3mwx1k4-k-akvot.vercel.app  
**Locks:** Discovery alias `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` **UNCHANGED** · Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` **LOCKED**

---

## Problem (Arch CAVEAT)

Exact `title:` coalesce key alone unioned Evidence / providers / entityRefs across title-homonyms (inflated `multi_independent`, soft-ref cross-contam). Findings stayed separate (`attach_keep`) but Evidence attach was still wrong vs Bound #1.

## Fix

| Path | Change |
|------|--------|
| `api/lib/discovery/store.js` | `coalesceKeysForFinding` emits **only** `viaf:` / `qid:` / `ol:` — **never** `title:` |
| same | `corroborateBySoftLabel` UF clusters on strong keys only; skips any `title:` (defense-in-depth) |
| same | Title is **secondary** edge annotation (`titleSecondary`: agree/disagree/absent) — never sole coalesce key |
| `api/lib/discovery/corroboration.viaf.test.mjs` | Title-homonym must NOT cross-attach; same VIAF / same QID still coalesce; Pretty-Wrong + Acc scrub unchanged |

Fingerprint dedupe remains upstream (orthogonal). Acc scrub still AFTER coalesce via `emitSnapshot` / `sanitizeDiscoveryPayload`. Never dossier.

## Units (local)

- corroboration.viaf: **35/0** (Bound #1 cases)
- providers.viaf: 27/0 · adversarial.acc: 65/0 · orchestrator: 113/0 · prCloseout.acc: 107/0

## Preview smoke (S01/S04/S05)

| Metric | Value |
|--------|-------|
| mean `multi_independent` | **0** (gate 0.15 — not claimed) |
| pooled | 0 |
| Acc leak | **0** |
| S01 findings | 18 (attach_keep; no vacuum) |

**Expected:** live providers do not yet share typed soft-ref intersection across families (wikidata `wd-Q*` vs viaf `viaf:*`), so Bound #1 correctly yields multi=0 until a later enrichment wave. Prior title-only inflation (mean ~0.52) removed.

## Promote

**HOLD.** No `--prod`. No Discovery / Core alias retarget. Acc/QA own formal AFTER.

## Refs

- JSON: `BOUND1-TITLE-ONLY-FIX-שרת.json` · `21-PREVIEW-BOUND1.json`
- Arch glance: `ARCH-GLANCE-COALESCE-ארכיטקט-2026-09-20.md`
