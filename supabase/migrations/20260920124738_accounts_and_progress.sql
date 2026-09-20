begin;

create table public.pfh_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now(),
  constraint pfh_username_format check (username ~ '^[a-z0-9_]{3,20}$')
);

create table public.pfh_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null,
  modified_at timestamptz not null,
  updated_at timestamptz not null default now(),
  constraint pfh_save_version check (
    jsonb_typeof(state) = 'object'
    and state @> '{"version": 4}'::jsonb
    and not (state ? 'settings')
  ),
  constraint pfh_save_time check (isfinite(modified_at) and modified_at >= '1970-01-01T00:00:00Z')
);

alter table public.pfh_profiles enable row level security;
alter table public.pfh_progress enable row level security;

revoke all on public.pfh_profiles, public.pfh_progress from anon, authenticated;
grant select, insert on public.pfh_profiles to authenticated;
grant select on public.pfh_progress to authenticated;

create policy pfh_read_own_profile on public.pfh_profiles
  for select to authenticated using ((select auth.uid()) = user_id);
create policy pfh_create_own_profile on public.pfh_profiles
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy pfh_read_own_progress on public.pfh_progress
  for select to authenticated using ((select auth.uid()) = user_id);

-- All progress writes use this function, so older or equal snapshots cannot
-- bypass the conflict rule with a direct REST upsert. Identity comes exclusively
-- from the authenticated JWT, never from a caller-supplied user ID.
create schema pfh_private;
revoke all on schema pfh_private from public, anon, authenticated;
grant usage on schema pfh_private to authenticated;

create function pfh_private.sync_progress(p_state jsonb, p_modified_at timestamptz)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
begin
  if player is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if not exists (select 1 from public.pfh_profiles where user_id = player) then
    raise exception 'Choose a username before syncing' using errcode = '42501';
  end if;
  insert into public.pfh_progress as existing (user_id, state, modified_at)
    values (player, p_state - 'settings', p_modified_at)
    on conflict (user_id) do update
      set state = excluded.state,
          modified_at = excluded.modified_at,
          updated_at = now()
      where excluded.modified_at > existing.modified_at;
  return query
    select saved.state, saved.modified_at, saved.updated_at
    from public.pfh_progress saved where saved.user_id = player;
end;
$$;

revoke all on function pfh_private.sync_progress(jsonb, timestamptz) from public, anon;
grant execute on function pfh_private.sync_progress(jsonb, timestamptz) to authenticated;

-- Keep privileged code outside the exposed API schema. This narrow invoker
-- wrapper is the only Data API entry point, with the same authenticated grant.
create function public.pfh_sync_progress(p_state jsonb, p_modified_at timestamptz)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz)
language sql security invoker set search_path = '' as $$
  select * from pfh_private.sync_progress(p_state, p_modified_at);
$$;

revoke all on function public.pfh_sync_progress(jsonb, timestamptz) from public, anon;
grant execute on function public.pfh_sync_progress(jsonb, timestamptz) to authenticated;

commit;
