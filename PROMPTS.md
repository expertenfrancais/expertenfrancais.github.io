# PROMPTS À COLLER AVANT CHAQUE TÂCHE

## PROMPT DE BASE (à coller en premier, toujours)

```
Tu travailles sur mon application de cours de français (PWA statique, GitHub Pages : https://expertenfrancais.github.io). Mes crédits IA sont limités : économise-les.

Règles d'économie :
- Lis d'abord PROJET.md, rien d'autre tant que je n'ai pas donné la tâche. Puis lis uniquement le guide du type de contenu concerné : GUIDE-IA.md (cours et interface), GUIDE-FICHES.md (fiches), GUIDE-ANNALES.md (annales), GUIDE-EXERCICES.md (exercices), GUIDE-EVALUATIONS.md (évaluations). Ne lis jamais les guides ni les dossiers des autres types.
- N'analyse jamais tout le projet. N'ouvre que les fichiers que le guide cite pour la tâche.
- N'ouvre jamais data.js, cours/, fiches/, annales/, sitemap.xml, robots.txt : ils sont générés ou trop gros.
- Ne réécris jamais un fichier entier si tu peux modifier seulement les lignes concernées.
- Avant de commencer, liste les fichiers que tu vas ouvrir ou modifier.
- Ne fais rien d'autre que la tâche demandée.

Fin de chaque tâche : lance node outils/generer-pages.js https://expertenfrancais.github.io (toujours avec l'adresse du site), puis node outils/valider-contenu.js (0 erreur attendu), augmente VERSION dans sw.js de 1, puis donne-moi l'archive mise à jour (francais-app-gratuit-maj-vNNN.zip) et mets à jour les chiffres de PROJET.md (nombre de cours, dernier id, version).

Réponds en français, de façon courte. Si une information manque, pose une seule question.
```

---

## 1. NOUVEAU COURS

```
Tâche : créer un nouveau cours.
Titre : [titre du cours]
Niveau : [6e / 5e / 4e / 3e / CM2 …]
Matière : [Grammaire / Conjugaison / Orthographe / Vocabulaire / Expression écrite / Littérature …]

Fichiers à lire : GUIDE-IA.md (tâche B), contenu/SPEC.md, contenu/_exemple.json.
Fichier à créer : contenu/cours/<cycle>/<id>.json (id = plus grand id de cours + 1 ; trouve-le avec : ls contenu/cours/*/ | sort -n | tail -3).
Fichier à modifier à part ça : sw.js (VERSION seulement).
Ne touche à rien d'autre, n'ouvre pas data.js.

Contenu : cours complet et adapté au niveau, en plusieurs parties (la partie 1 gratuite), avec définitions, exemples, exercices et un « À retenir ». Respecte les règles d'écriture de GUIDE-IA.md (guillemets « », apostrophe ’, quiz.answer à partir de 0).
```

**Variante deux niveaux** (ex. 4e et 3e) : ajoutez à la fin du prompt ci-dessus :

```
Ce sujet existe pour deux niveaux : [4e et 3e]. Crée deux cours séparés (deux id, deux fichiers), même titre, contenu adapté à chaque niveau, sans copier-coller.
```

---

## 2. MODIFIER OU COMPLÉTER UN COURS EXISTANT

```
Tâche : modifier un cours existant.
Cours : [id ou titre] — Modification demandée : [ce qu'il faut changer / ajouter / corriger]

Fichiers à lire : GUIDE-IA.md (tâche A), contenu/SPEC.md.
Fichier à modifier : uniquement contenu/cours/<cycle>/<id>.json (cherche-le avec ls, n'ouvre pas les autres cours).
Ne change ni le nombre ni les titres des parties sauf si je le demande. Modifie seulement les lignes concernées.
```

---

## 3. NOUVELLE FICHE PÉDAGOGIQUE

```
Tâche : créer une nouvelle fiche pédagogique.
Niveau : [5e / 6e …] — Sujet : [titre de la leçon]

Fichiers à lire : GUIDE-IA.md, GUIDE-FICHES.md (méthode complète), contenu/SPEC-FICHES.md (format).
Commence par l'enquête d'en-tête décrite dans GUIDE-FICHES.md : pose-moi les questions nécessaires avant de rédiger.
Fichier à créer : contenu/fiches/<cycle>/fiche-<fn>.json (fn = plus grand fn + 1, trouvé avec ls contenu/fiches/*/ ; id = 10000 + fn ; clé meta juste après id).
Fichier à modifier à part ça : sw.js (VERSION seulement). N'ouvre pas data.js ni fiches/.
Respecte les contrôles de qualité et les défauts à éviter de GUIDE-FICHES.md.
```

