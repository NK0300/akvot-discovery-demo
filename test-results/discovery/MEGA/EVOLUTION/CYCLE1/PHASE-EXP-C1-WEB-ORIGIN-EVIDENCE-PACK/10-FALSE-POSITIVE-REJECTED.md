# 10 — FALSE-POSITIVE / BLOCKED (≥10)

**Stamp:** 20/09/2026, 11:40:51 IDT

- **ADV-private** seed=`http://127.0.0.1/` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-private.json`
- **ADV-meta** seed=`http://169.254.169.254/` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"ok","viaf":"error","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-meta.json`
- **ADV-local** seed=`https://localhost/` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-local.json`
- **ADV-internal** seed=`https://metadata.google.internal/` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"ok","viaf":"error","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-internal.json`
- **ADV-js** seed=`javascript:alert(1)` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"error","viaf":"error","web_origin":"ok"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-js.json`
- **ADV-park** seed=`https://example.com` status=failed_soft providers={"wikidata":"ok","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-park.json`
- **ADV-http** seed=`http://example.com` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"error","viaf":"ok","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-http.json`
- **ADV-archive** seed=`https://web.archive.org` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"error","viaf":"ok","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-archive.json`
- **ADV-query** seed=`https://www.who.int/path?utm_source=x&q=1` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-query.json`
- **ADV-poison** seed=`undefined` status=failed_soft providers={"wikidata":"error","openlibrary":"ok","wikipedia":"ok","viaf":"ok","web_origin":"error"}
  - findings_n=0 wo_n=0
  - wo titles: (none)
  - evidence: (none)
  - raw: `raw/TREAT-ADV-poison.json`

Plus unit rejects: javascript/data/file/ftp/userinfo/raw-IP/CGNAT — see webOrigin.test.mjs
