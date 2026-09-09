/** Positions are local to the printer. Times are seconds from the last click. */
export type PrinterStage = "input" | "printing" | "output" | "falling";
export type Vector3Tuple = [number, number, number];
export type PaperPose = {
  visible: boolean;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  length: number;
};
export const PRINT_DURATION = 3;
export const PAPER_RETURN_TIME = 8;
const FEED_DURATION = 1.2;
const EJECT_DURATION = 0.8;
const LANDING_TIME = 3;
const RETURN_START = 6;
export const INPUT_POSITION: Vector3Tuple = [0, 0.55, -0.3];
export const OUTPUT_POSITION: Vector3Tuple = [0, -0.015, 0.765];
export const INPUT_ROTATION: Vector3Tuple = [-Math.PI / 6, 0, 0];
export const FLAT_ROTATION: Vector3Tuple = [-Math.PI / 2, 0, 0];
const FLOOR_POSITION: Vector3Tuple = [-0.4, -1.575, 0.8];

const clamp = (value: number) => Math.max(0, Math.min(1, value));
function smooth(value: number) {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
}
export function isPrinterBusy(stage: PrinterStage) {
  return stage === "printing" || stage === "falling";
}
export function printerClick(stage: PrinterStage): PrinterStage {
  if (stage === "input") return "printing";
  if (stage === "output") return "falling";
  return stage;
}

function fallingPose(time: number, reducedMotion: boolean): PaperPose {
  const pose: PaperPose = {
    visible: true,
    position: FLOOR_POSITION,
    rotation: FLAT_ROTATION,
    length: 1,
  };
  if (reducedMotion) return pose;
  if (time < EJECT_DURATION) {
    pose.position = [0, -0.015, 0.765 + 1.285 * smooth(time / EJECT_DURATION)];
  } else if (time < LANDING_TIME) {
    const progress = (time - EJECT_DURATION) / (LANDING_TIME - EJECT_DURATION);
    const wave = Math.sin(progress * Math.PI);
    pose.position = [
      -0.4 * smooth(progress) -
        0.7 * wave +
        Math.sin(progress * Math.PI * 3) * 0.1 * wave,
      -0.015 - 1.56 * smooth(progress),
      2.05 + 0.4 * wave - 1.25 * smooth((progress - 0.4) / 0.6),
    ];
    pose.rotation = [
      -Math.PI / 2 + Math.sin(progress * Math.PI * 4) * 0.55 * wave,
      Math.sin(progress * Math.PI * 3) * 0.35 * wave,
      Math.PI * 4 * smooth(progress),
    ];
  } else if (time >= RETURN_START) {
    // Move out from under the desk before lifting and returning to the feeder.
    const progress = smooth(
      (time - RETURN_START) / (PAPER_RETURN_TIME - RETURN_START),
    );
    pose.position = [
      -0.4 * (1 - progress),
      -1.575 + 2.125 * smooth((progress - 0.2) / 0.45),
      progress < 0.3
        ? 0.8 + 1.65 * smooth(progress / 0.3)
        : 2.45 - 2.75 * smooth((progress - 0.65) / 0.35),
    ];
    pose.rotation = [
      -Math.PI / 2 + (Math.PI / 3) * progress,
      0,
      Math.PI * 2 * smooth(progress),
    ];
  }
  return pose;
}

/** Pure timeline sampling keeps the animation independent of React and WebGL. */
export function samplePrinter(
  stage: PrinterStage,
  time: number,
  reducedMotion: boolean,
) {
  if (stage === "printing" && time >= PRINT_DURATION) stage = "output";
  if (stage === "falling" && time >= PAPER_RETURN_TIME) stage = "input";
  const input: PaperPose = {
    visible: stage === "input",
    position: INPUT_POSITION,
    rotation: INPUT_ROTATION,
    length: 1,
  };
  let output: PaperPose = {
    visible: stage === "output",
    position: OUTPUT_POSITION,
    rotation: FLAT_ROTATION,
    length: 1,
  };

  if (stage === "printing") {
    const feed = clamp(time / FEED_DURATION);
    const printed = clamp(
      (time - FEED_DURATION) / (PRINT_DURATION - FEED_DURATION),
    );
    input.visible = feed < 1;
    input.length = 1 - feed;
    input.position = [0, 0.55 - 0.277 * feed, -0.3 + 0.16 * feed];
    output.visible = printed > 0;
    output.length = printed;
    output.position = [0, -0.015, 0.445 + 0.32 * printed];
  } else if (stage === "falling") {
    output = fallingPose(time, reducedMotion);
  }
  return { stage, input, output };
}
