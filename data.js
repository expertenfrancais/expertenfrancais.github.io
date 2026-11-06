
/* ===== data.js : données et fonctions partagées par toutes les pages =====
   À remplacer plus tard par les données de votre serveur (API). */
var DEVISE="FCFA";
/* Fondu d'arrivée : la classe « fresh » n'existe que les premières 700 ms, pour ne pas rejouer l'animation à chaque filtre ou recherche */
try{document.documentElement.classList.add("fresh");setTimeout(function(){document.documentElement.classList.remove("fresh")},700)}catch(e){}
/* BASE : préfixe des liens. Vide pour les pages à la racine, "../" pour les pages du dossier cours/ (défini par PAGE_BASE dans chaque page). */
var BASE=(typeof PAGE_BASE!=="undefined")?PAGE_BASE:"";

/* ===== Type de profil : enseignant ou élève =====
   Enseignant : toutes les ressources. Élève : cours uniquement.
   ATTENTION : ce filtrage se fait sur l’appareil. Avec un serveur, le rôle doit venir du compte
   et l’accès aux documents doit être contrôlé côté serveur. */
var DEMO=true; /* mettre false avec un vrai serveur : les achats restent « en attente » jusqu’à confirmation du paiement */
/* ===== Abonnement =====
   Formules prépayées (pas de renouvellement automatique). À brancher sur le serveur : l’état « sub » doit venir du compte. */
/* Prix selon le profil de l’appareil (élève et étudiant = même profil « eleve »).
   Élève / étudiant : mensuel 1000, trimestriel 2500, annuel 5000. Enseignant : mensuel 2500, trimestriel 5000, annuel 10000. */
var EST_ELEVE=userRole()==="eleve";
var PLANS=[{id:"mois",n:"Mensuel",d:30,pr:EST_ELEVE?1000:2500},{id:"trim",n:"Trimestriel",d:90,pr:EST_ELEVE?2500:5000},{id:"an",n:"Annuel",d:365,pr:EST_ELEVE?5000:10000}];
function isSubscribed(){var s=ls("sub",{});return !!s.end&&Date.parse(s.end)>Date.now()}
function canAccess(id){return isSubscribed()||ls("bought",[]).indexOf(id)>-1}
function fmtDate(iso){return new Date(iso).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"})}
function activateSub(id){var p=PLANS.filter(function(x){return x.id===id})[0],s=ls("sub",{}),b=Math.max(Date.now(),s.end?Date.parse(s.end):0);
 sv("sub",{plan:id,end:new Date(b+p.d*864e5).toISOString()});cart=[];sv("cart",cart)}
/* Chaque cours a sa propre page dans le dossier cours/ (générée par outils/generer-pages.js). Le nom du fichier = numéro + titre. */
function slug(t){return String(t).toLowerCase().replace(/œ/g,"oe").replace(/æ/g,"ae").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,60).replace(/-+$/,"")}
/* Les pages sont classées par cycle : cours/primaire/, cours/college/, cours/lycee/, cours/universite/ */
function docFile(d){return "cours/"+CYCLE_INFO[cycleOf(d.n)].dir+"/"+d.id+"-"+slug(d.t)+".html"}
function docUrl(d){return BASE+docFile(d)}
/* Parties (sections) d’un cours : chacune a sa page de lecture lecon.html?id=…&s=… (rendue par JavaScript).
   La première partie est gratuite ; les autres demandent l’accès au cours (achat ou abonnement). */
function partUrl(d,i){return BASE+"lecon.html?id="+d.id+"&s="+(i+1)}
function partFree(i){return i===0}
function partsDone(id){return (ls("parts",{})[id])||[]}
function markPart(id,i){var o=ls("parts",{}),a=o[id]||[];if(a.indexOf(i)<0){a.push(i);o[id]=a;sv("parts",o)}}
function openDoc(id){var d=ALLDOCS.filter(function(x){return x.id===id})[0];location.href=d?docUrl(d):BASE+"catalogue.html"}
/* Annulation d’abonnement (avec un serveur : l’annulation doit aussi être enregistrée côté serveur) */
function cancelSub(){try{localStorage.removeItem("sub");localStorage.removeItem("subpending")}catch(e){}}
function subBanner(id){if(isSubscribed())return;var r=$(id);if(!r)return;
 r.insertAdjacentHTML("beforebegin",'<a href="abonnement.html" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 14px;padding:14px 16px;border-radius:20px;background:linear-gradient(135deg,#b29af4,#8c6fe0);color:#fff;text-decoration:none;font-weight:600;font-size:14px"><span>Abonnez-vous : tout le contenu, sans achat à l’unité</span><b style="white-space:nowrap">Voir ›</b></a>')}
