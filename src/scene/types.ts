import type { ReactNode } from "react";
import type { WallFocus } from "./wallPrints";
export type SceneProps = {
  officeClock: import("../game/officeTime").OfficeClock;
  completedAssignments: string[];
  assignment: import("../curriculum/types").Assignment;
  assignmentOpen: boolean;
  assignmentReady: boolean;
  assignmentPrintRequested: boolean;
  assignmentCollected: boolean;
  assignmentUnread: boolean;
  onAssignment: () => void;
  onAssignmentReady: () => void;
  onAssignmentCollected: () => void;
  mute: boolean;
  focused: boolean;
  reduced: boolean;
  graphicsQuality: import("../graphics").GraphicsQuality;
  onComputer: () => void;
  onProp: (s: string) => void;
  celebrate: boolean;
  mood: "neutral" | "happy" | "confused";
  computer: ReactNode;
};

export type WallClickHandler = (
  pointer: import("three").Vector2,
  event: { stopPropagation: () => void },
) => void;
export type WorldProps = SceneProps & {
  wallFocus: WallFocus;
  certificateEarned: boolean;
  onPoster: () => void;
  onCertificate: () => void;
  onDesk: () => void;
  wallClick: import("react").RefObject<WallClickHandler | null>;
};
