#!/usr/bin/env python3
"""Accuracy (דיוק) LIVE HTTP eval — P1 deploy dpl_D2zvC3QvUVgz6kaSaWqnSUCoD9hU"""
import json, time, urllib.parse, urllib.request, urllib.error, ssl
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

BASE = "https://akvot-simple-demo.vercel.app"
ORIGIN = BASE
TIMEOUT = 65
CONCURRENCY = 3
FAKE_EMAIL = "qa.rethink.test@example.com"
DEPLOY = "dpl_D2zvC3QvUVgz6kaSaWqnSUCoD9hU"
PHASE = "orchestrator-v0-b"
DIR = Path(__file__).resolve().parent
CASE_SET = DIR / "ACCURACY_EVAL-v2-set-דיוק-2026-09-09.json"
OUT_MD = DIR / "ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.md"
OUT_JSON = DIR / "ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.json"
OUT_REPORT = DIR / "ACCURACY_REPORT.md"
OUT_LOG = DIR / "ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.run.log"

logs = []
def log(*a):
    line = " ".join(str(x) for x in a)
    print(line, flush=True)
    logs.append(line)

def has_faces(d):
    if not d: return False
    return bool(d.get("photo") or (isinstance(d.get("images"), list) and len(d["images"]) > 0))

def evidence_brief(d):
    if not d: return "none"
    srcs = d.get("sources") or []
    if not srcs: return "none"
    out = []
    for s in srcs[:5]:
        host = ""
        try:
            from urllib.parse import urlparse
            host = urlparse(s.get("url") or "").hostname or ""
        except Exception:
            host = ""
        out.append(f"{s.get('kind') or s.get('group') or '?'}:{s.get('title') or host or ''}@{host or '-'}")
    return "; ".join(out)

def call_lookup(method, q, ctx=None):
    ctx = ctx or {}
    t0 = time.time()
    status, raw, data, err = 0, "", None, None
    try:
        headers = {
            "Origin": ORIGIN,
            "Accept": "application/json",
            "x-akvot-battery": "1",
            "User-Agent": "akvot-accuracy-eval/p1",
        }
        if method == "POST":
            url = f"{BASE}/api/lookup?nocache=1"
            body = json.dumps({"q": q, **ctx, "nocache": 1}).encode("utf-8")
            headers["Content-Type"] = "application/json"
            req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        else:
            params = {"q": q, "nocache": "1"}
            for k, v in ctx.items():
                if v is not None and v != "":
                    params[k] = str(v)
            url = f"{BASE}/api/lookup?{urllib.parse.urlencode(params)}"
            req = urllib.request.Request(url, headers=headers, method="GET")
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            status = resp.status
            raw = resp.read().decode("utf-8", errors="replace")
            try:
                data = json.loads(raw)
            except Exception:
                data = None
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            raw = e.read().decode("utf-8", errors="replace")
            data = json.loads(raw)
        except Exception:
            raw = ""
            data = None
        if status != 200:
            err = f"HTTPError {status}"
    except Exception as e:
        err = str(e)
    return {"status": status, "raw": raw, "data": data, "err": err, "ms": int((time.time()-t0)*1000)}

def expected_label(c):
    e = c["expected"]
    parts = [f"ui∈[{'|'.join(e.get('uiState') or [])}]"]
    if e.get("qid"): parts.append(f"qid={e['qid']}")
    if e.get("faces") is True: parts.append("faces")
    if e.get("faces") is False: parts.append("0 faces")
    if e.get("must_not"): parts.append("must_not=" + ",".join(e["must_not"]))
    return " · ".join(parts)

