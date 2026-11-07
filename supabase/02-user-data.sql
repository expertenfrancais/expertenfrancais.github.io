-- Expert en français : sauvegarde des données de chaque utilisateur (favoris, panier, progression).
-- À coller dans Supabase > SQL Editor > New query, puis « Run ». Peut être relancé sans risque.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint user_data_taille check (octet_length(data::text) < 300000)
);

alter table public.user_data enable row level security;

-- Chacun ne voit et ne modifie QUE sa propre ligne. Pas de suppression depuis l'application.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_data' and policyname='user_data_select_own') then
    create policy "user_data_select_own" on public.user_data
      for select to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_data' and policyname='user_data_insert_own') then
    create policy "user_data_insert_own" on public.user_data
      for insert to authenticated with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='user_data' and policyname='user_data_update_own') then
    create policy "user_data_update_own" on public.user_data
      for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;
