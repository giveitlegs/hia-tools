/* Home inspection cost calculator: published size bands + property type ranges + add-ons, optional BEA RPP state adjustment. */
(function () {
  var D = /*DATA:cost*/null, ST = /*DATA:states*/null, F = /*FAQS*/[], E = HIA.el, $ = HIA.money;
  var r = HIA.mount('Home inspection cost calculator');
  var bySlug = {}, byCode = {}; ST.forEach(function (s) { bySlug[s[2]] = s; byCode[s[0]] = s; });
  var m = location.pathname.match(/home-inspection-cost-([a-z-]+?)\/?$/), pre = m && bySlug[m[1]] ? bySlug[m[1]][0] : '';
  var T = {}; D.types.forEach(function (t) { if (!T[t.key]) T[t.key] = t; });
  var v = { st: pre, sqft: 2000, year: 1995, fnd: 'slab', type: 'single_family', adj: true, add: {} };
  var types = [['single_family', 'Single-family home'], ['townhome', 'Townhome'], ['condo', 'Condo'], ['mobile_single', 'Mobile home, single-wide'], ['mobile_double', 'Mobile home, double-wide'], ['multi_family', 'Multi-family (2-4 units)'], ['new_construction', 'New construction']];
  var out = E('div', { class: 'hia-result', 'aria-live': 'polite' });
  function band(sq) {
    var b = D.bands, last = b[b.length - 1];
    for (var i = 0; i < b.length; i++) if (sq <= b[i].max_sqft) return [b[i].low, b[i].high, 'HomeGuide size band ' + b[i].min_sqft.toLocaleString() + '–' + b[i].max_sqft.toLocaleString() + ' sq ft'];
    var extra = Math.ceil((sq - last.max_sqft) / 500) * D.over;
    return [last.low + extra, last.high + extra, 'Largest published band (' + $(last.low) + '–' + $(last.high) + ' up to 3,000 sq ft) plus about ' + $(D.over) + ' per extra 500 sq ft (Angi)'];
  }
  function calc() {
    var notes = [], lo, hi, f = 1, s = byCode[v.st];
    if (v.type === 'single_family' || v.type === 'townhome') { var b = band(v.sqft); lo = b[0]; hi = b[1]; notes.push(b[2]); }
    else { var t = T[v.type]; lo = t.low; hi = t.high; notes.push(t.label + ': published range ' + $(t.low) + '–' + $(t.high)); }
    var olo = 0, ohi = 0;
    if (v.year && v.year < 1980) { olo = D.older.low; ohi = D.older.high; notes.push('Built before 1980: older homes can add ' + $(olo) + '–' + $(ohi) + ' (HomeGuide)'); }
    if (v.fnd !== 'slab') notes.push('A ' + v.fnd + ' adds inspection time; sources describe this but publish no dollar figure, so it is not priced in.');
    if (s && v.adj) { f = D.rpp[s[0]] / 100; notes.push(s[1] + ' price level ' + D.rpp[s[0]].toFixed(1) + ' vs US 100 (BEA RPP ' + D.rpp_year + '); all figures multiplied by ' + f.toFixed(3) + '.'); }
    var alo = 0, ahi = 0, rows = [];
    D.addons.forEach(function (a) { if (v.add[a.key]) { alo += a.low; ahi += a.high; rows.push([a.label, HIA.round(a.low * f), HIA.round(a.high * f)]); } });
    var bl = HIA.round((lo + olo) * f), bh = HIA.round((hi + ohi) * f), tl = HIA.round((lo + olo + alo) * f), th = HIA.round((hi + ohi + ahi) * f);
    out.innerHTML = '';
    out.appendChild(E('div', { class: 'hia-muted', text: 'Estimated total' + (s ? ' in ' + s[1] : ' (US typical)') }));
    out.appendChild(E('div', { class: 'hia-big', text: $(tl) + ' – ' + $(th) }));
    out.appendChild(E('div', { class: 'hia-muted', style: 'margin-top:4px', text: 'Midpoint about ' + $(HIA.round((tl + th) / 2)) }));
    var tb = E('table', { class: 'hia-table', style: 'min-width:0;margin-top:10px;background:#fff' },
      E('thead', null, E('tr', null, E('th', { text: 'Item' }), E('th', { class: 'n', text: 'Low' }), E('th', { class: 'n', text: 'High' }))),
      E('tbody', null, [E('tr', null, E('td', { text: 'Base inspection' }), E('td', { class: 'n', text: $(bl) }), E('td', { class: 'n', text: $(bh) }))].concat(
        rows.map(function (x) { return E('tr', null, E('td', { text: x[0] }), E('td', { class: 'n', text: $(x[1]) }), E('td', { class: 'n', text: $(x[2]) })); }))));
    out.appendChild(tb);
    out.appendChild(E('details', null, E('summary', { text: 'How this was calculated' }), E('div', null, E('ul', { style: 'margin:0 0 0 18px;padding:0;font-size:13.5px' }, notes.map(function (n) { return E('li', { text: n }); })))));
    if (s) out.appendChild(E('p', { style: 'margin:10px 0 0' }, HIA.link('/home-inspection-cost-' + s[2] + '/', 'Home inspection cost in ' + s[1]), ' · ', HIA.link('/home-inspectors-' + s[2] + '/', 'Find inspectors in ' + s[1])));
  }
  function u(k, n) { return function (e) { v[k] = n ? (parseFloat(e.target.value) || 0) : e.target.value; calc(); }; }
  var adds = E('fieldset', { style: 'border:0;padding:0;margin:12px 0 0' }, E('legend', { style: 'font-weight:600;font-size:14px;margin-bottom:4px', text: 'Add-on tests and inspections' }),
    E('div', { class: 'hia-grid', style: 'gap:0 16px' }, D.addons.map(function (a) {
      return HIA.check(a.label + ' (' + $(a.low) + '–' + $(a.high) + ')', false, function (e) { v.add[a.key] = e.target.checked; calc(); }); })));
  var adj = HIA.check('Adjust for state price level (BEA RPP)', true, function (e) { v.adj = e.target.checked; calc(); });
  var form = E('div', null, E('div', { class: 'hia-grid' },
    HIA.field('State', HIA.select([['', 'United States (no adjustment)']].concat(ST.map(function (s) { return [s[0], s[1]]; })), v.st, u('st'))),
    HIA.field('Property type', HIA.select(types, v.type, u('type'))),
    HIA.field('Square footage', HIA.num(v.sqft, 300, 15000, 50, u('sqft', 1)), 'Finished living area'),
    HIA.field('Year built', HIA.num(v.year, 1800, 2027, 1, u('year', 1))),
    HIA.field('Foundation', HIA.select([['slab', 'Slab'], ['crawlspace', 'Crawlspace'], ['basement', 'Basement']], v.fnd, u('fnd')))), adj, adds);
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Estimate your inspection cost' }), E('span', { class: 'hia-kicker', text: 'Published ranges, checked ' + D.last_checked })));
  r.appendChild(E('div', { class: 'hia-cols' }, form, E('div', null, out)));
  r.appendChild(E('p', { class: 'hia-foot' }, 'Ranges come from published cost guides (', D.src.slice(0, 4).map(function (s, i) { return [i ? ', ' : '', E('a', { href: s.url, rel: 'nofollow', text: s.name })]; }).reduce(function (a, b) { return a.concat(b); }, []),
    '). The state adjustment uses ', E('a', { href: D.rpp_src, text: 'BEA Regional Price Parities' }), ', a general cost-of-living index, not a survey of inspection fees. Your quote may differ. Ask inspectors for a written price.'));
  calc();
  HIA.seo({ name: 'Home Inspection Cost Calculator', desc: 'Estimate home inspection cost by state, square footage, property type, home age and add-ons such as radon, sewer scope and termite inspections.', cat: 'FinanceApplication', faqs: F });
})();
