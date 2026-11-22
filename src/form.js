/* Home inspection report form template: pick sections, fill on screen or print blank, rate each item IN/NI/NP/D, print / .doc / .csv. Client-side only. */
(function () {
  var D = /*DATA:form*/null, F = /*FAQS*/[], E = HIA.el, esc = HIA.esc;
  var r = HIA.mount('Home inspection report form template');
  HIA.css('.hia-doc{background:#fff;border:1px solid var(--l);border-radius:10px;padding:22px;font-size:13px;line-height:1.45;color:#111}' +
    '.hia-doc h3{font-size:18px;margin:0 0 4px}.hia-doc h4{font-size:14px;margin:16px 0 6px;padding:5px 8px;background:var(--is);color:var(--id);border-radius:4px}' +
    '.hia-doc table{width:100%;border-collapse:collapse;margin:0 0 6px}.hia-doc th,.hia-doc td{border:1px solid #CFCCC4;padding:5px 6px;text-align:left;vertical-align:top}' +
    '.hia-doc thead th{background:#F5F0E6;font-size:12px}.hia-doc td.c,.hia-doc th.c{text-align:center;width:34px}.hia-doc .ln{border-bottom:1px solid #999;min-height:18px}' +
    '.hia-doc .kv td:first-child{width:32%;font-weight:600;background:#FAF8F3}.hia-doc .def{color:#B42318;font-weight:700}.hia-doc p{margin:6px 0}' +
    '.hia-fs{display:grid;grid-template-columns:minmax(0,1fr) 92px;gap:6px;align-items:center;padding:4px 0;border-top:1px dashed var(--l)}' +
    '.hia-fs input[type=text]{grid-column:1/-1;min-height:38px!important;font-size:14px!important}.hia-fs select{min-height:38px!important;padding:4px 6px!important}' +
    '.hia-secs{display:flex;flex-wrap:wrap;gap:4px 14px}.hia-secs .hia-check{min-height:30px;padding:2px 0;font-size:14px}' +
    '@media print{.hia-doc{border:0;padding:0;font-size:11pt}.hia-doc h4{break-after:avoid}.hia-doc tr{break-inside:avoid}}');
  var blankHead = { co: '', insp: '', lic: '', contact: '', client: '', addr: '', date: '', time: '', weather: '', temp: '', occ: 'Vacant', built: '', size: '', type: 'Single-family', present: '' };
  var saved = HIA.store.get('form', null);
  var v = saved && saved.h ? saved : { mode: 'blank', h: JSON.parse(JSON.stringify(blankHead)), on: {}, rt: {}, cm: {}, extra: {} };
  D.sections.forEach(function (s) { if (v.on[s.k] == null) v.on[s.k] = s.on; if (!v.extra[s.k]) v.extra[s.k] = []; });
  function save() { HIA.store.set('form', v); }
  function items(s) { return s.items.concat(v.extra[s.k] || []); }
  function key(s, i) { return s.k + ':' + i; }
  var LAB = { co: 'Inspection company', insp: 'Inspector', lic: 'License / certification #', contact: 'Phone / email', client: 'Client', addr: 'Property address', date: 'Inspection date', time: 'Start time',
    weather: 'Weather', temp: 'Temperature', occ: 'Occupancy', built: 'Year built', size: 'Square feet', type: 'Property type', present: 'Present at inspection' };
  function fmtD(s) { if (!s) return ''; var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  function hv(k) { var x = v.h[k]; if (k === 'date') x = fmtD(x); return v.mode === 'blank' && !x ? '' : (x || ''); }
  function docHTML() {
    var blank = v.mode === 'blank', h = [];
    h.push('<h3>Home Inspection Report</h3><p>' + esc(v.h.co || (blank ? '' : '[Inspection company]')) + (v.h.lic ? ' &nbsp;|&nbsp; License # ' + esc(v.h.lic) : '') + '</p>');
    h.push('<table class="kv"><tbody>');
    ['client', 'addr', 'date', 'time', 'insp', 'contact', 'type', 'built', 'size', 'occ', 'weather', 'temp', 'present'].forEach(function (k) {
      h.push('<tr><td>' + LAB[k] + '</td><td>' + (esc(hv(k)) || '<div class="ln">&nbsp;</div>') + '</td></tr>'); });
    h.push('</tbody></table>');
    h.push('<p><strong>Rating key:</strong> ' + D.ratings.map(function (x) { return '<strong>' + x[0] + '</strong> = ' + esc(x[2]); }).join('; ') + '.</p>');
    if (!blank) {
      var defs = [];
      D.sections.forEach(function (s) { if (!v.on[s.k]) return; items(s).forEach(function (t, i) { if (v.rt[key(s, i)] === 'D') defs.push([s.t, t, v.cm[key(s, i)] || '']); }); });
      h.push('<h4>Summary of deficiencies</h4>');
      h.push(defs.length ? '<table><thead><tr><th>Section</th><th>Item</th><th>Comment and recommendation</th></tr></thead><tbody>' + defs.map(function (d) {
        return '<tr><td>' + esc(d[0]) + '</td><td>' + esc(d[1]) + '</td><td>' + esc(d[2]) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p>No items are marked deficient.</p>');
    }
    D.sections.forEach(function (s) {
      if (!v.on[s.k]) return;
      h.push('<h4>' + esc(s.t) + '</h4><table><thead><tr><th>Item</th>' + D.ratings.map(function (x) { return '<th class="c" title="' + esc(x[1]) + '">' + x[0] + '</th>'; }).join('') + '<th style="width:42%">Comments</th></tr></thead><tbody>');
      items(s).forEach(function (t, i) {
        var rt = v.rt[key(s, i)] || '', cm = v.cm[key(s, i)] || '';
        h.push('<tr><td>' + esc(t) + '</td>' + D.ratings.map(function (x) { return '<td class="c' + (rt === x[0] && x[0] === 'D' ? ' def' : '') + '">' + (rt === x[0] ? '&#9746;' : '&#9744;') + '</td>'; }).join('') +
          '<td>' + (cm ? esc(cm) : '&nbsp;') + '</td></tr>');
      });
      h.push('</tbody></table>');
    });
    h.push('<h4>Scope and limitations</h4><p>' + esc(D.limitations) + '</p>');
    h.push('<table class="kv"><tbody><tr><td>Inspector signature</td><td><div class="ln">&nbsp;</div></td></tr><tr><td>Date</td><td><div class="ln">&nbsp;</div></td></tr></tbody></table>');
    return h.join('');
  }
  var doc = E('div', { class: 'hia-doc', 'aria-label': 'Report form preview' });
  var counter = E('span', { class: 'hia-muted' });
  function draw() {
    doc.innerHTML = docHTML();
    var n = 0, d = 0; D.sections.forEach(function (s) { if (v.on[s.k]) items(s).forEach(function (t, i) { n++; if (v.rt[key(s, i)] === 'D') d++; }); });
    counter.textContent = n + ' items in ' + D.sections.filter(function (s) { return v.on[s.k]; }).length + ' sections' + (v.mode === 'fill' ? ', ' + d + ' deficient' : '');
    save();
  }
  /* --- editor --- */
  function inp(k, type, opts) {
    var i = opts ? HIA.select(opts, v.h[k], function (e) { v.h[k] = e.target.value; draw(); })
      : E('input', { type: type || 'text', value: v.h[k] || '', oninput: function (e) { v.h[k] = e.target.value; draw(); } });
    return HIA.field(LAB[k], i);
  }
  var secBox = E('div', { class: 'hia-secs' });
  var editor = E('div');
  function secList() {
    secBox.innerHTML = '';
    D.sections.forEach(function (s) { secBox.appendChild(HIA.check(s.t, v.on[s.k], function (e) { v.on[s.k] = e.target.checked; editors(); draw(); })); });
  }
  function editors() {
    editor.innerHTML = '';
    if (v.mode !== 'fill') {
      editor.appendChild(E('p', { class: 'hia-muted', text: 'Blank mode prints empty boxes and comment lines for every item, ready to fill in by hand on site. Switch to "Fill in on screen" to rate items and type comments here.' }));
      return;
    }
    D.sections.forEach(function (s) {
      if (!v.on[s.k]) return;
      var body = E('div');
      items(s).forEach(function (t, i) {
        var k = key(s, i);
        var sel = HIA.select([['', '–']].concat(D.ratings.map(function (x) { return [x[0], x[0] + ' ' + x[1]]; })), v.rt[k] || '', function (e) { v.rt[k] = e.target.value; draw(); });
        sel.setAttribute('aria-label', 'Rating for ' + t);
        var cm = E('input', { type: 'text', value: v.cm[k] || '', placeholder: 'Comment, location, recommendation', 'aria-label': 'Comment for ' + t, oninput: function (e) { v.cm[k] = e.target.value; draw(); } });
        body.appendChild(E('div', { class: 'hia-fs' }, E('span', { text: t }), sel, cm));
      });
      var add = E('input', { type: 'text', placeholder: 'Add an item to ' + s.t, 'aria-label': 'Add an item to ' + s.t });
      body.appendChild(E('div', { class: 'hia-row', style: 'margin-top:8px' }, E('div', { style: 'flex:1;min-width:160px' }, add),
        HIA.btn('Add item', function () { var t = add.value.trim(); if (!t) return; v.extra[s.k].push(t); editors(); draw(); say('Added ' + t); }, 'ghost')));
      editor.appendChild(E('details', null, E('summary', { text: s.t }), body));
    });
  }
  function plainCSV() {
    var rows = [['Section', 'Item', 'Rating', 'Comments']];
    D.sections.forEach(function (s) { if (v.on[s.k]) items(s).forEach(function (t, i) { rows.push([s.t, t, v.rt[key(s, i)] || '', v.cm[key(s, i)] || '']); }); });
    return rows.map(function (x) { return x.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
  }
  var modeBtns = E('div', { class: 'hia-tabs', role: 'group', 'aria-label': 'Form mode' });
  function modes() {
    modeBtns.innerHTML = '';
    [['blank', 'Blank form to print'], ['fill', 'Fill in on screen']].forEach(function (m) {
      modeBtns.appendChild(E('button', { type: 'button', 'aria-pressed': v.mode === m[0] ? 'true' : 'false', text: m[1], onclick: function () { v.mode = m[0]; modes(); editors(); draw(); } }));
    });
  }
  var say;
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Report form builder' }), E('span', { class: 'hia-kicker', text: 'Free, stays in your browser' })));
  r.appendChild(modeBtns);
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Property and inspection details' }),
    E('div', null, E('div', { class: 'hia-grid' }, inp('co'), inp('insp'), inp('lic'), inp('contact'), inp('client'), inp('addr'), inp('date', 'date'), inp('time', 'time'),
      inp('type', null, ['Single-family', 'Townhome', 'Condo', 'Multi-family (2-4 units)', 'Manufactured home', 'New construction']), inp('built'), inp('size'),
      inp('occ', null, ['Vacant', 'Occupied', 'Occupied, furnished']), inp('weather'), inp('temp'), inp('present')))));
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Sections to include' }), E('div', null, secBox)));
  r.appendChild(editor);
  r.appendChild(E('div', { class: 'hia-row hia-noprint', style: 'margin:14px 0 10px' },
    HIA.btn('Print / save PDF', function () { HIA.printNode(doc); }),
    HIA.btn('Download Word (.doc)', function () { HIA.download('home-inspection-report-form.doc', 'application/msword', '<html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:10pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:4px}h4{background:#ECEDF8;padding:4px}</style></head><body>' + docHTML() + '</body></html>'); say('Word file downloaded'); }, 'ghost'),
    HIA.btn('Download spreadsheet (.csv)', function () { HIA.download('home-inspection-report-form.csv', 'text/csv', plainCSV()); say('Spreadsheet downloaded'); }, 'ghost'),
    HIA.btn('Clear', function () { if (!confirm('Clear all details, ratings and comments?')) return; v = { mode: v.mode, h: JSON.parse(JSON.stringify(blankHead)), on: {}, rt: {}, cm: {}, extra: {} };
      D.sections.forEach(function (s) { v.on[s.k] = s.on; v.extra[s.k] = []; }); HIA.store.del('form'); r.innerHTML = ''; location.reload(); }, 'ghost'), counter));
  r.appendChild(doc);
  r.appendChild(E('p', { class: 'hia-foot', text: 'Sections follow the systems in the InterNACHI and ASHI standards of practice. Check your state\'s standards of practice and required report content before you use this form for paid inspections.' }));
  say = HIA.live(r);
  modes(); secList(); editors(); draw();
  HIA.seo({ type: 'WebApplication', name: 'Home inspection report form template', desc: 'Free fillable home inspection report form. Pick sections, rate each item inspected, not inspected, not present or deficient, then print, save as PDF or download a Word or spreadsheet copy.', cat: 'BusinessApplication', faqs: F });
})();
