/* Repair request letter builder: pick defects, choose repair / credit / price reduction, live letter, copy / print / .doc. Client-side only. */
(function () {
  var C = /*DATA:contingency*/null, D = /*DATA:repair*/null, F = /*FAQS*/[], E = HIA.el, $ = HIA.money;
  var r = HIA.mount('Home inspection repair request letter builder');
  HIA.css('.hia-letter{background:#fff;border:1px solid var(--l);border-radius:10px;padding:22px;font-family:Georgia,"Times New Roman",serif;font-size:15px;line-height:1.55;white-space:normal}' +
    '.hia-letter p{margin:0 0 10px}.hia-letter ol{margin:0 0 10px 20px;padding:0}.hia-ri{display:grid;grid-template-columns:minmax(0,1fr) 150px 110px;gap:6px;align-items:center;border-top:1px dashed var(--l);padding:6px 0}' +
    '@media (max-width:640px){.hia-ri{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.hia-ri>:first-child{grid-column:1/-1}}.hia-ri select,.hia-ri input{min-height:40px!important}' +
    '@media print{.hia-rl-form{display:none!important}.hia-letter{border:0;padding:0}}');
  var saved = HIA.store.get('rl', null);
  var v = saved || { buyer: '', seller: '', addr: '', st: '', cdate: '', idate: '', due: '', items: [] };
  var letter = E('div', { class: 'hia-letter', 'aria-live': 'polite', 'aria-label': 'Letter preview' });
  var list = E('div');
  var fmtD = function (s) { if (!s) return '________'; var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); };
  function save() { HIA.store.set('rl', v); }
  function ask(i) { return i.ask === 'credit' ? 'a credit of ' + (i.amt ? $(i.amt) : '$____') + ' at closing' : i.ask === 'price' ? 'a price reduction of ' + (i.amt ? $(i.amt) : '$____') : 'repair by a licensed, qualified contractor, with receipts provided before closing'; }
  function text() {
    var b = v.buyer || '[Buyer name]', s = v.seller || '[Seller name]', a = v.addr || '[Property address]';
    var lines = [], tot = { credit: 0, price: 0 };
    v.items.forEach(function (i) { if (i.ask !== 'repair') tot[i.ask] += +i.amt || 0; });
    lines.push(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    lines.push('To: ' + s + ', through your listing agent');
    lines.push('Re: Request for repairs after home inspection, ' + a);
    lines.push('Dear ' + s + ',');
    lines.push('Under the purchase contract dated ' + fmtD(v.cdate) + ', we had the property inspected on ' + fmtD(v.idate) + '. Thank you for your cooperation. Based on the inspection report, we ask that the following items be addressed before closing:');
    return { lines: lines, tot: tot, b: b };
  }
  function draw() {
    var t = text(), f = C && C.forms.filter(function (x) { return x.code === v.st; })[0];
    letter.innerHTML = '';
    t.lines.forEach(function (l, i) { letter.appendChild(E('p', { style: i === 2 ? 'font-weight:700' : null, text: l })); });
    var ol = E('ol');
    if (!v.items.length) ol.appendChild(E('li', { text: '[Pick items from the list or add your own]' }));
    v.items.forEach(function (i) { ol.appendChild(E('li', { text: i.t + (i.note ? ' (' + i.note + ')' : '') + '. Requested: ' + ask(i) + '.' })); });
    letter.appendChild(ol);
    if (t.tot.credit || t.tot.price) letter.appendChild(E('p', { text: 'Total requested: ' + [t.tot.credit ? $(t.tot.credit) + ' in closing credits' : '', t.tot.price ? $(t.tot.price) + ' in price reduction' : ''].filter(Boolean).join(' and ') + '.' }));
    letter.appendChild(E('p', { text: 'Please respond in writing by ' + fmtD(v.due) + '. We are happy to discuss alternatives, such as a credit in place of a repair. A copy of the relevant pages of the inspection report is attached.' }));
    letter.appendChild(E('p', { text: 'Sincerely,' }));
    letter.appendChild(E('p', { text: t.b }));
    note.innerHTML = '';
    note.appendChild(E('strong', { text: 'Use your state\'s form. ' }));
    note.appendChild(f ? E('span', null, C.names[f.code] + ': ' + f.form + '. ', E('a', { href: f.url, rel: 'nofollow', text: 'Source' }), '. ') : E('span', { text: 'Many states and local associations have an official repair request or amendment form. ' }));
    note.appendChild(E('span', { text: 'A letter like this helps you organize the request; your agent usually puts the final terms on the contract addendum. Talk to your agent or attorney before sending.' }));
    save();
  }
  function items() {
    list.innerHTML = '';
    v.items.forEach(function (i, n) {
      var amt = E('input', { type: 'number', inputmode: 'decimal', min: 0, step: 50, value: i.amt || '', placeholder: '$', 'aria-label': 'Amount for: ' + i.t, disabled: i.ask === 'repair',
        oninput: function (e) { i.amt = parseFloat(e.target.value) || 0; draw(); } });
      var sel = HIA.select([['repair', 'Repair'], ['credit', 'Closing credit'], ['price', 'Price reduction']], i.ask, function (e) { i.ask = e.target.value; amt.disabled = i.ask === 'repair'; draw(); });
      sel.setAttribute('aria-label', 'Request type for: ' + i.t);
      list.appendChild(E('div', { class: 'hia-ri' }, E('div', null, E('span', { text: i.t + ' ' }),
        E('button', { type: 'button', class: 'hia-flag', style: 'min-height:32px', 'aria-label': 'Remove: ' + i.t, text: 'Remove', onclick: function () { v.items.splice(n, 1); items(); draw(); } })), sel, amt));
    });
  }
  function addItem(t) { t = (t || '').trim(); if (!t || v.items.some(function (i) { return i.t === t; })) return; v.items.push({ t: t, ask: 'repair', amt: 0 }); items(); draw(); }
  var note = E('div', { class: 'hia-note' });
  var pick = E('select', { 'aria-label': 'Common defects', onchange: function (e) { addItem(e.target.value); e.target.value = ''; } });
  pick.appendChild(E('option', { value: '', text: 'Add a common defect…' }));
  D.groups.forEach(function (g) { var og = E('optgroup', { label: g[0] }); g[1].forEach(function (t) { og.appendChild(E('option', { value: t, text: t })); }); pick.appendChild(og); });
  var custom = E('textarea', { placeholder: 'Or paste items from your report, one per line', 'aria-label': 'Custom items, one per line', rows: 3 });
  var states = Object.keys(C.names).sort(function (a, b) { return C.names[a] < C.names[b] ? -1 : 1; });
  function inp(k, label, type, hint) { var i = E('input', { type: type || 'text', value: v[k] || '', oninput: function (e) { v[k] = e.target.value; draw(); } }); return HIA.field(label, i, hint); }
  var form = E('div', { class: 'hia-rl-form' },
    E('div', { class: 'hia-grid' }, inp('buyer', 'Buyer name(s)'), inp('seller', 'Seller name(s)'), inp('addr', 'Property address'),
      HIA.field('State', HIA.select([['', 'Other / not listed']].concat(states.map(function (c) { return [c, C.names[c]]; })), v.st, function (e) { v.st = e.target.value; draw(); })),
      inp('cdate', 'Contract date', 'date'), inp('idate', 'Inspection date', 'date'), inp('due', 'Respond by', 'date', 'Before your contingency deadline')),
    E('h3', { style: 'margin-top:16px', text: 'Items to request' }),
    E('div', { class: 'hia-grid' }, HIA.field('Common defects', pick), E('div', { class: 'hia-field' }, E('label', { for: custom.id = HIA.id(), text: 'Your own items' }), custom,
      HIA.btn('Add these items', function () { custom.value.split(/\n+/).forEach(addItem); custom.value = ''; }, 'ghost'))), list);
  function plain() { return [].map.call(letter.children, function (n) { return n.tagName === 'OL' ? [].map.call(n.children, function (li, i) { return (i + 1) + '. ' + li.textContent; }).join('\n') : n.textContent; }).join('\n\n'); }
  var actions = E('div', { class: 'hia-row hia-noprint', style: 'margin:10px 0' },
    HIA.btn('Copy letter', function () { var t = plain(); (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { say('Letter copied'); }, function () { say('Copy failed: select the letter text and copy it manually'); }); }),
    HIA.btn('Print / save PDF', function () { HIA.printNode(r); }, 'ghost'),
    HIA.btn('Download .doc', function () { HIA.download('repair-request-letter.doc', 'application/msword', '<html><head><meta charset="utf-8"></head><body style="font-family:Georgia,serif;font-size:12pt">' + letter.innerHTML + '</body></html>'); }, 'ghost'),
    HIA.btn('Clear', function () { if (confirm('Clear the letter?')) { v = { buyer: '', seller: '', addr: '', st: '', cdate: '', idate: '', due: '', items: [] }; HIA.store.del('rl'); [].forEach.call(form.querySelectorAll('input,textarea,select'), function (n) { n.value = ''; }); items(); draw(); say('Letter cleared'); } }, 'ghost'));
  var say;
  function build() {
    r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Repair request letter builder' }), E('span', { class: 'hia-kicker', text: 'Stays in your browser' })));
    r.appendChild(E('div', { class: 'hia-cols' }, form, E('div', null, letter, actions, note)));
    say = HIA.live(r);
    items(); draw();
  }
  build();
  HIA.seo({ type: 'HowTo', name: 'How to write a home inspection repair request letter', desc: 'Build a repair request letter after a home inspection: list defects, choose repair, credit or price reduction, set a response date and use your state\'s addendum.',
    steps: [['Enter the deal details', 'Add the buyer and seller names, property address, contract date and inspection date.'], ['Pick the items', 'Choose defects from the common list or paste items from your inspection report.'],
      ['Choose the ask', 'For each item, request a repair by a licensed contractor, a closing credit, or a price reduction.'], ['Set a response date', 'Pick a date before your inspection contingency deadline.'],
      ['Send it the right way', 'Copy or download the letter and give it to your agent, who puts the final terms on your state\'s repair addendum.']], faqs: F });
})();
