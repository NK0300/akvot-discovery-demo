# P1 REGRESSION CASES · בודק · 2026-09-14
Baseline: dpl_D2zv · Mode: SPEC only · No implement until Gate

**AGENT:** בודק · QA Release Gate Owner  
**PURPOSE:** רשימת מקרי רגרסיה שחייבים להיות ירוקים **לפני ואחרי** כל מימוש P1 seed-alias / wikiExact (Master Directive §12).  
**BASELINE PRODUCTION:** `dpl_D2zv` **FROZEN** — אין dpl חדש בלי Release Gate מלא.  
**REFS:** `handoff/P1-BOUNDARIES-ארכיטקט-2026-09-14.md` · `RELEASE-SUITE-dplD2zv-בודק-2026-09-09.md`
**Aligned with:** `P1-CASES-דיוק-2026-09-14.md` (25 cases) · `P1-BOUNDARIES-ארכיטקט-2026-09-14.md`

---

## Gate rules
- **pretty-wrong must stay 0** — dossier+faces על שאילתה לא-בטוחה / זהות שגויה = STOP
- **mayCommitDossier thresholds untouched** — Evidence 0.75 · אין soft של שער כדי להעלות recall
- **SoT / commit gate single** — `mayCommitDossier` / `canCommitIdentity` ב-orchestrator בלבד · אין gate מקביל ב-lookup
- **PASS only with Evidence on new alias after Gate** — alias חדש חייב evidence ציבורי + QID קנוני יחיד · לא fuzzy בלי evidence
- Recall ↑ AND precision לא ↓ AND safety לא ↓ AND contract+units+full regression PASS

---

## A. SAFETY LOCK (must never regress)

| ID | INPUT | EXPECTED | Notes |
|----|-------|----------|-------|
| S-A1 | `דני כהן` / Danny Cohen bare | `need_context` · **0 faces** · no QID commit | COMMON_HE · NEVER unique-surname / NEVER alias · דיוק S01 |
| S-A1b | `משה כהן` bare | `need_context` · **0 faces** · no QID commit | COMMON_HE · דיוק S02 · NEVER unique-surname |
| S-A2 | `John Smith` bare | `need_context` · **0 faces** | softAmbiguous Latin bare · KEEP · דיוק S03 |
| S-A3 | Smith + IBM + NY (`org`/`city` ctx) | **NOT** dossier+faces | softAmb / thin / candidates OK · no wrong wiki commit · דיוק S04 |
| S-A4 | G11 email (Smith + fake email / identifier) | **NOT** dossier+faces · **no email leak** in UI/payload | email ≠ identity · scrub · דיוק S05 |
| S-A5 | junk HE (garbage / non-person) | `need_context` or thin · **0 faces** · no QID | red-team r1-junk-he · דיוק S06 |
| S-A6 | phone scrub (known / fake phone identifier) | thin / identifier · **scrub** · no caller-ID faces | phone ≠ identity · G10 class · (בודק-only; no דיוק twin) |
| S-A7 | obscure HE + fictional org | `need_context` or thin · UNKNOWN · **0 faces** · no QID | דיוק S07 · unknown class |

**LOCK:** כל כשל ב-A = SAFETY regression · חוסם Gate · לא soft.

---

## B. P0 KEEP (must stay)

| ID | INPUT | EXPECTED | Notes |
|----|-------|----------|-------|
| K-B1 | בנימין נתניהו / full Netanyahu | dossier · **Q43723** · faces OK | SAFETY s1 · canonical KEEP |
| K-B2 | אורלי לוי / Orli (Orly) Levy | dossier · **Q466537** · faces OK | SAFETY s6 · full name seeded |
| K-B3 | Domain units + contract identity-p0 + SAFETY suite | **exit 0** | `npm run test` / contract / SAFETY core 6/6 |

**LOCK:** B ירוק על baseline ועל כל מועמד P1 לפני promote.

---

## C. P1 TARGET RECALL (currently soft / expected improve after P1)

