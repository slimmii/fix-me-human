begin;
create function pg_temp.assert(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %', message; end if; end;
$$;
select set_config('pfh.first_user', gen_random_uuid()::text, true);
select set_config('pfh.second_user', gen_random_uuid()::text, true);
insert into auth.users(id) values
  (current_setting('pfh.first_user')::uuid),
  (current_setting('pfh.second_user')::uuid);

set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('pfh.first_user'), true);
insert into public.pfh_profiles(user_id, username) values (auth.uid(), 'desk_first');
select * from public.pfh_sync_progress(
  '{"version":4,"workstationId":"A–001"}',
  '2026-09-30T10:00:00Z',
  0
);
select pg_temp.assert(
  (select workstation_id = 'A–001' and state->>'workstationId' = workstation_id
   from public.pfh_progress where user_id = auth.uid()),
  'available guest workstation ID was not preserved'
);
select * from public.pfh_sync_progress(
  '{"version":4,"workstationId":"B–002"}',
  '2026-09-30T11:00:00Z',
  0
);
select pg_temp.assert(
  (select workstation_id = 'A–001' and state->>'workstationId' = workstation_id
   from public.pfh_progress where user_id = auth.uid()),
  'later client save changed the database assignment'
);

select set_config('request.jwt.claim.sub', current_setting('pfh.second_user'), true);
insert into public.pfh_profiles(user_id, username) values (auth.uid(), 'desk_second');
select * from public.pfh_sync_progress(
  '{"version":4,"workstationId":"A–001"}',
  '2026-09-30T10:00:00Z',
  0
);
select pg_temp.assert(
  (select workstation_id <> 'A–001'
      and workstation_id ~ '^[A-Z]–(00[1-9]|0[1-9][0-9]|[1-9][0-9]{2})$'
      and state->>'workstationId' = workstation_id
   from public.pfh_progress where user_id = auth.uid()),
  'duplicate workstation ID was not atomically reallocated'
);
select pg_temp.assert(
  (select count(*) = count(distinct workstation_id) from public.pfh_progress),
  'workstation assignments are not globally unique'
);

select * from public.pfh_reset_progress('{"version":4,"workstationId":null}', 0);
select pg_temp.assert(
  (select reset_version = 1 and state->>'workstationId' = workstation_id
   from public.pfh_progress where user_id = auth.uid()),
  'reset did not preserve the database workstation assignment'
);

set local role anon;
do $$ begin
  begin perform public.pfh_sync_progress(
    '{"version":4,"workstationId":"C–003"}', now(), 0
  );
    raise exception 'FAIL: anonymous workstation allocation';
  exception when insufficient_privilege then null; end;
end $$;

rollback;
select 'Unique workstation allocation, persistence, reset and access checks passed.' as result;
