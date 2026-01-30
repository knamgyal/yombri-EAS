begin;

create table if not exists public.needs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists needs_org_idx on public.needs (org_id);

-- updated_at trigger (standardized to public.set_updated_at)
drop trigger if exists set_needs_updated_at on public.needs;
create trigger set_needs_updated_at
before update on public.needs
for each row execute function public.set_updated_at();

alter table public.needs enable row level security;

-- Helper: admin/staff can manage needs
create or replace function public.can_manage_org_needs(p_org_id uuid)
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
      and m.role in ('admin','staff')
  );
$$;

revoke all on function public.can_manage_org_needs(uuid) from public;
grant execute on function public.can_manage_org_needs(uuid) to authenticated;

-- Policies
drop policy if exists needs_select_org_member on public.needs;
create policy needs_select_org_member
on public.needs for select
to authenticated
using (public.is_org_member(org_id));

drop policy if exists needs_insert_org_manager on public.needs;
create policy needs_insert_org_manager
on public.needs for insert
to authenticated
with check (
  public.can_manage_org_needs(org_id)
  and created_by = auth.uid()
);

drop policy if exists needs_update_org_manager on public.needs;
create policy needs_update_org_manager
on public.needs for update
to authenticated
using (public.can_manage_org_needs(org_id))
with check (public.can_manage_org_needs(org_id));

drop policy if exists needs_delete_org_admin on public.needs;
create policy needs_delete_org_admin
on public.needs for delete
to authenticated
using (public.is_org_admin(org_id));

commit;
