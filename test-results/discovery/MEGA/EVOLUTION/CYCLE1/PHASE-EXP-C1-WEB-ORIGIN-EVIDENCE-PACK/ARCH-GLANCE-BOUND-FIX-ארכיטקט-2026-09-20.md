# ARCH GLANCE — BOUND FIX URL-alone → UNKNOWN · ארכיטקט

**Stamp:** 2026-09-20 11:49 IDT (Asia/Jerusalem, UTC+3)  
**Role:** ארכיטקט (Arch) · CYCLE1 EXP-WEB-ORIGIN (C1) · **DOCS ONLY**  
**Mode:** PREVIEW ONLY · **HOLD promote** · **NO C2** · B0 / Core / A2 **LOCKED**  
**Verdict:** **PASS** (Bound) · with **CAVEAT** (Acc/QA not claimed)

---

## Canonical Preview (treatment)

| | |
|--|--|
| dpl | `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w` |
| URL | https://akvot-simple-demo-c5if0fxif-k-akvot.vercel.app |
| Flag | `DISCOVERY_ENABLE_WEB_ORIGIN=1` (Preview) |
| Supersedes scrap | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` (Acc FAIL: URL-alone → SAME-REFERENCE) |
| Alias / promote | **UNTOUCHED / HOLD** |

Sources: Server `BOUND-FIX-URL-ALONE-UNKNOWN-שרת.md`, `21-PREVIEW.json`, `raw/BOUND-FIX-*.json`.

---

## Bound under re-glance

| Rule | Required |
|------|----------|
| URL / hostname-alone | → **UNKNOWN** |
| Never | SAME-REFERENCE / SAME-ENTITY from URL/domain alone |
| RELATED-ENTITY | Only with **extra** typed evidence (non-URL seed + title/site overlap) |
| `web_origin` | Evidence / provenance — **not** identity collapse |

Aligned with Arch `02-RELATIONSHIP-BOUNDS-ארכיטקט.md` decision table (seed-is-URL self-cite → UNKNOWN).

---

## 1. Server evidence (read)

| Artifact | Bound signal |
|----------|--------------|
| `BOUND-FIX-URL-ALONE-UNKNOWN-שרת.md` | who.int live → finding/evidence/facet **UNKNOWN**; SAME-* absent |
| `21-PREVIEW.json` | smoke.who.int `bound_ok: true`; example.com soft-fail + zero SAME-* |
| `raw/BOUND-FIX-who.int.json` | `relationship: UNKNOWN`; facetHints `relationship:UNKNOWN`; SAME-* = false |
| `raw/BOUND-FIX-example.com.json` | providers.web_origin=error; 0 wo findings; SAME-* = false |

Prior Acc FAIL on scrap dpl (`SAME-REFERENCE` for `https://www.who.int`) is **superseded** by this Preview — not re-litigated here.

---

## 2. Code glance (workspace)

| Path | Confirmation |
|------|----------------|
| `api/lib/discovery/webOrigin.js` `labelWebOriginRelationship` | `seedIsUrl` (`looksLikeUrlOrHostname` \|\| `^https?:`) → early return **`UNKNOWN`**. RELATED/POSSIBLE only for **non-URL** seed + title/site overlap. Host/reg alone never upgrades. |
| `api/lib/discovery/store.js` `clampWebOriginRelationship` | Defense-in-depth: SAME-ENTITY / SAME-REFERENCE / SAME-SOURCE → **UNKNOWN** on finding + evidence; facetHints SAME-* rewritten to `relationship:UNKNOWN`. |
| `api/lib/discovery/orchestrator.js` | Graph corroboration edge default `e.relationship \|\| 'unknown'` (was same-reference). One-hop web_origin remains flag-gated, non-recursive. |
| `api/lib/discovery/providers.js` / `emit.js` | Passthrough via `buildWebOriginFinding`; emit Acc scrub only — **does not** rewrite relationship toward SAME-*. |
| Units `webOrigin.test.mjs` | **96 passed / 0 failed** (re-run 2026-09-20 11:48 IDT). Asserts URL-alone seeds (who.int, openai.com, bare hosts) → UNKNOWN; never SAME-*. |

**Prior Arch FAIL** in `13-ARCH-GLANCE-STATUS` (`seedIsUrl → SAME-REFERENCE`) is **cleared** by this Server Bound fix.

---

## 3. Optional light live probe (Arch)

SSO-protected Preview; public curl → 401. Light probe via `vercel curl --deployment dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w --scope k-akvot`:

| Seed | Result | Bound |
|------|--------|-------|
| `https://www.who.int` | session `kv1.e9b9afeb8389c14cdff6671704f4a060`, status=complete, providers.web_origin=ok, finding.relationship=**UNKNOWN**, facetHints `relationship:UNKNOWN`, evidence.relationship=**UNKNOWN**, SAME-*=absent | **OK** |
| `example.com` | session `kv1.80b762541ae0e6951c03db07c42f24ed`, status=partial, providers.web_origin=error, 0 wo findings, SAME-*=absent | **OK** (no URL-alone SAME-* claim) |

**Acc owns full Acc AFTER** on this dpl — Arch probe is light corroboration only. **Do not** treat this as Acc/QA PASS.

---

## Scorecard

| Bound check | Result |
|-------------|--------|
| URL/hostname-alone → UNKNOWN | **PASS** |
| Never SAME-REFERENCE / SAME-ENTITY from URL alone | **PASS** |
| RELATED only with extra evidence | **PASS** (code path) |
| Clamp + facet defense | **PASS** |
| Orchestrator default not same-reference | **PASS** |
| Units 96/0 | **PASS** |
| Preview evidence + light live | **PASS** |
| Acc / QA gates | **NOT CLAIMED** (peer-owned) |
| Promote / alias / C2 | **HOLD / NO** |

---

## CAVEAT

1. **example.com** soft-fails fetch (cite-or-drop) — Bound still held (zero SAME-*), but is not a positive UNKNOWN finding path.
2. Arch does **not** claim Acc AFTER or QA corpus PASS on `dpl_Ho6jgJg4…`.
3. MCP `get_deployment` / `web_fetch_vercel_url` lacked usable shareable/SSO path from Arch; live verify used CLI `vercel curl` + Server pack.
4. B0 / Core / A2 remain locked; alias untouched.

---

## STOP

**Arch Bound re-glance: PASS** on treatment Preview `dpl_Ho6jgJg4TGeDr5mjzv9sfRy4iW1w`.  
**HOLD promote. NO alias. NO C2. NO Acc/QA PASS claim.**
