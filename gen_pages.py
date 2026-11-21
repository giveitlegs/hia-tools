"""Generate the crawlable markdown for each tool page (pages/{slug}.md) from data/*.json + hand-written copy.
Then validate every internal link against data/processed/url_map.csv."""
import json, re, csv, pathlib, sys
ROOT = pathlib.Path(__file__).parent
S = "https://homeinspectoratlas.com"
J = lambda n: json.loads((ROOT / "data" / f"{n}.json").read_text(encoding="utf-8"))
def L(path, text): return f"[{text}]({S}{path})"
def money(n): return f"${n:,.0f}"
def faq(pairs): return "\n\n".join(f"::: faq\n### {q}\n{a}\n:::" for q, a in pairs)
def esc(t): return (t or "").replace("|", "/").replace("\n", " ")
def src_list(items): return "\n".join(f"- [{n}]({u})" for n, u in items)
P = {}

# ---------------------------------------------------------------- license
lic = J("licensing")
req = [s for s in lic["states"] if s["license_required"] is True]
no = [s for s in lic["states"] if s["license_required"] is False]
part = [s for s in lic["states"] if s["license_required"] == "partial"]
rows = "\n".join(f"| {L('/how-to-become-a-home-inspector-'+s['slug']+'/', s['name'])} | {'Yes' if s['license_required'] is True else 'Partial' if s['license_required']=='partial' else 'No'} | "
                 f"{s['prelicense_hours'] or '–'} | {esc(s['exam'])} | {esc(s['insurance'])} | {esc(s['ce']) or '–'} | [{esc(s['regulator']) or 'Regulator'}]({s['regulator_url'] or s['source_url']}) |"
                 for s in lic["states"])
P["home-inspector-license-requirements"] = f"""# Home Inspector License Requirements by State

{len(req)} of {len(lic['states'])} jurisdictions (50 states plus DC) require a state home inspector license. {len(no)} have no statewide license, and {len(part)} ({', '.join(s['name'] for s in part)}) regulate inspectors in a narrower way. Pick a state below to see training hours, the exam, insurance minimums and continuing education, each checked against the state regulator on {lic['last_checked']}.

## How to use this table

1. Choose your state in the tool, or search the table.
2. Read the training hours and exam first. Those decide how long licensing takes.
3. Check the insurance column before you price your services. Several states require general liability or errors and omissions (E&O) coverage before they issue a license.
4. Open the regulator link and confirm the current rules before you pay for a course. Fees and forms change more often than statutes.

## License requirements in all 50 states and DC

| State | License | Training hours | Exam | Insurance | Continuing education | Regulator |
|---|---|---|---|---|---|---|
{rows}

"Partial" means the state sets rules without a standard license. Iowa limits who may issue reports to members of qualifying national associations, Nebraska uses registration, and Pennsylvania requires association membership and insurance by statute.

## States with no home inspector license

{', '.join(L('/how-to-become-a-home-inspector-'+s['slug']+'/', s['name']) for s in no)} have no statewide license as of {lic['last_checked']}. In these states, anyone can sell home inspections. Buyers there should ask about training, association membership, insurance and sample reports before they book. Some cities and counties add their own rules, and California sets consumer rules for inspectors in its Business and Professions Code (sections 7195 to 7199).

## Recent changes

- **Utah** created a Private Home Inspector license, enforced since May 1, 2026, with $500,000 each of liability and E&O insurance.
- **Montana** moved from registration to a full license on January 1, 2026.
- **Iowa** limited report-writing to members of qualifying associations from July 1, 2025.
- **Georgia** and **Missouri** saw licensing bills in 2026. We list both as unlicensed until a law takes effect.

## Methodology

We built one record per jurisdiction from the state regulator's website, the licensing statute or the administrative code. National association summaries from {L('/how-to-become-a-home-inspector/', 'our career guides')}, ASHI and InterNACHI were used only to cross-check. Where an official page did not state a figure, the cell shows a dash rather than a guess. The full dataset, with a source URL for each state, is public on [GitHub](https://github.com/giveitlegs/hia-tools/blob/main/data/licensing.json).

## Related tools and guides

- {L('/how-to-become-a-home-inspector/', 'How to become a home inspector')}
- {L('/home-inspector-exam/', 'Home inspector exam guide')}
- {L('/home-inspector-training/', 'Home inspector training')}
- {L('/home-inspector-insurance/', 'Home inspector insurance cost estimator')}
- {L('/home-inspector-salary/', 'Home inspector salary by state')}
- {L('/start-a-home-inspection-business/', 'Start a home inspection business')}

## Sources

{src_list([("National Home Inspector Examination (EBPHI)", "https://www.homeinspectionexam.org/"), ("Texas Real Estate Commission, inspectors", "https://www.trec.texas.gov/"), ("Florida DBPR, Home Inspectors", "https://www.myfloridalicense.com/DBPR/home-inspectors/"), ("New York Department of State, Home Inspector", "https://dos.ny.gov/home-inspector"), ("North Carolina Home Inspector Licensure Board", "https://www.nchilb.org/"), ("California Business and Professions Code 7195-7199", "https://leginfo.legislature.ca.gov/")])}

## Frequently asked questions

{faq([
 ("Do you need a license to be a home inspector?", f"In {len(req)} of 51 jurisdictions, yes. {len(no)} states, including California, Colorado and Michigan, have no statewide license, and {len(part)} states regulate inspectors in a narrower way. Check the table above for your state."),
 ("How many hours of training does a home inspector license take?", "It ranges widely. Among states that set a number, requirements run from about 35 hours (Virginia) to 194 hours (Texas) and 200 hours (North Carolina). Some states add supervised field inspections on top of classroom hours."),
 ("What exam do home inspectors take?", "Most licensing states use the National Home Inspector Examination (NHIE). Texas, North Carolina and a few others use their own state exam, and some states add a state law or ethics exam."),
 ("Do home inspectors need insurance?", "Many licensing states require general liability, errors and omissions (E&O) coverage, or a bond. Minimums range from about $50,000 to $500,000. See the insurance column above and our home inspector insurance estimator."),
 ("Which states do not license home inspectors?", f"As of {lic['last_checked']}: {', '.join(s['name'] for s in no)}."),
 ("Can I use my license in another state?", "Usually not directly. A few states accept the NHIE or another state's license as part of the application, but each state issues its own license. Contact the regulator in the new state before you schedule work there."),
 ("How often do home inspectors renew their license?", "Most states renew every one or two years and require continuing education each cycle, commonly 8 to 40 hours. New Mexico uses a three-year license."),
])}
"""

