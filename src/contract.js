/* Home inspection contract (pre-inspection agreement) builder: business + client details, fee, standards, optional clauses, state notes, print / .doc / copy. Client-side only. Not legal advice. */
(function () {
  var F = /*FAQS*/[], E = HIA.el, esc = HIA.esc, $ = HIA.money;
  var r = HIA.mount('Home inspection contract template');
  HIA.css('.hia-agr{background:#fff;border:1px solid var(--l);border-radius:10px;padding:24px;font-family:Georgia,"Times New Roman",serif;font-size:14.5px;line-height:1.55;color:#111}' +
    '.hia-agr h3{font-family:Georgia,serif;text-align:center;font-size:19px;margin:0 0 4px}.hia-agr .sub{text-align:center;margin:0 0 14px;font-size:13px}' +
    '.hia-agr p{margin:0 0 9px}.hia-agr ol{margin:0 0 10px 20px;padding:0}.hia-agr li{margin:0 0 8px}.hia-agr .sig{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:22px}' +
    '.hia-agr .sig div{border-top:1px solid #333;padding-top:4px;font-size:13px;margin-top:34px}.hia-agr .dis{font-size:12px;color:#5A6175;border-top:1px solid #ddd;padding-top:8px;margin-top:16px}' +
    '.hia-warn{background:var(--ws);border:1px solid #F5C2BC;color:#7A1B12;border-radius:10px;padding:12px 14px;font-size:14px;margin:0 0 14px}' +
    '@media print{.hia-agr{border:0;padding:0;font-size:11.5pt}.hia-agr li{break-inside:avoid}.hia-warn{display:none}}@media (max-width:520px){.hia-agr{padding:16px}.hia-agr .sig{grid-template-columns:1fr}}');
  var ANC = [['radon', 'Radon test'], ['wdo', 'Termite / WDO inspection'], ['sewer', 'Sewer scope'], ['mold', 'Mold sampling'], ['well', 'Well water test'], ['septic', 'Septic inspection'], ['pool', 'Pool / spa'], ['ir', 'Infrared / thermal scan']];
  var DEF = { co: '', insp: '', lic: '', coaddr: '', cophone: '', client: '', cemail: '', addr: '', date: '', time: '', fee: 425, pay: 'at', sop: 'state', st: '', anc: {}, ancfee: {},
    cap: true, capamt: 'fee', capx: 1000, dispute: 'mediation', notice: true, claimyrs: 1, third: true, cancel: true, cancelfee: 75, delivery: 24, attend: true };
  var v = HIA.store.get('contract', null) || JSON.parse(JSON.stringify(DEF));
  var LIC = null;
  function save() { HIA.store.set('contract', v); }
  function fmtD(s) { if (!s) return '____________'; var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); }
  function b(x, ph) { return esc(x || ph || '____________'); }
  var SOP = { state: 'the standards of practice adopted by the State of [STATE]', nachi: 'the InterNACHI Home Inspection Standards of Practice', ashi: 'the ASHI Standard of Practice for Home Inspections' };
  function stName() { var s = LIC && LIC.filter(function (x) { return x.code === v.st; })[0]; return s ? s.name : ''; }
  function clauses() {
    var co = b(v.co, '[Inspection company]'), fee = +v.fee || 0, anc = ANC.filter(function (a) { return v.anc[a[0]]; }), sop = SOP[v.sop].replace('[STATE]', stName() || '[your state]');
    var ancTot = anc.reduce(function (t, a) { return t + (+v.ancfee[a[0]] || 0); }, 0), c = [];
    c.push(['Services', co + ' ("Inspector") will perform a visual, non-invasive inspection of the readily accessible systems and components of the property at ' + b(v.addr, '[Property address]') + ' on ' + fmtD(v.date) + (v.time ? ' at ' + esc(v.time) : '') + ', and deliver a written report to ' + b(v.client, '[Client]') + ' ("Client")' + (v.delivery ? ' within ' + v.delivery + ' hours of completing the inspection' : '') + '.']);
    c.push(['Standards', 'The inspection will be performed in accordance with ' + esc(sop) + ', which describes what is and is not included. A copy is available on request and is incorporated into this agreement.']);
    c.push(['Fee and payment', 'The inspection fee is ' + $(fee) + (anc.length ? ', plus ' + anc.map(function (a) { return a[1].toLowerCase() + (v.ancfee[a[0]] ? ' (' + $(v.ancfee[a[0]]) + ')' : ''); }).join(', ') + (ancTot ? ', for a total of ' + $(fee + ancTot) : '') : '') + '. Payment is due ' +
      { at: 'at or before the time of inspection', report: 'before the report is released', closing: 'at closing, through escrow, where the closing agent agrees to pay it' }[v.pay] + '.']);
    c.push(['What the inspection is not', 'The inspection is not a warranty, guarantee or insurance policy, and it is not a code compliance, engineering, appraisal or environmental inspection. It does not predict future conditions. Inspector does not move furniture, stored items, floor coverings or finishes, and does not dismantle equipment. Items that are concealed, inaccessible, unsafe to reach or shut off at the time of inspection are excluded and will be noted in the report.']);
    c.push(['Exclusions', 'Unless listed above as an ancillary service, the inspection excludes mold, radon, asbestos, lead paint and other environmental hazards; wood-destroying organisms; pools and spas; septic systems; wells; sewer lines below grade; low-voltage, security and smart-home systems; and the cost to repair any item.']);
    if (v.attend) c.push(['Access and attendance', 'Client will arrange for access to all areas of the property and for all utilities to be on. Client is encouraged to attend the end of the inspection to review findings. Inspector may decline to inspect any area that is unsafe.']);
    if (v.notice) c.push(['Notice of claims', 'If Client believes Inspector failed to report a condition, Client agrees to notify Inspector in writing within 10 days of discovery and, except in an emergency, to give Inspector a reasonable chance to re-inspect before the condition is repaired or altered.']);
    if (v.cap) c.push(['Limitation of liability', 'To the extent permitted by the law of the state where the property is located, Inspector\'s total liability for any claim arising from the inspection or report is limited to ' + (v.capamt === 'fee' ? 'the fee paid for the inspection' : $(v.capx)) + '. Client may ask in writing for a higher limit in exchange for a higher fee before the inspection.']);
    if (v.claimyrs) c.push(['Time to bring a claim', 'Any legal action arising from this agreement or the inspection must be started within ' + (v.claimyrs === 1 ? 'one year' : v.claimyrs + ' years') + ' of the inspection date, unless state law requires a longer period.']);
    c.push(['Disputes', { mediation: 'The parties agree to try in good faith to settle any dispute through mediation before filing a lawsuit. Mediation costs will be shared equally.', arbitration: 'Any dispute will be resolved by binding arbitration under the rules of a mutually agreed arbitration service, in the county where the property is located, where permitted by state law.', court: 'Any dispute may be brought in a court of competent jurisdiction in the county where the property is located, including small claims court.' }[v.dispute]]);
    if (v.third) c.push(['Use of the report', 'The report is for Client\'s exclusive use. Inspector may share it with Client\'s agent and others only with Client\'s permission. No third party may rely on the report without a separate written agreement with Inspector.']);
    if (v.cancel) c.push(['Cancellation', 'Client may cancel or reschedule without charge up to 24 hours before the inspection. Later cancellations, or a trip where the property cannot be accessed, carry a fee of ' + $(v.cancelfee) + '.']);
    c.push(['Entire agreement', 'This is the entire agreement between the parties. If any part of it is found unenforceable, the rest stays in effect. Changes must be in writing and signed by both parties. Client confirms they have read this agreement before the inspection.']);
    return c;
  }
  var agr = E('div', { class: 'hia-agr', 'aria-label': 'Agreement preview' });
  var stNote = E('div');
  function docHTML() {
    var h = ['<h3>Pre-Inspection Agreement</h3><p class="sub">' + b(v.co, '[Inspection company]') + (v.lic ? ', License # ' + esc(v.lic) : '') + (v.coaddr ? '<br>' + esc(v.coaddr) : '') + (v.cophone ? '<br>' + esc(v.cophone) : '') + '</p>'];
    h.push('<p>This agreement is made between ' + b(v.client, '[Client]') + (v.cemail ? ' (' + esc(v.cemail) + ')' : '') + ' and ' + b(v.co, '[Inspection company]') + (v.insp ? ', through inspector ' + esc(v.insp) : '') + '. Please read it carefully before signing.</p><ol>');
    clauses().forEach(function (c) { h.push('<li><strong>' + c[0] + '.</strong> ' + c[1] + '</li>'); });
    h.push('</ol><div class="sig"><div>Client signature and date</div><div>Inspector signature and date</div><div>Client printed name</div><div>Inspector printed name</div></div>');
    h.push('<p class="dis">Template from Inspector Atlas (homeinspectoratlas.com). It is a starting point, not legal advice. Have an attorney licensed in your state review it before use.</p>');
    return h.join('');
  }
  function draw() {
    agr.innerHTML = docHTML();
    stNote.innerHTML = '';
    var s = LIC && LIC.filter(function (x) { return x.code === v.st; })[0];
    if (s) {
      var risky = /liabil|arbitrat|waive|void|agreement|contract/i.test(s.notes || '');
      stNote.appendChild(E('div', { class: 'hia-note' }, E('strong', { text: s.name + ': ' }), (s.license_required ? 'license required' + (s.regulator ? ' (' + s.regulator + ')' : '') : 'no state home inspector license') + '. ',
        s.notes ? E('span', { text: s.notes + ' ' }) : null, s.source_url ? E('a', { href: s.source_url, rel: 'nofollow', text: 'Source' }) : null,
        risky ? E('p', { style: 'margin:8px 0 0;font-weight:700', text: 'This state\'s rules mention agreements or liability. Have a local attorney check the limitation, arbitration and claim clauses.' }) : null));
    }
    save();
  }
  function inp(k, label, type, hint) { var i = E('input', { type: type || 'text', value: v[k] == null ? '' : v[k], oninput: function (e) { v[k] = type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value; draw(); } }); return HIA.field(label, i, hint); }
  function sel(k, label, opts) { return HIA.field(label, HIA.select(opts, v[k], function (e) { v[k] = /^\d+$/.test(e.target.value) ? +e.target.value : e.target.value; draw(); })); }
  function chk(k, label) { return HIA.check(label, v[k], function (e) { v[k] = e.target.checked; draw(); }); }
  var stSel = HIA.select([['', 'Choose your state']], v.st, function (e) { v.st = e.target.value; draw(); });
  var ancBox = E('div', { class: 'hia-grid' });
  ANC.forEach(function (a) {
    var f = E('input', { type: 'number', min: 0, step: 5, value: v.ancfee[a[0]] || '', placeholder: 'Fee $', 'aria-label': a[1] + ' fee', style: 'min-height:38px', oninput: function (e) { v.ancfee[a[0]] = parseFloat(e.target.value) || 0; draw(); } });
    ancBox.appendChild(E('div', null, HIA.check(a[1], v.anc[a[0]], function (e) { v.anc[a[0]] = e.target.checked; draw(); }), f));
  });
  var say;
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Pre-inspection agreement builder' }), E('span', { class: 'hia-kicker', text: 'Free, stays in your browser' })));
  r.appendChild(E('p', { class: 'hia-warn', text: 'Not legal advice. This is a plain-English starting template. Contract and liability rules differ by state, and some states void certain clauses. Have an attorney licensed in your state review your agreement before you use it.' }));
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Your business' }), E('div', null, E('div', { class: 'hia-grid' },
    inp('co', 'Company name'), inp('insp', 'Inspector name'), inp('lic', 'License #'), inp('coaddr', 'Business address'), inp('cophone', 'Phone / email'), HIA.field('State', stSel)))));
  r.appendChild(stNote);
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Client, property and fee' }), E('div', null, E('div', { class: 'hia-grid' },
    inp('client', 'Client name(s)'), inp('cemail', 'Client email'), inp('addr', 'Property address'), inp('date', 'Inspection date', 'date'), inp('time', 'Time', 'time'),
    inp('fee', 'Inspection fee ($)', 'number'), sel('pay', 'Payment due', [['at', 'At or before inspection'], ['report', 'Before report release'], ['closing', 'At closing (escrow)']]),
    sel('sop', 'Standards of practice', [['state', 'My state\'s standards'], ['nachi', 'InterNACHI SOP'], ['ashi', 'ASHI SOP']]), inp('delivery', 'Report delivered within (hours)', 'number')))));
  r.appendChild(E('details', null, E('summary', { text: 'Ancillary services' }), E('div', null, ancBox)));
  r.appendChild(E('details', null, E('summary', { text: 'Optional clauses' }), E('div', null,
    chk('attend', 'Access, utilities and attendance'), chk('notice', 'Notice of claims and right to re-inspect'), chk('third', 'Report is for the client only (no third-party reliance)'),
    chk('cap', 'Limitation of liability'), E('div', { class: 'hia-grid' }, sel('capamt', 'Liability limited to', [['fee', 'The inspection fee'], ['x', 'A fixed amount']]), inp('capx', 'Fixed amount ($)', 'number')),
    sel('claimyrs', 'Time limit to bring a claim', [['0', 'None'], ['1', '1 year'], ['2', '2 years']]),
    sel('dispute', 'Disputes', [['mediation', 'Mediation first, then court'], ['arbitration', 'Binding arbitration'], ['court', 'Court, including small claims']]),
    chk('cancel', 'Cancellation fee'), inp('cancelfee', 'Cancellation fee ($)', 'number'))));
  r.appendChild(E('div', { class: 'hia-row hia-noprint', style: 'margin:14px 0 10px' },
    HIA.btn('Print / save PDF', function () { HIA.printNode(agr); }),
    HIA.btn('Download Word (.doc)', function () { HIA.download('pre-inspection-agreement.doc', 'application/msword', '<html><head><meta charset="utf-8"></head><body style="font-family:Georgia,serif;font-size:11pt">' + docHTML() + '</body></html>'); say('Word file downloaded'); }, 'ghost'),
    HIA.btn('Copy text', function () { (navigator.clipboard ? navigator.clipboard.writeText(agr.innerText) : Promise.reject()).then(function () { say('Agreement copied'); }, function () { say('Copy failed: select the text and copy it manually'); }); }, 'ghost'),
    HIA.btn('Reset', function () { if (confirm('Reset every field and clause?')) { HIA.store.del('contract'); location.reload(); } }, 'ghost')));
  r.appendChild(agr);
  say = HIA.live(r);
  draw();
  HIA.data('licensing', function (d) {
    LIC = d.states;
    LIC.forEach(function (s) { var o = E('option', { value: s.code, text: s.name }); if (s.code === v.st) o.selected = true; stSel.appendChild(o); });
    draw();
  });
  HIA.seo({ type: 'WebApplication', name: 'Home inspection contract template', desc: 'Free pre-inspection agreement template for home inspectors. Add your business, fee, standards of practice and clauses, check your state\'s notes, then print or download a Word copy for attorney review.', cat: 'BusinessApplication', faqs: F });
})();
