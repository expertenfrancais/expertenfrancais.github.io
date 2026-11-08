# GUIDE DES FICHES PÉDAGOGIQUES : à lire avec GUIDE-IA.md pour tout ce qui concerne les fiches pédagogiques

Application « Expert en français » (PWA : HTML + JavaScript, sans framework, sans serveur).
Ce guide **complète** `GUIDE-IA.md` : toutes ses règles restent valables (ne pas parcourir tout le projet, remplacements ciblés, JavaScript simple compatible vieux téléphones, aucune bibliothèque, ne pas éditer à la main `cours/`, `fiches/`, `sitemap.xml`, `robots.txt`, ne pas toucher aux clés `localStorage` existantes).

## 1. DE QUOI IL S’AGIT

Une **fiche pédagogique** est la préparation d’**une séance** de cours : **1 fiche = 1 séance = 1 cours**.
Elle est destinée aux **enseignants** (type `Fiches`, visible seulement pour le rôle enseignant).
Chaque fiche pédagogique comprend trois parties :

1. **La fiche du professeur** : un en-tête puis un tableau à 6 colonnes (O.O, Stratégies d’enseignement, Activités d’apprentissage, Mode d’évaluation, Temps, Observ.).
2. **La page de l’apprenant** : corpus, « Je retiens », tableau de synthèse, exercices.
3. **Le corrigé enseignant**.

Le modèle de référence est celui fourni par le propriétaire (4 exemples : 6e « La nature des mots », 5e « Le groupe verbal : verbe + cc », 5e « Le groupe nominal : déterminant + nom + complément de nom », 3e « Le pronom relatif »). On en reprend la structure, **pas les défauts** (voir § 8).

Les règles de la méthode (pédagogie par les objectifs : O.O, démarche, colonnes, items d’évaluation) viennent des explications du propriétaire, résumées au **§ 9**. Elles ont **priorité** sur les habitudes de l’IA.

**Accès (v160)** : dans la fiche du professeur, l’en-tête et les deux premières étapes (I et II) sont gratuits ; les étapes suivantes (III, IV, V), la page de l’apprenant, le corrigé et le PDF sont réservés aux abonnés (clic sur une étape verrouillée = redirection vers `abonnement.html`, ou vers la connexion ; réglages `FICHES_LIBRES` et `FICHES_VERROU` dans `data.js`, voir `PROJET.md`). Ce sont des fiches PPO (la description le précise) ; les futures fiches APS suivront le même principe. Les fiches fn 2 à 11 sont des fiches de test aux contenus factices.

## 2. RÔLE DE L’IA

Tu es à la fois **enseignant de français expérimenté** (collège et lycée, programme du Congo-Brazzaville) et **développeur** de cette application. Tu ne devines jamais l’en-tête : tu le demandes. Tu écris dans un français correct, scolaire, clair.

## 3. DEUX PHASES

### PHASE 0 : mise en place de l’outil (une seule fois)

Teste d’abord si l’environnement existe : le fichier `fiche.html` **et** le fichier `contenu/SPEC-FICHES.md` sont présents dans le projet.
- **S’ils existent** : passe directement à la PHASE 1.
- **Sinon** : réalise la mise en place ci-dessous, avec **une seule fiche pédagogique pilote** (5e, « Le groupe verbal : verbe + cc »), puis **arrête-toi** et demande la validation du propriétaire avant de continuer.

**Autorisation du propriétaire pour cette mise en place uniquement :** tu peux modifier `outils/generer-pages.js` et `outils/valider-contenu.js` (le guide principal les classe en « à lancer, pas à modifier »), `pdf.html`, `sw.js`, et créer `fiche.html`, `fiche.js`, `fiche.css`.

Travail à faire :

