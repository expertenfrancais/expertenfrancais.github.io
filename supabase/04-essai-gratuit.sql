-- Expert en français : 1 mois d'abonnement GRATUIT pour toute personne qui s'inscrit pour la première fois.
-- À coller dans Supabase > SQL Editor > New query, puis « Run ». Peut être relancé sans risque.
-- À lancer APRÈS 01-auth.sql et 03-abonnement-codes.sql.
-- Effet : à la création d'un compte (e-mail ou Google), une ligne « essai » de 30 jours est créée dans la table abonnements.
-- Ne concerne QUE les nouveaux comptes : les comptes déjà existants ne reçoivent rien.
-- Si la personne active ensuite un code, la durée du code s'ajoute à la fin de l'essai (voir activer_code).
-- Pour changer la durée de l'essai : modifiez « interval '30 days' » plus bas, puis relancez le script.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, role, cycle)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data->>'username', ''), 50),
    case when new.raw_user_meta_data->>'role' in ('enseignant','eleve','particulier')
         then new.raw_user_meta_data->>'role' else 'eleve' end,
    case when new.raw_user_meta_data->>'cycle' in ('Primaire','Collège','Lycée','Université')
         then new.raw_user_meta_data->>'cycle' else null end
  );

  -- Mois gratuit de bienvenue (une seule fois : user_id est la clé de la table)
  insert into public.abonnements (user_id, plan, fin, maj)
  values (new.id, 'essai', now() + interval '30 days', now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Le déclencheur existe déjà (01-auth.sql) ; on le recrée par sécurité.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
