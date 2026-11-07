/* ===== Catalogue automatique =====
   Le catalogue (tableau ALLDOCS de data.js) n'est plus écrit à la main : il est construit à partir de la clé "meta"
   de chaque fichier de contenu :
     contenu/cours/<cycle>/<id>.json            (type Cours)
     contenu/fiches/<cycle>/fiche-<n>.json      (type Fiches)
     contenu/annales/<cycle>/annale-<an>.json   (type Annales ; id = 20000 + an)
     contenu/exercices/<cycle>/exercice-<ex>.json (type Exercices ; id = 30000 + ex)
     contenu/evaluations/<cycle>/evaluation-<ev>.json (type Évaluations ; id = 40000 + ev)
   Pour ajouter un document : déposer son fichier dans le bon dossier, puis lancer  node outils/generer-pages.js
   (le générateur réécrit le bloc /*CATALOGUE-AUTO:DEBUT*\/ … /*CATALOGUE-AUTO:FIN*\/ de data.js : ne pas le modifier à la main). */
const fs=require("fs"),path=require("path");
const TYPE_DIR={Cours:"cours",Fiches:"fiches",Annales:"annales",Exercices:"exercices","Évaluations":"evaluations"};   /* type -> dossier de contenu/ (à compléter avec les futurs types) */
const DEB="/*CATALOGUE-AUTO:DEBUT",FIN="/*CATALOGUE-AUTO:FIN*/";

function walk(dir,out){
 if(!fs.existsSync(dir))return out;
 fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{const f=path.join(dir,e.name);
  if(e.isDirectory())walk(f,out);else if(e.name.endsWith(".json")&&!e.name.startsWith("_"))out.push(f)});
 return out}

/* Lit tous les fichiers de contenu. Renvoie { docs: [...], errs: [[fichier, message], ...] } */
function lireCatalogue(root){
 const docs=[],errs=[];
 Object.keys(TYPE_DIR).forEach(k=>walk(path.join(root,"contenu",TYPE_DIR[k]),[]).sort().forEach(f=>{
  const rel=path.relative(path.join(root,"contenu"),f).split(path.sep).join("/");
  let j;try{j=JSON.parse(fs.readFileSync(f,"utf8"))}catch(e){errs.push([rel,"JSON invalide ("+e.message+")"]);return}
  const m=j&&j.meta;
  if(!m||typeof m!=="object"){errs.push([rel,"clé \"meta\" manquante (titre, type, niveau, matière, image, note)"]);return}
  const bad=["t","k","n","m","img"].filter(x=>typeof m[x]!=="string"||!m[x].trim());
  if(bad.length){errs.push([rel,"meta : champ(s) manquant(s) ou vide(s) : "+bad.join(", ")]);return}
  if(!Number.isInteger(j.id)){errs.push([rel,"id : nombre entier attendu"]);return}
  if(m.k!==k){errs.push([rel,"meta.k vaut « "+m.k+" » mais le fichier est dans contenu/"+TYPE_DIR[k]+"/ (type attendu : "+k+")"]);return}
  const d={id:j.id,img:m.img,t:m.t,k:m.k,n:m.n,m:m.m,r:typeof m.r==="number"?m.r:4.8};
  if(k==="Fiches"){if(!Number.isInteger(m.fn)||m.fn<1){errs.push([rel,"meta.fn : numéro de fiche (1, 2, 3…) attendu"]);return}d.fn=m.fn}
  if(k==="Annales"){if(!Number.isInteger(m.an)||m.an<1){errs.push([rel,"meta.an : numéro d’annale (1, 2, 3…) attendu"]);return}
   if(j.id!==20000+m.an){errs.push([rel,"id : 20000 + meta.an attendu (soit "+(20000+m.an)+")"]);return}d.an=m.an}
  if(k==="Exercices"){if(!Number.isInteger(m.ex)||m.ex<1){errs.push([rel,"meta.ex : numéro de série d’exercices (1, 2, 3…) attendu"]);return}
   if(j.id!==30000+m.ex){errs.push([rel,"id : 30000 + meta.ex attendu (soit "+(30000+m.ex)+")"]);return}d.ex=m.ex}
  if(k==="Évaluations"){if(!Number.isInteger(m.ev)||m.ev<1){errs.push([rel,"meta.ev : numéro d’évaluation (1, 2, 3…) attendu"]);return}
   if(j.id!==40000+m.ev){errs.push([rel,"id : 40000 + meta.ev attendu (soit "+(40000+m.ev)+")"]);return}d.ev=m.ev}
  if(k!=="Fiches"&&Array.isArray(j.sections))d.s=j.sections.map(s=>String(s&&s.t||""));
  docs.push(d)}));
 docs.sort((a,b)=>a.id-b.id);
 const seen={};docs.forEach(d=>{if(seen[d.id])errs.push(["id "+d.id,"id en double (deux fichiers de contenu)"]);seen[d.id]=1});
 return {docs,errs}}

const q=s=>JSON.stringify(s);
function ligne(d){
 const p=["id:"+d.id];
 if(d.fn!==undefined)p.push("fn:"+d.fn);
 if(d.an!==undefined)p.push("an:"+d.an);
 if(d.ex!==undefined)p.push("ex:"+d.ex);
 if(d.ev!==undefined)p.push("ev:"+d.ev);
 p.push("img:IMG."+d.img,"t:"+q(d.t),"k:"+q(d.k),"n:"+q(d.n),"m:"+q(d.m),"pr:25","r:"+d.r);
 if(d.s)p.push("s:["+d.s.map(t=>"{t:"+q(t)+"}").join(",")+"]");
 return " {"+p.join(",")+"}"}

function blocCatalogue(docs){
 return DEB+" — généré par outils/generer-pages.js à partir des fichiers de contenu/ ; ne pas modifier à la main */\n"+docs.map(ligne).join(",\n")+"\n"+FIN}

const RE=/\/\*CATALOGUE-AUTO:DEBUT[\s\S]*?\/\*CATALOGUE-AUTO:FIN\*\//;
function blocActuel(root){const m=RE.exec(fs.readFileSync(path.join(root,"data.js"),"utf8"));return m?m[0]:null}
/* Réécrit le bloc de data.js ; renvoie true s'il a changé */
function majDataJs(root,docs){
 const p=path.join(root,"data.js"),s=fs.readFileSync(p,"utf8");
 if(!RE.test(s))throw new Error("data.js : marqueurs /*CATALOGUE-AUTO:DEBUT … FIN*/ introuvables");
 const nouveau=blocCatalogue(docs),ancien=RE.exec(s)[0];
 if(ancien===nouveau)return false;
 fs.writeFileSync(p,s.replace(RE,()=>nouveau));return true}

module.exports={TYPE_DIR,lireCatalogue,blocCatalogue,blocActuel,majDataJs};