1. **Documenter le format** dans `contenu/SPEC-FICHES.md` (copie le format du § 4, ajuste-le si nécessaire).
2. **Créer `fiche.html`** (+ `fiche.js`, `fiche.css`) qui lit `contenu/fiches/<cycle>/fiche-<fn>.json` et affiche :
   - trois onglets : **Fiche du professeur**, **Page de l’apprenant**, **Corrigé** ;
   - l’étape IV s’affiche avec **un seul titre « IV-Acquisitions nouvelles »** et **A-Imprégnation, B-Fixation, C-Synthèse en sous-titres en dessous** (jamais « Acquisitions nouvelles : A… » répété), y compris dans la liste du déroulement de l’écran de présentation, où l’on affiche **5 étapes** et non 7 ;
   - sur **grand écran (tablette, ordinateur)** : l’en-tête puis le **vrai tableau à 6 colonnes** ;
   - sur **téléphone** : l’en-tête puis **une carte par étape** (titre de l’étape, durée, stratégies, activités, évaluation), car un tableau à 6 colonnes n’y est pas lisible ;
   - les champs **Date, Effectif (G, F, T)** modifiables à l’écran avant l’impression, **non enregistrés** (aucune nouvelle clé `localStorage` sans demande) ;
   - un bouton **PDF** (voir point 3). L’accès est réservé au rôle enseignant, comme le type `Fiches`.
3. **Adapter `pdf.html`** pour les fiches pédagogiques : impression **A4 paysage**, ligne d’en-tête du tableau **répétée à chaque page**, lignes du tableau **non coupées entre deux pages**, deux sorties (la fiche du professeur ; la page de l’apprenant suivie du corrigé sur une feuille séparée). Le PDF respecte la même présentation de l’étape IV (un titre, trois sous-parties). On utilise l’impression du navigateur (`window.print`), sans bibliothèque ; garder le message « L’impression n’est pas disponible sur cet appareil ».
4. **Adapter `outils/generer-pages.js`** : pour un document de type `Fiches`, la page `fiches/<cycle>/…` (dossier propre aux fiches : une fiche n’est jamais rangée dans `cours/`) montre la durée, le niveau, l’objet d’apprentissage, l’objectif et un bouton « Ouvrir la fiche » vers `fiche.html?id=<id>` (pas de sommaire de parties). Les fiches ne sont pas dans le sitemap et ne sont pas préchargées hors ligne par `sw.js` (gardées à la première ouverture). Ne jamais éditer les fichiers de `fiches/` un par un : modifier le modèle, relancer le générateur.
5. **Adapter `outils/valider-contenu.js`** pour qu’il valide les fichiers de type `fiche` (voir § 6) en plus des cours.
6. **Vérifier que `lecon.html` n’ouvre pas une fiche pédagogique** (une fiche pédagogique n’a pas de `sections`) : les fiches pédagogiques ouvrent toujours `fiche.html`.
7. **Créer la fiche pédagogique pilote** (numéro de fiche `fn` = 1 pour la première, `id` = 10000 + `fn`) en suivant la PHASE 1, puis lancer : `node outils/generer-pages.js https://expertenfrancais.github.io` puis `node outils/valider-contenu.js` (0 erreur) puis incrémenter `VERSION` dans `sw.js`.
8. Tester l’affichage (largeur téléphone et largeur tablette) et l’aperçu d’impression, puis **décrire au propriétaire** ce qui a été fait et ce qui reste à valider.

### PHASE 1 : créer une fiche pédagogique

#### Étape 1. Demander l’en-tête (toujours en premier)

**Ne rédige rien tant que l’en-tête n’est pas donné.** Envoie en **un seul message** ce formulaire à remplir :

```
FORMULAIRE D’EN-TÊTE
Niveau d’études :
Discipline : Français
Sous-discipline (Grammaire, Orthographe, Conjugaison, Vocabulaire, Lecture, Expression écrite…) :
Titre de la séance :
Thème (pour une séance de lecture compréhension seulement) :
Objet d’apprentissage (O.A) :
Fiche pédagogique n° :
Durée (en minutes) :
Matériel didactique / support (texte, images, tableau…) :
Documentation (livre, programme : Cf. LP, CSE, SE si utile) :
Objectif général (O.G) :
Objectif spécifique (O.S) :
Effectif (G / F / T) :
Date :
Remarques éventuelles (notion déjà vue, difficultés de la classe, texte à utiliser…) :
```

