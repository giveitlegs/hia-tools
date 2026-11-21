/* Annotated sample home inspection report viewer with section toggles, severity filter, print and blank template download. */
(function () {
  var D = /*DATA:report*/null, F = /*FAQS*/[], E = HIA.el;
  var r = HIA.mount('Sample home inspection report');
  HIA.css('.hia-rp-meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:6px 14px;font-size:13.5px;background:var(--p);border-radius:10px;padding:12px 14px;margin:10px 0}' +
    '.hia-def{border:1px solid var(--l);border-left:5px solid var(--m);border-radius:10px;padding:10px 12px;margin:8px 0}.hia-def.safety{border-left-color:#B42318}.hia-def.major{border-left-color:#3540A0}.hia-def.minor{border-left-color:#0E7C6B}' +
    '.hia-def dl{display:grid;grid-template-columns:110px minmax(0,1fr);gap:3px 10px;margin:6px 0 0;font-size:14px}.hia-def dt{font-weight:700;color:var(--m)}.hia-def dd{margin:0}' +
    '@media (max-width:480px){.hia-def dl{grid-template-columns:minmax(0,1fr)}}' +
    '.hia-ann{border:1px dashed var(--i);background:var(--is);border-radius:10px;padding:10px 12px;font-size:13.5px;margin:8px 0}.hia-ann strong{color:var(--id)}' +
    '.hia-sev.safety{background:#FDECEA;color:#B42318;border-color:#F5C2BC}.hia-sev.major{background:#ECEDF8;color:#262C78}.hia-sev.minor{background:#E3F2EE;color:#0A5A4E}' +
    '.hia-rp-sec{margin-top:16px}.hia-rp-sec>summary{justify-content:space-between}.hia-rp-sec>p,.hia-rp-sec>.hia-def,.hia-rp-sec>.hia-ann{margin-left:12px;margin-right:12px}');
  var lv = {}; D.levels.forEach(function (l) { lv[l[0]] = l; });
  var expand = false;
  var onSev = { safety: 1, major: 1, minor: 1, fyi: 1 }, onSec = {}, ann = true;
  D.sections.forEach(function (s) { onSec[s.k] = 1; });
  var body = E('div');
  function chip(s) { return E('span', { class: 'hia-chip hia-sev ' + s, text: lv[s][1] }); }
  function annot(k) { return ann ? E('div', { class: 'hia-ann', role: 'note' }, E('strong', { text: 'Reading tip: ' }), D.annotations[k]) : null; }
  function draw() {
    body.innerHTML = '';
    var all = []; D.sections.forEach(function (s) { s.items.forEach(function (i) { all.push([s, i]); }); });
    var counts = {}; all.forEach(function (x) { counts[x[1].s] = (counts[x[1].s] || 0) + 1; });
    body.appendChild(E('h3', { text: 'Summary' }));
    body.appendChild(E('div', { class: 'hia-row' }, D.levels.map(function (l) { return E('span', { class: 'hia-chip hia-sev ' + l[0], text: (counts[l[0]] || 0) + ' ' + l[1] }); })));
    body.appendChild(annot('summary'));
    var sumList = E('ul', { style: 'margin:8px 0 0 18px;padding:0' });
    all.filter(function (x) { return x[1].s === 'safety' || x[1].s === 'major'; }).forEach(function (x) {
      sumList.appendChild(E('li', null, E('strong', { text: x[0].t + ': ' }), x[1].loc + '. ' + x[1].obs.split('. ')[0].replace(/\.$/, '') + '.'));
    });
    body.appendChild(sumList);
    body.appendChild(annot('scope'));
    var shown = 0;
    D.sections.forEach(function (s, si) {
      if (!onSec[s.k]) return;
      var its = s.items.filter(function (i) { return onSev[i.s]; });
      var sec = E('details', { class: 'hia-rp-sec', open: si === 0 || expand }, E('summary', null, E('h3', { style: 'margin:0;border:0', text: s.t }), E('span', { class: 'hia-muted', text: its.length + ' findings' })), E('p', { class: 'hia-muted', text: s.desc }));
      if (!its.length) sec.appendChild(E('p', { class: 'hia-muted', text: 'No items match the current filter.' }));
      its.forEach(function (i) {
        shown++;
        sec.appendChild(E('div', { class: 'hia-def ' + i.s }, E('div', { class: 'hia-row' }, chip(i.s), E('strong', { text: i.loc })),
          E('dl', null, E('dt', { text: 'Observation' }), E('dd', { text: i.obs }), E('dt', { text: 'Why it matters' }), E('dd', { text: i.imp }), E('dt', { text: 'Recommendation' }), E('dd', { text: i.rec }))));
      });
      if (si === 0) sec.appendChild(annot('photo'));
      if (si === 3) sec.appendChild(annot('rec'));
      body.appendChild(sec);
    });
    say(shown + ' findings shown');
  }
  var say = HIA.live(r);
  var sevBox = E('fieldset', { style: 'border:0;padding:0;margin:0' }, E('legend', { class: 'hia-muted', text: 'Severity' }),
    D.levels.map(function (l) { return HIA.check(l[1], true, function (e) { onSev[l[0]] = e.target.checked; draw(); }); }));
  var secBox = E('details', null, E('summary', { text: 'Sections shown' }), E('div', { class: 'hia-grid' },
    D.sections.map(function (s) { return HIA.check(s.t, true, function (e) { onSec[s.k] = e.target.checked; draw(); }); })));
  var annBox = HIA.check('Show reading tips', true, function (e) { ann = e.target.checked; draw(); });
  function template() {
    var h = '<html><head><meta charset="utf-8"><title>Home Inspection Report Template</title><style>body{font-family:Arial,sans-serif;font-size:11pt}td,th{border:1px solid #999;padding:6px;vertical-align:top}table{border-collapse:collapse;width:100%}h1{font-size:18pt}h2{font-size:14pt;margin-top:18pt}</style></head><body>' +
      '<h1>Home Inspection Report</h1><table><tr><th>Property address</th><td></td></tr><tr><th>Client</th><td></td></tr><tr><th>Inspector / license no.</th><td></td></tr><tr><th>Date and time</th><td></td></tr><tr><th>Weather</th><td></td></tr><tr><th>Year built / size / foundation</th><td></td></tr><tr><th>People present</th><td></td></tr></table>' +
      '<h2>Severity key</h2><table>' + D.levels.map(function (l) { return '<tr><th>' + l[1] + '</th><td>' + l[2] + '</td></tr>'; }).join('') + '</table>' +
      '<h2>Summary of material defects</h2><table><tr><th>Section</th><th>Location</th><th>Finding</th><th>Severity</th></tr><tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr></table>' +
      D.sections.map(function (s) { return '<h2>' + s.t + '</h2><p>Description:</p><p>Not inspected / limitations:</p><table><tr><th>Location</th><th>Observation</th><th>Why it matters</th><th>Recommendation</th><th>Severity</th></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></table>'; }).join('') +
      '<p style="margin-top:18pt;font-size:9pt">Template from Inspector Atlas (homeinspectoratlas.com). Scope follows a visual, non-invasive home inspection standard of practice.</p></body></html>';
    HIA.download('home-inspection-report-template.doc', 'application/msword', h);
  }
  var p = D.property;
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Sample report: ' + p.address }), E('span', { class: 'hia-kicker', text: 'Annotated example' })));
  r.appendChild(E('div', { class: 'hia-rp-meta' }, [['Type', p.type], ['Built', p.built], ['Size', p.size], ['Foundation', p.foundation], ['Weather', p.weather], ['Present', p.present]].map(function (x) { return E('div', null, E('strong', { text: x[0] + ': ' }), x[1]); })));
  r.appendChild(E('div', { class: 'hia-cols hia-noprint' }, E('div', null, sevBox, annBox), E('div', null, secBox,
    E('div', { class: 'hia-row', style: 'margin-top:8px' }, HIA.btn('Print / save PDF', function () { expand = true; draw(); HIA.printNode(r); }), HIA.btn('Expand all', function () { expand = !expand; draw(); }, 'ghost'), HIA.btn('Download blank template (.doc)', template, 'ghost')))));
  r.appendChild(body);
  r.appendChild(E('p', { class: 'hia-foot', text: D.note + ' Real reports differ by inspector, software and state rules.' }));
  draw();
  HIA.seo({ name: 'Sample Home Inspection Report (Annotated)', desc: 'An annotated sample home inspection report with severity ratings, findings by section, reading tips and a free blank report template.', cat: 'ReferenceApplication', faqs: F });
})();
