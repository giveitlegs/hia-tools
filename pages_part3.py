# Executed inside gen_pages.py (shares its globals): lending, windmit, contingency, repair pages.

# ---------------------------------------------------------------- lending
ld = J("lending"); PR = ld["programs"]
def _ref(x): return x or "–"
rows = "\n".join(f"| {i['category']} | {esc(i['text'])} | {_ref(i['programs']['FHA'])} | {_ref(i['programs']['VA'])} | {'Yes' if i['programs']['USDA'] else '–'} |" for i in ld["items"] if i["common_repair"])
P["va-fha-usda-inspection-requirements"] = f"""# VA, FHA & USDA Inspection Requirements

FHA, VA and USDA loans all require the home to meet **minimum property requirements**: it must be safe, structurally sound and sanitary. The appraiser checks these on site, and items like a leaking roof, peeling paint on an older home, missing handrails or a broken heating system must be fixed before closing. The appraisal is not a home inspection. Choose your loan type below to see the rules that apply to your property.

## How to use the checklist

1. Choose FHA, VA or USDA.
2. Set the property type, water source and sewage system. Well, septic, condo and manufactured-home rules appear only when they apply.
3. For a VA loan, choose your state to see whether a termite (wood-destroying insect) report is required.
4. Review the items marked **Common repair** first, then print the list for your agent or seller.

## The three programs at a glance

- **FHA:** {PR['FHA']['summary']}
- **VA:** {PR['VA']['summary']}
- **USDA:** {PR['USDA']['summary']}

## Requirements that commonly trigger repairs

| Category | Requirement | FHA (HUD 4000.1) | VA (M26-7 Ch. 12) | USDA |
|---|---|---|---|---|
{rows}

## Termite (WDO) reports

- **FHA:** {ld['wdo']['FHA']}
- **VA:** {ld['wdo']['VA']}
- **USDA:** {ld['wdo']['USDA']}

Need one? Find a {L('/termite-inspection/', 'termite inspector')}.

## Wells and septic systems

- **FHA:** {ld['well_septic']['FHA']}
- **VA:** {ld['well_septic']['VA']}
- **USDA:** {ld['well_septic']['USDA']}

See {L('/well-water-testing/', 'well water testing')} and {L('/septic-inspection/', 'septic inspections')}.

## Appraisal vs. home inspection

""" + "\n".join(f"- {t}" for t in ld["appraisal_vs_inspection"]) + f"""

A home inspector looks much more closely than an appraiser. For an FHA, VA or USDA purchase, book both. Find {L('/fha-va-usda-home-inspection/', 'inspectors for FHA, VA and USDA loans')}.

## Methodology

Each requirement is paraphrased from the official handbook with its section reference: {PR['FHA']['handbook']}, {PR['VA']['handbook']} and {PR['USDA']['handbook']}. USDA applies HUD 4000.1 standards to existing homes, plus its own well, septic and manufactured-home rules. Checked {ld['last_checked']}. Your lender and appraiser make the final call. Dataset: [lending.json](https://github.com/giveitlegs/hia-tools/blob/main/data/lending.json).

## Related guides

- {L('/blog/va-loan-home-inspection/', 'VA loan home inspection')}
- {L('/blog/home-inspection-vs-appraisal/', 'Home inspection vs. appraisal')}
- {L('/blog/is-a-home-inspection-required-for-a-mortgage/', 'Is a home inspection required for a mortgage?')}
- {L('/home-inspection-checklist/', 'Home inspection checklist')}
- {L('/mobile-home-inspection/', 'Mobile home inspection')}

## Sources

{src_list([(x['name'], x['url']) for x in ld['sources']])}

## Frequently asked questions

{faq([
 ("Does an FHA loan require a home inspection?", "No. FHA requires an appraisal that checks minimum property requirements, but not a home inspection. HUD's form 'For Your Protection: Get a Home Inspection' strongly recommends one."),
 ("Does a VA loan require a home inspection?", "No. The VA appraisal checks minimum property requirements. VA recommends a separate home inspection, and a termite report is required in many states."),
 ("What fails an FHA or VA appraisal?", "Common items are roof leaks or a worn-out roof, peeling paint on homes built before 1978, missing handrails, broken windows, inoperable heating, exposed wiring, water in the crawlspace, and signs of termites."),
 ("Who pays for FHA or VA required repairs?", "It is negotiated. Sellers often make the repairs so the loan can close, but buyers can agree to pay or the price can be adjusted. The repairs usually must be finished before closing."),
 ("Does USDA follow FHA property standards?", "Yes, for existing homes USDA uses HUD Handbook 4000.1 minimum property requirements, with added rules for wells, septic systems and manufactured homes."),
 ("Is a well water test required for an FHA loan?", "When the appraiser notes a well problem, for new construction, or when the area has known contamination risks. The test must be done by a disinterested third party."),
 ("Do VA loans require a termite inspection?", "In states rated moderate to very heavy for termites, yes, on every origination appraisal. Use the state selector in the tool to check yours."),
])}
"""