/* ===== Fiche détail d’un document : descriptions génériques par type (une description propre au document, d.d / d.obj / d.s, les remplace) ===== */
var INFO={
 "Cours":{desc:"Cours de français ({m}) pour le niveau {n} : notions essentielles, méthodes et exemples commentés.",obj:["Comprendre les notions essentielles du chapitre","Appliquer les méthodes sur des exemples guidés","Se préparer aux évaluations"],plan:["Objectifs et prérequis","Notions clés","Méthodes et exemples commentés","Exercices d’application","À retenir"]},
 "Fiches":{desc:"Fiche de révision de français ({m}), niveau {n} : l’essentiel à retenir, en quelques pages.",obj:["Réviser rapidement avant un devoir","Retenir les règles et définitions clés"],plan:["Ce qu’il faut savoir","Règles et exemples","Pièges à éviter"]},
 "TD":{desc:"Travaux dirigés de français ({m}), niveau {n} : exercices progressifs pour s’entraîner en classe ou à la maison.",obj:["S’entraîner de façon progressive","Consolider le cours par la pratique"],plan:["Rappels de cours","Exercices d’échauffement","Exercices d’approfondissement","Exercices de synthèse"]},
 "Sujets traités":{desc:"Sujets de français ({m}), niveau {n}, entièrement traités et corrigés, avec la méthode de rédaction.",obj:["Apprendre la méthode de rédaction","Comparer sa copie à un corrigé détaillé"],plan:["Énoncés","Corrigés détaillés","Conseils de méthode"]},
 "Anciens sujets":{desc:"Recueil d’anciens sujets d’examen de français (niveau {n}), avec corrigés, pour s’entraîner dans les conditions réelles.",obj:["Découvrir le format de l’examen","S’entraîner dans les conditions de l’épreuve","Gérer son temps et sa méthode"],plan:["Sujets des dernières années","Corrigés","Barème et conseils"]},
 "Programmes":{desc:"Programme et progression de français pour le niveau {n}, à utiliser pour préparer l’année.",obj:["Planifier l’année","Répartir les séquences"],plan:["Objectifs de l’année","Progression par période"]},
 "Évaluations":{desc:"Évaluation de français ({m}), niveau {n}, prête à l’emploi, avec barème.",obj:["Évaluer les acquis","Disposer d’un barème"],plan:["Sujet","Barème et corrigé"]},
 "Exercices":{desc:"Série d’exercices de français ({m}), niveau {n} pour s’entraîner régulièrement.",obj:["Pratiquer régulièrement","Gagner en aisance"],plan:["Séries d’exercices","Corrigés"]}
};
function docInfo(x){var t=INFO[x.k]||INFO.Cours;function f(s){return s.replace("{m}",x.m).replace("{n}",x.n)}
 return {desc:x.d||f(t.desc),obj:x.obj||t.obj,sections:x.s||t.plan.map(function(p){return{t:p}})}}
/* Niveau de l’élève (profil) : filtre par défaut, seulement s’il appartient au cycle affiché */
function myNiv(){var p=userProfile();return ROLE==="eleve"&&p.grade&&cycleOf(p.grade)===activeCycle()?p.grade:"Tous"}
function myCyc(){return activeCycle()}
var ROLES={enseignant:"Enseignant",eleve:"Élève / Étudiant"}
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
function canSwitchCycle(){return isSubscribed()}
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
function userRole(){var r="";try{r=localStorage.getItem("user_role")||""}catch(e){}return r==="enseignant"?"enseignant":"eleve"}
var ROLE=userRole();
var ALLOWED_TYPES=ROLE==="eleve"?["Cours","TD","Sujets traités","Anciens sujets"]:["Cours","Fiches","TD","Sujets traités","Anciens sujets","Programmes","Évaluations","Exercices"];
var P="?auto=compress&cs=tinysrgb&w=600";
var IMG={a:"https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg"+P,b:"https://images.pexels.com/photos/159865/notepad-pencil-green-black-159865.jpeg"+P,c:"https://images.pexels.com/photos/14654190/pexels-photo-14654190.jpeg"+P,d:"https://images.pexels.com/photos/3735712/pexels-photo-3735712.jpeg"+P,e:"https://images.pexels.com/photos/158771/notebook-pen-table-blank-158771.jpeg"+P,f:"https://images.pexels.com/photos/4157621/pexels-photo-4157621.jpeg"+P,g:"https://images.pexels.com/photos/1340588/pexels-photo-1340588.jpeg"+P,h:"https://images.pexels.com/photos/248152/pexels-photo-248152.jpeg"+P};
/* Champs facultatifs d’un document : a = nom de l’auteur (ex. a:"Mme Diallo"), e = nombre d’élèves actifs (ex. e:74).
   Affichés sur la fiche cours seulement s’ils sont renseignés. */
