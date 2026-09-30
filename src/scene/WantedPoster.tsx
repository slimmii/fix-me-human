import { useEffect, useMemo } from "react";
import { printTexture } from "./printTexture";
import { useHoverHighlight } from "./useHoverHighlight";
import { WALL_PRINTS } from "./wallPrints";

export function WantedPoster({ onClick }: { onClick: () => void }) {
  const highlight = useHoverHighlight();
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#e4c58c";
    ctx.fillRect(0, 0, 768, 1024);
    ctx.strokeStyle = "#62452a";
    ctx.lineWidth = 8;
    ctx.strokeRect(25, 25, 718, 974);
    ctx.lineWidth = 2;
    ctx.strokeRect(39, 39, 690, 946);
    ctx.fillStyle = "#422d20";
    ctx.textAlign = "center";
    ctx.font = "bold 112px Georgia, serif";
    ctx.fillText("WANTED", 384, 168);
    ctx.font = "bold 29px monospace";
    ctx.fillText("FOR CRIMES AGAINST REACT", 384, 226);
    ctx.beginPath();
    ctx.moveTo(60, 260);
    ctx.lineTo(708, 260);
    ctx.stroke();
    // A six-legged suspect, printed in the same brown ink as the lettering.
    ctx.lineWidth = 17;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      for (let leg = 0; leg < 3; leg++) {
        ctx.beginPath();
        ctx.moveTo(384 + side * 65, 440 + leg * 72);
        ctx.lineTo(384 + side * 130, 425 + leg * 82);
        ctx.lineTo(384 + side * 163, 392 + leg * 115);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(384 + side * 25, 388);
      ctx.lineTo(384 + side * 62, 340);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(384, 510, 94, 136, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e4c58c";
    ctx.fillRect(380, 435, 8, 194);
    ctx.beginPath();
    ctx.arc(360, 417, 7, 0, Math.PI * 2);
    ctx.arc(408, 417, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#422d20";
    ctx.font = "bold 64px Georgia, serif";
    ctx.fillText("BUG HUNTS", 384, 748);
    ctx.font = "bold 30px monospace";
    ctx.fillText("FIND IT. FIX IT. RUN IT.", 384, 815);
    ctx.fillRect(104, 866, 560, 73);
    ctx.fillStyle = "#efd7a6";
    ctx.fillText("OPEN THE CASE FILES →", 384, 914);
    return printTexture(canvas);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh
      {...highlight.mesh}
      // Center below the motivational poster, leaving room above the desktop.
      position={[
        WALL_PRINTS.poster.position[0],
        WALL_PRINTS.poster.position[1] - WALL_PRINTS.poster.height / 2 - 0.54,
        WALL_PRINTS.poster.position[2],
      ]}
      rotation={[0, 0, WALL_PRINTS.poster.rotation]}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <planeGeometry args={[0.72, 0.96]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
