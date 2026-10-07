begin;

create extension if not exists pgtap with schema extensions;

select plan(7);
select set_config('storage.allow_delete_query', 'true', true);

select is(
  (select public from storage.buckets where id = 'organization-avatars'),
  true,
  'organization avatars bucket is public'
);

select is(
  (select file_size_limit from storage.buckets where id = 'organization-avatars'),
  5242880::bigint,
  'organization avatars are limited to 5 MiB'
);

select is(
  (
    select allowed_mime_types
    from storage.buckets
    where id = 'organization-avatars'
  ),
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[],
  'organization avatars accept supported image types'
);

insert into public.users (id, first_name, email, role)
values
  ('00000000-0000-4000-8000-000000000701', 'Owner', 'avatar-owner@example.com', 'user'),
  ('00000000-0000-4000-8000-000000000702', 'Member', 'avatar-member@example.com', 'user'),
  ('00000000-0000-4000-8000-000000000703', 'Outsider', 'avatar-outsider@example.com', 'user');

insert into public.organizations (id, owner_user_id, name, created_by)
values (
  '80000000-0000-4000-8000-000000000701',
  '00000000-0000-4000-8000-000000000701',
  'Avatar Studio',
  '00000000-0000-4000-8000-000000000701'
);

insert into public.organization_memberships (
  organization_id,
  user_id,
  role_code,
  invited_by
)
values
  (
    '80000000-0000-4000-8000-000000000701',
    '00000000-0000-4000-8000-000000000701',
    'admin',
    '00000000-0000-4000-8000-000000000701'
  ),
  (
    '80000000-0000-4000-8000-000000000701',
    '00000000-0000-4000-8000-000000000702',
    'member',
    '00000000-0000-4000-8000-000000000701'
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000000701',
  true
);
select set_config('request.jwt.claim.role', 'authenticated', true);

select lives_ok(
  $$
    insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'organization-avatars',
      'organizations/80000000-0000-4000-8000-000000000701/avatar/logo.png',
      '00000000-0000-4000-8000-000000000701',
      '{"mimetype":"image/png","size":1024}'::jsonb
    )
  $$,
  'organization owner can upload an avatar'
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'organization-avatars',
      'organizations/not-a-uuid/avatar/logo.png',
      '00000000-0000-4000-8000-000000000701',
      '{"mimetype":"image/png","size":1024}'::jsonb
    )
  $$,
  '42501',
  null,
  'malformed organization avatar paths are rejected'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000000702',
  true
);

select throws_ok(
  $$
    insert into storage.objects (bucket_id, name, owner_id, metadata)
    values (
      'organization-avatars',
      'organizations/80000000-0000-4000-8000-000000000701/avatar/member.png',
      '00000000-0000-4000-8000-000000000702',
      '{"mimetype":"image/png","size":1024}'::jsonb
    )
  $$,
  '42501',
  null,
  'ordinary organization members cannot upload avatars'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-4000-8000-000000000703',
  true
);

select results_eq(
  $$
    with deleted as (
      delete from storage.objects
      where bucket_id = 'organization-avatars'
        and name = 'organizations/80000000-0000-4000-8000-000000000701/avatar/logo.png'
      returning 1
    )
    select count(*)::integer from deleted
  $$,
  $$ values (0) $$,
  'organization outsiders cannot delete avatars'
);

reset role;

select * from finish();
rollback;
