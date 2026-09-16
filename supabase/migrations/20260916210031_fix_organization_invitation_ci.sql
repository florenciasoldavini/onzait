create or replace function private.resend_project_invitation(
  p_invitation_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
)
returns public.project_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_actor_id uuid := (select auth.uid());
  invitation public.project_invitations;
begin
  if p_expires_at <= current_timestamp
    or p_expires_at > current_timestamp + interval '7 days 5 minutes'
  then
    raise exception 'The invitation expiry is invalid.' using errcode = '22023';
  end if;

  select * into invitation
  from public.project_invitations
  where id = p_invitation_id
  for update;

  if invitation.id is null
    or not private.current_user_has_project_permission(
      invitation.project_id,
      'project.members.manage'
    )
  then
    raise exception 'This invitation is unavailable.' using errcode = '42501';
  end if;

  if invitation.status <> 'pending' then
    raise exception 'Only pending invitations can be resent.'
      using errcode = '22023';
  end if;

  if private.project_invitee_has_inherited_access(
    invitation.project_id,
    invitation.invited_email
  ) then
    update public.project_invitations
    set status = 'expired',
        resolution_reason = 'access_already_inherited',
        responded_at = current_timestamp,
        updated_at = current_timestamp
    where id = invitation.id
    returning * into invitation;
    return invitation;
  end if;

  if (
    select count(*)
    from public.project_collaboration_events event
    where event.actor_id = current_actor_id
      and event.event_type in ('invited', 'resent')
      and event.created_at > current_timestamp - interval '24 hours'
  ) >= 20 then
    raise exception 'The daily invitation email limit has been reached.'
      using errcode = 'P0001';
  end if;

  if invitation.last_sent_at is not null
    and invitation.last_sent_at > current_timestamp - interval '60 seconds'
  then
    raise exception 'Wait before resending this invitation.'
      using errcode = 'P0001';
  end if;

  update public.project_invitations
  set token_hash = p_token_hash,
      expires_at = p_expires_at,
      delivery_status = 'pending',
      delivery_version = delivery_version + 1,
      updated_at = current_timestamp
  where id = invitation.id
  returning * into invitation;

  insert into public.project_collaboration_events (
    project_id,
    event_type,
    actor_id,
    invitation_id,
    next_role_code
  ) values (
    invitation.project_id,
    'resent',
    current_actor_id,
    invitation.id,
    invitation.role_code
  );

  return invitation;
end;
$$;
