#!/usr/bin/env node
/* ===== Valide les fichiers contenu/cours/<cycle>/*.json, contenu/fiches/<cycle>/*.json et contenu/annales/<cycle>/*.json contenu/exercices/<cycle>/*.json et contenu/evaluations/<cycle>/*.json =====
   Usage (depuis le dossier du site) :  node outils/valider-contenu.js
   Signale les erreurs (JSON cassé, bloc inconnu, champ manquant…) et résume les parties encore vides. */
const fs=require("fs"),path=require("path"),vm=require("vm");
const root=path.join(__dirname,"..");
const noop=new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>"":noop,apply:()=>noop,set:()=>true});
const ctx={localStorage:{getItem:k=>k==="user_role"?"enseignant":null,setItem(){},removeItem(){}},location:noop,document:noop,window:noop,navigator:noop,console};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,"data.js"),"utf8")+"\n;this.__o={ALLDOCS:ALLDOCS,docInfo:docInfo,IMG:IMG,contentFile:contentFile,cycleOf:cycleOf}",ctx);
const {ALLDOCS,docInfo,IMG,contentFile,cycleOf}=ctx.__o;
const CAT=require("./catalogue.js");
const base=n=>n.split("/").pop();
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
/* ===== Fiches pédagogiques (contenu/fiches/<cycle>/fiche-<n>.json avec "type":"fiche"), règles : contenu/SPEC-FICHES.md et GUIDE-FICHES.md § 6 ===== */
let fiches=0;
const FORMULES=[/^À la fin de la leçon portant sur /,/^À la fin de la séance portant sur /,/^À l’issue de l’apprentissage portant sur /,/^Au terme de la séance d’apprentissage portant sur /];
const TITRES=["I-Motivation","II-Contrat pédagogique","III-Vérification des prérequis","IV-Acquisitions nouvelles","V-Évaluation"];
const SOUS=["A-Imprégnation","B-Fixation","C-Synthèse"];
const MOT_COUPE=/(\s|^)(de|du|des|d’|le|la|les|l’|un|une|et|ou|à|au|aux|en|dans|sur|pour|par)$/i;
function strings(o,path,out){if(typeof o==="string")out.push([path,o]);else if(Array.isArray(o))o.forEach((x,i)=>strings(x,path+"["+i+"]",out));else if(o&&typeof o==="object")Object.keys(o).forEach(k=>strings(o[k],path+"."+k,out));return out}
function seuilOK(f,w,seuil,n){const m=/^\s*(\d+)\s*sur\s*(\d+)\s*$/.exec(seuil||"");if(!m)return err(f,w+" : seuil au format « 4 sur 5 » attendu");
 if(+m[1]>+m[2])err(f,w+" : le seuil "+seuil+" dépasse son total");
 if(n!==undefined&&+m[2]!==n)err(f,w+" : le seuil "+seuil+" ne correspond pas aux "+n+" items")}
