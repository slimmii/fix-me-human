export const GRAPHICS_QUALITY = [
  {
    label: "Low",
    description: "Faster rendering, antialiasing off.",
    antialias: false,
    maxDpr: 1,
  },
  {
    label: "Medium",
    description: "Smooth edges with balanced performance.",
    antialias: true,
    maxDpr: 1.25,
  },
  {
    label: "High",
    description: "Smooth edges and sharper detail on high-resolution screens.",
    antialias: true,
    maxDpr: 2,
  },
] as const;

export type GraphicsQuality = 0 | 1 | 2;
export const DEFAULT_GRAPHICS_QUALITY: GraphicsQuality = 2;
export function isGraphicsQuality(value: unknown): value is GraphicsQuality {
  return value === 0 || value === 1 || value === 2;
}