# ---------------------------------------------------------------- salary
sal = J("salary"); N = sal["national"]
srt = sorted(sal["states"], key=lambda x: -x["median_annual"])
rows = "\n".join(f"| {L('/how-to-become-a-home-inspector-'+s['slug']+'/', s['name'])} | {money(s['median_annual'])} | {money(s['mean_annual'])} | {money(s['p10']) if s['p10'] else '–'} | {money(s['p90']) if s['p90'] else '–'} | {s['employment']:,} |" for s in srt)
metros = "\n".join(f"| {m['name']} | {money(m['mean_annual'])} | {m['employment']:,} |" for m in sal["top_metros_pay"])
P["home-inspector-salary"] = f"""# Home Inspector Salary by State

Construction and building inspectors, the federal job category that includes home inspectors, earned a median of **{money(N['median_annual'])}** a year in {sal['reference_period']}, according to the Bureau of Labor Statistics. The middle half earned {money(N['p25'])} to {money(N['p75'])}. Pay is highest in {srt[0]['name']}, {srt[1]['name']} and {srt[2]['name']}. Use the calculator to estimate what a self-employed inspector could net in your state.

## How to use the calculator

1. Pick your state to load its BLS wage figures.
2. Enter your expected inspections per week, average fee and add-on revenue (radon, termite, sewer scope).
3. Open "Annual business expenses" and replace the placeholder costs with your own quotes for insurance, software, vehicle and marketing.
4. Compare your estimated net income with the state median for employed inspectors.

Not sure what to charge? Our {L('/home-inspection-cost/', 'home inspection cost calculator')} shows published price ranges by home size and add-on.

## Salary by state

| State | Median | Mean | 10th percentile | 90th percentile | Jobs |
|---|---|---|---|---|---|
{rows}

## Highest-paying metro areas

| Metro area | Mean annual wage | Jobs |
|---|---|---|
{metros}

## Methodology and limits

- Wages come from BLS Occupational Employment and Wage Statistics (OEWS), {sal['reference_period']}, for SOC {sal['soc']}. {sal['note']}
- OEWS counts employees only. Self-employed inspectors are not in these numbers, and many home inspectors are self-employed.
- The income calculator multiplies inspections per week by weeks worked and by your fee plus add-ons, then subtracts the expenses you enter. Expense defaults are placeholders, not survey data. It does not deduct income tax or self-employment tax.
- National outlook: BLS projects {sal['ooh']['outlook_label'].lower()} ({sal['ooh']['outlook_pct']}%) for {sal['ooh']['outlook_period']}, with about {sal['ooh']['jobs']:,} jobs.

## Related tools and guides

- {L('/how-to-become-a-home-inspector/', 'How to become a home inspector')}
- {L('/home-inspector-license-requirements/', 'Home inspector license requirements by state')}
- {L('/home-inspector-insurance/', 'Home inspector insurance cost estimator')}
- {L('/home-inspector-jobs/', 'Home inspector jobs')}
- {L('/start-a-home-inspection-business/', 'Start a home inspection business')}
- {L('/home-inspection-franchise/', 'Home inspection franchises')}

## Sources

{src_list([(x['name'], x['url']) for x in sal['sources']])}

## Frequently asked questions

{faq([
 ("How much does a home inspector make?", f"BLS reports a median of {money(N['median_annual'])} a year ({sal['reference_period']}) for construction and building inspectors, the category that includes home inspectors. The top 10% earned more than {money(N['p90'])}. Self-employed inspectors are not counted, and their income depends on volume, fees and expenses."),
 ("Which state pays home inspectors the most?", f"{srt[0]['name']} has the highest median at {money(srt[0]['median_annual'])}, followed by {srt[1]['name']} ({money(srt[1]['median_annual'])}) and {srt[2]['name']} ({money(srt[2]['median_annual'])})."),
 ("How much do self-employed home inspectors make?", "It depends on how many inspections you do, what you charge and your costs. For example, 6 inspections a week for 48 weeks at $475 including add-ons is about $137,000 in revenue before expenses and taxes. Use the calculator with your own numbers."),
 ("Is the BLS number only for home inspectors?", "No. SOC 47-4011 covers construction and building inspectors, including municipal code inspectors and other building inspectors. It is the closest federal wage series for home inspectors."),
 ("How many inspections does a home inspector do per week?", "Full-time inspectors commonly book one or two inspections a day. Volume is seasonal and follows local home sales."),
 ("Do home inspectors need a license to earn money?", "In most states, yes. Check our license requirements table before you start marketing your services."),
])}
"""

