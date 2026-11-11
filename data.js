
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
var ACHAT=false; /* false = pas d’achat à l’unité : seul l’abonnement par code d’activation donne accès aux parties payantes */
var DEMO=true; /* mettre false avec un vrai serveur : les achats restent « en attente » jusqu’à confirmation du paiement */
/* ===== Abonnement =====
   Formules prépayées (pas de renouvellement automatique). À brancher sur le serveur : l’état « sub » doit venir du compte. */
/* Prix selon le profil de l’appareil (élève et étudiant = même profil « eleve »).
   Élève / étudiant : mensuel 1000, trimestriel 2000, annuel 3000. Enseignant : mensuel 2500, trimestriel 5000, annuel 10000. */
var EST_ELEVE=userRole()!=="enseignant"; /* élève, étudiant et particulier : mêmes tarifs */
var PLANS=[{id:"mois",n:"Mensuel",d:30,pr:EST_ELEVE?1000:2500},{id:"trim",n:"Trimestriel",d:90,pr:EST_ELEVE?2000:5000},{id:"an",n:"Annuel",d:365,pr:EST_ELEVE?3000:10000}]; /* élève : 1000 / 2000 / 3000 ; enseignant : 2500 / 5000 / 10000. À garder identiques à public.formule() dans supabase/03-abonnement-codes.sql */
function isSubscribed(){var s=ls("sub",{});return !!s.end&&Date.parse(s.end)>Date.now()}
function achete(id){return ACHAT&&ls("bought",[]).indexOf(id)>-1} /* les anciens achats « démo » restés dans l’appareil ne comptent plus tant que l’achat à l’unité est désactivé (ACHAT=false) */
function canAccess(id){return GRATUIT||isSubscribed()||achete(id)}
/* ===== Fiches pédagogiques : accès par étape =====
   Gratuit : l’en-tête et les FICHES_LIBRES premières étapes de la fiche du professeur (I et II).
   Réservé aux abonnés : les autres étapes (III, IV, V), la page de l’apprenant, le corrigé et le PDF.
   FICHES_VERROU=true : ce verrou s’applique AUSSI quand GRATUIT est true (les cours restent gratuits, seules les fiches sont verrouillées : sert à tester l’abonnement).
   FICHES_VERROU=false : les fiches suivent GRATUIT comme le reste. */
var FICHES_VERROU=true,FICHES_LIBRES=2;
function accesLabel(d){if(isSubscribed())return "Inclus";if(d.k==="Fiches"&&FICHES_VERROU&&!ficheAcces(d.id))return "Aperçu gratuit";return GRATUIT?"Gratuit":"Acheté"}
function ficheAcces(id){return (GRATUIT&&!FICHES_VERROU)||isSubscribed()||achete(id)}
function fmtDate(iso){return new Date(iso).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}
function activateSub(id){var p=PLANS.filter(function(x){return x.id===id})[0],s=ls("sub",{}),b=Math.max(Date.now(),s.end?Date.parse(s.end):0);
 sv("sub",{plan:id,end:new Date(b+p.d*864e5).toISOString()});cart=[];sv("cart",cart)}
/* Chaque cours a sa propre page dans le dossier cours/ (générée par outils/generer-pages.js). Le nom du fichier = numéro + titre. */
function slug(t){return String(t).toLowerCase().replace(/œ/g,"oe").replace(/æ/g,"ae").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60).replace(/-+$/,"")}
/* Les pages sont classées par cycle : cours/primaire/, cours/college/, cours/lycee/, cours/universite/ ; les fiches pédagogiques (type Fiches) ont leur propre dossier : fiches/<cycle>/ */
/* Les fiches ont leur propre numérotation : fn = numéro de fiche (1, 2, 3…) ; leur id interne = 10000 + fn (aucun conflit avec les cours).
   Les programmes : pg = numéro de programme ; id = 50000 + pg ; pages dans programmes/<cycle>/programme-<pg>-<titre>.html.
   Les annales aussi : an = numéro d’annale (1, 2, 3…) ; id = 20000 + an ; pages dans annales/<cycle>/annale-<an>-<titre>.html.
   Les exercices : ex = numéro de série (1, 2, 3…) ; id = 30000 + ex ; pages dans exercices/<cycle>/exercice-<ex>-<titre>.html.
   Les évaluations : ev = numéro (1, 2, 3…) ; id = 40000 + ev ; pages dans evaluations/<cycle>/evaluation-<ev>-<titre>.html. */
function docFile(d){var c=CYCLE_INFO[cycleOf(d.n)].dir;return d.k==="Fiches"?"fiches/"+c+"/fiche-"+d.fn+"-"+slug(d.t)+".html":d.k==="Annales"?"annales/"+c+"/annale-"+d.an+"-"+slug(d.t)+".html":d.k==="Exercices"?"exercices/"+c+"/exercice-"+d.ex+"-"+slug(d.t)+".html":d.k==="Évaluations"?"evaluations/"+c+"/evaluation-"+d.ev+"-"+slug(d.t)+".html":d.k==="Programmes"?"programmes/"+c+"/programme-"+d.pg+"-"+slug(d.t)+".html":"cours/"+c+"/"+d.id+"-"+slug(d.t)+".html"}
/* Fichier de contenu (texte) d'un document : contenu/cours/<cycle>/<id>.json ou contenu/fiches/<cycle>/fiche-<n>.json ou contenu/annales/<cycle>/annale-<an>.json (le dossier <cycle> vient du niveau n) */
function contentFile(d){var c=CYCLE_INFO[cycleOf(d.n)].dir;return "contenu/"+(d.k==="Fiches"?"fiches/"+c+"/fiche-"+d.fn:d.k==="Annales"?"annales/"+c+"/annale-"+d.an:d.k==="Exercices"?"exercices/"+c+"/exercice-"+d.ex:d.k==="Évaluations"?"evaluations/"+c+"/evaluation-"+d.ev:d.k==="Programmes"?"programmes/"+c+"/programme-"+d.pg:"cours/"+c+"/"+d.id)+".json"}
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
function subBanner(id){if((GRATUIT&&!FICHES_VERROU)||isSubscribed())return;var r=$(id);if(!r)return;
 r.insertAdjacentHTML("beforebegin",'<a href="abonnement.html" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px;padding:14px 16px;border-radius:20px;background:linear-gradient(135deg,#b29af4,#8c6fe0);color:#fff;text-decoration:none;font-weight:600;font-size:14px"><span>'+(GRATUIT?"Abonnez-vous : fiches pédagogiques complètes":"Abonnez-vous : tout le contenu, sans achat à l’unité")+'</span><b style="white-space:nowrap">Voir ›</b></a>')}
