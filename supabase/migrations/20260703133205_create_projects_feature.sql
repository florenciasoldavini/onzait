create type public.project_building_type as enum (
  'residential',
  'commercial',
  'industrial',
  'infrastructure',
  'institutional',
  'mixed_use'
);

create type public.project_type as enum (
  'new_build',
  'renovation',
  'remodel',
  'expansion',
  'maintenance'
);

create type public.project_status as enum (
  'planned',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled'
);

create type public.project_phase as enum (
  'concept',
  'design',
  'permits',
  'preconstruction',
  'procurement',
  'construction',
  'post_construction'
);

create or replace function public.is_current_user_admin()
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = (select auth.uid())
      and role = 'admin'
      and deleted_at is null
  );
$$;

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete restrict,
  name text not null check (char_length(trim(name)) between 2 and 120),
  description text check (description is null or char_length(description) <= 2000),
  cover_image_path text,
  address text not null check (char_length(trim(address)) between 4 and 500),
  google_place_id text not null check (char_length(trim(google_place_id)) between 3 and 255),
  latitude double precision not null check (latitude >= -90 and latitude <= 90),
  longitude double precision not null check (longitude >= -180 and longitude <= 180),
  building_type public.project_building_type not null default 'residential',
  project_type public.project_type not null default 'new_build',
  status public.project_status not null default 'planned',
  phase public.project_phase not null default 'concept',
  progress_percentage integer not null default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  estimated_start_date date,
  start_date date,
  estimated_end_date date,
  end_date date,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3),
  constraint projects_estimated_date_order check (
    estimated_start_date is null
    or estimated_end_date is null
    or estimated_start_date <= estimated_end_date
  ),
  constraint projects_actual_date_order check (
    start_date is null
    or end_date is null
    or start_date <= end_date
  )
);

create index projects_owner_id_idx on public.projects(owner_id);
create index projects_deleted_at_idx on public.projects(deleted_at);
create index projects_status_idx on public.projects(status);
create index projects_phase_idx on public.projects(phase);
create index projects_created_at_idx on public.projects(created_at desc);
create index projects_visible_owner_created_idx on public.projects(owner_id, created_at desc)
where deleted_at is null;
create index projects_visible_admin_created_idx on public.projects(created_at desc)
where deleted_at is null;
create unique index projects_google_place_owner_active_idx on public.projects(owner_id, google_place_id)
where deleted_at is null;

grant select, insert, update on table public.projects to authenticated;

alter table public.projects enable row level security;

create policy "projects_select_owner_or_admin"
on public.projects
for select
to authenticated
using (
  (select auth.uid()) is not null
  and deleted_at is null
  and (
    owner_id = (select auth.uid())
    or (select public.is_current_user_admin())
  )
);

create policy "projects_insert_own_project"
on public.projects
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and owner_id = (select auth.uid())
  and deleted_at is null
);

create policy "projects_update_owner_or_admin"
on public.projects
for update
to authenticated
using (
  (select auth.uid()) is not null
  and deleted_at is null
  and (
    owner_id = (select auth.uid())
    or (select public.is_current_user_admin())
  )
)
with check (
  (select auth.uid()) is not null
  and (
    owner_id = (select auth.uid())
    or (select public.is_current_user_admin())
  )
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'project-covers',
  'project-covers',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.can_current_user_access_project(project_id_text text)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.projects
    where id::text = project_id_text
      and deleted_at is null
      and (
        owner_id = (select auth.uid())
        or (select public.is_current_user_admin())
      )
  );
$$;

drop policy if exists "project_covers_select_owner_or_admin" on storage.objects;
drop policy if exists "project_covers_insert_owner_or_admin" on storage.objects;
drop policy if exists "project_covers_update_owner_or_admin" on storage.objects;
drop policy if exists "project_covers_delete_owner_or_admin" on storage.objects;

create policy "project_covers_select_owner_or_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'project-covers'
  and (storage.foldername(name))[1] = 'projects'
  and (storage.foldername(name))[3] = 'cover'
  and (select public.can_current_user_access_project((storage.foldername(name))[2]))
);

create policy "project_covers_insert_owner_or_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'project-covers'
  and (storage.foldername(name))[1] = 'projects'
  and (storage.foldername(name))[3] = 'cover'
  and (select public.can_current_user_access_project((storage.foldername(name))[2]))
);

create policy "project_covers_update_owner_or_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'project-covers'
  and (storage.foldername(name))[1] = 'projects'
  and (storage.foldername(name))[3] = 'cover'
  and (select public.can_current_user_access_project((storage.foldername(name))[2]))
)
with check (
  bucket_id = 'project-covers'
  and (storage.foldername(name))[1] = 'projects'
  and (storage.foldername(name))[3] = 'cover'
  and (select public.can_current_user_access_project((storage.foldername(name))[2]))
);

create policy "project_covers_delete_owner_or_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'project-covers'
  and (storage.foldername(name))[1] = 'projects'
  and (storage.foldername(name))[3] = 'cover'
  and (select public.can_current_user_access_project((storage.foldername(name))[2]))
);