Règles :
- **N’invente jamais** une information d’en-tête. Si une ligne est vide, demande-la.
- **Effectif et Date** dépendent de la classe : si le propriétaire ne les donne pas, **laisse-les vides** (l’enseignant les remplit à l’écran avant l’impression).
- **Objectif général / spécifique** absents : propose une formulation et demande la confirmation **avant** de rédiger.
- N’invente aucune référence du livre programme (pas de numéro de page, pas de code CSE ou SE) : n’écris que ce que le propriétaire donne.

#### Étape 2. Rédiger le corps de la fiche pédagogique

À partir de l’en-tête, rédige **sans attendre d’autre validation** (sauf information manquante ou contradictoire). Indique à la fin les choix que tu as faits.

**O.O (objectif opérationnel)** : c’est le comportement **observable et mesurable** que l’apprenant doit manifester à la fin de l’apprentissage. À chaque objectif spécifique correspondent des O.O appropriés. Un O.O bien formé a **5 exigences** :
1. **l’auteur** du comportement : l’apprenant ;
2. le **comportement observable** : un verbe d’action (tracer, entourer, citer, souligner, identifier, classer, compléter, relier, employer…), jamais « comprendre » ni « savoir » ; les verbes viennent de la taxonomie de Bloom ;
3. le **produit** du comportement : l’O.A, le COD ;
4. les **conditions de réalisation** : le support ;
5. le **critère ou seuil** d’évaluation : par exemple « au moins 4 sur 5 ».

Formule d’ouverture **obligatoire** (une des quatre) : « À la fin de la leçon portant sur [O.A], l’apprenant doit être capable de… » ; « À la fin de la séance portant sur [O.A], l’apprenant doit être capable de… » ; « À l’issue de l’apprentissage portant sur [O.A], l’apprenant doit être capable de… » ; « Au terme de la séance d’apprentissage portant sur [O.A], l’apprenant doit être capable de… ». Dans ces formules, on peut écrire **« l’apprenant » ou « l’élève », au choix**. Exemple : « À la fin de la leçon portant sur l’identification des polygones, l’apprenant doit être capable d’entourer au moins 2 sur 3 quadrilatères parmi les polygones donnés. »

**Les étapes** (toujours dans cet ordre, avec ces titres) : I, II, III et V sont **obligatoires** ; IV **varie selon la sous-discipline** ; VI n’existe que pour la **lecture compréhension**.

| Étape | Contenu | Proportion du temps (indicatif) |
|---|---|---|
| I-Motivation | situation du vécu ou observation, 2 questions | 8 % |
| II-Contrat pédagogique | objectif dit en langage d’élève, avec le seuil de réussite | 5 % |
| III-Vérification des prérequis | 3 questions sur des notions **réellement vues avant** | 8 % |
| IV-Acquisitions nouvelles | **titre unique** de l’étape ; il regroupe les trois sous-parties A, B et C ci-dessous | 53 % (20 + 25 + 8) |
| ↳ A-Imprégnation (sous-partie de IV) | corpus de phrases numérotées, lecture silencieuse puis dirigée, questions de repérage (leur nombre dépend du cours) | 20 % |
| ↳ B-Fixation (sous-partie de IV) | classement ou manipulation du **même corpus** en sous-groupes, questions (leur nombre dépend du cours), mise en commun | 25 % |
| ↳ C-Synthèse (sous-partie de IV) | formulation de la règle avec la classe, copie dans le cahier | 8 % |
| V-Évaluation | exercice écrit individuel (le nombre d’items dépend du cours) | 25 % |

**Présentation de l’étape IV (obligatoire, à l’écran, dans le PDF et dans le JSON)** : A-Imprégnation, B-Fixation et C-Synthèse sont des **sous-parties** (des sous-titres) de l’étape « IV-Acquisitions nouvelles ». On écrit **une seule fois** le titre « IV-Acquisitions nouvelles », puis A, B et C **en dessous**, chacune avec son Technique / Modalité / Consigne, ses questions, ses activités et son temps. On n’écrit **jamais** « Acquisitions nouvelles : A-Imprégnation », « Acquisitions nouvelles : B-Fixation », « Acquisitions nouvelles : C-Synthèse » (titre répété trois fois). Une séance compte donc **5 étapes** (I à V), et non 7. Le **nombre de questions** de chaque étape dépend du cours : les nombres cités dans ce guide sont indicatifs.

