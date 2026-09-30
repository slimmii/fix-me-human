-- Edit this template in the Supabase SQL Editor. NULL keeps the hunt unpublished.
-- Use a distinct slug for each new case. Only administrators author content.
insert into public.pfh_bug_hunts (
  slug, title, brief, starter_files, test_code, "publishDateTime"
) values (
  'one-click-too-many',
  'One click too many',
  'The counter should start at zero and increase by one each click. Keep the data-testid attributes so the checks can operate it.',
  jsonb_build_object('App.tsx', $code$
import { useState } from "react";
export default function App() {
  const [count, setCount] = useState(0);
  return <section>
    <h1>Office counter</h1>
    <p data-testid="count">{count}</p>
    <button data-testid="add" onClick={() => setCount(count + 2)}>Add one</button>
  </section>;
}
$code$),
  $tests$
test("Starts at zero", ({root, assert}) => {
  assert(root.querySelector('[data-testid="count"]')?.textContent === "0", "Start at zero.");
});
test("Adds exactly one per click", async ({root, assert, click}) => {
  for (let expected = 1; expected <= 3; expected++) {
    await click('[data-testid="add"]');
    assert(root.querySelector('[data-testid="count"]')?.textContent === String(expected),
      "Each click should add exactly one.");
  }
});
$tests$,
  null
);
-- When ready, schedule this draft with an explicit timezone:
-- update public.pfh_bug_hunts set "publishDateTime" = '2026-10-05T09:00:00+02:00'
-- where slug = 'one-click-too-many';
