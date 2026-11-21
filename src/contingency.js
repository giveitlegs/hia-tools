/* Inspection contingency deadline calculator with state form defaults, business-day counting and .ics export. */
(function () {
  var D = /*DATA:contingency*/null, F = /*FAQS*/[], E = HIA.el;
  var r = HIA.mount('Inspection contingency deadline calculator');
  var S = D.states.slice().sort(function (a, b) { return a.name < b.name ? -1 : 1; });
  function iso(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], p[1] - 1, +p[2]); }
  function nth(y, m, wd, n) { var d = new Date(y, m, 1), c = 0; while (true) { if (d.getDay() === wd && ++c === n) return d; d.setDate(d.getDate() + 1); } }
  function last(y, m, wd) { var d = new Date(y, m + 1, 0); while (d.getDay() !== wd) d.setDate(d.getDate() - 1); return d; }
  function obs(d) { var x = new Date(d); if (x.getDay() === 6) x.setDate(x.getDate() - 1); if (x.getDay() === 0) x.setDate(x.getDate() + 1); return x; }
  var HC = {};
  function hol(y) { /* US federal holidays (observed) */
    if (HC[y]) return HC[y];
    var a = [obs(new Date(y, 0, 1)), nth(y, 0, 1, 3), nth(y, 1, 1, 3), last(y, 4, 1), obs(new Date(y, 5, 19)), obs(new Date(y, 6, 4)), nth(y, 8, 1, 1), nth(y, 9, 1, 2), obs(new Date(y, 10, 11)), nth(y, 10, 4, 4), obs(new Date(y, 11, 25))];
    return (HC[y] = a.map(iso));
  }
  function biz(d) { return d.getDay() !== 0 && d.getDay() !== 6 && hol(d.getFullYear()).indexOf(iso(d)) < 0; }
  function add(start, n, type) { var d = new Date(start), k = 0; if (type !== 'business') { d.setDate(d.getDate() + n); return d; } while (k < n) { d.setDate(d.getDate() + 1); if (biz(d)) k++; } return d; }
  function back(end, n, start) { var d = new Date(end); d.setDate(d.getDate() - n); return d < start ? new Date(start) : d; }
  var fmt = function (d) { return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); };
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var v = { st: '', acc: iso(today), days: D.general.most_common_days, type: 'calendar', resp: 3 };
  var out = E('div', { class: 'hia-result', 'aria-live': 'polite' }), info = E('div', { class: 'hia-note' }), ev = [];
  var dIn = HIA.num(v.days, 1, 60, 1, function (e) { v.days = parseInt(e.target.value, 10) || 1; calc(); });
  var rIn = HIA.num(v.resp, 0, 30, 1, function (e) { v.resp = parseInt(e.target.value, 10) || 0; calc(); });
  var tSel = HIA.select([['calendar', 'Calendar days'], ['business', 'Business days']], v.type, function (e) { v.type = e.target.value; calc(); });
  function pickState(code) {
    v.st = code; var s = S.filter(function (x) { return x.code === code; })[0];
    info.innerHTML = '';
    if (!s) { info.appendChild(E('p', { style: 'margin:0', text: D.general.summary })); return; }
    if (s.default_days) { v.days = s.default_days; dIn.value = v.days; }
    v.type = s.day_type === 'business' ? 'business' : 'calendar'; tSel.value = v.type;
    if (s.response_days != null) { v.resp = s.response_days; rIn.value = v.resp; }
    info.appendChild(E('p', { style: 'margin:0 0 6px' }, E('strong', { text: s.form }), s.form_version_or_date ? ' (' + s.form_version_or_date + ')' : ''));
    info.appendChild(E('p', { style: 'margin:0 0 6px', text: (s.default_days ? 'Default: ' + s.default_days + ' ' + s.day_type + ' days. ' : 'No preprinted default: the period is negotiated, so enter the number in your contract. ') + 'Counting: ' + s.starts + '.' }));
    info.appendChild(E('p', { style: 'margin:0', class: 'hia-muted' }, s.notes + ' ', s.source_url ? E('a', { href: s.source_url, rel: 'nofollow', text: 'Source' }) : null));
  }
  function calc() {
    var a = parse(v.acc); if (isNaN(a)) return;
    var dl = add(a, v.days, v.type), resp = add(dl, v.resp, v.type);
    ev = [['Book your home inspector', add(a, Math.min(2, v.days), v.type)], ['Target date to finish inspections (leaves time for specialists)', back(dl, Math.max(2, Math.round(v.days / 3)), a)],
      ['Review the report and get contractor quotes', back(dl, 1, a)], ['Inspection contingency deadline: repair request or notice due', dl]];
    if (v.resp) ev.push(['Seller response due (if your form sets one)', resp]);
    out.innerHTML = '';
    out.appendChild(E('div', { class: 'hia-muted', text: 'Inspection deadline' }));
    out.appendChild(E('div', { class: 'hia-big', text: fmt(dl) }));
    var weekend = !biz(dl);
    out.appendChild(E('p', { class: 'hia-muted', style: 'margin:4px 0 10px', text: v.days + ' ' + v.type + ' days after ' + fmt(a) + ', counting from the next day.' + (weekend ? ' This lands on a weekend or federal holiday; some forms move it to the next business day, so check yours.' : '') }));
    var ol = E('ol', { style: 'margin:0 0 10px 18px;padding:0' });
    ev.forEach(function (x) { ol.appendChild(E('li', { style: 'margin:4px 0' }, E('strong', { text: fmt(x[1]) }), ' · ' + x[0])); });
    out.appendChild(ol);
    out.appendChild(E('div', { class: 'hia-row hia-noprint' }, HIA.btn('Add to calendar (.ics)', ics), HIA.btn('Print', function () { HIA.printNode(r); }, 'ghost')));
  }
  function ics() {
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    var L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Inspector Atlas//Contingency Calculator//EN', 'CALSCALE:GREGORIAN'];
    ev.forEach(function (x, i) {
      var d = iso(x[1]).replace(/-/g, ''), n = new Date(x[1]); n.setDate(n.getDate() + 1);
      L.push('BEGIN:VEVENT', 'UID:hia-' + d + '-' + i + '@homeinspectoratlas.com', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + d, 'DTEND;VALUE=DATE:' + iso(n).replace(/-/g, ''),
        'SUMMARY:' + x[0].replace(/[,;]/g, ' '), 'DESCRIPTION:Estimated by homeinspectoratlas.com. Confirm every date with your agent or attorney.', 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    HIA.download('inspection-deadlines.ics', 'text/calendar', L.join('\r\n'));
  }
  var stSel = HIA.select([['', 'Other state / custom']].concat(S.map(function (s) { return [s.code, s.name]; })), '', function (e) { pickState(e.target.value); calc(); });
  var accIn = E('input', { type: 'date', value: v.acc, onchange: function (e) { v.acc = e.target.value; calc(); } });
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Contingency deadline calculator' }), E('span', { class: 'hia-kicker', text: 'Forms checked ' + D.last_checked })));
  r.appendChild(E('div', { class: 'hia-cols' }, E('div', null, E('div', { class: 'hia-grid' },
    HIA.field('State contract', stSel), HIA.field('Contract acceptance date', accIn, 'Effective or binding date'),
    HIA.field('Inspection period (days)', dIn), HIA.field('Count as', tSel), HIA.field('Seller response period (days)', rIn, '0 if your form has none')), info), out));
  r.appendChild(E('p', { class: 'hia-foot', text: 'Business days skip weekends and US federal holidays. Contract forms define days, times (often 5:00 or 9:00 p.m.) and notice rules differently. This calculator is a planning aid, not legal advice: your signed contract controls. Confirm deadlines with your agent or attorney.' }));
  pickState('');
  calc();
  HIA.seo({ name: 'Inspection Contingency Deadline Calculator', desc: 'Calculate home inspection contingency, repair request and seller response deadlines from your contract date, with state form defaults and a calendar download.', cat: 'BusinessApplication', faqs: F });
})();
