# PROJET : état en bref (à lire en premier, avant GUIDE-IA.md)

Application de cours de français (PWA statique, GitHub Pages : https://expertenfrancais.github.io). Pas de serveur, pas de framework.
Mise à jour : archive **v159** (les 10 fiches de 3e, fn 2 à 11, remplies avec des contenus FACTICES de test, valides, à remplacer plus tard : titres du catalogue inchangés « Fiche modèle n° N (test) », titre réel dans l’en-tête ; chaque corrigé se termine par « contenu de test ») ; avant : v158 (images de profil et de couverture par défaut : paysages Unsplash appelés par lien direct, liste `LANDS` dans `data.js`, choisis d’après le nom ; rien n’est stocké ; repli sur le dégradé si l’image ne charge pas ; les photos choisies par l’utilisateur restent dans `localStorage`, jamais dans Supabase) ; avant : v157 (boucle de « retour » corrigée entre la page de présentation d’une fiche, `fiche.html` et `pdf.html` : `course.js` ne mémorise plus fiche.html/pdf.html comme page d’origine ; boutons Retour = vrai retour arrière ; changer d’onglet ne crée plus d’historique ; boutons d’onglets du PDF lisibles sur téléphone) ; avant : v156 (analyse complète de v155 : tout fonctionne ; correction du cadenas des onglets verrouillés de `fiche.js`, qui n’apparaissait pas) ; avant : v155 (10 fiches modèles de 3e pour tester l’accès par abonnement, fn 2 à 11) ; avant : v154 (20 évaluations ajoutées, n° 24 à 43, collège) ; avant : v153 (codes d’activation : tarifs enseignant et élève) ; avant : v152 (abonnement par codes, phase 1) ; avant : v151 (20 évaluations ajoutées) ; avant : v150 (connexion Supabase active + sauvegarde du compte ; voir `supabase/LISEZMOI.md`).

## État actuel
- 73 cours de collège (id 1 à 58, plus les n° 60 « La conjonction » 5e, 61 « La dérivation » 5e, 62 « La composition » 4e, 63 « Les champs lexicaux » 5e, 64 « Les champs sémantiques » 4e, 65 « Les champs lexicaux » 6e, 66 « Les champs sémantiques » 6e, 67 « Les homophones grammaticaux » 6e, 68 « L’accord des déterminants et des noms » 6e et 69 « Les terminaisons verbales en -é, -er, -ait, -ez » 6e, 70 « Les homophones lexicaux » 6e, 71 « L’accord du verbe avec son sujet » 5e et 72 « L’accord du participe passé » 4e, 73 « Les mots invariables » 5e, 74 « Les consonnes doubles » 6e et 75 « Les homophones ce / se, ces / ses » 6e), 2 cours de primaire (dont le n° 59, CM2 « La préposition »), 1 fiche pédagogique (id 10001), 3 annales vraies (20002 BEPC juillet 2025 Dictée-Questions, 20003 BEPC blanc mai 2025 Dictée-Questions, 20004 BEPC juillet 2025 Expression écrite) ; prochaine : an 5 (id 20005), 52 séries d’exercices (id 30001 à 30052 : CM2, 6e, 5e, 4e et 3e), prochaine : ex 53 (id 30053) ; reste des cours sans série à compléter par lots, 43 évaluations (40001 à 40003 : modèles ; 40004 à 40013 : 10 devoirs de grammaire en 6e, 5e, 4e et 3e ; 40014 à 40023 : 10 devoirs de conjugaison en 6e, 5e et 3e ; 40024 à 40043 : 20 devoirs de grammaire, vocabulaire, orthographe et conjugaison en 6e, 5e, 4e et 3e ; réservées aux enseignants), prochaine : ev 44 (id 40044).
- Dernier id de cours : **75**. Commande pour le vérifier : `ls contenu/cours/*/ | sort -n | tail -3`
- Version du cache : `VERSION` dans `sw.js` (actuellement `v159`).
- Accès gratuit pour l'instant ; abonnement par codes d'activation en place (voir la section dédiée plus bas).

## Connexion et base de données (Supabase) : déjà en place, ne pas refaire
- Projet Supabase actif ; `SUPABASE_URL` et `SUPABASE_ANON_KEY` (clé publique `sb_publishable_…`) sont **déjà renseignées** dans `login-app.html`. Ne jamais demander ni écrire la clé `service_role` / « secret ».
- Connexion par **e-mail + mot de passe uniquement** (pas de Google/Apple/Facebook : boutons retirés). **« Confirm email » est désactivé** : l'inscrit entre directement. « Mot de passe oublié » = code à 6 chiffres envoyé par e-mail (SMTP Gmail configuré ; le modèle d'e-mail « Reset password » doit contenir `{{ .Token }}`).
- Tables (scripts à lancer à la main dans Supabase > SQL Editor) : `supabase/01-auth.sql` → `profiles` ; `supabase/02-user-data.sql` → `user_data` (une ligne par utilisateur, RLS : chacun ne voit que la sienne).
- **Sauvegarde du compte** : à la fin de `data.js`, les clés `SYNC_KEYS` (favs, cart, studied, parts, scores, rates) sont copiées dans `user_data` (envoi 2 s après un changement, lecture au plus toutes les 3 min, fusion si conflit). Les **achats/abonnements (bought, sub, pending, subpending) ne sont jamais envoyés**.
- Clés `localStorage` liées : `sb_session`, `sb_conf` (URL + clé pour `data.js`), `auth_mode`, `sync_at`, `sync_dirty` (toutes effacées à la déconnexion).
- Accès **gratuit** : `GRATUIT = true` dans `data.js` (abonnements et paiements « bientôt disponibles », volontairement laissés de côté pendant le développement).
- Plan Supabase gratuit : pause après 7 jours d'inactivité (passer au plan Pro avant le lancement public).
- Pas encore fait (idées) : mise à jour de `profiles` quand pseudo/cycle changent ; formulaire de contact → table Supabase ; protection des contenus payants et paiements (chantier futur) ; bouton « Valider mon adresse e-mail ».

