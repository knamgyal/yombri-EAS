-- .../supabase/migrations/20260123100000_identity.sql
-- Uses gen_random_uuid(); ensure pgcrypto is available. [web:219]

create extension if not exists "pgcrypto"; -- required for gen_random_uuid() in many environments [web:219][web:230]

-- 1) Feature flags
create table if not exists public.app_flags (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

insert into public.app_flags (key, enabled) values
  ('ff_dm_requires_mutual_follow', true),
  ('ff_block_enforced_everywhere', true)
on conflict (key) do update
set enabled = excluded.enabled,
    updated_at = now();

-- 2) Public user row (private-ish, tied to auth.users)
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) Public profile (what you show in the UI)
create table if not exists public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text,
  avatar_path text, --updated from avatar_url to avatar_path
  updated_at timestamptz not null default now()
);

-- 4) Directed follow graph
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_no_self_follow check (follower_id <> following_id),
  constraint follows_unique unique (follower_id, following_id)
);

create index if not exists follows_follower_idx on public.follows (follower_id);
create index if not exists follows_following_idx on public.follows (following_id);

-- 5) Blocks
create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null references public.users(id) on delete cascade,
  blocked_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint blocks_no_self_block check (blocker_id <> blocked_id),
  constraint blocks_unique unique (blocker_id, blocked_id)
);

create index if not exists blocks_blocker_idx on public.user_blocks (blocker_id);
create index if not exists blocks_blocked_idx on public.user_blocks (blocked_id);

-- 6) Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.user_profiles;
create trigger set_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

-- 7) Auto-create rows when an auth user is created
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, phone)
  values (new.id, new.email, new.phone)
  on conflict (id) do update
    set email = excluded.email,
        phone = excluded.phone,
        updated_at = now();

  insert into public.user_profiles (user_id, display_name, avatar_path)
  values (new.id, null, null)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
