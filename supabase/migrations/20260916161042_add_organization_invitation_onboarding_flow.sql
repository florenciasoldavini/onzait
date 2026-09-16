create or replace function public.create_organization_invitation(
  p_organization_id uuid,
  p_email text,
  p_role_code text default 'member'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  normalized_email text := lower(trim(p_email));
  raw_token text := encode(extensions.gen_random_bytes(32), 'hex');
  invitation public.organization_invitations;
begin
  if not private.current_user_has_organization_permission(
    p_organization_id,
    'organization.members.manage'
  ) then
    raise exception 'You cannot invite members to this organization.'
      using errcode = '42501';
  end if;

  if p_role_code not in ('admin', 'member') then
    raise exception 'The organization role is invalid.' using errcode = '22023';
  end if;

  update public.organization_invitations
  set status = 'expired', responded_at = current_timestamp, updated_at = current_timestamp
  where organization_id = p_organization_id
    and invited_email = normalized_email
    and status = 'pending'
    and expires_at <= current_timestamp;

  if exists (
    select 1
    from public.organization_memberships membership
    join public.users app_user on app_user.id = membership.user_id
    where membership.organization_id = p_organization_id
      and membership.removed_at is null
      and app_user.deleted_at is null
      and app_user.email = normalized_email
  ) then
    return jsonb_build_object('status', 'already_member');
  end if;

  insert into public.organization_invitations (
    organization_id,
    invited_email,
    role_code,
    token_hash,
    invited_by,
    expires_at
  ) values (
    p_organization_id,
    normalized_email,
    p_role_code,
    encode(extensions.digest(raw_token, 'sha256'), 'hex'),
    actor_id,
    current_timestamp + interval '7 days'
  )
  on conflict (organization_id, invited_email) where status = 'pending'
  do update set
    role_code = excluded.role_code,
    token_hash = excluded.token_hash,
    invited_by = excluded.invited_by,
    expires_at = excluded.expires_at,
    updated_at = current_timestamp
  returning * into invitation;

  return jsonb_build_object(
    'id', invitation.id,
    'status', 'pending',
    'token', raw_token
  );
end;
$$;

create or replace function public.preview_organization_invitation(
  p_token text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'organization_name', organization.name,
    'role_code', invitation.role_code,
    'inviter_name', trim(concat_ws(' ', inviter.first_name, inviter.last_name)),
    'expires_at', invitation.expires_at,
    'status', case
      when invitation.status = 'pending' and invitation.expires_at <= current_timestamp
      then 'expired'
      else invitation.status::text
    end
  )
  from public.organization_invitations invitation
  join public.organizations organization
    on organization.id = invitation.organization_id
    and organization.deleted_at is null
  join public.users inviter
    on inviter.id = invitation.invited_by
    and inviter.deleted_at is null
  where p_token ~ '^[a-f0-9]{64}$'
    and invitation.token_hash = encode(
      extensions.digest(p_token, 'sha256'),
      'hex'
    )
  limit 1;
$$;

create or replace function public.respond_organization_invitation_by_token(
  p_token text,
  p_response text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_id uuid;
begin
  if p_token !~ '^[a-f0-9]{64}$' then
    raise exception 'This invitation is unavailable.' using errcode = '42501';
  end if;

  select invitation.id into invitation_id
  from public.organization_invitations invitation
  where invitation.token_hash = encode(
    extensions.digest(p_token, 'sha256'),
    'hex'
  );

  if invitation_id is null then
    raise exception 'This invitation is unavailable.' using errcode = '42501';
  end if;

  return public.respond_organization_invitation(invitation_id, p_response);
end;
$$;

revoke all on function public.preview_organization_invitation(text)
from public;
revoke all on function public.respond_organization_invitation_by_token(text, text)
from public, anon;

grant execute on function public.preview_organization_invitation(text)
to anon, authenticated;
grant execute on function public.respond_organization_invitation_by_token(text, text)
to authenticated;
