"""Build dist/{tool}.js bundles: core.js + core.css + tool.css + tool.js with data/*.json and page FAQs inlined, minified by esbuild.
Usage: python build.py [tool ...]"""
import json, re, subprocess, sys, os, pathlib
ROOT = pathlib.Path(__file__).parent
TOOLS = {  # bundle: (page slug, data files)
    "license":     ("home-inspector-license-requirements", []),
    "cost":        ("home-inspection-cost", ["cost", "states"]),
    "checklist":   ("home-inspection-checklist", ["checklist"]),
    "lending":     ("va-fha-usda-inspection-requirements", ["states"]),
    "salary":      ("home-inspector-salary", ["salary"]),
    "insurance":   ("home-inspector-insurance", ["insurance", "licensing"]),
    "explorer":    ("what-do-home-inspectors-look-for", ["explorer"]),
    "windmit":     ("4-point-wind-mitigation-calculator", ["florida"]),
    "contingency": ("inspection-contingency-calculator", ["contingency"]),
    "repair":      ("repair-request-letter", ["contingency", "repair"]),
    "report":      ("sample-home-inspection-report", ["report"]),
    "form":        ("home-inspection-form", ["form"]),
    "contract":    ("home-inspection-contract", []),
    "invoice":     ("home-inspection-invoice-template", ["cost"]),
    "website":     ("home-inspector-website-template", ["cost"]),
}
HUB = ("hub", "resources")  # src/hub.{css,js} -> dist/resources.{css,js}; no core, markup is server-rendered in the page

def build_hub():
    src, name = HUB
    for ext in ("css", "js"):
        out = ROOT / "dist" / f"{name}.{ext}"
        subprocess.run(f'npx --yes esbuild@0.24.0 "{ROOT / "src" / (src + "." + ext)}" --minify --target=es2017 --charset=utf8 --outfile="{out}" --log-level=warning',
                       shell=True, check=True, cwd=ROOT)
        print(f"{name}.{ext:4s} {out.stat().st_size/1024:6.1f} KB")

def faqs(slug):
    p = ROOT / "pages" / f"{slug}.md"
    if not p.exists(): return []
    md = p.read_text(encoding="utf-8")
    out = []
    for m in re.finditer(r"::: faq\s*\n###\s*(.+?)\n(.*?)\n:::", md, re.S):
        a = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", m.group(2).strip())
        a = re.sub(r"[*_`]", "", a)
        out.append([m.group(1).strip(), " ".join(a.split())])
    return out

def slim(name, d, tool=None):
    """Drop fields the widget never reads, to keep bundles small."""
    if name == "licensing" and tool == "insurance":
        return {"states": [{k: x.get(k) for k in ("code", "name", "slug", "license_required", "insurance")} for x in d["states"]]}
    if name == "licensing":
        keep = ["code", "name", "slug", "license_required", "credential", "regulator", "regulator_url", "prelicense_hours",
                "field_training", "exam", "insurance", "ce", "renewal", "fees", "notes", "source_url"]
        return {"last_checked": d.get("last_checked"), "states": [{k: s.get(k) for k in keep} for s in d["states"]]}
    if name == "lending":
        w = d["wdo"]["VA"]
        full = re.search(r"entire-state requirement in ([A-Z, ]+?) and the territories", w).group(1)
        part = re.search(r"certain counties only in ([A-Z, ]+?) and ([A-Z]{2})", w)
        return {"last_checked": d["last_checked"], "programs": d["programs"], "wdo": d["wdo"], "ws": d["well_septic"], "avi": d["appraisal_vs_inspection"],
                "items": [{k: x[k] for k in ("category", "text", "programs", "common_repair", "applies")} for x in d["items"]],
                "va_wdo_full": [c.strip() for c in full.split(",")], "va_wdo_part": [c.strip() for c in part.group(1).split(",")] + [part.group(2)],
                "sources": d["sources"]}
    if name == "florida":
        fp = d["four_point"]
        return {"last_checked": d["last_checked"], "rev": d["form"]["revision"],
                "q": {q["key"]: {o["code"]: o["credit_note"] for o in q["options"]} for q in d["questions"]},
                "cit": {k: fp["citizens"][k] for k in ("home_age_trigger_years", "form_revision", "roof_rules")},
                "pc": fp["private_carrier_ranges"], "roof": fp["roof_age_rules"][:3],
                "who": d["qualified_inspectors"]["list"], "msfh": {k: d["my_safe_florida_home"].get(k) for k in ("max_grant_usd", "status_as_of_last_checked", "official_url")},
                "sources": d["sources"][:8]}
    if name == "contingency" and tool == "repair":
        return {"forms": [{"code": x["code"], "form": x["form"], "url": x["source_url"]} for x in d["repair_forms"]],
                "names": {x["code"]: x["name"] for x in d["states"]}}
    if name == "contingency":
        return {"last_checked": d["last_checked"], "general": {k: d["general"][k] for k in ("summary", "most_common_days", "typical_range_days")},
                "states": [{k: x.get(k) for k in ("code", "name", "form", "form_version_or_date", "default_days", "day_type", "starts", "response_days", "notes", "source_url")} for x in d["states"]]}
    if name == "insurance":
        return {"last_checked": d["last_checked"], "consensus": d["consensus"],
                "premiums": [{k: x.get(k) for k in ("name", "url", "coverage", "low", "high", "median", "per", "limits", "notes")} for x in d["premiums"]]}
    if name == "cost":
        sa = d["state_adjustment"]
        return {"last_checked": d["last_checked"], "consensus": d["national"]["consensus"],
                "src": [{k: x.get(k) for k in ("name", "url", "low", "high", "average", "year")} for x in d["national"]["sources"]],
                "bands": d["size_bands"], "over": d["above_3000_sqft"]["per_500sqft_over_2000"],
                "types": [{k: x.get(k) for k in ("key", "label", "low", "high", "source")} for x in d["property_types"]],
                "older": [x for x in d["age_foundation"] if x["topic"] == "older_homes" and x.get("low")][0],
                "addons": [{k: x.get(k) for k in ("key", "label", "low", "high", "sources")} for x in d["addons"]],
                "rpp": sa["rpp"], "rpp_year": sa["rpp_year"], "rpp_src": sa["source"]}
    return d

