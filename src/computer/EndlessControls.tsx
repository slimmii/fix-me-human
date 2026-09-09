import { lessons } from "../content";
import type { GameController } from "../game/useGame";
type Props = Pick<GameController, "save" | "setSave">;
export function EndlessControls({ save, setSave }: Props) {
  return (
    <div className="tiny-endless">
      <label>
        Topic{" "}
        <select
          aria-label="Endless topic"
          value={save.endless.topic}
          onChange={(e) =>
            setSave((s) => ({
              ...s,
              endless: {
                ...s.endless,
                topic:
                  e.target.value === "mixed" ? "mixed" : Number(e.target.value),
                seed: s.endless.seed + 1,
              },
            }))
          }
        >
          <option value="mixed">Mixed</option>
          {lessons.map((l, i) => (
            <option key={i} value={i}>
              {l.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Difficulty{" "}
        <select
          aria-label="Endless difficulty"
          value={save.endless.difficulty}
          onChange={(e) =>
            setSave((s) => ({
              ...s,
              endless: {
                ...s.endless,
                difficulty: Number(e.target.value),
                seed: s.endless.seed + 1,
              },
            }))
          }
        >
          <option value={1}>Intern</option>
          <option value={2}>Employee</option>
          <option value={3}>Management</option>
        </select>
      </label>
      <span>{save.endless.solved} repaired</span>
    </div>
  );
}
