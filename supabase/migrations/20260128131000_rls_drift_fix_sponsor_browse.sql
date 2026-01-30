begin;

-- 1) Sponsor browsing: allow any authenticated user to list orgs + needs.
-- Safe to re-run.
drop policy if exists orgs_select_authenticated on public.orgs;
create policy orgs_select_authenticated
on public.orgs
for select
to authenticated
using (true);

drop policy if exists needs_select_authenticated on public.needs;
create policy needs_select_authenticated
on public.needs
for select
to authenticated
using (true);

-- 2) Drift fix: make can_view_need sponsor-friendly.
-- This MUST match your current production behavior, because pledges_insert_sponsor WITH CHECK depends on it.
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
  );
$$;

revoke all on function public.can_view_need(uuid) from public;
grant execute on function public.can_view_need(uuid) to authenticated;

commit;
