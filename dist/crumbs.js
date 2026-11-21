/* Inspector Atlas breadcrumbs v3: Atlas > State > City (> Service) on flat category URLs and listings. */
(function(){
var SITE=location.origin,MAP=null,DONE=false;
function slugOf(h){try{var u=new URL(h,SITE);if(u.origin!==SITE)return null;var s=u.pathname.split("/").filter(Boolean);return s.length===1?s[0]:null}catch(e){return null}}
function nav(){var a=document.querySelector('main [data-te-key="breadcrumb_home_label"]');return a?a.closest("nav"):null}
function sep(n){var s=n.querySelector("svg");return s?s.cloneNode(true):document.createTextNode(" / ")}
function apply(){
 if(!MAP||DONE)return;var n=nav();if(!n)return;
 var cur=location.pathname.split("/").filter(Boolean),here=cur.length===1?cur[0]:null;
 var links=[].slice.call(n.querySelectorAll("a")).slice(1),target=null,before=null;
 for(var i=0;i<links.length;i++){var s=slugOf(links[i].getAttribute("href"));if(s&&MAP.p[s]){target=s;before=links[i];break}}
 if(!target&&here&&MAP.p[here]){target=here;before=n.lastElementChild}
 var chain;
 if(cur[0]==="listings"){
  /* listing: the platform crumb uses the listing's alphabetically-first category (often a national service page).
     Replace everything between Atlas and the listing name with State > City, taken from the listing's own
     pre-footer link to its city page (city -> state comes from the map). Same rewrite for BreadcrumbList. */
  var pf=[].slice.call(document.querySelectorAll(".hia-prefooter-links ul:first-of-type a")),cs=null,cl=null;
  for(var q=0;q<pf.length;q++){var c0=slugOf(pf[q].getAttribute("href"));if(c0&&/^home-inspectors-/.test(c0)&&MAP.p[c0]&&MAP.p[c0].length===1){cs=c0;cl=pf[q].textContent.replace(/^Home inspectors in /,"");break}}
  var st=cs?MAP.p[cs][0]:null;
  if(!st)for(var q2=0;q2<pf.length;q2++){var s0=slugOf(pf[q2].getAttribute("href"));if(s0&&/^home-inspectors-/.test(s0)&&MAP.l[s0]&&!MAP.p[s0]){st=s0;break}}
  if(!st)return;
  var home=n.querySelector("a"),last=n.lastElementChild;if(!home||!last||last===home)return;
  DONE=true;if(cs)MAP.l[cs]=MAP.l[cs]||cl;var trail=cs?[st,cs]:[st];
  var proto=sep(n),cls=(links[0]||home).className;
  var node=home.nextSibling;while(node&&node!==last){var nx=node.nextSibling;node.parentNode.removeChild(node);node=nx}
  trail.forEach(function(k){var a=document.createElement("a");a.href=SITE+"/"+k+"/";a.className=cls;a.textContent=MAP.l[k]||k;
   n.insertBefore(proto.cloneNode(true),last);n.insertBefore(a,last)});
  n.insertBefore(proto.cloneNode(true),last);
  [].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'),function(sc){
   try{var o=JSON.parse(sc.textContent);if(o["@type"]!=="BreadcrumbList")return;var it=o.itemListElement||[];if(it.length<2)return;
    var mid=trail.map(function(k){return{"@type":"ListItem",name:MAP.l[k]||k,item:SITE+"/"+k+"/"}});
    o.itemListElement=[it[0]].concat(mid,[it[it.length-1]]);o.itemListElement.forEach(function(x,p){x.position=p+1});
    o.itemListElement[0].name="Atlas";sc.textContent=JSON.stringify(o)}catch(e){}});
  return;
 }
 rootLD();
 if(!target)return;DONE=true;
 chain=MAP.p[target].filter(function(k){return !n.querySelector('a[href$="/'+k+'/"]')});
 chain.forEach(function(k){var a=document.createElement("a");a.href=SITE+"/"+k+"/";a.className="hover:text-primary transition-colors";a.textContent=MAP.l[k]||k;
  n.insertBefore(a,before);n.insertBefore(sep(n),before)});
 fixLD(target,chain,false);
}
function rootLD(){[].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'),function(sc){
  try{var o=JSON.parse(sc.textContent);if(o["@type"]!=="BreadcrumbList")return;var it=o.itemListElement||[];
   if(it[0]&&it[0].name!=="Atlas"){it[0].name="Atlas";sc.textContent=JSON.stringify(o)}}catch(e){}})}
function fixLD(target,chain,afterTarget){
 /* schema: rewrite the platform BreadcrumbList in place */
 [].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'),function(sc){
  try{var o=JSON.parse(sc.textContent);if(o["@type"]!=="BreadcrumbList")return;var it=o.itemListElement||[];
   var idx=-1;for(var j=0;j<it.length;j++){if(slugOf(it[j].item)===target){idx=j;break}}
   if(idx<0)idx=it.length-1;else if(afterTarget)idx=idx+1;
   if(it.some(function(x){return chain.indexOf(slugOf(x.item))>=0}))return;
   var add=chain.map(function(k){return{"@type":"ListItem",name:MAP.l[k]||k,item:SITE+"/"+k+"/"}});
   it.splice.apply(it,[idx,0].concat(add));it.forEach(function(x,p){x.position=p+1});
   if(it[0])it[0].name="Atlas";sc.textContent=JSON.stringify(o)}catch(e){}
 });
}
function load(){if(MAP){apply();return}
 var x=new XMLHttpRequest();x.open("GET",document.currentScript&&document.currentScript.dataset.map||window.HIA_CRUMBS_MAP);x.onload=function(){try{MAP=JSON.parse(x.responseText);apply()}catch(e){}};x.send()}
var me=document.currentScript;window.HIA_CRUMBS_MAP=window.HIA_CRUMBS_MAP||(me&&me.src.replace(/crumbs\.js.*$/,"crumbs.json"));
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",load);else load();
document.addEventListener("livewire:navigated",function(){DONE=false;load()});
})();
