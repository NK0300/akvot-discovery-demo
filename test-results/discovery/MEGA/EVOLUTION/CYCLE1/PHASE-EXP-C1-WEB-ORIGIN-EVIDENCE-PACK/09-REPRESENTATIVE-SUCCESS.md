# 09 — REPRESENTATIVE SUCCESS (≥ useful discoveries)

**Stamp:** 20/09/2026, 11:40:51 IDT

- **S16** seed=`https://www.who.int` status=complete providers={"wikidata":"ok","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"ok"}
  - findings_n=1 wo_n=1
  - wo titles: World Health Organization (WHO) [SAME-REFERENCE]
  - evidence: https://www.who.int/ safety=allow
  - raw: `raw/TREAT-S16.json`
- **W5** seed=`who.int` status=partial providers={"wikidata":"error","openlibrary":"ok","wikipedia":"error","viaf":"partial","web_origin":"ok"}
  - findings_n=9 wo_n=1
  - wo titles: World Health Organization (WHO) [SAME-REFERENCE]
  - evidence: https://www.who.int/ safety=allow
  - raw: `raw/TREAT-W5.json`
- **ADV-www** seed=`https://www.who.int` status=partial providers={"wikidata":"error","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"ok"}
  - findings_n=1 wo_n=1
  - wo titles: World Health Organization (WHO) [SAME-REFERENCE]
  - evidence: https://www.who.int/ safety=allow
  - raw: `raw/TREAT-ADV-www.json`
- **ADV-unrelated** seed=`https://www.w3.org` status=partial providers={"wikidata":"error","openlibrary":"ok","wikipedia":"error","viaf":"ok","web_origin":"ok"}
  - findings_n=1 wo_n=1
  - wo titles: W3C [SAME-REFERENCE]
  - evidence: https://www.w3.org/ safety=allow
  - raw: `raw/TREAT-ADV-unrelated.json`
- **ADV-social** seed=`https://twitter.com` status=partial providers={"wikidata":"error","openlibrary":"ok","wikipedia":"error","viaf":"ok","web_origin":"ok"}
  - findings_n=1 wo_n=1
  - wo titles: X (formerly Twitter) [SAME-REFERENCE]
  - evidence: https://x.com/ safety=allow
  - raw: `raw/TREAT-ADV-social.json`
- **ADV-doc** seed=`https://www.rfc-editor.org` status=partial providers={"wikidata":"error","openlibrary":"ok","wikipedia":"error","viaf":"ok","web_origin":"ok"}
  - findings_n=1 wo_n=1
  - wo titles: RFC Editor [SAME-REFERENCE]
  - evidence: https://www.rfc-editor.org/ safety=allow
  - raw: `raw/TREAT-ADV-doc.json`
- **W7** seed=`https://www.microsoft.com` status=complete providers={"wikidata":"ok","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"ok"}
  - findings_n=1 wo_n=1
  - wo titles: Your request has been blocked. This could be due to several reasons. [SAME-REFERENCE]
  - evidence: https://www.microsoft.com/ safety=allow
  - raw: `raw/TREAT-W7.json`

## Useful discovery list (10 target; available live successes)
1. S16 who.int URL → WHO official origin metadata
2. W5 bare who.int → SAME-REFERENCE origin + registries
3. ADV-www www.who.int
4. ADV-unrelated w3.org → W3C (domain≠person identity)
5. ADV-social twitter.com → "X (formerly Twitter)" metadata
6. ADV-doc rfc-editor.org
7. W7 microsoft.com (blocked interstitial — still typed web_origin, not SAME-ENTITY)
8–10. Covered by unit normalize/parse successes (example.com mock) + W5/S16 reproducibility
