# PROMPTS À COLLER AVANT CHAQUE TÂCHE

## PROMPT DE BASE (à coller en premier, toujours)

```
Tu travailles sur mon application de cours de français (PWA statique, GitHub Pages : https://expertenfrancais.github.io). Mes crédits IA sont limités : économise-les.

Règles d'économie :
- Lis d'abord PROJET.md, rien d'autre tant que je n'ai pas donné la tâche. Puis lis uniquement le guide du type de contenu concerné : GUIDE-IA.md (cours et interface), GUIDE-FICHES.md (fiches), GUIDE-ANNALES.md (annales), GUIDE-EXERCICES.md (exercices), GUIDE-EVALUATIONS.md (évaluations), GUIDE-PROGRAMMES.md (programmes). Ne lis jamais les guides ni les dossiers des autres types.
- N'analyse jamais tout le projet. N'ouvre que les fichiers que le guide cite pour la tâche.
- N'ouvre jamais data.js, cours/, fiches/, annales/, sitemap.xml, robots.txt : ils sont générés ou trop gros.
- Ne réécris jamais un fichier entier si tu peux modifier seulement les lignes concernées.
- Avant de commencer, liste les fichiers que tu vas ouvrir ou modifier.
- Ne fais rien d'autre que la tâche demandée.
- Connexion, base de données et abonnement par codes déjà en place (Supabase) : ne touche ni à login-app.html, ni à admin.html, ni à abonnement.html, ni au bloc de sauvegarde à la fin de data.js, ni aux dossiers supabase/, ni aux clés localStorage (sb_*, sync_*), ni aux réglages GRATUIT, ACHAT, FICHES_VERROU, FICHES_LIBRES et PLANS de data.js, sauf si la tâche le dit. Ne me demande jamais de clé secrète (service_role) ni de mot de passe.

Fin de chaque tâche : lance node outils/generer-pages.js https://expertenfrancais.github.io (toujours avec l'adresse du site), puis node outils/valider-contenu.js (0 erreur attendu), augmente VERSION dans sw.js de 1, puis donne-moi l'archive mise à jour (francais-app-gratuit-maj-vNNN.zip) et mets à jour PROJET.md (ligne « Mise à jour » avec la version et ce qui a changé, nombre de cours, dernier id de chaque type, version de sw.js). Si une règle ou un guide a changé, mets aussi à jour le guide concerné et PROMPTS.md.

Réponds en français, de façon courte. Si une information manque, pose une seule question.
```

---

## 1. NOUVEAU COURS

```
Tâche : créer un nouveau cours.
Titre : [titre du cours]
Niveau : [6e / 5e / 4e / 3e / CM2 …]
Matière : [Grammaire / Conjugaison / Orthographe / Vocabulaire / Expression écrite / Expression orale / Lecture / Littérature …]
Source (facultatif) : [programme APS pour la 6e et la 5e, PPO pour la 4e et la 3e : code du savoir (MF…) ou objectif (O.G / O.S) ; texte support éventuel]

Fichiers à lire : GUIDE-IA.md (tâche B), contenu/SPEC.md, contenu/_exemple.json.
Fichier à créer : contenu/cours/<cycle>/<id>.json (id = plus grand id de cours + 1 ; trouve-le avec : ls contenu/cours/*/ | sort -n | tail -3).
Fichier à modifier à part ça : sw.js (VERSION seulement).
Ne touche à rien d'autre, n'ouvre pas data.js.

Contenu : cours complet et adapté au niveau, en autant de parties que la complexité de la notion l’exige (aucun nombre imposé : une notion simple peut tenir en 4 parties, une notion difficile en 8, 10 ou plus ; la partie 1 gratuite), avec définitions, exemples, exercices et un « À retenir ». Respecte les règles d'écriture de GUIDE-IA.md (guillemets « », apostrophe ’, quiz.answer à partir de 0). Si un cours sur ce sujet et ce niveau existe déjà, dis-le-moi au lieu d'en créer un second.
En 6e et en 5e : ajoute dans meta la clé "mf" avec le code du savoir (MF6.x.y ou MF5.x.y) pris dans la répartition (programme-1 ou programme-3), comme l'explique GUIDE-IA.md ; sans correspondance claire, ne la mets pas.
```

