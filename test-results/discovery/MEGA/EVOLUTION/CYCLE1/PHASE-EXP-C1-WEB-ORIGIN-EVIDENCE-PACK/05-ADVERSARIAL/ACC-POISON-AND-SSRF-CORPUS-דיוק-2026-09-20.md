# 05-ADVERSARIAL · ACC-POISON-AND-SSRF-CORPUS · דיוק · 2026-09-20

**Stamp:** 2026-09-20T11:37:49+03:00 (2026-09-20 11:37 IDT)  
**Owner:** דיוק (Accuracy) · CYCLE1 EXP-WEB-ORIGIN (C1) · PREVIEW ONLY  
**Mode:** Corpus READY · **live Acc = WAITING_FOR_PREVIEW**  
**Promote:** **HOLD · NO promote**  
**Complement:** QA `06-DOMAIN-ADVERSARIAL-CORPUS-בודק` (domain/normalize); this pack = Acc poison + SSRF + URL-identity traps

---

## Acc pass bars (Treatment, when live)

| Metric | Pass |
|--------|------|
| Acc leak | **0** on nested / SSE / narrow / HIT / logs / telemetry |
| Forbidden Q surface (`Q1701775`, `wd-Q1701775`, bare poison) | **0** |
| SAME-ENTITY from URL/domain | **0** |
| SAME-REFERENCE from URL alone / seedIsUrl | **0** (max **UNKNOWN**) |
| Pretty-Wrong / false-merge | **0** |
| SSRF block rows | **100%** BLOCK + safe telemetry · **0** Findings |
| Core alias (smoke) | pw=0 · leak=0 hold |

---

## Corpus (n=19 Acc-owned)

### A. Poison ID injects

| ID | Seed / inject | Class | Expect safety | Expect rel ceiling | Expect finding | Acc check |
|----|---------------|-------|---------------|--------------------|----------------|-----------|
| ACC-P01 | `https://www.example.com/page?qid=Q1701775` | poison Q in query | ALLOW (public) | **UNKNOWN** | Y/N (cite-or-drop) | leak=0 · Q never in identity/facets/SSE |
| ACC-P02 | `https://www.example.com/wiki/Q1701775` | poison Q in path | ALLOW | **UNKNOWN** | Y/N | scrub · no entityRef `qid:Q1701775` |
| ACC-P03 | seed text `Q1701775` (non-URL) | poison Q as seed | N/A providers | no SAME-* via poison | may strip | forbiddenStripped≥0 · leak=0 |
| ACC-P04 | `https://www.wikidata.org/wiki/Q1701775` | looks like entity page | ALLOW | **UNKNOWN** (URL-alone) | Y possible | **must stay UNKNOWN** · never SAME-ENTITY/SAME-REFERENCE from URL alone · Acc FAIL if SAME-* |
| ACC-P05 | Evidence/meta inject `wd-Q1701775` in title spoof *(if injectable)* | wd- prefix poison | ALLOW or drop | UNKNOWN / CONTRADICTORY | N preferred | scrub · no wd-Q1701775 surface |

### B. Homonym URL vs person / org

| ID | Seed | Class | Expect | Acc check |
|----|------|-------|--------|-----------|
| ACC-H01 | `https://www.stripe.com` (company site; person-homonym risk elsewhere) | URL vs brand | UNKNOWN ceiling from URL alone | no false-merge to person “Stripe*” |
| ACC-H02 | person seed `John Smith` + one-hop URL if any | homonym person | web_origin labels ≤ RELATED/POSSIBLE/UNKNOWN | false_merge=0 · no SAME-ENTITY |
| ACC-H03 | org seed `Red Cross` + official-looking URL domain only | URL vs org movement | URL-alone → UNKNOWN | no collapse national/movement via domain |
| ACC-H04 | `https://en.wikipedia.org/wiki/John_Smith` | entity-looking wiki URL | **UNKNOWN** without typed soft-ref ∩ | Acc FAIL if SAME-ENTITY or SAME-REFERENCE from URL alone |

### C. Localhost / private / metadata (expect BLOCK + safe telemetry)

| ID | Seed | Class | Expect safety | Finding | Acc check |
|----|------|-------|---------------|---------|-----------|
| ACC-S01 | `http://127.0.0.1/` | loopback | **BLOCK** | N | telemetry reason only · leak=0 · no private URL in provenanceUrl |
| ACC-S02 | `https://localhost/` | localhost | **BLOCK** | N | same |
| ACC-S03 | `http://192.168.1.1/` | private | **BLOCK** | N | same |
| ACC-S04 | `http://169.254.169.254/` | cloud metadata | **BLOCK** | N | same |
| ACC-S05 | `https://metadata.google.internal/` | metadata host | **BLOCK** | N | same |

### D. Redirect-to-private

| ID | Seed | Class | Expect | Acc check |
|----|------|-------|--------|-----------|
| ACC-R01 | `https://example.com/redirect?url=http://127.0.0.1/` | open-redirect pattern | seed may ALLOW; **hop to private → BLOCK** if followed | 0 Findings from blocked hop · safe telemetry |
| ACC-R02 | shortener / hop pattern *(document; live if Server provides fixture)* | redirect-to-private | **BLOCK if detectable** on hop re-check | Acc FAIL if private URL leaks into Evidence.provenanceUrl |

### E. Entity-looking URL → must stay UNKNOWN

| ID | Seed | Class | Expect rel | Acc FAIL if |
|----|------|-------|------------|-------------|
| ACC-U01 | `https://www.wikidata.org/wiki/Q80` | looks like TBL entity page | **UNKNOWN** (URL-alone; no typed ∩ minted by web_origin alone) | SAME-ENTITY or SAME-REFERENCE |
| ACC-U02 | `https://viaf.org/viaf/85312226` | looks like VIAF entity page | **UNKNOWN** | SAME-* from URL alone |
| ACC-U03 | `openai.com` (domain seed) | domain-only | **UNKNOWN** max (RELATED only with extra typed evidence) | SAME-* |

---

## Category coverage

| Category | IDs | Covered |
|----------|-----|---------|
| Poison ID injects (Q1701775, wd-Q…) | ACC-P01–P05 | ✓ |
| Homonym URL vs person/org | ACC-H01–H04 | ✓ |
| localhost/private/metadata | ACC-S01–S05 | ✓ |
| redirect-to-private | ACC-R01–R02 | ✓ |
| Entity-looking URL → UNKNOWN | ACC-U01–U03 · ACC-P04 · ACC-H04 | ✓ |

**Count:** 19 Acc rows (+ overlap notes with QA ADV-17 / ADV block rows).

---

## Live protocol (AFTER Preview in pack)

1. Run CONTROL (B0) then TREATMENT on ACC-* subset via `vercel curl --deployment` (scope `k-akvot`).  
2. Scan leak surfaces · label audit · SSRF block rate.  
3. Record results into `06-ACC/ACC-AFTER-PREVIEW-דיוק-*.md` + `.json`.  
4. **HOLD promote.**

## STOP

**Acc poison+SSRF corpus READY · WAITING_FOR_PREVIEW · HOLD · NO promote.**
