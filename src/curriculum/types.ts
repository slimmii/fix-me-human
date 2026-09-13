import type { Validation } from "../validation/types";
import type { PreviewTheme } from "../sandbox/themes";
export type Assignment = {
  id: string;
  title: string;
  brief: string;
  starterCode?: string;
  starterFiles?: Record<string, string>;
  solutionFiles?: Record<string, string>;
  multiFile?: boolean;
  previewTheme?: PreviewTheme;
  hints: string[];
  solution: string;
  robot?: { intro: string; success: string; retry: string };
  validation: Validation;
};
export type Lesson = {
  id: string;
  title: string;
  assignments: Assignment[];
};
