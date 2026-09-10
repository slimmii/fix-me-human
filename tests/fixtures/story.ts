import { expect, type Page } from "@playwright/test";
export async function startAssignmentPrint(page: Page) {
  const dialogue = page.getByRole("region", {
    name: "Conversation with B.U.G.",
  });
  await expect(dialogue).toBeVisible();
  for (let step = 0; step < 2; step++) {
    const event = await dialogue.getAttribute("data-story-event");
    if (event !== "handoff" && event !== "briefing") return;
    await page
      .getByRole("button", { name: "Continue B.U.G. dialogue", exact: true })
      .click();
  }
}
