"""Build + publish the Resources hub (/pages/resources/, Directify page 4202) as an unlisted custom page.
Every card is a server-rendered <a href>. Styling: dist/resources.css via <link>; search/filter + JSON-LD: dist/resources.js.
Directify's markdown keeps inline HTML/SVG and <link>, but escapes <style>/<script>, and custom pages have no head field,
so the script is attached with an <img onload> bootstrap (same pattern as the new tool pages; see publish_pages.BOOT).
python hub_page.py [--publish]"""
import csv, html, json, re, sys, pathlib
ROOT = pathlib.Path(__file__).parent
sys.path.insert(0, str(ROOT))
from publish_pages import curl, API, CDN, boot_img
SITE = "https://homeinspectoratlas.com"
PAGE_ID = 4202

# Custom line icons: 24 grid, 2px stroke, round caps (brand iconography). Paths only; stroke comes from CSS.
I = {
 "cost": '<path d="M3 11 12 4l9 7"/><path d="M5 9.5V20h14V9.5"/><path d="M14 11.6c-.4-.6-1.1-1-2-1-1.2 0-2 .6-2 1.5 0 2 4 1.1 4 3.1 0 .9-.9 1.6-2 1.6-.9 0-1.7-.4-2.1-1"/><path d="M12 9.5v1.1M12 16.8v1"/>',
 "checklist": '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m8.5 10 1.5 1.5L13 8.5"/><path d="M15 10.5h1"/><path d="m8.5 15.5 1.5 1.5 3-3"/><path d="M15 16h1"/>',
 "lookfor": '<path d="M3 11 10 5l7 6"/><path d="M5 9.5V18h6"/><circle cx="16.5" cy="15.5" r="3.5"/><path d="m19 18 2.5 2.5"/>',
 "report": '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M8.5 12.5h7M8.5 16h4"/><circle cx="15.5" cy="16" r=".6"/>',
 "lending": '<path d="M3 9.5 12 4l9 5.5"/><path d="M4 20h16"/><path d="M6 10.5v7M10 10.5v7M14 10.5v7M18 10.5v7"/>',
 "deadline": '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/><path d="M12 12.5v2.5l1.8 1.2"/>',
 "letter": '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/><path d="M15 19l4.5-4.5 1.5 1.5L16.5 20.5H15z"/>',
 "wind": '<path d="M3 13 12 6l9 7"/><path d="M6 11v8h12v-8"/><path d="M2 4h7a2 2 0 1 0-2-2"/><path d="M15 4h4.5a1.8 1.8 0 1 1-1.8 1.8"/>',
 "form": '<rect x="4" y="3.5" width="16" height="17" rx="2"/><rect x="7" y="7" width="3" height="3" rx=".5"/><path d="M12.5 8.5H17"/><rect x="7" y="13" width="3" height="3" rx=".5"/><path d="M12.5 14.5H17"/><path d="m7.6 14.4.9.9 1.4-1.6"/>',
 "contract": '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M8.5 11h7"/><path d="M8 17c1-1.6 1.8-2 2.3-1.4.5.6-.2 1.6.6 1.6.6 0 1-.9 1.6-.9.5 0 .6.7 1.2.7H16"/>',
 "invoice": '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
 "website": '<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M2.5 8.5h19"/><path d="M5.5 6.3h.01M8 6.3h.01"/><path d="M6 12h6M6 15.5h4"/><rect x="14" y="11.5" width="4.5" height="5" rx=".8"/>',
 "license": '<rect x="2.5" y="5" width="19" height="14" rx="2"/><circle cx="8.5" cy="11" r="2.2"/><path d="M5.5 16c.6-1.5 1.7-2.2 3-2.2s2.4.7 3 2.2"/><path d="M14.5 10h4M14.5 13.5h3"/>',
 "insurance": '<path d="M12 3 5 6v5.5c0 4.3 3 7.6 7 9.5 4-1.9 7-5.2 7-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
 "salary": '<path d="M3 17.5 9 11.5l4 4 8-8"/><path d="M15.5 7.5H21V13"/><path d="M3 21h18"/>',
 "atlas": '<path d="M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
 "ladder": '<path d="M7 3v18M17 3v18"/><path d="M7 7h10M7 11h10M7 15h10M7 19h10"/>',
 "blog": '<path d="M12 6.5C10.5 5 8 4.5 3.5 4.5V18c4.5 0 7 .5 8.5 2 1.5-1.5 4-2 8.5-2V4.5c-4.5 0-7 .5-8.5 2z"/><path d="M12 6.5V20"/>',
 "search": '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
}

def tools():
    return {r["url_slug"]: r for r in csv.DictReader(open(ROOT.parent / "data" / "processed" / "url_map.csv", encoding="utf-8"))}

