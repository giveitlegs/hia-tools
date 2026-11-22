"""Create/update the tool pages on Directify (directory 5775) as unlisted custom pages, via curl
(python-requests is blocked by Cloudflare on directify.app). Title/meta/H1 come from data/processed/url_map.csv.
python publish_pages.py [--list] [slug ...]"""
import csv, json, os, subprocess, sys, tempfile, time, pathlib
sys.path.insert(0, r"C:\Users\givei\Dropbox\PERS\CLAUDECODE\HOME.INSPECTION\scripts")
import envload
KEY = envload.load().get("directify_API", "")
DIR = 5775
ROOT = pathlib.Path(__file__).parent
API = f"https://directify.app/api/directories/{DIR}/pages"
VERSION = "v1.1.1"
CDN = f"https://cdn.jsdelivr.net/gh/giveitlegs/hia-tools@{VERSION}/dist/"
# Tools added after v1.0.0 are not in the custom-code loader (#1405). Directify markdown escapes <script>, so these pages
# carry their own mount point + a 1px data-GIF whose onload attaches the bundle. If the loader map is ever extended
# with these slugs, the mount div is reused (core.mount finds #hia-tool) and the loader's own check skips a second mount.
BOOT = {  # slug: (bundle, min-height px)
    "home-inspection-form": ("form", 1500),
    "home-inspection-contract": ("contract", 1500),
    "home-inspection-invoice-template": ("invoice", 1300),
    "home-inspector-website-template": ("website", 1300),
}
GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

def boot_img(bundle, tag):
    js = (f"var s=document.createElement('script');s.src='{CDN}{bundle}';s.async=true;"
          f"s.setAttribute('data-hia-boot','{tag}');document.body.appendChild(s);this.remove()")
    return f'<img src="{GIF}" alt="" width="1" height="1" style="position:absolute;width:1px;height:1px;opacity:0" onload="{js}">'

def with_boot(slug, md):
    """Insert the widget mount + bootstrap after the first paragraph under the H1 (where the loader puts widgets)."""
    if slug not in BOOT: return md
    bundle, h = BOOT[slug]
    snip = f'<div id="hia-tool" class="hia-tool not-prose" style="min-height:{h}px"></div>{boot_img(bundle + ".js", bundle)}'
    parts = md.split(chr(10) * 2)
    i = next(n for n, p in enumerate(parts) if p.startswith("# ")) + 2
    return (chr(10) * 2).join(parts[:i] + [snip] + parts[i:])

def existing():
    out, page = {}, 1
    while True:
        c, d = curl("GET", f"{API}?page={page}")
        for p in d.get("data", []): out[p["slug"]] = p["id"]
        if not d.get("links", {}).get("next") and page >= d.get("meta", {}).get("last_page", page): break
        page += 1
    return out

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
        if r["page_type"] == "tool": m[r["url_slug"].strip("/").split("/")[-1]] = r
    return m

if __name__ == "__main__":
    if "--list" in sys.argv:
        c, d = curl("GET", API)
        print(c); [print(p["id"], p["slug"], p["placement"], p["is_published"], p["page_url"]) for p in d.get("data", [])]
        sys.exit()
    R = rows(); want = sys.argv[1:] or list(R)
    pub = ROOT / "pages" / "published.json"
    out = json.loads(pub.read_text(encoding="utf-8")) if pub.exists() else {}
    have = existing()
    for slug in want:
        r = R[slug]
        md = with_boot(slug, (ROOT / "pages" / f"{slug}.md").read_text(encoding="utf-8"))
        payload = {"title": r["h1"], "slug": slug, "markdown": md, "placement": "unlisted", "is_published": True,
                   "seo": {"title": r["title"], "description": r["meta_description"]}}
        c, d = curl("PUT", f"{API}/{have[slug]}", payload) if slug in have else curl("POST", API, payload)
        if c == 422 and "seo" in json.dumps(d):  # nested SEO rejected: create without, report
            payload.pop("seo"); c, d = curl("POST", API, payload); d["_seo_dropped"] = True
        pg = d.get("data", {})
        out[slug] = {"code": c, "id": pg.get("id"), "url": pg.get("page_url"), "seo": pg.get("seo"), "seo_dropped": d.get("_seo_dropped", False),
                     "err": None if c in (200, 201) else json.dumps(d)[:300]}
        print(slug, out[slug])
    pub.write_text(json.dumps(out, indent=1), encoding="utf-8")
