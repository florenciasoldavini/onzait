create type public.task_status as enum (
  'to_do',
  'in_progress',
  'blocked',
  'completed'
);

create type public.task_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete restrict,
  owner_id uuid not null references public.users(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 2 and 160),
  description text check (description is null or char_length(description) <= 3000),
  status public.task_status not null default 'to_do',
  priority public.task_priority not null default 'medium',
  due_date date,
  completed_at timestamp(3),
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3),
  constraint tasks_completion_state_check check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  )
);

create index tasks_owner_id_idx on public.tasks(owner_id);
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_status_idx on public.tasks(status);
create index tasks_priority_idx on public.tasks(priority);
create index tasks_due_date_idx on public.tasks(due_date);
create index tasks_visible_owner_created_idx
on public.tasks(owner_id, created_at desc)
where deleted_at is null;
create index tasks_visible_project_created_idx
on public.tasks(project_id, created_at desc)
where deleted_at is null;

create or replace function public.set_task_derived_fields()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  project_owner_id uuid;
begin
  if new.project_id is not null then
    select owner_id
    into project_owner_id
    from public.projects
    where id = new.project_id
      and deleted_at is null;

    if project_owner_id is null then
      raise exception 'Task project is unavailable.' using errcode = '23503';
    end if;

    new.owner_id := project_owner_id;
  elsif tg_op = 'INSERT' then
    new.owner_id := coalesce((select auth.uid()), new.owner_id);

    if new.owner_id is null then
      raise exception 'Task owner is required.' using errcode = '23502';
    end if;
  else
    new.owner_id := old.owner_id;
  end if;

  if new.status = 'completed'
    and (tg_op = 'INSERT' or old.status is distinct from 'completed')
  then
    new.completed_at := current_timestamp;
  elsif new.status = 'completed' then
    new.completed_at := old.completed_at;
  elsif new.status <> 'completed' then
    new.completed_at := null;
  end if;

  return new;
end;
$$;

revoke all on function public.set_task_derived_fields() from public, anon, authenticated;

create trigger tasks_set_derived_fields
before insert or update of project_id, owner_id, status, completed_at
on public.tasks
for each row
execute function public.set_task_derived_fields();

grant select, insert, update on table public.tasks to authenticated;

alter table public.tasks enable row level security;

create policy "tasks_select_owner_or_admin"
on public.tasks
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (
    (
      project_id is null
      and owner_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.projects
      where projects.id = tasks.project_id
        and projects.deleted_at is null
        and projects.owner_id = (select auth.uid())
    )
    or (select public.is_current_user_admin())
  )
);

create policy "tasks_insert_owner_or_admin"
on public.tasks
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (
    (
      project_id is null
      and owner_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.projects
      where projects.id = tasks.project_id
        and projects.deleted_at is null
        and projects.owner_id = tasks.owner_id
        and (
          projects.owner_id = (select auth.uid())
          or (select public.is_current_user_admin())
        )
    )
    or (select public.is_current_user_admin())
  )
);

create policy "tasks_update_owner_or_admin"
on public.tasks
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (
    (
      project_id is null
      and owner_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.projects
      where projects.id = tasks.project_id
        and projects.deleted_at is null
        and projects.owner_id = (select auth.uid())
    )
    or (select public.is_current_user_admin())
  )
)
with check (
  (select auth.uid()) is not null
  and (
    (
      project_id is null
      and owner_id = (select auth.uid())
    )
    or exists (
      select 1
      from public.projects
      where projects.id = tasks.project_id
        and projects.deleted_at is null
        and projects.owner_id = tasks.owner_id
        and (
          projects.owner_id = (select auth.uid())
          or (select public.is_current_user_admin())
        )
    )
    or (select public.is_current_user_admin())
  )
);
