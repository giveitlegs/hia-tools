/* Interactive home inspection checklist: modes, tick + flag + note per item, localStorage, print. */
(function () {
  var D = /*DATA:checklist*/null, F = /*FAQS*/[], E = HIA.el;
  var r = HIA.mount('Interactive home inspection checklist');
  var mode = HIA.store.get('ck-mode', 'b');
  var st = HIA.store.get('ck-' + mode, {});
  var say = HIA.live(r);
  var open = { prep: 1 };
  HIA.css('.hia-ck-sec{border:1px solid var(--l);border-radius:12px;margin:10px 0;padding:4px 14px 10px}.hia-ck-sec h3{display:flex;justify-content:space-between;gap:8px;align-items:baseline;margin:10px 0 4px}' +
    '.hia-ck-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;align-items:start;border-top:1px dashed var(--l);padding:6px 0}.hia-ck-item:first-of-type{border-top:0}' +
    '.hia-flag{min-height:36px;min-width:44px;padding:4px 10px;border:1px solid var(--l);border-radius:8px;background:#fff;font:inherit;font-size:13px;font-weight:600;cursor:pointer;color:var(--m)}' +
    '.hia-flag[aria-pressed=true]{background:var(--ws);border-color:#F5C2BC;color:var(--w)}.hia-ck-note{grid-column:1/-1}.hia-ck-note input{min-height:38px!important;font-size:15px!important}' +
    '.hia-ck-top{padding:8px 0}.hia-ck-sec>summary{padding:8px 0;justify-content:space-between}.hia-ck-sec>summary h3{margin:0;font-size:16px}.hia-ck-sec{border:1px solid var(--l)!important}' +
    '@media print{.hia-ck-sec:not([open])>*:not(summary){display:block}}' +
    '@media print{.hia-ck-sec{break-inside:avoid;border:0;padding:0}.hia-flag[aria-pressed=false]{display:none}.hia-ck-note input{border:0!important}}');

  function key(s, i) { return s.k + i; }
  function items(s) { return s.items.map(function (it, i) { return { it: it, i: i }; }).filter(function (o) { return o.it.m.indexOf(mode) > -1; }); }
  function save() { HIA.store.set('ck-' + mode, st); }

  function render() {
    r.innerHTML = '';
    var total = 0, done = 0, flagged = [];
    D.sections.forEach(function (s) { items(s).forEach(function (o) { var v = st[key(s, o.i)] || {}; total++; if (v.c) done++; if (v.f) flagged.push([s.t, o.it.t, v.n]); }); });
    var tabs = E('div', { class: 'hia-tabs', role: 'group', 'aria-label': 'Checklist type' });
    D.modes.forEach(function (m) {
      tabs.appendChild(E('button', { type: 'button', 'aria-pressed': String(m[0] === mode), text: m[1], onclick: function () {
        mode = m[0]; HIA.store.set('ck-mode', mode); st = HIA.store.get('ck-' + mode, {}); render(); say(m[1] + ' checklist loaded'); } }));
    });
    var pct = total ? Math.round(done / total * 100) : 0;
    r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Home inspection checklist' }), E('span', { class: 'hia-kicker', text: 'Saved in this browser only' })));
    r.appendChild(tabs);
    r.appendChild(E('div', { class: 'hia-ck-top hia-noprint' },
      E('div', { class: 'hia-row', style: 'justify-content:space-between' },
        E('strong', { text: done + ' of ' + total + ' checked (' + pct + '%) · ' + flagged.length + ' flagged' }),
        E('div', { class: 'hia-row' },
          HIA.btn('Print / save PDF', function () { [].forEach.call(r.querySelectorAll('details'), function (d) { d.open = true; }); HIA.printNode(r); }),
          HIA.btn('Expand all', function () { D.sections.forEach(function (x) { open[x.k] = 1; }); render(); }, 'ghost'),
          HIA.btn('Reset', function () { if (confirm('Clear all ticks, flags and notes for this checklist?')) { st = {}; save(); render(); say('Checklist cleared'); } }, 'ghost'))),
      E('div', { class: 'hia-bar', style: 'margin-top:8px', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': 'Checklist progress' }, E('span', { style: 'width:' + pct + '%' }))));
    D.sections.forEach(function (s) {
      var list = items(s); if (!list.length) return;
      var sec = E('details', { class: 'hia-ck-sec', open: !!open[s.k] || r.classList.contains('hia-print-area') });
      sec.addEventListener('toggle', function () { open[s.k] = sec.open; });
      var n = list.filter(function (o) { return (st[key(s, o.i)] || {}).c; }).length;
      sec.appendChild(E('summary', null, E('h3', { id: 'ck-' + s.k, text: s.t }), E('span', { class: 'hia-muted', text: (s.sop ? 'SOP ' + s.sop + ' · ' : '') + n + '/' + list.length + ' done' })));
      list.forEach(function (o) {
        var k = key(s, o.i), v = st[k] || {};
        var cb = HIA.check(o.it.t, v.c, function (e) { v.c = e.target.checked; st[k] = v; save(); render(); document.getElementById(focusId(k, 'c')).focus(); });
        cb.querySelector('input').id = focusId(k, 'c');
        cb.setAttribute('for', focusId(k, 'c'));
        var fl = E('button', { type: 'button', class: 'hia-flag', id: focusId(k, 'f'), 'aria-pressed': String(!!v.f), 'aria-label': 'Flag to ask the inspector: ' + o.it.t, text: v.f ? 'Flagged' : 'Flag',
          onclick: function () { v.f = !v.f; st[k] = v; save(); render(); document.getElementById(focusId(k, 'f')).focus(); } });
        var row = E('div', { class: 'hia-ck-item' }, cb, fl);
        if (v.f || v.n) {
          var ni = E('input', { type: 'text', value: v.n || '', placeholder: 'Note (e.g. stain on bedroom 2 ceiling)', 'aria-label': 'Note for: ' + o.it.t,
            onchange: function (e) { v.n = e.target.value; st[k] = v; save(); } });
          row.appendChild(E('div', { class: 'hia-ck-note' }, ni));
        }
        sec.appendChild(row);
      });
      r.appendChild(sec);
    });
    if (flagged.length) {
      var ul = E('ul', { style: 'margin:6px 0 0 18px;padding:0' });
      flagged.forEach(function (f) { ul.appendChild(E('li', null, E('strong', { text: f[0] + ': ' }), f[1] + (f[2] ? ' (' + f[2] + ')' : ''))); });
      r.appendChild(E('div', { class: 'hia-note' }, E('h3', { text: 'Ask your inspector about these' }), ul));
    }
    r.appendChild(E('p', { class: 'hia-foot', text: 'Items follow the InterNACHI Standards of Practice section numbers. A checklist helps you follow along; it does not replace a licensed inspector. Your ticks and notes stay in this browser and are never sent anywhere.' }));
  }
  function focusId(k, t) { return 'ck-' + t + '-' + k; }
  render();
  HIA.seo({ type: 'HowTo', name: 'How to use a home inspection checklist', desc: 'A room-by-room home inspection checklist for buyers, sellers, new construction, condos and manufactured homes.',
    steps: D.sections.map(function (s) { return [s.t, s.items.slice(0, 3).map(function (i) { return i.t; }).join('. ') + '.']; }), faqs: F });
})();
