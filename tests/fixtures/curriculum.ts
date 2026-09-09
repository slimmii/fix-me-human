import { curriculum } from "../../src/curriculum";
import type { Lesson } from "../../src/curriculum/types";
import { fresh, type Save } from "../../src/progression";
export const assignment = curriculum[0].assignments[0];
export const fixtureCurriculum: Lesson[] = [
  curriculum[0],
  {
    id: "second-lesson",
    title: "Test-only lesson",
    assignments: [
      {
        ...assignment,
        id: "with-skeleton",
        starterCode: "export default function App() {\n  return null;\n}",
      },
      { ...assignment, id: "another-assignment" },
    ],
  },
];
export function codingSave(code?: string): Save {
  const save = fresh();
  save.phase = "coding";
  save.settings.mute = true;
  save.settings.reducedMotion = true;
  if (code !== undefined) save.drafts[assignment.id] = code;
  return save;
}
