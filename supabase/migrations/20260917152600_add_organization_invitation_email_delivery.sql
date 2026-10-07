-- Provider acceptance is tracked separately from invitation acceptance.
alter table public.organization_invitations
  add column language_code text not null default 'es' check (language_code in ('es', 'en')),
  add column delivery_status text not null default 'not_sent'
    check (delivery_status in ('not_sent', 'sending', 'sent', 'failed')),
  add column delivery_version integer not null default 0 check (delivery_version >= 0),
  add column last_delivery_attempt_at timestamptz,
  add column email_sent_at timestamptz;

create table private.organization_invitation_email_attempts (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id),
  actor_id uuid not null references public.users(id),
  attempted_at timestamptz not null default now()
);
create index organization_invitation_email_attempts_time_idx
  on private.organization_invitation_email_attempts(attempted_at);
alter table private.organization_invitation_email_attempts enable row level security;
revoke all on private.organization_invitation_email_attempts from public, anon, authenticated;

create or replace function private.prepare_organization_invitation_email(
  p_organization_id uuid,
  p_email text default null,
  p_role_code text default 'member',
  p_language_code text default 'es',
  p_invitation_id uuid default null
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  sender_id uuid := (select auth.uid());
  invitation public.organization_invitations;
  result jsonb;
  target_email text := lower(trim(p_email));
  target_role text := p_role_code;
  target_language text := case when p_language_code = 'en' then 'en' else 'es' end;
begin
  if sender_id is null or not private.current_user_has_organization_permission(
    p_organization_id, 'organization.members.manage'
  ) then
    raise exception 'Organization invitation permission required.' using errcode = '42501';
  end if;
  -- Serialize reservations so concurrent requests cannot bypass the global cap.
  perform pg_advisory_xact_lock(9172026, 1);
  if p_invitation_id is not null then
    select * into invitation from public.organization_invitations
    where id = p_invitation_id and organization_id = p_organization_id for update;
    if invitation.id is null or invitation.status <> 'pending'
      or invitation.expires_at <= now() then
      raise exception 'Invitation unavailable.' using errcode = 'P0002';
    end if;
    target_email := invitation.invited_email;
    target_role := invitation.role_code;
    target_language := invitation.language_code;
  else
    if target_email is null or length(target_email) > 254
      or target_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      or target_role not in ('admin', 'member') then
      raise exception 'Invalid invitation.' using errcode = '22023';
    end if;
    select * into invitation from public.organization_invitations
    where organization_id = p_organization_id and invited_email = target_email
      and status = 'pending' for update;
    if invitation.id is not null then
      target_language := invitation.language_code;
    end if;
  end if;
  if invitation.last_delivery_attempt_at > now() - interval '60 seconds' then
    raise exception 'Wait before resending.' using errcode = 'P0429';
  end if;
  if (select count(*) from private.organization_invitation_email_attempts
      where attempted_at > now() - interval '24 hours') >= 1000
    or (select count(*) from private.organization_invitation_email_attempts
      where attempted_at > now() - interval '24 hours' and actor_id = sender_id) >= 50
    or (select count(*) from private.organization_invitation_email_attempts
      where attempted_at > now() - interval '24 hours' and organization_id = p_organization_id) >= 100 then
    raise exception 'Invitation email limit reached.' using errcode = 'P0429';
  end if;
  result := public.create_organization_invitation(p_organization_id, target_email, target_role);
  if result->>'status' = 'already_member' then return result; end if;
  update public.organization_invitations set
    language_code = target_language,
    delivery_status = 'sending', delivery_version = delivery_version + 1,
    last_delivery_attempt_at = now(), email_sent_at = null
  where id = (result->>'id')::uuid returning * into invitation;
  insert into private.organization_invitation_email_attempts(organization_id, actor_id)
    values (p_organization_id, sender_id);
  -- This private ledger only needs the rolling limit window.
  delete from private.organization_invitation_email_attempts where attempted_at < now() - interval '2 days';
  return result || jsonb_build_object(
    'invited_email', invitation.invited_email, 'role_code', invitation.role_code,
    'expires_at', invitation.expires_at, 'language_code', invitation.language_code,
    'delivery_version', invitation.delivery_version,
    'organization_name', (select name from public.organizations where id = p_organization_id),
    'inviter_name', (select trim(concat_ws(' ', first_name, last_name)) from public.users where id = sender_id)
  );
end;
$$;
revoke all on function private.prepare_organization_invitation_email(uuid, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function private.prepare_organization_invitation_email(uuid, text, text, text, uuid) to authenticated;

create or replace function public.prepare_organization_invitation_email(
  p_organization_id uuid,
  p_email text default null,
  p_role_code text default 'member',
  p_language_code text default 'es',
  p_invitation_id uuid default null
) returns jsonb
language sql security invoker set search_path = ''
as $$
  select private.prepare_organization_invitation_email(
    p_organization_id, p_email, p_role_code, p_language_code, p_invitation_id
  );
$$;
revoke all on function public.prepare_organization_invitation_email(uuid, text, text, text, uuid)
  from public, anon, authenticated;
grant execute on function public.prepare_organization_invitation_email(uuid, text, text, text, uuid) to authenticated;

create or replace function public.list_pending_organization_invitations(
  p_organization_id uuid,
  p_limit integer default 20,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with paging as (
    select
      greatest(1, least(coalesce(p_limit, 20), 50)) as page_size,
      greatest(0, coalesce(p_offset, 0)) as page_offset
  ), invitation_rows as (
    select
      invitation.id,
      invitation.invited_email as email,
      invitation.role_code,
      invitation.created_at,
      invitation.expires_at,
      invitation.delivery_status,
      invitation.last_delivery_attempt_at,
      trim(concat_ws(' ', inviter.first_name, inviter.last_name)) as invited_by_name
    from public.organization_invitations invitation
    join public.users inviter
      on inviter.id = invitation.invited_by
      and inviter.deleted_at is null
    cross join paging
    where invitation.organization_id = p_organization_id
      and invitation.status = 'pending'
      and invitation.expires_at > current_timestamp
      and private.current_user_has_organization_permission(
        p_organization_id,
        'organization.members.manage'
      )
    order by invitation.created_at desc, invitation.id
    limit (select page_size + 1 from paging)
    offset (select page_offset from paging)
  ), visible as (
    select * from invitation_rows limit (select page_size from paging)
  )
  select jsonb_build_object(
    'items', coalesce(jsonb_agg(to_jsonb(visible)), '[]'::jsonb),
    'next_offset', case
      when (select count(*) from invitation_rows) > (select page_size from paging)
      then (select page_offset + page_size from paging)
      else null
    end
  ) from visible;
$$;
