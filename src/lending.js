/* FHA / VA / USDA minimum property requirements checklist, filtered by loan, property, water and sewage. */
(function () {
  var ST = /*DATA:states*/null, F = /*FAQS*/[], E = HIA.el;
  var r = HIA.mount('FHA, VA and USDA property requirements checklist');
  r.appendChild(E('p', { class: 'hia-muted', text: 'Loading the property requirements…' }));
  HIA.data('lending', start, function () { r.innerHTML = ''; r.appendChild(E('p', { text: 'The checklist could not load. The same requirements are summarized in the text below.' })); });
  function start(D) {
  r.innerHTML = '';
  HIA.css('.hia-ln summary{justify-content:space-between}.hia-ln li{margin:5px 0;list-style:none;display:grid;grid-template-columns:22px minmax(0,1fr);gap:6px}.hia-ln ul{margin:0;padding:0}' +
    '.hia-ln li::before{content:"";width:14px;height:14px;border:2px solid var(--i);border-radius:3px;margin-top:4px}.hia-ref{font-size:12px;color:var(--m)}');
  var all = false;
  var v = { loan: 'FHA', type: 'house', water: 'public', sewer: 'public', pre78: false, st: '' };
  var out = E('div', { class: 'hia-ln', 'aria-live': 'polite' });
  function applies(i) {
    if (!i.programs[v.loan]) return false;
    return i.applies === 'all' || (i.applies === 'well' && v.water === 'well') || (i.applies === 'septic' && v.sewer === 'septic') ||
      (i.applies === 'manufactured' && v.type === 'manufactured') || (i.applies === 'condo' && v.type === 'condo') || (i.applies === 'pre1978' && v.pre78);
  }
  function draw() {
    out.innerHTML = '';
    var P = D.programs[v.loan], list = D.items.filter(applies), cats = {}, order = [];
    list.forEach(function (i) { if (!cats[i.category]) { cats[i.category] = []; order.push(i.category); } cats[i.category].push(i); });
    out.appendChild(E('p', null, E('strong', { text: P.name + ': ' }), P.summary + ' ', E('a', { href: P.url, text: P.handbook })));
    var nc = list.filter(function (i) { return i.common_repair; }).length;
    out.appendChild(E('p', { class: 'hia-muted', text: list.length + ' requirements apply to this property. ' + nc + ' of them commonly lead to a repair condition (marked).' }));
    order.forEach(function (c, ci) {
      var n = cats[c].filter(function (i) { return i.common_repair; }).length;
      var d = E('details', { open: ci < 2 || all }, E('summary', null, c, E('span', { class: 'hia-muted', text: cats[c].length + (cats[c].length === 1 ? ' item' : ' items') + (n ? ', ' + n + ' common repair' : '') })));
      d.appendChild(E('div', null, E('ul', null, cats[c].map(function (i) {
        return E('li', null, E('div', null, i.text + ' ', i.common_repair ? E('span', { class: 'hia-chip bad', text: 'Common repair' }) : null, E('div', { class: 'hia-ref', text: i.programs[v.loan] })));
      }))));
      out.appendChild(d);
    });
    var w = D.wdo[v.loan], vaNote = '';
    if (v.loan === 'VA' && v.st) vaNote = D.va_wdo_full.indexOf(v.st) > -1 ? 'Your state is on VA\'s list: a wood-destroying insect report is required statewide.' :
      D.va_wdo_part.indexOf(v.st) > -1 ? 'Your state is on VA\'s list for certain counties only. Ask your lender whether your county needs a report.' : 'Your state is not on VA\'s list, so a report is needed only if the appraiser notes a problem.';
    out.appendChild(E('div', { class: 'hia-note' }, E('h3', { text: 'Termite / WDO report' }), vaNote ? E('p', null, E('strong', { text: vaNote })) : null, E('p', { style: 'margin:0', text: w })));
    if (v.water === 'well' || v.sewer === 'septic') out.appendChild(E('div', { class: 'hia-note' }, E('h3', { text: 'Well and septic' }), E('p', { style: 'margin:0', text: D.ws[v.loan] })));
    out.appendChild(E('details', null, E('summary', { text: 'Appraisal vs. home inspection' }), E('div', null, E('ul', { style: 'margin:0 0 0 18px;padding:0' }, D.avi.map(function (t) { return E('li', { style: 'display:list-item;list-style:disc', text: t }); })))));
  }
  function u(k) { return function (e) { v[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value; draw(); }; }
  var tabs = E('div', { class: 'hia-tabs', role: 'group', 'aria-label': 'Loan type' });
  ['FHA', 'VA', 'USDA'].forEach(function (k) {
    tabs.appendChild(E('button', { type: 'button', 'aria-pressed': String(k === v.loan), text: k + ' loan', onclick: function () {
      v.loan = k; [].forEach.call(tabs.children, function (b) { b.setAttribute('aria-pressed', String(b.textContent === k + ' loan')); }); draw(); } }));
  });
  var form = E('div', { class: 'hia-grid' },
    HIA.field('Property type', HIA.select([['house', 'House / townhome'], ['condo', 'Condo unit'], ['manufactured', 'Manufactured home']], v.type, u('type'))),
    HIA.field('Water', HIA.select([['public', 'Public water'], ['well', 'Private well']], v.water, u('water'))),
    HIA.field('Sewage', HIA.select([['public', 'Public sewer'], ['septic', 'Septic system']], v.sewer, u('sewer'))),
    HIA.field('State (for VA termite rules)', HIA.select([['', 'Any state']].concat(ST.map(function (s) { return [s[0], s[1]]; })), v.st, u('st'))));
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Government loan property checklist' }), E('span', { class: 'hia-kicker', text: 'Handbooks checked ' + D.last_checked })));
  r.appendChild(tabs);
  r.appendChild(form);
  r.appendChild(E('div', { class: 'hia-row hia-noprint', style: 'margin:10px 0' }, HIA.check('Built before 1978 (lead paint rules)', false, u('pre78')), HIA.btn('Expand all', function () { all = !all; draw(); }, 'ghost'), HIA.btn('Print / save PDF', function () { all = true; draw(); HIA.printNode(r); }, 'ghost')));
  r.appendChild(out);
  r.appendChild(E('p', { class: 'hia-foot' }, 'Plain-English summaries of the official handbooks, with section references. Your lender and appraiser make the final call. Sources: ', D.sources.slice(0, 3).map(function (s, i) { return [i ? '; ' : '', E('a', { href: s.url, text: s.name.split(',')[0] })]; }).reduce(function (a, b) { return a.concat(b); }, []), '.'));
  draw();
  HIA.seo({ type: 'HowTo', name: 'How to check a home against FHA, VA and USDA property requirements', desc: 'Checklist of FHA, VA and USDA minimum property requirements with handbook references, termite and well/septic rules.',
    steps: [['Pick your loan type', 'Choose FHA, VA or USDA to load that program\'s minimum property requirements.'], ['Describe the property', 'Select the property type, water source and sewage system so only the rules that apply are shown.'],
      ['Review common repair items', 'Look for items marked as common repairs, such as peeling paint, missing handrails or roof defects, and fix them before the appraisal.'], ['Check termite and well rules', 'Confirm whether a wood-destroying insect report, well water test or septic evaluation is needed.'],
      ['Book a home inspection', 'The appraisal is not a home inspection. Hire an inspector to look at the systems the appraiser does not test.']], faqs: F });
}
})();
