import { describe, expect, it } from "vitest";
import {
  COFFEE,
  coffeeLevel,
  coffeeSurface,
  createCoffeePhysics,
  updateCoffee,
  wiggleCoffee,
  type CoffeePhysics,
} from "../src/scene/coffeePhysics";

function advance(state: CoffeePhysics, seconds: number, fps = 60) {
  for (let frame = 0; frame < seconds * fps; frame++)
    updateCoffee(state, 1 / fps);
}

describe("coffee physics", () => {
  it("starts below the rim and never spills or moves at rest", () => {
    const state = createCoffeePhysics();
    expect(COFFEE.rim - coffeeLevel(state)).toBeGreaterThan(0.07);
    const volume = state.volume;
    advance(state, 20);
    expect(state.volume).toBe(volume);
    expect(state.spilled).toBe(0);
    expect(state.tilt).toEqual({ x: 0, z: 0 });
    expect(state.slope).toEqual({ x: 0, z: 0 });
  });

  it("a wobble sloshes over the rim, loses coffee, and lands on the desk", () => {
    const state = createCoffeePhysics();
    const volume = state.volume;
    wiggleCoffee(state);
    advance(state, 0.5);
    expect(Math.hypot(state.slope.x, state.slope.z)).toBeGreaterThan(0.05);
    expect(state.spilled).toBeGreaterThan(0.0005);
    expect(coffeeLevel(state)).toBeLessThan(COFFEE.initialLevel - 0.005);
    advance(state, 10);
    expect(state.volume + state.spilled).toBeCloseTo(volume, 10);
    expect(state.drops.every((drop) => !drop.active)).toBe(true);
    const landed = state.puddles.reduce(
      (sum, puddle) => sum + puddle.volume,
      0,
    );
    expect(landed).toBeGreaterThan(0);
    expect(landed + state.pendingSpill).toBeCloseTo(state.spilled, 10);
    expect(Math.hypot(state.tilt.x, state.tilt.z)).toBeLessThan(0.0001);
    expect(Math.hypot(state.slope.x, state.slope.z)).toBeLessThan(0.0001);
  });

  it("gentle movement settles without spilling", () => {
    const state = createCoffeePhysics();
    wiggleCoffee(state, 0.05, 0.12);
    advance(state, 8);
    expect(state.spilled).toBe(0);
    expect(coffeeLevel(state)).toBeCloseTo(COFFEE.initialLevel);
  });

  it("repeated shaking cannot refill the cup or put the trough below its floor", () => {
    const state = createCoffeePhysics();
    const initialVolume = state.volume;
    let previousVolume = state.volume;
    for (let frame = 0; frame < 60 * 30; frame++) {
      if (frame % 10 === 0) wiggleCoffee(state, 2, frame % 20 ? -5 : 5);
      updateCoffee(state, 1 / 60);
      const surface = coffeeSurface(state);
      expect(state.volume).toBeLessThanOrEqual(previousVolume);
      expect(state.volume).toBeGreaterThanOrEqual(0);
      expect(
        surface.level - Math.hypot(surface.x, surface.z) * COFFEE.radius,
      ).toBeGreaterThanOrEqual(COFFEE.bottom);
      expect(state.volume + state.spilled).toBeCloseTo(initialVolume, 10);
      previousVolume = state.volume;
    }
    expect(state.spilled).toBeGreaterThan(initialVolume * 0.1);
  });

  it("has the same fill and resting pose at different frame rates", () => {
    const states = [30, 60, 144].map((fps) => {
      const state = createCoffeePhysics();
      wiggleCoffee(state);
      advance(state, 3, fps);
      return state;
    });
    for (const state of states.slice(1)) {
      expect(state.volume).toBeCloseTo(states[0].volume, 10);
      expect(state.slope.x).toBeCloseTo(states[0].slope.x, 10);
      expect(state.tilt.z).toBeCloseTo(states[0].tilt.z, 10);
    }
  });

  it("stops animation in reduced motion and safely handles a resumed tab", () => {
    const state = createCoffeePhysics();
    wiggleCoffee(state);
    updateCoffee(state, 60);
    expect(Number.isFinite(state.slope.x)).toBe(true);
    expect(Math.abs(state.tilt.z)).toBeLessThanOrEqual(0.32);
    const volume = state.volume;
    updateCoffee(state, 1 / 60, true);
    expect(state.volume).toBe(volume);
    expect(state.slope).toEqual({ x: 0, z: 0 });
    expect(state.tilt).toEqual({ x: 0, z: 0 });
    expect(state.drops.every((drop) => !drop.active)).toBe(true);
    advance(state, 5);
    expect(state.volume).toBe(volume);
  });
});
