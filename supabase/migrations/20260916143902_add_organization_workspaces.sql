-- Organizations are the only operational data owners. Workspaces provide the
-- context in which an organization's data is grouped and displayed.

do $$
begin
  if exists (select 1 from public.projects limit 1)
    or exists (select 1 from public.clients limit 1)
    or exists (select 1 from public.contractors limit 1)
    or exists (select 1 from public.workers limit 1)
    or exists (select 1 from public.suppliers limit 1)
    or exists (select 1 from public.tasks limit 1)
    or exists (select 1 from public.project_photos limit 1)
    or exists (select 1 from public.project_documents limit 1)
    or exists (select 1 from public.project_memberships limit 1)
    or exists (select 1 from public.project_invitations limit 1)
  then
    raise exception 'Organization workspace migration requires empty product tables.';
  end if;
end
$$;

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 120),
  avatar text,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz(3) not null default current_timestamp,
  updated_at timestamptz(3),
  deleted_at timestamptz(3),
  deleted_by uuid references public.users(id) on delete restrict,
  constraint organizations_deleted_bundle check (
    (deleted_at is null and deleted_by is null)
    or (deleted_at is not null and deleted_by is not null)
  )
);

create table public.organization_roles (
  code text primary key check (code in ('admin', 'member')),
  display_name text not null,
  sort_order integer not null,
  created_at timestamptz(3) not null default current_timestamp
);

create table public.organization_permissions (
  code text primary key check (code ~ '^organization(\.[a-z][a-z0-9_]*)+$'),
  description text not null,
  created_at timestamptz(3) not null default current_timestamp
);

create table public.organization_role_permissions (
  role_code text not null references public.organization_roles(code) on delete restrict,
  permission_code text not null references public.organization_permissions(code) on delete restrict,
  created_at timestamptz(3) not null default current_timestamp,
  primary key (role_code, permission_code)
);

insert into public.organization_roles (code, display_name, sort_order)
values ('admin', 'Admin', 10), ('member', 'Member', 20);

insert into public.organization_permissions (code, description)
values
  ('organization.read', 'Read the organization and its workspaces.'),
  ('organization.update', 'Update organization settings.'),
  ('organization.members.read', 'Read organization members.'),
  ('organization.members.manage', 'Invite and manage organization members.'),
  ('organization.workspace.update', 'Update workspace settings.'),
  ('organization.project.create', 'Create projects in organization workspaces.'),
  ('organization.directory.read', 'Read organization directory records.'),
  ('organization.directory.write', 'Create and update organization directory records.'),
  ('organization.directory.delete', 'Soft-delete organization directory records.'),
  ('organization.tasks.write', 'Create and update standalone workspace tasks.');

insert into public.organization_role_permissions (role_code, permission_code)
select 'admin', code from public.organization_permissions;

insert into public.organization_role_permissions (role_code, permission_code)
values
  ('member', 'organization.read'),
  ('member', 'organization.members.read'),
  ('member', 'organization.project.create'),
  ('member', 'organization.directory.read'),
  ('member', 'organization.directory.write'),
  ('member', 'organization.tasks.write');

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  role_code text not null references public.organization_roles(code) on delete restrict,
  invited_by uuid references public.users(id) on delete restrict,
  joined_at timestamptz(3) not null default current_timestamp,
  updated_at timestamptz(3),
  removed_at timestamptz(3),
  removed_by uuid references public.users(id) on delete restrict,
  constraint organization_memberships_removal_bundle check (
    (removed_at is null and removed_by is null)
    or (removed_at is not null and removed_by is not null)
  )
);

create unique index organization_memberships_active_user_idx
on public.organization_memberships(organization_id, user_id)
where removed_at is null;

create index organization_memberships_user_organization_idx
on public.organization_memberships(user_id, organization_id)
where removed_at is null;

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  name text check (name is null or char_length(trim(name)) between 2 and 120),
  avatar text,
  created_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz(3) not null default current_timestamp,
  updated_at timestamptz(3),
  deleted_at timestamptz(3),
  deleted_by uuid references public.users(id) on delete restrict,
  constraint workspaces_deleted_bundle check (
    (deleted_at is null and deleted_by is null)
    or (deleted_at is not null and deleted_by is not null)
  )
);

create index organizations_owner_active_idx
on public.organizations(owner_user_id, created_at, id)
where deleted_at is null;

create index workspaces_organization_active_idx
on public.workspaces(organization_id, created_at, id)
where deleted_at is null;

create or replace function private.current_user_has_organization_permission(
  p_organization_id uuid,
  p_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organizations organization
    where organization.id = p_organization_id
      and organization.deleted_at is null
      and (
        private.current_user_is_admin()
        or organization.owner_user_id = (select auth.uid())
        or exists (
          select 1
          from public.organization_memberships membership
          join public.organization_role_permissions role_permission
            on role_permission.role_code = membership.role_code
          where membership.organization_id = organization.id
            and membership.user_id = (select auth.uid())
            and membership.removed_at is null
            and role_permission.permission_code = p_permission_code
        )
      )
  );
$$;

create or replace function private.current_user_has_workspace_permission(
  p_workspace_id uuid,
  p_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspaces workspace
    where workspace.id = p_workspace_id
      and workspace.deleted_at is null
      and private.current_user_has_organization_permission(
        workspace.organization_id,
        p_permission_code
      )
  );
$$;

revoke all on function private.current_user_has_organization_permission(uuid, text)
from public, anon;
revoke all on function private.current_user_has_workspace_permission(uuid, text)
from public, anon;
grant execute on function private.current_user_has_organization_permission(uuid, text)
to authenticated;
grant execute on function private.current_user_has_workspace_permission(uuid, text)
to authenticated;

create or replace function private.enforce_organization_membership_invariants()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  organization_owner_id uuid;
begin
  select owner_user_id into organization_owner_id
  from public.organizations
  where id = coalesce(new.organization_id, old.organization_id);

  if coalesce(new.user_id, old.user_id) = organization_owner_id then
    if tg_op = 'DELETE'
      or new.removed_at is not null
      or new.role_code <> 'admin'
    then
      raise exception 'The organization owner must remain an active admin.'
        using errcode = '42501';
    end if;
  end if;

  if tg_op = 'UPDATE' then
    new.organization_id := old.organization_id;
    new.user_id := old.user_id;
    new.joined_at := old.joined_at;
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_organization_membership_invariants()
from public, anon, authenticated;

create trigger organization_memberships_enforce_invariants
before update or delete on public.organization_memberships
for each row execute function private.enforce_organization_membership_invariants();

create or replace function private.create_organization(
  p_name text,
  p_avatar text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  saved_organization public.organizations;
  saved_workspace public.workspaces;
begin
  if actor_id is null or not exists (
    select 1 from public.users where id = actor_id and deleted_at is null
  ) then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  insert into public.organizations (owner_user_id, name, avatar, created_by)
  values (actor_id, trim(p_name), nullif(trim(p_avatar), ''), actor_id)
  returning * into saved_organization;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role_code,
    invited_by
  ) values (
    saved_organization.id,
    actor_id,
    'admin',
    actor_id
  );

  insert into public.workspaces (organization_id, created_by)
  values (saved_organization.id, actor_id)
  returning * into saved_workspace;

  return jsonb_build_object(
    'organization', to_jsonb(saved_organization),
    'workspace', to_jsonb(saved_workspace)
  );
