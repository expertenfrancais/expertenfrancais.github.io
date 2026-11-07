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
