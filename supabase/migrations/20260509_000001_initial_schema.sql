create extension if not exists pgcrypto with schema extensions;

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'user_role'
      and n.nspname = 'public'
  ) then
    create type public.user_role as enum ('admin', 'user');
  end if;
end
$$;

create table if not exists public.users (
  id uuid primary key,
  first_name text not null,
  last_name text,
  avatar text,
  email text not null unique,
  phone_number text,
  role public.user_role not null default 'user',
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.projects (
  id text primary key default (extensions.gen_random_uuid())::text,
  name text not null,
  description text not null,
  cover_image text,
  address text not null,
  coordinates jsonb not null,
  building_type text not null,
  project_type text not null,
  status text not null,
  phase text not null,
  progress_percentage integer not null default 0,
  estimated_start_date timestamp(3),
  start_date timestamp(3),
  estimated_end_date timestamp(3),
  end_date timestamp(3),
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.clients (
  id text primary key default (extensions.gen_random_uuid())::text,
  user_id uuid not null references public.users(id) on delete cascade,
  first_name text not null,
  last_name text,
  avatar text,
  email text,
  phone_number text,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.contractors (
  id text primary key default (extensions.gen_random_uuid())::text,
  user_id uuid not null references public.users(id) on delete cascade,
  first_name text not null,
  last_name text,
  avatar text,
  phone_number text,
  email text,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.workers (
  id text primary key default (extensions.gen_random_uuid())::text,
  user_id uuid not null references public.users(id) on delete cascade,
  contractor_id text not null references public.contractors(id) on delete cascade,
  first_name text not null,
  last_name text,
  avatar text,
  phone_number text,
  email text,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.attendances (
  id text primary key default (extensions.gen_random_uuid())::text,
  date date not null,
  project_id text not null references public.projects(id) on delete cascade,
  worker_id text not null references public.workers(id) on delete cascade,
  present boolean not null default false,
  hours_worked double precision,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.materials (
  id text primary key default (extensions.gen_random_uuid())::text,
  name text not null,
  photo text,
  description text,
  unit_of_measure text not null,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.photos (
  id text primary key default (extensions.gen_random_uuid())::text,
  user_id uuid not null references public.users(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,
  url text not null,
  category text not null,
  notes text,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.project_materials (
  id text primary key default (extensions.gen_random_uuid())::text,
  project_id text not null references public.projects(id) on delete cascade,
  material_id text not null references public.materials(id) on delete cascade,
  quantity double precision not null,
  unit_price double precision not null,
  purchase_due_date timestamp(3),
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.project_participants (
  id text primary key default (extensions.gen_random_uuid())::text,
  project_id text not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  unique (project_id, user_id)
);

create table if not exists public.suppliers (
  id text primary key default (extensions.gen_random_uuid())::text,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  website text,
  phone_number text,
  address text,
  coordinates jsonb,
  opening_hours text[] default array[]::text[],
  notes text,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.purchases (
  id text primary key default (extensions.gen_random_uuid())::text,
  project_id text not null references public.projects(id) on delete cascade,
  supplier_id text references public.suppliers(id) on delete set null,
  total_amount double precision not null,
  receipt_url text,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.purchase_items (
  id text primary key default (extensions.gen_random_uuid())::text,
  purchase_id text not null references public.purchases(id) on delete cascade,
  material_id text not null references public.materials(id) on delete cascade,
  quantity double precision,
  unit_price double precision,
  total_price double precision,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.todos (
  id text primary key default (extensions.gen_random_uuid())::text,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  is_done boolean not null default false,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.trades (
  id text primary key default (extensions.gen_random_uuid())::text,
  name text not null,
  description text not null,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.user_materials (
  id text primary key default (extensions.gen_random_uuid())::text,
  user_id uuid not null references public.users(id) on delete cascade,
  material_id text not null references public.materials(id) on delete cascade,
  estimated_price double precision not null,
  notes text,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.worker_contracts (
  id text primary key default (extensions.gen_random_uuid())::text,
  worker_id text not null references public.workers(id) on delete cascade,
  project_id text not null references public.projects(id) on delete cascade,
  payment_type text not null,
  rate double precision not null,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create table if not exists public.labor_estimates (
  id text primary key default (extensions.gen_random_uuid())::text,
  project_id text not null references public.projects(id) on delete cascade,
  trade_id text not null references public.trades(id) on delete cascade,
  cost double precision not null,
  created_at timestamp(3) not null default current_timestamp,
  updated_at timestamp(3),
  deleted_at timestamp(3)
);

create index if not exists users_email_idx on public.users(email);
create index if not exists project_participants_user_id_idx on public.project_participants(user_id);
create index if not exists project_participants_project_id_idx on public.project_participants(project_id);
create index if not exists todos_user_id_idx on public.todos(user_id);
