create table if not exists public.google_maps_usage_windows (
  service text not null,
  window_name text not null default 'calendar_month',
  window_start date not null,
  request_count integer not null default 0,
  limit_count integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint google_maps_usage_windows_pkey primary key (
    service,
    window_name,
    window_start
  ),
  constraint google_maps_usage_windows_service_check check (
    service in ('places_autocomplete', 'places_resolve')
  ),
  constraint google_maps_usage_windows_window_name_check check (
    window_name = 'calendar_month'
  ),
  constraint google_maps_usage_windows_request_count_check check (
    request_count >= 0
  ),
  constraint google_maps_usage_windows_limit_count_check check (
    limit_count > 0
  )
);

alter table public.google_maps_usage_windows enable row level security;

revoke all on public.google_maps_usage_windows from anon, authenticated;
grant all on public.google_maps_usage_windows to service_role;

create or replace function public.consume_google_maps_usage(
  p_service text,
  p_window_start date,
  p_limit_count integer
)
returns table (
  allowed boolean,
  request_count integer,
  limit_count integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_count integer;
begin
  if p_service not in ('places_autocomplete', 'places_resolve') then
    raise exception 'Invalid Google Maps usage service: %', p_service
      using errcode = '22023';
  end if;

  if p_limit_count < 1 then
    raise exception 'Google Maps usage limit must be positive.'
      using errcode = '22023';
  end if;

  insert into public.google_maps_usage_windows (
    service,
    window_name,
    window_start,
    request_count,
    limit_count
  )
  values (
    p_service,
    'calendar_month',
    p_window_start,
    0,
    p_limit_count
  )
  on conflict (service, window_name, window_start) do nothing;

  update public.google_maps_usage_windows as usage
  set
    request_count = usage.request_count + 1,
    limit_count = p_limit_count,
    updated_at = now()
  where usage.service = p_service
    and usage.window_name = 'calendar_month'
    and usage.window_start = p_window_start
    and usage.request_count < p_limit_count
  returning usage.request_count
    into v_request_count;

  if v_request_count is null then
    select google_maps_usage_windows.request_count
    into v_request_count
    from public.google_maps_usage_windows
    where service = p_service
      and window_name = 'calendar_month'
      and window_start = p_window_start;

    return query
    select
      false,
      coalesce(v_request_count, p_limit_count),
      p_limit_count,
      (p_window_start + interval '1 month')::timestamptz;

    return;
  end if;

  return query
  select
    true,
    v_request_count,
    p_limit_count,
    (p_window_start + interval '1 month')::timestamptz;
end;
$$;

revoke all on function public.consume_google_maps_usage(text, date, integer)
  from public, anon, authenticated;
grant execute on function public.consume_google_maps_usage(text, date, integer)
  to service_role;