| ID | INPUT | EXPECTED after P1 | Before P1 (baseline track) | Notes |
|----|-------|-------------------|----------------------------|-------|
| R-C1 | `נתניהו` alone | dossier · **Q43723** · faces OK | soft **ALIAS_RECALL** — may be need_context על baseline ישן | UNIQUE_SURNAME seed · not COMMON_HE · דיוק N02 |
| R-C2 | `ביבי נתניהו` | dossier · **Q43723** | soft ALIAS_RECALL | nickname+surname → same QID · דיוק N03 |
| R-C2b | `ביבי` alone | dossier · **Q43723** | soft ALIAS_RECALL | nickname class · דיוק N04 · Evidence required |
| R-C3 | `Angela Merkel` | dossier · **Q567** | soft ALIAS_RECALL | Latin wikiExact / seed parity · דיוק M01 |
| R-C3b | `Merkel` alone | dossier **or** need_context per seed list | soft / policy | דיוק M02 · **document seed policy soft** — unique only if seeded; else need_context |
| R-C4 | `Zehava Galon` | dossier · **Q2630062** | soft ALIAS_RECALL | latinFold seed · דיוק G02 |
| R-C4b | `זהבה גלאון` | dossier · **Q2630062** | soft ALIAS_RECALL | HE exact · דיוק G01 |
| R-C4c | `Zahava Gal-On` (fold) | dossier · **Q2630062** | soft ALIAS_RECALL | latinFold · דיוק G03 |
| R-C5 | `Benjamin Netanyahu` | dossier · **Q43723** | soft ALIAS_RECALL | translit · דיוק N05 |
| R-C6 | `Bibi Netanyahu` | dossier · **Q43723** | soft ALIAS_RECALL | translit nickname · דיוק N06 |
| R-C7 | `Netanyahu` (Latin surname alone) | dossier · **Q43723** | soft ALIAS_RECALL | Latin unique surname · דיוק N07 |

**Rules for C:**
- **לפני P1:** כשל רך מתועד כ-`ALIAS_RECALL` — **לא** מפיל suite אלא אם pretty-wrong / wrong QID+faces
- **אחרי P1:** אלה **חייבים PASS** עם Evidence · wrong QID = pretty-wrong = STOP
- אין להוריד threshold / לפתוח COMMON_HE כדי לירוק את C

---

## D. PRECISION GUARDS (must not become false matches)

| ID | INPUT class | EXPECTED | Notes |
|----|-------------|----------|-------|
| P-D1 | Near-match / homonym without evidence | need_context או candidates · **לא** dossier+faces על QID שגוי | ambiguous · no force match |
| P-D2 | Common HE bare beyond Cohen (לוי / פרץ לבד וכו׳) | need_context · 0 faces | לא להכניס ל-UNIQUE_SURNAME |
| P-D3 | Common Latin bare beyond Smith | need_context · softAmb | pipeline softAmbiguous=true נשאר |
| P-D4 | Seed/alias שמצביע ליותר מ-QID אחד | **FORBIDDEN** · לא commit | P1 boundaries: no alias to ambiguous QID |
| P-D5 | Fuzzy / candidate inflation בלי evidence ≥ 0.75 | **לא** dossier | precision לא יורדת בשם recall |
| P-D6 | `יאיר לפיד` exact | dossier · **Q1396120** | דיוק P01 · already seeded class |
| P-D7 | `לפיד` alias (unique surname) | dossier · **Q1396120** | דיוק P02 · unique surname listed — OK |
| P-D8 | bare `לוי` / `כהן` alone | need_context · **0 faces** · **never** dossier | דיוק P03 · FORBIDDEN unique-surname |
| P-D9 | `Emily Chen` + weak city/role | candidates \| need_context · **not** low-conf dossier | דיוק P04 · partial · no over-commit |
| P-D10 | `Michael Brown` bare | need_context · 0 faces | דיוק P05 · softAmb / duplicate class |

**LOCK:** false dossier+faces = pretty-wrong · Gate FAIL.

---

## E. Suite command

```bash
# Baseline / pre-implement / post-P1 local gate
npm run test:release
npm run test:contract
# units included via package scripts (orchestrator Domain)
npm test
```

**אחרי P1 (כשמותר implement + dpl חדש תחת Gate):**
- להריץ **full suite מחדש מאפס** על ה-dpl החדש (Domain + Contract + SAFETY + Red-team + ALIAS_RECALL)
- C עוברים מ-soft ALIAS_RECALL ל-**hard PASS**
- A+B+D נשארים ירוקים · pretty-wrong=0
- **אין** promote בלי Evidence על כל alias חדש

