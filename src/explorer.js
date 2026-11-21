/* "What do home inspectors look for" clickable house explorer. */
(function () {
  var D = /*DATA:explorer*/null, F = /*FAQS*/[], E = HIA.el;
  var r = HIA.mount('What home inspectors look for: house explorer');
  HIA.css('.hia-ex{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:20px;align-items:start}@media (max-width:760px){.hia-ex{grid-template-columns:minmax(0,1fr)}}' +
    '.hia-ex svg{width:100%;height:auto;display:block;aspect-ratio:400/300}.hia-ex svg [data-zone]{cursor:pointer}' +
    '.hia-ex svg .z{fill:#ECEDF8;stroke:#3540A0;stroke-width:1.5;transition:fill .15s}.hia-ex svg [data-zone]:hover .z{fill:#E3F2EE}.hia-ex svg [data-zone].on .z{fill:#0E7C6B}' +
    '.hia-ex svg text{font:600 10px Inter,sans-serif;fill:#1B2030;pointer-events:none}.hia-ex svg .on text{fill:#fff}' +
    '.hia-zbtns{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.hia-zbtns button{min-height:40px}' +
    '.hia-panel h3{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}.hia-panel ul{margin:4px 0 12px 18px;padding:0}.hia-panel li{margin:2px 0}' +
    '.hia-panel h4{margin-top:10px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--m)}');
  /* shapes: [zone, svg element markup (class z), label x, y, label] */
  var S = [
    ['roof', '<polygon class="z" points="40,122 200,26 360,122 330,122 200,46 70,122"/>', 200, 40, 'Roof'],
    ['attic', '<polygon class="z" points="78,120 200,52 322,120"/>', 200, 104, 'Attic'],
    ['interior', '<rect class="z" x="66" y="124" width="140" height="58"/>', 136, 157, 'Rooms'],
    ['plumbing', '<rect class="z" x="210" y="124" width="84" height="58"/>', 252, 157, 'Plumbing'],
    ['electrical', '<rect class="z" x="66" y="186" width="58" height="62"/>', 95, 221, 'Electrical'],
    ['hvac', '<rect class="z" x="128" y="186" width="80" height="62"/>', 168, 221, 'HVAC'],
    ['exterior', '<path class="z" d="M212 186h82v62h-82z M6 214h52v34H6z"/>', 253, 221, 'Exterior'],
    ['garage', '<path class="z" d="M298 168l38-22 38 22v80h-76z"/>', 336, 214, 'Garage'],
    ['foundation', '<rect class="z" x="56" y="252" width="244" height="30"/>', 178, 271, 'Foundation / crawlspace']
  ];
  var cur = null, say = HIA.live(r);
  var svg = '<svg viewBox="0 0 400 300" aria-hidden="true" focusable="false"><rect x="0" y="282" width="400" height="18" fill="#F5F0E6"/>' +
    '<line x1="0" y1="250" x2="400" y2="250" stroke="#5A6175" stroke-dasharray="3 3"/>' +
    S.map(function (s) { return '<g data-zone="' + s[0] + '">' + s[1] + '<text x="' + s[2] + '" y="' + s[3] + '" text-anchor="middle">' + s[4] + '</text></g>'; }).join('') +
    '<text x="32" y="208" text-anchor="middle">Deck</text></svg>';
  var pic = E('div', { html: svg });
  var btns = E('div', { class: 'hia-zbtns', role: 'group', 'aria-label': 'Choose a part of the house' });
  var panel = E('div', { class: 'hia-panel', id: 'hia-ex-panel', tabindex: '-1' });
  D.zones.forEach(function (z) {
    btns.appendChild(E('button', { type: 'button', class: 'hia-btn ghost', 'data-zone': z.k, 'aria-pressed': 'false', 'aria-controls': 'hia-ex-panel', text: z.t, onclick: function () { show(z.k, true); } }));
  });
  pic.addEventListener('click', function (e) { var g = e.target.closest('[data-zone]'); if (g) show(g.getAttribute('data-zone'), false); });
  function list(h, a) { return [E('h4', { text: h }), E('ul', null, a.map(function (x) { return E('li', { text: x }); }))]; }
  function show(k, fromBtn) {
    var z = D.zones.filter(function (x) { return x.k === k; })[0]; if (!z) return; cur = k;
    [].forEach.call(r.querySelectorAll('[data-zone]'), function (n) {
      var on = n.getAttribute('data-zone') === k;
      if (n.tagName === 'BUTTON') n.setAttribute('aria-pressed', String(on)); else n.classList.toggle('on', on);
    });
    panel.innerHTML = '';
    panel.appendChild(E('h3', null, z.t, E('span', { class: 'hia-chip', text: 'SOP ' + z.sop })));
    list('What the inspector checks', z.checks).forEach(function (n) { panel.appendChild(n); });
    list('Common defects found', z.defects).forEach(function (n) { panel.appendChild(n); });
    list('Usually outside a standard inspection', z.scope).forEach(function (n) { panel.appendChild(n); });
    panel.appendChild(E('h4', { text: 'Related specialty inspections' }));
    panel.appendChild(E('p', null, z.rel.map(function (x, i) { return [i ? ' · ' : '', HIA.link(x[0], x[1])]; }).reduce(function (a, b) { return a.concat(b); }, [])));
    say(z.t + ' selected');
    if (!fromBtn && window.innerWidth < 760) panel.focus();
  }
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Explore the house' }), E('span', { class: 'hia-kicker', text: 'Click a zone or a button' })));
  r.appendChild(E('div', { class: 'hia-ex' }, E('div', null, pic, btns), panel));
  r.appendChild(E('p', { class: 'hia-foot', text: 'Scope follows the InterNACHI Standards of Practice (sections 3.1 to 3.10). Your state may set its own standards, and inspectors can agree to a wider scope in writing.' }));
  show('roof', true);
  HIA.seo({ name: 'What Do Home Inspectors Look For? House Explorer', desc: 'Interactive house diagram showing what a home inspector checks in each part of a home, common defects, and what is out of scope.', cat: 'ReferenceApplication', faqs: F });
})();
