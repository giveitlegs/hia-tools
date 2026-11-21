/* Florida 4-point + wind mitigation (OIR-B1-1802) savings estimator: qualitative credit band, no promised dollars. */
(function () {
  var D = /*DATA:florida*/null, F = /*FAQS*/[], E = HIA.el, Q = D.q;
  var r = HIA.mount('Florida 4-point and wind mitigation estimator');
  var Y = new Date().getFullYear();
  /* [form code, short label, weight] ; weight = rough relative size of the credit, 0 = none */
  var OPT = {
    roof_covering: [['A', 'Meets FBC / product approval (most re-roofs after 2002)', 1], ['C', 'Some coverings do not meet FBC', 0], ['D', 'None meet FBC / unknown', 0]],
    roof_deck_attachment: [['A', 'A: 6d nails, weakest (≥55 psf)', 0], ['B', 'B: 8d nails at 6"/12" (≥103 psf)', 1], ['C', 'C: 8d nails at 6"/6" (≥182 psf)', 2], ['D', 'D: Reinforced concrete deck', 2], ['E', 'E: Spray foam (110 psf)', 1], ['G', 'Unknown / no attic access', 0]],
    roof_to_wall: [['A', 'Toenails', 0], ['B', 'Clips', 1], ['C', 'Single wraps', 2], ['D', 'Double wraps', 2], ['E', 'Structural (anchor bolts / concrete roof)', 2], ['G', 'Unknown / no attic access', 0]],
    roof_geometry: [['A', 'Hip roof', 2], ['C', 'Gable or other', 0]],
    secondary_water_resistance: [['A', 'Yes: sealed roof deck / SWR', 1], ['B', 'No', 0], ['C', 'Unknown', 0]],
    opening_protection: [['A', 'A: Impact-rated (large missile 9-lb) on all openings', 3], ['B', 'B: Rated 4-8 lb missile on all openings', 1], ['C', 'C: Plywood panels (FBC 2007)', 0], ['N', 'N: Shutters without documentation', 0], ['X', 'X: None, or some openings unprotected', 0]]
  };
  var TITLE = { roof_covering: 'Roof covering', roof_deck_attachment: 'Roof deck attachment (weakest)', roof_to_wall: 'Roof-to-wall connection (weakest)', roof_geometry: 'Roof shape', secondary_water_resistance: 'Secondary water resistance', opening_protection: 'Opening protection (weakest opening)' };
  var v = { built: 1995, roofYr: 2012, rtype: 'soft', roof_covering: 'A', roof_deck_attachment: 'A', roof_to_wall: 'A', roof_geometry: 'C', secondary_water_resistance: 'C', opening_protection: 'X', ins: 'cit' };
  var out = E('div', { class: 'hia-result', 'aria-live': 'polite' });
  function opt(k, c) { return OPT[k].filter(function (o) { return o[0] === c; })[0]; }
  function calc() {
    out.innerHTML = '';
    var age = Y - v.built, rage = Y - v.roofYr, code = v.built >= 2002 ? (v.built >= 2007 ? 'B' : 'A') : 'D';
    var pts = 0, rows = [], k;
    rows.push(['Building code', code === 'D' ? 'Built before the 2002 Florida Building Code' : 'Built under the Florida Building Code', code === 'D' ? 0 : 2, Q.building_code[code]]);
    if (code !== 'D') pts += 2;
    for (k in OPT) { var o = opt(k, v[k]); pts += o[2]; rows.push([TITLE[k], o[1], o[2], Q[k][o[0]]]); }
    var band = pts >= 8 ? ['Strong', 'Several features that usually earn the larger credits.'] : pts >= 4 ? ['Moderate', 'Some features that usually earn credits.'] : pts >= 1 ? ['Limited', 'One or two features that may earn small credits.'] : ['Minimal', 'Few or no credit-earning features based on your answers.'];
    out.appendChild(E('div', { class: 'hia-muted', text: 'Wind mitigation credit potential' }));
    out.appendChild(E('div', { class: 'hia-big', text: band[0] }));
    out.appendChild(E('p', { class: 'hia-muted', style: 'margin:4px 0 10px', text: band[1] + ' Each insurer files its own discount factors, so no dollar amount is promised.' }));
    var ul = E('ul', { style: 'margin:0;padding:0;list-style:none' });
    rows.forEach(function (x) { ul.appendChild(E('li', { style: 'padding:6px 0;border-top:1px solid #BFE0D7' }, E('div', { class: 'hia-row', style: 'justify-content:space-between' }, E('strong', { text: x[0] }),
      E('span', { class: 'hia-chip ' + (x[2] ? 'ok' : 'no'), text: x[2] >= 2 ? 'Likely credit' : x[2] ? 'Possible credit' : 'Unlikely credit' })), E('div', { class: 'hia-muted', text: x[1] + '. ' + (x[3] || '') }))); });
    out.appendChild(E('details', null, E('summary', { text: 'Feature by feature' }), E('div', null, ul)));
    var t = D.cit.home_age_trigger_years, fp = E('div', { class: 'hia-note' }, E('h3', { text: '4-point inspection' }));
    fp.appendChild(E('p', { text: age > t ? 'Your home is ' + age + ' years old. Citizens requires a 4-point inspection for homes over ' + t + ' years old, and most private carriers ask for one at ' + D.pc.home_age_trigger_years.min + '–' + D.pc.home_age_trigger_years.max + '+ years.' :
      'Your home is ' + age + ' years old. Citizens asks for a 4-point on homes over ' + t + ' years old; some carriers set their own threshold, so ask yours.' }));
    var lim = v.rtype === 'soft' ? 25 : 50;
    fp.appendChild(E('p', { style: 'margin:0', text: 'Roof age ' + rage + ' years. ' + (rage >= 15 ? 'Florida law (s. 627.7011) lets you get a roof inspection before an insurer requires replacement, and an insurer may not refuse a policy solely due to roof age if the roof has 5+ years of useful life left. ' : 'Under Florida law, an insurer may not refuse or non-renew solely because a roof under 15 years is old. ') +
      (rage > lim ? 'Citizens needs proof of at least 5 years of remaining life for ' + (v.rtype === 'soft' ? 'shingle roofs over 25' : 'tile or metal roofs over 50') + ' years old.' : '') }));
    out.appendChild(fp);
    out.appendChild(E('p', { style: 'margin:10px 0 0' }, HIA.link('/wind-mitigation-inspection-florida/', 'Find Florida wind mitigation inspectors'), ' · ', HIA.link('/4-point-inspection-florida/', 'Find 4-point inspectors')));
  }
  function u(k, n) { return function (e) { v[k] = n ? (parseInt(e.target.value, 10) || 0) : e.target.value; calc(); }; }
  var fields = [HIA.field('Year built', HIA.num(v.built, 1900, Y, 1, u('built', 1))), HIA.field('Year roof was replaced', HIA.num(v.roofYr, 1950, Y, 1, u('roofYr', 1)), 'Last full (100%) replacement'),
    HIA.field('Roof material', HIA.select([['soft', 'Shingle (soft)'], ['hard', 'Tile, metal, slate (hard)']], v.rtype, u('rtype')))];
  for (var k in OPT) fields.push(HIA.field(TITLE[k], HIA.select(OPT[k].map(function (o) { return [o[0], o[1]]; }), v[k], u(k))));
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Florida wind mitigation and 4-point estimator' }), E('span', { class: 'hia-kicker', text: 'Form OIR-B1-1802 ' + D.rev })));
  r.appendChild(E('div', { class: 'hia-cols' }, E('div', { class: 'hia-grid' }, fields), E('div', null, out)));
  r.appendChild(E('p', { class: 'hia-foot' }, 'Answers map to the questions on the uniform mitigation form ' + D.rev + '. Credit notes follow s. 627.0629, F.S. and Citizens\' Wind Loss Mitigation Guide; private carriers weight features differently. Not sure of an answer? A qualified wind mitigation inspector checks the attic and openings and signs the form, which is valid for up to 5 years. My Safe Florida Home grants (up to $' + D.msfh.max_grant_usd.toLocaleString('en-US') + '): check ',
    E('a', { href: D.msfh.official_url, text: 'mysafeflhome.com' }), ' for current status.'));
  calc();
  HIA.seo({ name: '4-Point and Wind Mitigation Savings Estimator (Florida)', desc: 'Estimate which Florida OIR-B1-1802 wind mitigation features may earn insurance credits and whether your insurer will ask for a 4-point inspection.', cat: 'FinanceApplication', faqs: F });
})();
