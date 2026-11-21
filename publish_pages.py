"""Create/update the 11 tool pages on Directify (directory 5775) as unlisted custom pages, via curl
(python-requests is blocked by Cloudflare on directify.app). Title/meta/H1 come from data/processed/url_map.csv.
python publish_pages.py [--list] [slug ...]"""
import csv, json, os, subprocess, sys, tempfile, time, pathlib
sys.path.insert(0, r"C:\Users\givei\Dropbox\PERS\CLAUDECODE\HOME.INSPECTION\scripts")
import envload
KEY = envload.load().get("directify_API", "")
DIR = 5775
ROOT = pathlib.Path(__file__).parent
API = f"https://directify.app/api/directories/{DIR}/pages"

def curl(method, url, payload=None):
    args = ["curl", "-s", "-w", "\n%{http_code}", "-X", method, url, "-H", "Authorization: Bearer " + KEY, "-H", "Accept: application/json"]
    tmp = None
    if payload is not None:
        fd, tmp = tempfile.mkstemp(suffix=".json")
        with os.fdopen(fd, "w", encoding="utf-8") as f: json.dump(payload, f, ensure_ascii=False)
        args += ["-H", "Content-Type: application/json", "--data-binary", "@" + tmp]
    try:
        for attempt in range(5):
            out = subprocess.run(args, capture_output=True, text=True, encoding="utf-8").stdout
            body, _, code = out.rpartition("\n")
            if code.strip() in ("429", "520", "502", "503"):
                time.sleep(2 ** attempt); continue
            try: data = json.loads(body) if body.strip() else {}
            except json.JSONDecodeError: data = {"_raw": body[:300]}
            return int(code) if code.strip().isdigit() else 0, data
        return int(code or 0), {}
    finally:
        if tmp and os.path.exists(tmp): os.remove(tmp)

def rows():
    m = {}
    for r in csv.DictReader(open(ROOT.parent / "data" / "processed" / "url_map.csv", encoding="utf-8")):
        if r["page_type"] == "tool": m[r["url_slug"].strip("/")] = r
    return m

if __name__ == "__main__":
    if "--list" in sys.argv:
        c, d = curl("GET", API)
        print(c); [print(p["id"], p["slug"], p["placement"], p["is_published"], p["page_url"]) for p in d.get("data", [])]
        sys.exit()
    R = rows(); want = sys.argv[1:] or list(R)
    out = {}
    for slug in want:
        r = R[slug]
        md = (ROOT / "pages" / f"{slug}.md").read_text(encoding="utf-8")
        payload = {"title": r["h1"], "slug": slug, "markdown": md, "placement": "unlisted", "is_published": True,
                   "seo": {"title": r["title"], "description": r["meta_description"]}}
        c, d = curl("POST", API, payload)
        if c == 422 and "seo" in json.dumps(d):  # nested SEO rejected: create without, report
            payload.pop("seo"); c, d = curl("POST", API, payload); d["_seo_dropped"] = True
        pg = d.get("data", {})
        out[slug] = {"code": c, "id": pg.get("id"), "url": pg.get("page_url"), "seo": pg.get("seo"), "seo_dropped": d.get("_seo_dropped", False),
                     "err": None if c in (200, 201) else json.dumps(d)[:300]}
        print(slug, out[slug])
    (ROOT / "pages" / "published.json").write_text(json.dumps(out, indent=1), encoding="utf-8")