EXTERNAL = ["licensing", "lending"]  # served as dist/{name}.json and fetched at runtime (keeps bundles < 40KB)

def build(tool):
    slug, data = TOOLS[tool]
    js = (ROOT / "src" / f"{tool}.js").read_text(encoding="utf-8")
    for name in data:
        f = ROOT / "data" / f"{name}.json"
        blob = json.dumps(slim(name, json.loads(f.read_text(encoding="utf-8")), tool), separators=(",", ":"), ensure_ascii=False) if f.exists() else "null"
        js = js.replace(f"/*DATA:{name}*/null", blob)
    js = js.replace("/*FAQS*/[]", json.dumps(faqs(slug), ensure_ascii=False))
    css = (ROOT / "src" / "core.css").read_text(encoding="utf-8")
    tcss = ROOT / "src" / f"{tool}.css"
    if tcss.exists(): css += tcss.read_text(encoding="utf-8")
    css = re.sub(r"\s*\n\s*", "", css)
    core = (ROOT / "src" / "core.js").read_text(encoding="utf-8")
    src = "(function(){\n" + core + "\nHIA.css(" + json.dumps(css) + ");\n" + js + "\n})();\n"
    tmp = ROOT / "dist" / f".{tool}.src.js"
    tmp.write_text(src, encoding="utf-8")
    out = ROOT / "dist" / f"{tool}.js"
    subprocess.run(f'npx --yes esbuild@0.24.0 "{tmp}" --minify --target=es2017 --charset=utf8 --outfile="{out}" --log-level=warning',
                   shell=True, check=True, cwd=ROOT)
    tmp.unlink()
    banner = f"/* Inspector Atlas tool: {tool} | homeinspectoratlas.com/{slug}/ | data and sources: github.com/giveitlegs/hia-tools */\n"
    out.write_text(banner + out.read_text(encoding="utf-8"), encoding="utf-8")
    size = out.stat().st_size
    print(f"{tool:12s} {size/1024:6.1f} KB  faqs={len(faqs(slug))}" + ("  OVER 40KB!" if size > 40960 else ""))

def merge_licensing():
    parts = sorted((ROOT / "data").glob("licensing_part*.json"))
    if not parts: return
    st = []
    for p in parts: st += json.loads(p.read_text(encoding="utf-8"))["states"]
    st.sort(key=lambda x: x["name"])
    (ROOT / "data" / "licensing.json").write_text(json.dumps({"last_checked": "2026-11-21", "count": len(st),
        "sources_note": "One record per jurisdiction; source_url is the official regulator, statute or rule page used.", "states": st}, indent=1, ensure_ascii=False), encoding="utf-8")

if __name__ == "__main__":
    merge_licensing()
    for name in EXTERNAL:
        d = slim(name, json.loads((ROOT / "data" / f"{name}.json").read_text(encoding="utf-8")))
        (ROOT / "dist" / f"{name}.json").write_text(json.dumps(d, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
    for t in (sys.argv[1:] or list(TOOLS) + ["hub"]):
        build_hub() if t == "hub" else build(t)
