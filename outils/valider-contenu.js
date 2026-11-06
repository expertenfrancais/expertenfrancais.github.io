#!/usr/bin/env node
/* ===== Valide les fichiers contenu/*.json =====
   Usage (depuis le dossier du site) :  node outils/valider-contenu.js
   Signale les erreurs (JSON cassé, bloc inconnu, champ manquant…) et résume les parties encore vides. */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const noop=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>"":noop,apply:()=>noop,set:()=>true});
const ctx={localStorage:{getItem:k=>k==="user_role"?"enseignant":null,setItem(){},removeItem(){}},location:noop,document:noop,window:noop,navigator:noop,console};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"data.js"),"utf8")+"\n;this.__o={ALLDOCS:ALLDOCS,docInfo:docInfo}",ctx);
const {ALLDOCS,docInfo}=ctx.__o;
const str=v=>typeof v==="string"&&v.trim()!=="";
const arrS=v=>Array.isArray(v)&&v.length>0&&v.every(str);
/* champs obligatoires par type de bloc */
const RULES={
 p:b=>str(b.text)||"text manquant",
 h:b=>str(b.text)||"text manquant",
 list:b=>arrS(b.items)||"items : liste de textes attendue",
 ex:b=>str(b.text)||"text manquant",
 def:b=>str(b.text)||"text manquant",
 tip:b=>str(b.text)||"text manquant",
 warn:b=>str(b.text)||"text manquant",
 retenir:b=>arrS(b.items)||"items : liste de textes attendue",
 schema:b=>(Array.isArray(b.cells)&&b.cells.length>0&&b.cells.every(c=>str(c.mot)&&str(c.role)))||"cells : liste de {mot, role} attendue",
 test:b=>arrS(b.lines)||"lines : liste de textes attendue",
 table:b=>{if(!arrS(b.head))return"head : liste de titres attendue";
  if(!Array.isArray(b.rows)||!b.rows.length)return"rows manquant";
  const bad=b.rows.findIndex(r=>!Array.isArray(r)||r.length!==b.head.length||!r.every(x=>typeof x==="string"));
  return bad<0||"ligne "+(bad+1)+" du tableau : "+b.head.length+" cellules (texte) attendues"},
 quiz:b=>{if(!str(b.question))return"question manquante";
  if(!arrS(b.options)||b.options.length<2||b.options.length>8)return"options : 2 à 8 textes";
  return(Number.isInteger(b.answer)&&b.answer>=0&&b.answer<b.options.length)||"answer : numéro (à partir de 0) d’une option"},
 exercise:b=>str(b.enonce)?(b.items===undefined||arrS(b.items)||"items : liste de textes")&&(b.corrige===undefined||str(b.corrige)||arrS(b.corrige)||"corrige : texte ou liste de textes"):"enonce manquant"
};
let errors=0,warns=0,empty=0,filled=0;
const err=(f,m)=>{errors++;console.log("ERREUR  "+f+" : "+m)};
const warn=(f,m)=>{warns++;console.log("avert.  "+f+" : "+m)};
const dir=path.join(root,"contenu");
const ids=new Set();
for(const name of fs.readdirSync(dir).filter(n=>n.endsWith(".json")).sort((a,b)=>parseInt(a)-parseInt(b)||a.localeCompare(b))){
 let j;try{j=JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"))}catch(e){err(name,"JSON invalide ("+e.message+")");continue}
 const demo=name.startsWith("_");
 if(!Array.isArray(j.sections)||!j.sections.length){err(name,"sections manquantes");continue}
 if(!demo){
  const d=ALLDOCS.find(x=>x.id===j.id);
  if(!d){err(name,"id "+j.id+" absent de data.js");continue}
  if(name!==j.id+".json")err(name,"le nom du fichier doit être "+j.id+".json");
  if(ids.has(j.id))err(name,"id en double");ids.add(j.id);
  const n=docInfo(d).sections.length;
  if(n!==j.sections.length)warn(name,j.sections.length+" parties ici, "+n+" annoncées sur la fiche du cours (data.js)");
 }
 j.sections.forEach((s,i)=>{
  const where=name+" partie "+(i+1);
  if(!str(s.t))err(where,"titre (t) manquant");
  const bl=s.blocs;
  if(bl===undefined){if(str(s.c)){filled++;return}empty++;return}
  if(!Array.isArray(bl)){err(where,"blocs doit être une liste");return}
  if(!bl.length){empty++;return}
  filled++;
  bl.forEach((b,k)=>{
   const w=where+", bloc "+(k+1);
   if(!b||typeof b.type!=="string"){err(w,"type manquant");return}
   if(!RULES[b.type]){err(w,"type inconnu « "+b.type+" » (types : "+Object.keys(RULES).join(", ")+")");return}
   const r=RULES[b.type](b);if(r!==true)err(w,"["+b.type+"] "+r);
  });
 });
}
ALLDOCS.forEach(d=>{if(!ids.has(d.id))warn("contenu/"+d.id+".json","fichier absent pour « "+d.t+" »")});
console.log("\n"+filled+" partie(s) rédigée(s), "+empty+" partie(s) encore vide(s), "+warns+" avertissement(s), "+errors+" erreur(s).");
process.exit(errors?1:0);
