import { expect, it } from "vitest";
import { lessons, finale, sourceFor } from "../src/content";
import { compileCode } from "../src/typed-engine";
const all = [...lessons.flatMap((l) => l.exercises), ...finale];
for (const exercise of all)
  it(`typed ${exercise.id}: accepts real source and rejects the known repair mistakes`, () => {
    const answers = Object.fromEntries(
      exercise.slots.map((s) => [s.name, s.answer]),
    );
    const code = sourceFor(exercise, answers),
      result = compileCode(code, exercise);
    expect(result.errors).toEqual([]);
    expect(result.checks.length).toBeGreaterThan(0);
    expect(result.checks.every((c) => c.pass)).toBe(true);
    for (const slot of exercise.slots) {
      const wrong = slot.choices.find((c) => c.id !== slot.answer)!;
      const broken = compileCode(
        sourceFor(exercise, { ...answers, [slot.name]: wrong.id }),
        exercise,
      );
      expect(
        broken.errors.length > 0 || broken.checks.some((c) => !c.pass),
      ).toBe(true);
    }
  });
it("limits HTML tags, remote imports, and navigation attributes", () => {
  for (const code of [
    "export default function App(){return <script>bad</script>}",
    'import x from "https://example.com/x"; export default function App(){return <p/>}',
    'export default function App(){return <iframe src="https://example.com"/>}',
    'export default function App(){return <div dangerouslySetInnerHTML={{__html:"bad"}}/>}',
  ])
    expect(compileCode(code, all[0]).errors.length).toBeGreaterThan(0);
});
it("accepts formatting changes instead of comparing complete source strings", () => {
  const e = lessons[1].exercises[0];
  const source = sourceFor(
    e,
    Object.fromEntries(e.slots.map((s) => [s.name, s.answer])),
  )
    .replaceAll("s =>", "s=>")
    .replaceAll("\n", " ");
  expect(compileCode(source, e).checks.every((c) => c.pass)).toBe(true);
});