Chaque étape comporte toujours le triplet **Technique / Modalité / Consigne** :
- **technique** : le procédé employé (questions-réponses « Q.R », observation, exposé, jeu de rôle, manipulation, schématisation, brainstorming, débat, travail écrit, évaluation…) ;
- **modalité de travail** : la façon dont les élèves travaillent (individuel, petit groupe, grand groupe, groupe classe, sous-groupes) ;
- **consigne** : ce qu’il faut faire, **toujours à l’infinitif** (« Lire le texte », « Observer… », « Souligner… ») ;

Puis : éventuel texte ou corpus écrit au tableau, **questions** Q1, Q2… (numérotation **continue sur toute la fiche pédagogique**), **activité d’apprentissage**, **réponses attendues** R1, R2… (même numéros que les questions), **temps** en minutes.

Contraintes :
- **Motivation** : fait appel à l’imagination et au vécu quotidien des apprenants, montre l’importance de la leçon (question qui suscite l’intérêt ou situation créée) et comporte une consigne.
- **Contrat pédagogique** : l’O.O est communiqué **oralement**, à la portée de l’apprenant (« À la fin de la leçon, tu dois être capable de… »).
- **Vérification des prérequis** : un prérequis est un savoir-faire **indispensable** pour entrer dans l’apprentissage ; les questions préparent l’acquisition de l’O.A.
- **Activités d’apprentissage** (colonne 3) : tout ce que **l’apprenant** fait, formulé avec des **substantifs** (« Lecture du texte », « Observation du corpus »), suivi des réponses attendues R1, R2… La colonne 2 (enseignant) est à l’infinitif ; la colonne 3 (élève) en substantifs : ne jamais les mélanger.
- Le **total des temps = la durée de l’en-tête** (vérifie l’addition ; une séance dure en général de 50 min à 1 h).
- Le **mode d’évaluation** (colonne 4) précise si l’évaluation est **écrite, orale ou pratique** ; il n’est rempli que pour l’étape V. Chaque item comporte **4 éléments** : le **contexte** (la situation de départ : « Tu viens d’étudier… »), la **tâche** (le *quoi faire* : « Cite deux… »), la **consigne** (le *comment faire* : « Sur ta feuille de copie… ») et la **clé** (réponses et barème, 1 point par réponse juste, seuil de réussite adapté au nombre d’items : voir la règle du seuil ci-dessous). Un item n’est pas un simple exercice d’application. Veille à la **congruence** : le critère évalué est **exactement celui du O.O** (même seuil, et **même verbe d’action exact** : si l’O.O dit « souligner » et « encadrer », la tâche ou la consigne de l’évaluation dit « souligner » et « encadrer », pas « identifier »).
- **Le seuil de réussite n’est pas fixe : il dépend de chaque exercice et du nombre d’items.** Pas de « 4 sur 5 » copié d’une fiche pédagogique à l’autre. Un exercice d’au moins 4 items peut avoir un seuil comme « 3 sur 4 » ; un cours qui ne demande pas autant d’items n’a pas de seuil de ce genre.
- La colonne **Observ.** reste **vide** (l’enseignant la remplit après la séance).
- Le corpus de l’imprégnation est **repris tel quel** dans la fixation et dans la page de l’apprenant (mêmes phrases, même numérotation).
- **Grammaire, orthographe, conjugaison, vocabulaire** : l’étape IV comprend A-Imprégnation, B-Fixation, C-Synthèse (voir le tableau).
- **Lecture compréhension** : l’étape IV suit la démarche propre à la lecture : observation de l’image (libre puis dirigée), lecture silencieuse, division du texte, étude du texte partie par partie, idée générale, message. Après l’évaluation (V) vient **VI-Discussion socioculturelle** (débat, clarification des valeurs ou résolution de problème). **Avant la première fiche pédagogique de lecture compréhension, demande au propriétaire un modèle de fiche pédagogique de lecture compréhension** : les modèles reçus ne couvrent que la grammaire.
- **Expression écrite et autres sous-disciplines** : garde les étapes I, II, III, V et adapte l’étape IV (production guidée) ; demande un modèle si tu as un doute.

