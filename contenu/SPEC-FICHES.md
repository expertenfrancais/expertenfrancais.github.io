# Format d’une fiche pédagogique : `contenu/fiches/<cycle>/fiche-<fn>.json`

Une **fiche pédagogique** = 1 séance = 1 cours. Elle est réservée au rôle enseignant (type `Fiches`, clé `meta` du fichier avec `"k":"Fiches"` ; une fiche n’a pas de `sections`).
Les règles de rédaction sont dans `GUIDE-FICHES.md` ; les contrôles automatiques dans `outils/valider-contenu.js`.
## Numérotation (propre aux fiches)

- `fn` (dans la clé `meta` du fichier) : numéro de la fiche, 1, 2, 3… sans lien avec les cours. `id` = 10000 + `fn` (jamais de conflit avec un cours).
- Fichiers : `contenu/fiches/<cycle>/fiche-<fn>.json` ; page de présentation `fiches/<cycle>/fiche-<fn>-<titre>.html`.
- Adresses : `fiche.html?n=<fn>` (onglets `#prof`, `#apprenant`, `#corrige`) ; PDF : `pdf.html?n=<fn>&p=prof` ou `&p=apprenant` (A4 paysage).
- `entete.numero` est autre chose : le « n° de fiche pédagogique » de l’en-tête (souvent par classe).

## Structure

```json
{
 "id": 10001,
 "type": "fiche",
 "entete": {
  "niveau": "5e", "discipline": "Français", "sousDiscipline": "Grammaire",
  "objectifGeneral": "", "objectifSpecifique": "",
  "titre": "Le groupe verbal : verbe + cc", "theme": "",
  "objet": "Le groupe verbal : verbe + cc",
  "numero": 1, "effectif": { "g": "", "f": "", "t": "" }, "date": "",
  "duree": 60, "support": "", "documentation": ""
 },
 "oo": "À la fin de la séance portant sur …, l’élève doit être capable de …",
 "etapes": [ … ],
 "apprenant": { … },
 "corrige": [ "…", "…" ]
}
```

- Champs obligatoires de l’en-tête : `niveau`, `discipline`, `titre`, `objet`, `numero` (entier), `duree` (minutes). `niveau` doit être celui de `meta.n`.
- `objectifGeneral`, `objectifSpecifique`, `support`, `documentation`, `theme` (lecture seulement) peuvent rester vides : l’écran affiche `[Objectif général]`… Ne rien inventer.
- `effectif` et `date` restent vides : l’enseignant les saisit à l’écran (non enregistrés ; ils passent dans l’adresse du PDF).
- `oo` commence par une des 4 formules obligatoires (voir `GUIDE-FICHES.md` § 3). Son verbe d’action doit figurer dans la `tache` ou la `consigne` de l’évaluation.

## Étapes

Dans l’ordre : `I-Motivation`, `II-Contrat pédagogique`, `III-Vérification des prérequis`, `IV-Acquisitions nouvelles`, `V-Évaluation` (+ `VI-Discussion socioculturelle` pour la lecture seulement). **5 étapes** (I à V).

Étape simple :

```json
{ "titre": "I-Motivation", "technique": "Q.R", "modalite": "Groupe classe",
  "consigne": "Observer …", "texte": "facultatif : phrases ou corpus (lignes séparées par un saut de ligne)",
  "questions": [ { "n": 1, "q": "…" } ], "activite": "Observation de …",
  "reponses": [ { "n": 1, "r": "…" } ], "evaluation": null, "temps": 5, "observ": "" }
```

- `consigne` à l’**infinitif** ; `activite` en **substantifs** (ce que fait l’apprenant).
- `questions` / `reponses` : numérotation **continue sur toute la fiche** (1, 2, 3…), chaque R porte le numéro de sa Q.
- `observ` reste **vide** (rempli par l’enseignant après la séance).
- Total des `temps` = `entete.duree`.

**Étape IV** : un seul titre « IV-Acquisitions nouvelles », sans `temps` propre ; ses sous-parties sont dans `sousEtapes` (mêmes champs que ci-dessus) : `A-Imprégnation`, `B-Fixation`, `C-Synthèse` (grammaire, orthographe, conjugaison, vocabulaire). Le corpus de A est repris tel quel dans B (`texte`) et dans `apprenant.corpus`.

**Étape V** : `evaluation` est un objet complet.

```json
"evaluation": { "mode": "écrit", "contexte": "…", "tache": "…", "consigne": "…",
  "items": [ "…" ], "cle": [ "…" ], "bareme": "1 point par …", "seuil": "4 sur 5" }
```

`mode` : `écrit`, `oral` ou `pratique`. Autant de `cle` que d’`items`. Le seuil (« a sur b ») ne dépasse pas le nombre d’items.

## Page de l’apprenant et corrigé

```json
"apprenant": {
 "titre": "…", "intro": "facultatif : une phrase pour l’élève",
 "corpus": [ "phrase 1", "phrase 2" ],
 "retenir": "ligne 1\nligne 2\nExemple : …",
 "tableau": { "head": [ "…" ], "rows": [ [ "…" ] ] },
 "exercices": [ { "enonce": "Exercice 1 : …", "items": [ "…" ], "seuil": "4 sur 5", "rappel": "Il me faut au moins 4 réponses justes sur 5." } ]
}
```

- `retenir` : une ligne par petite phrase (5 lignes au maximum) ; une ligne qui commence par « Exemple : » s’affiche dans un encadré.
- `corpus` et `items` **sans numéro** : la numérotation est automatique (jamais « 1. 1. »).
- `seuil` et `rappel` sont facultatifs : un exercice sans seuil n’en a pas. Le seuil ne dépasse pas le nombre d’items.
- `corrige` : liste de textes (réponses, barème, seuil), sans phrase tronquée.

