# GUIDE POUR L'INTELLIGENCE ARTIFICIELLE : à lire AVANT toute modification

Application de cours de français (PWA : pages HTML + JavaScript, sans framework, sans serveur).

## RÈGLE D'OR
**Lis d'abord `PROJET.md`** (état du projet en quelques lignes), il évite de réanalyser le projet.
**Ne parcours pas et n'analyse pas tout le projet.** Ouvre uniquement les fichiers que ce guide
indique pour la tâche demandée. Ne réécris jamais un fichier en entier : modifie seulement les lignes concernées.
Si un fichier n'est pas cité pour la tâche, ne l'ouvre pas.
**Économie de crédits : n'ouvre jamais `data.js` pour ajouter ou remplir un cours** (il est gros et son catalogue est généré). Pour connaître le dernier id : `ls contenu/cours/*/ | sort -n | tail -3`. Chaque type de contenu a son propre guide et son propre dossier : **cours** → ce guide ; **fiches** → `GUIDE-FICHES.md` ; **annales** → `GUIDE-ANNALES.md` ; **exercices** → `GUIDE-EXERCICES.md` ; **évaluations** → `GUIDE-EVALUATIONS.md`. Pour une tâche sur un type, lis seulement le guide de ce type et son dossier `contenu/<type>/`, jamais ceux des autres types. Ne lis jamais `cours/`, `fiches/`, `annales/`, `exercices/` ni `evaluations/` (pages générées).

## CARTE DU PROJET