---

## 4. MODIFIER UNE FICHE EXISTANTE

```
Tâche : modifier une fiche pédagogique.
Fiche : [numéro fn ou titre] — Modification demandée : [ce qu'il faut changer]

Fichiers à lire : contenu/SPEC-FICHES.md ; GUIDE-FICHES.md seulement la partie utile (format, contrôles, défauts à éviter).
Fichier à modifier : uniquement contenu/fiches/<cycle>/fiche-<fn>.json, en modifiant seulement les lignes concernées.
```

---

## 5. NOUVELLE ANNALE (sujet d'examen passé ou sujet traité)

```
Tâche : ajouter une annale.
Examen : [BEPC / BEPC blanc / BAC …] — Session : [mois et année] — Niveau : [3e / Terminale …] — Épreuve : [Dictée-Questions / Expression écrite / Français …] (une annale par épreuve)
Texte du sujet : [colle ici le sujet complet, avec le barème s'il existe]

Fichiers à lire : PROJET.md, GUIDE-ANNALES.md, contenu/annales/college/annale-2.json (modèle Dictée-Questions) ou annale-4.json (modèle Expression écrite). Rien d'autre.
Fichier à créer : contenu/annales/<cycle>/annale-<an>.json (an = plus grand numéro + 1, trouvé avec : ls contenu/annales/*/ | sort -V | tail -3 ; id = 20000 + an).
Fichier à modifier à part ça : sw.js (VERSION seulement).
N'ouvre ni data.js, ni cours/, ni fiches/, ni annales/, ni contenu/cours/, ni contenu/fiches/.
Reprends l'en-tête officiel (ministère, session, épreuve, durée, coefficient, documents autorisés) et la structure de l'épreuve décrite dans GUIDE-ANNALES.md. Recopie l'énoncé fidèlement, rédige un corrigé détaillé et un barème. N'invente aucun sujet : s'il manque une information, pose-moi une seule question.
```

---

## 6. MODIFIER UNE ANNALE EXISTANTE

```
Tâche : modifier une annale.
Annale : [numéro an ou titre] — Modification demandée : [ce qu'il faut changer / corriger / ajouter]

Fichiers à lire : PROJET.md, GUIDE-ANNALES.md.
Fichier à modifier : uniquement contenu/annales/<cycle>/annale-<an>.json (trouve-le avec ls), en modifiant seulement les lignes concernées.
Ne touche ni aux cours, ni aux fiches, ni à data.js.
```

---

## 7. MODIFIER UNE PAGE DE L'APPLICATION (interface)

```
Tâche : modifier l'interface.
Page concernée : [index / catalogue / favoris / panier / abonnement / profil / paramètres / cycles / contact / lecture d'un cours …]
Modification demandée : [description précise]

Fichiers à lire : GUIDE-IA.md (tâche C et INTERDITS) et uniquement le fichier de cette page (voir la carte du projet dans GUIDE-IA.md).
Ne touche pas au stockage (localStorage), au bouton Retour ni à la mise à jour sans que je le demande. Pas de bibliothèque ni de framework, JavaScript simple compatible vieux téléphones.
Si la modification concerne l'aspect des pages de cours ou de fiches : modifie outils/generer-pages.js puis relance le générateur, jamais les pages une par une.
```

---

## 8. CHANGER UN PRIX, UNE RÈGLE DE VISIBILITÉ OU UNE FONCTION COMMUNE

```
Tâche : modifier [le prix d'un cycle / les types visibles selon le rôle / une fonction commune].
Précision : [ex. mettre le Collège à 30 / rendre Évaluations visible pour tous …]

Fichiers à lire : GUIDE-IA.md (carte du projet).
Fichier à modifier : data.js, uniquement la ligne concernée (PRIX_CYCLE ou ALLOWED_TYPES ou la fonction). Ne touche jamais au bloc du catalogue (entre CATALOGUE-AUTO:DEBUT et FIN).
```

---

## 9. NOUVEAU TYPE DE CONTENU (programmes… ; les exercices et les évaluations existent déjà : voir 11 à 14)

