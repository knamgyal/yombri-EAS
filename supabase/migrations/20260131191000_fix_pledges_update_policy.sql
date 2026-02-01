begin;

drop policy if exists pledges_update_flow on public.pledges;

create policy pledges_update_flow
on public.pledges
for update
to authenticated
using (
  sponsor_id = auth.uid()
  or public.can_manage_need(need_id)
)
with check (
  (sponsor_id = auth.uid() and status in ('pending','delivered'))
  or (public.can_manage_need(need_id) and status in ('accepted','rejected','confirmed'))
);

commit;
