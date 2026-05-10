revoke all on all tables in schema public from anon, authenticated;

grant select, insert, update on table public.users to authenticated;

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.clients enable row level security;
alter table public.contractors enable row level security;
alter table public.workers enable row level security;
alter table public.attendances enable row level security;
alter table public.materials enable row level security;
alter table public.photos enable row level security;
alter table public.project_materials enable row level security;
alter table public.project_participants enable row level security;
alter table public.suppliers enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.todos enable row level security;
alter table public.trades enable row level security;
alter table public.user_materials enable row level security;
alter table public.worker_contracts enable row level security;
alter table public.labor_estimates enable row level security;

create policy "users_select_own_profile"
on public.users
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = id
);

create policy "users_insert_own_profile"
on public.users
for insert
to authenticated
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = id
  and (select auth.jwt() ->> 'email') is not null
  and lower(email) = lower((select auth.jwt() ->> 'email'))
  and role = 'user'
);

create policy "users_update_own_profile"
on public.users
for update
to authenticated
using (
  (select auth.uid()) is not null
  and (select auth.uid()) = id
)
with check (
  (select auth.uid()) is not null
  and (select auth.uid()) = id
  and (select auth.jwt() ->> 'email') is not null
  and lower(email) = lower((select auth.jwt() ->> 'email'))
  and role = (
    select u.role
    from public.users u
    where u.id = (select auth.uid())
  )
);