var ALLDOCS=[
 {id:1,img:IMG.a,t:"Le groupe nominal : cours complet",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.9,s:[{t:"Définition du groupe nominal",c:"Un groupe nominal est un ensemble de mots organisé autour d’un nom, appelé le noyau. Il peut comprendre un déterminant, un adjectif et un complément du nom : « la petite maison du village »."},{t:"Les expansions du nom",c:"Le nom peut être complété par un adjectif épithète (une maison blanche), un complément du nom (la maison de ma tante) ou une proposition relative (la maison que j’habite)."},{t:"Accorder dans le groupe nominal",c:"Le déterminant et l’adjectif s’accordent en genre et en nombre avec le nom noyau : des petites maisons blanches."},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:2,img:IMG.c,t:"La phrase et ses constituants",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’une phrase ?"},{t:"Phrase verbale et phrase non verbale"},{t:"Les types et les formes de phrases"},{t:"Le sujet et le prédicat"},{t:"Les compléments du verbe"},{t:"Les compléments de phrase"},{t:"À retenir"}]},
 {id:3,img:IMG.d,t:"Le groupe verbal",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce que le groupe verbal ?"},{t:"Le verbe, l’infinitif et les trois groupes"},{t:"Conjuguer au présent"},{t:"Les temps de l’indicatif"},{t:"Accorder le verbe avec son sujet"},{t:"Les compléments du verbe"},{t:"Exercices de synthèse"},{t:"À retenir"}]},
 {id:4,img:IMG.b,t:"Les types de phrases",k:"Cours",n:"CM2",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un type de phrase ?"},{t:"La phrase déclarative"},{t:"La phrase interrogative"},{t:"La phrase impérative"},{t:"La phrase exclamative"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:5,img:IMG.f,t:"Les formes de phrases",k:"Cours",n:"5e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’une forme de phrase ?"},{t:"Forme affirmative et forme négative"},{t:"Forme active et forme passive"},{t:"La forme emphatique"},{t:"La forme impersonnelle"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:6,img:IMG.g,t:"Les fonctions grammaticales",k:"Cours",n:"5e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Nature et fonction : ne pas confondre"},{t:"Le sujet"},{t:"Les fonctions liées au verbe : COD, COI et attribut"},{t:"Les compléments circonstanciels"},{t:"Les fonctions dans le groupe nominal"},{t:"Exercices d’analyse"},{t:"À retenir"}]},
 {id:7,img:IMG.h,t:"La nature et la fonction des mots",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Nature ou fonction ?"},{t:"Les mots variables"},{t:"Les mots invariables"},{t:"Reconnaître la nature d’un mot"},{t:"Les fonctions des mots et des groupes de mots"},{t:"Exercices d’analyse"},{t:"À retenir"}]},
 {id:8,img:IMG.c,t:"Le sujet et ses différentes formes",k:"Cours",n:"5e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce que le sujet ?"},{t:"Les natures du sujet"},{t:"La place du sujet"},{t:"Plusieurs sujets et sujets collectifs"},{t:"Le sujet dans les phrases particulières"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:9,img:IMG.e,t:"Les compléments d’objet (COD et COI)",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Les verbes et leurs compléments d’objet"},{t:"Le complément d’objet direct (COD)"},{t:"Le complément d’objet indirect (COI)"},{t:"Distinguer le COD et le COI"},{t:"Un verbe, plusieurs compléments"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:10,img:IMG.b,t:"Les compléments circonstanciels",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un complément circonstanciel ?"},{t:"Reconnaître un complément circonstanciel"},{t:"Le lieu, le temps et la manière"},{t:"La cause, le but, le moyen et les autres circonstances"},{t:"La nature des compléments circonstanciels"},{t:"Place, ponctuation et pièges à éviter"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:11,img:IMG.g,t:"L’adjectif qualificatif et ses fonctions",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un adjectif qualificatif ?"},{t:"Accorder l’adjectif : genre et nombre"},{t:"La fonction épithète"},{t:"La fonction attribut du sujet"},{t:"L’adjectif apposé et la place de l’adjectif"},{t:"Distinguer les fonctions et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:12,img:IMG.c,t:"Les déterminants",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un déterminant ?"},{t:"Les articles"},{t:"Les déterminants possessifs"},{t:"Les déterminants démonstratifs"},{t:"Les autres déterminants"},{t:"Distinguer et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:13,img:IMG.h,t:"Les pronoms",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un pronom ?"},{t:"Les pronoms personnels"},{t:"Les pronoms possessifs et démonstratifs"},{t:"Les pronoms relatifs"},{t:"Les pronoms interrogatifs et indéfinis"},{t:"Reconnaître le pronom et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:14,img:IMG.e,t:"Les prépositions",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’une préposition ?"},{t:"Les prépositions et leurs sens"},{t:"À et de : les prépositions les plus fréquentes"},{t:"Les fonctions du groupe prépositionnel"},{t:"Les locutions prépositives"},{t:"Distinguer la préposition et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:15,img:IMG.f,t:"Les conjonctions",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’une conjonction ?"},{t:"Les conjonctions de coordination"},{t:"Les conjonctions de subordination"},{t:"Ce qu’expriment les conjonctions de subordination"},{t:"Coordination ou subordination ?"},{t:"Éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:16,img:IMG.a,t:"Les présentatifs",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un présentatif ?"},{t:"Voici et voilà"},{t:"C’est et ce sont"},{t:"Il y a et il est"},{t:"Les présentatifs conjugués et à la forme négative"},{t:"Distinguer et éviter les pièges"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:17,img:IMG.b,t:"La phrase simple",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’une phrase simple ?"},{t:"Le sujet et le verbe : le cœur de la phrase"},{t:"Les compléments dans la phrase simple"},{t:"Enrichir ou réduire une phrase simple"},{t:"Les types et les formes de phrases simples"},{t:"Pièges : reconnaître les phrases simples"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:18,img:IMG.e,t:"La phrase complexe",k:"Cours",n:"5e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’une phrase complexe ?"},{t:"Les propositions : compter et délimiter"},{t:"Juxtaposition et coordination"},{t:"La subordination : principale et subordonnée"},{t:"Les subordonnées : relative, complétive et circonstancielle"},{t:"Pièges : reconnaître et analyser"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:19,img:IMG.d,t:"La proposition principale et la proposition subordonnée",k:"Cours",n:"5e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’une proposition ?"},{t:"La proposition principale"},{t:"La proposition subordonnée"},{t:"Les mots subordonnants"},{t:"Nature et fonction des subordonnées"},{t:"Analyser une phrase complexe"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:20,img:IMG.a,t:"La notion de verbe",k:"Cours",n:"6e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un verbe ?"},{t:"Verbe d’action et verbe d’état"},{t:"L’infinitif, le radical et la terminaison"},{t:"Le verbe conjugué : personne et nombre"},{t:"Le verbe et le temps"},{t:"Le verbe et son sujet"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:21,img:IMG.h,t:"Le sens propre et le sens figuré",k:"Cours",n:"6e",m:"Vocabulaire",pr:100,r:4.8,s:[{t:"Définitions : sens propre et sens figuré"},{t:"Reconnaître le sens propre"},{t:"Reconnaître le sens figuré"},{t:"Comparaison et métaphore"},{t:"Les mots à plusieurs sens et le dictionnaire"},{t:"Pièges : bien reconnaître le sens"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:22,img:IMG.g,t:"Les degrés de qualification",k:"Cours",n:"5e",m:"Grammaire",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un degré de qualification ?"},{t:"Le comparatif"},{t:"Le superlatif relatif"},{t:"Le superlatif absolu"},{t:"Comparatifs et superlatifs irréguliers"},{t:"Pièges : accords et emplois"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:23,img:IMG.f,t:"Les groupes de verbes",k:"Cours",n:"6e",m:"Conjugaison",pr:100,r:4.8,s:[{t:"Pourquoi classer les verbes en groupes ?"},{t:"Le premier groupe"},{t:"Le deuxième groupe"},{t:"Le troisième groupe"},{t:"Reconnaître le groupe d’un verbe"},{t:"Les groupes et la conjugaison au présent"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:24,img:IMG.c,t:"Les modes personnels et impersonnels",k:"Cours",n:"5e",m:"Conjugaison",pr:100,r:4.8,s:[{t:"Qu’est-ce qu’un mode ?"},{t:"L’indicatif"},{t:"Le subjonctif et le conditionnel"},{t:"L’impératif"},{t:"Les modes impersonnels : infinitif et participe"},{t:"Reconnaître le mode d’un verbe"},{t:"Exercices d’application"},{t:"À retenir"}]},
 {id:25,img:IMG.g,t:"L’accord de l’adjectif qualificatif",k:"Cours",n:"5e",m:"Orthographe",pr:100,r:4.8,s:[{t:"Le principe de l’accord"},{t:"Le féminin de l’adjectif"},{t:"Le pluriel de l’adjectif"},{t:"Épithète et attribut : avec quel mot s’accorder ?"},{t:"L’accord avec plusieurs noms"},{t:"Les adjectifs de couleur et les cas particuliers"},{t:"Exercices d’application"},{t:"À retenir"}]}
];
ALLDOCS.forEach(function(x){x.c=cycleOf(x.n)});
var DOCS=ALLDOCS.filter(function(d){return ALLOWED_TYPES.indexOf(d.k)>-1&&cycleOK(d)});
var G={Cours:["#8c6fe0","#b29af4"],Fiches:["#5f84e6","#9bb4f5"],Programmes:["#cf63b4","#e79ad6"],"Évaluations":["#e8825f","#f2b08a"],Exercices:["#2fa883","#7fd6b8"],TD:["#e0a030","#f3cf7a"],"Sujets traités":["#4aa3c8","#8fd0e8"],"Anciens sujets":["#c0504d","#e89a98"]};
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

/* Carte de document (catalogue, favoris) */
function cardHTML(d){
 var g=G[d.k]||G.Cours,f=favs.indexOf(d.id)>-1,c=cart.indexOf(d.id)>-1,acc=canAccess(d.id),inc=isSubscribed();
 return '<article class="doc"><div class="cov" style="--g1:'+g[0]+';--g2:'+g[1]+'"><img src="'+esc(d.img)+'" alt="" loading="lazy" decoding="async" onerror="this.remove()">'+
  '<span class="rate">'+ico("star",12)+d.r.toFixed(1)+'</span><span class="tag">'+esc(d.m)+'</span>'+
  '<button class="fav" data-f="'+d.id+'" aria-pressed="'+f+'" aria-label="Favori">'+ico("heart",18)+'</button></div>'+
  '<div class="body"><h3>'+esc(d.t)+'</h3><p class="meta">'+esc(d.k)+' · '+esc(d.n)+'</p><a href="'+docUrl(d)+'" style="font-size:12px;font-weight:600;color:#7a5cd0;text-decoration:none">Voir les détails ›</a>'+
  '<div class="r2">'+(acc?'<div class="price"><b>'+(inc?"Inclus":"Acheté")+'</b></div><button class="add in" data-o="'+d.id+'" aria-label="Ouvrir">'+ico("dl",20)+'</button>':'<div class="price"><b>'+price(d.pr)+'</b></div>'+
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

/* Session : sans utilisateur connecté, retour à la connexion (contrôle réel à faire côté serveur) */
/* Les pages de cours (PUBLIC_PAGE) restent visibles sans connexion : l’achat, lui, demande de se connecter. */
if(!userName()&&typeof PUBLIC_PAGE==="undefined")location.replace(BASE+"login-app.html");
/* Connecté mais cycle pas encore choisi : choix obligatoire (page cycles.html). */
else if(userName()&&!homeCycle()&&typeof PUBLIC_PAGE==="undefined"&&typeof CYCLE_PAGE==="undefined")location.replace(BASE+"cycles.html");
