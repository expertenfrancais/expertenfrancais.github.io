
/* ===== data.js : données et fonctions partagées par toutes les pages =====
   À remplacer plus tard par les données de votre serveur (API). */
var DEVISE="FCFA";
/* Fondu d'arrivée : la classe « fresh » n'existe que les premières 700 ms, pour ne pas rejouer l'animation à chaque filtre ou recherche */
try{document.documentElement.classList.add("fresh");setTimeout(function(){document.documentElement.classList.remove("fresh")},700)}catch(e){}
/* BASE : préfixe des liens. Vide pour les pages à la racine, "../" pour les pages du dossier cours/ (défini par PAGE_BASE dans chaque page). */
var BASE=(typeof PAGE_BASE!=="undefined")?PAGE_BASE:"";

/* ===== Type de profil : enseignant, élève / étudiant ou particulier =====
   Enseignant : toutes les ressources. Élève / étudiant et particulier : cours uniquement.
   ATTENTION : ce filtrage se fait sur l’appareil. Avec un serveur, le rôle doit venir du compte
   et l’accès aux documents doit être contrôlé côté serveur. */
var GRATUIT=true; /* true = tout est gratuit pour tout le monde, paiements et abonnements « bientôt disponibles ». Mettre false pour réactiver achats et abonnements. */
var DEMO=true; /* mettre false avec un vrai serveur : les achats restent « en attente » jusqu’à confirmation du paiement */
/* ===== Abonnement =====
   Formules prépayées (pas de renouvellement automatique). À brancher sur le serveur : l’état « sub » doit venir du compte. */
/* Prix selon le profil de l’appareil (élève et étudiant = même profil « eleve »).
   Élève / étudiant : mensuel 1000, trimestriel 2500, annuel 5000. Enseignant : mensuel 2500, trimestriel 5000, annuel 10000. */
var EST_ELEVE=userRole()!=="enseignant"; /* élève, étudiant et particulier : mêmes tarifs */
var PLANS=[{id:"mois",n:"Mensuel",d:30,pr:EST_ELEVE?1000:2500},{id:"trim",n:"Trimestriel",d:90,pr:EST_ELEVE?2500:5000},{id:"an",n:"Annuel",d:365,pr:EST_ELEVE?5000:10000}];
function isSubscribed(){var s=ls("sub",{});return !!s.end&&Date.parse(s.end)>Date.now()}
function canAccess(id){return GRATUIT||isSubscribed()||ls("bought",[]).indexOf(id)>-1}
function fmtDate(iso){return new Date(iso).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}
function activateSub(id){var p=PLANS.filter(function(x){return x.id===id})[0],s=ls("sub",{}),b=Math.max(Date.now(),s.end?Date.parse(s.end):0);
 sv("sub",{plan:id,end:new Date(b+p.d*864e5).toISOString()});cart=[];sv("cart",cart)}
/* Chaque cours a sa propre page dans le dossier cours/ (générée par outils/generer-pages.js). Le nom du fichier = numéro + titre. */
function slug(t){return String(t).toLowerCase().replace(/œ/g,"oe").replace(/æ/g,"ae").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60).replace(/-+$/,"")}
/* Les pages sont classées par cycle : cours/primaire/, cours/college/, cours/lycee/, cours/universite/ ; les fiches pédagogiques (type Fiches) ont leur propre dossier : fiches/<cycle>/ */
/* Les fiches ont leur propre numérotation : fn = numéro de fiche (1, 2, 3…) ; leur id interne = 10000 + fn (aucun conflit avec les cours).
   Les annales aussi : an = numéro d’annale (1, 2, 3…) ; id = 20000 + an ; pages dans annales/<cycle>/annale-<an>-<titre>.html.
   Les exercices : ex = numéro de série (1, 2, 3…) ; id = 30000 + ex ; pages dans exercices/<cycle>/exercice-<ex>-<titre>.html.
   Les évaluations : ev = numéro (1, 2, 3…) ; id = 40000 + ev ; pages dans evaluations/<cycle>/evaluation-<ev>-<titre>.html. */
function docFile(d){var c=CYCLE_INFO[cycleOf(d.n)].dir;return d.k==="Fiches"?"fiches/"+c+"/fiche-"+d.fn+"-"+slug(d.t)+".html":d.k==="Annales"?"annales/"+c+"/annale-"+d.an+"-"+slug(d.t)+".html":d.k==="Exercices"?"exercices/"+c+"/exercice-"+d.ex+"-"+slug(d.t)+".html":d.k==="Évaluations"?"evaluations/"+c+"/evaluation-"+d.ev+"-"+slug(d.t)+".html":"cours/"+c+"/"+d.id+"-"+slug(d.t)+".html"}
/* Fichier de contenu (texte) d'un document : contenu/cours/<cycle>/<id>.json ou contenu/fiches/<cycle>/fiche-<n>.json ou contenu/annales/<cycle>/annale-<an>.json (le dossier <cycle> vient du niveau n) */
function contentFile(d){var c=CYCLE_INFO[cycleOf(d.n)].dir;return "contenu/"+(d.k==="Fiches"?"fiches/"+c+"/fiche-"+d.fn:d.k==="Annales"?"annales/"+c+"/annale-"+d.an:d.k==="Exercices"?"exercices/"+c+"/exercice-"+d.ex:d.k==="Évaluations"?"evaluations/"+c+"/evaluation-"+d.ev:"cours/"+c+"/"+d.id)+".json"}
function docUrl(d){return BASE+docFile(d)}
/* Parties (sections) d’un cours : chacune a sa page de lecture lecon.html?id=…&s=… (rendue par JavaScript).
   La première partie est gratuite ; les autres demandent l’accès au cours (achat ou abonnement). */
function partUrl(d,i){return BASE+"lecon.html?id="+d.id+"&s="+(i+1)}
function partFree(i){return i===0}
function partsDone(id){return (ls("parts",{})[id])||[]}
function markPart(id,i){var o=ls("parts",{}),a=o[id]||[];if(a.indexOf(i)<0){a.push(i);o[id]=a;sv("parts",o)}}
/* Scores des quiz et exercices : scores[cours][partie] = {nq,ne,q:{n° du bloc:0|1},e:{n° du bloc:0|1}}.
   q = quiz réussi du premier coup ; e = exercice jugé réussi par l’élève. Si le contenu change (nq ou ne), la partie repart à zéro. */
function scoreGet(id,i){var c=ls("scores",{})[id];return(c&&c[i])||null}
function scoreMeta(id,i,nq,ne){var o=ls("scores",{}),c=o[id]||(o[id]={}),s=c[i]||(c[i]={q:{},e:{}});
 if(s.nq!==nq||s.ne!==ne){s.nq=nq;s.ne=ne;s.q={};s.e={};sv("scores",o)}}
function scoreSet(id,i,kind,k,ok){var o=ls("scores",{}),c=o[id]||(o[id]={}),s=c[i]||(c[i]={q:{},e:{}});(s[kind]||(s[kind]={}))[k]=ok?1:0;sv("scores",o)}
function scoreSum(s){var r={nq:0,qa:0,qo:0,ne:0,ea:0,eo:0},k;if(!s)return r;r.nq=s.nq||0;r.ne=s.ne||0;
 for(k in s.q){r.qa++;r.qo+=s.q[k]}for(k in s.e){r.ea++;r.eo+=s.e[k]}return r}