# ---------------------------------------------------------------- windmit
fl = J("florida")
qrows = "\n".join(f"| {q['q']} | {q['title'].split(':')[0]} | " + "; ".join(f"{o['code']}: {esc(o['credit_note']).split('. ')[0]}" for o in q["options"][:4]) + " |" for q in fl["questions"])
fp = fl["four_point"]
P["4-point-wind-mitigation-calculator"] = f"""# 4-Point & Wind Mitigation Savings Estimator

In Florida, a **wind mitigation inspection** documents features such as a hip roof, strong roof-to-wall straps and impact-rated windows on form OIR-B1-1802, and insurers must offer discounts for them. A **4-point inspection** (roof, electrical, plumbing, HVAC) is usually required to insure older homes: Citizens asks for one on homes over {fp['citizens']['home_age_trigger_years']} years old. Answer a few questions below to see which features may earn credits and whether your insurer is likely to ask for a 4-point.

## How to use the estimator

1. Enter the year the home was built and the year the roof was last fully replaced.
2. Pick the answers that match the form: roof covering, deck attachment, roof-to-wall connection, roof shape, secondary water resistance and opening protection. "Unknown" is fine. An inspector can confirm.
3. Read the credit potential and open "Feature by feature" for the notes on each answer.
4. Check the 4-point and roof-age guidance before you shop for insurance.

The estimator gives a **qualitative** band (minimal, limited, moderate, strong). Each insurer files its own discount factors with the Office of Insurance Regulation, so we do not promise a dollar amount.

## The wind mitigation form ({fl['form']['id']} {fl['form']['revision']})

The current form has 9 questions. It has been required for inspections completed on or after {fl['form']['required_for_inspections_on_or_after']}.

| # | Question | What the answers usually mean for credits |
|---|---|---|
{qrows}

The form is valid for up to {fl['validity']['years']} years if the structure has not changed.

## Who can sign a wind mitigation form

""" + "\n".join(f"- {w}" for w in fl["qualified_inspectors"]["list"]) + f"""

## 4-point inspections

- **Covers:** {', '.join(fp['what_it_covers'])}.
- **Citizens:** {fp['citizens']['home_age_trigger']} Form: {fp['citizens']['form_name']} ({fp['citizens']['form_revision']}).
- **Private carriers:** most ask at {fp['private_carrier_ranges']['home_age_trigger_years']['min']} or more years, some at 25 to 30. Report validity runs from 30 days to 1 year depending on the carrier. The Florida CFO guide puts the cost at about ${fp['private_carrier_ranges']['cost_usd']['min']}–${fp['private_carrier_ranges']['cost_usd']['max']}.
""" + "\n".join(f"- **Citizens roof rule:** {x}" for x in fp["citizens"]["roof_rules"][:2]) + f"""

## Florida roof-age law

""" + "\n".join(f"- {x['rule']} ({x['cite']})" for x in fp["roof_age_rules"][:3]) + f"""

## Find a Florida inspector

- {L('/wind-mitigation-inspection-florida/', 'Wind mitigation inspectors in Florida')}
- {L('/4-point-inspection-florida/', '4-point inspectors in Florida')}
- {L('/home-insurance-inspection-florida/', 'Home insurance inspections in Florida')}
- {L('/roof-inspection-florida/', 'Roof inspections in Florida')}
- {L('/home-inspectors-florida/', 'All Florida home inspectors')}

Learn more: {L('/wind-mitigation-inspection/', 'wind mitigation inspection')}, {L('/4-point-inspection/', '4-point inspection')}, {L('/blog/wind-mitigation-inspection-report/', 'reading a wind mitigation report')}.

## Methodology

Answers map to the questions on {fl['form']['id']} {fl['form']['revision']}. Credit notes follow s. 627.0629, Florida Statutes and how Citizens Property Insurance maps each answer in its Wind Loss Mitigation Guide. The band counts features that usually earn credits, weighting opening protection, roof shape, roof-to-wall and deck attachment more heavily. Checked {fl['last_checked']}. Dataset: [florida.json](https://github.com/giveitlegs/hia-tools/blob/main/data/florida.json).

## Sources

{src_list([(x['name'], x['url']) for x in fl['sources'][:8]])}

## Frequently asked questions

{faq([
 ("How much can a wind mitigation inspection save?", "It depends on your home and insurer. Florida law requires insurers to offer discounts for wind-resistant features, and opening protection, a hip roof and strong roof-to-wall connections usually earn the largest credits. Ask your insurer for its mitigation discount table."),
 ("How long is a wind mitigation report good for?", "Up to 5 years, as long as no material changes are made to the structure and the form has no inaccuracies."),
 ("What is the difference between a 4-point and a wind mitigation inspection?", "A 4-point checks the condition of the roof, electrical, plumbing and HVAC so an insurer can decide whether to cover an older home. A wind mitigation inspection documents features that reduce wind damage so you can get discounts."),
 ("When is a 4-point inspection required in Florida?", f"Citizens requires one for homes more than {fp['citizens']['home_age_trigger_years']} years old. Private carriers usually set the threshold at 20 to 30 years."),
 ("Can an insurer refuse my policy because of roof age?", "Not solely because of age if the roof is under 15 years old. For older roofs, you can get a roof inspection, and an insurer may not refuse solely due to age if the roof has at least 5 years of useful life left (s. 627.7011, F.S.)."),
 ("Who can do a wind mitigation inspection?", "A Florida licensed home inspector with hurricane mitigation training, a certified building code inspector, a licensed general, building or residential contractor, a professional engineer, an architect, or another person your insurer accepts."),
 ("How much does a 4-point inspection cost?", f"The Florida CFO consumer guide puts a standalone 4-point at about ${fp['private_carrier_ranges']['cost_usd']['min']} to ${fp['private_carrier_ranges']['cost_usd']['max']}. Many inspectors bundle it with a wind mitigation inspection or a full home inspection."),
])}
"""

