begin;

alter table public.pfh_progress add column workstation_id text;

-- Preserve one owner for every valid legacy assignment. Duplicate and invalid
-- JSON-only assignments are reallocated below before uniqueness is enforced.
with ranked_legacy_ids as (
  select
    user_id,
    state->>'workstationId' as workstation_id,
    row_number() over (
      partition by state->>'workstationId'
      order by user_id
    ) as duplicate_rank
  from public.pfh_progress
  where state->>'workstationId' ~ '^[A-Z]–(00[1-9]|0[1-9][0-9]|[1-9][0-9]{2})$'
)
update public.pfh_progress as progress
set workstation_id = legacy.workstation_id
from ranked_legacy_ids as legacy
where progress.user_id = legacy.user_id
  and legacy.duplicate_rank = 1;

do $$
begin
  if (select count(*) from public.pfh_progress) > 25974 then
    raise exception 'Workstation ID space exhausted' using errcode = '54000';
  end if;
end;
$$;

-- Randomly pair unassigned accounts with every still-available value. This is
-- a one-time migration backfill; runtime allocation below is protected by the
-- unique constraint and retries collisions from concurrent transactions.
with available_ids as (
  select
    candidate.workstation_id,
    row_number() over (order by random()) as slot
  from (
    select
      chr(65 + (value / 999)::integer)
        || '–'
        || lpad(((value % 999) + 1)::text, 3, '0') as workstation_id
    from generate_series(0, 25973) as ids(value)
  ) as candidate
  where not exists (
    select 1
    from public.pfh_progress as claimed
    where claimed.workstation_id = candidate.workstation_id
  )
),
unassigned_accounts as (
  select user_id, row_number() over (order by random()) as slot
  from public.pfh_progress
  where workstation_id is null
)
update public.pfh_progress as progress
set workstation_id = available.workstation_id
from unassigned_accounts as account
join available_ids as available using (slot)
where progress.user_id = account.user_id;

update public.pfh_progress
set state = jsonb_set(
  state,
  '{workstationId}',
  to_jsonb(workstation_id),
  true
);

alter table public.pfh_progress
  alter column workstation_id set not null,
  add constraint pfh_progress_workstation_id_format check (
    workstation_id ~ '^[A-Z]–(00[1-9]|0[1-9][0-9]|[1-9][0-9]{2})$'
  ),
  add constraint pfh_progress_workstation_id_key unique (workstation_id);

create or replace function pfh_private.sync_progress(
  p_state jsonb,
  p_modified_at timestamptz,
  p_reset_version integer
)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz, reset_version integer)
language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
  assigned text;
  preferred text;
  candidate text;
  canonical_state jsonb;
  random_start integer;
  candidate_offset integer;
  candidate_index integer;
  conflict_constraint text;
begin
  if player is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  -- Serialize sync and reset for one account, including its first allocation.
  perform 1 from public.pfh_profiles where user_id = player for update;
  if not found then
    raise exception 'Choose a username before syncing' using errcode = '42501';
  end if;
  if p_reset_version is null or p_reset_version < 0 then
    raise exception 'Invalid reset version' using errcode = '22023';
  end if;

  select saved.workstation_id into assigned
  from public.pfh_progress as saved
  where saved.user_id = player;

  if found then
    canonical_state := jsonb_set(
      p_state - 'settings',
      '{workstationId}',
      to_jsonb(assigned),
      true
    );
    insert into public.pfh_progress as existing (
      user_id, state, modified_at, reset_version, workstation_id
    ) values (
      player, canonical_state, p_modified_at, 0, assigned
    )
    on conflict (user_id) do update
      set state = excluded.state,
          modified_at = excluded.modified_at,
          updated_at = now()
      where existing.reset_version = p_reset_version
        and excluded.modified_at > existing.modified_at;
    return query
      select saved.state, saved.modified_at, saved.updated_at, saved.reset_version
      from public.pfh_progress as saved
      where saved.user_id = player;
    return;
  end if;

  preferred := p_state->>'workstationId';
  if preferred ~ '^[A-Z]–(00[1-9]|0[1-9][0-9]|[1-9][0-9]{2})$' then
    canonical_state := jsonb_set(
      p_state - 'settings',
      '{workstationId}',
      to_jsonb(preferred),
      true
    );
    begin
      insert into public.pfh_progress (
        user_id, state, modified_at, reset_version, workstation_id
      ) values (
        player, canonical_state, p_modified_at, 0, preferred
      );
      return query
        select saved.state, saved.modified_at, saved.updated_at, saved.reset_version
        from public.pfh_progress as saved
        where saved.user_id = player;
      return;
    exception when unique_violation then
      get stacked diagnostics conflict_constraint = constraint_name;
      if conflict_constraint <> 'pfh_progress_workstation_id_key' then
        raise;
      end if;
    end;
  end if;

  random_start := floor(random() * 25974)::integer;
  for candidate_offset in 0..25973 loop
    candidate_index := (random_start + candidate_offset) % 25974;
    candidate := chr(65 + candidate_index / 999)
      || '–'
      || lpad(((candidate_index % 999) + 1)::text, 3, '0');
    canonical_state := jsonb_set(
      p_state - 'settings',
      '{workstationId}',
      to_jsonb(candidate),
      true
    );
    begin
      insert into public.pfh_progress (
        user_id, state, modified_at, reset_version, workstation_id
      ) values (
        player, canonical_state, p_modified_at, 0, candidate
      );
      return query
        select saved.state, saved.modified_at, saved.updated_at, saved.reset_version
        from public.pfh_progress as saved
        where saved.user_id = player;
      return;
    exception when unique_violation then
      get stacked diagnostics conflict_constraint = constraint_name;
      if conflict_constraint <> 'pfh_progress_workstation_id_key' then
        raise;
      end if;
    end;
  end loop;

  raise exception 'Workstation ID space exhausted' using errcode = '54000';
