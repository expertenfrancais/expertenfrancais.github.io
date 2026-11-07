# GUIDE DES ÉVALUATIONS : à lire pour toute tâche sur les évaluations

À utiliser avec `PROJET.md`. Ne lis pas les autres guides ni les dossiers des autres types.

## Principe
Une évaluation est un **devoir ou une composition prêt à donner en classe**, avec corrigé et barème. Elle est **réservée aux enseignants** (type visible seulement pour le rôle enseignant, voir `ALLOWED_TYPES` dans `data.js`). Une évaluation ne remplace ni une annale (sujet d’examen passé) ni une série d’exercices (entraînement sur une notion).

## Fichiers autorisés
- **Un seul fichier par évaluation** : `contenu/evaluations/<cycle>/evaluation-<ev>.json` (`<cycle>` : `primaire`, `college`, `lycee`, `universite`, selon le niveau).
- Pour un nouvel ajout : `sw.js` (changer seulement `VERSION`).
- **Modèles à suivre** : `contenu/evaluations/college/evaluation-1.json` (devoir court, 6e) et `evaluation-3.json` (composition avec texte support, 3e).
- **Interdit d’ouvrir** : `data.js`, `cours/`, `fiches/`, `annales/`, `exercices/`, `evaluations/` (pages générées), les autres dossiers de `contenu/`, `sitemap.xml`, `robots.txt`.

## Numérotation
- `ev` = numéro de l’évaluation (1, 2, 3…), indépendant des autres types. Dernier numéro : `ls contenu/evaluations/*/ | sort -V | tail -3`.
- `id` = 40000 + `ev` (évaluation 5 → id 40005). Fichier : `evaluation-5.json`.

## Format
```json
{"id":40004,
 "meta":{"t":"Devoir n° 3 : Les types de phrases","k":"Évaluations","n":"6e","m":"Grammaire","img":"d","r":4.8,"ev":4},
 "sections":[{"t":"Énoncé de l’évaluation","blocs":[…]},{"t":"Corrigé détaillé","blocs":[…]},{"t":"Barème et grille de correction","blocs":[…]}]}
```
- `t` : « Devoir n° X : notion » ou « Composition du Xe trimestre : notion ». `k` : toujours `Évaluations` (avec accent). `n` : niveau. `m` : matière. `img` : lettre `a` à `h`. `r` : 4.8. `ev` : numéro.
- **Parties** (garder cet ordre et ces titres) : 1) Énoncé de l’évaluation, 2) Corrigé détaillé, 3) Barème et grille de correction.
- **Énoncé** : en tête, un `p` avec la **durée** et le **total de points** (20 en général) ; puis un `h` par exercice avec ses points (« Exercice 1 : … (4 points) »). Texte support éventuel dans un bloc `ex`. Ne jamais mettre le corrigé dans l’énoncé.
- **Corrigé** : mêmes titres `h` et même numérotation que l’énoncé ; réponses justifiées, blocs `tip` (méthode) et `warn` (piège).
- **Barème** : un `table` des points par exercice (le total doit égaler celui de l’énoncé) et un `retenir` « Conseils au correcteur ».
- Le catalogue est construit automatiquement à partir de `meta` : ne jamais l’écrire à la main.

## Règles de contenu
- Niveau adapté à la classe ; durée réaliste (45 min pour un devoir court, 1 h à 2 h pour une composition).
- Les questions doivent avoir **une seule** bonne réponse, ou le corrigé doit dire « réponses possibles ».
- Une évaluation modèle écrite par l’IA n’est pas un sujet officiel : le préciser dans l’énoncé si besoin.
- Typographie : guillemets « », apostrophe ’, `**gras**` et `*italique*` seulement (pas de balises HTML) ; `\n` = nouveau paragraphe.
- Ces fichiers sont publics (site statique) : voir les règles de sécurité de `GUIDE-IA.md`.

## Procédure
1. Créer ou modifier le fichier de l’évaluation.
2. `node outils/generer-pages.js https://expertenfrancais.github.io`
3. `node outils/valider-contenu.js` (0 erreur).
4. Augmenter `VERSION` dans `sw.js` de 1.
5. Mettre à jour les chiffres de `PROJET.md`.
