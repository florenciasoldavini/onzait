begin;
create extension if not exists pgtap with schema extensions;
select plan(18);

insert into public.users(id, first_name, email) values
  ('00000000-0000-4000-8000-000000000551', 'Owner', 'email-owner@example.com'),
  ('00000000-0000-4000-8000-000000000552', 'Member', 'email-member@example.com'),
  ('00000000-0000-4000-8000-000000000553', 'Outsider', 'email-outsider@example.com');
insert into public.organizations(id, owner_user_id, created_by, name) values
  ('00000000-0000-4000-8000-000000000554', '00000000-0000-4000-8000-000000000551', '00000000-0000-4000-8000-000000000551', 'Email Test Organization');
insert into public.organization_memberships(organization_id, user_id, role_code) values
  ('00000000-0000-4000-8000-000000000554', '00000000-0000-4000-8000-000000000551', 'admin'),
  ('00000000-0000-4000-8000-000000000554', '00000000-0000-4000-8000-000000000552', 'member');

select ok(not has_function_privilege('anon', 'public.prepare_organization_invitation_email(uuid,text,text,text,uuid)', 'execute'), 'anonymous callers cannot reserve email');
select ok(not has_table_privilege('authenticated', 'public.organization_invitations', 'update'), 'clients cannot forge email delivery state');
select ok(not has_table_privilege('authenticated', 'private.organization_invitation_email_attempts', 'insert'), 'clients cannot edit the sending ledger');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000553', true);
select throws_ok($$select public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', 'target@example.com')$$, '42501', null, 'outsiders cannot send invitations');
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000552', true);
select throws_ok($$select public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', 'target@example.com')$$, '42501', null, 'ordinary members cannot send invitations');
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000551', true);
select throws_ok($$select public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', 'invalid email')$$, '22023', null, 'invalid recipients are rejected');
select is(public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', 'email-member@example.com')->>'status', 'already_member', 'existing members do not receive email');
create temp table email_reservation as select public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', '  Target@Example.com ', 'admin', 'en') as result;
select is((select result->>'invited_email' from email_reservation), 'target@example.com', 'owner reservations normalize the recipient');
select is((select result->>'delivery_version' from email_reservation), '1', 'first delivery gets a unique version');
select throws_ok($$select public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', 'target@example.com')$$, 'P0429', null, 'repeated creates cannot bypass the resend cooldown');
reset role;
select is((select token_hash from public.organization_invitations where id = (select (result->>'id')::uuid from email_reservation)), (select encode(extensions.digest(result->>'token', 'sha256'), 'hex') from email_reservation), 'only the token hash is persisted');
select is((select count(*)::integer from private.organization_invitation_email_attempts where organization_id = '00000000-0000-4000-8000-000000000554'), 1, 'only send reservations consume the durable limit');
update public.organization_invitations set last_delivery_attempt_at = now() - interval '2 minutes' where id = (select (result->>'id')::uuid from email_reservation);
set local role authenticated;
create temp table email_resend as select public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', p_language_code => 'es', p_invitation_id => (select (result->>'id')::uuid from email_reservation)) as result;
select is((select result->>'delivery_version' from email_resend), '2', 'resending increments the delivery version');
select is((select result->>'language_code' from email_resend), 'en', 'resending preserves the original language');
select ok((select result->>'token' from email_resend) <> (select result->>'token' from email_reservation), 'resending rotates the acceptance token');
reset role;
update public.organization_invitations set status = 'revoked', revoked_by = '00000000-0000-4000-8000-000000000551', responded_at = now() where id = (select (result->>'id')::uuid from email_reservation);
set local role authenticated;
select throws_ok($$select public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', p_invitation_id => (select (result->>'id')::uuid from email_reservation))$$, 'P0002', null, 'revoked invitations cannot be resent');
reset role;
insert into private.organization_invitation_email_attempts(organization_id, actor_id) select '00000000-0000-4000-8000-000000000554', '00000000-0000-4000-8000-000000000551' from generate_series(1, 48);
set local role authenticated;
select throws_ok($$select public.prepare_organization_invitation_email('00000000-0000-4000-8000-000000000554', 'another@example.com')$$, 'P0429', null, 'daily actor limits stop sends before the provider call');
reset role;
select is((select count(*)::integer from public.organization_invitations where invited_email = 'another@example.com'), 0, 'limited requests do not create unusable invitations');
select * from finish();
rollback;
