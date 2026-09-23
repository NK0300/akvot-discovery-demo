# 12 — LIMITATIONS · EXP-A2-SAFE

**Stamp:** 2026-09-20 10:35 IDT  
**Owner:** שרת (Server) · Acc/QA/Arch to amend their lanes

---

## Hard locks (in force)

- B0 Discovery alias `dpl_AvyhrW24gGRquWCPPZdydBiz81dv` — **FROZEN** (no alias move)
- Core `dpl_8agSZKvcb2pjehzXgMeckDgJvDV8` — **LOCKED**
- **NO PROMOTE** · **NO EXP-B/C** · **NO Phases 6–10**
- Coalesce: typed soft-ref ONLY — **NEVER** title-only

---

## Product / metric limitations

1. **Coverage ≠ identity.** attach_keep raises multi-family Evidence; it does **not** assert same-entity.
2. **Enrich dependency.** Cross-family multi requires public WKP / P214 / OL remote_ids; absence → FN holes (S04).
3. **Wikipedia under-keyed.** Wiki-only Evidence rarely supplies typed coalesce keys.
4. **Smoke ≠ formal Acc/QA.** Enrich mean 0.2408 / leak 0 is **Server smoke**; formal Acc AFTER on `dpl_7Mmf…` is TBD (דיוק).
5. **FRNDab caveat.** Title-bridge mean ~0.44–0.52 is **NON-promote** documentation only.
6. **EXP-A baselines.** H9o45 = emit-only multi=0; 4Rj7c = soft-label vacuum — both historical, not promote paths.
7. **Rate variance.** S01 0.56 vs S04 0.00 vs S05 0.17 — mean sensitive to seed mix; do not over-claim generality.
8. **No dossier path.** Acc scrub after coalesce; Core identity UX unchanged / locked.

---

## Out of scope this pack

- Alias retarget / prod promote  
- Title-similarity ML / embedding match  
- EXP-B/C experiments  
- Phases 6–10 evolution work  


---

## A2-SAFE live observations (2026-09-20T10:42:29+03:00)

1. **titleSecondary disagree → related-entity:** VIAF date/locale title variants share typed keys but disagree on secondary title key → edges label `related-entity` not `same-entity`. Attach still fires; Findings kept. Vocabulary is conservative.
2. **Graph edges require from/to:** Acc sanitize drops edges without from/to; fixed in orchestrator for this Preview (`dpl_DZmX…`).
3. **S04 Stripe multi=0:** Expected Pretty-Wrong / missing typed intersection — not a regression.
4. **S05 multi variance:** Live can dip below prior 0.1667 smoke depending on provider responses.
5. **Wikipedia under-key:** Wikipedia alone does not mint `qid:`/`viaf:`/`ol:` for UF coalesce.
6. **Never claim identity dossier** from coalesce — INFORMATION≠IDENTITY remains absolute.
