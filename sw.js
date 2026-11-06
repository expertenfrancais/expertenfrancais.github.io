/* ===== sw.js : service worker (fonctionnement hors ligne) =====
   Placez ce fichier au même endroit que les pages. Quand vous modifiez une page,
   changez le numéro de VERSION pour que les utilisateurs reçoivent la mise à jour. */
var VERSION="v69";
var CACHE="ressources-"+VERSION;
var IMAGES="ressources-images";
var COURS=["cours/college/1-le-groupe-nominal-cours-complet.html","cours/college/2-la-phrase-et-ses-constituants.html","cours/college/3-le-groupe-verbal.html","cours/primaire/4-les-types-de-phrases.html","cours/college/5-les-formes-de-phrases.html","cours/college/6-les-fonctions-grammaticales.html","cours/college/7-la-nature-et-la-fonction-des-mots.html","cours/college/8-le-sujet-et-ses-differentes-formes.html","cours/college/9-les-complements-d-objet-cod-et-coi.html","cours/college/10-les-complements-circonstanciels.html","cours/college/11-l-adjectif-qualificatif-et-ses-fonctions.html","cours/college/12-les-determinants.html","cours/college/13-les-pronoms.html","cours/college/14-les-prepositions.html","cours/college/15-les-conjonctions.html","cours/college/16-les-presentatifs.html","cours/college/17-la-phrase-simple.html","cours/college/18-la-phrase-complexe.html","cours/college/19-la-proposition-principale-et-la-proposition-subordonnee.html","cours/college/20-la-notion-de-verbe.html","cours/college/21-le-sens-propre-et-le-sens-figure.html","cours/college/22-les-degres-de-qualification.html","cours/college/23-les-groupes-de-verbes.html","cours/college/24-les-modes-personnels-et-impersonnels.html","cours/college/25-l-accord-de-l-adjectif-qualificatif.html"];
var CONTENU=["contenu/1.json","contenu/2.json","contenu/3.json","contenu/4.json","contenu/5.json","contenu/6.json","contenu/7.json","contenu/8.json","contenu/9.json","contenu/10.json","contenu/11.json","contenu/12.json","contenu/13.json","contenu/14.json","contenu/15.json","contenu/16.json","contenu/17.json","contenu/18.json","contenu/19.json","contenu/20.json","contenu/21.json","contenu/22.json","contenu/23.json","contenu/24.json","contenu/25.json"];
var PAGES=["login-app.html","data.js","index.html","catalogue.html","favoris.html","panier.html","abonnement.html","cours.html","profil.html","parametres.html","cycles.html","lecon.html","manifest.json","icon-192.png","icon-512.png","icon-maskable-192.png","icon-maskable-512.png","logo.png","course.css","course.js","blocs.js"].concat(COURS).concat(CONTENU);
var MAX_IMAGES=40;

self.addEventListener("install",function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    /* Un fichier manquant n’empêche pas l’installation des autres */
    return Promise.all(PAGES.map(function(u){return c.add(new Request(u,{cache:"reload"})).catch(function(){})}))
  }).then(function(){return self.skipWaiting()}))});

self.addEventListener("activate",function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==CACHE&&k!==IMAGES}).map(function(k){return caches.delete(k)}))
  }).then(function(){return self.clients.claim()}))});

function trim(name,max){
  return caches.open(name).then(function(c){return c.keys().then(function(ks){
    if(ks.length>max)return c.delete(ks[0]).then(function(){return trim(name,max)})})})}

self.addEventListener("message",function(e){if(e.data&&e.data.type==="SKIP_WAITING")self.skipWaiting()});

self.addEventListener("fetch",function(e){
  var req=e.request;
  if(req.method!=="GET")return;
  var url=new URL(req.url);
  if(url.protocol!=="http:"&&url.protocol!=="https:")return;

  /* sw.js lui-même : toujours demandé au serveur (sert à détecter une nouvelle version) */
  if(url.pathname.slice(-6)==="/sw.js")return;

  /* Appels d’API : jamais mis en cache (données privées, documents payants) */
  if(url.pathname.indexOf("/api/")>-1)return;

  /* Pages : copie enregistrée d’abord (affichage immédiat), mise à jour en arrière-plan.
     Une nouvelle VERSION recharge tout le cache à l’installation. */
  if(req.mode==="navigate"){
    e.respondWith(caches.match(req,{ignoreSearch:true}).then(function(hit){
      var net=fetch(req).then(function(res){
        if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy)})}
        return res}).catch(function(){return null});
      if(hit){e.waitUntil(net);return hit}
      return net.then(function(r){return r||caches.match("index.html")}).then(function(r){return r||caches.match("login-app.html")})}));
    return}

  /* Code de l’application (pages, scripts, données) : copie enregistrée d’abord, mise à jour en arrière-plan */
  if(url.origin===location.origin&&/\.(js|html|json)$/.test(url.pathname)){
    e.respondWith(caches.match(req).then(function(hit){
      var net=fetch(req).then(function(res){
        if(res&&res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp)})}
        return res}).catch(function(){return hit});
      if(hit){e.waitUntil(net);return hit}
      return net}));
    return}

  if(url.origin===location.origin){
    e.respondWith(caches.match(req).then(function(hit){
      var net=fetch(req).then(function(res){
        if(res&&res.ok){var copy=res.clone();caches.open(CACHE).then(function(c){c.put(req,copy)})}
        return res}).catch(function(){return hit});
      return hit||net}));
    return}

  /* Images d’autres sites (ex. photos Pexels) : enregistrées au premier affichage */
  if(req.destination==="image"){
    e.respondWith(caches.open(IMAGES).then(function(c){
      return c.match(req).then(function(hit){
        return hit||fetch(req).then(function(res){
          if(res&&(res.ok||res.type==="opaque")){c.put(req,res.clone());trim(IMAGES,MAX_IMAGES)}
          return res})})}))}
});