Runner refs: `test-results/RELEASE-SUITE-בודק.mjs` · artifacts under `test-results/RELEASE-SUITE-*`

---

## F. Assaf

| Item | Status | Notes |
|------|--------|-------|
| Assaf Rappaport → expected dossier **Q47507930** | **P2 backlog** | OVER-GATE / SEED_GAP_SAFE · need_context כיום מקובל |
| Part of P1 acceptance? | **לא** | לא SAFETY · לא pretty-wrong · לא חוסם P1 Gate |
| Action in P1 | **document only** | אין if קשיח / אין soft של mayCommitDossier בשביל Assaf (ארכיטקט FORBIDDEN) |

---

## Checklist · בודק לפני שרת

- [ ] A SAFETY LOCK — all green on frozen `dpl_D2zv`
- [ ] B P0 KEEP — Netanyahu / Orli / suites exit 0
- [ ] C tracked as soft ALIAS_RECALL until after P1 Gate
- [ ] D precision guards reviewed with דיוק cases (P-D6–P-D10 aligned)
- [ ] E suite commands documented · full re-run-from-zero planned post-P1
- [ ] F Assaf = P2 only (דיוק P06)
- [ ] G crosswalk דיוק 25 → בודק complete
- [ ] ארכיטקט boundaries already filed — WAIT

---

## G. Crosswalk · דיוק 25 → בודק regression

Source: `P1-CASES-דיוק-2026-09-14.md` (25 cases JSON; MD also documents M02 seed-policy soft) · Boundaries: `P1-BOUNDARIES-ארכיטקט-2026-09-14.md`

| דיוק ID | בודק ID | Mapping notes |
|---------|---------|---------------|
| S01 | S-A1 | `דני כהן` · need_context · 0 faces |
| S02 | S-A1b | `משה כהן` · need_context · 0 faces (**added**) |
| S03 | S-A2 | `John Smith` bare |
| S04 | S-A3 | Smith + IBM + NY |
| S05 | S-A4 | G11 email |
| S06 | S-A5 | junk / non-person |
| S07 | S-A7 | obscure HE + fictional org (**added**) |
| — | S-A6 | phone scrub · בודק-only (no דיוק twin) |
| N01 | K-B1 | `בנימין נתניהו` / full Netanyahu · Q43723 KEEP |
| N02 | R-C1 | `נתניהו` alone |
| N03 | R-C2 | `ביבי נתניהו` |
| N04 | R-C2b | `ביבי` alone (**added**) |
| N05 | R-C5 | `Benjamin Netanyahu` (**added**) |
| N06 | R-C6 | `Bibi Netanyahu` (**added**) |
| N07 | R-C7 | `Netanyahu` Latin surname (**added**) |
| N08 | K-B2 | `אורלי לוי` · Q466537 KEEP |
| G01 | R-C4b | `זהבה גלאון` (**added**) |
| G02 | R-C4 | `Zehava Galon` |
| G03 | R-C4c | `Zahava Gal-On` fold (**added**) |
| M01 | R-C3 | `Angela Merkel` · Q567 |
| M02 | R-C3b | `Merkel` alone · **document seed policy soft** |
| P01 | P-D6 | `יאיר לפיד` exact (**added**) |
| P02 | P-D7 | `לפיד` alias (**added**) |
| P03 | P-D8 | bare `לוי` / `כהן` never dossier (**added**; overlaps P-D2) |
| P04 | P-D9 | `Emily Chen` partial (**added**) |
| P05 | P-D10 | `Michael Brown` bare (**added**) |
| P06 | F (P2 only) | Assaf Rappaport · **not** P1 acceptance · document only |

**Coverage:** all 25 דיוק JSON cases mapped · M02 (MD seed-policy) mapped to R-C3b · S-A6 phone remains בודק SAFETY-only.

**Gaps still WAIT on דיוק:** none for ID coverage — pack filed. Remaining WAIT = Gate (no implement / no api / no dpl until Release Gate). Soft ALIAS_RECALL on C until after P1 Evidence.

---

בודק aligned with דיוק 25 cases + ארכיטקט boundaries. SPEC only · WAIT for Gate before שרת implement.

*עודכן ע״י בודק · 2026-09-14 · SPEC only · ללא שינוי api · ללא deploy · baseline dpl_D2zv FROZEN · Aligned with דיוק 25*
