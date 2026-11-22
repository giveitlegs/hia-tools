/* Resources hub enhancer: search filter, audience keys, ItemList + BreadcrumbList JSON-LD. All links are already server-rendered; this only filters them. */
(function () {
  function init() {
    var hub = document.getElementById('hia-hub');
    if (!hub || hub.getAttribute('data-ready')) return;
    hub.setAttribute('data-ready', '1');
    var q = hub.querySelector('#hub-q'), keys = hub.querySelectorAll('.hub-keys button'), secs = hub.querySelectorAll('.hub-sec');
    var status = hub.querySelector('.hub-status'), empty = hub.querySelector('.hub-empty');
    var items = [].slice.call(hub.querySelectorAll('.hub-card,.hub-row'));
    var group = 'all';
    [].forEach.call(hub.querySelectorAll('[data-js]'), function (n) { n.hidden = false; });
    items.forEach(function (n, i) { n.style.setProperty('--n', i % 8); n._t = (n.textContent + ' ' + (n.getAttribute('data-k') || '')).toLowerCase(); });
    function apply() {
      var t = (q.value || '').toLowerCase().trim(), words = t.split(/\s+/).filter(Boolean), shown = 0;
      [].forEach.call(secs, function (s) {
        var inGroup = group === 'all' || s.getAttribute('data-g') === group || s.getAttribute('data-g') === 'more', n = 0;
        [].forEach.call(s.querySelectorAll('.hub-card,.hub-row'), function (c) {
          var ok = inGroup && words.every(function (w) { return c._t.indexOf(w) > -1; });
          c.hidden = !ok; if (ok) n++;
        });
        s.hidden = !n; shown += n;
      });
      empty.hidden = shown > 0;
      status.textContent = t || group !== 'all' ? shown + (shown === 1 ? ' resource' : ' resources') + ' shown' : '';
    }
    q.addEventListener('input', apply);
    [].forEach.call(keys, function (b) {
      b.addEventListener('click', function () {
        group = b.getAttribute('data-g');
        [].forEach.call(keys, function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        apply();
      });
    });
    var clr = empty.querySelector('button');
    if (clr) clr.addEventListener('click', function () { q.value = ''; group = 'all'; [].forEach.call(keys, function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-g') === 'all' ? 'true' : 'false'); }); apply(); q.focus(); });
    /* JSON-LD: Directify custom pages have no head field, so it is added here (Google renders JS). */
    if (!document.querySelector('script[data-hia-hub-ld]')) {
      var site = 'https://homeinspectoratlas.com', url = site + '/pages/resources/';
      var list = [].map.call(hub.querySelectorAll('.hub-card,.hub-row>a'), function (a, i) {
        return { '@type': 'ListItem', position: i + 1, url: a.href, name: (a.querySelector('h3') || a).textContent.trim() };
      });
      var g = [{ '@type': 'CollectionPage', '@id': url, url: url, name: document.title.split(' - ')[0], isPartOf: { '@type': 'WebSite', url: site + '/' } },
        { '@type': 'ItemList', name: 'Home inspection tools and resources', numberOfItems: list.length, itemListElement: list },
        { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home Inspectors', item: site + '/' }, { '@type': 'ListItem', position: 2, name: 'Resources', item: url }] }];
      var s = document.createElement('script'); s.type = 'application/ld+json'; s.setAttribute('data-hia-hub-ld', '');
      s.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': g }); document.head.appendChild(s);
    }
    apply();
  }
  init();
  document.addEventListener('DOMContentLoaded', init);
  document.addEventListener('livewire:navigated', init);
})();
