"""Entry point: python pages_main.py -> writes pages/{slug}.md for all tools and validates links/wording."""
import csv, re, sys
sys.path.insert(0, __import__("os").path.dirname(__file__))
from gen_pages import *  # noqa: F401,F403  (defines P, helpers, first three pages)
import gen_pages as G
for _p in ("pages_part2.py", "pages_part3.py"):
    exec((G.ROOT / _p).read_text(encoding="utf-8"), G.__dict__)

URLS = {r["url_slug"] for r in csv.DictReader(open(G.ROOT.parent / "data" / "processed" / "url_map.csv", encoding="utf-8"))}

def validate(md):
    bad = []
    for u in re.findall(r"\]\((https://homeinspectoratlas\.com[^)]*)\)", md):
        path = u[len(G.S):]
        if path not in URLS: bad.append(path)
    low = md.lower()
    for w in ("vetted", "guaranteed", "#1", " best ", "certified inspector"):
        if w in low: bad.append("WORD:" + w)
    if "<" in re.sub(r"<\?|<=|< \d|<\d", "", md): bad.append("RAW_HTML?")
    return bad

if __name__ == "__main__":
    for slug, md in G.P.items():
        (G.ROOT / "pages" / f"{slug}.md").write_text(md.strip() + "\n", encoding="utf-8")
        print(f"{slug:40s} {len(md.split()):5d} words  faqs={md.count('::: faq')}  bad={validate(md)}")
