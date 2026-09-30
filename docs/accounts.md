# GitHub accounts and cloud progress

Accounts are optional. Guests keep playing with the existing browser save. GitHub
authentication adds a unique game username and progress synchronization, including
bug hunt drafts and statistics. See [Bug hunts](bug-hunts.md) for authoring and scheduling.

## Configure the existing project

Project reference: `vgqgbkvrdcgpgzhbdifl`.

### Setup status (2026-09-20)

- Applied the prepared accounts migration to the hosted project. Supabase recorded
  version `20260920124738`; the local migration filename matches that version to
  prevent a future CLI push from applying it again. The migration SQL is unchanged.
- Configured the project URL and public publishable key in ignored `.env.local`.
- Verified the hosted progress RPC in a rolled-back transaction: newer saves win,
  equal/older saves cannot overwrite them, device settings are excluded, and
  cross-account reads, direct progress writes, and anonymous access are denied.
  The Supabase security advisor returned no findings.
- GitHub OAuth is enabled. The live authorize endpoint redirects to GitHub with
  the correct Supabase callback and only the `user:email` scope. Set and verified
  the Site URL and exact allowed redirect as `http://localhost:5173/`. The actual
  game sign-in reaches GitHub’s consent page for Fix Me Human. User consent, the
  callback/code exchange, and authenticated cross-device smoke tests remain
  pending; mocked account tests do not establish these.
- Production hosting is not configured in this repository. Production build
  variables and return URLs require the intended host and production origin.
- Verification passed: 143 unit tests, the disposable PostgreSQL suite (including
  concurrent writes and username claims), all 12 mocked account browser tests,
  and the production build. The built bundle includes the public configuration.
  Formatting still reports existing issues in `src/computer/Snake.tsx` and
  `component-props-1.md`, `react-basics-1.md`, and `react-basics-2.md` under
  `src/course/scrum-board/`.
- Full gameplay browser regression: 69 passed, 2 failed. The editor scroll test
  at `tests/browser/editor.spec.ts:251` observed a 121px step (limit 100px).
  The unresponsive-preview test at `tests/browser/office-clock.spec.ts:121`
  never saw its expected error; the captured preview ran successfully instead.
  These remain unresolved; the full verification suite is not green.

### Configuration steps

1. Apply `supabase/migrations/20260920124738_accounts_and_progress.sql` in the
   project's SQL editor, or link the Supabase CLI to this project and run
   `supabase db push`. The migration creates dedicated `pfh_profiles` and
   `pfh_progress` tables and the `pfh_sync_progress` function, backed by an
   authenticated helper in the non-exposed `pfh_private` schema. Review the migration
   before applying it to an existing database. Unrelated tables are untouched.
2. Register a GitHub OAuth application for PLEASE FIX, HUMAN. Its authorization
   callback URL must be
   `https://vgqgbkvrdcgpgzhbdifl.supabase.co/auth/v1/callback`.
3. Enable GitHub under Supabase Authentication → Sign In / Providers. Enter the
   GitHub client ID and client secret **only in Supabase**. Repository permissions
   are not required.
4. Set Supabase Authentication → URL Configuration → Site URL to the production
   app's origin. Add the exact app return URLs to Redirect URLs: development uses
   `http://localhost:5173/`; add the production origin followed by `/`, and any
   intentional preview URLs. GitHub's callback points to Supabase, while these
   return URLs point to the game.
5. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_PUBLISHABLE_KEY` to the
   project's publishable key from Supabase project settings. The supplied project
   URL is `https://vgqgbkvrdcgpgzhbdifl.supabase.co`. Both variables are public
   frontend configuration; never put a service-role key or GitHub secret in a
   `VITE_` variable. Configure the same variables in the production build system
   and rebuild/restart Vite after changes.

Without configuration, the app still starts, explains that sign-in is unavailable,
and supports guest play. No actual hosted project configuration or OAuth smoke
test is implied by the presence of these files.

## Player data and conflict behavior

### Removing account progress

Open your profile and choose **Remove all progress**, then confirm. Turn on
**Also clear my guest save** to also remove this browser's guest progress, sync
metadata, and backup after the account reset succeeds. The toggle defaults to off
and resets when you cancel. Guest saves on other browsers are unaffected.

This replaces the account's cloud save with an empty starting state and clears the account save
and backup on the current device. It preserves the username, GitHub identity,
device settings, and (unless the toggle is enabled) the independent guest save.
An internet connection is required; an unconfirmed reset shows an error and can
be retried.

