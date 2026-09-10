import { useEffect, useMemo } from "react";
import type { Assignment } from "../curriculum/types";
import { lessonText } from "../computer/ContentScreen";
import { printTexture } from "./printTexture";

export function useAssignmentTexture(
  assignment: Assignment,
  completed = false,
) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff8e5";
    ctx.fillRect(0, 0, 600, 800);
    ctx.fillStyle = "#263c33";
    ctx.font = "bold 24px monospace";
    ctx.fillText("BUG INDUSTRIES / ASSIGNMENT", 45, 65);
    ctx.fillRect(45, 87, 510, 2);
    ctx.font = "bold 30px monospace";
    ctx.fillText(assignment.title, 45, 140, 510);
    ctx.font = "20px monospace";
    let y = 194;
    const plain = lessonText(assignment.brief).replace(/[*`>#]/g, "");
    paragraphs: for (const paragraph of plain.split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/)) {
        if (y > 680) break paragraphs;
        if (ctx.measureText(`${line} ${word}`).width > 510) {
          ctx.fillText(line, 45, y);
          y += 27;
          line = word;
        } else line += `${line ? " " : ""}${word}`;
      }
      ctx.fillText(line, 45, y);
      y += 29;
      if (y > 680) break;
    }
    ctx.font = "bold 18px monospace";
    if (completed) {
      ctx.strokeStyle = "#33784b";
      ctx.fillStyle = "#33784b";
      ctx.lineWidth = 4;
      ctx.strokeRect(310, 710, 245, 60);
      ctx.font = "bold 28px monospace";
      ctx.fillText("COMPLETED", 330, 750);
    } else {
      ctx.fillText("CLICK TO READ / KEEP BESIDE YOUR CODE", 45, 760);
    }
    return printTexture(canvas);
  }, [assignment, completed]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
