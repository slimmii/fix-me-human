import { describe, expect, it } from "vitest";
import {
  createOfficeClock,
  OFFICE_DAY_MS,
  readOfficeTime,
} from "../src/game/officeTime";
import { decode, fresh } from "../src/progression";

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
      clock = { ...clock, lastBugAt: now };
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

  it("preserves clock and streak timestamps in saves and safely loads older saves", () => {
    const save = { ...fresh(), officeClock: createOfficeClock(start) };
    save.officeClock.lastBugAt += OFFICE_DAY_MS;
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
    ]) {
      expect(
        decode(JSON.stringify({ ...save, officeClock: invalid })).officeClock,
      ).toBeNull();
    }
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