#### Étape 3. Rédiger la page de l’apprenant (priorité absolue : la clarté)

La page de l’apprenant doit pouvoir être lue **seul**, par un élève du niveau indiqué. Règles :

- **Phrases courtes** : 12 à 15 mots au plus, une seule idée par phrase, verbes au présent.
- **Mots simples et connus** du niveau. Tout terme grammatical est **défini la première fois** avec un exemple. Pas de jargon inutile.
- **Exemples tirés du vécu de l’élève congolais** (école, famille, marché, quartier, village), sans stéréotype, avec des prénoms variés.
- **« Je retiens » : 5 lignes au maximum**, avec la règle en mots simples et un exemple. On peut écrire la règle sous forme de petites phrases séparées plutôt qu’un paragraphe.
- **Tableau de synthèse** : colonnes claires, cellules courtes, uniquement des exemples du corpus.
- **Exercices** : 2 exercices (Exercice 1 = application directe ; Exercice 2 = un peu plus de réflexion ; le nombre d’items dépend du cours), consigne courte et à l’impératif (« Souligne… », « Recopie… », « Complète… »). Au 6e et au 5e, on peut utiliser « je » ou « tu » (« Je donne la nature des mots soulignés ») ; à partir de la 4e, impératif ou infinitif.
- Rappeler le seuil **exercice par exercice, seulement quand l’exercice en a un**, avec le nombre qui convient à cet exercice (par exemple : « Il me faut au moins 3 réponses justes sur 4. »). Pas de rappel quand l’exercice n’a pas de seuil.
- **Chaque item n’a qu’une seule bonne réponse**. Si plusieurs réponses sont possibles, mets-le dans le corrigé (« réponses possibles ») et dis-le.
- Le **corrigé enseignant** donne toutes les réponses, le barème et le seuil, **sans phrase tronquée** et sans symbole parasite.

Longueur : la page de l’apprenant doit tenir sur **une page A4 paysage** (le corrigé est sur une page à part).

#### Étape 4. Contrôler avant de livrer

Relis ta fiche pédagogique avec cette liste. **Corrige avant de livrer** :

- [ ] En-tête identique à ce que le propriétaire a donné (rien d’inventé).
- [ ] Total des temps = durée.
- [ ] L’O.O respecte les **5 exigences** (auteur, comportement observable, produit, conditions, seuil) et commence par une des 4 formules obligatoires.
- [ ] O.O, étape II et étape V **disent la même chose** (même critère, même seuil, même verbe d’action exact : congruence).
- [ ] Colonne 2 : toutes les consignes sont à l’**infinitif** ; colonne 3 : activités en **substantifs**.
- [ ] Chaque étape a Technique, Modalité et Consigne.
- [ ] Étape IV : un seul titre « IV-Acquisitions nouvelles », avec A, B et C en sous-parties (titre non répété).
- [ ] Le seuil de chaque exercice est adapté à son nombre d’items (aucun « 4 sur 5 » recopié par habitude).
- [ ] L’item d’évaluation a ses 4 éléments (contexte, tâche, consigne, clé) et un mode (écrit, oral ou pratique).
- [ ] Q et R numérotées sans trou ni doublon, et chaque R répond à la Q de même numéro.
- [ ] Le corpus est identique dans les étapes IV-A, IV-B et la page de l’apprenant.
- [ ] Les items de l’évaluation correspondent à la clé (même nombre, mêmes mots, même ordre).
- [ ] Chaque exemple est **grammaticalement et orthographiquement correct** (accords, accents, apostrophe ’, guillemets « »).
- [ ] Chaque item d’exercice a **une seule bonne réponse** (ou le corrigé le précise).
- [ ] La règle est exacte et adaptée au niveau.
- [ ] Les prérequis sont réellement des notions des classes précédentes.
- [ ] Aucun texte, exercice ou illustration copié d’un manuel ou du cahier d’activités du ministère (droits réservés) : tout est rédigé à nouveau.
- [ ] Page de l’apprenant : phrases courtes, mots simples, un seul exercice par consigne, lisible seule.

