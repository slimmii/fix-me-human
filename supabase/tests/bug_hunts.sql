begin;
insert into public.pfh_bug_hunts(slug,title,brief,starter_files,test_code,"publishDateTime")
values
  ('test-hunt-past','Past','Test','{"App.tsx":""}','test("x", () => {})',now() - interval '1 year'),
  ('test-hunt-boundary','Boundary','Test','{"App.tsx":""}','test("x", () => {})',now()),
  ('test-hunt-future','Future','Test','{"App.tsx":""}','test("x", () => {})',now() + interval '1 day'),
  ('test-hunt-draft','Draft','Test','{"App.tsx":""}','test("x", () => {})',null);
set local role anon;
do $$ begin
  if (select count(*) from public.pfh_bug_hunts where slug like 'test-hunt-%') <> 2 then
    raise exception 'Guest publication policy failed';
  end if;
  if exists (select 1 from public.pfh_bug_hunts where slug in ('test-hunt-draft','test-hunt-future')) then
    raise exception 'Unpublished code or tests are readable';
  end if;
  begin
    update public.pfh_bug_hunts set title='Tampered' where slug='test-hunt-past';
    raise exception 'Guest update was allowed';
  exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
do $$ begin
  if (select count(*) from public.pfh_bug_hunts where slug like 'test-hunt-%') <> 2 then
    raise exception 'Signed-in publication policy failed';
  end if;
  begin
    delete from public.pfh_bug_hunts where slug='test-hunt-past';
    raise exception 'Player delete was allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.pfh_bug_hunts(slug,title,brief,starter_files,test_code)
      values ('test-hunt-spam','Spam','Spam','{"App.tsx":""}','spam');
    raise exception 'Player insert was allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.pfh_bug_hunts set test_code='test("corrected", () => {})' where slug='test-hunt-past';
do $$ begin
  if (select revision from public.pfh_bug_hunts where slug='test-hunt-past') <> 2 then
    raise exception 'Corrections must start a new revision';
  end if;
end $$;
update public.pfh_bug_hunts set title='Corrected title',revision=99 where slug='test-hunt-past';
do $$ begin
  if (select revision from public.pfh_bug_hunts where slug='test-hunt-past') <> 2 then
    raise exception 'Copy edits should preserve progress';
  end if;
end $$;
rollback;
