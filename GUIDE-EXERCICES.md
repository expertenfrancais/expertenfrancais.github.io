# GUIDE DES EXERCICES : à lire pour toute tâche sur les exercices

À utiliser avec `PROJET.md`. Ne lis pas les autres guides ni les dossiers des autres types.

## Principe
Il y a **une série d’exercices par notion** (ex. « Le groupe nominal : exercices »). Une même notion peut avoir plusieurs séries (série 1, série 2…) : un fichier par série. Le but est de proposer **beaucoup d’exercices**, de façon progressive, avec corrigés.

## Fichiers autorisés
- **Un seul fichier par série** : `contenu/exercices/<cycle>/exercice-<ex>.json` (`<cycle>` : `primaire`, `college`, `lycee`, `universite`, selon le niveau).
- Pour un nouvel ajout : `sw.js` (changer seulement `VERSION`).
- **Modèle à suivre : `contenu/exercices/college/exercice-1.json`** (6e, Le groupe nominal).
- **Interdit d’ouvrir** : `data.js`, `cours/`, `fiches/`, `annales/`, `exercices/` (pages générées), `contenu/cours/`, `contenu/fiches/`, `contenu/annales/`, `sitemap.xml`, `robots.txt`.

## Numérotation
- `ex` = numéro de la série (1, 2, 3…), indépendant des cours, fiches et annales. Dernier numéro : `ls contenu/exercices/*/ | sort -V | tail -3`.
- `id` = 30000 + `ex` (série 5 → id 30005). Fichier : `exercice-5.json`.

## Format
```json
{"id":30002,
 "meta":{"t":"Le verbe : exercices","k":"Exercices","n":"6e","m":"Grammaire","img":"c","r":4.8,"ex":2},
 "sections":[{"t":"Rappel de cours","blocs":[…]},{"t":"Exercices d’échauffement","blocs":[…]},…]}
```
- `t` : « Notion : exercices » (même notion que le cours correspondant). `k` : toujours `Exercices`. `n` : niveau. `m` : matière. `img` : lettre `a` à `h`. `r` : 4.8. `ex` : numéro de la série.
- **Parties** (garder cet ordre et ces titres) : 1) Rappel de cours (gratuit : `def`, `table`, `tip` courts), 2) Exercices d’échauffement (3 exercices faciles), 3) Exercices d’approfondissement (4 exercices), 4) Exercices de synthèse (2 exercices de réinvestissement, puis un `retenir`).
- **Un exercice** = un bloc `h` « Exercice n » suivi d’un bloc `exercise` (`enonce`, `items`, `corrige`) : le corrigé s’affiche au toucher de « Voir le corrigé ». Ou un bloc `quiz` (QCM : `answer` commence à 0, `explain` obligatoire en pratique).
- Mettre en gras (`**mot**`) dans le corrigé le mot attendu ; pour une réponse libre, écrire « Réponses possibles : … ».
- Variété : relever, souligner, accorder, transformer, compléter, rédiger, QCM. Difficulté croissante d’une partie à l’autre.
- Le catalogue est construit automatiquement à partir de `meta` : ne jamais l’écrire à la main.

## Règles de contenu
- Niveau adapté à la classe, vocabulaire simple, exemples tirés de la vie au Congo-Brazzaville quand c’est naturel.
- Les phrases à corriger doivent avoir **une seule** bonne réponse, ou le corrigé doit dire « réponses possibles ».
- Typographie : guillemets « », apostrophe ’, `**gras**` et `*italique*` seulement ; `\n` = nouveau paragraphe.
- Ces fichiers sont publics (site statique) : voir les règles de sécurité de `GUIDE-IA.md`.

## Procédure
1. Créer ou modifier le fichier de la série.
2. `node outils/generer-pages.js https://expertenfrancais.github.io`
3. `node outils/valider-contenu.js` (0 erreur).
4. Augmenter `VERSION` dans `sw.js` de 1.
5. Mettre à jour les chiffres de `PROJET.md`.