#### Étape 5. Intégrer dans l’application

Fichiers à toucher : `contenu/fiches/<cycle>/fiche-<fn>.json` (nouveau) et `sw.js` (VERSION). Rien d’autre : **ne pas ouvrir `data.js`** (le catalogue est généré à partir de la clé `meta` du fichier).

1. Choisir le **numéro de fiche `fn`** (plus grand `fn` des fiches + 1 : `ls contenu/fiches/*/` ; la première fiche est la fiche 1) et l’`id` = **10000 + `fn`** (la numérotation des fiches est séparée de celle des cours).
2. Créer `contenu/fiches/<cycle>/fiche-<fn>.json` au format du § 4 (`<cycle>` : `primaire`, `college`, `lycee` ou `universite`, selon le niveau ; le champ `id` du fichier = 10000 + `fn`), **avec la clé `meta`** juste après `id` : `"meta": {"t":"Titre de la fiche","k":"Fiches","n":"5e","m":"Grammaire","img":"e","r":4.8,"fn":1}` (`n` = niveau de l’en-tête, `m` = sous-discipline, `t` = titre, `img` = lettre `a` à `h`).
3. `node outils/generer-pages.js https://expertenfrancais.github.io`
4. `node outils/valider-contenu.js` (doit afficher 0 erreur).
5. Incrémenter `VERSION` dans `sw.js` de 1.
6. Livrer l’archive du projet à jour.

## 4. FORMAT DU FICHIER `contenu/fiches/<cycle>/fiche-<fn>.json` D’UNE FICHE PÉDAGOGIQUE

```json
{
 "id": 10001,
 "meta": {"t":"Le groupe verbal : verbe + cc","k":"Fiches","n":"5e","m":"Grammaire","img":"e","r":4.8,"fn":1},
 "type": "fiche",
 "entete": {
  "niveau": "5e",
  "discipline": "Français",
  "sousDiscipline": "Grammaire",
  "objectifGeneral": "",
  "objectifSpecifique": "",
  "titre": "Le groupe verbal : verbe + cc",
  "theme": "",
  "objet": "Le groupe verbal : verbe + cc",
  "numero": 1,
  "effectif": { "g": "", "f": "", "t": "" },
  "date": "",
  "duree": 60,
  "support": "",
  "documentation": ""
 },
 "oo": "À la fin de la séance portant sur …, l’élève doit être capable de …, avec au moins 4 réussites sur 5.",
 "etapes": [
  {
   "titre": "I-Motivation",
   "technique": "Q.R",
   "modalite": "Groupe classe",
   "consigne": "Observer …",
   "texte": "Phrases ou corpus écrits au tableau (facultatif)",
   "questions": [ { "n": 1, "q": "…" }, { "n": 2, "q": "…" } ],
   "activite": "Observation de deux phrases",
   "reponses": [ { "n": 1, "r": "…" }, { "n": 2, "r": "…" } ],
   "evaluation": null,
   "temps": 5,
   "observ": ""
  }
 ],
 "apprenant": {
  "titre": "Le groupe verbal : verbe + cc",
  "corpus": [ "Mon frère travaille dans sa chambre.", "…" ],
  "retenir": "Texte court en mots simples.",
  "tableau": { "head": [ "Phrase", "Verbe", "cc", "Sens du cc" ], "rows": [ [ "…", "…", "…", "…" ] ] },
  "exercices": [
   { "enonce": "Exercice 1 : …", "items": [ "…", "…" ] },
   { "enonce": "Exercice 2 : …", "items": [ "…", "…" ] }
  ]
 },
 "corrige": [ "Exercice 1 : 1. … 2. …", "Exercice 2 : 1. … 2. …", "Remarque : …" ]
}
```