## Règles de format

`**gras**` et `*italique*` seulement ; guillemets « » et apostrophe ’ ; **aucun guillemet droit** `"` dans les textes (il casserait le JSON).
Après chaque changement : `node outils/generer-pages.js https://expertenfrancais.github.io`, `node outils/valider-contenu.js` (0 erreur), puis `VERSION` de `sw.js` + 1.

## Fiches APS (6e et 5e) : `"approche": "APS"`

Même dossier, même numérotation (`fn`, `id` = 10000 + `fn`), même type `Fiches`. Différences : `meta` porte `"ap":"APS"` ; le fichier porte `"type":"fiche"` **et** `"approche":"APS"` ; **pas de `oo`** ; les étapes ont des `lignes` à deux colonnes (pas de questions/réponses séparées, pas de temps, pas d’`observ`). Modèle complet : `contenu/fiches/college/fiche-63.json`. Les fiches PPO (ci-dessus) restent inchangées.

```json
{
 "id": 10063,
 "meta": {"t":"Le respect des signes de ponctuation","k":"Fiches","n":"5e","m":"Lecture","img":"e","r":4.8,"fn":63,"ap":"APS"},
 "type": "fiche",
 "approche": "APS",
 "entete": {
  "niveau": "5e", "discipline": "Français", "sousDiscipline": "Lecture",
  "titre": "Fiche d’exploitation de la matrice MF5.1.1 : Le respect des signes de ponctuation",
  "codeMatrice": "MF5.1.1",
  "categorie": "Le respect des règles de la prosodie",
  "savoirEssentiel": "Le respect des signes de ponctuation",
  "competence": "… mot pour mot comme dans la matrice …",
  "situation": "… la situation d’apprentissage de la matrice …",
  "numero": 1, "date": "", "duree": "2 h",
  "support": "…", "documentation": "…"
 },
 "etapes": [
  { "titre": "1-Vérification des prérequis", "lignes": [ { "ens": "L’enseignant pose la question :\nQ1 : …", "app": "Les apprenants répondent :\nR1 : …" } ] },
  { "titre": "2-Décodage de la situation d’apprentissage", "lignes": [ … au moins 3 questions Q1, Q2, Q3 … ] },
  { "titre": "3-Exploitation du tableau de spécification",
    "specification": [ "Action 1 (mot pour mot)", "Action 2", "…" ],
    "lignes": [ { "ens": "…", "app": "…" }, { "a": 1, "ens": "…", "texte": "texte écrit au tableau (facultatif)", "app": "…" } ] },
  { "titre": "4-Synthèse", "lignes": [ … ] },
  { "titre": "5-Évaluation",
    "evaluation": { "mode": "oral", "action": 6, "item": "…", "situation": "…", "criteres": [ "…", "…" ] },
    "lignes": [ { "ens": "…", "texte": "…", "app": "…" } ] }
 ],
 "apprenant": {
  "titre": "Lecture : Le respect des signes de ponctuation",
  "blocs": [
   { "type": "def", "text": "…" }, { "type": "h", "text": "1- Le point ( . )" }, { "type": "p", "text": "…" },
   { "type": "ex", "text": "…" }, { "type": "nb", "text": "…" },
   { "type": "retenir", "items": [ "…", "…" ] },
   { "type": "texte", "titre": "Texte à lire", "text": "…" }
  ],
  "exercices": [ { "enonce": "Exercice 1 : …", "items": [ "…" ] }, { "enonce": "Exercice 2 : …", "texte": "Choix : …", "items": [ "…" ] } ]
 },
 "corrige": [ "Exercice 1 : …", "Exercice 2 : …" ]
}
```

Règles du format APS :
- **Ligne** (`lignes[]`) : `ens` (colonne enseignant) et `app` (colonne apprenants) **obligatoires** ; `texte` facultatif (texte ou corpus écrit au tableau, un paragraphe par ligne `\n`) ; `a` facultatif, étape 3 seulement : numéro (à partir de 1) de l’action de `specification` que la ligne traite. Plusieurs lignes d’une même étape peuvent se suivre ; `\n` sépare les paragraphes d’une cellule.
- **Q et R** : « Q1 : … » dans `ens`, « R1 : … » dans `app` ; numérotation qui recommence à Q1 à chaque étape ; chaque Q a sa R.
- **Étape 3** : `specification` = actions de l’activité choisie, mot pour mot et dans l’ordre (comparé à la matrice par le validateur) ; toutes les actions ont une ligne `a`, dans l’ordre, **sauf** la dernière si `evaluation.action` la réserve à l’évaluation (alors elle ne figure pas à l’étape 3).
- **Étape 5** : `evaluation` = objet avec `mode` (`écrit`, `oral`, `pratique`), `item`, `criteres` (liste), et facultativement `action`, `situation`. Le corrigé l’affiche.
- **Blocs de la page de l’apprenant** : `def`, `h`, `p`, `list` (`items`), `ex`, `nb`, `texte` (`titre`, `text`), `tableau` (`head`, `rows`), `retenir` (`items`, obligatoire). Exercices : `enonce`, `items` ou `texte`, `rappel` facultatif.
- `duree` : nombre de minutes **ou** texte tel que la répartition le donne (« 2 h »). `effectif` n’existe pas en APS.
- Mêmes règles typographiques que le PPO (`**gras**`, `*italique*`, « » et ’, pas de guillemet droit).

