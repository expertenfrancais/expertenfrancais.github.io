#!/usr/bin/env node
/* ===== Génère une page HTML par cours, classée par cycle : cours/primaire/, cours/college/, cours/lycee/, cours/universite/ ; les fiches pédagogiques dans fiches/<cycle>/, les annales dans annales/<cycle>/, les exercices dans exercices/<cycle>/, les évaluations dans evaluations/<cycle>/ =====
   Usage (depuis le dossier du site) :
     node outils/generer-pages.js https://votre-domaine.com
   - L’adresse du site est facultative, mais nécessaire pour sitemap.xml, robots.txt et les liens « canonical ».
   - À relancer chaque fois que vous ajoutez ou modifiez un document (fichier de contenu/cours/<cycle>/, contenu/fiches/<cycle>/ ou contenu/annales/<cycle>/ contenu/exercices/<cycle>/ ou contenu/evaluations/<cycle>/).
   - Le catalogue de data.js (ALLDOCS) est reconstruit à partir de la clé "meta" de ces fichiers (voir outils/catalogue.js).
   - Les anciennes pages de cours/ (y compris les anciennes pages à plat) qui n’existent plus dans le catalogue sont supprimées.
   - La liste des pages à garder hors ligne (sw.js) est mise à jour automatiquement. */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const SITE=(process.argv[2]||"").replace(/\/+$/,"");

/* Étape 1 : reconstruire le catalogue de data.js à partir des fichiers de contenu */
const CAT=require("./catalogue.js");
const lu=CAT.lireCatalogue(root);
if(lu.errs.length){lu.errs.forEach(e=>console.log("ERREUR  "+e[0]+" : "+e[1]));console.log("Catalogue non mis à jour : corrigez les erreurs ci-dessus.");process.exit(1)}
console.log(CAT.majDataJs(root,lu.docs)?"Catalogue de data.js mis à jour ("+lu.docs.length+" documents).":"Catalogue de data.js déjà à jour ("+lu.docs.length+" documents).");

/* Charge data.js dans un environnement factice (pas de navigateur ici) */
const noop=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>"":noop,apply:()=>noop,set:()=>true});
const ctx={localStorage:{getItem:k=>k==="user_role"?"enseignant":null,setItem(){},removeItem(){}},location:noop,document:noop,window:noop,navigator:noop,console};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"data.js"),"utf8")+"\n;this.__o={ALLDOCS:ALLDOCS,docInfo:docInfo,G:G,IC:IC,price:price,docFile:docFile,contentFile:contentFile,CYCLE_INFO:CYCLE_INFO};",ctx);
const {ALLDOCS,docInfo,G,IC,price,docFile,contentFile,CYCLE_INFO}=ctx.__o;

const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const svg=p=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+p+'"/></svg>';
const LOCK="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9z",
      CHEV="M8.6 16.6L13.2 12 8.6 7.4 10 6l6 6-6 6z",BACK="M15.4 7.4L14 6l-6 6 6 6 1.4-1.4L10.8 12z";
const cut=(s,n)=>s.length>n?s.slice(0,n-1).replace(/\s+\S*$/,"")+"…":s;

function page(d){
 const html=pageCours(d);
 return d.k==="Fiches"?pageFiche(d,html):html}

