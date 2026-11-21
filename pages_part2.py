# Executed inside gen_pages.py (shares its globals): insurance, checklist, explorer, report pages.

# ---------------------------------------------------------------- insurance
ins = J("insurance"); ce = ins["consensus"]
mand = [s for s in lic["states"] if s["insurance"] and not re.match(r"(?i)none|no insurance", s["insurance"])]
rows = "\n".join(f"| {L('/how-to-become-a-home-inspector-'+s['slug']+'/', s['name'])} | {esc(s['insurance'])} |" for s in mand)
def _pf(p):
    u = "mo" if p["per"] == "month" else "yr"
    if p.get("median"): return f"median {money(p['median'])}/{u}"
    return f"{money(p['low'])}{'–' + money(p['high']) if p.get('high') else '+'}/{u}"
prem = "\n".join(f"| [{p['name']}]({p['url']}) | {p['coverage']} | {_pf(p)} | {esc(p.get('limits')) or '–'} |" for p in ins["premiums"] if "HISTORICAL" not in (p.get("notes") or ""))
P["home-inspector-insurance"] = f"""# Home Inspector Insurance Cost Estimator

Errors and omissions (E&O) insurance for a home inspector typically costs **{money(ce['eo_per_year']['low'])} to {money(ce['eo_per_year']['high'])} a year**, and general liability adds about **{money(ce['gl_per_year']['low'])} to {money(ce['gl_per_year']['high'])}**. Your premium depends on inspection volume, limits, deductible, ancillary services and claims history. {len(mand)} states set a minimum insurance or bond requirement for licensed inspectors.

## How to use the estimator

1. Pick your state to see its insurance rule.
2. Enter inspections per year, your E&O limits and deductible.
3. Tick the ancillary services you offer, such as mold, radon or termite (WDO).
4. Add years in business and claims history, then open "Assumptions" to see how each choice moved the estimate.

## What the two main policies cover

- **Errors and omissions (professional liability)** pays for your defense and settlements when a client says you missed a defect or reported something wrong. Most claims against inspectors fall under this policy.
- **General liability** covers bodily injury and property damage during an inspection, such as a cracked tile or a ceiling damaged in the attic.
- Many brokers sell the two as a bundle. Some states accept a bond in place of insurance.

## Published premium figures

| Source | Coverage | Published figure | Limits |
|---|---|---|---|
{prem}

## State insurance requirements

| State | Requirement |
|---|---|
{rows}

States not listed set no insurance minimum, or have no license at all. See our {L('/home-inspector-license-requirements/', 'license requirements table')} for the full record.

## Methodology

The estimator starts from a typical E&O premium of {money(ce['eo_per_year']['typical'])} a year at $1M/$1M limits (the Insureon median is $989). It adjusts by $50 to $300 per limit tier, adds 1% to 15% per ancillary endorsement and takes 3% to 15% off per higher deductible tier, all as published by InspectorPro. High volume, recent claims or a new business move the estimate toward the top of the range. General liability uses the published range. It is an estimate, not a quote. Dataset: [insurance.json](https://github.com/giveitlegs/hia-tools/blob/main/data/insurance.json), checked {ins['last_checked']}.

## Related tools and guides

- {L('/start-a-home-inspection-business/', 'Start a home inspection business')}
- {L('/home-inspector-salary/', 'Home inspector salary and income calculator')}
- {L('/how-to-become-a-home-inspector/', 'How to become a home inspector')}
- {L('/home-inspection-software/', 'Home inspection software')}
- {L('/home-inspector-tools/', 'Home inspector tools')}

## Sources

{src_list([(x['name'], x['url']) for x in ins['sources'][:10]])}

## Frequently asked questions

{faq([
 ("How much is home inspector insurance?", f"Published figures put E&O at about {money(ce['eo_per_year']['low'])} to {money(ce['eo_per_year']['high'])} a year and general liability at about {money(ce['gl_per_year']['low'])} to {money(ce['gl_per_year']['high'])}. Insureon reports a median of $82 a month for E&O and $45 a month for general liability."),
 ("Do home inspectors need E&O insurance?", "Some states require it as a condition of the license, including New Jersey ($500,000 per occurrence) and Rhode Island ($500,000 aggregate). In other states it is optional but widely carried, because most claims against inspectors are professional liability claims."),
 ("What limits should a home inspector carry?", "Brokers commonly offer $100,000 up to $1M per claim, and InspectorPro says $1M/$1M is its most popular choice. Your state minimum is the floor."),
 ("Does offering mold or radon testing raise my premium?", "Usually. InspectorPro reports that endorsements for services such as mold or pool and spa each add about 1% to 15% to the premium."),
 ("How can I lower my premium?", "Choose a higher deductible, keep a clean claims history, use a strong pre-inspection agreement, and keep up with continuing education. Some programs give discounts for experience and loss-free years."),
 ("Is general liability required for home inspectors?", "Several states require it, often $100,000 to $500,000. Florida, for example, requires $300,000 of commercial general liability. See the state table above."),
])}
"""

