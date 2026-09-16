insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'organization-avatars',
  'organization-avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function private.current_user_can_manage_organization_avatar(
  p_object_name text
)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when (storage.foldername(p_object_name))[1] = 'organizations'
      and (storage.foldername(p_object_name))[2]
        ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      and (storage.foldername(p_object_name))[3] = 'avatar'
      and array_length(storage.foldername(p_object_name), 1) = 3
    then private.current_user_has_organization_permission(
      ((storage.foldername(p_object_name))[2])::uuid,
      'organization.update'
    )
    else false
  end;
$$;

revoke all on function private.current_user_can_manage_organization_avatar(text)
from public, anon;
grant execute on function private.current_user_can_manage_organization_avatar(text)
to authenticated;

drop policy if exists organization_avatars_insert_admin on storage.objects;
drop policy if exists organization_avatars_update_admin on storage.objects;
drop policy if exists organization_avatars_delete_admin on storage.objects;

create policy organization_avatars_insert_admin
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'organization-avatars'
  and private.current_user_can_manage_organization_avatar(name)
);

create policy organization_avatars_update_admin
on storage.objects
for update
to authenticated
using (
  bucket_id = 'organization-avatars'
  and private.current_user_can_manage_organization_avatar(name)
)
with check (
  bucket_id = 'organization-avatars'
  and private.current_user_can_manage_organization_avatar(name)
);

create policy organization_avatars_delete_admin
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'organization-avatars'
  and private.current_user_can_manage_organization_avatar(name)
);
