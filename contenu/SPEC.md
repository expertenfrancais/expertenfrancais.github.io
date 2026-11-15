# Contenu des cours : format des fichiers

Chaque cours a son fichier `contenu/cours/<cycle>/<id>.json` (`<cycle>` : `primaire`, `college`, `lycee` ou `universite`, selon le niveau `n`). Sa clé `meta` (titre, type, niveau, matière, image, note) alimente automatiquement le catalogue : voir `GUIDE-IA.md`, tâche B.
`contenu/_exemple.json` montre tous les blocs. Vérifier ses fichiers : `node outils/valider-contenu.js`.

```json
{ "id": 1,
  "meta": { "t": "Titre du cours", "k": "Cours", "n": "6e", "m": "Grammaire", "img": "a", "r": 4.8, "mf": "MF6.2.1" },
  "sections": [
    { "t": "Titre de la partie", "blocs": [ { "type": "p", "text": "…" }, … ] }
  ] }
```

- `meta.mf` (facultatif, cours de 6e et de 5e) : code du savoir du programme APS auquel le cours correspond, tel qu’il figure dans la répartition annuelle (`MF6.x.y` en 6e, `MF5.x.y` en 5e). Un cours qui couvre deux catégories reçoit une liste : `"mf": ["MF6.2.2","MF6.2.3"]`. Sans correspondance claire, ne pas mettre la clé. Le validateur vérifie la forme et le niveau ; la clé n’apparaît pas dans le catalogue ni sur les pages.
- La partie 1 est gratuite, les suivantes demandent l'accès au cours.
- Le nombre de parties n’est pas limité : il dépend de la complexité de la notion (une notion difficile aura plus de parties qu’une notion simple).
- Dans les textes : `**gras**` et `*italique*` seulement ; un saut de ligne (`\n`) crée un nouveau paragraphe.
- Une partie sans bloc affiche « contenu à venir ».

## Types de blocs

| type | champs | rôle |
|---|---|---|
| `p` | `text` | paragraphe |
| `h` | `text` | sous-titre avec barre colorée |
| `list` | `items`, `ordered` (facultatif, true = numérotée) | liste |
| `ex` | `text`, `label` (facultatif) | exemple |
| `def` | `text`, `label` (facultatif) | définition (encadré bleu) |
| `tip` | `text`, `label` | astuce (jaune) |
| `warn` | `text`, `label` | attention, piège (rose) |
| `retenir` | `items`, `label` | « À retenir » (vert) |
| `schema` | `title`, `cells` : `[{mot, role, noyau}]`, `note` | mots décortiqués ; `noyau:true` met la cellule en couleur |
| `test` | `title`, `lines` | suite de phrases-tests (cadre pointillé) |
| `table` | `title`, `head`, `rows` | tableau ; chaque ligne a autant de cellules que `head` |
| `quiz` | `question`, `options`, `answer`, `explain` | QCM ; `answer` = numéro de la bonne option, **0 pour la première** |
| `exercise` | `enonce`, `items`, `corrige` | exercice ; `corrige` (texte ou liste) apparaît au toucher de « Voir le corrigé » |

## Rappel sécurité
Ces fichiers sont publics : n'importe qui peut les lire. Tant que vous n'avez pas de serveur,
n'y mettez pas de vrais contenus payants (voir la discussion sur les parties 2 et suivantes).
