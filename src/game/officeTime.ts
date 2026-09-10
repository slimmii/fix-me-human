// One office day is ten real minutes, starting the first shift at 09:00.
export const OFFICE_DAY_MS = 10 * 60 * 1000;
export type OfficeClock = { startedAt: number; lastBugAt: number };

export function createOfficeClock(now = Date.now()): OfficeClock {
  return { startedAt: now, lastBugAt: now };
}

export function decodeOfficeClock(value: unknown): OfficeClock | null {
  if (!value || typeof value !== "object") return null;
  const { startedAt, lastBugAt } = value as OfficeClock;
  return Number.isSafeInteger(startedAt) &&
    startedAt >= 0 &&
    Number.isSafeInteger(lastBugAt) &&
    lastBugAt >= startedAt
    ? { startedAt, lastBugAt }
    : null;
}

export function readOfficeTime(clock: OfficeClock, now = Date.now()) {
  const elapsedDays = Math.max(0, now - clock.startedAt) / OFFICE_DAY_MS;
  const hours = (9 + elapsedDays * 24) % 24;
  const minutes = (hours % 1) * 60;
  return {
    hours,
    minutes,
    day: Math.floor(elapsedDays) + 1,
    daysWithoutBug: Math.floor(
      Math.max(0, now - clock.lastBugAt) / OFFICE_DAY_MS,
    ),
    time: `${String(Math.floor(hours)).padStart(2, "0")}:${String(Math.floor(minutes)).padStart(2, "0")}`,
  };
}