function validerFiche(name,j){
 const d=ALLDOCS.find(x=>x.id===j.id);
 if(!d){err(name,"id "+j.id+" absent du catalogue (lancer node outils/generer-pages.js)");return}
 if("contenu/"+name!==contentFile(d))err(name,"emplacement attendu : "+contentFile(d));
 /* Numérotation propre aux fiches : fn = 1, 2, 3… ; id = 10000 + fn ; fichier contenu/fiche-<fn>.json */
 if(!Number.isInteger(d.fn)||d.fn<1)err(name,"meta.fn (numéro de fiche : 1, 2, 3…) manquant");
 else{
  if(j.id!==10000+d.fn)err(name,"id : 10000 + fn attendu (soit "+(10000+d.fn)+")");
  if(base(name)!=="fiche-"+d.fn+".json")err(name,"le nom du fichier doit être fiche-"+d.fn+".json");
  if(ALLDOCS.filter(x=>x.k==="Fiches"&&x.fn===d.fn).length>1)err(name,"numéro de fiche (fn) en double");
 }
 if(ids.has(j.id))err(name,"id en double");ids.add(j.id);
 if(d.k!=="Fiches")err(name,"type « fiche » mais k:\""+d.k+"\" dans data.js (attendu : Fiches)");
 fiches++;
 /* en-tête */
 const h=j.entete||{};
 ["niveau","discipline","titre","objet"].forEach(k=>{if(!str(h[k]))err(name,"entete."+k+" manquant")});
 if(!(Number.isInteger(h.numero)&&h.numero>0))err(name,"entete.numero : entier positif attendu");
 if(!(Number.isInteger(h.duree)&&h.duree>0))err(name,"entete.duree : nombre de minutes attendu");
 if(str(h.niveau)&&h.niveau!==d.n)err(name,"entete.niveau (« "+h.niveau+" ») différent de meta.n (« "+d.n+" »)");
 /* O.O */
 const oo=j.oo;
 if(!str(oo))err(name,"oo manquant");
 else{
  if(!FORMULES.some(r=>r.test(oo)))err(name,"oo : doit commencer par une des 4 formules obligatoires (À la fin de la leçon/séance portant sur…)");
  if(!/l’(apprenant|élève) doit être capable (d’|de )/.test(oo))err(name,"oo : « l’apprenant » ou « l’élève doit être capable de… » attendu");
 }
 /* étapes */
 const E=Array.isArray(j.etapes)?j.etapes:[];
 const lec=/lecture/i.test(h.sousDiscipline||"");
 const attendu=TITRES.concat(lec?["VI-Discussion socioculturelle"]:[]);
 if(E.length!==attendu.length||attendu.some((t,i)=>!E[i]||E[i].titre!==t))err(name,"étapes : attendu dans l’ordre « "+attendu.join(" », « ")+" » (IV regroupe ses sous-parties dans sousEtapes)");
 let somme=0,Q=[],R=[],evals=[];
 E.forEach((e,i)=>{
  const w=name+" étape "+(e&&e.titre||i+1);
  if(!e)return;
  if(/Acquisitions nouvelles\s*:/.test(e.titre||""))err(w,"titre « Acquisitions nouvelles : … » répété : un seul titre IV-Acquisitions nouvelles, les sous-parties vont dans sousEtapes");
  const parts=e.sousEtapes?e.sousEtapes:[e];
  if(e.sousEtapes){
   if(e.temps!==undefined)err(w,"l’étape IV n’a pas de temps propre (somme de ses sous-parties)");
   const gram=/grammaire|orthographe|conjugaison|vocabulaire/i.test(h.sousDiscipline||"");
   if(gram&&(e.sousEtapes.length!==3||SOUS.some((t,k)=>e.sousEtapes[k].titre!==t)))err(w,"sousEtapes : A-Imprégnation, B-Fixation, C-Synthèse attendues");
  }else if(/^IV-/.test(e.titre||"")&&!/lecture|expression/i.test(h.sousDiscipline||""))err(w,"l’étape IV doit contenir sousEtapes");
  parts.forEach(p=>{
   const x=w+(e.sousEtapes?" / "+p.titre:"");
   ["technique","modalite","consigne"].forEach(k=>{if(!str(p[k]))err(x,k+" manquant")});
   if(!Number.isInteger(p.temps)||p.temps<=0)err(x,"temps : nombre de minutes attendu");else somme+=p.temps;
   if(p.observ&&str(p.observ))err(x,"observ doit rester vide (rempli par l’enseignant après la séance)");
   arr(p.questions).forEach(q=>Q.push([x,q.n,q.q]));arr(p.reponses).forEach(r=>R.push([x,r.n,r.r]));
   if(p.evaluation)evals.push([x,p.evaluation]);
  })});
 if(E.length&&somme!==h.duree)err(name,"total des temps = "+somme+" min, la durée de l’en-tête est "+h.duree+" min");
 /* Q / R */
 Q.forEach((q,i)=>{if(q[1]!==i+1)err(q[0],"questions : numéro "+q[1]+" à la place de "+(i+1)+" (numérotation continue sur toute la fiche)");if(!str(q[2]))err(q[0],"question "+q[1]+" vide")});
 R.forEach(r=>{if(!str(r[2]))err(r[0],"réponse "+r[1]+" vide")});
 const rq=new Set(R.map(r=>r[1]));Q.forEach(q=>{if(!rq.has(q[1]))err(q[0],"la question Q"+q[1]+" n’a pas de réponse R"+q[1]+"")});
 R.forEach(r=>{if(!Q.some(q=>q[1]===r[1]))err(r[0],"la réponse R"+r[1]+" ne répond à aucune question")});
 /* évaluation (étape V) */
 const V=E.find(e=>e&&e.titre==="V-Évaluation");
 if(V){
  const ev=V.evaluation;
  if(!ev||typeof ev!=="object")err(name,"étape V : objet evaluation attendu");
  else{
   if(!["écrit","oral","pratique"].includes(ev.mode))err(name,"evaluation.mode : écrit, oral ou pratique");
   ["contexte","tache","consigne","bareme","seuil"].forEach(k=>{if(!str(ev[k]))err(name,"evaluation."+k+" manquant")});
   if(!arrS(ev.items))err(name,"evaluation.items : liste de textes attendue");
   if(!arrS(ev.cle))err(name,"evaluation.cle : liste de textes attendue");
   if(arrS(ev.items)&&arrS(ev.cle)&&ev.items.length!==ev.cle.length)err(name,"evaluation : "+ev.items.length+" items mais "+ev.cle.length+" réponses dans la clé");
   if(str(ev.seuil)&&arrS(ev.items))seuilOK(name,"evaluation",ev.seuil,ev.items.length);
   /* congruence : le verbe d’action de l’O.O figure dans la tâche ou la consigne */
   const m=str(oo)&&/capable (?:d’|de |d')\s*([A-Za-zÀ-ÿ]+)/.exec(oo);
   if(m&&!((ev.tache||"")+" "+(ev.consigne||"")).toLowerCase().includes(m[1].toLowerCase()))err(name,"congruence : le verbe de l’O.O (« "+m[1]+" ») ne figure ni dans la tâche ni dans la consigne de l’évaluation");
  }
 }
 /* page de l’apprenant */
 const a=j.apprenant;
 if(!a||typeof a!=="object")err(name,"apprenant manquant");
 else{
  if(!arrS(a.corpus))err(name,"apprenant.corpus : liste de phrases attendue");
  if(!str(a.retenir))err(name,"apprenant.retenir manquant");
  else if(a.retenir.split(/\n+/).filter(Boolean).length>5)warn(name,"« Je retiens » : 5 lignes au maximum");
  if(a.tableau){if(!arrS(a.tableau.head)||!Array.isArray(a.tableau.rows)||a.tableau.rows.some(r=>!Array.isArray(r)||r.length!==a.tableau.head.length))err(name,"apprenant.tableau : head et rows de même largeur attendus")}
  if(!Array.isArray(a.exercices)||!a.exercices.length)err(name,"apprenant.exercices : au moins un exercice attendu");
  else a.exercices.forEach((x,i)=>{const w="exercice "+(i+1);
   if(!str(x.enonce))err(name,w+" : enonce manquant");
   if(!arrS(x.items))err(name,w+" : items attendus");
   else{
    x.items.forEach((t,k)=>{if(/^\d+\s*[.)]\s/.test(t))err(name,w+", item "+(k+1)+" : numéro écrit dans le texte (la numérotation est automatique)")});
    if(x.seuil!==undefined)seuilOK(name,w,x.seuil,x.items.length)}
  });
  if(arrS(a.corpus)){
   a.corpus.forEach((t,k)=>{if(/^\d+\s*[.)]\s/.test(t))err(name,"corpus, phrase "+(k+1)+" : numéro écrit dans le texte (la numérotation est automatique)")});
   const IV=E.find(e=>e&&e.sousEtapes),subs=IV?IV.sousEtapes:[];
   subs.filter(p=>/^(A|B)-/.test(p.titre||"")&&str(p.texte)).forEach(p=>{
    const t=p.texte.replace(/\s+/g," ");const manque=a.corpus.findIndex(c=>!t.includes(c.replace(/\s+/g," ")));
    if(manque>=0)err(name,"le corpus de "+p.titre+" diffère de celui de la page de l’apprenant (phrase "+(manque+1)+")")});
  }
 }
 if(!arrS(j.corrige))err(name,"corrige : liste de textes attendue");
 /* typographie */
 strings(j,"",[]).forEach(([w,t])=>{
  if(t.includes('"'))err(name,w+" : guillemet droit interdit (utiliser « » et ’)");
  if(/[a-zà-ÿ]'[a-zà-ÿ]/i.test(t))warn(name,w+" : apostrophe droite (utiliser ’)");
  if(/!’|’!/.test(t))err(name,w+" : symbole parasite");
  if(t.length>25&&!/[.!?;:»)’]$/.test(t.trim())&&MOT_COUPE.test(t.trim())&&!/\.(rappel|consigne|enonce|activite|texte)$/.test(w))warn(name,w+" : phrase peut-être coupée (« …"+t.trim().slice(-20)+" »)");
 });
}

