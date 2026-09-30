-- Publicly playable content. Player drafts and statistics remain in pfh_progress.state.
create table public.pfh_bug_hunts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 100),
  revision integer not null default 1 check (revision > 0),
  title text not null check (length(btrim(title)) between 1 and 120),
  brief text not null check (length(btrim(brief)) between 1 and 4000),
  starter_files jsonb not null check (
    jsonb_typeof(starter_files) = 'object'
    and starter_files ? 'App.tsx'
    and jsonb_typeof(starter_files->'App.tsx') = 'string'
    and octet_length(starter_files::text) <= 256000
  ),
  test_code text not null check (length(btrim(test_code)) between 1 and 32000),
  "publishDateTime" timestamptz check ("publishDateTime" is null or isfinite("publishDateTime")),
  created_at timestamptz not null default now()
);
comment on column public.pfh_bug_hunts."publishDateTime" is 'NULL is an unpublished draft; otherwise visible at this UTC instant. No cron job or redeploy required.';
comment on column public.pfh_bug_hunts.test_code is 'JavaScript test(label, async ({root, assert, click, input}) => {...}) registrations. Runs only in the sandboxed browser preview.';
create index pfh_bug_hunts_publication_idx on public.pfh_bug_hunts ("publishDateTime" desc, id);
alter table public.pfh_bug_hunts enable row level security;
revoke all on public.pfh_bug_hunts from public, anon, authenticated;
grant select on public.pfh_bug_hunts to anon, authenticated;
grant all on public.pfh_bug_hunts to service_role;
create policy "Only published bug hunts are playable"
  on public.pfh_bug_hunts for select to anon, authenticated
  using ("publishDateTime" <= (select now()));

-- Corrections create a new attempt namespace automatically, preserving the old statistics.
create function pfh_private.revise_bug_hunt() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.starter_files is distinct from old.starter_files
    or new.test_code is distinct from old.test_code then
    new.revision := old.revision + 1;
  else
    new.revision := old.revision;
  end if;
  return new;
end;
$$;
revoke all on function pfh_private.revise_bug_hunt() from public, anon, authenticated;
create trigger revise_bug_hunt before update on public.pfh_bug_hunts
  for each row execute function pfh_private.revise_bug_hunt();

insert into public.pfh_bug_hunts (slug, title, brief, starter_files, test_code, "publishDateTime") values (
  'the-coffee-counter',
  'The coffee counter',
  E'The office coffee counter has gone rogue. Three bugs are hiding in these two files.\n\nIt should start at 0 cups. Add coffee should add one cup each time. Remove coffee should subtract one cup, but never go below zero. Reset should always return the count to zero.\n\nKeep the existing button labels and data-testid attributes so the checks can use the counter. Fix the behavior, then run the checks.',
  jsonb_build_object(
    'App.tsx', $code$import { CoffeeOrder } from "./CoffeeOrder";

export default function App() {
  return <section><h1>Office coffee</h1><CoffeeOrder /></section>;
}
$code$,
    'CoffeeOrder.tsx', $code$import { useState } from "react";

export function CoffeeOrder() {
  const [cups, setCups] = useState(0);
  return <section>
    <p data-testid="cups">{cups} cups</p>
    <button data-testid="add" onClick={() => setCups(cups - 1)}>Add coffee</button>
    <button data-testid="remove" onClick={() => setCups(cups - 1)}>Remove coffee</button>
    <button data-testid="reset" onClick={() => setCups(1)}>Reset</button>
  </section>;
}
$code$),
  $tests$const cups = root => root.querySelector('[data-testid="cups"]')?.textContent;
test("Start with an empty order", ({root, assert}) => {
  assert(cups(root) === "0 cups", "The order should start at 0 cups.");
});
test("Add one cup on every click", async ({root, assert, click}) => {
  await click('[data-testid="add"]');
  assert(cups(root) === "1 cups", "One click should add one cup.");
  await click('[data-testid="add"]');
  assert(cups(root) === "2 cups", "Two clicks should add two cups.");
});
test("Remove cups without going below zero", async ({root, assert, click}) => {
  await click('[data-testid="remove"]');
  assert(cups(root) === "0 cups", "An empty order must stay at zero.");
  await click('[data-testid="add"]');
  await click('[data-testid="add"]');
  await click('[data-testid="remove"]');
  assert(cups(root) === "1 cups", "Removing from two cups should leave one.");
});
test("Reset clears an order", async ({root, assert, click}) => {
  await click('[data-testid="add"]');
  await click('[data-testid="add"]');
  await click('[data-testid="reset"]');
  assert(cups(root) === "0 cups", "Reset should leave zero cups.");
});
$tests$,
  now()
);