function openDoc(id){var d=ALLDOCS.filter(function(x){return x.id===id})[0];location.href=d?docUrl(d):BASE+"catalogue.html"}
/* Annulation d’abonnement (avec un serveur : l’annulation doit aussi être enregistrée côté serveur) */
function cancelSub(){try{localStorage.removeItem("sub");localStorage.removeItem("subpending")}catch(e){}}
function subBanner(id){if(GRATUIT||isSubscribed())return;var r=$(id);if(!r)return;
 r.insertAdjacentHTML("beforebegin",'<a href="abonnement.html" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px;padding:14px 16px;border-radius:20px;background:linear-gradient(135deg,#b29af4,#8c6fe0);color:#fff;text-decoration:none;font-weight:600;font-size:14px"><span>Abonnez-vous : tout le contenu, sans achat à l’unité</span><b style="white-space:nowrap">Voir ›</b></a>')}
/* ===== Fiche détail d’un document : descriptions génériques par type (une description propre au document, d.d / d.obj / d.s, les remplace) ===== */
var INFO={
 "Cours":{desc:"Cours de français ({m}) pour le niveau {n} : notions essentielles, méthodes et exemples commentés.",obj:["Comprendre les notions essentielles du chapitre","Appliquer les méthodes sur des exemples guidés","Se préparer aux évaluations"],plan:["Objectifs et prérequis","Notions clés","Méthodes et exemples commentés","Exercices d’application","À retenir"]},
 "Programmes":{desc:"Programme et progression de français pour le niveau {n}, à utiliser pour préparer l’année.",obj:["Planifier l’année","Répartir les séquences"],plan:["Objectifs de l’année","Progression par période"]},
 "Évaluations":{desc:"Évaluation de français ({m}), niveau {n}, prête à l’emploi, avec barème.",obj:["Évaluer les acquis","Disposer d’un barème"],plan:["Sujet","Barème et corrigé"]},
 "Fiches":{desc:"Fiche pédagogique de français ({m}), niveau {n} : une séance prête à enseigner, avec la fiche du professeur, la page de l’apprenant et le corrigé.",obj:["Préparer la séance avec ses objectifs, ses étapes et son temps","Disposer de la page de l’apprenant à distribuer","Évaluer avec un corrigé et un barème"],plan:[]},
 "Exercices":{desc:"Exercices de français ({m}), niveau {n} : séries progressives avec corrigés, pour s’entraîner en classe ou à la maison.",obj:["S’entraîner de façon progressive","Consolider le cours par la pratique","Vérifier ses réponses grâce aux corrigés"],plan:["Rappels de cours","Exercices d’échauffement","Exercices d’approfondissement","Exercices de synthèse","Corrigés"]},
 "Annales":{desc:"Annales de français ({m}), niveau {n} : sujets d’examen des années précédentes ou sujets entièrement traités, avec corrigés détaillés et méthode.",obj:["Découvrir le format de l’examen","S’entraîner dans les conditions de l’épreuve","Apprendre la méthode grâce aux corrigés détaillés"],plan:["Énoncés des sujets","Corrigés détaillés","Barème et conseils de méthode"]}
};
function docInfo(x){var t=INFO[x.k]||INFO.Cours;function f(s){return s.replace("{m}",x.m).replace("{n}",x.n)}
 return {desc:x.d||f(t.desc),obj:x.obj||t.obj,sections:x.s||t.plan.map(function(p){return{t:p}})}}
/* Niveau de l’élève (profil) : filtre par défaut, seulement s’il appartient au cycle affiché */
function myNiv(){var p=userProfile();return ROLE!=="enseignant"&&p.grade&&cycleOf(p.grade)===activeCycle()?p.grade:"Tous"}
function myCyc(){return activeCycle()}
var ROLES={enseignant:"Enseignant",eleve:"Élève / Étudiant",particulier:"Particulier"}
/* Cycles et niveaux : seul endroit à modifier pour en ajouter */
var CYCLES={"Primaire":["CP1","CP2","CE1","CE2","CM1","CM2"],"Collège":["6e","5e","4e","3e"],"Lycée":["Seconde","Première","Terminale"],"Université":["L1","L2","L3","M1","M2","Doctorat"]};
function cycleOf(n){for(var c in CYCLES)if(CYCLES[c].indexOf(n)>-1)return c;return""}
/* Dossier de pages et description de chaque cycle */
var CYCLE_INFO={
 "Primaire":{dir:"primaire",sub:"CP1 à CM2"},
 "Collège":{dir:"college",sub:"Secondaire · 1er cycle · 6e à 3e"},
 "Lycée":{dir:"lycee",sub:"Secondaire · 2e cycle · Seconde à Terminale"},
 "Université":{dir:"universite",sub:"L1 à Doctorat"}};

/* ===== Cycle de la personne =====
   user_cycle = cycle choisi à l’inscription (élève/étudiant : son cycle d’études ; enseignant : le cycle où il enseigne).
   view_cycle = cycle actuellement consulté. Sans abonnement, seul user_cycle est accessible.
   Avec un abonnement actif, on peut passer d’un cycle à l’autre (page cycles.html).
   ATTENTION : comme le reste, ce contrôle se fait sur l’appareil. Avec un serveur, le cycle et l’abonnement doivent
   venir du compte, et les documents d’un autre cycle doivent être refusés côté serveur. */
function homeCycle(){var c="";try{c=localStorage.getItem("user_cycle")||""}catch(e){}return CYCLES[c]?c:""}
function canSwitchCycle(){return GRATUIT||isSubscribed()}
function accessibleCycles(){return canSwitchCycle()?Object.keys(CYCLES):(homeCycle()?[homeCycle()]:[])}
function activeCycle(){var h=homeCycle();if(!h)return"Tous";if(!canSwitchCycle())return h;
 var v="";try{v=localStorage.getItem("view_cycle")||""}catch(e){}return CYCLES[v]?v:h}
function setHomeCycle(c){if(!CYCLES[c])return;try{localStorage.setItem("user_cycle",c);localStorage.setItem("view_cycle",c)}catch(e){}}
function setViewCycle(c){if(!CYCLES[c]||accessibleCycles().indexOf(c)<0)return false;try{localStorage.setItem("view_cycle",c)}catch(e){}return true}
/* Un document est visible si son cycle est accessible, ou s’il a déjà été acheté. Les visiteurs non connectés ne sont pas filtrés (aperçu public). */
function cycleOK(d){return !userName()||accessibleCycles().indexOf(d.c)>-1||ls("bought",[]).indexOf(d.id)>-1}
function levelChips(cyc,niv){var h="";
 if(canSwitchCycle())h=["Tous"].concat(Object.keys(CYCLES)).map(function(c){return '<button class="chip'+(c===cyc?" on":"")+'" data-cy="'+esc(c)+'">'+(c==="Tous"?"Tous les cycles":esc(c))+'</button>'}).join("");
 if(cyc!=="Tous")h+=["Tous"].concat(CYCLES[cyc]).map(function(n){return '<button class="chip'+(n===niv?" on":"")+'" data-n="'+esc(n)+'">'+(n==="Tous"?"Tous niveaux":esc(n))+'</button>'}).join("");return h};
/* Bandeau « Cycle » placé avant l’élément id : indique le cycle consulté et mène à la page de changement */
function cycleBar(id){var r=$(id),c=activeCycle();if(!r||c==="Tous")return;
 r.insertAdjacentHTML("beforebegin",'<a href="'+BASE+'cycles.html" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px;padding:12px 16px;border-radius:20px;background:var(--card);color:var(--ink);text-decoration:none;box-shadow:0 6px 14px rgba(90,60,170,.1)"><span style="min-width:0"><small style="display:block;font-size:11.5px;color:var(--sub)">Cycle consulté</small><b style="font-size:15px">'+esc(c)+'</b></span><b style="font-size:13px;color:var(--link);white-space:nowrap">'+(canSwitchCycle()?"Changer de cycle ›":"Mon cycle ›")+'</b></a>')}
