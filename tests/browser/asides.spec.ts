import { expect, test } from "@playwright/test";
import { fresh, KEY } from "../../src/progression";
import { storyChapters } from "../../src/game/storyScripts";

for (const duringTutorial of [false, true]) {
  test(`all desk remarks return to the script (tutorial: ${duringTutorial})`, async ({
    page,
  }) => {
    const save = fresh();
    save.settings.mute = true;
    save.settings.reducedMotion = true;
    if (duringTutorial) {
      save.phase = "coding";
      save.collectedAssignments = [save.assignmentId];
      save.story[save.assignmentId] = {
        delivery: "ready",
        current: { event: "monitor", page: 1 },
        pending: [{ event: "run", page: 0 }],
        seen: ["monitor"],
      };
    }
    await page.addInitScript(
      ([key, value]) => {
        if (window === window.top && !localStorage.getItem(key))
          localStorage.setItem(key, value);
      },
      [KEY, JSON.stringify(save)],
    );
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Play Focus Flow on the radio" }),
    ).toBeVisible({ timeout: 30000 });
    // Wait for Drei to project the screen before clicking fixed scene points.
    await expect
      .poll(
        async () =>
          (await page.locator('[data-surface="crt-glass"]').boundingBox())?.x ??
          0,
      )
      .toBeGreaterThan(400);
    const caption = page.getByRole("status");
    const workstationId = await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!).workstationId as string,
      KEY,
    );
    expect(workstationId).toMatch(/^[A-Z]–\d{3}$/);
    const script = await caption.textContent();
    const back = page.getByRole("button", {
      name: "BACK TO WORK",
      exact: true,
    });
    // Canvas props are hit at their centers in the fixed desktop viewport.
    for (const [x, y, remark] of [
      [104, 258, "arbitrary number"],
      [350, 590, "Coffee:"],
      [280, 420, "Fan:"],
      [1090, 350, "job security"],
      [650, 607, "Keyboard:"],
    ] as const) {
      await page.mouse.click(x, y);
      await expect(caption).toContainText(remark);
      await expect(back).toBeVisible();
      if (remark === "arbitrary number") {
        await expect(caption).toContainText(`Workstation ${workstationId}.`);
        await page.mouse.move(720, 800);
        await page.screenshot({ path: "test-results/workstation-sign.png" });
      }
      await back.click();
      await expect(caption).toHaveText(script!);
    }
    await page.mouse.click(350, 590);
    await page.mouse.click(280, 420);
    await expect(caption).toContainText("Fan:");
    await page.reload();
    await expect(caption).toContainText("Fan:");
    expect(
      await page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)!).workstationId,
        KEY,
      ),
    ).toBe(workstationId);
    await back.focus();
    await back.press("Enter");
    await expect(caption).toHaveText(script!);
    await expect(back).toHaveCount(0);
    if (duringTutorial) {
      await page
        .getByRole("button", { name: "Continue B.U.G. dialogue" })
        .click();
      await expect(caption).toHaveText(storyChapters[0].run);
    } else {
      await expect(
        page.getByRole("button", { name: /^Grab new assignment:/ }),
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Continue B.U.G. dialogue" }),
      ).toHaveText(/Print assignment/);
    }
  });
}
