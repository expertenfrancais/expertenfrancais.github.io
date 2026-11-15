#!/usr/bin/env node
/* ===== Génère contenu/index-versions.json : l'empreinte (hash) de chaque fichier téléchargeable hors ligne =====
   Usage (depuis le dossier du site) :  node outils/generer-versions.js
   - Lancé automatiquement à la fin de outils/generer-pages.js. À relancer aussi si vous modifiez à la main une page, un script ou un fichier de contenu.
   - L'application compare ce fichier avec ce que l'utilisateur a déjà téléchargé (Paramètres > Télécharger les contenus) :
     elle ne retélécharge que les fichiers nouveaux ou modifiés, et supprime ceux qui n'existent plus. */
const fs=require("fs"),path=require("path"),crypto=require("crypto");
const root=path.join(__dirname,"..");
const rel=p=>path.relative(root,p).split(path.sep).join("/");
const files={};
function walk(dir,ext,skip){
 if(!fs.existsSync(dir))return;
 fs.readdirSync(dir,{withFileTypes:true}).forEach(e=>{
  const full=path.join(dir,e.name);
  if(e.isDirectory())return walk(full,ext,skip);
  if(!e.name.endsWith(ext)||(skip&&skip.test(e.name)))return;
  files[rel(full)]=crypto.createHash("md5").update(fs.readFileSync(full)).digest("hex").slice(0,8)})}
["cours","fiches","annales","exercices","evaluations","programmes"].forEach(d=>walk(path.join(root,d),".html"));
walk(path.join(root,"contenu"),".json",/^(index-versions|_exemple)\.json$/);
/* Fichiers de base : même liste que dlUrls() dans data.js */
["index.html","catalogue.html","favoris.html","cours.html","lecon.html","fiche.html","pdf.html","cycles.html","profil.html","parametres.html","abonnement.html","contact.html","data.js","fiche.js","fiche.css","course.js","course.css","blocs.js","manifest.json"]
 .forEach(f=>{const p=path.join(root,f);if(fs.existsSync(p))files[f]=crypto.createHash("md5").update(fs.readFileSync(p)).digest("hex").slice(0,8)});
const sorted={};Object.keys(files).sort().forEach(k=>sorted[k]=files[k]);
fs.writeFileSync(path.join(root,"contenu","index-versions.json"),JSON.stringify({v:1,f:sorted}));
console.log("contenu/index-versions.json : "+Object.keys(sorted).length+" fichiers");
