/* Inspector Atlas breadcrumbs: Atlas > State > City (> Service) on flat category URLs. */
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
 if(!target)return;DONE=true;
 var chain=MAP.p[target].filter(function(k){return !n.querySelector('a[href$="/'+k+'/"]')});
 chain.forEach(function(k){var a=document.createElement("a");a.href=SITE+"/"+k+"/";a.className="hover:text-primary transition-colors";a.textContent=MAP.l[k]||k;
  n.insertBefore(a,before);n.insertBefore(sep(n),before)});
 /* schema: rewrite the platform BreadcrumbList in place */
 [].forEach.call(document.querySelectorAll('script[type="application/ld+json"]'),function(sc){
  try{var o=JSON.parse(sc.textContent);if(o["@type"]!=="BreadcrumbList")return;var it=o.itemListElement||[];
   var idx=-1;for(var j=0;j<it.length;j++){if(slugOf(it[j].item)===target){idx=j;break}}
   if(idx<0)idx=it.length-1;
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
