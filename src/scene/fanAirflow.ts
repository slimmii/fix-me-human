import { Vector3 } from "three";

export function createFanAirflow() {
  return {
    position: new Vector3(),
    direction: new Vector3(0, 0, 1),
    strength: 0,
  };
}

export type FanAirflow = ReturnType<typeof createFanAirflow>;
