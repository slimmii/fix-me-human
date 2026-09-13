import sprintBoard from "../curriculum/scrum-board/preview.module.css";
import sprintBoardCss from "../curriculum/scrum-board/preview.module.css?inline";

// Only browserDocument applies these generated classes to the sandbox root.
// Register other exercise themes here; assignments opt in via previewTheme.
export const previewThemes = {
  "sprint-board": { className: sprintBoard.board, css: sprintBoardCss },
};

export type PreviewTheme = keyof typeof previewThemes;