/* ===== Fiches APS (contenu/fiches/<cycle>/fiche-<n>.json avec "type":"fiche" et "approche":"APS"), règles : contenu/SPEC-FICHES.md (§ Fiches APS) et GUIDE-FICHES.md ===== */
const TITRES_APS=["1-Vérification des prérequis","2-Décodage de la situation d’apprentissage","3-Exploitation du tableau de spécification","4-Synthèse","5-Évaluation"];
const BLOCS_APS=["h","p","def","list","ex","nb","texte","tableau","retenir"];
const nrm=t=>String(t||"").replace(/\*+/g,"").replace(/\s+/g," ").trim();
/* Lit la matrice officielle (guide pédagogique APS 6e = programme-2, 5e = programme-4) : compétence, situation, activités du tableau de spécifications */
function matriceAPS(niveau,code){
 const pg={"6e":2,"5e":4}[niveau];if(!pg)return null;
 let g;try{g=JSON.parse(fs.readFileSync(path.join(dir,"programmes","college","programme-"+pg+".json"),"utf8"))}catch(e){return null}
 const M={competence:"",situation:"",activites:[]};let on=false,trouve=false,act=null;
 (g.sections||[]).forEach(sec=>(sec.blocs||[]).forEach(b=>{
  if(b.type==="h"&&/^MF\d/.test(b.text)){on=b.text.indexOf(code+" ")===0||b.text.indexOf(code+":")===0||b.text===code;if(on)trouve=true;return}
  if(!on)return;
  if(b.type==="p"&&/^\*\*Compétence/.test(b.text)&&!M.competence)M.competence=nrm(b.text.replace(/^\*\*Compétence\s*:\*\*/,""));
  if(b.type==="p"&&/^\*\*Situation/.test(b.text)&&!M.situation)M.situation=nrm(b.text.replace(/^\*\*Situation\s*:\*\*/,""));
  if(b.type==="p"&&/^\*Activité/.test(b.text))act=[];
  if(b.type==="list"&&act&&!/^\*\*Évaluation/.test(b.text||"")){M.activites.push(b.items.map(nrm));act=null}}));
 return trouve?M:null}
