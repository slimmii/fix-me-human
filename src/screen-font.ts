export const DEFAULT_SCREEN_FONT_SIZE = 14;
export const MIN_SCREEN_FONT_SIZE = 10;
export const MAX_SCREEN_FONT_SIZE = 20;

export function isScreenFontSize(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_SCREEN_FONT_SIZE &&
    value <= MAX_SCREEN_FONT_SIZE
  );
}
