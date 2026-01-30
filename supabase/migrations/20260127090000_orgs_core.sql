begin;

-- 1) Tables
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mission text,
  location_radius_km int,
  verified boolean not null default false,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('admin','staff')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists org_members_user_idx on public.org_members (user_id);
create index if not exists org_members_org_idx on public.org_members (org_id);

-- 2) updated_at trigger reuse (you already created public.set_updated_at() earlier)
drop trigger if exists set_orgs_updated_at on public.orgs;
create trigger set_orgs_updated_at
before update on public.orgs
for each row execute function public.set_updated_at();

-- 3) Helpers
create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
  );
$$;

revoke all on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated;

create or replace function public.is_org_admin(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
      and m.role = 'admin'
  );
$$;

revoke all on function public.is_org_admin(uuid) from public;
grant execute on function public.is_org_admin(uuid) to authenticated;

-- 4) Enable RLS
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;

-- 5) Policies

-- ORGS: members can view; creator/admin can update
drop policy if exists "orgs_select_member" on public.orgs;
create policy "orgs_select_member"
on public.orgs for select
to authenticated
using (public.is_org_member(id));

drop policy if exists "orgs_insert_authenticated" on public.orgs;
create policy "orgs_insert_authenticated"
on public.orgs for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "orgs_update_admin" on public.orgs;
create policy "orgs_update_admin"
on public.orgs for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

-- ORG_MEMBERS: members can view their org membership rows; admins can manage memberships
drop policy if exists "org_members_select_member" on public.org_members;
create policy "org_members_select_member"
on public.org_members for select
to authenticated
using (public.is_org_member(org_id));

drop policy if exists "org_members_insert_admin" on public.org_members;
create policy "org_members_insert_admin"
on public.org_members for insert
to authenticated
with check (public.is_org_admin(org_id));

drop policy if exists "org_members_update_admin" on public.org_members;
create policy "org_members_update_admin"
on public.org_members for update
to authenticated
using (public.is_org_admin(org_id))
with check (public.is_org_admin(org_id));

drop policy if exists "org_members_delete_admin" on public.org_members;
create policy "org_members_delete_admin"
on public.org_members for delete
to authenticated
using (public.is_org_admin(org_id));

commit;
