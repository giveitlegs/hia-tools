/* Inspector Atlas header navigation: dropdown menus, mobile accordion and the pulsing "Claim Your Listing" button.
   Source of truth for the menu is NAV below. Served from jsDelivr (gh/giveitlegs/hia-tools@main/dist/nav.js). */
(function () {
  "use strict";
  var S = "https://homeinspectoratlas.com";
  var NAV = [
    { label: "Home Inspector Reviews", href: "/" },
    { label: "Map", href: "/map/" },
    { label: "Resources", href: "/pages/resources/", wide: true, groups: [
      { title: "For home buyers", items: [
        ["Home Inspection Cost Calculator", "/pages/home-inspection-cost/"],
        ["Home Inspection Checklist", "/pages/home-inspection-checklist/"],
        ["What Home Inspectors Look For", "/pages/what-do-home-inspectors-look-for/"],
        ["Sample Home Inspection Report", "/pages/sample-home-inspection-report/"],
        ["Inspection Contingency Calculator", "/pages/inspection-contingency-calculator/"],
        ["Repair Request Letter Builder", "/pages/repair-request-letter/"],
        ["VA, FHA & USDA Requirements", "/pages/va-fha-usda-inspection-requirements/"],
        ["4-Point & Wind Mitigation Savings", "/pages/4-point-wind-mitigation-calculator/"]
      ]},
      { title: "For home inspectors", items: [
        ["License Requirements by State", "/pages/home-inspector-license-requirements/"],
        ["Home Inspector Salary by State", "/pages/home-inspector-salary/"],
        ["Insurance Cost Estimator", "/pages/home-inspector-insurance/"],
        ["How to Become a Home Inspector", "/pages/how-to-become-a-home-inspector/"]
      ]}
    ], all: ["All resources", "/pages/resources/"] },
    { label: "About", href: "/pages/about/", items: [
      ["About Inspector Atlas", "/pages/about/"],
      ["How We Check Listings", "/pages/how-we-check-listings/"],
      ["Pricing for Home Inspectors", "/pages/pricing/"]
    ]},
    { label: "Blog", href: "/blog/", right: true, items: [
      ["How Long Does a Home Inspection Take?", "/blog/how-long-does-a-home-inspection-take/"],
      ["How to Choose a Home Inspector", "/blog/how-to-choose-a-home-inspector/"],
      ["Who Pays for the Home Inspection?", "/blog/who-pays-for-home-inspection/"],
      ["Home Inspection vs. Appraisal", "/blog/home-inspection-vs-appraisal/"],
      ["Should the Seller Be at the Inspection?", "/blog/should-seller-be-present-at-home-inspection/"],
      ["Is an Inspection Required for a Mortgage?", "/blog/is-a-home-inspection-required-for-a-mortgage/"],
      ["Things That Fail a Home Inspection", "/blog/things-that-fail-a-home-inspection/"],
      ["Negotiating Repairs After an Inspection", "/blog/negotiating-repairs-after-home-inspection/"],
      ["Can You Refuse a Home Insurance Inspection?", "/blog/can-you-refuse-a-home-insurance-inspection/"],
      ["How to Prepare for a Home Inspection", "/blog/how-to-prepare-for-a-home-inspection/"]
    ], all: ["All blog articles", "/blog/"] }
  ];
  var CLAIM = { label: "Claim Your Listing", short: "Claim Listing", href: "/pages/claim-your-listing/" };

  var CSS = [
    ".hia-nav{display:flex;align-items:center;gap:2px}",
    ".hia-dd{position:relative}",
    ".hia-top{display:inline-flex;align-items:center;gap:4px;padding:8px 11px;font-size:.875rem;font-weight:500;color:rgba(27,32,48,.72);border-radius:8px;white-space:nowrap;background:none;border:0;cursor:pointer;text-decoration:none;transition:color .15s,background .15s}",
    ".hia-top:hover,.hia-dd:focus-within>.hia-top,.hia-dd.open>.hia-top{color:#3540A0;background:rgba(53,64,160,.07)}",
    ".hia-top[aria-current=page]{color:#3540A0}",
    ".hia-car{width:14px;height:14px;transition:transform .2s}",
    ".hia-dd.open .hia-car,.hia-dd:hover .hia-car{transform:rotate(180deg)}",
    ".hia-panel{position:absolute;top:calc(100% + 6px);left:0;min-width:290px;background:#fff;border:1px solid rgba(27,32,48,.08);border-radius:14px;box-shadow:0 18px 40px -12px rgba(27,32,48,.28);padding:8px;opacity:0;visibility:hidden;transform:translateY(6px);transition:opacity .16s,transform .16s,visibility .16s;z-index:60}",
    ".hia-panel:before{content:'';position:absolute;left:0;right:0;top:-10px;height:10px}",
    ".hia-dd.right .hia-panel{left:auto;right:0}",
    ".hia-dd:hover>.hia-panel,.hia-dd.open>.hia-panel,.hia-dd:focus-within>.hia-panel{opacity:1;visibility:visible;transform:none}",
    ".hia-panel a{display:block;padding:8px 12px;border-radius:8px;font-size:.875rem;color:#1B2030;text-decoration:none;line-height:1.3}",
    ".hia-panel a:hover,.hia-panel a:focus{background:#F5F0E6;color:#3540A0;outline:none}",
    ".hia-panel.wide{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;min-width:560px;padding:12px}",
    ".hia-gt{font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#0E7C6B;padding:6px 12px 4px}",
    ".hia-panel .hia-all{grid-column:1/-1;margin-top:4px;border-top:1px solid rgba(27,32,48,.08);border-radius:0 0 8px 8px;padding-top:10px;font-weight:600;color:#3540A0}",
    /* claim button */
    ".hia-claim{position:relative;display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;font-size:.875rem;font-weight:700;color:#fff!important;text-decoration:none;white-space:nowrap;background:linear-gradient(120deg,#3540A0 0%,#0E7C6B 100%);background-size:200% 100%;box-shadow:0 6px 18px -6px rgba(53,64,160,.65);overflow:hidden;isolation:isolate;transition:transform .18s,box-shadow .18s,background-position .5s}",
    ".hia-claim:hover{transform:translateY(-1px);background-position:100% 0;box-shadow:0 10px 24px -8px rgba(14,124,107,.7)}",
    ".hia-claim:focus-visible{outline:3px solid #F0B23E;outline-offset:2px}",
    ".hia-claim svg{width:16px;height:16px;flex:none}",
    ".hia-claim:after{content:'';position:absolute;top:0;bottom:0;width:40%;left:-60%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.38),transparent);transform:skewX(-20deg);animation:hiaSheen 3.6s ease-in-out infinite;z-index:-1}",
    ".hia-claim-wrap{position:relative;display:inline-flex}",
    ".hia-claim-wrap:before,.hia-claim-wrap:after{content:'';position:absolute;inset:0;border-radius:999px;border:2px solid rgba(14,124,107,.55);animation:hiaPulse 2.4s cubic-bezier(.2,.6,.3,1) infinite;pointer-events:none}",
    ".hia-claim-wrap:after{animation-delay:1.2s}",
    ".hia-dot{width:8px;height:8px;border-radius:50%;background:#F0B23E;box-shadow:0 0 0 0 rgba(240,178,62,.8);animation:hiaDot 1.6s infinite}",
    "@keyframes hiaPulse{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.28,1.6);opacity:0}}",
    "@keyframes hiaSheen{0%,55%{left:-60%}100%{left:130%}}",
    "@keyframes hiaDot{0%{box-shadow:0 0 0 0 rgba(240,178,62,.8)}70%{box-shadow:0 0 0 7px rgba(240,178,62,0)}100%{box-shadow:0 0 0 0 rgba(240,178,62,0)}}",
    "@media (max-width:1023px){.hia-claim .hia-long{display:none}.hia-claim{padding:8px 13px;font-size:.8rem}}",
    "@media (min-width:1024px){.hia-claim .hia-short{display:none}}",
    "@media (max-width:380px){.hia-claim .hia-short{display:none}.hia-claim{padding:9px}}",
    "@media (prefers-reduced-motion:reduce){.hia-claim:after,.hia-claim-wrap:before,.hia-claim-wrap:after,.hia-dot{animation:none}.hia-panel,.hia-car{transition:none}}",
    /* mobile drawer */
    ".hia-m a,.hia-m summary{display:block;padding:12px 16px;font-size:.9rem;font-weight:500;color:rgba(27,32,48,.8);border-radius:10px;text-decoration:none;cursor:pointer;list-style:none}",
    ".hia-m summary::-webkit-details-marker{display:none}",
    ".hia-m summary{display:flex;justify-content:space-between;align-items:center}",
    ".hia-m details[open] summary .hia-car{transform:rotate(180deg)}",
    ".hia-m a:hover,.hia-m summary:hover{background:#F5F0E6;color:#3540A0}",
    ".hia-m .hia-sub{padding-left:12px;border-left:2px solid #F5F0E6;margin:0 0 6px 16px}",
    ".hia-m .hia-sub a{padding:9px 12px;font-size:.85rem}",
    ".hia-m .hia-gt{padding:10px 12px 2px}",
    ".hia-m .hia-mclaim{margin:18px 4px 0;display:flex;justify-content:center}",
    ".hia-m a.hia-claim{display:inline-flex;padding:11px 20px;font-size:.9rem;color:#fff}",
    ".hia-m a.hia-claim:hover{background:linear-gradient(120deg,#3540A0 0%,#0E7C6B 100%);color:#fff}",
    ".hia-m .hia-claim .hia-long{display:inline}.hia-m .hia-claim .hia-short{display:none}",
    ".hia-dd.right .hia-panel{min-width:340px}",
    /* reveal the platform nav only once rebuilt (falls back to visible after 1.5s if this script fails) */
    "header nav.lg\\:flex.hia-ready{opacity:1!important;animation:none!important}"
  ].join("\n");

  function abs(h) { return h.indexOf("http") === 0 ? h : S + h; }
  function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  var CARET = '<svg class="hia-car" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>';
  var BADGE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l2.4 2.1 3.2-.3.9 3.1 2.8 1.6-1 3 1 3-2.8 1.6-.9 3.1-3.2-.3L12 22l-2.4-2.1-3.2.3-.9-3.1L2.7 15.5l1-3-1-3 2.8-1.6.9-3.1 3.2.3z"/><path d="M8.5 12.2l2.3 2.3 4.7-4.8"/></svg>';
  var here = location.pathname.replace(/\/?$/, "/");

  function link(it, cls) { return '<a href="' + esc(abs(it[1])) + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + esc(it[0]) + "</a>"; }
  function claimHTML() {
    return '<span class="hia-claim-wrap"><a class="hia-claim" href="' + abs(CLAIM.href) + '">' + BADGE +
      '<span class="hia-long">' + esc(CLAIM.label) + '</span><span class="hia-short">' + esc(CLAIM.short) + '</span><span class="hia-dot" aria-hidden="true"></span></a></span>';
  }

  function desktopHTML() {
    return NAV.map(function (n, i) {
      var cur = here === n.href ? ' aria-current="page"' : "";
      if (!n.items && !n.groups) return '<a class="hia-top" href="' + abs(n.href) + '"' + cur + ">" + esc(n.label) + "</a>";
      var id = "hia-p" + i, panel;
      if (n.groups) {
        panel = n.groups.map(function (g) {
          return "<div><div class=\"hia-gt\">" + esc(g.title) + "</div>" + g.items.map(function (x) { return link(x); }).join("") + "</div>";
        }).join("");
      } else panel = n.items.map(function (x) { return link(x); }).join("");
      if (n.all) panel += link(n.all, "hia-all");
      return '<div class="hia-dd' + (n.right ? " right" : "") + '"><a class="hia-top" href="' + abs(n.href) + '" aria-haspopup="true" aria-expanded="false" aria-controls="' + id + '"' + cur + ">" +
        esc(n.label) + CARET + '</a><div class="hia-panel' + (n.groups ? " wide" : "") + '" id="' + id + '" role="menu">' + panel + "</div></div>";
    }).join("");
  }

  function mobileHTML() {
    return NAV.map(function (n) {
      if (!n.items && !n.groups) return link([n.label, n.href]);
      var sub = n.groups ? n.groups.map(function (g) { return '<div class="hia-gt">' + esc(g.title) + "</div>" + g.items.map(function (x) { return link(x); }).join(""); }).join("")
                         : n.items.map(function (x) { return link(x); }).join("");
      if (n.all) sub += link(n.all);
      return "<details><summary>" + esc(n.label) + CARET + '</summary><div class="hia-sub">' + sub + "</div></details>";
    }).join("") + '<div class="hia-mclaim">' + claimHTML() + "</div>";
  }

  function wire(nav) {
    nav.querySelectorAll(".hia-dd").forEach(function (dd) {
      var top = dd.querySelector(".hia-top");
      // touch / keyboard: first tap opens the panel, second tap follows the link
      top.addEventListener("click", function (e) {
        if (window.matchMedia("(hover: none)").matches && !dd.classList.contains("open")) {
          e.preventDefault();
          nav.querySelectorAll(".hia-dd.open").forEach(function (o) { o.classList.remove("open"); o.firstChild.setAttribute("aria-expanded", "false"); });
          dd.classList.add("open"); top.setAttribute("aria-expanded", "true");
        }
      });
      dd.addEventListener("mouseenter", function () { top.setAttribute("aria-expanded", "true"); });
      dd.addEventListener("mouseleave", function () { dd.classList.remove("open"); top.setAttribute("aria-expanded", "false"); });
      dd.addEventListener("keydown", function (e) { if (e.key === "Escape") { dd.classList.remove("open"); top.focus(); } });
    });
    document.addEventListener("click", function (e) { if (!nav.contains(e.target)) nav.querySelectorAll(".hia-dd.open").forEach(function (o) { o.classList.remove("open"); }); });
  }

  function patchMobile(root) {
    if (!root) return;
    var m = root.querySelector("nav.space-y-1");
    if (m && !m.classList.contains("hia-m")) { m.classList.add("hia-m"); m.innerHTML = mobileHTML(); }
  }

  function run() {
    if (!document.getElementById("hia-nav-css")) {
      var st = document.createElement("style"); st.id = "hia-nav-css"; st.textContent = CSS; document.head.appendChild(st);
    }
    var header = document.querySelector("header");
    if (!header) return;
    var nav = header.querySelector("nav.lg\\:flex");
    if (nav && !nav.classList.contains("hia-ready")) {
      nav.classList.add("hia-nav"); nav.innerHTML = desktopHTML(); wire(nav); nav.classList.add("hia-ready");
    }
    var right = header.querySelector(".shrink-0.items-center.gap-3");
    if (right && !right.querySelector(".hia-claim")) right.insertAdjacentHTML("afterbegin", claimHTML());
    // the mobile drawer is an Alpine x-teleport template: patch the template and any copy already teleported into <body>
    var tpl = header.querySelector("template[x-teleport]");
    if (tpl && tpl.content) patchMobile(tpl.content);
    document.querySelectorAll("body > div").forEach(function (d) { if (d.querySelector && d.querySelector("nav.space-y-1:not(.hia-m)")) patchMobile(d); });
  }

  run();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  document.addEventListener("alpine:initialized", run);
  window.addEventListener("load", run);
})();
