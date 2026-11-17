# Connexion réelle avec Supabase : mise en route (15 minutes)

## 1. Créer le projet
1. Compte gratuit sur https://supabase.com, puis « New project » (choisissez un mot de passe de base de données et gardez-le pour vous).

## 2. Créer la table et les règles de sécurité
1. Menu « SQL Editor » -> « New query ».
2. Collez tout le contenu de `supabase/01-auth.sql`, puis « Run ». Message attendu : « Success ».

## 3. Régler l'authentification (menu « Authentication »)
1. **URL Configuration** : « Site URL » = `https://expertenfrancais.github.io`.
2. **Sign In / Providers -> Email** : laissez « Confirm email » activé (recommandé). Longueur du code (OTP) : 6.
3. **Email Templates -> Reset Password** : remplacez le contenu par :
   `<h2>Réinitialisation du mot de passe</h2><p>Votre code : <b>{{ .Token }}</b></p><p>Il expire dans une heure.</p>`
   (l'application demande un code à 6 chiffres, pas un lien).

## 4. Brancher l'application
1. « Project Settings -> API » : copiez **Project URL** et la clé **anon public**.
2. Ouvrez `login-app.html`, cherchez `SUPABASE_URL` et `SUPABASE_ANON_KEY`, collez-les entre les guillemets.
3. Envoyez le projet sur GitHub Pages.
> Ne collez JAMAIS la clé `service_role` (ni le mot de passe de la base) dans le projet : ces fichiers sont publics.

## 5. Tester
Inscription -> e-mail de confirmation -> connexion -> « Mot de passe oublié » -> code reçu par e-mail.
Vérification côté Supabase : « Authentication -> Users » et « Table Editor -> profiles ».

## Limites à connaître
- L'envoi d'e-mails par défaut de Supabase est limité (quelques e-mails par heure). Pour un vrai lancement, configurez votre propre SMTP (Authentication -> SMTP Settings).
- Le rôle (enseignant / élève / particulier) est choisi à l'inscription : il n'est pas vérifié. Tant que les fiches et évaluations sont des fichiers publics, cela ne protège rien ; la vraie protection viendra avec le contenu payant stocké dans Supabase.
- La déconnexion efface la session sur l'appareil ; la protection du contenu payant (achat, abonnement) reste à faire côté serveur.
- Sans clés dans `login-app.html`, l'application reste en mode démonstration (connexion simulée).


## 8. Abonnements par codes d'activation
1. Supabase -> SQL Editor -> New query : collez `supabase/03-abonnement-codes.sql`, puis Run (« Success »).
2. Créez votre compte dans l'application, puis dans le SQL Editor exécutez (avec votre adresse) :
   `insert into public.admins(user_id) select id from auth.users where email = 'votre@adresse.com' on conflict do nothing;`
3. Ouvrez `admin.html` connecté avec ce compte : choisissez le profil (enseignant ou élève), la formule, un nombre, « Générer », puis copiez les codes. Donnez un code libre au client après son paiement ; notez son nom dans le champ « Note ».
4. Test : générez 1 code, activez-le depuis un autre compte dans la page Abonnement, vérifiez « Abonnement actif ». Réessayez le même code : « Code invalide ou déjà utilisé ».

## 9. Mois gratuit à la première inscription
1. Supabase -> SQL Editor -> New query : collez `supabase/04-essai-gratuit.sql` (à lancer après le 03), puis Run (« Success »).
2. Chaque nouveau compte (e-mail ou Google) reçoit automatiquement 30 jours d'abonnement (formule « Essai gratuit »). Les comptes déjà existants ne sont pas touchés.
3. Si la personne active ensuite un code, sa durée s'ajoute à la fin de l'essai.
4. Après l'inscription, une boîte « Félicitations ! Vous bénéficiez d'un mois gratuit… » avec un bouton « Commencer » s'affiche une seule fois (dans data.js).
5. Test : créez un nouveau compte, ouvrez la page Abonnement : « Mois gratuit offert ✓ · 30 jours restants ». Une fiche pédagogique doit alors s'ouvrir en entier.

## 7. Sauvegarde des favoris, du panier et de la progression
Supabase -> SQL Editor -> New query : collez `supabase/02-user-data.sql`, puis Run (« Success »). Les données de chaque compte sont alors retrouvées sur n'importe quel appareil.

## 10. Contenus hors ligne : mise à jour incrémentale et téléchargement automatique en Wi‑Fi
1. Après chaque ajout ou modification de contenu, lancez `node outils/generer-pages.js` (il appelle `outils/generer-versions.js`), ou seulement `node outils/generer-versions.js`. Il écrit `contenu/index-versions.json` : publiez ce fichier avec les autres.
2. Sans ce fichier à jour, « Mettre à jour » ne voit pas les modifications (les nouveaux fichiers sont quand même détectés).
3. Paramètres > « Télécharger en Wi‑Fi automatiquement » : actif seulement sur les appareils qui indiquent le type de connexion (Chrome / Android) ; contrôle au plus toutes les 12 h, jamais avec l'économiseur de données.

## 11. Notes (avis) des apprenants
1. Supabase -> SQL Editor -> New query : collez `supabase/05-avis.sql` (à lancer après le 03), puis Run (« Success »).
2. Aucune autre étape : les notes de 1 à 5 données dans l'application (page d'un cours, fin d'une leçon) sont envoyées à Supabase ; les notes déjà données sur un appareil sont envoyées automatiquement à la prochaine ouverture de l'application (compte connecté).
3. Les cartes (accueil, catalogue, favoris, recherche) et la page d'un cours affichent la vraie moyenne ; un cours sans avis affiche « Nouveau ». Les moyennes sont relues au plus toutes les 30 minutes. La clé `meta.r` des fichiers de cours n'est plus affichée.
4. `admin.html` > onglet **Avis** : nombre d'avis, moyenne générale, répartition, cours les plus notés et la liste de tous les avis avec le nom et l'adresse e-mail de la personne (filtre par note ; recherche par cours, nom ou e-mail). Seul l'administrateur voit qui a noté.
5. Test : connectez-vous, notez un cours (3 étoiles par exemple), attendez 1 à 2 secondes, ouvrez `admin.html` > Avis : l'avis apparaît avec votre adresse. Rechargez l'accueil : le cours affiche 3,0.
6. Limite : une personne non connectée (mode invité) ne peut ni noter ni voir les moyennes.