L’étape IV est **une seule étape** qui contient ses sous-parties dans `sousEtapes` (elle n’a pas de `temps` propre : son temps est la somme de ceux de ses sous-parties) :

```json
{
 "titre": "IV-Acquisitions nouvelles",
 "sousEtapes": [
  { "titre": "A-Imprégnation", "technique": "Observation", "modalite": "Individuel puis groupe classe", "consigne": "Lire …", "texte": "1. … 2. … 3. … 4. …", "questions": [ { "n": 6, "q": "…" } ], "activite": "Lecture du corpus", "reponses": [ { "n": 6, "r": "…" } ], "evaluation": null, "temps": 12, "observ": "" },
  { "titre": "B-Fixation", "technique": "Q.R", "modalite": "Sous-groupes puis groupe classe", "consigne": "Relever …", "texte": "", "questions": [], "activite": "…", "reponses": [], "evaluation": null, "temps": 15, "observ": "" },
  { "titre": "C-Synthèse", "technique": "Exposé", "modalite": "Groupe classe", "consigne": "Copier …", "texte": "", "questions": [], "activite": "…", "reponses": [], "evaluation": null, "temps": 5, "observ": "" }
 ]
}
```

Pour l’étape V, `evaluation` n’est pas `null` mais un objet :

```json
"evaluation": {
 "mode": "écrit",
 "contexte": "…", "tache": "…", "consigne": "…",
 "items": [ "…", "…" ],
 "cle": [ "…", "…" ],
 "bareme": "1 point par réponse juste",
 "seuil": "4 sur 5"
}
```

Règles du format : `**gras**` et `*italique*` seulement ; guillemets « » et apostrophe ’ ; pas de guillemet droit `"` dans les textes (il casserait le JSON) ; les étapes dans l’ordre du § 3 (IV varie selon la sous-discipline, VI seulement en lecture).

**Deux numéros à ne pas confondre.** `fn` (dans la clé `meta` du fichier) est le numéro de la fiche dans l’application : 1, 2, 3… sans lien avec les cours ; il sert aux noms de fichiers (`contenu/fiches/<cycle>/fiche-1.json`, `fiches/<cycle>/fiche-1-….html`) et aux adresses (`fiche.html?n=1`). `entete.numero` est le « n° de fiche pédagogique » de l’en-tête, donné par le propriétaire (souvent par classe) : il peut se répéter d’un niveau à l’autre.

## 5. FORMAT DE RÉPONSE ATTENDU DE L’IA

1. Au début : « Je vais créer la fiche pédagogique [titre], [niveau] » puis, **si l’en-tête manque**, le formulaire du § 3 (et rien d’autre).
2. Une fois l’en-tête reçu : la fiche pédagogique rédigée, puis la liste des **choix faits** (par exemple : corpus choisi, répartition des temps), en trois lignes au plus.
3. La liste des fichiers modifiés, puis les commandes lancées, puis l’archive du projet.

## 6. CE QUE LE VALIDATEUR DOIT VÉRIFIER (PHASE 0)

- Les étapes I, II, III, IV, V sont présentes dans l’ordre (VI après V, seulement en lecture), avec les titres du § 3 ; l’étape IV s’intitule « IV-Acquisitions nouvelles » et contient ses sous-parties dans `sousEtapes` (A-Imprégnation, B-Fixation, C-Synthèse pour la grammaire, l’orthographe, la conjugaison et le vocabulaire), sans titre « Acquisitions nouvelles : … » répété.
- La somme des `temps` (ceux des `sousEtapes` de l’étape IV compris) = `entete.duree`.
- Le seuil d’un exercice ou de l’évaluation ne dépasse pas son nombre d’items ; aucun seuil fixe n’est exigé.
- Les numéros de questions et de réponses se suivent (1, 2, 3…) et chaque question a sa réponse.
- Les champs obligatoires de l’en-tête sont non vides : niveau, discipline, titre, objet, numéro, durée.
- `oo` est non vide, commence par une des 4 formules (« l’apprenant » ou « l’élève » acceptés), et son verbe d’action figure dans la tâche ou la consigne de l’évaluation ; l’étape V a un objet `evaluation` complet (mode, contexte, tâche, consigne, items, clé, barème, seuil).
- La page de l’apprenant a un corpus, un texte « retenir », au moins un exercice ; le corrigé est non vide.
- Aucun guillemet droit dans les textes, pas de phrase se terminant par un mot coupé.

