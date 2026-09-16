begin;

create extension if not exists pgtap with schema extensions;

select plan(8);

insert into public.users (id, first_name, email, role)
values
  ('00000000-0000-4000-8000-000000000451', 'Invitation Owner', 'invitation-owner@example.com', 'user'),
  ('00000000-0000-4000-8000-000000000452', 'Invitation Target', 'invitation-target@example.com', 'user'),
  ('00000000-0000-4000-8000-000000000453', 'Invitation Outsider', 'invitation-outsider@example.com', 'user');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000451', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '00000000-0000-4000-8000-000000000451',
    'email', 'invitation-owner@example.com',
    'role', 'authenticated'
  )::text,
  true
);

select lives_ok(
  $$ select public.create_organization('Invitation Studio', null) $$,
  'the owner can create an organization for invitation management'
);

select lives_ok(
  $$
    select public.create_organization_invitation(
      (select id from public.organizations where name = 'Invitation Studio'),
      'invitation-target@example.com',
      'member'
    )
  $$,
  'the owner can create a pending invitation'
);

select is(
  (
    public.list_pending_organization_invitations(
      (select id from public.organizations where name = 'Invitation Studio'),
      20,
      0
    ) -> 'items' -> 0 ->> 'email'
  ),
  'invitation-target@example.com',
  'the owner can list pending invitations for the organization'
);

select is(
  jsonb_array_length(
    public.list_pending_organization_invitations(
      (select id from public.organizations where name = 'Invitation Studio'),
      20,
      0
    ) -> 'items'
  ),
  1,
  'the pending invitation list is scoped to the organization'
);

select
  public.list_pending_organization_invitations(
    (select id from public.organizations where name = 'Invitation Studio'),
    20,
    0
  ) -> 'items' -> 0 ->> 'id' as invitation_id
\gset

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000453', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '00000000-0000-4000-8000-000000000453',
    'email', 'invitation-outsider@example.com',
    'role', 'authenticated'
  )::text,
  true
);

select is(
  jsonb_array_length(
    public.list_pending_organization_invitations(
      (select id from public.organizations where name = 'Invitation Studio'),
      20,
      0
    ) -> 'items'
  ),
  0,
  'an outsider cannot list pending organization invitations'
);

select throws_ok(
  format(
    $$ select public.revoke_organization_invitation(%L) $$,
    :'invitation_id'
  ),
  '42501',
  null,
  'an outsider cannot revoke an organization invitation'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000451', true);

select is(
  (
    public.revoke_organization_invitation(
      :'invitation_id'::uuid
    ) ->> 'status'
  ),
  'revoked',
  'the owner can revoke a pending organization invitation'
);

select is(
  jsonb_array_length(
    public.list_pending_organization_invitations(
      (select id from public.organizations where name = 'Invitation Studio'),
      20,
      0
    ) -> 'items'
  ),
  0,
  'revoked invitations disappear from the pending list'
);

select * from finish();
rollback;
