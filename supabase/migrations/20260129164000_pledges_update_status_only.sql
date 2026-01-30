begin;

revoke update on table public.pledges from authenticated;
grant update (status) on table public.pledges to authenticated;

commit;