def judge(c, snap):
    fails, notes = [], []
    pretty_wrong = False
    if snap["err"] and snap["status"] != 200:
        # still try to judge if we have data
        if not snap["data"]:
            fails.append(f"network: {snap['err']}")
            return False, fails, notes, pretty_wrong
    if snap["status"] == 429:
        fails.append("http 429"); return False, fails, notes, pretty_wrong
    if snap["status"] != 200:
        fails.append(f"http {snap['status']}"); return False, fails, notes, pretty_wrong
    d = snap["data"]
    if not d:
        fails.append("bad json"); return False, fails, notes, pretty_wrong
    exp = c["expected"]
    ui_states = exp.get("uiState") or []
    ui = d.get("uiState") or ""
    faces = has_faces(d)
    qid = d.get("qid")
    raw = snap["raw"] or ""
    if ui_states and ui not in ui_states:
        fails.append(f"uiState={ui} expected {'|'.join(ui_states)}")
    if exp.get("qid") is not None:
        if qid != exp["qid"]:
            fails.append(f"qid={qid} expected {exp['qid']}")
    if exp.get("faces") is True and not faces:
        fails.append("faces expected")
    if exp.get("faces") is False and faces:
        fails.append("faces must be 0")
    must_not = exp.get("must_not") or []
    if "dossier+faces" in must_not and ui == "dossier" and faces:
        fails.append("pretty-wrong: dossier+faces"); pretty_wrong = True
    if "fake_dossier" in must_not and ui == "dossier":
        fails.append("fake dossier on unknown/garbage/ambiguous"); pretty_wrong = True
    if "email_leak" in must_not:
        email = (c.get("input", {}).get("ctx") or {}).get("email") or FAKE_EMAIL
        if email in raw:
            fails.append("email leaked in response")
    if "qid_when_unknown" in must_not and qid:
        fails.append(f"qid fabricated={qid}"); pretty_wrong = True
    if "faces" in must_not and faces:
        fails.append("faces not allowed")
    if d.get("phase") and d.get("phase") != PHASE:
        notes.append(f"phase={d.get('phase')} (expected {PHASE})")
    return len(fails) == 0, fails, notes, pretty_wrong

def classify_error(c, snap, fails, pretty_wrong):
    if not fails: return None
    ui = (snap.get("data") or {}).get("uiState") or ""
    exp_ui = c["expected"].get("uiState") or []
    wants_dossier = exp_ui == ["dossier"]
    forbids_df = "dossier+faces" in (c["expected"].get("must_not") or [])
    forbids_fake = "fake_dossier" in (c["expected"].get("must_not") or [])
    if pretty_wrong: return "PRETTY-WRONG"
    if snap.get("err") and snap.get("status") != 200: return "OTHER"
    if wants_dossier and ui != "dossier":
        if ui in ("need_context", "thin", "candidates"): return "OVER-GATE"
        return "FN"
    if (forbids_df or forbids_fake) and ui == "dossier":
        if has_faces(snap.get("data")): return "PRETTY-WRONG"
        return "FP"
    if c.get("category") == "unknown" and ui == "dossier": return "UNKNOWN"
    if c.get("category") == "ambiguous" and ui == "dossier": return "AMBIGUOUS"
    if c.get("category") == "conflict" and ui == "dossier": return "CONFLICT"
    if c["expected"].get("qid") and (snap.get("data") or {}).get("qid") and (snap.get("data") or {}).get("qid") != c["expected"]["qid"]:
        return "FP"
    if not wants_dossier and ui == "dossier": return "FP"
    if wants_dossier and ui != "dossier": return "FN"
    return "OTHER"

def classify_confusion(c, snap, passed):
    exp_ui = c["expected"].get("uiState") or []
    wants_pos = exp_ui == ["dossier"] and c["expected"].get("qid") is not None
    got_pos = (snap.get("data") or {}).get("uiState") == "dossier"
    if wants_pos and got_pos and passed: return "TP"
    if wants_pos and got_pos and not passed: return "FP"
    if wants_pos and not got_pos: return "FN"
    if not wants_pos and not got_pos and passed: return "TN"
    if not wants_pos and got_pos: return "FP"
    if not wants_pos and not got_pos and not passed: return "TN"
    return None

