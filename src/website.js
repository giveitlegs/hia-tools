/* Home inspector website template generator: business details, services, service area and color theme -> live preview (sandboxed iframe) + downloadable one-page index.html with LocalBusiness JSON-LD. Client-side only. */
(function () {
  var C = /*DATA:cost*/null, F = /*FAQS*/[], E = HIA.el, esc = HIA.esc;
  var r = HIA.mount('Home inspector website template');
  HIA.css('.hia-frame{width:100%;height:620px;border:1px solid var(--l);border-radius:10px;background:#fff;display:block}.hia-frame.m{width:390px;max-width:100%;margin:0 auto}' +
    '.hia-sw{display:flex;gap:8px;flex-wrap:wrap}.hia-sw button{width:44px;height:44px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px var(--l);cursor:pointer}' +
    '.hia-sw button[aria-pressed=true]{box-shadow:0 0 0 3px var(--k)}.hia-svc{display:grid;grid-template-columns:minmax(0,1fr) 96px;gap:6px;align-items:center}.hia-svc input[type=number]{min-height:36px!important;padding:4px 8px!important}' +
    '@media (max-width:520px){.hia-frame{height:520px}}');
  var THEMES = [['Indigo', '#3540A0', '#F0B23E'], ['Teal', '#0E7C6B', '#F0B23E'], ['Graphite', '#2B3038', '#F2D33B'], ['Brick', '#9C3D2E', '#E9C46A'], ['Navy', '#1D3557', '#E76F51']];
  var SV = [['General home inspection', C ? C.consensus.typical : 350, true]];
  if (C) C.addons.forEach(function (a) { SV.push([a.label, HIA.round((a.low + a.high) / 2, 5), /radon|termite|sewer/i.test(a.label)]); });
  var DEF = { name: '', city: '', st: '', area: '', phone: '', email: '', lic: '', years: '', book: '', tag: 'Clear, thorough home inspections with a report you can actually read.',
    about: '', theme: 0, prices: true, svc: SV.map(function (s) { return { t: s[0], p: s[1], on: s[2] }; }), faq: true };
  var v = HIA.store.get('site', null) || JSON.parse(JSON.stringify(DEF));
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function site() {
    var th = THEMES[v.theme] || THEMES[0], P = th[1], A = th[2];
    var name = v.name || 'Your Inspection Company', city = v.city || 'Your City', st = v.st || 'ST', loc = city + ', ' + st;
    var areas = (v.area || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    var svc = v.svc.filter(function (s) { return s.on; });
    var tel = (v.phone || '').replace(/[^\d+]/g, '');
    var desc = name + ' provides home inspections in ' + loc + (areas.length ? ' and nearby areas including ' + areas.slice(0, 3).join(', ') : '') + '. ' + (v.lic ? 'Licensed inspector, ' : '') + 'easy-to-read reports, online booking.';
    var ld = { '@context': 'https://schema.org', '@type': 'ProfessionalService', name: name, description: desc, address: { '@type': 'PostalAddress', addressLocality: city, addressRegion: st, addressCountry: 'US' },
      areaServed: [city].concat(areas), makesOffer: svc.map(function (s) { var o = { '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.t } }; if (v.prices && s.p) { o.price = String(s.p); o.priceCurrency = 'USD'; } return o; }) };
    if (v.phone) ld.telephone = v.phone; if (v.email) ld.email = v.email;
    var faqs = [['How long does a home inspection take?', 'Most inspections of a typical single-family home take two to four hours. Larger or older homes take longer.'],
      ['When will I get my report?', 'You get a written report with photos, usually within 24 hours of the inspection.'],
      ['Should I attend the inspection?', 'Yes, if you can. Join us for the last half hour and we will walk you through what we found.'],
      ['What areas do you serve?', 'We inspect homes in ' + loc + (areas.length ? ' and ' + areas.join(', ') : ' and surrounding communities') + '.']];
    var cta = v.book ? '<a class="btn" href="' + esc(v.book) + '">Book an inspection</a>' : (tel ? '<a class="btn" href="tel:' + esc(tel) + '">Call to book</a>' : '<a class="btn" href="#contact">Book an inspection</a>');
    var css = '*{box-sizing:border-box}body{margin:0;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#1B2030;line-height:1.6;background:#fff}' +
      'a{color:' + P + '}.wrap{max-width:1040px;margin:0 auto;padding:0 20px}header{background:#fff;border-bottom:1px solid #e5e5e5;position:sticky;top:0;z-index:2}' +
      'header .wrap{display:flex;justify-content:space-between;align-items:center;min-height:64px;gap:12px}.logo{font-weight:800;font-size:19px;color:' + P + ';text-decoration:none}' +
      '.btn{display:inline-block;background:' + A + ';color:#1B2030;font-weight:700;padding:12px 20px;border-radius:8px;text-decoration:none}.hero{background:' + P + ';color:#fff;padding:72px 0 64px}' +
      '.hero h1{font-size:clamp(30px,5vw,48px);line-height:1.1;margin:0 0 14px;letter-spacing:-.02em}.hero p{font-size:19px;max-width:620px;margin:0 0 24px;opacity:.92}' +
      '.badges{display:flex;flex-wrap:wrap;gap:10px 22px;margin-top:26px;font-size:15px;opacity:.95}section{padding:56px 0}h2{font-size:30px;margin:0 0 20px;letter-spacing:-.01em}' +
      '.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}.card{border:1px solid #e5e5e5;border-radius:12px;padding:18px}.card h3{margin:0 0 4px;font-size:17px}' +
      '.price{color:' + P + ';font-weight:700}.alt{background:#F7F7F5}.areas{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0}.areas li{background:#fff;border:1px solid #ddd;border-radius:999px;padding:6px 14px}' +
      'details{border-bottom:1px solid #e5e5e5;padding:14px 0}summary{font-weight:700;cursor:pointer}footer{background:#1B2030;color:#ddd;padding:28px 0;font-size:14px}footer a{color:#fff}' +
      '@media (max-width:600px){.hero{padding:48px 0}header .btn{padding:9px 12px;font-size:14px}}';
    var h = '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
      '<title>' + esc('Home Inspection in ' + loc + ' | ' + name) + '</title>\n<meta name="description" content="' + esc(desc) + '">\n' +
      '<meta property="og:title" content="' + esc(name + ': Home Inspections in ' + loc) + '">\n<meta property="og:description" content="' + esc(desc) + '">\n<meta property="og:type" content="website">\n' +
      '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>\n<style>' + css + '</style>\n</head>\n<body>\n' +
      '<header><div class="wrap"><a class="logo" href="#">' + esc(name) + '</a>' + (v.phone ? '<a class="btn" href="tel:' + esc(tel) + '">' + esc(v.phone) + '</a>' : cta) + '</div></header>\n<main>\n' +
      '<div class="hero"><div class="wrap"><h1>Home inspections in ' + esc(loc) + '</h1><p>' + esc(v.tag) + '</p>' + cta +
      '<div class="badges">' + (v.lic ? '<span>License # ' + esc(v.lic) + '</span>' : '') + (v.years ? '<span>' + esc(v.years) + ' years inspecting homes</span>' : '') + '<span>Report with photos within 24 hours</span></div></div></div>\n' +
      '<section id="services"><div class="wrap"><h2>Inspection services</h2><div class="grid">' + svc.map(function (s) {
        return '<div class="card"><h3>' + esc(s.t) + '</h3>' + (v.prices && s.p ? '<div class="price">From ' + money(s.p) + '</div>' : '') + '</div>'; }).join('') + '</div></div></section>\n' +
      '<section class="alt" id="area"><div class="wrap"><h2>Service area</h2><p>Based in ' + esc(loc) + '.' + (areas.length ? ' We also inspect homes in:' : '') + '</p>' + (areas.length ? '<ul class="areas">' + areas.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' : '') + '</div></section>\n' +
      '<section id="about"><div class="wrap"><h2>About ' + esc(name) + '</h2><p>' + esc(v.about || 'Tell visitors who you are, how long you have inspected homes, your training and credentials, and what a client can expect on inspection day.') + '</p></div></section>\n' +
      (v.faq ? '<section class="alt" id="faq"><div class="wrap"><h2>Questions</h2>' + faqs.map(function (f) { return '<details><summary>' + esc(f[0]) + '</summary><p>' + esc(f[1]) + '</p></details>'; }).join('') + '</div></section>\n' : '') +
      '<section id="contact"><div class="wrap"><h2>Book your inspection</h2><p>' + (v.phone ? 'Call <a href="tel:' + esc(tel) + '">' + esc(v.phone) + '</a>' : '') + (v.phone && v.email ? ' or email ' : (v.email ? 'Email ' : '')) +
      (v.email ? '<a href="mailto:' + esc(v.email) + '">' + esc(v.email) + '</a>' : '') + (v.phone || v.email ? '.' : 'Add your phone and email.') + '</p>' + cta + '</div></section>\n</main>\n' +
      '<footer><div class="wrap">&copy; ' + new Date().getFullYear() + ' ' + esc(name) + '. Home inspections in ' + esc(loc) + '.' + (v.lic ? ' License # ' + esc(v.lic) + '.' : '') + '</div></footer>\n</body>\n</html>\n';
    return h;
  }
  var frame = E('iframe', { class: 'hia-frame', title: 'Website preview', sandbox: '', loading: 'lazy' });
  var tmr;
  function draw() { clearTimeout(tmr); tmr = setTimeout(function () { frame.srcdoc = site(); }, 250); HIA.store.set('site', v); }
  function inp(k, label, hint, type) { var i = E('input', { type: type || 'text', value: v[k] || '', oninput: function (e) { v[k] = e.target.value; draw(); } }); return HIA.field(label, i, hint); }
  function area(k, label, hint) { var i = E('textarea', { rows: 3, oninput: function (e) { v[k] = e.target.value; draw(); } }); i.value = v[k] || ''; return HIA.field(label, i, hint); }
  var sw = E('div', { class: 'hia-sw', role: 'group', 'aria-label': 'Color theme' });
  function swatches() {
    sw.innerHTML = '';
    THEMES.forEach(function (t, n) { sw.appendChild(E('button', { type: 'button', style: 'background:linear-gradient(135deg,' + t[1] + ' 60%,' + t[2] + ' 60%)', 'aria-label': t[0] + ' theme', 'aria-pressed': v.theme === n ? 'true' : 'false',
      onclick: function () { v.theme = n; swatches(); draw(); } })); });
  }
  var svcBox = E('div');
  v.svc.forEach(function (s) {
    var p = E('input', { type: 'number', min: 0, step: 5, value: s.p, 'aria-label': s.t + ' price', oninput: function (e) { s.p = parseFloat(e.target.value) || 0; draw(); } });
    svcBox.appendChild(E('div', { class: 'hia-svc' }, HIA.check(s.t, s.on, function (e) { s.on = e.target.checked; draw(); }), p));
  });
  var view = E('div', { class: 'hia-tabs', role: 'group', 'aria-label': 'Preview size' });
  function views(m) { view.innerHTML = ''; [['d', 'Desktop'], ['m', 'Phone']].forEach(function (x) { view.appendChild(E('button', { type: 'button', 'aria-pressed': m === x[0] ? 'true' : 'false', text: x[1], onclick: function () { frame.classList.toggle('m', x[0] === 'm'); views(x[0]); } })); }); }
  var say;
  r.appendChild(E('div', { class: 'hia-head' }, E('h2', { text: 'Website template builder' }), E('span', { class: 'hia-kicker', text: 'Free, no sign-up' })));
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Business details' }), E('div', null, E('div', { class: 'hia-grid' },
    inp('name', 'Business name'), inp('city', 'City'), inp('st', 'State (2 letters)'), inp('phone', 'Phone', null, 'tel'), inp('email', 'Email', null, 'email'), inp('lic', 'License #'),
    inp('years', 'Years in business'), inp('book', 'Online booking link', 'From your scheduling or report software', 'url')),
    area('area', 'Other cities you serve', 'Separate with commas'), inp('tag', 'Tagline'), area('about', 'About you', 'Experience, training, credentials, what clients can expect'))));
  r.appendChild(E('details', null, E('summary', { text: 'Services and prices' }), E('div', null, HIA.check('Show prices on the site', v.prices, function (e) { v.prices = e.target.checked; draw(); }), svcBox,
    E('p', { class: 'hia-hint', text: 'Starting prices are the midpoint of typical US prices from our cost data. Change them to your own fees.' }))));
  r.appendChild(E('details', { open: true }, E('summary', { text: 'Look' }), E('div', null, sw, HIA.check('Include a questions (FAQ) section', v.faq, function (e) { v.faq = e.target.checked; draw(); }))));
  r.appendChild(E('div', { class: 'hia-row', style: 'margin:14px 0 10px' },
    HIA.btn('Download index.html', function () { HIA.download('index.html', 'text/html', site()); say('Website file downloaded'); }),
    HIA.btn('Copy HTML', function () { (navigator.clipboard ? navigator.clipboard.writeText(site()) : Promise.reject()).then(function () { say('HTML copied'); }, function () { say('Copy failed. Use Download instead.'); }); }, 'ghost'),
    HIA.btn('Reset', function () { if (confirm('Reset all fields?')) { HIA.store.del('site'); location.reload(); } }, 'ghost'), view));
  r.appendChild(frame);
  r.appendChild(E('p', { class: 'hia-foot', text: 'The file is a complete one-page site with your title tag, meta description and LocalBusiness structured data. Upload it to any web host, or paste the sections into your site builder.' }));
  say = HIA.live(r);
  swatches(); views('d'); frame.srcdoc = site();
  HIA.seo({ type: 'WebApplication', name: 'Home inspector website template', desc: 'Free home inspector website template. Enter your business, services, prices and service area, preview it on desktop and phone, and download a ready-to-upload one-page site with local SEO tags.', cat: 'BusinessApplication', faqs: F });
})();
