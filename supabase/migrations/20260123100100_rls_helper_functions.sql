--.../supabase/migrations/20260123100100_RLS + helper functions.sql

-- Helper: read flags
create or replace function public.flag_enabled(flag_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select enabled from public.app_flags where key = flag_key), false);
$$;

revoke all on function public.flag_enabled(text) from public;
grant execute on function public.flag_enabled(text) to authenticated;

-- Helper: block relationship check (either direction)
create or replace function public.is_blocked(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_blocks ub
    where (ub.blocker_id = a and ub.blocked_id = b)
       or (ub.blocker_id = b and ub.blocked_id = a)
  );
$$;

revoke all on function public.is_blocked(uuid, uuid) from public;
grant execute on function public.is_blocked(uuid, uuid) to authenticated;

-- Helper: mutual follow (directed follows both ways)
create or replace function public.is_mutual_follow(a uuid, b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (select 1 from public.follows f where f.follower_id = a and f.following_id = b)
    and
    exists (select 1 from public.follows f where f.follower_id = b and f.following_id = a);
$$;

revoke all on function public.is_mutual_follow(uuid, uuid) from public;
grant execute on function public.is_mutual_follow(uuid, uuid) to authenticated;

-- Helper: DM eligibility (uses ff_dm_requires_mutual_follow + blocks)
create or replace function public.can_dm(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    case
      when public.flag_enabled('ff_block_enforced_everywhere') and public.is_blocked(auth.uid(), target_user_id) then false
      when public.flag_enabled('ff_dm_requires_mutual_follow') then public.is_mutual_follow(auth.uid(), target_user_id)
      else true
    end;
$$;

revoke all on function public.can_dm(uuid) from public;
grant execute on function public.can_dm(uuid) to authenticated;

-- Enable RLS
alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.follows enable row level security;
alter table public.user_blocks enable row level security;

-- USERS: only see/update yourself
drop policy if exists "users_select_self" on public.users;
create policy "users_select_self"
on public.users for select
to authenticated
using (id = auth.uid());

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self"
on public.users for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- PROFILES: public read unless blocked (when flag enabled); only self can update
drop policy if exists "profiles_select_public_unblocked" on public.user_profiles;
create policy "profiles_select_public_unblocked"
on public.user_profiles for select
to authenticated
using (
  case
    when public.flag_enabled('ff_block_enforced_everywhere')
      then not public.is_blocked(auth.uid(), user_id)
    else true
  end
);

drop policy if exists "profiles_update_self" on public.user_profiles;
create policy "profiles_update_self"
on public.user_profiles for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "profiles_insert_self" on public.user_profiles;
create policy "profiles_insert_self"
on public.user_profiles for insert
to authenticated
with check (user_id = auth.uid());

-- FOLLOWS: users can see follow edges involving themselves; cannot follow across blocks when flag enabled
drop policy if exists "follows_select_own_edges" on public.follows;
create policy "follows_select_own_edges"
on public.follows for select
to authenticated
using (
  follower_id = auth.uid()
  or following_id = auth.uid()
);

drop policy if exists "follows_insert_self" on public.follows;
create policy "follows_insert_self"
on public.follows for insert
to authenticated
with check (
  follower_id = auth.uid()
  and follower_id <> following_id
  and (
    case
      when public.flag_enabled('ff_block_enforced_everywhere')
        then not public.is_blocked(follower_id, following_id)
      else true
    end
  )
);

drop policy if exists "follows_delete_self" on public.follows;
create policy "follows_delete_self"
on public.follows for delete
to authenticated
using (follower_id = auth.uid());

-- BLOCKS: only blocker can manage + view their list
drop policy if exists "blocks_select_self" on public.user_blocks;
create policy "blocks_select_self"
on public.user_blocks for select
to authenticated
using (blocker_id = auth.uid());

drop policy if exists "blocks_insert_self" on public.user_blocks;
create policy "blocks_insert_self"
on public.user_blocks for insert
to authenticated
with check (blocker_id = auth.uid() and blocker_id <> blocked_id);

drop policy if exists "blocks_delete_self" on public.user_blocks;
create policy "blocks_delete_self"
on public.user_blocks for delete
to authenticated
using (blocker_id = auth.uid());