function pageCours(d){
 const I=docInfo(d),g=G[d.k]||G.Cours,S=I.sections,url=SITE?SITE+"/"+docFile(d):"";
 const ns=S.length+" partie"+(S.length>1?"s":"");
 const desc=cut(I.desc,155);
 const ld={"@context":"https://schema.org","@type":"LearningResource",name:d.t,description:I.desc,inLanguage:"fr",educationalLevel:d.n,learningResourceType:d.k,teaches:d.m,offers:{"@type":"Offer",price:0,priceCurrency:"XAF"}};
 if(url)ld.url=url;
 const lessons='<noscript><ol class="plain">'+S.map(s=>"<li>"+esc(s.t)+"</li>").join("")+"</ol></noscript>";
 return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<!-- Balise Google (Analytics) -->
<script async src="https://www.googletagmanager.com/gtm.js?id=GTM-N5J6FX4H"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
</script>
<!-- Fin balise Google -->
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
        <div class="pill r" id="price">Gratuit</div></div>
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
      </div>
    </article>
    <div class="dock"><button class="bk" id="bk" type="button" aria-pressed="false" aria-label="Ajouter aux favoris">${svg(IC.heart)}</button>
      <button class="go" id="go" type="button"><span>Télécharger</span><i>${svg(IC.dl)}</i></button></div>
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

/* Fiche pédagogique : même coquille que les cours, mais le sommaire est remplacé par la présentation de la séance
   (durée, niveau, objectif, déroulement en 5 étapes) et un bouton « Ouvrir la fiche » vers fiche.html?n=<numéro de fiche> (voir contenu/SPEC-FICHES.md). */
function lireFiche(d){
 try{const j=JSON.parse(fs.readFileSync(path.join(root,contentFile(d)),"utf8"));return j&&j.type==="fiche"?j:null}
 catch(e){console.log("avert. "+contentFile(d)+" : fiche illisible, présentation réduite");return null}}
const romanOf=t=>{const i=String(t).indexOf("-");return i>0&&i<5?{n:t.slice(0,i),t:t.slice(i+1)}:{n:"",t:t}};
const totalOf=s=>s.sousEtapes?s.sousEtapes.reduce((a,x)=>a+(+x.temps||0),0):(+s.temps||0);
function pageFiche(d,html){
 const j=lireFiche(d),I=docInfo(d),en=j&&j.entete||{},et=j?j.etapes:[];
 const id=d.id,duree=en.duree||"",num=en.numero||"";
 const bar=et.length?'<div class="f-bar2">'+et.map(s=>'<i style="flex:'+Math.max(totalOf(s),1)+'"></i>').join("")+'</div>':"";
 const lst=et.length?'<ul class="f-lst">'+et.map(s=>{const r=romanOf(s.titre);
  return '<li><span class="f-num">'+esc(r.n)+'</span><span>'+esc(r.t)+'</span><small>'+totalOf(s)+' min</small></li>'+
   (s.sousEtapes?'<li class="sub">'+s.sousEtapes.map(x=>{const a=romanOf(x.titre);return esc(a.n+" · "+a.t)+" ("+(+x.temps||0)+" min)"}).join(" · ")+'</li>':"")}).join("")+'</ul>':"";
 const pres=`<article class="f-pres">
      <div class="f-bar" style="margin-top:calc(env(safe-area-inset-top,0px) + 14px)"><a class="f-back" id="back" href="../../catalogue.html" aria-label="Retour">${svg(BACK)}</a>
        <div class="f-ttl"><small>Catalogue · Fiches · ${esc(d.n)}</small><b>Fiche pédagogique</b></div></div>
      <section class="f-card"><div class="f-tags"><span class="f-tag">Fiche · ${esc(d.m)}</span><span class="f-tag">${esc(d.n)}</span><span class="f-tag g">Réservé aux enseignants</span></div>
        <h1>${esc(d.t)}</h1><p class="f-desc">${esc(I.desc)}</p>
        ${j?`<div class="f-stats"><div><small>Durée</small><b>${esc(duree)} min</b></div><div><small>Étapes</small><b>${et.length}</b></div><div><small>Fiche n°</small><b>${esc(num)}</b></div></div>`:""}</section>
      ${j&&j.oo?`<section class="f-oo"><span class="f-lab">Objectif opérationnel</span><p>${esc(j.oo)}</p></section>`:""}
      ${j?`<section class="f-card"><h2>Le déroulement de la séance</h2>${bar}${lst}</section>`:""}
      <section class="f-card"><h2>Dans cette fiche</h2>
        <div class="f-in"><i>1</i><span>Fiche du professeur : tableau de la séance</span></div>
        <div class="f-in"><i>2</i><span>Page de l’apprenant : à distribuer</span></div>
        <div class="f-in"><i>3</i><span>Corrigé enseignant avec barème</span></div></section>
      <div class="f-btns"><a class="f-btn" href="../../fiche.html?n=${d.fn}">Ouvrir la fiche</a>
        <div class="f-btns2"><a class="f-btn alt" href="../../fiche.html?n=${d.fn}#apprenant">Page de l’apprenant</a><a class="f-btn alt" href="../../pdf.html?n=${d.fn}">Enregistrer en PDF</a></div></div>
      <span id="price" hidden></span><div id="lessons" hidden></div>
    </article>`;
 let out=html.replace(/<article class="sheet"[\s\S]*?<\/article>/,()=>pres);
 out=out.replace('DOC_ID='+d.id+';','DOC_ID='+d.id+',FICHE_N='+d.fn+';');
 out=out.replace('<link rel="stylesheet" href="../../course.css">','<link rel="stylesheet" href="../../course.css">\n<link rel="stylesheet" href="../../fiche.css">');
 out=out.replace('<script src="../../course.js"></script>','<script src="../../course.js"></script>\n<script>/* Fiche : le bouton du bas ouvre la fiche, pas le PDF d’un cours */\ntry{if(canAccess(DOC_ID)){var g=document.getElementById("go");if(g){g.innerHTML=\'<span>Ouvrir la fiche</span><i>\'+\''+svg(CHEV).replace(/'/g,"\\'")+'\'+\'</i>\';g.onclick=function(){location.href=PAGE_BASE+"fiche.html?n="+FICHE_N}}}}catch(e){}</script>');
 return out}

const DIRS=["cours","fiches","annales","exercices","evaluations"].map(n=>path.join(root,n));DIRS.forEach(x=>fs.mkdirSync(x,{recursive:true}));
const keep=new Set(ALLDOCS.map(docFile));
/* Supprime les pages qui ne sont plus dans le catalogue (aussi celles de l’ancien dossier à plat), puis les dossiers vides */
function clean(d){
 fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{
  const full=path.join(d,e.name),rel=path.relative(root,full).split(path.sep).join("/");
  if(e.isDirectory()){clean(full);if(!fs.readdirSync(full).length)fs.rmdirSync(full)}
  else if(e.name.endsWith(".html")&&!keep.has(rel))fs.unlinkSync(full)})}
DIRS.forEach(clean);
ALLDOCS.forEach(d=>{const f=path.join(root,docFile(d));fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,page(d))});

/* Liste des pages gardées hors ligne */
const swp=path.join(root,"sw.js");let sw=fs.readFileSync(swp,"utf8");
sw=sw.replace(/var COURS=\[[^\]]*\];/,"var COURS="+JSON.stringify(ALLDOCS.filter(d=>d.k!=="Fiches").map(docFile))+";");
sw=sw.replace(/var CONTENU=\[[^\]]*\];/,"var CONTENU="+JSON.stringify(ALLDOCS.filter(d=>d.k!=="Fiches").map(contentFile))+";");
fs.writeFileSync(swp,sw);

