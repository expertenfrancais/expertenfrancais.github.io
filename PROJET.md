# PROJET : état en bref (à lire en premier, avant GUIDE-IA.md)

Application de cours de français (PWA statique, GitHub Pages : https://expertenfrancais.github.io). Pas de serveur, pas de framework.
Mise à jour : archive **v135** (connexion Supabase active + sauvegarde du compte ; voir `supabase/LISEZMOI.md`).

## État actuel
- 57 cours de collège (id 1 à 58), 1 cours de primaire, 1 fiche pédagogique (id 10001), 3 annales vraies (20002 BEPC juillet 2025 Dictée-Questions, 20003 BEPC blanc mai 2025 Dictée-Questions, 20004 BEPC juillet 2025 Expression écrite) ; prochaine : an 5 (id 20005), 21 séries d’exercices (id 30001 à 30021 : 6e, 5e, 4e et 3e), prochaine : ex 22 (id 30022), 3 évaluations modèles (40001 et 40002 en 6e, 40003 en 3e ; réservées aux enseignants), prochaine : ev 4 (id 40004).
- Dernier id de cours : **58**. Commande pour le vérifier : `ls contenu/cours/*/ | sort -n | tail -3`
- Version du cache : `VERSION` dans `sw.js` (actuellement `v135`).
- Accès gratuit pour l'instant ; paiements à venir (prix par cycle dans `PRIX_CYCLE`, `data.js`).

## Connexion et base de données (Supabase) : déjà en place, ne pas refaire
- Projet Supabase actif ; `SUPABASE_URL` et `SUPABASE_ANON_KEY` (clé publique `sb_publishable_…`) sont **déjà renseignées** dans `login-app.html`. Ne jamais demander ni écrire la clé `service_role` / « secret ».
- Connexion par **e-mail + mot de passe uniquement** (pas de Google/Apple/Facebook : boutons retirés). **« Confirm email » est désactivé** : l'inscrit entre directement. « Mot de passe oublié » = code à 6 chiffres envoyé par e-mail (SMTP Gmail configuré ; le modèle d'e-mail « Reset password » doit contenir `{{ .Token }}`).
- Tables (scripts à lancer à la main dans Supabase > SQL Editor) : `supabase/01-auth.sql` → `profiles` ; `supabase/02-user-data.sql` → `user_data` (une ligne par utilisateur, RLS : chacun ne voit que la sienne).
- **Sauvegarde du compte** : à la fin de `data.js`, les clés `SYNC_KEYS` (favs, cart, studied, parts, scores, rates) sont copiées dans `user_data` (envoi 2 s après un changement, lecture au plus toutes les 3 min, fusion si conflit). Les **achats/abonnements (bought, sub, pending, subpending) ne sont jamais envoyés**.
- Clés `localStorage` liées : `sb_session`, `sb_conf` (URL + clé pour `data.js`), `auth_mode`, `sync_at`, `sync_dirty` (toutes effacées à la déconnexion).
- Accès **gratuit** : `GRATUIT = true` dans `data.js` (abonnements et paiements « bientôt disponibles », volontairement laissés de côté pendant le développement).
- Plan Supabase gratuit : pause après 7 jours d'inactivité (passer au plan Pro avant le lancement public).
- Pas encore fait (idées) : mise à jour de `profiles` quand pseudo/cycle changent ; formulaire de contact → table Supabase ; protection des contenus payants et paiements (chantier futur) ; bouton « Valider mon adresse e-mail ».

## Hors ligne (sw.js)
- Au premier lancement, **seules ~26 pages essentielles** sont préchargées (`PAGES`). Les cours (`COURS`, `CONTENU`) sont gardés hors ligne **à la première ouverture**, pas préchargés : ne pas rajouter `.concat(COURS).concat(CONTENU)` à `PAGES` (cela ralentissait le premier lancement des nouveaux inscrits).

## Rangement
- `contenu/cours/<cycle>/<id>.json` : un cours (texte + clé `meta`)
- `contenu/fiches/<cycle>/fiche-<n>.json` : une fiche pédagogique
- `contenu/annales/<cycle>/annale-<an>.json` : une annale (sujet d'examen + corrigé), id = 20000 + an
- `contenu/evaluations/<cycle>/evaluation-<ev>.json` : une évaluation (énoncé, corrigé, barème), enseignants seulement, id = 40000 + ev
- `contenu/exercices/<cycle>/exercice-<ex>.json` : une série d'exercices pour une notion (rappel, exercices, corrigés), id = 30000 + ex
- `contenu/programmes/<cycle>/programme-<pg>.json` : un programme (répartition mois par mois ou guide pédagogique), enseignants seulement, id = 50000 + pg. **Environnement en place : 8 fichiers vides au collège** (APS : 6e et 5e ; PPO : 4e et 3e ; programme + guide pour chaque niveau, tous dans `contenu/programmes/college/`), à remplir avec le programme officiel ; écrans dédiés à faire plus tard
- Générés, à ne jamais modifier à la main : `cours/`, `fiches/`, `annales/`, `exercices/`, `evaluations/`, `programmes/`, `sitemap.xml`, `robots.txt`, catalogue de `data.js`

## Ajouter un cours (3 étapes)
1. Déposer `contenu/cours/<cycle>/<id>.json` (voir GUIDE-IA.md, tâche B)
2. `node outils/generer-pages.js https://expertenfrancais.github.io` (toujours avec l'adresse du site)
3. Augmenter `VERSION` dans `sw.js`, puis `node outils/valider-contenu.js` (0 erreur)

## Règles essentielles
- Ne pas ouvrir `data.js` pour ajouter un cours ; ne pas lire `cours/` ni `fiches/`.
- Un sujet pour deux niveaux (ex. 4e et 3e) = deux cours séparés, contenu adapté à chaque niveau.
- Futur type (programmes…) : suivre « Nouveau type de contenu » dans `GUIDE-IA.md`.

## Un guide par type de contenu (ne lire que celui de la tâche)
- Cours et interface : `GUIDE-IA.md` (formats : `contenu/SPEC.md`)
- Fiches pédagogiques : `GUIDE-FICHES.md` (format : `contenu/SPEC-FICHES.md`)
- Évaluations : `GUIDE-EVALUATIONS.md` (modèles : `evaluation-1.json`, `evaluation-3.json`)
- Exercices : `GUIDE-EXERCICES.md` (modèle : `contenu/exercices/college/exercice-1.json`)
- Annales : `GUIDE-ANNALES.md` (modèle : `contenu/annales/college/annale-2.json`)
- Programmes : `GUIDE-PROGRAMMES.md` (les 8 fichiers du collège sont listés dans le guide)
