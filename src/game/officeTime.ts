// One office day is ten real minutes, starting the first shift at 09:00.
export const OFFICE_DAY_MS = 10 * 60 * 1000;
export type OfficeClock = {
  elapsedMs: number;
  lastBugElapsedMs: number;
  runningSince: number | null;
};

export function createOfficeClock(now = Date.now()): OfficeClock {
  return { elapsedMs: 0, lastBugElapsedMs: 0, runningSince: now };
}

export function decodeOfficeClock(value: unknown): OfficeClock | null {
  if (!value || typeof value !== "object") return null;
  const { elapsedMs, lastBugElapsedMs } = value as OfficeClock;
  // Old wall-clock saves have no play-time checkpoint. Start their clock fresh
  // instead of converting time spent away into office days.
  return Number.isSafeInteger(elapsedMs) &&
    elapsedMs >= 0 &&
    Number.isSafeInteger(lastBugElapsedMs) &&
    lastBugElapsedMs >= 0 &&
    lastBugElapsedMs <= elapsedMs
    ? { elapsedMs, lastBugElapsedMs, runningSince: null }
    : null;
}

export function pauseOfficeClock(
  clock: OfficeClock,
  now = Date.now(),
): OfficeClock {
  if (clock.runningSince === null) return clock;
  return {
    ...clock,
    elapsedMs: clock.elapsedMs + Math.max(0, now - clock.runningSince),
    runningSince: null,
  };
}

export function resumeOfficeClock(
  clock: OfficeClock,
  now = Date.now(),
): OfficeClock {
  return clock.runningSince === null ? { ...clock, runningSince: now } : clock;
}

export function recordOfficeBug(
  clock: OfficeClock,
  now = Date.now(),
): OfficeClock {
  const snapshot = pauseOfficeClock(clock, now);
  return {
    ...snapshot,
    lastBugElapsedMs: snapshot.elapsedMs,
    runningSince: clock.runningSince === null ? null : now,
  };
}

export function readOfficeTime(clock: OfficeClock, now = Date.now()) {
  const { elapsedMs } = pauseOfficeClock(clock, now);
  const elapsedDays = elapsedMs / OFFICE_DAY_MS;
  const hours = (9 + elapsedDays * 24) % 24;
  const minutes = (hours % 1) * 60;
  return {
    hours,
    minutes,
    day: Math.floor(elapsedDays) + 1,
    daysWithoutBug: Math.floor(
      Math.max(0, elapsedMs - clock.lastBugElapsedMs) / OFFICE_DAY_MS,
    ),
    time: `${String(Math.floor(hours)).padStart(2, "0")}:${String(Math.floor(minutes)).padStart(2, "0")}`,
  };
}
