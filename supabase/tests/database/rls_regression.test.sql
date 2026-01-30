begin;

select plan(30);

create temporary table _ctx (
  a_id uuid,
  b_id uuid,
  org_id uuid,
  need_id uuid,
  need2_id uuid,
  pledge_id uuid
);

insert into _ctx (a_id, b_id)
values (
  (select id from public.users where email = 'usera@yombri.dev' limit 1),
  (select id from public.users where email = 'userb@yombri.dev' limit 1)
);

select ok((select a_id is not null from _ctx), 'User A exists in public.users');
select ok((select b_id is not null from _ctx), 'User B exists in public.users');

select ok(
  exists(
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orgs' and policyname = 'orgs_select_authenticated'
  ),
  'Policy exists: public.orgs.orgs_select_authenticated'
);

select ok(
  exists(
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'needs' and policyname = 'needs_select_authenticated'
  ),
  'Policy exists: public.needs.needs_select_authenticated'
);

-- Seed as owner (avoid RLS context until after seed).
select lives_ok($$
  with ins as (
    insert into public.orgs (name, mission, location_radius_km, verified, created_by)
    values ('RLS Test Org', 'RLS regression test org', 10, false, (select a_id from _ctx))
    returning id
  )
  update _ctx set org_id = (select id from ins);
$$, 'Seeded org insert succeeds');

select lives_ok($$
  insert into public.org_members (org_id, user_id, role)
  values ((select org_id from _ctx), (select a_id from _ctx), 'admin');
$$, 'Seeded org member insert succeeds');

select lives_ok($$
  with ins as (
    insert into public.needs (org_id, title, description, created_by)
    values ((select org_id from _ctx), 'RLS Test Need', 'RLS regression test need', (select a_id from _ctx))
    returning id
  )
  update _ctx set need_id = (select id from ins);
$$, 'Seeded need 1 insert succeeds');

select lives_ok($$
  with ins as (
    insert into public.needs (org_id, title, description, created_by)
    values ((select org_id from _ctx), 'RLS Test Need 2', 'Second need to test retargeting', (select a_id from _ctx))
    returning id
  )
  update _ctx set need2_id = (select id from ins);
$$, 'Seeded need 2 insert succeeds');

select ok((select org_id is not null from _ctx), 'Seeded org created');
select ok((select need_id is not null from _ctx), 'Seeded need 1 created');
select ok((select need2_id is not null from _ctx), 'Seeded need 2 created');

-- After SET ROLE, authenticated won't own the temp table; grant access explicitly.
grant select, update on table _ctx to authenticated;  -- [web:464]

-- Switch into authenticated once; swap JWT claims to change auth.uid().
set local role authenticated;

-- =========================
-- User B context
-- =========================
select set_config(
  'request.jwt.claims',
  json_build_object('role','authenticated','sub', (select b_id from _ctx))::text,
  true
);

select is(
  (select count(*) from public.orgs where id = (select org_id from _ctx)),
  1::bigint,
  'User B can browse org'
);

select is(
  (select count(*) from public.needs where id in ((select need_id from _ctx), (select need2_id from _ctx))),
  2::bigint,
  'User B can browse needs'
);

select lives_ok($$
  insert into public.pledges (need_id, sponsor_id, status)
  values ((select need_id from _ctx), auth.uid(), 'pending');
$$, 'User B can insert pending pledge');

select lives_ok($$
  update _ctx
  set pledge_id = (
    select id
    from public.pledges
    where need_id = (select need_id from _ctx)
      and sponsor_id = auth.uid()
    limit 1
  );
$$, 'Captured pledge_id');

select ok((select pledge_id is not null from _ctx), 'Pledge id exists');

-- Important: Use 4-arg throws_ok(errcode, errmsg, desc) and pass NULL for errmsg to avoid message matching.
select throws_ok($$
  insert into public.pledges (need_id, sponsor_id, status)
  values ((select need_id from _ctx), (select a_id from _ctx), 'pending');
$$, '42501', NULL, 'User B cannot insert pledge for another user');

select throws_ok($$
  insert into public.pledges (need_id, sponsor_id, status)
  values ((select need_id from _ctx), auth.uid(), 'pending');
$$, '23505', NULL, 'User B cannot insert duplicate pledge');

select throws_ok($$
  update public.pledges
  set status = 'accepted'
  where id = (select pledge_id from _ctx);
$$, '42501', NULL, 'User B cannot set status=accepted');

select throws_ok($$
  update public.pledges
  set sponsor_id = (select a_id from _ctx)
  where id = (select pledge_id from _ctx);
$$, '42501', NULL, 'User B cannot change sponsor_id');

select throws_ok($$
  update public.pledges
  set need_id = (select need2_id from _ctx)
  where id = (select pledge_id from _ctx);
$$, '42501', NULL, 'User B cannot change need_id');

-- =========================
-- User A context (org admin)
-- =========================
select set_config(
  'request.jwt.claims',
  json_build_object('role','authenticated','sub', (select a_id from _ctx))::text,
  true
);

select lives_ok($$
  update public.pledges
  set status = 'accepted'
  where id = (select pledge_id from _ctx);
$$, 'User A can accept');

select is(
  (select status from public.pledges where id = (select pledge_id from _ctx)),
  'accepted',
  'Status is accepted'
);

select throws_ok($$
  update public.pledges
  set status = 'delivered'
  where id = (select pledge_id from _ctx);
$$, '42501', NULL, 'User A cannot set status=delivered');

select throws_ok($$
  update public.pledges
  set sponsor_id = (select b_id from _ctx)
  where id = (select pledge_id from _ctx);
$$, '42501', NULL, 'User A cannot change sponsor_id');

select throws_ok($$
  update public.pledges
  set need_id = (select need2_id from _ctx)
  where id = (select pledge_id from _ctx);
$$, '42501', NULL, 'User A cannot change need_id');

-- =========================
-- User B delivered
-- =========================
select set_config(
  'request.jwt.claims',
  json_build_object('role','authenticated','sub', (select b_id from _ctx))::text,
  true
);

select lives_ok($$
  update public.pledges
  set status = 'delivered'
  where id = (select pledge_id from _ctx);
$$, 'User B can set status=delivered');

select is(
  (select status from public.pledges where id = (select pledge_id from _ctx)),
  'delivered',
  'Status is delivered'
);

-- =========================
-- User A confirmed
-- =========================
select set_config(
  'request.jwt.claims',
  json_build_object('role','authenticated','sub', (select a_id from _ctx))::text,
  true
);

select lives_ok($$
  update public.pledges
  set status = 'confirmed'
  where id = (select pledge_id from _ctx);
$$, 'User A can set status=confirmed');

select is(
  (select status from public.pledges where id = (select pledge_id from _ctx)),
  'confirmed',
  'Status is confirmed'
);

select * from finish(true);

rollback;