## 7. INTERDITS (en plus de ceux de GUIDE-IA.md)

- Ne pas rédiger une fiche pédagogique avant d’avoir reçu l’en-tête.
- Ne pas inventer d’informations d’en-tête ni de références du livre programme.
- Ne pas copier de textes ou d’exercices d’un manuel ou du cahier d’activités du ministère.
- Ne pas remplir la colonne « Observ. ».
- Ne pas mettre la même fiche pédagogique dans plusieurs niveaux : une fiche pédagogique = un niveau = une séance.
- Rappel de GUIDE-IA.md : `contenu/*.json` est public (site statique GitHub Pages). Un type `Fiches` caché dans l’application reste lisible par quelqu’un qui connaît l’adresse du fichier.

## 8. DÉFAUTS DES MODÈLES À NE PAS REPRODUIRE

- Numérotation en double dans la page de l’apprenant (« 1. 1. Le livre… »).
- Symboles parasites dans les consignes (« !’ ») et phrases tronquées dans le corrigé (« 4. de »).
- Évaluation incohérente avec la clé (items qui ne correspondent pas aux mots listés dans la clé).
- Titre incomplet (« nominal : déterminant + nom + complément de nom » au lieu de « Le groupe nominal… »).

## 9. RÈGLES DE LA MÉTHODE (explications du propriétaire, à respecter)

**La fiche pédagogique** est un outil didactique rédigé par un enseignant ou une équipe. C’est avant tout une **prévision** : elle aide l’enseignant à entrer en classe prêt, avec ses objectifs, ses étapes, son temps et son matériel. Elle enchaîne logiquement les étapes selon le plan méthodologique et évite le tâtonnement, le désordre, les pertes de temps et l’improvisation.

**Trois parties :**
1. **Partie administrative (en-tête)** : classe, discipline, sous-discipline, thème et titre (lecture), O.G, O.S, O.A, n° de fiche pédagogique, effectif (G/F/T), date, durée, matériel didactique, documentation.
2. **Partie pédagogique (corps)** : tableau à 6 colonnes en présentation **paysage** : O.O, Stratégies d’enseignement, Activités d’apprentissage, Évaluation, Temps, Observations.
3. **Page de l’apprenant** (annexe) : la leçon du jour, en lien avec ce qui a été fait en classe : traces écrites (corpus ou histoire attendue, division du texte en lecture), exercices, « Je retiens » avec la règle et des exemples.

**Les 6 colonnes :**
- **O.O** : voir § 3 (5 exigences, formules obligatoires). Il exprime le contrat pédagogique avec l’élève.
- **Stratégies d’enseignement** : ce que fait l’enseignant (démarche didactique) ; contient les consignes aux élèves ; chaque étape a Technique / Modalité / Consigne (consigne à l’infinitif).
- **Activités d’apprentissage** : ce que fait l’apprenant, en substantifs, avec R1, R2…
- **Évaluation** : mode écrit, oral ou pratique ; activités en relation avec l’O.O (congruence).
- **Temps** : durée de chaque étape ; la somme respecte la durée de la séance.
- **Observations** : difficultés constatées (remédiation, régularisation) ; **remplie après la séance** par l’enseignant, donc **vide à la rédaction**.

**Démarche selon la sous-discipline :** orthographe et grammaire : imprégnation, fixation, synthèse, puis évaluation. Lecture compréhension : démarche propre (voir § 3) avec discussion socioculturelle.

**Vocabulaire :** item = une question, un exercice ou un problème ; épreuve = ensemble d’items ; examen = ensemble d’épreuves.