# ---------------------------------------------------------------- contingency
ct = J("contingency"); G = ct["general"]
def _dd(s): return f"{s['default_days']} {s['day_type']}" if s["default_days"] else "Negotiated"
rows = "\n".join(f"| {s['name']} | {esc(s['form'])} | {_dd(s)} | {s['response_days'] if s['response_days'] is not None else '–'} |" for s in sorted(ct["states"], key=lambda x: x["name"]))
P["inspection-contingency-calculator"] = f"""# Inspection Contingency Deadline Calculator

Most home inspection contingency periods run **{G['typical_range_days']['min']} to {G['typical_range_days']['max']} days** from the date the contract is accepted, and {G['most_common_days']} days is the most common. Some states' standard forms set a default (California 17 days, Florida 15, Illinois 5 business days); others leave it to negotiation. Enter your acceptance date and contract terms below to get every deadline and add them to your calendar.

## How to use the calculator

1. Choose your state's contract, if it is listed. The default period, day type and seller response period fill in automatically.
2. Enter the contract acceptance (effective) date.
3. Change the number of days to match your signed contract.
4. Choose calendar or business days. Business days skip weekends and US federal holidays.
5. Download the .ics file to add the dates to Google Calendar, Outlook or Apple Calendar.

## Default inspection periods by state contract

| State | Contract form | Default inspection period | Seller response (days) |
|---|---|---|---|
{rows}

"Negotiated" means the form leaves a blank for the parties to fill in. The number in your signed contract always controls. Read the full notes for your state in the tool, including when counting starts.

## A typical inspection timeline

1. **Days 1–2:** book the home inspector and any add-ons such as {L('/radon-testing/', 'radon')}, {L('/sewer-scope-inspection/', 'sewer scope')} or {L('/termite-inspection/', 'termite')}.
2. **First third of the period:** the inspection happens. Radon tests need at least 48 hours.
3. **Middle:** read the report, call specialists, and get contractor quotes for big items.
4. **Before the deadline:** send your repair request, credit request or termination notice in writing.
5. **After the deadline:** the seller responds, and you accept, counter or walk away under your contract's terms.

## Methodology

The calculator counts from the day after acceptance. In business-day mode it skips Saturdays, Sundays and US federal holidays (observed dates). Suggested dates for booking and finishing inspections are planning aids, not contract terms. Form defaults come from each state association or regulator, checked {ct['last_checked']}. Dataset: [contingency.json](https://github.com/giveitlegs/hia-tools/blob/main/data/contingency.json). This is not legal advice. Talk to your agent or attorney.

## Related tools and guides

- {L('/blog/home-inspection-contingency/', 'Home inspection contingency explained')}
- {L('/blog/inspection-phase/', 'The inspection phase')}
- {L('/blog/negotiating-repairs-after-home-inspection/', 'Negotiating repairs after a home inspection')}
- {L('/repair-request-letter/', 'Repair request letter builder')}
- {L('/blog/how-long-does-a-home-inspection-take/', 'How long does a home inspection take?')}
- {L('/', 'Find a home inspector near you')}

## Sources

{src_list([(x['name'], x['url']) for x in ct['sources'][:10]])}

## Frequently asked questions

{faq([
 ("How many days do you have after a home inspection?", "It depends on your contract. Most inspection contingencies run 7 to 17 days from acceptance, and the deadline covers the inspection, your review and your repair request."),
 ("What is a standard home inspection contingency period?", f"National sources most often cite 7 to 10 days. California's form defaults to 17 days, Florida's AS IS contract to 15 days, and the Chicago-area Multi-Board 8.0 contract to 5 business days."),
 ("Does the contingency period include weekends?", "If your contract counts calendar days, yes. If it counts business days, weekends and legal holidays are skipped. Some forms also move a deadline that lands on a weekend to the next business day."),
 ("Can you extend the home inspection period?", "Only by written agreement with the seller, usually an amendment to the contract. Ask early if a specialist cannot come in time."),
 ("What happens if I miss the inspection deadline?", "You may lose the right to cancel or to request repairs under the contingency, and your earnest money may be at risk. Read your contract and talk to your agent right away."),
 ("Is the Texas option period the same as an inspection contingency?", "It works differently. The buyer pays an option fee for an unrestricted right to terminate during a negotiated number of days. There is no default length."),
])}
"""