# (url, title, description, tag, icon, extra search words, is_new)
GROUPS = [
 ("buyers", "For home buyers", "Before, during and after your inspection", [
  ("/pages/home-inspection-cost/", "Home inspection cost calculator", "Estimate the price by ZIP, home size, age and add-on tests.", "Calculator", "cost", "price fee how much"),
  ("/pages/home-inspection-checklist/", "Home inspection checklist", "Room-by-room checklist you can tick off and print.", "Checklist", "checklist", "printable pdf buyer"),
  ("/pages/what-do-home-inspectors-look-for/", "What home inspectors look for", "Click through a house to see what gets checked in each system.", "Explorer", "lookfor", "roof attic electrical plumbing hvac foundation"),
  ("/pages/sample-home-inspection-report/", "Sample home inspection report", "An annotated report with ratings, findings and recommendations.", "Sample", "report", "example template"),
  ("/pages/va-fha-usda-inspection-requirements/", "VA, FHA and USDA requirements", "What government-backed loans require and what commonly fails.", "Requirements", "lending", "loan mortgage appraisal mpr"),
 ]),
 ("agents", "For sellers and agents", "Deadlines, repair negotiations and insurance inspections", [
  ("/pages/inspection-contingency-calculator/", "Inspection contingency deadline calculator", "Turn your contract date into inspection and objection deadlines.", "Calculator", "deadline", "contingency period days calendar"),
  ("/pages/repair-request-letter/", "Repair request letter builder", "List defects, ask for repairs or credits, and download the letter.", "Letter builder", "letter", "repairs credit negotiate addendum"),
  ("/pages/4-point-wind-mitigation-calculator/", "4-point and wind mitigation estimator", "See how a Florida 4-point or wind mitigation report can affect premiums.", "Estimator", "wind", "florida insurance citizens roof"),
 ]),
 ("pros", "For home inspectors", "Templates and data for running an inspection business", [
  ("/pages/home-inspection-form/", "Home inspection report form", "Printable or fill-in report form with IN, NI, NP and D ratings.", "Template", "form", "worksheet sheet pdf word spreadsheet", True),
  ("/pages/home-inspection-contract/", "Home inspection contract", "Pre-inspection agreement builder with optional clauses and state notes.", "Template", "contract", "agreement pre-inspection liability", True),
  ("/pages/home-inspection-invoice-template/", "Home inspection invoice", "Invoice with preset services, discounts, tax and payment terms.", "Template", "invoice", "billing receipt payment", True),
  ("/pages/home-inspector-website-template/", "Home inspector website template", "Build a one-page site with local SEO tags and download it.", "Template", "website", "marketing seo site", True),
  ("/pages/home-inspector-license-requirements/", "License requirements by state", "Training hours, exams, insurance and renewal in all 50 states.", "Lookup", "license", "licensing exam ce state"),
  ("/pages/home-inspector-insurance/", "Inspector insurance estimator", "Estimate E&O and general liability premiums and state minimums.", "Estimator", "insurance", "e&o errors omissions liability"),
  ("/pages/home-inspector-salary/", "Home inspector salary by state", "Pay by state and metro, plus an income calculator.", "Calculator", "salary", "income pay earnings"),
 ]),
]

def svg(k, cls="hub-ico"):
    return f'<span class="{cls}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{I[k]}</svg></span>'

def a(u):
    return SITE + u

def card(c):
    u, t, d, tag, ic, k = c[:6]
    new = '<span class="hub-new">New</span>' if len(c) > 6 and c[6] else ""
    return (f'<a class="hub-card" href="{a(u)}" data-k="{html.escape(k)}">{svg(ic)}<h3>{html.escape(t)}</h3><p>{html.escape(d)}</p>'
            f'<span class="hub-meta"><span class="hub-tag">{html.escape(tag)}</span>{new}</span></a>')

def states(page_type, label):
    rs = sorted([r for r in tools().values() if r["page_type"] == page_type], key=lambda r: r["h1"])
    name = lambda r: re.sub(r"^.* in ", "", r["h1"])
    return "".join(f'<li><a href="{a(r["url_slug"])}">{html.escape(name(r))}</a></li>' for r in rs), len(rs)

def row(u, t, d, ic, k, picker=None):
    inner = f'<a href="{a(u)}">{svg(ic)}<h3>{html.escape(t)}</h3><p style="margin:0;font-size:14px;color:var(--m)">{html.escape(d)}</p></a>'
    if picker:
        lis, n = picker
        inner += f'<details><summary>Pick a state ({n})</summary><ul class="hub-states">{lis}</ul></details>'
    return f'<div class="hub-row" data-k="{html.escape(k)}">{inner}</div>'

