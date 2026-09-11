export const SEATED_VIEW = {
  position: [0, 3.45, 6.8],
  target: [0, 1.9, -0.45],
} as const;

// Tilt the entire monitor to face the seated viewing direction. The small lift
// keeps the rear of the casing above the desk while the pedestal stays level.
export const MONITOR = {
  width: 2.45,
  height: 1.7,
  tilt: -Math.atan2(
    SEATED_VIEW.position[1] - SEATED_VIEW.target[1],
    SEATED_VIEW.position[2] - SEATED_VIEW.target[2],
  ),
  pivot: [0, 2.28, -0.62],
  lift: 0.12,
} as const;

// One physical display surface drives both the glass mesh and the HTML projection.
export const CRT = {
  width: 1.94,
  height: 1.12,
  radius: 0.095,
  inset: 0.024,
  centerY: 2.35,
  surfaceZ: 0.118,
  pixelsPerUnit: 440,
} as const;

const screenY = CRT.centerY - MONITOR.pivot[1];
const screenZ = CRT.surfaceZ - MONITOR.pivot[2];
export const SCREEN_CENTER = [
  0,
  MONITOR.pivot[1] +
    MONITOR.lift +
    screenY * Math.cos(MONITOR.tilt) -
    screenZ * Math.sin(MONITOR.tilt),
  MONITOR.pivot[2] +
    screenY * Math.sin(MONITOR.tilt) +
    screenZ * Math.cos(MONITOR.tilt),
] as const;

export const DISPLAY = {
  width: (CRT.width - CRT.inset * 2) * CRT.pixelsPerUnit,
  height: (CRT.height - CRT.inset * 2) * CRT.pixelsPerUnit,
  radius: (CRT.radius - CRT.inset) * CRT.pixelsPerUnit,
  distanceFactor: 400 / CRT.pixelsPerUnit,
};
