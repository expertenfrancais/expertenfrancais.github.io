#!/usr/bin/env node
/* ===== Génère une page HTML par cours, classée par cycle : cours/primaire/, cours/college/, cours/lycee/, cours/universite/ =====
   Usage (depuis le dossier du site) :
     node outils/generer-pages.js https://votre-domaine.com
   - L’adresse du site est facultative, mais nécessaire pour sitemap.xml, robots.txt et les liens « canonical ».
   - À relancer chaque fois que vous ajoutez ou modifiez un document dans data.js.
   - Les anciennes pages de cours/ (y compris les anciennes pages à plat) qui n’existent plus dans data.js sont supprimées.
   - La liste des pages à garder hors ligne (sw.js) est mise à jour automatiquement. */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const SITE=(process.argv[2]||"").replace(/\/+$/,"");

/* Charge data.js dans un environnement factice (pas de navigateur ici) */
const noop=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>"":noop,apply:()=>noop,set:()=>true});
const ctx={localStorage:{getItem:k=>k==="user_role"?"enseignant":null,setItem(){},removeItem(){}},location:noop,document:noop,window:noop,navigator:noop,console};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"data.js"),"utf8")+"\n;this.__o={ALLDOCS:ALLDOCS,docInfo:docInfo,G:G,IC:IC,price:price,docFile:docFile,CYCLE_INFO:CYCLE_INFO};",ctx);
const {ALLDOCS,docInfo,G,IC,price,docFile,CYCLE_INFO}=ctx.__o;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const svg=p=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+p+'"/></svg>';
const LOCK="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9z",
      CHEV="M8.6 16.6L13.2 12 8.6 7.4 10 6l6 6-6 6z",BACK="M15.4 7.4L14 6l-6 6 6 6 1.4-1.4L10.8 12z";
const cut=(s,n)=>s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,"")+"…":s;

function page(d){
 const I=docInfo(d),g=G[d.k]||G.Cours,S=I.sections,url=SITE?SITE+"/"+docFile(d):"";
 const ns=S.length+" partie"+(S.length>1?"s":"");
 const desc=cut(I.desc,155);
 const ld={"@context":"https://schema.org","@type":"LearningResource",name:d.t,description:I.desc,inLanguage:"fr",educationalLevel:d.n,learningResourceType:d.k,teaches:d.m,offers:{"@type":"Offer",price:d.pr,priceCurrency:"XAF"}};
 if(url)ld.url=url;
 const lessons='<noscript><ol class="plain">'+S.map(s=>"<li>"+esc(s.t)+"</li>").join("")+"</ol></noscript>";
 return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-N5J6FX4H');</script>
<!-- End Google Tag Manager -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#f1ecfb">
<title>${esc(d.t)} | Expert en français</title>
<meta name="description" content="${esc(desc)}">
${url?`<link rel="canonical" href="${esc(url)}">\n`:""}<meta property="og:type" content="article">
<meta property="og:title" content="${esc(d.t)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(d.img)}">
${url?`<meta property="og:url" content="${esc(url)}">\n`:""}<link rel="manifest" href="../../manifest.json">
<link rel="icon" type="image/png" href="../../icon-192.png">
<link rel="apple-touch-icon" href="../../icon-192.png">
<meta property="og:site_name" content="Expert en français">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Expert en français">
<link rel="stylesheet" href="../../course.css">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g,"\\u003c")}</script>
</head>
<body>
<div class="app" id="app">
  <main>
    <div id="page">
    <article class="sheet" style="--g1:${g[0]};--g2:${g[1]}">
      <div class="hero"><div class="pic"><img src="${esc(d.img)}" alt="" onerror="this.remove()"></div>
        <a class="back" id="back" href="../../catalogue.html">${svg(BACK)}Retour</a>
        <div class="pill l"><i>${svg(IC.book)}</i><span>${esc(d.m)}</span></div>
        <div class="pill r" id="price">${esc(price(d.pr))}</div></div>
      <div class="body">
        <h1>${esc(d.t)}</h1>
        <p class="meta">${ns}</p>
        <div class="tags"><span class="tag">${esc(d.k)}</span><span class="tag">${esc(d.c)}</span><span class="tag">${esc(d.n)}</span><span class="tag star">${svg(IC.star)}${d.r.toFixed(1).replace(".",",")}</span></div>
        <h2>Description</h2>
        <p class="t">${esc(I.desc)}</p>
        <h2>Ce que vous apprendrez</h2>
        <ul class="goals">${I.obj.map(o=>"<li>"+svg(IC.check)+"<span>"+esc(o)+"</span></li>").join("")}</ul>
        <h2>Sommaire</h2>
        <div class="lessons" id="lessons">
      ${lessons}
        </div>
        <a class="sub" id="subLink" href="../../abonnement.html"><span>S’abonner et tout débloquer</span>${svg(CHEV)}</a>
      </div>
    </article>
    <div class="dock"><button class="bk" id="bk" type="button" aria-pressed="false" aria-label="Ajouter aux favoris">${svg(IC.heart)}</button>
      <button class="go" id="go" type="button"><span>Acheter · ${esc(price(d.pr))}</span><i>${svg(IC.cart)}</i></button></div>
    </div>
  </main>
  <nav class="nav" id="nav"></nav>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