def topo():
    # faint survey contours: the page's one load animation draws these in
    ps = ["M-20 150 C 120 90, 260 170, 420 110 S 700 60, 900 120",
          "M-20 120 C 140 60, 280 140, 440 80 S 720 30, 900 90",
          "M-20 182 C 110 130, 250 205, 410 150 S 690 100, 900 160",
          "M560 40 c 60 -10 120 10 130 45 c 8 30 -40 50 -95 45 c -55 -5 -90 -25 -85 -55 c 3 -18 22 -30 50 -35z",
          "M590 52 c 35 -5 70 6 75 26 c 4 17 -24 28 -55 25 c -32 -3 -52 -15 -50 -32 c 2 -10 12 -16 30 -19z"]
    return ('<svg class="hub-topo" viewBox="0 0 880 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
            + "".join(f'<path pathLength="1" d="{p}"/>' for p in ps) + "</svg>")

def build():
    n = sum(len(g[3]) for g in GROUPS) + 3
    keys = '<button type="button" data-g="all" aria-pressed="true"><i style="--c:#1B2030"></i>Everything <b>' + str(n) + "</b></button>"
    colors = {"buyers": "#3540A0", "agents": "#0E7C6B", "pros": "#F0B23E"}
    for g, t, sub, items in GROUPS:
        keys += f'<button type="button" data-g="{g}" aria-pressed="false"><i style="--c:{colors[g]}"></i>{html.escape(t[4:].capitalize())} <b>{len(items)}</b></button>'
    h = [f'<link rel="stylesheet" href="{CDN}resources.css">',
         '<div class="hia-hub not-prose" id="hia-hub">',
         '<div class="hub-legend">' + topo(),
         '<p>Free calculators, checklists and templates for every side of a home inspection. Nothing to sign up for, and anything you type stays in your browser.</p>',
         '<div data-js hidden><label class="hub-search" for="hub-q">' + svg("search", "hub-s") + '<span class="hia-sr">Search tools</span>'
         '<input id="hub-q" type="search" placeholder="Search tools: cost, contract, radon, Florida..." autocomplete="off"></label>',
         f'<div class="hub-keys" role="group" aria-label="Show resources for">{keys}</div><p class="hub-status" aria-live="polite"></p></div>',
         '</div>']
    for g, t, sub, items in GROUPS:
        h.append(f'<section class="hub-sec" data-g="{g}" aria-labelledby="hub-{g}"><header><i></i><h2 id="hub-{g}">{html.escape(t)}</h2><span>{html.escape(sub)}</span></header>'
                 '<div class="hub-grid">' + "".join(card(c) for c in items) + "</div></section>")
    rows = [row("/pages/home-inspection-cost/", "Home inspection cost by state", "Typical prices and add-on fees in every state and 175 cities.", "atlas", "price state city",
                states("cost_state", "cost")),
            row("/pages/how-to-become-a-home-inspector/", "How to become a home inspector", "Training, exams, licensing and costs, with a guide for each state.", "ladder", "career license training exam",
                states("career_state", "career")),
            row("/blog/", "Home inspection guides", "Plain-English articles on the process, the report, radon, repairs and more.", "blog", "blog articles guides")]
    h.append('<section class="hub-sec" data-g="more" aria-labelledby="hub-more"><header><i></i><h2 id="hub-more">State guides and articles</h2><span>For everyone</span></header>'
             '<div class="hub-rows">' + "".join(rows) + "</div></section>")
    h.append('<div class="hub-empty" hidden>No tools match that search. <button type="button">Show all resources</button></div>')
    h.append("</div>")
    h.append(boot_img("resources.js", "hub"))
    block = "".join(h)
    assert "\n\n" not in block
    md = ("# Home Inspection Tools and Resources\n\n"
          "Every free tool on Inspector Atlas in one place, grouped by who it is for: home buyers, sellers and their agents, and home inspectors.\n\n"
          + block + "\n\n"
          "## About these tools\n\n"
          "The calculators and lookups use published sources listed on each page, such as state licensing boards, the Bureau of Labor Statistics and "
          "national price surveys, with the date they were last checked. The templates are free starting points. Have an attorney review any contract before you use it, "
          "and check your state's rules for report content.\n\n"
          "Are you a home inspector? [Claim your free listing](https://homeinspectoratlas.com/pages/claim-your-listing/) to update your details, or "
          "[find home inspectors near you](https://homeinspectoratlas.com/).\n")
    return md

def links(md):
    return sorted(set(re.findall(r'href="(https://homeinspectoratlas\.com[^"]*)"', md) + re.findall(r"\]\((https://homeinspectoratlas\.com[^)]*)\)", md)))

if __name__ == "__main__":
    md = build()
    (ROOT / "pages" / "resources.md").write_text(md, encoding="utf-8")
    print(len(md), "chars,", len(links(md)), "unique links")
    if "--publish" in sys.argv:
        r = tools()["/pages/resources/"]
        c, d = curl("PUT", f"{API}/{PAGE_ID}", {"title": r["h1"], "slug": "resources", "markdown": md, "placement": "unlisted", "is_published": True, "is_markdown": True,
                                               "seo": {"title": r["title"], "description": r["meta_description"]}})
        pg = d.get("data", {})
        print(c, pg.get("page_url"), pg.get("seo"))
        if c not in (200, 201): print(json.dumps(d)[:400])
