/* ===== sw-images.js : mémoire des IMAGES des cours déjà consultés (v283) =====
   Ce service worker ne touche QU'AUX IMAGES : les pages, scripts et contenus (HTML, JS, JSON) ne sont jamais
   interceptés et viennent toujours du réseau. Il est distinct de sw.js (désinstalleur de l'ancien mode hors ligne).
   - Chaque image affichée est gardée dans le cache « images-v1 » (cache d'abord, puis réseau).
   - La page peut lui envoyer {type:"precache", urls:[...]} pour télécharger d'avance les images
     des cours déjà consultés (voir precacheViewed dans data.js).
   Limite : MAX images gardées (les plus anciennes sont supprimées). */
var CACHE = "images-v1", MAX = 400;

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });

function isImg(req) {
  if (req.method !== "GET") return false;
  if (req.destination === "image") return true;
  return /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/i.test(req.url);
}

/* Téléchargement en mode « cors » : réponse lisible, taille réelle comptée (une réponse « opaque » est comptée
   très lourde par les navigateurs). Si le site d'images refuse le mode cors, on laisse passer sans garder. */
function grab(url) {
  return fetch(url, { mode: "cors", credentials: "omit" }).then(function (r) {
    if (!r || !r.ok) return r;
    var copy = r.clone();
    caches.open(CACHE).then(function (c) {
      return c.put(url, copy).then(function () { return trim(c); });
    }).catch(function () {});
    return r;
  });
}

function trim(c) {
  return c.keys().then(function (ks) {
    var extra = ks.length - MAX, i, p = [];
    for (i = 0; i < extra; i++) p.push(c.delete(ks[i]));
    return Promise.all(p);
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (!isImg(req)) return;
  e.respondWith(
    caches.match(req.url).then(function (hit) {
      if (hit) return hit;
      return grab(req.url).catch(function () { return fetch(req); });
    }).catch(function () { return fetch(req); })
  );
});

self.addEventListener("message", function (e) {
  var d = e.data;
  if (!d || d.type !== "precache" || !d.urls) return;
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      /* une image à la fois : léger pour la connexion */
      return d.urls.reduce(function (chain, u) {
        return chain.then(function () {
          return c.match(u).then(function (h) {
            if (h) return;
            return grab(u).catch(function () {});
          });
        });
      }, Promise.resolve());
    }).catch(function () {})
  );
});
