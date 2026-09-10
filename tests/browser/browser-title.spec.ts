import { test, expect } from "@playwright/test";
import { KEY } from "../../src/progression";
import { codingSave } from "../fixtures/curriculum";
import { useSimpleComputer } from "../fixtures/simple-computer";

test("document.title follows effects in the fake browser and resets between runs", async ({
  page,
}) => {
  await useSimpleComputer(page);
  const save = codingSave(`import { useEffect, useState } from "react";
export default function App() {
  const [city, setCity] = useState("Brussels");
  useEffect(() => {
    document.title = city ? "Weather in " + city : "";
  }, [city]);
  return <section>
    <h1>Weather in {city}</h1>
    <button onClick={() => setCity("Ghent")}>Show Ghent</button>
    <button onClick={() => setCity("")}>Clear title</button>
  </section>;
}`);
  await page.addInitScript(
    ([key, value]) => {
      if (window === window.top && !localStorage.getItem(key))
        localStorage.setItem(key, value);
    },
    [KEY, JSON.stringify(save)],
  );
  await page.goto("/");
  const officeTitle = await page.title();
  await page.getByRole("button", { name: "Start", exact: true }).click();
  const editor = page
    .frameLocator('iframe[title="Code editor"]')
    .getByLabel("Your React code");
  await editor.press("F5");
  const title = page.locator(".retro-browser-title > b");
  const browser = page.frameLocator('iframe[title="Your retro browser"]');
  await expect(title).toHaveText(
    "▣ BUGSCAPE Navigator 1.0 — Weather in Brussels",
    { timeout: 15000 },
  );
  await browser.getByRole("button", { name: "Show Ghent" }).click();
  await expect(title).toHaveText("▣ BUGSCAPE Navigator 1.0 — Weather in Ghent");
  await expect(page).toHaveTitle(officeTitle);

  await browser.getByRole("button", { name: "Clear title" }).click();
  await expect(title).toHaveText("▣ BUGSCAPE Navigator 1.0 — Local Intranet");
  await browser.getByRole("button", { name: "Show Ghent" }).click();
  await expect(title).toContainText("Weather in Ghent");
  await page.getByRole("button", { name: "Reload" }).click();
  await expect(title).toContainText("Weather in Brussels");

  await page.getByRole("button", { name: "Close browser" }).click();
  await editor.fill(
    "export default function App() { return <h1>Sprint board</h1>; }",
  );
  await editor.press("F5");
  await expect(
    browser.getByRole("heading", { name: "Sprint board" }),
  ).toBeVisible();
  await expect(title).toHaveText("▣ BUGSCAPE Navigator 1.0 — Local Intranet");
  await expect(page).toHaveTitle(officeTitle);
});