**Plusieurs cours à la fois** (lot de 2, 10, 20 cours manquants d'un niveau) : utilisez le prompt 19 plutôt que de répéter celui-ci.

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
Niveau : [4e / 3e (programme PPO)] — Sujet : [titre de la leçon]  (6e et 5e : voir le prompt 3 bis, fiche APS)

Fichiers à lire : GUIDE-IA.md, GUIDE-FICHES.md (sections 1 à 9, méthode PPO), contenu/SPEC-FICHES.md (format).
Commence par l'enquête d'en-tête décrite dans GUIDE-FICHES.md : pose-moi les questions nécessaires avant de rédiger.
Fichier à créer : contenu/fiches/<cycle>/fiche-<fn>.json (fn = plus grand fn + 1, trouvé avec ls contenu/fiches/*/ ; id = 10000 + fn ; clé meta juste après id).
Fichier à modifier à part ça : sw.js (VERSION seulement). N'ouvre pas data.js ni fiches/.
Respecte les contrôles de qualité et les défauts à éviter de GUIDE-FICHES.md.
L'accès par abonnement est automatique (en-tête et étapes I et II gratuits ; étapes III à V, page de l'apprenant, corrigé et PDF réservés aux abonnés) : n'y touche pas et ne l'écris pas dans le JSON.
```

**Variante remplacer une fiche de test** (les fiches fn 2 à 11, de 3e, ont des contenus factices « Fiche modèle n° N (test) ») : ajoutez à la fin du prompt ci-dessus :

```
Cette fiche remplace la fiche de test fn [N] : réécris ce fichier (même fn, même id) avec le vrai contenu et le vrai titre, au lieu de créer un nouveau numéro.
```

---

## 3 bis. NOUVELLE FICHE APS (6e et 5e)

```
Tâche : créer une nouvelle fiche pédagogique APS (approche par les situations).
Niveau : [6e / 5e] — Matrice : [code MF, ex. MF5.2.1, ou savoir essentiel] — Savoir essentiel : [titre exact de la répartition annuelle]

Fichiers à lire : GUIDE-IA.md, GUIDE-FICHES.md (section 10 seulement), contenu/SPEC-FICHES.md (section « Fiches APS »), et le modèle contenu/fiches/college/fiche-63.json.
Ne lis PAS les gros fichiers de programmes : lance  node outils/matrice-aps.js <niveau> <code MF>  (matrice : compétence, situation, tableau de spécification, item) et  node outils/matrice-aps.js <niveau> --repartition <code MF>  (durée).
Pose-moi seulement les questions dont la réponse n'est pas dans la matrice (support ou texte, documentation, numéro de fiche, date). N'invente ni compétence, ni situation, ni action du tableau de spécification.
Fichier à créer : contenu/fiches/college/fiche-<fn>.json (fn = plus grand fn + 1 ; id = 10000 + fn ; meta avec "ap":"APS" ; "approche":"APS").
Puis : node outils/generer-pages.js https://expertenfrancais.github.io ; node outils/valider-contenu.js (0 erreur) ; sw.js (VERSION + 1 seulement). N'ouvre pas data.js ni fiches/.
Accès automatique (en-tête et étapes 1 et 2 gratuits ; le reste réservé aux abonnés, enseignants seulement) : n'y touche pas.
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
Page concernée : [index / catalogue / favoris / abonnement / profil / paramètres / cycles / contact / lecture d'un cours (lecon) / fiche / pdf …]
Modification demandée : [description précise]

Fichiers à lire : GUIDE-IA.md (tâche C et INTERDITS) et uniquement le fichier de cette page (voir la carte du projet dans GUIDE-IA.md).
Ne touche pas au stockage (localStorage), à la connexion Supabase (login-app.html, supabase/), à la logique d'abonnement (abonnement.html, admin.html, sbRpc et subRefresh dans data.js), au bouton Retour ni à la mise à jour sans que je le demande. Pas de bibliothèque ni de framework, JavaScript simple compatible vieux téléphones.
Si la modification concerne l'aspect des pages de cours ou de fiches : modifie outils/generer-pages.js puis relance le générateur, jamais les pages une par une.
```

---

## 8. CHANGER UN TARIF, UN RÉGLAGE D'ACCÈS OU UNE RÈGLE DE VISIBILITÉ

```
Tâche : modifier [le tarif d'une formule d'abonnement / un réglage d'accès : GRATUIT, ACHAT, FICHES_VERROU, FICHES_LIBRES / les types visibles selon le rôle].
Précision : [ex. enseignant mensuel à 3 000 FCFA / passer GRATUIT à false / rendre Évaluations visible pour les élèves …]

Fichiers à lire : PROJET.md (sections « Abonnement par codes » et « Fiches pédagogiques : accès par abonnement »), GUIDE-IA.md (carte du projet).
Fichier à modifier : data.js, uniquement la ligne concernée (PLANS, GRATUIT, ACHAT, FICHES_VERROU, FICHES_LIBRES, ALLOWED_TYPES, ou PRIX_CYCLE : prix à l'unité, sans effet tant que ACHAT est false). Ne touche jamais au bloc du catalogue (entre CATALOGUE-AUTO:DEBUT et FIN).
Un tarif doit rester identique aux trois endroits : PLANS (data.js), TARIFS (admin.html) et public.formule() (supabase/03-abonnement-codes.sql). Si tu changes un tarif, modifie les trois et dis-moi s'il faut relancer le script SQL dans Supabase (et quoi coller).
Ne passe jamais GRATUIT à false sans que je le demande : les parties payantes sont encore des fichiers publics tant que la protection côté serveur (phase 2) n'est pas faite.
```

---

## 9. NOUVEAU TYPE DE CONTENU (les exercices, évaluations et programmes existent déjà : voir 11 à 14 et 16)

```
Tâche : ajouter un nouveau type de contenu : [nom du type].
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

---

## 15. BASE DE DONNÉES / CONNEXION (Supabase)

```
Tâche : [ex. enregistrer le pseudo et le cycle dans la table profiles quand ils changent / envoyer les messages du formulaire de contact dans une table Supabase / autre].

Fichiers à lire : PROJET.md (section « Connexion et base de données »), supabase/LISEZMOI.md (sections 1 à 8), puis uniquement les fichiers de la tâche (supabase/*.sql utile, la page concernée, et au besoin la fin de data.js, bloc « Sauvegarde du compte »).
Contraintes : le site est statique (GitHub Pages), l'application parle à Supabase avec la clé publique seulement ; chaque nouvelle table doit avoir des règles de sécurité (RLS) : chacun ne voit que ses lignes. Les achats/abonnements ne sont jamais écrits directement depuis l'application : seule la fonction SQL activer_code crée ou prolonge un abonnement. Écris tout nouveau script SQL dans supabase/NN-nom.sql, relançable sans risque, et dis-moi exactement quoi coller et où cliquer dans Supabase (je suis sur téléphone).
Teste la logique avant de me rendre l'archive, augmente VERSION dans sw.js et mets PROJET.md à jour.
```

---

## 16. PROGRAMMES (répartition mensuelle ou guide pédagogique, enseignants seulement)

```
Tâche : remplir [la répartition / le guide pédagogique] du programme [APS / PPO], niveau [6e / 5e / 4e / 3e].
Contenu officiel : [colle ici le texte ou joins les photos : mois, semaines, savoirs ou objets d'apprentissage, durées…]

État actuel : les 4 répartitions annuelles (APS 6e programme-1, APS 5e programme-3, PPO 4e programme-5, PPO 3e programme-7) sont remplies d'octobre à juin ; les guides pédagogiques PPO 4e et 3e (programme-6 et 8) sont remplis ; le guide APS 6e (programme-2) est rempli depuis la v213 (matrices, banque des situations, guide officiel) ; le guide APS 5e (programme-4) est rempli depuis la v214. Les huit répartitions et guides sont maintenant remplis.

Fichiers à lire : PROJET.md, GUIDE-PROGRAMMES.md (il donne le tableau des 8 fichiers : numéro du fichier à modifier et format des colonnes). Rien d'autre.
Fichier à modifier : uniquement le programme-<pg>.json indiqué dans ce tableau (n'ouvre pas les autres programmes).
Fichier à modifier à part ça : sw.js (VERSION seulement). N'ouvre ni data.js, ni les pages générées, ni les autres dossiers de contenu.
Recopie fidèlement mon contenu, n'invente rien. Mot illisible : [à vérifier] et dis-le-moi. Information manquante : pose-moi une seule question.
```

---

## 17. ABONNEMENT PAR CODES D'ACTIVATION (codes, administrateur, protection des contenus)

```
Tâche : [ex. protéger côté serveur les parties payantes (phase 2) / ajouter une fonction à admin.html / corriger la page abonnement / changer la durée d'une formule].

Fichiers à lire : PROJET.md (section « Abonnement par codes d'activation » et « Fiches pédagogiques : accès par abonnement »), supabase/LISEZMOI.md (sections 1 et 8), puis uniquement les fichiers de la tâche (abonnement.html, admin.html, supabase/03-abonnement-codes.sql, fiche.js, la fin de data.js : sbRpc et subRefresh). Pour un travail sur le tableau de bord administrateur lui-même, utilise plutôt le prompt 18.
Contraintes : pas de PawaPay ni de paiement en ligne (pas d'entreprise enregistrée) : le client paie en Mobile Money, me contacte, reçoit un code à usage unique et le saisit dans abonnement.html. Un code utilisé n'est jamais réactivable. Le site est statique : clé publique seulement, jamais la clé service_role. Chaque table a des règles de sécurité (RLS). Tarifs identiques dans PLANS (data.js), TARIFS (admin.html) et public.formule() (script SQL).
Tout nouveau script SQL va dans supabase/NN-nom.sql, relançable sans risque ; dis-moi exactement quoi coller et où cliquer dans Supabase (je suis sur téléphone).
Avant de commencer, propose-moi ton plan en quelques lignes et attends mon accord si la tâche touche à la sécurité des contenus. Teste la logique avant de me rendre l'archive.
```

---

## 18. TABLEAU DE BORD ADMINISTRATEUR (admin.html)

```
Tâche : [ex. ajouter à admin.html le journal des publications / ajouter un indicateur à « Vue d'ensemble » / une nouvelle vérification dans « Doublons et santé » / corriger un message d'erreur].

Fichiers à lire : PROJET.md (section « Abonnement par codes d'activation » : état et étapes à venir d'admin.html), supabase/LISEZMOI.md (§ 8, administrateurs), puis uniquement admin.html. Si la tâche demande des données écrites au moment de la publication (journal des publications), lis aussi la partie concernée de outils/generer-pages.js ; si elle demande de nouvelles données dans Supabase (activité des utilisateurs, abonnements), lis supabase/03-abonnement-codes.sql comme modèle.
État actuel : trois onglets. « Codes » (générer, lister, noter, annuler) ; « Vue d'ensemble » (pages publiées, version du site lue dans sw.js, répartition par type, niveau et matière, derniers cours, prochain numéro libre par type) ; « Doublons et santé » (titres, numéros et fichiers en double ; bouton « Vérifier les fichiers »). Les deux derniers sont calculés depuis ALLDOCS de data.js : ne change pas le format du catalogue. L'accès est réservé aux comptes de la table admins ; la page affiche « Vérification… », attend Supabase au plus 15 s, donne la raison précise d'un échec et propose « Réessayer » : conserve ce comportement.
Contraintes : clé publique seulement, jamais la clé service_role. Pas de lien vers admin.html depuis les menus. Toute nouvelle table a des règles de sécurité (RLS) réservées aux administrateurs, avec un script supabase/NN-nom.sql relançable sans risque ; dis-moi exactement quoi coller et où cliquer dans Supabase (je suis sur téléphone). Ne touche pas aux codes déjà générés ni aux tarifs (identiques dans PLANS, TARIFS et public.formule()).
Avant de commencer, propose-moi ton plan en quelques lignes et attends mon accord si la tâche ajoute une table Supabase.
```

---

## 19. ANALYSER LES MANQUES ET AJOUTER UN LOT DE COURS

```
Tâche : analyser les cours publiés par rapport à la répartition annuelle, puis ajouter [N] cours manquants.
Niveau : [6e / 5e / 4e / 3e] — Programme : [APS pour la 6e et la 5e, PPO pour la 4e et la 3e].
Sujets (facultatif) : [laisse vide pour que tu choisisses les premiers sujets manquants dans l'ordre de la répartition / ou donne ta liste / ou une matière à privilégier].

Fichiers à lire : PROJET.md, GUIDE-IA.md (tâche B), contenu/SPEC.md, contenu/_exemple.json, et la répartition du niveau : contenu/programmes/<cycle>/programme-<pg>.json (1 = APS 6e, 3 = APS 5e, 5 = PPO 4e, 7 = PPO 3e ; GUIDE-PROGRAMMES.md donne le tableau). Rien d'autre.

Analyse, sans ouvrir les cours un par un : écris un petit script qui affiche seulement l'id, la matière, le titre et le code mf des cours du niveau (clé meta de contenu/cours/<cycle>/*.json ; en 6e et 5e, les codes mf déjà posés permettent de comparer directement avec les codes de la répartition) et les objets d'apprentissage de la répartition. Compare et donne-moi la liste courte des notions sans cours. N'ouvre jamais data.js ni les pages générées.

Choix : prends les [N] premières notions manquantes (ou celles que je te donne). Pas de doublon avec un cours existant du même niveau. Si le sujet existe déjà pour un autre niveau, crée quand même la version adaptée au mien, sans copier-coller. Varie les matières.

Fichiers à créer : [N] fichiers contenu/cours/<cycle>/<id>.json, id consécutifs à partir du plus grand id + 1 (ls contenu/cours/*/ | sort -n | tail -3). Chaque cours : clé meta.mf (code MF de la répartition, en 6e et en 5e) et un nombre de parties proportionnel à la complexité de la notion (aucune limite fixe : plus la notion est difficile ou riche, plus il y a de parties ; partie 1 gratuite) avec introduction (définition, exemples, quiz), notions principales en tableaux, pièges, exercices corrigés, « À retenir » avec un quiz. Règles d'écriture de GUIDE-IA.md (guillemets « », apostrophe ’, quiz.answer à partir de 0).
Fichier à modifier à part ça : sw.js (VERSION seulement), PROJET.md (dernier id, liste des cours ajoutés).

Fin : generer-pages, valider-contenu (0 erreur), archive complète et archive des seuls fichiers modifiés. Dis-moi en une phrase ce que tu as rédigé de mémoire et que je dois relire (règles de grammaire, exemples).
```
