begin;
create function pg_temp.assert(ok boolean, message text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception 'FAIL: %', message; end if; end;
$$;
select set_config('pfh.test_user', gen_random_uuid()::text, true);
insert into auth.users(id) values (current_setting('pfh.test_user')::uuid);
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('pfh.test_user'), true);
insert into public.pfh_profiles(user_id,username) values(auth.uid(),'reset_'||substr(replace(auth.uid()::text,'-',''),1,14));
select * from public.pfh_sync_progress('{"version":4,"draft":"old"}', '2099-01-01', 0);
select * from public.pfh_reset_progress('{"version":4,"draft":"empty","settings":{"mute":true}}', 0);
select pg_temp.assert((select reset_version=1 and state->>'draft'='empty' and not(state ? 'settings') from public.pfh_progress), 'reset did not clear progress');
select pg_temp.assert((select count(*)=1 from public.pfh_profiles), 'reset removed profile');
select * from public.pfh_sync_progress('{"version":4,"draft":"stale"}', '2100-01-01', 0);
select * from public.pfh_sync_progress('{"version":4,"draft":"legacy"}', '2100-01-01');
select pg_temp.assert((select state->>'draft'='empty' from public.pfh_progress), 'stale client resurrected erased progress');
select * from public.pfh_sync_progress('{"version":4,"draft":"new"}', '2100-01-01', 1);
select * from public.pfh_reset_progress('{"version":4,"draft":"repeated reset"}', 0);
select pg_temp.assert((select reset_version=1 and state->>'draft'='new' from public.pfh_progress), 'duplicate reset removed new work');
select set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
do $$ begin
  begin perform public.pfh_reset_progress('{"version":4}', 0);
    raise exception 'FAIL: reset without profile'; exception when insufficient_privilege then null; end;
end $$;
set local role anon;
do $$ begin
  begin perform public.pfh_reset_progress('{"version":4}', 0);
    raise exception 'FAIL: anonymous reset'; exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'Account reset, stale-device protection, idempotence and access checks passed.' as result;
