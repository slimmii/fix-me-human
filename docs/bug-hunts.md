# Bug hunts

Click the **WANTED** poster on the office wall, or open **Bug hunts** from the
computer's desktop. The wanted board lists the newest case first and keeps older
cases playable. Each case has the same starting files and verification tests for
every player. There is no leaderboard or attendance requirement.

Open a case, read its brief, and choose **Start hunt**. Use **File → Open** to switch
files. F5 compiles the project and runs the tests in the preview. **Brief & results**
shows the individual checks and your statistics. The first passing run marks the
case solved automatically. Reopening a solved hunt is practice-only: you can edit
and run the code, but its original statistics and completion date stay unchanged.
The editor and browser alternate within the CRT. Hunt navigation shares the
editor menu row or the browser navigation row. Run feedback appears in a
dismissible overlay; expand **Check details** to inspect the checks without
leaving the preview. Dismissing feedback keeps the preview at the same size, and
**Brief & results** retains the latest results.

Code edits still save; practice check results are shown for the current visit
without replacing the recorded solve results.

## Authoring and scheduling

Content lives in `public.pfh_bug_hunts` in Supabase project `vgqgbkvrdcgpgzhbdifl`.
Use the Supabase SQL Editor or Table Editor as a project administrator. Players
cannot create or edit hunt definitions.

Start with [the SQL template](../supabase/bug-hunts/template.sql). Replace its slug,
title, brief, starter files and JavaScript tests. It creates an unpublished draft.
The migration includes **The coffee counter**, a published two-file hunt with three
bugs and four behavioral tests, as a working example.

| Column            | Meaning                                                               |
| ----------------- | --------------------------------------------------------------------- |
| `id`              | Generated UUID; do not change it after players start                  |
| `slug`            | Unique lowercase identifier, such as `the-coffee-counter`             |
| `title`, `brief`  | Title and plain-text instructions; explain expected behavior          |
| `starter_files`   | JSON object mapping filenames to source code, including `App.tsx`     |
| `test_code`       | JavaScript registering the verification tests described below         |
| `publishDateTime` | Blank/NULL for a draft, or an exact publication instant with timezone |
| `revision`        | Automatically incremented when starter files or tests change          |

To schedule a draft, run this with the intended date and timezone:

```sql
update public.pfh_bug_hunts
set "publishDateTime" = '2026-10-05T09:00:00+02:00'
where slug = 'your-hunt-slug';
```

Use `now()` to publish immediately. Future rows and drafts are hidden by database
row-level security from **both guests and signed-in players**, including direct
requests for their code or tests. No cron job or frontend redeploy is needed.
The board refreshes on opening. Its first page also refreshes on window focus and
every minute; browsing further into the archive is left undisturbed. Use Refresh
to return to the latest cases. Dates shown on the board use the player's locale.

Editing a published hunt's starter files or tests automatically creates a new
revision. The new revision starts fresh; previous drafts and statistics remain in
the player's save under the old revision. Title/brief corrections retain the
current revision. Prefer reviewing and testing content in a local or staging
project before publication. Changing the publication time to NULL withdraws a
hunt from new requests; code already loaded by a player cannot be recalled.

## Test code

Tests are JavaScript (not TSX) using `test(label, callback)`. The runner remounts
the React app before each test and restores a clean preview afterwards. The
callback receives:

- `root`: the mounted app's DOM element, for selectors and assertions.
- `assert(condition, message)`: fails this check with a useful explanation.
- `await click(selector)`: clicks an element and waits for React to update.
- `await input(selector, value)`: changes an input and waits for React to update.

```js
test("Add coffee increases the count", async ({ root, assert, click }) => {
  await click('[data-testid="add"]');
  assert(
    root.querySelector('[data-testid="cups"]')?.textContent === "1 cups",
    "Adding one coffee should leave one cup.",
  );
});
```

Register at least one test, at most 100, synchronously. Await asynchronous work
inside callbacks. Use stable selectors and explain any attributes/labels players
must preserve in the brief. Test behavior and edge cases instead of matching a
specific implementation. Empty suites and malformed test code cannot pass.

Starter files use the existing React toolbox: up to 32 flat `.ts`, `.tsx`, `.js`
or `.jsx` files, no more than 16,000 characters each; `App.tsx` exports a React
component. Local imports and React are supported, not arbitrary npm packages.
The total starter JSON is limited to 256 KB and test scripts to 32,000 characters.

The source and tests execute inside the existing `sandbox="allow-scripts"`
preview, with an opaque origin, no account credentials, and a CSP blocking network
requests. Test code never executes in the main app or on the database server.
Published test code is downloadable and player statistics are client-reported;
this is a practice mode, not a trusted competitive scoring system. A future
leaderboard would need server-side verification.

## Player data

Save version 4 now has an optional-on-read `bugHunts` map. Keys are
`<hunt UUID>:<revision>`. Existing saves load with an empty map. Each entry holds:

- All edited files and the selected file.
- First-started, last-run and first-completed timestamps.
- Runs started, successful runs, failed-check runs, compile errors, runtime errors
  and timeouts. An interrupted run counts as started without a finished outcome.
- Total run duration (including the brief result-display delay), and the latest
  check results/error message. This does not measure time spent solving or editing.

Statistics freeze at the first successful solve. Practice runs do not change any
of these counters, run timestamps, duration, recorded results, or the office's
bug counter. Existing solved saves keep the statistics they already contain.

Guest data stays in the guest save. Signed-in data uses the existing
`pfh_progress.state` synchronization, account isolation and reset protection. An
empty cloud account imports the guest save under the existing sync rules. Hunt
data does not unlock lessons or modify course drafts. **Remove all progress**
also clears hunt data; the guest toggle retains its existing meaning.

The current sync model still chooses the newer entire save; it does not merge
simultaneous edits from multiple devices. There is no individual run event log.

## Verification

Migration `20260920160302_bug_hunts.sql` is applied to the hosted project. The
publication and permission checks also passed there in a rolled-back transaction.
The live progress RPC also retained hunt drafts and counters in a rolled-back
fixture check. No real player saves were changed by those checks. The database security advisor
reported no new findings; the existing [leaked-password protection notice](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
remains unrelated to this GitHub-only feature.

- `npm test -- --maxWorkers=2`: compiler, saves, hunt stats and account sync/reset.
- `npm run test:database`: migrations, publication boundary/draft/future visibility,
  forbidden player writes, revision handling, and existing account policies.
- `PFH_ACCOUNT_TEST_PORT=5184 npm run test:accounts`: repair workflow, archive,
  error recovery, reload, cloud sync and account regression tests (mock backend).
- `npm run build`: type checking and production bundle.
