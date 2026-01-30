begin;

do $$
begin
  if to_regclass('public.orgs') is not null then
    drop trigger if exists set_orgs_updated_at on public.orgs;
    create trigger set_orgs_updated_at
      before update on public.orgs
      for each row execute function public.set_updated_at();
  end if;

  if to_regclass('public.needs') is not null then
    drop trigger if exists set_needs_updated_at on public.needs;
    create trigger set_needs_updated_at
      before update on public.needs
      for each row execute function public.set_updated_at();
  end if;

  if to_regclass('public.pledges') is not null then
    drop trigger if exists set_pledges_updated_at on public.pledges;
    create trigger set_pledges_updated_at
      before update on public.pledges
      for each row execute function public.set_updated_at();
  end if;
end $$;

commit;
