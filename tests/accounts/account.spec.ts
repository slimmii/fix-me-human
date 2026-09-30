import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { useSimpleComputer } from "../fixtures/simple-computer";
import { startAssignmentPrint } from "../fixtures/story";
import { fresh, KEY } from "../../src/progression";
import { coffeeHunt } from "../fixtures/bug-hunts";
import {
  snapshot,
  type ProgressSnapshot,
} from "../../src/account/progress-store";

const origin = `http://localhost:${process.env.PFH_ACCOUNT_TEST_PORT ?? 5174}`;
const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
const AUTH_KEY = "sb-pfh-test-auth-token";
function session(id = alice) {
  const user = {
    id,
    aud: "authenticated",
    role: "authenticated",
    email: "test@example.invalid",
    app_metadata: { provider: "github", providers: ["github"] },
    user_metadata: { user_name: "Human-Tester" },
    created_at: new Date().toISOString(),
  };
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return {
    user,
    access_token: `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, exp: expires, role: "authenticated" })}.test`,
    refresh_token: "test-refresh",
    expires_at: expires,
    expires_in: 3600,
    token_type: "bearer",
  };
}
async function seed(page: Page, id = alice) {
  await page.addInitScript(
    ({ key, value }) => {
      if (
        window === window.top &&
        !localStorage.getItem("account-test-seeded")
      ) {
        localStorage.setItem(key, JSON.stringify(value));
        localStorage.setItem("account-test-seeded", "true");
      }
    },
    { key: AUTH_KEY, value: session(id) },
  );
}
function backend() {
  const profiles = new Map<string, string>();
  const progress = new Map<string, ProgressSnapshot>();
  let offline = false;
  let oauthCancelled = false;
  let tokenRejected = false;
  let authRequests = 0;
  let pkceExchanged = false;
  let writes = 0;
  const row = (value: ProgressSnapshot) => ({
    state: value.save,
    modified_at: new Date(value.modifiedAt).toISOString(),
    updated_at: new Date().toISOString(),
    reset_version: value.resetVersion ?? 0,
  });
  async function install(context: BrowserContext) {
    await context.route("https://pfh-test.supabase.co/**", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const headers = {
        "access-control-allow-origin": origin,
        "access-control-allow-headers": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
      };
      const json = (body: unknown, status = 200) =>
        route.fulfill({
          status,
          headers,
          contentType: "application/json",
          body: JSON.stringify(body),
        });
      if (request.method() === "OPTIONS")
        return route.fulfill({ status: 204, headers });
      if (url.pathname.includes("/auth/")) {
        authRequests++;
        if (url.pathname.endsWith("/authorize")) {
          expect(url.searchParams.get("provider")).toBe("github");
          expect(url.searchParams.get("code_challenge")).toBeTruthy();
          expect(url.searchParams.get("code_challenge_method")).toBe("s256");
          return route.fulfill({
            status: 302,
            headers: {
              location: `${origin}/${oauthCancelled ? "?error=access_denied" : "?code=valid-code"}`,
            },
            body: "",
          });
        }
        if (url.pathname.endsWith("/token")) {
          if (tokenRejected)
            return json(
              { error: "invalid_grant", error_description: "Expired code" },
              400,
            );
          pkceExchanged = !!request.postDataJSON().code_verifier;
          return json(session());
        }
        if (url.pathname.endsWith("/user")) return json(session().user);
        if (url.pathname.endsWith("/logout")) return json({});
      }
      if (offline) return json({ message: "offline" }, 503);
      const token = request.headers().authorization?.replace("Bearer ", "");
      const userId = token?.includes(".")
        ? (JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString())
            .sub as string)
        : "";
      if (url.pathname.endsWith("/pfh_profiles")) {
        if (request.method() === "POST") {
          const name = request.postDataJSON().username;
          if (profiles.has(userId) || [...profiles.values()].includes(name))
            return json({ code: "23505", message: "duplicate username" }, 409);
          profiles.set(userId, name);
          return json({ username: name }, 201);
        }
        return json(
          profiles.has(userId) ? [{ username: profiles.get(userId) }] : [],
        );
      }
      if (url.pathname.endsWith("/pfh_progress"))
        return json(progress.has(userId) ? [row(progress.get(userId)!)] : []);
      if (url.pathname.endsWith("/pfh_reset_progress")) {
        const body = request.postDataJSON();
        const previous = progress.get(userId);
        if ((previous?.resetVersion ?? 0) === body.p_expected_reset_version)
          progress.set(userId, {
            save: body.p_state,
            modifiedAt: Date.now(),
            resetVersion: (previous?.resetVersion ?? 0) + 1,
          });
        return json([row(progress.get(userId)!)]);
      }
      if (url.pathname.endsWith("/pfh_sync_progress")) {
        writes++;
        const body = request.postDataJSON();
        const next = {
          save: body.p_state,
          modifiedAt: Date.parse(body.p_modified_at),
          resetVersion: body.p_reset_version ?? 0,
        };
        const previous = progress.get(userId);
        if (
          !previous ||
          (next.resetVersion === (previous.resetVersion ?? 0) &&
            next.modifiedAt > previous.modifiedAt)
        )
          progress.set(userId, next);
        return json([row(progress.get(userId)!)]);
      }
      return json({ message: `Unmocked request: ${url.pathname}` }, 500);
    });
  }
  return {
    profiles,
    progress,
    install,
    setOffline: (value: boolean) => {
      offline = value;
    },
    cancelOAuth: () => {
      oauthCancelled = true;
    },
    rejectToken: () => {
      tokenRejected = true;
    },
    counts: () => ({ authRequests, pkceExchanged, writes }),
  };
}
test.beforeEach(async ({ page }) => {
  await useSimpleComputer(page);
});