# ---------------------------------------------------------------- checklist
ck = J("checklist")
secs = "\n\n".join(f"### {s['t']}" + (f" (SOP {s['sop']})" if s['sop'] else "") + "\n\n" + "\n".join(f"- {i['t']}" for i in s["items"] if "b" in i["m"])
                   for s in ck["sections"] if any("b" in i["m"] for i in s["items"]))
P["home-inspection-checklist"] = f"""# Home Inspection Checklist

Use this free checklist to follow along during a home inspection, room by room. Switch between buyer, seller pre-listing, new construction, condo and manufactured home versions, tick items as you go, flag anything you want to ask the inspector about, and print or save the list as a PDF. Your progress stays in your browser.

## How to use the checklist

1. Choose your checklist type: buyer, seller pre-listing, new construction, condo or manufactured home.
2. Bring it to the inspection on your phone, or print it first.
3. Tick each item once you have seen it or the inspector has covered it.
4. Tap **Flag** on anything that worries you and add a short note, for example "stain on bedroom 2 ceiling".
5. At the end, review the "Ask your inspector about these" list before the inspector leaves.

## The buyer's checklist

The items follow the InterNACHI Standards of Practice, the scope most inspectors work to. Section numbers are in brackets.

{secs}

## Seller, new construction, condo and manufactured home versions

- **Seller pre-listing:** adds the prep work that speeds up a buyer's inspection: utilities on, clear access to the panel, attic and crawlspace, a new furnace filter and working alarms. See {L('/pre-listing-home-inspection/', 'pre-listing home inspections')}.
- **New construction:** adds the pre-pour, pre-drywall, final and 11-month warranty inspections. See {L('/new-construction-inspection/', 'new construction inspections')}.
- **Condo:** focuses on the unit and asks what the HOA maintains. Roofs and structure are often common elements.
- **Manufactured home:** adds the HUD data plate, tie-downs, piers, skirting and the marriage line. See {L('/mobile-home-inspection/', 'mobile home inspections')}.

## What a home inspection does not cover

A standard inspection is visual and non-invasive. Inspectors do not open walls, test for radon or mold, scope the sewer line, or check pools, septic systems or wells unless you book those services. If the home is older, wooded or on a well and septic, book the add-ons early: {L('/radon-testing/', 'radon testing')}, {L('/sewer-scope-inspection/', 'sewer scope')}, {L('/termite-inspection/', 'termite inspection')}, {L('/septic-inspection/', 'septic inspection')}.

## Related tools

- {L('/what-do-home-inspectors-look-for/', 'What do home inspectors look for? Explore the house')}
- {L('/sample-home-inspection-report/', 'Sample home inspection report')}
- {L('/home-inspection-cost/', 'Home inspection cost calculator')}
- {L('/inspection-contingency-calculator/', 'Inspection contingency deadline calculator')}
- {L('/repair-request-letter/', 'Repair request letter builder')}
- {L('/pre-purchase-home-inspection/', 'Pre-purchase home inspection')}

## Sources

{src_list([(x['name'], x['url']) for x in ck['sources']])}

## Frequently asked questions

{faq([
 ("What is on a home inspection checklist?", "The roof, exterior, foundation and crawlspace, attic and insulation, electrical, plumbing, heating and cooling, interior rooms, fireplace and garage. Inspectors follow a standard of practice that lists what they must inspect and report in each area."),
 ("Can I use this checklist instead of hiring an inspector?", "No. It helps you follow along and ask good questions. A trained inspector has the tools, access and experience to find defects you would miss, and writes a report you can use in negotiations."),
 ("Is there a printable home inspection checklist PDF?", "Yes. Use the Print / save PDF button in the tool and choose Save as PDF in your browser's print dialog."),
 ("Is my checklist saved?", "Your ticks, flags and notes are saved in this browser only. Nothing is sent to us. Clearing your browser data removes them."),
 ("What should sellers check before a home inspection?", "Make sure utilities are on, clear access to the attic, panel, water heater and crawlspace, replace the furnace filter, test smoke and CO alarms, and gather repair receipts and permits."),
 ("What does a new construction checklist add?", "Phase inspections: before the foundation pour, before drywall, before the final walkthrough and before the 11-month builder warranty ends."),
])}
"""

