/* Home inspector insurance cost estimator: published E&O/GL ranges + sourced factor effects + state mandates. */
(function () {
  var D = /*DATA:insurance*/null, L = /*DATA:licensing*/null, F = /*FAQS*/[], E = HIA.el, $ = HIA.money;
  var r = HIA.mount('Home inspector insurance cost estimator');
  var C = D.consensus, eo = C.eo_per_year, gl = C.gl_per_year;
  var LIM = ['$100k / $100k', '$300k / $300k', '$500k / $500k', '$1M / $1M', '$1M / $2M'], BASE = 3; /* Insureon median is quoted at $1M/$1M */
  var DED = ['$1,000–$1,500', '$2,500', '$5,000'];
  var ANC = [['mold', 'Mold'], ['radon', 'Radon'], ['wdo', 'Termite / WDO'], ['pool', 'Pool / spa'], ['sewer', 'Sewer scope'], ['drone', 'Drone roof']];
  var v = { st: '', n: 250, lim: 3, ded: 0, anc: {}, yrs: 3, claims: 'none', gl: true };
  var out = E('div', { class: 'hia-result', 'aria-live': 'polite' });
  var states = (L && L.states) || [];
  function calc() {
    var steps = v.lim - BASE, n = 0, k, notes = [];
    for (k in v.anc) if (v.anc[k]) n++;
    var lo = eo.typical + (steps > 0 ? steps * 50 : steps * 300), hi = eo.typical + (steps > 0 ? steps * 300 : steps * 50);
    if (steps) notes.push('Limits ' + LIM[v.lim] + ': ' + Math.abs(steps) + ' tier(s) ' + (steps > 0 ? 'above' : 'below') + ' $1M/$1M at $50–$300 per tier (InspectorPro).');
    if (n) { lo *= 1 + 0.01 * n; hi *= 1 + 0.15 * n; notes.push(n + ' ancillary endorsement(s) at 1%–15% each (InspectorPro).'); }
    if (v.ded) { lo *= 1 - 0.15 * v.ded; hi *= 1 - 0.03 * v.ded; notes.push('Higher deductible: 3%–15% less per tier (InspectorPro).'); }
    lo = Math.max(eo.low * 0.5, lo);
    var upper = v.n > 400 || v.claims !== 'none' || v.yrs < 2, lower = v.n < 150 && v.claims === 'none' && v.yrs >= 5;
    if (v.n > 400) notes.push('High volume: more inspections means more exposure and a higher premium (InspectorPro, Insureon).');
    if (v.claims !== 'none') notes.push('Prior claims: expect to pay more; some carriers may decline (Insureon).');
    if (v.yrs < 2) notes.push('New business: newer inspectors usually see higher rates than experienced ones.');
    if (lower) notes.push('Low volume, 5+ years and no claims: you may land near the low end; some programs give loss-free discounts.');
    if (upper) { lo = (lo + hi) / 2; hi *= 1.25; }
    if (lower) { hi = (lo + hi) / 2; }
    var glLo = v.gl ? gl.low : 0, glHi = v.gl ? gl.high : 0;
    out.innerHTML = '';
    out.appendChild(E('div', { class: 'hia-muted', text: 'Estimated annual premium' + (v.gl ? ' (E&O + general liability)' : ' (E&O only)') }));
    out.appendChild(E('div', { class: 'hia-big', text: $(HIA.round(lo + glLo, 25)) + ' – ' + $(HIA.round(hi + glHi, 25)) }));
    out.appendChild(E('div', { class: 'hia-grid', style: 'margin-top:10px' },
      E('div', null, E('div', { class: 'hia-muted', text: 'E&O estimate' }), E('strong', { text: $(HIA.round(lo, 25)) + ' – ' + $(HIA.round(hi, 25)) })),
      v.gl ? E('div', null, E('div', { class: 'hia-muted', text: 'General liability (published range)' }), E('strong', { text: $(gl.low) + ' – ' + $(gl.high) })) : null));
    out.appendChild(E('details', null, E('summary', { text: 'Assumptions' }), E('div', null, E('ul', { style: 'margin:0 0 0 18px;padding:0;font-size:13.5px' },
      [E('li', { text: 'Starting point: typical E&O about ' + $(eo.typical) + '/yr at $1M/$1M limits (published range ' + $(eo.low) + '–' + $(eo.high) + ').' })].concat(notes.map(function (t) { return E('li', { text: t }); }))))));
    var s = states.filter(function (x) { return x.code === v.st; })[0];
    if (s) {
      var req = s.license_required === true ? 'License required' : s.license_required === 'partial' ? 'Partial regulation' : 'No state license';
      out.appendChild(E('div', { class: 'hia-note' }, E('strong', { text: s.name + ' insurance rule: ' }), (s.insurance || 'Not specified') + ' ', E('span', { class: 'hia-chip', text: req }), ' ',
        HIA.link('/how-to-become-a-home-inspector-' + s.slug + '/', 'Becoming an inspector in ' + s.name)));
    }
  }
  function u(k, n) { return function (e) { v[k] = n ? (parseFloat(e.target.value) || 0) : e.target.value; calc(); }; }
  var form = E('div', null, E('div', { class: 'hia-grid' },
    HIA.field('State', HIA.select([['', 'Choose a state']].concat(states.map(function (s) { return [s.code, s.name]; })), v.st, u('st'))),
    HIA.field('Inspections per year', HIA.num(v.n, 0, 3000, 10, u('n', 1))),
    HIA.field('E&O limits (per claim / aggregate)', HIA.select(LIM.map(function (l, i) { return [i, l]; }), v.lim, u('lim', 1))),
    HIA.field('Deductible', HIA.select(DED.map(function (l, i) { return [i, l]; }), v.ded, u('ded', 1))),
    HIA.field('Years in business', HIA.num(v.yrs, 0, 60, 1, u('yrs', 1))),
    HIA.field('Claims in the last 5 years', HIA.select([['none', 'None'], ['one', 'One'], ['more', 'Two or more']], v.claims, u('claims')))),
    E('fieldset', { style: 'border:0;padding:0;margin:12px 0 0' }, E('legend', { style: 'font-weight:600;font-size:14px', text: 'Ancillary services you offer' }),
      E('div', { class: 'hia-grid', style: 'gap:0 16px' }, ANC.map(function (a) { return HIA.check(a[1], false, function (e) { v.anc[a[0]] = e.target.checked; calc(); }); }))),
    HIA.check('Include general liability', true, function (e) { v.gl = e.target.checked; calc(); }));
  var tbl = HIA.table([
    { k: 'name', label: 'Source', cell: function (p) { return E('a', { href: p.url, rel: 'nofollow', text: p.name }); } },
    { k: 'coverage', label: 'Coverage' },
    { k: 'fig', label: 'Published figure', nosort: 1, cell: function (p) { var u = p.per === 'month' ? '/mo' : '/yr';
      return p.median != null ? 'Median ' + $(p.median) + u : (p.low != null ? $(p.low) + (p.high ? '–' + $(p.high) : '+') + u : '–'); } },
    { k: 'limits', label: 'Limits', cell: function (p) { return p.limits || '–'; } }
  ], D.premiums.filter(function (p) { return !/HISTORICAL/.test(p.notes || ''); }), { caption: 'Published home inspector insurance premiums' });
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Estimate your insurance cost' }), E('span', { class: 'hia-kicker', text: 'Checked ' + D.last_checked })));
  r.appendChild(E('div', { class: 'hia-cols' }, form, E('div', null, out)));
  r.appendChild(E('h3', { style: 'margin-top:20px', text: 'Published premium figures' }));
  r.appendChild(tbl.node);
  r.appendChild(E('p', { class: 'hia-foot', text: 'An estimate built from published broker and carrier figures, not a quote. Premiums depend on the carrier, your state, revenue, limits, deductible and claims history. Get quotes from at least two brokers.' }));
  calc();
  HIA.seo({ name: 'Home Inspector Insurance Cost Estimator', desc: 'Estimate annual E&O and general liability premiums for a home inspection business, with state insurance requirements and published premium figures.', cat: 'FinanceApplication', faqs: F });
})();
