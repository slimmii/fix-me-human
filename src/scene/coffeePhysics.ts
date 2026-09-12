import { Euler, MathUtils, Vector3 } from "three";

export const COFFEE = {
  radius: 0.218,
  bottom: -0.225,
  rim: 0.275,
  initialLevel: 0.19,
  deskHeight: 1.4075,
  dropCount: 64,
  puddleCount: 16,
};
const AREA = Math.PI * COFFEE.radius ** 2;
const STEP = 1 / 120;
const DROP_VOLUME = 0.00004;

export function createCoffeePhysics() {
  return {
    volume: AREA * (COFFEE.initialLevel - COFFEE.bottom),
    spilled: 0,
    pendingSpill: 0,
    time: 0,
    remainder: 0,
    tilt: { x: 0, z: 0 },
    velocity: { x: 0, z: 0 },
    slope: { x: 0, z: 0 },
    slopeVelocity: { x: 0, z: 0 },
    rotation: new Euler(),
    bodyHeight: 0.275,
    drops: Array.from({ length: COFFEE.dropCount }, () => ({
      active: false,
      position: new Vector3(),
      velocity: new Vector3(),
      volume: 0,
    })),
    puddles: Array.from({ length: COFFEE.puddleCount }, () => ({
      x: 0,
      z: 0,
      volume: 0,
    })),
  };
}
export type CoffeePhysics = ReturnType<typeof createCoffeePhysics>;

export function coffeeLevel(state: CoffeePhysics) {
  return COFFEE.bottom + state.volume / AREA;
}

// Keep the trough above the bottom as the cup loses coffee.
export function coffeeSurface(state: CoffeePhysics) {
  const level = coffeeLevel(state);
  const magnitude = Math.hypot(state.slope.x, state.slope.z);
  const scale = Math.min(
    1,
    ((level - COFFEE.bottom) * 0.95) /
      (COFFEE.radius * Math.max(magnitude, 0.00001)),
  );
  return { level, x: state.slope.x * scale, z: state.slope.z * scale };
}

export function wiggleCoffee(state: CoffeePhysics, x = 0.75, z = 3.2) {
  state.velocity.x = MathUtils.clamp(state.velocity.x + x, -6, 6);
  state.velocity.z = MathUtils.clamp(state.velocity.z + z, -6, 6);
}

function landDrop(state: CoffeePhysics, drop: CoffeePhysics["drops"][number]) {
  const sector =
    Math.floor(
      ((Math.atan2(drop.position.z, drop.position.x) + Math.PI) /
        (2 * Math.PI)) *
        COFFEE.puddleCount,
    ) % COFFEE.puddleCount;
  const puddle = state.puddles[sector];
  const volume = puddle.volume + drop.volume;
  puddle.x =
    (puddle.x * puddle.volume + drop.position.x * drop.volume) / volume;
  puddle.z =
    (puddle.z * puddle.volume + drop.position.z * drop.volume) / volume;
  puddle.volume = volume;
  drop.active = false;
}

function stepCoffee(state: CoffeePhysics, dt: number) {
  state.time += dt;
  for (const axis of ["x", "z"] as const) {
    // The ceramic rocks back onto its base; the liquid has its own inertia.
    const acceleration = -145 * state.tilt[axis] - 5.5 * state.velocity[axis];
    state.velocity[axis] += acceleration * dt;
    state.tilt[axis] += state.velocity[axis] * dt;
    if (Math.abs(state.tilt[axis]) > 0.32) {
      state.tilt[axis] = MathUtils.clamp(state.tilt[axis], -0.32, 0.32);
      state.velocity[axis] *= -0.25;
    }
    const surfaceAxis = axis === "z" ? "x" : "z";
    const sign = axis === "z" ? -1 : 1;
    const equilibrium =
      sign * (Math.tan(state.tilt[axis]) - acceleration * 0.075);
    state.slopeVelocity[surfaceAxis] +=
      (85 * (equilibrium - state.slope[surfaceAxis]) -
        5 * state.slopeVelocity[surfaceAxis]) *
      dt;
    state.slope[surfaceAxis] += state.slopeVelocity[surfaceAxis] * dt;
  }
  state.rotation.set(state.tilt.x, 0, state.tilt.z);
  const cosine = Math.cos(state.tilt.x) * Math.cos(state.tilt.z);
  // Lift around the lower edge so the rocking base never passes through the desk.
  state.bodyHeight = 0.275 * cosine + 0.23 * Math.sqrt(1 - cosine * cosine);

  const surface = coffeeSurface(state);
  const slope = Math.hypot(surface.x, surface.z);
  const overflow = Math.max(
    0,
    surface.level + slope * COFFEE.radius - COFFEE.rim,
  );
  // Only a narrow arc of the rim overflows during a wobble.
  const lost = Math.min(state.volume, overflow * AREA * 0.25 * dt);
  state.volume -= lost;
  state.spilled += lost;
  state.pendingSpill += lost;

  if (state.pendingSpill >= DROP_VOLUME && slope > 0.001) {
    for (const drop of state.drops) {
      if (drop.active) continue;
      // Emit from the overflowing edge, then let gravity carry drops to the desk.
      const angle =
        Math.atan2(surface.z, surface.x) + Math.sin(state.time * 93) * 0.16;
      const x = Math.cos(angle);
      const z = Math.sin(angle);
      const speed = 0.3 + overflow * 3;
      drop.position
        .set(x * 0.27, COFFEE.rim + 0.003, z * 0.27)
        .applyEuler(state.rotation);
      drop.position.y += state.bodyHeight;
      drop.velocity
        .set(x * speed, 0.12 + overflow, z * speed)
        .applyEuler(state.rotation);
      drop.volume = DROP_VOLUME;
      drop.active = true;
      state.pendingSpill -= DROP_VOLUME;
      if (state.pendingSpill < DROP_VOLUME) break;
    }
  }
  for (const drop of state.drops) {
    if (!drop.active) continue;
    drop.velocity.y -= 9.81 * dt;
    drop.position.addScaledVector(drop.velocity, dt);
    if (drop.position.y <= 0.004) landDrop(state, drop);
  }
}

export function updateCoffee(
  state: CoffeePhysics,
  delta: number,
  reduced = false,
) {
  if (reduced) {
    state.tilt.x = state.tilt.z = state.velocity.x = state.velocity.z = 0;
    state.slope.x = state.slope.z = 0;
    state.slopeVelocity.x = state.slopeVelocity.z = 0;
    state.rotation.set(0, 0, 0);
    state.bodyHeight = 0.275;
    state.remainder = 0;
    // Finish existing spills without continuing animation in reduced motion.
    for (const drop of state.drops) {
      if (drop.active) landDrop(state, drop);
    }
    return;
  }
  // Fixed steps keep both overflow and spring motion consistent at 30–144 Hz.
  // Discard long background-tab gaps instead of launching the cup on return.
  state.remainder += Math.max(0, Math.min(delta, 0.1));
  while (state.remainder >= STEP - 1e-9) {
    stepCoffee(state, STEP);
    state.remainder -= STEP;
  }
}