```
Tâche : ajouter un nouveau type de contenu : [Programmes].
Description : [à quoi ressemble ce contenu, qui le voit, gratuit ou payant]

Fichiers à lire : PROJET.md, GUIDE-IA.md (section « Nouveau type de contenu »), GUIDE-ANNALES.md comme modèle, et lecture ciblée de outils/catalogue.js, outils/generer-pages.js, outils/valider-contenu.js.
Étapes attendues : suivre la procédure de la section « Nouveau type de contenu » ; créer un GUIDE-<TYPE>.md court et un premier fichier modèle complet ; mettre à jour GUIDE-IA.md, PROJET.md et PROMPTS.md (ajouter les prompts de ce type) pour que les prochains ajouts ne touchent que le dossier de ce type.
Avant de commencer, propose-moi ton plan en quelques lignes et attends mon accord.
```

---

## 10. SIMPLE QUESTION OU DIAGNOSTIC (sans modifier)

```
Question : [ta question ou le problème constaté]
Ne modifie rien. Lis seulement les fichiers strictement nécessaires pour répondre et dis-moi lesquels tu as ouverts.
```

---

## 11. NOUVELLE SÉRIE D'EXERCICES (une notion)

```
Tâche : créer une série d'exercices.
Notion : [ex. Le groupe nominal] — Niveau : [6e / 5e / 4e / 3e …] — Matière : [Grammaire / Conjugaison / Orthographe / Vocabulaire …]
Série : [1re série / 2e série pour cette notion] — Difficulté ou consigne particulière : [facultatif]

Fichiers à lire : PROJET.md, GUIDE-EXERCICES.md, contenu/exercices/college/exercice-1.json (modèle). Rien d'autre.
Fichier à créer : contenu/exercices/<cycle>/exercice-<ex>.json (ex = plus grand numéro + 1, trouvé avec : ls contenu/exercices/*/ | sort -V | tail -3 ; id = 30000 + ex).
Fichier à modifier à part ça : sw.js (VERSION seulement).
N'ouvre ni data.js, ni cours/, ni fiches/, ni annales/, ni exercices/, ni contenu/cours/.
Quatre parties (rappel, échauffement, approfondissement, synthèse), 9 exercices environ, corrigés complets dans chaque exercice.
```

---

## 12. MODIFIER UNE SÉRIE D'EXERCICES EXISTANTE

```
Tâche : modifier une série d'exercices.
Série : [numéro ex ou titre] — Modification demandée : [ce qu'il faut changer / corriger / ajouter]

Fichiers à lire : PROJET.md, GUIDE-EXERCICES.md.
Fichier à modifier : uniquement contenu/exercices/<cycle>/exercice-<ex>.json (trouve-le avec ls), en modifiant seulement les lignes concernées.
Ne touche ni aux cours, ni aux fiches, ni aux annales, ni à data.js.
```

---

## 13. NOUVELLE ÉVALUATION (devoir ou composition, réservée aux enseignants)

```
Tâche : créer une évaluation.
Titre : [Devoir n° X : notion / Composition du Xe trimestre : notion] — Niveau : [6e / 5e / 4e / 3e …] — Matière : [Grammaire / Conjugaison / Orthographe …]
Durée : [45 min / 1 h / 2 h] — Total : [20 points] — Contenu à évaluer : [notions du trimestre]

Fichiers à lire : PROJET.md, GUIDE-EVALUATIONS.md, contenu/evaluations/college/evaluation-1.json (modèle). Rien d'autre.
Fichier à créer : contenu/evaluations/<cycle>/evaluation-<ev>.json (ev = plus grand numéro + 1, trouvé avec : ls contenu/evaluations/*/ | sort -V | tail -3 ; id = 40000 + ev).
Fichier à modifier à part ça : sw.js (VERSION seulement).
N'ouvre ni data.js, ni cours/, ni fiches/, ni annales/, ni exercices/, ni evaluations/.
Trois parties : énoncé, corrigé détaillé, barème et grille de correction (total égal à celui de l'énoncé).
```

---

## 14. MODIFIER UNE ÉVALUATION EXISTANTE

```
Tâche : modifier une évaluation.
Évaluation : [numéro ev ou titre] — Modification demandée : [ce qu'il faut changer / corriger / ajouter]

Fichiers à lire : PROJET.md, GUIDE-EVALUATIONS.md.
Fichier à modifier : uniquement contenu/evaluations/<cycle>/evaluation-<ev>.json (trouve-le avec ls), en modifiant seulement les lignes concernées.
Ne touche ni aux cours, ni aux fiches, ni aux annales, ni aux exercices, ni à data.js.
```
