import { readFileSync, readdirSync } from "node:fs";
// Exercise the exact starter files and test code installed by the migration.
const name = readdirSync("supabase/migrations").find((name) =>
  name.endsWith("_bug_hunts.sql"),
)!;
const migration = readFileSync(`supabase/migrations/${name}`, "utf8");
const files = [...migration.matchAll(/\$code\$([\s\S]*?)\$code\$/g)].map(
  (match) => match[1],
);
export const coffeeHunt = {
  id: "44444444-4444-4444-8444-444444444444",
  revision: 1,
  slug: "the-coffee-counter",
  title: "The coffee counter",
  brief: "Three bugs. Add one cup. Never go below zero. Reset to zero.",
  publishDateTime: "2026-09-01T09:00:00Z",
  starter_files: { "App.tsx": files[0], "CoffeeOrder.tsx": files[1] },
  test_code: migration.match(/\$tests\$([\s\S]*?)\$tests\$/)![1],
  preview_css: "",
};
export const fixedCoffee = coffeeHunt.starter_files["CoffeeOrder.tsx"]
  .replace(
    'data-testid="add" onClick={() => setCups(cups - 1)}',
    'data-testid="add" onClick={() => setCups(cups + 1)}',
  )
  .replace(
    'data-testid="remove" onClick={() => setCups(cups - 1)}',
    'data-testid="remove" onClick={() => setCups(Math.max(0, cups - 1))}',
  )
  .replace("setCups(1)", "setCups(0)");