test("a signed-in hunt run syncs its code and statistics and survives a fresh device", async ({
  page,
  context,
  browser,
}) => {
  const api = backend();
  api.profiles.set(alice, "human_tester");
  await api.install(context);
  await context.route("**/rest/v1/pfh_bug_hunts?*", (route) =>
    route.fulfill({
      json: new URL(route.request().url()).searchParams.has("id")
        ? coffeeHunt
        : [coffeeHunt],
    }),
  );
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "WANTED: Open bug hunts" }).click();
  await page
    .getByRole("button", {
      name: "Open bug hunt: The coffee counter",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Start hunt", exact: true }).click();
  await page
    .frameLocator('iframe[title="Code editor"]')
    .getByRole("textbox", { name: "Your React code" })
    .press("F5");
  const key = `${coffeeHunt.id}:1`;
  await expect
    .poll(() => api.progress.get(alice)?.save.bugHunts[key]?.failedRuns)
    .toBe(1);
  expect(api.progress.get(alice)?.save.bugHunts[key]?.runs).toBe(1);
  expect(api.progress.get(alice)?.save.bugHunts[key]?.project.files).toEqual(
    coffeeHunt.starter_files,
  );
  const second = await browser.newContext();
  try {
    await api.install(second);
    await second.route("**/rest/v1/pfh_bug_hunts?*", (route) =>
      route.fulfill({
        json: new URL(route.request().url()).searchParams.has("id")
          ? coffeeHunt
          : [coffeeHunt],
      }),
    );
    const device = await second.newPage();
    await useSimpleComputer(device);
    await seed(device);
    await device.goto(origin);
    await expect(device.getByRole("dialog")).toHaveCount(0);
    await device
      .getByRole("button", { name: "WANTED: Open bug hunts" })
      .click();
    await expect(
      device.getByRole("button", {
        name: "Open bug hunt: The coffee counter",
        exact: true,
      }),
    ).toContainText("1 runs");
    await device
      .getByRole("button", {
        name: "Open bug hunt: The coffee counter",
        exact: true,
      })
      .click();
    await expect(
      device.getByRole("region", { name: "Latest check results" }),
    ).toContainText("One click should add one cup");
  } finally {
    await second.close();
  }
});

