update public.pfh_bug_hunts
set
  brief = brief || E'\n\nNote: when an item''s amount reaches 0, remove its line from the cart.',
  test_code = test_code || $test$

test("Decreasing the last item to zero removes its line", async ({
  root,
  assert,
  click,
}) => {
  await click('[data-testid="add-coffee"]');
  await click('[data-testid="minus-coffee"]');
  assert(
    root.querySelector('[data-testid="line-coffee"]') === null,
    "An item at quantity 0 should be removed from the cart.",
  );
});
$test$
where slug = 'the-copy-counter'
  and test_code not like '%Decreasing the last item to zero removes its line%';
