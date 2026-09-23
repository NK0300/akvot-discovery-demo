# 02 — TYPED REF AUDIT (שרת) · Phase 2 stub

**Stamp:** 2026-09-20 10:51 IDT  
**Mode:** observational · from same S01/S04/S05 typed-enrich data  
**Preview:** `dpl_7MmfPSHByCLc3r86tnFVPZAWmRV9`  
**No code · No deploy · No alias**

## VIAF

### Precision
- S01: VIAF 85312226 correctly joins to Q80/OL25245A — high precision for canonical person.
- S04: VIAF hits are lexical matches on 'Stripe*' (people, museums, historical) — low precision for company seed; no WKP/QID on findings.
- S05: VIAF mixes national societies, Jean Pictet, Henry Dunant Institute — reasonable org recall but sparse WKP enrich.

### Coverage
- S01 viaf_n=10 (dup-inflated by attach_keep copies of viaf-85312226).
- S04 viaf_n=8 family-local only.
- S05 viaf_n=14 on findings; 2 VIAF ids participate in multi-family clusters; Q7178's VIAF 145680594 not returned by Autocomplete for this seed.

### Collision
- S01: duplicate finding rows sharing id viaf-85312226 (8 copies) — collision/duplication at graph surface after attach_keep.
- S04: Adelle Stripe appears in VIAF (156206104) and OL (OL8613090A) as likely same person but no shared typed key on findings (OL lacked viaf: remote_ids in session) — missed join, not false merge.
- No observed false merge across distinct QIDs in this sample (Acc leak 0).

## QID (Wikidata)

### Precision
- S01: Q80 is correct person; other QIDs are talks/works titled with person name — correct as independent entities, not false person merges.
- S04: no QIDs (wikidata=error).
- S05: Q470110 / Q5987345 coalesce correctly; Q48438 Saint George and Q7305591 Redd Kross are semantic noise — singletons (safe).

### Coverage
- S01: 17 findings carry qid/wd; 10 of those multi-family.
- S05: 12 findings carry qid/wd; only the two cluster QIDs multi-family.
- P214 enrich present on Q80, Q470110, Q7178, Q48438, Q7305591 in session; join only when peer VIAF/OL finding exists.

### Collision
- No qid collision (two different real-world entities sharing one QID) observed.
- Related-entity flood (talks/works) dilutes multi_rate denominator without being coalesce failures.

## Open Library (OL)

### Precision
- S01 OL25245A correctly Tim Berners-Lee with remote_ids → viaf+qid.
- S04 OL hits are title/author string matches on Stripe* — low precision for fintech company.
- S05 OL17804A / OL124327A correctly participate in Red Cross clusters when remote_ids present.

### Coverage
- remote_ids enrich is the critical OL→viaf/qid bridge; when absent, OL stays family-local (S04 all 8 OL; S05 6 OL singletons).
- OL network probe from forensics box timed out — coverage claims grounded in session entityRefs only.

### Collision
- ol: vs ol- dual emission on same finding (both listed) — benign aliasing, coalesce accepts both forms.
- No OL key collision across distinct people observed in sample.

## Cross-family join keys observed

| key | also | seed | result |
|-----|------|------|--------|
| `viaf:85312226` | `qid:Q80`, `ol:OL25245A` | S01 | multi_family |
| `viaf:122023057` | `qid:Q470110`, `ol:OL17804A` | S05 | multi_family |
| `viaf:160178001` | `qid:Q5987345`, `ol:OL124327A` | S05 | multi_family |
| `viaf:145680594` | `qid:Q7178` | S05 | wd_only_no_peer |

## External P214 spotcheck (Wikidata API · 2026-09-20 IDT)

| QID | VIAF P214 | session join? |
|-----|-----------|---------------|
| Q80 | 85312226 | yes · S01 multi |
| Q470110 | 122023057 | yes · S05 multi |
| Q5987345 | 160178001 | yes · S05 multi |
| Q7178 | 145680594 | **no peer VIAF finding** |
| Q200897 (Stripe Inc) | _(empty)_ | N/A (WD error on S04; no P214 anyway) |

## Next (Phase 2 continuation — not started)

- Quantify AutoSuggest WKP hit-rate on S04/S05 VIAF candidates
- Quantify OL `remote_ids` presence rate on singleton OL authors
- Decide whether attach_keep duplication (S01 viaf id ×8) is metric noise vs product bug
- **Still no product code until failure classes signed off**
