-- Run after the migration in a disposable database. All fixtures roll back.
begin;
create function pg_temp.assert(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %', message; end if; end;
$$;
insert into auth.users(id) values
 ('11111111-1111-4111-8111-111111111111'),
 ('22222222-2222-4222-8222-222222222222'),
 ('33333333-3333-4333-8333-333333333333');

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
insert into public.pfh_profiles(user_id, username) values (auth.uid(), 'human_one');
select * from public.pfh_sync_progress('{"version":4,"draft":"new"}', '2026-09-20T10:00:00Z');
select * from public.pfh_sync_progress('{"version":4,"draft":"old"}', '2026-09-19T10:00:00Z');
select * from public.pfh_sync_progress('{"version":4,"draft":"tie"}', '2026-09-20T10:00:00Z');
select pg_temp.assert((select state->>'draft' = 'new' from public.pfh_progress), 'older/equal saves overwrite latest');
do $$ begin
  begin insert into public.pfh_profiles(user_id, username) values ('22222222-2222-4222-8222-222222222222', 'stolen');
    raise exception 'FAIL: insert another user profile'; exception when insufficient_privilege then null; end;
  begin update public.pfh_progress set state = '{"version":4}';
    raise exception 'FAIL: direct progress update'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select pg_temp.assert((select count(*) = 0 from public.pfh_profiles), 'cross-account profile read');
select pg_temp.assert((select count(*) = 0 from public.pfh_progress), 'cross-account progress read');
do $$ begin
  begin insert into public.pfh_profiles(user_id, username) values (auth.uid(), 'human_one');
    raise exception 'FAIL: duplicate username'; exception when unique_violation then null; end;
  begin insert into public.pfh_profiles(user_id, username) values (auth.uid(), 'Human_One');
    raise exception 'FAIL: mixed-case username'; exception when check_violation then null; end;
  begin insert into public.pfh_profiles(user_id, username) values (auth.uid(), 'xy');
    raise exception 'FAIL: short username'; exception when check_violation then null; end;
  begin perform public.pfh_sync_progress('{"version":4}', now());
    raise exception 'FAIL: sync without profile'; exception when insufficient_privilege then null; end;
end $$;
insert into public.pfh_profiles(user_id, username) values (auth.uid(), 'human_two');
select * from public.pfh_sync_progress('{"version":4,"draft":"second","settings":{"mute":true}}', now());
select pg_temp.assert((select count(*) = 1 from public.pfh_progress), 'wrong own-save count');
select pg_temp.assert((select not (state ? 'settings') from public.pfh_progress), 'device settings leaked into cloud');
do $$ begin
  begin perform public.pfh_sync_progress('{"version":5}', now());
    raise exception 'FAIL: incompatible version'; exception when check_violation then null; end;
  begin perform public.pfh_sync_progress('{"version":4}', 'infinity');
    raise exception 'FAIL: infinite timestamp'; exception when check_violation then null; end;
end $$;

set local role anon;
select set_config('request.jwt.claim.sub', '', true);
do $$ begin
  begin perform * from public.pfh_profiles;
    raise exception 'FAIL: anonymous profile read'; exception when insufficient_privilege then null; end;
  begin perform * from public.pfh_progress;
    raise exception 'FAIL: anonymous progress read'; exception when insufficient_privilege then null; end;
  begin perform public.pfh_sync_progress('{"version":4}', now());
    raise exception 'FAIL: anonymous RPC'; exception when insufficient_privilege then null; end;
end $$;
reset role;
delete from auth.users where id = '11111111-1111-4111-8111-111111111111';
select pg_temp.assert((select count(*) = 0 from public.pfh_profiles where username = 'human_one'), 'profile cascade');
select pg_temp.assert((select count(*) = 0 from public.pfh_progress where user_id = '11111111-1111-4111-8111-111111111111'), 'save cascade');
rollback;
select 'Account constraints, RLS, and conflict tests passed.' as result;