test("removing account progress requires confirmation, handles offline failure, and stays reset after reload", async ({
  page,
  context,
}) => {
  const api = backend();
  api.profiles.set(alice, "human_tester");
  const saved = fresh();
  saved.drafts["board-shell"] = "// personal code";
  saved.completed = ["board-shell"];
  api.progress.set(alice, snapshot(saved, 1000));
  await api.install(context);
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open profile" }).click();
  await page
    .getByRole("button", { name: "Remove all progress", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("It cannot be undone");
  await expect(
    page.getByRole("switch", { name: "Also clear my guest save" }),
  ).not.toBeChecked();
  await expect(
    page.getByRole("button", { name: "Keep my progress" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Keep my progress" }).click();
  expect(api.progress.get(alice)?.save.drafts["board-shell"]).toBe(
    "// personal code",
  );
  await page
    .getByRole("button", { name: "Remove all progress", exact: true })
    .click();
  api.setOffline(true);
  await page.getByRole("button", { name: "Yes, remove all progress" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "reset could not be confirmed",
  );
  expect(api.progress.get(alice)?.save.completed).toEqual(["board-shell"]);
  api.setOffline(false);
  await page.screenshot({
    path: "test-results/account-reset-confirmation.png",
  });
  await page.getByRole("button", { name: "Yes, remove all progress" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Your account progress has been removed",
  );
  expect(api.progress.get(alice)?.save.drafts).toEqual(fresh().drafts);
  expect(api.progress.get(alice)?.save.completed).toEqual([]);
  expect(api.profiles.get(alice)).toBe("human_tester");
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open profile" }).click();
  await expect(page.getByRole("dialog")).toContainText("Synced");
  expect(api.progress.get(alice)?.save.drafts).toEqual(fresh().drafts);
});

test("guest-reset toggle is optional, resets on cancellation, and clears guest progress on confirmation", async ({
  page,
  context,
}) => {
  const api = backend();
  api.profiles.set(alice, "human_tester");
  await api.install(context);
  await seed(page);
  await page.addInitScript(
    ({ key, save }) => {
      if (!localStorage.getItem("guest-reset-seeded")) {
        localStorage.setItem(key, JSON.stringify(save));
        localStorage.setItem(`${key}:backup`, "guest backup");
        localStorage.setItem("guest-reset-seeded", "true");
      }
    },
    {
      key: KEY,
      save: { ...fresh(), drafts: { "board-shell": "// guest code" } },
    },
  );
  await page.goto("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open profile" }).click();
  const remove = page.getByRole("button", {
    name: "Remove all progress",
    exact: true,
  });
  const toggle = page.getByRole("switch", { name: "Also clear my guest save" });
  await remove.click();
  await expect(toggle).not.toBeChecked();
  await toggle.check();
  await page.getByRole("button", { name: "Keep my progress" }).click();
  await remove.click();
  await expect(toggle).not.toBeChecked();
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).toBeChecked();
  await page.setViewportSize({ width: 640, height: 480 });
  await toggle.scrollIntoViewIfNeeded();
  await page.screenshot({ path: "test-results/guest-reset-toggle.png" });
  await page.getByRole("button", { name: "Yes, remove all progress" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "this browser’s guest save have been removed",
  );
  expect(
    await page.evaluate(
      (key) => [
        localStorage.getItem(key),
        localStorage.getItem(`${key}:backup`),
      ],
      KEY,
    ),
  ).toEqual([null, null]);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).drafts,
      KEY,
    ),
  ).toEqual(fresh().drafts);
  await page.reload();
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).drafts,
      KEY,
    ),
  ).toEqual(fresh().drafts);
});