/* ===== Fiche détail d’un document : descriptions génériques par type (une description propre au document, d.d / d.obj / d.s, les remplace) ===== */
var INFO={
 "Cours":{desc:"Cours de français ({m}) pour le niveau {n} : notions essentielles, méthodes et exemples commentés.",obj:["Comprendre les notions essentielles du chapitre","Appliquer les méthodes sur des exemples guidés","Se préparer aux évaluations"],plan:["Objectifs et prérequis","Notions clés","Méthodes et exemples commentés","Exercices d’application","À retenir"]},
 "Programmes":{desc:"Programme et progression de français pour le niveau {n}, à utiliser pour préparer l’année.",obj:["Planifier l’année","Répartir les séquences"],plan:["Objectifs de l’année","Progression par période"]},
 "Évaluations":{desc:"Évaluation de français ({m}), niveau {n}, prête à l’emploi, avec barème.",obj:["Évaluer les acquis","Disposer d’un barème"],plan:["Sujet","Barème et corrigé"]},
 "Fiches":{desc:"Fiche pédagogique PPO de français ({m}), niveau {n} : une séance prête à enseigner, avec la fiche du professeur, la page de l’apprenant et le corrigé.",obj:["Préparer la séance avec ses objectifs, ses étapes et son temps","Disposer de la page de l’apprenant à distribuer","Évaluer avec un corrigé et un barème"],plan:[]},
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
function cycleOK(d){return !userName()||accessibleCycles().indexOf(d.c)>-1||achete(d.id)}
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
 {id:59,img:IMG.f,t:"La préposition",k:"Cours",n:"CM2",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une préposition ?"},{t:"Les principales prépositions"},{t:"Le rôle de la préposition"},{t:"L’emploi de la préposition dans la phrase"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:60,img:IMG.b,t:"La conjonction",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une conjonction ?"},{t:"Les conjonctions de coordination"},{t:"Les conjonctions de subordination"},{t:"Ce qu’expriment les conjonctions de subordination"},{t:"Rôle et emploi de la conjonction dans la phrase"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:61,img:IMG.c,t:"La dérivation",k:"Cours",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la dérivation ?"},{t:"Les préfixes et les suffixes"},{t:"La famille de mots"},{t:"La dérivation impropre"},{t:"Les mots dérivés et leur classe"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:62,img:IMG.d,t:"La composition",k:"Cours",n:"4e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la composition ?"},{t:"L’écriture des mots composés"},{t:"Les natures des mots composés"},{t:"Le pluriel des mots composés"},{t:"La composition savante"},{t:"Composition ou dérivation ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:63,img:IMG.e,t:"Les champs lexicaux",k:"Cours",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un champ lexical ?"},{t:"Champ lexical et famille de mots"},{t:"Les champs lexicaux courants"},{t:"Le champ lexical dans un texte"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:64,img:IMG.f,t:"Les champs sémantiques",k:"Cours",n:"4e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un champ sémantique ?"},{t:"Polysémie et homonymie"},{t:"Le sens dans le contexte"},{t:"Champ sémantique et champ lexical"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:65,img:IMG.b,t:"Les champs lexicaux",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un champ lexical ?"},{t:"Des mots de natures différentes"},{t:"Champ lexical et famille de mots"},{t:"Les champs lexicaux courants"},{t:"Repérer un champ lexical dans un texte"},{t:"Utiliser les champs lexicaux pour mieux écrire"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:66,img:IMG.c,t:"Les champs sémantiques",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un champ sémantique ?"},{t:"Un mot, plusieurs sens"},{t:"Sens propre et sens figuré"},{t:"Trouver le bon sens grâce au contexte"},{t:"Champ sémantique et champ lexical"},{t:"Utiliser le dictionnaire"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:67,img:IMG.c,t:"Les homophones grammaticaux : a / à, et / est, son / sont, on / ont, ou / où",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un homophone grammatical ?"},{t:"a ou à ?"},{t:"et ou est ?"},{t:"son ou sont ?"},{t:"on ou ont ?"},{t:"ou ou où ?"},{t:"Les cinq tests réunis"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:68,img:IMG.d,t:"L’accord des déterminants et des noms",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"L’accord dans le groupe nominal"},{t:"Le genre des noms"},{t:"Le féminin des noms"},{t:"Le pluriel des noms : la règle générale"},{t:"Le pluriel des noms en -al, -ail et les cas particuliers"},{t:"L’accord des déterminants avec le nom"},{t:"Les déterminants numéraux et indéfinis"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:69,img:IMG.e,t:"Les terminaisons verbales en -é, -er, -ait, -ez",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Un même son, plusieurs écritures"},{t:"L’infinitif en -er ou le participe passé en -é ?"},{t:"Après quels mots écrit-on l’infinitif ?"},{t:"La terminaison -ez"},{t:"-ait, -aient et l’imparfait"},{t:"La méthode pour ne plus se tromper"},{t:"Pièges à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:70,img:IMG.f,t:"Les homophones lexicaux : mer / mère / maire, ver / verre / vert / vers",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un homophone lexical ?"},{t:"mer, mère, maire"},{t:"ver, verre, vert, vers"},{t:"sain, saint, sein"},{t:"cent, sans, sang, s’en"},{t:"cour, cours, court / mur, mûr, mûre"},{t:"Autres homophones fréquents"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:71,img:IMG.g,t:"L’accord du verbe avec son sujet",k:"Cours",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Le principe de l’accord sujet-verbe"},{t:"Le sujet éloigné du verbe"},{t:"Le sujet placé après le verbe"},{t:"Le sujet est un pronom relatif (qui)"},{t:"Plusieurs sujets"},{t:"Sujets collectifs, indéfinis et quantités"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:72,img:IMG.h,t:"L’accord du participe passé",k:"Cours",n:"4e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Qu’est-ce que le participe passé ?"},{t:"Le participe passé employé seul"},{t:"Le participe passé avec l’auxiliaire être"},{t:"Le participe passé avec l’auxiliaire avoir"},{t:"Le participe passé des verbes pronominaux"},{t:"Quelques cas particuliers"},{t:"La méthode pour accorder le participe passé"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:73,img:IMG.a,t:"Les mots invariables : adverbes, prépositions, conjonctions",k:"Cours",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un mot invariable ?"},{t:"Les adverbes"},{t:"Les prépositions"},{t:"Les conjonctions"},{t:"Les mots invariables piégeux"},{t:"Mémoriser les mots invariables"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:74,img:IMG.b,t:"Les consonnes doubles",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Pourquoi y a-t-il des consonnes doubles ?"},{t:"Les mots commençant par ap-, ac-, af-, ef-, of-, at-"},{t:"Les préfixes négatifs : il-, im-, ir-, inn-"},{t:"Les consonnes doubles à l’intérieur des mots"},{t:"Les verbes qui doublent la consonne"},{t:"Astuces pour retenir les consonnes doubles"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:75,img:IMG.c,t:"Les homophones ce / se, ces / ses",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Quatre mots, deux paires à ne pas confondre"},{t:"ce : déterminant ou pronom"},{t:"se : pronom personnel"},{t:"ces : déterminant démonstratif pluriel"},{t:"ses : déterminant possessif pluriel"},{t:"Les quatre ensemble : comment choisir ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:76,img:IMG.d,t:"Les synonymes",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un synonyme ?"},{t:"Des synonymes qui ne disent pas tout à fait la même chose"},{t:"Le bon synonyme dépend du contexte"},{t:"Les synonymes pour éviter les répétitions"},{t:"Trouver des synonymes"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:77,img:IMG.e,t:"Les antonymes",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un antonyme ?"},{t:"Les différentes sortes de contraires"},{t:"Former un antonyme avec un préfixe"},{t:"Un mot peut avoir plusieurs contraires"},{t:"À quoi servent les antonymes ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:78,img:IMG.g,t:"Les homonymes",k:"Cours",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un homonyme ?"},{t:"Les homophones"},{t:"Les homographes"},{t:"Des homonymes qui changent de genre"},{t:"Reconnaître le bon homonyme et utiliser le dictionnaire"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:79,img:IMG.c,t:"Rédiger un paragraphe et utiliser les connecteurs",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un paragraphe ?"},{t:"Construire un paragraphe"},{t:"Les connecteurs chronologiques"},{t:"Les connecteurs logiques"},{t:"Les connecteurs spatiaux (pour décrire)"},{t:"Éviter les erreurs fréquentes"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:80,img:IMG.h,t:"Relire et améliorer sa rédaction",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Pourquoi relire sa rédaction ?"},{t:"Relire en trois temps"},{t:"Chasser les fautes d’orthographe et de grammaire"},{t:"Améliorer son style"},{t:"La ponctuation et la présentation"},{t:"Ma grille de relecture"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:81,img:IMG.e,t:"Les verbes pronominaux",k:"Cours",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un verbe pronominal ?"},{t:"Conjuguer au présent et à l’impératif"},{t:"Les sortes de verbes pronominaux"},{t:"Les temps composés : l’auxiliaire être"},{t:"La négation et l’interrogation"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:82,img:IMG.a,t:"Le passé simple",k:"Cours",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert le passé simple ?"},{t:"Le passé simple des verbes du 1er groupe"},{t:"Le passé simple des verbes du 2e groupe"},{t:"Être, avoir, aller et faire au passé simple"},{t:"Les verbes du 3e groupe : -is, -it"},{t:"Les verbes du 3e groupe : -us, -ut"},{t:"Venir, tenir et leurs composés"},{t:"Employer le passé simple dans un récit"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:83,img:IMG.a,t:"L’impératif présent",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert l’impératif ?"},{t:"Les personnes de l’impératif"},{t:"L’impératif des verbes du 1er groupe"},{t:"L’impératif des verbes du 2e et du 3e groupe"},{t:"Être, avoir, aller, savoir et vouloir"},{t:"L’impératif négatif"},{t:"L’impératif et les pronoms"},{t:"Employer l’impératif à bon escient"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:84,img:IMG.a,t:"La phrase interrogative",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"À quoi sert la phrase interrogative ?"},{t:"L’interrogation totale"},{t:"L’interrogation partielle"},{t:"L’inversion du sujet"},{t:"Qui, que, quoi et quel"},{t:"La question à la forme négative et la réponse « si »"},{t:"Ponctuation et niveaux de langue"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:85,img:IMG.a,t:"Le futur proche et le passé récent",k:"Cours",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Parler de ce qui va arriver et de ce qui vient d’arriver"},{t:"Former le futur proche"},{t:"Former le passé récent"},{t:"Les valeurs du futur proche et du passé récent"},{t:"Être sur le point de et être en train de"},{t:"La négation et la question"},{t:"Employer le futur proche et le passé récent dans les textes"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:86,img:IMG.a,t:"Le conditionnel présent",k:"Cours",n:"4e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"À quoi sert le conditionnel présent ?"},{t:"La formation du conditionnel présent"},{t:"Les verbes à radical particulier"},{t:"Les verbes du 1er groupe qui changent"},{t:"L’hypothèse : si + imparfait, conditionnel présent"},{t:"Les autres valeurs du conditionnel"},{t:"Bien écrire le conditionnel"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:87,img:IMG.a,t:"Les phrases impérative et négative",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Donner un ordre, dire non"},{t:"La phrase impérative"},{t:"La phrase négative avec ne … pas"},{t:"Les autres négations"},{t:"La négation aux temps composés"},{t:"Pas de, pas d’ : article et négation"},{t:"La phrase impérative négative et la langue orale"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:88,img:IMG.a,t:"La distinction entre peu, peut et peux",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Trois mots, une seule prononciation"},{t:"L’adverbe « peu »"},{t:"Le verbe pouvoir : peux et peut"},{t:"Les astuces pour ne plus se tromper"},{t:"Peut-être et peut être"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:89,img:IMG.a,t:"La distinction entre leur et leurs",k:"Cours",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Deux mots, deux emplois"},{t:"Leur, pronom personnel : toujours sans « s »"},{t:"Leur et leurs, déterminants possessifs"},{t:"Les phrases pièges"},{t:"Le leur, la leur, les leurs"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:90,img:IMG.a,t:"La distinction entre quel, quelle, quels et quelles",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Quatre formes pour un même mot"},{t:"Quel dans une question"},{t:"Quel dans une exclamation"},{t:"Quelle ou qu’elle ?"},{t:"Quels, quelles ou qu’elles ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:91,img:IMG.a,t:"La majuscule",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"À quoi servent les majuscules ?"},{t:"La majuscule en début de phrase"},{t:"Les noms propres"},{t:"Majuscule ou minuscule ?"},{t:"Les titres, les lettres et les adresses"},{t:"Les majuscules accentuées"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:92,img:IMG.a,t:"Les signes orthographiques",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"À quoi servent les signes orthographiques ?"},{t:"Les accents"},{t:"Le tréma et la cédille"},{t:"L’apostrophe et l’élision"},{t:"Le trait d’union"},{t:"Quand l’accent change le sens du mot"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:93,img:IMG.a,t:"L’orthographe des nombres en lettres",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Pourquoi écrire les nombres en lettres ?"},{t:"De 21 à 69"},{t:"De 70 à 99"},{t:"Vingt et cent : quand prennent-ils un s ?"},{t:"Mille, million et milliard"},{t:"Les nombres ordinaux"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:94,img:IMG.a,t:"Les mots de la même famille",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une famille de mots ?"},{t:"Trouver les mots d’une famille"},{t:"Attention aux intrus"},{t:"La famille de mots aide à écrire la lettre finale"},{t:"Famille de mots ou champ lexical ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:95,img:IMG.a,t:"Les valeurs de l’imparfait et du passé composé",k:"Cours",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Deux temps pour raconter"},{t:"Les valeurs de l’imparfait"},{t:"Les valeurs du passé composé"},{t:"Imparfait et passé composé dans un récit"},{t:"Comment choisir le bon temps ?"},{t:"Réécrire un texte au passé"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:96,img:IMG.a,t:"La concordance des temps",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Qu’est-ce que la concordance des temps ?"},{t:"Quand la principale est au présent ou au futur"},{t:"Quand la principale est au passé"},{t:"La concordance dans l’hypothèse (si)"},{t:"Du discours direct au discours indirect"},{t:"La concordance et le subjonctif"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:97,img:IMG.a,t:"Les subordonnées circonstancielles de cause et de conséquence",k:"Cours",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"La cause et la conséquence"},{t:"La proposition subordonnée circonstancielle"},{t:"La subordonnée circonstancielle de cause"},{t:"La subordonnée circonstancielle de conséquence"},{t:"Distinguer la cause et la conséquence"},{t:"D’autres moyens d’exprimer la cause et la conséquence"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:98,img:IMG.a,t:"L’émetteur et le message d’un discours",k:"Cours",n:"6e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Situation : écouter une annonce"},{t:"Les éléments de la communication"},{t:"Identifier l’émetteur"},{t:"Retrouver le message"},{t:"Bien écouter un discours"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:99,img:IMG.a,t:"Le respect des signes de ponctuation",k:"Cours",n:"6e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Situation : lire à voix haute"},{t:"Les pauses et les signes de ponctuation"},{t:"L’intonation"},{t:"Le rythme et le débit"},{t:"S’entraîner à lire"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:100,img:IMG.a,t:"Le respect du groupe de souffle",k:"Cours",n:"6e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Situation : lire sans s’essouffler"},{t:"Repérer les groupes de souffle"},{t:"Bien respirer pour bien lire"},{t:"Les erreurs à éviter"},{t:"S’entraîner"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:101,img:IMG.a,t:"Le respect de la diction",k:"Cours",n:"6e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Situation : se faire comprendre"},{t:"Bien articuler"},{t:"Prononcer les sons difficiles"},{t:"Les liaisons"},{t:"Le volume et le débit"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:102,img:IMG.a,t:"Le type de discours",k:"Cours",n:"6e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Situation : plusieurs façons de parler"},{t:"Le discours narratif"},{t:"Le discours descriptif"},{t:"Le discours explicatif et le discours injonctif"},{t:"Le discours argumentatif"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:103,img:IMG.a,t:"Le schéma narratif",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : raconter une histoire"},{t:"Les cinq étapes du récit"},{t:"Les marques de chaque étape"},{t:"Repérer le schéma dans un texte"},{t:"Résumer un récit avec le schéma"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:104,img:IMG.a,t:"Les genres littéraires",k:"Cours",n:"5e",m:"Littérature",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un genre littéraire ?"},{t:"Le récit : conte, fable, nouvelle, roman"},{t:"La poésie"},{t:"Le théâtre"},{t:"Reconnaître le genre d’un texte"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:105,img:IMG.a,t:"Le texte descriptif",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : faire voir par les mots"},{t:"Organiser une description"},{t:"Le vocabulaire de la description"},{t:"Les indicateurs de lieu et les temps"},{t:"Décrire une personne"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:106,img:IMG.a,t:"La lettre personnelle et la lettre formelle",k:"Cours",n:"5e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : écrire une lettre"},{t:"Les parties d’une lettre"},{t:"La lettre personnelle"},{t:"La lettre formelle"},{t:"Bien présenter sa lettre"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:107,img:IMG.a,t:"Le texte argumentatif",k:"Cours",n:"4e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : défendre une opinion"},{t:"La thèse et la thèse adverse"},{t:"Les arguments et les exemples"},{t:"Les connecteurs logiques"},{t:"Le plan d’un texte argumentatif"},{t:"Prendre en compte l’avis adverse"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:108,img:IMG.a,t:"Les composantes d’une image",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : lire une image"},{t:"Le sujet, le titre et la légende"},{t:"Les plans et le cadrage"},{t:"Les plans de l’image : premier plan et arrière-plan"},{t:"Les couleurs, la lumière et les formes"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:109,img:IMG.a,t:"Le message de l’image",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : que veut dire cette image ?"},{t:"Décrire d’abord, interpréter ensuite"},{t:"Les messages que l’on rencontre"},{t:"Les indices qui mènent au message"},{t:"Exprimer le message à l’écrit"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:110,img:IMG.a,t:"Les caractéristiques du texte narratif",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : raconter une histoire"},{t:"Les éléments d’un récit"},{t:"Les personnages et le narrateur"},{t:"Les temps et les marques du récit"},{t:"Le plan du récit"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:111,img:IMG.a,t:"L’introduction",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : bien commencer sa rédaction"},{t:"Les trois rôles de l’introduction"},{t:"Les erreurs à éviter"},{t:"Les mots pour introduire"},{t:"Rédiger une introduction pas à pas"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:112,img:IMG.a,t:"Le développement",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : le cœur de la rédaction"},{t:"Un paragraphe, une idée"},{t:"Les connecteurs : relier les idées"},{t:"Organiser le développement"},{t:"Soigner son développement"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:113,img:IMG.a,t:"La conclusion",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : bien terminer"},{t:"Les rôles de la conclusion"},{t:"Les erreurs à éviter"},{t:"Les mots de la conclusion"},{t:"Rédiger une conclusion pas à pas"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:114,img:IMG.a,t:"Les règles de présentation d’un dialogue",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : faire parler des personnages"},{t:"Les signes du dialogue"},{t:"Les verbes de parole et la ponctuation"},{t:"Écrire un dialogue dans un récit"},{t:"Écrire un dialogue de théâtre"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:115,img:IMG.a,t:"Le texte poétique",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : quand les mots chantent"},{t:"Les vers et les strophes"},{t:"Les rimes"},{t:"Les images et les procédés poétiques"},{t:"Lire et dire un poème"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:116,img:IMG.a,t:"La forme affirmative et la forme négative",k:"Cours",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Situation : dire oui ou dire non"},{t:"Construire la forme négative"},{t:"Les autres mots de la négation"},{t:"Passer de la forme affirmative à la forme négative"},{t:"Les emplois de la forme négative"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:117,img:IMG.a,t:"Les niveaux de langue",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Situation : parler comme il faut, là où il faut"},{t:"Le niveau familier"},{t:"Le niveau courant"},{t:"Le niveau soutenu"},{t:"Choisir le bon niveau"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:118,img:IMG.a,t:"La présentation de l’auteur",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : qui a écrit ce livre ?"},{t:"La biographie"},{t:"La bibliographie"},{t:"Où trouver les informations ?"},{t:"Rédiger la présentation de l’auteur"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:119,img:IMG.a,t:"La présentation de l’œuvre",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : faire connaître un livre"},{t:"Lire la couverture et les premières pages"},{t:"Le genre de l’œuvre"},{t:"La situation de l’œuvre"},{t:"Rédiger la fiche de présentation"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:120,img:IMG.a,t:"Le résumé de l’œuvre",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : raconter en peu de mots"},{t:"Trouver l’essentiel"},{t:"Les temps et les mots du résumé"},{t:"La longueur et la forme"},{t:"Rédiger un résumé pas à pas"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:121,img:IMG.a,t:"L’étude des personnages",k:"Cours",n:"6e",m:"Lecture",pr:25,r:4.8,s:[{t:"Situation : qui sont-ils vraiment ?"},{t:"Personnages principaux et secondaires"},{t:"Le portrait physique"},{t:"Le portrait moral"},{t:"Rédiger le portrait d’un personnage"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:122,img:IMG.a,t:"La rédaction d’un paragraphe descriptif à partir d’une image",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : décrire ce que l’on voit"},{t:"Observer l’image"},{t:"Organiser la description"},{t:"Enrichir la description"},{t:"Rédiger le paragraphe"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:123,img:IMG.a,t:"La rédaction d’un dialogue à partir d’une image",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : faire parler une image"},{t:"Observer et imaginer"},{t:"Écrire des répliques adaptées"},{t:"Présenter le dialogue"},{t:"Rédiger le dialogue complet"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:124,img:IMG.a,t:"La rédaction d’un paragraphe narratif",k:"Cours",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : raconter ce qui s’est passé"},{t:"Préparer son récit"},{t:"Les temps du récit"},{t:"Les connecteurs temporels"},{t:"Rédiger le paragraphe narratif"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:125,img:IMG.a,t:"La présentation des composants de l’ordinateur",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Situation : découvrir l’ordinateur"},{t:"L’unité centrale et ses éléments"},{t:"L’écran, le clavier et la souris"},{t:"Le système et les logiciels"},{t:"Employer le vocabulaire"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:126,img:IMG.a,t:"Les périphériques de l’ordinateur",k:"Cours",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Situation : brancher ce qui entoure l’ordinateur"},{t:"Les périphériques d’entrée"},{t:"Les périphériques de sortie"},{t:"Les périphériques de stockage"},{t:"Brancher et utiliser"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:127,img:IMG.a,t:"Le pluriel des noms",k:"Cours",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Situation : un seul ou plusieurs ?"},{t:"La règle générale : le -s"},{t:"Les noms terminés par -s, -x, -z"},{t:"Les noms en -au, -eau, -eu : le -x"},{t:"Les noms en -al, -ail et -ou"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:128,img:IMG.e,t:"Le groupe verbal : verbe et adjectif qualificatif attribut du sujet",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Le groupe verbal : verbe + adjectif attribut du sujet"},{t:"Le verbe d’état"},{t:"L’adjectif qualificatif attribut du sujet"},{t:"L’accord de l’attribut"},{t:"Attribut ou épithète ?"},{t:"Ne pas confondre l’attribut avec les autres compléments"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:129,img:IMG.h,t:"Le sens figuré des mots",k:"Cours",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel : sens propre et sens figuré"},{t:"Comment naît le sens figuré ?"},{t:"Reconnaître un mot au sens figuré"},{t:"Les expressions figurées"},{t:"Le sens figuré pour mieux écrire"},{t:"Le sens figuré dans le dictionnaire"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:130,img:IMG.a,t:"La méthodologie de la rédaction",k:"Cours",n:"5e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Pourquoi suivre une méthode ?"},{t:"Le travail préliminaire"},{t:"La rédaction de l’introduction"},{t:"La rédaction du développement"},{t:"La rédaction de la conclusion"},{t:"Un exemple complet"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:131,img:IMG.b,t:"Le travail préliminaire",k:"Cours",n:"5e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : avant d’écrire"},{t:"Les étapes du travail préliminaire"},{t:"Analyser le sujet (1) : le type de texte"},{t:"Analyser le sujet (2) : mots importants et contraintes"},{t:"Chercher des idées"},{t:"Trier et organiser les idées"},{t:"Faire le plan"},{t:"Le brouillon et la gestion du temps"},{t:"Les erreurs à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:132,img:IMG.c,t:"La rédaction de l’introduction",k:"Cours",n:"5e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : bien commencer sa rédaction"},{t:"Les trois rôles de l’introduction"},{t:"Trouver une accroche"},{t:"Présenter le sujet"},{t:"Annoncer le plan"},{t:"Les mots et les tournures pour introduire"},{t:"Les erreurs à éviter"},{t:"Rédiger une introduction pas à pas"},{t:"Améliorer une introduction"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:133,img:IMG.d,t:"La rédaction du développement",k:"Cours",n:"5e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : le cœur de la rédaction"},{t:"Le paragraphe"},{t:"Un paragraphe, une idée"},{t:"Passer du plan au développement"},{t:"Les connecteurs : relier les idées"},{t:"Développer une idée"},{t:"Le développement selon le type de texte"},{t:"Soigner la langue"},{t:"Les erreurs à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:134,img:IMG.e,t:"La rédaction de la conclusion",k:"Cours",n:"5e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Situation : bien terminer sa rédaction"},{t:"Les deux rôles de la conclusion"},{t:"Faire le bilan"},{t:"L’ouverture"},{t:"Les mots de la conclusion"},{t:"La conclusion selon le type de texte"},{t:"Les erreurs à éviter"},{t:"Rédiger une conclusion pas à pas"},{t:"Lien entre introduction et conclusion"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:135,img:IMG.f,t:"Les éléments de la communication orale",k:"Cours",n:"5e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Situation : un message qui passe… ou pas"},{t:"Les six éléments de la communication"},{t:"L’émetteur et le récepteur"},{t:"Le message et l’intention"},{t:"Le canal et le code"},{t:"Le contexte"},{t:"Les obstacles et le feed-back"},{t:"L’écoute d’un message oral"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:136,img:IMG.g,t:"Le discours indirect libre",k:"Cours",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Situation : rapporter des paroles sans le dire"},{t:"Rappel : discours direct et discours indirect"},{t:"Qu’est-ce que le discours indirect libre ?"},{t:"Comment le reconnaître ?"},{t:"Comparer les trois discours"},{t:"Transformer une phrase en discours indirect libre"},{t:"Pourquoi utiliser le discours indirect libre ?"},{t:"Les pièges à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:137,img:IMG.c,t:"Les caractéristiques du texte descriptif : le portrait physique",k:"Cours",n:"5e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un portrait physique ?"},{t:"Les caractéristiques du texte descriptif"},{t:"L’organisation du portrait physique"},{t:"Le vocabulaire du portrait physique"},{t:"Les procédés d’écriture du portrait"},{t:"Portrait objectif et portrait subjectif"},{t:"Rédiger un portrait physique"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:138,img:IMG.d,t:"Les caractéristiques du texte descriptif : le portrait moral",k:"Cours",n:"5e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un portrait moral ?"},{t:"Les caractéristiques du texte descriptif dans le portrait moral"},{t:"Comment révéler le caractère ?"},{t:"Le vocabulaire du portrait moral"},{t:"Les procédés d’écriture du portrait moral"},{t:"L’organisation du portrait moral"},{t:"Du portrait physique au portrait moral"},{t:"Rédiger un portrait moral"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:139,img:IMG.f,t:"Le pluriel des noms composés : nom + nom",k:"Cours",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un nom composé ?"},{t:"La règle : deux cas à distinguer"},{t:"Le test pour décider"},{t:"Les pièges à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:140,img:IMG.g,t:"Les valeurs du mode subjonctif",k:"Cours",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Le mode subjonctif"},{t:"La formation du subjonctif présent"},{t:"Les valeurs du subjonctif"},{t:"Subjonctif ou indicatif ?"},{t:"Le subjonctif passé"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:141,img:IMG.b,t:"L’identification des indices de sens d’un texte",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Lire pour comprendre : le texte support"},{t:"Les supports iconographiques"},{t:"Les indices textuels"},{t:"Le thème"},{t:"Le contexte"},{t:"Le type de texte"},{t:"Les idées principales et secondaires"},{t:"Les personnages et les événements"},{t:"L’enchaînement des événements et des idées"},{t:"La reformulation"},{t:"Le message du texte"},{t:"La synthèse : comprendre le texte dans son ensemble"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:142,img:IMG.a,t:"Les participes présents et les adjectifs verbaux",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Participe présent ou adjectif verbal ?"},{t:"La formation du participe présent"},{t:"Comment les distinguer ?"},{t:"Les graphies particulières"},{t:"L’accord et les cas particuliers"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:143,img:IMG.g,t:"L’expression de la circonstance de temps",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la circonstance de temps ?"},{t:"Les compléments circonstanciels de temps"},{t:"Les prépositions et les mots de temps"},{t:"La proposition subordonnée de temps"},{t:"Le mode et les temps du verbe"},{t:"Transformer une expression du temps"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:144,img:IMG.c,t:"L’expression de la circonstance de lieu",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la circonstance de lieu ?"},{t:"Les compléments circonstanciels de lieu"},{t:"La subordonnée circonstancielle de lieu"},{t:"Ne pas confondre avec une relative"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:145,img:IMG.d,t:"L’expression de la circonstance de but",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la circonstance de but ?"},{t:"Les compléments circonstanciels de but"},{t:"La subordonnée de but et le subjonctif"},{t:"But ou conséquence ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:146,img:IMG.e,t:"L’expression de la circonstance de condition",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la circonstance de condition ?"},{t:"Les trois systèmes avec « si »"},{t:"Les conjonctions et les prépositions de condition"},{t:"Reformuler une condition"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:147,img:IMG.f,t:"L’expression de la circonstance d’opposition",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la circonstance d’opposition ?"},{t:"Les moyens d’exprimer l’opposition"},{t:"La subordonnée d’opposition et le mode"},{t:"Quoique ou quoi que ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:148,img:IMG.g,t:"L’expression de la circonstance de moyen et de manière",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Moyen et manière : de quoi s’agit-il ?"},{t:"Les compléments de moyen"},{t:"Les compléments de manière"},{t:"Les subordonnées et le mode"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:149,img:IMG.h,t:"Les valeurs modales du conditionnel",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Le conditionnel : un mode aux plusieurs valeurs"},{t:"La formation du conditionnel"},{t:"Les valeurs du conditionnel"},{t:"Conditionnel et concordance"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:150,img:IMG.b,t:"Le gérondif",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Qu’est-ce que le gérondif ?"},{t:"La formation et la différence avec le participe présent"},{t:"Les valeurs du gérondif"},{t:"La règle du sujet"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:151,img:IMG.a,t:"L’accord du participe passé des verbes pronominaux",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un verbe pronominal ?"},{t:"Les essentiellement pronominaux et le sens passif"},{t:"Le sens réfléchi et le sens réciproque"},{t:"Quand le COD est placé après ou avant"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:152,img:IMG.c,t:"La prise de notes",k:"Cours",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Pourquoi prendre des notes ?"},{t:"Repérer l’essentiel"},{t:"Abréger et utiliser des symboles"},{t:"Organiser ses notes"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:153,img:IMG.d,t:"Les homophones : quand, quant, qu’en ; plus tôt, plutôt",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Des mots qui se prononcent de la même façon"},{t:"Les tests"},{t:"Plus tôt ou plutôt ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:154,img:IMG.a,t:"Les degrés de qualification",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que les degrés de qualification ?"},{t:"Les degrés relatifs"},{t:"Les degrés absolus et les formes particulières"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:155,img:IMG.b,t:"La comparaison, la métaphore et la personnification",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Les figures d’analogie"},{t:"La comparaison"},{t:"La métaphore"},{t:"La personnification"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:156,img:IMG.c,t:"L’hyperbole et la métonymie",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Deux figures de style"},{t:"L’hyperbole"},{t:"La métonymie"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:157,img:IMG.d,t:"La transformation de la phrase : affirmative, négative, interrogative, exclamative",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Les formes de phrase"},{t:"De l’affirmative à la négative"},{t:"La phrase interrogative"},{t:"La phrase exclamative"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:158,img:IMG.e,t:"Les transformations verbales : transitive, intransitive, pronominale et impersonnelle",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Un même verbe, plusieurs constructions"},{t:"La transformation transitive et intransitive"},{t:"La transformation pronominale"},{t:"La transformation impersonnelle"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:159,img:IMG.f,t:"Les transformations active et passive",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"La voix active et la voix passive"},{t:"Du verbe actif au verbe passif"},{t:"Les limites et l’intérêt du passif"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:160,img:IMG.g,t:"Les valeurs modales de l’impératif et de l’infinitif",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Impératif et infinitif : deux modes"},{t:"Les valeurs de l’impératif"},{t:"Les valeurs de l’infinitif"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:161,img:IMG.h,t:"Les valeurs modales du participe",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Le participe : un mode non personnel"},{t:"Le participe présent et le participe passé"},{t:"Le participe apposé et la proposition participiale"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:162,img:IMG.a,t:"Les valeurs temporelles du présent et de l’imparfait",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Le temps et sa valeur"},{t:"Les valeurs du présent"},{t:"Les valeurs de l’imparfait"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:163,img:IMG.b,t:"Les valeurs du passé simple et du futur simple",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Deux temps de l’indicatif"},{t:"Le passé simple"},{t:"Le futur simple"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:164,img:IMG.c,t:"Les homophones : sans, s’en, c’en ; ni, n’y, nie",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Des mots qui se prononcent pareil"},{t:"Ni, n’y, nie"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:165,img:IMG.d,t:"Les homophones : davantage / d’avantages, aussitôt / aussi tôt, parce que / par ce que",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Trois couples d’homophones"},{t:"Aussitôt ou aussi tôt ?"},{t:"Parce que ou par ce que ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:166,img:IMG.e,t:"L’accord du participe passé employé avec avoir suivi d’un infinitif",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Le problème posé"},{t:"La règle de l’accord"},{t:"Les cas particuliers"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:167,img:IMG.f,t:"L’accord du participe passé à la voix passive",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Le participe passé à la voix passive"},{t:"Les différents temps"},{t:"Passif ou attribut ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:168,img:IMG.a,t:"Le genre romanesque",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Qu’est-ce que le roman ?"},{t:"Les éléments du roman"},{t:"Le schéma narratif et les sous-genres"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:169,img:IMG.b,t:"Le genre dramatique",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Qu’est-ce que le théâtre ?"},{t:"La structure d’une pièce"},{t:"Les genres du théâtre"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:170,img:IMG.c,t:"Le genre poétique",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Qu’est-ce que la poésie ?"},{t:"Vers, strophes et rimes"},{t:"La mesure des vers"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:171,img:IMG.a,t:"Le paragraphe argumentatif",k:"Cours",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Argumenter : pourquoi, comment ?"},{t:"La structure du paragraphe"},{t:"Les connecteurs logiques"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:172,img:IMG.b,t:"La production d’une lettre privée",k:"Cours",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une lettre privée ?"},{t:"La présentation de la lettre"},{t:"Le contenu et le ton"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:173,img:IMG.a,t:"Les champs lexicaux et les champs sémantiques",k:"Cours",n:"3e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Deux notions à ne pas confondre"},{t:"Le champ lexical"},{t:"Le champ sémantique"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:174,img:IMG.a,t:"L’expression de la circonstance de cause",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la circonstance de cause ?"},{t:"Les compléments de cause"},{t:"Parce que, puisque, comme, car"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:175,img:IMG.b,t:"L’expression de la circonstance de conséquence",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Qu’est-ce que la conséquence ?"},{t:"Les mots de la conséquence"},{t:"Les corrélations d’intensité"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:176,img:IMG.c,t:"Les valeurs modales du subjonctif",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Le subjonctif : un mode pour exprimer…"},{t:"La formation du subjonctif présent"},{t:"Les valeurs du subjonctif"},{t:"Subjonctif ou indicatif ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:177,img:IMG.d,t:"La concordance des temps : la subordonnée au subjonctif",k:"Cours",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"La concordance avec le subjonctif"},{t:"Principale au présent ou au futur"},{t:"Principale au passé"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:178,img:IMG.e,t:"Les valeurs du passé composé et du plus-que-parfait",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Deux temps composés"},{t:"Les valeurs du passé composé"},{t:"Les valeurs du plus-que-parfait"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:179,img:IMG.f,t:"Le futur antérieur",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Un temps composé du futur"},{t:"Les valeurs du futur antérieur"},{t:"L’accord et le passé antérieur"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:180,img:IMG.a,t:"Les homophones : peu, peux, peut",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Trois mots, un seul son"},{t:"Peux ou peut ?"},{t:"Peut-être ou peut être ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:181,img:IMG.b,t:"Les homophones : quel, quelle, qu’elle ; quelque(s), quelle(s) que",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Quel, quelle, qu’elle"},{t:"Quel que ou quelque ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:182,img:IMG.c,t:"Les homophones : si, s’, y ; près, prêt",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Si, s’, y"},{t:"Les tests"},{t:"Près ou prêt ?"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:183,img:IMG.d,t:"Le vocabulaire fondamental : l’environnement",k:"Cours",n:"3e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Parler de l’environnement"},{t:"Les mots essentiels"},{t:"Les verbes et les expressions"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:184,img:IMG.e,t:"Le vocabulaire fondamental : le sport",k:"Cours",n:"3e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Parler du thème"},{t:"Les mots essentiels"},{t:"Les verbes et les expressions"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:185,img:IMG.f,t:"Le vocabulaire fondamental : le transport",k:"Cours",n:"3e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Parler du thème"},{t:"Les mots essentiels"},{t:"Les verbes et les expressions"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:186,img:IMG.g,t:"Le vocabulaire fondamental : les loisirs",k:"Cours",n:"3e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Parler du thème"},{t:"Les mots essentiels"},{t:"Les verbes et les expressions"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:187,img:IMG.h,t:"Le vocabulaire fondamental : la pollution",k:"Cours",n:"3e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Parler du thème"},{t:"Les mots essentiels"},{t:"Les verbes et les expressions"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:188,img:IMG.a,t:"L’identification des indices de sens d’un support iconographique",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Lire une image"},{t:"Les indices de sens"},{t:"La méthode : observer, décrire, interpréter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:189,img:IMG.b,t:"L’étude d’une œuvre : présentation, auteur, titre et structure",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Aborder une œuvre intégrale"},{t:"Présenter l’œuvre : auteur et titre"},{t:"La structure de l’œuvre"},{t:"Application : Le cri de la forêt"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:190,img:IMG.c,t:"La reformulation d’un texte",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Reformuler : redire autrement"},{t:"Comprendre avant de reformuler"},{t:"Les techniques de reformulation"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:191,img:IMG.d,t:"L’image : plans, angle de prise de vue, symboles et couleurs",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Comment une image fabrique du sens"},{t:"Les plans et les angles"},{t:"Les couleurs et les symboles"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:192,img:IMG.a,t:"La production d’un texte narratif : introduction, développement et conclusion",k:"Cours",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Raconter une histoire"},{t:"L’introduction et le développement"},{t:"Les temps et les connecteurs"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:193,img:IMG.b,t:"La clarification d’une valeur",k:"Cours",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’une valeur ?"},{t:"La méthode"},{t:"Quelques valeurs à clarifier"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:194,img:IMG.a,t:"Les homophones : quoique, quoi que",k:"Cours",n:"3e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Deux écritures, deux sens"},{t:"Quoique : l’opposition"},{t:"Quoi que : toute chose que"},{t:"Les pièges à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:195,img:IMG.f,t:"La concordance des temps : l’axe de temps",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Situer les actions dans le temps"},{t:"Les trois relations entre deux actions"},{t:"Le temps de la principale décide"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:196,img:IMG.f,t:"La concordance des temps : l’antériorité",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"L’action qui a eu lieu avant"},{t:"Le tableau des temps"},{t:"Avec le subjonctif"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:197,img:IMG.f,t:"La concordance des temps : la simultanéité",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Deux actions en même temps"},{t:"Le tableau des temps"},{t:"Les cas particuliers"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:198,img:IMG.f,t:"La concordance des temps : la postériorité",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"L’action qui aura lieu après"},{t:"Le tableau des temps"},{t:"Le piège du futur"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:199,img:IMG.f,t:"La concordance des temps : temps simples et temps composés de l’indicatif",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Le temps simple et son temps composé"},{t:"Les couples de temps"},{t:"Les temps dans la phrase"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:200,img:IMG.f,t:"Les formes verbales : les formes affirmative et négative",k:"Cours",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Dire oui ou dire non"},{t:"Les termes de négation"},{t:"La place de la négation"},{t:"Passer de l’affirmative à la négative"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:201,img:IMG.a,t:"L’identification des indices de sens d’un discours expressif",k:"Cours",n:"3e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Écouter pour comprendre"},{t:"Les indices de sens"},{t:"Les intentions de communication"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:202,img:IMG.a,t:"Le respect des règles de la prosodie : les signes de ponctuation",k:"Cours",n:"3e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Lire à haute voix"},{t:"Chaque signe, une lecture"},{t:"Dialogues et citations"},{t:"Les erreurs à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:203,img:IMG.a,t:"Le respect des règles de la prosodie : les groupes de souffle",k:"Cours",n:"3e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Respirer au bon endroit"},{t:"Où faire une pause ?"},{t:"Où ne jamais couper"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:204,img:IMG.a,t:"Le respect des règles de la prosodie : les intonations",k:"Cours",n:"3e",m:"Expression orale",pr:25,r:4.8,s:[{t:"La mélodie de la voix"},{t:"Les trois mouvements"},{t:"Intonation et sentiments"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:205,img:IMG.a,t:"Le respect des règles de la prosodie : la modulation de la voix",k:"Cours",n:"3e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Faire vivre le texte"},{t:"Les éléments de la voix"},{t:"Adapter sa voix au texte"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:206,img:IMG.a,t:"L’emploi de la gestuelle et des mimes",k:"Cours",n:"3e",m:"Expression orale",pr:25,r:4.8,s:[{t:"Parler avec tout son corps"},{t:"Le langage du corps"},{t:"Les règles d’un bon geste"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:207,img:IMG.b,t:"La production d’un poème : vers, strophe, mesure, refrain et métrique",k:"Cours",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Écrire un poème"},{t:"La mesure des vers"},{t:"Les rimes"},{t:"Écrire son poème"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:208,img:IMG.b,t:"L’argumentation d’un point de vue : position, arguments et exemples",k:"Cours",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Défendre une opinion"},{t:"Prendre position"},{t:"Trouver et organiser des arguments"},{t:"Un exemple complet"},{t:"À retenir"}]},
 {id:209,img:IMG.b,t:"Le débat : thème, situation et problème",k:"Cours",n:"3e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Qu’est-ce qu’un débat ?"},{t:"Thème, situation et problème"},{t:"Les rôles dans un débat"},{t:"Les règles du débat"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:210,img:IMG.d,t:"L’identification des indices de sens : personnages, événements et enchaînement des événements",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Comprendre un récit"},{t:"Repérer les personnages"},{t:"Relever les événements"},{t:"L’enchaînement des événements"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:211,img:IMG.d,t:"L’étude d’une œuvre : les personnages",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Qui sont-ils ?"},{t:"Faire le portrait d’un personnage"},{t:"Comment connaît-on un personnage ?"},{t:"L’évolution du personnage"},{t:"Application : les personnages du Cri de la forêt"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:212,img:IMG.d,t:"L’étude d’une œuvre : l’étude de quelques thèmes",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"De quoi parle l’œuvre ?"},{t:"Repérer les thèmes"},{t:"Quelques thèmes fréquents"},{t:"Application : les thèmes du Cri de la forêt"},{t:"Justifier un thème"},{t:"À retenir"}]},
 {id:213,img:IMG.d,t:"L’étude d’une œuvre : l’analyse et la synthèse",k:"Cours",n:"3e",m:"Lecture",pr:25,r:4.8,s:[{t:"Analyser puis résumer"},{t:"L’analyse : les questions à se poser"},{t:"La fiche de lecture"},{t:"Application : synthèse du Cri de la forêt"},{t:"Rédiger la synthèse"},{t:"À retenir"}]},
 {id:10001,fn:1,img:IMG.e,t:"Le groupe verbal : verbe + cc",k:"Fiches",n:"5e",m:"Grammaire",pr:25,r:4.8},
 {id:10002,fn:2,img:IMG.a,t:"Fiche modèle n° 1 (test)",k:"Fiches",n:"3e",m:"Grammaire",pr:25,r:4.8},
 {id:10003,fn:3,img:IMG.b,t:"Fiche modèle n° 2 (test)",k:"Fiches",n:"3e",m:"Grammaire",pr:25,r:4.8},
 {id:10004,fn:4,img:IMG.c,t:"Fiche modèle n° 3 (test)",k:"Fiches",n:"3e",m:"Grammaire",pr:25,r:4.8},
 {id:10005,fn:5,img:IMG.d,t:"Fiche modèle n° 4 (test)",k:"Fiches",n:"3e",m:"Grammaire",pr:25,r:4.8},
 {id:10006,fn:6,img:IMG.e,t:"Fiche modèle n° 5 (test)",k:"Fiches",n:"3e",m:"Conjugaison",pr:25,r:4.8},
 {id:10007,fn:7,img:IMG.f,t:"Fiche modèle n° 6 (test)",k:"Fiches",n:"3e",m:"Conjugaison",pr:25,r:4.8},
 {id:10008,fn:8,img:IMG.g,t:"Fiche modèle n° 7 (test)",k:"Fiches",n:"3e",m:"Orthographe",pr:25,r:4.8},
 {id:10009,fn:9,img:IMG.h,t:"Fiche modèle n° 8 (test)",k:"Fiches",n:"3e",m:"Orthographe",pr:25,r:4.8},
 {id:10010,fn:10,img:IMG.a,t:"Fiche modèle n° 9 (test)",k:"Fiches",n:"3e",m:"Vocabulaire",pr:25,r:4.8},
 {id:10011,fn:11,img:IMG.b,t:"Fiche modèle n° 10 (test)",k:"Fiches",n:"3e",m:"Vocabulaire",pr:25,r:4.8},
 {id:10012,fn:12,img:IMG.e,t:"L’expression de la circonstance de temps",k:"Fiches",n:"3e",m:"Grammaire",pr:25,r:4.8},
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
 {id:30022,ex:22,img:IMG.a,t:"Les conjonctions : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30023,ex:23,img:IMG.b,t:"La phrase simple : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30024,ex:24,img:IMG.d,t:"Les groupes de verbes : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30025,ex:25,img:IMG.f,t:"Les voix active et passive : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30026,ex:26,img:IMG.g,t:"La suffixation : exercices",k:"Exercices",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30027,ex:27,img:IMG.h,t:"Les présentatifs : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30028,ex:28,img:IMG.e,t:"La phrase et ses constituants : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30029,ex:29,img:IMG.f,t:"Le groupe verbal : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30030,ex:30,img:IMG.b,t:"Les types de phrases : exercices",k:"Exercices",n:"CM2",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30031,ex:31,img:IMG.a,t:"Les fonctions grammaticales : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30032,ex:32,img:IMG.d,t:"La nature et la fonction des mots : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30033,ex:33,img:IMG.e,t:"La phrase complexe : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30034,ex:34,img:IMG.d,t:"La proposition principale et la proposition subordonnée : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30035,ex:35,img:IMG.a,t:"La notion de verbe : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30036,ex:36,img:IMG.g,t:"Les degrés de qualification : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30037,ex:37,img:IMG.c,t:"Les modes personnels et impersonnels : exercices",k:"Exercices",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30038,ex:38,img:IMG.e,t:"Les temps simples : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30039,ex:39,img:IMG.f,t:"La conjugaison : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30040,ex:40,img:IMG.g,t:"Les termes génériques et spécifiques : exercices",k:"Exercices",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30041,ex:41,img:IMG.h,t:"La phrase déclarative : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30042,ex:42,img:IMG.a,t:"Les valeurs et l’emploi du présent : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30043,ex:43,img:IMG.b,t:"La phrase exclamative : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30044,ex:44,img:IMG.c,t:"L’analyse du sujet et la recherche des idées : exercices",k:"Exercices",n:"6e",m:"Expression écrite",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30045,ex:45,img:IMG.d,t:"Les champs lexicaux : exercices",k:"Exercices",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30046,ex:46,img:IMG.e,t:"Les champs sémantiques : exercices",k:"Exercices",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30047,ex:47,img:IMG.f,t:"La dérivation : exercices",k:"Exercices",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30048,ex:48,img:IMG.g,t:"Les temps composés : exercices",k:"Exercices",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30049,ex:49,img:IMG.h,t:"Le groupe nominal : déterminant, nom et complément du nom : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30050,ex:50,img:IMG.a,t:"Le groupe nominal : déterminant, nom et adjectif qualificatif : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30051,ex:51,img:IMG.b,t:"Le groupe verbal : verbe et complément circonstanciel : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30052,ex:52,img:IMG.c,t:"La conjonction : exercices",k:"Exercices",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30053,ex:53,img:IMG.f,t:"Les homophones grammaticaux : a / à, et / est, son / sont, on / ont, ou / où : exercices",k:"Exercices",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30054,ex:54,img:IMG.g,t:"Les terminaisons verbales en -é, -er, -ait, -ez : exercices",k:"Exercices",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30055,ex:55,img:IMG.h,t:"La majuscule : exercices",k:"Exercices",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30056,ex:56,img:IMG.a,t:"Le pluriel des noms : exercices",k:"Exercices",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30057,ex:57,img:IMG.b,t:"Les homophones ce / se, ces / ses : exercices",k:"Exercices",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30058,ex:58,img:IMG.c,t:"Les synonymes : exercices",k:"Exercices",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30059,ex:59,img:IMG.d,t:"Les antonymes : exercices",k:"Exercices",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30060,ex:60,img:IMG.e,t:"Les homonymes : exercices",k:"Exercices",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30061,ex:61,img:IMG.f,t:"Le passé simple : exercices",k:"Exercices",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30062,ex:62,img:IMG.g,t:"L’impératif présent : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30063,ex:63,img:IMG.h,t:"La phrase interrogative : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30064,ex:64,img:IMG.a,t:"Le futur proche et le passé récent : exercices",k:"Exercices",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30065,ex:65,img:IMG.b,t:"Le conditionnel présent : exercices",k:"Exercices",n:"4e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30066,ex:66,img:IMG.c,t:"La distinction entre peu, peut et peux : exercices",k:"Exercices",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30067,ex:67,img:IMG.d,t:"La distinction entre leur et leurs : exercices",k:"Exercices",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30068,ex:68,img:IMG.e,t:"La distinction entre quel, quelle, quels et quelles : exercices",k:"Exercices",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30069,ex:69,img:IMG.f,t:"Les verbes pronominaux : exercices",k:"Exercices",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30070,ex:70,img:IMG.g,t:"L’accord du verbe avec son sujet : exercices",k:"Exercices",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30071,ex:71,img:IMG.h,t:"L’accord du participe passé : exercices",k:"Exercices",n:"4e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:30072,ex:72,img:IMG.a,t:"La forme affirmative et la forme négative : exercices",k:"Exercices",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Rappel de cours"},{t:"Exercices d’échauffement"},{t:"Exercices d’approfondissement"},{t:"Exercices de synthèse"}]},
 {id:40001,ev:1,img:IMG.d,t:"Devoir n° 1 : Le groupe nominal",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40002,ev:2,img:IMG.e,t:"Devoir n° 2 : Le présent de l’indicatif",k:"Évaluations",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40003,ev:3,img:IMG.f,t:"Composition du 1er trimestre : La phrase complexe",k:"Évaluations",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40004,ev:4,img:IMG.a,t:"Devoir n° 4 : La phrase et ses constituants",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40005,ev:5,img:IMG.b,t:"Devoir n° 5 : Les compléments d’objet (COD et COI)",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40006,ev:6,img:IMG.c,t:"Devoir n° 6 : Les compléments circonstanciels",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40007,ev:7,img:IMG.d,t:"Devoir n° 7 : Les déterminants",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40008,ev:8,img:IMG.e,t:"Devoir n° 8 : Les pronoms",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40009,ev:9,img:IMG.f,t:"Devoir n° 9 : Les fonctions grammaticales",k:"Évaluations",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40010,ev:10,img:IMG.g,t:"Devoir n° 10 : Le sujet et ses différentes formes",k:"Évaluations",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40011,ev:11,img:IMG.h,t:"Devoir n° 11 : La proposition principale et la proposition subordonnée",k:"Évaluations",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40012,ev:12,img:IMG.a,t:"Devoir n° 12 : La proposition subordonnée relative",k:"Évaluations",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40013,ev:13,img:IMG.b,t:"Devoir n° 13 : La proposition subordonnée complétive",k:"Évaluations",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40014,ev:14,img:IMG.c,t:"Devoir n° 14 : Les groupes de verbes",k:"Évaluations",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40015,ev:15,img:IMG.d,t:"Devoir n° 15 : L’imparfait de l’indicatif",k:"Évaluations",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40016,ev:16,img:IMG.e,t:"Devoir n° 16 : Le futur simple",k:"Évaluations",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40017,ev:17,img:IMG.f,t:"Devoir n° 17 : Le passé composé",k:"Évaluations",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40018,ev:18,img:IMG.g,t:"Devoir n° 18 : Les valeurs et l’emploi du présent",k:"Évaluations",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40019,ev:19,img:IMG.h,t:"Devoir n° 19 : Les temps composés",k:"Évaluations",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40020,ev:20,img:IMG.a,t:"Devoir n° 20 : Le plus-que-parfait",k:"Évaluations",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40021,ev:21,img:IMG.b,t:"Devoir n° 21 : Les modes personnels et impersonnels",k:"Évaluations",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40022,ev:22,img:IMG.c,t:"Devoir n° 22 : Le passé antérieur",k:"Évaluations",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40023,ev:23,img:IMG.d,t:"Devoir n° 23 : Les valeurs modales de l’indicatif",k:"Évaluations",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40024,ev:24,img:IMG.a,t:"Devoir n° 24 : Les prépositions",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40025,ev:25,img:IMG.b,t:"Devoir n° 25 : Les conjonctions",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40026,ev:26,img:IMG.c,t:"Devoir n° 26 : Les présentatifs",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40027,ev:27,img:IMG.d,t:"Devoir n° 27 : L’adjectif qualificatif et ses fonctions",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40028,ev:28,img:IMG.e,t:"Devoir n° 28 : Le sens propre et le sens figuré",k:"Évaluations",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40029,ev:29,img:IMG.f,t:"Devoir n° 29 : Les homophones grammaticaux",k:"Évaluations",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40030,ev:30,img:IMG.g,t:"Devoir n° 30 : Les formes de phrases",k:"Évaluations",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40031,ev:31,img:IMG.h,t:"Devoir n° 31 : Les degrés de qualification",k:"Évaluations",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40032,ev:32,img:IMG.a,t:"Devoir n° 32 : L’accord de l’adjectif qualificatif",k:"Évaluations",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40033,ev:33,img:IMG.b,t:"Devoir n° 33 : Les voix active et passive",k:"Évaluations",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40034,ev:34,img:IMG.c,t:"Devoir n° 34 : La préfixation",k:"Évaluations",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40035,ev:35,img:IMG.d,t:"Devoir n° 35 : La suffixation",k:"Évaluations",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40036,ev:36,img:IMG.e,t:"Devoir n° 36 : L’accord du verbe avec son sujet",k:"Évaluations",n:"5e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40037,ev:37,img:IMG.f,t:"Devoir n° 37 : La proposition indépendante",k:"Évaluations",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40038,ev:38,img:IMG.g,t:"Devoir n° 38 : La coordination, la juxtaposition et la subordination",k:"Évaluations",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40039,ev:39,img:IMG.h,t:"Devoir n° 39 : Le discours direct et le discours indirect",k:"Évaluations",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40040,ev:40,img:IMG.a,t:"Devoir n° 40 : Les figures de style",k:"Évaluations",n:"4e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40041,ev:41,img:IMG.b,t:"Devoir n° 41 : L’accord du participe passé",k:"Évaluations",n:"4e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40042,ev:42,img:IMG.c,t:"Devoir n° 42 : Le discours direct, le discours indirect et le discours indirect libre",k:"Évaluations",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40043,ev:43,img:IMG.d,t:"Devoir n° 43 : Les formes interrogatives et interro-négatives",k:"Évaluations",n:"3e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40044,ev:44,img:IMG.a,t:"Devoir n° 44 : Les synonymes",k:"Évaluations",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40045,ev:45,img:IMG.b,t:"Devoir n° 45 : Les antonymes",k:"Évaluations",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40046,ev:46,img:IMG.c,t:"Devoir n° 46 : Les consonnes doubles",k:"Évaluations",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40047,ev:47,img:IMG.d,t:"Devoir n° 47 : La phrase exclamative",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40048,ev:48,img:IMG.e,t:"Devoir n° 48 : La phrase complexe",k:"Évaluations",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40049,ev:49,img:IMG.f,t:"Devoir n° 49 : Les verbes pronominaux",k:"Évaluations",n:"5e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40050,ev:50,img:IMG.g,t:"Devoir n° 50 : Les homonymes",k:"Évaluations",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40051,ev:51,img:IMG.h,t:"Devoir n° 51 : La composition",k:"Évaluations",n:"4e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40052,ev:52,img:IMG.a,t:"Devoir n° 52 : La proposition subordonnée relative",k:"Évaluations",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40053,ev:53,img:IMG.b,t:"Devoir n° 53 : La coordination, la juxtaposition et la subordination",k:"Évaluations",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40054,ev:54,img:IMG.c,t:"Devoir n° 54 : La phrase déclarative",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40055,ev:55,img:IMG.d,t:"Devoir n° 55 : La notion de verbe",k:"Évaluations",n:"6e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40056,ev:56,img:IMG.e,t:"Devoir n° 56 : Les temps simples",k:"Évaluations",n:"6e",m:"Conjugaison",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40057,ev:57,img:IMG.f,t:"Devoir n° 57 : Les termes génériques et spécifiques",k:"Évaluations",n:"6e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40058,ev:58,img:IMG.g,t:"Devoir n° 58 : Les terminaisons verbales en -é, -er, -ait, -ez",k:"Évaluations",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40059,ev:59,img:IMG.h,t:"Devoir n° 59 : Les homophones ce / se, ces / ses",k:"Évaluations",n:"6e",m:"Orthographe",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40060,ev:60,img:IMG.a,t:"Devoir n° 60 : Le groupe nominal (déterminant, nom et complément du nom)",k:"Évaluations",n:"5e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40061,ev:61,img:IMG.b,t:"Devoir n° 61 : La dérivation",k:"Évaluations",n:"5e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40062,ev:62,img:IMG.c,t:"Devoir n° 62 : Les champs sémantiques",k:"Évaluations",n:"4e",m:"Vocabulaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:40063,ev:63,img:IMG.d,t:"Devoir n° 63 : La proposition indépendante",k:"Évaluations",n:"3e",m:"Grammaire",pr:25,r:4.8,s:[{t:"Énoncé de l’évaluation"},{t:"Corrigé détaillé"},{t:"Barème et grille de correction"}]},
 {id:50001,pg:1,img:IMG.e,t:"Programme APS 6e · Répartition annuelle",k:"Programmes",n:"6e",m:"APS",pr:25,r:4.8,s:[{t:"Présentation"},{t:"Octobre"},{t:"Novembre"},{t:"Décembre"},{t:"Janvier"},{t:"Février"},{t:"Mars"},{t:"Avril"},{t:"Mai"},{t:"Juin"}]},
 {id:50002,pg:2,img:IMG.e,t:"Programme APS 6e · Guide pédagogique",k:"Programmes",n:"6e",m:"APS",pr:25,r:4.8,s:[{t:"Présentation du guide"}]},
 {id:50003,pg:3,img:IMG.e,t:"Programme APS 5e · Répartition annuelle",k:"Programmes",n:"5e",m:"APS",pr:25,r:4.8,s:[{t:"Présentation"},{t:"Octobre"},{t:"Novembre"},{t:"Décembre"},{t:"Janvier"},{t:"Février"},{t:"Mars"},{t:"Avril"},{t:"Mai"},{t:"Juin"}]},
 {id:50004,pg:4,img:IMG.e,t:"Programme APS 5e · Guide pédagogique",k:"Programmes",n:"5e",m:"APS",pr:25,r:4.8,s:[{t:"Présentation du guide"}]},
 {id:50005,pg:5,img:IMG.e,t:"Programme PPO 4e · Répartition annuelle",k:"Programmes",n:"4e",m:"PPO",pr:25,r:4.8,s:[{t:"Présentation"},{t:"Octobre"},{t:"Novembre"},{t:"Décembre"},{t:"Janvier"},{t:"Février"},{t:"Mars"},{t:"Avril"},{t:"Mai"},{t:"Juin"},{t:"Manuels et œuvre intégrale"}]},
 {id:50006,pg:6,img:IMG.e,t:"Programme PPO 4e · Guide pédagogique",k:"Programmes",n:"4e",m:"PPO",pr:25,r:4.8,s:[{t:"Présentation du guide"},{t:"Programme et profil de l’élève"},{t:"Objectifs généraux"},{t:"Objectifs spécifiques"},{t:"Commentaire des objectifs généraux"},{t:"Démarches didactiques"},{t:"Démarches de séance"},{t:"Évaluation"},{t:"Modèle de fiche pédagogique"},{t:"Manuels et œuvre intégrale"},{t:"Points à vérifier"}]},
 {id:50007,pg:7,img:IMG.e,t:"Programme PPO 3e · Répartition annuelle",k:"Programmes",n:"3e",m:"PPO",pr:25,r:4.8,s:[{t:"Présentation"},{t:"Octobre"},{t:"Novembre"},{t:"Décembre"},{t:"Janvier"},{t:"Février"},{t:"Mars"},{t:"Avril"},{t:"Mai"},{t:"Juin"},{t:"Manuels et œuvre intégrale"}]},
 {id:50008,pg:8,img:IMG.e,t:"Programme PPO 3e · Guide pédagogique",k:"Programmes",n:"3e",m:"PPO",pr:25,r:4.8,s:[{t:"Présentation du guide"},{t:"Programme et profil de l’élève"},{t:"Objectifs généraux"},{t:"Objectifs spécifiques"},{t:"Commentaire des objectifs généraux"},{t:"Démarches didactiques"},{t:"Démarches de séance"},{t:"Évaluation"},{t:"Modèle de fiche pédagogique"},{t:"Manuels et œuvre intégrale"},{t:"Points à vérifier"}]}
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
 crown:"M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z",
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
function sv(k,v){try{var j=JSON.stringify(v);if(window.syncMark&&localStorage.getItem(k)!==j&&SYNC_KEYS.indexOf(k)>-1)syncMark();localStorage.setItem(k,j)}catch(e){}}
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
/* Images par défaut : paysages libres de droits (licence Unsplash), appelés par lien direct ; rien n’est copié ni stocké (ni sur le site, ni dans Supabase).
   Chaque utilisateur en reçoit une, toujours la même, choisie d’après son nom. Si l’image ne se charge pas (hors ligne, lien retiré), on garde le dégradé d’origine. */
var LANDS=["1506905925346-21bda4d32df4","1500964757637-c85e8a162699","1519414442781-fbd745c5b497","1490682143684-14369e18dce8","1642761684233-9d2d6b0cb4d8","1647974794666-20c41a4a3a4a","1686012391110-66768cd0a0ac","1692199336368-9f4ed1971c43","1494548162494-384bba4ab999","1686012216030-aa93a1283560"],_landOk={};
function landHash(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h}
function landDefault(kind,cb){ /* kind : "a" = photo de profil (carrée), "c" = couverture (bandeau) ; cb(url) n’est appelée que si l’image est bien chargée */
 var w=kind==="c"?900:240,h=kind==="c"?360:240,k=landHash((userName()||"")+kind),n=0;
 if(_landOk[kind])return cb(_landOk[kind]);
 (function essai(){
  if(n>=2||typeof Image==="undefined")return;
  var im=new Image(),u="https://images.unsplash.com/photo-"+LANDS[(k+n)%LANDS.length]+"?auto=format&fit=crop&w="+w+"&h="+h+"&q=60";
  im.onload=function(){_landOk[kind]=u;cb(u)};
  im.onerror=function(){n++;essai()};
  im.src=u})()}
function paintAvatars(){var ph=userPhoto();
 document.querySelectorAll(".av,.big").forEach(function(a){
  if(ph){a.style.background='url("'+ph+'") center/cover no-repeat';a.classList.add("ph")}
  else{a.style.background="";a.classList.remove("ph")}});
 if(!ph)landDefault("a",function(u){if(userPhoto())return;
  document.querySelectorAll(".av,.big").forEach(function(a){a.style.background='url("'+u+'") center/cover no-repeat';a.classList.add("ph")})})}
paintAvatars();

/* Thème : "auto" (par défaut), "light" ou "dark" */
function applyTheme(){var t="";try{t=localStorage.getItem("theme")||""}catch(e){}
 if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);else document.documentElement.removeAttribute("data-theme")}