if(SITE){
 const root_pages=["index.html","catalogue.html","abonnement.html"];
 const urls=root_pages.map(p=>SITE+"/"+p).concat(ALLDOCS.filter(d=>d.k!=="Fiches"&&d.k!=="Évaluations").map(d=>SITE+"/"+docFile(d)));
 fs.writeFileSync(path.join(root,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>"  <url><loc>"+esc(u)+"</loc></url>").join("\n")+"\n</urlset>\n");
 fs.writeFileSync(path.join(root,"robots.txt"),"User-agent: *\nAllow: /cours/\nAllow: /annales/\nAllow: /exercices/\nDisallow: /evaluations/\nDisallow: /cycles.html\nDisallow: /lecon.html\nDisallow: /fiche.html\nDisallow: /fiches/\nDisallow: /pdf.html\nDisallow: /profil.html\nDisallow: /panier.html\nDisallow: /login-app.html\n\nSitemap: "+SITE+"/sitemap.xml\n");
}
console.log(ALLDOCS.length+" pages générées dans cours/, fiches/, annales/, exercices/ et evaluations/ ("+Object.keys(CYCLE_INFO).map(c=>CYCLE_INFO[c].dir+": "+ALLDOCS.filter(d=>d.c===c).length).join(", ")+")"+(SITE?" + sitemap.xml et robots.txt":" (aucune adresse de site donnée : pas de sitemap.xml)"));
