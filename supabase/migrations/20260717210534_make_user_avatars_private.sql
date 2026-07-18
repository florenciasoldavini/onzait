update storage.buckets
set public = false
where id = 'user-avatars';

drop policy if exists "user_avatars_read_authenticated"
on storage.objects;

create policy "user_avatars_read_authenticated"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'user-avatars'
  and storage.allow_any_operation(array[
    'storage.object.sign',
    'storage.object.sign_many',
    'storage.object.get_authenticated',
    'object.get_authenticated_info',
    'object.head_authenticated_info',
    'storage.render.image_authenticated'
  ])
);

update public.users
set avatar = split_part(
  split_part(
    avatar,
    '/storage/v1/object/public/user-avatars/',
    2
  ),
  '?',
  1
)
where avatar like '%/storage/v1/object/public/user-avatars/users/' || id::text || '/avatar/%';
