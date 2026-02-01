begin;

-- Fix avatars_select_unblocked
drop policy if exists avatars_select_unblocked on storage.objects;

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

-- Fix avatars_update_own_folder
drop policy if exists avatars_update_own_folder on storage.objects;

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

commit;