# ---------------------------------------------------------------- repair
rf = ct["repair_forms"]; nm = {s["code"]: s["name"] for s in ct["states"]}
rows = "\n".join(f"| {nm.get(f['code'], f['code'])} | {esc(f['form'])} |" for f in sorted(rf, key=lambda x: nm.get(x['code'], x['code'])))
rp_groups = J("repair")["groups"]
ex_items = "\n".join(f"- **{g[0]}:** " + "; ".join(g[1][:3]) + "." for g in rp_groups)
P["repair-request-letter"] = f"""# Home Inspection Repair Request Letter Builder

A repair request letter lists the defects from your home inspection report and asks the seller to fix each one, give you a credit at closing, or lower the price. Build yours below: pick items from a list or paste them from your report, choose the ask for each, set a response date, then copy, print or download the letter. Everything stays in your browser.

## How to use the letter builder

1. Enter the buyer and seller names, the property address, and the contract and inspection dates.
2. Add items from the common-defects list, or paste lines from your report (one per line).
3. For each item, choose **Repair**, **Closing credit** or **Price reduction**, and enter an amount for credits.
4. Set a response date before your {L('/inspection-contingency-calculator/', 'inspection contingency deadline')}.
5. Copy the letter, save it as a PDF, or download a .doc. Send it to your agent, who puts the final terms on your state's form.

## What to ask for

- **Repairs** work for safety items and anything a lender requires. Ask for licensed contractors and receipts.
- **A closing credit** lets you hire your own contractor after closing. Lenders cap credits, so check with your loan officer.
- **A price reduction** lowers the loan amount and the purchase price. It helps most with big-ticket items like a roof or HVAC system.
- Focus on safety hazards and material defects, not cosmetic or maintenance items. Sellers respond better to a short, specific list with contractor quotes attached.

## Common items buyers include

{ex_items}

## State repair and amendment forms

| State | Form |
|---|---|
{rows}

In most transactions, the binding agreement is the signed addendum or amendment, not a letter. Use the letter to organize your request and share it with your agent.

## Related tools and guides

- {L('/blog/negotiating-repairs-after-home-inspection/', 'Negotiating repairs after a home inspection')}
- {L('/blog/what-happens-after-a-home-inspection/', 'What happens after a home inspection')}
- {L('/blog/things-that-fail-a-home-inspection/', 'Things that fail a home inspection')}
- {L('/sample-home-inspection-report/', 'Sample home inspection report')}
- {L('/home-inspection-checklist/', 'Home inspection checklist')}

## Sources

{src_list([(f"{nm.get(f['code'], f['code'])}: " + f['form'].split(' (')[0][:90], f['source_url']) for f in rf[:8]])}

## Frequently asked questions

{faq([
 ("How do I write a repair request after a home inspection?", "List each defect with its location and the page in the inspection report, say whether you want a repair, a credit or a price reduction, attach contractor quotes for large items, and set a response date before your contingency deadline."),
 ("Should I ask for repairs or a credit?", "Credits give you control over who does the work and how. Repairs make sense for safety items and anything your lender requires before closing."),
 ("What should not go on a repair request?", "Cosmetic items, routine maintenance, and things you knew about when you made your offer. A long list of small items can sour the negotiation."),
 ("Does the seller have to make repairs?", "Not usually. In most states the seller can agree, refuse or counter. Your contract's inspection contingency sets what happens if you cannot agree."),
 ("Do I need a special form?", "Many states and local associations have their own repair request or amendment form, such as TREC's Amendment to Contract in Texas or C.A.R.'s Request for Repair in California. Your agent will use the right one."),
 ("Is my letter saved?", "It is saved in this browser only so you can come back to it. Nothing is sent to Inspector Atlas."),
])}
"""