end;
$$;

create or replace function public.create_organization(
  p_name text,
  p_avatar text default null
)
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select private.create_organization(p_name, p_avatar);
$$;

revoke all on function private.create_organization(text, text) from public, anon, authenticated;
grant execute on function private.create_organization(text, text) to authenticated;
revoke all on function public.create_organization(text, text) from public, anon;
grant execute on function public.create_organization(text, text) to authenticated;

revoke all on table public.organizations from anon, authenticated;
revoke all on table public.organization_roles from anon, authenticated;
revoke all on table public.organization_permissions from anon, authenticated;
revoke all on table public.organization_role_permissions from anon, authenticated;
revoke all on table public.organization_memberships from anon, authenticated;
revoke all on table public.workspaces from anon, authenticated;

grant select on public.organizations to authenticated;
grant select on public.organization_roles to authenticated;
grant select on public.organization_permissions to authenticated;
grant select on public.organization_role_permissions to authenticated;
grant select on public.organization_memberships to authenticated;
grant select on public.workspaces to authenticated;
grant update (name, avatar, updated_at) on public.organizations to authenticated;
grant update (name, avatar, updated_at) on public.workspaces to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_roles enable row level security;
alter table public.organization_permissions enable row level security;
alter table public.organization_role_permissions enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.workspaces enable row level security;

create policy organizations_select_member_or_admin
on public.organizations for select to authenticated
using (private.current_user_has_organization_permission(id, 'organization.read'));

create policy organizations_update_admin
on public.organizations for update to authenticated
using (private.current_user_has_organization_permission(id, 'organization.update'))
with check (private.current_user_has_organization_permission(id, 'organization.update'));

create policy organization_roles_read
on public.organization_roles for select to authenticated using (true);
create policy organization_permissions_read
on public.organization_permissions for select to authenticated using (true);
create policy organization_role_permissions_read
on public.organization_role_permissions for select to authenticated using (true);

create policy organization_memberships_select_member
on public.organization_memberships for select to authenticated
using (
  private.current_user_has_organization_permission(
    organization_id,
    'organization.members.read'
  )
);

create policy workspaces_select_member
on public.workspaces for select to authenticated
using (
  private.current_user_has_organization_permission(
    organization_id,
    'organization.read'
  )
);

create policy workspaces_update_admin
on public.workspaces for update to authenticated
using (
  private.current_user_has_organization_permission(
    organization_id,
    'organization.workspace.update'
  )
)
with check (
  private.current_user_has_organization_permission(
    organization_id,
    'organization.workspace.update'
  )
);

create or replace function public.list_my_workspaces(
  p_limit integer default 50,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with paging as (
    select
      greatest(1, least(coalesce(p_limit, 50), 50)) as page_size,
      greatest(0, coalesce(p_offset, 0)) as page_offset
  ), rows as (
    select
      workspace.id,
      workspace.organization_id,
      coalesce(workspace.name, organization.name) as display_name,
      coalesce(workspace.avatar, organization.avatar) as display_avatar,
      workspace.name,
      workspace.avatar,
      organization.name as organization_name,
      organization.avatar as organization_avatar,
      organization.owner_user_id,
      membership.role_code,
      workspace.created_at
    from public.workspaces workspace
    join public.organizations organization
      on organization.id = workspace.organization_id
    join public.organization_memberships membership
      on membership.organization_id = organization.id
      and membership.user_id = (select auth.uid())
      and membership.removed_at is null
    where workspace.deleted_at is null
      and organization.deleted_at is null
    order by organization.name, workspace.created_at, workspace.id
    limit (select page_size + 1 from paging)
    offset (select page_offset from paging)
  ), visible as (
    select * from rows limit (select page_size from paging)
  )
  select jsonb_build_object(
    'items', coalesce(jsonb_agg(to_jsonb(visible) - 'created_at'), '[]'::jsonb),
    'has_more', (select count(*) from rows) > (select page_size from paging),
    'next_offset', case
      when (select count(*) from rows) > (select page_size from paging)
      then (select page_offset + page_size from paging)
      else null
    end
  )
  from visible;
$$;

revoke all on function public.list_my_workspaces(integer, integer) from public, anon;
grant execute on function public.list_my_workspaces(integer, integer) to authenticated;

-- Product records are grouped by workspace and retain the creating user only as
-- audit metadata. The database is intentionally empty for this migration, so
-- no ambiguous user-to-organization backfill is attempted.

alter table public.projects rename column owner_id to created_by;
alter table public.clients rename column owner_id to created_by;
alter table public.contractors rename column owner_id to created_by;
alter table public.workers rename column owner_id to created_by;
alter table public.suppliers rename column owner_id to created_by;
alter table public.tasks rename column owner_id to created_by;

alter table public.projects
  add column workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.clients
  add column workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.contractors
  add column workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.workers
  add column workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.suppliers
  add column workspace_id uuid references public.workspaces(id) on delete restrict;
alter table public.tasks
  add column workspace_id uuid references public.workspaces(id) on delete restrict;

alter table public.projects alter column workspace_id set not null;
alter table public.clients alter column workspace_id set not null;
alter table public.contractors alter column workspace_id set not null;
alter table public.workers alter column workspace_id set not null;
alter table public.suppliers alter column workspace_id set not null;
alter table public.tasks alter column workspace_id set not null;

drop trigger if exists project_photos_set_derived_fields on public.project_photos;
drop function if exists public.set_project_photo_derived_fields();
drop index if exists public.project_photos_owner_id_idx;
alter table public.project_photos drop column owner_id;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any(array[
        'projects', 'clients', 'contractors', 'workers', 'suppliers',
        'tasks', 'project_photos', 'worker_trade_categories'
      ])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_row.policyname,
      policy_row.schemaname,
      policy_row.tablename
    );
  end loop;
end
$$;

drop index if exists public.projects_owner_id_idx;
drop index if exists public.projects_visible_owner_created_idx;
drop index if exists public.projects_google_place_owner_active_idx;
drop index if exists public.clients_owner_id_idx;
drop index if exists public.clients_visible_owner_name_idx;
drop index if exists public.contractors_owner_id_idx;
drop index if exists public.contractors_visible_owner_name_idx;
drop index if exists public.workers_owner_id_idx;
drop index if exists public.workers_visible_owner_name_idx;
drop index if exists public.suppliers_owner_id_idx;
drop index if exists public.suppliers_visible_owner_name_idx;
drop index if exists public.tasks_owner_id_idx;
drop index if exists public.tasks_visible_owner_created_idx;

