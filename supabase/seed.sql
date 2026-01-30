-- supabase/seed.sql
-- Seeds two local demo accounts:
--   usera@yombri.dev / password123
--   userb@yombri.dev / password123

create extension if not exists "pgcrypto";

do $$
declare
  a_id uuid := '11111111-1111-1111-1111-111111111111';
  b_id uuid := '22222222-2222-2222-2222-222222222222';
  a_email text := 'usera@yombri.dev';
  b_email text := 'userb@yombri.dev';
  a_pw text := crypt('password123', gen_salt('bf'));
  b_pw text := crypt('password123', gen_salt('bf'));
begin
  -- User A in auth.users
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    a_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    a_email,
    a_pw,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  -- User A identity
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    a_id,
    a_id,
    format('{"sub":"%s","email":"%s"}', a_id::text, a_email)::jsonb,
    'email',
    a_id,
    now(),
    now(),
    now()
  )
  on conflict (id) do nothing;

  -- User B in auth.users
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  values (
    b_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    b_email,
    b_pw,
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  -- User B identity
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    b_id,
    b_id,
    format('{"sub":"%s","email":"%s"}', b_id::text, b_email)::jsonb,
    'email',
    b_id,
    now(),
    now(),
    now()
  )
  on conflict (id) do nothing;
end $$;
