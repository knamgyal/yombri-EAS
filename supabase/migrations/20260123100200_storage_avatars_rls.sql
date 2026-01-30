-- Private avatars bucket + RLS policies (Yombri)
-- Assumes existing helpers:
--   public.flagenabled(flag_key text) -> boolean
--   public.isblocked(a uuid, b uuid) -> boolean

begin;

-- 1) Create the bucket (private)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do update
set name = excluded.name,
    public = false;

-- 2) Helper: extract owner uuid from object path "{ownerUuid}/..."
-- Returns NULL if path doesn't begin with a UUID.
create or replace function public.avatar_owner_uuid(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  owner_text text;
begin
  owner_text := split_part(object_name, '/', 1);

  if owner_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return owner_text::uuid;
  end if;

  return null;
end;
$$;

revoke all on function public.avatar_owner_uuid(text) from public;
grant execute on function public.avatar_owner_uuid(text) to authenticated;

-- 3) Ensure RLS is enabled on storage.objects
-- alter table storage.objects enable row level security; //Supabase already has RLS enabled on storage.objects, and your database role is not the owner of that table

-- 4) Drop old policies (safe re-run)
drop policy if exists avatars_select_unblocked on storage.objects;
drop policy if exists avatars_insert_own_folder on storage.objects;
drop policy if exists avatars_update_own_folder on storage.objects;
drop policy if exists avatars_delete_own_folder on storage.objects;

-- 5) READ: allow authenticated users to read rows needed to mint signed URLs,
-- but block access when either user has blocked the other (when the flag is enabled).
create policy avatars_select_unblocked
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and public.avatar_owner_uuid(name) is not null
  and name like (public.avatar_owner_uuid(name)::text || '/%')
and (
  not public.flag_enabled('ff_block_enforced_everywhere')
  or not public.is_blocked(auth.uid(), public.avatar_owner_uuid(name))
)
);

-- 6) WRITE: only the owner can insert into their own folder "{auth.uid()}/..."
create policy avatars_insert_own_folder
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and name like (auth.uid()::text || '/%')
);

-- 7) UPDATE: only the owner can update objects in their own folder (needed for upsert/overwrite flows).
create policy avatars_update_own_folder
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and name like (auth.uid()::text || '/%')
)
with check (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and name like (auth.uid()::text || '/%')
);

-- 8) DELETE: only the owner can delete objects in their own folder.
create policy avatars_delete_own_folder
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and name like (auth.uid()::text || '/%')
);

commit;
