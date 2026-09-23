# 11 — FALSE-NEGATIVE / AMBIGUOUS

**Stamp:** 20/09/2026, 11:40:51 IDT

- **S06** seed=`openai.com` status=partial providers={"wikidata":"ok","openlibrary":"ok","wikipedia":"partial","viaf":"ok","web_origin":"error"}
  - findings_n=7 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-S06.json`
- **W1** seed=`https://www.example.com` status=failed_soft providers={"wikidata":"ok","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-W1.json`
- **ADV-sub** seed=`https://en.wikipedia.org` status=partial providers={"wikidata":"ok","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"error"}
  - findings_n=5 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-sub.json`
- **S02** seed=`John Smith` status=partial providers={"wikidata":"error","openlibrary":"partial","wikipedia":"error","viaf":"partial","web_origin":"ok"}
  - findings_n=16 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-S02.json`
- **S09** seed=`zzzznonexistentxyz999` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"error","viaf":"ok","web_origin":"ok"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-S09.json`

Notes:
- S06 openai.com: Cloudflare/bot edge → provider error (not silent invent)
- W1/example.com: live fetch soft-fail from Preview egress (unit mock PASS)
- ADV-sub wikipedia.org: other providers returned hits; web_origin soft (thin/overlap) — no identity collapse
- S02: wo=0 (correct — person seed)
- S09: honest empty