create index projects_workspace_id_idx on public.projects(workspace_id);
create index projects_visible_workspace_created_idx
on public.projects(workspace_id, created_at desc, id)
where deleted_at is null;
create unique index projects_google_place_workspace_active_idx
on public.projects(workspace_id, google_place_id)
where deleted_at is null;
create index clients_visible_workspace_name_idx
on public.clients(workspace_id, first_name, last_name, id)
where deleted_at is null;
create index contractors_visible_workspace_name_idx
on public.contractors(workspace_id, first_name, last_name, id)
where deleted_at is null;
create index workers_visible_workspace_name_idx
on public.workers(workspace_id, first_name, last_name, id)
where deleted_at is null;
create index suppliers_visible_workspace_name_idx
on public.suppliers(workspace_id, name, id)
where deleted_at is null;
create index tasks_visible_workspace_created_idx
on public.tasks(workspace_id, created_at desc, id)
where deleted_at is null;

create or replace function private.set_workspace_record_audit_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if (select auth.uid()) is not null then
      new.created_by := (select auth.uid());
    elsif new.created_by is null then
      raise exception 'Authentication required.' using errcode = '42501';
    end if;
  else
    if new.workspace_id is distinct from old.workspace_id then
      raise exception 'Workspace cannot be changed.' using errcode = '42501';
    end if;
    new.created_by := old.created_by;
  end if;
  return new;
end;
$$;

revoke all on function private.set_workspace_record_audit_fields()
from public, anon, authenticated;

create trigger projects_set_workspace_audit_fields
before insert or update of workspace_id, created_by on public.projects
for each row execute function private.set_workspace_record_audit_fields();
create trigger clients_set_workspace_audit_fields
before insert or update of workspace_id, created_by on public.clients
for each row execute function private.set_workspace_record_audit_fields();
create trigger contractors_set_workspace_audit_fields
before insert or update of workspace_id, created_by on public.contractors
for each row execute function private.set_workspace_record_audit_fields();
create trigger workers_set_workspace_audit_fields
before insert or update of workspace_id, created_by on public.workers
for each row execute function private.set_workspace_record_audit_fields();
create trigger suppliers_set_workspace_audit_fields
before insert or update of workspace_id, created_by on public.suppliers
for each row execute function private.set_workspace_record_audit_fields();

create or replace function public.enforce_project_client_link()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  client_workspace_id uuid;
begin
  if new.deleted_at is not null then
    new.client_id := null;
    return new;
  end if;
  if new.client_id is null then return new; end if;

  select workspace_id into client_workspace_id
  from public.clients
  where id = new.client_id and deleted_at is null;

  if client_workspace_id is null or client_workspace_id <> new.workspace_id then
    raise exception 'Project client is unavailable.' using errcode = '23503';
  end if;
  return new;
end;
$$;

drop trigger if exists projects_enforce_client_link on public.projects;
create trigger projects_enforce_client_link
before insert or update of client_id, workspace_id, deleted_at on public.projects
for each row execute function public.enforce_project_client_link();

create or replace function public.enforce_worker_contractor_link()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  contractor_workspace_id uuid;
begin
  if new.contractor_id is null then return new; end if;

  select workspace_id into contractor_workspace_id
  from public.contractors
  where id = new.contractor_id and deleted_at is null;

  if contractor_workspace_id is null or contractor_workspace_id <> new.workspace_id then
    raise exception 'Worker contractor is unavailable.' using errcode = '23503';
  end if;
  return new;
end;
$$;

drop trigger if exists workers_enforce_contractor_link on public.workers;
create trigger workers_enforce_contractor_link
before insert or update of contractor_id, workspace_id on public.workers
for each row execute function public.enforce_worker_contractor_link();

