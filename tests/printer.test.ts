import { describe, expect, it } from "vitest";
import {
  INPUT_POSITION,
  OUTPUT_POSITION,
  PRINT_DURATION,
  isPrinterBusy,
  samplePrinter,
} from "../src/scene/printerAnimation";

describe("printer lifecycle", () => {
  it("feeds and prints the sheet, then waits for the user to collect it", () => {
    const feeding = samplePrinter("printing", 0.6, false);
    expect(feeding.input.visible).toBe(true);
    expect(feeding.input.length).toBeCloseTo(0.5);
    expect(feeding.output.visible).toBe(false);
    const printing = samplePrinter("printing", 2, false);
    expect(printing.input.visible).toBe(false);
    expect(printing.output.visible).toBe(true);
    expect(printing.output.length).toBeGreaterThan(0);
    expect(printing.output.length).toBeLessThan(1);
    const complete = samplePrinter("printing", PRINT_DURATION, false);
    expect(complete.stage).toBe("ready");
    expect(complete.output.visible).toBe(true);
    expect(complete.output.position).toEqual(OUTPUT_POSITION);
    expect(complete.input.visible).toBe(true);
    expect(complete.input.position).toEqual(INPUT_POSITION);
    expect(isPrinterBusy(complete.stage)).toBe(false);
  });

  it("keeps the printout in the tray until it is collected", () => {
    const ready = samplePrinter("ready", PRINT_DURATION, false);
    expect(samplePrinter("ready", 100, false)).toEqual(ready);
    expect(ready.output.visible).toBe(true);
    expect(ready.output.position).toEqual(OUTPUT_POSITION);
  });

  it("keeps the assignment on the desk indefinitely", () => {
    const placed = samplePrinter("placed", PRINT_DURATION, false);
    expect(samplePrinter("placed", 100, false)).toEqual(placed);
    expect(isPrinterBusy("printing")).toBe(true);
    expect(isPrinterBusy("ready")).toBe(false);
  });

  it("waits for collection with reduced motion and no moving sheets", () => {
    const first = samplePrinter("printing", 0.1, true);
    expect(samplePrinter("printing", 2.9, true)).toEqual(first);
    expect(first.input.position).toEqual(INPUT_POSITION);
    expect(first.output.visible).toBe(false);
    expect(samplePrinter("printing", PRINT_DURATION, true).stage).toBe("ready");
  });
});