# ---------------------------------------------------------------- cost
co = J("cost"); cons = co["national"]["consensus"]; rpp = co["state_adjustment"]["rpp"]; ST = J("states")
def adj(c, n): return int(round(n * rpp[c] / 100 / 5) * 5)
rows = "\n".join(f"| {L('/home-inspection-cost-'+s[2]+'/', s[1])} | {rpp[s[0]]:.1f} | {money(adj(s[0], cons['low']))} – {money(adj(s[0], cons['high']))} |" for s in ST)
bands = "\n".join(f"| {b['min_sqft']:,}–{b['max_sqft']:,} sq ft | {money(b['low'])} – {money(b['high'])} |" for b in co["size_bands"])
adds = "\n".join(f"| {a['label']} | {money(a['low'])} – {money(a['high'])} |" for a in co["addons"])
srcs = "\n".join(f"| [{x['name']}]({x['url']}) | {money(x['low']) if x['low'] else '–'} – {money(x['high']) if x['high'] else '–'} | {money(x['average']) if x['average'] else '–'} | {x.get('year') or '–'} |" for x in co["national"]["sources"])
P["home-inspection-cost"] = f"""# Home Inspection Cost Calculator

A standard home inspection for a single-family house typically costs **{money(cons['low'])} to {money(cons['high'])}**, with most published averages between $340 and $400. Size, age, location and add-on tests like radon or a sewer scope change the price. Enter your home's details below for an estimate, then compare quotes from local inspectors.

## How to use the calculator

1. Choose your state. The estimate is adjusted by the state's price level (BEA Regional Price Parities). You can switch the adjustment off.
2. Pick the property type and enter the square footage and year built.
3. Tick any add-on tests you need. Each shows its published price range.
4. Open "How this was calculated" to see every assumption used.

## Average cost by home size

| Home size | Typical price |
|---|---|
{bands}

Above 3,000 sq ft, many inspectors add roughly $25 for every extra 500 sq ft (Angi). Older homes (built before 1980) can add $100 to $200 because there is more to check (HomeGuide). Crawlspaces and basements also add time, though sources publish no fixed dollar figure.

## Add-on inspection costs

| Add-on | Typical price |
|---|---|
{adds}

Need one of these? See {L('/radon-testing/', 'radon testing')}, {L('/sewer-scope-inspection/', 'sewer scope inspections')}, {L('/termite-inspection/', 'termite inspections')}, {L('/mold-inspection/', 'mold inspections')}, {L('/septic-inspection/', 'septic inspections')} and {L('/well-water-testing/', 'well water testing')}.

## Estimated cost by state

The national typical range ({money(cons['low'])}–{money(cons['high'])}) multiplied by each state's {co['state_adjustment']['rpp_year']} price level. This is a cost-of-living adjustment, not a survey of inspection fees, so treat it as a starting point.

| State | Price level (US = 100) | Estimated typical range |
|---|---|---|
{rows}

## Published averages we used

| Source | Range | Average | Year |
|---|---|---|---|
{srcs}

Angi and HomeAdvisor share a parent company and data, and some publishers cite them, so the sources are not fully independent.

## Methodology

The calculator starts from published size bands (HomeGuide) for houses and townhomes, or from published ranges for condos, manufactured homes, multi-family buildings and new construction. It adds the published older-home surcharge for homes built before 1980 and the ranges for each add-on you tick, then multiplies everything by the state price level if you leave that option on. Figures are rounded to the nearest $5. We did not invent any multiplier. All inputs and sources are in our public [dataset](https://github.com/giveitlegs/hia-tools/blob/main/data/cost.json), checked {co['last_checked']}.

## Related pages

- {L('/', 'Find a home inspector near you')}
- {L('/pre-purchase-home-inspection/', 'Pre-purchase home inspection')}
- {L('/home-inspection-checklist/', 'Home inspection checklist')}
- {L('/what-do-home-inspectors-look-for/', 'What do home inspectors look for?')}
- {L('/blog/who-pays-for-home-inspection/', 'Who pays for the home inspection?')}
- {L('/blog/is-home-inspection-included-in-closing-costs/', 'Is a home inspection included in closing costs?')}

## Sources

{src_list([(x['name'], x['url']) for x in co['sources'][:9]])}
- [BEA Regional Price Parities by state]({co['state_adjustment']['source']})

## Frequently asked questions

{faq([
 ("How much does a home inspection cost?", f"Most published sources put a standard single-family inspection at about {money(cons['low'])} to {money(cons['high'])}, with averages of $340 to $400. Larger, older and rural homes cost more, and add-on tests are extra."),
 ("Who pays for the home inspection?", "In most US home sales the buyer orders and pays for the inspection, usually at the appointment or before the report is released. Sellers sometimes pay for a pre-listing inspection."),
 ("Is a home inspection included in closing costs?", "Usually not. You pay the inspector directly before closing, even if the sale falls through. Some lenders let you list it on the closing disclosure as paid outside closing."),
 ("Why do some inspectors charge more?", "Price follows the home's size, age and foundation type, travel distance, the inspector's experience and tools, and any add-on tests. A low price can mean a shorter inspection or a thinner report, so compare sample reports."),
 ("How much does a radon test add?", "Published ranges run about $125 to $400 for a radon test, depending on the method and whether it is booked with the home inspection."),
 ("Does a condo inspection cost less?", "Usually. Published condo ranges start around $200 because common areas like the roof and structure are often outside the unit inspection."),
 ("Can I get a home inspection for free?", "Not a real one. Free offers are usually tied to a sale or a repair contractor. An independent inspector you pay directly works for you."),
])}
"""