create or replace function private.current_user_project_access_source(p_project_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when private.current_user_is_admin() then 'global_admin'
    when organization.owner_user_id = (select auth.uid()) then 'organization_owner'
    when membership.role_code is not null then 'organization_member'
    when project_membership.id is not null then 'project_membership'
    else null
  end
  from public.projects project
  join public.workspaces workspace on workspace.id = project.workspace_id
    and workspace.deleted_at is null
  join public.organizations organization on organization.id = workspace.organization_id
    and organization.deleted_at is null
  left join public.organization_memberships membership
    on membership.organization_id = organization.id
    and membership.user_id = (select auth.uid())
    and membership.removed_at is null
  left join public.project_memberships project_membership
    on project_membership.project_id = project.id
    and project_membership.user_id = (select auth.uid())
    and project_membership.removed_at is null
  where project.id = p_project_id and project.deleted_at is null;
$$;

create or replace function private.current_user_project_role(p_project_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when organization.owner_user_id = (select auth.uid()) then 'owner'
    when organization_membership.role_code = 'admin' then 'owner'
    when organization_membership.role_code = 'member' then 'manager'
    else project_membership.role_code
  end
  from public.projects project
  join public.workspaces workspace on workspace.id = project.workspace_id
    and workspace.deleted_at is null
  join public.organizations organization on organization.id = workspace.organization_id
    and organization.deleted_at is null
  left join public.organization_memberships organization_membership
    on organization_membership.organization_id = organization.id
    and organization_membership.user_id = (select auth.uid())
    and organization_membership.removed_at is null
  left join public.project_memberships project_membership
    on project_membership.project_id = project.id
    and project_membership.user_id = (select auth.uid())
    and project_membership.removed_at is null
  where project.id = p_project_id and project.deleted_at is null;
$$;

create or replace function private.current_user_has_project_permission(
  p_project_id uuid,
  p_permission_code text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.projects project
    where project.id = p_project_id
      and project.deleted_at is null
      and (
        private.current_user_is_admin()
        or exists (
          select 1
          from public.project_role_permissions mapping
          join public.project_roles role on role.code = mapping.role_code
          where mapping.role_code = private.current_user_project_role(p_project_id)
            and mapping.permission_code = p_permission_code
            and role.retired_at is null
        )
      )
  );
$$;

revoke all on function private.current_user_project_access_source(uuid) from public, anon;
grant execute on function private.current_user_project_access_source(uuid) to authenticated;

create or replace function public.get_project_access(p_project_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with effective as (
    select
      private.current_user_project_role(p_project_id) as role_code,
      private.current_user_project_access_source(p_project_id) as access_source,
      private.current_user_is_admin() as is_admin
  )
  select case
    when access_source is null then null
    else jsonb_build_object(
      'project_id', p_project_id,
      'role', case when is_admin then coalesce(role_code, 'admin') else role_code end,
      'access_source', access_source,
      'is_owner', access_source in ('organization_owner', 'organization_member') and role_code = 'owner',
      'is_admin', is_admin,
      'permissions', (
        select coalesce(jsonb_agg(permission.code order by permission.code), '[]'::jsonb)
        from public.project_permissions permission
        where is_admin or exists (
          select 1 from public.project_role_permissions mapping
          where mapping.role_code = effective.role_code
            and mapping.permission_code = permission.code
        )
      )
    )
  end
  from effective;
$$;

create or replace function public.can_current_user_access_project(project_id_text text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select case
    when project_id_text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    then private.current_user_has_project_permission(project_id_text::uuid, 'project.read')
    else false
  end;
$$;

create or replace function private.enforce_project_protected_updates()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.workspace_id := old.workspace_id;
  new.created_by := old.created_by;

  if (
    to_jsonb(new) - array[
      'id', 'workspace_id', 'created_by', 'client_id', 'cover_image_path',
      'created_at', 'updated_at', 'deleted_at'
    ]
  ) is distinct from (
    to_jsonb(old) - array[
      'id', 'workspace_id', 'created_by', 'client_id', 'cover_image_path',
      'created_at', 'updated_at', 'deleted_at'
    ]
  ) and not private.current_user_has_project_permission(old.id, 'project.update') then
    raise exception 'You cannot update this project.' using errcode = '42501';
  end if;

  if new.cover_image_path is distinct from old.cover_image_path
    and not private.current_user_has_project_permission(old.id, 'project.cover.write')
  then
    raise exception 'You cannot change this project cover.' using errcode = '42501';
  end if;

  if new.client_id is distinct from old.client_id
    and not private.current_user_has_project_permission(old.id, 'project.change_client')
  then
    raise exception 'You cannot change this project client.' using errcode = '42501';
  end if;

  if new.deleted_at is distinct from old.deleted_at
    and not private.current_user_has_project_permission(old.id, 'project.delete')
  then
    raise exception 'You cannot delete this project.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create or replace function private.enforce_directory_protected_updates()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.workspace_id := old.workspace_id;
  new.created_by := old.created_by;

  if new.deleted_at is distinct from old.deleted_at
    and not private.current_user_has_workspace_permission(
      old.workspace_id,
      'organization.directory.delete'
    )
  then
    raise exception 'You cannot delete this directory record.' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_directory_protected_updates()
from public, anon, authenticated;

drop trigger if exists projects_enforce_collaboration_updates on public.projects;
create trigger projects_enforce_collaboration_updates
before update on public.projects
for each row execute function private.enforce_project_protected_updates();

create trigger clients_enforce_workspace_updates
before update on public.clients
for each row execute function private.enforce_directory_protected_updates();
create trigger contractors_enforce_workspace_updates
before update on public.contractors
for each row execute function private.enforce_directory_protected_updates();
create trigger workers_enforce_workspace_updates
before update on public.workers
for each row execute function private.enforce_directory_protected_updates();
create trigger suppliers_enforce_workspace_updates
before update on public.suppliers
for each row execute function private.enforce_directory_protected_updates();

create or replace function public.set_task_derived_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  project_workspace_id uuid;
begin
  if new.project_id is not null then
    select workspace_id into project_workspace_id
    from public.projects
    where id = new.project_id and deleted_at is null;

    if project_workspace_id is null then
      raise exception 'Task project is unavailable.' using errcode = '23503';
    end if;
    new.workspace_id := project_workspace_id;
  elsif tg_op = 'UPDATE' then
    new.workspace_id := old.workspace_id;
  end if;

  if tg_op = 'INSERT' then
    if (select auth.uid()) is null then
      raise exception 'Authentication required.' using errcode = '42501';
    end if;
    new.created_by := (select auth.uid());
  else
    new.created_by := old.created_by;
  end if;

  if new.status = 'completed'
    and (tg_op = 'INSERT' or old.status is distinct from 'completed')
  then
    new.completed_at := current_timestamp;
  elsif new.status = 'completed' then
    new.completed_at := old.completed_at;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_set_derived_fields on public.tasks;
create trigger tasks_set_derived_fields
before insert or update of project_id, workspace_id, created_by, status, completed_at
on public.tasks for each row execute function public.set_task_derived_fields();

create or replace function public.set_project_photo_derived_fields()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.id := old.id;
    new.project_id := old.project_id;
    new.uploaded_by := old.uploaded_by;
    new.full_path := old.full_path;
    new.thumbnail_path := old.thumbnail_path;
    new.captured_at := old.captured_at;
    new.latitude := old.latitude;
    new.longitude := old.longitude;
    new.location_accuracy_meters := old.location_accuracy_meters;
    new.location_source := old.location_source;
    new.mime_type := old.mime_type;
    new.width := old.width;
    new.height := old.height;
    new.file_size_bytes := old.file_size_bytes;
    return new;
  end if;

  if (select auth.uid()) is null then
    raise exception 'Photo uploader is required.' using errcode = '23502';
  end if;
  if not exists (
    select 1 from public.projects
    where id = new.project_id and deleted_at is null
  ) then
    raise exception 'Photo project is unavailable.' using errcode = '23503';
  end if;
  new.uploaded_by := (select auth.uid());
  new.deleted_at := null;
  return new;
end;
$$;

create trigger project_photos_set_derived_fields
before insert or update on public.project_photos
for each row execute function public.set_project_photo_derived_fields();

create policy projects_select_by_capability
on public.projects for select to authenticated
using (private.current_user_has_project_permission(id, 'project.read'));

create policy projects_insert_by_workspace
on public.projects for insert to authenticated
with check (
  deleted_at is null
  and created_by = (select auth.uid())
  and private.current_user_has_workspace_permission(
    workspace_id,
    'organization.project.create'
  )
);

create policy projects_update_by_capability
on public.projects for update to authenticated
using (
  private.current_user_has_project_permission(id, 'project.update')
  or private.current_user_has_project_permission(id, 'project.change_client')
  or private.current_user_has_project_permission(id, 'project.delete')
  or private.current_user_has_project_permission(id, 'project.cover.write')
)
with check (
  private.current_user_has_project_permission(id, 'project.read')
  or private.current_user_has_workspace_permission(
    workspace_id,
    'organization.read'
  )
);

create policy clients_select_by_workspace_or_project
on public.clients for select to authenticated
using (
  private.current_user_has_workspace_permission(
    workspace_id,
    'organization.directory.read'
  )
  or exists (
    select 1 from public.projects project
    where project.client_id = clients.id
      and private.current_user_has_project_permission(project.id, 'project.read')
  )
);
create policy clients_insert_by_workspace
on public.clients for insert to authenticated
with check (
  deleted_at is null
  and created_by = (select auth.uid())
  and private.current_user_has_workspace_permission(
    workspace_id,
    'organization.directory.write'
  )
);
create policy clients_update_by_workspace
on public.clients for update to authenticated
using (
  deleted_at is null
  and private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write')
)
with check (private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write'));

create policy contractors_select_by_workspace
on public.contractors for select to authenticated
using (private.current_user_has_workspace_permission(workspace_id, 'organization.directory.read'));
create policy contractors_insert_by_workspace
on public.contractors for insert to authenticated
with check (
  deleted_at is null and created_by = (select auth.uid())
  and private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write')
);
create policy contractors_update_by_workspace
on public.contractors for update to authenticated
using (
  deleted_at is null
  and private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write')
)
with check (private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write'));

create policy workers_select_by_workspace
on public.workers for select to authenticated
using (private.current_user_has_workspace_permission(workspace_id, 'organization.directory.read'));
create policy workers_insert_by_workspace
on public.workers for insert to authenticated
with check (
  deleted_at is null and created_by = (select auth.uid())
  and private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write')
);
create policy workers_update_by_workspace
on public.workers for update to authenticated
using (
  deleted_at is null
  and private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write')
)
with check (private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write'));

create policy suppliers_select_by_workspace
on public.suppliers for select to authenticated
using (private.current_user_has_workspace_permission(workspace_id, 'organization.directory.read'));
create policy suppliers_insert_by_workspace
on public.suppliers for insert to authenticated
with check (
  deleted_at is null and created_by = (select auth.uid())
  and private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write')
);
create policy suppliers_update_by_workspace
on public.suppliers for update to authenticated
using (
  deleted_at is null
  and private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write')
)
with check (private.current_user_has_workspace_permission(workspace_id, 'organization.directory.write'));

create policy worker_trade_categories_select_by_workspace
on public.worker_trade_categories for select to authenticated
using (exists (
  select 1 from public.workers worker
  where worker.id = worker_id
    and private.current_user_has_workspace_permission(
      worker.workspace_id,
      'organization.directory.read'
    )
));
create policy worker_trade_categories_insert_by_workspace
on public.worker_trade_categories for insert to authenticated
with check (
  exists (
    select 1 from public.workers worker
    where worker.id = worker_id and worker.deleted_at is null
      and private.current_user_has_workspace_permission(
        worker.workspace_id,
        'organization.directory.write'
      )
  )
  and exists (
    select 1 from public.trade_categories category
    where category.id = trade_category_id and category.deleted_at is null
  )
);
create policy worker_trade_categories_delete_by_workspace
on public.worker_trade_categories for delete to authenticated
using (exists (
  select 1 from public.workers worker
  where worker.id = worker_id and worker.deleted_at is null
    and private.current_user_has_workspace_permission(
      worker.workspace_id,
      'organization.directory.write'
    )
));

create policy tasks_select_by_workspace_or_project
on public.tasks for select to authenticated
using (
  case when project_id is null
    then private.current_user_has_workspace_permission(workspace_id, 'organization.read')
    else private.current_user_has_project_permission(project_id, 'project.read')
  end
);
create policy tasks_insert_by_workspace_or_project
on public.tasks for insert to authenticated
with check (
  created_by = (select auth.uid()) and deleted_at is null and (
    case when project_id is null
      then private.current_user_has_workspace_permission(workspace_id, 'organization.tasks.write')
      else private.current_user_has_project_permission(project_id, 'project.tasks.write')
    end
  )
);
create policy tasks_update_by_workspace_or_project
on public.tasks for update to authenticated
using (
  deleted_at is null
  and case when project_id is null
      then private.current_user_has_workspace_permission(workspace_id, 'organization.tasks.write')
      else private.current_user_has_project_permission(project_id, 'project.tasks.write')
    end
)
with check (
  case when project_id is null
    then private.current_user_has_workspace_permission(workspace_id, 'organization.tasks.write')
    else private.current_user_has_project_permission(project_id, 'project.tasks.write')
  end
);

create policy project_photos_select_by_project
on public.project_photos for select to authenticated
using (private.current_user_has_project_permission(project_id, 'project.read'));
create policy project_photos_insert_by_project
on public.project_photos for insert to authenticated
with check (
  deleted_at is null
  and uploaded_by = (select auth.uid())
  and private.current_user_has_project_permission(project_id, 'project.photos.write')
);
create policy project_photos_update_by_project
on public.project_photos for update to authenticated
using (private.current_user_has_project_permission(project_id, 'project.photos.write'))
with check (private.current_user_has_project_permission(project_id, 'project.photos.write'));

drop function public.create_worker_with_relationships(
  text,
  text,
  text,
  text,
  uuid,
  uuid[]
);

create function public.create_worker_with_relationships(
  p_first_name text,
  p_workspace_id uuid,
  p_last_name text default null,
  p_phone_number text default null,
  p_email text default null,
  p_contractor_id uuid default null,
  p_trade_category_ids uuid[] default '{}'::uuid[]
)
returns public.workers
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_worker public.workers;
  category_ids uuid[] := coalesce(p_trade_category_ids, '{}'::uuid[]);
begin
  if not private.current_user_has_workspace_permission(
    p_workspace_id,
    'organization.directory.write'
  ) then
    raise exception 'You cannot create workers in this workspace.'
      using errcode = '42501';
  end if;

  if cardinality(category_ids) <> (
    select count(distinct category_id)
    from unnest(category_ids) requested(category_id)
  ) then
    raise exception 'Trade categories must be unique.' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(category_ids) requested(category_id)
    left join public.trade_categories category
      on category.id = requested.category_id and category.deleted_at is null
    where category.id is null
  ) then
    raise exception 'One or more trade categories are unavailable.'
      using errcode = '23503';
  end if;

  insert into public.workers (
    workspace_id,
    contractor_id,
    first_name,
    last_name,
    phone_number,
    email
  ) values (
    p_workspace_id,
    p_contractor_id,
    p_first_name,
    p_last_name,
    p_phone_number,
    p_email
  )
  returning * into saved_worker;

  insert into public.worker_trade_categories (worker_id, trade_category_id)
  select saved_worker.id, category_id
  from unnest(category_ids) requested(category_id);

  return saved_worker;
end;
$$;

revoke all on function public.create_worker_with_relationships(
  text,
  uuid,
  text,
  text,
  text,
  uuid,
  uuid[]
) from public, anon;
grant execute on function public.create_worker_with_relationships(
  text,
  uuid,
  text,
  text,
  text,
  uuid,
  uuid[]
) to authenticated;

alter table public.project_invitations
add column resolution_reason text check (
  resolution_reason is null or resolution_reason = 'access_already_inherited'
);

create or replace function private.user_has_inherited_project_access(
  p_user_id uuid,
  p_project_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects project
    join public.workspaces workspace
      on workspace.id = project.workspace_id and workspace.deleted_at is null
    join public.organizations organization
      on organization.id = workspace.organization_id
      and organization.deleted_at is null
    left join public.organization_memberships membership
      on membership.organization_id = organization.id
      and membership.user_id = p_user_id
      and membership.removed_at is null
    where project.id = p_project_id
      and project.deleted_at is null
      and (
        organization.owner_user_id = p_user_id
        or membership.id is not null
      )
  );
$$;

revoke all on function private.user_has_inherited_project_access(uuid, uuid)
from public, anon, authenticated;

create or replace function private.enforce_external_project_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.removed_at is null
    and private.user_has_inherited_project_access(new.user_id, new.project_id)
  then
    raise exception 'Direct membership is unnecessary because access is inherited.'
      using errcode = '23505';
  end if;
  return new;
end;
$$;

revoke all on function private.enforce_external_project_membership()
from public, anon, authenticated;

create trigger project_memberships_external_only
before insert or update of project_id, user_id, removed_at
on public.project_memberships
for each row execute function private.enforce_external_project_membership();

create or replace function private.project_invitee_has_inherited_access(
  p_project_id uuid,
  p_email text
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.users app_user
    where app_user.email = lower(trim(p_email))
      and app_user.deleted_at is null
      and private.user_has_inherited_project_access(app_user.id, p_project_id)
  );
$$;

revoke all on function private.project_invitee_has_inherited_access(uuid, text)
from public, anon, authenticated;

create or replace function private.create_project_invitation(
  p_project_id uuid,
  p_email text,
  p_role_code text,
  p_token_hash text,
  p_expires_at timestamptz,
  p_language_code text
)
returns public.project_invitations
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_actor_id uuid := (select auth.uid());
  normalized_email text := lower(trim(p_email));
  result public.project_invitations;
begin
  if current_actor_id is null or not private.current_user_has_project_permission(
    p_project_id,
    'project.members.manage'
  ) then
    raise exception 'You cannot invite members to this project.'
      using errcode = '42501';
  end if;

  perform private.assert_assignable_project_role(p_role_code);

  if p_language_code not in ('es', 'en') then
    raise exception 'The invitation language is invalid.' using errcode = '22023';
  end if;

  if p_expires_at <= current_timestamp
    or p_expires_at > current_timestamp + interval '7 days 5 minutes'
  then
    raise exception 'The invitation expiry is invalid.' using errcode = '22023';
  end if;

  if private.project_invitee_has_inherited_access(p_project_id, normalized_email) then
    raise exception 'already_has_access' using errcode = 'P0001';
  end if;

  update public.project_invitations
  set
    status = 'expired',
    responded_at = current_timestamp,
    updated_at = current_timestamp
  where project_id = p_project_id
    and invited_email = normalized_email
    and status = 'pending'
    and expires_at <= current_timestamp;

  if exists (
    select 1
    from public.project_memberships membership
    join public.users app_user on app_user.id = membership.user_id
    where membership.project_id = p_project_id
      and membership.removed_at is null
      and app_user.email = normalized_email
      and app_user.deleted_at is null
  ) then
    raise exception 'This person is already a project member.'
      using errcode = '23505';
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

  insert into public.project_invitations (
    project_id,
    invited_email,
    role_code,
    token_hash,
    invited_by,
    expires_at,
    language_code
  ) values (
    p_project_id,
    normalized_email,
    p_role_code,
    p_token_hash,
    current_actor_id,
    p_expires_at,
    p_language_code
  ) returning * into result;

  insert into public.project_collaboration_events (
    project_id,
    event_type,
    actor_id,
    invitation_id,
    next_role_code
  ) values (
    p_project_id,
    'invited',
    current_actor_id,
    result.id,
    p_role_code
  );

  return result;
end;
$$;

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
  actor_id uuid := (select auth.uid());
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
    where event.actor_id = actor_id
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
    actor_id,
    invitation.id,
    invitation.role_code
  );

  return invitation;
end;
$$;

create or replace function private.respond_project_invitation(
  p_invitation_id uuid,
  p_response text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
  invitation public.project_invitations;
  membership public.project_memberships;
begin
  if p_response not in ('accepted', 'declined') then
    raise exception 'The invitation response is invalid.' using errcode = '22023';
  end if;

  select * into invitation
  from public.project_invitations
  where id = p_invitation_id
  for update;

  if invitation.id is null
    or actor_id is null
    or actor_email = ''
    or actor_email <> invitation.invited_email
  then
    raise exception 'This invitation is unavailable.' using errcode = '42501';
  end if;

  if invitation.status = 'accepted'
    and invitation.accepted_by = actor_id
    and p_response = 'accepted'
  then
    select * into membership
    from public.project_memberships
    where invitation_id = invitation.id
      and user_id = actor_id
      and removed_at is null;

    return jsonb_build_object(
      'invitation_id', invitation.id,
      'membership_id', membership.id,
      'project_id', invitation.project_id,
      'status', 'accepted'
    );
  end if;

  if invitation.status <> 'pending' then
    raise exception 'This invitation has already been resolved.'
      using errcode = '22023';
  end if;

  if private.user_has_inherited_project_access(actor_id, invitation.project_id) then
    update public.project_invitations
    set
      status = 'expired',
      resolution_reason = 'access_already_inherited',
      responded_at = current_timestamp,
      updated_at = current_timestamp
    where id = invitation.id;

    return jsonb_build_object(
      'invitation_id', invitation.id,
      'project_id', invitation.project_id,
      'resolution_reason', 'access_already_inherited',
      'status', 'expired'
    );
  end if;

  if invitation.expires_at <= current_timestamp then
    update public.project_invitations
    set status = 'expired', responded_at = current_timestamp, updated_at = current_timestamp
    where id = invitation.id;
    return jsonb_build_object('invitation_id', invitation.id, 'status', 'expired');
  end if;

  if p_response = 'declined' then
    update public.project_invitations
    set status = 'declined', responded_at = current_timestamp, updated_at = current_timestamp
    where id = invitation.id;

    insert into public.project_collaboration_events (
      project_id, event_type, actor_id, subject_user_id, invitation_id, next_role_code
    ) values (
      invitation.project_id, 'declined', actor_id, actor_id, invitation.id, invitation.role_code
    );
    return jsonb_build_object('invitation_id', invitation.id, 'status', 'declined');
  end if;

  perform private.assert_assignable_project_role(invitation.role_code);

  insert into public.project_memberships (
    project_id, user_id, role_code, invitation_id, invited_by
  ) values (
    invitation.project_id, actor_id, invitation.role_code, invitation.id, invitation.invited_by
  ) returning * into membership;

  update public.project_invitations
  set status = 'accepted', accepted_by = actor_id,
      responded_at = current_timestamp, updated_at = current_timestamp
  where id = invitation.id;

  insert into public.project_collaboration_events (
    project_id, event_type, actor_id, subject_user_id,
    invitation_id, membership_id, next_role_code
  ) values (
    invitation.project_id, 'accepted', actor_id, actor_id,
    invitation.id, membership.id, invitation.role_code
  );

  return jsonb_build_object(
    'invitation_id', invitation.id,
    'membership_id', membership.id,
    'project_id', invitation.project_id,
    'status', 'accepted'
  );
end;
$$;

create or replace function public.list_shared_projects(
  p_limit integer default 20,
  p_offset integer default 0
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with paging as (
    select
      greatest(1, least(coalesce(p_limit, 20), 50)) as page_size,
      greatest(0, coalesce(p_offset, 0)) as page_offset
  ), shared_rows as (
    select
      project.address,
      project.cover_image_path,
      project.estimated_end_date,
      project.id,
      project.latitude,
      project.longitude,
      project.name,
      project.phase,
      project.progress_percentage,
      project.project_type,
      project.status,
      organization.id as organization_id,
      organization.name as organization_name,
      membership.role_code,
      membership.joined_at
    from public.project_memberships membership
    join public.projects project
      on project.id = membership.project_id and project.deleted_at is null
    join public.workspaces workspace
      on workspace.id = project.workspace_id and workspace.deleted_at is null
    join public.organizations organization
      on organization.id = workspace.organization_id
      and organization.deleted_at is null
    cross join paging
    where membership.user_id = (select auth.uid())
      and membership.removed_at is null
      and not private.user_has_inherited_project_access(
        membership.user_id,
        membership.project_id
      )
    order by membership.joined_at desc, project.id
    limit (select page_size + 1 from paging)
    offset (select page_offset from paging)
  ), visible as (
    select * from shared_rows limit (select page_size from paging)
  )
  select jsonb_build_object(
    'items', coalesce(
      jsonb_agg(to_jsonb(visible) - 'joined_at'),
      '[]'::jsonb
    ),
    'has_more', (select count(*) from shared_rows) > (select page_size from paging),
    'next_offset', case
      when (select count(*) from shared_rows) > (select page_size from paging)
      then (select page_offset + page_size from paging)
      else null
    end
  )
  from visible;
$$;

revoke all on function public.list_shared_projects(integer, integer)
from public, anon;
grant execute on function public.list_shared_projects(integer, integer)
to authenticated;

create type public.organization_invitation_status as enum (
  'pending',
  'accepted',
  'declined',
  'revoked',
  'expired'
);

create table public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  invited_email text not null check (
    invited_email = lower(trim(invited_email))
    and char_length(invited_email) between 3 and 254
  ),
  role_code text not null references public.organization_roles(code) on delete restrict,
  token_hash text not null unique check (token_hash ~ '^[a-f0-9]{64}$'),
  status public.organization_invitation_status not null default 'pending',
  invited_by uuid not null references public.users(id) on delete restrict,
  accepted_by uuid references public.users(id) on delete restrict,
  revoked_by uuid references public.users(id) on delete restrict,
  expires_at timestamptz(3) not null,
  responded_at timestamptz(3),
  created_at timestamptz(3) not null default current_timestamp,
  updated_at timestamptz(3),
  constraint organization_invitations_terminal_actor check (
    (status = 'accepted' and accepted_by is not null and responded_at is not null)
    or (status = 'revoked' and revoked_by is not null and responded_at is not null)
    or (status in ('declined', 'expired') and responded_at is not null)
    or status = 'pending'
  )
);

create unique index organization_invitations_pending_email_idx
on public.organization_invitations(organization_id, invited_email)
where status = 'pending';
create index organization_invitations_email_pending_idx
on public.organization_invitations(invited_email, expires_at, id)
where status = 'pending';

revoke all on table public.organization_invitations from anon, authenticated;
alter table public.organization_invitations enable row level security;

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
    encode(
      extensions.digest(extensions.gen_random_bytes(32), 'sha256'),
      'hex'
    ),
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
    'status', 'pending'
  );
end;
$$;

create or replace function public.respond_organization_invitation(
  p_invitation_id uuid,
  p_response text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  actor_email text := lower(coalesce((select auth.jwt() ->> 'email'), ''));
  invitation public.organization_invitations;
  membership public.organization_memberships;
begin
  if p_response not in ('accepted', 'declined') then
    raise exception 'The invitation response is invalid.' using errcode = '22023';
  end if;

  select * into invitation
  from public.organization_invitations
  where id = p_invitation_id
  for update;

  if invitation.id is null
    or actor_id is null
    or actor_email = ''
    or actor_email <> invitation.invited_email
  then
    raise exception 'This invitation is unavailable.' using errcode = '42501';
  end if;

  if invitation.status <> 'pending' then
    raise exception 'This invitation has already been resolved.' using errcode = '22023';
  end if;

  if invitation.expires_at <= current_timestamp then
    update public.organization_invitations
    set status = 'expired', responded_at = current_timestamp, updated_at = current_timestamp
    where id = invitation.id;
    return jsonb_build_object('invitation_id', invitation.id, 'status', 'expired');
  end if;

  if p_response = 'declined' then
    update public.organization_invitations
    set status = 'declined', responded_at = current_timestamp, updated_at = current_timestamp
    where id = invitation.id;
    return jsonb_build_object('invitation_id', invitation.id, 'status', 'declined');
  end if;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role_code,
    invited_by
  ) values (
    invitation.organization_id,
    actor_id,
    invitation.role_code,
    invitation.invited_by
  )
  on conflict (organization_id, user_id) where removed_at is null
  do update set role_code = excluded.role_code, updated_at = current_timestamp
  returning * into membership;

  update public.organization_invitations
  set status = 'accepted', accepted_by = actor_id,
      responded_at = current_timestamp, updated_at = current_timestamp
  where id = invitation.id;

  return jsonb_build_object(
    'invitation_id', invitation.id,
    'membership_id', membership.id,
    'organization_id', invitation.organization_id,
    'status', 'accepted'
  );
end;
$$;

create or replace function public.list_my_organization_invitations(
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
      invitation.organization_id,
      organization.name as organization_name,
      invitation.role_code,
      invitation.expires_at,
      invitation.created_at
    from public.organization_invitations invitation
    join public.organizations organization
      on organization.id = invitation.organization_id
      and organization.deleted_at is null
    cross join paging
    where invitation.invited_email = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      and invitation.status = 'pending'
      and invitation.expires_at > current_timestamp
    order by invitation.created_at desc, invitation.id
    limit (select page_size + 1 from paging)
    offset (select page_offset from paging)
  ), visible as (
    select * from invitation_rows limit (select page_size from paging)
  )
  select jsonb_build_object(
    'items', coalesce(jsonb_agg(to_jsonb(visible)), '[]'::jsonb),
    'has_more', (select count(*) from invitation_rows) > (select page_size from paging),
    'next_offset', case
      when (select count(*) from invitation_rows) > (select page_size from paging)
      then (select page_offset + page_size from paging)
      else null
    end
  ) from visible;
$$;

create or replace function public.list_organization_members(
  p_organization_id uuid,
  p_limit integer default 50,
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
      greatest(1, least(coalesce(p_limit, 50), 50)) as page_size,
      greatest(0, coalesce(p_offset, 0)) as page_offset
  ), member_rows as (
    select
      membership.id,
      membership.user_id,
      app_user.first_name,
      app_user.last_name,
      app_user.email,
      membership.role_code,
      organization.owner_user_id = membership.user_id as is_owner,
      membership.joined_at
    from public.organization_memberships membership
    join public.organizations organization on organization.id = membership.organization_id
    join public.users app_user on app_user.id = membership.user_id
    cross join paging
    where membership.organization_id = p_organization_id
      and membership.removed_at is null
      and app_user.deleted_at is null
      and private.current_user_has_organization_permission(
        p_organization_id,
        'organization.members.read'
      )
    order by is_owner desc, membership.joined_at, membership.id
    limit (select page_size + 1 from paging)
    offset (select page_offset from paging)
  ), visible as (
    select * from member_rows limit (select page_size from paging)
  )
  select jsonb_build_object(
    'items', coalesce(jsonb_agg(to_jsonb(visible)), '[]'::jsonb),
    'has_more', (select count(*) from member_rows) > (select page_size from paging),
    'next_offset', case
      when (select count(*) from member_rows) > (select page_size from paging)
      then (select page_offset + page_size from paging)
      else null
    end
  ) from visible;
$$;

create or replace function public.update_organization_member_role(
  p_membership_id uuid,
  p_role_code text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target public.organization_memberships;
begin
  if p_role_code not in ('admin', 'member') then
    raise exception 'Invalid organization role.' using errcode = '22023';
  end if;

  select * into target
  from public.organization_memberships
  where id = p_membership_id
    and removed_at is null;

  if target.id is null then
    raise exception 'Organization member not found.' using errcode = 'P0002';
  end if;

  if not private.current_user_has_organization_permission(
    target.organization_id,
    'organization.members.manage'
  ) then
    raise exception 'Organization member management permission required.'
      using errcode = '42501';
  end if;

  update public.organization_memberships
  set role_code = p_role_code,
      updated_at = current_timestamp
  where id = target.id
  returning * into target;

  return to_jsonb(target);
end;
$$;

create or replace function public.remove_organization_member(
  p_membership_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_id uuid := (select auth.uid());
  target public.organization_memberships;
begin
  select * into target
  from public.organization_memberships
  where id = p_membership_id
    and removed_at is null;

  if target.id is null then
    raise exception 'Organization member not found.' using errcode = 'P0002';
  end if;

  if not private.current_user_has_organization_permission(
    target.organization_id,
    'organization.members.manage'
  ) then
    raise exception 'Organization member management permission required.'
      using errcode = '42501';
  end if;

  update public.organization_memberships
  set removed_at = current_timestamp,
      removed_by = actor_id,
      updated_at = current_timestamp
  where id = target.id
  returning * into target;

  return to_jsonb(target);
end;
$$;

revoke all on function public.create_organization_invitation(uuid, text, text)
from public, anon;
revoke all on function public.respond_organization_invitation(uuid, text)
from public, anon;
revoke all on function public.list_my_organization_invitations(integer, integer)
from public, anon;
revoke all on function public.list_organization_members(uuid, integer, integer)
from public, anon;
revoke all on function public.update_organization_member_role(uuid, text)
from public, anon;
revoke all on function public.remove_organization_member(uuid)
from public, anon;
grant execute on function public.create_organization_invitation(uuid, text, text)
to authenticated;
grant execute on function public.respond_organization_invitation(uuid, text)
to authenticated;
grant execute on function public.list_my_organization_invitations(integer, integer)
to authenticated;
grant execute on function public.list_organization_members(uuid, integer, integer)
to authenticated;
grant execute on function public.update_organization_member_role(uuid, text)
to authenticated;
grant execute on function public.remove_organization_member(uuid)
to authenticated;

create or replace function private.list_project_members(
  p_project_id uuid,
  p_limit integer default 50,
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
      greatest(1, least(coalesce(p_limit, 50), 50)) as page_size,
      greatest(0, coalesce(p_offset, 0)) as page_offset
  )
  select case
    when not private.current_user_has_project_permission(
      p_project_id,
      'project.members.read'
    ) then null
    else jsonb_build_object(
      'organization', (
        select jsonb_build_object(
          'id', organization.id,
          'name', organization.name,
          'avatar', organization.avatar
        )
        from public.projects project
        join public.workspaces workspace on workspace.id = project.workspace_id
        join public.organizations organization
          on organization.id = workspace.organization_id
        where project.id = p_project_id
          and project.deleted_at is null
          and workspace.deleted_at is null
          and organization.deleted_at is null
      ),
      'members', (
        select coalesce(
          jsonb_agg(member_row.payload order by member_row.joined_at, member_row.id),
          '[]'::jsonb
        )
        from (
          select
            membership.id,
            membership.joined_at,
            jsonb_build_object(
              'id', membership.id,
              'user_id', app_user.id,
              'first_name', app_user.first_name,
              'last_name', app_user.last_name,
              'email', app_user.email,
              'role_code', membership.role_code,
              'joined_at', membership.joined_at
            ) as payload
          from public.project_memberships membership
          join public.users app_user on app_user.id = membership.user_id
          cross join paging
          where membership.project_id = p_project_id
            and membership.removed_at is null
            and app_user.deleted_at is null
          order by membership.joined_at, membership.id
          limit (select page_size from paging)
          offset (select page_offset from paging)
        ) member_row
      ),
      'invitations', (
        select case
          when private.current_user_has_project_permission(
            p_project_id,
            'project.members.manage'
          ) then coalesce(
            jsonb_agg(
              invitation_row.payload
              order by invitation_row.created_at desc, invitation_row.id
            ),
            '[]'::jsonb
          )
          else '[]'::jsonb
        end
        from (
          select
            invitation.id,
            invitation.created_at,
            jsonb_build_object(
              'id', invitation.id,
              'email', invitation.invited_email,
              'role_code', invitation.role_code,
              'status', case
                when invitation.expires_at <= current_timestamp then 'expired'
                else invitation.status::text
              end,
              'delivery_status', invitation.delivery_status,
              'expires_at', invitation.expires_at,
              'last_sent_at', invitation.last_sent_at,
              'created_at', invitation.created_at
            ) as payload
          from public.project_invitations invitation
          cross join paging
          where invitation.project_id = p_project_id
            and invitation.status = 'pending'
          order by invitation.created_at desc, invitation.id
          limit (select page_size from paging)
          offset (select page_offset from paging)
        ) invitation_row
      ),
      'has_more', (
        exists (
          select 1
          from public.project_memberships membership
          join public.users app_user on app_user.id = membership.user_id
          cross join paging
          where membership.project_id = p_project_id
            and membership.removed_at is null
            and app_user.deleted_at is null
          offset ((select page_offset + page_size from paging))
          limit 1
        )
        or (
          private.current_user_has_project_permission(
            p_project_id,
            'project.members.manage'
          )
          and exists (
            select 1
            from public.project_invitations invitation
            cross join paging
            where invitation.project_id = p_project_id
              and invitation.status = 'pending'
            offset ((select page_offset + page_size from paging))
            limit 1
          )
        )
      ),
      'next_page', case
        when (
          exists (
            select 1
            from public.project_memberships membership
            cross join paging
            where membership.project_id = p_project_id
              and membership.removed_at is null
            offset ((select page_offset + page_size from paging))
            limit 1
          )
          or (
            private.current_user_has_project_permission(
              p_project_id,
              'project.members.manage'
            )
            and exists (
              select 1
              from public.project_invitations invitation
              cross join paging
              where invitation.project_id = p_project_id
                and invitation.status = 'pending'
              offset ((select page_offset + page_size from paging))
              limit 1
            )
          )
        ) then (select (page_offset / page_size) + 1 from paging)
        else null
      end
    )
  end
  from paging;
$$;
