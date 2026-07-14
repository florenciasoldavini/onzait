begin;

create extension if not exists pgtap with schema extensions;

select plan(20);

insert into public.users (id, first_name, email, role)
values
  ('00000000-0000-4000-8000-000000000011', 'Task Owner', 'task-owner@example.com', 'user'),
  ('00000000-0000-4000-8000-000000000012', 'Other Owner', 'task-other@example.com', 'user'),
  ('00000000-0000-4000-8000-000000000013', 'Task Admin', 'task-admin@example.com', 'admin')
on conflict (id) do update
set role = excluded.role, deleted_at = null;

insert into public.projects (id, owner_id, name, address, google_place_id, latitude, longitude)
values
  ('10000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000011', 'Owner Task Project', '11 Task Street', 'task-place-11', -34.60, -58.38),
  ('10000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000012', 'Other Task Project', '12 Task Street', 'task-place-12', -34.61, -58.39);

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000011', true);

select lives_ok(
  $$ insert into public.tasks (id, project_id, owner_id, title)
     values ('20000000-0000-4000-8000-000000000011', '10000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000012', 'Owner task') $$,
  'owner can create a task on their project'
);

select is(
  (select owner_id from public.tasks where id = '20000000-0000-4000-8000-000000000011'),
  '00000000-0000-4000-8000-000000000011'::uuid,
  'database derives task ownership from the project'
);

select lives_ok(
  $$ insert into public.tasks (id, owner_id, title)
     values ('20000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000012', 'Standalone owner task') $$,
  'owner can create a standalone task'
);

select is(
  (select owner_id from public.tasks where id = '20000000-0000-4000-8000-000000000013'),
  '00000000-0000-4000-8000-000000000011'::uuid,
  'database derives standalone task ownership from auth uid'
);

select lives_ok(
  $$ update public.tasks set status = 'completed' where id = '20000000-0000-4000-8000-000000000011' $$,
  'owner can complete their task'
);

select ok(
  (select completed_at is not null from public.tasks where id = '20000000-0000-4000-8000-000000000011'),
  'completion timestamp is set automatically'
);

select isnt(
  (
    with updated as (
      update public.tasks
      set completed_at = '2100-01-01 00:00:00'
      where id = '20000000-0000-4000-8000-000000000011'
      returning completed_at
    )
    select completed_at from updated
  ),
  '2100-01-01 00:00:00'::timestamp,
  'client cannot overwrite the server-derived completion timestamp'
);

select lives_ok(
  $$ update public.tasks set status = 'to_do' where id = '20000000-0000-4000-8000-000000000011' $$,
  'owner can reopen their task'
);

select ok(
  (select completed_at is null from public.tasks where id = '20000000-0000-4000-8000-000000000011'),
  'reopening clears the completion timestamp'
);

select throws_ok(
  $$ insert into public.tasks (project_id, owner_id, title)
     values ('10000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000011', 'Unauthorized task') $$,
  '23503',
  null,
  'normal user cannot create a task on another project'
);

reset role;
insert into public.tasks (id, project_id, owner_id, title)
values ('20000000-0000-4000-8000-000000000012', '10000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000012', 'Other task');
set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000011', true);

select is(
  (select count(*)::integer from public.tasks where id = '20000000-0000-4000-8000-000000000012'),
  0,
  'normal user cannot read another project task'
);

select results_eq(
  $$ with updated as (
       update public.tasks set title = 'Unauthorized' where id = '20000000-0000-4000-8000-000000000012' returning 1
     ) select count(*)::integer from updated $$,
  $$ values (0) $$,
  'normal user cannot update another project task'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000012', true);

select is(
  (select count(*)::integer from public.tasks where id = '20000000-0000-4000-8000-000000000013'),
  0,
  'normal user cannot read another user standalone task'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000011', true);

select results_eq(
  $$ with updated as (
       update public.tasks set deleted_at = current_timestamp where id = '20000000-0000-4000-8000-000000000011' returning 1
     ) select count(*)::integer from updated $$,
  $$ values (1) $$,
  'owner can soft-delete their task'
);

select is(
  (select count(*)::integer from public.tasks where id = '20000000-0000-4000-8000-000000000011' and deleted_at is null),
  0,
  'active task reads can filter the soft-deleted row'
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000013', true);

select is(
  (select count(*)::integer from public.tasks where id = '20000000-0000-4000-8000-000000000013'),
  1,
  'admin can read standalone tasks'
);

select lives_ok(
  $$ update public.tasks set status = 'in_progress' where id = '20000000-0000-4000-8000-000000000013' $$,
  'admin can update another user standalone task'
);

select is(
  (select owner_id from public.tasks where id = '20000000-0000-4000-8000-000000000013'),
  '00000000-0000-4000-8000-000000000011'::uuid,
  'admin update preserves standalone task ownership'
);

select is(
  (select count(*)::integer from public.tasks where id = '20000000-0000-4000-8000-000000000012'),
  1,
  'admin can read tasks from every active project'
);

select lives_ok(
  $$ update public.tasks set priority = 'urgent' where id = '20000000-0000-4000-8000-000000000012' $$,
  'admin can update tasks from another project'
);

select * from finish();

rollback;
