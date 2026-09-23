# 06-ACC · ACC-AFTER-PREVIEW · דיוק · 2026-09-20

**Stamp:** 2026-09-20T11:44:43+03:00 (2026-09-20 11:44 IDT)  
**Owner:** דיוק (Accuracy) · CYCLE1 EXP-WEB-ORIGIN (C1)  
**Promote:** **HOLD · NO promote** · **NO C2**

---

## Verdict: **FAIL** · Identity Bound **OPEN**

| Item | Value |
|------|-------|
| Official Treatment (PREVIEW-DEPLOY / STATUS.md) | `dpl_268RUsfFVq2CdhQ3EkoEhmitEEja` |
| URL | https://akvot-simple-demo-kqiu92b4a-k-akvot.vercel.app |
| Acc | **FAIL** |
| Reason | URL-alone → **SAME-REFERENCE** (must be **UNKNOWN**) |
| Acc leak | **0** (green; does **not** override Bound FAIL) |
| Core pw / leak | **0 / 0** |
| Promote | **HOLD** |

---

## Identity label audit (live)

### Official Treatment `dpl_268RUsf` — Bound OPEN

| Seed | wo_n | relationship | SE | SR | leak | Acc |
|------|-----:|--------------|---:|---:|-----:|-----|
| S16 `https://www.who.int` | 1 | **SAME-REFERENCE** | 0 | 2 | 0 | **FAIL** |
| S06 `openai.com` | 0 | — (web_origin error/soft) | 0 | 0 | 0 | n/a finding |
| W1 `https://www.example.com` | 0 | — (weak_snippet / error) | 0 | 0 | 0 | n/a finding |
| ACC-U01 / ACC-P01 | 0 | — | 0 | 0 | 0 | leak OK |

**Proof:** Finding `wo-7fd08b15039288ff` · `hostFamily=web_origin` · `relationship=SAME-REFERENCE` on URL-alone seed.  
Chief LOCK: URL/domain alone → max **UNKNOWN**. Acc **FAIL**.

### Patch candidate `dpl_BynXm5i` — NOT Acc-PASS yet

| Seed | relationship | Note |
|------|--------------|------|
| S16 | **UNKNOWN** | Looks patched on this dpl |

**Acc rule:** Do **not** Acc-PASS Treatment until Server publishes patched Preview into `STATUS-שרת` / `PREVIEW-DEPLOY`. Pack official Treatment remains `dpl_268RUsf` → Bound OPEN.

Raw: `raw/acc-after-דיוק/BOUND-IDENTITY-AUDIT.json`

---

## Gates (Acc)

| Gate | Result | Note |
|------|--------|------|
| AG1 leak=0 | **PASS** | Hard leak green |
| AG2 poison Q surface | **PASS** | ACC-P01 leak=0 |
| AG3 URL-alone identity | **FAIL** | SAME-REFERENCE on S16 |
| AG5 Core pw=0 leak=0 | **PASS** | alias smoke |
| Promote / C2 | **HOLD / NO** | blocked by Bound |

**Pack Acc PASS:** **BLOCKED** by identity Bound FAIL (even with leak=0).

---

## Control / locks

| Lock | State |
|------|-------|
| B0 CONTROL | `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` LOCKED |
| Core | `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` LOCKED · pw=0 leak=0 |
| A2 | FROZEN · not mutated |
| Alias retarget | **NO** |

---

## Next

1. **WAITING** Server patch Preview published in `STATUS-שרת` / `PREVIEW-DEPLOY`  
2. Acc **re-AFTER** immediately with identity label audit (URL-alone must be UNKNOWN)  
3. **NO C2 · NO promote**

## STOP

**Acc FAIL · Bound OPEN · HOLD · WAITING patch Preview.**