| Fichier / dossier | Rôle | Modifier à la main ? |
|---|---|---|
| `contenu/cours/<cycle>/<id>.json` | **Le texte des parties d'un cours** (un fichier par cours ; `<cycle>` = `primaire`, `college`, `lycee`, `universite`) + sa carte d'identité (clé `meta`) | **OUI, c'est ici qu'on remplit un cours** |
| `contenu/fiches/<cycle>/fiche-<n>.json` | Une fiche pédagogique (voir `GUIDE-FICHES.md`) + sa clé `meta` | OUI pour les fiches |
| `contenu/annales/<cycle>/annale-<an>.json` | Une annale (sujet d'examen + corrigé) + sa clé `meta` (voir `GUIDE-ANNALES.md`) | OUI pour les annales |
| `contenu/exercices/<cycle>/exercice-<ex>.json` | Une série d'exercices pour une notion (rappel, exercices, corrigés) + sa clé `meta` (voir `GUIDE-EXERCICES.md`) | OUI pour les exercices |
| `contenu/evaluations/<cycle>/evaluation-<ev>.json` | Une évaluation (énoncé, corrigé, barème), réservée aux enseignants, + sa clé `meta` (voir `GUIDE-EVALUATIONS.md`) | OUI pour les évaluations |
| `contenu/SPEC.md` | Format des blocs (p, h, list, ex, def, tip, warn, retenir, schema, test, table, quiz, exercise) | Lire seulement |
| `contenu/_exemple.json` | Exemple de tous les blocs | Lire seulement |
| `data.js` | Niveaux, prix par cycle (`PRIX_CYCLE`), types visibles (`ALLOWED_TYPES`), fonctions partagées. Le catalogue `ALLDOCS` (bloc entre `/*CATALOGUE-AUTO:DEBUT` et `FIN*/`) est **généré** à partir des fichiers de `contenu/` | **NON pour le catalogue** (ne jamais le modifier à la main) ; OUI seulement pour changer une fonction commune, un prix de cycle ou une règle de visibilité |
| `cours/<cycle>/<id>-<titre>.html` | Page de présentation d'un cours | **NON : générée** par `outils/generer-pages.js` |
| `fiches/<cycle>/<id>-<titre>.html` | Page de présentation d'une fiche pédagogique (type `Fiches`) | **NON : générée** par `outils/generer-pages.js` |
| `annales/<cycle>/annale-<an>-<titre>.html` | Page de présentation d'une annale (type `Annales`) | **NON : générée** par `outils/generer-pages.js` |
| `exercices/<cycle>/exercice-<ex>-<titre>.html` | Page de présentation d'une série d'exercices (type `Exercices`) | **NON : générée** par `outils/generer-pages.js` |
| `evaluations/<cycle>/evaluation-<ev>-<titre>.html` | Page de présentation d'une évaluation (type `Évaluations`) | **NON : générée** par `outils/generer-pages.js` |
| `sw.js` | Cache hors ligne + numéro `VERSION` | Seulement `VERSION` (listes COURS/CONTENU = automatiques) |
| `sitemap.xml`, `robots.txt` | Référencement | **NON : générés** |
| `lecon.html` | Page de lecture d'une partie (lit le fichier de contenu, via `contentFile(d)` de `data.js`) | Seulement si on change l'affichage de la lecture |
| `blocs.js` | Affichage des blocs (quiz, exercices, tableaux…) | Seulement pour créer un **nouveau type de bloc** |
| `course.js` / `course.css` | Comportement et style de la page d'un cours | Seulement pour changer cette page |
| `index.html` | Accueil | Seulement pour changer l'accueil |
| `catalogue.html` | Catalogue, recherche, filtres | Seulement pour changer le catalogue |
| `favoris.html`, `panier.html`, `abonnement.html`, `profil.html`, `parametres.html`, `cycles.html`, `login-app.html`, `contact.html`, `pdf.html` | Une page chacune | Seulement la page demandée |
| `cours.html` | Simple page de redirection (noindex) | NON |
| `manifest.json`, `logo.png`, `icon-*.png` | Installation de l'application (PWA) et icônes | NON, sauf demande explicite |
| `outils/generer-pages.js` | Reconstruit le catalogue de `data.js`, puis génère les pages `cours/…` et `fiches/…`, sitemap, robots, listes de `sw.js` | À lancer, pas à modifier |
| `outils/catalogue.js` | Lit les clés `meta` des fichiers de `contenu/` et écrit le catalogue | À lancer indirectement, pas à modifier |
| `outils/valider-contenu.js` | Vérifie les fichiers de `contenu/` (format, `meta`, emplacement, catalogue à jour) | À lancer, pas à modifier |

## TÂCHE A : remplir un cours existant (page « démo » vide)
Fichiers à toucher : **uniquement `contenu/cours/<cycle>/<id>.json`** (l'`id` est le numéro du cours, écrit dans le fichier).
1. Lire `contenu/SPEC.md` (et `contenu/_exemple.json` si besoin).
2. Remplir le tableau `blocs` de chaque partie dans `contenu/cours/<cycle>/<id>.json`. La partie 1 est gratuite, les suivantes sont payantes.
3. Ne pas changer le nombre ni les titres (`"t"`) des parties, sauf demande explicite. Si on les change : le sommaire de la page du cours est recopié automatiquement depuis ces titres ; il suffit de relancer `node outils/generer-pages.js https://expertenfrancais.github.io`.
4. Vérifier : `node outils/valider-contenu.js` (doit afficher 0 erreur).
5. Incrémenter `VERSION` dans `sw.js` de 1 (lire le numéro actuel, ex. `"v91"` → `"v92"`) pour que les appareils reçoivent la mise à jour.
Ne rien d'autre.

Règles d'écriture des textes : `**gras**` et `*italique*` seulement ; `\n` = nouveau paragraphe ;
`quiz.answer` = numéro de la bonne option **en commençant par 0** ; chaque ligne de `table.rows` a autant
de cellules que `head` ; guillemets typographiques (« ») et apostrophe ’ dans les textes.

## TÂCHE B : ajouter un nouveau cours
**Un nouveau cours = un seul nouveau fichier.** Le catalogue (`data.js`), les pages `cours/…` et les listes de `sw.js` sont construits automatiquement. Fichiers à toucher : `contenu/cours/<cycle>/<nouvel id>.json` (nouveau) et `sw.js` (VERSION). Rien d'autre, **n'ouvre pas `data.js`**.
1. Choisir l'id : le plus grand id **de cours** + 1 (`ls contenu/cours/*/ | sort -n | tail -3` ; les fiches, type `Fiches`, ont des id à partir de 10001 : ne pas les compter). Le dernier id connu est aussi noté dans `PROJET.md` (à mettre à jour après chaque ajout).
2. Le dossier `<cycle>` se déduit du niveau `n` : CP1 à CM2 → `primaire` ; 6e 5e 4e 3e → `college` ; Seconde Première Terminale → `lycee` ; L1 L2 L3 M1 M2 Doctorat → `universite`.
3. Créer `contenu/cours/<cycle>/<id>.json` :
   `{"id":59,"meta":{"t":"Titre du cours","k":"Cours","n":"6e","m":"Grammaire","img":"a","r":4.8},"sections":[{"t":"Titre partie 1","blocs":[…]}, …]}`
   - `t` titre, `k` type (`Cours` pour un cours ; les fiches ont leur dossier `contenu/fiches/`, les annales `contenu/annales/` et les exercices `contenu/exercices/` et les évaluations `contenu/evaluations/`), `n` niveau (voir ci-dessus), `m` matière (Grammaire, Orthographe, Conjugaison, Vocabulaire, Littérature… texte libre, rester cohérent), `img` : lettre `a` à `h` (images déjà définies dans `data.js` ; ne pas ajouter d'image sans demande), `r` note (4.8 par défaut).
   - Le sommaire (titres des parties) vient des `"t"` des `sections` ; le prix est automatique (`PRIX_CYCLE` : Primaire 25, Collège 25, Lycée 50, Université 100 ; pour changer un prix, modifier `PRIX_CYCLE` dans `data.js`, valable pour tout le cycle).
   - Visibilité (`ALLOWED_TYPES` dans `data.js`) : tous les rôles voient `Cours`, `Exercices` et `Annales` ; seul le rôle **enseignant** voit en plus `Fiches`, `Évaluations` et `Programmes`.
4. Générer (reconstruit le catalogue et les pages, met à jour `sw.js`, sitemap, robots) : `node outils/generer-pages.js https://expertenfrancais.github.io`
5. Valider : `node outils/valider-contenu.js` (0 erreur ; il signale aussi un mauvais dossier, une `meta` incomplète, un catalogue pas à jour).
6. Incrémenter `VERSION` dans `sw.js`.

### Un même cours pour deux niveaux
Quand un sujet existe pour deux niveaux (ex. 4e et 3e : cours 29/30, 31/32, 33/34, 35/36), on crée **deux cours séparés** : même titre `t`, `n` différent (`"4e"` / `"3e"`), deux `id` et deux fichiers `contenu/cours/<cycle>/<id>.json` dont le contenu est **adapté à chaque niveau** (pas de copier-coller). Ne jamais fusionner ni supprimer l'un des deux sans demande.

## TÂCHE C : modifier une page de l'application (interface)
Ne toucher **que le fichier de cette page** (voir la carte). Les fonctions communes (menu du bas, thème,
stockage, prix…) sont dans `data.js` : ne les modifier que si la demande concerne toutes les pages.
Après toute modification de page : incrémenter `VERSION` dans `sw.js`.
Si la modification concerne l'aspect d'une page de cours : modifier `outils/generer-pages.js` (modèle), puis relancer le générateur,
**jamais les fichiers de `cours/`, `fiches/`, `annales/`, `exercices/` ou `evaluations/` un par un**.

## NOUVEAU TYPE DE CONTENU (programmes… ; exercices et évaluations déjà faits)
Procédure rodée avec les annales. Chaque type a son dossier, son guide et sa numérotation (cours : 1, 2, 3… ; fiches : 10000 + n ; annales : 20000 + n ; exercices : 30000 + n ; évaluations : 40000 + n ; prochain type : 50000…) :
1. Créer `contenu/<type>/<cycle>/<nom>-<n>.json` (clé `meta` + `sections`) et un premier fichier modèle complet (comme `annale-2.json`).
2. `outils/catalogue.js` : ajouter le type dans `TYPE_DIR` et sa règle (numéro `meta.<xx>` et `id`), comme pour `Annales`.
3. `data.js` : adapter `docFile` et `contentFile` (comme pour `Annales`). Le type doit figurer dans `ALLOWED_TYPES` (déjà le cas d'`Exercices`, `Évaluations`, `Programmes`). Les types déjà en place : `Cours`, `Fiches`, `Annales`, `Exercices`, `Évaluations`.
4. `outils/generer-pages.js` : ajouter le dossier à `DIRS` et une ligne `Allow` dans `robots.txt`. `outils/valider-contenu.js` : nom de fichier attendu.
5. Écrire `GUIDE-<TYPE>.md` (court, sur le modèle de `GUIDE-ANNALES.md`), puis mettre à jour `PROJET.md`, `PROMPTS.md` et la carte ci-dessus.

## INTERDITS
- Ne jamais éditer à la main les fichiers de `cours/`, de `fiches/`, d'`annales/`, d'`exercices/`, d'`evaluations/`, `sitemap.xml`, `robots.txt`.
- Ne pas toucher aux clés de stockage (`localStorage` : user_name, favs, cart, bought, sub, parts, studied, settings…) sans demande explicite.
- Ne pas ajouter de bibliothèque ni de framework. Le code reste en JavaScript simple (compatible vieux téléphones : pas de syntaxe très récente).
- Ne pas modifier le comportement du bouton Retour (`course.js`) ni la mise à jour (`parametres.html`, `sw.js`) sauf demande explicite.
- Ne pas mettre de vrais contenus payants si l'on n'a pas de serveur : `contenu/*.json` est public (site statique sur GitHub Pages). Cette règle sera à revoir le jour où les paiements et un serveur seront en place : ne pas la contourner avant.
- Ne pas modifier le prix d'un cours directement dans sa ligne `pr` : il est écrasé par `PRIX_CYCLE`.

## FORMAT DE RÉPONSE ATTENDU DE L'IA
1. Liste des fichiers qu'elle va modifier (avant de commencer).
2. Les modifications sous forme de **remplacements ciblés** (ancien texte → nouveau texte), pas de fichier complet.
3. Les commandes à lancer, dans l'ordre.
