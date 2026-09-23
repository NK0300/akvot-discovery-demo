# FAIL · סלבים / נתניהו · בודק · 2026-09-08

**תיוג ל־@שרת** · אל תריץ 250 מלא עד תיקון  
**מקור:** פיילוט 5 famous של Chief = **0/5 PASS** + דגימות חיות + smoke קודם

## תסמינים
1. **need_context על סלבים** (נתניהו/גלאון/אובמה/סער…) במקום dossier+QID
2. **faces על סער/רמון** כשאין commit ויקי יציב — סיכון wrong-face
3. **JSON errors** בפיילוט (parse/גוף לא תקין)

## דגימות חיות פרוד (עכשיו)

```json
[
  {
    "q": "בנימין נתניהו",
    "http": 504,
    "ms": 60561,
    "parseErr": "Unexpected token 'A', \"An error o\"... is not valid JSON",
    "qid": null,
    "faces": false,
    "imgs": 0,
    "src": 0,
    "bodyHead": "An error occurred with your deployment\n\nFUNCTION_INVOCATION_TIMEOUT\n\ncle1::fbvcn-1788846015839-2611d81a1e3c\n"
  },
  {
    "q": "גדעון סער",
    "http": 200,
    "ms": 1794,
    "parseErr": null,
    "phase": "orchestrator-v0-b",
    "ui": "dossier",
    "scn": "known",
    "qid": "Q966349",
    "mode": "wiki",
    "faces": true,
    "imgs": 2,
    "src": 16,
    "label": "גדעון סער"
  },
  {
    "q": "חיים רמון",
    "http": 200,
    "ms": 7563,
    "parseErr": null,
    "phase": "orchestrator-v0-b",
    "ui": "dossier",
    "scn": "known",
    "qid": "Q652581",
    "mode": "wiki",
    "faces": true,
    "imgs": 1,
    "src": 12,
    "label": "חיים רמון"
  }
]
```

## היסטוריית smoke (מקומי/קודם)

```json
[
  {
    "from": "SMOKE-A-retest-2026-09-08.json",
    "id": "G1-bibi",
    "ui": "dossier",
    "scn": "stranger",
    "qid": null,
    "mode": "google",
    "ms": 11692
  },
  {
    "from": "SMOKE-A-retest-2026-09-08.json",
    "id": "G2a-galon-he",
    "ui": "need_context",
    "scn": "stranger",
    "qid": null,
    "mode": "ambiguous",
    "ms": 2381
  },
  {
    "from": "SMOKE-A-retest-2026-09-08.json",
    "id": "G3a-obama-en",
    "ui": "need_context",
    "scn": "foreign",
    "qid": null,
    "mode": "google",
    "ms": 60885
  },
  {
    "from": "SMOKE-A-retest-2026-09-08.json",
    "id": "G3b-obama-he",
    "ui": "need_context",
    "scn": "stranger",
    "qid": null,
    "mode": "candidates",
    "ms": 29292
  },
  {
    "from": "SMOKE-12gate-orchestrator-v0-2026-09-08.json",
    "id": "G1-bibi",
    "ui": "dossier",
    "scn": "stranger",
    "qid": null,
    "mode": "google",
    "ms": 13764,
    "pass": false,
    "fails": [
      "SAFETY fail"
    ]
  },
  {
    "from": "SMOKE-12gate-orchestrator-v0-2026-09-08.json",
    "id": "G2a-galon-he",
    "ui": "need_context",
    "scn": "stranger",
    "qid": null,
    "mode": "ambiguous",
    "ms": 3394,
    "pass": false,
    "fails": []
  },
  {
    "from": "SMOKE-12gate-orchestrator-v0-2026-09-08.json",
    "id": "G3a-obama-en",
    "ui": "dossier",
    "scn": "known",
    "qid": "Q76",
    "mode": "wiki",
    "ms": 14212,
    "pass": true,
    "fails": []
  },
  {
    "from": "SMOKE-12gate-orchestrator-v0-2026-09-08.json",
    "id": "G3b-obama-he",
    "ui": "need_context",
    "scn": "stranger",
    "qid": null,
    "mode": "google",
    "ms": 13046,
    "pass": false,
    "fails": []
  }
]
```

## ציפייה
- `בנימין נתניהו` → `uiState=dossier` · `qid=Q43723` · mode wiki
- סלב HE לא נופל ל־`need_context`/`common_name` על wiki 429
- בלי פנים על שם פוליטי כש־qid חסר

**בודק:** רק פיילוטים קטנים עד ירוק.
