import type { ReactNode } from "react";
export type SceneProps = {
  completedAssignments: string[];
  assignment: import("../curriculum/types").Assignment;
  assignmentOpen: boolean;
  assignmentReady: boolean;
  assignmentCollected: boolean;
  assignmentUnread: boolean;
  onAssignment: () => void;
  onAssignmentReady: () => void;
  onAssignmentCollected: () => void;
  mute: boolean;
  focused: boolean;
  reduced: boolean;
  onComputer: () => void;
  onProp: (s: string) => void;
  celebrate: boolean;
  mood: "neutral" | "happy" | "confused";
  computer: ReactNode;
};

export type PosterClickHandler = (
  pointer: import("three").Vector2,
  event: { stopPropagation: () => void },
) => void;
export type WorldProps = SceneProps & {
  posterFocused: boolean;
  onPoster: () => void;
  onDesk: () => void;
  posterClick: import("react").RefObject<PosterClickHandler | null>;
};
