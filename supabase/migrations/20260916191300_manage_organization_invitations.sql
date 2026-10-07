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

create or replace function public.revoke_organization_invitation(
  p_invitation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  invitation public.organization_invitations;
begin
  select * into invitation
  from public.organization_invitations
  where id = p_invitation_id
  for update;

  if invitation.id is null then
    raise exception 'Organization invitation not found.' using errcode = 'P0002';
  end if;

  if not private.current_user_has_organization_permission(
    invitation.organization_id,
    'organization.members.manage'
  ) then
    raise exception 'Organization member management permission required.'
      using errcode = '42501';
  end if;

  if invitation.status <> 'pending' then
    return jsonb_build_object(
      'invitation_id', invitation.id,
      'status', invitation.status
    );
  end if;

  if invitation.expires_at <= current_timestamp then
    update public.organization_invitations
    set status = 'expired',
        responded_at = current_timestamp,
        updated_at = current_timestamp
    where id = invitation.id;

    return jsonb_build_object(
      'invitation_id', invitation.id,
      'status', 'expired'
    );
  end if;

  update public.organization_invitations
  set status = 'revoked',
      revoked_by = actor_id,
      responded_at = current_timestamp,
      updated_at = current_timestamp
  where id = invitation.id;

  return jsonb_build_object(
    'invitation_id', invitation.id,
    'status', 'revoked'
  );
end;
$$;

revoke all on function public.list_pending_organization_invitations(uuid, integer, integer)
from public, anon, authenticated;
revoke all on function public.revoke_organization_invitation(uuid)
from public, anon, authenticated;

grant execute on function public.list_pending_organization_invitations(uuid, integer, integer)
to authenticated;
grant execute on function public.revoke_organization_invitation(uuid)
to authenticated;
