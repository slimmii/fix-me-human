import { expect, test, type Page } from "@playwright/test";
import { courseTopics } from "../../src/course";
import { curriculum } from "../../src/curriculum";
import { KEY } from "../../src/progression";
import { codingSave } from "../fixtures/curriculum";
import { useSimpleComputer } from "../fixtures/simple-computer";

const caption = (page: Page) => page.locator(".robot-dialogue [role=status]");
const heading = (page: Page) =>
  page.locator(".editor-help .lesson-content > h1");

test.beforeEach(async ({ page }) => {
  page.setDefaultTimeout(30000);
  await useSimpleComputer(page);
  const save = codingSave("// keep my draft");
  save.completed = [
    ...new Set(courseTopics.flatMap((topic) => topic.unlockAfter)),
  ];
  const lesson = curriculum.at(-1)!;
  const assignment = lesson.assignments.at(-1)!;
  save.lessonId = lesson.id;
  save.assignmentId = assignment.id;
  save.drafts[assignment.id] = "// keep my draft";
  save.collectedAssignments = [assignment.id];
  save.readAssignments = [assignment.id];
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top) localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Start", exact: true }).click();
  // Match the physical monitor's reading area without rendering the 3D room.
  await page.locator(".machine-screen").evaluate((screen) => {
    screen.style.width = "832px";
    screen.style.height = "472px";
  });
  await page.getByRole("menuitem", { name: "Help", exact: true }).click();
  await expect(heading(page)).toHaveText("Course topics");
});

test("all 22 materials have opening and completion jokes without losing the story", async ({
  page,
}) => {
  const script = await caption(page).textContent();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const topic of courseTopics) {
    await page
      .getByRole("button", { name: `Read topic: ${topic.title}` })
      .click();
    for (const [index, material] of topic.pages.entries()) {
      await test.step(material.title, async () => {
        await expect(heading(page)).toHaveText(material.title);
        await expect(caption(page)).toHaveText(material.jokes.opened);
        await expect
          .poll(() =>
            page.locator(".lesson-scroll").evaluate((el) => el.scrollTop),
          )
          .toBe(0);
        await heading(page).press("End");
        await expect(page.locator(".lesson-reading-status")).toContainText(
          /End of page|All text visible/,
        );
        await expect(caption(page)).toHaveText(material.jokes.read, {
          timeout: 7000,
        });
        await page
          .getByRole("button", { name: "BACK TO WORK", exact: true })
          .click();
        await expect(caption(page)).toHaveText(script!);
        // Reaching the end again must not interrupt the restored story.
        await heading(page).press("Home");
        await heading(page).press("End");
        await page.waitForTimeout(100);
        await expect(caption(page)).toHaveText(script!);
      });
      if (index < topic.pages.length - 1)
        await page.getByRole("button", { name: "Next →", exact: true }).click();
    }
    await page.getByRole("button", { name: "Topics", exact: true }).click();
  }
  await page.getByRole("button", { name: "Close course material" }).click();
  await expect(
    page
      .frameLocator('iframe[title="Code editor"]')
      .getByLabel("Your React code"),
  ).toHaveText("// keep my draft");
  expect(errors).toEqual([]);
});

test("navigation and closing cancel old jokes; a new visit can tell them again", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  const [first, second] = courseTopics[0].pages;
  await page
    .getByRole("button", { name: "Read topic: React fundamentals" })
    .click();
  await expect(caption(page)).toHaveText(first.jokes.opened);
  await heading(page).press("End");
  await expect(page.locator(".lesson-reading-status")).toContainText(
    "End of page",
  );
  await heading(page).press("ArrowRight");
  await expect(caption(page)).toHaveText(second.jokes.opened);
  await page.clock.fastForward(4500);
  await expect(caption(page)).toHaveText(second.jokes.opened);
  await page.locator(".lesson-scroll").hover();
  await page.mouse.wheel(0, 10000);
  await expect(page.locator(".lesson-reading-status")).toContainText(
    "End of page",
  );
  await page.clock.runFor(50);
  await expect(caption(page)).toHaveText(second.jokes.read);

  await heading(page).press("ArrowLeft");
  await expect(caption(page)).toHaveText(first.jokes.opened);
  await heading(page).press("End");
  await expect(page.locator(".lesson-reading-status")).toContainText(
    "End of page",
  );
  await heading(page).press("Escape");
  await page.clock.fastForward(4500);
  await expect(caption(page)).toHaveText(first.jokes.opened);
  await page.getByRole("menuitem", { name: "Help", exact: true }).click();
  await page
    .getByRole("button", { name: "Read topic: React fundamentals" })
    .click();
  await expect(caption(page)).toHaveText(first.jokes.opened);
  await heading(page).press("End");
  await expect(page.locator(".lesson-reading-status")).toContainText(
    "End of page",
  );
  await page.clock.fastForward(4500);
  await page.clock.runFor(50);
  await expect(caption(page)).toHaveText(first.jokes.read);
});

test("pages that fit keep the opening joke readable before finishing without scrolling", async ({
  page,
}) => {
  await page.clock.install();
  await page.clock.pauseAt(new Date(Date.now() + 1000));
  await page.setViewportSize({ width: 1440, height: 1800 });
  await page.locator(".machine-screen").evaluate((screen) => {
    screen.style.height = "1300px";
  });
  const material = courseTopics[1].pages[0];
  await page
    .getByRole("button", { name: "Read topic: Components and props" })
    .click();
  await expect(page.locator(".lesson-reading-status")).toContainText(
    "All text visible",
  );
  await expect(caption(page)).toHaveText(material.jokes.opened);
  await page.clock.fastForward(2000);
  await expect(caption(page)).toHaveText(material.jokes.opened);
  await page.clock.fastForward(2500);
  await page.clock.runFor(50);
  await expect(caption(page)).toHaveText(material.jokes.read);
});
