-- Expert en français : abonnements par codes d'activation (usage unique).
-- À coller dans Supabase > SQL Editor > New query, puis « Run ». Peut être relancé sans risque.
-- Formules (durée) : mensuel 30 jours, trimestriel 90 jours, annuel 365 jours.
-- Enseignants : 2 500 / 5 000 / 10 000. Élèves : 1 000 / 2 000 / 3 000 (FCFA). Le prix est lié au code, pas au compte.
-- Pour changer une durée ou un prix : modifiez la fonction public.formule() plus bas, puis relancez le script.

create extension if not exists pgcrypto with schema extensions;

-- 1. Tables ------------------------------------------------------------------
create table if not exists public.codes_activation (
  code        text primary key,                       -- ex. K7QM-4XPD-9TWE
  plan        text not null check (plan in ('mois','trim','an')),
  duree_jours int  not null,
  prix        int  not null,                          -- pour votre suivi (FCFA)
  profil      text not null default 'enseignant' check (profil in ('enseignant','eleve')),
  statut      text not null default 'libre' check (statut in ('libre','utilise','annule')),
  utilise_par uuid references auth.users(id) on delete set null,
  utilise_le  timestamptz,
  note        text,                                   -- ex. nom du client à qui vous l'avez vendu
  cree_le     timestamptz not null default now()
);

create table if not exists public.abonnements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan    text,
  fin     timestamptz not null,
  maj     timestamptz not null default now()
);

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create table if not exists public.tentatives_code (
  id      bigint generated always as identity primary key,
  user_id uuid not null,
  le      timestamptz not null default now()
);

alter table public.codes_activation add column if not exists profil text not null default 'enseignant' check (profil in ('enseignant','eleve'));  -- si le script avait déjà été lancé

alter table public.codes_activation enable row level security;
alter table public.abonnements      enable row level security;
alter table public.admins           enable row level security;
alter table public.tentatives_code  enable row level security;

-- codes_activation et tentatives_code : AUCUNE règle = inaccessibles depuis l'application (seulement via les fonctions ci-dessous).
-- abonnements et admins : chacun ne lit que sa propre ligne, personne n'écrit depuis l'application.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='abonnements' and policyname='abonnements_select_own') then
    create policy "abonnements_select_own" on public.abonnements for select to authenticated using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='admins' and policyname='admins_select_own') then
    create policy "admins_select_own" on public.admins for select to authenticated using (auth.uid() = user_id);
  end if;
end $$;

-- 2. Formules ----------------------------------------------------------------
drop function if exists public.formule(text);
create or replace function public.formule(p_plan text, p_profil text)
returns table(jours int, prix int)
language sql immutable
as $$
  select case p_plan when 'mois' then 30 when 'trim' then 90 when 'an' then 365 end,
         case when p_profil = 'eleve'
              then case p_plan when 'mois' then 1000 when 'trim' then 2000 when 'an' then 3000 end
              else case p_plan when 'mois' then 2500 when 'trim' then 5000 when 'an' then 10000 end
         end
$$;

-- 3. Qui est administrateur ---------------------------------------------------
create or replace function public.est_admin()
returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()) $$;

-- 4. Activation d'un code par le client ---------------------------------------
-- Une seule opération atomique : le code passe à « utilisé » ET l'abonnement est créé ou prolongé.
-- Limite : 5 essais ratés par tranche de 10 minutes et par compte.
create or replace function public.activer_code(p_code text)
returns jsonb
language plpgsql security definer set search_path = public, extensions
as $$
declare
  uid  uuid := auth.uid();
  c    text;
  r    public.codes_activation%rowtype;
  base timestamptz;
  nouv timestamptz;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'erreur', 'connexion');
  end if;

  if (select count(*) from public.tentatives_code where user_id = uid and le > now() - interval '10 minutes') >= 5 then
    return jsonb_build_object('ok', false, 'erreur', 'trop');
  end if;

  c := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));

  update public.codes_activation
     set statut = 'utilise', utilise_par = uid, utilise_le = now()
   where replace(code, '-', '') = c and statut = 'libre'
  returning * into r;

  if not found then
    insert into public.tentatives_code(user_id) values (uid);
    delete from public.tentatives_code where le < now() - interval '1 day';
    return jsonb_build_object('ok', false, 'erreur', 'invalide');
  end if;

  select fin into base from public.abonnements where user_id = uid;
  base := greatest(coalesce(base, now()), now());   -- si déjà abonné : la durée s'ajoute à la fin en cours
  nouv := base + make_interval(days => r.duree_jours);

  insert into public.abonnements(user_id, plan, fin, maj) values (uid, r.plan, nouv, now())
  on conflict (user_id) do update set plan = excluded.plan, fin = excluded.fin, maj = now();

  return jsonb_build_object('ok', true, 'plan', r.plan, 'fin', nouv);
