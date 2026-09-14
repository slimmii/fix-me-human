import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createOfficeClock,
  OFFICE_DAY_MS,
  pauseOfficeClock,
  readOfficeTime,
  recordOfficeBug,
  resumeOfficeClock,
} from "../src/game/officeTime";
import { decode, fresh, KEY, loadSave, persist } from "../src/progression";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("office time", () => {
  const start = 1_800_000_000_000;
  it("moves through 24 hours in ten minutes and counts only full bug-free days", () => {
    const clock = createOfficeClock(start);
    expect(readOfficeTime(clock, start)).toMatchObject({
      time: "09:00",
      day: 1,
      daysWithoutBug: 0,
    });
    expect(readOfficeTime(clock, start + OFFICE_DAY_MS / 2)).toMatchObject({
      time: "21:00",
      day: 1,
      daysWithoutBug: 0,
    });
    expect(
      readOfficeTime(clock, start + OFFICE_DAY_MS - 1).daysWithoutBug,
    ).toBe(0);
    expect(readOfficeTime(clock, start + OFFICE_DAY_MS)).toMatchObject({
      time: "09:00",
      day: 2,
      daysWithoutBug: 1,
    });
    expect(
      readOfficeTime(clock, start + OFFICE_DAY_MS * 123).daysWithoutBug,
    ).toBe(123);
  });

  it("restarts the full ten-minute streak after each bug without resetting the hands", () => {
    let clock = createOfficeClock(start);
    for (const elapsed of [1.75, 3.25]) {
      const now = start + OFFICE_DAY_MS * elapsed;
      const before = readOfficeTime(clock, now);
      clock = recordOfficeBug(clock, now);
      expect(readOfficeTime(clock, now)).toEqual({
        ...before,
        daysWithoutBug: 0,
      });
      expect(
        readOfficeTime(clock, now + OFFICE_DAY_MS - 1).daysWithoutBug,
      ).toBe(0);
      expect(readOfficeTime(clock, now + OFFICE_DAY_MS).daysWithoutBug).toBe(1);
    }
  });

  it("preserves play time in saves and safely loads older or invalid clocks", () => {
    const save = {
      ...fresh(),
      officeClock: pauseOfficeClock(
        recordOfficeBug(createOfficeClock(start), start + OFFICE_DAY_MS),
        start + 3 * OFFICE_DAY_MS,
      ),
    };
    expect(decode(JSON.stringify(save)).officeClock).toEqual(save.officeClock);
    const { officeClock, ...legacy } = save;
    expect(decode(JSON.stringify(legacy)).officeClock).toBeNull();
    for (const invalid of [
      null,
      {},
      "clock",
      { startedAt: -1, lastBugAt: 0 },
      { startedAt: start, lastBugAt: start - 1 },
      { startedAt: start, lastBugAt: "yesterday" },
      // Legacy timestamps cannot distinguish play time from time spent away.
      { startedAt: start, lastBugAt: start + OFFICE_DAY_MS },
      { elapsedMs: -1, lastBugElapsedMs: 0 },
      { elapsedMs: 0, lastBugElapsedMs: 1 },
      { elapsedMs: 1, lastBugElapsedMs: -1 },
      { elapsedMs: 1.5, lastBugElapsedMs: 0 },
      { elapsedMs: 1, lastBugElapsedMs: "yesterday" },
    ]) {
      expect(
        decode(JSON.stringify({ ...save, officeClock: invalid })).officeClock,
      ).toBeNull();
    }
  });

  it("resumes the clock and bug-free streak without counting hidden time", () => {
    const bug = start + OFFICE_DAY_MS / 4;
    const pausedAt = start + 1.75 * OFFICE_DAY_MS;
    const clock = pauseOfficeClock(
      recordOfficeBug(createOfficeClock(start), bug),
      pausedAt,
    );
    const before = readOfficeTime(clock, pausedAt);
    expect(before).toMatchObject({ time: "03:00", day: 2, daysWithoutBug: 1 });

    const returnedAt = pausedAt + 30 * 24 * 60 * 60 * 1000;
    expect(readOfficeTime(clock, returnedAt)).toEqual(before);
    expect(pauseOfficeClock(clock, returnedAt)).toBe(clock);
    const resumed = resumeOfficeClock(clock, returnedAt);
    expect(readOfficeTime(resumed, returnedAt)).toEqual(before);
    expect(resumeOfficeClock(resumed, returnedAt + OFFICE_DAY_MS)).toBe(
      resumed,
    );
    expect(
      readOfficeTime(resumed, returnedAt + OFFICE_DAY_MS / 2),
    ).toMatchObject({
      time: "15:00",
      day: 3,
      daysWithoutBug: 2,
    });
  });

  it("saves a play-time checkpoint and ignores weeks between sessions", () => {
    vi.useFakeTimers();
    vi.setSystemTime(start + 2.75 * OFFICE_DAY_MS);
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      setItem: (key: string, value: string) => storage.set(key, value),
      getItem: (key: string) => storage.get(key) ?? null,
    });
    const clock = recordOfficeBug(
      createOfficeClock(start),
      start + OFFICE_DAY_MS,
    );
    const before = readOfficeTime(clock);
    expect(persist({ ...fresh(), officeClock: clock })).toBe(true);
    expect(JSON.parse(storage.get(KEY)!).officeClock.runningSince).toBeNull();

    vi.setSystemTime(start + 30 * 24 * 60 * 60 * 1000);
    const loaded = loadSave().officeClock!;
    expect(readOfficeTime(loaded)).toEqual(before);
    const resumed = resumeOfficeClock(loaded);
    expect(readOfficeTime(resumed)).toEqual(before);
    vi.advanceTimersByTime(OFFICE_DAY_MS);
    expect(readOfficeTime(resumed)).toMatchObject({
      time: before.time,
      day: before.day + 1,
      daysWithoutBug: before.daysWithoutBug + 1,
    });
  });

  it("records errors while paused without restarting the clock", () => {
    const paused = pauseOfficeClock(
      createOfficeClock(start),
      start + 3 * OFFICE_DAY_MS,
    );
    const clock = recordOfficeBug(paused, start + 20 * OFFICE_DAY_MS);
    expect(readOfficeTime(clock, start + 30 * OFFICE_DAY_MS)).toMatchObject({
      day: 4,
      time: "09:00",
      daysWithoutBug: 0,
    });
  });

  it("never displays negative days when the system clock moves backwards", () => {
    expect(
      readOfficeTime(createOfficeClock(start), start - OFFICE_DAY_MS),
    ).toMatchObject({
      time: "09:00",
      day: 1,
      daysWithoutBug: 0,
    });
  });
});