end;
$$;

create or replace function pfh_private.reset_progress(
  p_state jsonb,
  p_expected_reset_version integer
)
returns table (state jsonb, modified_at timestamptz, updated_at timestamptz, reset_version integer)
language plpgsql security definer set search_path = '' as $$
declare
  player uuid := auth.uid();
  assigned text;
  preferred text;
  candidate text;
  canonical_state jsonb;
  random_start integer;
  candidate_offset integer;
  candidate_index integer;
  conflict_constraint text;
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

  select saved.workstation_id into assigned
  from public.pfh_progress as saved
  where saved.user_id = player;

  if found then
    canonical_state := jsonb_set(
      p_state - 'settings',
      '{workstationId}',
      to_jsonb(assigned),
      true
    );
    -- Keep the allocation while clearing gameplay. Repeated requests for one
    -- reset version remain idempotent.
    insert into public.pfh_progress as existing (
      user_id, state, modified_at, reset_version, workstation_id
    ) values (
      player, canonical_state, now(), 1, assigned
    )
    on conflict (user_id) do update
      set state = excluded.state,
          modified_at = excluded.modified_at,
          updated_at = now(),
          reset_version = existing.reset_version + 1
      where existing.reset_version = p_expected_reset_version;
    return query
      select saved.state, saved.modified_at, saved.updated_at, saved.reset_version
      from public.pfh_progress as saved
      where saved.user_id = player;
    return;
  end if;

  preferred := p_state->>'workstationId';
  if preferred ~ '^[A-Z]–(00[1-9]|0[1-9][0-9]|[1-9][0-9]{2})$' then
    canonical_state := jsonb_set(
      p_state - 'settings',
      '{workstationId}',
      to_jsonb(preferred),
      true
    );
    begin
      insert into public.pfh_progress (
        user_id, state, modified_at, reset_version, workstation_id
      ) values (
        player, canonical_state, now(), 1, preferred
      );
      return query
        select saved.state, saved.modified_at, saved.updated_at, saved.reset_version
        from public.pfh_progress as saved
        where saved.user_id = player;
      return;
    exception when unique_violation then
      get stacked diagnostics conflict_constraint = constraint_name;
      if conflict_constraint <> 'pfh_progress_workstation_id_key' then
        raise;
      end if;
    end;
  end if;

  random_start := floor(random() * 25974)::integer;
  for candidate_offset in 0..25973 loop
    candidate_index := (random_start + candidate_offset) % 25974;
    candidate := chr(65 + candidate_index / 999)
      || '–'
      || lpad(((candidate_index % 999) + 1)::text, 3, '0');
    canonical_state := jsonb_set(
      p_state - 'settings',
      '{workstationId}',
      to_jsonb(candidate),
      true
    );
    begin
      insert into public.pfh_progress (
        user_id, state, modified_at, reset_version, workstation_id
      ) values (
        player, canonical_state, now(), 1, candidate
      );
      return query
        select saved.state, saved.modified_at, saved.updated_at, saved.reset_version
        from public.pfh_progress as saved
        where saved.user_id = player;
      return;
    exception when unique_violation then
      get stacked diagnostics conflict_constraint = constraint_name;
      if conflict_constraint <> 'pfh_progress_workstation_id_key' then
        raise;
      end if;
    end;
  end loop;

  raise exception 'Workstation ID space exhausted' using errcode = '54000';
end;
$$;

commit;
