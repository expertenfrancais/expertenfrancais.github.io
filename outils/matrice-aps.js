/* ===== Outil de lecture des matrices du programme APS (6e et 5e) =====
   Affiche, pour un code de catégorie (MF5.1.1, MF6.2.1…), tout ce dont une fiche APS a besoin : catégorie des savoirs essentiels,
   savoirs essentiels, compétence, situation, tableau de spécifications (actions de l’élève), évaluation, prérequis et suggestions.
   Évite de lire les gros fichiers du guide pédagogique (contenu/programmes/college/programme-2.json pour la 6e, programme-4.json pour la 5e).
   Utilisation :  node outils/matrice-aps.js 5e MF5.1.1      (une matrice)
                  node outils/matrice-aps.js 5e --liste      (liste des codes)
                  node outils/matrice-aps.js 5e --repartition MF5.1.1   (lignes de la répartition annuelle : semaine, savoir essentiel, durée)
   Lecture seule : ne modifie aucun fichier. */
const fs=require("fs"),path=require("path");
const root=path.join(__dirname,"..");
const FICH={"6e":{guide:2,repart:1},"5e":{guide:4,repart:3}};
const niv=process.argv[2],arg=process.argv[3],arg2=process.argv[4];
if(!FICH[niv]||!arg){console.log("Utilisation : node outils/matrice-aps.js <6e|5e> <MF5.1.1 | --liste | --repartition MF5.1.1>");process.exit(1)}
const lire=n=>JSON.parse(fs.readFileSync(path.join(root,"contenu","programmes","college","programme-"+n+".json"),"utf8"));
const txt=b=>b.type==="list"?b.items.map(x=>"  - "+x).join("\n"):b.type==="h"?"\n## "+b.text:b.type==="table"?(b.head||[]).join(" | ")+"\n"+(b.rows||[]).map(r=>r.join(" | ")).join("\n"):(b.text||"");
if(arg==="--repartition"){
 const code=arg2||"";const j=lire(FICH[niv].repart);
 j.sections.forEach(s=>(s.blocs||[]).forEach(b=>{if(b.type==="table")b.rows.forEach(r=>{if(r[1]&&r[1].indexOf(code)===0)console.log(s.t+" · sem. "+r[0]+" · "+r[2]+" · "+r[3])})}));
 process.exit(0)}
const j=lire(FICH[niv].guide);let trouve=false;
j.sections.forEach(s=>{
 const B=s.blocs||[];
 if(arg==="--liste"){B.forEach(b=>{if(b.type==="h"&&/^MF\d/.test(b.text))console.log(b.text)});return}
 let on=false;
 B.forEach(b=>{
  if(b.type==="h"&&/^MF\d/.test(b.text)){on=b.text.indexOf(arg+" ")===0||b.text.indexOf(arg+":")===0||b.text===arg;if(on)trouve=true}
  if(on)console.log(txt(b))})});
if(arg!=="--liste"&&!trouve)console.log("Code introuvable : "+arg+" (voir --liste)");
