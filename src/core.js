/* hia-tools core: tiny DOM + mount + JSON-LD helpers shared by every bundle. */
var HIA = (function () {
  var SITE = 'https://homeinspectoratlas.com';
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/[^\/]*$/, '');
  function data(name, cb, fail) {
    fetch(BASE + name + '.json').then(function (x) { if (!x.ok) throw x.status; return x.json(); }).then(cb).catch(function () { if (fail) fail(); });
  }
  function el(tag, attrs) {
    var n = document.createElement(tag), k, v, i, c;
    if (attrs) for (k in attrs) {
      v = attrs[k];
      if (v == null || v === false) continue;
      if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), v);
      else if (k === 'class') n.className = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    for (i = 2; i < arguments.length; i++) {
      c = arguments[i];
      if (c == null || c === false) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x != null) n.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
      else n.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    return n;
  }
  function css(s) {
    if (document.getElementById('hia-css')) { document.getElementById('hia-css').textContent += s; return; }
    var st = document.createElement('style'); st.id = 'hia-css'; st.textContent = s; document.head.appendChild(st);
  }
  function ld(obj) {
    var o = document.querySelector('script[data-hia-ld]'); if (o) o.remove();
    var s = document.createElement('script'); s.type = 'application/ld+json'; s.setAttribute('data-hia-ld', '');
    s.textContent = JSON.stringify(obj); document.head.appendChild(s);
  }
  function hasLd(type) {
    var a = document.querySelectorAll('script[type="application/ld+json"]'), i;
    for (i = 0; i < a.length; i++) if (!a[i].hasAttribute('data-hia-ld') && a[i].textContent.indexOf('"' + type + '"') > -1) return true;
    return false;
  }
  /* Root is created by the loader (#hia-tool). If absent (direct embed/test), create it. */
  function mount(title) {
    var r = document.getElementById('hia-tool');
    if (!r) {
      var c = document.querySelector('.custom-page-content') || document.querySelector('main') || document.body;
      r = el('div', { id: 'hia-tool' });
      var h = c.querySelector('h1');
      if (h && h.parentNode === c) c.insertBefore(r, h.nextSibling); else c.insertBefore(r, c.firstChild);
    }
    r.className = 'hia-tool not-prose';
    r.innerHTML = '';
    r.setAttribute('role', 'region');
    r.setAttribute('aria-label', title);
    return r;
  }
  function seo(o) {
    /* o: {name, desc, type:'WebApplication'|'HowTo', steps:[], faqs:[[q,a]]} */
    var url = SITE + location.pathname;
    var g = [];
    if (o.type === 'HowTo') {
      g.push({ '@type': 'HowTo', name: o.name, description: o.desc, url: url,
        step: (o.steps || []).map(function (s, i) { return { '@type': 'HowToStep', position: i + 1, name: s[0], text: s[1] }; }) });
    } else {
      g.push({ '@type': 'WebApplication', name: o.name, description: o.desc, url: url,
        applicationCategory: o.cat || 'UtilitiesApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: 'Inspector Atlas', url: SITE + '/' } });
    }
    if (o.faqs && o.faqs.length && !hasLd('FAQPage')) {
      g.push({ '@type': 'FAQPage', mainEntity: o.faqs.map(function (f) {
        return { '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } }; }) });
    }
    ld({ '@context': 'https://schema.org', '@graph': g });
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function round(n, s) { s = s || 5; return Math.round(n / s) * s; }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('hia:' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('hia:' + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem('hia:' + k); } catch (e) {} }
  };
  var uid = 0;
  function id(p) { return 'hia-' + (p || 'f') + '-' + (++uid); }
  /* Labelled field helpers */
  function field(label, input, hint) {
    if (!input.id) input.id = id();
    var hid = hint ? id('h') : null;
    if (hid) input.setAttribute('aria-describedby', hid);
    return el('div', { class: 'hia-field' }, el('label', { for: input.id, text: label }), input,
      hint ? el('small', { id: hid, class: 'hia-hint', text: hint }) : null);
  }
  function select(opts, val, on) {
    var s = el('select', { onchange: on });
    opts.forEach(function (o) {
      var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o;
      var op = el('option', { value: v, text: t }); if (String(v) === String(val)) op.selected = true; s.appendChild(op);
    });
    return s;
  }
  function num(val, min, max, step, on) {
    return el('input', { type: 'number', inputmode: 'decimal', value: val, min: min, max: max, step: step || 1, oninput: on });
  }
  function check(label, checked, on) {
    var i = el('input', { type: 'checkbox', onchange: on }); i.checked = !!checked; i.id = id('c');
    return el('label', { class: 'hia-check', for: i.id }, i, el('span', { text: label }));
  }
  function btn(text, on, cls) { return el('button', { type: 'button', class: 'hia-btn ' + (cls || ''), onclick: on, text: text }); }
  function printNode(node) {
    var b = document.body; node.classList.add('hia-print-area'); b.classList.add('hia-printing');
    var done = function () { b.classList.remove('hia-printing'); node.classList.remove('hia-print-area'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    window.print();
    setTimeout(done, 1500);
  }
  function live(r) { var n = el('div', { class: 'hia-sr', 'aria-live': 'polite' }); r.appendChild(n); return function (t) { n.textContent = t; }; }
  function link(path, text) { return el('a', { href: SITE + path, text: text }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function download(name, mime, text) {
    var a = el('a', { href: URL.createObjectURL(new Blob([text], { type: mime })), download: name });
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  /* Sortable table. cols: [{k,label,num,cell:fn(row)->node|string,sort:fn(row)->value}] */
  function table(cols, rows, opt) {
    opt = opt || {};
    var sk = opt.sort || null, dir = opt.dir || 1, filt = '', tb = el('tbody'), ths = [];
    var t = el('table', { class: 'hia-table' }, opt.caption ? el('caption', { class: 'hia-sr', text: opt.caption }) : null);
    var tr = el('tr');
    cols.forEach(function (c) {
      var th = el('th', { scope: 'col', class: c.num ? 'n' : null });
      if (c.nosort) th.textContent = c.label;
      else th.appendChild(el('button', { type: 'button', text: c.label, onclick: function () { dir = sk === c.k ? -dir : (c.num ? -1 : 1); sk = c.k; draw(); } }));
      ths.push(th); tr.appendChild(th);
    });
    t.appendChild(el('thead', null, tr)); t.appendChild(tb);
    function val(c, r) { return c.sort ? c.sort(r) : r[c.k]; }
    function draw() {
      var list = rows.filter(function (r) { if (opt.match) return opt.match(r, filt); return !filt || (opt.text ? opt.text(r) : JSON.stringify(r)).toLowerCase().indexOf(filt) > -1; });
      if (sk) { var c = cols.filter(function (x) { return x.k === sk; })[0];
        list.sort(function (a, b) { var x = val(c, a), y = val(c, b); if (x == null) return 1; if (y == null) return -1; return (x > y ? 1 : x < y ? -1 : 0) * dir; }); }
      cols.forEach(function (c, i) { if (c.nosort) return; ths[i].setAttribute('aria-sort', c.k === sk ? (dir > 0 ? 'ascending' : 'descending') : 'none'); });
      tb.innerHTML = '';
      list.forEach(function (r) {
        var row = el('tr', { class: opt.rowClass ? opt.rowClass(r) : null });
        cols.forEach(function (c, i) { var v = c.cell ? c.cell(r) : (r[c.k] == null ? '–' : r[c.k]);
          row.appendChild(el(i === 0 ? 'th' : 'td', { class: c.num ? 'n' : null, scope: i === 0 ? 'row' : null }, v)); });
        tb.appendChild(row);
      });
      if (!list.length) tb.appendChild(el('tr', null, el('td', { colspan: cols.length, text: 'No matches.' })));
      if (opt.onDraw) opt.onDraw(list.length);
    }
    draw();
    return { node: el('div', { class: 'hia-tablewrap' + (opt.tall ? ' tall' : ''), tabindex: '0', role: 'region', 'aria-label': opt.caption || 'Table' }, t),
      filter: function (q) { filt = (q || '').toLowerCase().trim(); draw(); }, redraw: draw };
  }
  return { data: data, table: table, el: el, css: css, ld: ld, mount: mount, seo: seo, money: money, round: round, store: store, id: id, field: field,
    select: select, num: num, check: check, btn: btn, printNode: printNode, live: live, link: link, esc: esc, download: download, SITE: SITE };
})();
