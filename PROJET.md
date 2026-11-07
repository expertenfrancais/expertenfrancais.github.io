# PROJET : état en bref (à lire en premier, avant GUIDE-IA.md)

Application de cours de français (PWA statique, GitHub Pages : https://expertenfrancais.github.io). Pas de serveur, pas de framework.
Mise à jour : archive **v128** (connexion Supabase prête : voir `supabase/LISEZMOI.md`).

## État actuel
- 57 cours de collège (id 1 à 58), 1 cours de primaire, 1 fiche pédagogique (id 10001), 3 annales vraies (20002 BEPC juillet 2025 Dictée-Questions, 20003 BEPC blanc mai 2025 Dictée-Questions, 20004 BEPC juillet 2025 Expression écrite) ; prochaine : an 5 (id 20005), 21 séries d’exercices (id 30001 à 30021 : 6e, 5e, 4e et 3e), prochaine : ex 22 (id 30022), 3 évaluations modèles (40001 et 40002 en 6e, 40003 en 3e ; réservées aux enseignants), prochaine : ev 4 (id 40004).
- Dernier id de cours : **58**. Commande pour le vérifier : `ls contenu/cours/*/ | sort -n | tail -3`
- Version du cache : `VERSION` dans `sw.js` (actuellement `v128`).
- Accès gratuit pour l'instant ; paiements à venir (prix par cycle dans `PRIX_CYCLE`, `data.js`).

## Connexion (Supabase)
- Code dans `login-app.html` (clés `SUPABASE_URL` et `SUPABASE_ANON_KEY` à renseigner ; vides = mode démonstration). Script SQL et mode d’emploi : `supabase/`. Clés de session : `sb_session`, `auth_mode` (effacées à la déconnexion).

## Rangement
- `contenu/cours/<cycle>/<id>.json` : un cours (texte + clé `meta`)
- `contenu/fiches/<cycle>/fiche-<n>.json` : une fiche pédagogique
- `contenu/annales/<cycle>/annale-<an>.json` : une annale (sujet d'examen + corrigé), id = 20000 + an
- `contenu/evaluations/<cycle>/evaluation-<ev>.json` : une évaluation (énoncé, corrigé, barème), enseignants seulement, id = 40000 + ev
- `contenu/exercices/<cycle>/exercice-<ex>.json` : une série d'exercices pour une notion (rappel, exercices, corrigés), id = 30000 + ex
- Générés, à ne jamais modifier à la main : `cours/`, `fiches/`, `annales/`, `exercices/`, `evaluations/`, `sitemap.xml`, `robots.txt`, catalogue de `data.js`

## Ajouter un cours (3 étapes)
1. Déposer `contenu/cours/<cycle>/<id>.json` (voir GUIDE-IA.md, tâche B)
2. `node outils/generer-pages.js https://expertenfrancais.github.io` (toujours avec l'adresse du site)
3. Augmenter `VERSION` dans `sw.js`, puis `node outils/valider-contenu.js` (0 erreur)

## Règles essentielles
- Ne pas ouvrir `data.js` pour ajouter un cours ; ne pas lire `cours/` ni `fiches/`.
- Un sujet pour deux niveaux (ex. 4e et 3e) = deux cours séparés, contenu adapté à chaque niveau.
- Futur type (programmes…) : suivre « Nouveau type de contenu » dans `GUIDE-IA.md`.

## Un guide par type de contenu (ne lire que celui de la tâche)
- Cours et interface : `GUIDE-IA.md` (formats : `contenu/SPEC.md`)
- Fiches pédagogiques : `GUIDE-FICHES.md` (format : `contenu/SPEC-FICHES.md`)
- Évaluations : `GUIDE-EVALUATIONS.md` (modèles : `evaluation-1.json`, `evaluation-3.json`)
- Exercices : `GUIDE-EXERCICES.md` (modèle : `contenu/exercices/college/exercice-1.json`)
- Annales : `GUIDE-ANNALES.md` (modèle : `contenu/annales/college/annale-2.json`)
