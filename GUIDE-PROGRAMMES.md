# GUIDE DES PROGRAMMES : à lire pour toute tâche sur les programmes

À utiliser avec `PROJET.md`. Ne lis pas les autres guides ni les dossiers des autres types.

## Principe
Le type **Programmes** est **réservé aux enseignants** (voir `ALLOWED_TYPES` dans `data.js`). Au collège, il y a **deux programmes officiels** :
- **APS** : 6e et 5e.
- **PPO** : 4e et 3e.

Pour **chaque niveau**, deux documents : la **répartition** (notions à enseigner mois par mois et semaine par semaine) et le **guide pédagogique**. Soit **8 fichiers au collège**, tous dans le même dossier `contenu/programmes/college/`.

État actuel : les 4 répartitions annuelles (programme-1, 3, 5, 7) sont remplies d’octobre à juin ; les guides PPO 4e et 3e (programme-6 et 8) sont remplis (présentation, O.G, O.S avec sous-disciplines, commentaires, démarches, évaluation, modèle de fiche, manuels ; sans objets d’apprentissage ; source : INRAP, programmes 2002, édition 2018) ; les guides APS 6e et 5e (programme-2 et 4) n’ont que leur « Présentation ». Les écrans dédiés (vue annuelle / par mois / par semaine, « Enregistrer en PDF », lien vers les fiches pédagogiques) seront faits plus tard.

## Les 8 fichiers (dans `contenu/programmes/college/`)
| Fichier | id | Programme | Niveau | Document |
|---|---|---|---|---|
| `programme-1.json` | 50001 | APS | 6e | Répartition annuelle |
| `programme-2.json` | 50002 | APS | 6e | Guide pédagogique |
| `programme-3.json` | 50003 | APS | 5e | Répartition annuelle |
| `programme-4.json` | 50004 | APS | 5e | Guide pédagogique |
| `programme-5.json` | 50005 | PPO | 4e | Répartition annuelle |
| `programme-6.json` | 50006 | PPO | 4e | Guide pédagogique |
| `programme-7.json` | 50007 | PPO | 3e | Répartition annuelle |
| `programme-8.json` | 50008 | PPO | 3e | Guide pédagogique |

`id` = 50000 + `pg`. Autre cycle (primaire, lycée, université) : même principe, dossier `contenu/programmes/<cycle>/`, numéro suivant (`ls contenu/programmes/*/ | sort -V | tail -3`).

## Fichiers autorisés
- Uniquement le fichier concerné (`programme-<pg>.json`) et, pour un ajout ou une modification, `sw.js` (changer seulement `VERSION`).
- **Interdit d'ouvrir** : `data.js`, `cours/`, `fiches/`, `annales/`, `exercices/`, `evaluations/`, `programmes/` (pages générées), les autres dossiers de `contenu/`, `sitemap.xml`, `robots.txt`.

## Format
`meta` : `t` (titre, ex. « Programme APS 6e · Répartition annuelle »), `k` : `Programmes`, `n` niveau, `m` : `APS` ou `PPO`, `img` : `e`, `r` : 4.8, `pg` : numéro.

**Répartition** : une partie « Présentation », puis **une partie par mois** (Octobre à Juin) contenant un bloc `table`. Chaque ligne a autant de cellules que `head`. Une ligne par savoir ou objet, avec le numéro de semaine répété à chaque ligne.
- **APS** (canevas des savoirs essentiels codifiés), colonnes `["Sem.","Catégorie des savoirs essentiels","Savoir essentiel","Durée"]`. Exemple de ligne : `["2","MF6.2.1 Les constituants de la phrase","Le groupe nominal","1 h"]`. Lignes spéciales : `["1","Contrôle des acquis antérieurs","—","6 h"]`, `["2","Remédiation/Régulation","—","1 h"]`, `["4","Évaluation : Orthographe (dictée et questions)","—","2 h"]`. Le code `MF6…` correspond à la 6e, `MF5…` à la 5e.
- **PPO**, colonnes `["Sem.","O.G","O.S","Sous-discipline","Objet d’apprentissage","Durée"]`. Exemple : `["1","3","3.6","Grammaire","Expression de la circonstance de cause","1 h"]`.

**Guide pédagogique** : parties au choix, selon le contenu officiel fourni (une partie « Présentation du guide » existe déjà).

## Règles de contenu
- Recopier fidèlement le contenu officiel fourni (photos ou texte) ; **ne rien inventer**. Si un mot est illisible, écrire `[à vérifier]` et le signaler ; s'il manque une information, poser **une seule** question.
- Remplacer les mentions `[À compléter]` au fur et à mesure.
- Typographie : guillemets « », apostrophe ’, `**gras**` et `*italique*` seulement.
- Ces fichiers sont publics (site statique) : voir les règles de sécurité de `GUIDE-IA.md`.

## Procédure
1. Modifier le fichier concerné.
2. `node outils/generer-pages.js https://expertenfrancais.github.io`
3. `node outils/valider-contenu.js` (0 erreur).
4. Augmenter `VERSION` dans `sw.js` de 1.
5. Mettre à jour `PROJET.md` si besoin.