applyTheme();

/* Repère visuel des fiches pédagogiques : bandeau bleu en haut de la carte + contour bleu (catalogue, favoris, accueil) */
try{var _fs=document.createElement("style");_fs.textContent=".doc.fiche{box-shadow:0 0 0 2px #5f84e6,0 8px 24px rgba(90,60,170,.08)}.fband{display:flex;align-items:center;gap:6px;background:linear-gradient(90deg,#4a6fdc,#7d9cf0);color:#fff;font-size:12px;font-weight:700;padding:7px 12px;border-radius:14px;margin-bottom:8px}.fband svg{width:14px;height:14px;flex:0 0 auto}.fband{white-space:nowrap;min-height:34px;box-sizing:border-box;overflow:hidden}html:not(.p-home) .doc{overflow:hidden}html:not(.p-home) .doc .cov{height:132px;flex:0 0 auto}html:not(.p-home) .doc .body{padding:12px 8px 6px;min-width:0}html:not(.p-home) .doc .body h3{min-height:2.6em;margin-bottom:6px}html:not(.p-home) .doc .meta{margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}html:not(.p-home) .doc .body>a{display:block;margin-bottom:12px}html:not(.p-home) .doc .r2{gap:8px;min-height:40px;padding-top:2px;min-width:0}html:not(.p-home) .doc .price{flex:1 1 auto;min-width:0;margin-right:0}html:not(.p-home) .doc .price b{display:block;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}html:not(.p-home) .doc .add{flex:0 0 auto;min-width:40px;height:40px}";document.head.appendChild(_fs)}catch(e){}
function docClass(d){return d.k==="Fiches"?"doc fiche":"doc"}
function ficheBand(d){return d.k==="Fiches"?'<div class="fband"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 7V3.5L18.5 9zM8 13h8v2H8zm0 4h8v2H8z"/></svg>Fiche pédagogique</div>':""}
/* Carte de document (catalogue, favoris) */
function cardHTML(d){
 var g=G[d.k]||G.Cours,f=favs.indexOf(d.id)>-1,c=cart.indexOf(d.id)>-1,acc=canAccess(d.id),inc=isSubscribed();
 return '<article class="'+docClass(d)+'">'+ficheBand(d)+'<div class="cov" style="--g1:'+g[0]+';--g2:'+g[1]+'"><img src="'+esc(d.img)+'" alt="" loading="lazy" decoding="async" onerror="this.remove()">'+
  '<span class="rate">'+ico("star",12)+d.r.toFixed(1)+'</span><span class="tag">'+esc(d.m)+'</span>'+
  '<button class="fav" data-f="'+d.id+'" aria-pressed="'+f+'" aria-label="Favori">'+ico("heart",18)+'</button></div>'+
  '<div class="body"><h3>'+esc(d.t)+'</h3><p class="meta">'+esc(d.k)+' · '+esc(d.n)+'</p><a href="'+docUrl(d)+'" style="font-size:12px;font-weight:600;color:#7a5cd0;text-decoration:none">Voir les détails ›</a>'+
  '<div class="r2">'+(acc?'<div class="price"><b>'+accesLabel(d)+'</b></div><button class="add in" data-o="'+d.id+'" aria-label="Ouvrir">'+ico("dl",20)+'</button>':'<div class="price"><b>'+(ACHAT?price(d.pr):"Abonnés")+'</b></div>'+
  (ACHAT?'<button class="add'+(c?" in":"")+'" data-c="'+d.id+'" aria-label="'+(c?"Retirer du panier":"Ajouter au panier")+'">'+ico(c?"check":"plus",20)+'</button>':'<button class="add in" data-o="'+d.id+'" aria-label="Voir">'+ico("dl",20)+'</button>'))+'</div></div></article>'}

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

