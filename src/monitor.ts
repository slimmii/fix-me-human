// One physical display surface drives both the glass mesh and the HTML projection.
export const CRT = {
  width: 1.94,
  height: 1.12,
  radius: 0.095,
  inset: 0.024,
  centerY: 2.35,
  surfaceZ: 0.188,
  pixelsPerUnit: 600,
} as const;
export const DISPLAY = {
  width: (CRT.width - CRT.inset * 2) * CRT.pixelsPerUnit,
  height: (CRT.height - CRT.inset * 2) * CRT.pixelsPerUnit,
  radius: (CRT.radius - CRT.inset) * CRT.pixelsPerUnit,
  distanceFactor: 400 / CRT.pixelsPerUnit,
};
