drop policy if exists "projects_select_owner_or_admin"
on public.projects;

create policy "projects_select_owner_or_admin"
on public.projects
for select
to authenticated
using (
  (select auth.uid()) is not null
  and (
    owner_id = (select auth.uid())
    or (select public.is_current_user_admin())
  )
);
