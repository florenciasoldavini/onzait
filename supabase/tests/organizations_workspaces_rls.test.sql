begin;

create extension if not exists pgtap with schema extensions;

select plan(13);

insert into public.users (id, first_name, email, role)
values
  ('00000000-0000-4000-8000-000000000401', 'Organization Owner', 'organization-owner@example.com', 'user'),
  ('00000000-0000-4000-8000-000000000402', 'Organization Member', 'organization-member@example.com', 'user'),
  ('00000000-0000-4000-8000-000000000403', 'Organization Outsider', 'organization-outsider@example.com', 'user');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000401', true);
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '00000000-0000-4000-8000-000000000401',
    'email', 'organization-owner@example.com',
    'role', 'authenticated'
  )::text,
  true
);

select lives_ok(
  $$ select public.create_organization('Studio North', null) $$,
  'an authenticated user can atomically create an organization'
);

select is(
  (select count(*) from public.workspaces workspace join public.organizations organization on organization.id = workspace.organization_id where organization.name = 'Studio North'),
  1::bigint,
  'organization creation includes one initial workspace'
);

select is(
  (select membership.role_code from public.organization_memberships membership join public.organizations organization on organization.id = membership.organization_id where organization.name = 'Studio North' and membership.user_id = '00000000-0000-4000-8000-000000000401'),
  'admin',
  'the organization owner starts as an admin member'
);

select set_config(
  'test.organization_invitation_payload',
  public.create_organization_invitation(
    (select id from public.organizations where name = 'Studio North'),
    'organization-member@example.com',
    'member'
  )::text,
  true
);

select is(
  current_setting('test.organization_invitation_payload')::jsonb ->> 'status',
  'pending',
  'an organization owner can invite a member'
);

select is(
  char_length(current_setting('test.organization_invitation_payload')::jsonb ->> 'token'),
  64,
  'organization invitation creation returns a high-entropy raw token once'
);

set local role anon;
select is(
  public.preview_organization_invitation(
    current_setting('test.organization_invitation_payload')::jsonb ->> 'token'
  ) ->> 'organization_name',
  'Studio North',
  'an anonymous visitor can preview only an invitation identified by its token'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000402', true);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', '00000000-0000-4000-8000-000000000402',
    'email', 'organization-member@example.com',
    'role', 'authenticated'
  )::text,
  true
);

select lives_ok(
  format(
    $$ select public.respond_organization_invitation_by_token(%L, 'accepted') $$,
    current_setting('test.organization_invitation_payload')::jsonb ->> 'token'
  ),
  'the invited user can join the organization with its token'
);

select is(
  (public.list_my_workspaces(50, 0) -> 'items' -> 0 ->> 'display_name'),
  'Studio North',
  'organization members see its workspace'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000401', true);
select lives_ok(
  $$
    insert into public.projects (workspace_id, name, address, google_place_id, latitude, longitude)
    values ((select workspace.id from public.workspaces workspace join public.organizations organization on organization.id = workspace.organization_id where organization.name = 'Studio North'), 'Organization Project', '401 Organization Street', 'organization-place-401', -34.60, -58.38)
  $$,
  'the organization owner can create a workspace project'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000402', true);
select is(
  private.current_user_project_role((select id from public.projects where name = 'Organization Project')),
  'manager',
  'ordinary organization members inherit manager project capabilities'
);

reset role;
select throws_ok(
  $$
    insert into public.project_memberships (project_id, user_id, role_code, invited_by)
    values ((select id from public.projects where name = 'Organization Project'), '00000000-0000-4000-8000-000000000402', 'viewer', '00000000-0000-4000-8000-000000000401')
  $$,
  '23505',
  null,
  'inherited access cannot be duplicated by a direct project membership'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000403', true);
select is(
  (select count(*) from public.workspaces),
  0::bigint,
  'outsiders cannot read organization workspaces'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000401', true);
reset role;
select throws_ok(
  $$ update public.organization_memberships set role_code = 'member' where user_id = '00000000-0000-4000-8000-000000000401' $$,
  '42501',
  null,
  'the organization owner cannot be demoted'
);

select * from finish();
rollback;