/* Barre de navigation du bas : drawNav(0..4) = Accueil, Catalogue, Favoris, Abonnement, Profil */
var NAVITEMS=[["home","Accueil","index.html"],["grid","Catalogue","catalogue.html"],["heart","Favoris","favoris.html"],["crown","Abonnement","abonnement.html"],["user","Profil","profil.html"]];
function drawNav(a){
 var nv=$("nav");nv.style.setProperty("--cx",(a*20+10)+"%");
 nv.innerHTML='<div class="bar"></div>'+NAVITEMS.map(function(n,i){return '<button type="button" data-h="'+BASE+n[2]+'" aria-label="'+n[1]+'" title="'+n[1]+'"'+(i===a?' class="on" aria-current="page"':'')+'><span class="ic">'+ico(n[0],24)+'</span>'+
  ""+'</button>'}).join("")}
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

/* ===== Sauvegarde du compte (Supabase) : favoris, panier, progression =====
   Les clés ci-dessous sont copiées dans la table user_data (script supabase/02-user-data.sql).
   Les achats et abonnements (bought, sub, pending, subpending) ne sont JAMAIS envoyés : ils devront être gérés côté serveur.
   Sans connexion Supabase (mode démonstration), rien de tout cela ne s’exécute. */
var SYNC_KEYS=["favs","cart","studied","parts","scores","rates"];
(function(){
 var busy=false,timer=null;
 function jget(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
 function on(){var c=jget("sb_conf"),s=jget("sb_session");return !!(c&&c.u&&c.k&&s&&s.user_id&&localStorage.getItem("auth_mode")==="supabase")}
 function token(){
  var s=jget("sb_session"),c=jget("sb_conf"),now=Math.floor(Date.now()/1000);
  if(s.expires_at-60>now)return Promise.resolve(s.access_token);
  return fetch(c.u+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{"apikey":c.k,"Content-Type":"application/json"},body:JSON.stringify({refresh_token:s.refresh_token})})
   .then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){
    s.access_token=j.access_token;s.refresh_token=j.refresh_token||s.refresh_token;s.expires_at=now+(j.expires_in||3600);
    localStorage.setItem("sb_session",JSON.stringify(s));return s.access_token})}
 function snap(){var o={};SYNC_KEYS.forEach(function(k){var v=jget(k);if(v!==null)o[k]=v});return o}
 /* Remplace les données de l’appareil par celles du compte ; renvoie true si quelque chose a changé */
 function apply(d){var ch=false;SYNC_KEYS.forEach(function(k){
  var old=localStorage.getItem(k),n=d[k]===undefined?null:JSON.stringify(d[k]);
  if(old!==n){ch=true;if(n===null)localStorage.removeItem(k);else localStorage.setItem(k,n)}});return ch}
 /* Fusion : listes = réunion des deux, objets = réunion (l’appareil l’emporte en cas de conflit) */
 function merge(a,b){var o={};SYNC_KEYS.forEach(function(k){var x=a[k],y=b[k];
  if(x===undefined)o[k]=y;else if(y===undefined)o[k]=x;
  else if(Array.isArray(x)&&Array.isArray(y))o[k]=x.concat(y.filter(function(i){return x.indexOf(i)<0}));
  else if(x&&y&&typeof x==="object"&&typeof y==="object"&&!Array.isArray(x)&&!Array.isArray(y)){o[k]={};for(var i in x)o[k][i]=x[i];for(var j in y)o[k][j]=y[j]}
  else o[k]=y});
  for(var q in o)if(o[q]===undefined)delete o[q];return o}
 function push(keep){
  if(!on())return Promise.resolve();
  var n=localStorage.getItem("sync_dirty");
  return token().then(function(t){
   var c=jget("sb_conf"),s=jget("sb_session"),ts=new Date().toISOString();
   return fetch(c.u+"/rest/v1/user_data?on_conflict=user_id",{method:"POST",keepalive:!!keep,
    headers:{"apikey":c.k,"Authorization":"Bearer "+t,"Content-Type":"application/json","Prefer":"resolution=merge-duplicates,return=minimal"},
    body:JSON.stringify({user_id:s.user_id,data:snap(),updated_at:ts})})
   .then(function(r){if(!r.ok)throw 0;localStorage.setItem("sync_at",ts);if(localStorage.getItem("sync_dirty")===n)localStorage.removeItem("sync_dirty")})
  }).catch(function(){})}
 function mark(){
  if(!on())return;
  localStorage.setItem("sync_dirty",String((+localStorage.getItem("sync_dirty")||0)+1));
  clearTimeout(timer);timer=setTimeout(function(){push()},2000)}
 function start(){
  if(!on()||busy)return;
  var dirty=localStorage.getItem("sync_dirty"),last=+sessionStorage.getItem("sync_t")||0;
  if(!dirty&&localStorage.getItem("sync_at")&&Date.now()-last<180000)return;
  busy=true;sessionStorage.setItem("sync_t",String(Date.now()));
  token().then(function(t){
   var c=jget("sb_conf"),s=jget("sb_session");
   return fetch(c.u+"/rest/v1/user_data?select=data,updated_at&user_id=eq."+encodeURIComponent(s.user_id),{headers:{"apikey":c.k,"Authorization":"Bearer "+t}})
   .then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(rows){
    var row=rows[0],first=!localStorage.getItem("sync_at"),d=localStorage.getItem("sync_dirty");
    if(!row)return push();
    var rd=row.data||{};
    if(d||first){var before=JSON.stringify(snap());apply(merge(rd,snap()));var ch=before!==JSON.stringify(snap());return push().then(function(){if(ch)location.reload()})}
    if(row.updated_at===localStorage.getItem("sync_at"))return;
    var ch2=apply(rd);localStorage.setItem("sync_at",row.updated_at);if(ch2)location.reload()})
  }).catch(function(){}).then(function(){busy=false})}
 window.syncMark=mark;
 window.syncOn=on;window.sbToken=token;
 window.syncBeforeLogout=function(){return Promise.race([localStorage.getItem("sync_dirty")?push():Promise.resolve(),new Promise(function(r){setTimeout(r,2500)})])};
 document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"&&localStorage.getItem("sync_dirty"))push(true)});
 if(typeof setTimeout==="function"&&typeof sessionStorage!=="undefined")setTimeout(start,800)})();