## Abonnement par codes d'activation (phase 1 faite ; pas de PawaPay : pas d'entreprise enregistrée)
- Formules : mensuel 30 j, trimestriel 90 j, annuel 365 j. Enseignants 2 500 / 5 000 / 10 000 FCFA ; élèves 1 000 / 2 000 / 3 000 FCFA. Le tarif est lié au **code** (colonne `profil`), choisi par l’administrateur dans `admin.html`. À garder identiques dans `PLANS` (`data.js`), `TARIFS` (`admin.html`) et `public.formule()` (`supabase/03-abonnement-codes.sql`).
- Parcours : le client contacte l'administrateur (`contact.html?sujet=abonnement`), paie en Mobile Money, reçoit un code (ex. `K7QM-4XPD-9TWE`, usage unique) et le saisit dans `abonnement.html` ; la fonction SQL `activer_code` (atomique) crée ou prolonge son abonnement (table `abonnements`). Max 5 essais ratés / 10 min.
- Administrateur : `admin.html` (générer, lister, noter, annuler des codes ; réservé aux comptes de la table `admins`, voir `supabase/LISEZMOI.md` §8). Pas de lien depuis les menus : on l'ouvre par son adresse.
- `ACHAT=false` dans `data.js` : pas d'achat à l'unité (panier désactivé, boutons « S'abonner »). `GRATUIT=true` reste actif tant qu'on ne l'a pas mis à `false`.
- `data.js` : `sbRpc()` et `subRefresh()` ; la copie locale `sub` est relue depuis Supabase (3 min). **Phase 2 à faire** : les parties payantes sont encore des fichiers publics (`contenu/`) ; il faut les déplacer dans Supabase, lisibles seulement par les abonnés, avant de passer `GRATUIT` à `false` pour de vrai.

## Fiches pédagogiques : accès par abonnement (v155)
- **Fiche du professeur : gratuite. Page de l’apprenant et corrigé : réservés aux abonnés** (quand `GRATUIT=false`). Dans `fiche.js`, un non-abonné qui ouvre `#apprenant` ou `#corrige` est redirigé vers `abonnement.html` (ou vers la connexion s’il n’est pas connecté) ; les onglets verrouillés portent un cadenas. `pdf.html` : `p=prof` libre, `p=apprenant` réservé. Sur la page de présentation d’une fiche, une pastille « Abonnés » marque ces deux parties.
- Les fiches fn 2 à 11 (id 10002 à 10011, 3e, titres « Fiche modèle n° 1 (test) » à « n° 10 ») sont des **squelettes de test** : textes marqués « modèle de test », à remplacer ou supprimer avant publication (supprimer le fichier de `contenu/fiches/college/`, relancer le générateur).
- Rappel : les fichiers `contenu/fiches/…json` restent publics ; la protection côté serveur relève de la phase 2.

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