end $$;

-- 5. Fonctions réservées à l'administrateur (vous) -----------------------------
drop function if exists public.admin_generer_codes(text, int);
create or replace function public.admin_generer_codes(p_plan text, p_profil text, p_nombre int)
returns setof text
language plpgsql security definer set search_path = public, extensions
as $$
declare
  f        record;
  alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   -- sans 0, O, 1, I, L : pas de confusion à la lecture
  b        bytea;
  s        text;
  k        text;
  i        int;
  n        int := 0;
begin
  if not public.est_admin() then raise exception 'interdit'; end if;
  if p_plan not in ('mois','trim','an') then raise exception 'formule inconnue'; end if;
  if p_profil not in ('enseignant','eleve') then raise exception 'profil inconnu'; end if;
  if p_nombre is null or p_nombre < 1 or p_nombre > 200 then raise exception 'nombre entre 1 et 200'; end if;
  select * into f from public.formule(p_plan, p_profil);

  while n < p_nombre loop
    b := extensions.gen_random_bytes(12);
    s := '';
    for i in 0..11 loop
      s := s || substr(alphabet, (get_byte(b, i) % 31) + 1, 1);
    end loop;
    k := substr(s,1,4) || '-' || substr(s,5,4) || '-' || substr(s,9,4);
    insert into public.codes_activation(code, plan, profil, duree_jours, prix) values (k, p_plan, p_profil, f.jours, f.prix)
    on conflict do nothing;
    if found then n := n + 1; return next k; end if;
  end loop;
end $$;

drop function if exists public.admin_lister_codes(text, int);
create or replace function public.admin_lister_codes(p_statut text default null, p_limite int default 200)
returns table(code text, plan text, profil text, prix int, statut text, note text, utilise_le timestamptz, cree_le timestamptz, utilisateur text)
language plpgsql security definer set search_path = public
as $$
begin
  if not public.est_admin() then raise exception 'interdit'; end if;
  return query
    select c.code, c.plan, c.profil, c.prix, c.statut, c.note, c.utilise_le, c.cree_le, u.email::text
      from public.codes_activation c
      left join auth.users u on u.id = c.utilise_par
     where p_statut is null or c.statut = p_statut
     order by c.cree_le desc, c.code
     limit least(coalesce(p_limite, 200), 500);
end $$;

create or replace function public.admin_noter_code(p_code text, p_note text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  if not public.est_admin() then raise exception 'interdit'; end if;
  update public.codes_activation set note = left(p_note, 200) where code = p_code;
end $$;

-- N'annule que les codes encore libres (un code déjà utilisé ne peut pas être annulé ici).
create or replace function public.admin_annuler_code(p_code text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare n int;
begin
  if not public.est_admin() then raise exception 'interdit'; end if;
  update public.codes_activation set statut = 'annule' where code = p_code and statut = 'libre';
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- 6. Droits d'exécution : seulement les comptes connectés ----------------------
revoke execute on function public.activer_code(text)                from public, anon;
revoke execute on function public.est_admin()                       from public, anon;
revoke execute on function public.admin_generer_codes(text, text, int) from public, anon;
revoke execute on function public.admin_lister_codes(text, int)     from public, anon;
revoke execute on function public.admin_noter_code(text, text)      from public, anon;
revoke execute on function public.admin_annuler_code(text)          from public, anon;
grant  execute on function public.activer_code(text)                to authenticated;
grant  execute on function public.est_admin()                       to authenticated;
grant  execute on function public.admin_generer_codes(text, text, int) to authenticated;
grant  execute on function public.admin_lister_codes(text, int)     to authenticated;
grant  execute on function public.admin_noter_code(text, text)      to authenticated;
grant  execute on function public.admin_annuler_code(text)          to authenticated;

-- 7. VOUS devenez administrateur (à faire UNE fois, après avoir créé votre compte dans l'application) :
--    remplacez l'adresse par celle de votre compte, puis exécutez ces deux lignes seules.
-- insert into public.admins(user_id) select id from auth.users where email = 'votre@adresse.com' on conflict do nothing;
