import type { OfficeClock } from "../game/officeTime";
import { useOfficeTime } from "../game/useOfficeTime";

export function OfficeClockReadout({
  clock,
  hidden = false,
}: {
  clock: OfficeClock;
  hidden?: boolean;
}) {
  const time = useOfficeTime(clock);
  return (
    <div className={hidden ? "office-clock-accessible" : undefined}>
      <span role="timer" aria-label="Office clock">
        Day {time.day} · {time.time}
      </span>
      {" · "}
      <span aria-label="Days without a bug">{time.daysWithoutBug}</span>
      {" days without a bug"}
    </div>
  );
}
