# GUIDE DES ANNALES : à lire pour toute tâche sur les annales (sujets d'examens passés, sujets traités)

À utiliser avec `PROJET.md`. Ne lis pas `GUIDE-FICHES.md` ni les cours : les annales ont leur propre dossier.

## Fichiers autorisés
- **Un seul fichier de contenu par annale** : `contenu/annales/<cycle>/annale-<an>.json` (`<cycle>` : `primaire`, `college`, `lycee`, `universite`, selon le niveau).
- Pour un nouvel ajout : `sw.js` (changer seulement `VERSION`).
- **Modèles à suivre** : `contenu/annales/college/annale-2.json` (Dictée-Questions) et `annale-4.json` (Expression écrite), de vraies annales complètes : énoncé, corrigé, barème. L’annale fictive d’exemple (n° 1) a été supprimée à la demande du propriétaire. Ne lis `contenu/SPEC.md` que si tu hésites sur un type de bloc.
- **Interdit d'ouvrir** : `data.js`, `cours/`, `fiches/`, `annales/` (pages générées), `contenu/cours/`, `contenu/fiches/`, `sitemap.xml`, `robots.txt`.

## Structure réelle du BEPC (Congo-Brazzaville) : une annale par épreuve
Le BEPC comporte deux épreuves séparées ; chacune fait l’objet d’une annale distincte :
- **Dictée-Questions** : 2 h, coefficient 2, 20 points = dictée (8 pts, avec sa source « D’après… / La 3e en français ») + questions (12 pts) en quatre blocs de 3 points : I. Compréhension (titre ou expression à justifier, vrai/faux), II. Maniement de la langue (sens d’un mot ou d’une expression, synonyme, antonyme ou homophone à employer dans une phrase), III. Grammaire (nature et fonction, nature d’une proposition, transformation de phrase), IV. Conjugaison (infinitif et temps, réécriture à d’autres temps). Le texte de la dictée va dans un bloc `ex`, avec les points d’attention orthographiques dans le corrigé.
- **Expression écrite** : 2 h 30, coefficient 2, un seul sujet imposé noté sur 20 (pas de sujets au choix).
- L’en-tête officiel (ministère, direction des examens, session, épreuve, durée, coefficient, documents autorisés « Néant ») ouvre l’énoncé dans un `p`. Pour un BEPC blanc, indiquer l’inspection et le département à la place. Modèles : `annale-2.json` (Dictée-Questions) et `annale-4.json` (Expression écrite).
- Quand le barème officiel n’est pas sur le sujet (photo), le préciser dans l’annale : répartition « indicative, non officielle ».

## Numérotation
- `an` = numéro de l'annale (1, 2, 3…), indépendant des cours et des fiches. Dernier numéro : `ls contenu/annales/*/ | sort -V | tail -3` (le numéro 1 n’existe plus ; ne pas le réutiliser).
- `id` = 20000 + `an` (annale 3 → id 20003). Fichier : `annale-3.json`.

## Format
```json
{"id":20003,
 "meta":{"t":"BEPC · Français · Session 2023","k":"Annales","n":"3e","m":"Français","img":"b","r":4.8,"an":3},
 "sections":[{"t":"Énoncé du sujet","blocs":[…]},{"t":"Corrigé détaillé","blocs":[…]},{"t":"Barème et conseils de méthode","blocs":[…]}]}
```
- `t` : « Examen · Matière · Session année » (ex. « BEPC · Français · Session 2023 »). Pour un sujet traité hors examen : « Sujet traité · Matière · titre ». `k` : toujours `Annales`. `n` : niveau. `m` : matière. `img` : lettre `a` à `h`. `r` : 4.8. `an` : numéro.
- **Parties** : 1) Énoncé du sujet (gratuit), 2) Corrigé détaillé (payant), 3) Barème et conseils de méthode. Garder cet ordre et ces titres.
- **Énoncé** : en tête, un `p` avec la durée et le total des points ; puis un bloc `h` par partie de l'épreuve, dans l'ordre du sujet (ex. I. Texte support, II. Questions de compréhension, III. Grammaire, orthographe et vocabulaire, IV. Expression écrite). Le texte support va dans un bloc `ex` (avec `label` = titre du texte), les questions dans une `list` avec `ordered:true` et leurs points entre parenthèses. Ne jamais mettre le corrigé dans l'énoncé.
- **Corrigé** : mêmes titres `h` et même numérotation que l'énoncé, réponses justifiées (citations du texte, règle appliquée), blocs `tip` (méthode) et `warn` (piège) pour les conseils.
- **Barème** : un `table` des points par partie (le total doit égaler celui de l'énoncé), un `table` des critères de l'expression écrite, un `retenir` de conseils de méthode.
- Le catalogue est construit automatiquement à partir de `meta` : ne jamais l'écrire à la main.

## Règles de contenu
- Le texte du sujet vient du propriétaire : **ne jamais inventer un sujet officiel**. S'il manque (texte, année, examen, barème), pose une seule question.
- Recopier l'énoncé fidèlement (numérotation, consignes, durée, barème d'origine) ; le corrigé est rédigé, détaillé et justifié.
- Typographie : guillemets « », apostrophe ’, `**gras**` et `*italique*` seulement ; `\n` = nouveau paragraphe ; `quiz.answer` commence à 0.
- Ces fichiers sont publics (site statique) : voir les règles de sécurité de `GUIDE-IA.md`.

## Procédure
1. Créer ou modifier le fichier de l'annale.
2. `node outils/generer-pages.js https://expertenfrancais.github.io`
3. `node outils/valider-contenu.js` (0 erreur).
4. Augmenter `VERSION` dans `sw.js` de 1.
5. Mettre à jour les chiffres de `PROJET.md`.