/* ===== Abonnement par codes d'activation (Supabase) =====
   L'abonnement est enregistré sur le compte (table abonnements, script supabase/03-abonnement-codes.sql) ; l'appareil n'en garde qu'une copie.
   ATTENTION : tant que les parties payantes restent des fichiers publics, cette copie locale protège l'interface, pas les fichiers. */
(function(){
 function jget(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
 window.sbRpc=function(name,args){
  if(!window.syncOn||!syncOn()||!window.sbToken)return Promise.reject(new Error("connexion"));
  var c=jget("sb_conf");
  return sbToken().then(function(t){return fetch(c.u+"/rest/v1/rpc/"+name,{method:"POST",headers:{"apikey":c.k,"Authorization":"Bearer "+t,"Content-Type":"application/json"},body:JSON.stringify(args||{})})})
   .then(function(r){if(!r.ok)throw new Error("http"+r.status);return r.json()})};
 /* Relit l'abonnement du compte (au plus toutes les 3 min, sauf force) ; renvoie true si la copie locale a changé */
 window.subRefresh=function(force){
  if(!window.syncOn||!syncOn()||!window.sbToken)return Promise.resolve(false);
  var last=+sessionStorage.getItem("sub_t")||0;
  if(!force&&Date.now()-last<180000)return Promise.resolve(false);
  sessionStorage.setItem("sub_t",String(Date.now()));
  return sbToken().then(function(t){var c=jget("sb_conf"),s=jget("sb_session");
   return fetch(c.u+"/rest/v1/abonnements?select=plan,fin&user_id=eq."+encodeURIComponent(s.user_id),{headers:{"apikey":c.k,"Authorization":"Bearer "+t}})})
   .then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(rows){
    var old=localStorage.getItem("sub"),n=rows[0]?JSON.stringify({plan:rows[0].plan,end:rows[0].fin}):null;
    if(old===n)return false;
    if(n===null)localStorage.removeItem("sub");else localStorage.setItem("sub",n);return true})
   .catch(function(){return false})};
 if(typeof setTimeout==="function"&&typeof sessionStorage!=="undefined"&&typeof PAGE_ABO==="undefined")setTimeout(function(){subRefresh().then(function(ch){if(ch)location.reload()})},1200)})();