</div>
<script>var PAGE_BASE="../../",PUBLIC_PAGE=true,DOC_ID=${d.id};</script>
<script src="../../data.js"></script>
<script src="../../course.js"></script>
</body>
</html>
`}

const dir=path.join(root,"cours");fs.mkdirSync(dir,{recursive:true});
const keep=new Set(ALLDOCS.map(docFile));
/* Supprime les pages qui ne sont plus dans data.js (aussi celles de l’ancien dossier à plat), puis les dossiers vides */
(function clean(d){
 fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{
  const full=path.join(d,e.name),rel=path.relative(root,full).split(path.sep).join("/");
  if(e.isDirectory()){clean(full);if(!fs.readdirSync(full).length)fs.rmdirSync(full)}
  else if(e.name.endsWith(".html")&&!keep.has(rel))fs.unlinkSync(full)})})(dir);
ALLDOCS.forEach(d=>{const f=path.join(root,docFile(d));fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,page(d))});

/* Liste des pages gardées hors ligne */
const swp=path.join(root,"sw.js");let sw=fs.readFileSync(swp,"utf8");
sw=sw.replace(/var COURS=\[[^\]]*\];/,"var COURS="+JSON.stringify(ALLDOCS.map(docFile))+";");
sw=sw.replace(/var CONTENU=\[[^\]]*\];/,"var CONTENU="+JSON.stringify(ALLDOCS.map(d=>"contenu/"+d.id+".json"))+";");
fs.writeFileSync(swp,sw);

if(SITE){
 const root_pages=["index.html","catalogue.html","abonnement.html"];
 const urls=root_pages.map(p=>SITE+"/"+p).concat(ALLDOCS.map(d=>SITE+"/"+docFile(d)));
 fs.writeFileSync(path.join(root,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>"  <url><loc>"+esc(u)+"</loc></url>").join("\n")+"\n</urlset>\n");
 fs.writeFileSync(path.join(root,"robots.txt"),"User-agent: *\nAllow: /cours/\nDisallow: /cycles.html\nDisallow: /lecon.html\nDisallow: /profil.html\nDisallow: /panier.html\nDisallow: /login-app.html\n\nSitemap: "+SITE+"/sitemap.xml\n");
}
console.log(ALLDOCS.length+" pages générées dans cours/ ("+Object.keys(CYCLE_INFO).map(c=>CYCLE_INFO[c].dir+": "+ALLDOCS.filter(d=>d.c===c).length).join(", ")+")"+(SITE?" + sitemap.xml et robots.txt":" (aucune adresse de site donnée : pas de sitemap.xml)"));