Migration `20260920142508_account_progress_reset.sql` is applied to the hosted
project. It adds the authenticated `pfh_reset_progress` RPC and a monotonically
increasing `reset_version`. Sync requests include the version they last received;
stale devices cannot overwrite a reset even with newer timestamps. Other devices
discard pre-reset progress and backups when they next sync. Older app builds
cannot upload again after a reset until upgraded. A minimal empty save and version
remain in the database to prevent erased data from being recreated automatically.

Reset verification: 147 unit tests, all 13 account browser tests, the disposable
PostgreSQL tests, and the production build passed. Hosted transactional checks of
reset, stale-client rejection, idempotence, and access restrictions passed with
all fixtures rolled back. No real player progress was reset during setup.
Guest-toggle verification: all 21 progress-store tests, all 14 account browser
tests, and the production build passed, including sign-out, reload, cancellation,
keyboard use, failed resets, and blocked browser storage.
The security advisor found no new database issues; its existing
[leaked-password protection warning](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
is unchanged.

### Normal synchronization

- The original `please-fix-human:v4` save remains the guest save. Each account uses
  `please-fix-human:v4:account:<user-id>`. Signing out restores the guest save;
  switching accounts never imports the previous account's progress.
- First sign-in compares the independent guest save with any cached account save,
  then reconciles with Supabase. The latest gameplay change wins as a complete
  snapshot. Equal timestamps favor the cloud. Code files are not merged.
- Game saves retain projects, drafts, completion, active assignment, paper and
  dialogue state, workstation identity, and checkpointed office time. Device
  settings stay in local storage. Snake high scores remain local.
- Local saves happen immediately. Cloud writes wait one second after the last
  edit; reconciliation also runs on reconnect, focus, and every 30 seconds while
  visible. A failed request leaves local edits pending. A browser closed before
  an upload finishes may require reopening it to complete synchronization.
- Modification times represent gameplay changes, not upload time. Clock ticks,
  downloads, settings changes, and loading a save never make it newer. Existing
  saves without modification metadata use the Unix epoch, importing when no cloud
  save exists. A timestamped cloud save wins over those legacy saves.
- Conflict ordering uses device UTC timestamps. Computers should use automatic
  time synchronization; a badly incorrect system clock can affect which save wins.
- Before a differing save is replaced, one backup is retained locally at the
  account save key plus `:backup`. This is a recovery snapshot, not a history or
  automatic merge feature. Storage errors still permit session-only play.
- Usernames are normalized to lowercase and must match `[a-z0-9_]{3,20}`. The
  database owns uniqueness. Usernames cannot be renamed in this release.
- Authenticated users can read only their own profile/save and insert their own
  profile. All progress writes go through the atomic RPC. Anonymous access is
  denied. Deleting an Auth user cascades to their profile and cloud progress.

## Verification

```sh
npm test
npm run test:database
npm run test:accounts
npm run test:browser
npm run format:check
npm run build
```

`test:database` requires Docker. It starts and removes an isolated PostgreSQL 17
container, supplies minimal Supabase Auth roles, and tests the real SQL migration,
row policies, username races, and concurrent save ordering. The bootstrap fixture
is for this disposable database only; do not apply it to Supabase.

`test:accounts` starts a separate Vite server on port 5174 with test-only public
configuration. Playwright intercepts its Supabase requests, including the PKCE
redirect/code exchange, and tests onboarding, duplicate names, cancellation,
account controls while coding, and two-browser synchronization. It does not
contact the real project or GitHub. Gameplay regression tests start with the
optional invitation already dismissed.

Before release, verify the actual provider/redirect configuration and run this
manual smoke test against the hosted project:

1. In a clean browser, skip sign-in, print an assignment, and write some code.
2. Sign in using GitHub; verify the consent page and return to the app. Choose a
   unique username and confirm the profile reports **Synced**.
3. In a separate browser profile or computer, sign into the same GitHub account.
   Verify the username is not requested again and the code/assignment resume.
4. Edit there, then refocus the first browser and confirm the latest code appears.
5. Work offline, reconnect, and check that the pending save syncs. Sign out and
   confirm that the independent guest save is restored.
6. Sign in with another GitHub account and verify the first account's username is
   rejected and its private progress is inaccessible.

Provider reference: [Supabase GitHub sign-in](https://supabase.com/docs/guides/auth/social-login/auth-github).
