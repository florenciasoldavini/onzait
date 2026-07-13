begin;

create extension if not exists pgtap with schema extensions;

select plan(5);

set local role authenticated;

select throws_ok(
  $$
    select *
    from public.consume_google_maps_usage(
      'places_autocomplete',
      date '2026-07-01',
      2
    )
  $$,
  '42501',
  null,
  'authenticated users cannot call Google Maps usage counter directly'
);

reset role;

select results_eq(
  $$
    select allowed, request_count, limit_count
    from public.consume_google_maps_usage(
      'places_autocomplete',
      date '2026-07-01',
      2
    )
  $$,
  $$ values (true, 1, 2) $$,
  'first autocomplete usage is allowed'
);

select results_eq(
  $$
    select allowed, request_count, limit_count
    from public.consume_google_maps_usage(
      'places_autocomplete',
      date '2026-07-01',
      2
    )
  $$,
  $$ values (true, 2, 2) $$,
  'usage at the cap is allowed'
);

select results_eq(
  $$
    select allowed, request_count, limit_count
    from public.consume_google_maps_usage(
      'places_autocomplete',
      date '2026-07-01',
      2
    )
  $$,
  $$ values (false, 2, 2) $$,
  'usage above the cap is blocked'
);

select throws_ok(
  $$
    select *
    from public.consume_google_maps_usage(
      'places_photos',
      date '2026-07-01',
      2
    )
  $$,
  '22023',
  'Invalid Google Maps usage service: places_photos',
  'usage counter rejects unknown services'
);

select * from finish();

rollback;