function userRole(){var r="";try{r=localStorage.getItem("user_role")||""}catch(e){}return r==="enseignant"?"enseignant":(r==="particulier"?"particulier":"eleve")}
var ROLE=userRole();
var ALLOWED_TYPES=ROLE!=="enseignant"?["Cours","Exercices","Annales"]:["Cours","Fiches","Exercices","Évaluations","Annales","Programmes"];
var P="?auto=compress&cs=tinysrgb&w=600";
var IMG={a:"https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg"+P,b:"https://images.pexels.com/photos/159865/notepad-pencil-green-black-159865.jpeg"+P,c:"https://images.pexels.com/photos/14654190/pexels-photo-14654190.jpeg"+P,d:"https://images.pexels.com/photos/3735712/pexels-photo-3735712.jpeg"+P,e:"https://images.pexels.com/photos/158771/notebook-pen-table-blank-158771.jpeg"+P,f:"https://images.pexels.com/photos/4157621/pexels-photo-4157621.jpeg"+P,g:"https://images.pexels.com/photos/1340588/pexels-photo-1340588.jpeg"+P,h:"https://images.pexels.com/photos/248152/pexels-photo-248152.jpeg"+P};
/* Champs facultatifs d’un document : a = nom de l’auteur (ex. a:"Mme Diallo"), e = nombre d’élèves actifs (ex. e:74).
   Affichés sur la fiche cours seulement s’ils sont renseignés. */