# ---------------------------------------------------------------- explorer
ex = J("explorer")
zones = "\n\n".join(f"### {z['t']} (SOP {z['sop']})\n\n**What the inspector checks:** " + "; ".join(z['checks']) + ".\n\n**Common defects:** " + "; ".join(z['defects']) +
                    ".\n\n**Usually not included:** " + "; ".join(z['scope']) + ".\n\n**Related:** " + ", ".join(L(p, t) for p, t in z['rel']) for z in ex["zones"])
P["what-do-home-inspectors-look-for"] = f"""# What Do Home Inspectors Look For?

A home inspector looks for material defects in the roof, structure, electrical, plumbing, heating and cooling systems, attic, exterior, interior and garage: problems that could affect the home's value or the safety of the people living in it. Click any part of the house below to see what is checked, the defects inspectors find most often, and what is outside a standard inspection.

## How to use the house explorer

1. Click or tap a zone on the house, or use the buttons under it (keyboard friendly).
2. Read what the inspector checks, the common defects, and the items outside the standard scope.
3. Follow the related links if you need a specialist, such as a sewer scope or radon test.

## What inspectors check in each part of the house

{zones}

## What a home inspection is not

A home inspection is a visual, non-invasive look at readily accessible areas on one day. It is not a code inspection, an appraisal, an engineering report or a warranty. Inspectors do not predict how long a roof or furnace will last, open walls or move furniture. Environmental tests such as {L('/radon-testing/', 'radon')}, {L('/mold-inspection/', 'mold')}, {L('/asbestos-testing/', 'asbestos')} and {L('/lead-paint-inspection/', 'lead paint')} are separate services.

## Related tools and guides

- {L('/home-inspection-checklist/', 'Interactive home inspection checklist')}
- {L('/sample-home-inspection-report/', 'Sample home inspection report')}
- {L('/blog/things-that-fail-a-home-inspection/', 'Things that fail a home inspection')}
- {L('/blog/what-is-covered-in-a-home-inspection/', 'What is covered in a home inspection')}
- {L('/pre-purchase-home-inspection/', 'Pre-purchase home inspection')}
- {L('/', 'Find a home inspector near you')}

## Sources

{src_list([(x['name'], x['url']) for x in ex['sources']])}

## Frequently asked questions

{faq([
 ("What do home inspectors look for?", "Material defects in the roof, exterior, foundation and structure, electrical, plumbing, heating and cooling, attic and insulation, interior, fireplace and garage. They also note safety hazards such as missing GFCI protection or smoke alarms."),
 ("What are the most common problems found in a home inspection?", "Roof wear and flashing leaks, poor grading and drainage, electrical panel issues, missing GFCI outlets, plumbing leaks, aging water heaters and HVAC equipment, and attic ventilation problems."),
 ("Do home inspectors check for mold?", "Not as part of a standard inspection. They report visible moisture and conditions that support mold growth. Mold sampling is a separate service."),
 ("Do home inspectors go on the roof?", "Often, when it is safe. The standards let inspectors view the roof from the ground, the eaves or by drone instead of walking a steep, wet or fragile roof."),
 ("What does a home inspector not check?", "Inside walls, sewer lines under the yard, septic systems, wells, pools, radon, code compliance, and items not permanently installed, unless you book those services separately."),
 ("What does a VA or FHA appraisal look for compared with an inspection?", "The appraiser checks minimum property requirements for the loan, such as a sound roof and safe utilities. It is not a full inspection. See our FHA, VA and USDA requirements checklist."),
])}

See also: {L('/va-fha-usda-inspection-requirements/', 'VA, FHA and USDA inspection requirements')}.
"""

