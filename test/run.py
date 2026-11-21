"""Headless test: render each tool on a mock Directify custom page (real template CSS), via the real loader.
python test/run.py [tool ...]   -> prints PASS/FAIL per tool and viewport; screenshots in test/shots/"""
import sys, re, json, pathlib, markdown
from playwright.sync_api import sync_playwright
ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from build import TOOLS
LOADER = pathlib.Path(r"C:\Users\givei\Dropbox\PERS\CLAUDECODE\HOME.INSPECTION\brand\tools-loader.html").read_text(encoding="utf-8")
TPL = (ROOT / "test" / "template.html").read_text(encoding="utf-8")
SHOTS = ROOT / "test" / "shots"; SHOTS.mkdir(exist_ok=True)

def md_to_html(md):
    md = re.sub(r"::: faq\s*\n###\s*(.+?)\n(.*?)\n:::", lambda m: f"<details><summary>{m.group(1)}</summary>\n\n{m.group(2)}\n\n</details>", md, flags=re.S)
    return markdown.markdown(md, extensions=["tables"])

# per-tool interaction smoke checks (JS returning true/false or a string error)
CHECKS = {
 "checklist": "(()=>{const b=document.querySelector('#hia-tool input[type=checkbox]');b.click();return document.querySelector('#hia-tool strong').textContent.startsWith('1 of')})()",
 "license": "(()=>{const s=document.querySelector('#hia-tool input[type=search]');s.value='texas';s.dispatchEvent(new Event('input'));return document.querySelectorAll('#hia-tool tbody tr').length>=1 && document.querySelectorAll('#hia-tool tbody tr').length<5})()",
 "cost": "(()=>{const t=document.querySelector('#hia-tool .hia-big').textContent;return /\\$\\d/.test(t)})()",
 "salary": "(()=>{return document.querySelectorAll('#hia-tool tbody tr').length>=50 && /\\$\\d/.test(document.querySelector('#hia-tool .hia-big').textContent)})()",
 "insurance": "(()=>/\\$\\d/.test(document.querySelector('#hia-tool .hia-big').textContent))()",
 "lending": "(()=>document.querySelectorAll('#hia-tool li').length>10)()",
 "explorer": "(()=>{const b=document.querySelectorAll('#hia-tool [data-zone]');b[2].dispatchEvent(new MouseEvent('click',{bubbles:true}));return b.length>=8 && document.querySelector('#hia-tool [aria-live]')!=null})()",
 "windmit": "(()=>document.querySelector('#hia-tool .hia-result')!=null)()",
 "contingency": "(()=>/\\d{4}/.test(document.querySelector('#hia-tool .hia-result').textContent))()",
 "repair": "(()=>{return document.querySelector('#hia-tool .hia-letter')!=null})()",
 "report": "(()=>document.querySelectorAll('#hia-tool .hia-def').length>5)()",
}

def run(tools):
    ok_all = True
    with sync_playwright() as p:
        b = p.chromium.launch()
        for tool in tools:
            slug = TOOLS[tool][0]
            mdp = ROOT / "pages" / f"{slug}.md"
            body = md_to_html(mdp.read_text(encoding="utf-8")) if mdp.exists() else f"<h1>{slug}</h1><p>Intro paragraph.</p><h2>More</h2><p>Text</p>"
            html = TPL.replace("{{CONTENT}}", body).replace("{{LOADER}}", LOADER)
            for vw, vh in ((360, 800), (1280, 900)):
                ctx = b.new_context(viewport={"width": vw, "height": vh})
                pg = ctx.new_page()
                errs = []
                pg.on("pageerror", lambda e: errs.append(str(e)))
                pg.on("console", lambda m: errs.append(m.text) if m.type == "error" and "hia" in m.text.lower() else None)
                pg.route(f"https://homeinspectoratlas.com/pages/{slug}/", lambda r: r.fulfill(status=200, content_type="text/html", body=html))
                pg.route(re.compile(r"https://cdn\.jsdelivr\.net/gh/giveitlegs/hia-tools@[^/]+/dist/.*"),
                         lambda r: r.fulfill(status=200, content_type="application/javascript", body=(ROOT / "dist" / r.request.url.rsplit("/", 1)[1]).read_text(encoding="utf-8")))
                pg.route(re.compile(r".*(analytics|livewire|googletag|gtag).*"), lambda r: r.abort())
                pg.goto(f"https://homeinspectoratlas.com/pages/{slug}/", wait_until="load")
                pg.wait_for_function("document.querySelector('#hia-tool') && document.querySelector('#hia-tool').children.length>0", timeout=8000)
                res = {}
                res["kids"] = pg.evaluate("document.querySelector('#hia-tool').children.length")
                res["hscroll"] = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                res["ld"] = pg.evaluate("[...document.querySelectorAll('script[type=\"application/ld+json\"]')].map(s=>JSON.parse(s.textContent)['@graph'].map(g=>g['@type']).join('+')).join(',')")
                res["h"] = pg.evaluate("Math.round(document.querySelector('#hia-tool').getBoundingClientRect().height)")
                res["unlabelled"] = pg.evaluate("""[...document.querySelectorAll('#hia-tool input,#hia-tool select,#hia-tool textarea')].filter(i=>i.type!=='hidden'&&!(i.labels&&i.labels.length)&&!i.getAttribute('aria-label')&&!i.getAttribute('aria-labelledby')).length""")
                # keyboard: tab into the widget
                pg.focus("body")
                reached = False
                for _ in range(60):
                    pg.keyboard.press("Tab")
                    if pg.evaluate("document.activeElement && !!document.activeElement.closest('#hia-tool')"):
                        reached = True; break
                res["kbd"] = reached
                pg.screenshot(path=str(SHOTS / f"{tool}-{vw}.png"), full_page=False, clip=None)
                try: res["check"] = pg.evaluate(CHECKS.get(tool, "true"))
                except Exception as e: res["check"] = "ERR " + str(e)[:200]
                pg.wait_for_timeout(150)
                res["hscroll2"] = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                el = pg.query_selector("#hia-tool"); el.screenshot(path=str(SHOTS / f"{tool}-{vw}-widget.png"))
                good = res["kids"] > 0 and res["hscroll"] <= 0 and res["hscroll2"] <= 0 and res["kbd"] and res["check"] is True and not errs and res["unlabelled"] == 0 and res["ld"]
                ok_all &= bool(good)
                print(f"{'PASS' if good else 'FAIL'} {tool:12s} {vw:4d}px  {json.dumps(res)}  {errs[:3] if errs else ''}")
                ctx.close()
        b.close()
    return ok_all

if __name__ == "__main__":
    sys.exit(0 if run(sys.argv[1:] or list(TOOLS)) else 1)
