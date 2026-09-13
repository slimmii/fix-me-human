import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import type { GameController } from "../game/useGame";
import type { Save } from "../progression";
import {
  assignments,
  prepareAssignment,
  type AssignmentTarget,
  type ProjectMode,
} from "./state";

export function createDevelopmentTools(getGame: () => GameController) {
  const history: Save[] = [];
  function apply(save: Save) {
    const game = getGame();
    flushSync(() => {
      game.setSave(save);
      game.setEditorRevision((revision) => revision + 1);
      game.setAssignmentOpen(false);
      game.setHelpOpen(false);
      game.setSettings(false);
      game.setShowTasks(false);
      game.setFocused(true);
    });
    return structuredClone(save);
  }
  function open(target: AssignmentTarget, mode: ProjectMode) {
    const current = getGame().save;
    const next = prepareAssignment(current, target, mode);
    history.push(structuredClone(current));
    return apply(next);
  }
  return {
    help() {
      const commands = {
        "humanDev.list()":
          "List assignment numbers, IDs, titles and completion",
        'humanDev.goto(3) / humanDev.goto("board-columns")':
          "Unlock prerequisites, collect the paper and open saved work",
        "humanDev.goto(3, { solution: true })":
          "Jump with all reference solution files",
        "humanDev.solve()":
          "Replace the current project's files with its reference solution",
        "humanDev.solve(3)": "Jump to an assignment and fill its solution",
        "humanDev.starter()":
          "Replace the current project's files with its reference starter",
        "humanDev.state()": "Get a detached copy of the current save",
        "humanDev.undo()":
          "Restore the save before the last helper change (until reload)",
      };
      console.table(commands);
      return commands;
    },
    list() {
      const save = getGame().save;
      const rows = assignments.map(({ assignment, lesson }, index) => ({
        number: index + 1,
        id: assignment.id,
        title: assignment.title,
        lesson: lesson.id,
        current: assignment.id === save.assignmentId,
        completed: save.completed.includes(assignment.id),
      }));
      console.table(rows);
      return rows;
    },
    goto(target: AssignmentTarget, options: { solution?: boolean } = {}) {
      return open(target, options.solution ? "solution" : "saved");
    },
    solve(target: AssignmentTarget = getGame().save.assignmentId) {
      return open(target, "solution");
    },
    starter(target: AssignmentTarget = getGame().save.assignmentId) {
      return open(target, "starter");
    },
    state() {
      return structuredClone(getGame().save);
    },
    undo() {
      const previous = history.pop();
      if (!previous)
        throw new Error("No developer-tool changes to undo in this session.");
      return apply(previous);
    },
  };
}

declare global {
  interface Window {
    humanDev?: ReturnType<typeof createDevelopmentTools>;
  }
}

export default function DevelopmentTools({ game }: { game: GameController }) {
  const latest = useRef(game);
  useEffect(() => {
    latest.current = game;
  }, [game]);
  useEffect(() => {
    const api = createDevelopmentTools(() => latest.current);
    window.humanDev = api;
    console.info(
      "[PLEASE FIX, HUMAN] Development tools ready. Type humanDev.help() in this console. Changes save locally; humanDev.undo() restores the previous save until reload.",
    );
    return () => {
      if (window.humanDev === api) delete window.humanDev;
    };
  }, []);
  return null;
}
