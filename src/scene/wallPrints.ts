export const WALL_PRINTS = {
  poster: {
    position: [-2.05, 3, -1.83] as [number, number, number],
    width: 0.78,
    height: 1.04,
    rotation: 0,
  },
  certificate: {
    position: [-3.15, 3.04, -1.82] as [number, number, number],
    width: 1.08,
    height: 0.81,
    rotation: -0.045,
  },
};

export type WallFocus = keyof typeof WALL_PRINTS | null;