def main():
    aset = json.loads(CASE_SET.read_text(encoding="utf-8"))
    cases = []
    for c in aset["cases"]:
        cc = dict(c)
        cc["method"] = "POST" if c["input"].get("ctx") else "GET"
        cc["smoke"] = False
        cc["expectedLabel"] = expected_label(c)
        cases.append(cc)
    smoke_ibm = {
        "id": "smoke-smith-ibm-ny",
        "category": "conflict",
        "subset": "smoke",
        "input": {"q": "John Smith", "ctx": {"org": "IBM", "city": "New York", "country": "US"}},
        "expected": {
            "uiState": ["candidates", "need_context", "thin"],
            "faces": False,
            "qid": None,
            "must_not": ["dossier+faces", "fake_dossier"],
        },
        "errorTypesIfFail": ["pretty_wrong", "over_commit"],
        "notes": "Forced smoke: John Smith + IBM + NY → NOT dossier+faces",
        "method": "POST",
        "smoke": True,
    }
    smoke_ibm["expectedLabel"] = expected_label(smoke_ibm)
    cases.append(smoke_ibm)

    log(f"ACCURACY EVAL P1-HTTP דיוק → {BASE}")
    log(f"deploy: {DEPLOY}")
    log(f"caseSet: {CASE_SET.name} n={aset['meta']['n']} + smokeIbm → {len(cases)}")
    log(f"concurrency={CONCURRENCY} timeout={TIMEOUT}s Origin={ORIGIN}")
    log("")

    results = [None] * len(cases)

    def run_one(i_c):
        i, c = i_c
        log(f"→ {c['id']} [{c['category']}/{c['subset']}] {c['method']} q={c['input']['q']}")
        snap = call_lookup(c["method"], c["input"]["q"], c["input"].get("ctx") or {})
        passed, fails, notes, pretty_wrong = judge(c, snap)
        d = snap["data"]
        faces = has_faces(d)
        error_type = classify_error(c, snap, fails, pretty_wrong)
        confusion = classify_confusion(c, snap, passed)
        row = {
            "id": c["id"],
            "category": c["category"],
            "subset": c["subset"],
            "smoke": bool(c.get("smoke")),
            "method": c["method"],
            "input": c["input"],
            "expectedLabel": c["expectedLabel"],
            "expected": {
                "uiState": c["expected"].get("uiState"),
                "qid": c["expected"].get("qid"),
                "faces": c["expected"].get("faces"),
                "must_not": c["expected"].get("must_not") or [],
            },
            "pass": passed,
            "prettyWrong": pretty_wrong,
            "errorType": error_type,
            "confusion": confusion,
            "fails": fails,
            "notes": notes,
            "http": snap["status"],
            "ms": snap["ms"],
            "err": snap["err"],
            "actual": {
                "uiState": (d or {}).get("uiState"),
                "mode": (d or {}).get("mode"),
                "qid": (d or {}).get("qid"),
                "photo": bool((d or {}).get("photo")),
                "images": len((d or {}).get("images") or []),
                "faces": faces,
                "sources": len((d or {}).get("sources") or []),
                "candidates": len((d or {}).get("candidates") or []),
                "scenario": (d or {}).get("scenario"),
                "confidence": (d or {}).get("confidence"),
                "phase": (d or {}).get("phase"),
                "thin": bool((d or {}).get("thin")),
                "ambiguous": bool((d or {}).get("ambiguous")),
                "messageKey": (d or {}).get("messageKey"),
                "label": (d or {}).get("label"),
            },
            "confidence": (d or {}).get("confidence"),
            "evidence": evidence_brief(d),
        }
        tag = "PASS" if passed else ("FAIL/PRETTY-WRONG" if pretty_wrong else f"FAIL/{error_type or 'OTHER'}")
        log(f"← {tag} {c['id']} {snap['ms']}ms http={snap['status']} ui={row['actual']['uiState']} qid={row['actual']['qid'] or '-'} faces={faces} conf={row['confidence'] or '-'} phase={row['actual']['phase'] or '-'}" + (f" | {'; '.join(fails)}" if fails else ""))
        time.sleep(0.4)
        return i, row

    t0 = time.time()
    with ThreadPoolExecutor(max_workers=CONCURRENCY) as ex:
        futs = [ex.submit(run_one, (i, c)) for i, c in enumerate(cases)]
        for fut in as_completed(futs):
            i, row = fut.result()
            results[i] = row
    elapsed_ms = int((time.time() - t0) * 1000)
    rows = results

    passed_n = sum(1 for r in rows if r["pass"])
    failed_n = sum(1 for r in rows if not r["pass"])
    pretty_wrong_hits = [r for r in rows if r["prettyWrong"]]
    phase_ok = all((not r["actual"]["phase"]) or r["actual"]["phase"] == PHASE for r in rows)
    when_iso = datetime.now(timezone.utc).isoformat()
    when_local = datetime.now(ZoneInfo("Asia/Jerusalem")).strftime("%-d.%-m.%Y, %H:%M:%S") + " Asia/Jerusalem"

    by_cat = {}
    for r in rows:
        k = r["category"]
        by_cat.setdefault(k, {"n": 0, "pass": 0, "fail": 0})
        by_cat[k]["n"] += 1
        if r["pass"]: by_cat[k]["pass"] += 1
        else: by_cat[k]["fail"] += 1

    error_type_counts = {}
    for r in rows:
        if not r["pass"]:
            t = r["errorType"] or "OTHER"
            error_type_counts[t] = error_type_counts.get(t, 0) + 1

    confusion = {"TP": 0, "FP": 0, "TN": 0, "FN": 0}
    for r in rows:
        if r["confusion"] in confusion:
            confusion[r["confusion"]] += 1

    over_gate = sum(1 for r in rows if r["errorType"] == "OVER-GATE")
    pretty_wrong_n = len(pretty_wrong_hits)

    smoke_ids = [
        "reg-netanyahu-bare", "reg-bibi-netanyahu", "reg-zehava-galon", "reg-angela-merkel",
        "ambiguous-danny-cohen", "duplicate-john-smith-bare", "conflict-smith-email", "smoke-smith-ibm-ny",
    ]
    by_id = {r["id"]: r for r in rows}
    smoke_rows = [by_id[i] for i in smoke_ids if i in by_id]
    regression_rows = [r for r in rows if r["subset"] == "regression"]
    keep_ids = {"ambiguous-danny-cohen", "duplicate-john-smith-bare", "conflict-smith-email", "smoke-smith-ibm-ny", "conflict-smith-microsoft-seattle"}
    keep_safety = [r for r in rows if r["id"] in keep_ids]
    reg_fail = [r for r in regression_rows if not r["pass"]]
    keep_fail = [r for r in keep_safety if not r["pass"]]

    recommendation = "GO"
    reasons = []
    if pretty_wrong_n > 0:
        recommendation = "NO-GO"; reasons.append(f"pretty-wrong={pretty_wrong_n}")
    if reg_fail:
        recommendation = "NO-GO"; reasons.append("regression FAIL " + ",".join(r["id"] for r in reg_fail))
    if keep_fail:
        recommendation = "NO-GO"; reasons.append("KEEP safety FAIL " + ",".join(r["id"] for r in keep_fail))
    if not phase_ok:
        recommendation = "NO-GO"; reasons.append("phase mismatch")
    if recommendation == "GO" and failed_n > 0:
        reasons.append(f"{failed_n} non-critical FAIL(s) — GO with caveats")
    if recommendation == "GO" and failed_n == 0:
        reasons.append("all cases PASS")

    report = {
        "meta": {
            "id": "ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09",
            "agent": "דיוק",
            "role": "Accuracy",
            "when": when_iso,
            "whenLocal": when_local,
            "deploy": DEPLOY,
            "base": BASE,
            "origin": ORIGIN,
            "phaseExpected": PHASE,
            "phaseOk": phase_ok,
            "caseSet": CASE_SET.name,
            "nCaseSet": aset["meta"]["n"],
            "nRun": len(rows),
            "skipped": [],
            "concurrency": CONCURRENCY,
            "timeoutMs": TIMEOUT * 1000,
            "elapsedMs": elapsed_ms,
            "recommendation": recommendation,
            "recommendationReasons": reasons,
        },
        "summary": {
            "N": len(rows),
            "PASS": passed_n,
            "FAIL": failed_n,
            "TP": confusion["TP"],
            "FP": confusion["FP"],
            "TN": confusion["TN"],
            "FN": confusion["FN"],
            "OVER_GATE": over_gate,
            "PRETTY_WRONG": pretty_wrong_n,
            "byCategory": by_cat,
            "errorTypeCounts": error_type_counts,
            "regression": {"n": len(regression_rows), "pass": sum(1 for r in regression_rows if r["pass"]), "fail": [r["id"] for r in reg_fail]},
            "keepSafety": {"n": len(keep_safety), "pass": sum(1 for r in keep_safety if r["pass"]), "fail": [r["id"] for r in keep_fail]},
            "forcedSmoke": [{"id": r["id"], "pass": r["pass"], "ui": r["actual"]["uiState"], "qid": r["actual"]["qid"], "faces": r["actual"]["faces"], "errorType": r["errorType"]} for r in smoke_rows],
        },
        "rows": rows,
    }
    OUT_JSON.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    def esc(s):
        return str(s if s is not None else "").replace("|", "\\|").replace("\n", " ")

    md = []
    md.append("# ACCURACY_EVAL · P1 HTTP · דיוק · 2026-09-09\n")
    md.append(f"**Agent:** Accuracy (דיוק)  ")
    md.append(f"**Live alias:** {BASE}  ")
    md.append(f"**Deploy:** `{DEPLOY}`  ")
    md.append(f"**When:** {when_local}  ")
    md.append(f"**Phase expected:** {PHASE} · **phaseOk:** {phase_ok}  ")
    md.append(f"**Case set:** `{CASE_SET.name}` (N={aset['meta']['n']}) + forced smoke IBM+NY → **N={len(rows)}** run  ")
    md.append(f"**Skipped:** none — ALL cases run  ")
    md.append("**Rules:** public sources only · no Sync.me/Truecaller · no product code change · UNKNOWN stays UNKNOWN · no threshold lowering  ")
    md.append(f"**Method:** GET simple q · POST JSON for ctx · Origin={ORIGIN} · nocache=1 · timeout=65s · concurrency={CONCURRENCY}  ")
    md.append(f"**Elapsed:** {elapsed_ms/1000:.1f}s\n")
    md.append("## Summary metrics\n")
    md.append("| Metric | Value |")
    md.append("|--------|-------|")
    md.append(f"| N | {len(rows)} |")
    md.append(f"| PASS | {passed_n} |")
    md.append(f"| FAIL | {failed_n} |")
    md.append(f"| TP | {confusion['TP']} |")
    md.append(f"| FP | {confusion['FP']} |")
    md.append(f"| TN | {confusion['TN']} |")
    md.append(f"| FN | {confusion['FN']} |")
    md.append(f"| OVER-GATE | {over_gate} |")
    md.append(f"| PRETTY-WRONG | {pretty_wrong_n} |")
    md.append(f"| Regression 4 | {sum(1 for r in regression_rows if r['pass'])}/{len(regression_rows)} |")
    md.append(f"| KEEP safety | {sum(1 for r in keep_safety if r['pass'])}/{len(keep_safety)} |")
    md.append(f"| Recommendation | **{recommendation}** |\n")
    md.append(f"**Recommendation evidence:** {'; '.join(reasons) or '—'}\n")
    md.append("### By category\n")
    md.append("| Category | N | PASS | FAIL |")
    md.append("|----------|---|------|------|")
    for k in sorted(by_cat):
        v = by_cat[k]
        md.append(f"| {k} | {v['n']} | {v['pass']} | {v['fail']} |")
    md.append("\n### Error type counts (FAIL only)\n")
    if not error_type_counts:
        md.append("None.")
    else:
        md.append("| Error type | Count |")
        md.append("|------------|-------|")
        for k, v in sorted(error_type_counts.items(), key=lambda x: -x[1]):
            md.append(f"| {k} | {v} |")
    md.append("\n## Forced smoke checks\n")
    md.append("| Case | Expected | Actual | Conf | Status | Error |")
    md.append("|------|----------|--------|------|--------|-------|")
    for r in smoke_rows:
        act = f"ui={r['actual']['uiState']}; qid={r['actual']['qid'] or '-'}; faces={r['actual']['faces']}"
        md.append(f"| {esc(r['id'])} | {esc(r['expectedLabel'])} | {esc(act)} | {esc(r['confidence'])} | {'PASS' if r['pass'] else 'FAIL'} | {r['errorType'] or '—'} |")
    md.append("\n## Cases table\n")
    md.append("| # | Cat | Subset | Input | Expected | Actual | Conf | Evidence | ms | Status | Error |")
    md.append("|---|-----|--------|-------|----------|--------|------|----------|----|--------|-------|")
    for i, r in enumerate(rows, 1):
        act = f"ui={r['actual']['uiState']} mode={r['actual']['mode']} qid={r['actual']['qid'] or '-'} faces={r['actual']['faces']} img={r['actual']['images']} src={r['actual']['sources']} scen={r['actual']['scenario']} phase={r['actual']['phase']}"
        st = "PASS" if r["pass"] else ("FAIL/PW" if r["prettyWrong"] else "FAIL")
        md.append(f"| {i} | {r['category']} | {r['subset']} | {esc(json.dumps(r['input'], ensure_ascii=False))} | {esc(r['expectedLabel'])} | {esc(act)} | {esc(r['confidence'])} | {esc(r['evidence'][:100])} | {r['ms']} | **{st}** | {r['errorType'] or '—'} |")
    md.append("\n## Detail per case\n")
    for r in rows:
        md.append(f"### {r['id']} [{r['category']}/{r['subset']}] — {'PASS' if r['pass'] else 'FAIL'}{' · PRETTY-WRONG' if r['prettyWrong'] else ''}\n")
        md.append(f"- **INPUT:** `{esc(json.dumps(r['input'], ensure_ascii=False))}` ({r['method']})")
        md.append(f"- **EXPECTED:** {esc(r['expectedLabel'])}")
        a = r["actual"]
        md.append(f"- **ACTUAL:** uiState={a['uiState']} mode={a['mode']} qid={a['qid']} photo={a['photo']} images={a['images']} faces={a['faces']} sources={a['sources']} scenario={a['scenario']} confidence={r['confidence']} phase={a['phase']} messageKey={a['messageKey']} ms={r['ms']}")
        md.append(f"- **CONFIDENCE:** {r['confidence']}")
        md.append(f"- **EVIDENCE:** {esc(r['evidence'])}")
        md.append(f"- **PASS/FAIL:** {'PASS' if r['pass'] else 'FAIL'}" + (f" — {'; '.join(r['fails'])}" if r['fails'] else ""))
        md.append(f"- **ERROR TYPE:** {r['errorType'] or '—'}")
        md.append(f"- **CONFUSION:** {r['confusion'] or '—'}")
        if r["notes"]:
            md.append(f"- **NOTES:** {'; '.join(r['notes'])}")
        md.append("")
    md.append("## Pretty-wrong verdict\n")
    if pretty_wrong_n == 0:
        md.append("**CLEAR** — no dossier+faces on conflict/garbage/unknown/ambiguous traps.")
    else:
        md.append(f"**HIT** — {pretty_wrong_n} case(s):")
        for r in pretty_wrong_hits:
            md.append(f"- {r['id']}: ui={r['actual']['uiState']} qid={r['actual']['qid']} faces={r['actual']['faces']} — {'; '.join(r['fails'])}")
    md.append("\n## Recommendation\n")
    md.append(f"**{recommendation}** from Accuracy (דיוק) with evidence: {'; '.join(reasons)}.\n")
    md.append("## Room summary (HE · 4 sentences)\n")
    he_fail = [r["id"] for r in rows if not r["pass"]]
    s1 = f"רצנו הערכת דיוק חיה (HTTP) מול האליאס אחרי P1 (`{DEPLOY}`) — {len(rows)} מקרים מתוך סט v2 (34) פלוס סמוק IBM+NY, ללא דילוגים. "
    s2 = f"תוצאה: {passed_n} PASS / {failed_n} FAIL; pretty-wrong={pretty_wrong_n}; OVER-GATE={over_gate}; TP/FP/TN/FN={confusion['TP']}/{confusion['FP']}/{confusion['TN']}/{confusion['FN']}; phase={'orchestrator-v0-b מאומת' if phase_ok else 'חריגה'}. "
    if not reg_fail and not keep_fail:
        s3 = "רגרסיות P1 (נתניהו/ביבי/Zehava/Merkel) ו-KEEP בטיחות (דני כהן, John Smith, אימייל, IBM+NY): כולן PASS. "
    else:
        s3 = "רגרסיות/KEEP נכשלו ב-" + ", ".join(r["id"] for r in reg_fail + keep_fail) + ". "
    s4 = f"המלצת Accuracy: **{recommendation}**" + (f" (כשלים: {', '.join(he_fail)})" if he_fail else "") + "; דוחות: ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09.md/.json + ACCURACY_REPORT.md.\n"
    md.append(s1 + s2 + s3 + s4)
    # fix double-escaped newlines in join — write properly
    # Rewrite MD file properly without escape mess
    lines = []
    def W(x=""): lines.append(x)
    W("# ACCURACY_EVAL · P1 HTTP · דיוק · 2026-09-09")
    W()
    W(f"**Agent:** Accuracy (דיוק)  ")
    W(f"**Live alias:** {BASE}  ")
    W(f"**Deploy:** `{DEPLOY}`  ")
    W(f"**When:** {when_local}  ")
    W(f"**Phase expected:** {PHASE} · **phaseOk:** {phase_ok}  ")
    W(f"**Case set:** `{CASE_SET.name}` (N={aset['meta']['n']}) + forced smoke IBM+NY → **N={len(rows)}** run  ")
    W("**Skipped:** none — ALL cases run  ")
    W("**Rules:** public sources only · no Sync.me/Truecaller · no product code change · UNKNOWN stays UNKNOWN · no threshold lowering  ")
    W(f"**Method:** GET simple q · POST JSON for ctx · Origin={ORIGIN} · nocache=1 · timeout=65s · concurrency={CONCURRENCY}  ")
    W(f"**Elapsed:** {elapsed_ms/1000:.1f}s")
    W()
    W("## Summary metrics")
    W()
    W("| Metric | Value |")
    W("|--------|-------|")
    W(f"| N | {len(rows)} |")
    W(f"| PASS | {passed_n} |")
    W(f"| FAIL | {failed_n} |")
    W(f"| TP | {confusion['TP']} |")
    W(f"| FP | {confusion['FP']} |")
    W(f"| TN | {confusion['TN']} |")
    W(f"| FN | {confusion['FN']} |")
    W(f"| OVER-GATE | {over_gate} |")
    W(f"| PRETTY-WRONG | {pretty_wrong_n} |")
    W(f"| Regression 4 | {sum(1 for r in regression_rows if r['pass'])}/{len(regression_rows)} |")
    W(f"| KEEP safety | {sum(1 for r in keep_safety if r['pass'])}/{len(keep_safety)} |")
    W(f"| Recommendation | **{recommendation}** |")
    W()
    W(f"**Recommendation evidence:** {'; '.join(reasons) or '—'}")
    W()
    W("### By category")
    W()
    W("| Category | N | PASS | FAIL |")
    W("|----------|---|------|------|")
    for k in sorted(by_cat):
        v = by_cat[k]; W(f"| {k} | {v['n']} | {v['pass']} | {v['fail']} |")
    W()
    W("### Error type counts (FAIL only)")
    W()
    if not error_type_counts:
        W("None.")
    else:
        W("| Error type | Count |"); W("|------------|-------|")
        for k, v in sorted(error_type_counts.items(), key=lambda x: -x[1]):
            W(f"| {k} | {v} |")
    W()
    W("## Forced smoke checks")
    W()
    W("| Case | Expected | Actual | Conf | Status | Error |")
    W("|------|----------|--------|------|--------|-------|")
    for r in smoke_rows:
        act = f"ui={r['actual']['uiState']}; qid={r['actual']['qid'] or '-'}; faces={r['actual']['faces']}"
        W(f"| {esc(r['id'])} | {esc(r['expectedLabel'])} | {esc(act)} | {esc(r['confidence'])} | {'PASS' if r['pass'] else 'FAIL'} | {r['errorType'] or '—'} |")
    W()
    W("## Cases table")
    W()
    W("| # | Cat | Subset | Input | Expected | Actual | Conf | Evidence | ms | Status | Error |")
    W("|---|-----|--------|-------|----------|--------|------|----------|----|--------|-------|")
    for i, r in enumerate(rows, 1):
        act = f"ui={r['actual']['uiState']} mode={r['actual']['mode']} qid={r['actual']['qid'] or '-'} faces={r['actual']['faces']} img={r['actual']['images']} src={r['actual']['sources']} scen={r['actual']['scenario']} phase={r['actual']['phase']}"
        st = "PASS" if r["pass"] else ("FAIL/PW" if r["prettyWrong"] else "FAIL")
        W(f"| {i} | {r['category']} | {r['subset']} | {esc(json.dumps(r['input'], ensure_ascii=False))} | {esc(r['expectedLabel'])} | {esc(act)} | {esc(r['confidence'])} | {esc((r['evidence'] or '')[:100])} | {r['ms']} | **{st}** | {r['errorType'] or '—'} |")
    W()
    W("## Detail per case")
    W()
    for r in rows:
        W(f"### {r['id']} [{r['category']}/{r['subset']}] — {'PASS' if r['pass'] else 'FAIL'}{' · PRETTY-WRONG' if r['prettyWrong'] else ''}")
        W()
        W(f"- **INPUT:** `{esc(json.dumps(r['input'], ensure_ascii=False))}` ({r['method']})")
        W(f"- **EXPECTED:** {esc(r['expectedLabel'])}")
        a = r["actual"]
        W(f"- **ACTUAL:** uiState={a['uiState']} mode={a['mode']} qid={a['qid']} photo={a['photo']} images={a['images']} faces={a['faces']} sources={a['sources']} scenario={a['scenario']} confidence={r['confidence']} phase={a['phase']} messageKey={a['messageKey']} ms={r['ms']}")
        W(f"- **CONFIDENCE:** {r['confidence']}")
        W(f"- **EVIDENCE:** {esc(r['evidence'])}")
        W(f"- **PASS/FAIL:** {'PASS' if r['pass'] else 'FAIL'}" + (f" — {'; '.join(r['fails'])}" if r['fails'] else ""))
        W(f"- **ERROR TYPE:** {r['errorType'] or '—'}")
        W(f"- **CONFUSION:** {r['confusion'] or '—'}")
        if r["notes"]:
            W(f"- **NOTES:** {'; '.join(r['notes'])}")
        W()
    W("## Pretty-wrong verdict")
    W()
    if pretty_wrong_n == 0:
        W("**CLEAR** — no dossier+faces on conflict/garbage/unknown/ambiguous traps.")
    else:
        W(f"**HIT** — {pretty_wrong_n} case(s):")
        for r in pretty_wrong_hits:
            W(f"- {r['id']}: ui={r['actual']['uiState']} qid={r['actual']['qid']} faces={r['actual']['faces']} — {'; '.join(r['fails'])}")
    W()
    W("## Recommendation")
    W()
    W(f"**{recommendation}** from Accuracy (דיוק) with evidence: {'; '.join(reasons)}.")
    W()
    W("## Room summary (HE · 4 sentences)")
    W()
    W(s1 + s2 + s3 + s4)
    OUT_MD.write_text("\n".join(lines) + "\n", encoding="utf-8")

    # ACCURACY_REPORT
    rep = []
    rep.append("# ACCURACY_REPORT")
    rep.append("")
    rep.append("**Latest eval:** ACCURACY_EVAL-P1-HTTP-דיוק-2026-09-09  ")
    rep.append(f"**When:** {when_local}  ")
    rep.append(f"**Base:** {BASE} · deploy `{DEPLOY}` · phase {PHASE} · phaseOk={phase_ok}  ")
    rep.append(f"**Totals:** N={len(rows)} · PASS={passed_n} · FAIL={failed_n} · pretty-wrong={pretty_wrong_n} · OVER-GATE={over_gate}  ")
    rep.append(f"**Confusion:** TP={confusion['TP']} FP={confusion['FP']} TN={confusion['TN']} FN={confusion['FN']}  ")
    rep.append(f"**Recommendation:** **{recommendation}** — {'; '.join(reasons)}")
    rep.append("")
    rep.append("| Case | Cat | Expected | Actual | Confidence | Status | Error |")
    rep.append("|------|-----|----------|--------|------------|--------|-------|")
    for r in rows:
        act = f"ui={r['actual']['uiState']}; qid={r['actual']['qid'] or '-'}; faces={r['actual']['faces']}; src={r['actual']['sources']}"
        st = "PASS" if r["pass"] else ("FAIL/PW" if r["prettyWrong"] else "FAIL")
        rep.append(f"| {esc(r['id'])} | {esc(r['category'])} | {esc(r['expectedLabel'])} | {esc(act)} | {esc(r['confidence'])} | {st} | {r['errorType'] or '—'} |")
    rep.append("")
    rep.append("## By category")
    rep.append("")
    rep.append("| Category | N | PASS | FAIL |")
    rep.append("|----------|---|------|------|")
    for k in sorted(by_cat):
        v = by_cat[k]; rep.append(f"| {k} | {v['n']} | {v['pass']} | {v['fail']} |")
    rep.append("")
    rep.append("## Pretty-wrong")
    rep.append("None — CLEAR." if pretty_wrong_n == 0 else "\n".join(f"- {r['id']}" for r in pretty_wrong_hits))
    rep.append("")
    rep.append("## Prior eval")
    rep.append("Previous: ACCURACY_EVAL-דיוק-2026-09-09 (N=16, PASS=12, FAIL=4, pretty-wrong=0) on dpl_9V8i — P1 targets those 4 over-gate/recall FAILs.")
    rep.append("")
    OUT_REPORT.write_text("\n".join(rep) + "\n", encoding="utf-8")
    OUT_LOG.write_text("\n".join(logs) + "\n", encoding="utf-8")

    log("")
    log("========== SUMMARY ==========")
    log(f"N={len(rows)} PASS={passed_n} FAIL={failed_n} pretty-wrong={pretty_wrong_n} OVER-GATE={over_gate}")
    log(f"TP={confusion['TP']} FP={confusion['FP']} TN={confusion['TN']} FN={confusion['FN']}")
    log(f"phaseOk={phase_ok} recommendation={recommendation}")
    log(f"elapsed={elapsed_ms/1000:.1f}s")
    log(f"md: {OUT_MD}")
    log(f"json: {OUT_JSON}")
    log(f"report: {OUT_REPORT}")
    for r in rows:
        log(f"  {'✓' if r['pass'] else '✗'} {r['id']} ui={r['actual']['uiState']} qid={r['actual']['qid'] or '-'} faces={r['actual']['faces']}" + (f" :: {'; '.join(r['fails'])}" if r['fails'] else ""))
    log("=============================")
    return 0 if failed_n == 0 else 1

if __name__ == "__main__":
    raise SystemExit(main())
