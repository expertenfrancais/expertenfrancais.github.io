-- ============================================================
-- Expert en français : base de données d'authentification
-- À coller dans Supabase : SQL Editor -> New query -> Run
-- Peut être relancé sans danger (CREATE ... IF NOT EXISTS / OR REPLACE).
-- ============================================================

-- 1) Table des profils : une ligne par compte (liée à auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text,
  role        text not null default 'eleve' check (role in ('enseignant','eleve','particulier')),
  cycle       text check (cycle in ('Primaire','Collège','Lycée','Université')),
  created_at  timestamptz not null default now()
);

-- 2) Sécurité (RLS) : chacun ne voit et ne modifie que son propre profil
alter table public.profiles enable row level security;

drop policy if exists "profil : lecture du sien" on public.profiles;
create policy "profil : lecture du sien" on public.profiles
  for select to authenticated using (auth.uid() = id);

drop policy if exists "profil : modification du sien" on public.profiles;
create policy "profil : modification du sien" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Le rôle ne peut pas être changé par l'utilisateur lui-même (seulement username et cycle)
revoke update on public.profiles from authenticated;
grant  update (username, cycle) on public.profiles to authenticated;

-- 3) Création automatique du profil à l'inscription (valeurs contrôlées)
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
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