# ---------------------------------------------------------------- report
rp = J("report")
lv = "\n".join(f"| {l[1]} | {l[2]} |" for l in rp["levels"])
ex_rows = "\n".join(f"| {s['t']} | {i['loc']} | {i['obs']} | {dict((l[0], l[1]) for l in rp['levels'])[i['s']]} |" for s in rp["sections"] for i in s["items"] if i["s"] in ("safety", "major"))
P["sample-home-inspection-report"] = f"""# Sample Home Inspection Report

This annotated sample report shows what a real home inspection report looks like: a summary of material defects, severity ratings, findings by section with what was observed, why it matters and what to do next. Filter by severity, hide sections, turn the reading tips on or off, and download a free blank report template.

## How to use the sample report

1. Read the **Summary** first. It lists the safety hazards and major repairs, the items that matter most in a negotiation.
2. Use the severity filter to focus on safety hazards or repairs.
3. Turn on the reading tips to see how to read each part of a report.
4. Download the blank template (.doc, opens in Word or Google Docs) if you want a simple report layout.

## The property

{rp['property']['address']}. {rp['property']['type']}, built {rp['property']['built']}, {rp['property']['size']}, {rp['property']['foundation'].lower()}. Weather: {rp['property']['weather']}.

## Severity ratings used in the report

| Rating | Meaning |
|---|---|
{lv}

## Summary of material defects in the sample

| Section | Location | Finding | Rating |
|---|---|---|---|
{ex_rows}

## How to read a home inspection report

- **Start with the summary**, then read the full section behind each item. Summaries leave out context.
- **Check the limitations.** Every report lists areas the inspector could not see, such as a blocked crawlspace or a roof viewed only from the ground.
- **Read the recommendation line.** "Evaluate by a licensed electrician" means the inspector found a symptom, not the full cause or cost. Get that evaluation before your {L('/inspection-contingency-calculator/', 'contingency deadline')}.
- **Look at the photos.** A good report shows each defect, which helps your agent, the seller and contractors.
- **Separate maintenance from defects.** Old but working equipment is not a defect on its own, but it is a budgeting item.

When you are ready to negotiate, use our {L('/repair-request-letter/', 'repair request letter builder')}.

## Related guides

- {L('/blog/how-to-read-a-home-inspection-report/', 'How to read a home inspection report')}
- {L('/blog/how-long-to-get-home-inspection-report/', 'How long it takes to get the report')}
- {L('/what-do-home-inspectors-look-for/', 'What do home inspectors look for?')}
- {L('/home-inspection-checklist/', 'Home inspection checklist')}
- {L('/roof-inspection/', 'Roof inspection')}

## About this sample

{rp['note']} Scope follows the InterNACHI and ASHI standards of practice.

## Sources

{src_list([(x['name'], x['url']) for x in rp['sources']])}

## Frequently asked questions

{faq([
 ("What does a home inspection report include?", "A description of the property and conditions on the day, the scope and limitations, a summary of material defects, and section-by-section findings for the roof, exterior, structure, electrical, plumbing, HVAC, attic, interior and garage, usually with photos and recommendations."),
 ("How long is a typical home inspection report?", "Many run 30 to 60 pages with photos. The summary is usually a few pages."),
 ("How soon do you get the report?", "Most inspectors deliver it the same day or within 24 to 48 hours. Some states set a delivery deadline."),
 ("What do the severity ratings mean?", "Most reports sort findings into safety hazards, items needing repair or replacement, routine maintenance, and items to monitor. The exact labels vary by inspector and software."),
 ("Is there a free home inspection report template?", "Yes. Download the blank template from the tool above. It opens in Word or Google Docs and follows the same section layout."),
 ("Can I share the report with the seller?", "Yes. Buyers commonly share the relevant pages with the seller with a repair request. The report belongs to the client who paid for it."),
])}
"""