function validerFicheAPS(name,j){
 const d=ALLDOCS.find(x=>x.id===j.id);
 if(!d){err(name,"id "+j.id+" absent du catalogue (lancer node outils/generer-pages.js)");return}
 if("contenu/"+name!==contentFile(d))err(name,"emplacement attendu : "+contentFile(d));
 if(!Number.isInteger(d.fn)||d.fn<1)err(name,"meta.fn (numéro de fiche : 1, 2, 3…) manquant");
 else{
  if(j.id!==10000+d.fn)err(name,"id : 10000 + fn attendu (soit "+(10000+d.fn)+")");
  if(base(name)!=="fiche-"+d.fn+".json")err(name,"le nom du fichier doit être fiche-"+d.fn+".json");
  if(ALLDOCS.filter(x=>x.k==="Fiches"&&x.fn===d.fn).length>1)err(name,"numéro de fiche (fn) en double");
 }
 if(d.ap!=="APS")err(name,"meta.ap : « APS » attendu dans la clé meta (fiche APS)");
 if(ids.has(j.id))err(name,"id en double");ids.add(j.id);
 if(d.k!=="Fiches")err(name,"type « fiche » mais k:\""+d.k+"\" dans data.js (attendu : Fiches)");
 fiches++;
 if(j.oo!==undefined)err(name,"« oo » n’existe pas dans une fiche APS (pas d’objectif opérationnel : la fiche suit la situation et le tableau de spécification)");
 /* en-tête */
 const h=j.entete||{};
 ["niveau","discipline","sousDiscipline","titre","categorie","savoirEssentiel","competence","situation","support"].forEach(k=>{if(!str(h[k]))err(name,"entete."+k+" manquant")});
 if(!(Number.isInteger(h.numero)&&h.numero>0))err(name,"entete.numero : entier positif attendu");
 if(!(str(h.duree)||(Number.isInteger(h.duree)&&h.duree>0)))err(name,"entete.duree manquante (ex. « 2 h » ou « 55 min », telle que la répartition annuelle la donne)");
 if(str(h.niveau)&&h.niveau!==d.n)err(name,"entete.niveau (« "+h.niveau+" ») différent de meta.n (« "+d.n+" »)");
 if(h.niveau!=="6e"&&h.niveau!=="5e")warn(name,"fiche APS hors 6e et 5e : le programme APS ne couvre que la 6e et la 5e");
 /* la compétence et le tableau de spécification doivent venir de la matrice officielle */
 let M=null;
 if(!str(h.codeMatrice)||!/^MF[56]\.\d+\.\d+$/.test(h.codeMatrice))err(name,"entete.codeMatrice : code de la matrice attendu (ex. MF5.1.1)");
 else{
  if(str(h.niveau)&&h.codeMatrice.charAt(2)!==h.niveau.charAt(0))err(name,"entete.codeMatrice « "+h.codeMatrice+" » ne correspond pas au niveau « "+h.niveau+" »");
  M=matriceAPS(h.niveau,h.codeMatrice);
  if(!M)err(name,"matrice "+h.codeMatrice+" introuvable dans le guide pédagogique APS (node outils/matrice-aps.js "+h.niveau+" --liste)");
  else{
   if(M.competence&&nrm(h.competence)!==M.competence)err(name,"entete.competence : doit reprendre mot pour mot la compétence de la matrice "+h.codeMatrice+" (ne jamais la fabriquer)");
   if(M.situation&&nrm(h.situation)!==M.situation)warn(name,"entete.situation différente de la situation de la matrice "+h.codeMatrice+" : à garder seulement si c’est voulu");
  }
 }
 /* étapes */
 const E=Array.isArray(j.etapes)?j.etapes:[];
 if(E.length!==5||TITRES_APS.some((t,i)=>!E[i]||E[i].titre!==t))err(name,"étapes : attendu dans l’ordre « "+TITRES_APS.join(" », « ")+" »");
 const nbQ=(t)=>{const m=[];String(t||"").replace(/(?:^|[\s(])Q(\d+)\s*[:.\-–]/g,(x,n)=>{m.push(+n);return x});return m};
 const nbR=(t)=>{const m=[];String(t||"").replace(/(?:^|[\s(])R(\d+)\s*[:.\-–]/g,(x,n)=>{m.push(+n);return x});return m};
 E.forEach((e,i)=>{
  if(!e)return;
  const w=name+" étape "+(e.titre||i+1);
  if(!Array.isArray(e.lignes)||!e.lignes.length){err(w,"lignes : au moins une ligne (ens / app) attendue");return}
  let Q=[],R=[];
  e.lignes.forEach((l,k)=>{
   const x=w+", ligne "+(k+1);
   if(!str(l.ens))err(x,"ens (action de l’enseignant) manquant");
   if(!str(l.app))err(x,"app (activité des apprenants) manquante : chaque action de l’enseignant appelle une activité ou une réponse");
   Q=Q.concat(nbQ(l.ens));R=R.concat(nbR(l.app));
   if(l.a!==undefined&&!(Number.isInteger(l.a)&&l.a>=1))err(x,"a : numéro d’action de la table de spécification (1, 2, 3…) attendu");
   if(l.texte!==undefined&&!str(l.texte))err(x,"texte vide");
  });
  Q.forEach((n,k)=>{if(n!==k+1)err(w,"questions : Q"+n+" à la place de Q"+(k+1)+" (la numérotation recommence à Q1 à chaque étape)")});
  const rq=new Set(R),qq=new Set(Q);
  Q.forEach(n=>{if(!rq.has(n))err(w,"la question Q"+n+" n’a pas de réponse attendue R"+n)});
  R.forEach(n=>{if(!qq.has(n))err(w,"la réponse R"+n+" ne répond à aucune question")});
  if(i===1&&Q.length<3)err(w,"le décodage comporte au minimum 3 questions (thème, difficulté, démarche) : "+Q.length+" trouvée(s)");
  if(i===3&&Q.length<1)warn(w,"la synthèse : prévoir des questions Q1, Q2… avec les réponses attendues");
 });
 /* étape 3 : actions de la table de spécification, dans l’ordre */
 const T=E[2]||{},S=T.specification;
 if(!arrS(S))err(name,"étape 3 : « specification » (liste des actions du tableau de spécification, dans l’ordre officiel) manquante");
 else{
  if(M&&M.activites.length&&!M.activites.some(A=>A.length===S.length&&A.every((x,k)=>x===nrm(S[k]))))err(name,"étape 3 : « specification » doit reprendre mot pour mot les actions d’une activité du tableau de spécification de la matrice "+h.codeMatrice+" (node outils/matrice-aps.js "+h.niveau+" "+h.codeMatrice+")");
  const ev=(E[4]||{}).evaluation,reserve=ev&&ev.action!==undefined?ev.action:null;
  if(reserve!==null&&reserve!==S.length)err(name,"evaluation.action : seule la dernière action ("+S.length+") peut être réservée à l’évaluation");
  let prec=0;const vues=new Set();
  arr(T.lignes).forEach((l,k)=>{
   if(l.a===undefined)return;
   if(l.a>S.length)err(name,"étape 3, ligne "+(k+1)+" : action "+l.a+" inexistante (la table en compte "+S.length+")");
   if(l.a<prec)err(name,"étape 3, ligne "+(k+1)+" : l’ordre des actions n’est pas respecté (action "+l.a+" après l’action "+prec+")");
   prec=Math.max(prec,l.a);vues.add(l.a)});
  for(let n=1;n<=S.length;n++){
   if(n===reserve){if(vues.has(n))err(name,"action "+n+" : réservée à l’évaluation, elle ne doit pas figurer à l’étape 3");continue}
   if(!vues.has(n))err(name,"étape 3 : aucune ligne pour l’action "+n+" de la table de spécification (« "+S[n-1].slice(0,60)+"… ») : aucune action ne doit être supprimée")}
 }
 /* étape 5 : évaluation */
 const V=E[4];
 if(V){
  const ev=V.evaluation;
  if(!ev||typeof ev!=="object")err(name,"étape 5 : objet evaluation attendu (mode, item, criteres)");
  else{
   if(!["écrit","oral","pratique"].includes(ev.mode))err(name,"evaluation.mode : écrit, oral ou pratique");
   if(!str(ev.item))err(name,"evaluation.item manquant");
   if(!arrS(ev.criteres))err(name,"evaluation.criteres : liste de ce que l’enseignant observe (corrigé) attendue");
  }
 }
 /* page de l’apprenant */
 const a=j.apprenant;
 if(!a||typeof a!=="object")err(name,"apprenant manquant");
 else{
  if(!str(a.titre))err(name,"apprenant.titre manquant");
  if(!Array.isArray(a.blocs)||!a.blocs.length)err(name,"apprenant.blocs : la trace écrite (définition, règles, exemples, à retenir) est attendue");
  else{
   a.blocs.forEach((b,k)=>{const w="apprenant.blocs["+k+"]";
    if(!b||!BLOCS_APS.includes(b.type)){err(name,w+" : type inconnu (« "+(b&&b.type)+" » ; permis : "+BLOCS_APS.join(", ")+")");return}
    if(["list","retenir"].includes(b.type)){if(!arrS(b.items))err(name,w+" : items attendus")}
    else if(b.type==="tableau"){if(!arrS(b.head)||!Array.isArray(b.rows)||b.rows.some(r=>!Array.isArray(r)||r.length!==b.head.length))err(name,w+" : head et rows de même largeur attendus")}
    else if(!str(b.text))err(name,w+" : text manquant")});
   if(!a.blocs.some(b=>b&&b.type==="retenir"))err(name,"apprenant.blocs : un bloc « retenir » (éléments essentiels à retenir) est attendu");
   if(!a.blocs.some(b=>b&&b.type==="ex"))warn(name,"apprenant.blocs : aucun exemple (bloc « ex »)");
   if(!a.blocs.some(b=>b&&b.type==="def"))warn(name,"apprenant.blocs : aucune définition (bloc « def »), à garder seulement si la leçon n’en demande pas");
  }
  if(!Array.isArray(a.exercices)||!a.exercices.length)err(name,"apprenant.exercices : au moins 2 exercices attendus (reconnaissance, application, manipulation)");
  else{
   if(a.exercices.length<3)warn(name,"apprenant.exercices : le guide APS propose 3 exercices progressifs (reconnaissance, application, manipulation)");
   a.exercices.forEach((x,i)=>{const w="exercice "+(i+1);
    if(!str(x.enonce))err(name,w+" : enonce manquant");
    if(x.items!==undefined){
     if(!arrS(x.items))err(name,w+" : items attendus (liste de textes)");
     else x.items.forEach((t,k)=>{if(/^\d+\s*[.)]\s/.test(t))err(name,w+", item "+(k+1)+" : numéro écrit dans le texte (la numérotation est automatique)")})}
    else if(!str(x.texte))err(name,w+" : items ou texte attendus")})}
 }
 if(!arrS(j.corrige))err(name,"corrige : liste de textes attendue (réponses des exercices de la page de l’apprenant)");
 /* typographie */
 strings(j,"",[]).forEach(([w,t])=>{
  if(t.includes('"'))err(name,w+" : guillemet droit interdit (utiliser « » et ’)");
  if(/[a-zà-ÿ]'[a-zà-ÿ]/i.test(t))warn(name,w+" : apostrophe droite (utiliser ’)");
  if(/!’|’!/.test(t))err(name,w+" : symbole parasite");
  if(t.length>25&&!/[.!?;:»)’…]$/.test(t.trim())&&MOT_COUPE.test(t.trim())&&!/\.(rappel|consigne|enonce|ens|app|texte|text)$/.test(w))warn(name,w+" : phrase peut-être coupée (« …"+t.trim().slice(-20)+" »)")});
}
const arr=v=>Array.isArray(v)?v:[];

/* Catalogue de data.js à jour ? (il est construit automatiquement à partir de la clé "meta" des fichiers) */
const lu=CAT.lireCatalogue(root);
lu.errs.forEach(e=>err(e[0],e[1]));
if(!lu.errs.length&&CAT.blocActuel(root)!==CAT.blocCatalogue(lu.docs))err("data.js","catalogue pas à jour : lancer  node outils/generer-pages.js");
lu.docs.forEach(d=>{if(!(d.img in IMG))err("id "+d.id,"meta.img : image « "+d.img+" » inconnue (images de data.js : "+Object.keys(IMG).join(", ")+")");
 if(d.r<0||d.r>5)err("id "+d.id,"meta.r : note entre 0 et 5 attendue");
 let c;try{c=cycleOf(d.n)}catch(e){}
 if(!c)err("id "+d.id,"meta.n : niveau « "+d.n+" » inconnu")});
function listeJson(d,out){fs.readdirSync(d,{withFileTypes:true}).forEach(e=>{const f=path.join(d,e.name);
 if(e.isDirectory())listeJson(f,out);else if(e.name.endsWith(".json"))out.push(path.relative(dir,f).split(path.sep).join("/"))});return out}
for(const name of listeJson(dir,[]).sort((a,b)=>(parseInt(base(a))||0)-(parseInt(base(b))||0)||a.localeCompare(b))){
 let j;try{j=JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"))}catch(e){if(!lu.errs.some(x=>x[0]===name))err(name,"JSON invalide ("+e.message+")");continue}
 if(j&&j.type==="fiche"){if(j.approche==="APS")validerFicheAPS(name,j);else validerFiche(name,j);continue}
 if(j&&j.meta&&j.meta.mf!==undefined){/* code(s) du programme APS (MF6.x.y en 6e, MF5.x.y en 5e), facultatif */
  const L=Array.isArray(j.meta.mf)?j.meta.mf:[j.meta.mf],NV={"6e":"6","5e":"5"};
  if(!L.length||L.some(c=>typeof c!=="string"||!/^MF\d\.\d+\.\d+$/.test(c)))err(name,"meta.mf : code ou liste de codes de la forme MF6.2.1 attendu");
  else if(NV[j.meta.n]&&L.some(c=>c.charAt(2)!==NV[j.meta.n]))err(name,"meta.mf : le code doit commencer par MF"+NV[j.meta.n]+". en "+j.meta.n)}
 const demo=base(name).startsWith("_");
 if(!Array.isArray(j.sections)||!j.sections.length){err(name,"sections manquantes");continue}
 if(!demo){
  const d=ALLDOCS.find(x=>x.id===j.id);
  if(!d){err(name,"id "+j.id+" absent du catalogue (lancer node outils/generer-pages.js)");continue}
  const attendu=d.k==="Annales"?"annale-"+d.an+".json":d.k==="Exercices"?"exercice-"+d.ex+".json":d.k==="Évaluations"?"evaluation-"+d.ev+".json":d.k==="Programmes"?"programme-"+d.pg+".json":j.id+".json";
  if(base(name)!==attendu)err(name,"le nom du fichier doit être "+attendu);
  if(d.k==="Annales"&&j.sections.length<2)warn(name,"une annale a normalement au moins 2 parties (énoncé, corrigé)");
  if(d.k==="Exercices"&&j.sections.length<2)warn(name,"une série d’exercices a normalement au moins 2 parties (exercices, corrigés)");
  if(d.k==="Évaluations"&&j.sections.length<3)warn(name,"une évaluation a normalement 3 parties (énoncé, corrigé, barème)");
  if("contenu/"+name!==contentFile(d))err(name,"emplacement attendu : "+contentFile(d));
  if(ids.has(j.id))err(name,"id en double");ids.add(j.id);
  const n=docInfo(d).sections.length;
  if(n!==j.sections.length)warn(name,j.sections.length+" parties ici, "+n+" annoncées dans le catalogue");
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
ALLDOCS.forEach(d=>{if(!ids.has(d.id))warn(contentFile(d),"fichier absent pour « "+d.t+" »")});
console.log("\n"+(fiches?fiches+" fiche(s) pédagogique(s) contrôlée(s), ":"")+filled+" partie(s) rédigée(s), "+empty+" partie(s) encore vide(s), "+warns+" avertissement(s), "+errors+" erreur(s).");
process.exit(errors?1:0);
