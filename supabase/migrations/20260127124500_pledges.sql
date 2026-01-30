begin;

create table if not exists public.pledges (
  id uuid primary key default gen_random_uuid(),
  need_id uuid not null references public.needs(id) on delete cascade,
  sponsor_id uuid not null references public.users(id) on delete cascade,
  status text not null check (status in ('pending','accepted','rejected','delivered','confirmed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (need_id, sponsor_id)
);

create index if not exists pledges_need_idx on public.pledges (need_id);
create index if not exists pledges_sponsor_idx on public.pledges (sponsor_id);

-- updated_at trigger (standardized to public.set_updated_at)
drop trigger if exists set_pledges_updated_at on public.pledges;
create trigger set_pledges_updated_at
before update on public.pledges
for each row execute function public.set_updated_at();

alter table public.pledges enable row level security;

-- Helpers
create or replace function public.need_org_id(p_need_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select n.org_id
  from public.needs n
  where n.id = p_need_id;
$$;

revoke all on function public.need_org_id(uuid) from public;
grant execute on function public.need_org_id(uuid) to authenticated;

create or replace function public.can_view_need(p_need_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.needs n
    where n.id = p_need_id
      and public.is_org_member(n.org_id)
  );
$$;

revoke all on function public.can_view_need(uuid) from public;
grant execute on function public.can_view_need(uuid) to authenticated;

create or replace function public.can_manage_need(p_need_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.needs n
    where n.id = p_need_id
      and public.can_manage_org_needs(n.org_id)
  );
$$;

revoke all on function public.can_manage_need(uuid) from public;
grant execute on function public.can_manage_need(uuid) to authenticated;

-- Policies

drop policy if exists pledges_select_sponsor_or_org_manager on public.pledges;
create policy pledges_select_sponsor_or_org_manager
on public.pledges for select
to authenticated
using (
  sponsor_id = auth.uid()
  or public.can_manage_need(need_id)
);

drop policy if exists pledges_insert_sponsor on public.pledges;
create policy pledges_insert_sponsor
on public.pledges for insert
to authenticated
with check (
  sponsor_id = auth.uid()
  and status = 'pending'
  and public.can_view_need(need_id)
);

drop policy if exists pledges_update_flow on public.pledges;
create policy pledges_update_flow
on public.pledges for update
to authenticated
using (
  sponsor_id = auth.uid()
  or public.can_manage_need(need_id)
)
with check (
  (
    sponsor_id = auth.uid()
    and status in ('pending','delivered')
  )
  or
  (
    public.can_manage_need(need_id)
    and status in ('accepted','rejected','confirmed')
  )
);

commit;