test("B.U.G. introduces himself; skipping is remembered and printing stays explicit", async ({
  page,
  context,
}) => {
  const api = backend();
  await api.install(context);
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Welcome, human." });
  await expect(dialog).toContainText("I’m B.U.G.");
  await expect(dialog).toContainText("course progress and bug hunts");
  await page.screenshot({ path: "test-results/account-introduction.png" });
  await page
    .getByRole("button", { name: "Continue without signing in" })
    .click();
  expect(api.counts().authRequests).toBe(0);
  await expect(
    page.getByRole("button", { name: /^Grab new assignment/ }),
  ).toHaveCount(0);
  await startAssignmentPrint(page);
  await expect(
    page.getByRole("button", { name: /^Grab new assignment/ }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeFocused();
  await page.screenshot({ path: "test-results/account-guest.png" });
});

test("GitHub PKCE login asks for a unique normalized username and survives reload", async ({
  page,
  context,
}) => {
  const api = backend();
  api.profiles.set(bob, "taken_name");
  await api.install(context);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Sign in with GitHub", exact: true })
    .click();
  const name = page.getByRole("textbox", { name: "Username", exact: true });
  await expect(name).toHaveValue("human_tester");
  expect(api.counts().pkceExchanged).toBe(true);
  await expect(page).toHaveURL(origin + "/");
  await name.fill("ab");
  await page.getByRole("button", { name: "Save username" }).click();
  await expect(page.getByRole("alert")).toContainText("3–20");
  await name.fill("bad name");
  await page.getByRole("button", { name: "Save username" }).click();
  await expect(page.getByRole("alert")).toContainText("3–20");
  await name.fill("Taken_Name");
  await page.getByRole("button", { name: "Save username" }).click();
  await expect(page.getByRole("alert")).toContainText("already taken");
  await name.fill("My_Human");
  await page.getByRole("button", { name: "Save username" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(api.profiles.get(alice)).toBe("my_human");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await expect(editor).toBeVisible();
  await page.getByRole("button", { name: "Open profile" }).click();
  await expect(page.getByRole("dialog")).toContainText("my_human");
  await page.keyboard.press("F5");
  await expect(page.locator(".retro-run-loading")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(editor).toBeVisible();
  await expect(page.locator(".game")).toHaveClass(/focused/);
  await expect(
    page.getByRole("button", { name: "Open profile" }),
  ).toBeFocused();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Open profile" }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "Username", exact: true }),
  ).toHaveCount(0);
});

test("OAuth denial leaves a useful retry and guest route", async ({
  page,
  context,
}) => {
  const api = backend();
  api.cancelOAuth();
  await api.install(context);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Sign in with GitHub", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("cancelled");
  await expect(page).toHaveURL(origin + "/");
  await page
    .getByRole("button", { name: "Continue without signing in" })
    .click();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(
    page
      .frameLocator('iframe[title="Code editor"]')
      .getByLabel("Your React code"),
  ).toBeVisible();
});

test("username onboarding can be cancelled without altering guest progress", async ({
  page,
  context,
}) => {
  const api = backend();
  await api.install(context);
  await seed(page);
  await page.goto("/");
  await expect(
    page.getByRole("textbox", { name: "Username", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Continue as a guest" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect(api.profiles.has(alice)).toBe(false);
  expect(api.progress.has(alice)).toBe(false);
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a failed OAuth code exchange offers retry and guest play", async ({
  page,
  context,
}) => {
  const api = backend();
  api.rejectToken();
  await api.install(context);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Sign in with GitHub", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("could not be restored");
  await expect(page).toHaveURL(origin + "/");
  await page
    .getByRole("button", { name: "Continue without signing in" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(api.counts().writes).toBe(0);
});

test("session restoration can be cancelled while authentication is still loading", async ({
  page,
  context,
}) => {
  const api = backend();
  api.profiles.set(alice, "human_tester");
  await api.install(context);
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await context.route("**/auth/v1/token**", async (route) => {
    if (route.request().method() === "OPTIONS") return route.fallback();
    await pending;
    return route.fulfill({
      contentType: "application/json",
      headers: { "access-control-allow-origin": origin },
      body: JSON.stringify(session()),
    });
  });
  await page.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    { key: AUTH_KEY, value: { ...session(), expires_at: 1 } },
  );
  await page.goto("/");
  await expect(page.getByRole("dialog")).toContainText(
    "Restoring your sign-in",
  );
  await page
    .getByRole("button", { name: "Continue without signing in" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  release();
  await expect
    .poll(() => page.evaluate((key) => localStorage.getItem(key), AUTH_KEY))
    .toBeNull();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeEnabled();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(api.counts().writes).toBe(0);
});

test("two computers synchronize code, recover offline edits, and sign out to separate guest saves", async ({
  page,
  context,
  browser,
}) => {
  const api = backend();
  api.profiles.set(alice, "human_tester");
  await api.install(context);
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  const source =
    "export default function App() { return <h1>From computer one</h1>; }";
  await editor.fill(source);
  await expect
    .poll(
      () =>
        api.progress.get(alice)?.save.projects["board-shell"]?.files["App.tsx"],
    )
    .toBe(source);

  const secondContext = await browser.newContext({ baseURL: origin });
  try {
    await api.install(secondContext);
    const second = await secondContext.newPage();
    await useSimpleComputer(second);
    await seed(second);
    await second.goto("/");
    await expect(second.getByRole("dialog")).toHaveCount(0);
    await second.getByRole("button", { name: "Start", exact: true }).click();
    const secondEditor = second
      .frameLocator('iframe[title="Code editor"]')
      .getByLabel("Your React code");
    await expect(secondEditor).toHaveText(source);
    api.setOffline(true);
    const offlineSource = source + "\n// offline edit";
    await secondEditor.fill(offlineSource);
    await second.getByRole("button", { name: "Open profile" }).click();
    await expect(
      second
        .getByRole("status")
        .filter({ hasText: "Saved locally—sync pending" }),
    ).toBeVisible();
    api.setOffline(false);
    await second.getByRole("button", { name: "Retry sync" }).click();
    await expect(second.getByRole("dialog")).toContainText("Synced");
    await second.getByRole("button", { name: "Sign out", exact: true }).click();
    await expect(
      second.getByRole("button", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await expect(secondEditor).toHaveText("", { useInnerText: true });
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await expect(editor).toHaveText(offlineSource, { useInnerText: true });
    await page.getByRole("button", { name: "Open profile" }).click();
    await expect(page.getByRole("dialog")).toContainText("Synced");
    await page.screenshot({ path: "test-results/account-profile.png" });
  } finally {
    await secondContext.close();
  }
});

test("newer cloud progress replaces old local work without restarting the story", async ({
  page,
  context,
}) => {
  const api = backend();
  api.profiles.set(alice, "returning_human");
  const save = fresh();
  save.collectedAssignments = ["board-shell"];
  save.readAssignments = ["board-shell"];
  save.story["board-shell"] = {
    delivery: "ready",
    seen: ["paper"],
    current: { event: "typing", page: 0 },
    pending: [],
  };
  api.progress.set(alice, snapshot(save, 1000));
  await api.install(context);
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("region", { name: "Conversation with B.U.G." }),
  ).toHaveAttribute("data-story-event", "typing");
  await expect(
    page.getByRole("button", { name: /^Read printed assignment/ }),
  ).toBeVisible();
  const local = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    KEY,
  );
  expect(local.collectedAssignments).toEqual([]);
});

test("a cached account reopens offline without forcing username onboarding", async ({
  page,
  context,
}) => {
  const api = backend();
  api.profiles.set(alice, "offline_human");
  await api.install(context);
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.fill("// keep my unsynced code");
  api.setOffline(true);
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Start", exact: true }).click();
  await expect(editor).toHaveText("// keep my unsynced code");
  await page.getByRole("button", { name: "Open profile" }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Saved locally—sync pending",
  );
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toBeVisible();
});

test("failed profile lookup can be retried or cancelled", async ({
  page,
  context,
}) => {
  const api = backend();
  api.setOffline(true);
  await api.install(context);
  await seed(page);
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "profile could not be loaded",
  );
  api.setOffline(false);
  await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Username", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("account dialogs trap focus and fit short viewports", async ({
  page,
  context,
}) => {
  const api = backend();
  await api.install(context);
  await page.setViewportSize({ width: 640, height: 480 });
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Welcome, human." });
  await expect(dialog).toBeVisible();
  for (let step = 0; step < 6; step++) {
    await page.keyboard.press("Tab");
    expect(
      await dialog.evaluate((element) =>
        element.contains(document.activeElement),
      ),
    ).toBe(true);
  }
  await expect(
    page.getByRole("button", { name: "Continue without signing in" }),
  ).toBeInViewport();
  await page.screenshot({
    path: "test-results/account-introduction-small.png",
  });
});

test("initial cloud loading cannot be bypassed by starting an empty local game", async ({
  page,
  context,
}) => {
  const api = backend();
  api.profiles.set(alice, "returning_human");
  const saved = fresh();
  saved.drafts["board-shell"] = "// existing cloud work";
  api.progress.set(alice, snapshot(saved, 1000));
  await api.install(context);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/rest/v1/pfh_progress?*", async (route) => {
    await gate;
    await route.fallback();
  });
  try {
    await seed(page);
    await page.goto("/");
    await expect(
      page.getByRole("dialog", { name: "Opening your saved desk…" }),
    ).toBeVisible();
    expect(api.counts().writes).toBe(0);
    await page.keyboard.press("F5");
    expect(api.progress.get(alice)?.save.drafts["board-shell"]).toBe(
      "// existing cloud work",
    );
    release();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Start", exact: true }).click();
    await expect(
      page
        .frameLocator('iframe[title="Code editor"]')
        .getByLabel("Your React code"),
    ).toHaveText("// existing cloud work");
  } finally {
    release();
  }
});
