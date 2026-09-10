/** Positions are local to the printer. Times are seconds from the player-authorized print start. */
export type PrinterStage = "idle" | "printing" | "ready" | "placed";
export type Vector3Tuple = [number, number, number];
export type PaperPose = {
  visible: boolean;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  length: number;
};
export const PRINT_DURATION = 3;
const FEED_DURATION = 1.2;
export const INPUT_POSITION: Vector3Tuple = [0, 0.55, -0.3];
export const OUTPUT_POSITION: Vector3Tuple = [0, -0.015, 0.765];
export const INPUT_ROTATION: Vector3Tuple = [-Math.PI / 6, 0, 0];
export const FLAT_ROTATION: Vector3Tuple = [-Math.PI / 2, 0, 0];

const clamp = (value: number) => Math.max(0, Math.min(1, value));
export function isPrinterBusy(stage: PrinterStage) {
  return stage === "printing";
}

/** Pure timeline sampling keeps the animation independent of React and WebGL. */
export function samplePrinter(
  stage: PrinterStage,
  time: number,
  reducedMotion: boolean,
) {
  if (stage === "printing" && time >= PRINT_DURATION) stage = "ready";
  const input: PaperPose = {
    visible: stage !== "printing",
    position: INPUT_POSITION,
    rotation: INPUT_ROTATION,
    length: 1,
  };
  const output: PaperPose = {
    visible: stage === "ready",
    position: OUTPUT_POSITION,
    rotation: FLAT_ROTATION,
    length: 1,
  };

  if (stage === "printing") {
    const feed = reducedMotion ? 0 : clamp(time / FEED_DURATION);
    const printed = reducedMotion
      ? 0
      : clamp((time - FEED_DURATION) / (PRINT_DURATION - FEED_DURATION));
    input.visible = feed < 1;
    input.length = 1 - feed;
    input.position = [0, 0.55 - 0.277 * feed, -0.3 + 0.16 * feed];
    output.visible = printed > 0;
    output.length = printed;
    output.position = [0, -0.015, 0.445 + 0.32 * printed];
  }
  return { stage, input, output };
}
