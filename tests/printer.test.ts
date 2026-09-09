import { describe, expect, it } from "vitest";
import {
  INPUT_POSITION,
  OUTPUT_POSITION,
  FLAT_ROTATION,
  PRINT_DURATION,
  PAPER_RETURN_TIME,
  printerClick,
  samplePrinter,
} from "../src/scene/printerAnimation";

describe("printer lifecycle", () => {
  it("feeds the input sheet before revealing printout, then waits for another click", () => {
    expect(printerClick("input")).toBe("printing");
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
    expect(complete.stage).toBe("output");
    expect(complete.output.position).toEqual(OUTPUT_POSITION);
    expect(samplePrinter("output", 100, false).stage).toBe("output");
  });

  it("ignores clicks while busy and returns the dropped sheet to the input tray", () => {
    expect(printerClick("printing")).toBe("printing");
    expect(printerClick("falling")).toBe("falling");
    expect(printerClick("output")).toBe("falling");
    const floor = samplePrinter("falling", 4, false);
    expect(floor.output.position[1]).toBeLessThan(-1.5);
    expect(samplePrinter("falling", 5, false).output).toEqual(floor.output);
    const returned = samplePrinter("falling", PAPER_RETURN_TIME, false);
    expect(returned.stage).toBe("input");
    expect(returned.input.position).toEqual(INPUT_POSITION);
    expect(returned.input.visible).toBe(true);
    expect(returned.output.visible).toBe(false);
    expect(
      samplePrinter(printerClick(returned.stage), 2, false).output.rotation,
    ).toEqual(FLAT_ROTATION);
  });

  it("keeps reduced-motion paper stationary on the floor until it returns", () => {
    const first = samplePrinter("falling", 0.1, true);
    expect(samplePrinter("falling", 7.9, true).output).toEqual(first.output);
    expect(first.output.rotation).toEqual(FLAT_ROTATION);
    expect(samplePrinter("falling", PAPER_RETURN_TIME, true).stage).toBe(
      "input",
    );
  });
});
