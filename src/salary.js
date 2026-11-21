/* Home inspector salary by state (BLS OEWS 47-4011) + self-employed income estimator. */
(function () {
  var D = /*DATA:salary*/null, F = /*FAQS*/[], E = HIA.el, $ = HIA.money;
  var r = HIA.mount('Home inspector salary by state and income estimator');
  var S = D.states, byCode = {}; S.forEach(function (s) { byCode[s.code] = s; });
  var v = { st: '', per: 6, fee: 400, add: 75, wk: 48, ins: 2500, soft: 1200, veh: 6000, mkt: 3000, dues: 800, tools: 1000 };
  var out = E('div', { class: 'hia-result', 'aria-live': 'polite' });
  function upd(k) { return function (e) { v[k] = k === 'st' ? e.target.value : Math.max(0, parseFloat(e.target.value) || 0); calc(); if (k === 'st') tbl.redraw(); }; }
  function calc() {
    var s = byCode[v.st] || null, ref = s || D.national;
    var gross = v.per * v.wk * (v.fee + v.add), exp = v.ins + v.soft + v.veh + v.mkt + v.dues + v.tools, net = gross - exp;
    out.innerHTML = '';
    out.appendChild(E('div', { class: 'hia-muted', text: 'Estimated self-employed net income (before income tax)' }));
    out.appendChild(E('div', { class: 'hia-big', text: $(net) + ' / yr' }));
    out.appendChild(E('p', { class: 'hia-muted', style: 'margin-top:6px', text: (v.per * v.wk) + ' inspections × ' + $(v.fee + v.add) + ' = ' + $(gross) + ' revenue, minus ' + $(exp) + ' expenses. Self-employment tax (15.3% on most net earnings) is not deducted.' }));
    out.appendChild(E('div', { class: 'hia-grid', style: 'margin-top:10px' },
      E('div', null, E('div', { class: 'hia-muted', text: 'BLS median, ' + (s ? s.name : 'United States') }), E('strong', { text: $(ref.median_annual) })),
      E('div', null, E('div', { class: 'hia-muted', text: 'Middle 50% (25th–75th)' }), E('strong', { text: $(ref.p25) + ' – ' + $(ref.p75) })),
      E('div', null, E('div', { class: 'hia-muted', text: 'Top 10% earn over' }), E('strong', { text: $(ref.p90) }))));
    if (s) out.appendChild(E('p', { style: 'margin:10px 0 0' }, HIA.link('/how-to-become-a-home-inspector-' + s.slug + '/', 'How to become a home inspector in ' + s.name)));
  }
  var opts = [['', 'United States (national)']].concat(S.map(function (s) { return [s.code, s.name]; }));
  var form = E('div', { class: 'hia-grid' },
    HIA.field('State', HIA.select(opts, v.st, upd('st'))),
    HIA.field('Inspections per week', HIA.num(v.per, 0, 40, 1, upd('per'))),
    HIA.field('Average inspection fee ($)', HIA.num(v.fee, 0, 3000, 5, upd('fee')), 'Base fee for a typical home'),
    HIA.field('Add-on revenue per inspection ($)', HIA.num(v.add, 0, 2000, 5, upd('add')), 'Radon, WDO, sewer scope, etc., averaged'),
    HIA.field('Weeks worked per year', HIA.num(v.wk, 1, 52, 1, upd('wk'))));
  var exp = E('details', null, E('summary', { text: 'Annual business expenses (edit to match yours)' }), E('div', { class: 'hia-grid' },
    HIA.field('E&O + general liability insurance', HIA.num(v.ins, 0, 50000, 50, upd('ins'))),
    HIA.field('Report software', HIA.num(v.soft, 0, 20000, 50, upd('soft'))),
    HIA.field('Vehicle and fuel', HIA.num(v.veh, 0, 50000, 100, upd('veh'))),
    HIA.field('Marketing and website', HIA.num(v.mkt, 0, 50000, 100, upd('mkt'))),
    HIA.field('License, CE and association dues', HIA.num(v.dues, 0, 20000, 50, upd('dues'))),
    HIA.field('Tools and equipment', HIA.num(v.tools, 0, 50000, 100, upd('tools')))));
  var tbl = HIA.table([
    { k: 'name', label: 'State', cell: function (s) { return HIA.link('/how-to-become-a-home-inspector-' + s.slug + '/', s.name); } },
    { k: 'median_annual', label: 'Median', num: 1, cell: function (s) { return $(s.median_annual); } },
    { k: 'mean_annual', label: 'Mean', num: 1, cell: function (s) { return $(s.mean_annual); } },
    { k: 'p10', label: '10th pct', num: 1, cell: function (s) { return s.p10 ? $(s.p10) : '–'; } },
    { k: 'p90', label: '90th pct', num: 1, cell: function (s) { return s.p90 ? $(s.p90) : '–'; } },
    { k: 'employment', label: 'Jobs', num: 1, cell: function (s) { return s.employment ? s.employment.toLocaleString('en-US') : '–'; } }
  ], S, { sort: 'median_annual', dir: -1, tall: 1, caption: 'Construction and building inspector wages by state, BLS ' + D.reference_period,
    rowClass: function (s) { return s.code === v.st ? 'hia-hl' : null; } });
  HIA.css('.hia-table tr.hia-hl>*{background:#ECEDF8}');
  var q = E('input', { type: 'search', placeholder: 'Filter states', 'aria-label': 'Filter states', oninput: function (e) { tbl.filter(e.target.value); } });
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Home inspector income estimator' }), E('span', { class: 'hia-kicker', text: 'BLS data: ' + D.reference_period })));
  r.appendChild(E('div', { class: 'hia-cols' }, E('div', null, form, exp), out));
  r.appendChild(E('h3', { style: 'margin-top:22px', text: 'Wages by state (employees, SOC ' + D.soc + ')' }));
  r.appendChild(E('div', { style: 'max-width:320px;margin-bottom:8px' }, q));
  r.appendChild(tbl.node);
  r.appendChild(E('p', { class: 'hia-foot' }, D.note + ' OEWS wages exclude the self-employed. National median ' + $(D.national.median_annual) + ', ' + D.national.employment.toLocaleString('en-US') + ' jobs. Source: ',
    E('a', { href: 'https://www.bls.gov/oes/', text: 'BLS Occupational Employment and Wage Statistics' }), ', ' + D.reference_period + '. Expense defaults are placeholders, not survey data.'));
  calc();
  HIA.seo({ name: 'Home Inspector Salary by State and Income Estimator', desc: 'BLS wage data for construction and building inspectors by state, plus a calculator that estimates self-employed home inspector income from volume, fees and expenses.', cat: 'FinanceApplication', faqs: F });
})();
