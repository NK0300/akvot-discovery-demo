# 09 — TRADEOFF ANALYSIS · ארכיטקט

**Stamp:** 2026-09-20 11:02 IDT (Asia/Jerusalem, UTC+3)  
**Owner:** ארכיטקט  
**Mode:** Factual trade-offs · **no “best” marketing** · NO impl · NO EXP-B  
**Compare:** HE-locale (C1) vs other candidates (C2–C8)

---

## Eight axes

Axes used below:

1. **Public-web discovery surface** (product objective)  
2. **Independence / new hostFamily**  
3. **Relationship-invention risk**  
4. **Acc / adversarial risk**  
5. **Engineering blast radius**  
6. **Locale / HE fidelity**  
7. **Corp / authority coverage** (without S04 recovery framing)  
8. **Time-to-Preview-measure** (docs→Preview experiment readiness)

---

## Matrix (Arch assessment — ordinal: High / Med / Low / None)

| Candidate | Surface↑ | Indep↑ | Rel-invent risk | Acc risk | Blast | HE fidelity | Corp authority | TTM |
|-----------|----------|--------|-----------------|----------|-------|-------------|----------------|-----|
| **C1 HE-locale** | Low–Med (HE seeds) | **None** | **Low** | Low | **Lowest** | **High** | None | **Fastest** |
| C2 URL origin | **High** for URL seeds | **High** (new) | Low | Med (SSRF) | Med | None | Low | Med |
| C3 EDGAR | Med (US corps) | **High** (new) | Low if CIK-typed | Med | Med | None | **High** | Med |
| C4 Nat. registry | Med | High | Med | Med | Med–High | Med if IL | High | Slow |
| C5 Query expand | Med | Indirect | **Med** | Med | Med | Med (translit) | Low | Med |
| C6 WP sitelink QID | Low–Med typed | Indirect (helps attach) | Low | Low–Med | Low–Med | Low | Low | Med |
| C7 News RSS | Med freshness | High | Med FP | Med | Med | Med if HE feeds | Low | Med |
| C8 ORCID/Crossref | Med scholarly | Med–High | Low–Med | Low | Low–Med | Low | None | Med |
| C10 web_public | **Max** | Max pot. | **High** | **High** | **Deferred** | Var | Var | Blocked |

---

## HE-locale vs others (factual contrasts)

| Question | HE-locale (C1) | Strong alternative example |
|----------|----------------|----------------------------|
| Does it expand maximum public-web discovery globally? | **Narrow** — mainly HE-script / locale=he sessions | C2/C3/C7 expand whole new Evidence classes |
| Does it add an independent family? | **No** | C2/C3/C7 **yes** |
| Does it touch coalesce / Bound#1? | **No** | C6 touches typed emit; C5 may increase wrong hits feeding coalesce |
| Does it pressure S04/S05 multi? | **No** | C3 could be mis-framed as S04 fix — Arch forbids that framing |
| Partial wiring today? | **Yes** (host switch exists) | Others need new adapters |
| Security co-bound? | Minimal | C2/C10 require urlSafety / Security GO |

---

## Non-tradeoffs (locked)

- A2-bound title-bridge is **not** on the table.  
- Manufacturing S04/S05 recovery is **not** a valid trade for multi.  
- Promoting A2-safe is **out of scope** of this Gap Analysis (Chief separate).

---

## OWNER

| Who | Fill |
|-----|------|
| **@שרת** | Cost/ops numbers for C2–C8 |
| **@דיוק** | Quantify Acc risk ordinals |
