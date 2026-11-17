-- Expert en français : notes (avis) des apprenants sur les cours.
-- À coller dans Supabase > SQL Editor > New query, puis « Run ». Peut être relancé sans risque.
-- À lancer APRÈS 03-abonnement-codes.sql (on y réutilise public.est_admin()).
-- Une personne = une note par cours (elle peut la modifier). Les moyennes sont publiques ;
-- QUI a donné quelle note n'est visible que de l'administrateur (admin.html > onglet Avis).

-- 1. Table ---------------------------------------------------------------------
create table if not exists public.avis (
  user_id uuid     not null references auth.users(id) on delete cascade,
  doc_id  int      not null check (doc_id > 0),            -- numéro du cours (id du catalogue)
  note    smallint not null check (note between 1 and 5),
  cree_le timestamptz not null default now(),
  maj     timestamptz not null default now(),
  primary key (user_id, doc_id)
);
create index if not exists avis_doc_idx on public.avis(doc_id);

alter table public.avis enable row level security;

-- Chacun ne lit que ses propres notes ; AUCUNE écriture directe : tout passe par les fonctions ci-dessous.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='avis' and policyname='avis_select_own') then
    create policy "avis_select_own" on public.avis for select to authenticated using (auth.uid() = user_id);
  end if;
end $$;

-- 2. Donner ou modifier sa note (appelée par l'application) --------------------------
-- p_notes = objet JSON {"numéro du cours": note, ...}, ex. {"12":5,"40":4}. Jusqu'à 300 notes à la fois
-- (sert aussi à envoyer les notes déjà données sur l'appareil avant la mise en place).
create or replace function public.noter_cours_lot(p_notes jsonb)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  uid uuid := auth.uid();
  k   text;
  v   int;
  n   int := 0;
begin
  if uid is null then raise exception 'connexion'; end if;
  if p_notes is null or jsonb_typeof(p_notes) <> 'object' then raise exception 'format'; end if;
  for k in select jsonb_object_keys(p_notes) limit 300 loop
    if k ~ '^[0-9]{1,6}$' and jsonb_typeof(p_notes -> k) = 'number' then
      v := (p_notes ->> k)::numeric::int;
      if v between 1 and 5 and k::int > 0 then
        insert into public.avis(user_id, doc_id, note) values (uid, k::int, v)
        on conflict (user_id, doc_id) do update set note = excluded.note, maj = now();
        n := n + 1;
      end if;
    end if;
  end loop;
  return n;
end $$;

-- 3. Moyennes (publiques : aucune information sur les personnes) ------------------------
create or replace function public.moyennes_avis()
returns table(doc_id int, moyenne numeric, nb bigint)
language sql stable security definer set search_path = public
as $$
  select a.doc_id, round(avg(a.note)::numeric, 1), count(*) from public.avis a group by a.doc_id
$$;

-- 4. Réservé à l'administrateur : qui a donné quelle note --------------------------------
create or replace function public.admin_lister_avis(p_doc int default null, p_limite int default 500)
returns table(doc_id int, note int, maj timestamptz, email text, nom text, profil text)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.est_admin() then raise exception 'interdit'; end if;
  return query
    select a.doc_id, a.note::int, a.maj, u.email::text, coalesce(nullif(p.username, ''), '')::text, p.role::text
      from public.avis a
      left join auth.users u on u.id = a.user_id
      left join public.profiles p on p.id = a.user_id
     where p_doc is null or a.doc_id = p_doc
     order by a.maj desc
     limit least(coalesce(p_limite, 500), 2000);
end $$;

-- 5. Droits d'exécution -----------------------------------------------------------------
revoke execute on function public.noter_cours_lot(jsonb)        from public, anon;
revoke execute on function public.admin_lister_avis(int, int)   from public, anon;
revoke execute on function public.moyennes_avis()               from public;
grant  execute on function public.noter_cours_lot(jsonb)        to authenticated;
grant  execute on function public.admin_lister_avis(int, int)   to authenticated;
grant  execute on function public.moyennes_avis()               to anon, authenticated;
