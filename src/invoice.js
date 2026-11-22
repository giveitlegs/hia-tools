/* Home inspection invoice template: business + client details, preset inspection and add-on line items (typical prices from cost data), discount, tax, payments, print / .doc / .csv. Client-side only. */
(function () {
  var C = /*DATA:cost*/null, F = /*FAQS*/[], E = HIA.el, esc = HIA.esc;
  var r = HIA.mount('Home inspection invoice template');
  HIA.css('.hia-inv{background:#fff;border:1px solid var(--l);border-radius:10px;padding:24px;font-size:14px;color:#111}' +
    '.hia-inv .top{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:16px}.hia-inv h3{font-size:26px;margin:0;color:var(--i);letter-spacing:-.02em}' +
    '.hia-inv .meta{text-align:right;font-size:13px}.hia-inv .meta b{display:inline-block;min-width:88px;text-align:left}.hia-inv .two{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0 0 16px;font-size:13.5px}' +
    '.hia-inv .lbl{font-weight:700;color:var(--m);font-size:12px;margin-bottom:2px}.hia-inv table{width:100%;border-collapse:collapse}.hia-inv th,.hia-inv td{padding:8px 6px;border-bottom:1px solid #E4E2DC;text-align:left}' +
    '.hia-inv thead th{background:var(--p);font-size:12.5px}.hia-inv .n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}.hia-inv .tot{margin-left:auto;max-width:300px;margin-top:10px}' +
    '.hia-inv .tot td{border:0;padding:4px 6px}.hia-inv .due td{font-size:17px;font-weight:800;border-top:2px solid var(--k)}.hia-inv .fine{font-size:12.5px;color:#444;margin-top:16px;white-space:pre-line}' +
    '.hia-li{display:grid;grid-template-columns:minmax(0,1fr) 64px 100px 40px;gap:6px;align-items:center;margin:0 0 6px}.hia-li input{min-height:40px!important;font-size:15px!important}' +
    '.hia-li button{min-height:40px;border:1px solid var(--l);border-radius:8px;background:#fff;cursor:pointer;font-size:18px;color:var(--m)}' +
    '@media (max-width:560px){.hia-li{grid-template-columns:minmax(0,1fr) 56px 84px 36px}.hia-inv{padding:14px}.hia-inv .two{grid-template-columns:1fr}.hia-inv .meta{text-align:left}}' +
    '@media print{.hia-inv{border:0;padding:0}}');
  function mid(a) { return HIA.round((a.low + a.high) / 2, 5); }
  var PRE = [['General home inspection', C ? C.consensus.typical : 350]];
  if (C) C.addons.forEach(function (a) { PRE.push([a.label, mid(a)]); });
  PRE.push(['Re-inspection', 150], ['Travel fee', 50], ['Large home surcharge (per 500 sq ft over 2,000)', C && +C.over || 25]);
  var today = new Date(), iso = function (d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); };
  var num = HIA.store.get('invno', 1001);
  var DEF = { co: '', coaddr: '', cophone: '', coemail: '', lic: '', no: String(num), date: iso(today), terms: 'receipt', client: '', cemail: '', caddr: '', addr: '', idate: '',
    items: [{ d: 'General home inspection', q: 1, p: PRE[0][1] }], disc: 0, dtype: 'amt', tax: 0, paid: 0, pay: 'Card, check or bank transfer. Make checks payable to the company above.', notes: 'Thank you for your business. The inspection report is released once payment is received.' };
  var v = HIA.store.get('inv', null) || JSON.parse(JSON.stringify(DEF));
  function fmtD(s) { if (!s) return ''; var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function m(n) { return '$' + (Math.round(n * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  var TERMS = { receipt: 'Due on receipt', net7: 'Net 7', net15: 'Net 15', net30: 'Net 30', closing: 'Paid at closing' };
  function dueDate() { var n = { net7: 7, net15: 15, net30: 30 }[v.terms]; if (!n || !v.date) return TERMS[v.terms]; var p = v.date.split('-'), d = new Date(+p[0], p[1] - 1, +p[2] + n); return fmtD(iso(d)); }
  function totals() {
    var sub = v.items.reduce(function (t, i) { return t + (+i.q || 0) * (+i.p || 0); }, 0);
    var disc = v.dtype === 'pct' ? sub * (+v.disc || 0) / 100 : (+v.disc || 0);
    disc = Math.min(disc, sub);
    var tax = (sub - disc) * (+v.tax || 0) / 100, total = sub - disc + tax;
    return { sub: sub, disc: disc, tax: tax, total: total, due: Math.max(0, total - (+v.paid || 0)) };
  }
  function docHTML() {
    var t = totals(), h = [];
    h.push('<div class="top"><div><h3>INVOICE</h3><div style="margin-top:6px;font-weight:700">' + esc(v.co || '[Your company]') + '</div><div style="font-size:13px;white-space:pre-line">' +
      esc([v.coaddr, v.cophone, v.coemail, v.lic ? 'License # ' + v.lic : ''].filter(Boolean).join('\n')) + '</div></div>');
    h.push('<div class="meta"><div><b>Invoice #</b> ' + esc(v.no) + '</div><div><b>Date</b> ' + esc(fmtD(v.date)) + '</div><div><b>Due</b> ' + esc(dueDate()) + '</div></div></div>');
    h.push('<div class="two"><div><div class="lbl">Bill to</div><div style="white-space:pre-line">' + esc([v.client || '[Client name]', v.cemail, v.caddr].filter(Boolean).join('\n')) + '</div></div>' +
      '<div><div class="lbl">Inspected property</div><div>' + esc(v.addr || '[Property address]') + '</div>' + (v.idate ? '<div class="lbl" style="margin-top:6px">Inspection date</div><div>' + esc(fmtD(v.idate)) + '</div>' : '') + '</div></div>');
    h.push('<table><thead><tr><th>Description</th><th class="n">Qty</th><th class="n">Rate</th><th class="n">Amount</th></tr></thead><tbody>');
    v.items.forEach(function (i) { h.push('<tr><td>' + esc(i.d || '') + '</td><td class="n">' + esc(i.q) + '</td><td class="n">' + m(+i.p || 0) + '</td><td class="n">' + m((+i.q || 0) * (+i.p || 0)) + '</td></tr>'); });
    h.push('</tbody></table><table class="tot"><tbody><tr><td>Subtotal</td><td class="n">' + m(t.sub) + '</td></tr>');
    if (t.disc) h.push('<tr><td>Discount' + (v.dtype === 'pct' ? ' (' + esc(v.disc) + '%)' : '') + '</td><td class="n">-' + m(t.disc) + '</td></tr>');
    if (t.tax) h.push('<tr><td>Sales tax (' + esc(v.tax) + '%)</td><td class="n">' + m(t.tax) + '</td></tr>');
    h.push('<tr><td>Total</td><td class="n">' + m(t.total) + '</td></tr>');
    if (+v.paid) h.push('<tr><td>Paid</td><td class="n">-' + m(+v.paid) + '</td></tr>');
    h.push('<tr class="due"><td>Balance due</td><td class="n">' + m(t.due) + '</td></tr></tbody></table>');
    h.push('<div class="fine">' + (v.pay ? '<strong>Payment:</strong> ' + esc(v.pay) + '\n' : '') + esc(v.notes || '') + '</div>');
    return h.join('');
  }
  var inv = E('div', { class: 'hia-inv', 'aria-label': 'Invoice preview' });
  var lines = E('div');
  function draw() { inv.innerHTML = docHTML(); HIA.store.set('inv', v); }
  function itemRows() {
    lines.innerHTML = '';
    lines.appendChild(E('div', { class: 'hia-li hia-muted', 'aria-hidden': 'true' }, E('span', { text: 'Description' }), E('span', { text: 'Qty' }), E('span', { text: 'Rate $' }), E('span')));
    v.items.forEach(function (i, n) {
      lines.appendChild(E('div', { class: 'hia-li' },
        E('input', { type: 'text', value: i.d, 'aria-label': 'Line ' + (n + 1) + ' description', oninput: function (e) { i.d = e.target.value; draw(); } }),
        E('input', { type: 'number', min: 0, step: 1, value: i.q, inputmode: 'decimal', 'aria-label': 'Line ' + (n + 1) + ' quantity', oninput: function (e) { i.q = parseFloat(e.target.value) || 0; draw(); } }),
        E('input', { type: 'number', min: 0, step: 5, value: i.p, inputmode: 'decimal', 'aria-label': 'Line ' + (n + 1) + ' rate', oninput: function (e) { i.p = parseFloat(e.target.value) || 0; draw(); } }),
        E('button', { type: 'button', 'aria-label': 'Remove line ' + (n + 1), text: '×', onclick: function () { v.items.splice(n, 1); itemRows(); draw(); } })));
    });
  }
  function addLine(d, p) { v.items.push({ d: d, q: 1, p: p }); itemRows(); draw(); say('Added ' + (d || 'a blank line')); }
  function inp(k, label, type, hint) { var i = E('input', { type: type || 'text', value: v[k] == null ? '' : v[k], oninput: function (e) { v[k] = e.target.value; draw(); } }); return HIA.field(label, i, hint); }
  var pick = E('select', { 'aria-label': 'Add a common service', onchange: function (e) { var p = PRE[+e.target.value]; if (p) addLine(p[0], p[1]); e.target.value = ''; } });
  pick.appendChild(E('option', { value: '', text: 'Add a common service…' }));
  PRE.forEach(function (p, n) { pick.appendChild(E('option', { value: n, text: p[0] + ' ($' + p[1] + ')' })); });
  function csv() {
    var t = totals(), rows = [['Invoice', v.no], ['Date', v.date], ['Client', v.client], ['Property', v.addr], [], ['Description', 'Qty', 'Rate', 'Amount']];
    v.items.forEach(function (i) { rows.push([i.d, i.q, i.p, ((+i.q || 0) * (+i.p || 0)).toFixed(2)]); });
    rows.push([], ['Subtotal', '', '', t.sub.toFixed(2)], ['Discount', '', '', (-t.disc).toFixed(2)], ['Tax', '', '', t.tax.toFixed(2)], ['Paid', '', '', (-(+v.paid || 0)).toFixed(2)], ['Balance due', '', '', t.due.toFixed(2)]);
    return rows.map(function (x) { return x.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
  }
  var say;
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Invoice builder' }), E('span', { class: 'hia-kicker', text: 'Free, stays in your browser' })));
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Your business' }), E('div', null, E('div', { class: 'hia-grid' },
    inp('co', 'Company name'), inp('coaddr', 'Business address'), inp('cophone', 'Phone'), inp('coemail', 'Email'), inp('lic', 'License #')))));
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Client and inspection' }), E('div', null, E('div', { class: 'hia-grid' },
    inp('no', 'Invoice #'), inp('date', 'Invoice date', 'date'), HIA.field('Payment terms', HIA.select(Object.keys(TERMS).map(function (k) { return [k, TERMS[k]]; }), v.terms, function (e) { v.terms = e.target.value; draw(); })),
    inp('client', 'Client name'), inp('cemail', 'Client email'), inp('caddr', 'Billing address'), inp('addr', 'Inspected property address'), inp('idate', 'Inspection date', 'date')))));
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Services' }), E('div', null, lines,
    E('div', { class: 'hia-row', style: 'margin-top:6px' }, E('div', { style: 'flex:1;min-width:200px' }, pick), HIA.btn('Add blank line', function () { addLine('', 0); }, 'ghost')),
    E('p', { class: 'hia-hint', style: 'margin-top:6px', text: 'Inspection and add-on presets use the midpoint of typical US prices from our cost data; re-inspection and travel are placeholders. Change them all to your own fees.' }),
    E('div', { class: 'hia-grid', style: 'margin-top:8px' },
      HIA.field('Discount', HIA.num(v.disc, 0, null, 1, function (e) { v.disc = parseFloat(e.target.value) || 0; draw(); })),
      HIA.field('Discount type', HIA.select([['amt', 'Dollar amount'], ['pct', 'Percent']], v.dtype, function (e) { v.dtype = e.target.value; draw(); })),
      HIA.field('Sales tax %', HIA.num(v.tax, 0, 20, 0.01, function (e) { v.tax = parseFloat(e.target.value) || 0; draw(); }), 'Most states do not tax inspection services. Check yours.'),
      HIA.field('Amount paid', HIA.num(v.paid, 0, null, 1, function (e) { v.paid = parseFloat(e.target.value) || 0; draw(); }))))));
  r.appendChild(E('details', null, E('summary', { text: 'Payment instructions and notes' }), E('div', null, inp('pay', 'Payment methods'), inp('notes', 'Notes'))));
  r.appendChild(E('div', { class: 'hia-row hia-noprint', style: 'margin:14px 0 10px' },
    HIA.btn('Print / save PDF', function () { HIA.printNode(inv); }),
    HIA.btn('Download Word (.doc)', function () { HIA.download('invoice-' + v.no + '.doc', 'application/msword', '<html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;font-size:10.5pt}table{border-collapse:collapse;width:100%}td,th{padding:5px;border-bottom:1px solid #ccc}.n{text-align:right}</style></head><body>' + docHTML() + '</body></html>'); say('Word file downloaded'); }, 'ghost'),
    HIA.btn('Download spreadsheet (.csv)', function () { HIA.download('invoice-' + v.no + '.csv', 'text/csv', csv()); say('Spreadsheet downloaded'); }, 'ghost'),
    HIA.btn('Start next invoice', function () { var n = (parseInt(v.no, 10) || num) + 1; HIA.store.set('invno', n); var keep = { co: v.co, coaddr: v.coaddr, cophone: v.cophone, coemail: v.coemail, lic: v.lic, pay: v.pay, notes: v.notes };
      v = JSON.parse(JSON.stringify(DEF)); for (var k in keep) v[k] = keep[k]; v.no = String(n); HIA.store.set('inv', v); location.reload(); }, 'ghost')));
  r.appendChild(inv);
  say = HIA.live(r);
  itemRows(); draw();
  HIA.seo({ type: 'WebApplication', name: 'Home inspection invoice template', desc: 'Free home inspection invoice template. Add your business, client and property, pick inspection and add-on services, apply discounts and tax, then print, save a PDF or download Word and spreadsheet copies.', cat: 'BusinessApplication', faqs: F });
})();
