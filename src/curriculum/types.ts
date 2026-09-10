import type { Validation } from "../validation/types";
export type Assignment = {
  id: string;
  title: string;
  brief: string;
  starterCode?: string;
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