var ALLDOCS=[
/*CATALOGUE-AUTO:DEBUT — généré par outils/generer-pages.js à partir des fichiers de contenu/ ; ne pas modifier à la main */
 {id:1,img:IMG.a,t:"Le groupe nominal : cours complet",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.9,s:[{t:"Définition du groupe nominal"},{t:"Les expansions du nom"},{t:"Accorder dans le groupe nominal"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:2,img:IMG.c,t:"La phrase et ses constituants",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une phrase ?"},{t:"Phrase verbale et phrase non verbale"},{t:"Les types et les formes de phrases"},{t:"Le sujet et le prédicat"},{t:"Les compléments du verbe"},{t:"Les compléments de phrase"},{t:"À retenir"}]},
 {id:3,img:IMG.d,t:"Le groupe verbal",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que le groupe verbal ?"},{t:"Le verbe, l’infinitif et les trois groupes"},{t:"Conjuguer au présent"},{t:"Les temps de l’indicatif"},{t:"Accorder le verbe avec son sujet"},{t:"Les compléments du verbe"},{t:"Exercices de synthèse"},{t:"À retenir"}]},
 {id:4,img:IMG.b,t:"Les types de phrases",k:"Cours",n:"CM2",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un type de phrase ?"},{t:"La phrase déclarative"},{t:"La phrase interrogative"},{t:"La phrase impérative"},{t:"La phrase exclamative"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:5,img:IMG.f,t:"Les formes de phrases",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une forme de phrase ?"},{t:"Forme affirmative et forme négative"},{t:"Forme active et forme passive"},{t:"La forme emphatique"},{t:"La forme impersonnelle"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:6,img:IMG.g,t:"Les fonctions grammaticales",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Nature et fonction : ne pas confondre"},{t:"Le sujet"},{t:"Les fonctions liées au verbe : COD, COI et attribut"},{t:"Les compléments circonstanciels"},{t:"Les fonctions dans le groupe nominal"},{t:"Exercices d’analyse"},{t:"À retenir"}]},
 {id:7,img:IMG.h,t:"La nature et la fonction des mots",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Nature ou fonction ?"},{t:"Les mots variables"},{t:"Les mots invariables"},{t:"Reconnaître la nature d’un mot"},{t:"Les fonctions des mots et des groupes de mots"},{t:"Exercices d’analyse"},{t:"À retenir"}]},
 {id:8,img:IMG.c,t:"Le sujet et ses différentes formes",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que le sujet ?"},{t:"Les natures du sujet"},{t:"La place du sujet"},{t:"Plusieurs sujets et sujets collectifs"},{t:"Le sujet dans les phrases particulières"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:9,img:IMG.e,t:"Les compléments d’objet (COD et COI)",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Les verbes et leurs compléments d’objet"},{t:"Le complément d’objet direct (COD)"},{t:"Le complément d’objet indirect (COI)"},{t:"Distinguer le COD et le COI"},{t:"Un verbe, plusieurs compléments"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:10,img:IMG.b,t:"Les compléments circonstanciels",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un complément circonstanciel ?"},{t:"Reconnaître un complément circonstanciel"},{t:"Le lieu, le temps et la manière"},{t:"La cause, le but, le moyen et les autres circonstances"},{t:"La nature des compléments circonstanciels"},{t:"Place, ponctuation et pièges à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:11,img:IMG.g,t:"L’adjectif qualificatif et ses fonctions",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un adjectif qualificatif ?"},{t:"Accorder l’adjectif : genre et nombre"},{t:"La fonction épithète"},{t:"La fonction attribut du sujet"},{t:"L’adjectif apposé et la place de l’adjectif"},{t:"Distinguer les fonctions et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:12,img:IMG.c,t:"Les déterminants",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un déterminant ?"},{t:"Les articles"},{t:"Les déterminants possessifs"},{t:"Les déterminants démonstratifs"},{t:"Les autres déterminants"},{t:"Distinguer et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:13,img:IMG.h,t:"Les pronoms",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un pronom ?"},{t:"Les pronoms personnels"},{t:"Les pronoms possessifs et démonstratifs"},{t:"Les pronoms relatifs"},{t:"Les pronoms interrogatifs et indéfinis"},{t:"Reconnaître le pronom et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:14,img:IMG.e,t:"Les prépositions",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une préposition ?"},{t:"Les prépositions et leurs sens"},{t:"À et de : les prépositions les plus fréquentes"},{t:"Les fonctions du groupe prépositionnel"},{t:"Les locutions prépositives"},{t:"Distinguer la préposition et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:15,img:IMG.f,t:"Les conjonctions",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une conjonction ?"},{t:"Les conjonctions de coordination"},{t:"Les conjonctions de subordination"},{t:"Ce qu’expriment les conjonctions de subordination"},{t:"Coordination ou subordination ?"},{t:"Éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:16,img:IMG.a,t:"Les présentatifs",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un présentatif ?"},{t:"Voici et voilà"},{t:"C’est et ce sont"},{t:"Il y a et il est"},{t:"Les présentatifs conjugués et à la forme négative"},{t:"Distinguer et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:17,img:IMG.b,t:"La phrase simple",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une phrase simple ?"},{t:"Le sujet et le verbe : le cœur de la phrase"},{t:"Les compléments dans la phrase simple"},{t:"Enrichir ou réduire une phrase simple"},{t:"Les types et les formes de phrases simples"},{t:"Pièges : reconnaître les phrases simples"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:18,img:IMG.e,t:"La phrase complexe",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une phrase complexe ?"},{t:"Les propositions : compter et délimiter"},{t:"Juxtaposition et coordination"},{t:"La subordination : principale et subordonnée"},{t:"Les subordonnées : relative, complétive et circonstancielle"},{t:"Pièges : reconnaître et analyser"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:19,img:IMG.d,t:"La proposition principale et la proposition subordonnée",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une proposition ?"},{t:"La proposition principale"},{t:"La proposition subordonnée"},{t:"Les mots subordonnants"},{t:"Nature et fonction des subordonnées"},{t:"Analyser une phrase complexe"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:20,img:IMG.a,t:"La notion de verbe",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un verbe ?"},{t:"Verbe d’action et verbe d’état"},{t:"L’infinitif, le radical et la terminaison"},{t:"Le verbe conjugué : personne et nombre"},{t:"Le verbe et le temps"},{t:"Le verbe et son sujet"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:21,img:IMG.h,t:"Le sens propre et le sens figuré",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Définitions : sens propre et sens figuré"},{t:"Reconnaître le sens propre"},{t:"Reconnaître le sens figuré"},{t:"Comparaison et métaphore"},{t:"Les mots à plusieurs sens et le dictionnaire"},{t:"Pièges : bien reconnaître le sens"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:22,img:IMG.g,t:"Les degrés de qualification",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un degré de qualification ?"},{t:"Le comparatif"},{t:"Le superlatif relatif"},{t:"Le superlatif absolu"},{t:"Comparatifs et superlatifs irréguliers"},{t:"Pièges : accords et emplois"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:23,img:IMG.f,t:"Les groupes de verbes",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Pourquoi classer les verbes en groupes ?"},{t:"Le premier groupe"},{t:"Le deuxième groupe"},{t:"Le troisième groupe"},{t:"Reconnaître le groupe d’un verbe"},{t:"Les groupes et la conjugaison au présent"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:24,img:IMG.c,t:"Les modes personnels et impersonnels",k:"Cours",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un mode ?"},{t:"L’indicatif"},{t:"Le subjonctif et le conditionnel"},{t:"L’impératif"},{t:"Les modes impersonnels : infinitif et participe"},{t:"Reconnaître le mode d’un verbe"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:25,img:IMG.g,t:"L’accord de l’adjectif qualificatif",k:"Cours",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Le principe de l’accord"},{t:"Le féminin de l’adjectif"},{t:"Le pluriel de l’adjectif"},{t:"Épithète et attribut : avec quel mot s’accorder ?"},{t:"L’accord avec plusieurs noms"},{t:"Les adjectifs de couleur et les cas particuliers"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:26,img:IMG.b,t:"Les temps simples",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un temps simple ?"},{t:"Le présent de l’indicatif"},{t:"L’imparfait"},{t:"Le passé simple"},{t:"Le futur simple"},{t:"Choisir et reconnaître le bon temps"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:27,img:IMG.c,t:"Les temps composés",k:"Cours",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un temps composé ?"},{t:"Choisir l’auxiliaire : avoir ou être"},{t:"Le participe passé"},{t:"Le passé composé"},{t:"Le plus-que-parfait"},{t:"Le futur antérieur et le passé antérieur"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:28,img:IMG.d,t:"Le présent de l’indicatif",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Qu’est-ce que le présent de l’indicatif ?"},{t:"Les verbes du 1er groupe"},{t:"Les particularités du 1er groupe"},{t:"Les verbes du 2e groupe"},{t:"Les verbes du 3e groupe"},{t:"Les verbes très irréguliers"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:29,img:IMG.e,t:"La proposition indépendante",k:"Cours",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une proposition ?"},{t:"La proposition indépendante"},{t:"Les types de propositions indépendantes"},{t:"Les propositions indépendantes juxtaposées"},{t:"Les propositions indépendantes coordonnées"},{t:"Reconnaître et analyser les propositions"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:30,img:IMG.f,t:"La proposition indépendante",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une proposition ?"},{t:"La proposition indépendante"},{t:"Les types de propositions indépendantes"},{t:"Les propositions indépendantes juxtaposées"},{t:"Les propositions indépendantes coordonnées"},{t:"Reconnaître et analyser les propositions"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:31,img:IMG.g,t:"La proposition subordonnée relative",k:"Cours",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"La subordination : rappels"},{t:"La proposition subordonnée relative"},{t:"Les pronoms relatifs"},{t:"Choisir le pronom relatif et accorder"},{t:"Relative déterminative et relative explicative"},{t:"Pour aller plus loin : relatives sans antécédent et pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:32,img:IMG.h,t:"La proposition subordonnée relative",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"La subordination : rappels"},{t:"La proposition subordonnée relative"},{t:"Les pronoms relatifs"},{t:"Choisir le pronom relatif et accorder"},{t:"Relative déterminative et relative explicative"},{t:"Pour aller plus loin : relatives sans antécédent et pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:33,img:IMG.c,t:"La coordination, la juxtaposition et la subordination",k:"Cours",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappels : la phrase complexe et les propositions"},{t:"La juxtaposition"},{t:"La coordination"},{t:"La subordination"},{t:"Reconnaître le lien entre deux propositions"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:34,img:IMG.d,t:"La coordination, la juxtaposition et la subordination",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappels : propositions et liens"},{t:"Juxtaposition et coordination : sens et nuances"},{t:"La subordination : conjonctions, pronoms relatifs, mots interrogatifs"},{t:"Les subordonnées circonstancielles et leurs valeurs"},{t:"Le mode du verbe dans la subordonnée"},{t:"Pour aller plus loin : la subordonnée participiale"},{t:"Analyser une phrase longue"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:35,img:IMG.e,t:"Le discours direct, le discours indirect et le discours indirect libre",k:"Cours",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rapporter des paroles : le discours rapporté"},{t:"Le discours direct"},{t:"Le discours indirect"},{t:"Les changements du direct à l’indirect"},{t:"Le discours indirect libre"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:36,img:IMG.f,t:"Le discours direct, le discours indirect et le discours indirect libre",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappels : les façons de rapporter des paroles"},{t:"Le discours direct : ponctuation, incises et dialogue"},{t:"Le discours indirect : les types de phrases"},{t:"Les transformations : pronoms, temps, repères"},{t:"Les verbes introducteurs et leurs nuances"},{t:"Le discours indirect libre"},{t:"Choisir le discours rapporté selon l’effet"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:37,img:IMG.g,t:"Les voix active et passive",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la voix d’un verbe ?"},{t:"La voix active"},{t:"La voix passive"},{t:"Passer de l’actif au passif"},{t:"Passer du passif à l’actif"},{t:"Pièges et cas particuliers"},{t:"Pourquoi choisir la voix passive ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:38,img:IMG.h,t:"La conjugaison",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Conjuguer un verbe : les bases"},{t:"Les auxiliaires être et avoir"},{t:"Le présent des trois groupes"},{t:"L’imparfait et le futur simple"},{t:"Le passé composé"},{t:"L’impératif présent"},{t:"Pièges à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:39,img:IMG.a,t:"L’imparfait de l’indicatif",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert l’imparfait ?"},{t:"Former l’imparfait"},{t:"L’imparfait des trois groupes"},{t:"Les verbes particuliers"},{t:"Ne pas se tromper : les pièges"},{t:"L’imparfait dans un récit"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:40,img:IMG.b,t:"Le futur simple",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert le futur simple ?"},{t:"Former le futur simple"},{t:"Le futur simple des trois groupes"},{t:"Les verbes particuliers"},{t:"Ne pas se tromper : les pièges"},{t:"Le futur simple dans un récit"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:41,img:IMG.c,t:"Le passé composé",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert le passé composé ?"},{t:"Former le passé composé"},{t:"Choisir l’auxiliaire : avoir ou être"},{t:"Le participe passé"},{t:"L’accord du participe passé"},{t:"Ne pas se tromper : les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:42,img:IMG.d,t:"Le plus-que-parfait",k:"Cours",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert le plus-que-parfait ?"},{t:"Former le plus-que-parfait"},{t:"Choisir l’auxiliaire et accorder"},{t:"Le plus-que-parfait des trois groupes"},{t:"Le plus-que-parfait dans un récit"},{t:"Ne pas se tromper : les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:43,img:IMG.e,t:"Le passé antérieur",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert le passé antérieur ?"},{t:"Former le passé antérieur"},{t:"Le passé antérieur des trois groupes"},{t:"Les conjonctions qui l’accompagnent"},{t:"L’accord du participe passé"},{t:"Passé antérieur, plus-que-parfait, passé composé"},{t:"Ne pas se tromper : les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:44,img:IMG.f,t:"Les termes génériques et spécifiques",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un terme générique ?"},{t:"Le terme spécifique"},{t:"Du plus général au plus précis"},{t:"Utiliser les termes dans un texte"},{t:"Ne pas se tromper : les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:45,img:IMG.g,t:"Les figures de style",k:"Cours",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une figure de style ?"},{t:"Les figures d’analogie"},{t:"Exagérer et atténuer : hyperbole, euphémisme, litote"},{t:"Les figures d’opposition : antithèse et oxymore"},{t:"Les figures de substitution : métonymie et périphrase"},{t:"Répéter et construire : anaphore, gradation, accumulation, parallélisme"},{t:"Reconnaître une figure et expliquer son effet"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:46,img:IMG.h,t:"La préfixation",k:"Cours",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Les mots construits : radical, préfixe, suffixe"},{t:"Le préfixe : rôle et fonctionnement"},{t:"Les préfixes qui expriment le contraire ou la négation"},{t:"Les préfixes de lieu, de temps, de quantité et de répétition"},{t:"Les préfixes d’origine grecque et latine"},{t:"Orthographe : bien écrire un mot préfixé"},{t:"Pièges à éviter et intérêt de la préfixation"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:47,img:IMG.a,t:"La suffixation",k:"Cours",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un suffixe ?"},{t:"Les suffixes qui forment des noms"},{t:"Les suffixes qui forment des adjectifs"},{t:"Les suffixes qui forment des verbes et des adverbes"},{t:"Les suffixes qui nuancent le sens : diminutif, péjoratif, collectif"},{t:"Orthographe : bien écrire un mot suffixé"},{t:"Pièges à éviter et intérêt de la suffixation"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:48,img:IMG.a,t:"La phrase déclarative",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une phrase déclarative ?"},{t:"Reconnaître une phrase déclarative"},{t:"À quoi sert la phrase déclarative ?"},{t:"Forme affirmative et forme négative"},{t:"L’ordre des mots et la ponctuation"},{t:"Transformer une phrase déclarative"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:49,img:IMG.a,t:"Les valeurs et l’emploi du présent",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert le présent ?"},{t:"Le présent d’énonciation : ce qui se passe maintenant"},{t:"Le présent d’habitude"},{t:"Le présent de vérité générale"},{t:"Le présent de narration"},{t:"Le présent de futur proche et de passé récent"},{t:"Reconnaître et employer le présent à bon escient"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:50,img:IMG.a,t:"La phrase exclamative",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une phrase exclamative ?"},{t:"Les sentiments qu’elle exprime"},{t:"Les mots exclamatifs"},{t:"La ponctuation et l’intonation"},{t:"Avec ou sans verbe : les formes de la phrase exclamative"},{t:"Distinguer et transformer : ne pas se tromper"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:51,img:IMG.b,t:"L’analyse du sujet et la recherche des idées",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Pourquoi analyser le sujet ?"},{t:"Lire l’énoncé et repérer les mots importants"},{t:"Comprendre la consigne"},{t:"Repérer les contraintes du sujet"},{t:"Chercher des idées"},{t:"Trier et organiser les idées"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:52,img:IMG.c,t:"Le groupe nominal : déterminant, nom et complément du nom",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel : le groupe nominal et son noyau"},{t:"Le déterminant"},{t:"Le nom, noyau du groupe nominal"},{t:"Le complément du nom"},{t:"Reconnaître les trois éléments du groupe nominal"},{t:"Enrichir un groupe nominal"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:53,img:IMG.d,t:"Le groupe nominal : déterminant, nom et adjectif qualificatif",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Le groupe nominal : déterminant + nom + adjectif"},{t:"Le déterminant"},{t:"Le nom, noyau du groupe nominal"},{t:"L’adjectif qualificatif"},{t:"La place de l’adjectif et son accord"},{t:"Enrichir un groupe nominal"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:54,img:IMG.e,t:"Le groupe verbal : verbe et complément circonstanciel",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Le groupe verbal : verbe + complément circonstanciel"},{t:"Le verbe, noyau du groupe verbal"},{t:"Le complément circonstanciel"},{t:"Les sortes de compléments circonstanciels"},{t:"Reconnaître un complément circonstanciel"},{t:"Les formes du complément circonstanciel"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:55,img:IMG.f,t:"La technique de présentation d’un exposé oral",k:"Cours",n:"5e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un exposé oral ?"},{t:"Préparer son exposé : recherche et plan"},{t:"Construire l’exposé : introduction, développement, conclusion"},{t:"Les supports : fiche de notes et aide visuelle"},{t:"La voix et le corps : parler clairement"},{t:"S’entraîner et gérer le trac"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:56,img:IMG.g,t:"La proposition subordonnée complétive",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une proposition subordonnée complétive ?"},{t:"La complétive introduite par « que »"},{t:"Les fonctions de la complétive"},{t:"Le mode du verbe : indicatif ou subjonctif ?"},{t:"La complétive interrogative indirecte"},{t:"Ne pas confondre complétive et relative"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:57,img:IMG.h,t:"Les valeurs modales : l’indicatif",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un mode et que dit-il du locuteur ?"},{t:"L’indicatif, le mode du réel et du certain"},{t:"Le présent et le futur : leurs valeurs modales"},{t:"L’imparfait et le plus-que-parfait : valeurs modales"},{t:"L’indicatif dans la proposition subordonnée"},{t:"Indicatif ou subjonctif ? Choisir le bon mode"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:58,img:IMG.b,t:"Les formes verbales : formes interrogatives et interro-négatives",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel : la phrase interrogative et ses formes"},{t:"Les trois manières de poser une question"},{t:"L’inversion du sujet : les règles"},{t:"L’interrogation aux temps composés, avec pronoms et verbes pronominaux"},{t:"La forme interro-négative"},{t:"Répondre à une question : oui, non, si"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:10001,fn:1,img:IMG.e,t:"Le groupe verbal : verbe + cc",k:"Fiches",n:"5e",m:"Grammaire",pr:25,r:4.8},
 {id:20002,an:2,img:IMG.b,t:"BEPC · Dictée-Questions · Session juillet 2025",k:"Annales",n:"3e",m:"Dictée-Questions",pr:25,r:4.8,s:[{t:"Énoncé du sujet"},{t:"Corrigé détaillé"},{t:"Barème et conseils de méthode"}]},
 {id:20003,an:3,img:IMG.b,t:"BEPC blanc · Dictée-Questions · Session mai 2025",k:"Annales",n:"3e",m:"Dictée-Questions",pr:25,r:4.8,s:[{t:"Énoncé du sujet"},{t:"Corrigé détaillé"},{t:"Barème et conseils de méthode"}]},
 {id:20004,an:4,img:IMG.b,t:"BEPC · Expression écrite · Session juillet 2025",k:"Annales",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Énoncé du sujet"},{t:"Corrigé détaillé"},{t:"Barème et conseils de méthode"}]},
 {id:30001,ex:1,img:IMG.c,t:"Le groupe nominal : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30002,ex:2,img:IMG.a,t:"Les compléments d’objet (COD et COI) : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30003,ex:3,img:IMG.b,t:"Les compléments circonstanciels : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30004,ex:4,img:IMG.c,t:"L’adjectif qualificatif et ses fonctions : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30005,ex:5,img:IMG.d,t:"Les déterminants : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30006,ex:6,img:IMG.e,t:"Le futur simple : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30007,ex:7,img:IMG.f,t:"Le sens propre et le sens figuré : exercices",k:"Exercices",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30008,ex:8,img:IMG.g,t:"Les formes de phrases : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30009,ex:9,img:IMG.h,t:"Le plus-que-parfait : exercices",k:"Exercices",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30010,ex:10,img:IMG.a,t:"Les figures de style : exercices",k:"Exercices",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30011,ex:11,img:IMG.b,t:"La proposition subordonnée relative : exercices",k:"Exercices",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30012,ex:12,img:IMG.c,t:"Les pronoms : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30013,ex:13,img:IMG.d,t:"Le présent de l’indicatif : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30014,ex:14,img:IMG.e,t:"L’imparfait de l’indicatif : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30015,ex:15,img:IMG.f,t:"Le passé composé : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30016,ex:16,img:IMG.g,t:"Les prépositions : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30017,ex:17,img:IMG.h,t:"L’accord de l’adjectif qualificatif : exercices",k:"Exercices",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30018,ex:18,img:IMG.a,t:"Le sujet et ses différentes formes : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30019,ex:19,img:IMG.b,t:"La préfixation : exercices",k:"Exercices",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30020,ex:20,img:IMG.c,t:"La proposition subordonnée complétive : exercices",k:"Exercices",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30021,ex:21,img:IMG.d,t:"Le passé antérieur : exercices",k:"Exercices",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:40001,ev:1,img:IMG.d,t:"Devoir n° 1 : Le groupe nominal",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40002,ev:2,img:IMG.e,t:"Devoir n° 2 : Le présent de l’indicatif",k:"Évaluations",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40003,ev:3,img:IMG.f,t:"Composition du 1er trimestre : La phrase complexe",k:"Évaluations",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]}
/*CATALOGUE-AUTO:FIN*/
];
/* Prix des documents selon le cycle (FCFA) : appliqué automatiquement à tout nouveau document */
var PRIX_CYCLE={"Primaire":25,"Collège":25,"Lycée":50,"Université":100};
ALLDOCS.forEach(function(x){x.c=cycleOf(x.n);if(PRIX_CYCLE[x.c]!==undefined)x.pr=PRIX_CYCLE[x.c]});
var DOCS=ALLDOCS.filter(function(d){return ALLOWED_TYPES.indexOf(d.k)>-1&&cycleOK(d)});
var G={Cours:["#8c6fe0","#b29af4"],Fiches:["#5f84e6","#9bb4f5"],Exercices:["#2fa883","#7fd6b8"],"Évaluations":["#e8825f","#f2b08a"],Annales:["#4aa3c8","#8fd0e8"],Programmes:["#cf63b4","#e79ad6"]};
var IC={
 book:"M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 4h5v8l-2.5-1.5L6 12z",note:"M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5zM8 12h8v1.5H8zm0 3.5h8V17H8z",plan:"M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2zM5 10h14v10H5z",eval:"M9 2h6v2h3a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3zm1.5 11.5L8.7 11.7 7.5 12.9l3 3 6-6-1.2-1.2z",
 gear:"M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.3 7.3 0 0 0-1.69-.98l-.38-2.65A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.5.5 0 0 0-.61.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z",
 back:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z",chev:"M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z",phone:"M17 1H7a2 2 0 0 0-2 2v18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm-5 21a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm5-4H7V4h10z",
 bell:"M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1z",
 search:"M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
 flt:"M3 17v2h6v-2zM3 5v2h10V5zm10 16v-2h8v-2h-8v-2h-2v6zM7 9v2H3v2h4v2h2V9zm14 4v-2H11v2zm-6-4h2V7h4V5h-4V3h-2z",
 heart:"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z",
 star:"M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
 home:"M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
 cart:"M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42a.25.25 0 0 1-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2zm10 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z",
 user:"M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
 grid:"M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z",
 moon:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
 sun:"M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM11 1h2v3h-2zM11 20h2v3h-2zM3.5 5L5 3.5 7.1 5.6 5.6 7.1zM16.9 18.4l1.5-1.5 2.1 2.1-1.5 1.5zM1 11h3v2H1zM20 11h3v2h-3zM3.5 19l2.1-2.1 1.5 1.5L5 20.5zM16.9 5.6L19 3.5 20.5 5l-2.1 2.1z",
 plus:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z",
 check:"M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
 trash:"M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z",
 ok:"M5 12.5l4.5 4.5L19 7.5",
 pen:"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z",
 dl:"M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z",
 out:"M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
 lock:"M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9z",
 cam:"M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"
};

/* ===== Outils ===== */
var $=function(i){return document.getElementById(i)};
function ico(n,s){return '<svg width="'+(s||22)+'" height="'+(s||22)+'" viewBox="0 0 24 24"><path d="'+IC[n]+'"/></svg>'}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function ls(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v||d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
/* ===== Notes des apprenants =====
   Enregistrées sur l'appareil (clé « rates » : {numéro du cours: note de 1 à 5}).
   La moyenne affichée sur les cartes (d.r) reste celle de data.js ; avec le serveur, envoyer la note ici. */
var RATE_TXT=["Décevant","Moyen","Bien","Très bien","Excellent"];
function myRate(id){return +(ls("rates",{})[id])||0}
function setRate(id,n){var r=ls("rates",{});r[id]=n;sv("rates",r)}
function rateBox(id){
 var m=myRate(id);
 return '<section class="rate-box" data-id="'+id+'" aria-label="Noter ce cours"><h3>Que pensez-vous de ce cours ?</h3><p>Touchez une étoile pour le noter.</p>'+
  '<div class="stars" role="radiogroup" aria-label="Note sur 5">'+[1,2,3,4,5].map(function(n){
   return '<button type="button" role="radio" data-n="'+n+'" aria-checked="'+(n===m)+'" aria-label="'+n+' étoile'+(n>1?"s":"")+' sur 5"'+(n<=m?' class="on"':"")+'>'+ico("star",36)+'</button>'}).join("")+
  '</div><div class="rt" aria-live="polite">'+(m?"Votre note : "+m+"/5 · "+RATE_TXT[m-1]:"")+'</div></section>'}
function bindRate(root,id){
 var b=root.querySelector(".rate-box");if(!b)return;
 b.onclick=function(e){var s=e.target.closest("button[data-n]");if(!s)return;
  var n=+s.dataset.n;setRate(id,n);vib(15);
  [].forEach.call(b.querySelectorAll("button[data-n]"),function(x){var k=+x.dataset.n;x.classList.toggle("on",k<=n);x.setAttribute("aria-checked",k===n)});
  b.querySelector(".rt").textContent="Votre note : "+n+"/5 · "+RATE_TXT[n-1];toast("Merci pour votre note")}}

function vib(n){try{if(ls("settings",{}).vib===false)return;navigator.vibrate&&navigator.vibrate(n)}catch(e){}}
function toast(m){var t=$("toast");if(!t)return;t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(function(){t.classList.remove("show")},2000)}
function norm(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
/* ===== Recherche dans le texte des cours =====
   contentReady(rappel) charge une seule fois le fichier de contenu (contentFile) de tous les cours (déjà gardés hors ligne par sw.js) ;
   contentHits(texte, cours) renvoie les parties qui contiennent tous les mots ; hitsHTML(...) en fait la liste affichée.
   Les extraits ne sont montrés que pour les parties ouvertes à l’utilisateur (partie 1 ou cours acheté / abonnement). */
var CIDX=null,CLOAD=false,CWAIT=[];
function ctxt(b){var a=[];
 function add(x){if(x!=null&&x!=="")a.push(String(x))}
 function addl(l){if(Array.isArray(l))l.forEach(add)}
 add(b.text);add(b.title);add(b.note);add(b.question);add(b.explain);add(b.enonce);
 addl(b.items);addl(b.lines);addl(b.options);addl(b.head);
 if(Array.isArray(b.rows))b.rows.forEach(addl);
 if(Array.isArray(b.cells))b.cells.forEach(function(c){add(c.mot);add(c.role)});
 add(Array.isArray(b.corrige)?b.corrige.join(" "):b.corrige);
 return a.join(" ")}
function cbuild(j){var out=[];
 if(!j||!Array.isArray(j.sections))return out;
 j.sections.forEach(function(sec,i){
  var x=(sec.blocs||[]).map(ctxt).join(" ").replace(/\*+/g,"").replace(/\s+/g," ").trim();
  out.push({i:i,t:sec.t||"",x:x,nb:norm(x),n:norm((sec.t||"")+" "+x)})});
 return out}
function contentReady(cb){
 if(CIDX)return cb();
 CWAIT.push(cb);if(CLOAD)return;CLOAD=true;
 var docs=ALLDOCS.filter(function(d){return d.k!=="Fiches"}),left=docs.length,idx={};
 function done(){CIDX=idx;CWAIT.splice(0).forEach(function(f){f()})}
 if(!window.fetch||!left)return done();
 docs.forEach(function(d){
  fetch(BASE+contentFile(d)).then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(j){
   idx[d.id]=cbuild(j);if(--left===0)done()})})}
function contentHits(q,docs){
 var w=norm(q.trim()).split(/\s+/).filter(Boolean),out=[];
 if(!CIDX||!w.length)return out;
 docs.forEach(function(d){(CIDX[d.id]||[]).forEach(function(s){
  var sc=0,ok=true;
  w.forEach(function(x){var p=s.n.indexOf(x),c=0;if(p<0){ok=false;return}
   while(p>-1&&c<20){c++;p=s.n.indexOf(x,p+1)}
   sc+=c;if(norm(s.t).indexOf(x)>-1)sc+=5});
  if(ok)out.push({d:d,s:s,w:w,sc:sc})})});
 out.sort(function(a,b){return b.sc-a.sc});return out}
function csnippet(h){var s=h.s,pos=-1,len=0,j,p;
 for(j=0;j<h.w.length;j++){p=s.nb.indexOf(h.w[j]);if(p>-1&&(pos<0||p<pos)){pos=p;len=h.w[j].length}}
 if(pos<0)return"";
 var x=s.x,a=Math.max(0,pos-45),b=Math.min(x.length,pos+len+75),k;
 if(a>0){k=x.indexOf(" ",a);if(k>-1&&k<pos)a=k+1}
 if(b<x.length){k=x.lastIndexOf(" ",b);if(k>pos+len)b=k}
 return(a>0?"… ":"")+esc(x.slice(a,pos))+"<mark>"+esc(x.slice(pos,pos+len))+"</mark>"+esc(x.slice(pos+len,b))+(b<x.length?" …":"")}
function hitsHTML(hits,max){
 if(!hits.length)return"";
 var h='<h3>Dans le contenu des cours <span class="count">'+hits.length+'</span></h3>';
 hits.slice(0,max).forEach(function(r){
  var d=r.d,open=partFree(r.s.i)||canAccess(d.id),sn=open?csnippet(r):"";
  h+='<a class="hit" href="'+partUrl(d,r.s.i)+'"><i>'+(r.s.i+1)+'</i><div><b>'+esc(r.s.t)+'</b><small>'+esc(d.t)+' · '+esc(d.n)+'</small>'+
   (open?(sn?'<p>'+sn+'</p>':""):'<p class="lk">Partie réservée : achat ou abonnement</p>')+'</div></a>'});
 if(hits.length>max)h+='<p class="hitmore">+ '+(hits.length-max)+' autres parties : précisez votre recherche.</p>';
 return h}
function price(n){return n.toLocaleString("fr-FR")+"\u00a0"+DEVISE}
function userName(){try{return localStorage.getItem("user_name")||""}catch(e){return""}}

/* Favoris et panier partagés entre les pages (stockés sur l’appareil) */
var favs=ls("favs",[]),cart=ls("cart",[]);
/* Retire des favoris et du panier les documents que ce profil n’a pas le droit de voir */
(function(){var ok=DOCS.map(function(d){return d.id});
 var f=favs.filter(function(i){return ok.indexOf(i)>-1}),c=cart.filter(function(i){return ok.indexOf(i)>-1});
 favs=f;
 cart=c;})();
cart=cart.filter(function(i){return !canAccess(i)});

/* Informations de profil et photo (stockées sur l’appareil) */
function userProfile(){return ls("user_profile",{})}
function userPhoto(){try{return localStorage.getItem("user_photo")||""}catch(e){return""}}
function paintAvatars(){var ph=userPhoto();
 document.querySelectorAll(".av,.big").forEach(function(a){
  if(ph){a.style.background='url("'+ph+'") center/cover no-repeat';a.classList.add("ph")}
  else{a.style.background="";a.classList.remove("ph")}})}
paintAvatars();

/* Thème : "auto" (par défaut), "light" ou "dark" */
function applyTheme(){var t="";try{t=localStorage.getItem("theme")||""}catch(e){}
 if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else document.documentElement.removeAttribute("data-theme")}
applyTheme();

/* Repère visuel des fiches pédagogiques : bandeau bleu en haut de la carte + contour bleu (catalogue, favoris, accueil) */
try{var _fs=document.createElement("style");_fs.textContent=".doc.fiche{box-shadow:0 0 0 2px #5f84e6,0 8px 24px rgba(90,60,170,.08)}.fband{display:flex;align-items:center;gap:6px;background:linear-gradient(90deg,#4a6fdc,#7d9cf0);color:#fff;font-size:12px;font-weight:700;padding:7px 12px;border-radius:14px;margin-bottom:8px}.fband svg{width:14px;height:14px;flex:0 0 auto}";document.head.appendChild(_fs)}catch(e){}
function docClass(d){return d.k==="Fiches"?"doc fiche":"doc"}
function ficheBand(d){return d.k==="Fiches"?'<div class="fband"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 7V3.5L18.5 9zM8 13h8v2H8zm0 4h8v2H8z"/></svg>Fiche pédagogique</div>':""}
/* Carte de document (catalogue, favoris) */
function cardHTML(d){
 var g=G[d.k]||G.Cours,f=favs.indexOf(d.id)>-1,c=cart.indexOf(d.id)>-1,acc=canAccess(d.id),inc=isSubscribed();
 return '<article class="'+docClass(d)+'">'+ficheBand(d)+'<div class="cov" style="--g1:'+g[0]+';--g2:'+g[1]+'"><img src="'+esc(d.img)+'" alt="" loading="lazy" decoding="async" onerror="this.remove()">'+
  '<span class="rate">'+ico("star",12)+d.r.toFixed(1)+'</span><span class="tag">'+esc(d.m)+'</span>'+
  '<button class="fav" data-f="'+d.id+'" aria-pressed="'+f+'" aria-label="Favori">'+ico("heart",18)+'</button></div>'+
  '<div class="body"><h3>'+esc(d.t)+'</h3><p class="meta">'+esc(d.k)+' · '+esc(d.n)+'</p><a href="'+docUrl(d)+'" style="font-size:12px;font-weight:600;color:#7a5cd0;text-decoration:none">Voir les détails ›</a>'+
  '<div class="r2">'+(acc?'<div class="price"><b>'+(GRATUIT?"Gratuit":inc?"Inclus":"Acheté")+'</b></div><button class="add in" data-o="'+d.id+'" aria-label="Ouvrir">'+ico("dl",20)+'</button>':'<div class="price"><b>'+price(d.pr)+'</b></div>'+
  '<button class="add'+(c?" in":"")+'" data-c="'+d.id+'" aria-label="'+(c?"Retirer du panier":"Ajouter au panier")+'">'+ico(c?"check":"plus",20)+'</button>')+'</div></div></article>'}

/* ===== Rangement par catégorie =====
   Les documents ne sont plus empilés dans une seule longue liste : ils sont rangés par catégorie (type)
   puis par sous-discipline. Chaque groupe est une rangée qui défile horizontalement (8 documents au plus,
   puis une carte « Voir tout »). cardFn(d) renvoie le HTML d’une carte. */
var SHELF_ORDER=["Grammaire","Orthographe","Conjugaison","Vocabulaire","Lecture","Expression écrite","Littérature","Linguistique","Tous domaines"];
function shelfGroups(res){var s={};res.forEach(function(d){s[d.k+"|"+d.m]=1});return Object.keys(s).length}
function shelvesHTML(res,cardFn,per){
 var types=[],byT={};
 res.forEach(function(d){if(!byT[d.k]){byT[d.k]={};types.push(d.k)}(byT[d.k][d.m]=byT[d.k][d.m]||[]).push(d)});
 types.sort(function(a,b){return ALLOWED_TYPES.indexOf(a)-ALLOWED_TYPES.indexOf(b)});
 var multi=types.length>1,h="";
 types.forEach(function(k){
  var ms=Object.keys(byT[k]).sort(function(a,b){var ra=SHELF_ORDER.indexOf(a),rb=SHELF_ORDER.indexOf(b);ra=ra<0?99:ra;rb=rb<0?99:rb;return ra-rb||(a<b?-1:a>b?1:0)}),tot=0;
  ms.forEach(function(m){tot+=byT[k][m].length});
  if(multi)h+='<h2 class="shelf-cat">'+esc(k)+' <small>'+tot+'</small></h2>';
  ms.forEach(function(m){
   var L=byT[k][m],more=L.length>per,go=' data-m="'+esc(m)+'"'+(multi?' data-k="'+esc(k)+'"':'');
   h+='<section class="shelf"><div class="shelf-h"><h3>'+esc(m==="Tous domaines"?"Multi-domaines":m)+' <small>'+L.length+'</small></h3>'+
    (more?'<button type="button" class="shelf-go"'+go+'>Voir tout ›</button>':'')+'</div><div class="rail">'+
    L.slice(0,per).map(cardFn).join("")+
    (more?'<button type="button" class="shelf-go shelf-more"'+go+'><b>+'+(L.length-per)+'</b>Voir tout</button>':'')+'</div></section>'})});
 return h}

/* Clics sur les cartes : favori et panier. cb("fav"|"cart") est appelé après chaque action. */
function bindCards(el,cb){
 el.onclick=function(e){
  var f=e.target.closest(".fav"),c=e.target.closest(".add");if(c&&c.dataset.o)return openDoc(+c.dataset.o);
  if(f){var id=+f.dataset.f,i=favs.indexOf(id);i>-1?favs.splice(i,1):favs.push(id);sv("favs",favs);f.setAttribute("aria-pressed",i<0);toast(i<0?"Ajouté aux favoris":"Retiré des favoris");if(cb)cb("fav")}
  if(c){var id2=+c.dataset.c,j=cart.indexOf(id2);j>-1?cart.splice(j,1):cart.push(id2);sv("cart",cart);
   c.classList.toggle("in",j<0);c.innerHTML=ico(j<0?"check":"plus",20);c.setAttribute("aria-label",j<0?"Retirer du panier":"Ajouter au panier");toast(j<0?"Ajouté au panier":"Retiré du panier");if(cb)cb("cart")}}}

/* Barre de navigation du bas : drawNav(0..4) = Accueil, Catalogue, Favoris, Panier, Profil */
var NAVITEMS=[["home","Accueil","index.html"],["grid","Catalogue","catalogue.html"],["heart","Favoris","favoris.html"],["cart","Panier","panier.html"],["user","Profil","profil.html"]];
function drawNav(a){
 var nv=$("nav");nv.style.setProperty("--cx",(a*20+10)+"%");
 nv.innerHTML='<div class="bar"></div>'+NAVITEMS.map(function(n,i){return '<button type="button" data-h="'+BASE+n[2]+'" aria-label="'+n[1]+'" title="'+n[1]+'"'+(i===a?' class="on" aria-current="page"':'')+'><span class="ic">'+ico(n[0],24)+'</span>'+
  (n[1]==="Panier"&&cart.length?'<span class="bd">'+cart.length+'</span>':"")+'</button>'}).join("")}
function navClick(e){var b=e.target.closest("button");if(b&&b.dataset.h&&b.getAttribute("aria-current")!=="page")location.href=b.dataset.h}

/* ===== Application installable et mode hors ligne ===== */
var deferredInstall=null;
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();deferredInstall=e;document.dispatchEvent(new Event("installready"))});
window.addEventListener("appinstalled",function(){deferredInstall=null;document.dispatchEvent(new Event("installdone"))});
function isStandalone(){try{return window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true}catch(e){return false}}
function installApp(){
 if(!deferredInstall)return Promise.resolve(false);
 deferredInstall.prompt();
 return deferredInstall.userChoice.then(function(c){deferredInstall=null;return c.outcome==="accepted"})}
/* Le service worker ne fonctionne qu’en HTTPS (ou sur localhost) */
if("serviceWorker" in navigator&&(location.protocol==="https:"||location.hostname==="localhost"||location.hostname==="127.0.0.1")){
 window.addEventListener("load",function(){navigator.serviceWorker.register(BASE+"sw.js").catch(function(){})})}
window.addEventListener("offline",function(){toast("Vous êtes hors ligne")});
window.addEventListener("online",function(){toast("Connexion rétablie")});

/* Bouton jour / nuit placé à côté de la cloche de notifications */
function isDark(){var t=document.documentElement.getAttribute("data-theme");
 if(t)return t==="dark";try{return matchMedia("(prefers-color-scheme: dark)").matches}catch(e){return false}}
function paintThemeBtn(){var b=$("tbtn");if(!b)return;var d=isDark();
 b.innerHTML=ico(d?"sun":"moon",22);b.setAttribute("aria-label",d?"Passer en mode jour":"Passer en mode nuit");b.title=b.getAttribute("aria-label")}
function setupThemeBtn(){var bell=$("bell")||$("set");if(!bell||$("tbtn"))return;
 var w=document.createElement("div");w.style.cssText="display:flex;align-items:center;gap:10px;flex:0 0 auto";
 bell.parentNode.insertBefore(w,bell);
 var t=document.createElement("button");t.id="tbtn";t.type="button";t.className="ib";
 t.onclick=function(){var next=isDark()?"light":"dark";try{localStorage.setItem("theme",next)}catch(e){}applyTheme();paintThemeBtn();vib(10);toast(next==="dark"?"Mode nuit activé":"Mode jour activé")};
 w.appendChild(t);w.appendChild(bell);paintThemeBtn()}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setupThemeBtn);else setupThemeBtn();

/* Compte réel (Supabase) : si la session a disparu, on efface les infos de compte (retour à la connexion ci-dessous) */
(function(){try{if(localStorage.getItem("auth_mode")==="supabase"&&!localStorage.getItem("sb_session")){["user_name","user_role","user_cycle","view_cycle","auth_mode"].forEach(function(k){localStorage.removeItem(k)})}}catch(e){}})();
/* Session : sans utilisateur connecté, retour à la connexion (contrôle réel à faire côté serveur) */
/* Les pages de cours (PUBLIC_PAGE) restent visibles sans connexion : l’achat, lui, demande de se connecter. */
if(!userName()&&typeof PUBLIC_PAGE==="undefined")location.replace(BASE+"login-app.html");
/* Connecté mais cycle pas encore choisi : choix obligatoire (page cycles.html). */
else if(userName()&&!homeCycle()&&typeof PUBLIC_PAGE==="undefined"&&typeof CYCLE_PAGE==="undefined")location.replace(BASE+"cycles.html");
