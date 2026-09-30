begin;

alter table public.pfh_progress add column reset_version integer not null default 0
  check (reset_version >= 0);

create function pfh_private.sync_progress(p_state jsonb, p_modified_at timestamptz, p_reset_version integer)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz, reset_version integer)
language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
begin
  if player is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  -- Serialize sync and reset for one account, including its first-ever save.
  perform 1 from public.pfh_profiles where user_id = player for update;
  if not found then
    raise exception 'Choose a username before syncing' using errcode = '42501';
  end if;
  if p_reset_version is null or p_reset_version < 0 then
    raise exception 'Invalid reset version' using errcode = '22023';
  end if;
  insert into public.pfh_progress as existing (user_id, state, modified_at, reset_version)
    values (player, p_state - 'settings', p_modified_at, 0)
    on conflict (user_id) do update
      set state = excluded.state,
          modified_at = excluded.modified_at,
          updated_at = now()
      where existing.reset_version = p_reset_version
        and excluded.modified_at > existing.modified_at;
  return query select saved.state, saved.modified_at, saved.updated_at, saved.reset_version
    from public.pfh_progress saved where saved.user_id = player;
end;
$$;

revoke all on function pfh_private.sync_progress(jsonb, timestamptz, integer) from public, anon;
grant execute on function pfh_private.sync_progress(jsonb, timestamptz, integer) to authenticated;

create function public.pfh_sync_progress(p_state jsonb, p_modified_at timestamptz, p_reset_version integer)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz, reset_version integer)
language sql security invoker set search_path = '' as $$
  select * from pfh_private.sync_progress(p_state, p_modified_at, p_reset_version);
$$;
revoke all on function public.pfh_sync_progress(jsonb, timestamptz, integer) from public, anon;
grant execute on function public.pfh_sync_progress(jsonb, timestamptz, integer) to authenticated;

-- Old clients keep working before a reset, but cannot restore pre-reset saves.
create or replace function pfh_private.sync_progress(p_state jsonb, p_modified_at timestamptz)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz)
language sql security invoker set search_path = '' as $$
  select result.state, result.modified_at, result.updated_at
    from pfh_private.sync_progress(p_state, p_modified_at, 0) result;
$$;

create function pfh_private.reset_progress(p_state jsonb, p_expected_reset_version integer)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz, reset_version integer)
language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
begin
  if player is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  perform 1 from public.pfh_profiles where user_id = player for update;
  if not found then
    raise exception 'Choose a username before resetting' using errcode = '42501';
  end if;
  if p_expected_reset_version is null or p_expected_reset_version < 0 then
    raise exception 'Invalid reset version' using errcode = '22023';
  end if;
  -- Keep an empty save and reset version so older/offline devices cannot
  -- recreate erased progress. Repeated requests for one version are idempotent.
  insert into public.pfh_progress as existing (user_id, state, modified_at, reset_version)
    values (player, p_state - 'settings', now(), 1)
    on conflict (user_id) do update
      set state = excluded.state,
          modified_at = excluded.modified_at,
          updated_at = now(),
          reset_version = existing.reset_version + 1
      where existing.reset_version = p_expected_reset_version;
  return query select saved.state, saved.modified_at, saved.updated_at, saved.reset_version
    from public.pfh_progress saved where saved.user_id = player;
end;
$$;
revoke all on function pfh_private.reset_progress(jsonb, integer) from public, anon;
grant execute on function pfh_private.reset_progress(jsonb, integer) to authenticated;

create function public.pfh_reset_progress(p_state jsonb, p_expected_reset_version integer)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz, reset_version integer)
language sql security invoker set search_path = '' as $$
  select * from pfh_private.reset_progress(p_state, p_expected_reset_version);
$$;
revoke all on function public.pfh_reset_progress(jsonb, integer) from public, anon;
grant execute on function public.pfh_reset_progress(jsonb, integer) to authenticated;

commit;
