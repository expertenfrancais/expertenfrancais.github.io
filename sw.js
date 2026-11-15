/* ===== sw.js : ancien service worker (mode hors ligne SUPPRIMÉ en v254) =====
   Ce fichier est volontairement conservé : les appareils qui avaient installé l'ancien service worker
   vont rechercher sw.js, reçoivent cette version, qui vide tous les caches, se désinscrit et recharge la page.
   Il n'y a plus aucun cache ni aucune interception des requêtes : tout vient directement du réseau.
   Ne pas supprimer ce fichier (au moins quelques mois) et ne pas y remettre de « fetch ».
   VERSION sert seulement à repérer la version du site (affichée dans admin.html). */
var VERSION = "v254";

self.addEventListener("install", function () { self.skipWaiting(); });

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.map(function (k) { return caches.delete(k); })); })
      .catch(function () {})
      .then(function () { return self.registration.unregister(); })
      .catch(function () {})
      .then(function () { return self.clients.matchAll({ type: "window" }); })
      .then(function (cs) { cs.forEach(function (c) { try { c.navigate(c.url); } catch (x) {} }); })
      .catch(function () {})
  );
});
