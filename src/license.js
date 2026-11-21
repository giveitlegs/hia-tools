/* Home inspector license requirements by state: searchable, sortable table + state detail card. */
(function () {
  var F = /*FAQS*/[], E = HIA.el;
  var r = HIA.mount('Home inspector license requirements by state');
  r.appendChild(E('p', { class: 'hia-muted', text: 'Loading the 50-state table…' }));
  HIA.data('licensing', start, function () { r.innerHTML = ''; r.appendChild(E('p', { text: 'The table could not load. The same requirements are listed in the text below.' })); });
  function start(D) {
  r.innerHTML = '';
  var S = D.states, cur = '';
  var m = location.pathname.match(/how-to-become-a-home-inspector-([a-z-]+?)\/?$/);
  if (m) S.forEach(function (s) { if (s.slug === m[1]) cur = s.code; });
  function req(s) { return s.license_required === true ? E('span', { class: 'hia-chip ok', text: 'Required' }) : s.license_required === 'partial' ? E('span', { class: 'hia-chip part', text: 'Partial' }) : E('span', { class: 'hia-chip no', text: 'No state license' }); }
  function reqN(s) { return s.license_required === true ? 2 : s.license_required === 'partial' ? 1 : 0; }
  var card = E('div', { class: 'hia-result', 'aria-live': 'polite', tabindex: '-1' });
  function detail() {
    card.innerHTML = '';
    var s = S.filter(function (x) { return x.code === cur; })[0];
    if (!s) { card.appendChild(E('p', { style: 'margin:0', text: 'Pick a state to see the full requirements, or use the table below. ' + S.filter(function (x) { return x.license_required === true; }).length + ' of ' + S.length + ' jurisdictions require a state license.' })); return; }
    card.appendChild(E('div', { class: 'hia-row', style: 'justify-content:space-between' }, E('h3', { style: 'margin:0', text: s.name }), req(s)));
    var dl = E('dl', { style: 'display:grid;grid-template-columns:minmax(110px,auto) minmax(0,1fr);gap:4px 12px;margin:10px 0;font-size:14px' });
    [['Credential', s.credential], ['Regulator', s.regulator_url ? E('a', { href: s.regulator_url, text: s.regulator || s.regulator_url }) : s.regulator], ['Pre-license training', s.prelicense_hours ? s.prelicense_hours + ' hours' : 'None set by the state'],
      ['Field training', s.field_training], ['Exam', s.exam], ['Insurance', s.insurance], ['Continuing ed.', s.ce], ['Renewal', s.renewal], ['Fees', s.fees]].forEach(function (x) {
      if (x[1] == null || x[1] === '') return; dl.appendChild(E('dt', { style: 'font-weight:700;color:var(--m)', text: x[0] })); dl.appendChild(E('dd', { style: 'margin:0' }, x[1]));
    });
    card.appendChild(dl);
    if (s.notes) card.appendChild(E('p', { style: 'font-size:14px', text: s.notes }));
    card.appendChild(E('p', { style: 'margin:0', class: 'hia-muted' }, s.source_url ? E('a', { href: s.source_url, text: 'Official source' }) : null, ' · Checked ' + D.last_checked + ' · ',
      HIA.link('/how-to-become-a-home-inspector-' + s.slug + '/', 'How to become a home inspector in ' + s.name), ' · ', HIA.link('/home-inspectors-' + s.slug + '/', 'Find inspectors in ' + s.name)));
  }
  var sel = HIA.select([['', 'Choose a state']].concat(S.map(function (s) { return [s.code, s.name]; })), cur, function (e) { cur = e.target.value; detail(); });
  var count = E('span', { class: 'hia-muted', 'aria-live': 'polite' });
  var onlyReq = false;
  var tbl = HIA.table([
    { k: 'name', label: 'State', cell: function (s) { return HIA.link('/how-to-become-a-home-inspector-' + s.slug + '/', s.name); } },
    { k: 'license_required', label: 'License', sort: reqN, cell: req },
    { k: 'prelicense_hours', label: 'Training hrs', num: 1, cell: function (s) { return s.prelicense_hours ? String(s.prelicense_hours) : '–'; } },
    { k: 'exam', label: 'Exam' },
    { k: 'insurance', label: 'Insurance' },
    { k: 'ce', label: 'CE' },
    { k: 'more', label: '', nosort: 1, cell: function (s) { return E('button', { type: 'button', class: 'hia-btn ghost', style: 'min-height:36px;padding:4px 10px', 'aria-label': 'Details for ' + s.name, text: 'Details',
      onclick: function () { cur = s.code; sel.value = cur; detail(); card.focus(); card.scrollIntoView({ block: 'nearest' }); } }); } }
  ], S, { caption: 'Home inspector license requirements by state', tall: 1, match: function (s, f) { return (!onlyReq || s.license_required === true) && (!f || (s.name + ' ' + s.code).toLowerCase().indexOf(f) > -1); },
    onDraw: function (n) { count.textContent = n + ' shown'; } });
  var q = E('input', { type: 'search', placeholder: 'Search states', 'aria-label': 'Search states' });
  function filt() { tbl.filter(q.value); }
  q.addEventListener('input', filt);
  HIA.css('.hia-lic .hia-table{min-width:900px}.hia-lic .hia-table td{font-size:13.5px}');
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'License requirements by state' }), E('span', { class: 'hia-kicker', text: 'Checked ' + D.last_checked })));
  r.appendChild(E('div', { class: 'hia-cols' }, E('div', null, HIA.field('State', sel)), card));
  r.appendChild(E('div', { class: 'hia-row', style: 'margin:18px 0 8px;justify-content:space-between' }, E('div', { style: 'flex:1 1 220px;max-width:320px' }, q),
    HIA.check('License required only', false, function (e) { onlyReq = e.target.checked; filt(); }), count));
  r.appendChild(E('div', { class: 'hia-lic' }, tbl.node));
  r.appendChild(E('p', { class: 'hia-foot', text: 'Each row was checked against the state regulator, statute or administrative code. Rules change: confirm with the regulator before you enroll in a course or apply. "Partial" means the state regulates inspectors without a standard license (for example, association membership or registration rules).' }));
  detail();
  HIA.seo({ name: 'Home Inspector License Requirements by State', desc: 'Searchable table of home inspector licensing rules in all 50 states and DC: regulator, training hours, exam, insurance, continuing education and renewal.', cat: 'ReferenceApplication', faqs: F });
}
})();
